import { Column } from '@/shared/components/tables/DataTable';
import type { SalesTerritory } from '@/shared/types/salesTerritory';
import { TerritoryRegionBadge } from './TerritoryRegionBadge';
import { Badge } from '@/shared/components/ui/badge';
import { MapPin, MoreVertical, Eye, Edit, Users, Trash2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Link } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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

export function createTerritoryColumns(): Column<SalesTerritory>[] {
  return [
    {
      key: 'name',
      label: 'Territory',
      sortable: true,
      render: (territory) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
            <MapPin className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <Link 
              to={`/sales/territories/${territory.id}`}
              className="font-semibold text-base hover:underline cursor-pointer line-clamp-1 block"
            >
              {territory.name}
            </Link>
            <div className="text-sm text-muted-foreground">
              <TerritoryRegionBadge region={territory.region} />
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'primarySalesAgentName',
      label: 'Primary Agent',
      width: '160px',
      sortable: true,
      render: (territory) => territory.primarySalesAgentId ? (
        <Link
          to={`/sales/team/${territory.primarySalesAgentId}`}
          className="text-sm hover:text-foreground hover:underline transition-colors"
        >
          {territory.primarySalesAgentName}
        </Link>
      ) : (
        <span className="text-sm text-muted-foreground">Unassigned</span>
      ),
    },
    {
      key: 'activeEmployers',
      label: 'Active Employers',
      width: '120px',
      sortable: true,
      render: (territory) => <span className="text-sm font-medium">{territory.activeEmployers}</span>,
    },
    {
      key: 'totalEmployers',
      label: 'Total Employers',
      width: '120px',
      sortable: true,
      render: (territory) => <span className="text-sm">{territory.totalEmployers}</span>,
    },
    {
      key: 'annualRevenue',
      label: 'Revenue',
      width: '140px',
      sortable: true,
      render: (territory) => (
        <span className="font-medium">{formatRevenue(territory.annualRevenue)}</span>
      ),
    },
    {
      key: 'quota',
      label: 'Quota Attainment',
      width: '140px',
      sortable: true,
      render: (territory) => {
        const attainment = (territory.annualRevenue / territory.quota * 100);
        const color = attainment >= 100 ? 'text-green-600' : attainment >= 75 ? 'text-yellow-600' : 'text-red-600';
        return (
          <span className={`text-sm font-medium ${color}`}>
            {attainment.toFixed(0)}%
          </span>
        );
      },
    },
    {
      key: 'isActive',
      label: 'Status',
      width: '120px',
      sortable: true,
      render: (territory) => (
        <Badge variant={territory.isActive ? 'success' : 'neutral'}>
          {territory.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      width: '80px',
      render: (territory) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link to={`/sales/territories/${territory.id}`}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => console.log('Edit territory', territory.id)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Territory
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => console.log('Assign agents', territory.id)}>
              <Users className="h-4 w-4 mr-2" />
              Assign Agents
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onClick={() => console.log('Delete territory', territory.id)}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];
}
