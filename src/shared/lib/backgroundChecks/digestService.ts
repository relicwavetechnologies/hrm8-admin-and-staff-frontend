import type { BackgroundCheck } from '@/shared/types/backgroundCheck';
import { getBackgroundChecks } from '../mockBackgroundCheckStorage';

export type DigestFrequency = 'daily' | 'weekly' | 'disabled';

export interface DigestPreferences {
  userId: string;
  frequency: DigestFrequency;
  includeStatusChanges: boolean;
  includePendingActions: boolean;
  includeOverdueItems: boolean;
  emailAddress: string;
  lastSentAt?: string;
}

export interface StatusChange {
  checkId: string;
  candidateName: string;
  previousStatus: BackgroundCheck['status'];
  newStatus: BackgroundCheck['status'];
  changedAt: string;
}

export interface PendingAction {
  checkId: string;
  candidateName: string;
  actionType: 'pending-consent' | 'overdue-referee' | 'requires-review' | 'incomplete-check';
  description: string;
  daysPending: number;
  priority: 'low' | 'medium' | 'high';
}

export interface DigestData {
  userId: string;
  period: { from: string; to: string };
  statusChanges: StatusChange[];
  pendingActions: PendingAction[];
  summary: {
    totalChecks: number;
    completedChecks: number;
    inProgressChecks: number;
    issuesFound: number;
    pendingConsent: number;
  };
}

// Mock storage for digest preferences
const DIGEST_PREFS_KEY = 'hrm8_digest_preferences';
const STATUS_CHANGES_KEY = 'hrm8_status_changes_log';

function getDigestPreferences(): DigestPreferences[] {
  const data = localStorage.getItem(DIGEST_PREFS_KEY);
  return data ? JSON.parse(data) : [];
}

export function getUserDigestPreferences(userId: string): DigestPreferences | undefined {
  return getDigestPreferences().find(p => p.userId === userId);
}

export function saveDigestPreferences(prefs: DigestPreferences): void {
  const allPrefs = getDigestPreferences();
  const index = allPrefs.findIndex(p => p.userId === prefs.userId);
  
  if (index !== -1) {
    allPrefs[index] = prefs;
  } else {
    allPrefs.push(prefs);
  }
  
  localStorage.setItem(DIGEST_PREFS_KEY, JSON.stringify(allPrefs));
}

// Log status changes for digest
export function logStatusChange(change: StatusChange): void {
  const changes = getStatusChangesLog();
  changes.push(change);
  localStorage.setItem(STATUS_CHANGES_KEY, JSON.stringify(changes));
}

function getStatusChangesLog(): StatusChange[] {
  const data = localStorage.getItem(STATUS_CHANGES_KEY);
  return data ? JSON.parse(data) : [];
}

// Generate digest data for a user
export function generateDigestData(userId: string, frequency: DigestFrequency): DigestData {
  const now = new Date();
  const fromDate = new Date(now);
  
  // Calculate period based on frequency
  if (frequency === 'daily') {
    fromDate.setDate(fromDate.getDate() - 1);
  } else if (frequency === 'weekly') {
    fromDate.setDate(fromDate.getDate() - 7);
  }
  
  // Get all checks
  const allChecks = getBackgroundChecks();
  
  // Get status changes within period
  const statusChanges = getStatusChangesLog().filter(change => {
    const changeDate = new Date(change.changedAt);
    return changeDate >= fromDate && changeDate <= now;
  });
  
  // Get pending actions
  const pendingActions = getPendingActions(allChecks);
  
  // Calculate summary
  const summary = {
    totalChecks: allChecks.length,
    completedChecks: allChecks.filter(c => c.status === 'completed').length,
    inProgressChecks: allChecks.filter(c => c.status === 'in-progress').length,
    issuesFound: allChecks.filter(c => c.status === 'issues-found').length,
    pendingConsent: allChecks.filter(c => c.status === 'pending-consent').length,
  };
  
  return {
    userId,
    period: {
      from: fromDate.toISOString(),
      to: now.toISOString()
    },
    statusChanges,
    pendingActions,
    summary
  };
}

function getPendingActions(checks: BackgroundCheck[]): PendingAction[] {
  const now = new Date();
  const actions: PendingAction[] = [];
  
  checks.forEach(check => {
    // Pending consent
    if (check.status === 'pending-consent') {
      const daysPending = Math.floor(
        (now.getTime() - new Date(check.initiatedDate).getTime()) / (1000 * 60 * 60 * 24)
      );
      
      actions.push({
        checkId: check.id,
        candidateName: check.candidateName,
        actionType: 'pending-consent',
        description: 'Waiting for candidate consent',
        daysPending,
        priority: daysPending > 7 ? 'high' : daysPending > 3 ? 'medium' : 'low'
      });
    }
    
    // Requires review
    if (check.status === 'issues-found' && !check.reviewedBy) {
      const daysPending = Math.floor(
        (now.getTime() - new Date(check.completedDate || check.initiatedDate).getTime()) / (1000 * 60 * 60 * 24)
      );
      
      actions.push({
        checkId: check.id,
        candidateName: check.candidateName,
        actionType: 'requires-review',
        description: 'Issues found - requires review',
        daysPending,
        priority: 'high'
      });
    }
    
    // Incomplete checks (in-progress for too long)
    if (check.status === 'in-progress') {
      const daysPending = Math.floor(
        (now.getTime() - new Date(check.initiatedDate).getTime()) / (1000 * 60 * 60 * 24)
      );
      
      if (daysPending > 14) {
        actions.push({
          checkId: check.id,
          candidateName: check.candidateName,
          actionType: 'incomplete-check',
          description: `In progress for ${daysPending} days`,
          daysPending,
          priority: daysPending > 30 ? 'high' : 'medium'
        });
      }
    }
  });
  
  return actions.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}

// Send digest email (mock implementation)
export function sendDigestEmail(userId: string, digestData: DigestData): void {
  const prefs = getUserDigestPreferences(userId);
  if (!prefs || prefs.frequency === 'disabled') return;
  
  const emailHtml = generateDigestEmailHtml(digestData, prefs);
  
  // Mock email sending
  console.log('📧 Sending digest email to:', prefs.emailAddress);
  console.log('Digest data:', digestData);
  console.log('Email HTML:', emailHtml);
  
  // Update last sent timestamp
  saveDigestPreferences({
    ...prefs,
    lastSentAt: new Date().toISOString()
  });
}

function generateDigestEmailHtml(data: DigestData, prefs: DigestPreferences): string {
  const { summary, statusChanges, pendingActions } = data;
  const frequency = prefs.frequency === 'daily' ? 'Daily' : 'Weekly';
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; }
        .section { margin: 20px 0; padding: 15px; border: 1px solid #e0e0e0; border-radius: 8px; }
        .summary-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
        .stat-card { padding: 10px; background: #f5f5f5; border-radius: 4px; text-align: center; }
        .stat-value { font-size: 24px; font-weight: bold; color: #667eea; }
        .stat-label { font-size: 12px; color: #666; }
        .change-item, .action-item { padding: 10px; margin: 5px 0; border-left: 3px solid #667eea; background: #f9f9f9; }
        .priority-high { border-left-color: #ef4444; }
        .priority-medium { border-left-color: #f59e0b; }
        .priority-low { border-left-color: #10b981; }
        .badge { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold; }
        .badge-success { background: #dcfce7; color: #166534; }
        .badge-warning { background: #fef3c7; color: #92400e; }
        .badge-danger { background: #fee2e2; color: #991b1b; }
        .btn { display: inline-block; padding: 10px 20px; background: #667eea; color: white; text-decoration: none; border-radius: 4px; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${frequency} Background Checks Digest</h1>
          <p>${new Date(data.period.from).toLocaleDateString()} - ${new Date(data.period.to).toLocaleDateString()}</p>
        </div>
        
        ${prefs.includeStatusChanges ? `
        <div class="section">
          <h2>📊 Summary Statistics</h2>
          <div class="summary-grid">
            <div class="stat-card">
              <div class="stat-value">${summary.totalChecks}</div>
              <div class="stat-label">Total Checks</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${summary.completedChecks}</div>
              <div class="stat-label">Completed</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${summary.inProgressChecks}</div>
              <div class="stat-label">In Progress</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${summary.issuesFound}</div>
              <div class="stat-label">Issues Found</div>
            </div>
          </div>
        </div>
        ` : ''}
        
        ${prefs.includeStatusChanges && statusChanges.length > 0 ? `
        <div class="section">
          <h2>🔄 Status Changes (${statusChanges.length})</h2>
          ${statusChanges.slice(0, 10).map(change => `
            <div class="change-item">
              <strong>${change.candidateName}</strong>
              <br>
              <span class="badge badge-warning">${change.previousStatus}</span>
              →
              <span class="badge badge-success">${change.newStatus}</span>
              <br>
              <small>${new Date(change.changedAt).toLocaleString()}</small>
            </div>
          `).join('')}
          ${statusChanges.length > 10 ? `<p><small>...and ${statusChanges.length - 10} more changes</small></p>` : ''}
        </div>
        ` : ''}
        
        ${prefs.includePendingActions && pendingActions.length > 0 ? `
        <div class="section">
          <h2>⚠️ Pending Actions (${pendingActions.length})</h2>
          ${pendingActions.slice(0, 10).map(action => `
            <div class="action-item priority-${action.priority}">
              <strong>${action.candidateName}</strong>
              <span class="badge badge-${action.priority === 'high' ? 'danger' : action.priority === 'medium' ? 'warning' : 'success'}">${action.priority.toUpperCase()}</span>
              <br>
              ${action.description}
              <br>
              <small>Pending for ${action.daysPending} days</small>
            </div>
          `).join('')}
          ${pendingActions.length > 10 ? `<p><small>...and ${pendingActions.length - 10} more actions</small></p>` : ''}
        </div>
        ` : ''}
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${window.location.origin}/background-checks" class="btn">View All Background Checks</a>
        </div>
        
        <div class="footer">
          <p>You're receiving this ${frequency.toLowerCase()} digest because you're subscribed to background check notifications.</p>
          <p><a href="${window.location.origin}/settings/notifications">Manage your notification preferences</a></p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Check and send digests (would be scheduled, but we'll trigger manually for now)
export function processPendingDigests(): void {
  const allPrefs = getDigestPreferences();
  const now = new Date();
  
  allPrefs.forEach(prefs => {
    if (prefs.frequency === 'disabled') return;
    
    const shouldSend = shouldSendDigest(prefs, now);
    
    if (shouldSend) {
      const digestData = generateDigestData(prefs.userId, prefs.frequency);
      
      // Only send if there's meaningful content
      if (digestData.statusChanges.length > 0 || digestData.pendingActions.length > 0) {
        sendDigestEmail(prefs.userId, digestData);
      }
    }
  });
}

function shouldSendDigest(prefs: DigestPreferences, now: Date): boolean {
  if (!prefs.lastSentAt) return true;
  
  const lastSent = new Date(prefs.lastSentAt);
  const hoursSinceLastSent = (now.getTime() - lastSent.getTime()) / (1000 * 60 * 60);
  
  if (prefs.frequency === 'daily') {
    return hoursSinceLastSent >= 24;
  } else if (prefs.frequency === 'weekly') {
    return hoursSinceLastSent >= 168; // 7 days
  }
  
  return false;
}
