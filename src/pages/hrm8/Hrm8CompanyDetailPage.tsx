import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Skeleton } from '@/shared/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import {
  ArrowLeft,
  Building2,
  Users,
  Briefcase,
  CreditCard,
  BarChart3,
  Shield,
  Loader2,
  Calendar,
  DollarSign,
} from 'lucide-react';
import { toast } from 'sonner';
import { useHrm8Auth } from '@/contexts/Hrm8AuthContext';
import { useRegionStore } from '@/shared/stores/useRegionStore';
import {
  companyAdminService,
  type CompanyOverviewDTO,
  type CompanyActivityEventDTO,
  type CompanyPricingContextDTO,
  type CompanyPricingOverrideDTO,
} from '@/shared/services/hrm8/companyAdminService';

type TabKey = 'overview' | 'activity' | 'users' | 'jobs' | 'pricing' | 'overrides';

interface CompanyUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
}

interface CompanyJob {
  id: string;
  title: string;
  status: string;
  type?: string;
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  postedAt: string;
  applicants: number;
  views: number;
  clicks: number;
  createdAt: string;
}

function statusColor(status: string): string {
  const s = status.toUpperCase();
  if (['ACTIVE', 'OPEN', 'PAID', 'VERIFIED'].includes(s)) return 'bg-emerald-100 text-emerald-800';
  if (['PENDING', 'DRAFT', 'TRIAL'].includes(s)) return 'bg-amber-100 text-amber-800';
  if (['CLOSED', 'INACTIVE', 'EXPIRED', 'CANCELLED'].includes(s)) return 'bg-red-100 text-red-800';
  if (['PAUSED', 'SUSPENDED'].includes(s)) return 'bg-orange-100 text-orange-800';
  return 'bg-gray-100 text-gray-800';
}

function fmtDate(dateStr: string | undefined | null): string {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

function fmtCurrency(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

export default function Hrm8CompanyDetailPage() {
  const { companyId } = useParams<{ companyId: string }>();
  const navigate = useNavigate();
  const { hrm8User } = useHrm8Auth();
  const { regions } = useRegionStore();
  const isGlobalAdmin = (hrm8User as any)?.role === 'GLOBAL_ADMIN';

  const [activeTab, setActiveTab] = useState<TabKey>('overview');

  // Overview
  const [overview, setOverview] = useState<CompanyOverviewDTO | null>(null);
  const [overviewLoading, setOverviewLoading] = useState(false);
  const [overviewError, setOverviewError] = useState<string | null>(null);

  // Activity
  const [activity, setActivity] = useState<CompanyActivityEventDTO[]>([]);
  const [activityLoading, setActivityLoading] = useState(false);
  const [activityError, setActivityError] = useState<string | null>(null);

  // Users
  const [users, setUsers] = useState<CompanyUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);

  // Jobs
  const [jobs, setJobs] = useState<CompanyJob[]>([]);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [jobsError, setJobsError] = useState<string | null>(null);

  // Pricing Context
  const [pricingCtx, setPricingCtx] = useState<CompanyPricingContextDTO | null>(null);
  const [pricingCtxLoading, setPricingCtxLoading] = useState(false);
  const [pricingCtxError, setPricingCtxError] = useState<string | null>(null);

  // Overrides
  const [overrides, setOverrides] = useState<CompanyPricingOverrideDTO[]>([]);
  const [overridesLoading, setOverridesLoading] = useState(false);
  const [overridesError, setOverridesError] = useState<string | null>(null);
  const [actionInFlight, setActionInFlight] = useState<string | null>(null);

  // Feature flag guard removed – all features enabled for testing.

  const loadOverview = useCallback(async () => {
    if (!companyId || overview) return;
    setOverviewLoading(true);
    setOverviewError(null);
    const res = await companyAdminService.getCompanyOverview(companyId);
    if (res.success && res.data) {
      setOverview(res.data);
    } else {
      setOverviewError(res.error ?? 'Failed to load overview');
    }
    setOverviewLoading(false);
  }, [companyId, overview]);

  const loadActivity = useCallback(async () => {
    if (!companyId || activity.length > 0) return;
    setActivityLoading(true);
    setActivityError(null);
    const res = await companyAdminService.getCompanyActivity(companyId);
    if (res.success && res.data) {
      setActivity(res.data.events);
    } else {
      setActivityError(res.error ?? 'Failed to load activity');
    }
    setActivityLoading(false);
  }, [companyId, activity.length]);

  const loadUsers = useCallback(async () => {
    if (!companyId || users.length > 0) return;
    setUsersLoading(true);
    setUsersError(null);
    const res = await companyAdminService.getCompanyUsers(companyId);
    if (res.success && res.data) {
      setUsers(res.data.users);
    } else {
      setUsersError(res.error ?? 'Failed to load users');
    }
    setUsersLoading(false);
  }, [companyId, users.length]);

  const loadJobs = useCallback(async () => {
    if (!companyId || jobs.length > 0) return;
    setJobsLoading(true);
    setJobsError(null);
    const res = await companyAdminService.getCompanyJobs(companyId);
    if (res.success && res.data) {
      setJobs(res.data.jobs);
    } else {
      setJobsError(res.error ?? 'Failed to load jobs');
    }
    setJobsLoading(false);
  }, [companyId, jobs.length]);

  const loadPricingCtx = useCallback(async () => {
    if (!companyId || pricingCtx) return;
    setPricingCtxLoading(true);
    setPricingCtxError(null);
    const res = await companyAdminService.getCompanyPricingContext(companyId);
    if (res.success && res.data) {
      setPricingCtx(res.data);
    } else {
      setPricingCtxError(res.error ?? 'Failed to load pricing context');
    }
    setPricingCtxLoading(false);
  }, [companyId, pricingCtx]);

  const loadOverrides = useCallback(async (force = false) => {
    if (!companyId || (!force && overrides.length > 0)) return;
    setOverridesLoading(true);
    setOverridesError(null);
    const res = await companyAdminService.getCompanyPricingOverrides(companyId);
    if (res.success && res.data) {
      setOverrides(res.data.overrides);
    } else {
      setOverridesError(res.error ?? 'Failed to load overrides');
    }
    setOverridesLoading(false);
  }, [companyId, overrides.length]);

  useEffect(() => {
    if (!companyId) return;
    const loaders: Record<TabKey, () => void> = {
      overview: loadOverview,
      activity: loadActivity,
      users: loadUsers,
      jobs: loadJobs,
      pricing: loadPricingCtx,
      overrides: () => loadOverrides(false),
    };
    loaders[activeTab]();
  }, [activeTab, companyId, loadOverview, loadActivity, loadUsers, loadJobs, loadPricingCtx, loadOverrides]);

  const handleActivateOverride = async (overrideId: string) => {
    if (!companyId) return;
    setActionInFlight(overrideId);
    const res = await companyAdminService.activatePricingOverride(companyId, overrideId);
    if (res.success) {
      toast.success('Override activated');
      await loadOverrides(true);
    } else {
      toast.error(res.error ?? 'Failed to activate override');
    }
    setActionInFlight(null);
  };

  const handleDeactivateOverride = async (overrideId: string) => {
    if (!companyId) return;
    setActionInFlight(overrideId);
    const res = await companyAdminService.deactivatePricingOverride(companyId, overrideId);
    if (res.success) {
      toast.success('Override deactivated');
      await loadOverrides(true);
    } else {
      toast.error(res.error ?? 'Failed to deactivate override');
    }
    setActionInFlight(null);
  };

  const handleCreateOverride = async () => {
    if (!companyId || !pricingCtx) return;
    const name = window.prompt('Override name:');
    if (!name?.trim()) return;
    const sourcePriceBookId =
      pricingCtx.pricingContext.resolvedPriceBook?.id ?? pricingCtx.company.price_book_id ?? '';
    const res = await companyAdminService.createPricingOverride(companyId, {
      name: name.trim(),
      sourcePriceBookId,
    });
    if (res.success) {
      toast.success('Override created');
      await loadOverrides(true);
    } else {
      toast.error(res.error ?? 'Failed to create override');
    }
  };

  const regionName = (regionId?: string) => {
    if (!regionId) return '—';
    return regions.find((r) => r.id === regionId)?.name ?? regionId;
  };

  if (!companyId) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">No company selected.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/hrm8/companies')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1 min-w-0">
          {overviewLoading && !overview ? (
            <Skeleton className="h-8 w-64" />
          ) : (
            <div className="flex items-center gap-3">
              <Building2 className="h-6 w-6 text-primary shrink-0" />
              <h1 className="text-2xl font-bold truncate">{overview?.company.name ?? 'Company Detail'}</h1>
              {overview?.activeSubscription?.status && (
                <Badge className={statusColor(overview.activeSubscription.status)}>{overview.activeSubscription.status}</Badge>
              )}
            </div>
          )}
          {overview && (
            <p className="text-sm text-muted-foreground mt-1">
              {overview.company.domain && <span>{overview.company.domain} · </span>}
              {overview.company.country_or_region && <span>{overview.company.country_or_region} · </span>}
              Region: {regionName(overview.company.region?.id)} · Created {fmtDate(overview.company.created_at)}
            </p>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabKey)}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview" className="gap-1.5">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="activity" className="gap-1.5">
            <Calendar className="h-4 w-4" />
            Activity
          </TabsTrigger>
          <TabsTrigger value="users" className="gap-1.5">
            <Users className="h-4 w-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="jobs" className="gap-1.5">
            <Briefcase className="h-4 w-4" />
            Jobs
          </TabsTrigger>
          <TabsTrigger value="pricing" className="gap-1.5">
            <CreditCard className="h-4 w-4" />
            Pricing
          </TabsTrigger>
          <TabsTrigger value="overrides" className="gap-1.5">
            <Shield className="h-4 w-4" />
            Overrides
          </TabsTrigger>
        </TabsList>

        {/* ── Overview ── */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          {overviewLoading && !overview ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-32 rounded-xl" />
              ))}
            </div>
          ) : overviewError ? (
            <ErrorCard message={overviewError} />
          ) : overview ? (
            <>
              {/* Info Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Company Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <dt className="text-muted-foreground">Domain</dt>
                      <dd className="font-medium">{overview.company.domain || '—'}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Country</dt>
                      <dd className="font-medium">{overview.company.country_or_region || overview.company.country || '—'}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Website</dt>
                      <dd className="font-medium truncate">
                        {overview.company.website ? (
                          <a href={overview.company.website} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                            {overview.company.website}
                          </a>
                        ) : '—'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Last Updated</dt>
                      <dd className="font-medium">{fmtDate(overview.company.updated_at)}</dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard icon={<Briefcase className="h-5 w-5 text-blue-600" />} label="Open Jobs" value={String(overview.stats.open_jobs_count)} />
                <StatCard icon={<Briefcase className="h-5 w-5 text-sky-600" />} label="Total Jobs" value={String(overview.stats.total_jobs_count)} />
                <StatCard icon={<Users className="h-5 w-5 text-violet-600" />} label="Applications" value={String(overview.stats.applications_count)} />
                <StatCard icon={<DollarSign className="h-5 w-5 text-emerald-600" />} label="Wallet Balance" value={overview.wallet ? fmtCurrency(Number(overview.wallet.balance), overview.company.billing_currency || 'USD') : '—'} />
              </div>

              {/* Wallet + Subscription row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader><CardTitle className="text-lg">Active Subscription</CardTitle></CardHeader>
                  <CardContent>
                    {overview.activeSubscription ? (
                      <dl className="grid grid-cols-2 gap-3 text-sm">
                        <div><dt className="text-muted-foreground">Plan</dt><dd className="font-medium">{overview.activeSubscription.name || overview.activeSubscription.plan_type || '—'}</dd></div>
                        <div><dt className="text-muted-foreground">Status</dt><dd><Badge className={`text-xs ${statusColor(overview.activeSubscription.status)}`}>{overview.activeSubscription.status}</Badge></dd></div>
                        <div><dt className="text-muted-foreground">Jobs Used</dt><dd className="font-medium">{overview.activeSubscription.jobs_used ?? 0}{overview.activeSubscription.job_quota != null && ` / ${overview.activeSubscription.job_quota}`}</dd></div>
                        <div><dt className="text-muted-foreground">Renewal</dt><dd className="font-medium">{fmtDate(overview.activeSubscription.renewal_date)}</dd></div>
                        <div><dt className="text-muted-foreground">Start</dt><dd className="font-medium">{fmtDate(overview.activeSubscription.start_date)}</dd></div>
                      </dl>
                    ) : (<p className="text-sm text-muted-foreground">No active subscription</p>)}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader><CardTitle className="text-lg">Wallet</CardTitle></CardHeader>
                  <CardContent>
                    {overview.wallet ? (
                      <dl className="grid grid-cols-2 gap-3 text-sm">
                        <div><dt className="text-muted-foreground">Balance</dt><dd className="font-medium text-lg">{fmtCurrency(Number(overview.wallet.balance), overview.company.billing_currency || 'USD')}</dd></div>
                        <div><dt className="text-muted-foreground">Status</dt><dd><Badge className={`text-xs ${statusColor(overview.wallet.status)}`}>{overview.wallet.status}</Badge></dd></div>
                        <div><dt className="text-muted-foreground">Total Credits</dt><dd className="font-medium">{fmtCurrency(Number(overview.wallet.total_credits), overview.company.billing_currency || 'USD')}</dd></div>
                        <div><dt className="text-muted-foreground">Total Debits</dt><dd className="font-medium">{fmtCurrency(Number(overview.wallet.total_debits), overview.company.billing_currency || 'USD')}</dd></div>
                      </dl>
                    ) : (<p className="text-sm text-muted-foreground">No wallet found</p>)}
                  </CardContent>
                </Card>
              </div>

              {/* Attribution */}
              <Card>
                <CardHeader><CardTitle className="text-lg">Attribution & Billing</CardTitle></CardHeader>
                <CardContent>
                  <dl className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div><dt className="text-muted-foreground">Billing Currency</dt><dd className="font-medium">{overview.company.billing_currency || '—'}</dd></div>
                    <div><dt className="text-muted-foreground">Pricing Peg</dt><dd className="font-medium">{overview.company.pricing_peg || '—'}</dd></div>
                    <div><dt className="text-muted-foreground">Attribution</dt><dd><Badge className={`text-xs ${overview.company.attribution_locked ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'}`}>{overview.company.attribution_locked ? 'Locked' : 'Open'}</Badge></dd></div>
                    <div><dt className="text-muted-foreground">Currency Lock</dt><dd className="font-medium">{overview.company.currency_locked_at ? fmtDate(overview.company.currency_locked_at) : 'Unlocked'}</dd></div>
                    <div><dt className="text-muted-foreground">Price Book</dt><dd className="font-medium">{overview.company.price_book?.name || '—'}</dd></div>
                    <div><dt className="text-muted-foreground">Region</dt><dd className="font-medium">{overview.company.region?.name || '—'}</dd></div>
                    <div><dt className="text-muted-foreground">Users</dt><dd className="font-medium">{overview.stats.users_count}</dd></div>
                  </dl>
                </CardContent>
              </Card>

              {/* Commercial Evidence — full detail */}
              <Card>
                <CardHeader><CardTitle className="text-lg">Lead & Conversion Milestones</CardTitle></CardHeader>
                <CardContent>
                  <dl className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div><dt className="text-muted-foreground">Lead Created</dt><dd className="font-medium">{fmtDate(overview.commercialEvidence.leadMilestones?.lead_created_at)}</dd></div>
                    <div><dt className="text-muted-foreground">Lead Confirmed</dt><dd className="font-medium">{fmtDate(overview.commercialEvidence.leadMilestones?.lead_confirmed_at)}</dd></div>
                    <div><dt className="text-muted-foreground">Lead Source</dt><dd className="font-medium">{overview.commercialEvidence.leadMilestones?.lead_source || '—'}</dd></div>
                    <div><dt className="text-muted-foreground">Lead Status</dt><dd className="font-medium">{overview.commercialEvidence.leadMilestones?.lead_status || '—'}</dd></div>
                    <div><dt className="text-muted-foreground">Conversion Requested</dt><dd className="font-medium">{fmtDate(overview.commercialEvidence.conversionMilestones?.request_submitted_at)}</dd></div>
                    <div><dt className="text-muted-foreground">Reviewed</dt><dd className="font-medium">{fmtDate(overview.commercialEvidence.conversionMilestones?.reviewed_at)}</dd></div>
                    <div><dt className="text-muted-foreground">Converted</dt><dd className="font-medium">{fmtDate(overview.commercialEvidence.conversionMilestones?.converted_at)}</dd></div>
                  </dl>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader><CardTitle className="text-lg">First Job Evidence</CardTitle></CardHeader>
                  <CardContent>
                    {overview.commercialEvidence.firstJobEvidence ? (
                      <dl className="grid grid-cols-2 gap-3 text-sm">
                        <div><dt className="text-muted-foreground">Title</dt><dd className="font-medium">{overview.commercialEvidence.firstJobEvidence.title || '—'}</dd></div>
                        <div><dt className="text-muted-foreground">Posted</dt><dd className="font-medium">{fmtDate(overview.commercialEvidence.firstJobEvidence.posted_at)}</dd></div>
                        <div><dt className="text-muted-foreground">Setup Type</dt><dd className="font-medium">{overview.commercialEvidence.firstJobEvidence.setup_type || '—'}</dd></div>
                        <div><dt className="text-muted-foreground">Service</dt><dd className="font-medium">{overview.commercialEvidence.firstJobEvidence.service_package || overview.commercialEvidence.firstJobEvidence.hiring_mode || '—'}</dd></div>
                        <div><dt className="text-muted-foreground">Payment Status</dt><dd className="font-medium">{overview.commercialEvidence.firstJobEvidence.payment_status || '—'}</dd></div>
                        {overview.commercialEvidence.firstJobEvidence.payment_amount != null && (
                          <div><dt className="text-muted-foreground">Payment Amount</dt><dd className="font-medium">{fmtCurrency(overview.commercialEvidence.firstJobEvidence.payment_amount, overview.commercialEvidence.firstJobEvidence.payment_currency || overview.company.billing_currency || 'USD')}</dd></div>
                        )}
                      </dl>
                    ) : (<p className="text-sm text-muted-foreground">No job posted yet</p>)}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader><CardTitle className="text-lg">First Payment Evidence</CardTitle></CardHeader>
                  <CardContent>
                    {overview.commercialEvidence.firstPaymentEvidence ? (
                      <dl className="grid grid-cols-2 gap-3 text-sm">
                        <div><dt className="text-muted-foreground">Amount</dt><dd className="font-medium">{fmtCurrency(overview.commercialEvidence.firstPaymentEvidence.amount ?? 0, overview.commercialEvidence.firstPaymentEvidence.currency || overview.company.billing_currency || 'USD')}</dd></div>
                        <div><dt className="text-muted-foreground">Paid At</dt><dd className="font-medium">{fmtDate(overview.commercialEvidence.firstPaymentEvidence.paid_at)}</dd></div>
                        <div><dt className="text-muted-foreground">Source</dt><dd className="font-medium">{overview.commercialEvidence.firstPaymentEvidence.source || '—'}</dd></div>
                      </dl>
                    ) : (<p className="text-sm text-muted-foreground">No payment recorded yet</p>)}
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader><CardTitle className="text-lg">Subscription at First Job</CardTitle></CardHeader>
                  <CardContent>
                    {overview.commercialEvidence.subscriptionAtFirstJob ? (
                      <dl className="grid grid-cols-2 gap-3 text-sm">
                        <div><dt className="text-muted-foreground">Plan</dt><dd className="font-medium">{overview.commercialEvidence.subscriptionAtFirstJob.name || overview.commercialEvidence.subscriptionAtFirstJob.plan_type || '—'}</dd></div>
                        <div><dt className="text-muted-foreground">Price</dt><dd className="font-medium">{overview.commercialEvidence.subscriptionAtFirstJob.base_price != null ? fmtCurrency(overview.commercialEvidence.subscriptionAtFirstJob.base_price, overview.commercialEvidence.subscriptionAtFirstJob.currency || overview.company.billing_currency || 'USD') : '—'}</dd></div>
                        <div><dt className="text-muted-foreground">Billing Cycle</dt><dd className="font-medium">{overview.commercialEvidence.subscriptionAtFirstJob.billing_cycle || '—'}</dd></div>
                        <div><dt className="text-muted-foreground">Created</dt><dd className="font-medium">{fmtDate(overview.commercialEvidence.subscriptionAtFirstJob.created_at)}</dd></div>
                      </dl>
                    ) : (<p className="text-sm text-muted-foreground">No subscription at first job</p>)}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader><CardTitle className="text-lg">Commission Readiness</CardTitle></CardHeader>
                  <CardContent>
                    <dl className="space-y-3 text-sm">
                      <div className="flex items-center gap-2">
                        <dt className="text-muted-foreground">Eligible:</dt>
                        <dd><Badge className={`text-xs ${overview.commercialEvidence.commissionReadiness?.eligible ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>{overview.commercialEvidence.commissionReadiness?.eligible ? 'Yes' : 'No'}</Badge></dd>
                      </div>
                      <div><dt className="text-muted-foreground">Reason</dt><dd className="font-medium mt-0.5">{overview.commercialEvidence.commissionReadiness?.reason || '—'}</dd></div>
                      {overview.commercialEvidence.commissionReadiness?.existing_commission_id && (
                        <div><dt className="text-muted-foreground">Existing Commission</dt><dd className="font-mono text-xs mt-0.5">{overview.commercialEvidence.commissionReadiness.existing_commission_status} ({overview.commercialEvidence.commissionReadiness.existing_commission_id})</dd></div>
                      )}
                    </dl>
                  </CardContent>
                </Card>
              </div>

              {/* Data Completeness */}
              <Card>
                <CardHeader><CardTitle className="text-lg">Data Completeness</CardTitle></CardHeader>
                <CardContent>
                  <div className="flex gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Pre-approval:</span>
                      <Badge className={`text-xs ${overview.dataCompleteness?.preApprovalComplete ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                        {overview.dataCompleteness?.preApprovalComplete ? 'Complete' : 'Incomplete'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Post-payment evidence:</span>
                      <Badge className={`text-xs ${overview.dataCompleteness?.postPaymentAvailable ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                        {overview.dataCompleteness?.postPaymentAvailable ? 'Available' : 'Not yet'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : null}
        </TabsContent>

        {/* ── Activity ── */}
        <TabsContent value="activity" className="mt-6">
          {activityLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 rounded-lg" />
              ))}
            </div>
          ) : activityError ? (
            <ErrorCard message={activityError} />
          ) : activity.length === 0 ? (
            <EmptyState message="No activity events recorded." />
          ) : (
            <div className="relative border-l-2 border-muted ml-4 space-y-6 py-2">
              {activity.map((evt) => (
                <div key={evt.id} className="relative pl-8">
                  <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 border-primary bg-background" />
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs capitalize">
                          {evt.type.replace(/_/g, ' ').toLowerCase()}
                        </Badge>
                        <span className="text-sm font-medium">{evt.title}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{evt.description}</p>
                    </div>
                    <time className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                      {fmtDate(evt.occurredAt)}
                    </time>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ── Users ── */}
        <TabsContent value="users" className="mt-6">
          {usersLoading ? (
            <TableSkeleton rows={4} cols={5} />
          ) : usersError ? (
            <ErrorCard message={usersError} />
          ) : users.length === 0 ? (
            <EmptyState message="No users found for this company." />
          ) : (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{u.name}</TableCell>
                      <TableCell className="text-muted-foreground">{u.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">{u.role}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={`text-xs ${statusColor(u.status)}`}>{u.status}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">{fmtDate(u.created_at)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </TabsContent>

        {/* ── Jobs ── */}
        <TabsContent value="jobs" className="mt-6">
          {jobsLoading ? (
            <TableSkeleton rows={4} cols={6} />
          ) : jobsError ? (
            <ErrorCard message={jobsError} />
          ) : jobs.length === 0 ? (
            <EmptyState message="No jobs found for this company." />
          ) : (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Applicants</TableHead>
                    <TableHead>Posted</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobs.map((j) => (
                    <TableRow key={j.id}>
                      <TableCell className="font-medium">{j.title}</TableCell>
                      <TableCell>
                        <Badge className={`text-xs ${statusColor(j.status)}`}>{j.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">{j.type ?? '—'}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{j.location ?? '—'}</TableCell>
                      <TableCell className="text-sm">{j.applicants}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{fmtDate(j.postedAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </TabsContent>

        {/* ── Pricing Context ── */}
        <TabsContent value="pricing" className="space-y-6 mt-6">
          {pricingCtxLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-28 rounded-xl" />
              ))}
            </div>
          ) : pricingCtxError ? (
            <ErrorCard message={pricingCtxError} />
          ) : pricingCtx ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground">Resolved Price Book</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg font-semibold">{pricingCtx.pricingContext.resolvedPriceBook?.name ?? pricingCtx.pricingContext.assignedPriceBook?.name ?? '—'}</p>
                    <p className="text-xs text-muted-foreground mt-1">ID: {pricingCtx.pricingContext.resolvedPriceBook?.id ?? pricingCtx.company.price_book_id ?? '—'}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground">Currency & Billing</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg font-semibold">{pricingCtx.pricingContext.resolvedPriceBook?.currency ?? pricingCtx.company.billing_currency ?? '—'}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Billing: {pricingCtx.company.billing_currency ?? '—'} · Peg: {pricingCtx.company.pricing_peg ?? '—'}
                    </p>
                    <Badge className={`mt-2 text-xs ${pricingCtx.company.currency_locked_at ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'}`}>
                      {pricingCtx.company.currency_locked_at ? 'Currency Locked' : 'Currency Unlocked'}
                    </Badge>
                  </CardContent>
                </Card>
              </div>

              {/* Active Override */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Active Override</CardTitle>
                </CardHeader>
                <CardContent>
                  {pricingCtx.pricingContext.activeOverride ? (
                    <dl className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <dt className="text-muted-foreground">Price Book</dt>
                        <dd className="font-medium">{pricingCtx.pricingContext.activeOverride.price_book?.name ?? '—'}</dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Effective From</dt>
                        <dd className="font-medium">{fmtDate(pricingCtx.pricingContext.activeOverride.effective_from)}</dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">ID</dt>
                        <dd className="font-mono text-xs">{pricingCtx.pricingContext.activeOverride.id}</dd>
                      </div>
                    </dl>
                  ) : (
                    <p className="text-sm text-muted-foreground">No active override — using default price book</p>
                  )}
                </CardContent>
              </Card>

              {/* Available Price Books */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Available Price Books</CardTitle>
                </CardHeader>
                <CardContent>
                  {pricingCtx.pricingContext.availablePriceBooks.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No price books available</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Currency</TableHead>
                          <TableHead>Scope</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pricingCtx.pricingContext.availablePriceBooks.map((pb) => (
                          <TableRow key={pb.id}>
                            <TableCell className="font-medium">{pb.name}</TableCell>
                            <TableCell>{pb.currency}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-xs">
                                {pb.is_global ? 'Global' : 'Regional'}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </>
          ) : null}
        </TabsContent>

        {/* ── Overrides ── */}
        <TabsContent value="overrides" className="mt-6 space-y-4">
          {isGlobalAdmin && (
            <div className="flex justify-end">
              <Button onClick={handleCreateOverride} disabled={!pricingCtx}>
                + New Override
              </Button>
            </div>
          )}

          {overridesLoading ? (
            <TableSkeleton rows={3} cols={5} />
          ) : overridesError ? (
            <ErrorCard message={overridesError} />
          ) : overrides.length === 0 ? (
            <EmptyState message="No pricing overrides configured." />
          ) : (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Price Book</TableHead>
                    <TableHead>Effective From</TableHead>
                    <TableHead>Effective To</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead>Created</TableHead>
                    {isGlobalAdmin && <TableHead className="text-right">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {overrides.map((o) => (
                    <TableRow key={o.id}>
                      <TableCell className="font-medium">{o.price_book?.name || o.price_book_id || '—'}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{fmtDate(o.effective_from)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{o.effective_to ? fmtDate(o.effective_to) : 'No end'}</TableCell>
                      <TableCell>
                        <Badge className={`text-xs ${o.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-800'}`}>
                          {o.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">{o.notes || '—'}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{fmtDate(o.created_at)}</TableCell>
                      {isGlobalAdmin && (
                        <TableCell className="text-right">
                          {o.is_active ? (
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={actionInFlight === o.id}
                              onClick={() => handleDeactivateOverride(o.id)}
                            >
                              {actionInFlight === o.id ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Deactivate'}
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              disabled={actionInFlight === o.id}
                              onClick={() => handleActivateOverride(o.id)}
                            >
                              {actionInFlight === o.id ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Activate'}
                            </Button>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* ── Helper Components ── */

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 py-5">
        <div className="rounded-lg bg-muted p-2.5">{icon}</div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-xl font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function ErrorCard({ message }: { message: string }) {
  return (
    <Card className="border-destructive/50">
      <CardContent className="py-6 text-center">
        <p className="text-sm text-destructive">{message}</p>
      </CardContent>
    </Card>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <Card>
      <CardContent className="py-12 text-center">
        <p className="text-sm text-muted-foreground">{message}</p>
      </CardContent>
    </Card>
  );
}

function TableSkeleton({ rows, cols }: { rows: number; cols: number }) {
  return (
    <Card>
      <div className="p-4 space-y-3">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex gap-4">
            {Array.from({ length: cols }).map((_, c) => (
              <Skeleton key={c} className="h-6 flex-1 rounded" />
            ))}
          </div>
        ))}
      </div>
    </Card>
  );
}
