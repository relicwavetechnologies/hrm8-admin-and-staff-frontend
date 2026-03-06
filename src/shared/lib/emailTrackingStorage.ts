import { EmailLog, EmailEvent, EmailStats } from '@/shared/types/emailTracking';
import { mockEmailLogs, mockEmailEvents } from './mockEmailLogs';

const EMAIL_LOGS_KEY = 'email_logs';
const EMAIL_EVENTS_KEY = 'email_events';

export function getEmailLogs(): EmailLog[] {
  const stored = localStorage.getItem(EMAIL_LOGS_KEY);
  if (!stored) {
    localStorage.setItem(EMAIL_LOGS_KEY, JSON.stringify(mockEmailLogs));
    return mockEmailLogs;
  }
  return JSON.parse(stored);
}

export function getEmailLog(id: string): EmailLog | undefined {
  const logs = getEmailLogs();
  return logs.find(log => log.id === id);
}

export function saveEmailLog(log: EmailLog): void {
  const logs = getEmailLogs();
  const index = logs.findIndex(l => l.id === log.id);
  if (index >= 0) {
    logs[index] = log;
  } else {
    logs.push(log);
  }
  localStorage.setItem(EMAIL_LOGS_KEY, JSON.stringify(logs));
}

export function deleteEmailLog(id: string): void {
  const logs = getEmailLogs();
  const filtered = logs.filter(log => log.id !== id);
  localStorage.setItem(EMAIL_LOGS_KEY, JSON.stringify(filtered));
}

export function getEmailEvents(emailLogId?: string): EmailEvent[] {
  const stored = localStorage.getItem(EMAIL_EVENTS_KEY);
  let events: EmailEvent[] = [];
  
  if (!stored) {
    localStorage.setItem(EMAIL_EVENTS_KEY, JSON.stringify(mockEmailEvents));
    events = mockEmailEvents;
  } else {
    events = JSON.parse(stored);
  }
  
  if (emailLogId) {
    return events.filter(event => event.emailLogId === emailLogId);
  }
  return events;
}

export function addEmailEvent(event: EmailEvent): void {
  const events = getEmailEvents();
  events.push(event);
  localStorage.setItem(EMAIL_EVENTS_KEY, JSON.stringify(events));
}

export function getEmailStats(): EmailStats {
  const logs = getEmailLogs();
  const sent = logs.filter(log => log.status === 'sent');
  
  const totalSent = sent.length;
  const totalDelivered = sent.length; // In mock, all sent are delivered
  const totalOpened = sent.reduce((sum, log) => sum + (log.opens > 0 ? 1 : 0), 0);
  const totalClicked = sent.reduce((sum, log) => sum + (log.clicks > 0 ? 1 : 0), 0);
  const totalBounced = sent.reduce((sum, log) => sum + log.bounces.length, 0);
  const totalFailed = logs.filter(log => log.status === 'failed').length;
  
  return {
    totalSent,
    totalDelivered,
    totalOpened,
    totalClicked,
    totalBounced,
    totalFailed,
    openRate: totalSent > 0 ? (totalOpened / totalSent) * 100 : 0,
    clickRate: totalSent > 0 ? (totalClicked / totalSent) * 100 : 0,
    bounceRate: totalSent > 0 ? (totalBounced / totalSent) * 100 : 0,
    deliveryRate: totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0,
  };
}

export function getScheduledEmails(): EmailLog[] {
  const logs = getEmailLogs();
  return logs.filter(log => log.status === 'scheduled');
}

export function getRecentEmails(limit: number = 10): EmailLog[] {
  const logs = getEmailLogs();
  return logs
    .filter(log => log.status === 'sent')
    .sort((a, b) => new Date(b.sentAt || b.createdAt).getTime() - new Date(a.sentAt || a.createdAt).getTime())
    .slice(0, limit);
}

export function getDraftEmails(): EmailLog[] {
  const logs = getEmailLogs();
  return logs.filter(log => log.status === 'draft');
}

export function getFilteredEmails(filters: {
  status?: EmailLog['status'];
  dateFrom?: Date;
  dateTo?: Date;
}): EmailLog[] {
  let logs = getEmailLogs();

  if (filters.status) {
    logs = logs.filter(log => log.status === filters.status);
  }

  if (filters.dateFrom) {
    logs = logs.filter(log => {
      const logDate = new Date(log.sentAt || log.scheduledFor || log.createdAt);
      return logDate >= filters.dateFrom!;
    });
  }

  if (filters.dateTo) {
    logs = logs.filter(log => {
      const logDate = new Date(log.sentAt || log.scheduledFor || log.createdAt);
      return logDate <= filters.dateTo!;
    });
  }

  return logs.sort((a, b) => {
    const dateA = new Date(a.sentAt || a.scheduledFor || a.createdAt);
    const dateB = new Date(b.sentAt || b.scheduledFor || b.createdAt);
    return dateB.getTime() - dateA.getTime();
  });
}
