import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type {
  TrendDataPoint,
  CheckTypeMetrics,
  RecruiterPerformance,
  BottleneckInsight,
  PredictiveMetrics
} from './analyticsService';

export function exportAnalyticsReport(
  trendsData: TrendDataPoint[],
  checkTypeData: CheckTypeMetrics[],
  recruiterData: RecruiterPerformance[],
  bottleneckData: BottleneckInsight[],
  predictiveData: PredictiveMetrics,
  dateRange: string
) {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  let yPos = 20;

  // Helper function to add page header
  const addHeader = (_title: string) => {
    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    pdf.text(`Background Checks Analytics Report | ${dateRange}`, pageWidth / 2, 10, { align: 'center' });
    pdf.setDrawColor(200, 200, 200);
    pdf.line(15, 12, pageWidth - 15, 12);
  };

  // Helper function to add page footer
  const addFooter = (pageNum: number) => {
    pdf.setFontSize(8);
    pdf.setTextColor(150, 150, 150);
    pdf.text(`Page ${pageNum}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
    pdf.text('Confidential', pageWidth - 15, pageHeight - 10, { align: 'right' });
  };

  // Helper to check if new page is needed
  const checkNewPage = (requiredSpace: number) => {
    if (yPos + requiredSpace > pageHeight - 20) {
      pdf.addPage();
      yPos = 20;
      addHeader('Background Checks Analytics Report');
      return true;
    }
    return false;
  };

  // Cover Page
  pdf.setFillColor(59, 130, 246);
  pdf.rect(0, 0, pageWidth, 80, 'F');

  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(28);
  pdf.text('Background Checks', pageWidth / 2, 35, { align: 'center' });
  pdf.text('Analytics Report', pageWidth / 2, 50, { align: 'center' });

  pdf.setFontSize(14);
  pdf.text(dateRange, pageWidth / 2, 65, { align: 'center' });

  pdf.setTextColor(100, 100, 100);
  pdf.setFontSize(10);
  pdf.text(`Generated on ${new Date().toLocaleDateString()}`, pageWidth / 2, 100, { align: 'center' });

  // Executive Summary
  pdf.addPage();
  yPos = 20;
  addHeader('Executive Summary');

  pdf.setFontSize(18);
  pdf.setTextColor(0, 0, 0);
  pdf.text('Executive Summary', 15, yPos);
  yPos += 15;

  // Predictive Metrics Summary
  pdf.setFontSize(12);
  pdf.setTextColor(59, 130, 246);
  pdf.text('Process Efficiency Overview', 15, yPos);
  yPos += 8;

  pdf.setFontSize(10);
  pdf.setTextColor(0, 0, 0);

  const efficiencyColor = predictiveData.efficiency >= 80 ? [34, 197, 94] as [number, number, number] :
    predictiveData.efficiency >= 60 ? [234, 179, 8] as [number, number, number] : [239, 68, 68] as [number, number, number];

  pdf.setFillColor(...efficiencyColor);
  pdf.roundedRect(15, yPos, 50, 15, 2, 2, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(14);
  pdf.text(`${predictiveData.efficiency}%`, 40, yPos + 10, { align: 'center' });
  pdf.setFontSize(8);
  pdf.text('Efficiency Score', 40, yPos + 14, { align: 'center' });

  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(10);
  pdf.text(`Predicted Completion Time: ${predictiveData.predictedCompletionTime} days`, 70, yPos + 8);
  yPos += 25;

  // Risk Factors Summary
  if (predictiveData.riskFactors.length > 0) {
    pdf.setFontSize(12);
    pdf.setTextColor(59, 130, 246);
    pdf.text('Key Risk Factors', 15, yPos);
    yPos += 8;

    pdf.setFontSize(9);
    pdf.setTextColor(0, 0, 0);
    predictiveData.riskFactors.slice(0, 5).forEach(risk => {
      pdf.text(`• ${risk.factor}: ${risk.impact.toFixed(1)}% impact`, 20, yPos);
      yPos += 6;
    });
    yPos += 5;
  }

  addFooter(2);

  // Trends Analysis
  pdf.addPage();
  yPos = 20;
  addHeader('Trends Analysis');

  pdf.setFontSize(16);
  pdf.setTextColor(0, 0, 0);
  pdf.text('Volume & Completion Trends', 15, yPos);
  yPos += 10;

  const trendsTableData = trendsData.slice(-10).map(point => [
    new Date(point.date).toLocaleDateString(),
    point.totalChecks.toString(),
    point.completed.toString(),
    point.inProgress.toString(),
    `${point.completionRate.toFixed(1)}%`,
    `${point.avgCompletionTime} days`
  ]);

  autoTable(pdf, {
    startY: yPos,
    head: [['Date', 'Total', 'Completed', 'In Progress', 'Completion Rate', 'Avg. Time']],
    body: trendsTableData,
    theme: 'striped',
    headStyles: { fillColor: [59, 130, 246] },
    styles: { fontSize: 8 },
  });

  yPos = (pdf as any).lastAutoTable.finalY + 10;
  addFooter(3);

  // Check Type Comparison
  checkNewPage(80);

  pdf.setFontSize(16);
  pdf.setTextColor(0, 0, 0);
  pdf.text('Check Type Performance', 15, yPos);
  yPos += 10;

  const checkTypeTableData = checkTypeData.map(ct => [
    ct.type,
    ct.total.toString(),
    ct.completed.toString(),
    `${ct.avgTime} days`,
    `${ct.successRate.toFixed(1)}%`,
    `$${ct.cost}`
  ]);

  autoTable(pdf, {
    startY: yPos,
    head: [['Check Type', 'Total', 'Completed', 'Avg. Time', 'Success Rate', 'Cost']],
    body: checkTypeTableData,
    theme: 'striped',
    headStyles: { fillColor: [59, 130, 246] },
    styles: { fontSize: 9 },
  });

  yPos = (pdf as any).lastAutoTable.finalY + 10;
  addFooter(4);

  // Recruiter Performance
  pdf.addPage();
  yPos = 20;
  addHeader('Recruiter Performance');

  pdf.setFontSize(16);
  pdf.setTextColor(0, 0, 0);
  pdf.text('Individual Recruiter Metrics', 15, yPos);
  yPos += 10;

  const recruiterTableData = recruiterData.map(r => [
    r.recruiterName,
    r.totalInitiated.toString(),
    `${r.avgCompletionTime} days`,
    `${r.completionRate.toFixed(1)}%`,
    `${r.onTimeRate.toFixed(1)}%`,
    `${r.qualityScore.toFixed(1)}%`
  ]);

  autoTable(pdf, {
    startY: yPos,
    head: [['Recruiter', 'Initiated', 'Avg. Time', 'Completion', 'On-Time', 'Quality']],
    body: recruiterTableData,
    theme: 'striped',
    headStyles: { fillColor: [59, 130, 246] },
    styles: { fontSize: 9 },
  });

  yPos = (pdf as any).lastAutoTable.finalY + 10;
  addFooter(5);

  // Bottleneck Analysis
  if (bottleneckData.length > 0) {
    checkNewPage(100);

    pdf.setFontSize(16);
    pdf.setTextColor(0, 0, 0);
    pdf.text('Bottleneck Analysis', 15, yPos);
    yPos += 10;

    bottleneckData.forEach((bottleneck, _index) => {
      checkNewPage(35);

      const severityColors: Record<string, [number, number, number]> = {
        high: [239, 68, 68],
        medium: [234, 179, 8],
        low: [34, 197, 94]
      };

      const color = severityColors[bottleneck.severity] || [200, 200, 200] as [number, number, number];
      pdf.setFillColor(...color);
      pdf.roundedRect(15, yPos, 5, 5, 1, 1, 'F');

      pdf.setFontSize(11);
      pdf.setTextColor(0, 0, 0);
      pdf.text(bottleneck.stage, 22, yPos + 4);

      pdf.setFontSize(9);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Avg. Duration: ${bottleneck.avgDuration} days | Checks Affected: ${bottleneck.checksAffected}`, 22, yPos + 9);

      pdf.setFontSize(9);
      pdf.setTextColor(0, 0, 0);
      const splitRec = pdf.splitTextToSize(bottleneck.recommendation, pageWidth - 40);
      pdf.text(splitRec, 22, yPos + 14);

      yPos += 30;
    });

    addFooter(6);
  }

  // Save the PDF
  pdf.save(`background-checks-analytics-${new Date().toISOString().split('T')[0]}.pdf`);
}
