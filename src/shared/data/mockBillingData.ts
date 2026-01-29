import type { Invoice, InvoiceLineItem } from '@/shared/types/billing';

export const mockInvoices: Invoice[] = [
  {
    id: 'inv-2025-0001',
    invoiceNumber: 'INV-2025-0001',
    employerId: 'emp-1',
    employerName: 'TechCorp Solutions',
    status: 'paid',
    issueDate: new Date('2025-01-01'),
    dueDate: new Date('2025-01-15'),
    paidDate: new Date('2025-01-10'),
    lineItems: [
      {
        id: 'li-1',
        description: 'Medium Plan - Monthly Subscription',
        quantity: 1,
        unitPrice: 495,
        total: 495,
        type: 'subscription',
        metadata: { tier: 'medium', period: 'monthly' }
      },
      {
        id: 'li-2',
        description: 'Senior Software Engineer - Standard Recruitment',
        quantity: 1,
        unitPrice: 5990,
        total: 5990,
        type: 'recruitment_service',
        metadata: { jobId: 'job-1', serviceType: 'full-service' }
      }
    ],
    subtotal: 6485,
    tax: 648.5,
    total: 7133.5,
    notes: 'Thank you for your business!',
    paymentMethod: 'credit_card',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-10')
  },
  {
    id: 'inv-2025-0002',
    invoiceNumber: 'INV-2025-0002',
    employerId: 'emp-1',
    employerName: 'TechCorp Solutions',
    status: 'pending',
    issueDate: new Date('2025-02-01'),
    dueDate: new Date('2025-02-15'),
    lineItems: [
      {
        id: 'li-3',
        description: 'Medium Plan - Monthly Subscription',
        quantity: 1,
        unitPrice: 495,
        total: 495,
        type: 'subscription',
        metadata: { tier: 'medium', period: 'monthly' }
      },
      {
        id: 'li-4',
        description: 'JobTarget Promotion - Premium Bundle',
        quantity: 1,
        unitPrice: 999,
        total: 999,
        type: 'job_promotion',
        metadata: { jobId: 'job-2', budgetTier: 'premium' }
      }
    ],
    subtotal: 1494,
    tax: 149.4,
    total: 1643.4,
    notes: 'Payment due within 15 days',
    createdAt: new Date('2025-02-01'),
    updatedAt: new Date('2025-02-01')
  },
  {
    id: 'inv-2025-0003',
    invoiceNumber: 'INV-2025-0003',
    employerId: 'emp-1',
    employerName: 'TechCorp Solutions',
    status: 'overdue',
    issueDate: new Date('2024-12-01'),
    dueDate: new Date('2024-12-15'),
    lineItems: [
      {
        id: 'li-5',
        description: 'Medium Plan - Monthly Subscription',
        quantity: 1,
        unitPrice: 495,
        total: 495,
        type: 'subscription',
        metadata: { tier: 'medium', period: 'monthly' }
      }
    ],
    subtotal: 495,
    tax: 49.5,
    total: 544.5,
    notes: 'OVERDUE - Please remit payment immediately',
    createdAt: new Date('2024-12-01'),
    updatedAt: new Date('2024-12-01')
  },
  {
    id: 'inv-2025-0004',
    invoiceNumber: 'INV-2025-0004',
    employerId: 'emp-1',
    employerName: 'TechCorp Solutions',
    status: 'draft',
    issueDate: new Date('2025-03-01'),
    dueDate: new Date('2025-03-15'),
    lineItems: [
      {
        id: 'li-6',
        description: 'Medium Plan - Monthly Subscription',
        quantity: 1,
        unitPrice: 495,
        total: 495,
        type: 'subscription',
        metadata: { tier: 'medium', period: 'monthly' }
      }
    ],
    subtotal: 495,
    tax: 49.5,
    total: 544.5,
    notes: 'Draft invoice - not yet sent',
    createdAt: new Date('2025-03-01'),
    updatedAt: new Date('2025-03-01')
  }
];

export interface Transaction {
  id: string;
  type: 'payment' | 'refund' | 'adjustment' | 'subscription' | 'service_fee';
  amount: number;
  description: string;
  date: Date;
  status: 'completed' | 'pending' | 'failed';
  invoiceId?: string;
  paymentMethod?: string;
  metadata?: Record<string, any>;
}

export const mockTransactions: Transaction[] = [
  {
    id: 'txn-1',
    type: 'payment',
    amount: 7133.5,
    description: 'Payment for Invoice INV-2025-0001',
    date: new Date('2025-01-10'),
    status: 'completed',
    invoiceId: 'inv-2025-0001',
    paymentMethod: 'Visa •••• 4242'
  },
  {
    id: 'txn-2',
    type: 'subscription',
    amount: 495,
    description: 'Medium Plan - Monthly Subscription',
    date: new Date('2025-02-01'),
    status: 'completed',
    paymentMethod: 'Visa •••• 4242'
  },
  {
    id: 'txn-3',
    type: 'service_fee',
    amount: 5990,
    description: 'Standard Recruitment Service - Senior Software Engineer',
    date: new Date('2025-01-05'),
    status: 'completed',
    invoiceId: 'inv-2025-0001'
  },
  {
    id: 'txn-4',
    type: 'payment',
    amount: 544.5,
    description: 'Payment attempt for Invoice INV-2025-0003',
    date: new Date('2024-12-20'),
    status: 'failed',
    invoiceId: 'inv-2025-0003',
    paymentMethod: 'Visa •••• 4242'
  },
  {
    id: 'txn-5',
    type: 'adjustment',
    amount: -50,
    description: 'Credit adjustment for service delay',
    date: new Date('2025-01-15'),
    status: 'completed'
  }
];
