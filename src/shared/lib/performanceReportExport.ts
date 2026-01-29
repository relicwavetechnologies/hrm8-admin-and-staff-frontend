import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import type { PerformanceGoal, PerformanceReview } from "@/shared/types/performance";
import type { Employee } from "@/shared/types/employee";
import { format } from "date-fns";

interface ExportData {
  goals: PerformanceGoal[];
  reviews: PerformanceReview[];
  includeKPIs: boolean;
  includeCharts: boolean;
  template: string;
  employees: Employee[];
}

export async function exportToPDF(data: ExportData): Promise<void> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPosition = 20;

  // Title
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("Performance Report", pageWidth / 2, yPosition, { align: "center" });
  yPosition += 10;

  // Date
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Generated: ${format(new Date(), "PPP")}`, pageWidth / 2, yPosition, { align: "center" });
  yPosition += 15;

  // Summary Statistics
  if (data.template === "comprehensive" || data.template === "summary") {
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Executive Summary", 14, yPosition);
    yPosition += 8;

    const totalGoals = data.goals.length;
    const completedGoals = data.goals.filter(g => g.status === "completed").length;
    const avgProgress = totalGoals > 0 
      ? Math.round(data.goals.reduce((sum, g) => sum + g.progress, 0) / totalGoals)
      : 0;
    const totalReviews = data.reviews.length;
    const completedReviews = data.reviews.filter(r => r.status === "completed").length;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const summaryData = [
      ["Total Goals", totalGoals.toString()],
      ["Completed Goals", completedGoals.toString()],
      ["Average Progress", `${avgProgress}%`],
      ["Completion Rate", `${totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0}%`],
      ["Total Reviews", totalReviews.toString()],
      ["Completed Reviews", completedReviews.toString()],
    ];

    autoTable(doc, {
      startY: yPosition,
      head: [["Metric", "Value"]],
      body: summaryData,
      theme: "grid",
      headStyles: { fillColor: [79, 70, 229] },
      margin: { left: 14, right: 14 },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;
  }

  // Goals Section
  if (data.goals.length > 0 && data.template !== "reviews-only") {
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Performance Goals", 14, yPosition);
    yPosition += 8;

    const goalsData = data.goals.map(goal => {
      const employee = data.employees.find(e => e.id === goal.employeeId);
      const employeeName = employee ? `${employee.firstName} ${employee.lastName}` : goal.employeeName;
      
      return [
        employeeName,
        goal.title.substring(0, 40) + (goal.title.length > 40 ? "..." : ""),
        goal.category || "N/A",
        goal.priority.toUpperCase(),
        goal.status.replace("-", " ").toUpperCase(),
        `${goal.progress}%`,
        format(new Date(goal.targetDate), "MMM dd, yyyy"),
      ];
    });

    autoTable(doc, {
      startY: yPosition,
      head: [["Employee", "Goal", "Category", "Priority", "Status", "Progress", "Target Date"]],
      body: goalsData,
      theme: "striped",
      headStyles: { fillColor: [79, 70, 229] },
      margin: { left: 14, right: 14 },
      styles: { fontSize: 8 },
      columnStyles: {
        1: { cellWidth: 50 },
      },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;

    // KPI Details
    if (data.includeKPIs && data.template !== "summary") {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Key Performance Indicators", 14, yPosition);
      yPosition += 8;

      const kpiData: any[] = [];
      data.goals.forEach(goal => {
        goal.kpis?.forEach(kpi => {
          const achievement = kpi.target > 0 ? Math.round((kpi.current / kpi.target) * 100) : 0;
          kpiData.push([
            goal.title.substring(0, 30) + (goal.title.length > 30 ? "..." : ""),
            kpi.name.substring(0, 30) + (kpi.name.length > 30 ? "..." : ""),
            `${kpi.current} ${kpi.unit}`,
            `${kpi.target} ${kpi.unit}`,
            `${achievement}%`,
          ]);
        });
      });

      if (kpiData.length > 0) {
        autoTable(doc, {
          startY: yPosition,
          head: [["Goal", "KPI", "Current", "Target", "Achievement"]],
          body: kpiData,
          theme: "striped",
          headStyles: { fillColor: [79, 70, 229] },
          margin: { left: 14, right: 14 },
          styles: { fontSize: 8 },
        });

        yPosition = (doc as any).lastAutoTable.finalY + 15;
      }
    }
  }

  // Reviews Section
  if (data.reviews.length > 0 && data.template !== "goals-only") {
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Performance Reviews", 14, yPosition);
    yPosition += 8;

    const reviewsData = data.reviews.map(review => {
      const employee = data.employees.find(e => e.id === review.employeeId);
      const employeeName = employee ? `${employee.firstName} ${employee.lastName}` : review.employeeName;
      
      return [
        employeeName,
        review.templateName,
        format(new Date(review.reviewPeriodStart), "MMM yyyy") + " - " + format(new Date(review.reviewPeriodEnd), "MMM yyyy"),
        review.status.toUpperCase(),
        review.overallRating ? review.overallRating.toFixed(1) : "N/A",
        review.completedDate ? format(new Date(review.completedDate), "MMM dd, yyyy") : "Pending",
      ];
    });

    autoTable(doc, {
      startY: yPosition,
      head: [["Employee", "Template", "Period", "Status", "Rating", "Completed"]],
      body: reviewsData,
      theme: "striped",
      headStyles: { fillColor: [79, 70, 229] },
      margin: { left: 14, right: 14 },
      styles: { fontSize: 8 },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: "center" }
    );
  }

  // Save
  doc.save(`performance-report-${format(new Date(), "yyyy-MM-dd")}.pdf`);
}

export async function exportToExcel(data: ExportData): Promise<void> {
  const workbook = XLSX.utils.book_new();

  // Summary Sheet
  const summaryData = [
    ["Performance Report Summary"],
    ["Generated", format(new Date(), "PPP")],
    [""],
    ["Metric", "Value"],
    ["Total Goals", data.goals.length],
    ["Completed Goals", data.goals.filter(g => g.status === "completed").length],
    ["Average Progress", `${data.goals.length > 0 ? Math.round(data.goals.reduce((sum, g) => sum + g.progress, 0) / data.goals.length) : 0}%`],
    ["Total Reviews", data.reviews.length],
    ["Completed Reviews", data.reviews.filter(r => r.status === "completed").length],
  ];
  
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");

  // Goals Sheet
  if (data.goals.length > 0) {
    const goalsData = data.goals.map(goal => {
      const employee = data.employees.find(e => e.id === goal.employeeId);
      const employeeName = employee ? `${employee.firstName} ${employee.lastName}` : goal.employeeName;
      
      return {
        Employee: employeeName,
        Title: goal.title,
        Description: goal.description,
        Category: goal.category || "N/A",
        Priority: goal.priority,
        Status: goal.status,
        Progress: `${goal.progress}%`,
        "Start Date": format(new Date(goal.startDate), "yyyy-MM-dd"),
        "Target Date": format(new Date(goal.targetDate), "yyyy-MM-dd"),
        "Completed Date": goal.completedDate ? format(new Date(goal.completedDate), "yyyy-MM-dd") : "",
      };
    });

    const goalsSheet = XLSX.utils.json_to_sheet(goalsData);
    XLSX.utils.book_append_sheet(workbook, goalsSheet, "Goals");
  }

  // KPIs Sheet
  if (data.includeKPIs && data.goals.length > 0) {
    const kpiData: any[] = [];
    data.goals.forEach(goal => {
      const employee = data.employees.find(e => e.id === goal.employeeId);
      const employeeName = employee ? `${employee.firstName} ${employee.lastName}` : goal.employeeName;
      
      goal.kpis?.forEach(kpi => {
        const achievement = kpi.target > 0 ? Math.round((kpi.current / kpi.target) * 100) : 0;
        kpiData.push({
          Employee: employeeName,
          Goal: goal.title,
          "KPI Name": kpi.name,
          Description: kpi.description || "",
          Current: kpi.current,
          Target: kpi.target,
          Unit: kpi.unit,
          Achievement: `${achievement}%`,
        });
      });
    });

    if (kpiData.length > 0) {
      const kpisSheet = XLSX.utils.json_to_sheet(kpiData);
      XLSX.utils.book_append_sheet(workbook, kpisSheet, "KPIs");
    }
  }

  // Reviews Sheet
  if (data.reviews.length > 0) {
    const reviewsData = data.reviews.map(review => {
      const employee = data.employees.find(e => e.id === review.employeeId);
      const employeeName = employee ? `${employee.firstName} ${employee.lastName}` : review.employeeName;
      
      return {
        Employee: employeeName,
        Reviewer: review.reviewerName,
        Template: review.templateName,
        "Period Start": format(new Date(review.reviewPeriodStart), "yyyy-MM-dd"),
        "Period End": format(new Date(review.reviewPeriodEnd), "yyyy-MM-dd"),
        Status: review.status,
        "Overall Rating": review.overallRating || "N/A",
        "Due Date": format(new Date(review.dueDate), "yyyy-MM-dd"),
        "Completed Date": review.completedDate ? format(new Date(review.completedDate), "yyyy-MM-dd") : "",
        Strengths: review.strengths || "",
        "Areas for Improvement": review.areasForImprovement || "",
        "Manager Comments": review.managerComments || "",
      };
    });

    const reviewsSheet = XLSX.utils.json_to_sheet(reviewsData);
    XLSX.utils.book_append_sheet(workbook, reviewsSheet, "Reviews");
  }

  // Save
  XLSX.writeFile(workbook, `performance-report-${format(new Date(), "yyyy-MM-dd")}.xlsx`);
}
