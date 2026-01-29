import type { RefereeDetails } from '@/shared/types/referee';
import type { ConsentRequest } from '@/shared/types/consent';
import { updateReferee, getPendingReferees, getOverdueReferees, getRefereesByBackgroundCheck } from './refereeStorage';
import { getConsentRequests, updateConsent } from './consentStorage';
import { generateReminderEmail } from './emailTemplates';
import { createBackgroundCheckNotification } from './notificationService';
import { sendBackgroundCheckEmail } from './emailNotificationService';
import { getBackgroundCheckById } from '@/shared/lib/mockBackgroundCheckStorage';

export function scheduleReminders(refereeId: string, refereeName: string): void {
  console.log(`📅 Scheduled reminders for referee ${refereeName}:`);
  console.log('  - Day 3: First reminder');
  console.log('  - Day 7: Second reminder');
  console.log('  - Day 10: Mark as overdue');
}

export function sendRefereeReminder(
  referee: RefereeDetails,
  candidateName: string,
  reminderNumber: number
): void {
  const questionnaireUrl = `${window.location.origin}/reference/${referee.token}`;
  const emailHtml = generateReminderEmail(referee, candidateName, questionnaireUrl, reminderNumber);
  
  console.log(`📧 Sending referee reminder ${reminderNumber} to:`, referee.email);
  console.log('Email HTML:', emailHtml);
  
  // Send email notification
  sendBackgroundCheckEmail('referee_reminder', {
    refereeName: referee.name,
    refereeEmail: referee.email,
    candidateName,
    questionnaireLink: questionnaireUrl,
    reminderNumber,
    candidateEmail: '',
    checkId: referee.backgroundCheckId,
  });

  // Create in-app notification
  createBackgroundCheckNotification('referee_reminder', {
    refereeName: referee.name,
    candidateName,
    checkId: referee.backgroundCheckId,
    reminderNumber,
  });
  
  updateReferee(referee.id, {
    lastReminderDate: new Date().toISOString()
  });
}

export function sendConsentReminder(consent: ConsentRequest, reminderNumber: number): void {
  const consentUrl = `${window.location.origin}/consent/${consent.token}`;
  
  console.log(`📧 Sending consent reminder ${reminderNumber} to:`, consent.candidateEmail);
  
  // Send email notification
  sendBackgroundCheckEmail('consent_reminder', {
    candidateName: consent.candidateName,
    candidateEmail: consent.candidateEmail,
    checkId: consent.backgroundCheckId,
    consentLink: consentUrl,
    reminderNumber,
  });

  // Create in-app notification
  createBackgroundCheckNotification('consent_reminder', {
    candidateName: consent.candidateName,
    checkId: consent.backgroundCheckId,
    reminderNumber,
  });

  updateConsent(consent.id, {
    lastReminderDate: new Date().toISOString()
  } as any);
}

export function processScheduledReminders(): {
  refereeReminders: number;
  consentReminders: number;
} {
  const pending = getPendingReferees();
  const now = new Date();
  let refereeReminders = 0;
  
  pending.forEach(referee => {
    if (!referee.invitedDate) return;
    
    const invitedDate = new Date(referee.invitedDate);
    const daysSinceInvite = Math.floor((now.getTime() - invitedDate.getTime()) / (1000 * 60 * 60 * 24));
    
    const lastReminderDate = referee.lastReminderDate ? new Date(referee.lastReminderDate) : null;
    const daysSinceLastReminder = lastReminderDate
      ? Math.floor((now.getTime() - lastReminderDate.getTime()) / (1000 * 60 * 60 * 24))
      : daysSinceInvite;
    
    // Get candidate name from background check
    const bgCheck = getBackgroundCheckById(referee.backgroundCheckId);
    const candidateName = bgCheck?.candidateName || 'Candidate';
    
    // Send first reminder after 3 days
    if (daysSinceInvite >= 3 && daysSinceInvite < 7 && !lastReminderDate) {
      console.log('Sending first reminder for referee:', referee.id);
      sendRefereeReminder(referee, candidateName, 1);
      refereeReminders++;
    }
    
    // Send second reminder after 7 days
    if (daysSinceInvite >= 7 && daysSinceLastReminder >= 4) {
      console.log('Sending second reminder for referee:', referee.id);
      sendRefereeReminder(referee, candidateName, 2);
      refereeReminders++;
    }
  });

  // Process consent reminders
  const consentReminders = processConsentReminders();
  
  return { refereeReminders, consentReminders };
}

export function processConsentReminders(): number {
  const consents = getConsentRequests();
  const now = new Date();
  let remindersSent = 0;
  
  consents
    .filter(c => c.status === 'sent' || c.status === 'viewed')
    .forEach(consent => {
      const sentDate = new Date(consent.sentDate);
      const daysSinceSent = Math.floor((now.getTime() - sentDate.getTime()) / (1000 * 60 * 60 * 24));
      
      const lastReminderDate = (consent as any).lastReminderDate 
        ? new Date((consent as any).lastReminderDate) 
        : null;
      const daysSinceLastReminder = lastReminderDate
        ? Math.floor((now.getTime() - lastReminderDate.getTime()) / (1000 * 60 * 60 * 24))
        : daysSinceSent;
      
      // Check if expired
      const expiryDate = new Date(consent.expiryDate);
      if (now > expiryDate) {
        updateConsent(consent.id, { status: 'expired' });
        return;
      }
      
      // Send first reminder after 3 days
      if (daysSinceSent >= 3 && daysSinceSent < 6 && !lastReminderDate) {
        console.log('Sending first consent reminder for:', consent.id);
        sendConsentReminder(consent, 1);
        remindersSent++;
      }
      
      // Send second reminder after 6 days
      if (daysSinceSent >= 6 && daysSinceLastReminder >= 3) {
        console.log('Sending second consent reminder for:', consent.id);
        sendConsentReminder(consent, 2);
        remindersSent++;
      }
    });
  
  return remindersSent;
}

export function markOverdueReferees(): void {
  const overdue = getOverdueReferees();
  
  overdue.forEach(referee => {
    if (referee.status !== 'overdue') {
      console.log('Marking referee as overdue:', referee.id);
      updateReferee(referee.id, { status: 'overdue' });
    }
  });
}

export function getReminderStats(): {
  pendingReminders: number;
  overdueCount: number;
  pendingConsents: number;
  overdueConsents: number;
} {
  const pending = getPendingReferees();
  const overdue = getOverdueReferees();
  
  const consents = getConsentRequests();
  const now = new Date();
  
  const pendingConsents = consents.filter(c => {
    if (c.status !== 'sent' && c.status !== 'viewed') return false;
    const sentDate = new Date(c.sentDate);
    const daysSinceSent = Math.floor((now.getTime() - sentDate.getTime()) / (1000 * 60 * 60 * 24));
    return daysSinceSent >= 3;
  }).length;

  const overdueConsents = consents.filter(c => {
    if (c.status !== 'sent' && c.status !== 'viewed') return false;
    const sentDate = new Date(c.sentDate);
    const daysSinceSent = Math.floor((now.getTime() - sentDate.getTime()) / (1000 * 60 * 60 * 24));
    return daysSinceSent >= 6;
  }).length;
  
  return {
    pendingReminders: pending.length,
    overdueCount: overdue.length,
    pendingConsents,
    overdueConsents
  };
}
