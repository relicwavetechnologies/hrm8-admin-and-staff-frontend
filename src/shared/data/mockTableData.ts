import type { Employer, Job, Consultant, Department, Location } from '@/shared/types/entities';

// Helper functions to generate varied data
const industries = ['Technology', 'Finance', 'Healthcare', 'Retail', 'Education', 'Manufacturing', 'Media', 'Construction', 'Consulting', 'Legal', 'Transportation', 'Energy', 'Pharmaceuticals', 'Real Estate', 'Telecommunications'];
const locations = ['San Francisco, CA', 'New York, NY', 'Boston, MA', 'Chicago, IL', 'Austin, TX', 'Detroit, MI', 'Los Angeles, CA', 'Houston, TX', 'Seattle, WA', 'Denver, CO', 'Miami, FL', 'Atlanta, GA', 'Phoenix, AZ', 'Portland, OR', 'Dallas, TX'];
const statuses: ('active' | 'inactive' | 'pending' | 'trial' | 'expired')[] = ['active', 'active', 'active', 'pending', 'trial'];

const firstNames = ['Sarah', 'Michael', 'Emily', 'James', 'Lisa', 'David', 'Maria', 'Robert', 'Jennifer', 'William', 'Patricia', 'Richard', 'Linda', 'Thomas', 'Elizabeth', 'Charles', 'Susan', 'Christopher', 'Jessica', 'Daniel', 'Karen', 'Matthew', 'Nancy', 'Anthony', 'Betty', 'Mark', 'Margaret', 'Donald', 'Sandra', 'Steven', 'Ashley', 'Paul', 'Kimberly', 'Andrew', 'Emily', 'Joshua', 'Donna', 'Kenneth', 'Michelle', 'Kevin', 'Carol', 'Brian', 'Amanda', 'George', 'Dorothy', 'Timothy', 'Melissa', 'Ronald', 'Deborah', 'Edward', 'Stephanie', 'Jason', 'Rebecca', 'Jeffrey', 'Sharon', 'Ryan', 'Laura', 'Jacob', 'Cynthia', 'Gary'];
const lastNames = ['Johnson', 'Chen', 'Rodriguez', 'Wilson', 'Anderson', 'Kim', 'Garcia', 'Taylor', 'Martinez', 'Brown', 'Lee', 'Davis', 'Miller', 'Moore', 'Jackson', 'Martin', 'Thompson', 'White', 'Lopez', 'Harris', 'Clark', 'Lewis', 'Robinson', 'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores', 'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts', 'Gomez', 'Phillips', 'Evans', 'Turner', 'Diaz', 'Parker', 'Cruz', 'Edwards', 'Collins', 'Reyes', 'Stewart', 'Morris', 'Morales', 'Murphy', 'Cook', 'Rogers', 'Morgan'];

const companyNames = [
  'TechCorp Solutions', 'Global Finance Group', 'HealthPlus Medical', 'Retail Dynamics Inc', 'EduTech Academy',
  'Manufacturing Pro', 'Creative Studios', 'Construction Partners', 'Digital Innovations', 'Smart Systems LLC',
  'Enterprise Solutions', 'NextGen Technologies', 'Prime Healthcare', 'Metro Retail Group', 'Advanced Manufacturing',
  'Media Network Inc', 'BuildRight Construction', 'Quantum Computing Co', 'FinTech Ventures', 'MedLife Corporation',
  'Urban Retail Chain', 'Learning Solutions', 'Industrial Works', 'Content Creators Hub', 'Skyline Builders',
  'Cloud Services Inc', 'Investment Partners', 'Care Plus Hospitals', 'Fashion Retail Co', 'STEM Education Group',
  'Precision Manufacturing', 'Entertainment Media', 'Infrastructure Projects', 'AI Research Labs', 'Capital Management',
  'Wellness Centers', 'Luxury Retail', 'Online Education Platform', 'Automotive Parts Inc', 'Broadcast Media Group',
  'Green Energy Solutions', 'Wealth Advisors', 'Diagnostic Centers', 'E-Commerce Ventures', 'Tech Academy',
  'Assembly Line Systems', 'Production Studios', 'Urban Development', 'Data Analytics Corp', 'Asset Management',
  'Specialized Care', 'Marketplace Solutions', 'Virtual Learning', 'Component Manufacturing', 'Digital Media House',
  'Residential Construction', 'Innovation Labs', 'Private Equity Group', 'Medical Diagnostics', 'Retail Technology'
];

const createDepartments = (deptNames: string[], companyId: number): Department[] => {
  return deptNames.map((name, idx) => ({
    id: `dept-${companyId}-${idx}`,
    name,
    description: undefined,
    headOfDepartment: undefined,
    costCenter: undefined,
    createdAt: new Date(),
  }));
};

const createLocations = (locationNames: string[], companyId: number): Location[] => {
  return locationNames.map((name, idx) => {
    const isPrimary = idx === 0;
    const parts = name.split(',').map(p => p.trim());
    const city = parts[1] || parts[0];
    const state = parts[2] || '';

    return {
      id: `loc-${companyId}-${idx}`,
      name: name,
      addressLine1: `${100 + idx * 50} Main Street`,
      addressLine2: idx === 0 ? 'Suite 100' : undefined,
      city: city,
      state: state,
      postalCode: undefined,
      country: 'United States',
      isPrimary,
      capacity: isPrimary ? 200 : 50,
      createdAt: new Date(),
    };
  });
};

const commonDepartments = [
  ['Engineering', 'Product', 'Design', 'Sales', 'Marketing'],
  ['Finance', 'Operations', 'HR', 'Legal', 'Customer Success'],
  ['IT', 'Data Analytics', 'Business Development', 'R&D', 'Quality Assurance'],
  ['Administration', 'Manufacturing', 'Supply Chain', 'Clinical', 'Nursing'],
  ['Engineering', 'Product Management', 'UX/UI', 'Sales', 'Content'],
];

export const mockEmployers: Employer[] = Array.from({ length: 60 }, (_, i) => {
  const baseLocation = locations[i % locations.length];
  const deptNames = commonDepartments[i % commonDepartments.length];
  const locationNames = [baseLocation, `${baseLocation} - Downtown`, `${baseLocation} - Tech Hub`];

  // Assign subscription tiers to different employers
  let subscriptionTier: 'ats-lite' | 'payg' | 'small' | 'medium' | 'large' | 'enterprise' = 'ats-lite';
  let accountType: 'approved' | 'payg' = 'payg';
  let maxOpenJobs = 0;
  let currentOpenJobs = 0;
  let maxUsers = 0;
  let currentUsers = 1;
  let monthlySubscriptionFee: number | undefined = undefined;
  let hasUsedFreeTier = false;
  const atsEnabled = true;
  let hrmsEnabled = false;
  let hrmsEmployeeCount = 0;
  let enabledAddons: string[] = [];
  let salesStage: 'lead' | 'prospect' | 'trial' | 'customer' | 'at-risk' | 'churned' = 'customer';

  if (i % 5 === 0) {
    // ATS Lite tier
    subscriptionTier = 'ats-lite';
    accountType = 'approved';
    maxOpenJobs = Infinity;
    currentOpenJobs = Math.floor(Math.random() * 3);
    maxUsers = Infinity;
    hasUsedFreeTier = i % 10 !== 0;
    salesStage = i % 2 === 0 ? 'trial' : 'customer';
  } else if (i % 5 === 1) {
    // Small subscription
    subscriptionTier = 'small';
    accountType = 'approved';
    maxOpenJobs = 5;
    currentOpenJobs = Math.min(Math.floor(Math.random() * 6), 5);
    maxUsers = Infinity;
    currentUsers = Math.floor(Math.random() * 5) + 1;
    monthlySubscriptionFee = 295;
    salesStage = 'customer';
  } else if (i % 5 === 2) {
    // Medium subscription with HRMS
    subscriptionTier = 'medium';
    accountType = 'approved';
    maxOpenJobs = 25;
    currentOpenJobs = Math.min(Math.floor(Math.random() * 20), 25);
    maxUsers = Infinity;
    currentUsers = Math.floor(Math.random() * 10) + 1;
    monthlySubscriptionFee = 495;
    hrmsEnabled = i % 2 === 0;
    hrmsEmployeeCount = hrmsEnabled ? 50 + Math.floor(Math.random() * 100) : 0;
    enabledAddons = i % 3 === 0 ? ['assessments'] : [];
    salesStage = 'customer';
  } else if (i % 5 === 3) {
    // Large subscription with HRMS
    subscriptionTier = 'large';
    accountType = 'approved';
    maxOpenJobs = 50;
    currentOpenJobs = Math.min(Math.floor(Math.random() * 40), 50);
    maxUsers = Infinity;
    currentUsers = Math.floor(Math.random() * 20) + 1;
    monthlySubscriptionFee = 695;
    hrmsEnabled = true;
    hrmsEmployeeCount = 100 + Math.floor(Math.random() * 200);
    enabledAddons = ['assessments', 'video-interviewing'];
    salesStage = i % 10 === 3 ? 'at-risk' : 'customer';
  } else {
    // PAYG
    accountType = 'payg';
    subscriptionTier = 'payg';
    maxOpenJobs = Infinity;
    currentOpenJobs = Math.floor(Math.random() * 15);
    maxUsers = Infinity;
    currentUsers = Math.floor(Math.random() * 8) + 1;
    salesStage = i % 3 === 0 ? 'prospect' : 'customer';
  }

  const totalJobsPosted = currentOpenJobs + Math.floor(Math.random() * 50);
  const createdDate = new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
  const totalCandidates = Math.floor(Math.random() * 500) + 50;
  const totalEmployees = hrmsEnabled ? hrmsEmployeeCount : 0;
  const tags = ['tech', 'healthcare', 'finance', 'retail', 'manufacturing'].filter(() => Math.random() > 0.7);
  const leadSources: Array<'website' | 'referral' | 'cold-outreach' | 'event' | 'partner' | 'other'> =
    ['website', 'referral', 'cold-outreach', 'event', 'partner', 'other'];

  return {
    id: `${i + 1}`,
    name: companyNames[i],
    logo: i % 3 === 0 ? `https://api.dicebear.com/7.x/initials/svg?seed=${companyNames[i]}` : undefined,
    industry: industries[i % industries.length],
    location: baseLocation,
    status: statuses[i % statuses.length],
    activeJobs: currentOpenJobs,
    lastContact: new Date(2024, 0, Math.floor(Math.random() * 15) + 1),
    email: `contact@${companyNames[i].toLowerCase().replace(/\s+/g, '')}.com`,
    departments: createDepartments(deptNames, i),
    locations: createLocations(locationNames, i),
    accountType,
    subscriptionTier,
    subscriptionStatus: 'active',
    subscriptionStartDate: new Date(2024, 0, 1),
    subscriptionEndDate: new Date(2025, 0, 1),
    subscriptionRenewalDate: new Date(2025, 0, 15),
    billingCycle: i % 3 === 0 ? 'annual' : 'monthly',
    paymentStatus: i % 15 === 0 ? 'past_due' : 'current',
    trialEndsAt: salesStage === 'trial' ? new Date(2024, 11, 31) : undefined,

    // Module Configuration
    modules: {
      atsEnabled,
      hrmsEnabled,
      hrmsEmployeeCount: hrmsEnabled ? hrmsEmployeeCount : undefined,
      enabledAddons
    },

    maxOpenJobs,
    currentOpenJobs,
    maxUsers,
    currentUsers,

    // Usage Metrics
    usage: {
      activeJobs: currentOpenJobs,
      totalJobs: totalJobsPosted,
      activeCandidates: Math.floor(totalCandidates * 0.3),
      totalCandidates,
      activeEmployees: totalEmployees,
      totalEmployees,
      activeUsers: currentUsers,
      storageUsedMB: Math.floor(Math.random() * 5000) + 100,
      apiCallsThisMonth: Math.floor(Math.random() * 10000) + 500,
      lastLoginAt: new Date(2024, 11, Math.floor(Math.random() * 5) + 20)
    },

    // CRM Fields
    crm: {
      salesStage,
      leadSource: leadSources[i % leadSources.length],
      assignedToId: `user-${(i % 5) + 1}`,
      assignedToName: `${firstNames[i % 5]} ${lastNames[i % 5]}`,
      accountManagerId: `user-${(i % 5) + 1}`,
      accountManagerName: `${firstNames[i % 5]} ${lastNames[i % 5]}`,
      primaryContactName: `${firstNames[(i + 2) % firstNames.length]} ${lastNames[(i + 3) % lastNames.length]}`,
      primaryContactEmail: `contact${i}@${companyNames[i].toLowerCase().replace(/\s+/g, '')}.com`,
      primaryContactPhone: `+1-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
      tags,
      priority: i % 4 === 0 ? 'high' : i % 4 === 1 ? 'medium' : 'low',
      healthScore: Math.floor(Math.random() * 40) + 60,
      lifetimeValue: monthlySubscriptionFee ? monthlySubscriptionFee * Math.floor(Math.random() * 24) + monthlySubscriptionFee * 6 : Math.floor(Math.random() * 15000) + 5000,
      notes: i % 3 === 0 ? 'Great client, very responsive. Interested in HRMS upgrade.' : undefined
    },

    activeJobCount: currentOpenJobs,
    userCount: currentUsers,
    totalJobsPosted,
    totalSpent: monthlySubscriptionFee ? monthlySubscriptionFee * Math.floor(Math.random() * 12) : Math.floor(Math.random() * 5000),
    accountManagerId: `user-${(i % 5) + 1}`,
    accountManagerName: `${firstNames[i % 5]} ${lastNames[i % 5]}`,
    createdAt: createdDate.toISOString(),
    updatedAt: new Date().toISOString(),
    lastActivityAt: new Date(2024, 11, Math.floor(Math.random() * 20) + 1).toISOString(),
    monthlySubscriptionFee,
    nextBillingDate: new Date(2025, 0, 15),
    hasUsedFreeTier,
    outstandingBalance: accountType === 'approved' ? Math.floor(Math.random() * 10000) : 0,
    creditLimit: accountType === 'approved' ? 50000 : undefined,
  };
});

const jobTitles = [
  'Senior Software Engineer', 'Financial Analyst', 'Registered Nurse', 'Store Manager', 'Marketing Consultant',
  'Product Designer', 'Data Scientist', 'Project Manager', 'DevOps Engineer', 'Business Analyst',
  'Account Executive', 'UX Researcher', 'Network Administrator', 'Content Strategist', 'Operations Manager',
  'Sales Representative', 'HR Specialist', 'Quality Assurance Engineer', 'Graphic Designer', 'Systems Analyst',
  'Customer Success Manager', 'Full Stack Developer', 'Compliance Officer', 'Brand Manager', 'Supply Chain Analyst',
  'Technical Writer', 'Product Manager', 'Security Analyst', 'Creative Director', 'Finance Manager',
  'Clinical Coordinator', 'Regional Manager', 'Digital Marketing Specialist', 'Backend Developer', 'Risk Analyst',
  'UI Designer', 'Machine Learning Engineer', 'Construction Manager', 'Frontend Developer', 'Investment Analyst',
  'Nurse Practitioner', 'District Manager', 'SEO Specialist', 'Cloud Architect', 'Treasury Analyst',
  'Medical Assistant', 'Retail Supervisor', 'Content Manager', 'Site Reliability Engineer', 'Portfolio Manager',
  'Physical Therapist', 'Assistant Store Manager', 'Social Media Manager', 'Mobile Developer', 'Credit Analyst',
  'Healthcare Administrator', 'Sales Manager', 'Email Marketing Specialist', 'Platform Engineer', 'Financial Planner'
];

const jobTypes: ('Full-time' | 'Part-time' | 'Contract')[] = ['Full-time', 'Full-time', 'Full-time', 'Part-time', 'Contract'];
const jobStatuses: ('open' | 'closed' | 'draft')[] = ['open', 'open', 'open', 'closed', 'draft'];

export const mockJobs: Job[] = Array.from({ length: 60 }, (_, i) => {
  const employer = companyNames[i % companyNames.length];
  const totalApplicants = Math.floor(Math.random() * 100);
  const unread = i % 3 === 0 ? 0 : Math.floor(Math.random() * (totalApplicants * 0.3));

  return {
    id: `${i + 1}`,
    title: jobTitles[i % jobTitles.length],
    employer: employer,
    employerLogo: i % 4 === 0 ? `https://api.dicebear.com/7.x/initials/svg?seed=${employer}` : undefined,
    location: i % 5 === 0 ? 'Remote' : locations[i % locations.length],
    type: jobTypes[i % jobTypes.length],
    salary: `$${50 + (i % 15) * 10},000 - $${80 + (i % 20) * 10},000`,
    status: jobStatuses[i % jobStatuses.length],
    applicants: totalApplicants,
    unreadApplicants: unread,
    postedDate: new Date(2024, 0, Math.floor(Math.random() * 15) + 1)
  };
});

// const positions = ['Software Engineer', 'Data Analyst', 'Marketing Manager', 'Product Designer', 'Financial Advisor', 'DevOps Engineer', 'HR Specialist', 'Sales Executive', 'Account Manager', 'Business Analyst', 'Content Writer', 'UX Designer', 'Network Engineer', 'Project Coordinator', 'Operations Analyst', 'Customer Support', 'Brand Strategist', 'Quality Engineer', 'Creative Director', 'Systems Administrator'];

// const skillSets = [
//   ['React', 'TypeScript', 'Node.js', 'AWS', 'GraphQL'],
//   ['Python', 'SQL', 'Tableau', 'Excel', 'PowerBI'],
//   ['SEO', 'Content Strategy', 'Analytics', 'Social Media', 'Brand Management'],
//   ['Figma', 'UI/UX', 'Prototyping', 'Design Systems', 'User Research'],
//   ['Investment Strategy', 'Risk Management', 'Portfolio Analysis', 'Client Relations'],
//   ['Docker', 'Kubernetes', 'CI/CD', 'Terraform', 'AWS'],
//   ['Recruitment', 'Employee Relations', 'HRIS', 'Training', 'Compliance'],
//   ['B2B Sales', 'Negotiation', 'CRM', 'Lead Generation', 'Account Management'],
//   ['Project Management', 'Agile', 'Scrum', 'JIRA', 'Stakeholder Management'],
//   ['JavaScript', 'Vue.js', 'Angular', 'REST APIs', 'MongoDB']
// ];

// const candidateStatuses: ('active' | 'placed' | 'inactive')[] = ['active', 'active', 'active', 'placed', 'inactive'];

// Re-exporting from the comprehensive mockCandidatesData
export { mockCandidatesData as mockCandidates } from './mockCandidatesData';

const specializations = ['IT Strategy', 'Financial Planning', 'HR Transformation', 'Operations', 'Marketing', 'Legal Compliance', 'Change Management', 'Risk Management', 'Supply Chain', 'Digital Transformation', 'Cybersecurity', 'M&A Advisory', 'Organizational Design', 'Process Optimization', 'Data Analytics', 'Customer Experience', 'Product Strategy', 'Business Development', 'Sustainability', 'Innovation'];

const availability: ('available' | 'assigned' | 'unavailable')[] = ['available', 'available', 'assigned', 'unavailable'];

export const mockConsultants: Consultant[] = Array.from({ length: 60 }, (_, i) => ({
  id: `${i + 1}`,
  name: `${i % 10 < 3 ? 'Dr. ' : ''}${firstNames[i % firstNames.length]} ${lastNames[i % lastNames.length]}`,
  photo: i % 2 === 0 ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${firstNames[i % firstNames.length]}${lastNames[i % lastNames.length]}` : undefined,
  email: `${firstNames[i % firstNames.length].toLowerCase()}.${lastNames[i % lastNames.length].toLowerCase()}@consulting.com`,
  specialization: specializations[i % specializations.length],
  availability: availability[i % availability.length],
  activeClients: Math.floor(Math.random() * 7),
  rating: 4.5 + Math.random() * 0.5,
  joinedDate: new Date(2020 + (i % 5), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1)
}));
