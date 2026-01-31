import { useState } from "react";
import { Job } from "@/shared/types/job";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/components/ui/card";
import { Switch } from "@/shared/components/ui/switch";
import { Label } from "@/shared/components/ui/label";
import { Input } from "@/shared/components/ui/input";
import { Separator } from "@/shared/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
} from "lucide-react";
import { useToast } from "@/shared/hooks/use-toast";
import { jobService } from "@/shared/lib/api/jobService";
import { jobTemplateService } from "@/shared/lib/api/jobTemplateService";

interface PostLaunchToolsProps {
  job: Job;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaveTemplate?: (templateName: string, templateDescription?: string) => void;
  onPromoteExternally?: () => void;
}



export function PostLaunchTools({
  job,
  open,
  onOpenChange,
  onSaveTemplate,
  onPromoteExternally,
}: PostLaunchToolsProps) {
  const { toast } = useToast();
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
        // Use new template service
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



  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            Your Job is Now Live!
          </DialogTitle>
          <DialogDescription>
            Configure alerts, share your job, and save it as a template for future use
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
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

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                type="button"
                variant="outline"
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
                View Job on Internal Board
              </Button>
              {onPromoteExternally && (
                <Button
                  type="button"
                  variant="default"
                  className="w-full justify-start"
                  onClick={onPromoteExternally}
                >
                  <Megaphone className="h-4 w-4 mr-2" />
                  Promote Externally via JobTarget
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

