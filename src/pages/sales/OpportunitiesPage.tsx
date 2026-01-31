import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/shared/components/ui/button";
import { DataTable } from "@/shared/components/tables/DataTable";
import { Plus, ArrowRight, Building2, Mail, Phone, Globe, Loader2, CheckCircle2, Brain, FileText, Send, Database, Clock } from "lucide-react";
import { salesService, Lead } from "@/shared/services/salesService";
import { useToast } from "@/shared/hooks/use-toast";
import { Column } from "@/shared/components/tables/DataTable";
import { Badge } from "@/shared/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { cn } from "@/shared/lib/utils";
import { Textarea } from "@/shared/components/ui/textarea"; // Added Textarea import
import { leadConversionService } from "@/shared/services/leadConversionService"; // Added leadConversionService import
import { useAuth } from "@/shared/contexts/AuthContext";
import { consultant360Service } from "@/shared/lib/consultant360/consultant360Service";

const BUDGET_OPTIONS = [
  { value: "< $10k", label: "Under $10,000" },
  { value: "$10k - $50k", label: "$10,000 - $50,000" },
  { value: "$50k - $100k", label: "$50,000 - $100,000" },
  { value: "$100k - $250k", label: "$100,000 - $250,000" },
  { value: "$250k+", label: "$250,000+" },
];

const TIMELINE_OPTIONS = [
  { value: "Immediate", label: "Immediate (ASAP)" },
  { value: "1-3 Months", label: "1-3 Months" },
  { value: "3-6 Months", label: "3-6 Months" },
  { value: "6+ Months", label: "6+ Months" },
  { value: "Just Exploring", label: "Just Exploring / No Timeline" },
];

const QUALIFICATION_STEPS = [
  { id: 1, label: "Initiating lead intake workflow", icon: Send },
  { id: 2, label: "Analyzing lead data with AI", icon: Brain },
  { id: 3, label: "Extracting qualification insights", icon: FileText },
  { id: 4, label: "Generating personalized email response", icon: Mail },
  { id: 5, label: "Finalizing and saving to CRM", icon: Database },
];

export default function OpportunitiesPage() {
  const { userType } = useAuth();
  const is360 = userType === "CONSULTANT360";

  const { toast } = useToast();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isQualifying, setIsQualifying] = useState(false);
  const [currentQualificationStep, setCurrentQualificationStep] = useState(0);
  const [qualificationProgress, setQualificationProgress] = useState(0);
  const qualificationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [qualificationData, setQualificationData] = useState<Record<string, unknown> | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [qualificationDialogOpen, setQualificationDialogOpen] = useState(false);
  const [convertDialogOpen, setConvertDialogOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [processing, setProcessing] = useState(false);

  // Forms State
  const [createForm, setCreateForm] = useState({
    companyName: "",
    email: "",
    phone: "",
    website: "",
    country: "United States",
    budget: "",
    timeline: "",
    message: ""
  });

  const [convertForm, setConvertForm] = useState({
    agentNotes: "",
    tempPassword: ""
  });

  const fetchLeads = useCallback(async () => {
    try {
      const response = is360
        ? await consultant360Service.getLeads()
        : await salesService.getLeads();
      if (response.success && response.data) {
        setLeads(response.data.leads || []);
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to fetch leads", variant: "destructive" });
    }
  }, [toast, is360]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleCreateLead = async () => {
    if (!isValidEmail(createForm.email)) {
      toast({ title: "Validation Error", description: "Please enter a valid email address", variant: "destructive" });
      return;
    }

    setProcessing(true);
    setIsQualifying(true);
    setQualificationData(null);
    setCurrentQualificationStep(0);
    setQualificationProgress(0);

    // Start mock progress simulation
    let step = 0;
    const simulateProgress = () => {
      if (step < QUALIFICATION_STEPS.length) {
        setCurrentQualificationStep(step);
        // Increment progress gradually for each step
        let stepProgress = 0;
        const stepInterval = setInterval(() => {
          stepProgress += Math.random() * 15;
          if (stepProgress >= 100) {
            clearInterval(stepInterval);
            step++;
            if (step < QUALIFICATION_STEPS.length) {
              simulateProgress();
            }
          }
          const totalProgress = ((step * 100) + Math.min(stepProgress, 100)) / QUALIFICATION_STEPS.length;
          setQualificationProgress(totalProgress);
        }, 150 + Math.random() * 200);

        qualificationTimerRef.current = stepInterval;
      }
    };
    simulateProgress();

    try {
      const response = is360
        ? await consultant360Service.createLead(createForm)
        : await salesService.createLead(createForm);

      // When response comes, quickly finish the steps
      if (qualificationTimerRef.current) clearInterval(qualificationTimerRef.current);

      setQualificationProgress(100);
      setCurrentQualificationStep(QUALIFICATION_STEPS.length - 1);

      if (response.success) {
        toast({ title: "Success", description: "Lead created and qualified" });

        if (response.data?.qualification) {
          setQualificationData(response.data.qualification);
          // Wait a tiny bit so user sees the 100% completion
          setTimeout(() => {
            setIsQualifying(false);
            setQualificationDialogOpen(true);
          }, 600);
        } else {
          setIsQualifying(false);
        }

        setCreateDialogOpen(false);
        setCreateForm({ companyName: "", email: "", phone: "", website: "", country: "United States", budget: "", timeline: "", message: "" });
        fetchLeads();
      } else {
        setIsQualifying(false);
        toast({ title: "Error", description: response.error, variant: "destructive" });
      }
    } catch (error) {
      setIsQualifying(false);
      toast({ title: "Error", description: "Failed to create lead", variant: "destructive" });
    } finally {
      setProcessing(false);
    }
  };

  const handleRequestConversion = async () => {
    if (!selectedLead) return;

    if (!convertForm.tempPassword) {
      toast({
        title: "Error",
        description: "Temporary password is required for client login.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (is360) {
        await consultant360Service.submitConversionRequest(selectedLead.id, {
          agentNotes: convertForm.agentNotes,
          tempPassword: convertForm.tempPassword
        });
      } else {
        await leadConversionService.submitRequest(selectedLead.id, {
          agentNotes: convertForm.agentNotes,
          tempPassword: convertForm.tempPassword
        });
      }
      toast({
        title: "Success",
        description: "Conversion request submitted! Waiting for admin approval."
      });
      setConvertDialogOpen(false);
      setConvertForm({ agentNotes: "", tempPassword: "" });
      fetchLeads();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit conversion request",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  const openConvertDialog = (lead: Lead) => {
    setSelectedLead(lead);
    setConvertForm({ agentNotes: "", tempPassword: "" }); // Reset form for new request
    setConvertDialogOpen(true);
  };

  const columns: Column<Lead>[] = [
    {
      key: "company_name",
      label: "Company",
      render: (lead) => (
        <div className="flex flex-col">
          <span className="font-medium">{lead.company_name}</span>
          {lead.website && (
            <a href={lead.website} target="_blank" rel="noreferrer" className="text-xs text-muted-foreground hover:underline flex items-center gap-1">
              <Globe className="h-3 w-3" /> {lead.website}
            </a>
          )}
        </div>
      ),
    },
    {
      key: "email",
      label: "Contact",
      render: (lead) => (
        <div className="flex flex-col text-sm">
          <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {lead.email}</span>
          {lead.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {lead.phone}</span>}
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (lead) => {
        const latestRequest = lead.conversion_requests?.[0];

        if (latestRequest?.status === 'PENDING') {
          return (
            <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100">
              Pending Approval
            </Badge>
          );
        }

        if (latestRequest?.status === 'DECLINED' && lead.status !== 'CONVERTED') {
          return <Badge variant="destructive">Declined</Badge>;
        }

        const status = lead.status;
        return (
          <Badge variant={status === 'CONVERTED' ? 'default' : status === 'NEW' ? 'default' : 'secondary'} className={status === 'CONVERTED' ? 'bg-green-600 hover:bg-green-700' : ''}>
            {status}
          </Badge>
        );
      },
    },
    {
      key: "created_at",
      label: "Created",
      render: (lead) => new Date(lead.created_at).toLocaleDateString(),
    },
    {
      key: "actions",
      label: "Actions",
      render: (lead) => {
        if (lead.status === 'CONVERTED') return null;

        const latestRequest = lead.conversion_requests?.[0];

        if (latestRequest?.status === 'PENDING') {
          return (
            <Button size="sm" variant="secondary" disabled className="opacity-70 cursor-not-allowed">
              <Clock className="mr-2 h-4 w-4" /> Pending
            </Button>
          );
        }

        const isDeclined = latestRequest?.status === 'DECLINED';

        return (
          <Button size="sm" variant={isDeclined ? "destructive" : "outline"} onClick={() => openConvertDialog(lead)}>
            {isDeclined ? 'Retry' : 'Convert'} <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        );
      },
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Leads Management</h1>
          <p className="text-muted-foreground">Track and convert your leads</p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Lead
        </Button>
      </div>

      <div className="bg-card rounded-lg border shadow-sm p-1">
        <DataTable
          columns={columns}
          data={leads}
          searchable={true}
          searchKeys={["company_name"]}
        />
      </div>

      {/* Create Lead Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Lead</DialogTitle>
            <DialogDescription>Enter the company details to create a new lead.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Company Name</Label>
              <Input
                value={createForm.companyName}
                onChange={(e) => setCreateForm({ ...createForm, companyName: e.target.value })}
                placeholder="Acme Inc."
              />
            </div>
            <div className="space-y-2">
              <Label>Email (Admin)</Label>
              <Input
                value={createForm.email}
                onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                placeholder="admin@acme.com"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  value={createForm.phone}
                  onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                  placeholder="+1..."
                />
              </div>
              <div className="space-y-2">
                <Label>Country</Label>
                <Input
                  value={createForm.country}
                  onChange={(e) => setCreateForm({ ...createForm, country: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Website</Label>
              <Input
                value={createForm.website}
                onChange={(e) => setCreateForm({ ...createForm, website: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Budget</Label>
                <Select
                  value={createForm.budget}
                  onValueChange={(value) => setCreateForm({ ...createForm, budget: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select budget" />
                  </SelectTrigger>
                  <SelectContent>
                    {BUDGET_OPTIONS.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Timeline</Label>
                <Select
                  value={createForm.timeline}
                  onValueChange={(value) => setCreateForm({ ...createForm, timeline: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select timeline" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIMELINE_OPTIONS.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Message / Notes</Label>
              <Input
                value={createForm.message}
                onChange={(e) => setCreateForm({ ...createForm, message: e.target.value })}
                placeholder="Brief description of the lead's needs..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)} disabled={processing}>Cancel</Button>
            <Button onClick={handleCreateLead} disabled={processing}>
              {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Lead
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Qualifying Progress Dialog (Apple-inspired design) */}
      <Dialog open={isQualifying} onOpenChange={() => { }}>
        <DialogContent className="sm:max-w-[440px] border-none bg-background/60 backdrop-blur-2xl shadow-2xl p-0 overflow-hidden rounded-[2.5rem]">
          <DialogTitle className="sr-only">Qualifying Lead</DialogTitle>
          <DialogDescription className="sr-only">Lead qualification progress</DialogDescription>
          <div className="relative p-10 flex flex-col items-center text-center">
            {/* Minimal Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/10 rounded-full blur-[80px] -z-10" />

            {/* Animated AI Icon Container */}
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse" />
              <div className="relative h-24 w-24 rounded-full bg-gradient-to-b from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center shadow-inner">
                <Brain className="h-12 w-12 text-primary animate-[pulse_3s_ease-in-out_infinite]" />
              </div>
            </div>

            <div className="space-y-3 mb-10">
              <h2 className="text-2xl font-semibold tracking-tight text-foreground/90">
                Qualifying Lead
              </h2>
              <p className="text-sm text-muted-foreground/80 max-w-[280px] leading-relaxed">
                Our intelligence engine is analyzing company profile and market data...
              </p>
            </div>

            {/* Steps Sequential Display */}
            <div className="w-full space-y-5 px-4">
              <div className="relative h-1 w-full bg-muted/30 rounded-full overflow-hidden mb-8">
                <div
                  className="absolute top-0 left-0 h-full bg-primary transition-all duration-700 ease-out shadow-[0_0_10px_rgba(var(--primary),0.5)]"
                  style={{ width: `${qualificationProgress}%` }}
                />
              </div>

              <div className="space-y-4">
                {QUALIFICATION_STEPS.map((step, index) => {
                  const isActive = index === currentQualificationStep;
                  const isCompleted = index < currentQualificationStep;

                  if (!isActive && !isCompleted) return null;

                  return (
                    <div
                      key={step.id}
                      className={cn(
                        "flex items-center justify-center gap-3 transition-all duration-500",
                        isActive ? "opacity-100 scale-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none absolute w-full",
                        isCompleted && "hidden"
                      )}
                    >
                      <div className="flex items-center gap-2 text-sm font-medium text-primary/80 bg-primary/5 px-4 py-2 rounded-full border border-primary/10">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        {step.label}
                      </div>
                    </div>
                  );
                })}

                {currentQualificationStep === QUALIFICATION_STEPS.length - 1 && qualificationProgress === 100 && (
                  <div className="flex items-center justify-center gap-2 text-sm font-medium text-success bg-success/5 px-4 py-2 rounded-full border border-success/10 animate-in fade-in zoom-in duration-500">
                    <CheckCircle2 className="h-3 w-3" />
                    Analysis Complete
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Qualification Result Dialog */}
      <Dialog open={qualificationDialogOpen} onOpenChange={setQualificationDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Lead Qualification Result</DialogTitle>
            <DialogDescription>
              AI analysis results from n8n workflow for {String(qualificationData?.company || 'the lead')}.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {qualificationData ? (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" />
                    {qualificationData.company as string}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Status</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 capitalize">
                          {qualificationData.status as string || 'Qualified'}
                        </Badge>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Score</span>
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "text-lg font-bold",
                          Number(qualificationData.score) > 70 ? "text-green-600" :
                            Number(qualificationData.score) > 30 ? "text-yellow-600" : "text-red-600"
                        )}>
                          {String(qualificationData.score || 0)}/100
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Category</span>
                      <p className={cn(
                        "text-sm font-medium capitalize",
                        String(qualificationData.category).toLowerCase() === 'hot' ? "text-red-600 font-bold" :
                          String(qualificationData.category).toLowerCase() === 'warm' ? "text-orange-500" : "text-blue-500"
                      )}>
                        {String(qualificationData.category || 'N/A')}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Source</span>
                      <p className="text-sm font-medium">{qualificationData.source as string}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">AI Analysis / Notes</span>
                    <div className="p-3 bg-muted rounded-md text-sm border">
                      {qualificationData.message as string || 'No additional details provided by AI workflow.'}
                    </div>
                  </div>

                  {/* Add more fields if n8n returns them */}
                  {Object.entries(qualificationData).map(([key, value]) => {
                    if (['company', 'status', 'source', 'message', 'email', 'submittedAt', 'score', 'category'].includes(key)) return null;
                    if (typeof value !== 'string' && typeof value !== 'number') return null;
                    return (
                      <div key={key} className="space-y-1">
                        <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">{key}</span>
                        <p className="text-sm font-medium">{String(value)}</p>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No qualification data available.
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setQualificationDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Convert Lead Dialog */}
      <Dialog open={convertDialogOpen} onOpenChange={setConvertDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Request Lead Conversion</DialogTitle>
            <DialogDescription>
              Submit a conversion request for {selectedLead?.company_name}. Your regional admin will review and approve this request.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Company Name</Label>
              <Input value={selectedLead?.company_name || ""} disabled />
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={selectedLead?.email || ""} disabled />
            </div>

            <div className="space-y-2">
              <Label>Country</Label>
              <Input value={selectedLead?.country || ""} disabled />
            </div>

            <div className="space-y-2">
              <Label>Temporary Password <span className="text-red-500">*</span></Label>
              <Input
                type="password"
                value={convertForm.tempPassword}
                onChange={(e) => setConvertForm({ ...convertForm, tempPassword: e.target.value })}
                placeholder="Set temporary password"
              />
              <p className="text-[0.8rem] text-muted-foreground">
                Required for the client to log in immediately.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Notes (Optional)</Label>
              <Textarea
                value={convertForm.agentNotes}
                onChange={(e) => setConvertForm({ ...convertForm, agentNotes: e.target.value })}
                placeholder="Add any notes for the admin reviewer..."
                rows={3}
              />
            </div>

            <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                <strong>Note:</strong> This request will be sent to your regional admin for approval.
                Once approved, the lead will be automatically converted to a company.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConvertDialogOpen(false)} disabled={processing}>Cancel</Button>
            <Button onClick={handleRequestConversion} disabled={processing}>
              {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
