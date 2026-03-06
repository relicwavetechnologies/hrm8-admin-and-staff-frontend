import { Column } from '@/shared/components/tables/DataTable';
import { ForecastItem } from '@/shared/lib/salesForecastUtils';
import { SalesAgentAvatar } from './SalesAgentAvatar';
import { OpportunityStageBadge } from './OpportunityStageBadge';
import { ForecastConfidenceBadge } from './ForecastConfidenceBadge';
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
import { MoreVertical, Eye, Edit, TrendingUp, Mail } from 'lucide-react';
import { format } from 'date-fns';

function formatCurrency(amount: number): string {
  return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export function createForecastColumns(): Column<ForecastItem>[] {
  return [
    {
      key: 'opportunity',
      label: 'Opportunity',
      sortable: true,
      render: (item) => {
        const [firstName = 'Unknown', lastName = ''] = item.employerName.split(' ');
        return (
          <div className="flex items-center gap-3">
            <SalesAgentAvatar firstName={firstName} lastName={lastName} />
            <div>
              <Link 
                to={`/sales/opportunities/${item.id}`}
                className="font-semibold text-base hover:underline cursor-pointer line-clamp-1 block"
              >
                {item.name}
              </Link>
              <Link
                to={`/employers/${item.employerId}`}
                className="text-sm text-muted-foreground hover:text-foreground hover:underline line-clamp-1 block transition-colors"
              >
                {item.employerName}
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
      render: (item) => {
        const [firstName = 'Unknown', lastName = ''] = item.salesAgentName.split(' ');
        return (
          <Link to={`/sales/team/${item.salesAgentId}`} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <SalesAgentAvatar firstName={firstName} lastName={lastName} className="h-8 w-8" />
            <span className="hover:underline">{item.salesAgentName}</span>
          </Link>
        );
      },
    },
    {
      key: 'stage',
      label: 'Stage',
      width: '160px',
      sortable: true,
      render: (item) => <OpportunityStageBadge stage={item.stage} />,
    },
    {
      key: 'dealValue',
      label: 'Deal Value',
      width: '140px',
      sortable: true,
      render: (item) => (
        <span className="font-medium">{formatCurrency(item.estimatedValue)}</span>
      ),
    },
    {
      key: 'weightedValue',
      label: 'Weighted Value',
      width: '160px',
      sortable: true,
      render: (item) => (
        <span className="font-semibold text-primary">
          {formatCurrency(item.weightedValue)}
        </span>
      ),
    },
    {
      key: 'probability',
      label: 'Probability',
      width: '160px',
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-2">
          <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary"
              style={{ width: `${item.probability}%` }}
            />
          </div>
          <span className="text-sm text-muted-foreground">{item.probability}%</span>
        </div>
      ),
    },
    {
      key: 'expectedClose',
      label: 'Expected Close',
      width: '140px',
      sortable: true,
      render: (item) => {
        try {
          const date = new Date(item.expectedCloseDate);
          if (isNaN(date.getTime())) {
            return <div className="text-sm text-muted-foreground">Invalid date</div>;
          }
          return (
            <div>
              <div className="text-sm">{format(date, 'MMM d, yyyy')}</div>
              <div className="text-xs text-muted-foreground">{item.quarter}</div>
            </div>
          );
        } catch {
          return <div className="text-sm text-muted-foreground">Invalid date</div>;
        }
      },
    },
    {
      key: 'confidence',
      label: 'Confidence',
      width: '140px',
      sortable: true,
      render: (item) => <ForecastConfidenceBadge level={item.confidenceLevel} />,
    },
    {
      key: 'actions',
      label: 'Actions',
      width: '80px',
      render: (item) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to={`/sales/opportunities/${item.id}`}>
                <Eye className="mr-2 h-4 w-4" />
                View Opportunity
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => console.log('Adjust forecast', item.id)}>
              <Edit className="mr-2 h-4 w-4" />
              Adjust Forecast
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => console.log('View analytics', item.id)}>
              <TrendingUp className="mr-2 h-4 w-4" />
              View Analytics
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => console.log('Send report', item.id)}>
              <Mail className="mr-2 h-4 w-4" />
              Send Report
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];
}
