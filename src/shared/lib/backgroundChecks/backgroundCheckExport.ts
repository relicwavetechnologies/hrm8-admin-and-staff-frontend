import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { BackgroundCheck } from '@/shared/types/backgroundCheck';
import type { ConsentRequest } from '@/shared/types/consent';
import type { RefereeDetails } from '@/shared/types/referee';
import { getConsentResponseByRequestId } from './consentStorage';

const checkTypeLabels = {
  criminal: 'Criminal Record Check',
  employment: 'Employment Verification',
  education: 'Education Verification',
  credit: 'Credit Check',
  'drug-screen': 'Drug Screening',
  reference: 'Reference Check',
  identity: 'Identity Verification',
  'professional-license': 'Professional License Verification',
};

const relationshipLabels = {
  manager: 'Manager',
  colleague: 'Colleague',
  'direct-report': 'Direct Report',
  client: 'Client',
  other: 'Other',
};

export function exportBackgroundCheckPDF(
  check: BackgroundCheck,
  consents: ConsentRequest[],
  referees: RefereeDetails[]
): void {
  const doc = new jsPDF();
  let yPos = 20;

  // Header
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('Background Check Report', 105, yPos, { align: 'center' });

  yPos += 10;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Report ID: ${check.id.slice(0, 8).toUpperCase()}`, 105, yPos, { align: 'center' });

  yPos += 6;
  doc.setFontSize(10);
  doc.setTextColor(128, 128, 128);
  doc.text(`Generated on ${new Date().toLocaleDateString()}`, 105, yPos, { align: 'center' });

  doc.setTextColor(0, 0, 0);
  yPos += 15;

  // Candidate Information
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Candidate Information', 20, yPos);
  yPos += 8;

  const candidateData = [
    ['Name', check.candidateName],
    ['Candidate ID', check.candidateId],
    ['Status', check.status.toUpperCase()],
    ['Overall Result', check.overallStatus?.toUpperCase() || 'N/A'],
  ];

  autoTable(doc, {
    startY: yPos,
    body: candidateData,
    theme: 'plain',
    styles: { fontSize: 10 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 60 },
      1: { cellWidth: 120 }
    },
    margin: { left: 20 },
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;

  // Check Details
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Check Details', 20, yPos);
  yPos += 8;

  const checkDetailsData = [
    ['Provider', check.provider.toUpperCase()],
    ['Initiated By', check.initiatedByName],
    ['Initiated Date', new Date(check.initiatedDate).toLocaleDateString()],
    ['Completed Date', check.completedDate ? new Date(check.completedDate).toLocaleDateString() : 'Pending'],
    ['Total Cost', `$${check.totalCost?.toFixed(2) || '0.00'}`],
    ['Payment Status', check.paymentStatus?.toUpperCase() || 'N/A'],
  ];

  autoTable(doc, {
    startY: yPos,
    body: checkDetailsData,
    theme: 'plain',
    styles: { fontSize: 10 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 60 },
      1: { cellWidth: 120 }
    },
    margin: { left: 20 },
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;

  // Check Results
  doc.addPage();
  yPos = 20;

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Check Results', 20, yPos);
  yPos += 8;

  const resultsData = check.checkTypes.map(checkType => {
    const result = check.results.find(r => r.checkType === checkType.type);
    return [
      checkTypeLabels[checkType.type],
      checkType.required ? 'Required' : 'Optional',
      result ? result.status.toUpperCase() : 'PENDING',
      result?.completedDate ? new Date(result.completedDate).toLocaleDateString() : 'N/A'
    ];
  });

  autoTable(doc, {
    startY: yPos,
    head: [['Check Type', 'Requirement', 'Status', 'Completed']],
    body: resultsData,
    theme: 'striped',
    styles: { fontSize: 9 },
    headStyles: { fillColor: [71, 85, 105], textColor: 255 },
    margin: { left: 20, right: 20 },
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;

  // Result Details
  check.results.forEach(result => {
    if (result.details) {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`${checkTypeLabels[result.checkType]} - Details`, 20, yPos);
      yPos += 6;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const detailsText = doc.splitTextToSize(result.details, 170);
      doc.text(detailsText, 20, yPos);
      yPos += detailsText.length * 5 + 10;
    }
  });

  // Consent Status
  if (consents.length > 0) {
    doc.addPage();
    yPos = 20;

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Consent Status', 20, yPos);
    yPos += 8;

    const consent = consents[0];
    const consentResponse = getConsentResponseByRequestId(consent.id);

    const consentData = [
      ['Status', consent.status.toUpperCase()],
      ['Sent Date', new Date(consent.sentDate).toLocaleDateString()],
      ['Viewed Date', consent.viewedDate ? new Date(consent.viewedDate).toLocaleDateString() : 'Not viewed'],
      ['Response Date', consent.respondedDate ? new Date(consent.respondedDate).toLocaleDateString() : 'No response'],
      ['Expiry Date', new Date(consent.expiryDate).toLocaleDateString()],
    ];

    if (consentResponse) {
      consentData.push(['Decision', consentResponse.accepted ? 'ACCEPTED' : 'DECLINED']);
      if (consentResponse.ipAddress) {
        consentData.push(['IP Address', consentResponse.ipAddress]);
      }
    }

    autoTable(doc, {
      startY: yPos,
      body: consentData,
      theme: 'plain',
      styles: { fontSize: 10 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 60 },
        1: { cellWidth: 120 }
      },
      margin: { left: 20 },
    });

    yPos = (doc as any).lastAutoTable.finalY + 15;
  }

  // Referee Responses
  if (referees.length > 0) {
    doc.addPage();
    yPos = 20;

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Reference Check Summary', 20, yPos);
    yPos += 8;

    const refereeData = referees.map(referee => [
      referee.name,
      relationshipLabels[referee.relationship],
      referee.companyName || 'N/A',
      referee.status.toUpperCase(),
      referee.completedDate ? new Date(referee.completedDate).toLocaleDateString() : 'Pending'
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Name', 'Relationship', 'Company', 'Status', 'Completed']],
      body: refereeData,
      theme: 'striped',
      styles: { fontSize: 9 },
      headStyles: { fillColor: [71, 85, 105], textColor: 255 },
      margin: { left: 20, right: 20 },
    });

    yPos = (doc as any).lastAutoTable.finalY + 15;

    // Individual Referee Responses
    referees.forEach((referee, index) => {
      if (referee.response) {
        doc.addPage();
        yPos = 20;

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(`Reference from ${referee.name}`, 20, yPos);
        yPos += 6;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`${relationshipLabels[referee.relationship]} at ${referee.companyName || 'Unknown'}`, 20, yPos);
        yPos += 10;

        if (referee.response.overallRating) {
          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          doc.text(`Overall Rating: ${referee.response.overallRating}/5`, 20, yPos);
          yPos += 10;
        }

        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('Responses:', 20, yPos);
        yPos += 8;

        referee.response.answers.forEach((answer, idx) => {
          if (yPos > 260) {
            doc.addPage();
            yPos = 20;
          }

          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          const questionText = doc.splitTextToSize(`Q${idx + 1}: ${answer.question}`, 170);
          doc.text(questionText, 20, yPos);
          yPos += questionText.length * 5 + 3;

          doc.setFont('helvetica', 'normal');
          let answerText: string;
          if (answer.type === 'rating') {
            answerText = `Rating: ${answer.value}/5`;
          } else if (answer.type === 'yes-no') {
            answerText = answer.value ? 'Yes' : 'No';
          } else {
            answerText = String(answer.value);
          }
          
          const answerLines = doc.splitTextToSize(answerText, 165);
          doc.text(answerLines, 25, yPos);
          yPos += answerLines.length * 5 + 8;
        });
      }
    });
  }

  // Review Notes
  if (check.reviewNotes) {
    doc.addPage();
    yPos = 20;

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Review Notes', 20, yPos);
    yPos += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Reviewed by: ${check.reviewedByName || 'Unknown'}`, 20, yPos);
    yPos += 8;

    const notesText = doc.splitTextToSize(check.reviewNotes, 170);
    doc.text(notesText, 20, yPos);
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.text(`Page ${i} of ${pageCount}`, 105, 290, { align: 'center' });
    doc.text('Confidential Background Check Report', 105, 285, { align: 'center' });
  }

  doc.save(`Background_Check_${check.candidateName.replace(/\s+/g, '_')}_${Date.now()}.pdf`);
}
