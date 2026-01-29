import { getEmployerById } from './employerService';
import { createPayment, addLineItemToInvoice, getCurrentDraftInvoice, createInvoice, generateInvoiceNumber } from './billingStorage';
import type { JobPayment, ServicePricing } from '@/shared/types/billing';
import { SERVICE_PRICING } from '@/shared/types/billing';
import { PAYG_JOB_POSTING_COST } from './subscriptionConfig';
import { createServiceProject } from './recruitmentServiceStorage';
import type { ServiceType } from '@/shared/types/recruitmentService';

export function calculateServicePricing(
  serviceType: 'self-managed' | 'shortlisting' | 'full-service' | 'executive-search' | 'rpo',
  salaryRange?: { min: number; max: number }
): ServicePricing {
  let baseFee = 0;
  let upfrontPercentage = 0;
  
  if (serviceType === 'self-managed' || serviceType === 'rpo') {
    baseFee = 0;
    upfrontPercentage = 0;
  } else if (serviceType === 'shortlisting' || serviceType === 'full-service') {
    const config = SERVICE_PRICING[serviceType];
    baseFee = config.baseFee;
    upfrontPercentage = config.upfrontPercentage;
  } else if (serviceType === 'executive-search') {
    const avgSalary = salaryRange ? (salaryRange.min + salaryRange.max) / 2 : 0;
    baseFee = avgSalary > 100000 
      ? SERVICE_PRICING['executive-search'].baseFeeOver100k 
      : SERVICE_PRICING['executive-search'].baseFeeUnder100k;
    upfrontPercentage = SERVICE_PRICING['executive-search'].upfrontPercentage;
  }
  
  const upfrontServiceFee = baseFee * upfrontPercentage;
  const totalUpfront = upfrontServiceFee;
  const balanceOnCompletion = baseFee * (1 - upfrontPercentage);
  
  return {
    serviceType,
    baseFee,
    upfrontPercentage,
    jobTargetBudget: 0,
    totalUpfront,
    balanceOnCompletion
  };
}

export function calculateJobPostingCost(employerId: string): number {
  const employer = getEmployerById(employerId);
  if (!employer) return 0;

  // Subscription users (except ATS Lite and PAYG) - included in plan
  if (employer.subscriptionTier && employer.subscriptionTier !== 'ats-lite' && employer.subscriptionTier !== 'payg') {
    return 0;
  }

  // ATS Lite tier - first job free
  if (employer.subscriptionTier === 'ats-lite' && !employer.hasUsedFreeTier) {
    return 0;
  }

  // PAYG users or ATS Lite after first job
  return PAYG_JOB_POSTING_COST;
}

export function calculateTotalJobCost(
  employerId: string,
  serviceType: 'self-managed' | 'shortlisting' | 'full-service' | 'executive-search' | 'rpo',
  salaryRange?: { min: number; max: number }
): {
  jobPostingCost: number;
  recruitmentServiceCost: number;
  upfrontRecruitmentCost: number;
  balanceRecruitmentCost: number;
  totalUpfront: number;
} {
  const jobPostingCost = calculateJobPostingCost(employerId);
  const servicePricing = calculateServicePricing(serviceType, salaryRange);

  return {
    jobPostingCost,
    recruitmentServiceCost: servicePricing.baseFee,
    upfrontRecruitmentCost: servicePricing.totalUpfront,
    balanceRecruitmentCost: servicePricing.balanceOnCompletion,
    totalUpfront: jobPostingCost + servicePricing.totalUpfront
  };
}

export function canUseAccountBilling(employerId: string, amount: number): boolean {
  const employer = getEmployerById(employerId);
  if (!employer || employer.accountType !== 'approved') return false;
  
  const currentBalance = employer.currentBalance || 0;
  const creditLimit = employer.creditLimit || 0;
  
  return (currentBalance + amount) <= creditLimit;
}

export async function processAccountPayment(
  jobId: string,
  employerId: string,
  pricing: ServicePricing,
  invoiceRequested: boolean = false
): Promise<{ success: boolean; paymentId?: string; error?: string }> {
  const employer = getEmployerById(employerId);
  
  if (!employer) {
    return { success: false, error: 'Employer not found' };
  }
  
  if (employer.accountType === 'payg' && invoiceRequested) {
    const jobPostingCost = calculateJobPostingCost(employerId);
    
    const payment: JobPayment = {
      id: `payment-${Date.now()}`,
      jobId,
      employerId,
      employerName: employer.name,
      
      jobPostingCost,
      jobPostingPaymentStatus: 'pending',
      jobPostingPaymentMethod: 'account',
      
      serviceType: pricing.serviceType,
      serviceFee: pricing.baseFee,
      upfrontServiceAmount: pricing.totalUpfront,
      balanceServiceAmount: pricing.balanceOnCompletion,
      
      upfrontServicePaymentStatus: pricing.serviceType === 'self-managed' ? 'not_applicable' : 'pending',
      upfrontServicePaymentMethod: 'account',
      
      balanceServicePaymentStatus: pricing.serviceType === 'self-managed' ? 'not_applicable' : 'pending',
      
      totalUpfront: jobPostingCost + pricing.totalUpfront,
      totalAmount: jobPostingCost + pricing.baseFee,
      
      invoiceRequested: true,
      invoiceRequestedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    createPayment(payment);
    
    return { 
      success: true, 
      paymentId: payment.id,
      error: 'INVOICE_REQUESTED'
    };
  }
  
  if (employer.accountType !== 'approved') {
    return { success: false, error: 'Not an approved account' };
  }
  
  const jobPostingCost = calculateJobPostingCost(employerId);
  const totalUpfront = jobPostingCost + pricing.totalUpfront;
  
  if (!canUseAccountBilling(employerId, totalUpfront)) {
    return { success: false, error: 'Credit limit exceeded' };
  }
  
  const payment: JobPayment = {
    id: `payment-${Date.now()}`,
    jobId,
    employerId,
    employerName: employer.name,
    
    jobPostingCost,
    jobPostingPaymentStatus: jobPostingCost > 0 ? 'paid' : 'waived',
    jobPostingPaymentMethod: jobPostingCost > 0 ? 'account' : undefined,
    
    serviceType: pricing.serviceType,
    serviceFee: pricing.baseFee,
    upfrontServiceAmount: pricing.totalUpfront,
    balanceServiceAmount: pricing.balanceOnCompletion,
    
    upfrontServicePaymentStatus: pricing.serviceType === 'self-managed' ? 'not_applicable' : 'paid',
    upfrontServicePaymentMethod: pricing.serviceType === 'self-managed' ? undefined : 'account',
    upfrontServicePaymentDate: pricing.serviceType === 'self-managed' ? undefined : new Date(),
    
    balanceServicePaymentStatus: pricing.serviceType === 'self-managed' ? 'not_applicable' : 'pending',
    
    totalUpfront,
    totalAmount: jobPostingCost + pricing.baseFee,
    
    invoiceRequested: false,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  createPayment(payment);
  
  // Create service project if a paid recruitment service was selected
  if (pricing.serviceType !== 'self-managed' && pricing.baseFee > 0) {
    createServiceProject({
      name: `Recruitment Service for Job #${jobId}`,
      serviceType: pricing.serviceType as ServiceType,
      status: 'active',
      priority: 'medium',
      stage: 'initiated',
      
      clientId: employerId,
      clientName: employer.name,
      clientLogo: employer.logo,
      location: employer.location,
      country: 'USA',
      
      consultants: [],
      
      progress: 0,
      candidatesShortlisted: 0,
      candidatesInterviewed: 0,
      numberOfVacancies: 1,
      
      jobId,
      jobPaymentId: payment.id,
      projectValue: pricing.baseFee,
      upfrontPaid: pricing.totalUpfront,
      balanceDue: pricing.balanceOnCompletion,
      currency: 'USD',
      
      startDate: new Date().toISOString(),
      deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    });
  }
  
  let invoice = getCurrentDraftInvoice(employerId);
  if (!invoice) {
    invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: generateInvoiceNumber(),
      employerId,
      employerName: employer.name,
      status: 'draft',
      issueDate: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      lineItems: [],
      subtotal: 0,
      tax: 0,
      taxRate: 0,
      total: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    createInvoice(invoice);
  }
  
  const lineItemDescription = pricing.serviceType === 'self-managed'
    ? `JobTarget Job Board Promotion`
    : `${SERVICE_PRICING[pricing.serviceType].name} - Upfront Payment`;
  
  addLineItemToInvoice(invoice.id, {
    id: `line-${Date.now()}`,
    description: lineItemDescription,
    jobId,
    paymentId: payment.id,
    quantity: 1,
    unitPrice: pricing.totalUpfront,
    total: pricing.totalUpfront,
    dateAdded: new Date()
  });
  
  return { success: true, paymentId: payment.id };
}

export async function processCreditCardPayment(
  jobId: string,
  employerId: string,
  pricing: ServicePricing,
  stripePaymentIntentId: string
): Promise<{ success: boolean; paymentId?: string; error?: string }> {
  const employer = getEmployerById(employerId);
  
  if (!employer) {
    return { success: false, error: 'Employer not found' };
  }
  
  const jobPostingCost = calculateJobPostingCost(employerId);
  const totalUpfront = jobPostingCost + pricing.totalUpfront;
  
  const payment: JobPayment = {
    id: `payment-${Date.now()}`,
    jobId,
    employerId,
    employerName: employer.name,
    
    jobPostingCost,
    jobPostingPaymentStatus: jobPostingCost > 0 ? 'paid' : 'waived',
    jobPostingPaymentMethod: jobPostingCost > 0 ? 'credit_card' : undefined,
    
    serviceType: pricing.serviceType,
    serviceFee: pricing.baseFee,
    upfrontServiceAmount: pricing.totalUpfront,
    balanceServiceAmount: pricing.balanceOnCompletion,
    
    upfrontServicePaymentStatus: pricing.serviceType === 'self-managed' ? 'not_applicable' : 'paid',
    upfrontServicePaymentMethod: pricing.serviceType === 'self-managed' ? undefined : 'credit_card',
    upfrontServicePaymentDate: pricing.serviceType === 'self-managed' ? undefined : new Date(),
    upfrontStripePaymentIntentId: pricing.serviceType === 'self-managed' ? undefined : stripePaymentIntentId,
    
    balanceServicePaymentStatus: pricing.serviceType === 'self-managed' ? 'not_applicable' : 'pending',
    
    totalUpfront,
    totalAmount: jobPostingCost + pricing.baseFee,
    
    invoiceRequested: false,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  createPayment(payment);
  
  // Create service project if a paid recruitment service was selected
  if (pricing.serviceType !== 'self-managed' && pricing.baseFee > 0) {
    createServiceProject({
      name: `Recruitment Service for Job #${jobId}`,
      serviceType: pricing.serviceType as ServiceType,
      status: 'active',
      priority: 'medium',
      stage: 'initiated',
      
      clientId: employerId,
      clientName: employer.name,
      clientLogo: employer.logo,
      location: employer.location,
      country: 'USA',
      
      consultants: [],
      
      progress: 0,
      candidatesShortlisted: 0,
      candidatesInterviewed: 0,
      numberOfVacancies: 1,
      
      jobId,
      jobPaymentId: payment.id,
      projectValue: pricing.baseFee,
      upfrontPaid: pricing.totalUpfront,
      balanceDue: pricing.balanceOnCompletion,
      currency: 'USD',
      
      startDate: new Date().toISOString(),
      deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    });
  }
  
  return { success: true, paymentId: payment.id };
}
