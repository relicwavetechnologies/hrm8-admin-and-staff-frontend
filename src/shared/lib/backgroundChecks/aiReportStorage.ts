import type { EditableReport } from '@/shared/types/aiReferenceReport';

const AI_REPORTS_KEY = 'hrm8_ai_reports';

function initializeStorage() {
  if (!localStorage.getItem(AI_REPORTS_KEY)) {
    localStorage.setItem(AI_REPORTS_KEY, JSON.stringify([]));
  }
}

export function saveAIReport(report: EditableReport): void {
  initializeStorage();
  const reports = getAIReports();
  
  // Check if report already exists and update it
  const existingIndex = reports.findIndex(r => r.id === report.id);
  if (existingIndex !== -1) {
    reports[existingIndex] = {
      ...report,
      updatedAt: new Date().toISOString(),
    };
  } else {
    reports.push(report);
  }
  
  localStorage.setItem(AI_REPORTS_KEY, JSON.stringify(reports));
}

export function getAIReports(): EditableReport[] {
  initializeStorage();
  const data = localStorage.getItem(AI_REPORTS_KEY);
  return data ? JSON.parse(data) : [];
}

export function getReportById(reportId: string): EditableReport | undefined {
  return getAIReports().find(r => r.id === reportId);
}

export function getReportBySessionId(sessionId: string): EditableReport | undefined {
  return getAIReports().find(r => r.sessionId === sessionId);
}

export function getReportsByCandidateId(candidateId: string): EditableReport[] {
  const allReports = getAIReports();
  return allReports.filter(r => r.summary.candidateId === candidateId);
}

export function updateAIReport(reportId: string, updates: Partial<EditableReport>): void {
  const reports = getAIReports();
  const index = reports.findIndex(r => r.id === reportId);
  
  if (index !== -1) {
    reports[index] = {
      ...reports[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(AI_REPORTS_KEY, JSON.stringify(reports));
  }
}

export function deleteAIReport(reportId: string): void {
  const reports = getAIReports();
  const filtered = reports.filter(r => r.id !== reportId);
  localStorage.setItem(AI_REPORTS_KEY, JSON.stringify(filtered));
}

export function finalizeReport(reportId: string, finalizedBy: string): void {
  updateAIReport(reportId, {
    status: 'finalized',
    summary: {
      ...getReportById(reportId)!.summary,
      lastEditedBy: finalizedBy,
      lastEditedAt: new Date().toISOString(),
    },
  });
}

export function getReportsByStatus(status: EditableReport['status']): EditableReport[] {
  return getAIReports().filter(r => r.status === status);
}

export function getDraftReports(): EditableReport[] {
  return getReportsByStatus('draft');
}

export function getReviewedReports(): EditableReport[] {
  return getReportsByStatus('reviewed');
}

export function getFinalizedReports(): EditableReport[] {
  return getReportsByStatus('finalized');
}

export function getRecentReports(limit: number = 10): EditableReport[] {
  return getAIReports()
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, limit);
}

export function searchReports(query: string): EditableReport[] {
  const lowerQuery = query.toLowerCase();
  return getAIReports().filter(r => 
    r.summary.candidateName.toLowerCase().includes(lowerQuery) ||
    r.summary.refereeInfo.name.toLowerCase().includes(lowerQuery) ||
    r.summary.executiveSummary.toLowerCase().includes(lowerQuery)
  );
}

export function getReportStats() {
  const reports = getAIReports();
  return {
    total: reports.length,
    draft: reports.filter(r => r.status === 'draft').length,
    reviewed: reports.filter(r => r.status === 'reviewed').length,
    finalized: reports.filter(r => r.status === 'finalized').length,
    avgRecommendationScore: reports.length > 0
      ? reports.reduce((sum, r) => sum + r.summary.recommendation.overallScore, 0) / reports.length
      : 0,
  };
}
