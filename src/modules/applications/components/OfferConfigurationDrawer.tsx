// @ts-nocheck
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
import { Badge } from "@/shared/components/ui/badge";
import { Separator } from "@/shared/components/ui/separator";
import { Textarea } from "@/shared/components/ui/textarea";
import { toast } from "sonner";
import { Save, FileText } from "lucide-react";
import { jobService } from "@/shared/lib/jobService";
import { jobRoundService } from "@/shared/lib/jobRoundService";
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
  const [loading, setLoading] = useState(false);
  
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

  // Load existing configuration from API; fallback to job data when empty
  useEffect(() => {
    if (!open || !jobId || !roundId) return;

    let cancelled = false;
    setLoading(true);

    const load = async () => {
      try {
        const offerRes = await jobRoundService.getOfferConfig(jobId, roundId);
        if (cancelled) return;
        if (offerRes.success && offerRes.data) {
          const c = offerRes.data;
          setAutoSend(c.autoSend ?? false);
          setDefaultTemplateId(c.defaultTemplateId || "");
          setDefaultSalary(c.defaultSalary || "");
          setDefaultSalaryCurrency(c.defaultSalaryCurrency || "USD");
          setDefaultSalaryPeriod(c.defaultSalaryPeriod || "annual");
          setDefaultWorkLocation(c.defaultWorkLocation || "");
          setDefaultWorkArrangement((c.defaultWorkArrangement as "on-site" | "remote" | "hybrid") || "remote");
          setDefaultBenefits(c.defaultBenefits || "");
          setDefaultVacationDays(c.defaultVacationDays || "");
          setDefaultExpiryDays(c.defaultExpiryDays || "7");
          setDefaultCustomMessage(c.defaultCustomMessage || "");
        } else {
          // Fallback to job data
          const jobRes = await jobService.getJobById(jobId);
          if (cancelled) return;
          if (jobRes.success && jobRes.data?.job) {
            const mapped = mapBackendJobToFrontend(jobRes.data.job);
            const j = mapped;
            setDefaultSalary(String(j.salaryMax || j.salaryMin || 0));
            setDefaultSalaryCurrency(j.salaryCurrency || "USD");
            setDefaultSalaryPeriod(j.salaryPeriod || "annual");
            setDefaultWorkLocation(j.location || "");
            setDefaultWorkArrangement(mapWorkArrangement(j.workArrangement));
          }
        }
      } catch (e) {
        if (!cancelled) console.error('Failed to load offer config:', e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [open, jobId, roundId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await jobRoundService.updateOfferConfig(jobId, roundId, {
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
      });
      if (res.success) {
        toast.success("Offer configuration saved");
        onSuccess?.();
        onOpenChange(false);
      } else {
        throw new Error(res.error);
      }
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
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Saving..." : "Save Configuration"}
          </Button>
        </div>
      }
    >
      <div className="space-y-6 py-4">
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

