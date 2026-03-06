import { useEffect, useCallback, useRef } from 'react';
import { 
  processScheduledReminders, 
  markOverdueReferees,
  getReminderStats 
} from '@/shared/lib/backgroundChecks/reminderScheduler';
import { processEscalations } from '@/shared/lib/backgroundChecks/escalationService';
import { processSLANotifications } from '@/shared/lib/backgroundChecks/slaService';
import { useToast } from '@/shared/hooks/use-toast';

interface ReminderStats {
  pendingReminders: number;
  overdueCount: number;
  pendingConsents: number;
  overdueConsents: number;
}

interface UseAutomatedRemindersOptions {
  enabled?: boolean;
  checkInterval?: number; // in milliseconds
  onRemindersProcessed?: (stats: { refereeReminders: number; consentReminders: number }) => void;
}

/**
 * Hook to automatically process and send reminders for background checks
 * Checks for overdue consents and referees at specified intervals
 */
export function useAutomatedReminders(options: UseAutomatedRemindersOptions = {}) {
  const {
    enabled = true,
    checkInterval = 60000, // Default: check every 1 minute
    onRemindersProcessed
  } = options;

  const { toast } = useToast();
  const lastCheckRef = useRef<Date | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const processReminders = useCallback(() => {
    const now = new Date();
    
    // Only process once per hour to avoid spam
    if (lastCheckRef.current) {
      const hoursSinceLastCheck = (now.getTime() - lastCheckRef.current.getTime()) / (1000 * 60 * 60);
      if (hoursSinceLastCheck < 1) {
        return;
      }
    }

    console.log('🔄 Processing automated reminders, escalations, and SLA checks...');
    
    try {
      // Process reminders
      const result = processScheduledReminders();
      
      // Mark overdue referees
      markOverdueReferees();
      
      // Process escalations
      processEscalations();
      
      // Process SLA notifications
      processSLANotifications();
      
      lastCheckRef.current = now;

      // Log results
      if (result.refereeReminders > 0 || result.consentReminders > 0) {
        console.log(`✅ Sent ${result.refereeReminders} referee reminders and ${result.consentReminders} consent reminders`);
        console.log(`✅ Processed escalations and SLA checks`);
        
        toast({
          title: "Automated Checks Complete",
          description: `Sent ${result.refereeReminders} referee reminders and ${result.consentReminders} consent reminders. Escalations and SLAs processed.`,
        });

        onRemindersProcessed?.(result);
      }
    } catch (error) {
      console.error('❌ Error processing automated checks:', error);
    }
  }, [toast, onRemindersProcessed]);

  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Initial check
    processReminders();

    // Set up interval
    intervalRef.current = setInterval(() => {
      processReminders();
    }, checkInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, checkInterval, processReminders]);

  const manualCheck = useCallback(() => {
    lastCheckRef.current = null; // Reset to force check
    processReminders();
  }, [processReminders]);

  const getStats = useCallback((): ReminderStats => {
    return getReminderStats();
  }, []);

  return {
    manualCheck,
    getStats,
    lastCheck: lastCheckRef.current
  };
}
