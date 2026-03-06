import { Column } from '@/shared/components/tables/DataTable';
import type { SalesActivity } from '@/shared/types/salesActivity';
import { ActivityTypeBadge } from './ActivityTypeBadge';
import { ActivityOutcomeBadge } from './ActivityOutcomeBadge';
import { Phone, Mail, Users, Presentation, MoreVertical, Eye, Edit, CheckCircle, Trash2 } from 'lucide-react';
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

const activityIcons = {
  call: Phone,
  email: Mail,
  meeting: Users,
  demo: Presentation,
  'follow-up': Mail,
  proposal: Presentation,
  other: Users,
};

export function createActivityColumns(): Column<SalesActivity>[] {
  return [
    {
      key: 'subject',
      label: 'Activity',
      sortable: true,
      render: (activity) => {
        const Icon = activityIcons[activity.activityType as keyof typeof activityIcons] || Users;
        return (
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
              <Icon className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <Link 
                to={`/sales/activities/${activity.id}`}
                className="font-semibold text-base hover:underline cursor-pointer line-clamp-1 block"
              >
                {activity.subject}
              </Link>
              <Link
                to={`/sales/team/${activity.salesAgentId}`}
                className="text-sm text-muted-foreground hover:text-foreground hover:underline line-clamp-1 block transition-colors"
              >
                {activity.salesAgentName}
              </Link>
            </div>
          </div>
        );
      },
    },
    {
      key: 'employerName',
      label: 'Employer',
      width: '160px',
      sortable: true,
      render: (activity) => activity.employerId ? (
        <Link
          to={`/employers/${activity.employerId}`}
          className="text-sm hover:text-foreground hover:underline transition-colors"
        >
          {activity.employerName}
        </Link>
      ) : (
        <span className="text-sm text-muted-foreground">-</span>
      ),
    },
    {
      key: 'activityType',
      label: 'Type',
      width: '140px',
      sortable: true,
      render: (activity) => <ActivityTypeBadge type={activity.activityType as any} />,
    },
    {
      key: 'outcome',
      label: 'Outcome',
      width: '140px',
      sortable: true,
      render: (activity) => <ActivityOutcomeBadge outcome={activity.outcome as any} />,
    },
    {
      key: 'scheduledAt',
      label: 'Date',
      width: '140px',
      sortable: true,
      render: (activity) => (
        <span className="text-sm">
          {activity.scheduledAt 
            ? format(new Date(activity.scheduledAt), 'MMM d, yyyy')
            : '-'
          }
        </span>
      ),
    },
    {
      key: 'duration',
      label: 'Duration',
      width: '120px',
      sortable: true,
      render: (activity) => (
        <span className="text-sm">{activity.duration ? `${activity.duration} min` : '-'}</span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      width: '80px',
      render: (activity) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link to={`/sales/activities/${activity.id}`}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => console.log('Edit activity', activity.id)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Activity
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => console.log('Mark complete', activity.id)}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Mark Complete
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onClick={() => console.log('Delete activity', activity.id)}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];
}
