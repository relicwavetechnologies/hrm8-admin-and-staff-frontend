import { useEffect, useState } from 'react';
import { Hrm8PageLayout } from '@/shared/components/layouts/Hrm8PageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Skeleton } from '@/shared/components/ui/skeleton';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/shared/components/ui/select';
import { useToast } from '@/shared/hooks/use-toast';
import {
    billingApiService,
    type CompanyCreditSummary,
} from '@/shared/lib/hrm8/billingApiService';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/shared/components/ui/dialog';
import { Label } from '@/shared/components/ui/label';
import { Coins, Search, RefreshCw, ArrowRightLeft, Plus } from 'lucide-react';

/**
 * Admin dashboard for per-company credit state.
 * - Lists companies with current balance + mode.
 * - Lets admin flip between SEATS / CREDITS modes.
 * - Lets admin manually grant/revoke credits (ADJUSTMENT ledger entries).
 */
export default function CompanyCreditsAdminPage() {
    const { toast } = useToast();
    const [rows, setRows] = useState<CompanyCreditSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [modeFilter, setModeFilter] = useState<'ALL' | 'SEATS' | 'CREDITS'>('ALL');
    const [adjustCompany, setAdjustCompany] = useState<CompanyCreditSummary | null>(null);
    const [adjustDelta, setAdjustDelta] = useState('');
    const [adjustReason, setAdjustReason] = useState('ADJUSTMENT');
    const [adjustNotes, setAdjustNotes] = useState('');
    const [adjustSaving, setAdjustSaving] = useState(false);
    const [flippingId, setFlippingId] = useState<string | null>(null);

    const load = async () => {
        setLoading(true);
        const res = await billingApiService.listCompanyCreditSummaries({
            search: search || undefined,
            mode: modeFilter === 'ALL' ? undefined : modeFilter,
            limit: 100,
        });
        if (res.success && res.data) setRows(res.data.items || []);
        setLoading(false);
    };

    useEffect(() => {
        void load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [modeFilter]);

    const flipMode = async (company: CompanyCreditSummary) => {
        const target = company.creditMode === 'CREDITS' ? 'SEATS' : 'CREDITS';
        if (!window.confirm(`Flip ${company.name} to ${target}? This is immediate.`)) return;
        setFlippingId(company.id);
        const res = await billingApiService.updateCompanyCreditMode(company.id, target);
        if (res.success) {
            toast({ title: `Flipped to ${target}`, description: company.name });
            await load();
        } else {
            toast({ title: 'Flip failed', description: res.error, variant: 'destructive' });
        }
        setFlippingId(null);
    };

    const openAdjustDialog = (company: CompanyCreditSummary) => {
        setAdjustCompany(company);
        setAdjustDelta('');
        setAdjustReason('ADJUSTMENT');
        setAdjustNotes('');
    };

    const submitAdjustment = async () => {
        if (!adjustCompany) return;
        const delta = Number(adjustDelta);
        if (!Number.isFinite(delta) || delta === 0) {
            toast({ title: 'Enter a non-zero delta', variant: 'destructive' });
            return;
        }
        setAdjustSaving(true);
        const res = await billingApiService.createCreditAdjustment(adjustCompany.id, {
            delta,
            reason: adjustReason,
            metadata: adjustNotes ? { notes: adjustNotes } : undefined,
        });
        if (res.success) {
            toast({
                title: delta > 0 ? `Granted ${delta} credits` : `Revoked ${Math.abs(delta)} credits`,
                description: adjustCompany.name,
            });
            setAdjustCompany(null);
            await load();
        } else {
            toast({ title: 'Adjustment failed', description: res.error, variant: 'destructive' });
        }
        setAdjustSaving(false);
    };

    return (
        <Hrm8PageLayout
            title="Company Credits"
            subtitle="Balances, mode flips, and manual credit grants across all companies."
        >
            <div className="space-y-6 p-6">
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between flex-wrap gap-3">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Coins className="h-5 w-5" />
                                    Companies
                                </CardTitle>
                                <CardDescription>
                                    Filter by mode and search by name or domain. Click a row for actions.
                                </CardDescription>
                            </div>
                            <div className="flex gap-2">
                                <div className="relative">
                                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                                    <Input
                                        placeholder="Search name/domain"
                                        className="pl-8 w-64"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && load()}
                                    />
                                </div>
                                <Select value={modeFilter} onValueChange={(v) => setModeFilter(v as any)}>
                                    <SelectTrigger className="w-36">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ALL">All modes</SelectItem>
                                        <SelectItem value="SEATS">SEATS</SelectItem>
                                        <SelectItem value="CREDITS">CREDITS</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Button variant="ghost" size="icon" onClick={load} disabled={loading}>
                                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="space-y-2">
                                {[1, 2, 3, 4].map((i) => (
                                    <Skeleton key={i} className="h-14 w-full" />
                                ))}
                            </div>
                        ) : rows.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-6">No companies match.</p>
                        ) : (
                            <div className="divide-y rounded-md border">
                                {rows.map((company) => (
                                    <div
                                        key={company.id}
                                        className="flex items-center justify-between px-4 py-3 gap-3"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="font-medium text-sm">{company.name}</span>
                                                <Badge variant="outline" className="text-xs">
                                                    {company.domain}
                                                </Badge>
                                                {company.billingCurrency ? (
                                                    <Badge variant="outline" className="text-xs">
                                                        {company.billingCurrency}
                                                    </Badge>
                                                ) : null}
                                                <Badge
                                                    variant="outline"
                                                    className={`text-xs ${
                                                        company.creditMode === 'CREDITS'
                                                            ? 'border-emerald-300 text-emerald-700 bg-emerald-50'
                                                            : 'border-slate-300 text-slate-700 bg-slate-50'
                                                    }`}
                                                >
                                                    {company.creditMode}
                                                </Badge>
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                Balance <span className="font-semibold">{company.balance.available}</span> ·
                                                Purchased {company.balance.totalPurchased} · Consumed{' '}
                                                {company.balance.totalConsumed} · Adjusted{' '}
                                                {company.balance.totalAdjusted}
                                                {company.balance.lastActivityAt
                                                    ? ` · last activity ${new Date(company.balance.lastActivityAt).toLocaleDateString()}`
                                                    : ''}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => openAdjustDialog(company)}
                                            >
                                                <Plus className="h-3.5 w-3.5 mr-1" />
                                                Adjust
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => flipMode(company)}
                                                disabled={flippingId === company.id}
                                            >
                                                <ArrowRightLeft className="h-3.5 w-3.5 mr-1" />
                                                {flippingId === company.id
                                                    ? 'Flipping…'
                                                    : `Flip to ${company.creditMode === 'CREDITS' ? 'SEATS' : 'CREDITS'}`}
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Adjust credits dialog */}
            <Dialog open={Boolean(adjustCompany)} onOpenChange={(next) => !next && setAdjustCompany(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Adjust credits for {adjustCompany?.name}</DialogTitle>
                        <DialogDescription>
                            Positive numbers grant credits, negative numbers revoke. Writes an ADJUSTMENT ledger
                            entry with your user id as the operator.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3">
                        <div className="space-y-1">
                            <Label>Delta (credits)</Label>
                            <Input
                                type="number"
                                value={adjustDelta}
                                onChange={(e) => setAdjustDelta(e.target.value)}
                                placeholder="e.g. 10 or -5"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label>Reason</Label>
                            <Select value={adjustReason} onValueChange={setAdjustReason}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ADJUSTMENT">ADJUSTMENT</SelectItem>
                                    <SelectItem value="MIGRATION_GRANT">MIGRATION_GRANT</SelectItem>
                                    <SelectItem value="REFUND">REFUND</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1">
                            <Label>Notes (optional)</Label>
                            <Input
                                value={adjustNotes}
                                onChange={(e) => setAdjustNotes(e.target.value)}
                                placeholder="e.g. goodwill credits after outage"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setAdjustCompany(null)}>
                            Cancel
                        </Button>
                        <Button onClick={submitAdjustment} disabled={adjustSaving || !adjustDelta}>
                            {adjustSaving ? 'Saving…' : 'Apply'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Hrm8PageLayout>
    );
}
