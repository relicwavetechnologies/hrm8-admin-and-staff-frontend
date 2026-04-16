// @ts-nocheck
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Input } from "@/shared/components/ui/input";
import { Search, MessageSquarePlus, User } from "lucide-react";
import { messagingService } from "@/shared/services/messagingService";
import { ConversationData } from "@/shared/types/websocket";
import { MessagingPanel } from "@/modules/messages/components/MessagingPanel";
import { formatRelativeDate } from "@/shared/lib/jobUtils";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { applicationService } from "@/shared/lib/applicationService";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/shared/components/ui/dialog";
import { Label } from "@/shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { toast } from "sonner";
import { Application } from "@/shared/types/application";
import { useAuthStore } from "@/shared/stores/authStore";

interface JobMessagesTabProps {
    jobId: string;
    channelType?: string;
}

export function JobMessagesTab({ jobId, channelType }: JobMessagesTabProps) {
    const currentUserEmail = useAuthStore((state) => state.user?.rawUser?.email || "");
    const [searchParams] = useSearchParams();
    const urlConversationId = searchParams.get('conversationId');

    const [conversations, setConversations] = useState<ConversationData[]>([]);
    const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [newChatOpen, setNewChatOpen] = useState(false);
    const [applications, setApplications] = useState<Application[]>([]);
    const [selectedApplicantId, setSelectedApplicantId] = useState<string>("");

    const loadConversations = async () => {
        setLoading(true);
        try {
            const response = await messagingService.getJobConversations(jobId, channelType);
            if (response.success && response.data) {
                setConversations(response.data);

                // If URL has a specific conversation ID, select it
                if (urlConversationId) {
                    const exists = response.data.find(c => c.id === urlConversationId);
                    if (exists) {
                        setSelectedConversationId(urlConversationId);
                    } else if (response.data.length > 0 && !selectedConversationId) {
                        // Fallback to first if requested one not found
                        setSelectedConversationId(response.data[0].id);
                    }
                } else if (response.data.length > 0 && !selectedConversationId) {
                    setSelectedConversationId(response.data[0].id);
                }
            }
        } catch (error) {
            console.error("Failed to load conversations:", error);
        } finally {
            setLoading(false);
        }
    };

    const loadApplicants = async () => {
        try {
            const response = await applicationService.getJobApplications(jobId);
            if (response.success && response.data) {
                const apps = response.data.applications || [];
                // Map to simpler objects if needed, or use as is. 
                // Need ID and Name.
                // Assuming we can map backend response to Application type locally or it matches enough
                setApplications(apps.map((app: any) => ({
                    id: app.id,
                    candidateId: app.candidateId || app.candidate?.id || app.candidate_id || (app as any).candidate_id,
                    candidateName: app.candidateName || (app.candidate ? `${app.candidate.firstName} ${app.candidate.lastName}` : (app.candidate?.first_name ? `${app.candidate.first_name} ${app.candidate.last_name}` : 'Unknown')),
                    candidateEmail: app.candidateEmail || app.candidate?.email || '',
                    jobTitle: app.jobTitle || app.job?.title || 'Job'
                } as Application)));
            }
        } catch (error) {
            console.error("Failed to load applicants for new chat:", error);
        }
    };

    useEffect(() => {
        if (jobId) {
            loadConversations();
        }
    }, [jobId]);

    // Handle conversation ID change from URL even after initial load
    useEffect(() => {
        if (urlConversationId && conversations.length > 0) {
            const exists = conversations.find(c => c.id === urlConversationId);
            if (exists) {
                setSelectedConversationId(urlConversationId);
            }
        }
    }, [urlConversationId, conversations]);

    useEffect(() => {
        if (newChatOpen) {
            loadApplicants();
        }
    }, [newChatOpen]);

    const handleStartChat = async () => {
        if (!selectedApplicantId) return;

        const app = applications.find(a => a.candidateId === selectedApplicantId);
        if (!app || !app.candidateId) return;

        try {
            // Create conversation
            const response = await messagingService.createConversation({
                participantId: app.candidateId,
                participantType: 'CANDIDATE',
                jobId: jobId,
                subject: `Regarding your application for ${app.jobTitle || 'Role'}`
            });

            if (response.success && response.data) {
                setConversations(prev => [response.data!, ...prev]);
                setSelectedConversationId(response.data.id);
                setNewChatOpen(false);
                toast.success("Conversation started");
            } else {
                toast.error("Failed to start conversation");
            }
        } catch (error) {
            console.error("Failed to create conversation:", error);
            toast.error("Failed to start conversation");
        }
    };

    const normalizeEmail = (value?: string) => (value || "").trim().toLowerCase();
    const participantType = (participant: any) =>
        participant?.participantType || participant?.participant_type || participant?.type || "";
    const participantEmail = (participant: any) =>
        participant?.participantEmail || participant?.participant_email || participant?.email || "";
    const formatDisplayName = (value?: string) => {
        if (!value) return "";
        if (value.includes("@")) {
            return value
                .split("@")[0]
                .split(/[._-]+/)
                .filter(Boolean)
                .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
                .join(" ");
        }
        return value;
    };
    const participantName = (participant: any) =>
        participant?.displayName ||
        participant?.display_name ||
        formatDisplayName(participantEmail(participant));

    const getOtherParticipant = (c: ConversationData) => {
        const participants = Array.isArray(c.participants) ? c.participants : [];

        const candidate = participants.find((participant: any) => participantType(participant) === 'CANDIDATE');
        if (candidate) return { ...candidate, label: 'Candidate' };

        const employer = participants.find((participant: any) =>
            participantType(participant) === 'EMPLOYER' && normalizeEmail(participantEmail(participant)) !== normalizeEmail(currentUserEmail)
        );
        if (employer) return { ...employer, label: 'Company Team' };

        const consultant = participants.find((participant: any) =>
            participantType(participant) === 'CONSULTANT' && normalizeEmail(participantEmail(participant)) !== normalizeEmail(currentUserEmail)
        );
        if (consultant) return { ...consultant, label: 'Consultant' };

        const fallback = participants.find((participant: any) =>
            normalizeEmail(participantEmail(participant)) !== normalizeEmail(currentUserEmail)
        ) || participants[0];

        return fallback ? { ...fallback, label: 'Conversation' } : null;
    };

    const getMessageAuthorLabel = (message: any) => {
        const senderEmail = message?.senderEmail || message?.sender_email || "";
        if (normalizeEmail(senderEmail) && normalizeEmail(senderEmail) === normalizeEmail(currentUserEmail)) {
            return "You";
        }

        return (
            message?.senderDisplayName ||
            message?.sender_display_name ||
            senderEmail.split("@")[0]?.replace(/[._-]+/g, " ") ||
            "Participant"
        );
    };

    const getLastMessagePreview = (conversation: any) => {
        const lastMessage = conversation?.lastMessage || conversation?.last_message || conversation?.messages?.[0];
        if (!lastMessage?.content) return "No messages yet";
        const senderType = lastMessage?.senderType || lastMessage?.sender_type;
        if (senderType === "SYSTEM") return lastMessage.content;
        return `${getMessageAuthorLabel(lastMessage)}: ${lastMessage.content}`;
    };

    const filteredConversations = conversations.filter(c => {
        const other = getOtherParticipant(c);
        if (!other) return true;
        const name = participantName(other);
        const email = participantEmail(other);
        const query = searchQuery.toLowerCase();
        if (!query) return true;
        return name.toLowerCase().includes(query) || email.toLowerCase().includes(query);
    });

    const selectedConversation = conversations.find(c => c.id === selectedConversationId);

    return (
        <div className="flex h-[calc(100vh-250px)] min-h-[500px] border rounded-md overflow-hidden bg-background">
            {/* Sidebar List */}
            <div className="w-80 border-r flex flex-col bg-muted/5">
                <div className="p-3 border-b space-y-3">
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold px-1">Messages</h3>
                        <Dialog open={newChatOpen} onOpenChange={setNewChatOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" size="sm" className="h-8 w-8 p-0 rounded-full">
                                    <MessageSquarePlus className="h-4 w-4" />
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Start New Conversation</DialogTitle>
                                    <DialogDescription>
                                        Choose a candidate from the list to start a messaging thread.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label>Select Candidate</Label>
                                        <Select onValueChange={setSelectedApplicantId}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a candidate..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {applications.map(app => (
                                                    <SelectItem key={app.candidateId} value={app.candidateId!}>
                                                        {app.candidateName}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <Button onClick={handleStartChat} disabled={!selectedApplicantId} className="w-full">
                                        Start Chat
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search conversations..."
                            className="pl-9 h-9 bg-background"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <ScrollArea className="flex-1">
                    {loading ? (
                        <div className="p-4 space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="flex gap-3">
                                    <Skeleton className="h-10 w-10 rounded-full" />
                                    <div className="space-y-2 flex-1">
                                        <Skeleton className="h-4 w-3/4" />
                                        <Skeleton className="h-3 w-1/2" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : filteredConversations.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground text-sm">
                            No conversations found.
                        </div>
                    ) : (
                        <div className="flex flex-col">
                            {filteredConversations.map(conversation => {
                                const other = getOtherParticipant(conversation);
                                const name = participantName(other) || 'Conversation';
                                const email = participantEmail(other);
                                const label = other?.label ? ` (${other.label})` : '';
                                const initials = name !== 'Conversation' ? name.slice(0, 2).toUpperCase() : '??';
                                const lastMsg = getLastMessagePreview(conversation);
                                const time = conversation.updatedAt ? formatRelativeDate(conversation.updatedAt) : '';
                                const isSelected = selectedConversationId === conversation.id;

                                return (
                                    <Button
                                        key={conversation.id}
                                        variant="ghost"
                                        onClick={() => setSelectedConversationId(conversation.id)}
                                        className={`flex items-start gap-3 p-3 h-auto text-left w-full transition-colors hover:bg-muted/50 justify-start rounded-none ${isSelected ? 'bg-primary/5 border-l-2 border-primary' : 'border-l-2 border-transparent'}`}
                                    >
                                        <Avatar className="h-10 w-10 border mt-0.5">
                                            <AvatarFallback>{initials}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0 overflow-hidden">
                                            <div className="flex justify-between items-baseline mb-0.5">
                                                <span className={`text-sm font-medium truncate ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                                                    {name}{label}
                                                </span>
                                                {time && <span className="text-[10px] text-muted-foreground shrink-0 ml-2">{time}</span>}
                                            </div>
                                            {email && (
                                                <p className="text-[11px] text-muted-foreground truncate mb-0.5">
                                                    {email}
                                                </p>
                                            )}
                                            <p className="text-xs text-muted-foreground truncate pr-2">
                                                {lastMsg}
                                            </p>
                                        </div>
                                    </Button>
                                );
                            })}
                        </div>
                    )}
                </ScrollArea>
            </div>

            {/* Messaging Panel */}
            <div className="flex-1 flex flex-col h-full bg-background">
                {selectedConversationId ? (
                    <MessagingPanel
                        conversationId={selectedConversationId}
                        title={selectedConversation ? (participantName(getOtherParticipant(selectedConversation)) || 'Conversation') : ''}
                        currentUserEmail={currentUserEmail}
                        className="flex-1 h-full border-none"
                    />
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
                        <div className="bg-muted/30 p-4 rounded-full mb-4">
                            <MessageSquarePlus className="h-8 w-8 opacity-50" />
                        </div>
                        <p>Select a conversation to start messaging</p>
                    </div>
                )}
            </div>
        </div>
    );
}
