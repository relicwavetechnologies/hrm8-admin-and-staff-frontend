import React from 'react';
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar';
import { Badge } from '@/shared/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/shared/components/ui/tooltip';
import { Users, Eye } from 'lucide-react';
import { CandidatePresence } from '@/shared/hooks/useCandidatePresence';

interface CandidatePresenceIndicatorProps {
  activeUsers: CandidatePresence[];
  currentUserId: string;
}

const tabLabels: Record<string, string> = {
  overview: 'Overview',
  application: 'Application',
  resume: 'Resume',
  questionnaire: 'Questionnaire',
  scorecards: 'Scorecards',
  interviews: 'Interviews',
  reviews: 'Team Reviews',
  activity: 'Activity',
};

export const CandidatePresenceIndicator: React.FC<CandidatePresenceIndicatorProps> = ({
  activeUsers,
  currentUserId,
}) => {
  const otherUsers = activeUsers.filter((user) => user.userId !== currentUserId);

  if (otherUsers.length === 0) return null;

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getTimeSinceActive = (lastActive: Date) => {
    const seconds = Math.floor((Date.now() - lastActive.getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes === 1) return '1 min ago';
    return `${minutes} mins ago`;
  };

  return (
    <div className="flex items-center gap-2">
      <Badge variant="secondary" className="gap-1.5">
        <Users className="h-3 w-3" />
        {otherUsers.length} viewing
      </Badge>
      
      <TooltipProvider>
        <div className="flex -space-x-2">
          {otherUsers.slice(0, 3).map((user) => (
            <Tooltip key={user.userId}>
              <TooltipTrigger asChild>
                <Avatar className="h-8 w-8 border-2 border-background cursor-pointer hover:z-10 transition-transform hover:scale-110">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    {getInitials(user.userName)}
                  </AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-xs">
                <div className="space-y-1">
                  <p className="font-medium">{user.userName}</p>
                  <p className="text-xs text-muted-foreground">{user.userRole}</p>
                  {user.tab && (
                    <div className="flex items-center gap-1 text-xs">
                      <Eye className="h-3 w-3" />
                      <span>Viewing {tabLabels[user.tab] || user.tab}</span>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">{getTimeSinceActive(user.lastActive)}</p>
                </div>
              </TooltipContent>
            </Tooltip>
          ))}
          {otherUsers.length > 3 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Avatar className="h-8 w-8 border-2 border-background cursor-pointer hover:z-10 transition-transform hover:scale-110">
                  <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                    +{otherUsers.length - 3}
                  </AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-xs">
                <div className="space-y-2">
                  {otherUsers.slice(3).map((user) => (
                    <div key={user.userId} className="space-y-0.5">
                      <p className="font-medium text-sm">{user.userName}</p>
                      <p className="text-xs text-muted-foreground">{user.userRole}</p>
                    </div>
                  ))}
                </div>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </TooltipProvider>
    </div>
  );
};
