import { Notification } from '@/shared/types/notification';
import { format } from 'date-fns';

export function exportNotificationsToCSV(notifications: Notification[]): string {
  const headers = [
    'ID',
    'Title',
    'Message',
    'Category',
    'Type',
    'Priority',
    'Read',
    'Archived',
    'Created At',
    'Read At',
    'Link',
  ];

  const rows = notifications.map(n => [
    n.id,
    `"${n.title.replace(/"/g, '""')}"`,
    `"${n.message.replace(/"/g, '""')}"`,
    n.category,
    n.type,
    n.priority,
    n.read ? 'Yes' : 'No',
    n.archived ? 'Yes' : 'No',
    format(new Date(n.createdAt), 'yyyy-MM-dd HH:mm:ss'),
    n.readAt ? format(new Date(n.readAt), 'yyyy-MM-dd HH:mm:ss') : '',
    n.link || '',
  ]);

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  return csv;
}

export function exportNotificationsToJSON(notifications: Notification[]): string {
  return JSON.stringify(notifications, null, 2);
}

export function downloadCSV(csv: string, filename: string) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

export function downloadJSON(json: string, filename: string) {
  const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

export interface NotificationReport {
  period: string;
  totalNotifications: number;
  unreadNotifications: number;
  readRate: number;
  avgTimeToRead: string;
  byCategory: Record<string, number>;
  byPriority: Record<string, number>;
  byType: Record<string, number>;
  topActions: Array<{ action: string; count: number }>;
}

export function generateNotificationReport(
  notifications: Notification[],
  period: string
): NotificationReport {
  const total = notifications.length;
  const unread = notifications.filter(n => !n.read).length;
  const read = notifications.filter(n => n.read);

  // Calculate average time to read
  const readTimes = read
    .filter(n => n.readAt)
    .map(n => {
      const created = new Date(n.createdAt).getTime();
      const readAt = new Date(n.readAt!).getTime();
      return readAt - created;
    });

  const avgTimeMs = readTimes.length > 0
    ? readTimes.reduce((sum, time) => sum + time, 0) / readTimes.length
    : 0;

  const hours = Math.floor(avgTimeMs / (1000 * 60 * 60));
  const minutes = Math.floor((avgTimeMs % (1000 * 60 * 60)) / (1000 * 60));

  // Count by category
  const byCategory: Record<string, number> = {};
  notifications.forEach(n => {
    byCategory[n.category] = (byCategory[n.category] || 0) + 1;
  });

  // Count by priority
  const byPriority: Record<string, number> = {};
  notifications.forEach(n => {
    byPriority[n.priority] = (byPriority[n.priority] || 0) + 1;
  });

  // Count by type
  const byType: Record<string, number> = {};
  notifications.forEach(n => {
    byType[n.type] = (byType[n.type] || 0) + 1;
  });

  // Top actions
  const actionCounts: Record<string, number> = {};
  notifications.forEach(n => {
    if (n.actionType) {
      actionCounts[n.actionType] = (actionCounts[n.actionType] || 0) + 1;
    }
  });

  const topActions = Object.entries(actionCounts)
    .map(([action, count]) => ({ action, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    period,
    totalNotifications: total,
    unreadNotifications: unread,
    readRate: total > 0 ? ((read.length / total) * 100) : 0,
    avgTimeToRead: `${hours}h ${minutes}m`,
    byCategory,
    byPriority,
    byType,
    topActions,
  };
}

export function exportReportToMarkdown(report: NotificationReport): string {
  const md = `
# Notification Report - ${report.period}

## Summary
- **Total Notifications**: ${report.totalNotifications}
- **Unread Notifications**: ${report.unreadNotifications}
- **Read Rate**: ${report.readRate.toFixed(1)}%
- **Average Time to Read**: ${report.avgTimeToRead}

## By Category
${Object.entries(report.byCategory)
      .map(([cat, count]) => `- **${cat}**: ${count}`)
      .join('\n')}

## By Priority
${Object.entries(report.byPriority)
      .map(([pri, count]) => `- **${pri}**: ${count}`)
      .join('\n')}

## By Type
${Object.entries(report.byType)
      .map(([type, count]) => `- **${type}**: ${count}`)
      .join('\n')}

## Top Actions
${report.topActions
      .map((action, i) => `${i + 1}. **${action.action}**: ${action.count}`)
      .join('\n')}
`;

  return md.trim();
}
