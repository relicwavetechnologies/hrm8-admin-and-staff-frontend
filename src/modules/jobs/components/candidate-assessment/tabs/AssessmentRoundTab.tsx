// @ts-nocheck
import { useEffect, useMemo, useState } from "react";
import { apiClient } from "@/shared/lib/api";
import { AssessmentQuestion } from "@/shared/lib/assessmentService";
import { emailTemplateService, EmailTemplate } from "@/shared/lib/emailTemplateService";
import { Application } from "@/shared/types/application";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/shared/components/ui/sheet";
import { Textarea } from "@/shared/components/ui/textarea";
import { useToast } from "@/shared/hooks/use-toast";
import { CalendarClock, ClipboardCheck, Loader2, Plus, Send, Trash2, Eye } from "lucide-react";

type AssessmentTypePreset = "mixed" | "technical" | "behavioral" | "coding";

type LocalQuestion = {
  id: string;
  questionText: string;
  type: AssessmentQuestion["type"];
  optionsText?: string;
  points: number;
};

interface RoundAssessment {
  id: string;
  applicationId: string;
  candidateName: string;
  candidateEmail: string;
  status: string;
  score: number | null;
  averageScore?: number | null;
  invitedAt: string;
  completedAt: string | null;
  invitationToken: string;
  isMovedToNextRound?: boolean;
  applicationStage?: string;
  roundId?: string;
  roundName?: string;
}

interface AssessmentGradingDetails {
  id: string;
  assessment_question: Array<{
    id: string;
    question_text: string;
    question_type: string;
    options?: unknown;
    order: number;
  }>;
  assessment_response: Array<{
    id: string;
    question_id: string;
    response: unknown;
    assessment_grade: Array<{
      id: string;
      score: number | null;
      comment: string | null;
    }>;
  }>;
  assessment_comment?: Array<{
    id: string;
    comment: string;
    created_at: string;
    user?: {
      first_name?: string;
      last_name?: string;
      email?: string;
    };
  }>;
}

interface AssessmentRoundCreatePanelProps {
  applicationId: string;
  jobId: string;
  jobTitle?: string;
  compact?: boolean;
  onCreated?: () => void;
}

interface CandidateAssessmentListTabProps {
  application: Application;
  jobId: string;
}

const getDefaultQuestions = (preset: AssessmentTypePreset, role: string): LocalQuestion[] => {
  const target = role || "this role";

  const mixed: LocalQuestion[] = [
    {
      id: crypto.randomUUID(),
      questionText: `What are the top 3 priorities you would focus on in the first 30 days for ${target}?`,
      type: "LONG_ANSWER",
      points: 5,
    },
    {
      id: crypto.randomUUID(),
      questionText: `Which metric best reflects strong delivery quality for ${target}?`,
      type: "MULTIPLE_CHOICE",
      optionsText: "Business outcome, Number of meetings, Longest documents, Most tasks created",
      points: 3,
    },
    {
      id: crypto.randomUUID(),
      questionText: `Describe a recent decision where you balanced speed and quality.`,
      type: "SHORT_ANSWER",
      points: 4,
    },
  ];

  const technical: LocalQuestion[] = [
    {
      id: crypto.randomUUID(),
      questionText: `Explain how you would break down a large technical project into safe, deliverable milestones.`,
      type: "LONG_ANSWER",
      points: 5,
    },
    {
      id: crypto.randomUUID(),
      questionText: `How do you validate correctness before shipping a feature?`,
      type: "SHORT_ANSWER",
      points: 4,
    },
    {
      id: crypto.randomUUID(),
      questionText: `Which practice reduces production regressions most effectively?`,
      type: "MULTIPLE_CHOICE",
      optionsText: "Automated tests + staged rollout, Big bang deployment, Manual-only checks, Skipping code review",
      points: 3,
    },
  ];

  const behavioral: LocalQuestion[] = [
    {
      id: crypto.randomUUID(),
      questionText: `Describe a conflict you resolved with a cross-functional stakeholder.`,
      type: "LONG_ANSWER",
      points: 5,
    },
    {
      id: crypto.randomUUID(),
      questionText: `How do you give difficult feedback while maintaining trust?`,
      type: "SHORT_ANSWER",
      points: 4,
    },
    {
      id: crypto.randomUUID(),
      questionText: `What is your approach when priorities suddenly change?`,
      type: "SHORT_ANSWER",
      points: 4,
    },
  ];

  const coding: LocalQuestion[] = [
    {
      id: crypto.randomUUID(),
      questionText: `Implement a function to process and summarize a list of records with edge-case handling.`,
      type: "CODE",
      points: 6,
    },
    {
      id: crypto.randomUUID(),
      questionText: `How would you optimize an API endpoint that is timing out under load?`,
      type: "LONG_ANSWER",
      points: 5,
    },
    {
      id: crypto.randomUUID(),
      questionText: `Which approach best improves latency for repeated reads?`,
      type: "MULTIPLE_CHOICE",
      optionsText: "Caching + indexing, Add logs only, Increase response payload, Disable pagination",
      points: 3,
    },
  ];

  if (preset === "technical") return technical;
  if (preset === "behavioral") return behavioral;
  if (preset === "coding") return coding;
  return mixed;
};

const toDateInput = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

function statusVariant(status: string): "default" | "secondary" | "outline" {
  const normalized = (status || "").toUpperCase();
  if (normalized === "COMPLETED") return "default";
  if (normalized === "IN_PROGRESS") return "secondary";
  return "outline";
}

function parseQuestionMarker(comment: string): string | null {
  const match = comment.match(/^\[Q:([^\]]+)\]\s*/);
  return match?.[1] || null;
}

function stripQuestionMarker(comment: string): string {
  return comment.replace(/^\[Q:[^\]]+\]\s*/, "");
}

function userDisplayName(user: AssessmentGradingDetails["assessment_comment"] extends Array<infer T> ? T["user"] : never) {
  const first = user?.first_name || "";
  const last = user?.last_name || "";
  const name = `${first} ${last}`.trim();
  return name || user?.email || "Unknown";
}

export function AssessmentRoundCreatePanel({
  applicationId,
  jobId,
  jobTitle,
  compact = false,
  onCreated,
}: AssessmentRoundCreatePanelProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState("default");
  const [typePreset, setTypePreset] = useState<AssessmentTypePreset>("mixed");
  const [deadlineDate, setDeadlineDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return toDateInput(date);
  });
  const [questions, setQuestions] = useState<LocalQuestion[]>(() => getDefaultQuestions("mixed", jobTitle || "Role"));

  const loadMeta = async () => {
    if (!jobId) return;
    setLoading(true);
    try {
      const templateList = await emailTemplateService.getTemplates({ type: "ASSESSMENT" });
      setTemplates(templateList);
    } catch (error) {
      console.error("Failed to load assessment metadata", error);
      toast({
        title: "Failed to load assessment setup",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMeta();
  }, [jobId]);

  useEffect(() => {
    setQuestions(getDefaultQuestions(typePreset, jobTitle || "Role"));
  }, [typePreset, jobTitle]);

  const updateQuestion = (id: string, updates: Partial<LocalQuestion>) => {
    setQuestions((prev) => prev.map((question) => (question.id === id ? { ...question, ...updates } : question)));
  };

  const removeQuestion = (id: string) => {
    setQuestions((prev) => prev.filter((question) => question.id !== id));
  };

  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        questionText: "",
        type: "SHORT_ANSWER",
        points: 3,
      },
    ]);
  };

  const fieldHeight = compact ? "h-6" : "h-7";
  const labelClass = compact ? "text-[10px]" : "text-[11px]";
  const controlText = compact ? "text-[11px]" : "text-xs";

  const handleCreateAndSend = async () => {
    if (!applicationId || !jobId) {
      toast({
        title: "Missing setup",
        description: "Unable to send assessment right now. Please retry.",
        variant: "destructive",
      });
      return;
    }

    const validQuestions = questions
      .filter((question) => question.questionText.trim().length > 0)
      .map((question, index) => ({
        questionText: question.questionText.trim(),
        type: question.type,
        options:
          question.type === "MULTIPLE_CHOICE" || question.type === "MULTIPLE_SELECT"
            ? (question.optionsText || "")
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean)
            : undefined,
        points: Number.isFinite(question.points) ? question.points : 1,
        order: index,
      })) as AssessmentQuestion[];

    if (validQuestions.length === 0) {
      toast({
        title: "Questions required",
        description: "Add at least one question before sending.",
        variant: "destructive",
      });
      return;
    }

    const deadline = new Date(`${deadlineDate}T23:59:59`);
    if (Number.isNaN(deadline.getTime())) {
      toast({
        title: "Invalid deadline",
        description: "Please select a valid deadline date.",
        variant: "destructive",
      });
      return;
    }

    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    const deadlineDays = Math.max(1, Math.ceil((deadline.getTime() - now) / dayMs));

    setCreating(true);
    try {
      const inviteRes = await apiClient.post<{ assessmentId?: string }>("/api/assessments/invite", {
        applicationId,
        deadlineDays,
        questions: validQuestions,
        templateId: selectedTemplateId !== "default" ? selectedTemplateId : undefined,
      });

      if (!inviteRes.success) {
        throw new Error(inviteRes.error || "Failed to send assessment invite");
      }

      toast({
        title: "Assessment sent",
        description: "Assessment was created and sent to the candidate via Gmail.",
      });
      onCreated?.();
    } catch (error) {
      console.error("Failed to create/send assessment", error);
      toast({
        title: "Failed to send assessment",
        description: error instanceof Error ? error.message : "Unexpected error",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className={`space-y-1.5 ${compact ? "h-full flex flex-col min-h-0" : "p-1"}`}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 flex-shrink-0">
        <div className="space-y-1">
          <Label className={labelClass}>Deadline</Label>
          <Input type="date" value={deadlineDate} onChange={(event) => setDeadlineDate(event.target.value)} className={`${fieldHeight} ${controlText}`} />
        </div>

        <div className="space-y-1">
          <Label className={labelClass}>Assessment Type</Label>
          <Select value={typePreset} onValueChange={(value) => setTypePreset(value as AssessmentTypePreset)}>
            <SelectTrigger className={`${fieldHeight} ${controlText}`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mixed">Mixed</SelectItem>
              <SelectItem value="technical">Technical</SelectItem>
              <SelectItem value="behavioral">Behavioral</SelectItem>
              <SelectItem value="coding">Coding</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label className={labelClass}>Email Template</Label>
          <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
            <SelectTrigger className={`${fieldHeight} ${controlText}`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default assessment email</SelectItem>
              {templates.map((template) => (
                <SelectItem key={template.id} value={template.id}>
                  {template.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className={`border-border/60 ${compact ? "min-h-0 flex flex-col" : ""}`}>
        <CardHeader className={`${compact ? "py-1.5 px-2.5" : "py-2 px-3"} flex-shrink-0`}>
          <div className="flex items-center justify-between">
            <CardTitle className={`${compact ? "text-[11px]" : "text-xs"} flex items-center gap-1.5`}>
              <ClipboardCheck className={`${compact ? "h-3 w-3" : "h-3.5 w-3.5"}`} />
              Questions
            </CardTitle>
            <Button size="sm" variant="outline" className={`${compact ? "h-5 px-2 text-[10px]" : "h-6 text-[11px]"}`} onClick={addQuestion}>
              <Plus className={`${compact ? "h-2.5 w-2.5" : "h-3 w-3"} mr-1`} />
              Add
            </Button>
          </div>
        </CardHeader>
        <CardContent className={`${compact ? "px-2.5 pb-2.5" : "px-3 pb-3"} ${compact ? "min-h-0" : ""}`}>
          <ScrollArea className={compact ? "h-[148px]" : "h-[220px]"}>
            <div className={`${compact ? "space-y-1.5 pr-1" : "space-y-2 pr-2"}`}>
              {questions.map((question, index) => (
                <div key={question.id} className={`rounded-md border ${compact ? "p-1.5 space-y-1.5" : "p-2 space-y-2"}`}>
                  <div className="flex items-center justify-between gap-2">
                    <span className={`${compact ? "text-[10px]" : "text-[11px]"} font-medium`}>Q{index + 1}</span>
                    <div className="flex items-center gap-2">
                      <Select value={question.type} onValueChange={(value) => updateQuestion(question.id, { type: value as LocalQuestion["type"] })}>
                        <SelectTrigger className={`${compact ? "h-5 w-[112px] text-[10px]" : "h-6 w-[128px] text-[11px]"}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MULTIPLE_CHOICE">Multiple Choice</SelectItem>
                          <SelectItem value="MULTIPLE_SELECT">Multi Select</SelectItem>
                          <SelectItem value="SHORT_ANSWER">Short Answer</SelectItem>
                          <SelectItem value="LONG_ANSWER">Long Answer</SelectItem>
                          <SelectItem value="CODE">Code</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        type="number"
                        value={question.points}
                        onChange={(event) => updateQuestion(question.id, { points: Number(event.target.value) || 1 })}
                        className={`${compact ? "h-5 w-[48px] text-[10px]" : "h-6 w-[54px] text-[11px]"}`}
                        min={1}
                      />
                      <Button size="icon" variant="ghost" className={`${compact ? "h-5 w-5" : "h-6 w-6"}`} onClick={() => removeQuestion(question.id)}>
                        <Trash2 className={`${compact ? "h-3 w-3" : "h-3.5 w-3.5"}`} />
                      </Button>
                    </div>
                  </div>

                  <Textarea
                    value={question.questionText}
                    onChange={(event) => updateQuestion(question.id, { questionText: event.target.value })}
                    placeholder="Type question..."
                    className={`${compact ? "min-h-[42px] text-[11px]" : "min-h-[52px] text-xs"}`}
                  />

                  {(question.type === "MULTIPLE_CHOICE" || question.type === "MULTIPLE_SELECT") && (
                    <Input
                      value={question.optionsText || ""}
                      onChange={(event) => updateQuestion(question.id, { optionsText: event.target.value })}
                      placeholder="Options separated by comma"
                      className={`${fieldHeight} ${controlText}`}
                    />
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <div className={`flex items-center justify-end flex-shrink-0 border-t ${compact ? "pt-1.5" : "pt-2"}`}>
        <Button className={`${compact ? "h-6 text-[11px] px-2.5" : "h-7 text-xs"} whitespace-nowrap`} onClick={handleCreateAndSend} disabled={creating || loading}>
          {creating ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Send className="h-3.5 w-3.5 mr-1.5" />}
          Create & Send
        </Button>
      </div>
    </div>
  );
}

function AssessmentResponsesDrawer({
  open,
  onOpenChange,
  assessment,
  applicationId,
  onCommentAdded,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assessment: RoundAssessment | null;
  applicationId: string;
  onCommentAdded?: () => void;
}) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<AssessmentGradingDetails | null>(null);
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [submittingForQuestion, setSubmittingForQuestion] = useState<string | null>(null);

  const fetchDetails = async () => {
    if (!assessment?.id) return;
    setLoading(true);
    try {
      const res = await apiClient.get<AssessmentGradingDetails>(`/api/assessments/${assessment.id}/grading`);
      if (!res.success || !res.data) {
        throw new Error(res.error || "Failed to load assessment");
      }
      setData(res.data);
    } catch (error) {
      console.error("Failed to load assessment details", error);
      toast({
        title: "Failed to load assessment details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && assessment?.id) {
      fetchDetails();
    }
  }, [open, assessment?.id]);

  const commentsByQuestion = useMemo(() => {
    const result: Record<string, NonNullable<AssessmentGradingDetails["assessment_comment"]>> = {};
    const comments = data?.assessment_comment || [];
    comments.forEach((comment) => {
      const questionId = parseQuestionMarker(comment.comment);
      if (!questionId) return;
      if (!result[questionId]) result[questionId] = [];
      result[questionId].push(comment);
    });
    return result;
  }, [data?.assessment_comment]);

  const addQuestionComment = async (questionId: string) => {
    if (!assessment?.id || !data) return;
    const draft = (commentDrafts[questionId] || "").trim();
    if (!draft) return;

    setSubmittingForQuestion(questionId);
    try {
      const assessmentComment = `[Q:${questionId}] ${draft}`;
      const noteComment = `[Assessment Ref: ${assessment.id}] [Q:${questionId}] ${draft}`;

      const [commentRes, noteRes] = await Promise.all([
        apiClient.post(`/api/assessments/${assessment.id}/comment`, { comment: assessmentComment }),
        apiClient.post(`/api/applications/${applicationId}/notes`, { content: noteComment, mentions: [] }),
      ]);

      if (!commentRes.success || !noteRes.success) {
        throw new Error(commentRes.error || noteRes.error || "Failed to add comment");
      }

      setCommentDrafts((prev) => ({ ...prev, [questionId]: "" }));
      toast({
        title: "Comment added",
        description: "Question comment saved in assessment and notes.",
      });
      await fetchDetails();
      onCommentAdded?.();
    } catch (error) {
      console.error("Failed to add question comment", error);
      toast({
        title: "Failed to add comment",
        description: error instanceof Error ? error.message : "Unexpected error",
        variant: "destructive",
      });
    } finally {
      setSubmittingForQuestion(null);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-[920px] p-0 flex flex-col">
        <SheetHeader className="px-4 py-3 border-b">
          <SheetTitle>Assessment Responses</SheetTitle>
          <SheetDescription>
            {assessment?.roundName || "Assessment"} · {assessment?.status || "Unknown"}
          </SheetDescription>
        </SheetHeader>

        {loading ? (
          <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Loading responses...
          </div>
        ) : !data ? (
          <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">No assessment data found.</div>
        ) : (
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-4">
              {data.assessment_question
                .slice()
                .sort((a, b) => a.order - b.order)
                .map((question, index) => {
                  const response = data.assessment_response.find((item) => item.question_id === question.id);
                  const questionComments = commentsByQuestion[question.id] || [];
                  return (
                    <Card key={question.id} className="border-border/60">
                      <CardHeader className="py-3 px-4">
                        <div className="flex items-center justify-between gap-2">
                          <CardTitle className="text-sm">Q{index + 1}. {question.question_text}</CardTitle>
                          <Badge variant="outline">{question.question_type}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="px-4 pb-4 space-y-3">
                        <div className="rounded-md bg-muted/30 border px-3 py-2">
                          <p className="text-xs font-medium mb-1">Candidate Response</p>
                          {response ? (
                            typeof response.response === "string" ? (
                              <p className="text-xs whitespace-pre-wrap">{response.response}</p>
                            ) : (
                              <pre className="text-[11px] overflow-auto whitespace-pre-wrap">{JSON.stringify(response.response, null, 2)}</pre>
                            )
                          ) : (
                            <p className="text-xs text-muted-foreground">No response submitted.</p>
                          )}
                        </div>

                        {questionComments.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-xs font-medium">Comments</p>
                            {questionComments.map((comment) => (
                              <div key={comment.id} className="rounded-md border px-3 py-2">
                                <p className="text-xs">{stripQuestionMarker(comment.comment)}</p>
                                <p className="text-[10px] text-muted-foreground mt-1">
                                  {userDisplayName(comment.user)} · {new Date(comment.created_at).toLocaleString()}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="space-y-2">
                          <Label className="text-xs">Add Comment</Label>
                          <Textarea
                            value={commentDrafts[question.id] || ""}
                            onChange={(event) => setCommentDrafts((prev) => ({ ...prev, [question.id]: event.target.value }))}
                            placeholder="Add comment for this response..."
                            className="text-xs min-h-[72px]"
                          />
                          <div className="flex justify-end">
                            <Button
                              size="sm"
                              className="h-7 text-xs"
                              onClick={() => addQuestionComment(question.id)}
                              disabled={!commentDrafts[question.id]?.trim() || submittingForQuestion === question.id}
                            >
                              {submittingForQuestion === question.id ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : null}
                              Save Comment
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          </ScrollArea>
        )}
      </SheetContent>
    </Sheet>
  );
}

export function CandidateAssessmentListTab({ application, jobId: _jobId }: CandidateAssessmentListTabProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [assessments, setAssessments] = useState<RoundAssessment[]>([]);
  const [selectedAssessment, setSelectedAssessment] = useState<RoundAssessment | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const fetchAssessments = async () => {
    if (!application.id) return;
    setLoading(true);
    try {
      const response = await apiClient.get<RoundAssessment[]>(`/api/assessments/application/${application.id}`);
      const merged = (response.success && response.data ? response.data : [])
        .sort((a, b) => new Date(b.invitedAt || 0).getTime() - new Date(a.invitedAt || 0).getTime());

      setAssessments(merged);
    } catch (error) {
      console.error("Failed to fetch assessments", error);
      toast({
        title: "Failed to load assessments",
        variant: "destructive",
      });
      setAssessments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssessments();
  }, [application.id]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarClock className="h-4 w-4 text-muted-foreground" />
          <p className="text-xs font-medium">Assessments Sent to Candidate</p>
          <Badge variant="outline">{assessments.length}</Badge>
        </div>
        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={fetchAssessments} disabled={loading}>
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Refresh"}
        </Button>
      </div>

      {loading ? (
        <div className="rounded-md border p-3 text-xs text-muted-foreground flex items-center gap-2">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Loading assessments...
        </div>
      ) : assessments.length === 0 ? (
        <div className="rounded-md border p-3 text-xs text-muted-foreground">
          No assessment has been sent to this candidate yet.
        </div>
      ) : (
        <div className="space-y-2">
          {assessments.map((assessment) => (
            <div key={assessment.id} className="rounded-md border px-3 py-2">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs font-medium truncate">{assessment.roundName || "Assessment Round"}</p>
                  <p className="text-[11px] text-muted-foreground">
                    Invited: {assessment.invitedAt ? new Date(assessment.invitedAt).toLocaleString() : "-"}
                  </p>
                  {assessment.completedAt && (
                    <p className="text-[11px] text-muted-foreground">
                      Completed: {new Date(assessment.completedAt).toLocaleString()}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={statusVariant(assessment.status)}>{assessment.status}</Badge>
                  <Badge variant="outline">Score: {assessment.averageScore ?? assessment.score ?? "N/A"}</Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs"
                    onClick={() => {
                      setSelectedAssessment(assessment);
                      setDrawerOpen(true);
                    }}
                  >
                    <Eye className="h-3.5 w-3.5 mr-1.5" />
                    Open
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <AssessmentResponsesDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        assessment={selectedAssessment}
        applicationId={application.id}
        onCommentAdded={fetchAssessments}
      />
    </div>
  );
}
