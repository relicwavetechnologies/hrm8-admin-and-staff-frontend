import { Column } from '@/shared/components/tables/DataTable';
import { SalesOpportunity } from '@/shared/types/salesOpportunity';
import { SalesAgentAvatar } from './SalesAgentAvatar';
import { OpportunityStageBadge } from './OpportunityStageBadge';
import { MoreVertical, Eye, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Link } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';

function formatCurrency(amount: number): string {
  return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export function createTopDealsColumns(): Column<SalesOpportunity>[] {
  return [
    {
      key: 'deal',
      label: 'Deal',
      sortable: true,
      render: (opp) => {
        const [firstName = 'Unknown', lastName = ''] = opp.employerName.split(' ');
        return (
          <div className="flex items-center gap-3">
            <SalesAgentAvatar firstName={firstName} lastName={lastName} />
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
        );
      },
    },
    {
      key: 'salesAgent',
      label: 'Sales Agent',
      width: '180px',
      sortable: true,
      render: (opp) => {
        const [firstName = 'Unknown', lastName = ''] = opp.salesAgentName.split(' ');
        return (
          <Link to={`/sales/team/${opp.salesAgentId}`} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <SalesAgentAvatar firstName={firstName} lastName={lastName} className="h-8 w-8" />
            <span className="text-sm hover:underline">{opp.salesAgentName}</span>
          </Link>
        );
      },
    },
    {
      key: 'value',
      label: 'Value',
      width: '140px',
      sortable: true,
      render: (opp) => (
        <span className="font-semibold">{formatCurrency(opp.estimatedValue)}</span>
      ),
    },
    {
      key: 'stage',
      label: 'Stage',
      width: '160px',
      sortable: true,
      render: (opp) => <OpportunityStageBadge stage={opp.stage} />,
    },
    {
      key: 'progress',
      label: 'Progress',
      width: '180px',
      render: (opp) => (
        <div className="flex items-center gap-2">
          <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary"
              style={{ width: `${opp.probability}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground">{opp.probability}%</span>
        </div>
      ),
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
