import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
  Activity,
  Eye,
  MessageSquare,
  Star,
  TrendingUp,
  CheckCircle,
  Calendar,
  FileText,
  Upload,
  AtSign,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useLiveActivityFeed, ActivityAction } from '@/shared/hooks/useLiveActivityFeed';

interface LiveActivityFeedProps {
  candidateId?: string;
  maxHeight?: string;
}

export const LiveActivityFeed: React.FC<LiveActivityFeedProps> = ({
  candidateId,
  maxHeight = '600px',
}) => {
  const { activities, clearActivities } = useLiveActivityFeed({
    candidateId,
    enabled: true,
  });

  const [filter, setFilter] = useState<ActivityAction | 'all'>('all');

  const getActivityIcon = (action: ActivityAction) => {
    switch (action) {
      case 'viewed':
        return <Eye className="h-4 w-4 text-blue-500" />;
      case 'commented':
        return <MessageSquare className="h-4 w-4 text-green-500" />;
      case 'rated':
        return <Star className="h-4 w-4 text-yellow-500" />;
      case 'status_changed':
        return <TrendingUp className="h-4 w-4 text-purple-500" />;
      case 'decision_made':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'interview_scheduled':
        return <Calendar className="h-4 w-4 text-orange-500" />;
      case 'note_added':
        return <FileText className="h-4 w-4 text-gray-500" />;
      case 'document_uploaded':
        return <Upload className="h-4 w-4 text-indigo-500" />;
      case 'mentioned':
        return <AtSign className="h-4 w-4 text-pink-500" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getActivityColor = (action: ActivityAction) => {
    switch (action) {
      case 'viewed':
        return 'border-blue-200 bg-blue-50';
      case 'commented':
        return 'border-green-200 bg-green-50';
      case 'rated':
        return 'border-yellow-200 bg-yellow-50';
      case 'status_changed':
        return 'border-purple-200 bg-purple-50';
      case 'decision_made':
        return 'border-green-200 bg-green-50';
      case 'interview_scheduled':
        return 'border-orange-200 bg-orange-50';
      case 'note_added':
        return 'border-gray-200 bg-gray-50';
      case 'document_uploaded':
        return 'border-indigo-200 bg-indigo-50';
      case 'mentioned':
        return 'border-pink-200 bg-pink-50';
      default:
        return 'border-border bg-muted';
    }
  };

  const filteredActivities = filter === 'all' 
    ? activities 
    : activities.filter(a => a.action === filter);

  const activityFilters: Array<{ value: ActivityAction | 'all'; label: string }> = [
    { value: 'all', label: 'All' },
    { value: 'viewed', label: 'Views' },
    { value: 'commented', label: 'Comments' },
    { value: 'rated', label: 'Ratings' },
    { value: 'status_changed', label: 'Status' },
    { value: 'decision_made', label: 'Decisions' },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 animate-pulse text-primary" />
            Live Activity Feed
            <Badge variant="secondary" className="ml-2">
              {filteredActivities.length} events
            </Badge>
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearActivities}
          >
            Clear
          </Button>
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          {activityFilters.map(({ value, label }) => (
            <Button
              key={value}
              variant={filter === value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(value)}
            >
              {label}
            </Button>
          ))}
        </div>
      </CardHeader>

      <CardContent>
        <ScrollArea style={{ height: maxHeight }}>
          {filteredActivities.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Activity className="h-12 w-12 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No activity yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredActivities.map((activity, index) => (
                <div
                  key={activity.id}
                  className={`relative flex gap-3 p-4 rounded-lg border transition-all duration-300 ${
                    getActivityColor(activity.action)
                  } ${index === 0 ? 'animate-in slide-in-from-top-2' : ''}`}
                >
                  {/* Timeline line */}
                  {index < filteredActivities.length - 1 && (
                    <div className="absolute left-[2.75rem] top-[4.5rem] w-px h-[calc(100%+1rem)] bg-border" />
                  )}

                  {/* Avatar */}
                  <Avatar className="h-10 w-10 border-2 border-background">
                    <AvatarImage src={activity.userAvatar} />
                    <AvatarFallback>
                      {activity.userName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        {getActivityIcon(activity.action)}
                        <div>
                          <p className="text-sm font-semibold">
                            {activity.userName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {activity.userRole}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                      </span>
                    </div>

                    <p className="text-sm text-foreground/90 mb-2">
                      {activity.description}
                    </p>

                    {!candidateId && (
                      <Badge variant="outline" className="text-xs">
                        {activity.candidateName}
                      </Badge>
                    )}

                    {/* Metadata */}
                    {activity.metadata && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {activity.metadata.rating && (
                          <Badge variant="secondary" className="text-xs">
                            ⭐ {activity.metadata.rating}/5
                          </Badge>
                        )}
                        {activity.metadata.oldStatus && activity.metadata.newStatus && (
                          <Badge variant="secondary" className="text-xs">
                            {activity.metadata.oldStatus} → {activity.metadata.newStatus}
                          </Badge>
                        )}
                        {activity.metadata.decision && (
                          <Badge variant="secondary" className="text-xs">
                            Decision: {activity.metadata.decision}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
