import { 
  ATSSubscriptionTier, 
  AddonService, 
  RecruitmentService, 
  CustomPricing, 
  PricingHistory 
} from '@/shared/types/pricing';

// HRM8 ATS Subscription Tiers - Real Pricing Data
const mockTiers: ATSSubscriptionTier[] = [
  {
    id: 'ats-lite',
    name: 'ATS Lite',
    description: 'Essential recruitment tools for small businesses',
    monthlyPrice: 0,
    annualPrice: 0,
    annualDiscount: 0,
    maxJobs: 999999, // Unlimited
    maxUsers: 999999, // Unlimited
    features: [
      'Unlimited Users',
      'Unlimited Job Postings',
      'Core ATS Features',
      'Application Management',
      'Candidate Database',
      'Basic Reports & Analytics',
      'Email Notifications',
      'Standard Support',
    ],
    status: 'active',
    sortOrder: 1,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'payg',
    name: 'Pay As You Go',
    description: 'Flexible pricing with all advanced features',
    monthlyPrice: 195,
    annualPrice: 195,
    annualDiscount: 0,
    maxJobs: 999999, // Unlimited
    maxUsers: 999999, // Unlimited
    features: [
      'Unlimited Users',
      'Unlimited Job Postings',
      'All ATS Lite Features',
      'AI Screening & Matching',
      'Custom Application Forms',
      'Team Collaboration Tools',
      'Dedicated Talent Pool',
      'Branded Corporate Careers Page',
      'Location Manager',
      'Department Manager',
      'Standard Reports & Analytics',
    ],
    status: 'active',
    sortOrder: 2,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'small',
    name: 'SMALL',
    description: 'Perfect for growing businesses with moderate hiring needs',
    monthlyPrice: 295,
    annualPrice: 295,
    annualDiscount: 0,
    maxJobs: 5,
    maxUsers: 999999, // Unlimited
    features: [
      'Unlimited Users',
      '5 Open Job Postings',
      'All Pay As You Go Features',
      'Multi-Post Job Board Marketplace',
      'Post to HRM8 Job Board ($ charges apply)',
      'Direct Job Board Integration ($ charges apply)',
      'Advanced Reports & Analytics',
    ],
    popularBadge: true,
    status: 'active',
    sortOrder: 3,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'medium',
    name: 'MEDIUM',
    description: 'Ideal for established companies with regular recruitment',
    monthlyPrice: 495,
    annualPrice: 495,
    annualDiscount: 0,
    maxJobs: 25,
    maxUsers: 999999, // Unlimited
    features: [
      'Unlimited Users',
      '25 Open Job Postings',
      'All SMALL Plan Features',
      'Multi-Post Job Board Marketplace',
      'Post to HRM8 Job Board ($ charges apply)',
      'Direct Job Board Integration ($ charges apply)',
      'Advanced Reports & Analytics',
      'Priority Support',
    ],
    status: 'active',
    sortOrder: 4,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'large',
    name: 'LARGE',
    description: 'Comprehensive solution for high-volume recruitment',
    monthlyPrice: 695,
    annualPrice: 695,
    annualDiscount: 0,
    maxJobs: 50,
    maxUsers: 999999, // Unlimited
    features: [
      'Unlimited Users',
      '50 Open Job Postings',
      'All MEDIUM Plan Features',
      'Multi-Post Job Board Marketplace',
      'Post to HRM8 Job Board ($ charges apply)',
      'Direct Job Board Integration ($ charges apply)',
      'Advanced Reports & Analytics',
      'Dedicated Account Manager',
      '24/7 Priority Support',
    ],
    status: 'active',
    sortOrder: 5,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'enterprise',
    name: 'ENTERPRISE',
    description: 'Enterprise-grade solution with unlimited everything',
    monthlyPrice: 995,
    annualPrice: 995,
    annualDiscount: 0,
    maxJobs: 999999, // Unlimited
    maxUsers: 999999, // Unlimited
    features: [
      'Unlimited Users',
      'Unlimited Job Postings',
      'All LARGE Plan Features',
      'Division Manager',
      'Multi-Post Job Board Marketplace',
      'Post to HRM8 Job Board ($ charges apply)',
      'Direct Job Board Integration ($ charges apply)',
      'Advanced Reports & Analytics',
      'White-Label Options',
      'Custom SLA',
      'Executive Business Reviews',
    ],
    status: 'active',
    sortOrder: 6,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

// HRM8 Add-on Services - Real Pricing Data
const mockAddons: AddonService[] = [
  {
    id: 'assessments',
    name: 'Candidate Assessments',
    description: 'Pre-employment testing and skills assessment',
    pricingModel: 'per_use',
    basePrice: 0,
    pricePerUnit: 0,
    unitLabel: 'assessment based pricing',
    features: [
      'Skills-based Testing',
      'Personality Assessments',
      'Cognitive Ability Tests',
      'Custom Question Banks',
      'Automated Scoring & Reports',
      'Candidate Ranking',
    ],
    applicableTiers: ['payg', 'small', 'medium', 'large', 'enterprise'],
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'reference-check',
    name: 'Reference Checking',
    description: 'Automated reference verification service',
    pricingModel: 'per_use',
    basePrice: 0,
    pricePerUnit: 69,
    unitLabel: 'per candidate',
    features: [
      'Automated Reference Requests',
      'Structured Questionnaires',
      'Verification Reports',
      'Compliance Tracking',
      'Background Check Integration',
    ],
    applicableTiers: ['payg', 'small', 'medium', 'large', 'enterprise'],
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'video-interview',
    name: 'Video Interviewing',
    description: 'One-way and live video interview platform',
    pricingModel: 'per_use',
    basePrice: 0,
    pricePerUnit: 99,
    unitLabel: 'per job posting',
    features: [
      'One-Way Video Interviews',
      'Live Interview Scheduling',
      'Interview Recording & Playback',
      'AI-Powered Insights',
      'Interview Templates',
      'Candidate Evaluation Tools',
    ],
    applicableTiers: ['payg', 'small', 'medium', 'large', 'enterprise'],
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'hrms',
    name: 'HRMS Integration',
    description: 'Full employee lifecycle management system (ᶧ charged in blocks of 50 employees paid annually)',
    pricingModel: 'per_use',
    basePrice: 300,
    pricePerUnit: 6,
    unitLabel: 'per employee/month (minimum 50)',
    features: [
      'Employee Records Management',
      'Time & Attendance Tracking',
      'Leave Management System',
      'Performance Reviews',
      'Document Management',
      'Payroll Integration',
      'Benefits Administration',
    ],
    applicableTiers: ['payg', 'small', 'medium', 'large', 'enterprise'],
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

// HRM8 Recruitment Services - Real Pricing Data
const mockRecruitmentServices: RecruitmentService[] = [
  {
    id: 'shortlisting',
    name: 'Shortlisting Service',
    description: 'Professional candidate screening and shortlisting',
    serviceType: 'shortlisting',
    pricingModel: 'flat',
    baseFee: 1990,
    estimatedDuration: '2-3 weeks',
    features: [
      'CV Screening & Filtering',
      'Initial Phone Screening',
      'Shortlist of 5-10 Qualified Candidates',
      'Detailed Candidate Summaries',
      'Interview Scheduling Support',
    ],
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'full-service',
    name: 'Standard Recruitment Service',
    description: 'End-to-end recruitment support',
    serviceType: 'full-service',
    pricingModel: 'flat',
    baseFee: 5990,
    estimatedDuration: '4-6 weeks',
    features: [
      'Job Posting & Advertising',
      'Full Candidate Sourcing',
      'Screening & Interviewing',
      'Skills Assessment',
      'Reference Checks',
      'Offer Negotiation Support',
      '90-Day Replacement Guarantee',
    ],
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'executive-search-under-100k',
    name: 'Executive Search (Under $100k)',
    description: 'Senior leadership recruitment for positions up to $100,000 annual salary',
    serviceType: 'executive-search',
    pricingModel: 'flat',
    baseFee: 9990,
    minFee: 9990,
    maxFee: 9990,
    estimatedDuration: '6-8 weeks',
    features: [
      'Confidential Search Process',
      'Market Mapping & Analysis',
      'Direct Headhunting',
      'Comprehensive Candidate Assessment',
      'Background Verification',
      'Offer Negotiation',
      '6-Month Replacement Guarantee',
    ],
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'executive-search-over-100k',
    name: 'Executive Search (Over $100k)',
    description: 'Premium executive recruitment for positions over $100,000 annual salary',
    serviceType: 'executive-search',
    pricingModel: 'flat',
    baseFee: 14990,
    minFee: 14990,
    estimatedDuration: '8-12 weeks',
    features: [
      'Confidential Search Process',
      'Extensive Market Mapping',
      'Direct Headhunting & Networking',
      'Comprehensive Assessment & Profiling',
      'Full Background & Reference Verification',
      'Offer Negotiation & Onboarding Support',
      '6-Month Replacement Guarantee',
      'Executive Integration Support',
    ],
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'rpo',
    name: 'Recruitment Process Outsourcing (RPO)',
    description: 'Dedicated recruitment team - $5,990/month per consultant + $3,990 per vacancy',
    serviceType: 'rpo',
    pricingModel: 'tiered',
    baseFee: 5990,
    minFee: 5990,
    estimatedDuration: 'Ongoing monthly engagement',
    features: [
      'Dedicated Recruitment Consultant',
      'Full Recruitment Lifecycle Management',
      'Employer Branding Support',
      'Talent Pipeline Development',
      'Recruitment Metrics & Reporting',
      'Scalable Solution',
      'Per-Vacancy Fee: $3,990',
      'Flexible Monthly Commitment',
    ],
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

// In-memory storage
const tiers = [...mockTiers];
const addons = [...mockAddons];
const recruitmentServices = [...mockRecruitmentServices];
const customPricing: CustomPricing[] = [];
const history: PricingHistory[] = [];

// ATS Subscription Tier Functions
export function getATSSubscriptionTiers(includeInactive = false): ATSSubscriptionTier[] {
  const filtered = includeInactive ? tiers : tiers.filter(t => t.status === 'active');
  return filtered.sort((a, b) => a.sortOrder - b.sortOrder);
}

export function getATSSubscriptionTier(id: string): ATSSubscriptionTier | undefined {
  return tiers.find(t => t.id === id);
}

export function createATSSubscriptionTier(
  tier: Omit<ATSSubscriptionTier, 'id' | 'createdAt' | 'updatedAt'>
): ATSSubscriptionTier {
  const newTier: ATSSubscriptionTier = {
    ...tier,
    id: `tier-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  tiers.push(newTier);
  
  // Record history
  history.push({
    id: `history-${Date.now()}`,
    entityType: 'tier',
    entityId: newTier.id,
    changes: { ...tier },
    previousValues: {},
    changedBy: 'system',
    changedAt: new Date().toISOString(),
    reason: 'Created new tier',
  });
  
  return newTier;
}

export function updateATSSubscriptionTier(
  id: string,
  updates: Partial<ATSSubscriptionTier>,
  changedBy: string,
  reason?: string
): ATSSubscriptionTier | null {
  const index = tiers.findIndex(t => t.id === id);
  if (index === -1) return null;

  const previousValues = { ...tiers[index] };
  tiers[index] = {
    ...tiers[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  // Record history
  history.push({
    id: `history-${Date.now()}`,
    entityType: 'tier',
    entityId: id,
    changes: updates,
    previousValues,
    changedBy,
    changedAt: new Date().toISOString(),
    reason,
  });

  return tiers[index];
}

export function deleteATSSubscriptionTier(id: string): boolean {
  const index = tiers.findIndex(t => t.id === id);
  if (index === -1) return false;
  
  tiers.splice(index, 1);
  return true;
}

// Add-on Service Functions
export function getAddonServices(includeInactive = false): AddonService[] {
  return includeInactive ? addons : addons.filter(a => a.status === 'active');
}

export function getAddonService(id: string): AddonService | undefined {
  return addons.find(a => a.id === id);
}

export function createAddonService(
  addon: Omit<AddonService, 'id' | 'createdAt' | 'updatedAt'>
): AddonService {
  const newAddon: AddonService = {
    ...addon,
    id: `addon-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  addons.push(newAddon);
  return newAddon;
}

export function updateAddonService(
  id: string,
  updates: Partial<AddonService>,
  changedBy: string = 'system',
  reason?: string
): AddonService | null {
  const index = addons.findIndex(a => a.id === id);
  if (index === -1) return null;

  const previousValues = { ...addons[index] };
  addons[index] = {
    ...addons[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  history.push({
    id: `history-${Date.now()}`,
    entityType: 'addon',
    entityId: id,
    changes: updates,
    previousValues,
    changedBy,
    changedAt: new Date().toISOString(),
    reason,
  });

  return addons[index];
}

export function deleteAddonService(id: string): boolean {
  const index = addons.findIndex(a => a.id === id);
  if (index === -1) return false;
  addons.splice(index, 1);
  return true;
}

// Recruitment Service Functions
export function getRecruitmentServices(includeInactive = false): RecruitmentService[] {
  return includeInactive ? recruitmentServices : recruitmentServices.filter(r => r.status === 'active');
}

export function getRecruitmentService(id: string): RecruitmentService | undefined {
  return recruitmentServices.find(r => r.id === id);
}

export function createRecruitmentService(
  service: Omit<RecruitmentService, 'id' | 'createdAt' | 'updatedAt'>
): RecruitmentService {
  const newService: RecruitmentService = {
    ...service,
    id: `service-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  recruitmentServices.push(newService);
  return newService;
}

export function updateRecruitmentService(
  id: string,
  updates: Partial<RecruitmentService>,
  changedBy: string = 'system',
  reason?: string
): RecruitmentService | null {
  const index = recruitmentServices.findIndex(r => r.id === id);
  if (index === -1) return null;

  const previousValues = { ...recruitmentServices[index] };
  recruitmentServices[index] = {
    ...recruitmentServices[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  history.push({
    id: `history-${Date.now()}`,
    entityType: 'recruitment',
    entityId: id,
    changes: updates,
    previousValues,
    changedBy,
    changedAt: new Date().toISOString(),
    reason,
  });

  return recruitmentServices[index];
}

export function deleteRecruitmentService(id: string): boolean {
  const index = recruitmentServices.findIndex(r => r.id === id);
  if (index === -1) return false;
  recruitmentServices.splice(index, 1);
  return true;
}

// Custom Pricing Functions
export function getCustomPricing(employerId?: string): CustomPricing[] {
  if (employerId) {
    return customPricing.filter(cp => cp.employerId === employerId);
  }
  return customPricing;
}

export function createCustomPricing(
  pricing: Omit<CustomPricing, 'id' | 'createdAt' | 'updatedAt'>
): CustomPricing {
  const newPricing: CustomPricing = {
    ...pricing,
    id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  customPricing.push(newPricing);
  return newPricing;
}

// History Functions
export function getPricingHistory(entityType?: string, entityId?: string): PricingHistory[] {
  let filtered = history;
  
  if (entityType) {
    filtered = filtered.filter(h => h.entityType === entityType);
  }
  
  if (entityId) {
    filtered = filtered.filter(h => h.entityId === entityId);
  }
  
  return filtered.sort((a, b) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime());
}
