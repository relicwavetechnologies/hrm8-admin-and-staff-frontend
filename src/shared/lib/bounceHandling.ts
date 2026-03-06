export interface BounceRecord {
  id: string;
  email: string;
  bounceType: 'hard' | 'soft' | 'complaint';
  reason: string;
  timestamp: Date;
  emailId?: string;
  count: number;
}

export interface EmailHealthStatus {
  email: string;
  status: 'healthy' | 'warning' | 'blocked';
  softBounces: number;
  hardBounces: number;
  complaints: number;
  lastBounce?: Date;
  isBlocked: boolean;
  riskScore: number; // 0-100, higher is riskier
}

const STORAGE_KEY = "bounce_records";
const HEALTH_STATUS_KEY = "email_health_status";

// Thresholds
const HARD_BOUNCE_BLOCK_THRESHOLD = 1; // Block after 1 hard bounce
const SOFT_BOUNCE_WARNING_THRESHOLD = 3; // Warning after 3 soft bounces
const SOFT_BOUNCE_BLOCK_THRESHOLD = 5; // Block after 5 soft bounces
const COMPLAINT_BLOCK_THRESHOLD = 1; // Block after 1 complaint

export function getBounceRecords(): BounceRecord[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return [];
    const records = JSON.parse(saved);
    return records.map((r: any) => ({
      ...r,
      timestamp: new Date(r.timestamp),
    }));
  } catch (error) {
    console.error("Error loading bounce records:", error);
    return [];
  }
}

export function getEmailHealthStatuses(): EmailHealthStatus[] {
  try {
    const saved = localStorage.getItem(HEALTH_STATUS_KEY);
    if (!saved) return [];
    const statuses = JSON.parse(saved);
    return statuses.map((s: any) => ({
      ...s,
      lastBounce: s.lastBounce ? new Date(s.lastBounce) : undefined,
    }));
  } catch (error) {
    console.error("Error loading email health statuses:", error);
    return [];
  }
}

export function recordBounce(
  email: string,
  bounceType: 'hard' | 'soft' | 'complaint',
  reason: string,
  emailId?: string
): BounceRecord {
  const records = getBounceRecords();
  // const statuses = getEmailHealthStatuses();

  // Create bounce record
  const bounceRecord: BounceRecord = {
    id: `bounce-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    email,
    bounceType,
    reason,
    timestamp: new Date(),
    emailId,
    count: 1,
  };

  records.push(bounceRecord);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));

  // Update health status
  updateEmailHealthStatus(email);

  return bounceRecord;
}

function updateEmailHealthStatus(email: string): void {
  const records = getBounceRecords();
  const statuses = getEmailHealthStatuses();

  const emailBounces = records.filter(r => r.email === email);
  const softBounces = emailBounces.filter(r => r.bounceType === 'soft').length;
  const hardBounces = emailBounces.filter(r => r.bounceType === 'hard').length;
  const complaints = emailBounces.filter(r => r.bounceType === 'complaint').length;
  const lastBounce = emailBounces.length > 0
    ? emailBounces[emailBounces.length - 1].timestamp
    : undefined;

  // Determine blocking status
  const isBlocked =
    hardBounces >= HARD_BOUNCE_BLOCK_THRESHOLD ||
    softBounces >= SOFT_BOUNCE_BLOCK_THRESHOLD ||
    complaints >= COMPLAINT_BLOCK_THRESHOLD;

  // Calculate risk score
  let riskScore = 0;
  riskScore += hardBounces * 50; // Hard bounces are very serious
  riskScore += softBounces * 10; // Soft bounces add up
  riskScore += complaints * 60; // Complaints are critical
  riskScore = Math.min(100, riskScore); // Cap at 100

  // Determine status
  let status: EmailHealthStatus['status'] = 'healthy';
  if (isBlocked) {
    status = 'blocked';
  } else if (softBounces >= SOFT_BOUNCE_WARNING_THRESHOLD || riskScore > 30) {
    status = 'warning';
  }

  const healthStatus: EmailHealthStatus = {
    email,
    status,
    softBounces,
    hardBounces,
    complaints,
    lastBounce,
    isBlocked,
    riskScore,
  };

  // Update or add status
  const existingIndex = statuses.findIndex(s => s.email === email);
  if (existingIndex >= 0) {
    statuses[existingIndex] = healthStatus;
  } else {
    statuses.push(healthStatus);
  }

  localStorage.setItem(HEALTH_STATUS_KEY, JSON.stringify(statuses));
}

export function getEmailHealthStatus(email: string): EmailHealthStatus | null {
  const statuses = getEmailHealthStatuses();
  return statuses.find(s => s.email === email) || null;
}

export function canSendToEmail(email: string): boolean {
  const status = getEmailHealthStatus(email);
  return !status || !status.isBlocked;
}

export function cleanEmailList(emails: string[]): {
  valid: string[];
  blocked: string[];
  warnings: string[];
} {
  const valid: string[] = [];
  const blocked: string[] = [];
  const warnings: string[] = [];

  emails.forEach(email => {
    const status = getEmailHealthStatus(email);
    if (!status || status.status === 'healthy') {
      valid.push(email);
    } else if (status.status === 'blocked') {
      blocked.push(email);
    } else if (status.status === 'warning') {
      warnings.push(email);
      valid.push(email); // Still allow sending but with warning
    }
  });

  return { valid, blocked, warnings };
}

export function unblockEmail(email: string): void {
  const statuses = getEmailHealthStatuses();
  const status = statuses.find(s => s.email === email);

  if (status) {
    status.isBlocked = false;
    status.status = 'healthy';
    status.riskScore = 0;
    localStorage.setItem(HEALTH_STATUS_KEY, JSON.stringify(statuses));
  }
}

export function clearBounceHistory(email: string): void {
  const records = getBounceRecords();
  const filtered = records.filter(r => r.email !== email);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));

  const statuses = getEmailHealthStatuses();
  const filteredStatuses = statuses.filter(s => s.email !== email);
  localStorage.setItem(HEALTH_STATUS_KEY, JSON.stringify(filteredStatuses));
}

export function getBounceStatistics() {
  const records = getBounceRecords();
  const statuses = getEmailHealthStatuses();

  const totalBounces = records.length;
  const hardBounces = records.filter(r => r.bounceType === 'hard').length;
  const softBounces = records.filter(r => r.bounceType === 'soft').length;
  const complaints = records.filter(r => r.bounceType === 'complaint').length;
  const blockedEmails = statuses.filter(s => s.isBlocked).length;
  const warningEmails = statuses.filter(s => s.status === 'warning').length;

  return {
    totalBounces,
    hardBounces,
    softBounces,
    complaints,
    blockedEmails,
    warningEmails,
    healthyEmails: statuses.filter(s => s.status === 'healthy').length,
  };
}
