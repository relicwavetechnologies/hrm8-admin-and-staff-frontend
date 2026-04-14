import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Button } from '@/shared/components/ui/button';
import { apiClient } from '@/shared/lib/apiClient';
import { toast } from 'sonner';

interface CommissionRatesConfig {
  subscriptions: {
    PAYG?: number | null;
    SMALL?: number | null;
    MEDIUM?: number | null;
    LARGE?: number | null;
    ENTERPRISE?: number | null;
  };
  services: {
    SHORTLISTING?: number | null;
    FULL_SERVICE?: number | null;
    EXECUTIVE_SEARCH?: number | null;
    RPO?: number | null;
  };
}

const EMPTY_RATES: CommissionRatesConfig = {
  subscriptions: {
    PAYG: null,
    SMALL: null,
    MEDIUM: null,
    LARGE: null,
    ENTERPRISE: null,
  },
  services: {
    SHORTLISTING: null,
    FULL_SERVICE: null,
    EXECUTIVE_SEARCH: null,
    RPO: null,
  },
};

export function CommissionRatesSettingsTab() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [rates, setRates] = useState<CommissionRatesConfig>(EMPTY_RATES);

  useEffect(() => {
    void loadRates();
  }, []);

  const loadRates = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<CommissionRatesConfig>('/api/hrm8/settings/commission-rates');
      if (!response.success || !response.data) {
        toast.error(response.error || 'Failed to load commission rates');
        return;
      }
      setRates({
        subscriptions: { ...EMPTY_RATES.subscriptions, ...response.data.subscriptions },
        services: { ...EMPTY_RATES.services, ...response.data.services },
      });
    } catch (error) {
      toast.error('Failed to load commission rates');
    } finally {
      setLoading(false);
    }
  };

  const formatPercent = (value: number | null | undefined) => {
    if (value == null) return '';
    return String(Number((value * 100).toFixed(2)));
  };

  const updateRate = (
    category: 'subscriptions' | 'services',
    key: string,
    rawValue: string
  ) => {
    const nextValue = rawValue === '' ? null : Number(rawValue) / 100;
    setRates((current) => ({
      ...current,
      [category]: {
        ...current[category],
        [key]: Number.isFinite(nextValue) ? nextValue : null,
      },
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await apiClient.patch('/api/hrm8/settings/commission-rates', rates);
      if (!response.success) {
        toast.error(response.error || 'Failed to save commission rates');
        return;
      }
      toast.success('Commission rates updated');
    } catch (error) {
      toast.error('Failed to save commission rates');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-10">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Commission Rates</CardTitle>
        <CardDescription>
          Set the global base earning rates for each live subscription plan and each HRM8 managed service.
          Staff-specific overrides can then be applied on individual staff profiles for future work only.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium">Subscription Plans</p>
            <p className="text-xs text-muted-foreground">Used for future subscription sales, including PAYG sales logic.</p>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {Object.keys(rates.subscriptions).map((planKey) => (
              <div key={planKey} className="space-y-2">
                <Label htmlFor={`subscription-rate-${planKey}`}>{planKey} (%)</Label>
                <Input
                  id={`subscription-rate-${planKey}`}
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={formatPercent(rates.subscriptions[planKey as keyof typeof rates.subscriptions])}
                  onChange={(event) => updateRate('subscriptions', planKey, event.target.value)}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium">HRM8 Managed Services</p>
            <p className="text-xs text-muted-foreground">Used for future service commissions after the job is billed and assigned.</p>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {Object.keys(rates.services).map((serviceKey) => (
              <div key={serviceKey} className="space-y-2">
                <Label htmlFor={`service-rate-${serviceKey}`}>{serviceKey.replace(/_/g, ' ')} (%)</Label>
                <Input
                  id={`service-rate-${serviceKey}`}
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={formatPercent(rates.services[serviceKey as keyof typeof rates.services])}
                  onChange={(event) => updateRate('services', serviceKey, event.target.value)}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end border-t pt-4">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Save Rates
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
