// @ts-nocheck
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Textarea } from '@/shared/components/ui/textarea';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover';
import { RichTextEditor } from '@/shared/components/ui/rich-text-editor';
import { MessageSquare, Send, AtSign, Loader2, Mail, Sparkles, FileText, Phone, Calendar, CheckSquare, ClipboardCheck, Plus, X, Users } from 'lucide-react';
import { apiClient } from '@/shared/lib/api';
import { useToast } from '@/shared/hooks/use-toast';
import { getApplicationEmailTemplates } from '@/shared/lib/applicationEmailTemplates';
import { Application } from '@/shared/types/application';
import { SendSmsTab } from './tabs/SendSmsTab';
import { ScheduleMeetingTab } from './tabs/ScheduleMeetingTab';
import { CreateTaskTab } from './tabs/CreateTaskTab';
import { AssessmentRoundCreatePanel } from './tabs/AssessmentRoundTab';
import { getCaretCoordinates } from '@/shared/lib/textareaUtils';
import { getJobTeamEndpoint } from './teamEndpoint';

interface Note {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  createdAt: string;
  mentions: string[];
}

interface HiringTeamMember {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  email?: string;
}

interface CandidateNotesPanelProps {
  applicationId: string;
  jobId?: string;
  candidateName?: string;
  jobTitle?: string;
  candidateEmail?: string;
  candidatePhone?: string;
  application?: Application;
  onNoteAdded?: () => void;
  onEmailSent?: () => void;
  onSmsSent?: () => void;
  onMeetingScheduled?: () => void;
  onTaskCreated?: () => void;
  /** Bump this value to trigger a notes re-fetch (e.g. after AI writes a note) */
  refreshTrigger?: number;
}



export function CandidateNotesPanelEnhanced({
  applicationId,
  jobId,
  candidateName = 'Candidate',
  jobTitle = 'Position',
  candidateEmail = '',
  candidatePhone = '',
  application,
  onNoteAdded,
  onEmailSent,
  onSmsSent: _onSmsSent,
  onMeetingScheduled: _onMeetingScheduled,
  onTaskCreated: _onTaskCreated,
  refreshTrigger,
}: CandidateNotesPanelProps) {
  const [activeTab, setActiveTab] = useState('notes');
  const [notes, setNotes] = useState<Note[]>([]);
  const [noteContent, setNoteContent] = useState('');
  const [hiringTeam, setHiringTeam] = useState<HiringTeamMember[]>([]);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionSearch, setMentionSearch] = useState('');
  const [mentionPosition, setMentionPosition] = useState<{ top: number; left: number } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  // Email state
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [templates] = useState(getApplicationEmailTemplates());
  const [aiContext, setAiContext] = useState('');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [ccEmails, setCcEmails] = useState<string[]>([]);
  const [ccInput, setCcInput] = useState('');
  const [showCc, setShowCc] = useState(false);

  // Fetch hiring team
  useEffect(() => {
    const fetchTeam = async () => {
      const resolvedJobId = jobId || application?.jobId || '';
      if (!resolvedJobId) {
        return;
      }

      try {
        type RawTeamMember = {
          userId?: string; id?: string; name?: string; role?: string;
          userRole?: string; avatar?: string; userEmail?: string;
          user?: { name?: string; avatar?: string; email?: string };
          email?: string;
        };
        const url = getJobTeamEndpoint(resolvedJobId);
        const response = await apiClient.get<RawTeamMember[]>(url);

        if (response.success && response.data) {
          const mappedTeam = response.data.map(member => ({
            id: member.userId || member.id,
            name: member.name || member.user?.name || 'Team Member',
            role: member.role || member.userRole || 'Team',
            avatar: member.avatar || member.user?.avatar,
            email: member.email || member.user?.email || member.userEmail,
          }));
          setHiringTeam(mappedTeam);
        } else {
          setHiringTeam([]);
        }
      } catch (error) {
        console.error('CandidateNotesPanelEnhanced: Failed to fetch hiring team:', error);
        setHiringTeam([]);
      }
    };

    fetchTeam();
  }, [jobId, application?.jobId]);

  // Build a minimal Application object for new tabs (use provided or construct from props)
  // Ensure we consistently use the available jobId, preferring the explicit prop
  const currentJobId = jobId || application?.jobId || '';

  const applicationObj: Application = application ? {
    ...application,
    jobId: currentJobId || application.jobId,
  } : {
    id: applicationId,
    candidateId: '',
    jobId: currentJobId,
    jobTitle,
    status: 'applied',
    stage: 'New Application',
    appliedDate: new Date().toISOString(),
    isRead: true,
    isNew: false,
    tags: [],
    shortlisted: false,
    manuallyAdded: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    activities: [],
    interviews: [],
    candidateName,
    candidateEmail,
    candidatePhone,
    employerName: '',
  };

  // Fetch notes from API
  useEffect(() => {
    const fetchNotes = async () => {
      if (!applicationId) return;
      try {
        type RawNote = {
          id: string; content: string; createdAt: string; mentions?: string[];
          author?: { id?: string; name?: string; avatar?: string };
        };
        const response = await apiClient.get<{ notes: RawNote[] }>(
          `/api/applications/${applicationId}/notes`
        );
        if (response.success && response.data?.notes) {
          const mappedNotes = response.data.notes.map((note) => ({
            id: note.id,
            content: note.content,
            authorId: note.author?.id || 'unknown',
            authorName: note.author?.name || 'Unknown',
            authorAvatar: note.author?.avatar,
            createdAt: note.createdAt,
            mentions: note.mentions || [],
          }));
          setNotes(mappedNotes);
        }
      } catch (error) {
        console.error('Failed to fetch notes:', error);
        const storedNotes = localStorage.getItem(`candidate_notes_${applicationId}`);
        if (storedNotes) {
          try {
            setNotes(JSON.parse(storedNotes));
          } catch {
            setNotes([]);
          }
        }
      }
    };

    fetchNotes();
  }, [applicationId, refreshTrigger]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setNoteContent(value);

    const cursorPosition = e.target.selectionStart || 0;
    const textBeforeCursor = value.substring(0, cursorPosition);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');

    if (lastAtIndex !== -1 && (lastAtIndex === 0 || textBeforeCursor[lastAtIndex - 1] === ' ')) {
      const searchText = textBeforeCursor.substring(lastAtIndex + 1);
      if (!searchText.includes(' ')) {
        setShowMentions(true);
        setMentionSearch(searchText.toLowerCase());

        // Calculate caret position for dropdown
        if (textareaRef.current) {
          const coords = getCaretCoordinates(textareaRef.current, cursorPosition);
          // Add offset for the dropdown to appear below the line
          setMentionPosition({
            top: coords.top + coords.height,
            left: coords.left,
          });
        }
        return;
      }
    }
    setShowMentions(false);
    setMentionSearch('');
    setMentionPosition(null);
  };

  const insertMention = (member: HiringTeamMember) => {
    const cursorPosition = textareaRef.current?.selectionStart || 0;
    const textBeforeCursor = noteContent.substring(0, cursorPosition);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');
    const textAfterCursor = noteContent.substring(cursorPosition);

    const newContent =
      noteContent.substring(0, lastAtIndex) +
      `@${member.name} ` +
      textAfterCursor;

    setNoteContent(newContent);
    setShowMentions(false);
    setMentionSearch('');
    setMentionPosition(null);
    textareaRef.current?.focus();
  };

  const handleSubmitNote = async () => {
    if (!noteContent.trim() || isSubmitting) return;

    const mentionRegex = /@(\w+\s?\w*)/g;
    const mentions: string[] = [];
    let match: RegExpExecArray | null;
    while ((match = mentionRegex.exec(noteContent)) !== null) {
      mentions.push(match[1]);
    }

    setIsSubmitting(true);

    try {
      type SavedNote = { id: string; content: string; createdAt: string; mentions?: string[]; author?: { id?: string; name?: string; avatar?: string } };
      const response = await apiClient.post<{ note: SavedNote }>(
        `/api/applications/${applicationId}/notes`,
        {
          content: noteContent.trim(),
          mentions,
        }
      );

      if (response.success && response.data?.note) {
        const newNote: Note = {
          id: response.data.note.id,
          content: response.data.note.content,
          authorId: response.data.note.author?.id || 'current-user',
          authorName: response.data.note.author?.name || 'You',
          authorAvatar: response.data.note.author?.avatar,
          createdAt: response.data.note.createdAt,
          mentions: response.data.note.mentions || [],
        };
        setNotes(prev => [newNote, ...prev]);
        setNoteContent('');
        onNoteAdded?.();
      }
    } catch (error) {
      console.error('Failed to submit note:', error);
      const mentionRegex2 = /@(\w+\s?\w*)/g;
      const mentions2: string[] = [];
      let match2: RegExpExecArray | null;
      while ((match2 = mentionRegex2.exec(noteContent)) !== null) {
        mentions2.push(match2[1]);
      }
      const newNote: Note = {
        id: Date.now().toString(),
        content: noteContent.trim(),
        authorId: 'current-user',
        authorName: 'You',
        createdAt: new Date().toISOString(),
        mentions: mentions2,
      };
      setNotes(prev => [newNote, ...prev]);
      localStorage.setItem(`candidate_notes_${applicationId}`, JSON.stringify([newNote, ...notes]));
      setNoteContent('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmitNote();
    }
  };

  const filteredTeam = hiringTeam.filter(member =>
    member.name.toLowerCase().includes(mentionSearch)
  );

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setEmailSubject(template.subject);
      setEmailBody(template.body);
      toast({
        title: "Template loaded",
        description: `"${template.name}" has been loaded`,
      });
    }
  };

  const handleGenerateWithAI = async () => {
    if (!aiContext.trim()) {
      toast({
        title: "Context required",
        description: "Please provide context for AI to generate email",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingAI(true);

    try {
      setTimeout(() => {
        const generatedSubject = `Follow-up: ${jobTitle} Position`;
        const generatedBody = `Dear ${candidateName},

Thank you for your interest in the ${jobTitle} position at our company.

${aiContext}

We appreciate your time and look forward to continuing the conversation.

Best regards,
Hiring Team`;

        setEmailSubject(generatedSubject);
        setEmailBody(generatedBody);
        setIsGeneratingAI(false);

        toast({
          title: "Email generated",
          description: "AI has generated the email content",
        });
      }, 1500);
    } catch (error) {
      console.error('Failed to generate email:', error);
      toast({
        title: "Generation failed",
        description: "Failed to generate email with AI",
        variant: "destructive",
      });
      setIsGeneratingAI(false);
    }
  };

  const handleSendEmail = async () => {
    if (!emailSubject.trim() || !emailBody.trim()) {
      toast({
        title: "Content required",
        description: "Please enter both subject and body",
        variant: "destructive",
      });
      return;
    }

    if (!candidateEmail) {
      toast({
        title: "No email address",
        description: "Candidate email address is not available",
        variant: "destructive",
      });
      return;
    }

    setIsSendingEmail(true);

    try {
      const response = await apiClient.post(
        `/api/applications/${applicationId}/emails`,
        {
          subject: emailSubject,
          body: emailBody,
          templateId: selectedTemplate || undefined,
          cc: ccEmails.length ? ccEmails : undefined,
        }
      );

      if (response.success) {
        toast({
          title: "Email sent!",
          description: `Email sent to ${candidateName}`,
        });
        setEmailSubject('');
        setEmailBody('');
        setCcEmails([]);
        setCcInput('');
        setShowCc(false);
        onEmailSent?.();
      } else {
        throw new Error(response.error || 'Failed to send email');
      }
    } catch (error) {
      console.error('Failed to send email:', error);
      toast({
        title: "Failed to send email",
        description: error instanceof Error ? error.message : 'Please try again',
        variant: "destructive",
      });
    } finally {
      setIsSendingEmail(false);
    }
  };

  const addCcEmail = (value: string) => {
    const email = value.trim().toLowerCase();
    if (!email || !/.+@.+\..+/.test(email) || ccEmails.includes(email)) {
      return;
    }
    setCcEmails(prev => [...prev, email]);
  };

  const removeCcEmail = (email: string) => {
    setCcEmails(prev => prev.filter(item => item !== email));
  };

  return (
    <Card className="h-full flex flex-col border-0 shadow-none overflow-hidden">
      <CardContent className="flex-1 flex flex-col p-3 min-h-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
          {/* Tabs Header - 6 tabs */}
          <TabsList className="grid w-full grid-cols-6 h-8 mb-1 flex-shrink-0">
            <TabsTrigger value="notes" className="text-xs gap-1">
              <MessageSquare className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Note</span>
            </TabsTrigger>
            <TabsTrigger value="email" className="text-xs gap-1">
              <Mail className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Email</span>
            </TabsTrigger>
            <TabsTrigger value="sms" className="text-xs gap-1">
              <Phone className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">SMS</span>
            </TabsTrigger>
            <TabsTrigger value="meeting" className="text-xs gap-1">
              <Calendar className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Meet</span>
            </TabsTrigger>
            <TabsTrigger value="task" className="text-xs gap-1">
              <CheckSquare className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Task</span>
            </TabsTrigger>
            <TabsTrigger value="assessment" className="text-xs gap-1">
              <ClipboardCheck className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Assess</span>
            </TabsTrigger>
          </TabsList>

          {/* Notes Tab Content */}
          <TabsContent value="notes" className="m-0 data-[state=active]:flex-1 data-[state=active]:flex data-[state=active]:flex-col min-h-0 space-y-3">
            <div className="relative flex-1">
              <Textarea
                ref={textareaRef}
                placeholder="Add a note... Use @ to mention team members"
                value={noteContent}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                className="h-full pr-10 text-sm resize-none"
                disabled={isSubmitting}
              />
              <Button
                size="icon"
                variant="ghost"
                className="absolute bottom-2 right-2 h-7 w-7"
                onClick={handleSubmitNote}
                disabled={!noteContent.trim() || isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>

              {showMentions && filteredTeam.length > 0 && mentionPosition && (
                <div
                  className="absolute z-50 bg-popover border rounded-md shadow-lg max-h-[120px] overflow-auto min-w-[180px]"
                  style={{
                    top: `${mentionPosition.top}px`,
                    left: `${mentionPosition.left}px`,
                  }}
                >
                  {filteredTeam.slice(0, 4).map((member) => (
                    <Button
                      key={member.id}
                      variant="ghost"
                      className="w-full flex items-center gap-2 px-3 py-2 h-auto text-left text-sm justify-start rounded-none"
                      onClick={() => insertMention(member)}
                    >
                      <Avatar className="h-5 w-5 flex-shrink-0">
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback className="text-[10px]">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <span className="font-medium text-xs">{member.name}</span>
                        <span className="text-[10px] text-muted-foreground ml-2 px-1.5 py-0.5 bg-muted rounded-md">{member.role}</span>
                      </div>
                    </Button>
                  ))}
                </div>
              )}
            </div>

            <p className="text-[10px] text-muted-foreground flex-shrink-0">
              <AtSign className="h-2.5 w-2.5 inline mr-0.5" />
              Mention team members with @ • Press Cmd+Enter to submit
            </p>
          </TabsContent>

          {/* Email Tab Content */}
          <TabsContent value="email" className="m-0 data-[state=active]:flex-1 data-[state=active]:flex data-[state=active]:flex-col min-h-0 overflow-hidden">
            <div className="flex flex-col h-full bg-background">
              {/* Header: To & Actions */}
              <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/30">
                <div className="flex items-center gap-2 overflow-hidden">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">To:</span>
                  <div className="bg-background px-2 py-0.5 rounded-full border text-[10px] font-medium truncate max-w-[200px]">
                    {candidateEmail || "No Email"}
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-6 px-2 text-[10px]"
                    onClick={() => setShowCc(prev => !prev)}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    CC
                  </Button>
                  <Button
                    onClick={handleSendEmail}
                    disabled={!emailSubject.trim() || !emailBody.trim() || isSendingEmail || !candidateEmail}
                    className="h-6 px-3 text-[10px] font-bold"
                    size="sm"
                  >
                    {isSendingEmail ? <Loader2 className="h-3 w-3 animate-spin" /> : "Send"}
                  </Button>
                </div>
              </div>

              {(showCc || ccEmails.length > 0) && (
                <div className="px-3 py-1.5 border-b bg-background">
                  <div className="flex flex-wrap items-center gap-1.5 min-h-[24px]">
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">CC:</span>
                    {ccEmails.map((email) => (
                      <Badge key={email} variant="outline" className="h-5 text-[10px] px-1.5 gap-1">
                        <span className="max-w-[180px] truncate">{email}</span>
                        <button
                          type="button"
                          onClick={() => removeCcEmail(email)}
                          className="rounded-full hover:bg-muted"
                        >
                          <X className="h-2.5 w-2.5" />
                        </button>
                      </Badge>
                    ))}
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button type="button" variant="outline" size="sm" className="h-6 px-2 text-[10px]">
                          <Users className="h-3 w-3 mr-1" />
                          Team
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-72 p-1" align="start">
                        <div className="max-h-52 overflow-auto">
                          {hiringTeam.filter(member => member.email).length === 0 ? (
                            <div className="px-2 py-1.5 text-[11px] text-muted-foreground">
                              No hiring team emails found
                            </div>
                          ) : (
                            hiringTeam
                              .filter(member => member.email)
                              .map(member => {
                                const teamEmail = member.email as string;
                                const isSelected = ccEmails.includes(teamEmail.toLowerCase());
                                return (
                                  <button
                                    key={member.id}
                                    type="button"
                                    onClick={() => addCcEmail(teamEmail)}
                                    disabled={isSelected}
                                    className="w-full flex items-center justify-between px-2 py-1.5 text-left rounded hover:bg-muted disabled:opacity-50"
                                  >
                                    <div className="min-w-0">
                                      <p className="text-[11px] font-medium truncate">{member.name}</p>
                                      <p className="text-[10px] text-muted-foreground truncate">{teamEmail}</p>
                                    </div>
                                    <span className="text-[10px] text-muted-foreground">{member.role}</span>
                                  </button>
                                );
                              })
                          )}
                        </div>
                      </PopoverContent>
                    </Popover>
                    <Input
                      type="email"
                      value={ccInput}
                      onChange={(e) => setCcInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addCcEmail(ccInput);
                          setCcInput('');
                        }
                        if (e.key === ',' || e.key === ';') {
                          e.preventDefault();
                          addCcEmail(ccInput);
                          setCcInput('');
                        }
                      }}
                      onBlur={() => {
                        if (ccInput.trim()) {
                          addCcEmail(ccInput);
                          setCcInput('');
                        }
                      }}
                      placeholder="Add CC email"
                      className="h-6 text-[10px] max-w-[180px]"
                    />
                  </div>
                </div>
              )}

              {/* Subject & Tools Row */}
              <div className="flex items-center gap-2 px-2 py-1 border-b">
                <Input
                  placeholder="Subject..."
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="text-xs h-7 border-none shadow-none focus-visible:ring-0 flex-1 min-w-[100px] bg-transparent font-medium px-1"
                  disabled={isSendingEmail}
                />
                <div className="h-4 w-px bg-border" />

                {/* Templates */}
                <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
                  <SelectTrigger className="h-6 w-[24px] p-0 border-none shadow-none text-muted-foreground hover:text-foreground">
                    <FileText className="h-3.5 w-3.5" />
                  </SelectTrigger>
                  <SelectContent align="end">
                    {templates.map(template => (
                      <SelectItem key={template.id} value={template.id} className="text-xs">{template.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* AI */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-primary hover:text-primary hover:bg-primary/10">
                      <Sparkles className="h-3.5 w-3.5" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-3 shadow-xl" side="bottom" align="end">
                    <div className="space-y-2">
                      <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">AI Assistant</h4>
                      <Textarea
                        placeholder="What to write?"
                        value={aiContext}
                        onChange={(e) => setAiContext(e.target.value)}
                        className="text-xs min-h-[60px]"
                      />
                      <Button size="sm" onClick={handleGenerateWithAI} disabled={isGeneratingAI} className="w-full h-7 text-xs">
                        Generate
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Editor */}
              <div className="flex-1 min-h-0 relative">
                <RichTextEditor
                  content={emailBody}
                  onChange={setEmailBody}
                  placeholder="Write your email..."
                  className="absolute inset-0 border-none text-xs p-3 resize-none focus:outline-none"
                />
              </div>
            </div>
          </TabsContent>

          {/* SMS Tab Content */}
          <TabsContent value="sms" className="m-0 data-[state=active]:flex-1 data-[state=active]:flex data-[state=active]:flex-col min-h-0 overflow-hidden">
            <SendSmsTab application={applicationObj} />
          </TabsContent>

          {/* Schedule Meeting Tab Content */}
          <TabsContent value="meeting" className="m-0 data-[state=active]:flex-1 data-[state=active]:flex data-[state=active]:flex-col min-h-0 overflow-hidden">
            <ScheduleMeetingTab application={applicationObj} />
          </TabsContent>

          {/* Create Task Tab Content */}
          <TabsContent value="task" className="m-0 data-[state=active]:flex-1 data-[state=active]:flex data-[state=active]:flex-col min-h-0 overflow-hidden">
            <CreateTaskTab application={applicationObj} />
          </TabsContent>

          {/* Assessment Create/Send Tab Content */}
          <TabsContent value="assessment" className="m-0 data-[state=active]:flex-1 data-[state=active]:flex data-[state=active]:flex-col min-h-0 overflow-hidden">
            <AssessmentRoundCreatePanel
              applicationId={applicationId}
              jobId={currentJobId}
              jobTitle={jobTitle}
              compact
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
