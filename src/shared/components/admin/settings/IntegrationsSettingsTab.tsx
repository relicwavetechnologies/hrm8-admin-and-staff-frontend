import { useState, useEffect } from "react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Loader2, Save, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { SystemSettingsService } from "@/shared/lib/hrm8/systemSettingsService";

function IntegrationsSettingsSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-52" />
          <Skeleton className="h-4 w-96" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-4 w-80" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function IntegrationsSettingsTab() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [settings, setSettings] = useState({
    airwallexApiKey: "",
    airwallexWebhookSecret: "",
    xeroClientId: "",
    xeroClientSecret: "",
    xeroTenantId: "",
    openaiApiKey: "",
    openaiModel: "gpt-4o",
  });

  useEffect(() => {
    void loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await SystemSettingsService.getAllSettings();
      setSettings({
        airwallexApiKey: data["airwallex.apiKey"] || "",
        airwallexWebhookSecret: data["airwallex.webhookSecret"] || "",
        xeroClientId: data["xero.clientId"] || "",
        xeroClientSecret: data["xero.clientSecret"] || "",
        xeroTenantId: data["xero.tenantId"] || "",
        openaiApiKey: data["openai.apiKey"] || "",
        openaiModel: data["openai.model"] || "gpt-4o",
      });
    } catch (error) {
      toast.error("Failed to load integration settings");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await SystemSettingsService.bulkUpdateSettings([
        { key: "airwallex.apiKey", value: settings.airwallexApiKey, isPublic: false },
        { key: "airwallex.webhookSecret", value: settings.airwallexWebhookSecret, isPublic: false },
        { key: "xero.clientId", value: settings.xeroClientId, isPublic: false },
        { key: "xero.clientSecret", value: settings.xeroClientSecret, isPublic: false },
        { key: "xero.tenantId", value: settings.xeroTenantId, isPublic: false },
        { key: "openai.apiKey", value: settings.openaiApiKey, isPublic: false },
        { key: "openai.model", value: settings.openaiModel, isPublic: false },
      ]);
      toast.success("Integration settings saved successfully");
    } catch (error) {
      toast.error("Failed to save settings");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const toggleShowKey = (key: string) => {
    setShowKeys((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (loading) return <IntegrationsSettingsSkeleton />;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Airwallex Payments</CardTitle>
          <CardDescription>Configure Airwallex collections, refunds, and payout rail access.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="airwallexApiKey">API Key</Label>
            <div className="relative">
              <Input
                id="airwallexApiKey"
                type={showKeys.airwallexApiKey ? "text" : "password"}
                value={settings.airwallexApiKey}
                onChange={(e) => setSettings({ ...settings, airwallexApiKey: e.target.value })}
                placeholder="awx_live_..."
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => toggleShowKey("airwallexApiKey")}
              >
                {showKeys.airwallexApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="airwallexWebhookSecret">Webhook Secret</Label>
            <div className="relative">
              <Input
                id="airwallexWebhookSecret"
                type={showKeys.airwallexWebhookSecret ? "text" : "password"}
                value={settings.airwallexWebhookSecret}
                onChange={(e) => setSettings({ ...settings, airwallexWebhookSecret: e.target.value })}
                placeholder="awx_whsec_..."
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => toggleShowKey("airwallexWebhookSecret")}
              >
                {showKeys.airwallexWebhookSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Xero Accounting</CardTitle>
          <CardDescription>Configure Xero invoice and ledger connectivity.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="xeroClientId">Client ID</Label>
              <Input
                id="xeroClientId"
                value={settings.xeroClientId}
                onChange={(e) => setSettings({ ...settings, xeroClientId: e.target.value })}
                placeholder="xero-client-id"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="xeroTenantId">Tenant ID</Label>
              <Input
                id="xeroTenantId"
                value={settings.xeroTenantId}
                onChange={(e) => setSettings({ ...settings, xeroTenantId: e.target.value })}
                placeholder="xero-tenant-id"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="xeroClientSecret">Client Secret</Label>
            <div className="relative">
              <Input
                id="xeroClientSecret"
                type={showKeys.xeroClientSecret ? "text" : "password"}
                value={settings.xeroClientSecret}
                onChange={(e) => setSettings({ ...settings, xeroClientSecret: e.target.value })}
                placeholder="xero-client-secret"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => toggleShowKey("xeroClientSecret")}
              >
                {showKeys.xeroClientSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>AI Services (OpenAI)</CardTitle>
          <CardDescription>
            Configure AI capabilities for Smart Resume Parsing, Job Generation, and Scoring.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="openaiApiKey">API Key</Label>
              <div className="relative">
                <Input
                  id="openaiApiKey"
                  type={showKeys.openaiApiKey ? "text" : "password"}
                  value={settings.openaiApiKey}
                  onChange={(e) => setSettings({ ...settings, openaiApiKey: e.target.value })}
                  placeholder="sk-..."
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => toggleShowKey("openaiApiKey")}
                >
                  {showKeys.openaiApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="openaiModel">Default Model</Label>
              <Input
                id="openaiModel"
                value={settings.openaiModel}
                onChange={(e) => setSettings({ ...settings, openaiModel: e.target.value })}
                placeholder="gpt-4o"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save All Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
