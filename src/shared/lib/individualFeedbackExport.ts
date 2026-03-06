import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { TeamMemberFeedback } from '@/shared/types/collaborativeFeedback';
import { AIFeedbackAnalysis } from '@/shared/types/aiAnalysis';

export function exportIndividualFeedbackPDF(
  feedback: TeamMemberFeedback,
  analysis: AIFeedbackAnalysis,
  candidateName: string
): void {
  const doc = new jsPDF();
  let yPos = 20;

  // Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Individual Feedback Report', 105, yPos, { align: 'center' });
  
  yPos += 10;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Candidate: ${candidateName}`, 105, yPos, { align: 'center' });
  
  yPos += 6;
  doc.setFontSize(10);
  doc.text(`Reviewer: ${feedback.reviewerName} (${feedback.reviewerRole})`, 105, yPos, { align: 'center' });
  
  yPos += 6;
  doc.setTextColor(128, 128, 128);
  doc.text(`Date: ${new Date(feedback.submittedAt).toLocaleDateString()}`, 105, yPos, { align: 'center' });
  
  doc.setTextColor(0, 0, 0);
  yPos += 15;

  // Overall Rating
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Overall Assessment', 20, yPos);
  yPos += 10;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`Overall Score: ${feedback.overallScore}/100`, 20, yPos);
  doc.text(`Recommendation: ${feedback.recommendation}`, 20, yPos + 6);
  
  yPos += 18;

  // AI Summary
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('AI Analysis Summary', 20, yPos);
  yPos += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const summaryText = doc.splitTextToSize(analysis.summary, 170);
  doc.text(summaryText, 20, yPos);
  yPos += summaryText.length * 5 + 10;

  // Sentiment & Confidence
  if (yPos > 250) {
    doc.addPage();
    yPos = 20;
  }

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Sentiment Analysis', 20, yPos);
  yPos += 8;

  const sentimentData = [
    ['Overall Sentiment', analysis.sentiment.overall.toUpperCase()],
    ['Sentiment Score', `${(analysis.sentiment.score * 100).toFixed(0)}%`],
    ['Confidence Level', `${analysis.sentiment.emotions.confidence}%`],
    ['Enthusiasm', `${analysis.sentiment.emotions.enthusiasm}%`],
    ['Objectivity', `${analysis.sentiment.emotions.objectivity}%`],
  ];

  autoTable(doc, {
    startY: yPos,
    body: sentimentData,
    theme: 'plain',
    styles: { fontSize: 10 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 80 },
      1: { cellWidth: 80 }
    },
    margin: { left: 20 },
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;

  // Detailed Comments
  doc.addPage();
  yPos = 20;

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Detailed Feedback', 20, yPos);
  yPos += 10;

  feedback.comments.forEach((comment, index) => {
    if (yPos > 260) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`${index + 1}. ${comment.type.charAt(0).toUpperCase() + comment.type.slice(1)}`, 20, yPos);
    yPos += 6;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const commentText = doc.splitTextToSize(comment.content, 170);
    doc.text(commentText, 25, yPos);
    yPos += commentText.length * 5 + 8;
  });

  // Bias Detection
  if (analysis.biasDetection.length > 0) {
    doc.addPage();
    yPos = 20;

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(239, 68, 68);
    doc.text('⚠ Potential Biases Detected', 20, yPos);
    doc.setTextColor(0, 0, 0);
    yPos += 10;

    analysis.biasDetection.forEach((bias, index) => {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(`${index + 1}. ${bias.type?.toUpperCase()} Bias (${bias.severity.toUpperCase()})`, 20, yPos);
      yPos += 6;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'italic');
      const excerptText = doc.splitTextToSize(`"${bias.excerpt}"`, 170);
      doc.text(excerptText, 25, yPos);
      yPos += excerptText.length * 5 + 4;

      doc.setFont('helvetica', 'normal');
      const suggestionText = doc.splitTextToSize(bias.suggestion, 170);
      doc.text(suggestionText, 25, yPos);
      yPos += suggestionText.length * 5 + 10;
    });
  }

  // AI Suggestions
  doc.addPage();
  yPos = 20;

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('AI Improvement Suggestions', 20, yPos);
  yPos += 10;

  analysis.suggestions.forEach((suggestion, index) => {
    if (yPos > 260) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`${index + 1}. ${suggestion.title}`, 20, yPos);
    yPos += 6;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const suggestionText = doc.splitTextToSize(suggestion.suggestion, 170);
    doc.text(suggestionText, 25, yPos);
    yPos += suggestionText.length * 5 + 8;
  });

  // Footer
  const pageCount = doc.getNumberOfPages();
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.text(`Page ${i} of ${pageCount}`, 105, 290, { align: 'center' });
    doc.text('Generated by AI Feedback System', 105, 285, { align: 'center' });
  }

  doc.save(`Feedback_${feedback.reviewerName.replace(/\s+/g, '_')}_${Date.now()}.pdf`);
}

export function exportIndividualFeedbackExcel(
  feedback: TeamMemberFeedback,
  analysis: AIFeedbackAnalysis,
  candidateName: string
): void {
  const data = {
    candidateName,
    reviewerName: feedback.reviewerName,
    reviewerRole: feedback.reviewerRole,
    submittedAt: new Date(feedback.submittedAt).toLocaleString(),
    overallScore: feedback.overallScore,
    recommendation: feedback.recommendation,
    aiSummary: analysis.summary,
    sentimentOverall: analysis.sentiment.overall,
    sentimentScore: analysis.sentiment.score,
    confidenceScore: analysis.confidenceScore,
    comments: feedback.comments,
    biases: analysis.biasDetection,
    suggestions: analysis.suggestions,
  };

  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Feedback_${feedback.reviewerName.replace(/\s+/g, '_')}_${Date.now()}.json`;
  link.click();
  URL.revokeObjectURL(url);
}
