import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, RefreshCcw, ShieldCheck } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { DataTable, type Column } from '@/shared/components/tables/DataTable';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { Label } from '@/shared/components/ui/label';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { useHrm8Auth } from '@/contexts/Hrm8AuthContext';
import {
  companyAdminService,
  type CompanyActivityEvent,
  type CompanyOverviewResponse,
  type CompanyPricingContextResponse,
  type CompanyPricingOverridesResponse,
  type CompanyUsersResponse,
} from '@/shared/services/hrm8/companyAdminService';
import { toast } from 'sonner';

function formatDateTime(value?: string | null) {
  if (!value) return 'Not available yet';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not available yet';
  return date.toLocaleString();
}

function formatMoney(amount?: number | null, currency?: string | null) {
  if (amount === undefined || amount === null) return 'Not available yet';
  return `${currency || ''} ${Number(amount).toLocaleString()}`.trim();
}

export default function Hrm8CompanyDetailPage() {
  const { companyId } = useParams<{ companyId: string }>();
  const navigate = useNavigate();
  const { hrm8User } = useHrm8Auth();
  const isGlobalAdmin = hrm8User?.role === 'GLOBAL_ADMIN';

  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<CompanyOverviewResponse | null>(null);
  const [activity, setActivity] = useState<CompanyActivityEvent[]>([]);
  const [users, setUsers] = useState<CompanyUsersResponse['users']>([]);
  const [pricingContext, setPricingContext] = useState<CompanyPricingContextResponse | null>(null);
  const [pricingOverrides, setPricingOverrides] = useState<CompanyPricingOverridesResponse['overrides']>([]);

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [overrideSourcePriceBookId, setOverrideSourcePriceBookId] = useState('');
  const [overrideName, setOverrideName] = useState('');
  const [overrideDescription, setOverrideDescription] = useState('');
  const [overrideNotes, setOverrideNotes] = useState('');
  const [overrideEffectiveFrom, setOverrideEffectiveFrom] = useState('');
  const [overrideEffectiveTo, setOverrideEffectiveTo] = useState('');
  const [overrideActivateImmediately, setOverrideActivateImmediately] = useState(true);

  const loadCompanyData = async () => {
    if (!companyId) return;

    try {
      setLoading(true);

      const [overviewRes, activityRes, usersRes, pricingContextRes, overridesRes] = await Promise.all([
        companyAdminService.getCompanyOverview(companyId),
        companyAdminService.getCompanyActivity(companyId, 100),
        companyAdminService.getCompanyUsers(companyId),
        companyAdminService.getCompanyPricingContext(companyId),
        companyAdminService.getCompanyPricingOverrides(companyId),
      ]);

      if (!overviewRes.success || !overviewRes.data) {
        throw new Error(overviewRes.error || 'Failed to load company overview');
      }

      setOverview(overviewRes.data);
      setActivity(activityRes.success && activityRes.data ? activityRes.data.events : []);
      setUsers(usersRes.success && usersRes.data ? usersRes.data.users : []);
      setPricingContext(pricingContextRes.success && pricingContextRes.data ? pricingContextRes.data : null);
      setPricingOverrides(overridesRes.success && overridesRes.data ? overridesRes.data.overrides : []);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to load company details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompanyData();
  }, [companyId]);

  const refreshPricing = async () => {
    if (!companyId) return;
    const [pricingContextRes, overridesRes] = await Promise.all([
      companyAdminService.getCompanyPricingContext(companyId),
      companyAdminService.getCompanyPricingOverrides(companyId),
    ]);

    if (pricingContextRes.success && pricingContextRes.data) {
      setPricingContext(pricingContextRes.data);
    }

    if (overridesRes.success && overridesRes.data) {
      setPricingOverrides(overridesRes.data.overrides);
    }
  };

  const handleCreateOverride = async () => {
    if (!companyId) return;
    if (!overrideSourcePriceBookId) {
      toast.error('Please select a source price book');
      return;
    }

    try {
      setCreateLoading(true);
      const response = await companyAdminService.createPricingOverride(companyId, {
        sourcePriceBookId: overrideSourcePriceBookId,
        name: overrideName || undefined,
        description: overrideDescription || undefined,
        notes: overrideNotes || undefined,
        effectiveFrom: overrideEffectiveFrom || undefined,
        effectiveTo: overrideEffectiveTo || undefined,
        activateImmediately: overrideActivateImmediately,
      });

      if (!response.success) {
        toast.error(response.error || 'Failed to create pricing override');
        return;
      }

      toast.success('Company pricing override created');
      setCreateDialogOpen(false);
      setOverrideSourcePriceBookId('');
      setOverrideName('');
      setOverrideDescription('');
      setOverrideNotes('');
      setOverrideEffectiveFrom('');
      setOverrideEffectiveTo('');
      setOverrideActivateImmediately(true);
      await refreshPricing();
    } finally {
      setCreateLoading(false);
    }
  };

  const handleActivateOverride = async (overrideId: string) => {
    if (!companyId) return;
    const response = await companyAdminService.activatePricingOverride(companyId, overrideId);
    if (!response.success) {
      toast.error(response.error || 'Failed to activate override');
      return;
    }
    toast.success('Pricing override activated');
    await refreshPricing();
  };

  const handleDeactivateOverride = async (overrideId: string) => {
    if (!companyId) return;
    const response = await companyAdminService.deactivatePricingOverride(companyId, overrideId);
    if (!response.success) {
      toast.error(response.error || 'Failed to deactivate override');
      return;
    }
    toast.success('Pricing override deactivated');
    await refreshPricing();
  };

  const activityColumns: Column<CompanyActivityEvent>[] = [
    {
      key: 'occurredAt',
      label: 'Date',
      render: (item) => formatDateTime(item.occurredAt),
    },
    {
      key: 'entityType',
      label: 'Entity',
      render: (item) => <Badge variant="outline">{item.entityType}</Badge>,
    },
    {
      key: 'title',
      label: 'Title',
      render: (item) => <span className="font-medium">{item.title}</span>,
    },
    {
      key: 'description',
      label: 'Description',
      render: (item) => item.description || '—',
    },
  ];

  const userColumns: Column<CompanyUsersResponse['users'][number]>[] = [
    { key: 'name', label: 'Name', render: (item) => item.name || '—' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role', render: (item) => item.role || '—' },
    {
      key: 'status',
      label: 'Status',
      render: (item) => <Badge variant={item.status === 'ACTIVE' ? 'default' : 'secondary'}>{item.status || 'UNKNOWN'}</Badge>,
    },
    {
      key: 'last_login_at',
      label: 'Last Login',
      render: (item) => formatDateTime(item.last_login_at),
    },
  ];

  const overrideColumns: Column<any>[] = [
    {
      key: 'price_book',
      label: 'Price Book',
      render: (item) => item.price_book?.name || item.price_book_id || '—',
    },
    {
      key: 'effective_from',
      label: 'Effective From',
      render: (item) => formatDateTime(item.effective_from),
    },
    {
      key: 'effective_to',
      label: 'Effective To',
      render: (item) => formatDateTime(item.effective_to),
    },
    {
      key: 'is_active',
      label: 'Status',
      render: (item) => (
        <Badge variant={item.is_active ? 'default' : 'secondary'}>
          {item.is_active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (item) => (
        <div className="flex gap-2">
          {isGlobalAdmin && !item.is_active ? (
            <Button size="sm" variant="outline" onClick={() => handleActivateOverride(item.id)}>
              Activate
            </Button>
          ) : null}
          {isGlobalAdmin && item.is_active ? (
            <Button size="sm" variant="outline" onClick={() => handleDeactivateOverride(item.id)}>
              Deactivate
            </Button>
          ) : null}
        </div>
      ),
    },
  ];

  const availablePriceBooks = useMemo(
    () => pricingContext?.pricingContext?.availablePriceBooks || [],
    [pricingContext]
  );

  if (loading) {
    return <div className="p-6">Loading company details...</div>;
  }

  if (!overview) {
    return (
      <div className="p-6 space-y-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/hrm8/companies')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Card>
          <CardContent className="py-8 text-sm text-muted-foreground">
            Company not found or you do not have access.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-2">
          <Button variant="ghost" size="sm" onClick={() => navigate('/hrm8/companies')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Companies
          </Button>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">{overview.company.name}</h1>
            <Badge variant="outline">{overview.company.billing_currency || '—'}</Badge>
            <Badge variant="outline">{overview.company.pricing_peg || '—'}</Badge>
            {overview.company.attribution_locked ? <Badge>Attribution Locked</Badge> : <Badge variant="secondary">Attribution Open</Badge>}
          </div>
          <p className="text-sm text-muted-foreground">
            {overview.company.website || overview.company.domain || 'No website provided'}
          </p>
        </div>

        <Button variant="outline" onClick={loadCompanyData}>
          <RefreshCcw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Open Jobs</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{overview.stats.open_jobs_count}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Jobs</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{overview.stats.total_jobs_count}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Applications</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{overview.stats.applications_count}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Users</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{overview.stats.users_count}</CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Company Profile</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-muted-foreground">Region</div>
                <div>{overview.company.region?.name || 'Not assigned'}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Country</div>
                <div>{overview.company.country_or_region || overview.company.country || 'Not available yet'}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Created</div>
                <div>{formatDateTime(overview.company.created_at)}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Currency Lock</div>
                <div>{formatDateTime(overview.company.currency_locked_at)}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Active Subscription</div>
                <div>{overview.activeSubscription?.name || overview.activeSubscription?.plan_type || 'Not available yet'}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Wallet Balance</div>
                <div>{formatMoney(overview.wallet?.balance, overview.company.billing_currency)}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Commercial Evidence</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-muted-foreground">Lead Confirmed</div>
                <div>{formatDateTime(overview.commercialEvidence?.leadMilestones?.lead_confirmed_at)}</div>
              </div>
              <div>
                <div className="text-muted-foreground">First Job Posted</div>
                <div>{formatDateTime(overview.commercialEvidence?.firstJobEvidence?.posted_at)}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Flow</div>
                <div>{overview.commercialEvidence?.firstJobEvidence?.setup_type || 'Not available yet'}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Service</div>
                <div>{overview.commercialEvidence?.firstJobEvidence?.service_package || overview.commercialEvidence?.firstJobEvidence?.hiring_mode || 'Not available yet'}</div>
              </div>
              <div>
                <div className="text-muted-foreground">First Payment</div>
                <div>{formatMoney(overview.commercialEvidence?.firstPaymentEvidence?.amount, overview.commercialEvidence?.firstPaymentEvidence?.currency)}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Payment Date</div>
                <div>{formatDateTime(overview.commercialEvidence?.firstPaymentEvidence?.paid_at)}</div>
              </div>
              <div className="col-span-2">
                <div className="text-muted-foreground">Commission Readiness</div>
                <div>{overview.commercialEvidence?.commissionReadiness?.reason || 'Not available yet'}</div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Company Activity Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable
                data={activity}
                columns={activityColumns}
                searchable
                searchKeys={['title', 'description', 'entityType', 'type']}
                emptyMessage="No activity yet"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Company Users</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable
                data={users}
                columns={userColumns}
                searchable
                searchKeys={['name', 'email', 'role', 'status']}
                emptyMessage="No users found"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pricing" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5" />
                Pricing Context
              </CardTitle>
              {isGlobalAdmin && (
                <Button onClick={() => setCreateDialogOpen(true)}>
                  Create Company Override
                </Button>
              )}
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-muted-foreground">Billing Currency</div>
                <div>{pricingContext?.company?.billing_currency || 'Not available yet'}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Pricing Peg</div>
                <div>{pricingContext?.company?.pricing_peg || 'Not available yet'}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Assigned Price Book</div>
                <div>{pricingContext?.pricingContext?.assignedPriceBook?.name || 'Not available yet'}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Resolved Price Book</div>
                <div>{pricingContext?.pricingContext?.resolvedPriceBook?.name || pricingContext?.pricingContext?.activeOverride?.price_book?.name || 'Not available yet'}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Currency Locked At</div>
                <div>{formatDateTime(pricingContext?.company?.currency_locked_at)}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Active Override</div>
                <div>{pricingContext?.pricingContext?.activeOverride?.id || 'Not available yet'}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Company Pricing Overrides</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable
                data={pricingOverrides}
                columns={overrideColumns}
                searchable
                searchKeys={['id', 'notes', 'scope']}
                emptyMessage="No pricing overrides"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Company Pricing Override</DialogTitle>
            <DialogDescription>
              Clone an approved price book for this company and activate it when needed.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Source Price Book</Label>
              <Select value={overrideSourcePriceBookId} onValueChange={setOverrideSourcePriceBookId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select source price book" />
                </SelectTrigger>
                <SelectContent>
                  {availablePriceBooks.map((book: any) => (
                    <SelectItem key={book.id} value={book.id}>
                      {book.name} ({book.currency || book.billing_currency || 'NA'})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label>Override Name</Label>
              <Input value={overrideName} onChange={(e) => setOverrideName(e.target.value)} placeholder="Optional" />
            </div>

            <div className="space-y-1">
              <Label>Description</Label>
              <Textarea value={overrideDescription} onChange={(e) => setOverrideDescription(e.target.value)} placeholder="Optional" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Effective From</Label>
                <Input type="datetime-local" value={overrideEffectiveFrom} onChange={(e) => setOverrideEffectiveFrom(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>Effective To</Label>
                <Input type="datetime-local" value={overrideEffectiveTo} onChange={(e) => setOverrideEffectiveTo(e.target.value)} />
              </div>
            </div>

            <div className="space-y-1">
              <Label>Notes</Label>
              <Textarea value={overrideNotes} onChange={(e) => setOverrideNotes(e.target.value)} placeholder="Approval notes / promo context" />
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                checked={overrideActivateImmediately}
                onCheckedChange={(checked) => setOverrideActivateImmediately(Boolean(checked))}
                id="override-activate-immediately"
              />
              <Label htmlFor="override-activate-immediately">Activate immediately</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)} disabled={createLoading}>
              Cancel
            </Button>
            <Button onClick={handleCreateOverride} disabled={createLoading || !overrideSourcePriceBookId}>
              {createLoading ? 'Creating...' : 'Create Override'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
