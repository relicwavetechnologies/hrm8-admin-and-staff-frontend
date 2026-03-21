// @ts-nocheck
import { useEffect, useMemo, useState } from "react";
import { Application } from "@/shared/types/application";
import { JobRound } from "@/shared/lib/jobRoundService";
import {
  offerService,
  OfferWorkflowResponse,
  OfferWorkflowState,
  OfferWorkflowStep,
  CompensationBreakdown,
} from "@/shared/lib/offerService";
import { GmailMessage, GmailThread, gmailThreadService } from "@/shared/lib/gmailThreadService";
import { apiClient } from "@/shared/lib/api";
import { useToast } from "@/shared/hooks/use-toast";
import { cn } from "@/shared/lib/utils";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/shared/components/ui/sheet";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { Textarea } from "@/shared/components/ui/textarea";
import { TablePagination } from "@/shared/components/tables/TablePagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { EmailReplyDrawer } from "@/modules/jobs/components/candidate-assessment/EmailReplyDrawer";
import { EmailThreadDetailView } from "@/modules/jobs/components/candidate-assessment/EmailThreadDetailView";
import { CandidateAssessmentView } from "@/modules/jobs/components/candidate-assessment/CandidateAssessmentView";
import { applicationService } from "@/shared/lib/applicationService";
import { BarChart3, CheckCircle2, Eye, Loader2, Mail, Save, TrendingUp, Upload, FolderOpen, ChevronDown } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { DocumentHubPicker } from "./DocumentHubPicker";
import { CompanyDocument } from "@/shared/lib/documentHubService";

interface JobOffersTabProps {
  jobId: string;
  jobTitle: string;
  applications: Application[];
  rounds: JobRound[];
  onRefresh?: () => void;
  mode?: "offers" | "hired";
  showJobColumn?: boolean;
  readOnly?: boolean;
}

type StepConfig = {
  key: OfferWorkflowStep;
  title: string;
  description: string;
};

type ApplicationNote = {
  id: string;
  content: string;
  mentions?: string[];
  createdAt?: string;
  author?: {
    id: string;
    name?: string;
    email?: string;
  };
};

const STEP_CONFIGS: StepConfig[] = [
  { key: "negotiation", title: "1. Negotiation", description: "Negotiate compensation over email." },
  { key: "amount", title: "2. Compensation Package", description: "Define the full compensation breakdown." },
  { key: "offer_letter", title: "3. Offer Letter", description: "Send offer letter email." },
  { key: "document_request", title: "4. Document Request", description: "Request documents over email." },
  { key: "documents", title: "5. Documents", description: "Upload candidate documents." },
];

const STEP_LABEL: Record<OfferWorkflowStep, string> = {
  negotiation: "Negotiation",
  amount: "Compensation",
  offer_letter: "Offer Letter",
  document_request: "Doc Request",
  documents: "Documents",
  hired: "Hired",
};

const emptyWorkflow: OfferWorkflowState = {
  currentStep: "negotiation",
  negotiationComplete: false,
  amount: "",
  compensation: {},
  offerLetterSent: false,
  documentRequestSent: false,
  stepNotes: {},
};

const isOffer = (app: Application, offerRoundId?: string) => {
  const stage = String(app.stage || "").toLowerCase();
  const status = String(app.status || "").toLowerCase();
  if (offerRoundId && app.roundId === offerRoundId) return true;
  return Boolean(app.shortlisted) || status === "offer" || stage.includes("offer");
};

const isHired = (app: Application, hiredRoundId?: string) => {
  const stage = String(app.stage || "").toLowerCase();
  const status = String(app.status || "").toLowerCase();
  if (hiredRoundId && app.roundId === hiredRoundId) return true;
  return status === "hired" || stage.includes("hired") || stage.includes("accepted");
};

const workflowComplete = (workflow?: OfferWorkflowState, docsCount = 0) =>
  Boolean(
    workflow?.negotiationComplete &&
      workflow?.amount &&
      workflow?.offerLetterSent &&
      workflow?.documentRequestSent &&
      docsCount > 0,
  );

const parseAmountValue = (value?: string) => {
  if (!value) return 0;
  const normalized = value.replace(/,/g, "");
  const match = normalized.match(/(\d+(\.\d+)?)/);
  if (!match) return 0;
  const parsed = Number(match[1]);
  return Number.isFinite(parsed) ? parsed : 0;
};

export function JobOffersTab({
  jobId,
  jobTitle,
  applications,
  rounds,
  onRefresh,
  mode = "offers",
  showJobColumn = false,
  readOnly = false,
}: JobOffersTabProps) {
  const { toast } = useToast();
  const [workflowByApp, setWorkflowByApp] = useState<Record<string, OfferWorkflowResponse>>({});
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [isLoadingWorkflows, setIsLoadingWorkflows] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [noteDrafts, setNoteDrafts] = useState<Partial<Record<OfferWorkflowStep, string>>>({});
  const [stepNotesByStep, setStepNotesByStep] = useState<Partial<Record<OfferWorkflowStep, ApplicationNote[]>>>({});

  const [threadsLoading, setThreadsLoading] = useState(false);
  const [threads, setThreads] = useState<GmailThread[]>([]);
  const [selectedThread, setSelectedThread] = useState<GmailThread | null>(null);
  const [replyDrawerOpen, setReplyDrawerOpen] = useState(false);
  const [composerMode, setComposerMode] = useState<"new" | "reply">("new");
  const [replyingToMessage, setReplyingToMessage] = useState<GmailMessage | null>(null);
  const [isMarkingHired, setIsMarkingHired] = useState(false);
  const [isUploadingDocs, setIsUploadingDocs] = useState(false);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [openingAppId, setOpeningAppId] = useState<string | null>(null);
  const [savingNoteStep, setSavingNoteStep] = useState<OfferWorkflowStep | null>(null);
  const [selectedProfileApp, setSelectedProfileApp] = useState<Application | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [loadingProfileId, setLoadingProfileId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [hubPickerOpen, setHubPickerOpen] = useState(false);
  const [isAttachingFromHub, setIsAttachingFromHub] = useState(false);
  const [advancedCompOpen, setAdvancedCompOpen] = useState(false);

  const offerRound = useMemo(() => rounds.find((r) => r.fixedKey === "OFFER") || null, [rounds]);
  const hiredRound = useMemo(() => rounds.find((r) => r.fixedKey === "HIRED") || null, [rounds]);
  const isReadOnly = mode === "hired" || readOnly;

  const rows = useMemo(() => {
    const offerRows = applications.filter((app) => app?.id && isOffer(app, offerRound?.id) && !isHired(app, hiredRound?.id));
    const hiredRows = applications.filter((app) => app?.id && isHired(app, hiredRound?.id));
    return mode === "hired" ? hiredRows : offerRows;
  }, [applications, offerRound?.id, hiredRound?.id, mode]);

  const sortedRows = useMemo(() => {
    return [...rows].sort((a, b) => {
      const timeA = new Date((a.updatedAt || a.appliedDate || 0) as any).getTime();
      const timeB = new Date((b.updatedAt || b.appliedDate || 0) as any).getTime();
      return timeB - timeA;
    });
  }, [rows]);

  const totalItems = sortedRows.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const pagedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedRows.slice(start, start + pageSize);
  }, [sortedRows, currentPage, pageSize]);

  const selectedWorkflowResponse = selectedApp ? workflowByApp[selectedApp.id] : undefined;
  const selectedWorkflow = selectedWorkflowResponse?.workflow || emptyWorkflow;
  const selectedDocs = selectedWorkflowResponse?.documents || [];

  const summary = useMemo(() => {
    const completed = sortedRows.filter((app) => {
      const data = workflowByApp[app.id];
      return workflowComplete(data?.workflow, data?.documents?.length || 0);
    }).length;
    const amountReady = sortedRows.filter((app) => Boolean(workflowByApp[app.id]?.workflow?.amount)).length;
    const docsUploaded = sortedRows.filter((app) => (workflowByApp[app.id]?.documents?.length || 0) > 0).length;
    const avgAmountRaw = sortedRows.length
      ? Math.round(
          sortedRows.reduce((acc, app) => acc + parseAmountValue(workflowByApp[app.id]?.workflow?.amount), 0) /
            Math.max(1, sortedRows.length),
        )
      : 0;

    return {
      total: sortedRows.length,
      completed,
      amountReady,
      docsUploaded,
      avgAmountRaw,
    };
  }, [sortedRows, workflowByApp]);

  const stepBars = useMemo(() => {
    if (mode === "hired") return { data: [], max: 1 };
    const offerStepKeys: OfferWorkflowStep[] = ["negotiation", "amount", "offer_letter", "document_request", "documents"];
    const data = offerStepKeys.map((key) => ({
      key,
      value: sortedRows.filter((app) => (workflowByApp[app.id]?.workflow?.currentStep || "negotiation") === key).length,
    }));
    const max = Math.max(1, ...data.map((item) => item.value));
    return { data, max };
  }, [mode, sortedRows, workflowByApp]);

  const hiredAmountBands = useMemo(() => {
    if (mode !== "hired") return { data: [], max: 1 };
    const buckets = [
      { key: "< 5L", min: 0, max: 499999 },
      { key: "5L - 10L", min: 500000, max: 999999 },
      { key: "10L - 20L", min: 1000000, max: 1999999 },
      { key: "20L+", min: 2000000, max: Number.MAX_SAFE_INTEGER },
    ];
    const data = buckets.map((bucket) => {
      const count = sortedRows.filter((app) => {
        const amount = parseAmountValue(workflowByApp[app.id]?.workflow?.amount);
        return amount >= bucket.min && amount <= bucket.max;
      }).length;
      return { key: bucket.key, value: count };
    });
    const max = Math.max(1, ...data.map((item) => item.value));
    return { data, max };
  }, [mode, sortedRows, workflowByApp]);

  const trendPoints = useMemo(() => {
    const recent = sortedRows.slice(0, 18).reverse();
    if (recent.length === 0) return [] as Array<{ x: number; y: number }>;
    let running = 0;
    const width = 260;
    const height = 72;
    const step = recent.length === 1 ? width : width / (recent.length - 1);

    return recent.map((app, idx) => {
      const data = workflowByApp[app.id];
      if (workflowComplete(data?.workflow, data?.documents?.length || 0)) running += 1;
      const ratio = (running / (idx + 1)) * 100;
      return {
        x: Number((idx * step).toFixed(2)),
        y: Number((height - (ratio / 100) * (height - 8) - 4).toFixed(2)),
      };
    });
  }, [sortedRows, workflowByApp]);

  const trendPath = useMemo(() => {
    if (!trendPoints.length) return "";
    return trendPoints.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  }, [trendPoints]);

  const loadWorkflow = async (applicationId: string) => {
    const res = await offerService.getOfferWorkflow(applicationId);
    if (!res.success || !res.data) throw new Error(res.error || "Failed to load workflow");
    setWorkflowByApp((prev) => ({ ...prev, [applicationId]: res.data! }));
    return res.data;
  };

  const loadStepNotes = async (applicationId: string) => {
    try {
      const res = await apiClient.get<{ notes: ApplicationNote[] }>(`/api/applications/${applicationId}/notes`);
      const notes = res.success && res.data?.notes ? res.data.notes : [];
      const byStep: Partial<Record<OfferWorkflowStep, ApplicationNote[]>> = {};
      STEP_CONFIGS.forEach((step) => {
        byStep[step.key] = notes
          .filter((note) => String(note.content || "").startsWith(`[Offer ${step.key}]`))
          .sort((a, b) => {
            const ta = new Date(a.createdAt || 0).getTime();
            const tb = new Date(b.createdAt || 0).getTime();
            return tb - ta;
          });
      });
      setStepNotesByStep(byStep);
    } catch {
      setStepNotesByStep({});
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [mode, rows.length]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (pagedRows.length === 0) return;
      setIsLoadingWorkflows(true);
      try {
        await Promise.all(
          pagedRows.map(async (app) => {
            if (!workflowByApp[app.id]) {
              try {
                const data = await offerService.getOfferWorkflow(app.id);
                if (!cancelled && data.success && data.data) {
                  setWorkflowByApp((prev) => ({ ...prev, [app.id]: data.data! }));
                }
              } catch {
                // ignore per-row failures
              }
            }
          }),
        );
      } finally {
        if (!cancelled) setIsLoadingWorkflows(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [pagedRows]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (selectedApp) {
      const workflow = workflowByApp[selectedApp.id]?.workflow;
      if (workflow?.stepNotes) {
        setNoteDrafts(workflow.stepNotes);
      } else {
        setNoteDrafts({});
      }
    }
  }, [selectedApp, workflowByApp]);

  const saveWorkflow = async (applicationId: string, payload: Parameters<typeof offerService.updateOfferWorkflow>[1]) => {
    setIsSaving(true);
    try {
      const res = await offerService.updateOfferWorkflow(applicationId, payload);
      if (!res.success || !res.data) throw new Error(res.error || "Failed to save workflow");
      setWorkflowByApp((prev) => ({ ...prev, [applicationId]: res.data! }));
      return res.data;
    } finally {
      setIsSaving(false);
    }
  };

  const loadThreads = async (applicationId: string) => {
    setThreadsLoading(true);
    try {
      const data = await gmailThreadService.getEmailThreads(applicationId);
      const next = data.gmailThreads || [];
      setThreads(next);
      setSelectedThread(next[0] || null);
    } catch {
      setThreads([]);
      setSelectedThread(null);
    } finally {
      setThreadsLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedApp?.id) {
      setThreads([]);
      setSelectedThread(null);
      setDrawerLoading(false);
      setOpeningAppId(null);
      return;
    }
    let cancelled = false;
    const applicationId = selectedApp.id;
    const run = async () => {
      setDrawerLoading(true);
      try {
        await Promise.allSettled([
          loadWorkflow(applicationId),
          loadStepNotes(applicationId),
          loadThreads(applicationId),
        ]);
      } finally {
        if (!cancelled) {
          setDrawerLoading(false);
          setOpeningAppId((prev) => (prev === applicationId ? null : prev));
        }
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [selectedApp?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const onStepToggle = async (
    key: "negotiationComplete" | "offerLetterSent" | "documentRequestSent",
    value: boolean,
  ) => {
    if (!selectedApp?.id) return;
    try {
      await saveWorkflow(selectedApp.id, { [key]: value } as any);
    } catch (error) {
      toast({
        title: "Failed to save step",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    }
  };

  const onAmountSave = async () => {
    if (!selectedApp?.id) return;
    try {
      await saveWorkflow(selectedApp.id, {
        amount: selectedWorkflow.amount,
        compensation: selectedWorkflow.compensation,
      });
      toast({ title: "Compensation saved" });
    } catch (error) {
      toast({
        title: "Failed to save compensation",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    }
  };

  const onStepNoteSave = async (step: OfferWorkflowStep) => {
    if (!selectedApp?.id) return;
    const content = (noteDrafts[step] || "").trim();
    if (!content) return;
    const mentions = Array.from(new Set(Array.from(content.matchAll(/@([a-zA-Z0-9._-]+)/g)).map((m) => m[1])));
    setSavingNoteStep(step);
    try {
      const prefixed = `[Offer ${step}] ${content}`;
      const noteRes = await apiClient.post<{ note: ApplicationNote }>(`/api/applications/${selectedApp.id}/notes`, {
        content: prefixed,
        mentions,
      });
      if (!noteRes.success) throw new Error(noteRes.error || "Failed to add note");
      setNoteDrafts((prev) => ({ ...prev, [step]: "" }));
      await loadStepNotes(selectedApp.id);
      await saveWorkflow(selectedApp.id, {});
      toast({ title: "Step note added" });
    } catch (error) {
      toast({
        title: "Failed to save note",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setSavingNoteStep(null);
    }
  };

  const onUploadDocs = async (fileList: FileList | null) => {
    if (!selectedApp?.id || !fileList?.length) return;
    setIsUploadingDocs(true);
    try {
      const files = Array.from(fileList);
      const res = await offerService.uploadOfferWorkflowDocuments(selectedApp.id, files, {
        category: "OTHER",
        note: noteDrafts.documents,
      });
      if (!res.success || !res.data) throw new Error(res.error || "Failed to upload documents");
      setWorkflowByApp((prev) => ({ ...prev, [selectedApp.id]: res.data! }));
      toast({ title: "Documents uploaded" });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsUploadingDocs(false);
    }
  };

  const onAttachFromHub = async (hubDocs: CompanyDocument[]) => {
    if (!selectedApp?.id || !hubDocs.length) return;
    setIsAttachingFromHub(true);
    try {
      const apiBase = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
      // Fetch each file from its URL and convert to File objects
      const files: File[] = [];
      for (const doc of hubDocs) {
        const url = doc.fileUrl.startsWith('http') ? doc.fileUrl : `${apiBase}${doc.fileUrl}`;
        const response = await fetch(url, { credentials: 'include' });
        const blob = await response.blob();
        files.push(new File([blob], doc.fileName || doc.name, { type: doc.mimeType || blob.type }));
      }
      const res = await offerService.uploadOfferWorkflowDocuments(selectedApp.id, files, {
        category: "OTHER",
        note: `Attached from Document Hub: ${hubDocs.map((d) => d.name).join(', ')}`,
      });
      if (!res.success || !res.data) throw new Error(res.error || "Failed to attach documents");
      setWorkflowByApp((prev) => ({ ...prev, [selectedApp.id]: res.data! }));
      toast({ title: `${hubDocs.length} document${hubDocs.length > 1 ? 's' : ''} attached from hub` });
    } catch (error) {
      toast({
        title: "Failed to attach",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsAttachingFromHub(false);
    }
  };

  const onMarkHired = async () => {
    if (!selectedApp?.id) return;
    if (!workflowComplete(selectedWorkflow, selectedDocs.length)) {
      toast({
        title: "Complete all steps",
        description: "Finish negotiation, amount, emails and document upload first.",
        variant: "destructive",
      });
      return;
    }
    setIsMarkingHired(true);
    try {
      await saveWorkflow(selectedApp.id, { markHired: true });
      toast({ title: "Candidate marked as hired" });
      onRefresh?.();
      setSelectedApp(null);
    } catch (error) {
      toast({
        title: "Failed to mark hired",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsMarkingHired(false);
    }
  };

  const handleCompose = () => {
    setComposerMode("new");
    setReplyingToMessage(null);
    setReplyDrawerOpen(true);
  };

  const handleReply = (message: GmailMessage) => {
    setComposerMode("reply");
    setReplyingToMessage(message);
    setReplyDrawerOpen(true);
  };

  const handleOpenProfile = async (application: Application) => {
    setLoadingProfileId(application.id);
    try {
      const response = await applicationService.getApplicationForAdmin(application.id);
      if (response.success && response.data?.application) {
        const full = response.data.application as any;
        const candidate = full.candidate || full.candidateProfile || {};
        const fullName = [
          candidate.firstName || candidate.first_name,
          candidate.lastName || candidate.last_name,
        ]
          .filter(Boolean)
          .join(" ")
          .trim();
        const mappedApplication: Application = {
          ...application,
          candidateName: fullName || candidate.name || candidate.fullName || application.candidateName,
          candidateEmail: candidate.email || application.candidateEmail,
          candidatePhone: candidate.phone || application.candidatePhone,
          candidatePhoto: candidate.photo || application.candidatePhoto,
          activities: full.activities || application.activities || [],
          notes: full.notes || application.notes || [],
          interviews: full.interviews || application.interviews || [],
          scorecards: full.scorecards || (application as any).scorecards,
          teamReviews: full.teamReviews || application.teamReviews || [],
          evaluations: full.evaluations || application.evaluations || [],
          aiAnalysis: full.aiAnalysis || application.aiAnalysis,
          jobId: application.jobId || full.job?.id || full.jobId || "",
          jobTitle: application.jobTitle || full.job?.title || full.jobTitle || "",
        } as any;
        setSelectedProfileApp(mappedApplication);
      } else {
        setSelectedProfileApp(application);
      }
    } catch {
      setSelectedProfileApp(application);
      toast({
        title: "Using basic profile",
        description: "Could not load full candidate details.",
        variant: "destructive",
      });
    } finally {
      setProfileOpen(true);
      setLoadingProfileId(null);
    }
  };

  return (
    <div className="space-y-3">
      <Card className="shadow-none border-border/80">
        <CardHeader className="px-3 py-2.5 border-b">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-sm font-semibold">
              {mode === "hired" ? "Hired Candidates" : "Offer Candidates"}
            </CardTitle>
            <div className="flex items-center gap-1.5">
              <Badge variant="outline" className="text-[10px]">{summary.total} total</Badge>
              <Badge variant="outline" className="text-[10px]">Done {summary.completed}</Badge>
              <Badge variant="outline" className="text-[10px]">Amt {summary.amountReady}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="border-b px-3 py-3 grid grid-cols-1 lg:grid-cols-2 gap-3">
            <div className="rounded-md border bg-muted/20 p-3">
              <div className="flex items-center gap-1.5 mb-2">
                <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Completion Trend</p>
              </div>
              <svg viewBox="0 0 260 76" className="w-full h-[76px]">
                <path d="M0 74 H260" stroke="#E5E7EB" strokeWidth="1" fill="none" />
                {trendPath ? (
                  <>
                    <path d={trendPath} stroke="#0F766E" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    {trendPoints.map((point, idx) => (
                      <circle key={`offer-trend-${idx}`} cx={point.x} cy={point.y} r={2.1} fill="#0F766E" />
                    ))}
                  </>
                ) : (
                  <text x="6" y="42" className="fill-muted-foreground" style={{ fontSize: 11 }}>No workflow data</text>
                )}
              </svg>
            </div>
            <div className="rounded-md border bg-muted/20 p-3">
              <div className="flex items-center gap-1.5 mb-2">
                <BarChart3 className="h-3.5 w-3.5 text-muted-foreground" />
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {mode === "hired" ? "Amount Distribution" : "Step Distribution"}
                </p>
              </div>
              <svg viewBox="0 0 260 84" className="w-full h-[84px]">
                {(mode === "hired" ? hiredAmountBands.data : stepBars.data).map((item, idx) => {
                  const gap = 12;
                  const barWidth = 34;
                  const x = idx * (barWidth + gap) + 6;
                  const h = Math.max(4, (item.value / (mode === "hired" ? hiredAmountBands.max : stepBars.max)) * 50);
                  const y = 56 - h;
                  return (
                    <g key={item.key}>
                      <rect x={x} y={y} width={barWidth} height={h} rx={4} fill="#0EA5A4" opacity={0.85} />
                      <text x={x + barWidth / 2} y={69} textAnchor="middle" fill="#6B7280" fontSize="9">
                        {mode === "hired"
                          ? item.key
                          : item.key === "document_request"
                            ? "Doc Req"
                            : item.key.replace("_", " ")}
                      </text>
                      <text x={x + barWidth / 2} y={y - 3} textAnchor="middle" fill="#0F172A" fontSize="10">
                        {item.value}
                      </text>
                    </g>
                  );
                })}
              </svg>
              {summary.avgAmountRaw > 0 && (
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Avg amount: {summary.avgAmountRaw.toLocaleString()}
                </p>
              )}
            </div>
          </div>
          <ScrollArea className="h-[calc(100vh-285px)] min-h-[520px]">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="h-8 text-[11px]">Candidate</TableHead>
                  {showJobColumn && <TableHead className="h-8 text-[11px]">Job</TableHead>}
                  <TableHead className="h-8 text-[11px]">Amount</TableHead>
                  <TableHead className="h-8 text-[11px]">Current Step</TableHead>
                  <TableHead className="h-8 text-[11px] text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingWorkflows && pagedRows.length > 0 ? (
                  Array.from({ length: Math.min(6, pagedRows.length) }).map((_, idx) => (
                    <TableRow key={`workflow-skeleton-${idx}`}>
                      <TableCell>
                        <div className="space-y-1.5 py-1">
                          <Skeleton className="h-3.5 w-36" />
                          <Skeleton className="h-3 w-44" />
                        </div>
                      </TableCell>
                      {showJobColumn && (
                        <TableCell>
                          <Skeleton className="h-4 w-28" />
                        </TableCell>
                      )}
                      <TableCell>
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-20 rounded-full" />
                      </TableCell>
                      <TableCell className="text-right">
                        <Skeleton className="h-7 w-14 ml-auto" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : sortedRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={showJobColumn ? 5 : 4} className="h-24 text-center text-sm text-muted-foreground">
                      {mode === "hired" ? "No hired candidates yet." : "No candidates in offer stage yet."}
                    </TableCell>
                  </TableRow>
                ) : (
                  pagedRows.map((app) => {
                    const wf = workflowByApp[app.id]?.workflow;
                    return (
                      <TableRow key={app.id} className="border-b border-border/60">
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-xs font-medium truncate">{app.candidateName || "Unknown Candidate"}</span>
                            <span className="text-[11px] text-muted-foreground truncate">{app.candidateEmail || "No email"}</span>
                          </div>
                        </TableCell>
                        {showJobColumn && (
                          <TableCell>
                            <p className="text-[11px] font-medium truncate max-w-[220px]">{app.jobTitle || "Untitled Job"}</p>
                          </TableCell>
                        )}
                        <TableCell className="text-xs">{wf?.amount || "-"}</TableCell>
                        <TableCell>
                          {mode === "hired" ? (
                            <Badge className="h-5 px-2 text-[10px] bg-emerald-600 hover:bg-emerald-600">Hired</Badge>
                          ) : (
                            <Badge variant="outline" className="h-5 px-2 text-[10px]">
                              {STEP_LABEL[wf?.currentStep || "negotiation"]}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="inline-flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 px-2 text-[10px]"
                              onClick={() => handleOpenProfile(app)}
                              disabled={loadingProfileId === app.id}
                            >
                              {loadingProfileId === app.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Eye className="h-3.5 w-3.5 mr-1" />}
                              View Profile
                            </Button>
                            <Button
                              size="sm"
                              className="h-7 text-xs"
                              onClick={() => {
                                setOpeningAppId(app.id);
                                setSelectedApp(app);
                              }}
                              disabled={openingAppId === app.id}
                            >
                              {openingAppId === app.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Open"}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </ScrollArea>
          <div className="border-t px-3 py-2">
            <TablePagination
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={pageSize}
              totalItems={totalItems}
              onPageChange={setCurrentPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setCurrentPage(1);
              }}
            />
          </div>
        </CardContent>
      </Card>

      <Sheet open={Boolean(selectedApp)} onOpenChange={(open) => !open && setSelectedApp(null)}>
        <SheetContent side="right" className="w-full sm:max-w-[980px] p-0 bg-gradient-to-b from-background to-muted/10">
          <SheetHeader className="px-4 py-3 border-b bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
            <SheetTitle className="text-sm flex items-center gap-2">
              <span>{selectedApp?.candidateName || "Candidate"}</span>
              <Badge
                variant="outline"
                className={cn(
                  "h-5 px-2 text-[10px]",
                  mode === "hired"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-sky-50 text-sky-700 border-sky-200",
                )}
              >
                {mode === "hired" ? "Hired Details" : "Offer Workflow"}
              </Badge>
            </SheetTitle>
          </SheetHeader>

          {selectedApp && drawerLoading ? (
            <div className="h-[calc(100vh-56px)] p-3 space-y-3">
              <div className="rounded-md border p-3 space-y-2">
                <Skeleton className="h-4 w-44" />
                <Skeleton className="h-3 w-72" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
              <div className="rounded-md border p-3 space-y-2">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-3 w-64" />
                <Skeleton className="h-20 w-full" />
              </div>
              <div className="rounded-md border p-3 space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-60" />
                <Skeleton className="h-20 w-full" />
              </div>
            </div>
          ) : selectedApp ? (
            <Tabs defaultValue="flow" className="h-[calc(100vh-56px)] flex flex-col">
              <div className="px-3 py-2 border-b bg-background/75">
                <TabsList className="h-8 bg-muted/50 border">
                  <TabsTrigger value="flow" className="text-xs">Flow</TabsTrigger>
                  {!isReadOnly && <TabsTrigger value="emails" className="text-xs">Emails</TabsTrigger>}
                  {isReadOnly && <TabsTrigger value="documents" className="text-xs">Documents</TabsTrigger>}
                </TabsList>
              </div>

              <TabsContent value="flow" className="mt-0 flex-1 overflow-auto p-3 space-y-2.5">
                {STEP_CONFIGS.map((step) => (
                  <div
                    key={step.key}
                    className={cn(
                      "rounded-md border p-2.5 space-y-2 bg-gradient-to-b from-background to-muted/10 shadow-[0_1px_0_0_rgba(15,23,42,0.03)]",
                      !isReadOnly && selectedWorkflow.currentStep !== step.key ? "opacity-60" : "",
                      !isReadOnly && selectedWorkflow.currentStep === step.key
                        ? "border-primary/35 ring-1 ring-primary/20"
                        : "border-border/80",
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs font-semibold flex items-center gap-1.5">
                          {step.title}
                          {!isReadOnly && selectedWorkflow.currentStep === step.key && (
                            <Badge variant="outline" className="h-4 px-1.5 text-[9px] bg-primary/10 text-primary border-primary/25">
                              Active
                            </Badge>
                          )}
                        </p>
                        <p className="text-[11px] text-muted-foreground">{step.description}</p>
                      </div>
                      {!isReadOnly && step.key === "negotiation" && (
                        <Checkbox
                          checked={selectedWorkflow.negotiationComplete}
                          onCheckedChange={(v) => onStepToggle("negotiationComplete", Boolean(v))}
                          disabled={
                            isReadOnly ||
                            isSaving ||
                            drawerLoading ||
                            savingNoteStep !== null ||
                            selectedWorkflow.currentStep !== step.key
                          }
                        />
                      )}
                      {!isReadOnly && step.key === "offer_letter" && (
                        <Checkbox
                          checked={selectedWorkflow.offerLetterSent}
                          onCheckedChange={(v) => onStepToggle("offerLetterSent", Boolean(v))}
                          disabled={
                            isReadOnly ||
                            isSaving ||
                            drawerLoading ||
                            savingNoteStep !== null ||
                            selectedWorkflow.currentStep !== step.key ||
                            !selectedWorkflow.amount
                          }
                        />
                      )}
                      {!isReadOnly && step.key === "document_request" && (
                        <Checkbox
                          checked={selectedWorkflow.documentRequestSent}
                          onCheckedChange={(v) => onStepToggle("documentRequestSent", Boolean(v))}
                          disabled={
                            isReadOnly ||
                            isSaving ||
                            drawerLoading ||
                            savingNoteStep !== null ||
                            selectedWorkflow.currentStep !== step.key ||
                            !selectedWorkflow.offerLetterSent
                          }
                        />
                      )}
                    </div>

                    {step.key === "amount" && (
                      <>
                        {isReadOnly ? (
                          <div className="space-y-2">
                            <div className="rounded-md border border-emerald-200/70 bg-emerald-50/50 px-2.5 py-2">
                              <p className="text-[11px] text-muted-foreground">Base Salary (CTC)</p>
                              <p className="text-xs font-semibold text-emerald-800">{selectedWorkflow.amount || "-"}</p>
                            </div>
                            {selectedWorkflow.compensation && Object.entries(selectedWorkflow.compensation).some(([, v]) => v) && (
                              <div className="rounded-md border border-border/70 bg-muted/20 px-2.5 py-2 space-y-1">
                                <p className="text-[11px] font-medium text-muted-foreground mb-1">Breakdown</p>
                                {([
                                  ["variablePay", "Variable Pay / Bonus"],
                                  ["signingBonus", "Signing Bonus"],
                                  ["retentionBonus", "Retention Bonus"],
                                  ["esops", "ESOPs / Stock Options"],
                                  ["rsus", "RSUs"],
                                  ["ppf", "PPF Contribution"],
                                  ["gratuity", "Gratuity"],
                                  ["healthInsurance", "Health Insurance"],
                                  ["hra", "HRA"],
                                  ["travelAllowance", "Travel Allowance"],
                                  ["mealAllowance", "Meal Allowance"],
                                  ["learningBudget", "L&D Budget"],
                                  ["otherBenefits", "Other Benefits"],
                                ] as [keyof CompensationBreakdown, string][]).map(([key, label]) => {
                                  const val = selectedWorkflow.compensation?.[key];
                                  if (!val) return null;
                                  return (
                                    <div key={key} className="flex justify-between text-[11px]">
                                      <span className="text-muted-foreground">{label}</span>
                                      <span className="font-medium">{val}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {/* Base Salary - Primary field */}
                            <div className="flex items-center gap-2">
                              <Input
                                value={selectedWorkflow.amount}
                                onChange={(e) =>
                                  setWorkflowByApp((prev) => ({
                                    ...prev,
                                    [selectedApp.id]: {
                                      ...(prev[selectedApp.id] || {
                                        offerId: "",
                                        applicationId: selectedApp.id,
                                        workflow: emptyWorkflow,
                                        documents: [],
                                      }),
                                      workflow: { ...(prev[selectedApp.id]?.workflow || emptyWorkflow), amount: e.target.value },
                                    },
                                  }))
                                }
                                placeholder="e.g. 18,00,000 INR / year"
                                className="h-8 text-xs"
                                disabled={
                                  isReadOnly ||
                                  drawerLoading ||
                                  isSaving ||
                                  savingNoteStep !== null ||
                                  selectedWorkflow.currentStep !== step.key
                                }
                              />
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 text-xs"
                                onClick={onAmountSave}
                                disabled={
                                  isSaving ||
                                  drawerLoading ||
                                  savingNoteStep !== null ||
                                  selectedWorkflow.currentStep !== step.key
                                }
                              >
                                <Save className="h-3.5 w-3.5 mr-1.5" />
                                Save
                              </Button>
                            </div>
                            <p className="text-[10px] text-muted-foreground -mt-1">Base Salary / CTC — this is the primary offer amount</p>

                            {/* Advanced Compensation Toggle */}
                            <button
                              type="button"
                              className="flex items-center gap-1.5 text-[11px] font-medium text-primary hover:text-primary/80 transition-colors"
                              onClick={() => setAdvancedCompOpen(!advancedCompOpen)}
                            >
                              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${advancedCompOpen ? 'rotate-180' : ''}`} />
                              Advanced Compensation Breakdown
                            </button>

                            {advancedCompOpen && (
                              <div className="space-y-2 pl-1 border-l-2 border-primary/20 ml-1">
                                {([
                                  ["variablePay", "Variable Pay / Bonus", "e.g. 2,00,000 / year"],
                                  ["signingBonus", "Signing Bonus", "e.g. 50,000 one-time"],
                                  ["retentionBonus", "Retention Bonus", "e.g. 1,00,000 after 1 year"],
                                  ["esops", "ESOPs / Stock Options", "e.g. 1000 shares, 4-yr vest"],
                                  ["rsus", "RSUs", "e.g. 500 units, quarterly vest"],
                                  ["ppf", "PPF Contribution", "e.g. 1,50,000 / year"],
                                  ["gratuity", "Gratuity", "e.g. as per statutory"],
                                  ["healthInsurance", "Health Insurance", "e.g. 5L family floater"],
                                  ["hra", "HRA", "e.g. 40% of basic"],
                                  ["travelAllowance", "Travel / Commute Allowance", "e.g. 5,000 / month"],
                                  ["mealAllowance", "Meal / Food Allowance", "e.g. Sodexo 2,200 / month"],
                                  ["learningBudget", "Learning & Development Budget", "e.g. 50,000 / year"],
                                  ["otherBenefits", "Other Benefits", "e.g. WFH setup, gym, etc."],
                                ] as [keyof CompensationBreakdown, string, string][]).map(([key, label, placeholder]) => (
                                  <div key={key} className="space-y-0.5 pl-2">
                                    <label className="text-[10px] font-medium text-muted-foreground">{label}</label>
                                    <Input
                                      value={selectedWorkflow.compensation?.[key] || ""}
                                      onChange={(e) => {
                                        const comp = { ...(selectedWorkflow.compensation || {}), [key]: e.target.value };
                                        setWorkflowByApp((prev) => ({
                                          ...prev,
                                          [selectedApp.id]: {
                                            ...(prev[selectedApp.id] || {
                                              offerId: "",
                                              applicationId: selectedApp.id,
                                              workflow: emptyWorkflow,
                                              documents: [],
                                            }),
                                            workflow: {
                                              ...(prev[selectedApp.id]?.workflow || emptyWorkflow),
                                              compensation: comp,
                                            },
                                          },
                                        }));
                                      }}
                                      placeholder={placeholder}
                                      className="h-7 text-xs"
                                      disabled={
                                        isReadOnly ||
                                        drawerLoading ||
                                        isSaving ||
                                        savingNoteStep !== null ||
                                        selectedWorkflow.currentStep !== step.key
                                      }
                                    />
                                  </div>
                                ))}

                                <div className="pt-1 pl-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 text-[11px]"
                                    onClick={onAmountSave}
                                    disabled={
                                      isSaving ||
                                      drawerLoading ||
                                      savingNoteStep !== null ||
                                      selectedWorkflow.currentStep !== step.key
                                    }
                                  >
                                    <Save className="h-3 w-3 mr-1" />
                                    Save All Compensation
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    )}

                    {(step.key === "negotiation" || step.key === "offer_letter" || step.key === "document_request") && !isReadOnly && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs"
                        onClick={handleCompose}
                        disabled={
                          isSaving ||
                          drawerLoading ||
                          savingNoteStep !== null ||
                          selectedWorkflow.currentStep !== step.key
                        }
                      >
                        <Mail className="h-3.5 w-3.5 mr-1.5" />
                        Send Email
                      </Button>
                    )}

                    {step.key === "documents" && !isReadOnly && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <label className="inline-flex">
                            <input
                              type="file"
                              className="hidden"
                              multiple
                              onChange={(e) => onUploadDocs(e.target.files)}
                              disabled={
                                !selectedWorkflow.documentRequestSent ||
                                isUploadingDocs ||
                                isSaving ||
                                drawerLoading ||
                                savingNoteStep !== null ||
                                selectedWorkflow.currentStep !== step.key
                              }
                            />
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs"
                              asChild
                              disabled={
                                !selectedWorkflow.documentRequestSent ||
                                isUploadingDocs ||
                                isSaving ||
                                drawerLoading ||
                                savingNoteStep !== null ||
                                selectedWorkflow.currentStep !== step.key
                              }
                            >
                              <span>
                                {isUploadingDocs ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Upload className="h-3.5 w-3.5 mr-1.5" />}
                                {isUploadingDocs ? "Uploading..." : "Upload Documents"}
                              </span>
                            </Button>
                          </label>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs"
                            onClick={() => setHubPickerOpen(true)}
                            disabled={
                              !selectedWorkflow.documentRequestSent ||
                              isAttachingFromHub ||
                              isSaving ||
                              drawerLoading ||
                              savingNoteStep !== null ||
                              selectedWorkflow.currentStep !== step.key
                            }
                          >
                            {isAttachingFromHub ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <FolderOpen className="h-3.5 w-3.5 mr-1.5" />}
                            {isAttachingFromHub ? "Attaching..." : "Get from Document Hub"}
                          </Button>
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                          <span className="font-medium text-foreground">{selectedDocs.length}</span> uploaded
                        </p>
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <Label className="text-[11px]">Step Notes</Label>
                      {(stepNotesByStep[step.key] || []).length > 0 ? (
                        <div className="space-y-1.5 max-h-44 overflow-y-auto rounded-md border border-border/70 bg-muted/30 p-2">
                          {(stepNotesByStep[step.key] || []).map((note) => {
                            const createdAt = note.createdAt ? new Date(note.createdAt) : null;
                            return (
                              <div key={note.id} className="rounded border border-border/60 bg-background/95 px-2 py-1.5 shadow-[0_1px_0_0_rgba(15,23,42,0.03)]">
                                <div className="flex items-center justify-between gap-2">
                                  <p className="text-[11px] font-medium">
                                    {note.author?.name || note.author?.email || "Unknown"}
                                  </p>
                                  <p className="text-[10px] text-muted-foreground">
                                    {createdAt && !isNaN(createdAt.getTime())
                                      ? formatDistanceToNow(createdAt, { addSuffix: true })
                                      : "Recently"}
                                  </p>
                                </div>
                                <p className="text-[11px] text-foreground whitespace-pre-wrap mt-1">
                                  {String(note.content || "").replace(`[Offer ${step.key}]`, "").trim()}
                                </p>
                                {Array.isArray(note.mentions) && note.mentions.length > 0 && (
                                  <div className="mt-1 flex flex-wrap gap-1">
                                    {note.mentions.map((m) => (
                                      <Badge key={m} variant="secondary" className="h-4 px-1.5 text-[9px] bg-sky-100 text-sky-700 border-sky-200">
                                        @{m}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-[11px] text-muted-foreground">No notes yet.</p>
                      )}

                      {!isReadOnly && (
                        <>
                          <Textarea
                            value={noteDrafts[step.key] || ""}
                            onChange={(e) => setNoteDrafts((prev) => ({ ...prev, [step.key]: e.target.value }))}
                            placeholder="Add note for this step. Use @mention"
                            className="text-xs min-h-[68px]"
                            disabled={
                              isReadOnly ||
                              isSaving ||
                              drawerLoading ||
                              savingNoteStep !== null ||
                              selectedWorkflow.currentStep !== step.key
                            }
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs"
                            onClick={() => onStepNoteSave(step.key)}
                            disabled={
                              isSaving ||
                              drawerLoading ||
                              savingNoteStep !== null ||
                              selectedWorkflow.currentStep !== step.key
                            }
                          >
                            {savingNoteStep === step.key ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : null}
                            {savingNoteStep === step.key ? "Saving..." : "Save Note"}
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}

                {!isReadOnly && (
                  <div className="flex justify-end pt-1">
                    <Button
                      size="sm"
                      className="h-8 text-xs"
                      onClick={onMarkHired}
                      disabled={isMarkingHired || isSaving || drawerLoading || !workflowComplete(selectedWorkflow, selectedDocs.length)}
                    >
                      {isMarkingHired ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />}
                      Mark Hired
                    </Button>
                  </div>
                )}
              </TabsContent>

              {!isReadOnly && (
                <TabsContent value="emails" className="mt-0 flex-1 min-h-0 bg-background/70">
                  {threadsLoading ? (
                    <div className="h-full flex items-center justify-center text-sm text-muted-foreground">Loading emails...</div>
                  ) : threads.length === 0 ? (
                    <div className="h-full flex items-center justify-center p-4">
                      <div className="text-center space-y-2">
                        <p className="text-sm text-muted-foreground">No email threads yet.</p>
                        <Button size="sm" className="h-8 text-xs" onClick={handleCompose}>Compose Email</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-[36%_64%] h-full">
                      <ScrollArea className="border-r bg-muted/20">
                        <div className="p-2 space-y-1">
                          {threads.map((thread) => (
                            <button
                              key={thread.threadId}
                              className={cn(
                                "w-full text-left rounded-md border px-2 py-1.5 transition-colors",
                                selectedThread?.threadId === thread.threadId
                                  ? "bg-primary/10 border-primary/40 shadow-[inset_0_0_0_1px_rgba(14,165,233,0.08)]"
                                  : "bg-background/80 hover:bg-muted/40 border-border/70",
                              )}
                              onClick={() => setSelectedThread(thread)}
                            >
                              <p className="text-xs font-medium truncate">{thread.subject || "(No subject)"}</p>
                              <p className="text-[11px] text-muted-foreground truncate">{thread.snippet || "No preview"}</p>
                            </button>
                          ))}
                        </div>
                      </ScrollArea>
                      <div className="h-full bg-background/80">
                        {selectedThread ? (
                          <EmailThreadDetailView
                            thread={selectedThread}
                            onBack={() => setSelectedThread(null)}
                            onReply={handleReply}
                            onCompose={handleCompose}
                            showReplyButton
                          />
                        ) : (
                          <div className="h-full flex items-center justify-center text-sm text-muted-foreground">Select a thread</div>
                        )}
                      </div>
                    </div>
                  )}
                </TabsContent>
              )}

              {isReadOnly && (
                <TabsContent value="documents" className="mt-0 flex-1 overflow-auto p-3 space-y-2.5 bg-background/70">
                  <label className="inline-flex">
                    <input
                      type="file"
                      className="hidden"
                      multiple
                      onChange={(e) => onUploadDocs(e.target.files)}
                      disabled={isUploadingDocs || isSaving || drawerLoading || savingNoteStep !== null}
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs"
                      asChild
                      disabled={isUploadingDocs || isSaving || drawerLoading || savingNoteStep !== null}
                    >
                      <span>
                        {isUploadingDocs ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Upload className="h-3.5 w-3.5 mr-1.5" />}
                        {isUploadingDocs ? "Uploading..." : "Upload More"}
                      </span>
                    </Button>
                  </label>

                  {selectedDocs.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No documents uploaded.</p>
                  ) : (
                    <div className="space-y-1.5">
                      {selectedDocs.map((doc: any, idx) => (
                        <div
                          key={`${doc.id || doc.file_name || idx}`}
                          className="rounded-md border border-border/70 bg-background/90 px-2.5 py-2 flex items-center justify-between"
                        >
                          <p className="text-xs font-medium truncate">{doc.file_name || doc.fileName || doc.name}</p>
                          <a
                            href={doc.file_url || doc.fileUrl || "#"}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[11px] text-primary hover:underline"
                          >
                            View
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              )}
            </Tabs>
          ) : null}
        </SheetContent>
      </Sheet>

      {selectedApp && (
        <EmailReplyDrawer
          open={replyDrawerOpen}
          mode={composerMode}
          thread={selectedThread}
          replyingToMessage={replyingToMessage}
          applicationId={selectedApp.id}
          candidateName={selectedApp.candidateName || "Candidate"}
          candidateEmail={selectedApp.candidateEmail}
          jobTitle={jobTitle}
          jobId={jobId}
          onClose={() => setReplyDrawerOpen(false)}
          onEmailSent={() => {
            setReplyDrawerOpen(false);
            if (selectedApp.id) loadThreads(selectedApp.id);
          }}
        />
      )}

      {selectedProfileApp && (
        <CandidateAssessmentView
          application={selectedProfileApp}
          open={profileOpen}
          onOpenChange={(open) => {
            setProfileOpen(open);
            if (!open) setSelectedProfileApp(null);
          }}
          jobTitle={selectedProfileApp.jobTitle || jobTitle}
          jobId={selectedProfileApp.jobId || jobId}
          statusUpdateDisabled={isReadOnly}
          statusUpdateDisabledReason={
            isReadOnly ? "Offer management is read-only in this view." : null
          }
          offerActionsDisabledReason={
            isReadOnly ? "Offer management is read-only in this view." : null
          }
        />
      )}

      <DocumentHubPicker
        open={hubPickerOpen}
        onOpenChange={setHubPickerOpen}
        onSelect={onAttachFromHub}
      />
    </div>
  );
}
