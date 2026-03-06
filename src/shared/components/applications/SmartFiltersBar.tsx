import { Badge } from '@/shared/components/ui/badge';
import { Clock, Star, Calendar, MessageSquare, Sparkles } from 'lucide-react';
import { ApplicationFilters } from '@/shared/types/filterPreset';

interface SmartFiltersBarProps {
  onFilterSelect: (filter: ApplicationFilters) => void;
}

export function SmartFiltersBar({ onFilterSelect }: SmartFiltersBarProps) {
  const smartFilters = [
    {
      id: 'needs-attention',
      name: 'Needs Attention',
      icon: Clock,
      description: 'No activity in 7+ days',
      filters: {
        // This would need custom logic in the parent
        customFields: { lastActivity: '7days' }
      } as ApplicationFilters,
    },
    {
      id: 'high-potential',
      name: 'High Potential',
      icon: Star,
      description: 'Score > 80',
      filters: {
        scoreRange: [80, 100]
      } as ApplicationFilters,
    },
    {
      id: 'interview-this-week',
      name: 'Interview This Week',
      icon: Calendar,
      description: 'Scheduled interviews',
      filters: {
        status: ['interview']
      } as ApplicationFilters,
    },
    {
      id: 'pending-feedback',
      name: 'Pending Feedback',
      icon: MessageSquare,
      description: 'Interview completed, no feedback',
      filters: {
        customFields: { pendingFeedback: true }
      } as ApplicationFilters,
    },
    {
      id: 'new-applications',
      name: 'New Today',
      icon: Sparkles,
      description: 'Last 24 hours',
      filters: {
        dateRange: {
          start: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          end: new Date().toISOString(),
        }
      } as ApplicationFilters,
    },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {smartFilters.map((filter) => {
        const Icon = filter.icon;
        return (
          <Badge
            key={filter.id}
            variant="outline"
            className="cursor-pointer hover:bg-secondary/80 transition-colors px-3 py-2 gap-2"
            onClick={() => onFilterSelect(filter.filters)}
          >
            <Icon className="h-3 w-3" />
            <span>{filter.name}</span>
          </Badge>
        );
      })}
    </div>
  );
}
