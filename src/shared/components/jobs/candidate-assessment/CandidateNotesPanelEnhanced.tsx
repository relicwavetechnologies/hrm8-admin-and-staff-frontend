import { useMemo, useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Textarea } from "@/shared/components/ui/textarea";
import { CalendarDays, CheckSquare, Mail, MessageSquare, Send, Sparkles } from "lucide-react";
import { Application } from "@/shared/types/application";
import { useToast } from "@/shared/hooks/use-toast";

type ComposerTab = "note" | "email" | "sms" | "meet" | "task" | "assess";

interface CandidateNotesPanelEnhancedProps {
  applicationId: string;
  jobId: string;
  candidateName: string;
  jobTitle: string;
  candidateEmail?: string;
  candidatePhone?: string;
  application?: Application;
  refreshTrigger?: number;
}

export function CandidateNotesPanelEnhanced({
  candidateName,
  jobTitle,
  candidateEmail,
  candidatePhone,
  application,
}: CandidateNotesPanelEnhancedProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<ComposerTab>("note");
  const [draft, setDraft] = useState("");
  const [subject, setSubject] = useState("");

  const recentNotes = useMemo(() => application?.notes?.slice(-3).reverse() || [], [application?.notes]);

  const placeholder = {
    note: "Add a note... Use @ to mention team members",
    email: "Draft an email update for this candidate",
    sms: "Write a quick SMS update",
    meet: "Add meeting preparation notes",
    task: "Create a follow-up task",
    assess: "Record an assessment summary",
  }[activeTab];

  const handleSubmit = () => {
    if (!draft.trim() && activeTab !== "email") return;

    toast({
      title: `${activeTab === "note" ? "Note" : "Draft"} saved`,
      description: `${candidateName} • ${jobTitle}`,
    });
    setDraft("");
    setSubject("");
  };

  const tabs: Array<{ id: ComposerTab; label: string; icon: typeof MessageSquare }> = [
    { id: "note", label: "Note", icon: MessageSquare },
    { id: "email", label: "Email", icon: Mail },
    { id: "sms", label: "SMS", icon: MessageSquare },
    { id: "meet", label: "Meet", icon: CalendarDays },
    { id: "task", label: "Task", icon: CheckSquare },
    { id: "assess", label: "Assess", icon: Sparkles },
  ];

  return (
    <div className="flex h-full flex-col">
      <div className="rounded-b-2xl border-b bg-background px-3 pt-3">
        <div className="flex flex-wrap gap-2">
          {tabs.map(({ id, label, icon: Icon }) => (
            <Button
              key={id}
              type="button"
              variant={activeTab === id ? "secondary" : "ghost"}
              className="h-10 rounded-2xl px-4 text-sm"
              onClick={() => setActiveTab(id)}
            >
              <Icon className="mr-2 h-4 w-4" />
              {label}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-hidden bg-background p-3">
        <Card className="flex h-full flex-col rounded-[28px] border shadow-none">
          <CardContent className="flex h-full flex-col gap-3 p-4">
            {activeTab === "email" ? (
              <Input
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                placeholder={`Subject for ${candidateEmail || candidateName}`}
                className="rounded-xl"
              />
            ) : null}

            <Textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder={placeholder}
              className="min-h-[180px] flex-1 resize-none rounded-2xl border-0 bg-transparent p-0 text-base shadow-none focus-visible:ring-0"
            />

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div>
                {activeTab === "email" ? candidateEmail || "No candidate email" : candidatePhone || "@Mention team members with @"}
              </div>
              <Button size="icon" className="h-9 w-9 rounded-full" onClick={handleSubmit}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="border-t bg-background px-4 py-2 text-xs text-muted-foreground">
        @Mention team members with @ • Press Cmd+Enter to submit
      </div>

      {recentNotes.length > 0 ? (
        <div className="border-t bg-muted/10 px-3 py-3">
          <ScrollArea className="max-h-28">
            <div className="space-y-2">
              {recentNotes.map((note) => (
                <div key={note.id} className="rounded-xl border bg-background px-3 py-2">
                  <div className="text-xs font-medium">{note.userName}</div>
                  <div className="mt-1 text-sm text-muted-foreground">{note.content}</div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      ) : null}
    </div>
  );
}
