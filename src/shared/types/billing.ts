// Job Board Promotion Budget Tiers
export const JOBTARGET_BUDGET_TIERS = [
  {
    id: 'none',
    name: 'No Promotion',
    amount: 0,
    description: 'Post to HRM8 only',
    warning: 'Job will not be advertised on external job boards'
  },
  {
    id: 'basic',
    name: 'Basic',
    amount: 500,
    description: '1-2 job boards, 30 days',
    reach: '5M+ candidates'
  },
  {
    id: 'standard',
    name: 'Standard',
    amount: 1000,
    description: '3-4 job boards, 30 days',
    recommended: true,
    reach: '15M+ candidates'
  },
  {
    id: 'premium',
    name: 'Premium',
    amount: 2000,
    description: '5-6 job boards, 60 days',
    reach: '30M+ candidates'
  },
  {
    id: 'executive',
    name: 'Executive',
    amount: 3000,
    description: 'All major boards, 90 days',
    reach: '50M+ candidates'
  },
  {
    id: 'custom',
    name: 'Custom',
    amount: 0,
    description: 'Enter your own budget'
  }
];

// Service Pricing Configuration
export const SERVICE_PRICING = {
  'self-managed': {
    baseFee: 0,
    upfrontPercentage: 0,
    name: 'Self-Managed'
  },
  'shortlisting': {
    baseFee: 1990,
    upfrontPercentage: 1.0,
    name: 'Shortlisting Service'
  },
  'full-service': {
    baseFee: 5990,
    upfrontPercentage: 1.0,
    name: 'Full Service'
  },
  'executive-search': {
    baseFeeUnder100k: 9990,
    baseFeeOver100k: 14990,
    upfrontPercentage: 1.0,
    name: 'Executive Search'
  },
  'rpo': {
    baseFee: 25000,
    upfrontPercentage: 0.5,
    name: 'Recruitment Process Outsourcing'
  }
};

export interface ServicePricing {
  serviceType: 'self-managed' | 'shortlisting' | 'full-service' | 'executive-search' | 'rpo';
  baseFee: number;
  upfrontPercentage: number;
  jobTargetBudget: number;
  totalUpfront: number;
  balanceOnCompletion: number;
}

export interface JobPayment {
  id: string;
  jobId: string;
  employerId: string;
  employerName: string;

  // Job Posting Cost (Platform Fee)
  jobPostingCost: number;
  jobPostingPaymentStatus: 'pending' | 'paid' | 'waived';
  jobPostingPaymentMethod?: 'account' | 'credit_card';

  // Recruitment Service Cost (Add-on)
  serviceType: 'self-managed' | 'shortlisting' | 'full-service' | 'executive-search' | 'rpo';
  serviceFee: number;
  upfrontServiceAmount: number;
  balanceServiceAmount: number;

  upfrontServicePaymentStatus: 'pending' | 'paid' | 'not_applicable';
  upfrontServicePaymentMethod?: 'account' | 'credit_card';
  upfrontServicePaymentDate?: Date;
  upfrontStripePaymentIntentId?: string;

  balanceServicePaymentStatus: 'pending' | 'paid' | 'waived' | 'not_applicable';
  balanceServicePaymentDate?: Date;

  // Total
  totalUpfront: number;
  totalAmount: number;

  invoiceRequested: boolean;
  invoiceRequestedAt?: Date;
  upfrontInvoiceId?: string;
  balanceInvoiceId?: string;

  createdAt: Date;
  updatedAt: Date;
}

export interface JobTargetPromotion {
  id: string;
  jobId: string;
  jobTitle: string;
  paymentId: string;

  boards: Array<{
    name: string;
    cost: number;
    duration: number;
    startDate: Date;
    endDate: Date;
    status: 'pending' | 'active' | 'expired' | 'cancelled';
  }>;

  totalCost: number;
  remainingBudget: number;
  status: 'draft' | 'submitted' | 'active' | 'completed';
  submittedAt?: Date;
  submittedBy?: string;

  createdAt: Date;
  updatedAt: Date;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  employerId: string;
  employerName: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled' | 'pending';
  issueDate: Date;
  dueDate: Date;
  paidDate?: Date;
  lineItems: InvoiceLineItem[];
  subtotal: number;
  tax: number;
  taxRate?: number;
  total: number;
  notes?: string;
  paymentMethod?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InvoiceLineItem {
  id: string;
  description: string;
  jobId?: string;
  paymentId?: string;
  quantity: number;
  unitPrice: number;
  total: number;
  dateAdded?: Date;
  type?: 'subscription' | 'job_posting' | 'job_promotion' | 'recruitment_service' | 'other';
  metadata?: Record<string, any>;
}
