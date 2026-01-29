import * as XLSX from 'xlsx';
import type { Assessment } from '@/shared/types/assessment';

interface ExportOptions {
  format: 'csv' | 'excel';
  filename?: string;
}

export function exportAssessments(
  assessments: Assessment[],
  options: ExportOptions = { format: 'excel' }
) {
  // Prepare data for export
  const exportData = assessments.map(assessment => ({
    'Assessment ID': assessment.id,
    'Candidate Name': assessment.candidateName,
    'Candidate Email': assessment.candidateEmail,
    'Assessment Type': formatAssessmentType(assessment.assessmentType),
    'Provider': assessment.provider.toUpperCase(),
    'Status': formatStatus(assessment.status),
    'Overall Score': assessment.overallScore !== undefined ? `${assessment.overallScore}%` : 'N/A',
    'Category Score': assessment.result?.score !== undefined ? `${assessment.result.score}%` : 'N/A',
    'Pass/Fail': assessment.passed !== undefined ? (assessment.passed ? 'Pass' : 'Fail') : 'Pending',
    'Invited By': assessment.invitedByName,
    'Invited Date': new Date(assessment.invitedDate).toLocaleDateString(),
    'Completed Date': assessment.completedDate ? new Date(assessment.completedDate).toLocaleDateString() : 'N/A',
    'Expiry Date': new Date(assessment.expiryDate).toLocaleDateString(),
    'Time Spent (min)': assessment.result?.timeSpent || 'N/A',
    'Pass Threshold': `${assessment.passThreshold}%`,
    'Job Title': assessment.jobTitle || 'N/A',
    'Billed To': assessment.billedToName || 'N/A',
    'Country': assessment.country || 'N/A',
    'Region': assessment.region || 'N/A',
    'Cost': `$${assessment.cost}`,
    'Payment Status': assessment.paymentStatus,
    'Reminders Sent': assessment.remindersSent,
  }));

  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(exportData);

  // Set column widths
  const columnWidths = [
    { wch: 15 }, // Assessment ID
    { wch: 20 }, // Candidate Name
    { wch: 25 }, // Candidate Email
    { wch: 20 }, // Assessment Type
    { wch: 15 }, // Provider
    { wch: 15 }, // Status
    { wch: 12 }, // Overall Score
    { wch: 12 }, // Category Score
    { wch: 10 }, // Pass/Fail
    { wch: 20 }, // Invited By
    { wch: 15 }, // Invited Date
    { wch: 15 }, // Completed Date
    { wch: 15 }, // Expiry Date
    { wch: 15 }, // Time Spent
    { wch: 15 }, // Pass Threshold
    { wch: 20 }, // Job Title
    { wch: 20 }, // Billed To
    { wch: 15 }, // Country
    { wch: 15 }, // Region
    { wch: 12 }, // Cost
    { wch: 15 }, // Payment Status
    { wch: 15 }, // Reminders Sent
  ];
  worksheet['!cols'] = columnWidths;

  // Generate filename
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = options.filename || `assessments_export_${timestamp}`;

  if (options.format === 'csv') {
    // Export as CSV
    const csv = XLSX.utils.sheet_to_csv(worksheet);
    downloadFile(csv, `${filename}.csv`, 'text/csv');
  } else {
    // Export as Excel
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Assessments');
    
    // Add summary sheet
    const summaryData = generateSummaryData(assessments);
    const summaryWorksheet = XLSX.utils.json_to_sheet(summaryData);
    summaryWorksheet['!cols'] = [{ wch: 25 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(workbook, summaryWorksheet, 'Summary');

    // Write file
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  }

  return {
    recordCount: assessments.length,
    filename: options.format === 'csv' ? `${filename}.csv` : `${filename}.xlsx`,
  };
}

function formatAssessmentType(type: string): string {
  const typeMap: Record<string, string> = {
    'cognitive': 'Cognitive Ability',
    'personality': 'Personality & Behavioral',
    'technical-skills': 'Technical Skills',
    'situational-judgment': 'Situational Judgment',
    'behavioral': 'Behavioral',
    'culture-fit': 'Culture Fit',
    'custom': 'Custom Assessment',
  };
  return typeMap[type] || type;
}

function formatStatus(status: string): string {
  const statusMap: Record<string, string> = {
    'draft': 'Draft',
    'pending-invitation': 'Pending Invitation',
    'invited': 'Invited',
    'in-progress': 'In Progress',
    'completed': 'Completed',
    'expired': 'Expired',
    'cancelled': 'Cancelled',
  };
  return statusMap[status] || status;
}

function generateSummaryData(assessments: Assessment[]) {
  const total = assessments.length;
  const completed = assessments.filter(a => a.status === 'completed').length;
  const inProgress = assessments.filter(a => a.status === 'in-progress').length;
  const invited = assessments.filter(a => a.status === 'invited').length;
  const passed = assessments.filter(a => a.passed === true).length;
  const failed = assessments.filter(a => a.passed === false).length;
  
  const completedAssessments = assessments.filter(a => a.overallScore !== undefined);
  const avgScore = completedAssessments.length > 0
    ? Math.round(completedAssessments.reduce((sum, a) => sum + (a.overallScore || 0), 0) / completedAssessments.length)
    : 0;

  const typeBreakdown = assessments.reduce((acc, a) => {
    acc[a.assessmentType] = (acc[a.assessmentType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return [
    { Metric: 'Total Assessments', Value: total },
    { Metric: 'Completed', Value: completed },
    { Metric: 'In Progress', Value: inProgress },
    { Metric: 'Invited', Value: invited },
    { Metric: 'Passed', Value: passed },
    { Metric: 'Failed', Value: failed },
    { Metric: 'Average Score', Value: `${avgScore}%` },
    { Metric: '', Value: '' },
    { Metric: 'Assessment Type Breakdown', Value: '' },
    ...Object.entries(typeBreakdown).map(([type, count]) => ({
      Metric: `  ${formatAssessmentType(type)}`,
      Value: count,
    })),
  ];
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
