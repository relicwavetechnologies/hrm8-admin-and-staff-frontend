/**
 * Office Hours Configuration Component
 * Allows company admins to set company-wide office hours for AI interview scheduling
 */

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import { Input } from '@/shared/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Clock, Settings, Search, Loader2, AlertCircle } from 'lucide-react';
import { useToast } from '@/shared/hooks/use-toast';
import { getAllTimezones, getTimezonesByRegion, type TimezoneOption } from '@/shared/lib/timezones';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { companySettingsService, type OfficeHoursConfig } from '@/shared/lib/companySettingsService';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';

const DAYS = [
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' },
  { value: 'sunday', label: 'Sunday' },
];

const DEFAULT_CONFIG: OfficeHoursConfig = {
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
  workDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
  startTime: '09:00',
  endTime: '17:00',
  lunchStart: '12:00',
  lunchEnd: '13:00',
};

export function OfficeHoursConfig() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [config, setConfig] = useState<OfficeHoursConfig>(DEFAULT_CONFIG);
  const [timezoneSearch, setTimezoneSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [allTimezones] = useState<TimezoneOption[]>(() => getAllTimezones());
  const [timezonesByRegion] = useState(() => getTimezonesByRegion());

  // Check if user can manage company settings
  const canManageSettings = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN';

  useEffect(() => {
    if (open) {
      loadConfig();
    }
  }, [open]);

  const loadConfig = async () => {
    setIsLoading(true);
    try {
      const response = await companySettingsService.getCompanySettings();
      if (response.success && response.data) {
        setConfig({
          timezone: response.data.timezone || DEFAULT_CONFIG.timezone,
          workDays: response.data.workDays || DEFAULT_CONFIG.workDays,
          startTime: response.data.startTime || DEFAULT_CONFIG.startTime,
          endTime: response.data.endTime || DEFAULT_CONFIG.endTime,
          lunchStart: response.data.lunchStart || DEFAULT_CONFIG.lunchStart,
          lunchEnd: response.data.lunchEnd || DEFAULT_CONFIG.lunchEnd,
        });
      } else {
        // Use defaults if settings don't exist yet
        setConfig(DEFAULT_CONFIG);
      }
    } catch (error) {
      console.error('Failed to load company settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to load company settings',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveConfig = async () => {
    if (!canManageSettings) {
      toast({
        title: 'Permission Denied',
        description: 'Only company admins can update company settings',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      const response = await companySettingsService.updateCompanySettings(config);
      if (response.success) {
        toast({
          title: 'Company settings saved',
          description: 'Office hours have been updated for your company',
        });
        setOpen(false);
      } else {
        throw new Error(response.error || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Failed to save company settings:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save company settings',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const toggleDay = (day: string) => {
    setConfig(prev => ({
      ...prev,
      workDays: prev.workDays.includes(day)
        ? prev.workDays.filter(d => d !== day)
        : [...prev.workDays, day],
    }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          Office Hours
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Configure Company Office Hours
          </DialogTitle>
          <DialogDescription>
            Set your company's office hours and timezone. These settings will be used for all interview scheduling across your company.
          </DialogDescription>
        </DialogHeader>

        {!canManageSettings && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Only company administrators can update office hours. Contact your admin to change these settings.
            </AlertDescription>
          </Alert>
        )}

        <ScrollArea className="max-h-[calc(90vh-200px)]">
          <div className="space-y-4 py-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">Loading settings...</span>
              </div>
            ) : (
              <>
                {/* Timezone */}
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select
                    value={config.timezone}
                    onValueChange={(value) => setConfig(prev => ({ ...prev, timezone: value }))}
                    disabled={!canManageSettings}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      <div className="p-2 border-b sticky top-0 bg-background z-10">
                        <div className="relative">
                          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Search timezone..."
                            value={timezoneSearch}
                            onChange={(e) => setTimezoneSearch(e.target.value)}
                            className="pl-8"
                            onClick={(e) => e.stopPropagation()}
                            onKeyDown={(e) => e.stopPropagation()}
                          />
                        </div>
                      </div>
                      <ScrollArea className="h-[350px]">
                        {Object.entries(timezonesByRegion)
                          .filter(([region]) =>
                            !timezoneSearch ||
                            region.toLowerCase().includes(timezoneSearch.toLowerCase())
                          )
                          .map(([region, timezones]) => {
                            const filteredTimezones = timezones.filter(tz =>
                              !timezoneSearch ||
                              tz.label.toLowerCase().includes(timezoneSearch.toLowerCase()) ||
                              tz.value.toLowerCase().includes(timezoneSearch.toLowerCase())
                            );

                            if (filteredTimezones.length === 0) return null;

                            return (
                              <div key={region}>
                                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground sticky top-0 bg-muted">
                                  {region.replace('_', ' ')}
                                </div>
                                {filteredTimezones.map((tz) => (
                                  <SelectItem key={tz.value} value={tz.value}>
                                    <div className="flex items-center justify-between w-full">
                                      <span>{tz.label}</span>
                                      {tz.offset && (
                                        <span className="text-xs text-muted-foreground ml-2">
                                          {tz.offset}
                                        </span>
                                      )}
                                    </div>
                                  </SelectItem>
                                ))}
                              </div>
                            );
                          })}
                        {timezoneSearch && allTimezones.filter(tz =>
                          tz.label.toLowerCase().includes(timezoneSearch.toLowerCase()) ||
                          tz.value.toLowerCase().includes(timezoneSearch.toLowerCase())
                        ).length === 0 && (
                            <div className="p-4 text-center text-sm text-muted-foreground">
                              No timezones found
                            </div>
                          )}
                      </ScrollArea>
                    </SelectContent>
                  </Select>
                  {config.timezone && (
                    <p className="text-xs text-muted-foreground">
                      Current time in this timezone: {new Date().toLocaleString('en-US', {
                        timeZone: config.timezone,
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true,
                      })}
                    </p>
                  )}
                </div>

                {/* Work Days */}
                <div className="space-y-2">
                  <Label>Work Days</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {DAYS.map(day => (
                      <Button
                        key={day.value}
                        type="button"
                        variant={config.workDays.includes(day.value) ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => toggleDay(day.value)}
                        disabled={!canManageSettings}
                        className="justify-start"
                      >
                        {day.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Start Time */}
                <div className="space-y-2">
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={config.startTime}
                    onChange={(e) => setConfig(prev => ({ ...prev, startTime: e.target.value }))}
                    disabled={!canManageSettings}
                  />
                </div>

                {/* End Time */}
                <div className="space-y-2">
                  <Label htmlFor="endTime">End Time</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={config.endTime}
                    onChange={(e) => setConfig(prev => ({ ...prev, endTime: e.target.value }))}
                    disabled={!canManageSettings}
                  />
                </div>

                {/* Lunch Break (Optional) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="lunchStart">Lunch Break (Optional)</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (config.lunchStart && config.lunchEnd) {
                          setConfig(prev => ({ ...prev, lunchStart: undefined, lunchEnd: undefined }));
                        } else {
                          setConfig(prev => ({ ...prev, lunchStart: '12:00', lunchEnd: '13:00' }));
                        }
                      }}
                      disabled={!canManageSettings}
                    >
                      {config.lunchStart && config.lunchEnd ? 'Remove' : 'Add'}
                    </Button>
                  </div>
                  {config.lunchStart && config.lunchEnd && (
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        type="time"
                        value={config.lunchStart}
                        onChange={(e) => setConfig(prev => ({ ...prev, lunchStart: e.target.value }))}
                        disabled={!canManageSettings}
                      />
                      <Input
                        type="time"
                        value={config.lunchEnd}
                        onChange={(e) => setConfig(prev => ({ ...prev, lunchEnd: e.target.value }))}
                        disabled={!canManageSettings}
                      />
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </ScrollArea>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isSaving}>
            Cancel
          </Button>
          {canManageSettings && (
            <Button onClick={saveConfig} disabled={isSaving || isLoading}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Office Hours'
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Get office hours config from backend (for use in other components)
 */
export async function getOfficeHoursConfig(): Promise<OfficeHoursConfig> {
  try {
    const response = await companySettingsService.getCompanySettings();
    if (response.success && response.data) {
      return response.data;
    }
  } catch (error) {
    console.error('Failed to load office hours config:', error);
  }
  // Return defaults if fetch fails
  return DEFAULT_CONFIG;
}
