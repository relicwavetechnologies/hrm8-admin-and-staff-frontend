import { useEffect, useState } from "react";
import { toast } from "@/shared/hooks/use-toast";
import { Application } from "@/shared/types/application";

export function useActivityNotifications(application: Application) {
  const [lastActivityId, setLastActivityId] = useState<string | null>(null);

  // Calculate unread count from activities
  const unreadCount = (application.activities || []).filter(a => !a.isRead).length;

  useEffect(() => {
    const activities = application?.activities || [];
    if (!activities || activities.length === 0) {
      return;
    }

    const latestActivity = activities[0];
    if (!latestActivity || !latestActivity.id) {
      return;
    }
    
    // Check if this is a new activity
    if (lastActivityId && latestActivity.id !== lastActivityId) {
      // Show toast notification for new activity
      const activityType = latestActivity.type?.replace(/_/g, ' ') || 'activity';
      
      toast({
        title: "New Activity",
        description: `${latestActivity.userName || 'Someone'} ${activityType}: ${latestActivity.description || ''}`,
      });
    }
    
    setLastActivityId(latestActivity.id);
  }, [application?.activities, lastActivityId]);

  return {
    unreadCount,
  };
}
