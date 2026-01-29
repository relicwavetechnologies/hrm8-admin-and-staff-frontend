/**
 * Commissions Management Page
 * HRM8 Global Admin commission tracking
 */

import { useState, useEffect } from 'react';
import { useAuth } from '@/shared/contexts/AuthContext';
import { commissionService, Commission } from '@/shared/lib/hrm8/commissionService';
import { DataTable } from '@/shared/components/tables/DataTable';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { EnhancedStatCard } from '@/shared/components/dashboard/EnhancedStatCard';
import { Badge } from '@/shared/components/ui/badge';
import { toast } from 'sonner';
import { DollarSign, CheckCircle, Clock, XCircle, CreditCard } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Label } from '@/shared/components/ui/label';
import { Hrm8PageLayout } from '@/shared/components/layouts/Hrm8PageLayout';
import { CommissionPaymentDialog } from '@/shared/components/hrm8/CommissionPaymentDialog';

const columns = [
  {
    key: 'consultantId',
    label: 'Consultant',
    render: (commission: Commission) => commission.consultantId.substring(0, 8) + '...',
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
      <Badge variant="outline">{(commission.type || commission.commissionType || 'N/A').replace('_', ' ')}</Badge>
    ),
  },
  {
    key: 'status',
    label: 'Status',
    render: (commission: Commission) => {
      const statusConfig: Record<string, { icon: any; color: string; bg: string }> = {
        PENDING: { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50' },
        CONFIRMED: { icon: CheckCircle, color: 'text-blue-600', bg: 'bg-blue-50' },
        PAID: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
        CANCELLED: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
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
    key: 'createdAt',
    label: 'Created',
    render: (commission: Commission) => new Date(commission.createdAt).toLocaleDateString(),
  },
];

export default function CommissionsPage() {
  const { user } = useAuth();
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedCommissions, setSelectedCommissions] = useState<Commission[]>([]);

  const isGlobalAdmin = user?.role === 'GLOBAL_ADMIN';

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
      if (response.success && response.data?.commissions) {
        setCommissions(response.data.commissions);
      }
    } catch (error) {
      toast.error('Failed to load commissions');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (id: string) => {
    try {
      const response = await commissionService.confirm(id);
      if (response.success) {
        toast.success('Commission confirmed');
        await loadCommissions();
      } else {
        toast.error(response.error || 'Failed to confirm commission');
      }
    } catch (error) {
      toast.error('Failed to confirm commission');
    }
  };

  const handleMarkAsPaid = async (id: string, paymentReference?: string) => {
    try {
      const response = await commissionService.markAsPaid(id, paymentReference);
      if (response.success) {
        toast.success('Commission marked as paid');
        await loadCommissions();
      } else {
        toast.error(response.error || 'Failed to mark commission as paid');
      }
    } catch (error) {
      toast.error('Failed to mark commission as paid');
    }
  };

  const handleOpenPaymentDialog = () => {
    // Get pending/confirmed commissions that can be paid
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
          <EnhancedStatCard
            title="Total Pending"
            value=""
            change="All time"
            isCurrency={true}
            rawValue={totalPending}
            icon={<Clock className="h-6 w-6" />}
            variant="warning"
          />

          <EnhancedStatCard
            title="Total Paid"
            value=""
            change="All time"
            isCurrency={true}
            rawValue={totalPaid}
            icon={<CheckCircle className="h-6 w-6" />}
            variant="success"
          />

          <EnhancedStatCard
            title="Total Commissions"
            value={commissions.length.toString()}
            change="Current filter"
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
              <div className="text-center py-8">Loading commissions...</div>
            ) : (
              <DataTable
                data={commissions}
                columns={columns}
                searchable
                searchKeys={['consultantId', 'type', 'commissionType']}
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
      </div>
    </Hrm8PageLayout>
  );
}
