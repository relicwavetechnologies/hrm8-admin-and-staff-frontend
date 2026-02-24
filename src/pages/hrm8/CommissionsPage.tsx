import { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  CreditCard,
  DollarSign,
  Eye,
  Scale,
  ThumbsUp,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';

import { commissionService, Commission, CommissionReviewContext } from '@/shared/services/hrm8/commissionService';
import { DataTable, Column } from '@/shared/components/tables/DataTable';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Label } from '@/shared/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { DashboardStatCard } from '@/shared/components/dashboard/DashboardStatCard';
import { formatCurrency } from '@/shared/lib/utils';
import { CommissionPaymentDialog } from '@/shared/components/hrm8/CommissionPaymentDialog';
import { DisputeCommissionDialog } from '@/shared/components/hrm8/DisputeCommissionDialog';
import { ResolveDisputeDialog } from '@/shared/components/hrm8/ResolveDisputeDialog';
import { Hrm8PageLayout } from '@/shared/components/layouts/Hrm8PageLayout';
import { TableSkeleton } from '@/shared/components/tables/TableSkeleton';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/shared/components/ui/sheet';
import { Skeleton } from '@/shared/components/ui/skeleton';

const formatDate = (value?: string | Date | null) => {
  if (!value) return 'Not available';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not available';
  return format(date, 'MMM dd, yyyy p');
};

const compactDate = (value?: string | Date | null) => {
  if (!value) return '-';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return format(date, 'MMM dd, yyyy');
};

const getStatusBadge = (status: string) => {
  const statusConfig: Record<string, { icon: any; color: string; bg: string; label: string }> = {
    PENDING: { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50', label: 'Pending' },
    CONFIRMED: { icon: CheckCircle, color: 'text-primary', bg: 'bg-primary/10', label: 'Confirmed' },
    PAID: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', label: 'Paid' },
    CANCELLED: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', label: 'Cancelled' },
    DISPUTED: { icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-50', label: 'Disputed' },
    CLAWBACK: { icon: Scale, color: 'text-purple-600', bg: 'bg-purple-50', label: 'Clawback' },
  };
  const config = statusConfig[status] || statusConfig.PENDING;
  const Icon = config.icon;
  return (
    <Badge className={`${config.color} ${config.bg}`}>
      <Icon className="mr-1 h-3 w-3" />
      {config.label}
    </Badge>
  );
};

const getColumns = (
  onReview: (id: string) => void,
  onDispute: (id: string) => void,
  onResolve: (id: string) => void
): Column<Commission>[] => [
  {
    key: 'consultantId',
    label: 'Consultant',
    render: (commission) => (commission.consultantId ? `${commission.consultantId.substring(0, 8)}...` : 'N/A'),
  },
  {
    key: 'amount',
    label: 'Amount',
    render: (commission) => (
      <span className="font-semibold">
        {commission.currency || '—'} {commission.amount.toLocaleString()}
      </span>
    ),
  },
  {
    key: 'type',
    label: 'Type',
    render: (commission) => <Badge variant="outline">{(commission.type || 'N/A').replace('_', ' ')}</Badge>,
  },
  {
    key: 'status',
    label: 'Status',
    render: (commission) => getStatusBadge(commission.status),
  },
  {
    key: 'createdAt',
    label: 'Created',
    render: (commission) => <span>{compactDate(commission.createdAt)}</span>,
  },
  {
    key: 'actions',
    label: 'Actions',
    render: (commission) => (
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={(event) => {
            event.stopPropagation();
            onReview(commission.id);
          }}
        >
          <Eye className="h-3 w-3 mr-1" />
          Review
        </Button>
        {(commission.status === 'CONFIRMED' || commission.status === 'PAID') && (
          <Button
            size="sm"
            variant="ghost"
            className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
            onClick={(event) => {
              event.stopPropagation();
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
            onClick={(event) => {
              event.stopPropagation();
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

  const [disputeId, setDisputeId] = useState<string | null>(null);
  const [resolveId, setResolveId] = useState<string | null>(null);

  const [reviewId, setReviewId] = useState<string | null>(null);
  const [reviewContext, setReviewContext] = useState<CommissionReviewContext | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  useEffect(() => {
    void loadCommissions();
  }, [statusFilter]);

  const loadCommissions = async () => {
    try {
      setLoading(true);
      const filters: Record<string, string> = {};
      if (statusFilter !== 'all') filters.status = statusFilter;

      const response = await commissionService.getAll(filters);
      if (!response.success) {
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

  const loadReviewContext = async (id: string) => {
    setReviewId(id);
    setReviewOpen(true);
    setReviewLoading(true);
    setReviewContext(null);

    try {
      const response = await commissionService.getReviewContext(id);
      if (!response.success) {
        toast.error(response.error || 'Failed to load commission review context');
        return;
      }
      setReviewContext(response.data || null);
    } catch (error) {
      toast.error('Failed to load commission review context');
    } finally {
      setReviewLoading(false);
    }
  };

  const handleApproveCommission = async (id: string) => {
    try {
      setApprovingId(id);
      const response = await commissionService.confirm(id);
      if (response.success) {
        toast.success('Commission approved and credited to consultant wallet');
        await Promise.all([loadCommissions(), loadReviewContext(id)]);
      } else {
        toast.error(response.error || 'Failed to approve commission');
      }
    } catch (error) {
      toast.error('Failed to approve commission');
    } finally {
      setApprovingId(null);
    }
  };

  const handleOpenPaymentDialog = () => {
    const payable = commissions.filter((c) => c.status === 'PENDING' || c.status === 'CONFIRMED');
    setSelectedCommissions(payable);
    setPaymentDialogOpen(true);
  };

  const totalPending = commissions
    .filter((c) => c.status === 'PENDING')
    .reduce((sum, commission) => sum + commission.amount, 0);
  const totalPaid = commissions
    .filter((c) => c.status === 'PAID')
    .reduce((sum, commission) => sum + commission.amount, 0);

  const selectedCommission = useMemo(
    () => commissions.find((commission) => commission.id === reviewId) || null,
    [commissions, reviewId]
  );

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
          {commissions.filter((c) => c.status === 'PENDING' || c.status === 'CONFIRMED').length > 0 && (
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
                  (id) => void loadReviewContext(id),
                  (id) => setDisputeId(id),
                  (id) => setResolveId(id)
                )}
                searchable
                searchKeys={['consultantId', 'type']}
                emptyMessage="No commissions found"
                onRowClick={(row) => {
                  void loadReviewContext(row.id);
                }}
              />
            )}
          </CardContent>
        </Card>

        <CommissionPaymentDialog
          open={paymentDialogOpen}
          onOpenChange={setPaymentDialogOpen}
          commissions={selectedCommissions as any}
          onSuccess={() => {
            setPaymentDialogOpen(false);
            setSelectedCommissions([]);
            void loadCommissions();
          }}
        />

        <DisputeCommissionDialog
          open={!!disputeId}
          onOpenChange={(open) => !open && setDisputeId(null)}
          commissionId={disputeId}
          onSuccess={() => void loadCommissions()}
        />

        <ResolveDisputeDialog
          open={!!resolveId}
          onOpenChange={(open) => !open && setResolveId(null)}
          commissionId={resolveId}
          onSuccess={() => void loadCommissions()}
        />

        <Sheet open={reviewOpen} onOpenChange={setReviewOpen}>
          <SheetContent side="right" className="w-full sm:max-w-3xl p-0">
            <div className="flex h-full flex-col">
              <SheetHeader className="px-6 pt-6 pb-4 border-b bg-background/95 backdrop-blur">
                <SheetTitle className="text-xl">Commission Review</SheetTitle>
                <SheetDescription>
                  {selectedCommission
                    ? `Review ${selectedCommission.type.replace('_', ' ')} commission`
                    : 'Review commission details'}
                </SheetDescription>
              </SheetHeader>

              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
                {reviewLoading && (
                  <div className="space-y-4">
                    <Skeleton className="h-24 rounded-2xl" />
                    <Skeleton className="h-24 rounded-2xl" />
                    <Skeleton className="h-48 rounded-2xl" />
                  </div>
                )}

                {!reviewLoading && reviewContext && (
                  <>
                    <section className="space-y-3">
                      <h2 className="text-base font-semibold">Approval Essentials</h2>
                      <div className="rounded-2xl border p-4 space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="text-muted-foreground">Commission Type:</span>{' '}
                            <span className="font-medium">{reviewContext.commission.type.replace('_', ' ')}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Status:</span>{' '}
                            {getStatusBadge(reviewContext.commission.status)}
                          </div>
                          <div>
                            <span className="text-muted-foreground">Amount:</span>{' '}
                            <span className="font-medium">
                              {reviewContext.commission.currency || '—'} {reviewContext.commission.amount}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Created:</span>{' '}
                            <span className="font-medium">{formatDate(reviewContext.commission.createdAt)}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Company:</span>{' '}
                            <span className="font-medium">{reviewContext.companyContext?.name || 'Not available yet'}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Company Website:</span>{' '}
                            <span className="font-medium">{reviewContext.companyContext?.website || 'Not available yet'}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Lead Confirmed:</span>{' '}
                            <span className="font-medium">{formatDate(reviewContext.conversionContext.leadMilestones.lead_confirmed_at)}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Conversion Requested:</span>{' '}
                            <span className="font-medium">{formatDate(reviewContext.conversionContext.request?.created_at)}</span>
                          </div>
                        </div>

                        <div>
                          <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Sales Notes</p>
                          <p className="text-sm rounded-xl border bg-muted/20 p-3">
                            {reviewContext.conversionContext.request?.agent_notes || 'Not available yet'}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Intent Snapshot</p>
                          <div className="rounded-xl border bg-muted/20 p-3 text-sm space-y-1">
                            <div>
                              Setup Flow:{' '}
                              <span className="font-medium">
                                {reviewContext.conversionContext.request?.intent_snapshot?.intendedSetupType || 'Not specified'}
                              </span>
                            </div>
                            <div>
                              Service:{' '}
                              <span className="font-medium">
                                {reviewContext.conversionContext.request?.intent_snapshot?.intendedServicePackage || 'Not specified'}
                              </span>
                            </div>
                            <div>
                              Expected Plan:{' '}
                              <span className="font-medium">
                                {reviewContext.conversionContext.request?.intent_snapshot?.expectedSubscriptionPlan || 'Not specified'}
                              </span>
                            </div>
                            <div>
                              Expected First Payment:{' '}
                              <span className="font-medium">
                                {reviewContext.conversionContext.request?.intent_snapshot?.expectedFirstPaymentAmount
                                  ? `${reviewContext.conversionContext.request?.intent_snapshot?.expectedCurrency || ''} ${reviewContext.conversionContext.request.intent_snapshot.expectedFirstPaymentAmount}`
                                  : 'Not specified'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </section>

                    <section className="space-y-3">
                      <h2 className="text-base font-semibold">Post-Conversion Revenue Evidence</h2>
                      <div className="rounded-2xl border p-4 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          <div>
                            First Job Posted:{' '}
                            <span className="font-medium">{formatDate(reviewContext.commercialEvidence.firstJobEvidence?.posted_at)}</span>
                          </div>
                          <div>
                            Flow:{' '}
                            <span className="font-medium">
                              {reviewContext.commercialEvidence.firstJobEvidence?.setup_type || 'Not available yet'}
                            </span>
                          </div>
                          <div>
                            Service:{' '}
                            <span className="font-medium">
                              {reviewContext.commercialEvidence.firstJobEvidence?.service_package ||
                                reviewContext.commercialEvidence.firstJobEvidence?.hiring_mode ||
                                'Not available yet'}
                            </span>
                          </div>
                          <div>
                            Job Payment Status:{' '}
                            <span className="font-medium">
                              {reviewContext.commercialEvidence.firstJobEvidence?.payment_status || 'Not available yet'}
                            </span>
                          </div>
                          <div>
                            Subscription at First Job:{' '}
                            <span className="font-medium">
                              {reviewContext.commercialEvidence.subscriptionAtFirstJob?.name || 'Not available yet'}
                            </span>
                          </div>
                          <div>
                            Subscription Price:{' '}
                            <span className="font-medium">
                              {reviewContext.commercialEvidence.subscriptionAtFirstJob
                                ? `${reviewContext.commercialEvidence.subscriptionAtFirstJob.currency} ${reviewContext.commercialEvidence.subscriptionAtFirstJob.base_price}`
                                : 'Not available yet'}
                            </span>
                          </div>
                          <div>
                            First Payment:{' '}
                            <span className="font-medium">
                              {reviewContext.commercialEvidence.firstPaymentEvidence
                                ? `${reviewContext.commercialEvidence.firstPaymentEvidence.currency || ''} ${reviewContext.commercialEvidence.firstPaymentEvidence.amount}`
                                : 'Not available yet'}
                            </span>
                          </div>
                          <div>
                            First Payment Date:{' '}
                            <span className="font-medium">
                              {formatDate(reviewContext.commercialEvidence.firstPaymentEvidence?.paid_at)}
                            </span>
                          </div>
                        </div>

                        <div className="rounded-xl border bg-muted/20 p-3 text-sm space-y-2">
                          <div className="font-medium">Commission Readiness</div>
                          <div>
                            <span className="text-muted-foreground">Eligible:</span>{' '}
                            <span className="font-medium">
                              {reviewContext.commercialEvidence.commissionReadiness.eligible ? 'Yes' : 'No'}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Reason:</span>{' '}
                            <span className="font-medium">{reviewContext.commercialEvidence.commissionReadiness.reason}</span>
                          </div>
                          {reviewContext.commercialEvidence.commissionReadiness.existing_commission_id && (
                            <div>
                              <span className="text-muted-foreground">Existing Commission:</span>{' '}
                              <span className="font-medium">
                                {reviewContext.commercialEvidence.commissionReadiness.existing_commission_id}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </section>
                  </>
                )}
              </div>

              <div className="border-t px-6 py-4 bg-background/95 backdrop-blur flex items-center justify-between">
                <div className="text-xs text-muted-foreground">
                  Pre-approval data:{' '}
                  <span className="font-medium">
                    {reviewContext?.dataCompleteness.preApprovalComplete ? 'Complete' : 'Partial'}
                  </span>{' '}
                  | Post-payment evidence:{' '}
                  <span className="font-medium">
                    {reviewContext?.dataCompleteness.postPaymentAvailable ? 'Available' : 'Not available yet'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={() => setReviewOpen(false)}>
                    Close
                  </Button>
                  {selectedCommission?.status === 'PENDING' && (
                    <Button
                      onClick={() => void handleApproveCommission(selectedCommission.id)}
                      disabled={approvingId === selectedCommission.id}
                    >
                      {approvingId === selectedCommission.id ? (
                        'Approving...'
                      ) : (
                        <>
                          <ThumbsUp className="h-4 w-4 mr-1" />
                          Approve
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </Hrm8PageLayout>
  );
}
