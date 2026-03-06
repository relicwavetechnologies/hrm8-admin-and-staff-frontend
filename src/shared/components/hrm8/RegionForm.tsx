/**
 * Region Form Component
 * Form for creating/editing regions
 */

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { regionService } from '@/shared/services/hrm8/regionService';
import { licenseeService } from '@/shared/services/hrm8/licenseeService';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const regionSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  code: z.string().min(1, 'Code is required').toUpperCase(),
  country: z.string().min(1, 'Country is required'),
  stateProvince: z.string().optional(),
  city: z.string().optional(),
  ownerType: z.enum(['HRM8', 'LICENSEE']),
  licenseeId: z.string().optional(),
});

type RegionFormData = z.infer<typeof regionSchema>;

interface RegionFormProps {
  regionId?: string | null;
  onSave: () => void;
  onCancel: () => void;
}

export function RegionForm({ regionId, onSave, onCancel }: RegionFormProps) {
  const [loading, setLoading] = useState(false);
  const [loadingRegion, setLoadingRegion] = useState(!!regionId);
  const [licensees, setLicensees] = useState<Array<{ id: string; name: string }>>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<RegionFormData>({
    resolver: zodResolver(regionSchema),
    defaultValues: {
      ownerType: 'HRM8',
    },
  });

  const ownerType = watch('ownerType');

  useEffect(() => {
    if (regionId) {
      loadRegion();
    }
    loadLicensees();
  }, [regionId]);

  const loadRegion = async () => {
    if (!regionId) return;

    try {
      setLoadingRegion(true);
      const response = await regionService.getById(regionId);
      if (response.success && response.data?.region) {
        const region = response.data.region;
        setValue('name', region.name);
        setValue('code', region.code);
        setValue('country', region.country);
        setValue('stateProvince', region.stateProvince || '');
        setValue('city', region.city || '');
        setValue('ownerType', region.ownerType);
        setValue('licenseeId', region.licenseeId || '');
      }
    } catch (error) {
      toast.error('Failed to load region');
    } finally {
      setLoadingRegion(false);
    }
  };

  const loadLicensees = async () => {
    try {
      const response = await licenseeService.getAll({ status: 'ACTIVE' });
      if (response.success && response.data?.licensees) {
        setLicensees(response.data.licensees.map(l => ({ id: l.id, name: l.name })));
      }
    } catch (error) {
      console.error('Failed to load licensees:', error);
    }
  };

  const onSubmit = async (data: RegionFormData) => {
    try {
      setLoading(true);

      if (regionId) {
        const response = await regionService.update(regionId, data);
        if (response.success) {
          toast.success('Region updated successfully');
          onSave();
        } else {
          toast.error(response.error || 'Failed to update region');
        }
      } else {
        const response = await regionService.create(data);
        if (response.success) {
          toast.success('Region created successfully');
          onSave();
        } else {
          toast.error(response.error || 'Failed to create region');
        }
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loadingRegion) {
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
        <Label htmlFor="code">Code *</Label>
        <Input id="code" {...register('code')} placeholder="e.g., US-NORTHEAST" />
        {errors.code && <p className="text-sm text-destructive">{errors.code.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="country">Country *</Label>
        <Input id="country" {...register('country')} />
        {errors.country && <p className="text-sm text-destructive">{errors.country.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="stateProvince">State/Province</Label>
        <Input id="stateProvince" {...register('stateProvince')} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="city">City</Label>
        <Input id="city" {...register('city')} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="ownerType">Owner Type *</Label>
        <Select
          value={ownerType}
          onValueChange={(value) => setValue('ownerType', value as 'HRM8' | 'LICENSEE')}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="HRM8">HRM8</SelectItem>
            <SelectItem value="LICENSEE">Licensee</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {ownerType === 'LICENSEE' && (
        <div className="space-y-2">
          <Label htmlFor="licenseeId">Licensee</Label>
          <Select
            onValueChange={(value) => setValue('licenseeId', value)}
            defaultValue={watch('licenseeId') || ''}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select licensee" />
            </SelectTrigger>
            <SelectContent>
              {licensees.map((licensee) => (
                <SelectItem key={licensee.id} value={licensee.id}>
                  {licensee.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {regionId ? 'Update' : 'Create'}
        </Button>
      </div>
    </form>
  );
}



