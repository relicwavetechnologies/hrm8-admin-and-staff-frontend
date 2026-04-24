import { useEffect, useState } from 'react';
import { Hrm8PageLayout } from '@/shared/components/layouts/Hrm8PageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Button } from '@/shared/components/ui/button';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { useToast } from '@/shared/hooks/use-toast';
import { billingApiService } from '@/shared/lib/hrm8/billingApiService';
import { RefreshCw, Save, Sliders } from 'lucide-react';

/**
 * Admin editor for the credit cost map.
 *
 * Each action (Xobin assessment, AI interview, reference check, background checks)
 * costs a configurable number of credits. This is stored in SystemSettings and
 * resolved by the backend's EntitlementRouter on every consumption. Changes take
 * effect on the next action (30-second service-side cache).
 */
const CATEGORY_ORDER: { label: string; keys: Array<{ key: string; label: string; hint?: string }> }[] = [
    {
        label: 'Assessment Hub',
        keys: [{ key: 'assessment.xobin', label: 'Xobin assessment invite', hint: 'Charged once per invite, reversed on Xobin failure.' }],
    },
    {
        label: 'AI Interview',
        keys: [
            { key: 'ai_interview.video', label: 'AI video interview' },
            { key: 'ai_interview.phone', label: 'AI phone interview' },
            { key: 'ai_interview.form', label: 'AI form interview' },
        ],
    },
    {
        label: 'Reference Check',
        keys: [
            { key: 'reference_check.form', label: 'Form-based reference check' },
            { key: 'reference_check.ai_video', label: 'AI video reference check' },
        ],
    },
    {
        label: 'Background Check',
        keys: [
            { key: 'bg_check.identity', label: 'Identity verification' },
            { key: 'bg_check.criminal', label: 'Criminal check' },
            { key: 'bg_check.education', label: 'Education verification' },
            { key: 'bg_check.qualification', label: 'Qualification check' },
        ],
    },
];

export default function CreditCostMapPage() {
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [values, setValues] = useState<Record<string, number>>({});

    const load = async () => {
        setLoading(true);
        const res = await billingApiService.getCreditCostSettings();
        if (res.success && res.data) setValues(res.data.costMap || {});
        setLoading(false);
    };

    useEffect(() => {
        void load();
    }, []);

    const updateValue = (key: string, raw: string) => {
        const n = Math.max(1, Math.round(Number(raw) || 1));
        setValues((prev) => ({ ...prev, [key]: n }));
    };

    const save = async () => {
        setSaving(true);
        const res = await billingApiService.updateCreditCostSettings(values);
        if (res.success) {
            toast({ title: 'Cost map saved', description: 'Changes apply on the next consumption event.' });
        } else {
            toast({ title: 'Save failed', description: res.error, variant: 'destructive' });
        }
        setSaving(false);
    };

    return (
        <Hrm8PageLayout
            title="Credit Cost Map"
            subtitle="How many credits each assessment action costs."
        >
            <div className="space-y-6 p-6">
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Sliders className="h-5 w-5" />
                                    Cost per Action
                                </CardTitle>
                                <CardDescription>
                                    Every CREDITS-mode company uses this map when consuming credits. Stored in
                                    SystemSettings (<code className="text-xs">credit.cost.map</code>).
                                </CardDescription>
                            </div>
                            <Button variant="ghost" size="sm" onClick={load} disabled={loading}>
                                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {loading ? (
                            <div className="space-y-2">
                                {[1, 2, 3, 4].map((i) => (
                                    <Skeleton key={i} className="h-10 w-full" />
                                ))}
                            </div>
                        ) : (
                            CATEGORY_ORDER.map((cat) => (
                                <div key={cat.label} className="space-y-2">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                        {cat.label}
                                    </p>
                                    <div className="space-y-2">
                                        {cat.keys.map(({ key, label, hint }) => (
                                            <div
                                                key={key}
                                                className="flex items-center gap-3 rounded-md border px-3 py-2"
                                            >
                                                <div className="flex-1 min-w-0">
                                                    <Label className="text-sm">{label}</Label>
                                                    <p className="text-xs text-muted-foreground font-mono">{key}</p>
                                                    {hint ? (
                                                        <p className="text-xs text-muted-foreground mt-1">{hint}</p>
                                                    ) : null}
                                                </div>
                                                <Input
                                                    type="number"
                                                    min={1}
                                                    step={1}
                                                    value={values[key] ?? 1}
                                                    onChange={(e) => updateValue(key, e.target.value)}
                                                    className="w-24 text-right font-mono"
                                                />
                                                <span className="text-xs text-muted-foreground w-14">
                                                    {(values[key] ?? 1) === 1 ? 'credit' : 'credits'}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))
                        )}

                        <div className="pt-2 flex justify-end">
                            <Button onClick={save} disabled={saving || loading}>
                                <Save className="h-4 w-4 mr-1" />
                                {saving ? 'Saving…' : 'Save cost map'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </Hrm8PageLayout>
    );
}
