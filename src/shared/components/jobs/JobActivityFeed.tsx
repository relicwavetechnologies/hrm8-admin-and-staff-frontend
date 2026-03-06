import { JobActivity } from "@/shared/types/job";
import { formatRelativeDate } from "@/shared/lib/jobUtils";
import { 
  FileText, 
  CheckCircle, 
  Edit, 
  UserPlus, 
  Send,
  XCircle 
} from "lucide-react";

interface JobActivityFeedProps {
  activities: JobActivity[];
}

export function JobActivityFeed({ activities }: JobActivityFeedProps) {
  const getActivityIcon = (type: JobActivity['activityType']) => {
    switch (type) {
      case 'created':
        return <FileText className="h-4 w-4" />;
      case 'published':
        return <Send className="h-4 w-4" />;
      case 'updated':
        return <Edit className="h-4 w-4" />;
      case 'status-changed':
        return <CheckCircle className="h-4 w-4" />;
      case 'candidate-moved':
        return <UserPlus className="h-4 w-4" />;
      case 'closed':
        return <XCircle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No activity yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div key={activity.id} className="flex gap-3">
          <div className="h-8 w-8 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
            {getActivityIcon(activity.activityType)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">{activity.activityDescription}</p>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-xs text-muted-foreground">{activity.userName}</p>
              <span className="text-xs text-muted-foreground">•</span>
              <p className="text-xs text-muted-foreground">{formatRelativeDate(activity.createdAt)}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
