/**
 * Offer Execution Drawer
 * Select candidates and send offers with per-candidate editing
 */

import { useState, useEffect } from "react";

import { FormDrawer } from "@/shared/components/ui/form-drawer";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";

import { Checkbox } from "@/shared/components/ui/checkbox";
import { Separator } from "@/shared/components/ui/separator";
import { toast } from "sonner";
import { Send, ChevronDown, ChevronUp, Briefcase, MapPin, DollarSign, Calendar, Mail } from "lucide-react";

import { offerService } from "@/shared/lib/api/offerService";
import { Application } from "@/shared/types/application";
import { Job } from "@/shared/types/job";
import { jobService } from "@/shared/lib/api/jobService";
import { mapBackendJobToFrontend } from "@/shared/lib/jobDataMapper";

interface OfferExecutionDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobId: string;
  roundId: string;
  applications: Application[];
  jobTitle?: string; // Optional job title prop as fallback
  defaultConfig?: {
    templateId?: string;
    salary?: number;
    salaryCurrency?: string;
    salaryPeriod?: string;
    workLocation?: string;
    workArrangement?: string;
    benefits?: string[];
    vacationDays?: number;
    expiryDays?: number;
    customMessage?: string;
  };
  onSuccess?: () => void;
}

interface OfferDraft {
  applicationId: string;
  candidateName: string;
  candidateEmail: string;
  jobTitle: string;
  salary: number;
  salaryCurrency: string;
  salaryPeriod: string;
  workLocation: string;
  workArrangement: string;
  benefits: string[];
  vacationDays?: number;
  probationPeriod?: number;
  bonusStructure?: string;
  equityOptions?: string;
  offerType: string;
  customMessage?: string;
  expiryDate: string;
  startDate: string;
}

// Helper function to map job work arrangement to offer work arrangement
function mapWorkArrangement(workArrangement?: string): "on-site" | "remote" | "hybrid" {
  switch (workArrangement?.toLowerCase()) {
    case "remote":
      return "remote";
    case "hybrid":
      return "hybrid";
    default:
      return "on-site";
  }
}

// Helper function to map job employment type to offer type
function mapEmploymentTypeToOfferType(employmentType?: string): "full-time" | "part-time" | "contract" | "intern" {
  switch (employmentType?.toLowerCase()) {
    case "part-time":
    case "part_time":
      return "part-time";
    case "contract":
      return "contract";
    case "intern":
    case "internship":
      return "intern";
    default:
      return "full-time";
  }
}

export function OfferExecutionDrawer({
  open,
  onOpenChange,
  jobId,
  roundId: _roundId,


  applications,
  jobTitle: propJobTitle,
  defaultConfig,
  onSuccess,
}: OfferExecutionDrawerProps) {
  const [sending, setSending] = useState(false);
  const [sendingSingle, setSendingSingle] = useState<Record<string, boolean>>({});
  const [job, setJob] = useState<Job | null>(null);
  const [isLoadingJob, setIsLoadingJob] = useState(false);
  const [selectedApplications, setSelectedApplications] = useState<Set<string>>(new Set());
  const [expandedOffers, setExpandedOffers] = useState<Set<string>>(new Set());
  const [offerDrafts, setOfferDrafts] = useState<Record<string, OfferDraft>>({});

  // Fetch job data when drawer opens
  useEffect(() => {
    const fetchJob = async () => {
      if (open && jobId) {
        setIsLoadingJob(true);
        try {
          const response = await jobService.getJobById(jobId);
          if (response.success && response.data) {
            const mappedJob = mapBackendJobToFrontend(response.data);
            console.log('[OfferExecutionDrawer] Job loaded:', mappedJob.title);
            setJob(mappedJob);
          } else {
            console.error('[OfferExecutionDrawer] Failed to fetch job:', response.error);
          }
        } catch (error) {
          console.error('[OfferExecutionDrawer] Failed to fetch job:', error);
        } finally {
          setIsLoadingJob(false);
        }
      }
    };

    fetchJob();

    // Reset job when drawer closes
    if (!open) {
      setJob(null);
    }
  }, [open, jobId]);

  // Initialize offer drafts when drawer opens or job/config changes
  // Wait for job to load if we're still loading it
  useEffect(() => {
    if (open && applications.length > 0 && !isLoadingJob) {
      // Initialize all applications as selected
      setSelectedApplications(new Set(applications.map(app => app.id)));

      // Initialize offer drafts with default config and job data
      const drafts: Record<string, OfferDraft> = {};
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + (defaultConfig?.expiryDays || 7));
      const startDate = new Date();
      startDate.setDate(startDate.getDate() + 30); // Default 30 days from now

      // Calculate default salary - use config, then job max, then job min, else 0
      const defaultSalary = defaultConfig?.salary || job?.salaryMax || job?.salaryMin || 0;
      const defaultSalaryPeriod = defaultConfig?.salaryPeriod || job?.salaryPeriod || "annual";
      const defaultWorkArrangement = defaultConfig?.workArrangement
        || (job ? mapWorkArrangement(job.workArrangement) : "remote");
      const defaultWorkLocation = defaultConfig?.workLocation || job?.location || "";
      const defaultOfferType = job ? mapEmploymentTypeToOfferType(job.employmentType) : "full-time";

      // Get job title - prefer job.title if available, then prop, then app.jobTitle
      const jobTitle = job?.title || propJobTitle || applications[0]?.jobTitle || "Unknown Job";
      console.log('[OfferExecutionDrawer] Setting jobTitle:', {
        fromJob: job?.title,
        fromProp: propJobTitle,
        fromApp: applications[0]?.jobTitle,
        final: jobTitle
      });

      applications.forEach(app => {
        drafts[app.id] = {
          applicationId: app.id,
          candidateName: app.candidateName,
          candidateEmail: app.candidateEmail || "",
          jobTitle: jobTitle, // Use the job title we determined above
          salary: defaultSalary,
          salaryCurrency: defaultConfig?.salaryCurrency || job?.salaryCurrency || "USD",
          salaryPeriod: defaultSalaryPeriod,
          workLocation: defaultWorkLocation,
          workArrangement: defaultWorkArrangement,
          benefits: defaultConfig?.benefits || [],
          vacationDays: defaultConfig?.vacationDays,
          probationPeriod: undefined,
          bonusStructure: undefined,
          equityOptions: undefined,
          offerType: defaultOfferType,
          customMessage: defaultConfig?.customMessage,
          expiryDate: expiryDate.toISOString().split('T')[0],
          startDate: startDate.toISOString().split('T')[0],
        };
      });
      setOfferDrafts(drafts);
      console.log('[OfferExecutionDrawer] Drafts initialized with jobTitle:', jobTitle);
    }
  }, [open, applications, defaultConfig, job, isLoadingJob]);

  const toggleSelection = (applicationId: string) => {
    const newSelected = new Set(selectedApplications);
    if (newSelected.has(applicationId)) {
      newSelected.delete(applicationId);
    } else {
      newSelected.add(applicationId);
    }
    setSelectedApplications(newSelected);
  };

  const toggleExpanded = (applicationId: string) => {
    const newExpanded = new Set(expandedOffers);
    if (newExpanded.has(applicationId)) {
      newExpanded.delete(applicationId);
    } else {
      newExpanded.add(applicationId);
    }
    setExpandedOffers(newExpanded);
  };

  const updateOfferDraft = (applicationId: string, updates: Partial<OfferDraft>) => {
    setOfferDrafts(prev => ({
      ...prev,
      [applicationId]: {
        ...prev[applicationId],
        ...updates,
      },
    }));
  };

  const handleSendOffer = async (applicationId: string, draft: OfferDraft, isSingle: boolean = false) => {
    if (isSingle) {
      setSendingSingle(prev => ({ ...prev, [applicationId]: true }));
    }

    try {
      console.log('Creating offer for:', draft.candidateName, 'Application:', applicationId);

      // Validate required fields
      if (!draft.salary || draft.salary <= 0) {
        toast.error(`Invalid salary for ${draft.candidateName}`, {
          description: 'Please set a valid salary amount'
        });
        return false;
      }

      if (!draft.workLocation) {
        toast.error(`Missing work location for ${draft.candidateName}`, {
          description: 'Please set a work location'
        });
        return false;
      }

      if (!draft.startDate) {
        toast.error(`Missing start date for ${draft.candidateName}`, {
          description: 'Please set a start date'
        });
        return false;
      }

      // Create offer
      const createResponse = await offerService.createOffer(applicationId, {
        applicationId,
        offerType: draft.offerType,
        salary: draft.salary,
        salaryCurrency: draft.salaryCurrency,
        salaryPeriod: draft.salaryPeriod,
        startDate: draft.startDate,
        workLocation: draft.workLocation,
        workArrangement: draft.workArrangement as any,
        benefits: draft.benefits,
        vacationDays: draft.vacationDays,
        probationPeriod: draft.probationPeriod,
        bonusStructure: draft.bonusStructure,
        equityOptions: draft.equityOptions,
        customMessage: draft.customMessage,
        expiryDate: draft.expiryDate,
        templateId: defaultConfig?.templateId,
      });



      if (!createResponse.success) {
        console.error('Failed to create offer:', createResponse.error);
        toast.error(`Failed to create offer for ${draft.candidateName}`, {
          description: createResponse.error || 'Please try again'
        });
        return false;
      }

      console.log('Offer created successfully:', createResponse.data?.id);

      // Send offer
      const sendResponse = await offerService.sendOffer(createResponse.data!.id);
      if (!sendResponse.success) {
        console.error('Failed to send offer:', sendResponse.error);
        toast.error(`Failed to send offer to ${draft.candidateName}`, {
          description: sendResponse.error || 'Please try again'
        });
        return false;
      }

      console.log('Offer sent successfully to:', draft.candidateEmail);
      toast.success(`Offer sent to ${draft.candidateName}`);

      if (isSingle) {
        onSuccess?.();
      }

      return true;
    } catch (error) {
      console.error('Error sending offer:', error);
      toast.error(`Failed to send offer to ${draft.candidateName}`, {
        description: error instanceof Error ? error.message : 'Please try again'
      });
      return false;
    } finally {
      if (isSingle) {
        setSendingSingle(prev => ({ ...prev, [applicationId]: false }));
      }
    }
  };

  const handleSendOffers = async () => {
    if (selectedApplications.size === 0) {
      toast.error("Please select at least one candidate");
      return;
    }

    setSending(true);
    const errors: string[] = [];
    let successCount = 0;

    try {
      for (const applicationId of selectedApplications) {
        const draft = offerDrafts[applicationId];
        if (!draft) {
          errors.push(`${applicationId}: No draft found`);
          continue;
        }

        const success = await handleSendOffer(applicationId, draft, false);
        if (success) {
          successCount++;
        } else {
          errors.push(draft.candidateName);
        }
      }

      if (successCount > 0) {
        toast.success(`Successfully sent ${successCount} offer(s)`);
        if (errors.length > 0) {
          toast.error(`${errors.length} offer(s) failed: ${errors.join(', ')}`);
        }
        onSuccess?.();
        onOpenChange(false);
      } else {
        toast.error("Failed to send all offers", {
          description: `Failed for: ${errors.join(', ')}`,
        });
      }
    } catch (error) {
      console.error('Failed to send offers:', error);
      toast.error("Failed to send offers", {
        description: error instanceof Error ? error.message : 'Please try again'
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <FormDrawer
      open={open}
      onOpenChange={onOpenChange}
      title="Send Offers"
      description={isLoadingJob ? "Loading job details..." : `Review and customize offers for ${applications.length} candidate(s)`}
    >
      <div className="space-y-3 py-4 max-h-[calc(100vh-200px)] overflow-y-auto">
        {/* Footer buttons moved inside FormDrawer children */}
        <div className="flex justify-between items-center mb-6">
          <div className="text-sm text-muted-foreground">
            {selectedApplications.size} of {applications.length} selected
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendOffers} disabled={sending || selectedApplications.size === 0}>
              <Send className="h-4 w-4 mr-2" />
              {sending ? `Sending ${selectedApplications.size} offer(s)...` : `Send ${selectedApplications.size} Offer(s)`}
            </Button>
          </div>
        </div>

        {applications.map((app) => {
          const draft = offerDrafts[app.id];
          const isSelected = selectedApplications.has(app.id);
          const isExpanded = expandedOffers.has(app.id);

          if (!draft) return null;

          return (
            <Card key={app.id} className={isSelected ? "border-primary" : ""}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleSelection(app.id)}
                    />
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-sm truncate">{app.candidateName}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Briefcase className="h-3 w-3 text-muted-foreground shrink-0" />
                        <p className="text-xs text-muted-foreground truncate">
                          {draft?.jobTitle || job?.title || propJobTitle || app.jobTitle || "Unknown Job"}
                        </p>
                      </div>
                      {draft?.candidateEmail && (
                        <div className="flex items-center gap-2 mt-0.5">
                          <Mail className="h-3 w-3 text-muted-foreground shrink-0" />
                          <p className="text-xs text-muted-foreground truncate">{draft.candidateEmail}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={async (e) => {
                        e.stopPropagation();
                        const draft = offerDrafts[app.id];
                        if (draft) {
                          await handleSendOffer(app.id, draft, true);
                        }
                      }}
                      disabled={sending || sendingSingle[app.id]}
                      title="Send offer to this candidate"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleExpanded(app.id)}
                      title={isExpanded ? "Collapse" : "Expand"}
                    >
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              {isExpanded && (
                <CardContent className="space-y-4 pt-0">
                  <Separator />

                  {/* Offer Type */}
                  <div className="space-y-2">
                    <Label>Employment Type</Label>
                    <Select
                      value={draft.offerType}
                      onValueChange={(value) => updateOfferDraft(app.id, { offerType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full-time">Full-Time</SelectItem>
                        <SelectItem value="part-time">Part-Time</SelectItem>
                        <SelectItem value="contract">Contract</SelectItem>
                        <SelectItem value="intern">Intern</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Salary Section */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <Label className="text-base font-semibold">Compensation</Label>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Salary Amount</Label>
                        <Input
                          type="number"
                          placeholder="100000"
                          value={draft.salary || ""}
                          onChange={(e) => updateOfferDraft(app.id, { salary: parseFloat(e.target.value) || 0 })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Currency</Label>
                        <Select
                          value={draft.salaryCurrency}
                          onValueChange={(value) => updateOfferDraft(app.id, { salaryCurrency: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="USD">USD</SelectItem>
                            <SelectItem value="EUR">EUR</SelectItem>
                            <SelectItem value="GBP">GBP</SelectItem>
                            <SelectItem value="CAD">CAD</SelectItem>
                            <SelectItem value="AUD">AUD</SelectItem>
                            <SelectItem value="INR">INR</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Period</Label>
                        <Select
                          value={draft.salaryPeriod}
                          onValueChange={(value) => updateOfferDraft(app.id, { salaryPeriod: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="annual">Annual</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="hourly">Hourly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Work Details Section */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <Label className="text-base font-semibold">Work Details</Label>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Work Location</Label>
                        <Input
                          placeholder="e.g., San Francisco, CA"
                          value={draft.workLocation}
                          onChange={(e) => updateOfferDraft(app.id, { workLocation: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Work Arrangement</Label>
                        <Select
                          value={draft.workArrangement}
                          onValueChange={(value) => updateOfferDraft(app.id, { workArrangement: value })}
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
                    </div>
                  </div>

                  <Separator />

                  {/* Additional Terms Section */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <Label className="text-base font-semibold">Additional Terms</Label>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Start Date</Label>
                        <Input
                          type="date"
                          value={draft.startDate}
                          onChange={(e) => updateOfferDraft(app.id, { startDate: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Offer Expiry Date</Label>
                        <Input
                          type="date"
                          value={draft.expiryDate}
                          onChange={(e) => updateOfferDraft(app.id, { expiryDate: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Vacation Days</Label>
                        <Input
                          type="number"
                          placeholder="20"
                          value={draft.vacationDays || ""}
                          onChange={(e) => updateOfferDraft(app.id, { vacationDays: parseInt(e.target.value) || undefined })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Probation Period (months)</Label>
                        <Input
                          type="number"
                          placeholder="3"
                          value={draft.probationPeriod || ""}
                          onChange={(e) => updateOfferDraft(app.id, { probationPeriod: parseInt(e.target.value) || undefined })}
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Benefits & Bonuses */}
                  <div className="space-y-3">
                    <Label className="text-base font-semibold">Benefits & Compensation</Label>
                    <div className="space-y-2">
                      <Label>Benefits (comma-separated)</Label>
                      <Input
                        placeholder="Health Insurance, 401k, Dental, etc."
                        value={draft.benefits.join(", ")}
                        onChange={(e) => updateOfferDraft(app.id, {
                          benefits: e.target.value.split(",").map(b => b.trim()).filter(Boolean)
                        })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Bonus Structure (Optional)</Label>
                      <Textarea
                        placeholder="Annual performance bonus up to 15% of base salary..."
                        value={draft.bonusStructure || ""}
                        onChange={(e) => updateOfferDraft(app.id, { bonusStructure: e.target.value })}
                        rows={2}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Equity Options (Optional)</Label>
                      <Textarea
                        placeholder="Stock options, RSUs, etc."
                        value={draft.equityOptions || ""}
                        onChange={(e) => updateOfferDraft(app.id, { equityOptions: e.target.value })}
                        rows={2}
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Custom Message */}
                  <div className="space-y-2">
                    <Label>Custom Message (Optional)</Label>
                    <Textarea
                      placeholder="Personal message to the candidate..."
                      value={draft.customMessage || ""}
                      onChange={(e) => updateOfferDraft(app.id, { customMessage: e.target.value })}
                      rows={3}
                    />
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </FormDrawer>
  );
}

