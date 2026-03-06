import { Column } from '@/shared/components/tables/DataTable';
import { Link } from 'react-router-dom';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { MoreVertical, Eye, FileText, Mail, Download, X } from 'lucide-react';
import { EntityAvatar } from '@/shared/components/tables/EntityAvatar';
import { Progress } from '@/shared/components/ui/progress';
import { getCheckTypeIcon, getCheckProgress } from '@/shared/lib/backgroundChecks/checkTypeHelpers';
import type { BackgroundCheck } from '@/types/backgroundCheck';
import { formatDistanceToNow } from 'date-fns';

const getStatusBadge = (status: BackgroundCheck['status']) => {
  const variants: Record<BackgroundCheck['status'], any> = {
    'not-started': 'outline',
    'pending-consent': 'secondary',
    'in-progress': 'default',
    'completed': 'default',
    'issues-found': 'destructive',
    'cancelled': 'outline',
  };

  const colors: Record<BackgroundCheck['status'], string> = {
    'not-started': '',
    'pending-consent': 'bg-yellow-500 text-yellow-50',
    'in-progress': 'bg-blue-500 text-blue-50',
    'completed': 'bg-green-600 text-green-50',
    'issues-found': '',
    'cancelled': '',
  };

  return (
    <Badge variant={variants[status]} className={colors[status]}>
      {status.replace(/-/g, ' ')}
    </Badge>
  );
};

const getOverallResultBadge = (result?: string) => {
  if (!result) {
    return <Badge variant="outline">Pending</Badge>;
  }

  const variants: Record<string, any> = {
    clear: 'default',
    conditional: 'secondary',
    'not-clear': 'destructive',
  };

  const colors: Record<string, string> = {
    clear: 'bg-green-600 text-green-50',
    conditional: 'bg-yellow-500 text-yellow-50',
    'not-clear': 'bg-red-600 text-red-50',
  };

  return (
    <Badge variant={variants[result]} className={colors[result]}>
      {result === 'clear' ? 'Clear' : result === 'conditional' ? 'Conditional' : 'Not Clear'}
    </Badge>
  );
};

export const createBackgroundCheckTableColumns = (
  onViewDetails: (id: string) => void,
  onViewConsent?: (id: string) => void,
  onViewReferees?: (id: string) => void,
  onDownloadReport?: (id: string) => void,
  onSendReminder?: (id: string) => void,
  onCancelCheck?: (id: string) => void
): Column<BackgroundCheck>[] => [
  {
    key: 'candidateName',
    label: 'Candidate',
    sortable: true,
    render: (check) => (
      <div className="flex items-center gap-4">
        <EntityAvatar
          name={check.employerName || 'Unknown'}
          src={check.employerLogo}
          type="logo"
        />
        <div className="min-w-0 flex-1">
          <Link to={`/candidates/${check.candidateId}`}>
            <p className="font-semibold text-base cursor-pointer line-clamp-1 block leading-5">
              {check.candidateName}
            </p>
          </Link>
          {check.jobTitle && (
            <Link to={`/jobs/${check.jobId}`}>
              <p className="text-sm text-muted-foreground line-clamp-1 block leading-5">
                {check.jobTitle}
              </p>
            </Link>
          )}
          {check.employerName && (
            <Link to={`/employers/${check.employerId}`}>
              <p className="text-xs text-muted-foreground line-clamp-1 block leading-5">
                {check.employerName}
              </p>
            </Link>
          )}
        </div>
      </div>
    )
  },
  {
    key: 'checkTypes',
    label: 'Check Types',
    sortable: false,
    render: (check) => (
      <div className="flex flex-wrap gap-1.5">
        {check.checkTypes.map((checkType) => {
          const Icon = getCheckTypeIcon(checkType.type);
          const result = check.results.find(r => r.checkType === checkType.type);
          const isComplete = result?.status === 'clear' || result?.status === 'review-required' || result?.status === 'not-clear';
          
          return (
            <Badge
              key={checkType.type}
              variant={isComplete ? 'default' : 'outline'}
              className={`gap-1 ${isComplete ? 'bg-green-600 text-green-50' : ''}`}
            >
              <Icon className="h-3 w-3" />
              {checkType.type}
            </Badge>
          );
        })}
      </div>
    )
  },
  {
    key: 'status',
    label: 'Status',
    sortable: true,
    render: (check) => getStatusBadge(check.status)
  },
  {
    key: 'progress',
    label: 'Progress',
    sortable: true,
    render: (check) => {
      const progress = getCheckProgress(check);
      return (
        <div className="space-y-1 min-w-[100px]">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground">{progress}% complete</p>
        </div>
      );
    }
  },
  {
    key: 'overallStatus',
    label: 'Result',
    sortable: true,
    render: (check) => getOverallResultBadge(check.overallStatus)
  },
  {
    key: 'initiatedDate',
    label: 'Initiated',
    sortable: true,
    render: (check) => (
      <span className="text-sm text-muted-foreground">
        {formatDistanceToNow(new Date(check.initiatedDate), { addSuffix: true })}
      </span>
    )
  },
  {
    key: 'actions',
    label: 'Actions',
    width: "80px",
    render: (check) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onViewDetails(check.id)}>
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </DropdownMenuItem>
          {onViewConsent && check.consentGiven && (
            <DropdownMenuItem onClick={() => onViewConsent(check.id)}>
              <FileText className="h-4 w-4 mr-2" />
              View Consent
            </DropdownMenuItem>
          )}
          {onViewReferees && check.checkTypes.some(ct => ct.type === 'reference') && (
            <DropdownMenuItem onClick={() => onViewReferees(check.id)}>
              <Mail className="h-4 w-4 mr-2" />
              View Referees
            </DropdownMenuItem>
          )}
          {onDownloadReport && check.status === 'completed' && (
            <DropdownMenuItem onClick={() => onDownloadReport(check.id)}>
              <Download className="h-4 w-4 mr-2" />
              Download Report
            </DropdownMenuItem>
          )}
          {onSendReminder && check.status === 'pending-consent' && (
            <DropdownMenuItem onClick={() => onSendReminder(check.id)}>
              <Mail className="h-4 w-4 mr-2" />
              Send Reminder
            </DropdownMenuItem>
          )}
          {onCancelCheck && check.status !== 'completed' && check.status !== 'cancelled' && (
            <DropdownMenuItem onClick={() => onCancelCheck(check.id)}>
              <X className="h-4 w-4 mr-2" />
              Cancel Check
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  },
];
