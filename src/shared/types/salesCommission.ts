export type CommissionStatus = 'pending' | 'approved' | 'paid' | 'rejected';

export interface SalesCommission {
  id: string;
  salesAgentId: string;
  salesAgentName: string;
  opportunityId: string;
  opportunityName: string;
  employerId: string;
  employerName: string;
  
  dealValue: number;
  commissionRate: number; // percentage
  commissionAmount: number;
  status: CommissionStatus;
  
  calculatedAt: string;
  approvedAt?: string;
  paidAt?: string;
  paymentMethod?: string;
  
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
