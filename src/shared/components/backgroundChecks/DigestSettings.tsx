import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Label } from '@/shared/components/ui/label';
import { Switch } from '@/shared/components/ui/switch';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/shared/components/ui/radio-group';
import { Mail, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/shared/hooks/use-toast';
import {
  getUserDigestPreferences,
  saveDigestPreferences,
  type DigestFrequency,
  type DigestPreferences,
  generateDigestData,
  sendDigestEmail
} from '@/shared/lib/backgroundChecks/digestService';

export function DigestSettings() {
  const { toast } = useToast();
  const [preferences, setPreferences] = useState<DigestPreferences>({
    userId: 'current-user', // In real app, get from auth
    frequency: 'weekly',
    includeStatusChanges: true,
    includePendingActions: true,
    includeOverdueItems: true,
    emailAddress: 'recruiter@example.com'
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);

  useEffect(() => {
    // Load existing preferences
    const existingPrefs = getUserDigestPreferences('current-user');
    if (existingPrefs) {
      setPreferences(existingPrefs);
    }
  }, []);

  const handleSave = () => {
    setIsSaving(true);
    
    try {
      saveDigestPreferences(preferences);
      
      toast({
        title: "Preferences saved",
        description: "Your digest notification preferences have been updated.",
      });
    } catch (error) {
      toast({
        title: "Error saving preferences",
        description: "Failed to save your preferences. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendTestDigest = () => {
    setIsSendingTest(true);
    
    try {
      const digestData = generateDigestData(preferences.userId, preferences.frequency);
      sendDigestEmail(preferences.userId, digestData);
      
      toast({
        title: "Test digest sent",
        description: `A test ${preferences.frequency} digest has been sent to ${preferences.emailAddress}`,
      });
    } catch (error) {
      toast({
        title: "Error sending test digest",
        description: "Failed to send test digest. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSendingTest(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-primary" />
          <CardTitle>Email Digest Notifications</CardTitle>
        </div>
        <CardDescription>
          Receive periodic email summaries of background check status changes and pending actions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Frequency Selection */}
        <div className="space-y-3">
          <Label>Digest Frequency</Label>
          <RadioGroup
            value={preferences.frequency}
            onValueChange={(value) => setPreferences({ ...preferences, frequency: value as DigestFrequency })}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="daily" id="daily" />
              <Label htmlFor="daily" className="font-normal cursor-pointer">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <div>
                    <div>Daily</div>
                    <div className="text-xs text-muted-foreground">Receive a summary every day</div>
                  </div>
                </div>
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="weekly" id="weekly" />
              <Label htmlFor="weekly" className="font-normal cursor-pointer">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <div>
                    <div>Weekly</div>
                    <div className="text-xs text-muted-foreground">Receive a summary every week</div>
                  </div>
                </div>
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="disabled" id="disabled" />
              <Label htmlFor="disabled" className="font-normal cursor-pointer">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  <div>
                    <div>Disabled</div>
                    <div className="text-xs text-muted-foreground">Don't send digest emails</div>
                  </div>
                </div>
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Email Address */}
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            value={preferences.emailAddress}
            onChange={(e) => setPreferences({ ...preferences, emailAddress: e.target.value })}
            placeholder="your.email@example.com"
          />
        </div>

        {/* Content Preferences */}
        <div className="space-y-3">
          <Label>Include in Digest</Label>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="status-changes" className="font-normal">
                Status Changes
              </Label>
              <p className="text-xs text-muted-foreground">
                Include all checks that changed status during the period
              </p>
            </div>
            <Switch
              id="status-changes"
              checked={preferences.includeStatusChanges}
              onCheckedChange={(checked) => 
                setPreferences({ ...preferences, includeStatusChanges: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="pending-actions" className="font-normal">
                Pending Actions
              </Label>
              <p className="text-xs text-muted-foreground">
                Include checks requiring attention or review
              </p>
            </div>
            <Switch
              id="pending-actions"
              checked={preferences.includePendingActions}
              onCheckedChange={(checked) => 
                setPreferences({ ...preferences, includePendingActions: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="overdue-items" className="font-normal">
                Overdue Items
              </Label>
              <p className="text-xs text-muted-foreground">
                Highlight checks that are overdue or taking too long
              </p>
            </div>
            <Switch
              id="overdue-items"
              checked={preferences.includeOverdueItems}
              onCheckedChange={(checked) => 
                setPreferences({ ...preferences, includeOverdueItems: checked })
              }
            />
          </div>
        </div>

        {/* Last Sent Info */}
        {preferences.lastSentAt && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle className="h-4 w-4" />
            <span>
              Last digest sent: {new Date(preferences.lastSentAt).toLocaleString()}
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Preferences'}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleSendTestDigest}
            disabled={preferences.frequency === 'disabled' || isSendingTest}
          >
            {isSendingTest ? 'Sending...' : 'Send Test Digest'}
          </Button>
        </div>

        {preferences.frequency === 'disabled' && (
          <div className="flex items-start gap-2 p-3 bg-muted rounded-lg">
            <AlertCircle className="h-4 w-4 mt-0.5" />
            <p className="text-sm text-muted-foreground">
              Digest notifications are currently disabled. Enable them to receive email summaries.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
