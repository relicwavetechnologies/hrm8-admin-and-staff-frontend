/**
 * Mock Stripe Onboarding Page
 * Simulates Stripe Connect onboarding flow in development mode
 */

import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { apiClient } from '@/shared/lib/api';
import { CheckCircle2, CreditCard, Building2, MapPin, Loader2 } from 'lucide-react';

export default function StripeMockOnboarding() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const accountId = searchParams.get('account_id');
    const returnUrl = searchParams.get('return_url');
    const refreshUrl = searchParams.get('refresh_url');

    // Mock form data (not actually used, just for UI)
    const [formData, setFormData] = useState({
        businessName: 'Mock Business Inc.',
        country: 'US',
        routingNumber: '110000000',
        accountNumber: '000123456789',
    });

    const handleComplete = async () => {
        setLoading(true);

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Call backend to approve the mock account
        try {
            const response = await apiClient.post('/api/integrations/stripe/approve-mock-account', {
              accountId: accountId
            });
            
            if (!response.success) {
               console.error('Failed to approve mock account:', response.error);
            }
        } catch (error) {
            console.error('Failed to approve mock account:', error);
        }

        // Redirect back to return URL
        if (returnUrl) {
            window.location.href = decodeURIComponent(returnUrl);
        } else {
            navigate('/integrations?tab=payments&stripe_success=true');
        }
    };

    const handleRefresh = () => {
        if (refreshUrl) {
            window.location.href = decodeURIComponent(refreshUrl);
        } else {
            navigate('/integrations?tab=payments&stripe_refresh=true');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 flex items-center justify-center p-4">
            <Card className="w-full max-w-2xl shadow-2xl">
                <CardHeader className="space-y-3 text-center border-b bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-t-lg">
                    <div className="flex justify-center">
                        <div className="rounded-full bg-white/20 p-4">
                            <CreditCard className="h-12 w-12 text-white" />
                        </div>
                    </div>
                    <CardTitle className="text-3xl font-bold">Mock Stripe Onboarding</CardTitle>
                    <CardDescription className="text-white/90 text-base">
                        🎭 Development Mode - Complete setup to connect your account
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6 p-6">
                    {/* Info Alert */}
                    <Alert className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                        <CheckCircle2 className="h-5 w-5 text-blue-600" />
                        <AlertDescription className="text-blue-900 dark:text-blue-100">
                            <strong>Development Mode Active</strong><br />
                            This is a mock onboarding flow. In production, this would be the real Stripe Connect onboarding.
                            <br /><br />
                            <code className="text-xs bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">
                                Account ID: {accountId}
                            </code>
                        </AlertDescription>
                    </Alert>

                    {/* Mock Form */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="businessName" className="flex items-center gap-2">
                                <Building2 className="h-4 w-4" />
                                Business Name
                            </Label>
                            <Input
                                id="businessName"
                                value={formData.businessName}
                                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                                placeholder="Your business name"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="country" className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                Country
                            </Label>
                            <Input
                                id="country"
                                value={formData.country}
                                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                placeholder="US"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="routing">Routing Number</Label>
                                <Input
                                    id="routing"
                                    value={formData.routingNumber}
                                    onChange={(e) => setFormData({ ...formData, routingNumber: e.target.value })}
                                    placeholder="110000000"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="account">Account Number</Label>
                                <Input
                                    id="account"
                                    value={formData.accountNumber}
                                    onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                                    placeholder="000123456789"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-3 pt-4">
                        <Button
                            variant="outline"
                            onClick={handleRefresh}
                            disabled={loading}
                            className="w-full"
                        >
                            Refresh Form
                        </Button>
                        <Button
                            onClick={handleComplete}
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Completing...
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                    Complete Onboarding
                                </>
                            )}
                        </Button>
                    </div>

                    {/* Info Footer */}
                    <div className="text-center text-sm text-muted-foreground pt-4 border-t">
                        <p>
                            Mock data is pre-filled. Click "Complete Onboarding" to simulate successful setup.
                        </p>
                        <p className="mt-2 text-xs">
                            In production, this would collect real business and banking information.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
