import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { ComparisonResult } from './reportComparison';
import type { AITranscriptionSummary } from '@/shared/types/aiReferenceReport';

interface ExportOptions {
  candidateName: string;
  candidateId: string;
  includeCharts?: boolean;
  includeEvidence?: boolean;
}

export function exportComparisonPDF(
  comparison: ComparisonResult,
  reports: AITranscriptionSummary[],
  options: ExportOptions
) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;
  let yPosition = margin;

  // Helper function to check if we need a new page
  const checkNewPage = (requiredSpace: number) => {
    if (yPosition + requiredSpace > pageHeight - margin) {
      doc.addPage();
      yPosition = margin;
      addPageHeader();
      return true;
    }
    return false;
  };

  // Helper function to add page header
  const addPageHeader = () => {
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(`${options.candidateName} - Multi-Referee Comparison`, margin, 10);
    doc.text(`Page ${doc.getCurrentPageInfo().pageNumber}`, pageWidth - margin - 20, 10);
    yPosition = margin;
  };

  // Add footer to each page
  const addFooter = () => {
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(
        'Confidential - For Internal Use Only',
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );
    }
  };

  // ==================== COVER PAGE ====================
  doc.setFillColor(59, 130, 246); // Primary blue
  doc.rect(0, 0, pageWidth, 80, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.text('Multi-Referee Comparison Report', pageWidth / 2, 40, { align: 'center' });

  doc.setFontSize(14);
  doc.text(options.candidateName, pageWidth / 2, 55, { align: 'center' });

  doc.setFontSize(10);
  doc.text(`Candidate ID: ${options.candidateId}`, pageWidth / 2, 65, { align: 'center' });

  // Report metadata
  yPosition = 100;
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(11);
  doc.text('Report Details:', margin, yPosition);
  yPosition += 8;

  doc.setFontSize(10);
  const reportDetails = [
    `Generated: ${new Date().toLocaleString()}`,
    `Total Referees: ${comparison.totalReferees}`,
    `Overall Score: ${comparison.aggregateRecommendation.overallScore.toFixed(0)}/100`,
    `Majority Recommendation: ${comparison.aggregateRecommendation.majorityRecommendation.replace(/-/g, ' ').toUpperCase()}`,
    `Confidence Level: ${(comparison.aggregateRecommendation.confidenceLevel * 100).toFixed(0)}%`,
  ];

  reportDetails.forEach((detail) => {
    doc.text(`• ${detail}`, margin + 5, yPosition);
    yPosition += 7;
  });

  // ==================== AGGREGATE RECOMMENDATION ====================
  doc.addPage();
  yPosition = margin;

  doc.setFontSize(16);
  doc.setTextColor(59, 130, 246);
  doc.text('Aggregate Recommendation', margin, yPosition);
  yPosition += 10;

  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  const summaryLines = doc.splitTextToSize(comparison.aggregateRecommendation.summary, contentWidth);
  summaryLines.forEach((line: string) => {
    checkNewPage(10);
    doc.text(line, margin, yPosition);
    yPosition += 7;
  });
  yPosition += 5;

  // Recommendation distribution table
  checkNewPage(40);
  doc.setFontSize(12);
  doc.setTextColor(59, 130, 246);
  doc.text('Recommendation Distribution', margin, yPosition);
  yPosition += 8;

  const recDistData = Object.entries(comparison.aggregateRecommendation.recommendationDistribution).map(
    ([rec, count]) => [rec.replace(/-/g, ' ').toUpperCase(), count.toString()]
  );

  autoTable(doc, {
    startY: yPosition,
    head: [['Recommendation', 'Count']],
    body: recDistData,
    theme: 'grid',
    headStyles: { fillColor: [59, 130, 246], textColor: [255, 255, 255], fontSize: 10 },
    bodyStyles: { fontSize: 9 },
    margin: { left: margin, right: margin },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 15;

  // ==================== INDIVIDUAL REFEREE SUMMARIES ====================
  checkNewPage(50);
  doc.setFontSize(16);
  doc.setTextColor(59, 130, 246);
  doc.text('Individual Referee Summaries', margin, yPosition);
  yPosition += 12;

  reports.forEach((report, index) => {
    checkNewPage(60);

    // Referee header box
    doc.setFillColor(240, 240, 240);
    doc.roundedRect(margin, yPosition - 5, contentWidth, 35, 3, 3, 'F');

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`${index + 1}. ${report.refereeInfo.name}`, margin + 5, yPosition + 3);

    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(`${report.refereeInfo.relationship} at ${report.refereeInfo.companyName}`, margin + 5, yPosition + 10);

    // Score and recommendation
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`Score: ${report.recommendation.overallScore}/100`, margin + 5, yPosition + 18);
    doc.text(
      `Recommendation: ${report.recommendation.hiringRecommendation.replace(/-/g, ' ')}`,
      margin + 5,
      yPosition + 25
    );

    yPosition += 40;
  });

  // ==================== CATEGORY COMPARISON ====================
  doc.addPage();
  yPosition = margin;

  doc.setFontSize(16);
  doc.setTextColor(59, 130, 246);
  doc.text('Detailed Category Analysis', margin, yPosition);
  yPosition += 12;

  comparison.categoryComparisons.forEach((cat) => {
    checkNewPage(50);

    // Category header
    doc.setFillColor(59, 130, 246);
    doc.rect(margin, yPosition - 5, contentWidth, 10, 'F');

    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.text(cat.category, margin + 5, yPosition + 2);

    doc.setFontSize(9);
    const consensusText = `${cat.consensus.toUpperCase()} CONSENSUS`;
    doc.text(consensusText, pageWidth - margin - 5, yPosition + 2, { align: 'right' });

    yPosition += 12;

    // Average score
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`Average Score: ${cat.averageScore.toFixed(1)}/5`, margin, yPosition);
    yPosition += 8;

    // Individual scores
    const categoryScores = cat.scores.map((score) => [
      score.refereeName,
      `${score.score}/5`,
      score.summary.substring(0, 80) + (score.summary.length > 80 ? '...' : ''),
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [['Referee', 'Score', 'Summary']],
      body: categoryScores,
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246], textColor: [255, 255, 255], fontSize: 9 },
      bodyStyles: { fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 20 },
        2: { cellWidth: 'auto' },
      },
      margin: { left: margin, right: margin },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 12;
  });

  // ==================== CONSENSUS HIGHLIGHTS ====================
  if (comparison.consensusAreas.length > 0) {
    doc.addPage();
    yPosition = margin;

    doc.setFontSize(16);
    doc.setTextColor(59, 130, 246);
    doc.text('Consensus Highlights', margin, yPosition);
    yPosition += 10;

    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text('Areas where most referees agree', margin, yPosition);
    yPosition += 12;

    comparison.consensusAreas.forEach((area, _index) => {
      checkNewPage(50);

      // Area box
      const boxColor = area.type === 'strength' ? [34, 197, 94] : [251, 191, 36];
      doc.setFillColor(boxColor[0], boxColor[1], boxColor[2], 0.1);
      doc.setDrawColor(boxColor[0], boxColor[1], boxColor[2]);
      doc.roundedRect(margin, yPosition - 5, contentWidth, 40, 3, 3, 'FD');

      // Icon and type
      doc.setFontSize(10);
      doc.setTextColor(boxColor[0], boxColor[1], boxColor[2]);
      const typeText = area.type === 'strength' ? '✓ STRENGTH' : 'ℹ OBSERVATION';
      doc.text(typeText, margin + 5, yPosition + 3);

      // Text
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      const areaTextLines = doc.splitTextToSize(area.text, contentWidth - 10);
      let areaYPos = yPosition + 10;
      areaTextLines.forEach((line: string) => {
        doc.text(line, margin + 5, areaYPos);
        areaYPos += 6;
      });

      // Supporting referees
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(`Supported by: ${area.supportingReferees.join(', ')}`, margin + 5, areaYPos + 3);

      // Evidence (if enabled)
      if (options.includeEvidence && area.evidence.length > 0) {
        areaYPos += 10;
        doc.setFontSize(8);
        doc.setTextColor(80, 80, 80);
        doc.text('Evidence:', margin + 5, areaYPos);
        areaYPos += 5;

        area.evidence.slice(0, 2).forEach((evidence) => {
          const evidenceLines = doc.splitTextToSize(`"${evidence}"`, contentWidth - 15);
          evidenceLines.forEach((line: string) => {
            if (areaYPos > yPosition + 35) return; // Prevent overflow
            doc.setFont('helvetica', 'italic');
            doc.text(line, margin + 10, areaYPos);
            doc.setFont('helvetica', 'normal');
            areaYPos += 5;
          });
        });
      }

      yPosition += 45;
    });
  }

  // ==================== DIVERGENT FEEDBACK ====================
  if (comparison.divergentAreas.length > 0) {
    doc.addPage();
    yPosition = margin;

    doc.setFontSize(16);
    doc.setTextColor(59, 130, 246);
    doc.text('Divergent Feedback', margin, yPosition);
    yPosition += 10;

    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text('Areas where referees have differing views', margin, yPosition);
    yPosition += 12;

    comparison.divergentAreas.forEach((area) => {
      checkNewPage(70);

      // Category header
      const divergenceColor =
        area.divergenceLevel === 'high' ? [239, 68, 68] : [251, 191, 36];
      doc.setFillColor(divergenceColor[0], divergenceColor[1], divergenceColor[2], 0.1);
      doc.setDrawColor(divergenceColor[0], divergenceColor[1], divergenceColor[2]);
      doc.roundedRect(margin, yPosition - 5, contentWidth, 10, 3, 3, 'FD');

      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.text(area.category, margin + 5, yPosition + 2);

      doc.setFontSize(9);
      doc.setTextColor(divergenceColor[0], divergenceColor[1], divergenceColor[2]);
      doc.text(`${area.divergenceLevel.toUpperCase()} DIVERGENCE`, pageWidth - margin - 5, yPosition + 2, {
        align: 'right',
      });

      yPosition += 15;

      // Referee views
      area.refereeViews.forEach((view) => {
        checkNewPage(20);

        doc.setFontSize(9);
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'bold');
        doc.text(`${view.name}:`, margin + 5, yPosition);
        doc.setFont('helvetica', 'normal');

        if (view.score) {
          doc.text(`(${view.score}/5)`, margin + 35, yPosition);
        }

        yPosition += 5;

        doc.setFontSize(8);
        doc.setTextColor(80, 80, 80);
        const viewLines = doc.splitTextToSize(view.view, contentWidth - 10);
        viewLines.forEach((line: string) => {
          checkNewPage(10);
          doc.text(line, margin + 5, yPosition);
          yPosition += 5;
        });

        yPosition += 3;
      });

      yPosition += 5;
    });
  }

  // ==================== RECOMMENDATIONS ====================
  doc.addPage();
  yPosition = margin;

  doc.setFontSize(16);
  doc.setTextColor(59, 130, 246);
  doc.text('Recommendations & Next Steps', margin, yPosition);
  yPosition += 12;

  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);

  const recommendations = [
    'Review individual referee reports for detailed context and specific examples.',
    'Pay special attention to consensus areas as they represent consistent feedback across multiple sources.',
    'Investigate divergent feedback areas to understand different perspectives and contexts.',
    'Consider the relationship and tenure of each referee when weighing their input.',
    'Schedule follow-up interviews to clarify any concerns or conflicting information.',
    `Overall recommendation: ${comparison.aggregateRecommendation.majorityRecommendation.replace(/-/g, ' ').toUpperCase()}`,
  ];

  recommendations.forEach((rec) => {
    checkNewPage(15);
    doc.text(`• ${rec}`, margin + 5, yPosition);
    const lines = doc.splitTextToSize(rec, contentWidth - 10);
    yPosition += lines.length * 7;
  });

  // Add footers
  addFooter();

  // Save the PDF
  const fileName = `${options.candidateName.replace(/\s+/g, '_')}_Multi_Referee_Comparison_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}
