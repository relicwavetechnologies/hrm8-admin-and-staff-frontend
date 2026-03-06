import { SalesOpportunity } from "@/shared/types/salesOpportunity";
import { SalesCommission } from "@/shared/types/salesCommission";
import * as XLSX from "xlsx";
import { isWithinInterval, parseISO } from "date-fns";
import { formatCurrency } from '@/shared/lib/currencyUtils';

export type SalesExportFormat = "csv" | "excel";

export interface ExportOptions {
  fields?: string[];
  dateRange?: {
    from: Date | undefined;
    to: Date | undefined;
  };
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString();
}

// Export Sales Opportunities
export function exportOpportunities(
  opportunities: SalesOpportunity[],
  format: SalesExportFormat,
  filename: string = "sales-opportunities",
  options?: ExportOptions
) {
  // Apply date range filter
  let filteredOpportunities = opportunities;
  if (options?.dateRange?.from || options?.dateRange?.to) {
    filteredOpportunities = opportunities.filter((opp) => {
      const oppDate = parseISO(opp.createdAt);
      if (options.dateRange?.from && options.dateRange?.to) {
        return isWithinInterval(oppDate, { start: options.dateRange.from, end: options.dateRange.to });
      } else if (options.dateRange?.from) {
        return oppDate >= options.dateRange.from;
      } else if (options.dateRange?.to) {
        return oppDate <= options.dateRange.to;
      }
      return true;
    });
  }

  const fullData = filteredOpportunities.map((opp) => ({
    name: opp.name,
    employerName: opp.employerName,
    salesAgentName: opp.salesAgentName,
    type: opp.type,
    productType: opp.productType,
    estimatedValue: formatCurrency(opp.estimatedValue),
    probability: `${opp.probability}%`,
    stage: opp.stage,
    priority: opp.priority,
    leadSource: opp.leadSource,
    expectedCloseDate: formatDate(opp.expectedCloseDate),
    createdAt: formatDate(opp.createdAt),
    nextSteps: opp.nextSteps || "N/A",
    notes: opp.notes || "N/A",
  }));

  const fieldMapping: Record<string, string> = {
    name: "Opportunity Name",
    employerName: "Employer",
    salesAgentName: "Sales Agent",
    type: "Type",
    productType: "Product Type",
    estimatedValue: "Estimated Value",
    probability: "Probability",
    stage: "Stage",
    priority: "Priority",
    leadSource: "Lead Source",
    expectedCloseDate: "Expected Close Date",
    createdAt: "Created Date",
    nextSteps: "Next Steps",
    notes: "Notes",
  };

  const data = filterFields(fullData, options?.fields, fieldMapping);

  if (format === "csv") {
    exportToCSV(data, filename);
  } else {
    exportToExcel(data, filename, "Opportunities");
  }
}

// Export Sales Commissions
export function exportCommissions(
  commissions: SalesCommission[],
  format: SalesExportFormat,
  filename: string = "sales-commissions",
  options?: ExportOptions
) {
  // Apply date range filter
  let filteredCommissions = commissions;
  if (options?.dateRange?.from || options?.dateRange?.to) {
    filteredCommissions = commissions.filter((comm) => {
      const commDate = parseISO(comm.calculatedAt);
      if (options.dateRange?.from && options.dateRange?.to) {
        return isWithinInterval(commDate, { start: options.dateRange.from, end: options.dateRange.to });
      } else if (options.dateRange?.from) {
        return commDate >= options.dateRange.from;
      } else if (options.dateRange?.to) {
        return commDate <= options.dateRange.to;
      }
      return true;
    });
  }

  const fullData = filteredCommissions.map((comm) => ({
    salesAgentName: comm.salesAgentName,
    opportunityName: comm.opportunityName,
    employerName: comm.employerName,
    dealValue: formatCurrency(comm.dealValue),
    commissionRate: `${comm.commissionRate}%`,
    commissionAmount: formatCurrency(comm.commissionAmount),
    status: comm.status,
    calculatedAt: formatDate(comm.calculatedAt),
    approvedAt: comm.approvedAt ? formatDate(comm.approvedAt) : "N/A",
    paidAt: comm.paidAt ? formatDate(comm.paidAt) : "N/A",
    paymentMethod: comm.paymentMethod || "N/A",
    notes: comm.notes || "N/A",
  }));

  const fieldMapping: Record<string, string> = {
    salesAgentName: "Sales Agent",
    opportunityName: "Opportunity",
    employerName: "Employer",
    dealValue: "Deal Value",
    commissionRate: "Commission Rate",
    commissionAmount: "Commission Amount",
    status: "Status",
    calculatedAt: "Calculated At",
    approvedAt: "Approved At",
    paidAt: "Paid At",
    paymentMethod: "Payment Method",
    notes: "Notes",
  };

  const data = filterFields(fullData, options?.fields, fieldMapping);

  if (format === "csv") {
    exportToCSV(data, filename);
  } else {
    exportToExcel(data, filename, "Commissions");
  }
}

// Export Forecast Data
export function exportForecast(
  opportunities: SalesOpportunity[],
  format: SalesExportFormat,
  filename: string = "sales-forecast",
  options?: ExportOptions
) {
  // Apply date range filter
  let filteredOpportunities = opportunities;
  if (options?.dateRange?.from || options?.dateRange?.to) {
    filteredOpportunities = opportunities.filter((opp) => {
      const oppDate = parseISO(opp.expectedCloseDate);
      if (options.dateRange?.from && options.dateRange?.to) {
        return isWithinInterval(oppDate, { start: options.dateRange.from, end: options.dateRange.to });
      } else if (options.dateRange?.from) {
        return oppDate >= options.dateRange.from;
      } else if (options.dateRange?.to) {
        return oppDate <= options.dateRange.to;
      }
      return true;
    });
  }

  const fullData = filteredOpportunities.map((opp) => ({
    name: opp.name,
    employerName: opp.employerName,
    salesAgentName: opp.salesAgentName,
    estimatedValue: formatCurrency(opp.estimatedValue),
    weightedValue: formatCurrency(opp.estimatedValue * (opp.probability / 100)),
    probability: `${opp.probability}%`,
    stage: opp.stage,
    expectedCloseDate: formatDate(opp.expectedCloseDate),
    priority: opp.priority,
  }));

  const fieldMapping: Record<string, string> = {
    name: "Opportunity",
    employerName: "Employer",
    salesAgentName: "Sales Agent",
    estimatedValue: "Estimated Value",
    weightedValue: "Weighted Value",
    probability: "Probability",
    stage: "Stage",
    expectedCloseDate: "Expected Close",
    priority: "Priority",
  };

  const data = filterFields(fullData, options?.fields, fieldMapping);

  if (format === "csv") {
    exportToCSV(data, filename);
  } else {
    exportToExcel(data, filename, "Forecast");
  }
}

// Helper function to filter fields
function filterFields(
  data: any[],
  selectedFields: string[] | undefined,
  fieldMapping: Record<string, string>
): any[] {
  if (!selectedFields || selectedFields.length === 0) {
    // Return all fields with proper labels
    return data.map(row => {
      const labeledRow: any = {};
      Object.entries(row).forEach(([key, value]) => {
        labeledRow[fieldMapping[key] || key] = value;
      });
      return labeledRow;
    });
  }

  // Return only selected fields with proper labels
  return data.map(row => {
    const filteredRow: any = {};
    selectedFields.forEach(field => {
      if (field in row) {
        filteredRow[fieldMapping[field] || field] = row[field];
      }
    });
    return filteredRow;
  });
}

// Generic CSV Export
function exportToCSV(data: any[], filename: string) {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(","),
    ...data.map((row) =>
      headers.map((header) => {
        const value = row[header];
        // Handle values that contain commas
        if (typeof value === "string" && (value.includes(",") || value.includes("\n"))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(",")
    ),
  ].join("\n");

  downloadFile(csvContent, `${filename}.csv`, "text/csv");
}

// Generic Excel Export
function exportToExcel(data: any[], filename: string, sheetName: string) {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  // Auto-size columns
  // const maxWidth = 50;
  const cols = Object.keys(data[0] || {}).map(() => ({ wch: 20 }));
  worksheet["!cols"] = cols;

  XLSX.writeFile(workbook, `${filename}.xlsx`);
}

// Helper function to download files
function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
