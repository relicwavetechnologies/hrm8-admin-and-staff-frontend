import { useState, useEffect, useCallback } from 'react';
import type { InterviewReport } from '@/shared/types/aiInterviewReport';
import {
  getInterviewReports,
  getInterviewReportById,
  saveInterviewReport,
  updateInterviewReport,
  deleteInterviewReport
} from '@/shared/lib/aiInterview/aiInterviewReportStorage';

export function useInterviewReports() {
  const [reports, setReports] = useState<InterviewReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = useCallback(() => {
    const data = getInterviewReports();
    setReports(data);
    setLoading(false);
  }, []);

  const createReport = useCallback((report: InterviewReport) => {
    saveInterviewReport(report);
    loadReports();
  }, [loadReports]);

  const updateReport = useCallback((id: string, updates: Partial<InterviewReport>) => {
    updateInterviewReport(id, updates);
    loadReports();
  }, [loadReports]);

  const removeReport = useCallback((id: string) => {
    deleteInterviewReport(id);
    loadReports();
  }, [loadReports]);

  return {
    reports,
    loading,
    createReport,
    updateReport,
    removeReport,
    refreshReports: loadReports
  };
}

export function useInterviewReport(reportId: string) {
  const [report, setReport] = useState<InterviewReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReport();
  }, [reportId]);

  const loadReport = useCallback(() => {
    const data = getInterviewReportById(reportId);
    setReport(data || null);
    setLoading(false);
  }, [reportId]);

  const updateReport = useCallback((updates: Partial<InterviewReport>) => {
    updateInterviewReport(reportId, updates);
    loadReport();
  }, [reportId, loadReport]);

  return {
    report,
    loading,
    updateReport,
    refreshReport: loadReport
  };
}
