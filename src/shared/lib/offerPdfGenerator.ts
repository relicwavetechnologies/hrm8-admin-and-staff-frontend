import jsPDF from 'jspdf';
import { OfferLetter } from '@/shared/types/offer';

export function generateOfferPDF(offer: OfferLetter): void {
  const doc = new jsPDF();

  // Company Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Employment Offer Letter', 105, 20, { align: 'center' });

  // Date
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 35);

  // Candidate Info
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Candidate Information', 20, 50);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Name: ${offer.candidateName}`, 20, 58);
  doc.text(`Email: ${offer.candidateEmail}`, 20, 64);

  // Position Details
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Position Details', 20, 80);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Position: ${offer.jobTitle}`, 20, 88);
  doc.text(`Employment Type: ${offer.offerType}`, 20, 94);
  doc.text(`Start Date: ${new Date(offer.startDate).toLocaleDateString()}`, 20, 100);

  // Compensation
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Compensation', 20, 116);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Salary: ${offer.salaryCurrency} ${offer.salary.toLocaleString()} per ${offer.salaryPeriod}`, 20, 124);

  if (offer.bonusStructure) {
    doc.text(`Bonus: ${offer.bonusStructure}`, 20, 130);
  }

  // Work Arrangement
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Work Details', 20, 146);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Location: ${offer.workLocation}`, 20, 154);
  doc.text(`Arrangement: ${offer.workArrangement}`, 20, 160);

  if (offer.probationPeriod) {
    doc.text(`Probation Period: ${offer.probationPeriod} months`, 20, 166);
  }

  if (offer.vacationDays) {
    doc.text(`Vacation Days: ${offer.vacationDays} days per year`, 20, 172);
  }

  // Benefits
  if (offer.benefits && offer.benefits.length > 0) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Benefits', 20, 188);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    let yPos = 196;
    offer.benefits.forEach((benefit) => {
      doc.text(`• ${benefit}`, 25, yPos);
      yPos += 6;
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
    });
  }

  // Custom Message
  if (offer.customMessage) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Additional Information', 20, 230);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const splitMessage = doc.splitTextToSize(offer.customMessage, 170);
    doc.text(splitMessage, 20, 238);
  }

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text('This offer is contingent upon successful completion of background checks and reference verification.', 105, 280, { align: 'center' });

  // Download
  doc.save(`Offer_Letter_${offer.candidateName.replace(/\s+/g, '_')}_${Date.now()}.pdf`);
}
