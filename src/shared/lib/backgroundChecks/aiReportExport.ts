import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { EditableReport } from '@/shared/types/aiReferenceReport';
import type { AIReferenceCheckSession } from '@/shared/types/aiReferenceCheck';
import { getRecommendationLabel } from './aiSummaryService';

interface PDFExportOptions {
  includeTranscript?: boolean;
  includeMetadata?: boolean;
  includeSignature?: boolean;
}

export function exportAIReferencePDF(
  report: EditableReport,
  session: AIReferenceCheckSession,
  options: PDFExportOptions = {}
): void {
  const {
    includeTranscript = false,
    includeMetadata = true,
    includeSignature = true,
  } = options;

  const doc = new jsPDF('p', 'mm', 'a4');
  const summary = report.summary;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;

  let yPos = margin;
  let pageNumber = 1;

  // Helper function to add page header
  const addPageHeader = () => {
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text('Reference Check Report', margin, 10);
    doc.text(`${summary.candidateName}`, pageWidth - margin, 10, { align: 'right' });
    doc.setDrawColor(200);
    doc.line(margin, 12, pageWidth - margin, 12);
  };

  // Helper function to add page footer
  const addPageFooter = () => {
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text('CONFIDENTIAL', pageWidth / 2, pageHeight - 10, { align: 'center' });
    doc.text(`Page ${pageNumber}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
    doc.text(new Date().toLocaleDateString(), margin, pageHeight - 10);
    pageNumber++;
  };

  // Helper function to check if we need a new page
  const checkNewPage = (requiredSpace: number) => {
    if (yPos + requiredSpace > pageHeight - 25) {
      addPageFooter();
      doc.addPage();
      yPos = 20;
      addPageHeader();
      yPos = 20;
    }
  };

  // Helper function to add section title
  const addSectionTitle = (title: string) => {
    checkNewPage(15);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(91, 103, 243); // Primary color
    doc.text(title, margin, yPos);
    yPos += 8;
    doc.setDrawColor(91, 103, 243);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 8;
  };

  // Helper function to add body text
  const addBodyText = (text: string, indent = 0) => {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(50);
    const lines = doc.splitTextToSize(text, contentWidth - indent);

    for (const line of lines) {
      checkNewPage(7);
      doc.text(line, margin + indent, yPos);
      yPos += 6;
    }
    yPos += 2;
  };

  // Helper function to add bullet point
  const addBullet = (text: string, level = 0) => {
    const indent = level * 10;
    checkNewPage(7);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(50);
    doc.circle(margin + indent + 2, yPos - 1.5, 1, 'F');
    const lines = doc.splitTextToSize(text, contentWidth - indent - 10);
    doc.text(lines, margin + indent + 6, yPos);
    yPos += lines.length * 6 + 2;
  };

  // Helper function to draw score bar
  const drawScoreBar = (score: number, maxScore: number, label: string) => {
    checkNewPage(15);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(50);
    doc.text(label, margin, yPos);
    yPos += 5;

    const barWidth = 100;
    const barHeight = 6;
    const fillWidth = (score / maxScore) * barWidth;

    // Background
    doc.setFillColor(230, 230, 230);
    doc.rect(margin, yPos, barWidth, barHeight, 'F');

    // Fill based on score
    let fillColor: [number, number, number] = [91, 103, 243]; // Primary blue
    if (score / maxScore >= 0.8) {
      fillColor = [34, 197, 94]; // Green
    } else if (score / maxScore >= 0.6) {
      fillColor = [59, 130, 246]; // Blue
    } else if (score / maxScore >= 0.4) {
      fillColor = [251, 146, 60]; // Orange
    } else {
      fillColor = [239, 68, 68]; // Red
    }

    doc.setFillColor(...fillColor);
    doc.rect(margin, yPos, fillWidth, barHeight, 'F');

    // Score text
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(`${score}/${maxScore}`, margin + barWidth + 5, yPos + 4);
    yPos += 12;
  };

  // Helper function to add severity badge
  const addSeverityBadge = (severity: 'critical' | 'moderate' | 'minor') => {
    const colors: Record<typeof severity, [number, number, number]> = {
      critical: [239, 68, 68],
      moderate: [251, 146, 60],
      minor: [250, 204, 21],
    };

    const color = colors[severity];
    doc.setFillColor(...color);
    doc.roundedRect(margin, yPos - 3, 25, 6, 2, 2, 'F');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(severity.toUpperCase(), margin + 12.5, yPos + 1, { align: 'center' });
    doc.setTextColor(50);
  };

  // ==================== COVER PAGE ====================
  doc.setFillColor(91, 103, 243);
  doc.rect(0, 0, pageWidth, 80, 'F');

  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('REFERENCE CHECK', pageWidth / 2, 40, { align: 'center' });
  doc.text('REPORT', pageWidth / 2, 52, { align: 'center' });

  yPos = 100;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(50);
  doc.text('Candidate Information', margin, yPos);
  yPos += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  const infoData = [
    ['Candidate:', summary.candidateName],
    ['Referee:', summary.refereeInfo.name],
    ['Relationship:', summary.refereeInfo.relationship],
    ['Company:', summary.refereeInfo.companyName],
  ];

  if (summary.refereeInfo.yearsKnown) {
    infoData.push(['Years Known:', summary.refereeInfo.yearsKnown]);
  }

  infoData.push(
    ['Interview Mode:', summary.sessionDetails.mode],
    ['Duration:', `${Math.round(summary.sessionDetails.duration / 60)} minutes`],
    ['Questions Asked:', summary.sessionDetails.questionsAsked.toString()],
    ['Completed:', new Date(summary.sessionDetails.completedAt).toLocaleDateString()],
  );

  autoTable(doc, {
    startY: yPos,
    body: infoData,
    theme: 'plain',
    styles: { fontSize: 10, cellPadding: 3 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 50 },
      1: { cellWidth: 'auto' },
    },
  });

  yPos = (doc as any).lastAutoTable.finalY + 20;

  // Report Metadata
  if (includeMetadata) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Report Information', margin, yPos);
    yPos += 10;

    autoTable(doc, {
      startY: yPos,
      body: [
        ['Report ID:', report.id],
        ['Generated:', new Date(summary.generatedAt).toLocaleString()],
        ['Status:', report.status.toUpperCase()],
        ['Version:', report.version.toString()],
      ],
      theme: 'plain',
      styles: { fontSize: 10, cellPadding: 3 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 50 },
        1: { cellWidth: 'auto' },
      },
    });
  }

  // ==================== NEW PAGE: EXECUTIVE SUMMARY ====================
  addPageFooter();
  doc.addPage();
  yPos = 20;
  addPageHeader();
  yPos = 25;

  addSectionTitle('Executive Summary');
  addBodyText(summary.executiveSummary);

  // Overall Score Visual
  yPos += 5;
  checkNewPage(40);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Overall Assessment', margin, yPos);
  yPos += 8;

  // Score circle
  const centerX = pageWidth / 2;
  const radius = 20;
  doc.setDrawColor(200);
  doc.setLineWidth(3);
  doc.circle(centerX, yPos + radius, radius);

  const scoreAngle = (summary.recommendation.overallScore / 100) * 360;
  doc.setDrawColor(91, 103, 243);
  doc.setLineWidth(3);

  // Draw arc for score
  for (let i = 0; i < scoreAngle; i++) {
    const angle = (i - 90) * (Math.PI / 180);
    const x1 = centerX + radius * Math.cos(angle);
    const y1 = yPos + radius + radius * Math.sin(angle);
    doc.circle(x1, y1, 0.5, 'F');
  }

  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(91, 103, 243);
  doc.text(`${summary.recommendation.overallScore}`, centerX, yPos + radius + 2, { align: 'center' });
  doc.setFontSize(10);
  doc.text('/100', centerX, yPos + radius + 8, { align: 'center' });

  yPos += radius * 2 + 15;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(50);
  doc.text('Recommendation:', margin, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(getRecommendationLabel(summary.recommendation.hiringRecommendation), margin + 45, yPos);
  yPos += 7;

  doc.setFont('helvetica', 'bold');
  doc.text('Confidence:', margin, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(`${Math.round(summary.recommendation.confidenceLevel * 100)}%`, margin + 45, yPos);
  yPos += 10;

  // ==================== KEY FINDINGS ====================
  addSectionTitle('Key Findings');

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(34, 197, 94); // Green
  doc.text('Strengths', margin, yPos);
  yPos += 7;

  summary.keyFindings.strengths.forEach((strength) => {
    addBullet(strength);
  });

  yPos += 3;
  doc.setTextColor(239, 68, 68); // Red
  doc.text('Concerns', margin, yPos);
  yPos += 7;

  if (summary.keyFindings.concerns.length > 0) {
    summary.keyFindings.concerns.forEach((concern) => {
      addBullet(concern);
    });
  } else {
    addBodyText('No significant concerns identified.');
  }

  if (summary.keyFindings.neutralObservations.length > 0) {
    yPos += 3;
    doc.setTextColor(100, 116, 139); // Gray
    doc.text('Additional Observations', margin, yPos);
    yPos += 7;

    summary.keyFindings.neutralObservations.forEach((obs) => {
      addBullet(obs);
    });
  }

  // ==================== CATEGORY BREAKDOWN ====================
  addSectionTitle('Category Analysis');

  summary.categoryBreakdown.forEach((category) => {
    checkNewPage(35);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(50);
    doc.text(category.category, margin, yPos);
    yPos += 7;

    drawScoreBar(category.score, 5, '');

    addBodyText(category.summary);

    if (category.evidence.length > 0) {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(100);
      doc.text('Supporting Evidence:', margin, yPos);
      yPos += 6;

      category.evidence.forEach((evidence) => {
        checkNewPage(10);
        doc.setFontSize(9);
        doc.setTextColor(100);
        const evidenceText = `"${evidence}"`;
        const lines = doc.splitTextToSize(evidenceText, contentWidth - 10);
        doc.text(lines, margin + 5, yPos);
        yPos += lines.length * 5 + 3;
      });
    }

    yPos += 5;
  });

  // ==================== CONVERSATION HIGHLIGHTS ====================
  addSectionTitle('Conversation Highlights');

  summary.conversationHighlights.forEach((highlight, index) => {
    checkNewPage(40);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(91, 103, 243);
    doc.text(`Highlight ${index + 1}`, margin, yPos);
    yPos += 7;

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(50);
    doc.text('Q:', margin, yPos);
    doc.setFont('helvetica', 'normal');
    const qLines = doc.splitTextToSize(highlight.question, contentWidth - 10);
    doc.text(qLines, margin + 8, yPos);
    yPos += qLines.length * 6 + 3;

    doc.setFont('helvetica', 'bold');
    doc.text('A:', margin, yPos);
    doc.setFont('helvetica', 'normal');
    const aLines = doc.splitTextToSize(highlight.answer, contentWidth - 10);
    doc.text(aLines, margin + 8, yPos);
    yPos += aLines.length * 6 + 3;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(100);
    doc.text(`Significance: ${highlight.significance}`, margin, yPos);
    yPos += 10;
  });

  // ==================== RED FLAGS ====================
  if (summary.redFlags.length > 0) {
    addSectionTitle('Red Flags & Concerns');

    summary.redFlags.forEach((flag) => {
      checkNewPage(25);

      addSeverityBadge(flag.severity);
      yPos += 7;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(50);
      const descLines = doc.splitTextToSize(flag.description, contentWidth);
      doc.text(descLines, margin, yPos);
      yPos += descLines.length * 6 + 3;

      doc.setFontSize(9);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(100);
      doc.text('Evidence:', margin, yPos);
      yPos += 5;
      const evidenceLines = doc.splitTextToSize(`"${flag.evidence}"`, contentWidth - 5);
      doc.text(evidenceLines, margin + 5, yPos);
      yPos += evidenceLines.length * 5 + 8;
    });
  }

  // ==================== VERIFICATION ITEMS ====================
  addSectionTitle('Verification Items');

  if (summary.verificationItems.length > 0) {
    summary.verificationItems.forEach((item) => {
      checkNewPage(15);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(50);

      const checkbox = item.verified ? '☑' : '☐';
      doc.text(checkbox, margin, yPos);

      const claimLines = doc.splitTextToSize(item.claim, contentWidth - 10);
      doc.text(claimLines, margin + 8, yPos);
      yPos += claimLines.length * 6;

      if (item.notes) {
        doc.setFontSize(9);
        doc.setTextColor(100);
        doc.setFont('helvetica', 'italic');
        const noteLines = doc.splitTextToSize(`Notes: ${item.notes}`, contentWidth - 10);
        doc.text(noteLines, margin + 8, yPos);
        yPos += noteLines.length * 5;
      }

      yPos += 5;
    });
  } else {
    addBodyText('No verification items identified.');
  }

  // ==================== FINAL RECOMMENDATION ====================
  addSectionTitle('Final Recommendation');

  doc.setFillColor(240, 249, 255);
  const boxHeight = 45;
  checkNewPage(boxHeight + 10);
  doc.roundedRect(margin, yPos, contentWidth, boxHeight, 3, 3, 'F');

  yPos += 8;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(50);
  doc.text('Overall Score:', margin + 5, yPos);
  doc.setFontSize(14);
  doc.setTextColor(91, 103, 243);
  doc.text(`${summary.recommendation.overallScore}/100`, margin + 40, yPos);
  yPos += 8;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(50);
  doc.text('Recommendation:', margin + 5, yPos);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(getRecommendationLabel(summary.recommendation.hiringRecommendation), margin + 45, yPos);
  yPos += 8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  const reasoningLines = doc.splitTextToSize(summary.recommendation.reasoningSummary, contentWidth - 10);
  doc.text(reasoningLines, margin + 5, yPos);
  yPos += boxHeight - 24 + 10;

  // ==================== OPTIONAL: FULL TRANSCRIPT ====================
  if (includeTranscript && session.transcript) {
    addSectionTitle('Full Interview Transcript');

    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text(`Total conversation turns: ${session.transcript.turns.length}`, margin, yPos);
    yPos += 10;

    session.transcript.turns.forEach((turn, _index) => {
      checkNewPage(20);

      const speaker = turn.speaker === 'ai-recruiter' ? 'AI Recruiter' : 'Referee';
      const timestamp = `${Math.floor(turn.timestamp / 60)}:${String(Math.floor(turn.timestamp % 60)).padStart(2, '0')}`;

      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      if (turn.speaker === 'ai-recruiter') {
        doc.setTextColor(59, 130, 246);
      } else {
        doc.setTextColor(100, 116, 139);
      }
      doc.text(`[${timestamp}] ${speaker}:`, margin, yPos);
      yPos += 5;

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(50);
      const textLines = doc.splitTextToSize(turn.text, contentWidth - 5);
      doc.text(textLines, margin + 5, yPos);
      yPos += textLines.length * 5 + 5;
    });
  }

  // ==================== SIGNATURE SECTION ====================
  if (includeSignature) {
    checkNewPage(40);
    yPos += 10;

    doc.setDrawColor(200);
    doc.line(margin, yPos, margin + 60, yPos);
    yPos += 5;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100);
    doc.text('Reviewed By', margin, yPos);

    yPos -= 5;
    doc.line(pageWidth - margin - 60, yPos, pageWidth - margin, yPos);
    yPos += 5;
    doc.text('Date', pageWidth - margin - 30, yPos, { align: 'center' });
  }

  // Final page footer
  addPageFooter();

  // Save the PDF
  const filename = `Reference_Check_${summary.candidateName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
}
