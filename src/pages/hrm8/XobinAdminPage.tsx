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
    type XobinStatusResponse,
    type XobinInviteMonitorRow,
    type XobinAdminPackageRow,
} from '@/shared/lib/hrm8/billingApiService';
import {
    KeyRound,
    Package,
    Plus,
    Pencil,
    Trash2,
    RefreshCw,
    CheckCircle2,
    XCircle,
    Activity,
    Coins,
    TrendingDown,
    ArrowDownCircle,
} from 'lucide-react';

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

    // ── Synced Xobin templates + per-assessment credit overrides ──────────────
    const [xobinPackages, setXobinPackages] = useState<XobinAdminPackageRow[]>([]);
    const [defaultCost, setDefaultCost] = useState<number>(1);
    const [pkgCostEdits, setPkgCostEdits] = useState<Record<string, string>>({});
    const [loadingXobinPackages, setLoadingXobinPackages] = useState(true);
    const [syncingPackages, setSyncingPackages] = useState(false);
    const [savingOverrides, setSavingOverrides] = useState(false);

    // ── Monitoring + COGS ─────────────────────────────────────────────────────
    const [status, setStatus] = useState<XobinStatusResponse | null>(null);
    const [loadingStatus, setLoadingStatus] = useState(true);
    const [invites, setInvites] = useState<XobinInviteMonitorRow[]>([]);
    const [loadingInvites, setLoadingInvites] = useState(true);
    const [reversingInvite, setReversingInvite] = useState<string | null>(null);
    const [cogsAmount, setCogsAmount] = useState<string>('');
    const [cogsCurrency, setCogsCurrency] = useState<string>('USD');
    const [cogsLoading, setCogsLoading] = useState(true);
    const [cogsSaving, setCogsSaving] = useState(false);

    const loadStatus = async () => {
        setLoadingStatus(true);
        const res = await billingApiService.getXobinStatus();
        if (res.success && res.data) setStatus(res.data);
        setLoadingStatus(false);
    };

    const loadInvites = async () => {
        setLoadingInvites(true);
        const res = await billingApiService.listXobinInvites({ limit: 25 });
        if (res.success && res.data) setInvites(res.data.items || []);
        setLoadingInvites(false);
    };

    const loadXobinPackages = async () => {
        setLoadingXobinPackages(true);
        const res = await billingApiService.getXobinPackagesAdmin();
        if (res.success && res.data) {
            setXobinPackages(res.data.packages);
            setDefaultCost(res.data.defaultCost);
            const edits: Record<string, string> = {};
            for (const p of res.data.packages) {
                edits[p.externalId] = p.creditCostOverride != null ? String(p.creditCostOverride) : '';
            }
            setPkgCostEdits(edits);
        }
        setLoadingXobinPackages(false);
    };

    const handleSyncXobinPackages = async () => {
        setSyncingPackages(true);
        const res = await billingApiService.syncXobinPackagesPlatform();
        if (res.success && res.data) {
            toast({
                title: 'Xobin packages synced',
                description: `${res.data.totalPackagesSynced} template(s) across ${res.data.companiesSynced} company scope(s)${res.data.errorCount ? ` · ${res.data.errorCount} error(s)` : ''}`,
            });
            await loadXobinPackages();
            await loadStatus();
        } else {
            toast({ title: 'Sync failed', description: res.error, variant: 'destructive' });
        }
        setSyncingPackages(false);
    };

    const handleSavePackageCosts = async () => {
        setSavingOverrides(true);
        const overrides: Record<string, number> = {};
        for (const [externalId, raw] of Object.entries(pkgCostEdits)) {
            const trimmed = (raw ?? '').trim();
            if (!trimmed) continue;
            const n = Number(trimmed);
            if (Number.isFinite(n) && n > 0) overrides[externalId] = Math.max(1, Math.round(n));
        }
        const res = await billingApiService.setXobinPackageCosts(overrides);
        if (res.success) {
            toast({
                title: 'Per-assessment credit costs saved',
                description: `${Object.keys(overrides).length} override(s) active. Others use default ${defaultCost} credit(s).`,
            });
            await loadXobinPackages();
        } else {
            toast({ title: 'Save failed', description: res.error, variant: 'destructive' });
        }
        setSavingOverrides(false);
    };

    const loadCogs = async () => {
        setCogsLoading(true);
        const res = await billingApiService.getXobinCogs();
        if (res.success && res.data) {
            setCogsAmount(res.data.cogsPerInvite != null ? String(res.data.cogsPerInvite) : '');
            setCogsCurrency(res.data.currency || 'USD');
        }
        setCogsLoading(false);
    };

    const handleSaveCogs = async () => {
        const amount = Number(cogsAmount);
        if (!Number.isFinite(amount) || amount < 0) {
            toast({ title: 'Invalid amount', description: 'Enter a non-negative number.', variant: 'destructive' });
            return;
        }
        setCogsSaving(true);
        const res = await billingApiService.setXobinCogs(amount, cogsCurrency);
        if (res.success) {
            toast({ title: 'COGS updated', description: `${cogsCurrency} ${amount.toFixed(2)} per invite` });
        } else {
            toast({ title: 'Failed to update COGS', description: res.error, variant: 'destructive' });
        }
        setCogsSaving(false);
    };

    const handleReverseInviteCredit = async (assessmentId: string, candidateName: string) => {
        setReversingInvite(assessmentId);
        const res = await billingApiService.reverseXobinInviteCredit(assessmentId);
        if (res.success) {
            const alreadyReversed = res.data?.alreadyReversed;
            toast({
                title: alreadyReversed ? 'Already reversed' : 'Credit reversed',
                description: `Invite for ${candidateName}: new balance ${res.data?.balanceAfter ?? 0}`,
            });
            await Promise.all([loadInvites(), loadStatus()]);
        } else {
            toast({ title: 'Reversal failed', description: res.error, variant: 'destructive' });
        }
        setReversingInvite(null);
    };

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

    useEffect(() => {
        void loadConfig();
        void loadPackages();
        void loadStatus();
        void loadInvites();
        void loadCogs();
        void loadXobinPackages();
    }, []);

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
                                Assessment Packages (Legacy SEATS mode)
                            </CardTitle>
                            <CardDescription>
                                Legacy seat-mode packages. Credits-first tenants should use Credit Packs + Credit Cost Map.
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

            {/* ── Synced Xobin templates + per-assessment credit overrides ── */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <RefreshCw className="h-5 w-5" />
                                Xobin assessment templates
                            </CardTitle>
                            <CardDescription>
                                Synced from the platform Xobin account. Override credit cost per template — blank uses the default ({defaultCost} credit{defaultCost === 1 ? '' : 's'} from Credit Cost Map).
                            </CardDescription>
                        </div>
                        <Button size="sm" onClick={handleSyncXobinPackages} disabled={syncingPackages}>
                            {syncingPackages ? <RefreshCw className="h-4 w-4 mr-1 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-1" />}
                            Sync now
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-3">
                    {loadingXobinPackages ? (
                        <div className="space-y-2">
                            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
                        </div>
                    ) : xobinPackages.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-6">
                            No Xobin templates synced yet. Set the platform API key, then click "Sync now".
                            {' '}If sync fails with a 500 from Xobin, log into Xobin and ensure the account has at least one assessment configured.
                        </p>
                    ) : (
                        <>
                            <div className="divide-y rounded-md border">
                                {xobinPackages.map((pkg) => (
                                    <div key={pkg.externalId} className="flex items-center justify-between px-4 py-3 gap-3">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="font-medium text-sm truncate">{pkg.name}</span>
                                                <Badge variant="outline" className="text-xs font-mono">{pkg.externalCode || pkg.externalId}</Badge>
                                                {pkg.status !== 'ACTIVE' && (
                                                    <Badge variant="secondary" className="text-xs">{pkg.status}</Badge>
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-0.5 truncate">
                                                {pkg.durationMinutes ? `${pkg.durationMinutes} min · ` : ''}
                                                {pkg.cutoffScore != null ? `cutoff ${pkg.cutoffScore} · ` : ''}
                                                effective cost: {pkg.effectiveCreditCost} credit{pkg.effectiveCreditCost === 1 ? '' : 's'}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <Label className="text-xs text-muted-foreground">Credits</Label>
                                            <Input
                                                type="number"
                                                min={1}
                                                placeholder={String(defaultCost)}
                                                value={pkgCostEdits[pkg.externalId] ?? ''}
                                                onChange={(e) =>
                                                    setPkgCostEdits((prev) => ({ ...prev, [pkg.externalId]: e.target.value }))
                                                }
                                                className="h-8 w-20 text-sm"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-end">
                                <Button size="sm" onClick={handleSavePackageCosts} disabled={savingOverrides}>
                                    {savingOverrides ? <RefreshCw className="h-4 w-4 mr-1 animate-spin" /> : null}
                                    Save credit overrides
                                </Button>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* ── Xobin Platform Status ───────────────────────────────────── */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5" />
                        Platform Status (last 30 days)
                    </CardTitle>
                    <CardDescription>
                        Live health metrics — invite volume, cancellations, credit reversals, last package sync.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loadingStatus ? (
                        <Skeleton className="h-24 w-full" />
                    ) : status ? (
                        <div className="grid gap-4 md:grid-cols-4">
                            <div className="rounded-lg border p-3">
                                <p className="text-xs text-muted-foreground">Invites 24h</p>
                                <p className="text-2xl font-semibold mt-1">{status.invites.last24h}</p>
                            </div>
                            <div className="rounded-lg border p-3">
                                <p className="text-xs text-muted-foreground">Invites 30d</p>
                                <p className="text-2xl font-semibold mt-1">{status.invites.last30d}</p>
                            </div>
                            <div className="rounded-lg border p-3">
                                <p className="text-xs text-muted-foreground">Cancelled 30d</p>
                                <p className="text-2xl font-semibold mt-1">{status.invites.cancelledLast30d}</p>
                            </div>
                            <div
                                className={`rounded-lg border p-3 ${
                                    status.invites.reversalsLast30d > 0
                                        ? 'border-amber-300 bg-amber-50'
                                        : ''
                                }`}
                            >
                                <p className="text-xs text-muted-foreground">Credit reversals 30d</p>
                                <p className="text-2xl font-semibold mt-1 flex items-center gap-1">
                                    <TrendingDown className="h-4 w-4" />
                                    {status.invites.reversalsLast30d}
                                </p>
                            </div>
                            <div className="rounded-lg border p-3 col-span-2">
                                <p className="text-xs text-muted-foreground">Synced packages</p>
                                <p className="text-sm font-medium mt-1">
                                    {status.catalog.totalPackages} packages · last sync{' '}
                                    {status.catalog.lastSyncAt
                                        ? new Date(status.catalog.lastSyncAt).toLocaleString()
                                        : 'never'}
                                </p>
                            </div>
                            <div className="rounded-lg border p-3 col-span-2">
                                <p className="text-xs text-muted-foreground">API key + webhook</p>
                                <p className="text-sm font-medium mt-1">
                                    {status.apiKey.configured ? `✓ Key via ${status.apiKey.source}` : '✗ No API key'}
                                    {' · '}
                                    {status.webhookSecret.configured ? '✓ Webhook secret set' : '✗ Webhook secret missing'}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">Could not load status.</p>
                    )}
                </CardContent>
            </Card>

            {/* ── COGS (margin analytics) ─────────────────────────────────── */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Coins className="h-5 w-5" />
                        Wholesale Cost (COGS) per Invite
                    </CardTitle>
                    <CardDescription>
                        The amount HRM8 pays Xobin per invite. Used for credit margin analytics — not exposed to customers.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {cogsLoading ? (
                        <Skeleton className="h-10 w-full" />
                    ) : (
                        <div className="flex flex-wrap items-end gap-3">
                            <div className="space-y-1">
                                <Label className="text-xs">Amount per invite</Label>
                                <Input
                                    type="number"
                                    min={0}
                                    step={0.01}
                                    value={cogsAmount}
                                    onChange={(e) => setCogsAmount(e.target.value)}
                                    className="max-w-[160px]"
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs">Currency</Label>
                                <Input
                                    value={cogsCurrency}
                                    onChange={(e) => setCogsCurrency(e.target.value.toUpperCase())}
                                    className="max-w-[100px]"
                                />
                            </div>
                            <Button onClick={handleSaveCogs} disabled={cogsSaving}>
                                {cogsSaving ? <RefreshCw className="h-4 w-4 animate-spin mr-1" /> : null}
                                Save COGS
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* ── Invites Monitor ─────────────────────────────────────────── */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <ArrowDownCircle className="h-5 w-5" />
                                Recent Xobin Invites
                            </CardTitle>
                            <CardDescription>
                                Latest invites across all companies. Use "Refund credit" when a cancelled invite still consumed a credit.
                            </CardDescription>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => void loadInvites()} disabled={loadingInvites}>
                            <RefreshCw className={`h-4 w-4 ${loadingInvites ? 'animate-spin' : ''}`} />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {loadingInvites ? (
                        <div className="space-y-2">
                            {[1, 2, 3].map((i) => (
                                <Skeleton key={i} className="h-12 w-full" />
                            ))}
                        </div>
                    ) : invites.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-6">No Xobin invites yet.</p>
                    ) : (
                        <div className="divide-y rounded-md border">
                            {invites.map((inv) => {
                                const isCancelled = inv.status === 'CANCELLED';
                                const hasLedger = !!inv.creditLedger;
                                const isReversed = inv.creditLedger?.isReversed === true;
                                const canReverse = hasLedger && !isReversed;
                                return (
                                    <div key={inv.id} className="flex items-center justify-between px-4 py-3 gap-3">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="font-medium text-sm truncate">
                                                    {inv.candidate?.name || 'Unknown candidate'}
                                                </span>
                                                <Badge
                                                    variant="outline"
                                                    className={`text-xs ${
                                                        inv.status === 'COMPLETED'
                                                            ? 'border-emerald-300 text-emerald-700 bg-emerald-50'
                                                            : inv.status === 'IN_PROGRESS'
                                                              ? 'border-blue-300 text-blue-700 bg-blue-50'
                                                              : inv.status === 'CANCELLED'
                                                                ? 'border-red-300 text-red-700 bg-red-50'
                                                                : ''
                                                    }`}
                                                >
                                                    {inv.status}
                                                </Badge>
                                                {hasLedger ? (
                                                    <Badge
                                                        variant="outline"
                                                        className={`text-xs ${
                                                            isReversed
                                                                ? 'border-amber-300 text-amber-700 bg-amber-50'
                                                                : 'border-slate-300 text-slate-700 bg-slate-50'
                                                        }`}
                                                    >
                                                        {isReversed ? 'Refunded' : `Consumed ${Math.abs(inv.creditLedger!.delta)} credit(s)`}
                                                    </Badge>
                                                ) : null}
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-0.5 truncate">
                                                {inv.candidate?.email || '—'}
                                                {inv.job ? ` · ${inv.job.title}` : ''}
                                                {inv.job?.company ? ` · ${inv.job.company.name}` : ''}
                                                {inv.invitedAt
                                                    ? ` · ${new Date(inv.invitedAt).toLocaleString()}`
                                                    : ''}
                                            </p>
                                        </div>
                                        {canReverse && (isCancelled || inv.status === 'EXPIRED') ? (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() =>
                                                    handleReverseInviteCredit(
                                                        inv.id,
                                                        inv.candidate?.name || 'candidate'
                                                    )
                                                }
                                                disabled={reversingInvite === inv.id}
                                            >
                                                {reversingInvite === inv.id ? 'Refunding…' : 'Refund credit'}
                                            </Button>
                                        ) : null}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
