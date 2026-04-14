/**
 * Staff Form Component
 * Form for creating/editing staff members (HRM8 Admin)
 */

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { useHrm8Auth } from '@/contexts/Hrm8AuthContext';
import {
  staffService,
  StaffCreateResponse,
  type CommissionRatesConfig,
  type StaffPendingTasksData,
} from '@/shared/services/hrm8/staffService';
import { regionService } from '@/shared/services/hrm8/regionService';
import { HRM8_SUPPORTED_CURRENCIES } from '@/shared/lib/supportedCurrencies';
import { toast } from 'sonner';
import { Loader2, Mail } from 'lucide-react';

const SUPPORTED_CURRENCIES = HRM8_SUPPORTED_CURRENCIES;
const SUBSCRIPTION_RATE_KEYS = ['PAYG', 'SMALL', 'MEDIUM', 'LARGE', 'ENTERPRISE'] as const;
const SERVICE_RATE_KEYS = ['SHORTLISTING', 'FULL_SERVICE', 'EXECUTIVE_SEARCH', 'RPO'] as const;

const optionalRateField = z.number().min(0).max(100).optional();

type FormCommissionRates = {
  subscriptions: Record<(typeof SUBSCRIPTION_RATE_KEYS)[number], number | undefined>;
  services: Record<(typeof SERVICE_RATE_KEYS)[number], number | undefined>;
};

const EMPTY_COMMISSION_RATES: FormCommissionRates = {
  subscriptions: {
    PAYG: undefined,
    SMALL: undefined,
    MEDIUM: undefined,
    LARGE: undefined,
    ENTERPRISE: undefined,
  },
  services: {
    SHORTLISTING: undefined,
    FULL_SERVICE: undefined,
    EXECUTIVE_SEARCH: undefined,
    RPO: undefined,
  },
};

const toFormCommissionRates = (
  rates?: CommissionRatesConfig | null
): FormCommissionRates => ({
  subscriptions: {
    PAYG: rates?.subscriptions?.PAYG ?? undefined,
    SMALL: rates?.subscriptions?.SMALL ?? undefined,
    MEDIUM: rates?.subscriptions?.MEDIUM ?? undefined,
    LARGE: rates?.subscriptions?.LARGE ?? undefined,
    ENTERPRISE: rates?.subscriptions?.ENTERPRISE ?? undefined,
  },
  services: {
    SHORTLISTING: rates?.services?.SHORTLISTING ?? undefined,
    FULL_SERVICE: rates?.services?.FULL_SERVICE ?? undefined,
    EXECUTIVE_SEARCH: rates?.services?.EXECUTIVE_SEARCH ?? undefined,
    RPO: rates?.services?.RPO ?? undefined,
  },
});

export const staffSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters').optional(),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().optional(),
  role: z.enum(['RECRUITER', 'SALES_AGENT', 'CONSULTANT_360']),
  regionId: z.string().min(1, 'Region is required'),
  defaultCommissionRate: z.number().min(0).max(100).optional(),
  defaultCurrency: z.enum(SUPPORTED_CURRENCIES).default('USD'),
  commissionRates: z.object({
    subscriptions: z.object({
      PAYG: optionalRateField,
      SMALL: optionalRateField,
      MEDIUM: optionalRateField,
      LARGE: optionalRateField,
      ENTERPRISE: optionalRateField,
    }),
    services: z.object({
      SHORTLISTING: optionalRateField,
      FULL_SERVICE: optionalRateField,
      EXECUTIVE_SEARCH: optionalRateField,
      RPO: optionalRateField,
    }),
  }).default(EMPTY_COMMISSION_RATES),
});

export type StaffFormData = z.infer<typeof staffSchema>;

interface StaffFormProps {
  consultantId?: string | null;
  onSave: () => void;
  onCancel: () => void;
}

export function StaffForm({ consultantId, onSave, onCancel }: StaffFormProps) {
  const { hrm8User } = useHrm8Auth();
  const [loading, setLoading] = useState(false);
  const [loadingConsultant, setLoadingConsultant] = useState(!!consultantId);
  const [generatingEmail, setGeneratingEmail] = useState(false);
  const [regions, setRegions] = useState<Array<{ id: string; name: string }>>([]);
  const [pendingTasks, setPendingTasks] = useState<StaffPendingTasksData | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<StaffFormData>({
    resolver: zodResolver(staffSchema),
    defaultValues: {
      role: 'RECRUITER',
      regionId: '',
      defaultCommissionRate: 10,
      defaultCurrency: 'USD',
      commissionRates: EMPTY_COMMISSION_RATES,
    },
  });

  useEffect(() => {
    if (consultantId) {
      loadConsultant();
    }
    loadRegions();
  }, [consultantId]);

  const loadConsultant = async () => {
    if (!consultantId) return;

    try {
      setLoadingConsultant(true);
      const [response, tasksResponse] = await Promise.all([
        staffService.getById(consultantId),
        staffService.getPendingTasks(consultantId),
      ]);
      if (response.success && response.data?.consultant) {
        const consultant = response.data.consultant;
        setValue('email', consultant.email);
        setValue('firstName', consultant.firstName);
        setValue('lastName', consultant.lastName);
        setValue('phone', consultant.phone || '');
        setValue('role', consultant.role);
        setValue('regionId', consultant.regionId || '');
        setValue('defaultCommissionRate', consultant.defaultCommissionRate ?? 10);
        const raw = (consultant as { defaultCurrency?: string }).defaultCurrency ?? 'USD';
        const currency: (typeof SUPPORTED_CURRENCIES)[number] = SUPPORTED_CURRENCIES.includes(raw as (typeof SUPPORTED_CURRENCIES)[number]) ? (raw as (typeof SUPPORTED_CURRENCIES)[number]) : 'USD';
        setValue('defaultCurrency', currency);
        setValue('commissionRates', toFormCommissionRates(consultant.commissionRates));
      }
      if (tasksResponse.success && tasksResponse.data) {
        setPendingTasks(tasksResponse.data);
      } else {
        setPendingTasks(null);
      }
    } catch (error) {
      toast.error('Failed to load staff member');
    } finally {
      setLoadingConsultant(false);
    }
  };

  const loadRegions = async () => {
    try {
      const response = await regionService.getAll({ isActive: true });
      if (response.success && response.data?.regions) {
        let availableRegions = response.data.regions.map(r => ({ id: r.id, name: r.name }));

        // If user is a Regional Licensee, only show their assigned regions
        if (hrm8User?.role === 'REGIONAL_LICENSEE' && hrm8User.regionIds?.length) {
          availableRegions = availableRegions.filter(r => hrm8User.regionIds!.includes(r.id));

          // Auto-select if only one region
          if (availableRegions.length === 1 && !consultantId) {
            setValue('regionId', availableRegions[0].id);
          }
        }

        setRegions(availableRegions);
      }
    } catch (error) {
      console.error('Failed to load regions:', error);
    }
  };

  const handleGenerateEmail = async () => {
    const firstName = watch('firstName');
    const lastName = watch('lastName');

    if (!firstName || !lastName) {
      toast.error('Please enter first name and last name first');
      return;
    }

    try {
      setGeneratingEmail(true);
      const response = await staffService.generateEmail({
        firstName,
        lastName,
        consultantId: consultantId || undefined,
      });

      if (response.success && response.data?.email) {
        setValue('email', response.data.email);
        toast.success('Email generated successfully');
      } else {
        toast.error(response.error || 'Failed to generate email');
      }
    } catch (error) {
      toast.error('Failed to generate email');
    } finally {
      setGeneratingEmail(false);
    }
  };

  const onSubmit = async (data: StaffFormData) => {
    try {
      setLoading(true);

      if (consultantId) {
        // Update - don't send password
        const { password, ...updateData } = { ...data, defaultCurrency: data.defaultCurrency ?? 'USD' };
        const response = await staffService.update(consultantId, updateData);
        if (response.success) {
          toast.success('Staff member updated successfully');
          onSave();
        } else {
          toast.error(response.error || 'Failed to update staff member');
        }
      } else {
        // Create - password required
        if (!data.password) {
          toast.error('Password is required for new staff members');
          setLoading(false);
          return;
        }

        // Ensure all required fields are present and typed correctly
        const createData = {
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          regionId: data.regionId,
          role: data.role,
          password: data.password,
          phone: data.phone,
          defaultCommissionRate: data.defaultCommissionRate ?? 10,
          commissionRates: data.commissionRates,
          defaultCurrency: data.defaultCurrency ?? 'USD',
        };

        const response = await staffService.create(createData);
        if (response.success) {
          const payload = response.data as StaffCreateResponse | undefined;

          // Optional feedback about mailbox provisioning
          const provisioning = payload?.emailProvisioning;
          if (provisioning && provisioning.provider) {
            if (provisioning.success) {
              toast.success(
                `Staff member and ${provisioning.provider === 'google' ? 'Google Workspace' : 'Microsoft 365'} mailbox created`
              );
            } else {
              toast.warning?.(
                `Staff member created, but mailbox creation in ${provisioning.provider === 'google' ? 'Google Workspace' : 'Microsoft 365'} failed`
              );
            }
          } else {
            toast.success('Staff member created successfully');
          }

          onSave();
        } else {
          toast.error(response.error || 'Failed to create staff member');
        }
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loadingConsultant) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="email">Email *</Label>
          {!consultantId && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleGenerateEmail}
              disabled={generatingEmail || !watch('firstName') || !watch('lastName')}
              className="h-8"
            >
              {generatingEmail ? (
                <>
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-3 w-3" />
                  Generate Email
                </>
              )}
            </Button>
          )}
        </div>
        <Input id="email" type="email" {...register('email')} />
        {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
        {!consultantId && (
          <p className="text-xs text-muted-foreground">
            Click "Generate Email" to automatically create an HRM8 email address (firstname.lastname@hrm8.com)
          </p>
        )}
      </div>

      {!consultantId && (
        <div className="space-y-2">
          <Label htmlFor="password">Password *</Label>
          <Input id="password" type="password" {...register('password')} />
          {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="firstName">First Name *</Label>
        <Input id="firstName" {...register('firstName')} />
        {errors.firstName && <p className="text-sm text-destructive">{errors.firstName.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="lastName">Last Name *</Label>
        <Input id="lastName" {...register('lastName')} />
        {errors.lastName && <p className="text-sm text-destructive">{errors.lastName.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">Role *</Label>
        <Select
          value={watch('role')}
          onValueChange={(value) => setValue('role', value as "RECRUITER" | "SALES_AGENT" | "CONSULTANT_360")}
          disabled={!!consultantId} // Disable role change in edit mode
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="RECRUITER">Recruiter</SelectItem>
            <SelectItem value="SALES_AGENT">Sales Agent</SelectItem>
            <SelectItem value="CONSULTANT_360">360 Consultant</SelectItem>
          </SelectContent>
        </Select>
        {!!consultantId && (
          <p className="text-xs text-muted-foreground">
            To change the role, please use the "Change Role" option from the actions menu
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="regionId">Region *</Label>
        <Select
          value={watch('regionId') || ''}
          onValueChange={(value) => setValue('regionId', value)}
          disabled={hrm8User?.role === 'REGIONAL_LICENSEE' && regions.length === 1}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select region" />
          </SelectTrigger>
          <SelectContent>
            {regions.map((region) => (
              <SelectItem key={region.id} value={region.id}>
                {region.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.regionId && <p className="text-sm text-destructive">{errors.regionId.message}</p>}
        <p className="text-xs text-muted-foreground">
          Consultants must be assigned to a region for job assignment to work
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="defaultCurrency">Default Payout Currency *</Label>
        <Select
          value={watch('defaultCurrency') || 'USD'}
          onValueChange={(value) => setValue('defaultCurrency', value as typeof SUPPORTED_CURRENCIES[number])}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SUPPORTED_CURRENCIES.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Staff will confirm or change this on first login; commissions are converted to this currency
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="defaultCommissionRate">Default Commission Rate (%)</Label>
        <Input
          id="defaultCommissionRate"
          type="number"
          min="0"
          max="100"
          step="0.1"
          {...register('defaultCommissionRate', { valueAsNumber: true })}
        />
        {errors.defaultCommissionRate && <p className="text-sm text-destructive">{errors.defaultCommissionRate.message}</p>}
        <p className="text-xs text-muted-foreground">
          Default commission percentage for this consultant (default: 10%)
        </p>
      </div>

      <Card className="border-dashed">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Staff-Specific Commission Overrides</CardTitle>
          <p className="text-sm text-muted-foreground">
            Set future overrides for this staff member by subscription plan or HRM8 managed service.
            Existing commissions stay frozen.
          </p>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium">Subscription Plans</p>
              <p className="text-xs text-muted-foreground">These override the global base rate for future subscription sales.</p>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {SUBSCRIPTION_RATE_KEYS.map((planKey) => (
                <div key={planKey} className="space-y-2">
                  <Label htmlFor={`commissionRates.subscriptions.${planKey}`}>{planKey} (%)</Label>
                  <Input
                    id={`commissionRates.subscriptions.${planKey}`}
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    {...register(`commissionRates.subscriptions.${planKey}` as const, {
                      setValueAs: (value) => value === '' ? undefined : Number(value),
                    })}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium">HRM8 Managed Services</p>
              <p className="text-xs text-muted-foreground">These override the global base rate for future service commissions.</p>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {SERVICE_RATE_KEYS.map((serviceKey) => (
                <div key={serviceKey} className="space-y-2">
                  <Label htmlFor={`commissionRates.services.${serviceKey}`}>{serviceKey.replace(/_/g, ' ')} (%)</Label>
                  <Input
                    id={`commissionRates.services.${serviceKey}`}
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    {...register(`commissionRates.services.${serviceKey}` as const, {
                      setValueAs: (value) => value === '' ? undefined : Number(value),
                    })}
                  />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {consultantId ? (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Current Assignments Snapshot</CardTitle>
            <p className="text-sm text-muted-foreground">
              These records are shown for visibility only. Saving here affects future commissions only and does not reprice existing commissions.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Active Jobs</p>
              {pendingTasks?.jobs?.length ? (
                <div className="space-y-2">
                  {pendingTasks.jobs.map((job) => (
                    <div key={job.id} className="rounded-md border p-3 text-sm">
                      <div className="font-medium">{job.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {job.companyName} · {job.status}
                        {job.servicePackage ? ` · ${job.servicePackage}` : ''}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No active managed-service jobs for this staff member.</p>
              )}
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Active Subscription Sales</p>
              {pendingTasks?.subscriptions?.length ? (
                <div className="space-y-2">
                  {pendingTasks.subscriptions.map((subscription) => (
                    <div key={subscription.id} className="rounded-md border p-3 text-sm">
                      <div className="font-medium">{subscription.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {subscription.companyName} · {subscription.planType} · {subscription.status}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No active subscription sales for this staff member.</p>
              )}
            </div>
          </CardContent>
        </Card>
      ) : null}

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {consultantId ? 'Update' : 'Create Account'}
        </Button>
      </div>
    </form>
  );
}
