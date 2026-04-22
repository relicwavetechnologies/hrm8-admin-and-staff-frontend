import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Hrm8PageLayout } from '@/shared/components/layouts/Hrm8PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Button } from '@/shared/components/ui/button';
import { DataTable } from '@/shared/components/tables/DataTable';
import { apiClient } from '@/shared/lib/apiClient';

export default function HRServicesManagementPage() {
  const [companyId, setCompanyId] = useState('');
  const [selectedCompanyId, setSelectedCompanyId] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['hrm8', 'hr-services-engagements', selectedCompanyId],
    enabled: Boolean(selectedCompanyId),
    queryFn: async () => {
      const res = await apiClient.get<{ engagements: any[] }>(
        `/api/hr-services/engagements?companyId=${encodeURIComponent(selectedCompanyId)}`
      );
      if (!res.success || !res.data) throw new Error(res.error || 'Failed to fetch engagements');
      return res.data.engagements || [];
    },
  });

  const columns = [
    { key: 'id', label: 'ID', sortable: false },
    { key: 'status', label: 'Status', sortable: true },
    { key: 'quantity', label: 'Qty', sortable: true },
    { key: 'agreed_rate', label: 'Rate', sortable: true },
    { key: 'created_at', label: 'Created At', sortable: true },
  ];

  return (
    <Hrm8PageLayout title="HR Services Management" subtitle="Monitor and review HR services engagements">
      <div className="p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Company Drilldown</CardTitle>
          </CardHeader>
          <CardContent className="flex items-end gap-3">
            <div className="space-y-1">
              <Label>Company ID</Label>
              <Input value={companyId} onChange={(e) => setCompanyId(e.target.value)} className="w-[420px]" />
            </div>
            <Button onClick={() => setSelectedCompanyId(companyId.trim())} disabled={!companyId.trim()}>
              Load Engagements
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Engagements</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-sm text-muted-foreground">Loading...</div>
            ) : (
              <DataTable
                data={(data || []) as any}
                columns={columns as any}
                searchable
                searchKeys={['status', 'id']}
                emptyMessage={selectedCompanyId ? 'No engagements found' : 'Select a company first'}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </Hrm8PageLayout>
  );
}

