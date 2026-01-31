import { useState, useEffect, useRef } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { Badge } from '@/shared/components/ui/badge';
import { Search, Send, File, Image as ImageIcon, MoreVertical, Phone, Video, Loader2 } from 'lucide-react';
import {
    consultant360Service,
    type Conversation,
    type Message
} from '@/shared/services/consultant360/consultant360Service';
import { useConsultantAuth } from '@/contexts/ConsultantAuthContext';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { cn } from '@/shared/lib/utils';

export default function ConsultantMessagesPage() {
    const { consultant } = useConsultantAuth();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [sending, setSending] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        loadConversations();
    }, []);

    useEffect(() => {
        if (selectedConversation) {
            loadMessages(selectedConversation.id);
            // Mark as read
            if (selectedConversation.unreadCount > 0) {
                markAsRead(selectedConversation.id);
            }
        }
    }, [selectedConversation]);

    // Auto-scroll to bottom of messages
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    const loadConversations = async () => {
        try {
            setLoading(true);
            const response = await consultant360Service.getConversations();
            if (response.success && response.data) {
                setConversations(response.data.conversations);
            }
        } catch (error) {
            console.error('Failed to load conversations:', error);
            toast.error('Failed to load conversations');
        } finally {
            setLoading(false);
        }
    };

    const loadMessages = async (conversationId: string) => {
        try {
            setLoadingMessages(true);
            const response = await consultant360Service.getMessages(conversationId);
            if (response.success && response.data) {
                setMessages(response.data.messages);
            }
        } catch (error) {
            console.error('Failed to load messages:', error);
            toast.error('Failed to load messages');
        } finally {
            setLoadingMessages(false);
        }
    };

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedConversation) return;

        try {
            setSending(true);
            const response = await consultant360Service.sendMessage(selectedConversation.id, newMessage);
            if (response.success && response.data) {
                setMessages([...messages, response.data.message]);
                setNewMessage('');
                // Update last message in conversation list locally
                setConversations(prev => prev.map(c =>
                    c.id === selectedConversation.id
                        ? { ...c, lastMessage: newMessage, lastMessageAt: new Date().toISOString() }
                        : c
                ));
            }
        } catch (error) {
            console.error('Failed to send message:', error);
            toast.error('Failed to send message');
        } finally {
            setSending(false);
        }
    };

    const markAsRead = async (conversationId: string) => {
        try {
            await consultant360Service.markAsRead(conversationId);
            // Update local state
            setConversations(prev => prev.map(c =>
                c.id === conversationId ? { ...c, unreadCount: 0 } : c
            ));
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-64px)]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-64px)] flex">
            {/* Sidebar - Conversations List */}
            <div className="w-80 border-r bg-background flex flex-col">
                <div className="p-4 border-b space-y-4">
                    <h2 className="font-semibold text-lg px-2">Messages</h2>
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search messages..." className="pl-9 bg-muted/50" />
                    </div>
                </div>
                <ScrollArea className="flex-1">
                    {conversations.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">
                            <p className="text-sm">No conversations yet</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-1 p-2">
                            {conversations.map((conv) => (
                                <button
                                    key={conv.id}
                                    onClick={() => setSelectedConversation(conv)}
                                    className={cn(
                                        "flex items-start gap-3 p-3 rounded-lg text-left transition-colors",
                                        selectedConversation?.id === conv.id
                                            ? "bg-accent"
                                            : "hover:bg-muted/50"
                                    )}
                                >
                                    <Avatar>
                                        <AvatarImage src={conv.candidateAvatar} />
                                        <AvatarFallback>{conv.candidateName.substring(0, 2).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 overflow-hidden">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="font-medium truncate">{conv.candidateName}</span>
                                            {conv.lastMessageAt && (
                                                <span className="text-xs text-muted-foreground">
                                                    {format(new Date(conv.lastMessageAt), 'MMM d')}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-muted-foreground truncate">
                                            {conv.lastMessage || 'No messages yet'}
                                        </p>
                                        {conv.jobTitle && (
                                            <Badge variant="outline" className="mt-2 text-[10px] px-1 py-0 h-5">
                                                {conv.jobTitle}
                                            </Badge>
                                        )}
                                    </div>
                                    {conv.unreadCount > 0 && (
                                        <div className="h-2.5 w-2.5 rounded-full bg-primary mt-2 shrink-0" />
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </div>

            {/* Main Chat Area */}
            {selectedConversation ? (
                <div className="flex-1 flex flex-col bg-muted/10">
                    {/* Chat Header */}
                    <header className="h-16 border-b bg-background flex items-center justify-between px-6">
                        <div className="flex items-center gap-3">
                            <Avatar>
                                <AvatarImage src={selectedConversation.candidateAvatar} />
                                <AvatarFallback>{selectedConversation.candidateName.substring(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                                <h3 className="font-semibold">{selectedConversation.candidateName}</h3>
                                <p className="text-xs text-muted-foreground">
                                    {selectedConversation.jobTitle ? `Candidate for ${selectedConversation.jobTitle}` : 'Candidate'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Button variant="ghost" size="icon">
                                <Phone className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                                <Video className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </div>
                    </header>

                    {/* Chat Messages */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                        {loadingMessages ? (
                            <div className="flex items-center justify-center h-full">
                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-muted-foreground space-y-2">
                                <p>No messages yet</p>
                                <p className="text-sm">Start the conversation with {selectedConversation.candidateName}</p>
                            </div>
                        ) : (
                            messages.map((msg) => {
                                const isMe = msg.senderType === 'CONSULTANT' || msg.senderId === consultant?.id;
                                return (
                                    <div
                                        key={msg.id}
                                        className={cn(
                                            "flex w-max max-w-[75%] flex-col gap-2 rounded-lg px-3 py-2 text-sm",
                                            isMe
                                                ? "ml-auto bg-primary text-primary-foreground"
                                                : "bg-muted"
                                        )}
                                    >
                                        <p>{msg.content}</p>
                                        <span className={cn(
                                            "text-[10px]",
                                            isMe ? "text-primary-foreground/70" : "text-muted-foreground"
                                        )}>
                                            {format(new Date(msg.createdAt), 'p')}
                                        </span>
                                    </div>
                                );
                            })
                        )}
                        <div ref={scrollRef} />
                    </div>

                    {/* Chat Input */}
                    <div className="p-4 bg-background border-t">
                        <form onSubmit={sendMessage} className="flex gap-2">
                            <div className="flex gap-2">
                                <Button type="button" variant="ghost" size="icon">
                                    <ImageIcon className="h-5 w-5 text-muted-foreground" />
                                </Button>
                                <Button type="button" variant="ghost" size="icon">
                                    <File className="h-5 w-5 text-muted-foreground" />
                                </Button>
                            </div>
                            <Input
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type your message..."
                                className="flex-1"
                                disabled={sending}
                            />
                            <Button type="submit" disabled={!newMessage.trim() || sending}>
                                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                <span className="sr-only">Send</span>
                            </Button>
                        </form>
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground bg-muted/10">
                    <div className="h-20 w-20 bg-muted rounded-full flex items-center justify-center mb-4">
                        <Send className="h-8 w-8 text-muted-foreground/50 ml-1" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">Select a conversation</h3>
                    <p>Choose a candidate from the list to start messaging</p>
                </div>
            )}
        </div>
    );
}
