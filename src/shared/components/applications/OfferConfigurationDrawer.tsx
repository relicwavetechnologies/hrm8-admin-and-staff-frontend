/**
 * Offer Configuration Drawer
 * Configure offer settings, templates, and auto-send for the OFFER round
 */

import { useState, useEffect, useCallback } from "react";
import { FormDrawer } from "@/shared/components/ui/form-drawer";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Switch } from "@/shared/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Textarea } from "@/shared/components/ui/textarea";

import { toast } from "sonner";
import { Save } from "lucide-react";
// offerService import removed
import { jobService } from "@/shared/lib/api/jobService";
import { Job } from "@/shared/types/job";
import { mapBackendJobToFrontend } from "@/shared/lib/jobDataMapper";

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

interface OfferConfigurationDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobId: string;
  roundId: string;
  roundName: string;
  onSuccess?: () => void;
}

export function OfferConfigurationDrawer({
  open,
  onOpenChange,
  jobId,
  roundId,
  roundName,
  onSuccess,
}: OfferConfigurationDrawerProps) {
  const [saving, setSaving] = useState(false);
  const [job, setJob] = useState<Job | null>(null);
  const [_isLoadingJob, setIsLoadingJob] = useState(false);


  // Configuration state
  const [autoSend, setAutoSend] = useState(false);
  const [defaultTemplateId, setDefaultTemplateId] = useState<string>("");
  const [defaultSalary, setDefaultSalary] = useState<string>("");
  const [defaultSalaryCurrency, setDefaultSalaryCurrency] = useState("USD");
  const [defaultSalaryPeriod, setDefaultSalaryPeriod] = useState("annual");
  const [defaultWorkLocation, setDefaultWorkLocation] = useState("");
  const [defaultWorkArrangement, setDefaultWorkArrangement] = useState("remote");
  const [defaultBenefits, setDefaultBenefits] = useState("");
  const [defaultVacationDays, setDefaultVacationDays] = useState<string>("");
  const [defaultExpiryDays, setDefaultExpiryDays] = useState<string>("7");
  const [defaultCustomMessage, setDefaultCustomMessage] = useState("");

  // Fetch job data when drawer opens
  useEffect(() => {
    if (!open) {
      // Reset job when drawer closes
      setJob(null);
      return;
    }

    if (!jobId || job) {
      return; // Already have job or no jobId
    }

    const fetchJob = async () => {
      setIsLoadingJob(true);
      try {
        const response = await jobService.getJobById(jobId);
        if (response.success && response.data) {
          const mappedJob = mapBackendJobToFrontend(response.data);
          setJob(mappedJob);
        }
      } catch (error) {
        console.error('Failed to fetch job:', error);
      } finally {
        setIsLoadingJob(false);
      }
    };

    fetchJob();
  }, [open, jobId]);

  // Load existing configuration from localStorage (or API if available)
  // If no saved config exists, populate from job data
  const loadConfiguration = useCallback(() => {
    const key = `offer_config_${jobId}_${roundId}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        const config = JSON.parse(saved);
        setAutoSend(config.autoSend ?? false);
        setDefaultTemplateId(config.defaultTemplateId || "");
        setDefaultSalary(config.defaultSalary || "");
        setDefaultSalaryCurrency(config.defaultSalaryCurrency || "USD");
        setDefaultSalaryPeriod(config.defaultSalaryPeriod || "annual");
        setDefaultWorkLocation(config.defaultWorkLocation || "");
        setDefaultWorkArrangement(config.defaultWorkArrangement || "remote");
        setDefaultBenefits(config.defaultBenefits || "");
        setDefaultVacationDays(config.defaultVacationDays || "");
        setDefaultExpiryDays(config.defaultExpiryDays || "7");
        setDefaultCustomMessage(config.defaultCustomMessage || "");
      } catch (e) {
        console.error('Failed to load offer config:', e);
      }
    } else if (job) {
      // No saved configuration, populate from job data
      const defaultSalary = job.salaryMax || job.salaryMin || 0;
      setDefaultSalary(defaultSalary.toString());
      setDefaultSalaryCurrency(job.salaryCurrency || "USD");
      setDefaultSalaryPeriod(job.salaryPeriod || "annual");
      setDefaultWorkLocation(job.location || "");
      setDefaultWorkArrangement(mapWorkArrangement(job.workArrangement));
      // Other fields remain at their defaults
    }
  }, [jobId, roundId, job]);

  useEffect(() => {
    if (open) {
      loadConfiguration();
    }
  }, [open, loadConfiguration]);

  const handleSave = () => {
    setSaving(true);
    try {
      const config = {
        autoSend,
        defaultTemplateId,
        defaultSalary,
        defaultSalaryCurrency,
        defaultSalaryPeriod,
        defaultWorkLocation,
        defaultWorkArrangement,
        defaultBenefits,
        defaultVacationDays,
        defaultExpiryDays,
        defaultCustomMessage,
      };

      const key = `offer_config_${jobId}_${roundId}`;
      localStorage.setItem(key, JSON.stringify(config));

      toast.success("Offer configuration saved");
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to save offer config:', error);
      toast.error("Failed to save configuration");
    } finally {
      setSaving(false);
    }
  };

  return (
    <FormDrawer
      open={open}
      onOpenChange={onOpenChange}
      title="Configure Offer Round"
      description={`Set up offer templates and auto-send settings for ${roundName}`}
    >
      <div className="space-y-6 py-4">
        {/* Footer buttons moved inside FormDrawer children */}
        <div className="flex justify-end gap-2 mb-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Saving..." : "Save Configuration"}
          </Button>
        </div>

        {/* Auto-Send Toggle */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Auto-Send Settings</CardTitle>
            <CardDescription>
              Automatically send offers to candidates when they're moved to this round
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-send">Enable Auto-Send</Label>
                <p className="text-xs text-muted-foreground">
                  Automatically create and send offers using the default template
                </p>
              </div>
              <Switch
                id="auto-send"
                checked={autoSend}
                onCheckedChange={setAutoSend}
              />
            </div>
          </CardContent>
        </Card>

        {/* Default Offer Template */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Default Offer Template</CardTitle>
            <CardDescription>
              Default values used when creating offers
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="template">Template</Label>
              <Select value={defaultTemplateId} onValueChange={setDefaultTemplateId}>
                <SelectTrigger id="template">
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
                <Label htmlFor="default-salary">Default Salary</Label>
                <Input
                  id="default-salary"
                  type="number"
                  value={defaultSalary}
                  onChange={(e) => setDefaultSalary(e.target.value)}
                  placeholder="e.g., 100000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="default-currency">Currency</Label>
                <Select value={defaultSalaryCurrency} onValueChange={setDefaultSalaryCurrency}>
                  <SelectTrigger id="default-currency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                    <SelectItem value="CAD">CAD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="default-period">Salary Period</Label>
                <Select value={defaultSalaryPeriod} onValueChange={setDefaultSalaryPeriod}>
                  <SelectTrigger id="default-period">
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
                <Label htmlFor="default-vacation">Vacation Days</Label>
                <Input
                  id="default-vacation"
                  type="number"
                  value={defaultVacationDays}
                  onChange={(e) => setDefaultVacationDays(e.target.value)}
                  placeholder="e.g., 20"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="default-location">Work Location</Label>
              <Input
                id="default-location"
                value={defaultWorkLocation}
                onChange={(e) => setDefaultWorkLocation(e.target.value)}
                placeholder="e.g., San Francisco, CA or Remote"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="default-arrangement">Work Arrangement</Label>
              <Select value={defaultWorkArrangement} onValueChange={setDefaultWorkArrangement}>
                <SelectTrigger id="default-arrangement">
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
              <Label htmlFor="default-benefits">Benefits (comma-separated)</Label>
              <Input
                id="default-benefits"
                value={defaultBenefits}
                onChange={(e) => setDefaultBenefits(e.target.value)}
                placeholder="Health Insurance, 401k, etc."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="default-expiry">Offer Expiry (days)</Label>
              <Input
                id="default-expiry"
                type="number"
                value={defaultExpiryDays}
                onChange={(e) => setDefaultExpiryDays(e.target.value)}
                placeholder="7"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="default-message">Default Custom Message</Label>
              <Textarea
                id="default-message"
                value={defaultCustomMessage}
                onChange={(e) => setDefaultCustomMessage(e.target.value)}
                placeholder="Optional message to include in offers"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </FormDrawer>
  );
}

