import { useState } from 'react';
import { Hrm8PageLayout } from '@/shared/components/layouts/Hrm8PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Label } from '@/shared/components/ui/label';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { apiClient } from '@/shared/lib/apiClient';
import { toast } from 'sonner';

export default function CompanyCreditMigrationPage() {
  const [companyId, setCompanyId] = useState('');
  const [mode, setMode] = useState<'SEATS' | 'CREDITS'>('CREDITS');
  const [loading, setLoading] = useState(false);

  const updateMode = async () => {
    try {
      setLoading(true);
      const res = await apiClient.post<{ company: { id: string; credit_mode: string } }>(
        `/api/admin/billing/companies/${companyId}/credit-mode`,
        { mode }
      );
      if (!res.success) throw new Error(res.error || 'Failed to update company credit mode');
      toast.success(`Company mode updated to ${res.data?.company?.credit_mode || mode}`);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to update company credit mode');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Hrm8PageLayout title="Company Credit Migration" subtitle="Flip company mode between SEATS and CREDITS">
      <div className="p-6">
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Update Company Credit Mode</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label>Company ID</Label>
              <Input value={companyId} onChange={(e) => setCompanyId(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Target Mode</Label>
              <Select value={mode} onValueChange={(v) => setMode(v as 'SEATS' | 'CREDITS')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SEATS">SEATS</SelectItem>
                  <SelectItem value="CREDITS">CREDITS</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={updateMode} disabled={!companyId.trim() || loading}>
              {loading ? 'Updating...' : 'Apply Mode'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </Hrm8PageLayout>
  );
}

