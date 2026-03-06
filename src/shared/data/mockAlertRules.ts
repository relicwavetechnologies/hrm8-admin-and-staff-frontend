import { AlertRule } from '@/shared/types/notificationPreferences';

export const MOCK_ALERT_RULES: AlertRule[] = [
  {
    id: 'rule-001',
    name: 'Critical Support Ticket Alert',
    description: 'Send immediate alerts when urgent support tickets are created',
    enabled: true,
    eventType: 'support_ticket_urgent',
    conditions: [
      {
        field: 'priority',
        operator: 'equals',
        value: 'urgent',
      },
    ],
    actions: {
      channels: ['email', 'in-app', 'sms'],
      recipients: ['admin@hrm8.com', 'support@hrm8.com'],
      priority: 'critical',
    },
    createdAt: new Date('2024-01-15').toISOString(),
    updatedAt: new Date('2024-01-15').toISOString(),
    createdBy: 'super-admin',
  },
  {
    id: 'rule-002',
    name: 'Payment Failure Notification',
    description: 'Alert finance team when customer payments fail',
    enabled: true,
    eventType: 'payment_failed',
    conditions: [
      {
        field: 'amount',
        operator: 'greater_than',
        value: 100,
      },
    ],
    actions: {
      channels: ['email', 'in-app'],
      recipients: ['finance@hrm8.com', 'admin@hrm8.com'],
      priority: 'high',
    },
    createdAt: new Date('2024-01-10').toISOString(),
    updatedAt: new Date('2024-01-10').toISOString(),
    createdBy: 'super-admin',
  },
  {
    id: 'rule-003',
    name: 'Integration Down Alert',
    description: 'Notify tech team when any integration goes offline',
    enabled: true,
    eventType: 'integration_down',
    conditions: [],
    actions: {
      channels: ['email', 'in-app', 'slack'],
      recipients: ['tech@hrm8.com', 'devops@hrm8.com'],
      priority: 'critical',
    },
    createdAt: new Date('2024-01-08').toISOString(),
    updatedAt: new Date('2024-01-12').toISOString(),
    createdBy: 'super-admin',
  },
  {
    id: 'rule-004',
    name: 'Trial Expiry Reminder',
    description: 'Notify sales team 3 days before trial expires',
    enabled: true,
    eventType: 'trial_expiring',
    conditions: [
      {
        field: 'days_remaining',
        operator: 'less_than',
        value: 4,
      },
    ],
    actions: {
      channels: ['email'],
      recipients: ['sales@hrm8.com'],
      priority: 'medium',
    },
    createdAt: new Date('2024-01-05').toISOString(),
    updatedAt: new Date('2024-01-05').toISOString(),
    createdBy: 'super-admin',
  },
  {
    id: 'rule-005',
    name: 'Security Alert',
    description: 'Immediate notification for any security incidents',
    enabled: true,
    eventType: 'security_alert',
    conditions: [],
    actions: {
      channels: ['email', 'in-app', 'sms'],
      recipients: ['security@hrm8.com', 'admin@hrm8.com', 'cto@hrm8.com'],
      priority: 'critical',
    },
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date('2024-01-01').toISOString(),
    createdBy: 'super-admin',
  },
];

// Initialize localStorage with mock data if empty
export function initializeMockAlertRules() {
  const stored = localStorage.getItem('platform_alert_rules');
  if (!stored) {
    localStorage.setItem('platform_alert_rules', JSON.stringify(MOCK_ALERT_RULES));
  }
}
