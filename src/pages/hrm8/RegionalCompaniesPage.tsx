import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { DashboardStatCard } from '@/shared/components/dashboard/DashboardStatCard';
import { DataTable, type Column } from '@/shared/components/tables/DataTable';
import { Building2, CheckCircle2, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/shared/components/ui/badge';
import { useRegionStore } from '@/shared/stores/useRegionStore';
import {
  companyAdminService,
  type CompanyListItem,
  type CompanyStatusFilter,
} from '@/shared/services/hrm8/companyAdminService';

function normalizeStatus(value: string | null): CompanyStatusFilter | undefined {
  if (!value) return undefined;
  const lowered = value.toLowerCase();
  if (lowered === 'active') return 'ACTIVE';
  if (lowered === 'inactive') return 'INACTIVE';
  if (lowered === 'new') return 'NEW';
  return undefined;
}

export default function RegionalCompaniesPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { selectedRegionId } = useRegionStore();
  const effectiveRegionFilter = selectedRegionId === 'all' || !selectedRegionId ? undefined : selectedRegionId;
  const [isLoading, setIsLoading] = useState(true);
  const [companies, setCompanies] = useState<CompanyListItem[]>([]);

  const statusFilter = normalizeStatus(searchParams.get('status'));
  const sortParam = searchParams.get('sort');

  useEffect(() => {
    fetchCompanies();
  }, [statusFilter]);

  const fetchCompanies = async () => {
    try {
      setIsLoading(true);
      const response = await companyAdminService.getCompanies({
        status: statusFilter,
        page: 1,
        limit: 200,
      });

      if (!response.success || !response.data) {
        toast.error(response.error || 'Failed to load companies');
        return;
      }

      setCompanies(response.data.companies || []);
    } catch {
      toast.error('Failed to load companies');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCompanies = useMemo(() => {
    const result = [...companies].filter((company) =>
      effectiveRegionFilter ? company.region_id === effectiveRegionFilter : true
    );

    if (sortParam === 'newest') {
      result.sort((a, b) => {
        const da = a.created_at ? new Date(a.created_at).getTime() : 0;
        const db = b.created_at ? new Date(b.created_at).getTime() : 0;
        return db - da;
      });
    }

    return result;
  }, [companies, sortParam, effectiveRegionFilter]);

  const totalCompanies = companies.length;
  const activeSubscriptions = companies.filter((c) => c.subscription !== null).length;
  const lockedAttributions = companies.filter((c) => c.attribution_status === 'LOCKED').length;

  const columns: Column<CompanyListItem>[] = [
    {
      key: 'name',
      label: 'Company Name',
      sortable: true,
      render: (company) => <span className="font-medium">{company.name}</span>,
    },
    {
      key: 'domain',
      label: 'Website/Domain',
      sortable: true,
      render: (company) => {
        const url = company.website || (company.domain ? `https://${company.domain}` : null);
        const label = company.website || company.domain;
        if (!url || !label) return <span className="text-muted-foreground">—</span>;
        return (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {label}
          </a>
        );
      },
    },
    {
      key: 'region',
      label: 'Region',
      sortable: true,
      render: (company) => <span>{company.region?.name || 'Not assigned'}</span>,
    },
    {
      key: 'billing_currency',
      label: 'Currency',
      sortable: true,
      render: (company) => company.billing_currency || '—',
    },
    {
      key: 'attribution_status',
      label: 'Attribution',
      sortable: true,
      render: (company) => (
        <Badge variant={company.attribution_status === 'LOCKED' ? 'default' : 'secondary'}>
          {company.attribution_status}
        </Badge>
      ),
    },
    {
      key: 'subscription',
      label: 'Subscription',
      render: (company) => {
        if (!company.subscription) {
          return <Badge variant="outline">No Subscription</Badge>;
        }
        return <Badge>{company.subscription.plan_type || company.subscription.name}</Badge>;
      },
    },
    {
      key: 'open_jobs_count',
      label: 'Open Jobs',
      sortable: true,
      render: (company) => (
        <Badge variant={company.open_jobs_count > 0 ? 'secondary' : 'outline'}>
          {company.open_jobs_count} Jobs
        </Badge>
      ),
    },
    {
      key: 'created_at',
      label: 'Created Date',
      sortable: true,
      render: (company) => {
        const d = company.created_at ? new Date(company.created_at) : null;
        return d && !Number.isNaN(d.getTime()) ? d.toLocaleDateString() : '—';
      },
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Companies</h1>
        <p className="text-muted-foreground">Customer list with subscriptions, activity and pricing context access.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <DashboardStatCard
          title="Total Companies"
          value={String(totalCompanies)}
          description={`${lockedAttributions} attribution locked`}
          trend="up"
          icon={<Building2 className="h-5 w-5" />}
          variant="neutral"
        />

        <DashboardStatCard
          title="Active Subscriptions"
          value={String(activeSubscriptions)}
          description={`${totalCompanies - activeSubscriptions} inactive`}
          trend={activeSubscriptions > 0 ? 'up' : undefined}
          icon={<CheckCircle2 className="h-5 w-5" />}
          variant="success"
        />

        <DashboardStatCard
          title="Attributed"
          value={String(lockedAttributions)}
          description="Locked attributions"
          trend="up"
          icon={<DollarSign className="h-5 w-5" />}
          variant="primary"
        />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Companies List</h3>
          {isLoading ? (
            <div className="text-center py-8">Loading companies...</div>
          ) : (
            <DataTable
              columns={columns}
              data={filteredCompanies}
              searchable
              searchKeys={['name', 'website', 'domain', 'billing_currency']}
              emptyMessage="No companies found"
              onRowClick={(company) => navigate(`/hrm8/companies/${company.id}`)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
