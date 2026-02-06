import { DataTable } from '@/shared/components/tables/DataTable';
import { Column } from '@/shared/components/tables/DataTable';
import { Badge } from '@/shared/components/ui/badge';
import { formatCurrency } from '@/shared/lib/utils';
import { format } from 'date-fns';

interface CompanyRevenueData {
    id: string;
    name: string;
    region_id: string;
    job_revenue: number;
    subscription_revenue: number;
    total_revenue: number;
    licensee_share: number;
    hrm8_share: number;
    active_jobs: number;
    last_payment_at?: string;
}

interface CompanyRevenueTableProps {
    data: CompanyRevenueData[];
    loading: boolean;
}

const columns: Column<CompanyRevenueData>[] = [
    {
        key: 'name',
        label: 'Company Name',
        sortable: true,
        render: (row) => <span className="font-medium">{row.name}</span>,
    },
    {
        key: 'region_id',
        label: 'Region',
        render: (row) => row.region_id ? <Badge variant="outline">{row.region_id.substring(0, 8)}...</Badge> : <span className="text-muted-foreground">-</span>,
    },
    {
        key: 'total_revenue',
        label: 'Total Revenue',
        sortable: true,
        render: (row) => <span className="font-bold text-green-600">{formatCurrency(row.total_revenue)}</span>,
    },
    {
        key: 'job_revenue',
        label: 'Job Rev.',
        render: (row) => <span className="text-muted-foreground">{formatCurrency(row.job_revenue)}</span>,
    },
    {
        key: 'subscription_revenue',
        label: 'Sub Rev.',
        render: (row) => <span className="text-muted-foreground">{formatCurrency(row.subscription_revenue)}</span>,
    },
    {
        key: 'hrm8_share',
        label: 'HRM8 Share',
        render: (row) => <span className="text-blue-600 font-medium">{formatCurrency(row.hrm8_share)}</span>,
    },
    {
        key: 'licensee_share',
        label: 'Licensee Share',
        render: (row) => <span className="text-purple-600 font-medium">{formatCurrency(row.licensee_share)}</span>,
    },
    {
        key: 'active_jobs',
        label: 'Active Jobs',
        sortable: true,
        render: (row) => (
            <Badge variant={row.active_jobs > 0 ? 'default' : 'secondary'}>
                {row.active_jobs} Jobs
            </Badge>
        ),
    },
    {
        key: 'last_payment_at',
        label: 'Last Payment',
        sortable: true,
        render: (row) => row.last_payment_at ? format(new Date(row.last_payment_at), 'MMM d, yyyy') : <span className="text-muted-foreground text-xs">Never</span>,
    },
];

export function CompanyRevenueTable({ data, loading }: CompanyRevenueTableProps) {
    return (
        <DataTable
            data={data}
            columns={columns}
            loading={loading}
            searchable
            searchKeys={['name', 'region_id']}
            emptyMessage="No companies found with revenue activity"
        />
    );
}
