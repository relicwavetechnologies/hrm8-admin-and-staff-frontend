export type OpportunityType = 'new-business' | 'upsell' | 'renewal' | 'cross-sell';
export type OpportunityProductType = 'ats-subscription' | 'hrms-subscription' | 'recruitment-service' | 'rpo-service' | 'addon';
export type OpportunityStage = 'prospecting' | 'qualification' | 'proposal' | 'negotiation' | 'closed-won' | 'closed-lost';
export type OpportunityPriority = 'low' | 'medium' | 'high' | 'critical';
export type LeadSource = 'inbound' | 'outbound' | 'referral' | 'partner' | 'event' | 'other';

export interface SalesOpportunity {
  id: string;
  employerId: string;
  employerName: string;
  salesAgentId: string;
  salesAgentName: string;
  
  // Opportunity Details
  name: string; // e.g., "Acme Corp - Enterprise ATS Upgrade"
  type: OpportunityType;
  productType: OpportunityProductType;
  
  // Financial
  estimatedValue: number;
  probability: number; // 0-100%
  expectedCloseDate: string;
  
  // Sales Pipeline
  stage: OpportunityStage;
  priority: OpportunityPriority;
  
  // Tracking
  leadSource: LeadSource;
  nextSteps?: string;
  notes?: string;
  lostReason?: string; // If closed-lost
  
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
}
