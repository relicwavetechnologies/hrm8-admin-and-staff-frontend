export const SUBSCRIPTION_TIERS = {
  'ats-lite': {
    id: 'ats-lite',
    name: 'ATS Lite',
    monthlyPrice: 0,
    annualPrice: 0,
    monthlyFee: 0, // Backward compatibility
    jobPostingCost: 0, // Backward compatibility
    maxOpenJobs: 9999,
    maxUsers: 9999,
    features: {
      ats: true, // Backward compatibility
      coreATS: true,
      aiScreening: false,
      customForms: false,
      teamCollaboration: false,
      dedicatedTalentPool: false,
      talentPool: false, // Backward compatibility
      brandedCareersPage: false,
      multiPostJobBoard: true, // Charges apply
      postToHRM8JobBoard: false,
      directJobBoardIntegration: false,
      jobBoardIntegration: false, // Backward compatibility
      postToCompanyJobBoard: false,
      locationManager: false,
      departmentManager: false,
      divisionManager: false,
      analyticsLevel: 'basic' as const,
      reportsAnalytics: 'basic' as const, // Backward compatibility
      hrmsIntegration: false,
    },
    billingCycle: 'free' as const,
    isPopular: false,
    description: 'Free tier with core ATS features',
    isAnnualBilling: false,
  },
  'payg': {
    id: 'payg',
    name: 'Pay As You Go',
    monthlyPrice: 195,
    annualPrice: 195 * 12,
    monthlyFee: 195, // Backward compatibility
    jobPostingCost: 195, // Backward compatibility
    maxOpenJobs: 9999, // Unlimited
    maxUsers: 9999, // Unlimited
    features: {
      ats: true, // Backward compatibility
      coreATS: true,
      aiScreening: true,
      customForms: true,
      teamCollaboration: true,
      dedicatedTalentPool: true,
      talentPool: true, // Backward compatibility
      brandedCareersPage: true,
      multiPostJobBoard: true,
      postToHRM8JobBoard: true, // Charges apply
      directJobBoardIntegration: true, // Charges apply
      jobBoardIntegration: true, // Backward compatibility
      postToCompanyJobBoard: false,
      locationManager: true,
      departmentManager: true,
      divisionManager: false,
      analyticsLevel: 'standard' as const,
      reportsAnalytics: 'standard' as const, // Backward compatibility
      hrmsIntegration: true, // Optional $6/employee/month
    },
    billingCycle: 'monthly' as const,
    isPopular: false,
    description: 'Unlimited users, pay per job posting',
    isAnnualBilling: true,
  },
  'small': {
    id: 'small',
    name: 'Small',
    monthlyPrice: 295,
    annualPrice: 295 * 12,
    monthlyFee: 295, // Backward compatibility
    jobPostingCost: 0, // Backward compatibility
    maxOpenJobs: 5,
    maxUsers: 9999, // Unlimited
    features: {
      ats: true, // Backward compatibility
      coreATS: true,
      aiScreening: true,
      customForms: true,
      teamCollaboration: true,
      dedicatedTalentPool: true,
      talentPool: true, // Backward compatibility
      brandedCareersPage: true,
      multiPostJobBoard: true, // Charges apply
      postToHRM8JobBoard: true, // Charges apply
      directJobBoardIntegration: true, // Charges apply
      jobBoardIntegration: true, // Backward compatibility
      postToCompanyJobBoard: false,
      locationManager: true,
      departmentManager: true,
      divisionManager: false,
      analyticsLevel: 'advanced' as const,
      reportsAnalytics: 'advanced' as const, // Backward compatibility
      hrmsIntegration: true, // Optional $6/employee/month
    },
    billingCycle: 'monthly' as const,
    isPopular: false,
    description: 'For small businesses with up to 5 open positions',
    isAnnualBilling: true,
  },
  'medium': {
    id: 'medium',
    name: 'Medium',
    monthlyPrice: 495,
    annualPrice: 495 * 12,
    monthlyFee: 495, // Backward compatibility
    jobPostingCost: 0, // Backward compatibility
    maxOpenJobs: 25,
    maxUsers: 9999, // Unlimited
    features: {
      ats: true, // Backward compatibility
      coreATS: true,
      aiScreening: true,
      customForms: true,
      teamCollaboration: true,
      dedicatedTalentPool: true,
      talentPool: true, // Backward compatibility
      brandedCareersPage: true,
      multiPostJobBoard: true, // Charges apply
      postToHRM8JobBoard: true, // Charges apply
      directJobBoardIntegration: true, // Charges apply
      jobBoardIntegration: true, // Backward compatibility
      postToCompanyJobBoard: false,
      locationManager: true,
      departmentManager: true,
      divisionManager: false,
      analyticsLevel: 'advanced' as const,
      reportsAnalytics: 'advanced' as const, // Backward compatibility
      hrmsIntegration: true, // Optional $6/employee/month
    },
    billingCycle: 'monthly' as const,
    isPopular: true,
    description: 'Most popular for growing companies with up to 25 open positions',
    isAnnualBilling: true,
  },
  'large': {
    id: 'large',
    name: 'Large',
    monthlyPrice: 695,
    annualPrice: 695 * 12,
    monthlyFee: 695, // Backward compatibility
    jobPostingCost: 0, // Backward compatibility
    maxOpenJobs: 50,
    maxUsers: 9999, // Unlimited
    features: {
      ats: true, // Backward compatibility
      coreATS: true,
      aiScreening: true,
      customForms: true,
      teamCollaboration: true,
      dedicatedTalentPool: true,
      talentPool: true, // Backward compatibility
      brandedCareersPage: true,
      multiPostJobBoard: true, // Charges apply
      postToHRM8JobBoard: true, // Charges apply
      directJobBoardIntegration: true, // Charges apply
      jobBoardIntegration: true, // Backward compatibility
      postToCompanyJobBoard: false,
      locationManager: true,
      departmentManager: true,
      divisionManager: false,
      analyticsLevel: 'advanced' as const,
      reportsAnalytics: 'advanced' as const, // Backward compatibility
      hrmsIntegration: true, // Optional $6/employee/month
    },
    billingCycle: 'monthly' as const,
    isPopular: false,
    description: 'For larger organizations with up to 50 open positions',
    isAnnualBilling: true,
  },
  'enterprise': {
    id: 'enterprise',
    name: 'Enterprise',
    monthlyPrice: 995,
    annualPrice: 995 * 12,
    monthlyFee: 995, // Backward compatibility
    jobPostingCost: 0, // Backward compatibility
    maxOpenJobs: 9999, // Unlimited
    maxUsers: 9999, // Unlimited
    features: {
      ats: true, // Backward compatibility
      coreATS: true,
      aiScreening: true,
      customForms: true,
      teamCollaboration: true,
      dedicatedTalentPool: true,
      talentPool: true, // Backward compatibility
      brandedCareersPage: true,
      multiPostJobBoard: true, // Charges apply
      postToHRM8JobBoard: true, // Charges apply
      directJobBoardIntegration: true, // Charges apply
      jobBoardIntegration: true, // Backward compatibility
      postToCompanyJobBoard: false,
      locationManager: true,
      departmentManager: true,
      divisionManager: true, // Only Enterprise has Division Manager
      analyticsLevel: 'advanced' as const,
      reportsAnalytics: 'advanced' as const, // Backward compatibility
      hrmsIntegration: true, // Optional $6/employee/month
    },
    billingCycle: 'monthly' as const,
    isPopular: false,
    description: 'Enterprise solution with unlimited positions and division management',
    isAnnualBilling: true,
  },
} as const;

export const PAYG_JOB_POSTING_COST = 195;

// HRMS Add-on Configuration
export const HRMS_ADDON = {
  pricePerEmployee: 6,
  minimumEmployees: 50,
  name: 'HRMS Module',
  description: 'Full HR Management System',
  features: [
    'Employee Records Management',
    'Leave & Attendance Tracking',
    'Performance Management',
    'Payroll Integration',
    'Benefits Administration',
    'Document Management',
    'Organizational Charts',
    'Employee Self-Service Portal'
  ]
} as const;

// Additional Add-on Services
export const ADDON_SERVICES = {
  assessments: {
    name: 'Candidate Assessments',
    pricingModel: 'assessment-based',
    description: 'Assessment-based pricing - varies by type and volume'
  },
  referenceChecking: {
    name: 'Reference Checking',
    perCandidateCost: 69,
    description: 'Automated reference verification - per candidate'
  },
  videoInterviewing: {
    name: 'Video Interviewing',
    perJobCost: 99,
    description: 'One-way and live video interviews - per job posting'
  }
} as const;

export const RECRUITMENT_SERVICES = {
  'self-managed': {
    baseFee: 0,
    upfrontPercentage: 0,
    name: 'Self-Managed (FREE)'
  },
  'shortlisting': {
    baseFee: 1990,
    upfrontPercentage: 1.0,
    name: 'Shortlisting Service'
  },
  'full-service': {
    baseFee: 5990,
    upfrontPercentage: 1.0,
    name: 'Standard Recruitment Service'
  },
  'executive-search': {
    baseFeeUnder100k: 9990,
    baseFeeOver100k: 14990,
    upfrontPercentage: 1.0,
    name: 'Executive Search'
  },
  'rpo': {
    baseMonthlyPerConsultant: 5990, // Guide price
    basePerVacancy: 3990, // Guide price
    upfrontPercentage: 0,
    name: 'RPO (Recruitment Process Outsourcing)',
    description: 'Pricing tailored to employer needs - guide prices shown',
    isTailored: true,
    minimumConsultants: 1,
    minimumContract: 6, // months
    note: 'Pricing is customized for each employer based on volume, duration, and specific requirements'
  }
} as const;

export const PRICING_NOTES = {
  annualPayment: 'Subscription fees paid annually',
  hrmsBlocks: 'HRMS charged in blocks of 50 employees paid annually',
  optionalServices: 'Optional services - additional charges apply',
  currency: 'Pricing in USD',
  rpoCustom: 'RPO pricing is tailored to each employer - guide prices shown for reference'
} as const;

export function getServiceBaseFee(serviceType: 'shortlisting' | 'full-service' | 'executive-search' | 'rpo'): number {
  switch (serviceType) {
    case 'shortlisting':
      return RECRUITMENT_SERVICES['shortlisting'].baseFee;
    case 'full-service':
      return RECRUITMENT_SERVICES['full-service'].baseFee;
    case 'executive-search':
      return RECRUITMENT_SERVICES['executive-search'].baseFeeUnder100k;
    case 'rpo':
      return RECRUITMENT_SERVICES['rpo'].baseMonthlyPerConsultant;
    default:
      return 0;
  }
}

export function isMonthlyService(serviceType: string): boolean {
  return serviceType === 'rpo';
}

export function calculateRPOGuidePricing(
  consultants: number,
  months: number,
  estimatedVacancies: number
): {
  monthlyRetainer: number;
  totalMonthlyFees: number;
  perVacancyFees: number;
  totalEstimated: number;
  breakdown: string[];
} {
  const GUIDE_CONSULTANT_RATE = RECRUITMENT_SERVICES.rpo.baseMonthlyPerConsultant;
  const GUIDE_VACANCY_FEE = RECRUITMENT_SERVICES.rpo.basePerVacancy;

  const monthlyRetainer = consultants * GUIDE_CONSULTANT_RATE;
  const totalMonthlyFees = monthlyRetainer * months;
  const perVacancyFees = estimatedVacancies * GUIDE_VACANCY_FEE;
  const totalEstimated = totalMonthlyFees + perVacancyFees;

  return {
    monthlyRetainer,
    totalMonthlyFees,
    perVacancyFees,
    totalEstimated,
    breakdown: [
      `${consultants} consultant(s) × $${GUIDE_CONSULTANT_RATE.toLocaleString()}/month × ${months} months = $${totalMonthlyFees.toLocaleString()}`,
      `${estimatedVacancies} estimated vacancies × $${GUIDE_VACANCY_FEE.toLocaleString()} = $${perVacancyFees.toLocaleString()}`,
      `Total Estimated: $${totalEstimated.toLocaleString()}`
    ]
  };
}

export type SubscriptionTier = keyof typeof SUBSCRIPTION_TIERS;
