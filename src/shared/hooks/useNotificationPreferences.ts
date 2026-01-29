import { useState, useEffect, useCallback } from 'react';
import { userNotificationPreferencesService, type UpdatePreferencesData } from '@/shared/lib/api/userNotificationPreferencesService';
import { NotificationPreferences } from '@/shared/types/notificationPreferences';
import { toast } from 'sonner';

// Default preferences structure (used when API returns empty/null)
const DEFAULT_PREFERENCES: NotificationPreferences = {
  eventPreferences: {
    new_application: { enabled: true, channels: ['email', 'in-app'] },
    application_status_change: { enabled: true, channels: ['in-app'] },
    interview_scheduled: { enabled: true, channels: ['email', 'in-app'] },
    job_posted: { enabled: true, channels: ['in-app'] },
    payment_received: { enabled: true, channels: ['email', 'in-app'] },
    payment_failed: { enabled: true, channels: ['email', 'in-app'] },
    subscription_change: { enabled: true, channels: ['email', 'in-app'] },
    system_announcement: { enabled: true, channels: ['email', 'in-app'] },
    user_signup: { enabled: true, channels: ['in-app'] },
    support_ticket: { enabled: true, channels: ['email', 'in-app'] },
  },
  quietHours: {
    enabled: false,
    start: '22:00',
    end: '08:00',
  },
};

export function useNotificationPreferences() {
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch preferences from API on mount
  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const prefs = await userNotificationPreferencesService.getPreferences();
        // Merge with defaults in case API returns partial data
        setPreferences({
          eventPreferences: {
            ...DEFAULT_PREFERENCES.eventPreferences,
            ...(prefs.eventPreferences || {}),
          },
          quietHours: prefs.quietHours || DEFAULT_PREFERENCES.quietHours,
        });
      } catch (error) {
        console.error('Failed to fetch notification preferences:', error);
        // Fall back to defaults on error
        setPreferences(DEFAULT_PREFERENCES);
        toast.error('Failed to load preferences', {
          description: 'Using default settings. Changes will be saved when possible.',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPreferences();
  }, []);

  // Save preferences to API
  const savePreferences = useCallback(async (updates: UpdatePreferencesData) => {
    setSaving(true);
    try {
      const updated = await userNotificationPreferencesService.updatePreferences(updates);
      setPreferences({
        eventPreferences: {
          ...DEFAULT_PREFERENCES.eventPreferences,
          ...(updated.eventPreferences || {}),
        },
        quietHours: updated.quietHours || DEFAULT_PREFERENCES.quietHours,
      });
      toast.success('Preferences saved', {
        description: 'Your notification preferences have been updated',
      });
    } catch (error) {
      console.error('Failed to save preferences:', error);
      toast.error('Failed to save preferences', {
        description: 'Please try again later',
      });
    } finally {
      setSaving(false);
    }
  }, []);

  const updatePreferences = useCallback((updates: Partial<NotificationPreferences>) => {
    if (!preferences) return;

    // Optimistic update
    const newPrefs = {
      ...preferences,
      ...updates,
      eventPreferences: {
        ...preferences.eventPreferences,
        ...(updates.eventPreferences || {}),
      },
    };
    setPreferences(newPrefs);

    // Debounced save to API
    savePreferences({
      eventPreferences: newPrefs.eventPreferences as any,
      quietHours: newPrefs.quietHours || null,
    });
  }, [preferences, savePreferences]);

  const toggleEventNotification = useCallback((eventType: keyof NotificationPreferences['eventPreferences']) => {
    if (!preferences) return;

    const currentPref = preferences.eventPreferences[eventType];
    updatePreferences({
      eventPreferences: {
        ...preferences.eventPreferences,
        [eventType]: {
          ...currentPref,
          enabled: !currentPref.enabled,
        },
      },
    });
  }, [preferences, updatePreferences]);

  const updateEventChannels = useCallback((
    eventType: keyof NotificationPreferences['eventPreferences'],
    channels: string[]
  ) => {
    if (!preferences) return;

    updatePreferences({
      eventPreferences: {
        ...preferences.eventPreferences,
        [eventType]: {
          ...preferences.eventPreferences[eventType],
          channels: channels as any,
        },
      },
    });
  }, [preferences, updatePreferences]);

  const toggleQuietHours = useCallback(() => {
    if (!preferences) return;

    updatePreferences({
      quietHours: {
        ...preferences.quietHours!,
        enabled: !preferences.quietHours?.enabled,
      },
    });
  }, [preferences, updatePreferences]);

  const updateQuietHoursTimes = useCallback((start: string, end: string) => {
    if (!preferences) return;

    updatePreferences({
      quietHours: {
        enabled: preferences.quietHours?.enabled || false,
        start,
        end,
      },
    });
  }, [preferences, updatePreferences]);

  return {
    preferences,
    loading,
    saving,
    updatePreferences,
    toggleEventNotification,
    updateEventChannels,
    toggleQuietHours,
    updateQuietHoursTimes,
  };
}
