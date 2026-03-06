import { useState, useEffect } from 'react';
import { Bell, BellOff, Settings } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/components/ui/popover';
import { Label } from '@/shared/components/ui/label';
import { Switch } from '@/shared/components/ui/switch';
import {
  followApplication,
  unfollowApplication,
  isFollowing,
  updateNotificationPreferences,
  getFollowers,
} from '@/shared/lib/applications/notifications';
import { useToast } from '@/shared/hooks/use-toast';

interface FollowApplicationButtonProps {
  applicationId: string;
  candidateName: string;
}

export function FollowApplicationButton({
  applicationId,
  candidateName,
}: FollowApplicationButtonProps) {
  const { toast } = useToast();
  const userId = 'current-user-id';
  const [following, setFollowing] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [inAppNotifications, setInAppNotifications] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    setFollowing(isFollowing(userId, applicationId));
    
    const followers = getFollowers(applicationId);
    const currentFollower = followers.find(f => f.userId === userId);
    if (currentFollower) {
      setEmailNotifications(currentFollower.emailNotifications);
      setInAppNotifications(currentFollower.inAppNotifications);
    }
  }, [applicationId, userId]);

  const handleToggleFollow = () => {
    if (following) {
      unfollowApplication(userId, applicationId);
      setFollowing(false);
      toast({
        title: 'Unfollowed',
        description: `You will no longer receive notifications for ${candidateName}`,
      });
    } else {
      followApplication(userId, applicationId, {
        emailNotifications,
        inAppNotifications,
      });
      setFollowing(true);
      toast({
        title: 'Following',
        description: `You will receive notifications when team members review ${candidateName}`,
      });
    }
  };

  const handlePreferenceChange = (
    key: 'emailNotifications' | 'inAppNotifications',
    value: boolean
  ) => {
    if (key === 'emailNotifications') {
      setEmailNotifications(value);
    } else {
      setInAppNotifications(value);
    }
    
    if (following) {
      updateNotificationPreferences(userId, applicationId, {
        [key]: value,
      });
    }
  };

  return (
    <div className="flex items-center gap-1">
      <Button
        variant={following ? 'default' : 'outline'}
        size="sm"
        onClick={handleToggleFollow}
      >
        {following ? (
          <>
            <Bell className="h-4 w-4 mr-2" />
            Following
          </>
        ) : (
          <>
            <BellOff className="h-4 w-4 mr-2" />
            Follow
          </>
        )}
      </Button>

      {following && (
        <Popover open={showSettings} onOpenChange={setShowSettings}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Settings className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-4">
              <h4 className="font-semibold text-sm">Notification Preferences</h4>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="in-app">In-app notifications</Label>
                    <p className="text-xs text-muted-foreground">
                      Show notifications in the app
                    </p>
                  </div>
                  <Switch
                    id="in-app"
                    checked={inAppNotifications}
                    onCheckedChange={(checked) =>
                      handlePreferenceChange('inAppNotifications', checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email">Email notifications</Label>
                    <p className="text-xs text-muted-foreground">
                      Receive emails for updates
                    </p>
                  </div>
                  <Switch
                    id="email"
                    checked={emailNotifications}
                    onCheckedChange={(checked) =>
                      handlePreferenceChange('emailNotifications', checked)
                    }
                  />
                </div>
              </div>

              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground">
                  Get notified when team members add reviews, votes, or comments
                </p>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
