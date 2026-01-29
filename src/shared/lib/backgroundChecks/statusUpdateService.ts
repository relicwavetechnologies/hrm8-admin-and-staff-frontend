import type { BackgroundCheck } from '@/shared/types/backgroundCheck';
import { updateBackgroundCheck, getBackgroundCheckById } from '../mockBackgroundCheckStorage';
import { createNotification } from '@/shared/lib/notificationStorage';
import { logStatusChange } from './digestService';
import { recordStatusChange } from './statusHistoryService';

type StatusTransition = {
  from: BackgroundCheck['status'];
  to: BackgroundCheck['status'];
  condition: (check: BackgroundCheck) => boolean;
  notificationMessage: (check: BackgroundCheck) => string;
};

const statusTransitions: StatusTransition[] = [
  {
    from: 'pending-consent',
    to: 'in-progress',
    condition: (check) => check.consentGiven === true,
    notificationMessage: (check) => 
      `Background check for ${check.candidateName} has moved to In Progress after consent was received.`
  },
  {
    from: 'in-progress',
    to: 'completed',
    condition: (check) => {
      // Check if all check types have results
      const allCheckTypesHaveResults = check.checkTypes.every(checkType => 
        check.results.some(result => result.checkType === checkType.type)
      );
      
      // Check if all results are complete
      const allResultsComplete = check.results.every(result => 
        result.status === 'clear' || result.status === 'review-required' || result.status === 'not-clear'
      );
      
      return allCheckTypesHaveResults && allResultsComplete && check.results.length > 0;
    },
    notificationMessage: (check) => 
      `Background check for ${check.candidateName} has been completed. Review the results now.`
  },
  {
    from: 'in-progress',
    to: 'issues-found',
    condition: (check) => {
      // Check if any result is not-clear
      return check.results.some(result => result.status === 'not-clear');
    },
    notificationMessage: (check) => 
      `Issues found in background check for ${check.candidateName}. Immediate review required.`
  }
];

export function autoUpdateCheckStatus(checkId: string): void {
  const check = getBackgroundCheckById(checkId);
  if (!check) return;

  const currentStatus = check.status;

  // Find applicable transition
  const transition = statusTransitions.find(t => 
    t.from === check.status && t.condition(check)
  );

  if (transition) {
    // Update status
    const updates: Partial<BackgroundCheck> = {
      status: transition.to
    };

    // Set completed date if moving to completed or issues-found
    if (transition.to === 'completed' || transition.to === 'issues-found') {
      updates.completedDate = new Date().toISOString();
    }

    // Calculate overall status for completed checks
    if (transition.to === 'completed' || transition.to === 'issues-found') {
      updates.overallStatus = calculateOverallStatus(check);
    }

    updateBackgroundCheck(checkId, updates);

    // Log status change for digest
    logStatusChange({
      checkId: check.id,
      candidateName: check.candidateName,
      previousStatus: currentStatus,
      newStatus: transition.to,
      changedAt: new Date().toISOString()
    });

    // Record status change history
    recordStatusChange(
      check.id,
      check.candidateId,
      check.candidateName,
      currentStatus,
      transition.to,
      'system',
      'Automated System',
      'Automated status transition',
      undefined,
      true
    );

    // Send notification to initiator
    sendStatusChangeNotification(check, transition.to, transition.notificationMessage(check));
  }
}

function calculateOverallStatus(check: BackgroundCheck): 'clear' | 'conditional' | 'not-clear' {
  const hasNotClear = check.results.some(r => r.status === 'not-clear');
  const hasReviewRequired = check.results.some(r => r.status === 'review-required');
  
  if (hasNotClear) return 'not-clear';
  if (hasReviewRequired) return 'conditional';
  return 'clear';
}

function sendStatusChangeNotification(
  check: BackgroundCheck, 
  newStatus: BackgroundCheck['status'],
  message: string
): void {
  createNotification({
    userId: check.initiatedBy,
    category: 'document' as const,
    type: newStatus === 'issues-found' ? 'error' as const : 
          newStatus === 'completed' ? 'success' as const : 'info' as const,
    priority: newStatus === 'issues-found' ? 'high' as const : 
              newStatus === 'completed' ? 'medium' as const : 'low' as const,
    title: `Background Check Status Update`,
    message,
    link: `/background-checks/${check.id}`,
    read: false,
    archived: false,
    metadata: {
      entityType: 'background-check',
      entityId: check.id,
      candidateId: check.candidateId,
      previousStatus: check.status,
      newStatus
    }
  });
}

export function handleConsentReceived(checkId: string): void {
  const check = getBackgroundCheckById(checkId);
  if (!check) return;

  // Update consent status
  updateBackgroundCheck(checkId, {
    consentGiven: true,
    consentDate: new Date().toISOString(),
    status: 'in-progress'
  });

  // Send notification
  sendStatusChangeNotification(
    check,
    'in-progress',
    `${check.candidateName} has provided consent. Background check is now in progress.`
  );
}

export function handleCheckResultAdded(checkId: string): void {
  // Auto-update status when a check result is added
  autoUpdateCheckStatus(checkId);
}

export function handleAllChecksCompleted(checkId: string): void {
  // Auto-update status when all checks are completed
  autoUpdateCheckStatus(checkId);
}

export function cancelCheck(checkId: string, cancelledBy: string, reason?: string): void {
  const check = getBackgroundCheckById(checkId);
  if (!check) return;

  updateBackgroundCheck(checkId, {
    status: 'cancelled',
    reviewNotes: reason || 'Check cancelled',
    reviewedBy: cancelledBy,
    updatedAt: new Date().toISOString()
  });

  // Send notification
  sendStatusChangeNotification(
    check,
    'cancelled',
    `Background check for ${check.candidateName} has been cancelled.`
  );
}
