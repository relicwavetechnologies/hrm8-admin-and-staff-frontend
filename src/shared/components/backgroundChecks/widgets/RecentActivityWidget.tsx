import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Clock, CheckCircle, Mail, FileCheck } from "lucide-react";
import { getRecentActivity } from '@/shared/lib/backgroundChecks/dashboardStats';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

const activityIcons: Record<string, any> = {
  'initiated': FileCheck,
  'consent-received': Mail,
  'completed': CheckCircle,
};

const activityColors: Record<string, string> = {
  'initiated': 'text-blue-500',
  'consent-received': 'text-green-500',
  'completed': 'text-purple-500',
};

export function RecentActivityWidget() {
  const activities = getRecentActivity().slice(0, 5);
  const navigate = useNavigate();
  
  const formatActivityType = (type: string) => {
    return type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };
  
  return (
    <Card className="col-span-2">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
        <Clock className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activities.map((activity, index) => {
            const Icon = activityIcons[activity.type] || FileCheck;
            const color = activityColors[activity.type] || 'text-muted-foreground';
            
            return (
              <div
                key={index}
                onClick={() => navigate(`/background-checks/${activity.checkId}`)}
                className="flex items-center gap-3 p-2 rounded-md hover:bg-accent cursor-pointer transition-colors"
              >
                <Icon className={`h-4 w-4 ${color}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{activity.candidateName}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatActivityType(activity.type)}
                  </p>
                </div>
                <Badge variant="outline" className="text-xs">
                  {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                </Badge>
              </div>
            );
          })}
          
          {activities.length === 0 && (
            <div className="text-center py-4 text-sm text-muted-foreground">
              No recent activity
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
