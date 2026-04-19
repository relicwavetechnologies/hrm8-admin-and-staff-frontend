import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Badge } from '@/shared/components/ui/badge';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { useToast } from '@/shared/hooks/use-toast';
import {
    billingApiService,
    type AssessPackage,
    type CreateAssessPackageInput,
    type XobinPlatformConfig,
} from '@/shared/lib/hrm8/billingApiService';
import { KeyRound, Package, Plus, Pencil, Trash2, RefreshCw, CheckCircle2, XCircle } from 'lucide-react';

export default function XobinAdminPage() {
    const { toast } = useToast();

    // ── Platform API Key ──────────────────────────────────────────────────────
    const [config, setConfig] = useState<XobinPlatformConfig | null>(null);
    const [loadingConfig, setLoadingConfig] = useState(true);
    const [apiKeyInput, setApiKeyInput] = useState('');
    const [savingKey, setSavingKey] = useState(false);
    const [deletingKey, setDeletingKey] = useState(false);

    // ── Package Catalog ───────────────────────────────────────────────────────
    const [packages, setPackages] = useState<AssessPackage[]>([]);
    const [loadingPackages, setLoadingPackages] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [savingPkg, setSavingPkg] = useState(false);
    const [form, setForm] = useState<CreateAssessPackageInput>({
        code: '', name: '', description: '', basePrice: 0,
        currency: 'USD', perCandidatePrice: 0, includedCandidates: 25, validityDays: 365,
    });

    const loadConfig = async () => {
        setLoadingConfig(true);
        const res = await billingApiService.getXobinPlatformConfig();
        if (res.success && res.data) setConfig(res.data);
        setLoadingConfig(false);
    };

    const loadPackages = async () => {
        setLoadingPackages(true);
        const res = await billingApiService.listAssessPackages(true);
        if (res.success && res.data) setPackages(res.data.packages);
        setLoadingPackages(false);
    };

    useEffect(() => { void loadConfig(); void loadPackages(); }, []);

    const handleSaveKey = async () => {
        if (!apiKeyInput.trim()) return;
        setSavingKey(true);
        const res = await billingApiService.setXobinApiKey(apiKeyInput.trim());
        if (res.success) {
            toast({ title: 'API key saved', description: `Masked: ${res.data?.apiKeyMasked}` });
            setApiKeyInput('');
            await loadConfig();
        } else {
            toast({ title: 'Failed to save key', description: res.error, variant: 'destructive' });
        }
        setSavingKey(false);
    };

    const handleDeleteKey = async () => {
        setDeletingKey(true);
        const res = await billingApiService.deleteXobinApiKey();
        if (res.success) {
            toast({ title: 'API key removed' });
            await loadConfig();
        } else {
            toast({ title: 'Failed to remove key', description: res.error, variant: 'destructive' });
        }
        setDeletingKey(false);
    };

    const resetForm = () => {
        setForm({ code: '', name: '', description: '', basePrice: 0, currency: 'USD', perCandidatePrice: 0, includedCandidates: 25, validityDays: 365 });
        setEditingId(null);
        setShowForm(false);
    };

    const handleEditPkg = (pkg: AssessPackage) => {
        setForm({
            code: pkg.code, name: pkg.name, description: pkg.description ?? '',
            basePrice: pkg.base_price, currency: pkg.currency,
            perCandidatePrice: pkg.per_candidate_price,
            includedCandidates: pkg.included_candidates,
            validityDays: pkg.validity_days,
        });
        setEditingId(pkg.id);
        setShowForm(true);
    };

    const handleSavePkg = async () => {
        if (!form.code || !form.name || form.basePrice == null || form.includedCandidates == null) {
            toast({ title: 'Code, name, base price, and invite count are required', variant: 'destructive' });
            return;
        }
        setSavingPkg(true);
        const res = editingId
            ? await billingApiService.updateAssessPackage(editingId, form)
            : await billingApiService.createAssessPackage(form);
        if (res.success) {
            toast({ title: editingId ? 'Package updated' : 'Package created' });
            resetForm();
            await loadPackages();
        } else {
            toast({ title: 'Save failed', description: res.error, variant: 'destructive' });
        }
        setSavingPkg(false);
    };

    const handleDeactivate = async (id: string, name: string) => {
        const res = await billingApiService.deactivateAssessPackage(id);
        if (res.success) {
            toast({ title: `${name} deactivated` });
            await loadPackages();
        } else {
            toast({ title: 'Failed to deactivate', description: res.error, variant: 'destructive' });
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-semibold tracking-tight">Xobin Assessment Platform</h2>
                <p className="text-muted-foreground text-sm mt-1">
                    Configure the platform Xobin API key and manage assessment packages sold to companies.
                </p>
            </div>

            {/* ── Platform API Key ─────────────────────────────────────────── */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <KeyRound className="h-5 w-5" />
                        Platform API Key
                    </CardTitle>
                    <CardDescription>
                        Single master Xobin API key used for all companies. Set this once — all assessment invites across all companies use it.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {loadingConfig ? (
                        <Skeleton className="h-10 w-full" />
                    ) : (
                        <>
                            <div className="flex items-center gap-3">
                                {config?.apiKeyConfigured ? (
                                    <>
                                        <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                                        <span className="text-sm font-mono text-muted-foreground">{config.apiKeyMasked}</span>
                                        <Badge variant="outline" className="text-xs">
                                            {config.source === 'database' ? 'DB (admin set)' : 'ENV var'}
                                        </Badge>
                                        {config.webhookSecretConfigured && (
                                            <Badge variant="secondary" className="text-xs">Webhook secret set</Badge>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <XCircle className="h-4 w-4 text-destructive shrink-0" />
                                        <span className="text-sm text-muted-foreground">No API key configured</span>
                                    </>
                                )}
                            </div>

                            <div className="flex gap-2">
                                <Input
                                    type="password"
                                    placeholder="Enter new Xobin API key..."
                                    value={apiKeyInput}
                                    onChange={(e) => setApiKeyInput(e.target.value)}
                                    className="max-w-sm font-mono text-sm"
                                />
                                <Button onClick={handleSaveKey} disabled={savingKey || !apiKeyInput.trim()} size="sm">
                                    {savingKey ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Save Key'}
                                </Button>
                                {config?.apiKeyConfigured && config.source === 'database' && (
                                    <Button variant="destructive" size="sm" onClick={handleDeleteKey} disabled={deletingKey}>
                                        {deletingKey ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Remove'}
                                    </Button>
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                If an environment variable XOBIN_API_KEY is also set, it takes precedence over the database key.
                            </p>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* ── Assessment Package Catalog ───────────────────────────────── */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Package className="h-5 w-5" />
                                Assessment Packages
                            </CardTitle>
                            <CardDescription>
                                Packages companies can purchase. Each package grants a number of Xobin invite credits.
                            </CardDescription>
                        </div>
                        <Button size="sm" onClick={() => { resetForm(); setShowForm(true); }}>
                            <Plus className="h-4 w-4 mr-1" />
                            New Package
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Create / Edit Form */}
                    {showForm && (
                        <div className="border rounded-lg p-4 space-y-3 bg-muted/30">
                            <h3 className="font-medium text-sm">{editingId ? 'Edit Package' : 'New Package'}</h3>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <Label className="text-xs">Code (unique slug)</Label>
                                    <Input
                                        placeholder="e.g. growth-100"
                                        value={form.code}
                                        onChange={(e) => setForm(f => ({ ...f, code: e.target.value }))}
                                        disabled={Boolean(editingId)}
                                        className="text-sm"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Name</Label>
                                    <Input
                                        placeholder="e.g. Growth Pack"
                                        value={form.name}
                                        onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                                        className="text-sm"
                                    />
                                </div>
                                <div className="space-y-1 col-span-2">
                                    <Label className="text-xs">Description</Label>
                                    <Input
                                        placeholder="Short description for companies"
                                        value={form.description ?? ''}
                                        onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                                        className="text-sm"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Invite Credits (included_candidates)</Label>
                                    <Input
                                        type="number" min={1}
                                        value={form.includedCandidates}
                                        onChange={(e) => setForm(f => ({ ...f, includedCandidates: Number(e.target.value) }))}
                                        className="text-sm"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Base Price (package cost)</Label>
                                    <Input
                                        type="number" min={0} step={0.01}
                                        value={form.basePrice}
                                        onChange={(e) => setForm(f => ({ ...f, basePrice: Number(e.target.value) }))}
                                        className="text-sm"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Currency</Label>
                                    <Input
                                        placeholder="USD"
                                        value={form.currency}
                                        onChange={(e) => setForm(f => ({ ...f, currency: e.target.value.toUpperCase() }))}
                                        className="text-sm"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Per-Extra-Candidate Price</Label>
                                    <Input
                                        type="number" min={0} step={0.01}
                                        value={form.perCandidatePrice}
                                        onChange={(e) => setForm(f => ({ ...f, perCandidatePrice: Number(e.target.value) }))}
                                        className="text-sm"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Validity (days, blank = no expiry)</Label>
                                    <Input
                                        type="number" min={1}
                                        placeholder="365"
                                        value={form.validityDays ?? ''}
                                        onChange={(e) => setForm(f => ({ ...f, validityDays: e.target.value ? Number(e.target.value) : null }))}
                                        className="text-sm"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button size="sm" onClick={handleSavePkg} disabled={savingPkg}>
                                    {savingPkg ? <RefreshCw className="h-4 w-4 animate-spin mr-1" /> : null}
                                    {editingId ? 'Save Changes' : 'Create Package'}
                                </Button>
                                <Button size="sm" variant="ghost" onClick={resetForm}>Cancel</Button>
                            </div>
                        </div>
                    )}

                    {/* Package List */}
                    {loadingPackages ? (
                        <div className="space-y-2">
                            {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
                        </div>
                    ) : packages.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-6">
                            No packages yet. Create one to start selling Xobin assessments.
                        </p>
                    ) : (
                        <div className="divide-y rounded-md border">
                            {packages.map((pkg) => (
                                <div key={pkg.id} className="flex items-center justify-between px-4 py-3">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-medium text-sm">{pkg.name}</span>
                                            <Badge variant="outline" className="text-xs font-mono">{pkg.code}</Badge>
                                            {pkg.is_active ? (
                                                <Badge className="text-xs bg-green-500/15 text-green-700 border-green-500/30">Active</Badge>
                                            ) : (
                                                <Badge variant="secondary" className="text-xs">Inactive</Badge>
                                            )}
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            {pkg.included_candidates} invites · {pkg.currency} {pkg.base_price.toFixed(2)}
                                            {pkg.validity_days ? ` · expires in ${pkg.validity_days}d` : ' · no expiry'}
                                            {pkg._count ? ` · ${pkg._count.entitlements} company purchase(s)` : ''}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0 ml-4">
                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditPkg(pkg)}>
                                            <Pencil className="h-3.5 w-3.5" />
                                        </Button>
                                        {pkg.is_active && (
                                            <Button
                                                variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive"
                                                onClick={() => handleDeactivate(pkg.id, pkg.name)}
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
