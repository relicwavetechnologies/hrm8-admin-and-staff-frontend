import { getAIInterviewSessions } from './aiInterviewStorage';
import { getInterviewReports, getReportComments } from './aiInterviewReportStorage';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate data integrity for AI Interview module
 */
export function validateAIInterviewData(): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const sessions = getAIInterviewSessions();
  const reports = getInterviewReports();
  const comments = getReportComments();

  // Validate sessions
  sessions.forEach(session => {
    // Check required fields
    if (!session.id || !session.candidateId || !session.jobId) {
      errors.push(`Session ${session.id || 'unknown'} missing required fields`);
    }

    // Check date consistency
    if (session.startedAt && session.completedAt) {
      const started = new Date(session.startedAt).getTime();
      const completed = new Date(session.completedAt).getTime();
      if (completed < started) {
        errors.push(`Session ${session.id}: completedAt before startedAt`);
      }
    }

    // Check completed sessions have analysis
    if (session.status === 'completed' && !session.analysis) {
      warnings.push(`Completed session ${session.id} missing analysis`);
    }

    // Check report linkage
    if (session.reportId) {
      const report = reports.find(r => r.id === session.reportId);
      if (!report) {
        errors.push(`Session ${session.id} references non-existent report ${session.reportId}`);
      }
    }
  });

  // Validate reports
  reports.forEach(report => {
    // Check required fields
    if (!report.id || !report.sessionId || !report.candidateId) {
      errors.push(`Report ${report.id || 'unknown'} missing required fields`);
    }

    // Check session linkage
    const session = sessions.find(s => s.id === report.sessionId);
    if (!session) {
      errors.push(`Report ${report.id} references non-existent session ${report.sessionId}`);
    } else {
      // Verify data consistency between session and report
      if (session.candidateId !== report.candidateId) {
        errors.push(`Report ${report.id} candidateId mismatch with session`);
      }
      if (session.jobId !== report.jobId) {
        errors.push(`Report ${report.id} jobId mismatch with session`);
      }
    }

    // Check finalized reports have required data
    if (report.status === 'finalized') {
      if (!report.finalizedAt || !report.finalizedBy) {
        warnings.push(`Finalized report ${report.id} missing finalization metadata`);
      }
    }
  });

  // Validate comments
  comments.forEach(comment => {
    // Check required fields
    if (!comment.id || !comment.reportId || !comment.userId) {
      errors.push(`Comment ${comment.id || 'unknown'} missing required fields`);
    }

    // Check report linkage
    const report = reports.find(r => r.id === comment.reportId);
    if (!report) {
      errors.push(`Comment ${comment.id} references non-existent report ${comment.reportId}`);
    }

    // Check parent comment exists for replies
    if (comment.parentId) {
      const parentComment = comments.find(c => c.id === comment.parentId);
      if (!parentComment) {
        errors.push(`Comment ${comment.id} references non-existent parent ${comment.parentId}`);
      }
    }
  });

  // Check for orphaned reports
  const sessionsWithReports = new Set(reports.map(r => r.sessionId));
  const completedSessions = sessions.filter(s => s.status === 'completed');
  completedSessions.forEach(session => {
    if (!sessionsWithReports.has(session.id) && session.analysis) {
      warnings.push(`Completed session ${session.id} should have a report`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Get validation summary as string
 */
export function getValidationSummary(): string {
  const result = validateAIInterviewData();
  
  let summary = `AI Interview Data Validation\n`;
  summary += `Status: ${result.isValid ? '✓ Valid' : '✗ Invalid'}\n\n`;
  
  if (result.errors.length > 0) {
    summary += `Errors (${result.errors.length}):\n`;
    result.errors.forEach(error => summary += `  • ${error}\n`);
    summary += '\n';
  }
  
  if (result.warnings.length > 0) {
    summary += `Warnings (${result.warnings.length}):\n`;
    result.warnings.forEach(warning => summary += `  • ${warning}\n`);
  }
  
  if (result.isValid && result.warnings.length === 0) {
    summary += 'All data validated successfully!';
  }
  
  return summary;
}

/**
 * Check for orphaned records
 */
export function findOrphanedRecords() {
  const sessions = getAIInterviewSessions();
  const reports = getInterviewReports();
  const comments = getReportComments();

  const sessionIds = new Set(sessions.map(s => s.id));
  const reportIds = new Set(reports.map(r => r.id));

  return {
    orphanedReports: reports.filter(r => !sessionIds.has(r.sessionId)),
    orphanedComments: comments.filter(c => !reportIds.has(c.reportId)),
    sessionsWithoutReports: sessions.filter(s => 
      s.status === 'completed' && s.analysis && !s.reportId
    )
  };
}
