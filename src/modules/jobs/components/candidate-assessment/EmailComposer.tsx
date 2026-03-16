// @ts-nocheck
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Badge } from "@/shared/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import { Sparkles, Loader2, Send, Users, X, Plus } from "lucide-react";
import { apiClient } from "@/shared/lib/api";
import { GmailMessage, GmailThread, gmailThreadService } from "@/shared/lib/gmailThreadService";
import { useToast } from "@/shared/hooks/use-toast";
import { getApplicationEmailTemplates } from "@/shared/lib/applicationEmailTemplates";

type ComposerMode = "new" | "reply";
type Tone = "professional" | "friendly" | "formal";

interface EmailComposerProps {
  mode: ComposerMode;
  applicationId: string;
  candidateName: string;
  candidateEmail?: string;
  jobTitle: string;
  jobId?: string;
  thread?: GmailThread | null;
  replyingToMessage?: GmailMessage | null;
  onSent: (needsReconnect?: boolean) => void;
  onCancel: () => void;
}

function stripHtml(value: string): string {
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export function EmailComposer({
  mode,
  applicationId,
  candidateName,
  candidateEmail,
  jobTitle,
  jobId,
  thread,
  replyingToMessage,
  onSent,
  onCancel,
}: EmailComposerProps) {
  const templates = useMemo(() => getApplicationEmailTemplates(), []);
  const { toast } = useToast();

  const defaultSubject = useMemo(() => {
    if (mode === "reply") {
      const source = thread?.subject || replyingToMessage?.subject || "";
      return source.startsWith("Re:") ? source : `Re: ${source}`;
    }
    return "";
  }, [mode, thread?.subject, replyingToMessage?.subject]);

  const [subject, setSubject] = useState(defaultSubject);
  const [body, setBody] = useState("");
  const [tone, setTone] = useState<Tone>("professional");
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [aiPrompt, setAiPrompt] = useState(
    mode === "reply"
      ? "Reply clearly, acknowledge candidate context, and provide next steps."
      : `Write a concise update email for ${candidateName} about ${jobTitle}.`
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const [ccEmails, setCcEmails] = useState<string[]>([]);
  const [ccInput, setCcInput] = useState('');
  const [hiringTeam, setHiringTeam] = useState<Array<{ id: string; name: string; email: string }>>([]);
  const [ccPickerOpen, setCcPickerOpen] = useState(false);
  const [showCc, setShowCc] = useState(mode === "new");

  useEffect(() => {
    if (!jobId) return;
    apiClient.get<any>(`/api/jobs/${jobId}/team`).then((res) => {
      if (res.success && res.data) {
        const team = (res.data.team || res.data) as any[];
        setHiringTeam(
          team.map((m: any) => ({ id: m.id, name: m.name, email: m.email }))
        );
      }
    }).catch(() => {});
  }, [jobId]);

  const addCcEmail = (email: string) => {
    const trimmed = email.trim();
    if (!trimmed || !/.+@.+\..+/.test(trimmed)) return;
    if (ccEmails.includes(trimmed)) return;
    setCcEmails((prev) => [...prev, trimmed]);
  };

  const removeCcEmail = (email: string) => {
    setCcEmails((prev) => prev.filter((e) => e !== email));
  };

  const applyTemplate = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = templates.find((item) => item.id === templateId);
    if (!template) return;
    if (mode === "new") {
      setSubject(template.subject || subject);
    }
    setBody(template.body || "");
  };

  const handleGenerateAI = async () => {
    setIsGenerating(true);
    try {
      if (mode === "reply") {
        if (!replyingToMessage) throw new Error("Reply context missing");
        const original = stripHtml(replyingToMessage.body);
        const result = await gmailThreadService.rewriteEmailReply(applicationId, {
          originalMessage: `${original}\n\nInstruction: ${aiPrompt}`,
          tone,
        });
        setSubject((prev) => prev || result.subject || defaultSubject);
        setBody(result.body || "");
      } else {
        const response = await apiClient.post<any>(`/api/applications/${applicationId}/emails/generate`, {
          purpose: aiPrompt,
          tone,
        });
        if (!response.success || !response.data) throw new Error(response.error || "Failed to generate email");

        const payload = response.data as any;
        const generated = payload.email || payload;
        setSubject(generated.subject || subject || `Update for ${candidateName}`);
        setBody(generated.body || "");
      }

      toast({
        title: "AI draft generated",
        description: "Review and send",
      });
    } catch (error) {
      toast({
        title: "AI generation failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSend = async () => {
    if (!subject.trim() || !body.trim()) {
      toast({
        title: "Missing fields",
        description: "Subject and body are required",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    try {
      let needsReconnect: boolean | undefined;
      if (mode === "reply") {
        if (!thread?.threadId || !replyingToMessage?.id) {
          throw new Error("Reply thread context missing");
        }
        await gmailThreadService.sendEmailReply(applicationId, {
          threadId: thread.threadId,
          messageId: replyingToMessage.id,
          subject,
          body,
          to: replyingToMessage.from,
          cc: ccEmails.length ? ccEmails : undefined,
        });
      } else {
        const response = await apiClient.post<any>(`/api/applications/${applicationId}/emails`, {
          subject,
          body,
          templateId: selectedTemplate || undefined,
          cc: ccEmails.length ? ccEmails : undefined,
        });
        if (!response.success) throw new Error(response.error || "Failed to send email");
        needsReconnect = (response.data as any)?.needsReconnect ?? false;
      }

      toast({
        title: "Email sent",
      });
      onSent(needsReconnect);
    } catch (error) {
      toast({
        title: "Send failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold">{mode === "reply" ? "Reply Email" : "Compose Email"}</p>
            <p className="text-xs text-muted-foreground">
              {mode === "reply" ? replyingToMessage?.from : candidateEmail || "Candidate email unavailable"}
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-7 text-[11px] gap-1"
              onClick={() => setShowCc((prev) => !prev)}
            >
              <Plus className="h-3 w-3" />
              Add CC
            </Button>
            <Badge variant="outline" className="h-5 text-[10px]">
              {mode === "reply" ? "Thread Reply" : "New Message"}
            </Badge>
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {(showCc || ccEmails.length > 0) && (
          <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-1.5 min-h-[28px]">
            <span className="text-xs text-muted-foreground w-6 shrink-0">CC</span>
            {ccEmails.map((email) => (
              <Badge key={email} variant="outline" className="h-6 text-xs pl-2 pr-1 gap-1">
                {email}
                <button
                  type="button"
                  onClick={() => removeCcEmail(email)}
                  className="ml-0.5 rounded-full hover:bg-muted"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
          <div className="flex items-center gap-1.5">
            <Input
              type="email"
              value={ccInput}
              onChange={(e) => setCcInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') { e.preventDefault(); addCcEmail(ccInput); setCcInput(''); }
              }}
              placeholder="email@example.com"
              className="h-8 text-xs flex-1"
            />
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-8 text-xs"
              onClick={() => { addCcEmail(ccInput); setCcInput(''); }}
            >
              Add
            </Button>
            {jobId && (
              <Popover open={ccPickerOpen} onOpenChange={setCcPickerOpen}>
                <PopoverTrigger asChild>
                  <Button type="button" size="sm" variant="outline" className="h-8 text-xs gap-1.5">
                    <Users className="h-3.5 w-3.5" />
                    Hiring Team
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-1" align="end">
                  {hiringTeam.length === 0 ? (
                    <p className="text-xs text-muted-foreground px-2 py-1.5">No team members found.</p>
                  ) : (
                    hiringTeam.map((member) => (
                      <button
                        key={member.id}
                        type="button"
                        className="w-full text-left px-2 py-1.5 rounded hover:bg-muted text-xs"
                        onClick={() => {
                          addCcEmail(member.email);
                          setCcPickerOpen(false);
                        }}
                      >
                        <span className="font-medium">{member.name}</span>
                        <span className="text-muted-foreground ml-1.5">{member.email}</span>
                      </button>
                    ))
                  )}
                </PopoverContent>
              </Popover>
            )}
          </div>
          </div>
        )}

        <div className="grid gap-2 sm:grid-cols-[1fr_150px_auto]">
          <Input
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            placeholder="Tell AI what to write..."
            className="h-8 text-xs"
          />
          <Select value={tone} onValueChange={(value) => setTone(value as Tone)}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="professional">Professional</SelectItem>
              <SelectItem value="friendly">Friendly</SelectItem>
              <SelectItem value="formal">Formal</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs" onClick={handleGenerateAI} disabled={isGenerating}>
            {isGenerating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
            AI Draft
          </Button>
        </div>

        <div className="grid gap-2 sm:grid-cols-[1fr_220px]">
          <Input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Subject"
            className="h-8 text-xs"
          />
          <Select value={selectedTemplate} onValueChange={applyTemplate}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Apply template" />
            </SelectTrigger>
            <SelectContent>
              {templates.map((template) => (
                <SelectItem key={template.id} value={template.id}>
                  {template.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write email..."
          className="min-h-[240px] resize-y text-sm leading-5"
        />

        {mode === "reply" && replyingToMessage?.body ? (
          <div className="rounded-md border bg-muted/20 p-2 text-[11px] text-muted-foreground">
            <p className="mb-1 font-medium">Replying to</p>
            <p className="line-clamp-3">{stripHtml(replyingToMessage.body)}</p>
          </div>
        ) : null}
      </div>

      <div className="flex items-center justify-end gap-2 border-t px-4 py-3">
        <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={onCancel}>
          Cancel
        </Button>
        <Button size="sm" className="h-8 gap-1.5 text-xs" onClick={handleSend} disabled={isSending}>
          {isSending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
          Send
        </Button>
      </div>
    </div>
  );
}
