/**
 * Licensee Form Component
 * Form for creating/editing regional licensees
 */

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { licenseeService, CreateLicenseeData } from '@/shared/lib/hrm8/licenseeService';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const licenseeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  legalEntityName: z.string().min(1, 'Legal entity name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  taxId: z.string().optional(),
  agreementStartDate: z.string().min(1, 'Agreement start date is required'),
  agreementEndDate: z.string().optional(),
  revenueSharePercent: z.number().min(0).max(100),
  exclusivity: z.boolean().optional(),
  managerContact: z.string().min(1, 'Manager contact is required'),
  financeContact: z.string().optional(),
  complianceContact: z.string().optional(),
  password: z.string().min(1, 'Password is required').optional(),
});

type LicenseeFormData = z.infer<typeof licenseeSchema>;

interface LicenseeFormProps {
  licenseeId?: string | null;
  onSave: () => void;
  onCancel: () => void;
}

export function LicenseeForm({ licenseeId, onSave, onCancel }: LicenseeFormProps) {
  const [loading, setLoading] = useState(false);
  const [loadingLicensee, setLoadingLicensee] = useState(!!licenseeId);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<LicenseeFormData>({
    resolver: zodResolver(licenseeSchema),
    defaultValues: {
      revenueSharePercent: 50,
      exclusivity: false,
      password: 'vAbhi2678',
    },
  });

  useEffect(() => {
    if (licenseeId) {
      loadLicensee();
    }
  }, [licenseeId]);

  const loadLicensee = async () => {
    if (!licenseeId) return;

    try {
      setLoadingLicensee(true);
      const response = await licenseeService.getById(licenseeId);
      if (response.success && response.data?.licensee) {
        const licensee = response.data.licensee;
        setValue('name', licensee.name);
        setValue('legalEntityName', licensee.legalEntityName);
        setValue('email', licensee.email);
        setValue('phone', licensee.phone || '');
        setValue('address', licensee.address || '');
        setValue('city', licensee.city || '');
        setValue('state', licensee.state || '');
        setValue('country', licensee.country || '');
        setValue('taxId', licensee.taxId || '');
        setValue('agreementStartDate', licensee.agreementStartDate.split('T')[0]);
        setValue('agreementEndDate', licensee.agreementEndDate?.split('T')[0] || '');
        setValue('revenueSharePercent', licensee.revenueSharePercent);
        setValue('exclusivity', licensee.exclusivity);
        setValue('managerContact', licensee.managerContact);
        setValue('financeContact', licensee.financeContact || '');
        setValue('complianceContact', licensee.complianceContact || '');
      }
    } catch (error) {
      toast.error('Failed to load licensee');
    } finally {
      setLoadingLicensee(false);
    }
  };

  const onSubmit = async (data: LicenseeFormData) => {
    try {
      setLoading(true);

      const formData = {
        ...data,
        agreementStartDate: new Date(data.agreementStartDate).toISOString(),
        agreementEndDate: data.agreementEndDate ? new Date(data.agreementEndDate).toISOString() : undefined,
      };

      if (licenseeId) {
        // Remove password from update data if it's empty
        const { password, ...updateData } = formData;
        const response = await licenseeService.update(licenseeId, updateData);
        if (response.success) {
          toast.success('Licensee updated successfully');
          onSave();
        } else {
          toast.error(response.error || 'Failed to update licensee');
        }
      } else {
        const response = await licenseeService.create(formData as CreateLicenseeData);
        if (response.success) {
          toast.success('Licensee created successfully');
          onSave();
        } else {
          toast.error(response.error || 'Failed to create licensee');
        }
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loadingLicensee) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name *</Label>
        <Input id="name" {...register('name')} />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="legalEntityName">Legal Entity Name *</Label>
        <Input id="legalEntityName" {...register('legalEntityName')} />
        {errors.legalEntityName && <p className="text-sm text-destructive">{errors.legalEntityName.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email *</Label>
        <Input id="email" type="email" {...register('email')} />
        {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
      </div>

      {!licenseeId && (
        <div className="space-y-2">
          <Label htmlFor="password">Temporary Password *</Label>
          <Input id="password" type="text" {...register('password')} />
          {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
          <p className="text-xs text-muted-foreground">Licensee will use this to login initially.</p>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="revenueSharePercent">Revenue Share % *</Label>
        <Input
          id="revenueSharePercent"
          type="number"
          min="0"
          max="100"
          {...register('revenueSharePercent', { valueAsNumber: true })}
        />
        {errors.revenueSharePercent && <p className="text-sm text-destructive">{errors.revenueSharePercent.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="agreementStartDate">Agreement Start Date *</Label>
        <Input id="agreementStartDate" type="date" {...register('agreementStartDate')} />
        {errors.agreementStartDate && <p className="text-sm text-destructive">{errors.agreementStartDate.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="managerContact">Manager Contact *</Label>
        <Input id="managerContact" {...register('managerContact')} />
        {errors.managerContact && <p className="text-sm text-destructive">{errors.managerContact.message}</p>}
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {licenseeId ? 'Update' : 'Create'}
        </Button>
      </div>
    </form>
  );
}



