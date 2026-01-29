import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { formatCurrency as formatCurrencyUtil } from './currencyUtils';

interface ConsultantPerformance {
  id: string;
  name: string;
  specialization: string;
  totalPlacements: number;
  successRate: number;
  clientSatisfaction: number;
  avgTimeToFill: number;
  activePositions: number;
  revenue: number;
  rating: number;
  trend: 'up' | 'down' | 'stable';
}

interface ExportOptions {
  includeCharts: boolean;
  includeRankings: boolean;
  includeMetrics: boolean;
  includeTrends: boolean;
}

export function exportToExcel(
  consultants: ConsultantPerformance[],
  options: ExportOptions,
  filename: string = 'consultant-performance-report'
) {
  const workbook = XLSX.utils.book_new();

  // Summary Sheet
  const summaryData = [
    ['Consultant Performance Report'],
    ['Generated:', new Date().toLocaleDateString()],
    [''],
    ['Summary Statistics'],
    ['Total Consultants:', consultants.length],
    ['Total Placements:', consultants.reduce((acc, c) => acc + c.totalPlacements, 0)],
    ['Average Success Rate:', `${(consultants.reduce((acc, c) => acc + c.successRate, 0) / consultants.length).toFixed(1)}%`],
    ['Average Satisfaction:', (consultants.reduce((acc, c) => acc + c.clientSatisfaction, 0) / consultants.length).toFixed(2)],
    ['Total Revenue:', formatCurrencyUtil(consultants.reduce((acc, c) => acc + c.revenue, 0))],
  ];
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

  // Rankings Sheet
  if (options.includeRankings) {
    const rankingsData = [
      ['Rank', 'Name', 'Specialization', 'Overall Rating', 'Performance Level', 'Trend']
    ];
    
    consultants.forEach((consultant, index) => {
      const performanceLevel = 
        consultant.rating >= 95 ? 'Exceptional' :
        consultant.rating >= 90 ? 'Excellent' :
        consultant.rating >= 85 ? 'Good' : 'Needs Improvement';
      
      rankingsData.push([
        (index + 1).toString(),
        consultant.name,
        consultant.specialization,
        consultant.rating.toString(),
        performanceLevel,
        consultant.trend.toUpperCase()
      ]);
    });

    const rankingsSheet = XLSX.utils.aoa_to_sheet(rankingsData);
    XLSX.utils.book_append_sheet(workbook, rankingsSheet, 'Rankings');
  }

  // Detailed Metrics Sheet
  if (options.includeMetrics) {
    const metricsData = [
      [
        'Name',
        'Specialization',
        'Total Placements',
        'Success Rate (%)',
        'Client Satisfaction',
        'Avg Time to Fill (days)',
        'Active Positions',
        'Revenue ($)',
        'Overall Rating'
      ]
    ];

    consultants.forEach((consultant) => {
      metricsData.push([
        consultant.name,
        consultant.specialization,
        consultant.totalPlacements.toString(),
        consultant.successRate.toString(),
        consultant.clientSatisfaction.toString(),
        consultant.avgTimeToFill.toString(),
        consultant.activePositions.toString(),
        consultant.revenue.toString(),
        consultant.rating.toString()
      ]);
    });

    const metricsSheet = XLSX.utils.aoa_to_sheet(metricsData);
    XLSX.utils.book_append_sheet(workbook, metricsSheet, 'Detailed Metrics');
  }

  // Performance Analysis Sheet
  if (options.includeTrends) {
    const analysisData = [
      ['Performance Analysis'],
      [''],
      ['High Performers (Rating >= 95)'],
      ['Name', 'Rating', 'Placements', 'Satisfaction']
    ];

    const highPerformers = consultants.filter(c => c.rating >= 95);
    highPerformers.forEach(c => {
      analysisData.push([c.name, c.rating.toString(), c.totalPlacements.toString(), c.clientSatisfaction.toString()]);
    });

    analysisData.push(['']);
    analysisData.push(['Top 5 by Revenue']);
    analysisData.push(['Name', 'Revenue', 'Placements']);

    const topByRevenue = [...consultants].sort((a, b) => b.revenue - a.revenue).slice(0, 5);
    topByRevenue.forEach(c => {
      analysisData.push([c.name, c.revenue.toString(), c.totalPlacements.toString()]);
    });

    const analysisSheet = XLSX.utils.aoa_to_sheet(analysisData);
    XLSX.utils.book_append_sheet(workbook, analysisSheet, 'Analysis');
  }

  // Export the file
  XLSX.writeFile(workbook, `${filename}.xlsx`);
}

export function exportToPDF(
  consultants: ConsultantPerformance[],
  options: ExportOptions,
  filename: string = 'consultant-performance-report'
) {
  const doc = new jsPDF();
  let yPosition = 20;

  // Title
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Consultant Performance Report', 105, yPosition, { align: 'center' });
  
  yPosition += 10;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 105, yPosition, { align: 'center' });
  
  yPosition += 15;

  // Summary Statistics
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Summary Statistics', 14, yPosition);
  
  yPosition += 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  const summaryStats = [
    `Total Consultants: ${consultants.length}`,
    `Total Placements: ${consultants.reduce((acc, c) => acc + c.totalPlacements, 0)}`,
    `Average Success Rate: ${(consultants.reduce((acc, c) => acc + c.successRate, 0) / consultants.length).toFixed(1)}%`,
    `Average Satisfaction: ${(consultants.reduce((acc, c) => acc + c.clientSatisfaction, 0) / consultants.length).toFixed(2)}/5.0`,
    `Total Revenue: ${formatCurrencyUtil(consultants.reduce((acc, c) => acc + c.revenue, 0))}`
  ];

  summaryStats.forEach(stat => {
    doc.text(stat, 14, yPosition);
    yPosition += 6;
  });

  // Rankings Table
  if (options.includeRankings) {
    yPosition += 10;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Consultant Rankings', 14, yPosition);
    yPosition += 5;

    const rankingsTableData = consultants.map((consultant, index) => {
      const performanceLevel = 
        consultant.rating >= 95 ? 'Exceptional' :
        consultant.rating >= 90 ? 'Excellent' :
        consultant.rating >= 85 ? 'Good' : 'Needs Improvement';
      
      return [
        `#${index + 1}`,
        consultant.name,
        consultant.specialization,
        `${consultant.rating}/100`,
        performanceLevel
      ];
    });

    autoTable(doc, {
      startY: yPosition,
      head: [['Rank', 'Name', 'Specialization', 'Rating', 'Level']],
      body: rankingsTableData,
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229] },
      styles: { fontSize: 9 },
      margin: { left: 14, right: 14 }
    });

    yPosition = (doc as any).lastAutoTable.finalY + 10;
  }

  // Detailed Metrics Table
  if (options.includeMetrics && yPosition < 250) {
    doc.addPage();
    yPosition = 20;
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Detailed Metrics', 14, yPosition);
    yPosition += 5;

    const metricsTableData = consultants.map(consultant => [
      consultant.name,
      consultant.totalPlacements.toString(),
      `${consultant.successRate}%`,
      consultant.clientSatisfaction.toString(),
      `${consultant.avgTimeToFill}d`,
      `$${(consultant.revenue / 1000).toFixed(0)}K`
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [['Name', 'Placements', 'Success Rate', 'Satisfaction', 'Avg Fill Time', 'Revenue']],
      body: metricsTableData,
      theme: 'striped',
      headStyles: { fillColor: [79, 70, 229] },
      styles: { fontSize: 8 },
      margin: { left: 14, right: 14 }
    });

    yPosition = (doc as any).lastAutoTable.finalY + 10;
  }

  // Performance Analysis
  if (options.includeTrends) {
    if (yPosition > 200) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Performance Analysis', 14, yPosition);
    yPosition += 8;

    // High Performers
    doc.setFontSize(12);
    doc.text('High Performers (Rating >= 95)', 14, yPosition);
    yPosition += 5;

    const highPerformers = consultants.filter(c => c.rating >= 95);
    
    if (highPerformers.length > 0) {
      const highPerformersData = highPerformers.map(c => [
        c.name,
        `${c.rating}/100`,
        c.totalPlacements.toString(),
        c.clientSatisfaction.toString()
      ]);

      autoTable(doc, {
        startY: yPosition,
        head: [['Name', 'Rating', 'Placements', 'Satisfaction']],
        body: highPerformersData,
        theme: 'plain',
        headStyles: { fillColor: [34, 197, 94] },
        styles: { fontSize: 9 },
        margin: { left: 14, right: 14 }
      });

      yPosition = (doc as any).lastAutoTable.finalY + 10;
    } else {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('No high performers in this period', 14, yPosition);
      yPosition += 10;
    }

    // Top Revenue Generators
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Top 5 Revenue Generators', 14, yPosition);
    yPosition += 5;

    const topByRevenue = [...consultants].sort((a, b) => b.revenue - a.revenue).slice(0, 5);
    const revenueData = topByRevenue.map(c => [
      c.name,
      formatCurrencyUtil(c.revenue),
      c.totalPlacements.toString()
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [['Name', 'Revenue', 'Placements']],
      body: revenueData,
      theme: 'plain',
      headStyles: { fillColor: [79, 70, 229] },
      styles: { fontSize: 9 },
      margin: { left: 14, right: 14 }
    });
  }

  // Save the PDF
  doc.save(`${filename}.pdf`);
}
