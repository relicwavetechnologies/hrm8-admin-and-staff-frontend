import { useState, useEffect, useCallback } from "react";
import { DataTable, Column } from "@/shared/components/tables/DataTable";
import { salesService, Commission } from "@/shared/services/salesService";
import { useToast } from "@/shared/hooks/use-toast";
import { useCurrencyFormat } from "@/shared/contexts/CurrencyFormatContext";
import { Badge } from "@/shared/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { BalanceCard } from "@/modules/sales/components/BalanceCard";
import { WithdrawalHistory } from "@/modules/sales/components/WithdrawalHistory";
import { StripeConnectCard } from "@/modules/sales/components/StripeConnectCard";
import { WithdrawalDialog } from "@/modules/sales/components/WithdrawalDialog";
import { WithdrawalBalance, CommissionWithdrawal } from "@/shared/types/withdrawal";

export default function CommissionsPage() {
  const { toast } = useToast();
  const { formatCurrency } = useCurrencyFormat();
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [withdrawals, setWithdrawals] = useState<CommissionWithdrawal[]>([]);
  const [balance, setBalance] = useState<WithdrawalBalance>({
    availableBalance: 0,
    pendingBalance: 0,
    totalEarned: 0,
    totalWithdrawn: 0,
    availableCommissions: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [withdrawalOpen, setWithdrawalOpen] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Parallel fetch for efficiency
      const [commissionsRes, balanceRes, withdrawalsRes] = await Promise.all([
        salesService.getCommissions(),
        salesService.getWithdrawalBalance(),
        salesService.getWithdrawals()
      ]);

      if (commissionsRes.success && commissionsRes.data) {
        // @ts-ignore
        setCommissions(commissionsRes.data.commissions || []);
      }

      if (balanceRes.success && balanceRes.data) {
        setBalance(balanceRes.data);
      }

      if (withdrawalsRes.success && withdrawalsRes.data) {
        setWithdrawals(withdrawalsRes.data.withdrawals || []);
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to fetch commission data", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const columns: Column<Commission>[] = [
    {
      key: "companyName",
      label: "Company",
      render: (item) => <span className="font-medium">{item.companyName || "-"}</span>,
    },
    {
      key: "description",
      label: "Description",
      render: (item) => <span className="text-muted-foreground">{item.description || "Commission"}</span>,
    },
    {
      key: "type",
      label: "Type",
      render: (item) => (
        <Badge variant="outline">
          {item.type}
        </Badge>
      ),
    },
    {
      key: "amount",
      label: "Amount",
      render: (item) => <span className="font-semibold">{formatCurrency(item.amount)}</span>,
    },
    {
      key: "status",
      label: "Status",
      render: (item) => {
        return (
          <Badge
            variant={item.status === 'PAID' ? 'default' : 'outline'}
            className={
              item.status === 'PAID' ? 'bg-green-600 hover:bg-green-700' :
                item.status === 'PENDING' ? 'text-orange-600 border-orange-200 bg-orange-50' :
                  ''
            }
          >
            {item.status}
          </Badge>
        );
      },
    },
    {
      key: "createdAt",
      label: "Date",
      render: (item) => <span>{new Date(item.createdAt).toLocaleDateString()}</span>,
    },
    {
      key: "paidAt",
      label: "Paid Date",
      render: (item) => <span>{item.paidAt ? new Date(item.paidAt).toLocaleDateString() : "-"}</span>,
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Commission Management</h1>
        <p className="text-muted-foreground">Track your earnings and withdrawals</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
        <BalanceCard
          balance={balance}
          onRequestWithdrawal={() => setWithdrawalOpen(true)}
          isLoading={isLoading}
        />
        <div className="md:col-span-2 lg:col-span-2">
          <StripeConnectCard onStatusChange={fetchData} />
        </div>
      </div>

      <Tabs defaultValue="commissions" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
          <TabsTrigger value="commissions">Commissions</TabsTrigger>
          <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
        </TabsList>

        <TabsContent value="commissions" className="mt-4">
          <div className="bg-card rounded-lg border shadow-sm p-1">
            <DataTable
              columns={columns}
              data={commissions}
              searchable={true}
              searchKeys={['description']}
            />
          </div>
        </TabsContent>

        <TabsContent value="withdrawals" className="mt-4">
          <WithdrawalHistory
            withdrawals={withdrawals}
            isLoading={isLoading}
            onrefresh={fetchData}
          />
        </TabsContent>
      </Tabs>

      <WithdrawalDialog
        open={withdrawalOpen}
        onOpenChange={setWithdrawalOpen}
        balance={balance}
        onSuccess={fetchData}
      />
    </div>
  );
}
