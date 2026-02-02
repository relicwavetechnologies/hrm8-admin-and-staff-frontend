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
import { useHrm8Auth } from '@/contexts/Hrm8AuthContext';
import { staffService, StaffCreateResponse } from '@/shared/services/hrm8/staffService';
import { regionService } from '@/shared/services/hrm8/regionService';
import { toast } from 'sonner';
import { Loader2, Mail } from 'lucide-react';

export const staffSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters').optional(),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().optional(),
  role: z.enum(['RECRUITER', 'SALES_AGENT', 'CONSULTANT_360']),
  regionId: z.string().min(1, 'Region is required'),
  defaultCommissionRate: z.number().min(0).max(100).optional(),
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
      const response = await staffService.getById(consultantId);
      if (response.success && response.data?.consultant) {
        const consultant = response.data.consultant;
        setValue('email', consultant.email);
        setValue('firstName', consultant.firstName);
        setValue('lastName', consultant.lastName);
        setValue('phone', consultant.phone || '');
        setValue('role', consultant.role);
        setValue('regionId', consultant.regionId || '');
        setValue('defaultCommissionRate', consultant.defaultCommissionRate || 10);
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
        const { password, ...updateData } = data;
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
          defaultCommissionRate: data.defaultCommissionRate || 10
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



