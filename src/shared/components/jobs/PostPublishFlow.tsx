import { useState, useEffect } from "react";
import { Job } from "@/shared/types/job";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/components/ui/card";
import { Switch } from "@/shared/components/ui/switch";
import { Label } from "@/shared/components/ui/label";
import { Input } from "@/shared/components/ui/input";
import { Separator } from "@/shared/components/ui/separator";
import { Badge } from "@/shared/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import {
  Bell,
  Share2,
  Copy,
  Mail,
  ExternalLink,
  BookOpen,
  CheckCircle2,
  Users,
  Megaphone,
  X,
  ChevronRight,
  Eye,
} from "lucide-react";
import { useToast } from "@/shared/hooks/use-toast";
import { jobService } from "@/shared/lib/api/jobService";
import { jobTemplateService } from "@/shared/lib/api/jobTemplateService";
import { ExternalPromotionDialog } from "./ExternalPromotionDialog";

interface PostPublishFlowProps {
  job: Job;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaveTemplate?: (templateName: string, templateDescription?: string) => void;
  onComplete?: () => void;
}

type FlowStep = "tools" | "jobtarget" | "view";

export function PostPublishFlow({
  job,
  open,
  onOpenChange,
  onSaveTemplate,
  onComplete,
}: PostPublishFlowProps) {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<FlowStep>("tools");
  const [showJobTargetDialog, setShowJobTargetDialog] = useState(false);

  // Tools step state
  const [alerts, setAlerts] = useState({
    newApplicants: job.alertsEnabled?.newApplicants || false,
    inactivity: job.alertsEnabled?.inactivity || false,
    deadlines: job.alertsEnabled?.deadlines || false,
    inactivityDays: job.alertsEnabled?.inactivityDays || 7,
  });
  const [savingAlerts, setSavingAlerts] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [templateDescription, setTemplateDescription] = useState("");
  const [savingTemplate, setSavingTemplate] = useState(false);

  const shareLink = job.shareLink || `${window.location.origin}/jobs/${job.id}`;
  const referralLink = job.referralLink || `${shareLink}?ref=${job.id.substring(0, 8)}`;

  const handleCopyLink = (link: string, label: string) => {
    navigator.clipboard.writeText(link);
    toast({
      title: "Link Copied",
      description: `${label} copied to clipboard`,
    });
  };

  const handleSaveAlerts = async () => {
    setSavingAlerts(true);
    try {
      await jobService.updateAlerts(job.id, alerts);
      toast({
        title: "Alerts Updated",
        description: "Your alert preferences have been saved",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update alerts. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSavingAlerts(false);
    }
  };

  const handleSaveTemplate = async () => {
    if (!templateName.trim()) {
      toast({
        title: "Template Name Required",
        description: "Please enter a name for your template",
        variant: "destructive",
      });
      return;
    }

    setSavingTemplate(true);
    try {
      if (onSaveTemplate) {
        onSaveTemplate(templateName.trim(), templateDescription.trim() || undefined);
      } else {
        const category = job.department || undefined;
        await jobTemplateService.createFromJob(
          job.id,
          templateName.trim(),
          templateDescription.trim() || undefined,
          category
        );
      }
      toast({
        title: "Template Saved",
        description: "Job configuration saved as template for future use",
      });
      setTemplateName("");
      setTemplateDescription("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save template. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSavingTemplate(false);
    }
  };

  const handleShareEmail = () => {
    const subject = encodeURIComponent(`Check out this job: ${job.title}`);
    const body = encodeURIComponent(
      `I found this job opportunity that might interest you:\n\n${job.title}\n${shareLink}`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const handleShareLinkedIn = () => {
    const url = encodeURIComponent(shareLink);
    const text = encodeURIComponent(`Check out this job: ${job.title}`);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}&text=${text}`, "_blank");
  };

  const handleShareTwitter = () => {
    const url = encodeURIComponent(shareLink);
    const text = encodeURIComponent(`Check out this job: ${job.title}`);
    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, "_blank");
  };

  const handleNextStep = () => {
    if (currentStep === "tools") {
      setCurrentStep("jobtarget");
    }
  };

  const handlePromoteNow = () => {
    setShowJobTargetDialog(true);
  };

  const handleSkipJobTarget = () => {
    setCurrentStep("view");
    toast({
      title: "Skipped",
      description: "You can promote to external boards anytime from the job detail page.",
    });
  };

  const handleComplete = () => {
    onOpenChange(false);
    if (onComplete) {
      onComplete();
    }
  };

  const renderToolsStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-3" />
        <h3 className="text-xl font-semibold mb-2">Your Job is Now Live!</h3>
        <p className="text-sm text-muted-foreground">
          Configure tools and settings for your job posting
        </p>
      </div>

      {/* Enable Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Bell className="h-4 w-4" />
            Enable Alerts
          </CardTitle>
          <CardDescription>
            Get notified about important job activity
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="new-applicants">New Applicants</Label>
              <p className="text-xs text-muted-foreground">
                Get notified when new candidates apply
              </p>
            </div>
            <Switch
              id="new-applicants"
              checked={alerts.newApplicants}
              onCheckedChange={(checked) =>
                setAlerts({ ...alerts, newApplicants: checked })
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="inactivity">Candidate Inactivity</Label>
              <p className="text-xs text-muted-foreground">
                Get notified when candidates are inactive
              </p>
            </div>
            <Switch
              id="inactivity"
              checked={alerts.inactivity}
              onCheckedChange={(checked) =>
                setAlerts({ ...alerts, inactivity: checked })
              }
            />
          </div>

          {alerts.inactivity && (
            <div className="ml-6 space-y-2">
              <Label htmlFor="inactivity-days" className="text-xs">
                Days of inactivity
              </Label>
              <Input
                id="inactivity-days"
                type="number"
                min={1}
                max={30}
                value={alerts.inactivityDays}
                onChange={(e) =>
                  setAlerts({
                    ...alerts,
                    inactivityDays: parseInt(e.target.value) || 7,
                  })
                }
                className="w-24"
              />
            </div>
          )}

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="deadlines">Stage Deadlines</Label>
              <p className="text-xs text-muted-foreground">
                Get notified about upcoming stage deadlines
              </p>
            </div>
            <Switch
              id="deadlines"
              checked={alerts.deadlines}
              onCheckedChange={(checked) =>
                setAlerts({ ...alerts, deadlines: checked })
              }
            />
          </div>

          <Button
            onClick={handleSaveAlerts}
            disabled={savingAlerts}
            className="w-full mt-4"
            size="sm"
          >
            {savingAlerts ? "Saving..." : "Save Alert Preferences"}
          </Button>
        </CardContent>
      </Card>

      {/* Share Job Link */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Share2 className="h-4 w-4" />
            Share Job Link
          </CardTitle>
          <CardDescription>
            Share your job posting with candidates and on social media
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Job Link</Label>
            <div className="flex items-center gap-2">
              <Input value={shareLink} readOnly className="flex-1" />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => handleCopyLink(shareLink, "Job link")}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Referral Link</Label>
            <div className="flex items-center gap-2">
              <Input value={referralLink} readOnly className="flex-1" />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => handleCopyLink(referralLink, "Referral link")}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Use this link to track referrals and reward referrers
            </p>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>Share via</Label>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleShareEmail}
              >
                <Mail className="h-4 w-4 mr-2" />
                Email
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleShareLinkedIn}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                LinkedIn
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleShareTwitter}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Twitter
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save as Template */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <BookOpen className="h-4 w-4" />
            Save as Template
          </CardTitle>
          <CardDescription>
            Save this job configuration as a template for similar future roles
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="template-name">Template Name *</Label>
            <Input
              id="template-name"
              placeholder="e.g., Software Engineer Template"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="template-desc">Description (Optional)</Label>
            <Input
              id="template-desc"
              placeholder="Brief description of when to use this template"
              value={templateDescription}
              onChange={(e) => setTemplateDescription(e.target.value)}
            />
          </div>
          <Button
            onClick={handleSaveTemplate}
            disabled={savingTemplate || !templateName.trim()}
            className="w-full"
            size="sm"
          >
            {savingTemplate ? "Saving..." : "Save Configuration as Template"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  const renderJobTargetStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Megaphone className="h-12 w-12 text-primary mx-auto mb-3" />
        <h3 className="text-xl font-semibold mb-2">Promote Your Job Externally</h3>
        <p className="text-sm text-muted-foreground">
          Reach 50M+ candidates across major job boards through JobTarget
        </p>
      </div>

      <Card className="border-primary/30 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-base">Why Promote to External Job Boards?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>Reach 50M+ candidates across major job boards like Indeed, LinkedIn, and Glassdoor</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>Get 3-5x more qualified applicants on average</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>Reduce time-to-hire with broader candidate exposure</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>Flexible budget options starting from $500</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
        <p>
          You can always promote your job to external boards later from the job detail page.
        </p>
      </div>
    </div>
  );

  const renderViewStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Eye className="h-12 w-12 text-primary mx-auto mb-3" />
        <h3 className="text-xl font-semibold mb-2">View Your Job</h3>
        <p className="text-sm text-muted-foreground">
          See how your job appears to candidates
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">View Your Job Posting</CardTitle>
          <CardDescription>
            See how your job appears to candidates on different platforms
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            type="button"
            variant="default"
            className="w-full justify-start"
            onClick={() => {
              window.open(shareLink, "_blank");
            }}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            View Job on Careers Page
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full justify-start"
            onClick={() => {
              window.open(`/jobs/${job.id}`, "_blank");
            }}
          >
            <Users className="h-4 w-4 mr-2" />
            View Job on HRM8 Internal Board
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  const getStepTitle = () => {
    switch (currentStep) {
      case "tools":
        return "Step 1 of 3: Configure Tools";
      case "jobtarget":
        return "Step 2 of 3: Promote Externally";
      case "view":
        return "Step 3 of 3: View Your Job";
      default:
        return "";
    }
  };

  // Reset to first step when dialog opens
  useEffect(() => {
    if (open && !showJobTargetDialog) {
      setCurrentStep("tools");
    }
  }, [open]);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              {getStepTitle()}
            </DialogTitle>
            <DialogDescription>
              {currentStep === "tools" && "Configure alerts, share your job, and save it as a template"}
              {currentStep === "jobtarget" && "Maximize your reach by promoting to external job boards"}
              {currentStep === "view" && "See how your job appears to candidates"}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4">
            {currentStep === "tools" && renderToolsStep()}
            {currentStep === "jobtarget" && renderJobTargetStep()}
            {currentStep === "view" && renderViewStep()}
          </div>

          <div className="flex items-center justify-between pt-6 border-t">
            <div className="flex items-center gap-2">
              {currentStep === "tools" && (
                <Badge variant="outline">Step 1</Badge>
              )}
              {currentStep === "jobtarget" && (
                <Badge variant="outline">Step 2</Badge>
              )}
              {currentStep === "view" && (
                <Badge variant="outline">Step 3</Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              {currentStep === "jobtarget" && (
                <>
                  <Button
                    variant="outline"
                    onClick={handleSkipJobTarget}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Skip for Now
                  </Button>
                  <Button onClick={handlePromoteNow}>
                    <Megaphone className="h-4 w-4 mr-2" />
                    Promote Now
                  </Button>
                </>
              )}
              {currentStep === "tools" && (
                <Button onClick={handleNextStep}>
                  Continue
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              )}
              {currentStep === "view" && (
                <Button onClick={handleComplete}>
                  Done
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ExternalPromotionDialog
        open={showJobTargetDialog}
        onOpenChange={(open) => {
          setShowJobTargetDialog(open);
          if (!open) {
            // When dialog closes (skip or complete), move to view step
            setCurrentStep("view");
          }
        }}
        job={job}
        onSuccess={() => {
          setShowJobTargetDialog(false);
          // Move to view step after successful promotion
          setCurrentStep("view");
        }}
      />
    </>
  );
}

