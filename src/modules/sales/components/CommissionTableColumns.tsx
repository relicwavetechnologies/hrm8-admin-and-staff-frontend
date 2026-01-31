import { Column } from '@/shared/components/tables/DataTable';
import { SalesCommission } from '@/shared/types/salesCommission';
import { SalesAgentAvatar } from './SalesAgentAvatar';
import { CommissionStatusBadge } from './CommissionStatusBadge';
import { Link } from 'react-router-dom';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { Button } from '@/shared/components/ui/button';
import { MoreVertical, Eye, Edit, CheckCircle, Trash2, Download } from 'lucide-react';
import { format } from 'date-fns';

function formatCurrency(amount: number): string {
  return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export function createCommissionColumns(): Column<SalesCommission>[] {
  return [
    {
      key: 'deal',
      label: 'Deal',
      sortable: true,
      render: (commission) => {
        const [firstName = 'Unknown', lastName = ''] = commission.employerName.split(' ');
        return (
          <div className="flex items-center gap-3">
            <SalesAgentAvatar firstName={firstName} lastName={lastName} />
            <div>
              <Link 
                to={`/sales/opportunities/${commission.opportunityId}`}
                className="font-semibold text-base hover:underline cursor-pointer line-clamp-1 block"
              >
                {commission.opportunityName}
              </Link>
              <Link
                to={`/employers/${commission.employerId}`}
                className="text-sm text-muted-foreground hover:text-foreground hover:underline line-clamp-1 block transition-colors"
              >
                {commission.employerName}
              </Link>
            </div>
          </div>
        );
      },
    },
    {
      key: 'salesAgent',
      label: 'Sales Agent',
      width: '180px',
      sortable: true,
      render: (commission) => {
        const [firstName = 'Unknown', lastName = ''] = commission.salesAgentName.split(' ');
        return (
          <Link to={`/sales/team/${commission.salesAgentId}`} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <SalesAgentAvatar firstName={firstName} lastName={lastName} className="h-8 w-8" />
            <span className="hover:underline">{commission.salesAgentName}</span>
          </Link>
        );
      },
    },
    {
      key: 'dealValue',
      label: 'Deal Value',
      width: '140px',
      sortable: true,
      render: (commission) => (
        <span className="font-medium">{formatCurrency(commission.dealValue)}</span>
      ),
    },
    {
      key: 'commissionRate',
      label: 'Rate',
      width: '100px',
      sortable: true,
      render: (commission) => (
        <span className="text-muted-foreground">{commission.commissionRate}%</span>
      ),
    },
    {
      key: 'commissionAmount',
      label: 'Commission',
      width: '140px',
      sortable: true,
      render: (commission) => (
        <span className="font-semibold text-green-600">
          {formatCurrency(commission.commissionAmount)}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      width: '140px',
      sortable: true,
      render: (commission) => <CommissionStatusBadge status={commission.status} />,
    },
    {
      key: 'paymentDate',
      label: 'Payment Date',
      width: '140px',
      sortable: true,
      render: (commission) => (
        <span className="text-sm">
          {commission.paidAt 
            ? format(new Date(commission.paidAt), 'MMM d, yyyy')
            : commission.approvedAt
            ? 'Approved'
            : 'Pending'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      width: '80px',
      render: (commission) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => console.log('View commission', commission.id)}>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => console.log('Edit commission', commission.id)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Commission
            </DropdownMenuItem>
            {commission.status === 'pending' && (
              <DropdownMenuItem onClick={() => console.log('Approve commission', commission.id)}>
                <CheckCircle className="mr-2 h-4 w-4" />
                Approve
              </DropdownMenuItem>
            )}
            {commission.status === 'approved' && (
              <DropdownMenuItem onClick={() => console.log('Mark as paid', commission.id)}>
                <CheckCircle className="mr-2 h-4 w-4" />
                Mark as Paid
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => console.log('Download receipt', commission.id)}>
              <Download className="mr-2 h-4 w-4" />
              Download Receipt
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onClick={() => console.log('Delete commission', commission.id)}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];
}
