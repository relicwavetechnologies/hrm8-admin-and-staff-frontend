/**
 * Consultant Setup Account Page
 * Handles invite links for new consultants. Reads token from URL and redirects to login.
 */

import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { AuthLayout } from '@/shared/components/auth/AuthLayout';

export default function ConsultantSetupAccountPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');
    const consultantId = searchParams.get('consultantId');

    useEffect(() => {
        if (token) {
            localStorage.setItem('hrm8_user_type', 'CONSULTANT');
        }
    }, [token]);

    const handleContinue = () => {
        navigate('/login');
    };

    return (
        <AuthLayout>
            <Card className="max-w-md w-full">
                <CardHeader>
                    <CardTitle>Complete Your Account Setup</CardTitle>
                    <CardDescription>
                        You've been invited to join as a consultant. Click below to sign in with your credentials.
                        {!token && ' (Invalid or missing invitation link.)'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button onClick={handleContinue} className="w-full">
                        Continue to Login
                    </Button>
                    {consultantId && (
                        <p className="text-xs text-muted-foreground mt-4 text-center">
                            Consultant ID: {consultantId}
                        </p>
                    )}
                </CardContent>
            </Card>
        </AuthLayout>
    );
}
