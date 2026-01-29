import { useEffect, useCallback, useState } from 'react';
import { getAssessments, updateAssessment } from '@/shared/lib/mockAssessmentStorage';
import { toast } from 'sonner';

interface ReminderStats {
  pendingReminders: number;
  overdueAssessments: number;
}

interface UseAutomatedAssessmentRemindersOptions {
  enabled?: boolean;
  checkInterval?: number; // in milliseconds
  onRemindersProcessed?: (stats: ReminderStats) => void;
}

const REMINDER_INTERVAL_DAYS = 3;
const OVERDUE_DAYS = 10;
const ONE_HOUR = 60 * 60 * 1000;

/**
 * Hook for automated assessment reminder management
 * Checks for overdue assessments and marks them automatically
 */
export function useAutomatedAssessmentReminders(
  options: UseAutomatedAssessmentRemindersOptions = {}
) {
  const {
    enabled = true,
    checkInterval = 30000, // 30 seconds default
    onRemindersProcessed,
  } = options;

  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const processReminders = useCallback(async () => {
    try {
      // Prevent running too frequently (max once per hour)
      if (lastCheck && Date.now() - lastCheck.getTime() < ONE_HOUR) {
        return;
      }

      const allAssessments = getAssessments();
      const now = new Date();
      let remindersProcessed = 0;
      let overdueCount = 0;

      allAssessments.forEach((assessment) => {
        // Skip if already completed, cancelled, or expired
        if (['completed', 'expired', 'cancelled'].includes(assessment.status)) {
          return;
        }

        const invitedDate = new Date(assessment.invitedDate);
        const daysSinceInvited = Math.floor(
          (now.getTime() - invitedDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        // Check if reminder needed (3 days since last contact)
        const lastContactDate = assessment.lastReminderDate
          ? new Date(assessment.lastReminderDate)
          : invitedDate;
        
        const daysSinceLastContact = Math.floor(
          (now.getTime() - lastContactDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        // Send reminder if 3+ days since last contact and not yet completed
        if (daysSinceLastContact >= REMINDER_INTERVAL_DAYS && assessment.status !== 'completed') {
          updateAssessment(assessment.id, {
            lastReminderDate: now.toISOString(),
            remindersSent: assessment.remindersSent + 1,
          });
          remindersProcessed++;
        }

        // Mark as overdue if 10+ days and not started
        if (daysSinceInvited >= OVERDUE_DAYS && assessment.status === 'invited') {
          overdueCount++;
        }
      });

      setLastCheck(now);

      if (remindersProcessed > 0) {
        toast.success(`Processed ${remindersProcessed} assessment reminder${remindersProcessed > 1 ? 's' : ''}`);
      }

      const stats: ReminderStats = {
        pendingReminders: remindersProcessed,
        overdueAssessments: overdueCount,
      };

      onRemindersProcessed?.(stats);
    } catch (error) {
      console.error('Error processing assessment reminders:', error);
    }
  }, [lastCheck, onRemindersProcessed]);

  // Automated check interval
  useEffect(() => {
    if (!enabled) return;

    const interval = setInterval(processReminders, checkInterval);
    
    // Run immediately on mount
    processReminders();

    return () => clearInterval(interval);
  }, [enabled, checkInterval, processReminders]);

  const manualCheck = useCallback(async () => {
    await processReminders();
  }, [processReminders]);

  const getStats = useCallback((): ReminderStats => {
    const allAssessments = getAssessments();
    const now = new Date();
    
    let pendingReminders = 0;
    let overdueAssessments = 0;

    allAssessments.forEach((assessment) => {
      if (['completed', 'expired', 'cancelled'].includes(assessment.status)) {
        return;
      }

      const invitedDate = new Date(assessment.invitedDate);
      const daysSinceInvited = Math.floor(
        (now.getTime() - invitedDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      const lastContactDate = assessment.lastReminderDate
        ? new Date(assessment.lastReminderDate)
        : invitedDate;
      
      const daysSinceLastContact = Math.floor(
        (now.getTime() - lastContactDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysSinceLastContact >= REMINDER_INTERVAL_DAYS && assessment.status !== 'completed') {
        pendingReminders++;
      }

      if (daysSinceInvited >= OVERDUE_DAYS && assessment.status === 'invited') {
        overdueAssessments++;
      }
    });

    return {
      pendingReminders,
      overdueAssessments,
    };
  }, []);

  return {
    manualCheck,
    getStats,
    lastCheck,
  };
}
