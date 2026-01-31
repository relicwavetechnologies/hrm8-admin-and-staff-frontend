import { useState, useEffect } from 'react';
import { useHrm8Auth } from '@/contexts/Hrm8AuthContext';
import { settlementService, Settlement, SettlementStats } from '@/shared/lib/hrm8/settlementService';
import { DataTable, Column } from '@/shared/components/tables/DataTable';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { EnhancedStatCard } from '@/shared/components/dashboard/EnhancedStatCard';
import { Badge } from '@/shared/components/ui/badge';
import { toast } from 'sonner';
import { DollarSign, CheckCircle, Clock, CreditCard } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Label } from '@/shared/components/ui/label';
import { MarkSettlementPaidDialog } from '@/shared/components/hrm8/MarkSettlementPaidDialog';
import { CreateSettlementDialog } from '@/shared/components/hrm8/CreateSettlementDialog';
import { useCurrencyFormat } from '@/shared/contexts/CurrencyFormatContext';
import { format } from 'date-fns';
import { TableSkeleton } from '@/shared/components/tables/TableSkeleton';

export default function SettlementsPage() {
  const { hrm8User } = useHrm8Auth();
  const { formatCurrency } = useCurrencyFormat();
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [stats, setStats] = useState<SettlementStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedSettlement, setSelectedSettlement] = useState<Settlement | null>(null);

  const isGlobalAdmin = hrm8User?.role === 'GLOBAL_ADMIN';

  useEffect(() => {
    loadSettlements();
    loadStats();
  }, [statusFilter]);

  const loadSettlements = async () => {
    try {
      setLoading(true);
      const filters: Record<string, string> = {};
      if (statusFilter !== 'all') {
        filters.status = statusFilter;
      }

      const response = await settlementService.getAll(filters);
      if (response.success && response.data?.settlements) {
        setSettlements(response.data.settlements);
      }
    } catch (error) {
      toast.error('Failed to load settlements');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await settlementService.getStats();
      if (response.success && response.data?.stats) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Failed to load settlement stats:', error);
    }
  };

  const handleMarkAsPaid = (settlement: Settlement) => {
    setSelectedSettlement(settlement);
    setPaymentDialogOpen(true);
  };

  const handlePaymentSuccess = () => {
    setPaymentDialogOpen(false);
    setSelectedSettlement(null);
    loadSettlements();
    loadStats();
  };

  const handleCreateSuccess = () => {
    setCreateDialogOpen(false);
    loadSettlements();
    loadStats();
  };

  // Define columns
  const columns: Column<Settlement>[] = [
    {
      key: 'licensee',
      label: 'Licensee',
      sortable: true,
      render: (settlement) => (
        <span className="font-medium">
          {settlement.licensee?.name || settlement.licenseeId}
        </span>
      ),
    },
    {
      key: 'period',
      label: 'Period',
      render: (settlement) => {
        const start = settlement.periodStart ? new Date(settlement.periodStart) : null;
        const end = settlement.periodEnd ? new Date(settlement.periodEnd) : null;

        if (!start || isNaN(start.getTime()) || !end || isNaN(end.getTime())) {
          return <span className="text-sm text-muted-foreground">-</span>;
        }

        return (
          <span className="text-sm">
            {format(start, 'MMM dd')} - {format(end, 'MMM dd, yyyy')}
          </span>
        );
      },
    },
    {
      key: 'totalRevenue',
      label: 'Total Revenue',
      sortable: true,
      render: (settlement) => (
        <span className="font-semibold">
          {formatCurrency(settlement.totalRevenue)}
        </span>
      ),
    },
    {
      key: 'licenseeShare',
      label: 'Licensee Share',
      sortable: true,
      render: (settlement) => (
        <span className="font-semibold text-primary">
          {formatCurrency(settlement.licenseeShare)}
        </span>
      ),
    },
    {
      key: 'hrm8Share',
      label: 'HRM8 Share',
      sortable: true,
      render: (settlement) => (
        <span className="font-semibold">
          {formatCurrency(settlement.hrm8Share)}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (settlement) => {
        const status = settlement.status;
        const statusConfig = {
          PENDING: { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50' },
          PAID: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
        };
        const config = statusConfig[status] || statusConfig.PENDING;
        const Icon = config.icon;

        return (
          <Badge className={`${config.color} ${config.bg}`}>
            <Icon className="mr-1 h-3 w-3" />
            {status}
          </Badge>
        );
      },
    },
    {
      key: 'paymentDate',
      label: 'Payment Date',
      sortable: true,
      render: (settlement) => {
        const paymentDate = settlement.paymentDate ? new Date(settlement.paymentDate) : null;
        return paymentDate && !isNaN(paymentDate.getTime()) ? (
          <span className="text-sm">{format(paymentDate, 'MMM dd, yyyy')}</span>
        ) : (
          <span className="text-sm text-muted-foreground">-</span>
        );
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (settlement) => {
        if (settlement.status === 'PAID' || !isGlobalAdmin) {
          return null;
        }
        return (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleMarkAsPaid(settlement)}
          >
            <CreditCard className="h-4 w-4 mr-1" />
            Mark as Paid
          </Button>
        );
      },
    },
  ];

  return (

    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settlements</h1>
          <p className="text-muted-foreground">Track and manage regional licensee settlements</p>
        </div>
        <div className="flex items-center gap-2">
          {isGlobalAdmin && (
            <Button onClick={() => setCreateDialogOpen(true)}>
              <DollarSign className="mr-2 h-4 w-4" />
              Generate Settlement
            </Button>
          )}
          <Label>Filter by Status:</Label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="PAID">Paid</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <EnhancedStatCard
          title="Total Pending"
          value=""
          isCurrency={true}
          rawValue={stats?.totalPending || 0}
          icon={<Clock className="h-6 w-6" />}
          variant="warning"
          change={`${stats?.pendingCount || 0} settlements`}
        />

        <EnhancedStatCard
          title="Total Paid"
          value=""
          isCurrency={true}
          rawValue={stats?.totalPaid || 0}
          icon={<CheckCircle className="h-6 w-6" />}
          variant="success"
          change={`${stats?.paidCount || 0} settlements`}
        />

        <EnhancedStatCard
          title="Total Settlements"
          value={settlements.length.toString()}
          icon={<DollarSign className="h-6 w-6" />}
          variant="neutral"
          change="All time"
        />
      </div>

      {/* Settlements Table */}
      <Card>
        <CardHeader>
          <CardTitle>Settlements</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <TableSkeleton columns={6} />
          ) : (
            <DataTable
              data={settlements}
              columns={columns}
              searchable
              searchKeys={['licenseeId', 'status', 'reference']}
              emptyMessage="No settlements found"
            />
          )}
        </CardContent>
      </Card>

      {/* Mark as Paid Dialog */}
      <MarkSettlementPaidDialog
        settlement={selectedSettlement}
        open={paymentDialogOpen}
        onOpenChange={setPaymentDialogOpen}
        onSuccess={handlePaymentSuccess}
      />

      {/* Create Settlement Dialog */}
      <CreateSettlementDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={handleCreateSuccess}
      />
    </div>

  );
}
