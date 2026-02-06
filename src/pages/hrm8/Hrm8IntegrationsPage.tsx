import { useEffect, useMemo, useState } from "react";
import { useHrm8Auth } from "@/contexts/Hrm8AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Switch } from "@/shared/components/ui/switch";
import { Textarea } from "@/shared/components/ui/textarea";
import { Badge } from "@/shared/components/ui/badge";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { DataTable, Column } from "@/shared/components/tables/DataTable";
import { useToast } from "@/shared/hooks/use-toast";
import { AlertCircle, Database, Plus, RefreshCw, Settings2 } from "lucide-react";
import {
  CompanyIntegration,
  GlobalIntegration,
  IntegrationUsageStat,
  hrm8IntegrationsService
} from "@/shared/lib/hrm8/integrationsService";

const integrationTypeOptions = [
  "JOB_POSTING_PLATFORM",
  "ASSESSMENT_TOOL",
  "ACCOUNTING_SYSTEM",
  "EMAIL_PROVIDER",
  "CALENDAR",
  "OTHER",
  "STRIPE_PAYMENTS",
];

const integrationStatusOptions = [
  "ACTIVE",
  "INACTIVE",
  "ERROR",
  "PENDING_CONFIG",
];

const categoryOptions = [
  "email",
  "job_board",
  "assessment",
  "video_interview",
  "calendar",
  "accounting",
  "payroll",
  "other",
];

export default function Hrm8IntegrationsPage() {
  const { hrm8User } = useHrm8Auth();
  const { toast } = useToast();
  const isGlobalAdmin = hrm8User?.role === "GLOBAL_ADMIN";

  const [loading, setLoading] = useState(true);
  const [savingGlobal, setSavingGlobal] = useState(false);
  const [savingCompany, setSavingCompany] = useState(false);
  const [globalIntegrations, setGlobalIntegrations] = useState<GlobalIntegration[]>([]);
  const [usageStats, setUsageStats] = useState<IntegrationUsageStat[]>([]);
  const [companyIntegrations, setCompanyIntegrations] = useState<CompanyIntegration[]>([]);
  const [companyId, setCompanyId] = useState("");

  const [globalForm, setGlobalForm] = useState({
    provider: "",
    name: "",
    category: "email",
    api_key: "",
    api_secret: "",
    endpoint_url: "",
    config_json: "",
    is_active: true,
  });
  const [selectedGlobalId, setSelectedGlobalId] = useState<string | null>(null);

  const [companyForm, setCompanyForm] = useState({
    type: "EMAIL_PROVIDER",
    name: "",
    status: "ACTIVE",
    api_key: "",
    api_secret: "",
    login_url: "",
    username: "",
    password: "",
    config_json: "",
  });
  const [selectedCompanyIntegrationId, setSelectedCompanyIntegrationId] = useState<string | null>(null);

  const activeEmailProvider = useMemo(() => {
    return globalIntegrations.find(
      (integration) => integration.category === "email" && integration.is_active
    );
  }, [globalIntegrations]);

  useEffect(() => {
    loadGlobalData();
  }, []);

  const loadGlobalData = async () => {
    try {
      setLoading(true);
      const [catalog, usage] = await Promise.all([
        hrm8IntegrationsService.getCatalog(),
        hrm8IntegrationsService.getUsage(),
      ]);
      setGlobalIntegrations(catalog);
      setUsageStats(usage);
    } catch (error: any) {
      toast({
        title: "Failed to load integrations",
        description: error?.message || "Unexpected error",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadCompanyIntegrations = async () => {
    if (!companyId.trim()) {
      toast({
        title: "Company ID required",
        description: "Enter a company ID to load integrations.",
        variant: "destructive",
      });
      return;
    }
    try {
      const integrations = await hrm8IntegrationsService.getCompanyIntegrations(companyId.trim());
      setCompanyIntegrations(integrations);
    } catch (error: any) {
      toast({
        title: "Failed to load company integrations",
        description: error?.message || "Unexpected error",
        variant: "destructive",
      });
    }
  };

  const resetGlobalForm = () => {
    setSelectedGlobalId(null);
    setGlobalForm({
      provider: "",
      name: "",
      category: "email",
      api_key: "",
      api_secret: "",
      endpoint_url: "",
      config_json: "",
      is_active: true,
    });
  };

  const resetCompanyForm = () => {
    setSelectedCompanyIntegrationId(null);
    setCompanyForm({
      type: "EMAIL_PROVIDER",
      name: "",
      status: "ACTIVE",
      api_key: "",
      api_secret: "",
      login_url: "",
      username: "",
      password: "",
      config_json: "",
    });
  };

  const parseConfigJson = (raw: string) => {
    if (!raw.trim()) return undefined;
    try {
      return JSON.parse(raw);
    } catch (error) {
      throw new Error("Config must be valid JSON");
    }
  };

  const handleGlobalSave = async () => {
    if (!globalForm.provider || !globalForm.name || !globalForm.category) {
      toast({
        title: "Missing required fields",
        description: "Provider, name, and category are required.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSavingGlobal(true);
      const config = parseConfigJson(globalForm.config_json);
      await hrm8IntegrationsService.upsertGlobal({
        provider: globalForm.provider,
        name: globalForm.name,
        category: globalForm.category,
        api_key: globalForm.api_key || undefined,
        api_secret: globalForm.api_secret || undefined,
        endpoint_url: globalForm.endpoint_url || undefined,
        config,
        is_active: globalForm.is_active,
      });
      await loadGlobalData();
      resetGlobalForm();
      toast({
        title: "Integration saved",
        description: "Global integration configuration updated.",
      });
    } catch (error: any) {
      toast({
        title: "Failed to save integration",
        description: error?.message || "Unexpected error",
        variant: "destructive",
      });
    } finally {
      setSavingGlobal(false);
    }
  };

  const handleCompanySave = async () => {
    if (!companyId.trim()) {
      toast({
        title: "Company ID required",
        description: "Enter a company ID before saving.",
        variant: "destructive",
      });
      return;
    }
    if (!companyForm.type || !companyForm.name) {
      toast({
        title: "Missing required fields",
        description: "Type and name are required.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSavingCompany(true);
      const config = parseConfigJson(companyForm.config_json);
      const payload = {
        type: companyForm.type,
        name: companyForm.name,
        status: companyForm.status,
        api_key: companyForm.api_key || undefined,
        api_secret: companyForm.api_secret || undefined,
        login_url: companyForm.login_url || undefined,
        username: companyForm.username || undefined,
        password: companyForm.password || undefined,
        config,
      };

      if (selectedCompanyIntegrationId) {
        await hrm8IntegrationsService.updateCompanyIntegration(
          companyId.trim(),
          selectedCompanyIntegrationId,
          payload
        );
      } else {
        await hrm8IntegrationsService.createCompanyIntegration(companyId.trim(), payload);
      }

      await loadCompanyIntegrations();
      resetCompanyForm();
      toast({
        title: "Company integration saved",
        description: "Company override updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Failed to save company integration",
        description: error?.message || "Unexpected error",
        variant: "destructive",
      });
    } finally {
      setSavingCompany(false);
    }
  };

  const handleCompanyDelete = async (integrationId: string) => {
    if (!companyId.trim()) return;
    try {
      await hrm8IntegrationsService.deleteCompanyIntegration(companyId.trim(), integrationId);
      await loadCompanyIntegrations();
      toast({
        title: "Integration removed",
        description: "Company integration deleted.",
      });
    } catch (error: any) {
      toast({
        title: "Failed to delete integration",
        description: error?.message || "Unexpected error",
        variant: "destructive",
      });
    }
  };

  const globalColumns: Column<GlobalIntegration>[] = [
    {
      key: "provider",
      label: "Provider",
      sortable: true,
      render: (row) => <span className="font-medium">{row.provider}</span>,
    },
    {
      key: "name",
      label: "Name",
      render: (row) => <span>{row.name}</span>,
    },
    {
      key: "category",
      label: "Category",
      render: (row) => <Badge variant="outline">{row.category}</Badge>,
    },
    {
      key: "is_active",
      label: "Status",
      render: (row) =>
        row.is_active ? (
          <Badge className="bg-emerald-500 text-white">Active</Badge>
        ) : (
          <Badge variant="secondary">Inactive</Badge>
        ),
    },
  ];

  const companyColumns: Column<CompanyIntegration>[] = [
    {
      key: "type",
      label: "Type",
      render: (row) => <Badge variant="outline">{row.type}</Badge>,
    },
    {
      key: "name",
      label: "Name",
      render: (row) => <span className="font-medium">{row.name}</span>,
    },
    {
      key: "status",
      label: "Status",
      render: (row) => <Badge variant="secondary">{row.status}</Badge>,
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSelectedCompanyIntegrationId(row.id);
              setCompanyForm({
                type: row.type,
                name: row.name,
                status: row.status,
                api_key: row.api_key || "",
                api_secret: row.api_secret || "",
                login_url: row.login_url || "",
                username: row.username || "",
                password: row.password || "",
                config_json: row.config ? JSON.stringify(row.config, null, 2) : "",
              });
            }}
          >
            Edit
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => handleCompanyDelete(row.id)}
          >
            Remove
          </Button>
        </div>
      ),
    },
  ];

  if (!isGlobalAdmin) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Access denied. Only HRM8 Global Administrators can access integrations.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight">Integrations</h1>
        <p className="text-muted-foreground">
          Manage global integrations, usage, and company overrides.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Settings2 className="h-5 w-5" />
                Global Integrations Catalog
              </CardTitle>
              <CardDescription>Define global providers and credentials.</CardDescription>
            </div>
            <Button variant="outline" onClick={loadGlobalData} disabled={loading}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </CardHeader>
          <CardContent>
            <DataTable
              data={globalIntegrations}
              columns={globalColumns}
              searchable
              searchKeys={["provider", "name", "category"]}
              emptyMessage={loading ? "Loading..." : "No integrations configured"}
              onRowClick={(row) => {
                setSelectedGlobalId(row.id);
                setGlobalForm({
                  provider: row.provider,
                  name: row.name,
                  category: row.category,
                  api_key: row.api_key || "",
                  api_secret: row.api_secret || "",
                  endpoint_url: row.endpoint_url || "",
                  config_json: row.config ? JSON.stringify(row.config, null, 2) : "",
                  is_active: row.is_active,
                });
              }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{selectedGlobalId ? "Edit Global Integration" : "Add Global Integration"}</CardTitle>
            <CardDescription>Set provider credentials and defaults.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="provider">Provider</Label>
              <Input
                id="provider"
                value={globalForm.provider}
                onChange={(e) => setGlobalForm((prev) => ({ ...prev, provider: e.target.value }))}
                placeholder="jobtarget"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Display Name</Label>
              <Input
                id="name"
                value={globalForm.name}
                onChange={(e) => setGlobalForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="JobTarget"
              />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={globalForm.category}
                onValueChange={(value) => setGlobalForm((prev) => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="api_key">API Key</Label>
              <Input
                id="api_key"
                value={globalForm.api_key}
                onChange={(e) => setGlobalForm((prev) => ({ ...prev, api_key: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="api_secret">API Secret</Label>
              <Input
                id="api_secret"
                type="password"
                value={globalForm.api_secret}
                onChange={(e) => setGlobalForm((prev) => ({ ...prev, api_secret: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endpoint_url">Endpoint URL</Label>
              <Input
                id="endpoint_url"
                value={globalForm.endpoint_url}
                onChange={(e) => setGlobalForm((prev) => ({ ...prev, endpoint_url: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="config_json">Config (JSON)</Label>
              <Textarea
                id="config_json"
                rows={4}
                value={globalForm.config_json}
                onChange={(e) => setGlobalForm((prev) => ({ ...prev, config_json: e.target.value }))}
                placeholder='{"region":"us"}'
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Active</Label>
              <Switch
                checked={globalForm.is_active}
                onCheckedChange={(value) => setGlobalForm((prev) => ({ ...prev, is_active: value }))}
              />
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={handleGlobalSave} disabled={savingGlobal} className="flex-1">
                {savingGlobal ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                {selectedGlobalId ? "Update Integration" : "Save Integration"}
              </Button>
              <Button variant="outline" onClick={resetGlobalForm}>
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Usage Overview
            </CardTitle>
            <CardDescription>Active integrations grouped by type.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {usageStats.length === 0 ? (
              <div className="text-sm text-muted-foreground">No usage data available.</div>
            ) : (
              usageStats.map((stat) => (
                <div key={stat.type} className="flex items-center justify-between text-sm">
                  <span className="font-medium">{stat.type}</span>
                  <Badge variant="outline">{stat._count.id}</Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Email Provider</CardTitle>
            <CardDescription>Default provider is pulled from global configuration.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {activeEmailProvider ? (
              <div className="flex items-center justify-between">
                <span className="font-medium">{activeEmailProvider.name}</span>
                <Badge className="bg-emerald-500 text-white">Active</Badge>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                No active email provider configured.
              </div>
            )}
            <div className="text-xs text-muted-foreground">
              Gmail, Outlook, and SES support are coming soon.
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Company Overrides</CardTitle>
          <CardDescription>
            Set company-specific credentials or disable integrations for a single customer.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-end">
            <div className="flex-1 space-y-2">
              <Label htmlFor="company_id">Company ID</Label>
              <Input
                id="company_id"
                value={companyId}
                onChange={(e) => setCompanyId(e.target.value)}
                placeholder="Enter company id"
              />
            </div>
            <Button onClick={loadCompanyIntegrations} variant="outline">
              Load Integrations
            </Button>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="border-dashed">
              <CardHeader>
                <CardTitle>Company Integrations</CardTitle>
                <CardDescription>Overrides stored for this company.</CardDescription>
              </CardHeader>
              <CardContent>
                <DataTable
                  data={companyIntegrations}
                  columns={companyColumns}
                  searchable
                  searchKeys={["name", "type", "status"]}
                  emptyMessage="No company integrations"
                />
              </CardContent>
            </Card>

            <Card className="border-dashed">
              <CardHeader>
                <CardTitle>{selectedCompanyIntegrationId ? "Edit Company Integration" : "Add Company Integration"}</CardTitle>
                <CardDescription>Override global configuration for one company.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select
                    value={companyForm.type}
                    onValueChange={(value) => setCompanyForm((prev) => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {integrationTypeOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company_name">Name</Label>
                  <Input
                    id="company_name"
                    value={companyForm.name}
                    onChange={(e) => setCompanyForm((prev) => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={companyForm.status}
                    onValueChange={(value) => setCompanyForm((prev) => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {integrationStatusOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company_api_key">API Key</Label>
                  <Input
                    id="company_api_key"
                    value={companyForm.api_key}
                    onChange={(e) => setCompanyForm((prev) => ({ ...prev, api_key: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company_api_secret">API Secret</Label>
                  <Input
                    id="company_api_secret"
                    type="password"
                    value={companyForm.api_secret}
                    onChange={(e) => setCompanyForm((prev) => ({ ...prev, api_secret: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company_login_url">Login URL</Label>
                  <Input
                    id="company_login_url"
                    value={companyForm.login_url}
                    onChange={(e) => setCompanyForm((prev) => ({ ...prev, login_url: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company_username">Username</Label>
                  <Input
                    id="company_username"
                    value={companyForm.username}
                    onChange={(e) => setCompanyForm((prev) => ({ ...prev, username: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company_password">Password</Label>
                  <Input
                    id="company_password"
                    type="password"
                    value={companyForm.password}
                    onChange={(e) => setCompanyForm((prev) => ({ ...prev, password: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company_config_json">Config (JSON)</Label>
                  <Textarea
                    id="company_config_json"
                    rows={3}
                    value={companyForm.config_json}
                    onChange={(e) => setCompanyForm((prev) => ({ ...prev, config_json: e.target.value }))}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Button onClick={handleCompanySave} disabled={savingCompany} className="flex-1">
                    {savingCompany ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                    {selectedCompanyIntegrationId ? "Update Override" : "Save Override"}
                  </Button>
                  <Button variant="outline" onClick={resetCompanyForm}>
                    Reset
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
