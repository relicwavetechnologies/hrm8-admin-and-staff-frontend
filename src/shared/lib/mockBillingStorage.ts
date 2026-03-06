export interface Invoice {
  id: string;
  employerId: string;
  invoiceNumber: string;
  issueDate: Date;
  dueDate: Date;
  paidDate?: Date;
  status: 'draft' | 'pending' | 'paid' | 'overdue' | 'cancelled';
  subtotal: number;
  tax: number;
  total: number;
  items: InvoiceItem[];
  paymentMethod?: string;
  notes?: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  period?: string;
}

export interface PaymentHistory {
  id: string;
  employerId: string;
  invoiceId: string;
  amount: number;
  paymentDate: Date;
  paymentMethod: string;
  transactionId: string;
  status: 'success' | 'failed' | 'pending';
}

const STORAGE_KEY_INVOICES = 'hrm8_invoices';
const STORAGE_KEY_PAYMENTS = 'hrm8_payments';

// Generate mock invoices
function generateMockInvoices(): Invoice[] {
  const invoices: Invoice[] = [];
  const employerIds = ['1', '2', '3', '4', '5'];
  
  for (let i = 0; i < 50; i++) {
    const employerId = employerIds[i % employerIds.length];
    const issueDate = new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
    const dueDate = new Date(issueDate);
    dueDate.setDate(dueDate.getDate() + 30);
    
    const status = ['paid', 'paid', 'paid', 'pending', 'overdue'][Math.floor(Math.random() * 5)] as Invoice['status'];
    const paidDate = status === 'paid' ? new Date(dueDate.getTime() - Math.random() * 10 * 24 * 60 * 60 * 1000) : undefined;
    
    const subscriptionFee = [295, 495, 695][Math.floor(Math.random() * 3)];
    const hrmsEnabled = Math.random() > 0.5;
    const hrmsEmployeeCount = hrmsEnabled ? 50 + Math.floor(Math.random() * 5) * 50 : 0;
    const hrmsCost = hrmsEmployeeCount * 3;
    
    const items: InvoiceItem[] = [
      {
        id: `item-${i}-1`,
        description: 'ATS Subscription - Monthly',
        quantity: 1,
        unitPrice: subscriptionFee,
        total: subscriptionFee,
        period: `${issueDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`
      }
    ];
    
    if (hrmsEnabled) {
      items.push({
        id: `item-${i}-2`,
        description: `HRMS Add-on - ${hrmsEmployeeCount} employees`,
        quantity: hrmsEmployeeCount,
        unitPrice: 3,
        total: hrmsCost,
        period: `${issueDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`
      });
    }
    
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const tax = subtotal * 0.1;
    const total = subtotal + tax;
    
    invoices.push({
      id: `inv-${i + 1}`,
      employerId,
      invoiceNumber: `INV-2024-${String(i + 1).padStart(4, '0')}`,
      issueDate,
      dueDate,
      paidDate,
      status,
      subtotal,
      tax,
      total,
      items,
      paymentMethod: status === 'paid' ? ['Credit Card', 'Bank Transfer', 'PayPal'][Math.floor(Math.random() * 3)] : undefined,
      notes: i % 10 === 0 ? 'Thank you for your business!' : undefined
    });
  }
  
  return invoices;
}

function generateMockPayments(): PaymentHistory[] {
  const payments: PaymentHistory[] = [];
  const invoices = getInvoices().filter(inv => inv.status === 'paid');
  
  invoices.forEach((invoice, i) => {
    payments.push({
      id: `pay-${i + 1}`,
      employerId: invoice.employerId,
      invoiceId: invoice.id,
      amount: invoice.total,
      paymentDate: invoice.paidDate!,
      paymentMethod: invoice.paymentMethod!,
      transactionId: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      status: 'success'
    });
  });
  
  return payments;
}

function initializeStorage() {
  if (!localStorage.getItem(STORAGE_KEY_INVOICES)) {
    localStorage.setItem(STORAGE_KEY_INVOICES, JSON.stringify(generateMockInvoices()));
  }
  if (!localStorage.getItem(STORAGE_KEY_PAYMENTS)) {
    localStorage.setItem(STORAGE_KEY_PAYMENTS, JSON.stringify(generateMockPayments()));
  }
}

export function getInvoices(): Invoice[] {
  initializeStorage();
  const data = localStorage.getItem(STORAGE_KEY_INVOICES);
  if (!data) return [];
  return JSON.parse(data).map((inv: any) => ({
    ...inv,
    issueDate: new Date(inv.issueDate),
    dueDate: new Date(inv.dueDate),
    paidDate: inv.paidDate ? new Date(inv.paidDate) : undefined
  }));
}

export function getInvoicesByEmployer(employerId: string): Invoice[] {
  return getInvoices().filter(inv => inv.employerId === employerId);
}

export function getInvoiceById(id: string): Invoice | undefined {
  return getInvoices().find(inv => inv.id === id);
}

export function getPaymentHistory(employerId: string): PaymentHistory[] {
  initializeStorage();
  const data = localStorage.getItem(STORAGE_KEY_PAYMENTS);
  if (!data) return [];
  return JSON.parse(data)
    .filter((pay: any) => pay.employerId === employerId)
    .map((pay: any) => ({
      ...pay,
      paymentDate: new Date(pay.paymentDate)
    }));
}

export function createInvoice(invoice: Omit<Invoice, 'id' | 'invoiceNumber'>): Invoice {
  const invoices = getInvoices();
  const newInvoice: Invoice = {
    ...invoice,
    id: `inv-${Date.now()}`,
    invoiceNumber: `INV-2024-${String(invoices.length + 1).padStart(4, '0')}`
  };
  invoices.push(newInvoice);
  localStorage.setItem(STORAGE_KEY_INVOICES, JSON.stringify(invoices));
  return newInvoice;
}

export function updateInvoiceStatus(id: string, status: Invoice['status'], paidDate?: Date): void {
  const invoices = getInvoices();
  const index = invoices.findIndex(inv => inv.id === id);
  if (index !== -1) {
    invoices[index].status = status;
    if (paidDate) {
      invoices[index].paidDate = paidDate;
    }
    localStorage.setItem(STORAGE_KEY_INVOICES, JSON.stringify(invoices));
  }
}
