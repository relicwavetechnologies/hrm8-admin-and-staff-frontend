/**
 * Currency Setup Page
 * Compulsory first-time setup for consultants/sales agents/360 to choose their payout currency.
 * Shown when payout_currency_confirmed_at is null.
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/shared/contexts/AuthContext';
import { consultantAuthService } from '@/shared/lib/consultantAuthService';
import { getAvailableCurrencies } from '@/shared/lib/availableCurrenciesService';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Label } from '@/shared/components/ui/label';
import { AuthLayout } from '@/shared/components/auth/AuthLayout';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const FALLBACK_CURRENCIES = ['USD', 'GBP', 'EUR', 'AUD', 'INR', 'NZD', 'SGD', 'CAD'] as const;

export default function CurrencySetupPage() {
    const [loading, setLoading] = useState(false);
    const [currenciesLoading, setCurrenciesLoading] = useState(true);
    const [availableCurrencies, setAvailableCurrencies] = useState<string[]>([]);
    const [currenciesError, setCurrenciesError] = useState<string | null>(null);
    const [selectedCurrency, setSelectedCurrency] = useState<string>('');
    const { user, userType, refreshUser } = useAuth();
    const navigate = useNavigate();

    const raw = user?.rawUser as {
        defaultCurrency?: string;
        suggestedPayoutCurrency?: string;
        payoutCurrency?: string;
        requiresCurrencySetup?: boolean;
      } | undefined;
    const suggestedCurrency = raw?.suggestedPayoutCurrency ?? raw?.defaultCurrency ?? 'USD';

    useEffect(() => {
        if (user && userType && raw?.requiresCurrencySetup === false) {
            switch (userType) {
                case 'CONSULTANT':
                    navigate('/consultant/dashboard', { replace: true });
                    break;
                case 'SALES_AGENT':
                    navigate('/sales-agent/dashboard', { replace: true });
                    break;
                case 'CONSULTANT360':
                    navigate('/consultant360/dashboard', { replace: true });
                    break;
                default:
                    navigate('/consultant/dashboard', { replace: true });
            }
        }
    }, [user, userType, raw?.requiresCurrencySetup, navigate]);

    useEffect(() => {
        getAvailableCurrencies()
            .then((currencies) => {
                if (currencies.length > 0) {
                    setAvailableCurrencies(currencies);
                    setCurrenciesError(null);
                } else if (import.meta.env.PROD) {
                    setCurrenciesError('No billing currencies are configured yet. Contact support.');
                    setAvailableCurrencies([]);
                } else {
                    setAvailableCurrencies([...FALLBACK_CURRENCIES]);
                    setCurrenciesError('Using dev fallback list — pricing API returned no currencies.');
                }
            })
            .catch(() => {
                if (import.meta.env.PROD) {
                    setCurrenciesError('Could not load available currencies. Retry shortly or contact support.');
                    setAvailableCurrencies([]);
                } else {
                    setAvailableCurrencies([...FALLBACK_CURRENCIES]);
                    setCurrenciesError('Pricing API failed — using dev fallback list.');
                }
            })
            .finally(() => setCurrenciesLoading(false));
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const currency =
            selectedCurrency ||
            (availableCurrencies.includes(suggestedCurrency) ? suggestedCurrency : availableCurrencies[0] ?? 'USD');
        if (!currency) {
            toast.error('Please select a currency');
            return;
        }

        setLoading(true);
        try {
            const response = await consultantAuthService.updateCurrencyPreference(currency);
            if (response.success) {
                toast.success('Currency preference saved');
                await refreshUser();
                switch (userType) {
                    case 'CONSULTANT':
                        navigate('/consultant/dashboard', { replace: true });
                        break;
                    case 'SALES_AGENT':
                        navigate('/sales-agent/dashboard', { replace: true });
                        break;
                    case 'CONSULTANT360':
                        navigate('/consultant360/dashboard', { replace: true });
                        break;
                    default:
                        navigate('/consultant/dashboard', { replace: true });
                }
            } else {
                toast.error(response.error || 'Failed to save currency preference');
            }
        } catch (error) {
            toast.error('Failed to save currency preference');
        } finally {
            setLoading(false);
        }
    };

    const handleUseDefault = () => {
        setSelectedCurrency(
            availableCurrencies.includes(suggestedCurrency) ? suggestedCurrency : availableCurrencies[0] ?? 'USD'
        );
    };

    return (
        <AuthLayout>
            <Card className="max-w-md w-full">
                <CardHeader>
                    <CardTitle>Set Your Payout Currency</CardTitle>
                    <CardDescription>
                        Your default currency based on your region is {suggestedCurrency}. Keep it or choose another.
                        Only currencies with pricing available are shown. All commissions will be converted to your selected currency.
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        {currenciesError ? (
                            <p className="text-sm text-destructive" role="alert">
                                {currenciesError}
                            </p>
                        ) : null}
                        <div className="space-y-2">
                            <Label htmlFor="currency">Payout Currency</Label>
                            <Select
                                value={
                                    selectedCurrency ||
                                    (availableCurrencies.includes(suggestedCurrency) ? suggestedCurrency : availableCurrencies[0] ?? 'USD')
                                }
                                onValueChange={setSelectedCurrency}
                                disabled={loading || currenciesLoading || availableCurrencies.length === 0}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={currenciesLoading ? 'Loading currencies…' : 'Select currency'} />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableCurrencies.map((c) => (
                                        <SelectItem key={c} value={c}>
                                            {c}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleUseDefault}
                                disabled={loading || availableCurrencies.length === 0}
                            >
                                Use default ({suggestedCurrency})
                            </Button>
                            <Button
                                type="submit"
                                disabled={loading || currenciesLoading || availableCurrencies.length === 0}
                                className="flex-1"
                            >
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save & Continue
                            </Button>
                        </div>
                    </CardContent>
                </form>
            </Card>
        </AuthLayout>
    );
}
