import { Button } from "@/shared/components/ui/button";
import { ApplicationStatus, ApplicationStage } from "@/shared/types/application";
import {
  Sparkles,
  Calendar,
  Star,
  CheckCircle,
  XCircle,
  Eye,
  AlertTriangle
} from "lucide-react";
import { LucideIcon } from "lucide-react";

export interface QuickFilter {
  id: string;
  label: string;
  icon?: LucideIcon;
  filter: {
    statuses?: ApplicationStatus[];
    stages?: ApplicationStage[];
    shortlisted?: boolean;
    unread?: boolean;
    minScore?: number;
  };
}

const quickFilters: QuickFilter[] = [
  {
    id: 'new',
    label: 'New Applications',
    icon: Sparkles,
    filter: {
      statuses: ['applied'],
      stages: ['New Application'],
      unread: true,
    },
  },
  {
    id: 'interviewed',
    label: 'In Interview',
    icon: Calendar,
    filter: {
      stages: [
        'Phone Screen',
        'Technical Interview',
        'Manager Interview',
        'Final Round',
      ],
    },
  },
  {
    id: 'shortlisted',
    label: 'Shortlisted',
    icon: Star,
    filter: {
      shortlisted: true,
    },
  },
  {
    id: 'offered',
    label: 'Offered',
    icon: CheckCircle,
    filter: {
      statuses: ['offer'],
      stages: ['Offer Extended'],
    },
  },
  {
    id: 'rejected',
    label: 'Rejected',
    icon: XCircle,
    filter: {
      statuses: ['rejected'],
      stages: ['Rejected'],
    },
  },
  {
    id: 'needs-review',
    label: 'Needs Review',
    icon: Eye,
    filter: {
      unread: true,
    },
  },
  {
    id: 'high-priority',
    label: 'High Priority',
    icon: AlertTriangle,
    filter: {
      minScore: 80,
    },
  },
];

interface StatusQuickFiltersProps {
  activeFilterId?: string | null;
  onFilterChange: (filterId: string | null) => void;
}

export function StatusQuickFilters({
  activeFilterId,
  onFilterChange,
}: StatusQuickFiltersProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {quickFilters.map((filter) => {
        const IconComponent = filter.icon;
        return (
          <Button
            key={filter.id}
            variant={activeFilterId === filter.id ? "default" : "outline"}
            size="sm"
            onClick={() => onFilterChange(activeFilterId === filter.id ? null : filter.id)}
            className="h-8 text-xs"
          >
            {IconComponent && <IconComponent className="h-3.5 w-3.5 mr-1.5" />}
            {filter.label}
          </Button>
        );
      })}
    </div>
  );
}

export { quickFilters };

