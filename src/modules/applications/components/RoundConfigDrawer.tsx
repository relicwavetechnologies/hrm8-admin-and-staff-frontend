// @ts-nocheck
/**
 * Tabbed Round Configuration Drawer (SaaS-style)
 * General | Interview | Assessment | Email — all settings configurable in one flow
 */
import { useState, useEffect } from "react";
import { safeOpenExternal } from "@/shared/lib/safeExternalLink";
import { FormDrawer } from "@/shared/components/ui/form-drawer";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import { Switch } from "@/shared/components/ui/switch";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/shared/components/ui/radio-group";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Separator } from "@/shared/components/ui/separator";
import { jobRoundService, JobRound } from "@/shared/lib/jobRoundService";
import { emailTemplateService, EmailTemplate, EmailTemplateType } from "@/shared/lib/emailTemplateService";
import { apiClient } from "@/shared/lib/api";
import { jobService } from "@/shared/lib/jobService";
import { interviewService, CreateInterviewConfigRequest } from "@/shared/lib/interviewService";
import { assessmentService, AssessmentQuestion, CreateAssessmentRequest } from "@/shared/lib/assessmentService";
import { toast } from "sonner";
import { Save, AlertCircle, Plus, Sparkles, Loader2, Settings2, Video, FileCheck, Mail, FileText } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert";
import type { JobRole } from "@/shared/types/job";
import { mapBackendJobToFrontend } from "@/shared/lib/jobDataMapper";
import { Job } from "@/shared/types/job";

export type RoundConfigTab = "general" | "interview" | "assessment" | "email" | "offer";

interface RoundConfigDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobId: string;
  round: JobRound | null;
  roles?: JobRole[];
  jobTitle?: string;
  initialTab?: RoundConfigTab;
  onSuccess?: () => void;
}

// Normalize API response (snake_case -> camelCase)
function normInterviewConfig(c: any): any {
  if (!c) return null;
  return {
    enabled: c.enabled ?? false,
    autoSchedule: c.auto_schedule ?? c.autoSchedule ?? true,
    requireBeforeProgression: c.require_before_progression ?? c.requireBeforeProgression ?? false,
    requireAllInterviewers: c.require_all_interviewers ?? c.requireAllInterviewers ?? false,
    interviewFormat: (c.interview_format ?? c.interviewFormat ?? "LIVE_VIDEO") as "LIVE_VIDEO" | "PHONE" | "IN_PERSON" | "PANEL",
    defaultDuration: c.default_duration ?? c.defaultDuration ?? 60,
    requiresInterviewer: c.requires_interviewer ?? c.requiresInterviewer ?? true,
    passThreshold: c.pass_threshold ?? c.passThreshold,
    scoringMethod: c.scoring_method ?? c.scoringMethod,
    autoMoveOnPass: c.auto_move_on_pass ?? c.autoMoveOnPass ?? false,
    instructions: c.agenda ?? c.instructions,
    agenda: c.agenda,
  };
}

function normAssessmentConfig(c: any): any {
  if (!c) return null;
  return {
    enabled: c.enabled ?? false,
    autoAssign: c.auto_assign ?? c.autoAssign ?? true,
    autoMoveOnPass: c.auto_move_on_pass ?? c.autoMoveOnPass ?? false,
    autoRejectOnFail: c.auto_reject_on_fail ?? c.autoRejectOnFail ?? false,
    autoRejectOnDeadline: c.auto_reject_on_deadline ?? c.autoRejectOnDeadline ?? false,
    deadlineDays: c.deadline_days ?? c.deadlineDays,
    timeLimitMinutes: c.time_limit_minutes ?? c.timeLimitMinutes,
    passThreshold: c.pass_threshold ?? c.passThreshold,
    provider: c.provider ?? "native",
    instructions: c.instructions ?? "",
    questions: c.questions ?? [],
    evaluationMode: c.evaluation_mode ?? c.evaluationMode ?? "GRADING",
    votingRule: c.voting_rule ?? c.votingRule ?? "MAJORITY",
    minApprovalsCount: c.min_approvals_count ?? c.minApprovalsCount ?? 1,
  };
}

export function RoundConfigDrawer({
  open,
  onOpenChange,
  jobId,
  round,
  roles = [],
  jobTitle = "",
  initialTab = "general",
  onSuccess,
}: RoundConfigDrawerProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<RoundConfigTab>(initialTab);

  // General
  const [assignedRoleId, setAssignedRoleId] = useState("");
  const [syncPermissions, setSyncPermissions] = useState(true);
  const [autoMoveOnPass, setAutoMoveOnPass] = useState(false);
  const [requireAllInterviewers, setRequireAllInterviewers] = useState(false);

  // Interview (INTERVIEW rounds)
  const [interviewEnabled, setInterviewEnabled] = useState(false);
  const [defaultDuration, setDefaultDuration] = useState(60);
  const [interviewFormat, setInterviewFormat] = useState<"LIVE_VIDEO" | "PHONE" | "IN_PERSON" | "PANEL">("LIVE_VIDEO");
  const [autoSchedule, setAutoSchedule] = useState(true);
  const [requireBeforeProgression, setRequireBeforeProgression] = useState(false);
  const [passThreshold, setPassThreshold] = useState<number | undefined>();
  const [scoringMethod, setScoringMethod] = useState<"AVERAGE" | "WEIGHTED" | "CONSENSUS">("AVERAGE");
  const [agenda, setAgenda] = useState("");

  // Assessment (ASSESSMENT rounds)
  const [assessmentEnabled, setAssessmentEnabled] = useState(false);
  const [evaluationMode, setEvaluationMode] = useState<"GRADING" | "VOTING">("GRADING");
  const [votingRule, setVotingRule] = useState<"UNANIMOUS" | "MAJORITY" | "MIN_APPROVALS">("MAJORITY");
  const [minApprovalsCount, setMinApprovalsCount] = useState<number>(1);
  const [autoAssign, setAutoAssign] = useState(true);
  const [assessmentAutoMoveOnPass, setAssessmentAutoMoveOnPass] = useState(false);
  const [autoRejectOnFail, setAutoRejectOnFail] = useState(false);
  const [autoRejectOnDeadline, setAutoRejectOnDeadline] = useState(false);
  const [deadlineDays, setDeadlineDays] = useState<number | undefined>(7);
  const [timeLimitMinutes, setTimeLimitMinutes] = useState<number | undefined>();
  const [assessmentPassThreshold, setAssessmentPassThreshold] = useState<number | undefined>(70);
  const [provider, setProvider] = useState("native");
  const [instructions, setInstructions] = useState("");
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [assessmentAiGenerating, setAssessmentAiGenerating] = useState(false);

  // Email
  const [enabled, setEnabled] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [aiContext, setAiContext] = useState("");
  const [aiTone, setAiTone] = useState("professional");
  const [aiGenerating, setAiGenerating] = useState(false);

  // Offer (OFFER fixed round)
  const [offerAutoSend, setOfferAutoSend] = useState(false);
  const [offerTemplateId, setOfferTemplateId] = useState("");
  const [offerSalary, setOfferSalary] = useState("");
  const [offerCurrency, setOfferCurrency] = useState("USD");
  const [offerSalaryPeriod, setOfferSalaryPeriod] = useState("annual");
  const [offerWorkLocation, setOfferWorkLocation] = useState("");
  const [offerWorkArrangement, setOfferWorkArrangement] = useState<"on-site" | "remote" | "hybrid">("remote");
  const [offerBenefits, setOfferBenefits] = useState("");
  const [offerVacationDays, setOfferVacationDays] = useState("");
  const [offerExpiryDays, setOfferExpiryDays] = useState("7");
  const [offerCustomMessage, setOfferCustomMessage] = useState("");
  const [offerJob, setOfferJob] = useState<Job | null>(null);

  const [loadedRoles, setLoadedRoles] = useState<JobRole[]>([]);
  const [jobTitleFromApi, setJobTitleFromApi] = useState("");
  const effectiveRoles = roles?.length ? roles : loadedRoles;
  const effectiveJobTitle = jobTitle || jobTitleFromApi;

  const isInterview = round?.type === "INTERVIEW";
  const isAssessment = round?.type === "ASSESSMENT";
  const isCustomRound = round && !round.isFixed;
  /** Assessment tab only for custom assessment rounds (with tests); not for fixed NEW/OFFER/HIRED/REJECTED */
  const isCustomAssessment = isAssessment && isCustomRound;
  const isOfferRound = round?.fixedKey === "OFFER";

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab, open]);

  useEffect(() => {
    if (open && jobId && round) {
      setAssignedRoleId(round.assignedRoleId ?? "");
      setSyncPermissions(round.syncPermissions ?? true);
      loadData();
    }
  }, [open, jobId, round?.id]);

  useEffect(() => {
    if (!open || !jobId) return;
    if (roles?.length) return;
    (async () => {
      try {
        const res = await jobService.getJobRoles(jobId);
        if (res.success && res.data?.roles) setLoadedRoles(res.data.roles);
      } catch {
        /* ignore */
      }
    })();
  }, [open, jobId, roles?.length]);

  useEffect(() => {
    if (!open || !jobId || jobTitle) return;
    (async () => {
      try {
        const res = await jobService.getJobById(jobId);
        if (res.success && res.data?.job?.title) setJobTitleFromApi(res.data.job.title);
      } catch {
        /* ignore */
      }
    })();
  }, [open, jobId, jobTitle]);

  useEffect(() => {
    setSelectedTemplate(selectedTemplateId ? (templates.find((t) => t.id === selectedTemplateId) ?? null) : null);
  }, [selectedTemplateId, templates]);

  const getExpectedTemplateType = (roundType: string, fixedKey?: string | null): EmailTemplateType | undefined => {
    if (fixedKey === "NEW") return "NEW";
    if (fixedKey === "OFFER") return "OFFER";
    if (fixedKey === "HIRED") return "HIRED";
    if (fixedKey === "REJECTED") return "REJECTED";
    if (roundType === "ASSESSMENT") return "ASSESSMENT";
    if (roundType === "INTERVIEW") return "INTERVIEW";
    return undefined;
  };

  const getRoundConfigDescription = () => {
    if (!round) return "Role, interview, assessment, and email settings";
    if (round.isFixed && round.fixedKey) {
      const m: Record<string, string> = {
        NEW: "New applications land here. Configure who can manage them and automated emails.",
        OFFER: "Ready to extend an offer. Configure auto-send, default offer template, and automated emails.",
        HIRED: "Final stage. Configure permissions and automated emails.",
        REJECTED: "Rejected candidates. Configure permissions and automated emails.",
      };
      return m[round.fixedKey] ?? "Configure role, permissions, and automated emails.";
    }
    if (isInterview) return "Assign interviewers by role, set approval rules, and configure automated emails.";
    if (isCustomAssessment) return "Set up assessment tests, auto-move rules, and automated emails.";
    return "Role, permissions, and automated email settings";
  };

  const formatTemplateTypeLabel = (type: string | undefined) => {
    const map: Record<string, string> = {
      NEW: "New Application",
      APPLICATION_CONFIRMATION: "New Application",
      ASSESSMENT: "Assessment",
      INTERVIEW: "Interview",
      INTERVIEW_INVITATION: "Interview",
      OFFER: "Offer",
      HIRED: "Hired",
      REJECTED: "Rejected",
    };
    return map[type ?? ""] ?? (type ?? "Unknown").split("_").map((w) => w.charAt(0) + w.slice(1).toLowerCase()).join(" ");
  };

  const loadData = async () => {
    if (!round) return;
    setLoading(true);
    try {
      const expectedType = getExpectedTemplateType(round.type, round.fixedKey);
      const [configRes, specificTemplates, customTemplates] = await Promise.all([
        jobRoundService.getEmailConfig(jobId, round.id),
        expectedType ? emailTemplateService.getTemplates({ type: expectedType }) : Promise.resolve([]),
        emailTemplateService.getTemplates({ type: "CUSTOM" }),
      ]);

      if (configRes.success && configRes.data) {
        setEnabled(configRes.data.enabled);
        setSelectedTemplateId(configRes.data.templateId || "");
      } else {
        setEnabled(false);
        setSelectedTemplateId("");
      }

        const combined = [...specificTemplates, ...customTemplates];
        const allTemplates = Array.from(new Map(combined.map((t) => [t.id, t])).values());
      setTemplates(allTemplates);

      // General: auto-move from round or config
      if (round.isFixed) {
        setAutoMoveOnPass(Boolean(round.autoMoveOnPass));
      } else if (isInterview) {
        const ir = await interviewService.getInterviewConfig(jobId, round.id);
        const c = normInterviewConfig(ir.data?.config);
        setAutoMoveOnPass(Boolean(c?.autoMoveOnPass));
        setRequireAllInterviewers(Boolean(c?.requireAllInterviewers));
        if (c) {
          setInterviewEnabled(c.enabled);
          setDefaultDuration(c.defaultDuration ?? 60);
          setInterviewFormat((c.interviewFormat as any) ?? "LIVE_VIDEO");
          setAutoSchedule(c.autoSchedule ?? true);
          setRequireBeforeProgression(c.requireBeforeProgression ?? false);
          setPassThreshold(c.passThreshold);
          setScoringMethod((c.scoringMethod as any) ?? "AVERAGE");
          setAgenda(c.agenda ?? c.instructions ?? "");
        }
      } else if (isAssessment) {
        const ar = await assessmentService.getAssessmentConfig(jobId, round.id);
        const c = normAssessmentConfig(ar.data?.config);
        setAutoMoveOnPass(Boolean(c?.autoMoveOnPass));
        if (c) {
          setAssessmentEnabled(c.enabled);
          setEvaluationMode((c.evaluationMode ?? "GRADING") as "GRADING" | "VOTING");
          setVotingRule((c.votingRule ?? "MAJORITY") as "UNANIMOUS" | "MAJORITY" | "MIN_APPROVALS");
          setMinApprovalsCount(c.minApprovalsCount ?? 1);
          setAutoAssign(c.autoAssign ?? true);
          setAssessmentAutoMoveOnPass(c.autoMoveOnPass ?? false);
          setAutoRejectOnFail(c.autoRejectOnFail ?? false);
          setAutoRejectOnDeadline(c.autoRejectOnDeadline ?? false);
          setDeadlineDays(c.deadlineDays ?? 7);
          setTimeLimitMinutes(c.timeLimitMinutes);
          setAssessmentPassThreshold(c.passThreshold ?? 70);
          setProvider(c.provider ?? "native");
          setInstructions(c.instructions ?? "");
          setQuestions(c.questions ?? []);
        }
      }

      // Offer config (API)
      if (round.fixedKey === "OFFER") {
        const offerRes = await jobRoundService.getOfferConfig(jobId, round.id);
        if (offerRes.success && offerRes.data) {
          const c = offerRes.data;
          setOfferAutoSend(c.autoSend ?? false);
          setOfferTemplateId(c.defaultTemplateId || "");
          setOfferSalary(c.defaultSalary || "");
          setOfferCurrency(c.defaultSalaryCurrency || "USD");
          setOfferSalaryPeriod(c.defaultSalaryPeriod || "annual");
          setOfferWorkLocation(c.defaultWorkLocation || "");
          setOfferWorkArrangement(
            (c.defaultWorkArrangement as "on-site" | "remote" | "hybrid") || "remote"
          );
          setOfferBenefits(c.defaultBenefits || "");
          setOfferVacationDays(c.defaultVacationDays || "");
          setOfferExpiryDays(c.defaultExpiryDays || "7");
          setOfferCustomMessage(c.defaultCustomMessage || "");
        } else {
          // Fetch job for defaults when no saved config
          const res = await jobService.getJobById(jobId);
          if (res.success && res.data?.job) {
            const mapped = mapBackendJobToFrontend(res.data.job);
            setOfferJob(mapped);
            const j = mapped;
            const sal = j.salaryMax || j.salaryMin || 0;
            setOfferSalary(sal.toString());
            setOfferCurrency(j.salaryCurrency || "USD");
            setOfferSalaryPeriod(j.salaryPeriod || "annual");
            setOfferWorkLocation(j.location || "");
            setOfferWorkArrangement(
              (j.workArrangement?.toLowerCase() === "hybrid" ? "hybrid" : j.workArrangement?.toLowerCase() === "remote" ? "remote" : "on-site") as "on-site" | "remote" | "hybrid"
            );
          }
        }
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to load configuration");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWithAI = async () => {
    if (!round) return;
    setAiGenerating(true);
    try {
      const type = getExpectedTemplateType(round.type, round.fixedKey) ?? "CUSTOM";
      const res = await apiClient.post<{ subject: string; body: string }>("/api/ai/templates/generate", {
        type,
        jobTitle: effectiveJobTitle || "Position",
        companyName: "Our Company",
        candidateName: "Candidate",
        tone: aiTone,
        context: aiContext,
        jobId,
        jobRoundId: round.id,
        roundName: round.name,
      });
      if (!res.success || !res.data) throw new Error(res.error || "Generate failed");
      const newTemplate = await emailTemplateService.createTemplate({
        jobId,
        jobRoundId: round.id,
        name: `${round.name} – Email`,
        type: (type as EmailTemplateType) || "CUSTOM",
        subject: res.data.subject,
        body: res.data.body,
        isAiGenerated: true,
      });
      setSelectedTemplateId(newTemplate.id);
      setEnabled(true);
      setTemplates((prev) => [...prev.filter((t) => t.id !== newTemplate.id), newTemplate]);
      setSelectedTemplate(newTemplate);
      setAiDialogOpen(false);
      setAiContext("");
      toast.success("Template created. Click Save to apply.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to create template with AI");
    } finally {
      setAiGenerating(false);
    }
  };

  const handleGenerateAssessmentQuestionsWithAI = async () => {
    const title = effectiveJobTitle || "this role";
    setAssessmentAiGenerating(true);
    try {
      let jobDescription: string | undefined;
      try {
        const res = await jobService.getJobById(jobId);
        if (res.success && res.data?.job?.description) {
          jobDescription = res.data.job.description;
        }
      } catch {
        /* ignore */
      }
      const generated = await assessmentService.generateQuestionsWithAI({
        jobTitle: title,
        jobDescription,
        questionCount: 5,
      });
      const mapped: AssessmentQuestion[] = generated.map((q, i) => ({
        questionText: q.questionText,
        type: q.type ?? "LONG_ANSWER",
        options: q.options,
        order: questions.length + i,
      }));
      setQuestions((prev) => [...prev, ...mapped]);
      toast.success(`Generated ${mapped.length} questions. Review and edit as needed.`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to generate questions");
    } finally {
      setAssessmentAiGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!round) return;
    if (enabled && !selectedTemplateId) {
      toast.error("Please select an email template or disable the automation.");
      return;
    }
    if (enabled && round.type === "ASSESSMENT" && !round.isFixed && selectedTemplate) {
      const body = selectedTemplate.body || "";
      if (!body.includes("{{assessmentUrl}}") && !body.includes("{{assessment_url}}")) {
        toast.error("Assessment templates must include the {{assessmentUrl}} variable.");
        return;
      }
    }
    if (assessmentEnabled && questions.length === 0) {
      toast.error("Please add at least one question or disable the assessment.");
      return;
    }

    setSaving(true);
    try {
      await jobRoundService.updateRound(jobId, round.id, {
        assignedRoleId: assignedRoleId || null,
        syncPermissions,
        autoMoveOnPass: round.isFixed
          ? autoMoveOnPass
          : isInterview || isCustomAssessment
            ? undefined
            : autoMoveOnPass,
        ...(isInterview && { requireAllInterviewers }),
      });

      if (isInterview) {
        const interviewPayload: CreateInterviewConfigRequest = {
          enabled: interviewEnabled,
          autoSchedule,
          requireBeforeProgression,
          requireAllInterviewers,
          interviewFormat,
          defaultDuration,
          passThreshold,
          scoringMethod,
          autoMoveOnPass,
          agenda: agenda || undefined,
        };
        await interviewService.configureInterview(jobId, round.id, interviewPayload);
      }

      if (isCustomAssessment) {
        const assessmentPayload: CreateAssessmentRequest = {
          enabled: assessmentEnabled,
          evaluationMode,
          votingRule: evaluationMode === "VOTING" ? votingRule : undefined,
          minApprovalsCount: evaluationMode === "VOTING" ? minApprovalsCount : undefined,
          autoAssign,
          auto_move_on_pass: assessmentAutoMoveOnPass,
          auto_reject_on_fail: autoRejectOnFail,
          auto_reject_on_deadline: autoRejectOnDeadline,
          deadlineDays: deadlineDays || undefined,
          timeLimitMinutes: timeLimitMinutes || undefined,
          passThreshold: evaluationMode === "GRADING" ? (assessmentPassThreshold || undefined) : undefined,
          provider,
          questions: questions.length > 0 ? questions : undefined,
          instructions: instructions || undefined,
        };
        await assessmentService.configureAssessment(jobId, round.id, assessmentPayload);
      }

      if (!isInterview && !isCustomAssessment && isCustomRound) {
        await jobRoundService.updateRound(jobId, round.id, { autoMoveOnPass });
      }

      await jobRoundService.updateEmailConfig(jobId, round.id, { enabled, templateId: selectedTemplateId });

      if (round.fixedKey === "OFFER") {
        await jobRoundService.updateOfferConfig(jobId, round.id, {
          autoSend: offerAutoSend,
          defaultTemplateId: offerTemplateId,
          defaultSalary: offerSalary,
          defaultSalaryCurrency: offerCurrency,
          defaultSalaryPeriod: offerSalaryPeriod,
          defaultWorkLocation: offerWorkLocation,
          defaultWorkArrangement: offerWorkArrangement,
          defaultBenefits: offerBenefits,
          defaultVacationDays: offerVacationDays,
          defaultExpiryDays: offerExpiryDays,
          defaultCustomMessage: offerCustomMessage,
        });
      }

      toast.success("Configuration saved");
      onSuccess?.();
      onOpenChange(false);
    } catch (e) {
      console.error(e);
      toast.error("Failed to save configuration");
    } finally {
      setSaving(false);
    }
  };

  if (!round) return null;

  const visibleTabs = [
    "general",
    ...(isInterview ? ["interview"] : []),
    ...(isCustomAssessment ? ["assessment"] : []),
    ...(isOfferRound ? ["offer"] : []),
    "email",
  ];
  const defaultTab = visibleTabs.includes(activeTab) ? activeTab : "general";

  return (
    <>
      <FormDrawer
        open={open}
        onOpenChange={onOpenChange}
        title={`Configure: ${round.name}`}
        description={getRoundConfigDescription()}
        width="2xl"
      >
        {loading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
          <Tabs value={defaultTab} onValueChange={(v) => setActiveTab(v as RoundConfigTab)} className="space-y-4">
            <TabsList className={`grid w-full ${visibleTabs.length === 4 ? "grid-cols-4" : visibleTabs.length === 3 ? "grid-cols-3" : "grid-cols-2"}`}>
              <TabsTrigger value="general" className="gap-1.5 text-xs">
                <Settings2 className="h-3.5 w-3.5" />
                General
              </TabsTrigger>
              {isInterview && (
                <TabsTrigger value="interview" className="gap-1.5 text-xs">
                  <Video className="h-3.5 w-3.5" />
                  Interview
                </TabsTrigger>
              )}
              {isCustomAssessment && (
                <TabsTrigger value="assessment" className="gap-1.5 text-xs">
                  <FileCheck className="h-3.5 w-3.5" />
                  Assessment
                </TabsTrigger>
              )}
              {isOfferRound && (
                <TabsTrigger value="offer" className="gap-1.5 text-xs">
                  <FileText className="h-3.5 w-3.5" />
                  Offer
                </TabsTrigger>
              )}
              <TabsTrigger value="email" className="gap-1.5 text-xs">
                <Mail className="h-3.5 w-3.5" />
                Email
              </TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Role & permissions</CardTitle>
                  <CardDescription>
                    {effectiveRoles.length > 0
                      ? "Assign a role and who can move candidates in this round"
                      : "Control who can move and manage candidates in this round"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {effectiveRoles.length > 0 && (
                    <div className="space-y-2">
                      <Label>Assign role (optional)</Label>
                      <Select value={assignedRoleId || "_none_"} onValueChange={(v) => setAssignedRoleId(v === "_none_" ? "" : v)}>
                        <SelectTrigger>
                          <SelectValue placeholder="No role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="_none_">No role</SelectItem>
                          {effectiveRoles.map((r) => (
                            <SelectItem key={r.id} value={r.id}>
                              {r.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        For interview rounds: members with this role are auto-assigned as interviewers.
                      </p>
                    </div>
                  )}
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="sync-permissions"
                      checked={syncPermissions}
                      onCheckedChange={(c) => setSyncPermissions(c === true)}
                    />
                    <Label htmlFor="sync-permissions" className="text-sm font-normal cursor-pointer">
                      All hiring team roles can move and manage candidates in this round
                    </Label>
                  </div>
                  {isInterview && assignedRoleId && (
                    <div className="flex items-center space-x-2 pt-2 border-t">
                      <Checkbox
                        id="require-all"
                        checked={requireAllInterviewers}
                        onCheckedChange={(c) => setRequireAllInterviewers(c === true)}
                      />
                      <div>
                        <Label htmlFor="require-all" className="text-sm font-normal cursor-pointer">
                          Require all assigned interviewers to approve before the candidate can move to the next round
                        </Label>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          When on: the candidate cannot move (auto or manual) until everyone assigned from the role has submitted their feedback.
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Stage progression</CardTitle>
                  <CardDescription>
                    {round.isFixed
                      ? "Automatically move the candidate to the next round when they pass this stage"
                      : isInterview
                        ? "Automatically move the candidate to the next round when they pass the interview"
                        : isCustomAssessment
                          ? "Automatically move the candidate to the next round when their assessment score meets the pass threshold"
                          : "Automatically move the candidate to the next round when they pass"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="auto-move"
                      checked={isCustomAssessment ? assessmentAutoMoveOnPass : autoMoveOnPass}
                      onCheckedChange={(v) => {
                        if (isCustomAssessment) setAssessmentAutoMoveOnPass(v);
                        else setAutoMoveOnPass(v);
                      }}
                    />
                    <Label htmlFor="auto-move" className="text-sm font-normal cursor-pointer">
                      Auto-move on pass
                    </Label>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {isInterview && (
              <TabsContent value="interview" className="space-y-4 mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Interview settings</CardTitle>
                    <CardDescription>Duration, format, and evaluation criteria</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Enable interview config</Label>
                        <p className="text-xs text-muted-foreground">Store settings for this round</p>
                      </div>
                      <Switch checked={interviewEnabled} onCheckedChange={setInterviewEnabled} />
                    </div>
                    {interviewEnabled && (
                      <>
                        <Separator />
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Default duration (min)</Label>
                            <Select value={String(defaultDuration)} onValueChange={(v) => setDefaultDuration(parseInt(v, 10))}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {[15, 30, 45, 60, 90, 120].map((n) => (
                                  <SelectItem key={n} value={String(n)}>
                                    {n} min
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Format</Label>
                            <Select value={interviewFormat} onValueChange={(v: any) => setInterviewFormat(v)}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="LIVE_VIDEO">Video</SelectItem>
                                <SelectItem value="PHONE">Phone</SelectItem>
                                <SelectItem value="IN_PERSON">In-person</SelectItem>
                                <SelectItem value="PANEL">Panel</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>Auto-schedule interviews</Label>
                          <Switch checked={autoSchedule} onCheckedChange={setAutoSchedule} />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>Require interview before progression</Label>
                          <Switch checked={requireBeforeProgression} onCheckedChange={setRequireBeforeProgression} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Pass threshold (%)</Label>
                            <Input
                              type="number"
                              min={0}
                              max={100}
                              value={passThreshold ?? ""}
                              onChange={(e) => setPassThreshold(e.target.value ? parseInt(e.target.value, 10) : undefined)}
                              placeholder="Optional"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Scoring method</Label>
                            <Select value={scoringMethod} onValueChange={(v: any) => setScoringMethod(v)}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="AVERAGE">Average</SelectItem>
                                <SelectItem value="WEIGHTED">Weighted</SelectItem>
                                <SelectItem value="CONSENSUS">Consensus</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Agenda / instructions</Label>
                          <Textarea
                            value={agenda}
                            onChange={(e) => setAgenda(e.target.value)}
                            placeholder="Guidelines for interviewers..."
                            rows={3}
                          />
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            {isAssessment && (
              <TabsContent value="assessment" className="space-y-4 mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Assessment settings</CardTitle>
                    <CardDescription>Enable, assign, and configure assessments for this round</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Enable assessment</Label>
                      <Switch checked={assessmentEnabled} onCheckedChange={setAssessmentEnabled} />
                    </div>
                    {assessmentEnabled && (
                      <>
                        <Separator />
                        <div className="space-y-2">
                          <Label>Evaluation method</Label>
                          <div className="flex gap-4">
                          <RadioGroup
                            value={evaluationMode}
                            onValueChange={(v) => setEvaluationMode(v as "GRADING" | "VOTING")}
                            className="flex gap-4"
                          >
                            <div className="flex items-center gap-2">
                              <RadioGroupItem value="GRADING" id="mode-grading" />
                              <Label htmlFor="mode-grading" className="cursor-pointer">Grading</Label>
                            </div>
                            <div className="flex items-center gap-2">
                              <RadioGroupItem value="VOTING" id="mode-voting" />
                              <Label htmlFor="mode-voting" className="cursor-pointer">Voting</Label>
                            </div>
                          </RadioGroup>
                        </div>
                          <p className="text-xs text-muted-foreground">
                            {evaluationMode === "GRADING"
                              ? "Evaluators assign numeric scores; pass is based on threshold."
                              : "Evaluators vote Approve/Reject; outcome based on voting rule."}
                          </p>
                        </div>
                        {evaluationMode === "VOTING" && (
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label>Voting rule</Label>
                              <Select value={votingRule} onValueChange={(v) => setVotingRule(v as "UNANIMOUS" | "MAJORITY" | "MIN_APPROVALS")}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="UNANIMOUS">Unanimous (all must approve)</SelectItem>
                                  <SelectItem value="MAJORITY">Majority (more approve than reject)</SelectItem>
                                  <SelectItem value="MIN_APPROVALS">Minimum approvals (at least N approve)</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            {votingRule === "MIN_APPROVALS" && (
                              <div className="space-y-2">
                                <Label>Minimum approvals required</Label>
                                <Input
                                  type="number"
                                  min={1}
                                  value={minApprovalsCount}
                                  onChange={(e) => setMinApprovalsCount(Math.max(1, parseInt(e.target.value, 10) || 1))}
                                />
                              </div>
                            )}
                          </div>
                        )}
                        {evaluationMode === "GRADING" && (
                          <div className="space-y-2">
                            <Label>Pass threshold (%)</Label>
                            <Input
                              type="number"
                              min={0}
                              max={100}
                              value={assessmentPassThreshold ?? ""}
                              onChange={(e) => setAssessmentPassThreshold(e.target.value ? parseInt(e.target.value, 10) : undefined)}
                              placeholder="70"
                            />
                          </div>
                        )}
                        <Separator />
                        <div className="flex items-center justify-between">
                          <Label>Auto-assign to new applicants</Label>
                          <Switch checked={autoAssign} onCheckedChange={setAutoAssign} />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>Auto-move on pass</Label>
                          <Switch checked={assessmentAutoMoveOnPass} onCheckedChange={setAssessmentAutoMoveOnPass} />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>Auto-reject on fail</Label>
                          <Switch checked={autoRejectOnFail} onCheckedChange={setAutoRejectOnFail} />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>Auto-reject on deadline missed</Label>
                          <Switch checked={autoRejectOnDeadline} onCheckedChange={setAutoRejectOnDeadline} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Deadline (days)</Label>
                            <Input
                              type="number"
                              min={1}
                              value={deadlineDays ?? ""}
                              onChange={(e) => setDeadlineDays(e.target.value ? parseInt(e.target.value, 10) : undefined)}
                              placeholder="7"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Time limit (min)</Label>
                            <Input
                              type="number"
                              min={1}
                              value={timeLimitMinutes ?? ""}
                              onChange={(e) => setTimeLimitMinutes(e.target.value ? parseInt(e.target.value, 10) : undefined)}
                              placeholder="Optional"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Provider</Label>
                          <Select value={provider} onValueChange={setProvider}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="native">Native</SelectItem>
                              <SelectItem value="hackerrank">HackerRank</SelectItem>
                              <SelectItem value="codility">Codility</SelectItem>
                              <SelectItem value="testgorilla">TestGorilla</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Instructions</Label>
                          <Textarea
                            value={instructions}
                            onChange={(e) => setInstructions(e.target.value)}
                            placeholder="Instructions for candidates..."
                            rows={3}
                          />
                        </div>
                        <Separator />
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <Label>Questions</Label>
                            <div className="flex items-center gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleGenerateAssessmentQuestionsWithAI}
                                disabled={assessmentAiGenerating}
                              >
                                {assessmentAiGenerating ? (
                                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                ) : (
                                  <Sparkles className="h-4 w-4 mr-1" />
                                )}
                                {assessmentAiGenerating ? " Generating…" : " Generate with AI"}
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setQuestions([...questions, { questionText: "", type: "MULTIPLE_CHOICE", options: ["", "", ""], order: questions.length }])}
                              >
                                <Plus className="h-4 w-4 mr-1" /> Add
                              </Button>
                            </div>
                          </div>
                          {questions.length === 0 ? (
                            <p className="text-sm text-muted-foreground py-4">No questions. Add at least one when assessment is enabled.</p>
                          ) : (
                            <div className="space-y-3">
                              {questions.map((q, i) => (
                                <Card key={i} className="p-3">
                                  <div className="flex justify-between gap-2">
                                    <Input
                                      value={q.questionText}
                                      onChange={(e) => {
                                        const u = [...questions];
                                        u[i] = { ...u[i], questionText: e.target.value };
                                        setQuestions(u);
                                      }}
                                      placeholder="Question text"
                                    />
                                    <Button variant="ghost" size="icon" onClick={() => setQuestions(questions.filter((_, idx) => idx !== i))}>
                                      ×
                                    </Button>
                                  </div>
                                  <Select
                                    value={q.type}
                                    onValueChange={(v: any) => {
                                      const u = [...questions];
                                      u[i] = { ...u[i], type: v, options: ["MULTIPLE_CHOICE", "MULTIPLE_SELECT"].includes(v) ? u[i].options ?? ["", ""] : undefined };
                                      setQuestions(u);
                                    }}
                                  >
                                    <SelectTrigger className="mt-2">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="MULTIPLE_CHOICE">Multiple Choice</SelectItem>
                                      <SelectItem value="MULTIPLE_SELECT">Multiple Select</SelectItem>
                                      <SelectItem value="SHORT_ANSWER">Short Answer</SelectItem>
                                      <SelectItem value="LONG_ANSWER">Long Answer</SelectItem>
                                      <SelectItem value="CODE">Code</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </Card>
                              ))}
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            {isOfferRound && (
              <TabsContent value="offer" className="space-y-4 mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Auto-Send Settings</CardTitle>
                    <CardDescription>
                      Automatically send offers to candidates when they&apos;re moved to this round
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="offer-auto-send">Enable Auto-Send</Label>
                        <p className="text-xs text-muted-foreground">
                          Automatically create and send offers using the default template
                        </p>
                      </div>
                      <Switch
                        id="offer-auto-send"
                        checked={offerAutoSend}
                        onCheckedChange={setOfferAutoSend}
                      />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Default Offer Template</CardTitle>
                    <CardDescription>Default values used when creating offers</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Template</Label>
                      <Select value={offerTemplateId} onValueChange={setOfferTemplateId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select template" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="template-ft-001">Full-Time Standard</SelectItem>
                          <SelectItem value="template-pt-001">Part-Time Standard</SelectItem>
                          <SelectItem value="template-contract">Contract Standard</SelectItem>
                          <SelectItem value="custom">Custom</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Default Salary</Label>
                        <Input
                          type="number"
                          value={offerSalary}
                          onChange={(e) => setOfferSalary(e.target.value)}
                          placeholder="e.g., 100000"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Currency</Label>
                        <Select value={offerCurrency} onValueChange={setOfferCurrency}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="USD">USD</SelectItem>
                            <SelectItem value="EUR">EUR</SelectItem>
                            <SelectItem value="GBP">GBP</SelectItem>
                            <SelectItem value="AUD">AUD</SelectItem>
                            <SelectItem value="INR">INR</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Salary Period</Label>
                        <Select value={offerSalaryPeriod} onValueChange={setOfferSalaryPeriod}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="annual">Annual</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="hourly">Hourly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Vacation Days</Label>
                        <Input
                          type="number"
                          value={offerVacationDays}
                          onChange={(e) => setOfferVacationDays(e.target.value)}
                          placeholder="e.g., 20"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Work Location</Label>
                      <Input
                        value={offerWorkLocation}
                        onChange={(e) => setOfferWorkLocation(e.target.value)}
                        placeholder="e.g., San Francisco, CA or Remote"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Work Arrangement</Label>
                      <Select
                        value={offerWorkArrangement}
                        onValueChange={(v: "on-site" | "remote" | "hybrid") => setOfferWorkArrangement(v)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="remote">Remote</SelectItem>
                          <SelectItem value="on-site">On-Site</SelectItem>
                          <SelectItem value="hybrid">Hybrid</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Benefits (comma-separated)</Label>
                      <Input
                        value={offerBenefits}
                        onChange={(e) => setOfferBenefits(e.target.value)}
                        placeholder="Health Insurance, 401k, etc."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Offer Expiry (days)</Label>
                      <Input
                        type="number"
                        value={offerExpiryDays}
                        onChange={(e) => setOfferExpiryDays(e.target.value)}
                        placeholder="7"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Default Custom Message</Label>
                      <Textarea
                        value={offerCustomMessage}
                        onChange={(e) => setOfferCustomMessage(e.target.value)}
                        placeholder="Optional message to include in offers"
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            <TabsContent value="email" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Automated email</CardTitle>
                  <CardDescription>
                    Send an email automatically when a candidate enters this stage (e.g., new application received, moved to interview, etc.)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <Label className="text-sm font-medium cursor-pointer">Turn on automated email</Label>
                      <p className="text-xs text-muted-foreground">When on, an email is sent when a candidate enters this round.</p>
                    </div>
                    <Switch id="automated-email" checked={enabled} onCheckedChange={setEnabled} />
                  </div>
                  {enabled && (
                    <>
                      <div className="space-y-2">
                        <Label>Template</Label>
                        <div className="flex gap-2">
                          <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                            <SelectTrigger className="flex-1">
                              <SelectValue placeholder="Choose a template..." />
                            </SelectTrigger>
                            <SelectContent>
                              {templates.map((t) => (
                                <SelectItem key={t.id} value={t.id}>
                                  <span className="flex justify-between w-full gap-2">
                                    <span>{t.name}</span>
                                    <span className="text-xs text-muted-foreground opacity-70">{formatTemplateTypeLabel(t.type)}</span>
                                  </span>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button variant="outline" size="sm" onClick={() => setAiDialogOpen(true)} className="gap-1" title="Create with AI">
                            <Sparkles className="h-4 w-4" /> AI
                          </Button>
                          <Button variant="outline" size="icon" onClick={() => safeOpenExternal("/email-templates")} title="Email Hub">
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Showing <strong>{formatTemplateTypeLabel(getExpectedTemplateType(round.type, round.fixedKey))}</strong> and Custom templates.
                        </p>
                      </div>
                      {selectedTemplate && (
                        <div className="p-4 border rounded-md bg-muted/30">
                          <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">Preview</Label>
                          <p className="text-sm font-medium">{selectedTemplate.subject}</p>
                          <div className="text-sm text-muted-foreground line-clamp-4 whitespace-pre-wrap">{selectedTemplate.body}</div>
                        </div>
                      )}
                      {round.type === "ASSESSMENT" && !round.isFixed && selectedTemplate && !selectedTemplate.body?.includes("{{assessmentUrl}}") && !selectedTemplate.body?.includes("{{assessment_url}}") && (
                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertTitle>Invalid template</AlertTitle>
                          <AlertDescription>
                            Assessment rounds require the <strong>{`{{assessmentUrl}}`}</strong> variable in the template.
                          </AlertDescription>
                        </Alert>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 pt-4 mt-4 border-t">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              Save Configuration
            </Button>
          </div>
          </>
        )}
      </FormDrawer>

      <Dialog open={aiDialogOpen} onOpenChange={setAiDialogOpen}>
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Create email template with AI
            </DialogTitle>
            <DialogDescription>Job and round pre-selected for &quot;{round.name}&quot;</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">Job: <strong>{effectiveJobTitle || "—"}</strong></p>
            <div className="space-y-2">
              <Label>Tone</Label>
              <Select value={aiTone} onValueChange={setAiTone}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="friendly">Friendly</SelectItem>
                  <SelectItem value="formal">Formal</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Additional context (optional)</Label>
              <Textarea placeholder="e.g. Include interview duration..." value={aiContext} onChange={(e) => setAiContext(e.target.value)} rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAiDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateWithAI} disabled={aiGenerating}>
              {aiGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {aiGenerating ? " Generating…" : " Generate & create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
