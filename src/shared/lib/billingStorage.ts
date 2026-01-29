import type { JobPayment, JobTargetPromotion, Invoice, InvoiceLineItem } from '@/shared/types/billing';

const PAYMENTS_KEY = 'hrm8_job_payments';
const PROMOTIONS_KEY = 'hrm8_jobtarget_promotions';
const INVOICES_KEY = 'hrm8_invoices';

// Payment Management
export function getPayments(): JobPayment[] {
  const stored = localStorage.getItem(PAYMENTS_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function getPaymentById(id: string): JobPayment | undefined {
  return getPayments().find(p => p.id === id);
}

export function getPaymentByJobId(jobId: string): JobPayment | undefined {
  return getPayments().find(p => p.jobId === jobId);
}

export function createPayment(payment: JobPayment): void {
  const payments = getPayments();
  payments.push(payment);
  localStorage.setItem(PAYMENTS_KEY, JSON.stringify(payments));
}

export function updatePayment(id: string, updates: Partial<JobPayment>): void {
  const payments = getPayments();
  const index = payments.findIndex(p => p.id === id);
  if (index !== -1) {
    payments[index] = { ...payments[index], ...updates, updatedAt: new Date() };
    localStorage.setItem(PAYMENTS_KEY, JSON.stringify(payments));
  }
}

// Promotion Management
export function getPromotions(): JobTargetPromotion[] {
  const stored = localStorage.getItem(PROMOTIONS_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function getPromotionsByJob(jobId: string): JobTargetPromotion[] {
  return getPromotions().filter(p => p.jobId === jobId);
}

export function createPromotion(promotion: JobTargetPromotion): void {
  const promotions = getPromotions();
  promotions.push(promotion);
  localStorage.setItem(PROMOTIONS_KEY, JSON.stringify(promotions));
}

export function updatePromotion(id: string, updates: Partial<JobTargetPromotion>): void {
  const promotions = getPromotions();
  const index = promotions.findIndex(p => p.id === id);
  if (index !== -1) {
    promotions[index] = { ...promotions[index], ...updates, updatedAt: new Date() };
    localStorage.setItem(PROMOTIONS_KEY, JSON.stringify(promotions));
  }
}

export function allocateBudgetToBoards(
  paymentId: string,
  boards: Array<{ name: string; cost: number; duration: number }>
): JobTargetPromotion {
  const payment = getPaymentById(paymentId);
  if (!payment) throw new Error('Payment not found');
  
  const totalCost = boards.reduce((sum, b) => sum + b.cost, 0);
  
  const promotion: JobTargetPromotion = {
    id: `promo-${Date.now()}`,
    jobId: payment.jobId,
    jobTitle: '',
    paymentId,
    boards: boards.map(b => ({
      name: b.name,
      cost: b.cost,
      duration: b.duration,
      startDate: new Date(),
      endDate: new Date(Date.now() + b.duration * 24 * 60 * 60 * 1000),
      status: 'active'
    })),
    totalCost,
    remainingBudget: 0,
    status: 'active',
    submittedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  createPromotion(promotion);
  
  return promotion;
}

// Invoice Management
export function getInvoices(): Invoice[] {
  const stored = localStorage.getItem(INVOICES_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function getInvoicesByEmployer(employerId: string): Invoice[] {
  return getInvoices().filter(i => i.employerId === employerId);
}

export function getCurrentDraftInvoice(employerId: string): Invoice | undefined {
  return getInvoices().find(i => i.employerId === employerId && i.status === 'draft');
}

export function createInvoice(invoice: Invoice): void {
  const invoices = getInvoices();
  invoices.push(invoice);
  localStorage.setItem(INVOICES_KEY, JSON.stringify(invoices));
}

export function addLineItemToInvoice(invoiceId: string, lineItem: InvoiceLineItem): void {
  const invoices = getInvoices();
  const index = invoices.findIndex(i => i.id === invoiceId);
  if (index !== -1) {
    invoices[index].lineItems.push(lineItem);
    invoices[index].subtotal += lineItem.total;
    invoices[index].total = invoices[index].subtotal + invoices[index].tax;
    localStorage.setItem(INVOICES_KEY, JSON.stringify(invoices));
  }
}

export function generateInvoiceNumber(): string {
  const invoices = getInvoices();
  const year = new Date().getFullYear();
  const count = invoices.filter(i => i.invoiceNumber.startsWith(`INV-${year}`)).length;
  return `INV-${year}-${String(count + 1).padStart(4, '0')}`;
}
