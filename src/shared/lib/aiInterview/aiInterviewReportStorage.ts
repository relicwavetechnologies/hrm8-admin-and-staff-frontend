import type { InterviewReport, ReportComment, ReportVersion, ReportShare } from '@/shared/types/aiInterviewReport';

const REPORTS_KEY = 'hrm8_ai_interview_reports';
const COMMENTS_KEY = 'hrm8_ai_interview_comments';
const VERSIONS_KEY = 'hrm8_ai_interview_versions';
const SHARES_KEY = 'hrm8_ai_interview_shares';

function initializeStorage(key: string) {
  if (!localStorage.getItem(key)) {
    localStorage.setItem(key, JSON.stringify([]));
  }
}

// Reports
export function saveInterviewReport(report: InterviewReport): void {
  initializeStorage(REPORTS_KEY);
  const reports = getInterviewReports();
  const existingIndex = reports.findIndex(r => r.id === report.id);
  
  if (existingIndex >= 0) {
    reports[existingIndex] = { ...report, updatedAt: new Date().toISOString() };
  } else {
    reports.push(report);
  }
  
  localStorage.setItem(REPORTS_KEY, JSON.stringify(reports));
}

export function getInterviewReports(): InterviewReport[] {
  initializeStorage(REPORTS_KEY);
  const data = localStorage.getItem(REPORTS_KEY);
  return data ? JSON.parse(data) : [];
}

export function getInterviewReportById(id: string): InterviewReport | undefined {
  return getInterviewReports().find(report => report.id === id);
}

export function getInterviewReportBySession(sessionId: string): InterviewReport | undefined {
  return getInterviewReports().find(report => report.sessionId === sessionId);
}

export function updateInterviewReport(id: string, updates: Partial<InterviewReport>): void {
  const reports = getInterviewReports();
  const index = reports.findIndex(r => r.id === id);
  
  if (index >= 0) {
    reports[index] = {
      ...reports[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(REPORTS_KEY, JSON.stringify(reports));
  }
}

export function deleteInterviewReport(id: string): void {
  const reports = getInterviewReports();
  const filtered = reports.filter(r => r.id !== id);
  localStorage.setItem(REPORTS_KEY, JSON.stringify(filtered));
}

// Comments
export function saveReportComment(comment: ReportComment): void {
  initializeStorage(COMMENTS_KEY);
  const comments = getReportComments();
  comments.push(comment);
  localStorage.setItem(COMMENTS_KEY, JSON.stringify(comments));
}

export function getReportComments(): ReportComment[] {
  initializeStorage(COMMENTS_KEY);
  const data = localStorage.getItem(COMMENTS_KEY);
  return data ? JSON.parse(data) : [];
}

export function getCommentsByReport(reportId: string): ReportComment[] {
  return getReportComments().filter(c => c.reportId === reportId && !c.parentId);
}

export function updateReportComment(id: string, content: string): void {
  const comments = getReportComments();
  const index = comments.findIndex(c => c.id === id);
  
  if (index >= 0) {
    comments[index] = {
      ...comments[index],
      content,
      updatedAt: new Date().toISOString(),
      isEdited: true
    };
    localStorage.setItem(COMMENTS_KEY, JSON.stringify(comments));
  }
}

export function deleteReportComment(id: string): void {
  const comments = getReportComments();
  const filtered = comments.filter(c => c.id !== id);
  localStorage.setItem(COMMENTS_KEY, JSON.stringify(filtered));
}

// Versions
export function saveReportVersion(version: ReportVersion & { reportId: string }): void {
  initializeStorage(VERSIONS_KEY);
  const versions = getReportVersions();
  versions.push(version);
  localStorage.setItem(VERSIONS_KEY, JSON.stringify(versions));
}

export function getReportVersions(): Array<ReportVersion & { reportId: string }> {
  initializeStorage(VERSIONS_KEY);
  const data = localStorage.getItem(VERSIONS_KEY);
  return data ? JSON.parse(data) : [];
}

export function getVersionsByReport(reportId: string): ReportVersion[] {
  return getReportVersions().filter(v => v.reportId === reportId);
}

// Shares
export function saveReportShare(share: ReportShare): void {
  initializeStorage(SHARES_KEY);
  const shares = getReportShares();
  shares.push(share);
  localStorage.setItem(SHARES_KEY, JSON.stringify(shares));
}

export function getReportShares(): ReportShare[] {
  initializeStorage(SHARES_KEY);
  const data = localStorage.getItem(SHARES_KEY);
  return data ? JSON.parse(data) : [];
}

export function getShareByToken(token: string): ReportShare | undefined {
  return getReportShares().find(s => s.shareToken === token);
}

export function getSharesByReport(reportId: string): ReportShare[] {
  return getReportShares().filter(s => s.reportId === reportId);
}
