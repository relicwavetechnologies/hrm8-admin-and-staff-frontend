import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Job, JobFormData } from "@/shared/types/job";
import { jobFormSchema } from "@/shared/lib/validations/jobValidation";
import { Form } from "@/shared/components/ui/form";
import { FormDrawer } from "@/shared/components/ui/form-drawer";
import { Button } from "@/shared/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { JobWizardStep1 } from "./JobWizardStep1";
import { JobWizardStep2 } from "./JobWizardStep2";
import { JobWizardStep3 } from "./JobWizardStep3";
import { JobWizardStep4 } from "./JobWizardStep4";
import { JobEditConsultantAssignmentTab } from "./JobEditConsultantAssignmentTab";
import { JobEditScreeningTab } from "./JobEditScreeningTab";
import { JobEditSettingsTab } from "./JobEditSettingsTab";
import { Loader2, Save } from "lucide-react";
import { toast } from "@/shared/hooks/use-toast";
import { jobService } from "@/shared/lib/api/jobService";
import { transformJobFormDataToUpdateRequest } from "@/shared/lib/jobFormTransformers";
import { transformJobToFormData } from "@/shared/lib/jobFormTransformers";
import { mapBackendJobToFrontend } from "@/shared/lib/jobDataMapper";

interface JobEditDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobId: string;
  onSuccess?: () => void;
}

export function JobEditDrawer({ open, onOpenChange, jobId, onSuccess }: JobEditDrawerProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [job, setJob] = useState<Job | null>(null);

  const form = useForm<JobFormData>({
    resolver: zodResolver(jobFormSchema),
    mode: "onChange",
    defaultValues: {
      serviceType: 'self-managed',
      title: "",
      numberOfVacancies: 1,
      department: "",
      location: "",
      employmentType: "full-time",
      experienceLevel: "mid",
      workArrangement: "on-site",
      tags: [],
      description: "",
      requirements: [],
      responsibilities: [],
      salaryCurrency: "USD",
      salaryPeriod: "annual",
      hideSalary: false,
      visibility: "public",
      stealth: false,
      hiringTeam: [],
      applicationForm: {
        id: `form-${Date.now()}`,
        name: "Application Form",
        questions: [],
        includeStandardFields: {
          resume: { included: true, required: true },
          coverLetter: { included: false, required: false },
          portfolio: { included: false, required: false },
          linkedIn: { included: false, required: false },
          website: { included: false, required: false },
        },
      },
      status: "draft",
      jobBoardDistribution: ["HRM8 Job Board"],
      termsAccepted: false,
      videoInterviewingEnabled: false,
    },
  });

  // Load job data when drawer opens
  useEffect(() => {
    if (open && jobId) {
      loadJob();
    }
  }, [open, jobId]);

  const loadJob = async () => {
    setLoading(true);
    try {
      const response = await jobService.getJobById(jobId);
      if (response.success && response.data) {
        // Map backend job to frontend format first, then to form data
        const frontendJob = mapBackendJobToFrontend(response.data);
        setJob(frontendJob);
        const formData = transformJobToFormData(response.data);
        form.reset(formData);
      } else {
        toast({
          title: "Error",
          description: "Failed to load job data",
          variant: "destructive",
        });
        onOpenChange(false);
      }
    } catch (error: any) {
      console.error("Error loading job:", error);
      toast({
        title: "Error",
        description: error?.message || "Failed to load job data",
        variant: "destructive",
      });
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const formData = form.getValues();
      const isValid = await form.trigger();

      if (!isValid) {
        toast({
          title: "Validation Error",
          description: "Please fix the errors in the form before saving",
          variant: "destructive",
        });
        return;
      }

      setSaving(true);

      // Transform form data to API format
      const updateRequest = transformJobFormDataToUpdateRequest(formData);

      // Add screening and consultant assignment fields
      if (formData.assignedConsultantId !== undefined) {
        (updateRequest as any).assignedConsultantId = formData.assignedConsultantId || null;
      }
      if (formData.screeningEnabled !== undefined) {
        (updateRequest as any).screening_enabled = formData.screeningEnabled;
      }
      if (formData.automatedScreeningEnabled !== undefined) {
        (updateRequest as any).automated_screening_enabled = formData.automatedScreeningEnabled;
      }
      if (formData.screeningCriteria !== undefined) {
        (updateRequest as any).screening_criteria = formData.screeningCriteria || null;
      }
      if (formData.preInterviewQuestionnaireEnabled !== undefined) {
        (updateRequest as any).pre_interview_questionnaire_enabled = formData.preInterviewQuestionnaireEnabled;
      }

      const response = await jobService.updateJob(jobId, updateRequest);

      if (response.success) {
        toast({
          title: "Success",
          description: "Job updated successfully",
        });
        onSuccess?.();
        onOpenChange(false);
      } else {
        throw new Error(response.error || "Failed to update job");
      }
    } catch (error: any) {
      console.error("Error updating job:", error);
      toast({
        title: "Error",
        description: error?.message || "Failed to update job",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <FormDrawer
        open={open}
        onOpenChange={onOpenChange}
        title="Edit Job"
        width="2xl"
      >
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </FormDrawer>
    );
  }

  return (
    <FormDrawer
      open={open}
      onOpenChange={onOpenChange}
      title={job ? `Edit: ${job.title}` : "Edit Job"}
      description="Update job details, team assignments, and settings"
      width="2xl"
    >
      <Form {...form}>
        <form className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-7">
              <TabsTrigger value="basic">Basic</TabsTrigger>
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="compensation">Compensation</TabsTrigger>
              <TabsTrigger value="consultant">Consultant</TabsTrigger>
              <TabsTrigger value="application">Application</TabsTrigger>
              <TabsTrigger value="screening">Screening</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-6 mt-6">
              <JobWizardStep1 form={form} />
            </TabsContent>

            <TabsContent value="description" className="space-y-6 mt-6">
              <JobWizardStep2 form={form} />
            </TabsContent>

            <TabsContent value="compensation" className="space-y-6 mt-6">
              <JobWizardStep3 form={form} jobId={jobId} />
            </TabsContent>

            <TabsContent value="consultant" className="space-y-6 mt-6">
              <JobEditConsultantAssignmentTab form={form} job={job} />
            </TabsContent>

            <TabsContent value="application" className="space-y-6 mt-6">
              <JobWizardStep4 form={form} jobId={jobId} />
            </TabsContent>

            <TabsContent value="screening" className="space-y-6 mt-6">
              <JobEditScreeningTab form={form} />
            </TabsContent>

            <TabsContent value="settings" className="space-y-6 mt-6">
              <JobEditSettingsTab form={form} job={job} />
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-4 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </FormDrawer>
  );
}

