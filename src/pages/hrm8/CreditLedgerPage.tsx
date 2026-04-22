import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Hrm8PageLayout } from '@/shared/components/layouts/Hrm8PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Button } from '@/shared/components/ui/button';
import { DataTable } from '@/shared/components/tables/DataTable';
import { apiClient } from '@/shared/lib/apiClient';

export default function CreditLedgerPage() {
  const [companyId, setCompanyId] = useState('');
  const [appliedCompanyId, setAppliedCompanyId] = useState('');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['hrm8', 'credit-ledger', appliedCompanyId],
    enabled: Boolean(appliedCompanyId),
    queryFn: async () => {
      const res = await apiClient.get<{ items: any[] }>(
        `/api/admin/billing/companies/${appliedCompanyId}/credit-ledger?limit=200`
      );
      if (!res.success || !res.data) throw new Error(res.error || 'Failed to fetch credit ledger');
      return res.data.items || [];
    },
  });

  const columns = [
    { key: 'created_at', label: 'Created At', sortable: true },
    { key: 'reason', label: 'Reason', sortable: true },
    { key: 'source_type', label: 'Source Type', sortable: true },
    { key: 'delta', label: 'Delta', sortable: true },
    { key: 'balance_after', label: 'Balance After', sortable: true },
    { key: 'reference_key', label: 'Reference', sortable: false },
  ];

  return (
    <Hrm8PageLayout title="Credit Ledger" subtitle="View company-level credit ledger entries">
      <div className="p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Lookup Company Ledger</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap items-end gap-3">
            <div className="space-y-1">
              <Label>Company ID</Label>
              <Input value={companyId} onChange={(e) => setCompanyId(e.target.value)} className="w-[420px]" />
            </div>
            <Button
              onClick={() => {
                setAppliedCompanyId(companyId.trim());
                setTimeout(() => refetch(), 0);
              }}
              disabled={!companyId.trim()}
            >
              Load Ledger
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Entries</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-sm text-muted-foreground">Loading...</div>
            ) : (
              <DataTable
                data={(data || []) as any}
                columns={columns as any}
                searchable
                searchKeys={['reason', 'source_type', 'reference_key']}
                emptyMessage={appliedCompanyId ? 'No ledger entries found' : 'Enter a company ID to load entries'}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </Hrm8PageLayout>
  );
}

