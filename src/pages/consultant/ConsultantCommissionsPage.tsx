/**
 * Consultant Commissions Page
 * View commissions and manage withdrawals
 */

import { useState, useEffect } from 'react';
import { useConsultantAuth } from '@/contexts/ConsultantAuthContext';
import { consultantService } from '@/shared/lib/consultant/consultantService';
import { consultantWithdrawalService } from '@/shared/lib/consultant/consultantWithdrawalService';
import { Commission } from '@/shared/lib/hrm8/commissionService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { EnhancedStatCard } from '@/shared/components/dashboard/EnhancedStatCard';
import { DataTable } from '@/shared/components/tables/DataTable';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { Label } from '@/shared/components/ui/label';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { DollarSign, Clock, CheckCircle, Wallet, Download, XCircle, ArrowDownToLine } from 'lucide-react';
import { toast } from 'sonner';
import { WithdrawalBalance, CommissionWithdrawal } from '@/shared/types/withdrawal';
import { Skeleton } from '@/shared/components/ui/skeleton';

export default function ConsultantCommissionsPage() {
  const { consultant } = useConsultantAuth();
  const [activeTab, setActiveTab] = useState<'commissions' | 'withdrawals'>('commissions');
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [balance, setBalance] = useState<WithdrawalBalance | null>(null);
  const [withdrawals, setWithdrawals] = useState<CommissionWithdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [withdrawalDialogOpen, setWithdrawalDialogOpen] = useState(false);
  const [selectedCommissions, setSelectedCommissions] = useState<string[]>([]);
  const [_withdrawalAmount, _setWithdrawalAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('STRIPE');
  const [withdrawalNotes, setWithdrawalNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Use consultant data for future features
  void consultant;

  useEffect(() => {
    loadCommissions();
    loadBalance();
    loadWithdrawals();
  }, []);

  const loadCommissions = async () => {
    try {
      setLoading(true);
      const response = await consultantService.getCommissions();
      console.log('[CommissionsPage] Commissions response:', response);

      // Handle both response formats - backend returns array directly in data
      const commissionsData = Array.isArray(response.data) ? response.data : response.data?.commissions;
      console.log('[CommissionsPage] Commissions data:', commissionsData);

      if (response.success && commissionsData && Array.isArray(commissionsData)) {
        setCommissions(commissionsData);
      }
    } catch (error) {
      console.error('[CommissionsPage] Error loading commissions:', error);
      toast.error('Failed to load commissions');
    } finally {
      setLoading(false);
    }
  };

  const loadBalance = async () => {
    try {
      const response = await consultantWithdrawalService.getBalance();
      console.log('[CommissionsPage] Balance response:', response);

      // Handle both response formats - backend returns balance object directly in data
      const balanceData = (response.data?.balance || response.data) as WithdrawalBalance;
      console.log('[CommissionsPage] Balance data:', balanceData);

      if (response.success && balanceData) {
        setBalance(balanceData);
      }
    } catch (error) {
      console.error('[CommissionsPage] Failed to load balance:', error);
    }
  };

  const loadWithdrawals = async () => {
    try {
      const response = await consultantWithdrawalService.getWithdrawals();
      console.log('[CommissionsPage] Withdrawals response:', response);

      // Handle both response formats - backend returns array directly in data
      const withdrawalsData = Array.isArray(response.data) ? response.data : response.data?.withdrawals;
      console.log('[CommissionsPage] Withdrawals data:', withdrawalsData);

      if (response.success && withdrawalsData && Array.isArray(withdrawalsData)) {
        setWithdrawals(withdrawalsData);
      }
    } catch (error) {
      console.error('[CommissionsPage] Failed to load withdrawals:', error);
    }
  };

  const handleOpenWithdrawalDialog = () => {
    if (!balance || balance.availableBalance <= 0) {
      toast.error('No available balance to withdraw');
      return;
    }
    setWithdrawalDialogOpen(true);
  };

  const toggleCommissionSelection = (commissionId: string) => {
    setSelectedCommissions(prev =>
      prev.includes(commissionId)
        ? prev.filter(id => id !== commissionId)
        : [...prev, commissionId]
    );
  };

  const calculateSelectedAmount = () => {
    if (!balance) return 0;
    return balance.availableCommissions
      .filter(c => selectedCommissions.includes(c.id))
      .reduce((sum, c) => sum + c.amount, 0);
  };

  const handleSubmitWithdrawal = async () => {
    if (selectedCommissions.length === 0) {
      toast.error('Please select at least one commission');
      return;
    }

    const amount = calculateSelectedAmount();
    if (amount <= 0) {
      toast.error('Invalid withdrawal amount');
      return;
    }

    try {
      setSubmitting(true);
      const response = await consultantWithdrawalService.requestWithdrawal({
        amount,
        paymentMethod,
        commissionIds: selectedCommissions,
        notes: withdrawalNotes,
      });

      if (response.success) {
        toast.success('Withdrawal request submitted successfully');
        setWithdrawalDialogOpen(false);
        setSelectedCommissions([]);
        setWithdrawalNotes('');
        loadBalance();
        loadWithdrawals();
      } else {
        toast.error(response.error || 'Failed to submit withdrawal request');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit withdrawal');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelWithdrawal = async (withdrawalId: string) => {
    try {
      const response = await consultantWithdrawalService.cancelWithdrawal(withdrawalId);
      if (response.success) {
        toast.success('Withdrawal cancelled');
        loadBalance();
        loadWithdrawals();
      } else {
        toast.error(response.error || 'Failed to cancel withdrawal');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to cancel withdrawal');
    }
  };

  const commissionColumns = [
    {
      key: 'amount',
      label: 'Amount',
      render: (commission: Commission) => (
        <span className="text-sm font-semibold">
          {commission.currency || 'USD'} {commission.amount?.toLocaleString() || 0}
        </span>
      ),
    },
    {
      key: 'type',
      label: 'Type',
      render: (commission: Commission) => (
        <Badge variant="outline" className="h-6 px-2 text-xs rounded-full">
          {(commission.type || 'N/A').replace('_', ' ')}
        </Badge>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (commission: Commission) => {
        const status = commission.status || 'PENDING';
        const variants: Record<string, { className: string; label: string }> = {
          PENDING: { className: 'bg-warning/10 text-warning border-warning/20', label: 'Pending' },
          CONFIRMED: { className: 'bg-primary/10 text-primary border-primary/20', label: 'Confirmed' },
          PAID: { className: 'bg-success/10 text-success border-success/20', label: 'Paid' },
          CANCELLED: { className: 'bg-destructive/10 text-destructive border-destructive/20', label: 'Cancelled' },
        };
        const variant = variants[status] || { className: '', label: status };
        return (
          <Badge variant="outline" className={`h-6 px-2 text-xs rounded-full ${variant.className}`}>
            {variant.label}
          </Badge>
        );
      },
    },
    {
      key: 'created_at',
      label: 'Created',
      render: (commission: Commission) => (
        <span className="text-sm text-muted-foreground">
          {commission.created_at ? new Date(commission.created_at).toLocaleDateString() : 'N/A'}
        </span>
      ),
    },
  ];

  const withdrawalColumns = [
    {
      key: 'amount',
      label: 'Amount',
      render: (withdrawal: CommissionWithdrawal) => (
        <span className="text-sm font-semibold">USD {withdrawal.amount.toLocaleString()}</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (withdrawal: CommissionWithdrawal) => {
        const variants: Record<string, { className: string }> = {
          PENDING: { className: 'bg-warning/10 text-warning border-warning/20' },
          APPROVED: { className: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
          PROCESSING: { className: 'bg-purple-500/10 text-purple-500 border-purple-500/20' },
          COMPLETED: { className: 'bg-success/10 text-success border-success/20' },
          REJECTED: { className: 'bg-destructive/10 text-destructive border-destructive/20' },
          CANCELLED: { className: 'bg-gray-500/10 text-gray-500 border-gray-500/20' },
        };
        const variant = variants[withdrawal.status] || { className: '' };
        return (
          <Badge variant="outline" className={`h-6 px-2 text-xs rounded-full ${variant.className}`}>
            {withdrawal.status}
          </Badge>
        );
      },
    },
    {
      key: 'paymentMethod',
      label: 'Method',
      render: (withdrawal: CommissionWithdrawal) => (
        <span className="text-sm">{withdrawal.paymentMethod}</span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Requested',
      render: (withdrawal: CommissionWithdrawal) => (
        <span className="text-sm text-muted-foreground">
          {new Date(withdrawal.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (withdrawal: CommissionWithdrawal) => (
        withdrawal.status === 'PENDING' && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleCancelWithdrawal(withdrawal.id)}
          >
            <XCircle className="h-4 w-4 mr-1" />
            Cancel
          </Button>
        )
      ),
    },
  ];

  const totalPending = commissions
    .filter(c => c.status === 'PENDING')
    .reduce((sum, c) => sum + (c.amount || 0), 0);
  const totalPaid = commissions
    .filter(c => c.status === 'PAID')
    .reduce((sum, c) => sum + (c.amount || 0), 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Commissions & Withdrawals</h1>
          <p className="text-muted-foreground">Manage your earnings and withdraw funds</p>
        </div>
        <Button
          onClick={handleOpenWithdrawalDialog}
          disabled={!balance || balance.availableBalance <= 0}
          size="lg"
        >
          <ArrowDownToLine className="h-4 w-4 mr-2" />
          Request Withdrawal
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          <>
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-lg border bg-card p-4">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="mt-3 h-8 w-32" />
                <Skeleton className="mt-2 h-3 w-24" />
              </div>
            ))}
          </>
        ) : (
          <>
            <EnhancedStatCard
              title="Available Balance"
              value=""
              change="Ready to withdraw"
              isCurrency={true}
              rawValue={balance?.availableBalance || 0}
              icon={<Wallet className="h-5 w-5" />}
              variant="success"
            />
            <EnhancedStatCard
              title="Pending Commissions"
              value=""
              change="Being processed"
              isCurrency={true}
              rawValue={balance?.pendingBalance || totalPending}
              icon={<Clock className="h-5 w-5" />}
              variant="neutral"
            />
            <EnhancedStatCard
              title="Total Paid"
              value=""
              change="All time"
              isCurrency={true}
              rawValue={totalPaid}
              icon={<CheckCircle className="h-5 w-5" />}
              variant="neutral"
            />
            <EnhancedStatCard
              title="Total Withdrawn"
              value=""
              change="All time"
              isCurrency={true}
              rawValue={balance?.totalWithdrawn || 0}
              icon={<Download className="h-5 w-5" />}
              variant="neutral"
            />
          </>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="space-y-4">
        <TabsList>
          <TabsTrigger value="commissions">Commissions</TabsTrigger>
          <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
        </TabsList>

        <TabsContent value="commissions">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Commission History</CardTitle>
              <CardDescription className="text-sm">
                {commissions.length} total commission{commissions.length !== 1 ? 's' : ''}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between rounded-lg border p-3">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                      <Skeleton className="h-6 w-20" />
                    </div>
                  ))}
                </div>
              ) : commissions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-sm">No commissions yet</p>
                </div>
              ) : (
                <DataTable
                  data={commissions}
                  columns={commissionColumns}
                  searchable
                  searchKeys={['type', 'status']}
                  emptyMessage="No commissions found"
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="withdrawals">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Withdrawal History</CardTitle>
              <CardDescription className="text-sm">
                {withdrawals.length} total withdrawal{withdrawals.length !== 1 ? 's' : ''}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between rounded-lg border p-3">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-3 w-28" />
                      </div>
                      <Skeleton className="h-6 w-20" />
                    </div>
                  ))}
                </div>
              ) : withdrawals.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Download className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-sm">No withdrawals yet</p>
                  <p className="text-xs mt-2">Request your first withdrawal to get started</p>
                </div>
              ) : (
                <DataTable
                  data={withdrawals}
                  columns={withdrawalColumns}
                  searchable
                  searchKeys={['status', 'paymentMethod']}
                  emptyMessage="No withdrawals found"
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Withdrawal Request Dialog */}
      <Dialog open={withdrawalDialogOpen} onOpenChange={setWithdrawalDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Request Withdrawal</DialogTitle>
            <DialogDescription>
              Select commissions to withdraw. Available balance: ${(balance?.availableBalance ?? 0).toFixed(2)}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">Select Commissions</Label>
              <div className="space-y-2 max-h-60 overflow-y-auto border rounded-md p-3">
                {balance?.availableCommissions.map((commission) => (
                  <div key={commission.id} className="flex items-center space-x-2 p-2 hover:bg-muted/50 rounded">
                    <Checkbox
                      checked={selectedCommissions.includes(commission.id)}
                      onCheckedChange={() => toggleCommissionSelection(commission.id)}
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium">${(commission.amount ?? 0).toFixed(2)}</div>
                      <div className="text-xs text-muted-foreground">{commission.description}</div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(commission.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label>Total Amount</Label>
              <Input
                value={`$${(calculateSelectedAmount() ?? 0).toFixed(2)}`}
                disabled
                className="mt-1.5"
              />
            </div>

            <div>
              <Label>Payment Method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="STRIPE">Stripe Connect</SelectItem>
                  <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                  <SelectItem value="PAYPAL">PayPal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Notes (Optional)</Label>
              <Textarea
                value={withdrawalNotes}
                onChange={(e) => setWithdrawalNotes(e.target.value)}
                placeholder="Add any notes about this withdrawal..."
                className="mt-1.5"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setWithdrawalDialogOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmitWithdrawal} disabled={submitting || selectedCommissions.length === 0}>
              {submitting ? 'Submitting...' : 'Submit Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
