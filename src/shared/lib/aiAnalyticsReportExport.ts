import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface AnalyticsData {
  analyses: Array<{
    name: string;
    role: string;
    analysis: any;
    quality: any;
  }>;
  sentimentDist: Record<string, number>;
  biasTypes: Record<string, number>;
  avgQuality: number;
  qualityByRole: Array<{ role: string; quality: number }>;
  consistency: number;
}

export function exportAIAnalyticsReport(
  analytics: AnalyticsData,
  candidateName: string
): void {
  const doc = new jsPDF();
  let yPos = 20;

  // Header
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('AI Analytics Report', 105, yPos, { align: 'center' });
  
  yPos += 10;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text(`Candidate: ${candidateName}`, 105, yPos, { align: 'center' });
  
  yPos += 8;
  doc.setFontSize(10);
  doc.setTextColor(128, 128, 128);
  doc.text(`Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 105, yPos, { align: 'center' });
  
  // Reset text color
  doc.setTextColor(0, 0, 0);
  yPos += 15;

  // Executive Summary Section
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Executive Summary', 20, yPos);
  yPos += 10;

  // Key Metrics
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  
  const metrics = [
    ['Team Consistency Score', `${analytics.consistency}%`],
    ['Average Quality Score', `${analytics.avgQuality}%`],
    ['Total Team Members', `${analytics.analyses.length}`],
    ['Total Biases Detected', `${Object.values(analytics.biasTypes).reduce((a, b) => a + b, 0)}`],
  ];

  autoTable(doc, {
    startY: yPos,
    head: [['Metric', 'Value']],
    body: metrics,
    theme: 'striped',
    headStyles: { fillColor: [66, 66, 66], textColor: [255, 255, 255] },
    margin: { left: 20, right: 20 },
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;

  // Sentiment Distribution
  if (yPos > 250) {
    doc.addPage();
    yPos = 20;
  }

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Sentiment Analysis', 20, yPos);
  yPos += 10;

  const sentimentData = Object.entries(analytics.sentimentDist).map(([sentiment, count]) => [
    sentiment.charAt(0).toUpperCase() + sentiment.slice(1),
    count.toString(),
    `${((count / analytics.analyses.length) * 100).toFixed(1)}%`
  ]);

  autoTable(doc, {
    startY: yPos,
    head: [['Sentiment', 'Count', 'Percentage']],
    body: sentimentData,
    theme: 'striped',
    headStyles: { fillColor: [66, 66, 66], textColor: [255, 255, 255] },
    margin: { left: 20, right: 20 },
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;

  // Quality by Role
  if (yPos > 250) {
    doc.addPage();
    yPos = 20;
  }

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Quality Scores by Role', 20, yPos);
  yPos += 10;

  const qualityData = analytics.qualityByRole.map(item => [
    item.role,
    `${item.quality}%`
  ]);

  autoTable(doc, {
    startY: yPos,
    head: [['Role', 'Quality Score']],
    body: qualityData,
    theme: 'striped',
    headStyles: { fillColor: [66, 66, 66], textColor: [255, 255, 255] },
    margin: { left: 20, right: 20 },
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;

  // Bias Detection
  if (Object.keys(analytics.biasTypes).length > 0) {
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Bias Patterns Detected', 20, yPos);
    yPos += 10;

    const biasData = Object.entries(analytics.biasTypes).map(([type, count]) => [
      type.charAt(0).toUpperCase() + type.slice(1),
      count.toString()
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Bias Type', 'Occurrences']],
      body: biasData,
      theme: 'striped',
      headStyles: { fillColor: [239, 68, 68], textColor: [255, 255, 255] },
      margin: { left: 20, right: 20 },
    });

    yPos = (doc as any).lastAutoTable.finalY + 15;
  }

  // Individual Performance
  doc.addPage();
  yPos = 20;

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Individual Team Member Performance', 20, yPos);
  yPos += 10;

  const performanceData = analytics.analyses.map(a => [
    a.name,
    a.role,
    `${a.quality.overall}%`,
    a.analysis.sentiment.overall.charAt(0).toUpperCase() + a.analysis.sentiment.overall.slice(1)
  ]);

  autoTable(doc, {
    startY: yPos,
    head: [['Name', 'Role', 'Quality', 'Sentiment']],
    body: performanceData,
    theme: 'striped',
    headStyles: { fillColor: [66, 66, 66], textColor: [255, 255, 255] },
    margin: { left: 20, right: 20 },
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;

  // Recommendations
  doc.addPage();
  yPos = 20;

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Recommendations', 20, yPos);
  yPos += 12;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');

  const recommendations = generateRecommendations(analytics);
  
  recommendations.forEach((rec, index) => {
    if (yPos > 270) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFont('helvetica', 'bold');
    doc.text(`${index + 1}. ${rec.title}`, 20, yPos);
    yPos += 6;

    doc.setFont('helvetica', 'normal');
    const splitText = doc.splitTextToSize(rec.description, 170);
    doc.text(splitText, 25, yPos);
    yPos += splitText.length * 5 + 8;
  });

  // Footer on last page
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.text(
      `Page ${i} of ${pageCount}`,
      105,
      290,
      { align: 'center' }
    );
  }

  // Download
  doc.save(`AI_Analytics_Report_${candidateName.replace(/\s+/g, '_')}_${Date.now()}.pdf`);
}

function generateRecommendations(analytics: AnalyticsData) {
  const recommendations = [];

  // Team consistency recommendation
  if (analytics.consistency < 70) {
    recommendations.push({
      title: 'Improve Team Alignment',
      description: `Team consistency score is ${analytics.consistency}%. Consider conducting calibration sessions to align feedback standards across team members. Establish clear evaluation criteria and provide training on objective assessment techniques.`
    });
  } else {
    recommendations.push({
      title: 'Maintain Strong Team Alignment',
      description: `Team consistency score of ${analytics.consistency}% indicates excellent alignment. Continue current calibration practices and use this consistency as a benchmark for future evaluations.`
    });
  }

  // Quality score recommendation
  if (analytics.avgQuality < 70) {
    recommendations.push({
      title: 'Enhance Feedback Quality',
      description: `Average quality score is ${analytics.avgQuality}%. Encourage reviewers to provide more specific, actionable feedback with concrete examples. Consider implementing feedback templates or guidelines to improve detail and clarity.`
    });
  }

  // Bias detection recommendation
  const totalBiases = Object.values(analytics.biasTypes).reduce((a, b) => a + b, 0);
  if (totalBiases > 0) {
    const topBias = Object.entries(analytics.biasTypes).sort((a, b) => b[1] - a[1])[0];
    recommendations.push({
      title: 'Address Unconscious Bias',
      description: `${totalBiases} potential bias instances detected across feedback, with ${topBias[0]} bias being most common. Implement bias awareness training and encourage reviewers to focus on job-related competencies and observable behaviors.`
    });
  }

  // Sentiment distribution recommendation
  const negativeCount = analytics.sentimentDist.negative || 0;
  if (negativeCount > analytics.analyses.length * 0.3) {
    recommendations.push({
      title: 'Balance Critical Feedback',
      description: 'Over 30% of feedback shows negative sentiment. While constructive criticism is valuable, ensure feedback also highlights strengths and provides actionable improvement suggestions to maintain candidate engagement.'
    });
  }

  // Low performers recommendation
  const lowPerformers = analytics.analyses.filter(a => a.quality.overall < 60);
  if (lowPerformers.length > 0) {
    recommendations.push({
      title: 'Support Low-Quality Reviewers',
      description: `${lowPerformers.length} reviewer(s) scored below 60% quality. Provide targeted training and feedback templates to help them deliver more comprehensive and actionable assessments.`
    });
  }

  return recommendations;
}
