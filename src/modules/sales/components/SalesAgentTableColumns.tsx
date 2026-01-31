import { Column } from '@/shared/components/tables/DataTable';
import type { SalesAgent } from '@/shared/types/salesAgent';
import { SalesAgentAvatar } from './SalesAgentAvatar';
import { SalesAgentStatusBadge } from './SalesAgentStatusBadge';
import { Badge } from '@/shared/components/ui/badge';
import { MoreVertical, Eye, Mail, Edit } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Link } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';

const formatRevenue = (amount: number): string => {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(0)}K`;
  }
  return `$${amount.toFixed(0)}`;
};

export function createSalesAgentColumns(): Column<SalesAgent>[] {
  return [
    {
      key: 'name',
      label: 'Sales Agent',
      sortable: true,
      render: (agent) => (
        <div className="flex items-center gap-3">
          <SalesAgentAvatar
            firstName={agent.firstName}
            lastName={agent.lastName}
            photo={agent.photo}
            className="h-10 w-10"
          />
          <div>
            <Link 
              to={`/sales/team/${agent.id}`}
              className="font-semibold text-base hover:underline cursor-pointer line-clamp-1 block"
            >
              {agent.firstName} {agent.lastName}
            </Link>
            <div className="text-sm text-muted-foreground">{agent.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'salesRole',
      label: 'Role',
      width: '160px',
      sortable: true,
      render: (agent) => {
        const roleLabels = {
          'sales-rep': 'Sales Rep',
          'account-manager': 'Account Manager',
          'sales-manager': 'Sales Manager',
          'sales-director': 'Sales Director',
        };
        return <span className="text-sm">{roleLabels[agent.salesRole]}</span>;
      },
    },
    {
      key: 'salesType',
      label: 'Type',
      width: '160px',
      sortable: true,
      render: (agent) => {
        const typeLabels = {
          'inside-sales': 'Inside Sales',
          'outside-sales': 'Outside Sales',
          'enterprise-sales': 'Enterprise Sales',
          'smb-sales': 'SMB Sales',
        };
        return <Badge variant="outline">{typeLabels[agent.salesType]}</Badge>;
      },
    },
    {
      key: 'status',
      label: 'Status',
      width: '120px',
      sortable: true,
      render: (agent) => <SalesAgentStatusBadge status={agent.status} />,
    },
    {
      key: 'currentRevenue',
      label: 'Revenue',
      width: '140px',
      sortable: true,
      render: (agent) => (
        <span className="font-medium">{formatRevenue(agent.currentRevenue)}</span>
      ),
    },
    {
      key: 'closedDeals',
      label: 'Closed Deals',
      width: '120px',
      sortable: true,
      render: (agent) => <span className="text-sm">{agent.closedDeals}</span>,
    },
    {
      key: 'conversionRate',
      label: 'Win Rate',
      width: '120px',
      sortable: true,
      render: (agent) => (
        <span className="text-sm font-medium">{agent.conversionRate.toFixed(1)}%</span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      width: '80px',
      render: (agent) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link to={`/sales/team/${agent.id}`}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => console.log('Edit agent', agent.id)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Agent
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => console.log('Send email', agent.email)}>
              <Mail className="h-4 w-4 mr-2" />
              Send Email
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];
}
