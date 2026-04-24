import { useEffect, useState } from 'react';
import { Hrm8PageLayout } from '@/shared/components/layouts/Hrm8PageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Badge } from '@/shared/components/ui/badge';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { useToast } from '@/shared/hooks/use-toast';
import {
    billingApiService,
    type CreditPackage,
    type CreateCreditPackageInput,
} from '@/shared/lib/hrm8/billingApiService';
import { Coins, Plus, Pencil, Trash2, RefreshCw, Sparkles } from 'lucide-react';

/**
 * Admin CRUD for Assessment Hub credit pack SKUs.
 *
 * Assessment Hub packs are USD-only per the 2026 Pricing Booklet. Regional
 * currency conversion happens at checkout via Airwallex FX — NEVER in the
 * catalog — so we enforce USD here in the UI to prevent accidental misuse.
 */
export default function CreditPacksAdminPage() {
    const { toast } = useToast();

    const [packages, setPackages] = useState<CreditPackage[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState<CreateCreditPackageInput>({
        code: '',
        name: '',
        description: '',
        displayOrder: 100,
        creditsIncluded: 100,
        basePrice: 0,
        currency: 'USD',
        billingTag: null,
    });

    const load = async () => {
        setLoading(true);
        const res = await billingApiService.listCreditPackages(true);
        if (res.success && res.data) setPackages(res.data.packages);
        setLoading(false);
    };

    useEffect(() => {
        void load();
    }, []);

    const resetForm = () => {
        setForm({
            code: '',
            name: '',
            description: '',
            displayOrder: 100,
            creditsIncluded: 100,
            basePrice: 0,
            currency: 'USD',
            billingTag: null,
        });
        setEditingId(null);
        setShowForm(false);
    };

    const handleEdit = (pkg: CreditPackage) => {
        setForm({
            code: pkg.code,
            name: pkg.name,
            description: pkg.description ?? '',
            displayOrder: pkg.display_order,
            creditsIncluded: pkg.credits_included,
            basePrice: pkg.base_price,
            currency: pkg.currency,
            regionId: pkg.region_id ?? null,
            billingTag: pkg.billing_tag,
            isActive: pkg.is_active,
        });
        setEditingId(pkg.id);
        setShowForm(true);
    };

    const handleSave = async () => {
        if (!form.code.trim() || !form.name.trim() || form.creditsIncluded <= 0 || form.basePrice < 0) {
            toast({
                title: 'Missing fields',
                description: 'Code, name, positive credits, and non-negative price are required.',
                variant: 'destructive',
            });
            return;
        }
        if (form.currency !== 'USD') {
            toast({
                title: 'USD-only',
                description: 'Assessment Hub packs must be priced in USD. FX conversion happens at checkout.',
                variant: 'destructive',
            });
            return;
        }
        setSaving(true);
        const res = editingId
            ? await billingApiService.updateCreditPackage(editingId, form)
            : await billingApiService.createCreditPackage(form);
        if (res.success) {
            toast({ title: editingId ? 'Pack updated' : 'Pack created' });
            resetForm();
            await load();
        } else {
            toast({ title: 'Save failed', description: res.error, variant: 'destructive' });
        }
        setSaving(false);
    };

    const handleDeactivate = async (id: string, name: string) => {
        const res = await billingApiService.deactivateCreditPackage(id);
        if (res.success) {
            toast({ title: `${name} deactivated` });
            await load();
        } else {
            toast({ title: 'Deactivate failed', description: res.error, variant: 'destructive' });
        }
    };

    return (
        <Hrm8PageLayout
            title="Credit Packs"
            subtitle="CRUD for Assessment Hub credit SKUs (USD-pegged, FX at checkout)."
        >
            <div className="space-y-6 p-6">
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Coins className="h-5 w-5" />
                                    Credit Packs
                                </CardTitle>
                                <CardDescription>
                                    These SKUs appear on customers' /subscriptions pages. Prices are in USD;
                                    customers pay in their billing currency via live Airwallex FX at checkout.
                                </CardDescription>
                            </div>
                            <Button
                                size="sm"
                                onClick={() => {
                                    resetForm();
                                    setShowForm(true);
                                }}
                            >
                                <Plus className="h-4 w-4 mr-1" />
                                New Pack
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {showForm && (
                            <div className="border rounded-lg p-4 space-y-3 bg-muted/30">
                                <h3 className="font-medium text-sm">{editingId ? 'Edit Pack' : 'New Pack'}</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <Label className="text-xs">Code (unique)</Label>
                                        <Input
                                            placeholder="e.g. CREDITS_100_USD"
                                            value={form.code}
                                            onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                                            disabled={Boolean(editingId)}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">Display name</Label>
                                        <Input
                                            value={form.name}
                                            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                                        />
                                    </div>
                                    <div className="space-y-1 col-span-2">
                                        <Label className="text-xs">Description</Label>
                                        <Input
                                            value={form.description ?? ''}
                                            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">Credits included</Label>
                                        <Input
                                            type="number"
                                            min={1}
                                            value={form.creditsIncluded}
                                            onChange={(e) =>
                                                setForm((f) => ({ ...f, creditsIncluded: Number(e.target.value) }))
                                            }
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">Base price (USD)</Label>
                                        <Input
                                            type="number"
                                            min={0}
                                            step={0.01}
                                            value={form.basePrice}
                                            onChange={(e) =>
                                                setForm((f) => ({ ...f, basePrice: Number(e.target.value) }))
                                            }
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">Display order</Label>
                                        <Input
                                            type="number"
                                            min={0}
                                            value={form.displayOrder ?? 100}
                                            onChange={(e) =>
                                                setForm((f) => ({ ...f, displayOrder: Number(e.target.value) }))
                                            }
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">Badge (optional)</Label>
                                        <Input
                                            placeholder="POPULAR | BEST_VALUE"
                                            value={form.billingTag ?? ''}
                                            onChange={(e) =>
                                                setForm((f) => ({
                                                    ...f,
                                                    billingTag: e.target.value.trim() || null,
                                                }))
                                            }
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button size="sm" onClick={handleSave} disabled={saving}>
                                        {saving ? <RefreshCw className="h-4 w-4 animate-spin mr-1" /> : null}
                                        {editingId ? 'Save changes' : 'Create pack'}
                                    </Button>
                                    <Button size="sm" variant="ghost" onClick={resetForm}>
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        )}

                        {loading ? (
                            <div className="space-y-2">
                                {[1, 2, 3].map((i) => (
                                    <Skeleton key={i} className="h-14 w-full" />
                                ))}
                            </div>
                        ) : packages.length === 0 ? (
                            <div className="text-center py-6 space-y-3">
                                <p className="text-sm text-muted-foreground">No credit packs configured.</p>
                                <p className="text-xs text-muted-foreground inline-flex items-center gap-1">
                                    <Sparkles className="h-3 w-3" />
                                    Seed the booklet defaults by running{' '}
                                    <code>npx tsx scripts/seed-credit-packs.ts</code> on the backend.
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y rounded-md border">
                                {packages.map((pkg) => {
                                    const unit =
                                        pkg.credits_included > 0
                                            ? (pkg.base_price / pkg.credits_included).toFixed(2)
                                            : '—';
                                    return (
                                        <div
                                            key={pkg.id}
                                            className="flex items-center justify-between px-4 py-3"
                                        >
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="font-medium text-sm">{pkg.name}</span>
                                                    <Badge variant="outline" className="text-xs font-mono">
                                                        {pkg.code}
                                                    </Badge>
                                                    {pkg.billing_tag ? (
                                                        <Badge className="text-xs">{pkg.billing_tag}</Badge>
                                                    ) : null}
                                                    {pkg.is_active ? (
                                                        <Badge className="text-xs bg-green-500/15 text-green-700 border-green-500/30">
                                                            Active
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="secondary" className="text-xs">
                                                            Inactive
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-xs text-muted-foreground mt-0.5">
                                                    {pkg.credits_included} credits · ${pkg.base_price.toFixed(2)} USD ·
                                                    ${unit}/credit
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-1 shrink-0 ml-4">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={() => handleEdit(pkg)}
                                                >
                                                    <Pencil className="h-3.5 w-3.5" />
                                                </Button>
                                                {pkg.is_active && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-destructive hover:text-destructive"
                                                        onClick={() => handleDeactivate(pkg.id, pkg.name)}
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </Hrm8PageLayout>
    );
}
