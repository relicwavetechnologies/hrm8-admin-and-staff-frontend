/**
 * Unified Login Page
 * Allows users to select their portal type and sign in
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/shared/contexts/AuthContext';
import { UserType } from '@/shared/services/authService';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Loader2, ShieldCheck, UserCog, BadgeDollarSign, Globe } from 'lucide-react';
import { AuthLayout } from '@/shared/components/auth/AuthLayout';

const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
    type: z.enum(['ADMIN', 'CONSULTANT', 'SALES_AGENT', 'CONSULTANT360'] as const),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const [isLoading, setIsLoading] = useState(false);
    const { login, isAuthenticated, userType } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated && userType) {
            switch (userType) {
                case 'ADMIN':
                    navigate('/hrm8/dashboard');
                    break;
                case 'CONSULTANT':
                    navigate('/consultant/dashboard');
                    break;
                case 'SALES_AGENT':
                    navigate('/sales-agent/dashboard');
                    break;
                case 'CONSULTANT360':
                    navigate('/consultant360/dashboard');
                    break;
                default:
                    navigate('/hrm8/dashboard');
            }
        }
    }, [isAuthenticated, userType, navigate]);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            type: (localStorage.getItem('hrm8_user_type') as UserType) || 'ADMIN',
        },
    });

    const selectedType = watch('type');

    const onSubmit = async (data: LoginFormData) => {
        setIsLoading(true);
        await login(data.email, data.password, data.type);
        setIsLoading(false);
    };

    const getTypeIcon = (type: UserType) => {
        switch (type) {
            case 'ADMIN': return <ShieldCheck className="h-5 w-5" />;
            case 'CONSULTANT': return <UserCog className="h-5 w-5" />;
            case 'SALES_AGENT': return <BadgeDollarSign className="h-5 w-5" />;
            case 'CONSULTANT360': return <Globe className="h-5 w-5" />;
        }
    };

    const getTypeLabel = (type: UserType) => {
        switch (type) {
            case 'ADMIN': return 'HRM8 Admin';
            case 'CONSULTANT': return 'Consultant Portal';
            case 'SALES_AGENT': return 'Sales Agent Portal';
            case 'CONSULTANT360': return 'Consultant 360';
        }
    };

    return (
        <AuthLayout>
            <Card className="border-0 shadow-none bg-transparent max-w-md w-full mx-auto">
                <CardHeader className="space-y-3 pb-6 text-center">
                    <div className="flex justify-center mb-2">
                        <div className="p-3 bg-primary/10 rounded-xl text-primary">
                            {getTypeIcon(selectedType)}
                        </div>
                    </div>
                    <CardTitle className="text-3xl font-bold tracking-tight">
                        {getTypeLabel(selectedType)}
                    </CardTitle>
                    <CardDescription className="text-base">
                        Sign in to your account to continue
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="type" className="text-sm font-medium">Portal Type</Label>
                            <Select
                                onValueChange={(value) => setValue('type', value as UserType)}
                                defaultValue={selectedType}
                            >
                                <SelectTrigger className="h-11 bg-background">
                                    <SelectValue placeholder="Select portal type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ADMIN">HRM8 Admin</SelectItem>
                                    <SelectItem value="CONSULTANT">Consultant Portal</SelectItem>
                                    <SelectItem value="SALES_AGENT">Sales Agent Portal</SelectItem>
                                    <SelectItem value="CONSULTANT360">Consultant 360</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="name@company.com"
                                className="h-11 bg-background"
                                {...register('email')}
                                disabled={isLoading}
                            />
                            {errors.email && <p className="text-sm text-destructive font-medium">{errors.email.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                                <Button variant="link" className="p-0 h-auto text-xs font-medium" type="button">
                                    Forgot password?
                                </Button>
                            </div>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                className="h-11 bg-background"
                                {...register('password')}
                                disabled={isLoading}
                            />
                            {errors.password && <p className="text-sm text-destructive font-medium">{errors.password.message}</p>}
                        </div>

                        <Button type="submit" className="w-full h-11 text-base font-semibold transition-all shadow-md active:scale-[0.98]" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isLoading ? 'Signing in...' : 'Sign in'}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4 pt-6">
                    <div className="text-sm text-center text-muted-foreground">
                        <p>Access restricted to authorized personnel only.</p>
                    </div>
                </CardFooter>
            </Card>
        </AuthLayout>
    );
}
