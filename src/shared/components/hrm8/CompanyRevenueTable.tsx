import { DataTable } from '@/shared/components/tables/DataTable';
import { Column } from '@/shared/components/tables/DataTable';
import { Badge } from '@/shared/components/ui/badge';
import { formatCurrency } from '@/shared/lib/utils';
import { format } from 'date-fns';

interface CompanyRevenueData {
    id: string;
    name: string;
    regionId: string;
    jobRevenue: number;
    subscriptionRevenue: number;
    totalRevenue: number;
    licenseeShare: number;
    hrm8Share: number;
    activeJobs: number;
    lastPaymentAt?: string;
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
        key: 'regionId',
        label: 'Region',
        render: (row) => row.regionId ? <Badge variant="outline">{row.regionId.substring(0, 8)}...</Badge> : <span className="text-muted-foreground">-</span>,
    },
    {
        key: 'totalRevenue',
        label: 'Total Revenue',
        sortable: true,
        render: (row) => <span className="font-bold text-green-600">{formatCurrency(row.totalRevenue)}</span>,
    },
    {
        key: 'jobRevenue',
        label: 'Job Rev.',
        render: (row) => <span className="text-muted-foreground">{formatCurrency(row.jobRevenue)}</span>,
    },
    {
        key: 'subscriptionRevenue',
        label: 'Sub Rev.',
        render: (row) => <span className="text-muted-foreground">{formatCurrency(row.subscriptionRevenue)}</span>,
    },
    {
        key: 'hrm8Share',
        label: 'HRM8 Share',
        render: (row) => <span className="text-blue-600 font-medium">{formatCurrency(row.hrm8Share)}</span>,
    },
    {
        key: 'licenseeShare',
        label: 'Licensee Share',
        render: (row) => <span className="text-purple-600 font-medium">{formatCurrency(row.licenseeShare)}</span>,
    },
    {
        key: 'activeJobs',
        label: 'Active Jobs',
        sortable: true,
        render: (row) => (
            <Badge variant={row.activeJobs > 0 ? 'default' : 'secondary'}>
                {row.activeJobs} Jobs
            </Badge>
        ),
    },
    {
        key: 'lastPaymentAt',
        label: 'Last Payment',
        sortable: true,
        render: (row) => row.lastPaymentAt ? format(new Date(row.lastPaymentAt), 'MMM d, yyyy') : <span className="text-muted-foreground text-xs">Never</span>,
    },
];

export function CompanyRevenueTable({ data, loading }: CompanyRevenueTableProps) {
    return (
        <DataTable
            data={data}
            columns={columns}
            loading={loading}
            searchable
            searchKeys={['name', 'regionId']}
            emptyMessage="No companies found with revenue activity"
        />
    );
}
