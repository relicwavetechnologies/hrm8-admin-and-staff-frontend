import { useState, useEffect } from 'react';
import { commissionService, Commission } from '@/shared/services/hrm8/commissionService';
import { DataTable } from '@/shared/components/tables/DataTable';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { DashboardStatCard } from '@/shared/components/dashboard/DashboardStatCard';
import { formatCurrency } from '@/shared/lib/utils';
import { Badge } from '@/shared/components/ui/badge';
import { toast } from 'sonner';
import { DollarSign, CheckCircle, Clock, XCircle, CreditCard, ThumbsUp, AlertTriangle, Scale } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Label } from '@/shared/components/ui/label';
import { CommissionPaymentDialog } from '@/shared/components/hrm8/CommissionPaymentDialog';
import { DisputeCommissionDialog } from '@/shared/components/hrm8/DisputeCommissionDialog';
import { ResolveDisputeDialog } from '@/shared/components/hrm8/ResolveDisputeDialog';
import { Hrm8PageLayout } from '@/shared/components/layouts/Hrm8PageLayout';
import { TableSkeleton } from '@/shared/components/tables/TableSkeleton';

const getColumns = (
  onApprove: (id: string) => void,
  onDispute: (id: string) => void,
  onResolve: (id: string) => void,
  approvingId: string | null
): { key: string; label: string; render?: (c: Commission) => React.ReactNode }[] => [
    {
      key: 'consultant_id',
      label: 'Consultant',
      render: (commission: Commission) => commission.consultant_id ? (commission.consultant_id.substring(0, 8) + '...') : 'N/A',
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (commission: Commission) => (
        <span className="font-semibold">
          {commission.currency} {commission.amount.toLocaleString()}
        </span>
      ),
    },
    {
      key: 'type',
      label: 'Type',
      render: (commission: Commission) => (
        <Badge variant="outline">{(commission.type || 'N/A').replace('_', ' ')}</Badge>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (commission: Commission) => {
        const statusConfig: Record<string, { icon: any; color: string; bg: string }> = {
          PENDING: { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50' },
          CONFIRMED: { icon: CheckCircle, color: 'text-primary', bg: 'bg-primary/10' },
          PAID: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
          CANCELLED: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
          DISPUTED: { icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-50' },
          CLAWBACK: { icon: Scale, color: 'text-purple-600', bg: 'bg-purple-50' },
        };
        const config = statusConfig[commission.status] || statusConfig.PENDING;
        const Icon = config.icon;

        return (
          <Badge className={`${config.color} ${config.bg}`}>
            <Icon className="mr-1 h-3 w-3" />
            {commission.status}
          </Badge>
        );
      },
    },
    {
      key: 'created_at',
      label: 'Created',
      render: (commission: Commission) => {
        const d = commission.created_at ? new Date(commission.created_at) : null;
        return d && !isNaN(d.getTime()) ? d.toLocaleDateString() : '—';
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (commission: Commission) => (
        <div className="flex gap-2">
          {commission.status === 'PENDING' && (
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                onApprove(commission.id);
              }}
              disabled={!!approvingId}
            >
              {approvingId === commission.id ? 'Approving...' : (
                <>
                  <ThumbsUp className="h-3 w-3 mr-1" />
                  Approve
                </>
              )}
            </Button>
          )}
          {(commission.status === 'CONFIRMED' || commission.status === 'PAID') && (
            <Button
              size="sm"
              variant="ghost"
              className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
              onClick={(e) => {
                e.stopPropagation();
                onDispute(commission.id);
              }}
            >
              <AlertTriangle className="h-3 w-3 mr-1" />
              Dispute
            </Button>
          )}
          {commission.status === 'DISPUTED' && (
            <Button
              size="sm"
              variant="default"
              className="bg-purple-600 hover:bg-purple-700"
              onClick={(e) => {
                e.stopPropagation();
                onResolve(commission.id);
              }}
            >
              <Scale className="h-3 w-3 mr-1" />
              Resolve
            </Button>
          )}
        </div>
      ),
    },
  ];

export default function CommissionsPage() {
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedCommissions, setSelectedCommissions] = useState<Commission[]>([]);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  // Dispute Dialogs
  const [disputeId, setDisputeId] = useState<string | null>(null);
  const [resolveId, setResolveId] = useState<string | null>(null);

  useEffect(() => {
    loadCommissions();
  }, [statusFilter]);

  const loadCommissions = async () => {
    try {
      setLoading(true);
      const filters: Record<string, string> = {};
      if (statusFilter !== 'all') {
        filters.status = statusFilter;
      }

      const response = await commissionService.getAll(filters);
      if (!response.success && response.error) {
        toast.error(response.error || 'Failed to load commissions');
        return;
      }
      setCommissions(response.data?.commissions ?? []);
    } catch (error) {
      toast.error('Failed to load commissions');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPaymentDialog = () => {
    const payableCommissions = commissions.filter(
      c => c.status === 'PENDING' || c.status === 'CONFIRMED'
    );
    setSelectedCommissions(payableCommissions);
    setPaymentDialogOpen(true);
  };

  const handlePaymentSuccess = () => {
    setPaymentDialogOpen(false);
    setSelectedCommissions([]);
    loadCommissions();
  };

  const handleApproveCommission = async (id: string) => {
    try {
      setApprovingId(id);
      const response = await commissionService.confirm(id);
      if (response.success) {
        toast.success('Commission approved – amount credited to consultant wallet');
        loadCommissions();
      } else {
        toast.error(response.error || 'Failed to approve');
      }
    } catch (error) {
      toast.error('Failed to approve commission');
    } finally {
      setApprovingId(null);
    }
  };

  const totalPending = commissions.filter(c => c.status === 'PENDING').reduce((sum, c) => sum + c.amount, 0);
  const totalPaid = commissions.filter(c => c.status === 'PAID').reduce((sum, c) => sum + c.amount, 0);

  return (
    <Hrm8PageLayout
      title="Commissions"
      subtitle="Track and manage consultant commissions"
      actions={
        <div className="flex items-center gap-2">
          <Label>Filter by Status:</Label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="CONFIRMED">Confirmed</SelectItem>
              <SelectItem value="PAID">Paid</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
              <SelectItem value="DISPUTED">Disputed</SelectItem>
              <SelectItem value="CLAWBACK">Clawback</SelectItem>
            </SelectContent>
          </Select>
          {commissions.filter(c => c.status === 'PENDING' || c.status === 'CONFIRMED').length > 0 && (
            <Button onClick={handleOpenPaymentDialog} className="ml-2">
              <CreditCard className="h-4 w-4 mr-2" />
              Process Payments
            </Button>
          )}
        </div>
      }
    >
      <div className="p-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <DashboardStatCard
            title="Total Pending"
            value={formatCurrency(totalPending)}
            description="All time"
            icon={<Clock className="h-6 w-6" />}
            variant="warning"
          />

          <DashboardStatCard
            title="Total Paid"
            value={formatCurrency(totalPaid)}
            description="All time"
            icon={<CheckCircle className="h-6 w-6" />}
            variant="success"
          />

          <DashboardStatCard
            title="Total Commissions"
            value={commissions.length.toString()}
            description="Current filter"
            icon={<DollarSign className="h-6 w-6" />}
            variant="neutral"
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Commissions</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <TableSkeleton columns={5} />
            ) : (
              <DataTable
                data={commissions}
                columns={getColumns(
                  handleApproveCommission,
                  (id) => setDisputeId(id),
                  (id) => setResolveId(id),
                  approvingId
                )}
                searchable
                searchKeys={['consultant_id', 'type']}
                emptyMessage="No commissions found"
              />
            )}
          </CardContent>
        </Card>

        <CommissionPaymentDialog
          open={paymentDialogOpen}
          onOpenChange={setPaymentDialogOpen}
          commissions={selectedCommissions}
          onSuccess={handlePaymentSuccess}
        />

        <DisputeCommissionDialog
          open={!!disputeId}
          onOpenChange={(open) => !open && setDisputeId(null)}
          commissionId={disputeId}
          onSuccess={loadCommissions}
        />

        <ResolveDisputeDialog
          open={!!resolveId}
          onOpenChange={(open) => !open && setResolveId(null)}
          commissionId={resolveId}
          onSuccess={loadCommissions}
        />
      </div>
    </Hrm8PageLayout>
  );
}
