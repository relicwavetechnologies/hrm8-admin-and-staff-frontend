
import { useState, useEffect } from 'react';
import { useHrm8Auth } from "@/contexts/Hrm8AuthContext";
import { settlementService, Settlement, SettlementStats } from '@/shared/services/hrm8/settlementService';
import { DataTable, Column } from '@/shared/components/tables/DataTable';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { useToast } from '@/shared/hooks/use-toast';
import { DollarSign, CheckCircle, Clock, CreditCard } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Label } from '@/shared/components/ui/label';
import { MarkSettlementPaidDialog } from '@/shared/components/hrm8/MarkSettlementPaidDialog';
import { CreateSettlementDialog } from '@/shared/components/hrm8/CreateSettlementDialog';
import { useCurrencyFormat } from '@/shared/contexts/CurrencyFormatContext';
import { format } from 'date-fns';

export default function SettlementsPage() {
  const { hrm8User } = useHrm8Auth();
  const { formatCurrency } = useCurrencyFormat();
  const { toast } = useToast();
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedSettlement, setSelectedSettlement] = useState<Settlement | null>(null);

  const isGlobalAdmin = hrm8User?.role === 'GLOBAL_ADMIN';

  useEffect(() => {
    loadSettlements();
    // Stats loading skipped for now as EnhancedStatCard is not yet ported
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
      toast({
          title: "Error",
          description: "Failed to load settlements",
          variant: "destructive"
      });
    } finally {
      setLoading(false);
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
  };

  const handleCreateSuccess = () => {
    setCreateDialogOpen(false);
    loadSettlements();
  };

  const getStatusBadge = (status: string) => {
      switch(status) {
          case 'PENDING':
              return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
          case 'PAID':
              return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Paid</Badge>;
          default:
              return <Badge variant="outline">{status}</Badge>;
      }
  };

  // Define columns
  const columns: Column<Settlement>[] = [
    {
      key: 'licenseeId', // Sorting by licenseeId as name might be nested
      label: 'Licensee',
      render: (settlement) => (
        <span className="font-medium">
          {settlement.licensee?.name || settlement.licenseeId}
        </span>
      ),
    },
    {
      key: 'periodStart',
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
      render: (settlement) => (
        <span className="font-semibold">
          {formatCurrency(settlement.totalRevenue)}
        </span>
      ),
    },
    {
      key: 'licenseeShare',
      label: 'Licensee Share',
      render: (settlement) => (
        <span className="font-semibold text-primary">
          {formatCurrency(settlement.licenseeShare)}
        </span>
      ),
    },
    {
      key: 'hrm8Share',
      label: 'HRM8 Share',
      render: (settlement) => (
        <span className="font-semibold">
          {formatCurrency(settlement.hrm8Share)}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (settlement) => getStatusBadge(settlement.status),
    },
    {
      key: 'paymentDate',
      label: 'Payment Date',
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
       
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
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
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
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

        {/* Settlements Table */}
        <Card>
          <CardContent className="p-1">
            <DataTable
              data={settlements}
              columns={columns}
              searchable
              searchKeys={['licenseeId', 'status']}
              emptyMessage="No settlements found"
            />
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
