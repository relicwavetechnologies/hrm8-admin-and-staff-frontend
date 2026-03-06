import { Job } from "@/shared/types/job";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

export type ExportFormat = "csv" | "excel" | "pdf";

export function exportJobs(jobs: Job[], format: ExportFormat, filename: string = "jobs") {
  switch (format) {
    case "csv":
      exportToCSV(jobs, filename);
      break;
    case "excel":
      exportToExcel(jobs, filename);
      break;
    case "pdf":
      exportToPDF(jobs, filename);
      break;
  }
}

function exportToCSV(jobs: Job[], filename: string) {
  const headers = [
    "Job Code",
    "Title",
    "Department",
    "Location",
    "Employment Type",
    "Experience Level",
    "Status",
    "Applicants",
    "Posted Date",
  ];

  const rows = jobs.map((job) => [
    job.jobCode,
    job.title,
    job.department,
    job.location,
    job.employmentType,
    job.experienceLevel,
    job.status,
    job.applicantsCount,
    new Date(job.postingDate).toLocaleDateString(),
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
  ].join("\n");

  downloadFile(csvContent, `${filename}.csv`, "text/csv");
}

function exportToExcel(jobs: Job[], filename: string) {
  const data = jobs.map((job) => ({
    "Job Code": job.jobCode,
    Title: job.title,
    Department: job.department,
    Location: job.location,
    "Employment Type": job.employmentType,
    "Experience Level": job.experienceLevel,
    Status: job.status,
    Applicants: job.applicantsCount,
    Views: job.viewsCount,
    "Posted Date": new Date(job.postingDate).toLocaleDateString(),
    "Close Date": job.closeDate ? new Date(job.closeDate).toLocaleDateString() : "N/A",
    "Service Type": job.serviceType,
    Visibility: job.visibility,
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Jobs");

  // Auto-size columns
  const maxWidth = data.reduce((w, r) => Math.max(w, Object.keys(r).length), 10);
  worksheet["!cols"] = Array(maxWidth).fill({ wch: 15 });

  XLSX.writeFile(workbook, `${filename}.xlsx`);
}

function exportToPDF(jobs: Job[], filename: string) {
  const doc = new jsPDF();

  // Title
  doc.setFontSize(18);
  doc.text("Jobs Report", 14, 22);
  doc.setFontSize(11);
  doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, 30);

  // Table
  const tableData = jobs.map((job) => [
    job.jobCode,
    job.title,
    job.department,
    job.location,
    job.status,
    job.applicantsCount.toString(),
  ]);

  autoTable(doc, {
    startY: 35,
    head: [["Job Code", "Title", "Department", "Location", "Status", "Applicants"]],
    body: tableData,
    theme: "striped",
    headStyles: { fillColor: [79, 70, 229] },
  });

  doc.save(`${filename}.pdf`);
}

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

export function exportJobAnalytics(data: any, filename: string = "analytics") {
  const workbook = XLSX.utils.book_new();

  // Summary sheet
  const summary = [
    ["Metric", "Value"],
    ["Total Jobs", data.totalJobs],
    ["Open Jobs", data.openJobs],
    ["Total Applicants", data.totalApplicants],
    ["Average Time to Fill", `${data.avgTimeToFill} days`],
    ["Offer Acceptance Rate", `${data.offerAcceptanceRate}%`],
  ];
  const summarySheet = XLSX.utils.aoa_to_sheet(summary);
  XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");

  // Jobs by status
  if (data.jobsByStatus) {
    const statusData = Object.entries(data.jobsByStatus).map(([status, count]) => ({
      Status: status,
      Count: count,
    }));
    const statusSheet = XLSX.utils.json_to_sheet(statusData);
    XLSX.utils.book_append_sheet(workbook, statusSheet, "By Status");
  }

  XLSX.writeFile(workbook, `${filename}.xlsx`);
}
