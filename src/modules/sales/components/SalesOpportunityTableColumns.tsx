import { Column } from '@/shared/components/tables/DataTable';
import type { SalesOpportunity } from '@/shared/types/salesOpportunity';
import { OpportunityStageBadge } from './OpportunityStageBadge';
import { OpportunityTypeBadge } from './OpportunityTypeBadge';
import { Building2, MoreVertical, Eye, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Link } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { format } from 'date-fns';

const formatRevenue = (amount: number): string => {
  return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};

export function createOpportunityColumns(): Column<SalesOpportunity>[] {
  return [
    {
      key: 'name',
      label: 'Opportunity',
      sortable: true,
      render: (opp) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
            <Building2 className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <Link 
              to={`/sales/opportunities/${opp.id}`}
              className="font-semibold text-base hover:underline cursor-pointer line-clamp-1 block"
            >
              {opp.name}
            </Link>
            <Link
              to={`/employers/${opp.employerId}`}
              className="text-sm text-muted-foreground hover:text-foreground hover:underline line-clamp-1 block transition-colors"
            >
              {opp.employerName}
            </Link>
          </div>
        </div>
      ),
    },
    {
      key: 'salesAgentName',
      label: 'Sales Agent',
      width: '160px',
      sortable: true,
      render: (opp) => (
        <Link
          to={`/sales/team/${opp.salesAgentId}`}
          className="text-sm hover:text-foreground hover:underline transition-colors"
        >
          {opp.salesAgentName}
        </Link>
      ),
    },
    {
      key: 'type',
      label: 'Type',
      width: '140px',
      sortable: true,
      render: (opp) => <OpportunityTypeBadge type={opp.type} />,
    },
    {
      key: 'stage',
      label: 'Stage',
      width: '160px',
      sortable: true,
      render: (opp) => <OpportunityStageBadge stage={opp.stage} />,
    },
    {
      key: 'estimatedValue',
      label: 'Value',
      width: '140px',
      sortable: true,
      render: (opp) => (
        <span className="font-medium">{formatRevenue(opp.estimatedValue)}</span>
      ),
    },
    {
      key: 'probability',
      label: 'Probability',
      width: '120px',
      sortable: true,
      render: (opp) => (
        <span className="text-sm">{opp.probability}%</span>
      ),
    },
    {
      key: 'expectedCloseDate',
      label: 'Expected Close',
      width: '140px',
      sortable: true,
      render: (opp) => {
        try {
          const date = new Date(opp.expectedCloseDate);
          if (isNaN(date.getTime())) {
            return <span className="text-sm text-muted-foreground">Invalid date</span>;
          }
          return <span className="text-sm">{format(date, 'MMM d, yyyy')}</span>;
        } catch {
          return <span className="text-sm text-muted-foreground">Invalid date</span>;
        }
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      width: '80px',
      render: (opp) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link to={`/sales/opportunities/${opp.id}`}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => console.log('Edit opportunity', opp.id)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Opportunity
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onClick={() => console.log('Delete opportunity', opp.id)}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];
}
