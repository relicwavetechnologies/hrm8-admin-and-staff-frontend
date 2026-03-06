import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { AlertCircle, Mail, Users, FileWarning } from "lucide-react";
import { getBackgroundCheckStats } from '@/shared/lib/backgroundChecks/dashboardStats';
import { useNavigate } from 'react-router-dom';

export function PendingActionsWidget() {
  const stats = getBackgroundCheckStats();
  const navigate = useNavigate();
  
  const actions = [
    {
      label: 'Pending Consents',
      count: stats.pendingConsents,
      icon: Mail,
      color: 'text-blue-500',
      onClick: () => navigate('/background-checks?status=pending-consent'),
    },
    {
      label: 'Overdue Referees',
      count: stats.overdueReferees,
      icon: Users,
      color: 'text-orange-500',
      onClick: () => navigate('/background-checks'),
    },
    {
      label: 'Requires Review',
      count: stats.requiresReview,
      icon: FileWarning,
      color: 'text-red-500',
      onClick: () => navigate('/background-checks?status=issues-found'),
    },
  ];
  
  const totalPending = stats.pendingConsents + stats.overdueReferees + stats.requiresReview;
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Pending Actions</CardTitle>
        <AlertCircle className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold mb-3">{totalPending}</div>
        <div className="space-y-2">
          {actions.map((action) => (
            <div
              key={action.label}
              onClick={action.onClick}
              className="flex items-center justify-between p-2 rounded-md hover:bg-accent cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2">
                <action.icon className={`h-4 w-4 ${action.color}`} />
                <span className="text-sm">{action.label}</span>
              </div>
              <Badge variant={action.count > 0 ? "destructive" : "outline"}>
                {action.count}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
