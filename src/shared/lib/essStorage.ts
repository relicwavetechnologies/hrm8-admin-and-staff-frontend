import { ESSProfile, ESSStats, QuickAction } from "@/shared/types/ess";

// Mock ESS profiles
const mockESSProfiles: ESSProfile[] = [
  {
    id: 'ess-1',
    userId: 'user-1',
    employeeId: 'emp-1',
    personalInfo: {
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: '1990-05-15',
      gender: 'male',
      nationality: 'US',
      maritalStatus: 'married',
    },
    contactInfo: {
      email: 'john.doe@company.com',
      phone: '+1-555-0123',
      address: {
        street: '123 Main St',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94102',
        country: 'USA',
      },
    },
    emergencyContacts: [
      {
        id: 'ec-1',
        name: 'Jane Doe',
        relationship: 'spouse',
        phone: '+1-555-0124',
        isPrimary: true,
      },
    ],
    dependents: [],
    preferences: {
      language: 'en',
      timezone: 'America/Los_Angeles',
      notificationSettings: {
        email: true,
        push: true,
        sms: false,
        payslipNotification: true,
        leaveApprovalNotification: true,
        expenseApprovalNotification: true,
      },
    },
    updatedAt: new Date().toISOString(),
  },
];

const essProfiles = [...mockESSProfiles];

export function getESSProfile(userId: string): ESSProfile | undefined {
  return essProfiles.find((profile) => profile.userId === userId);
}

export function updateESSProfile(userId: string, updates: Partial<ESSProfile>): ESSProfile | null {
  const index = essProfiles.findIndex((profile) => profile.userId === userId);
  if (index === -1) return null;

  essProfiles[index] = {
    ...essProfiles[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  return essProfiles[index];
}

export function getESSStats(userId: string): ESSStats {
  // Mock stats - in production, fetch from various modules
  return {
    leaveBalance: 15,
    pendingApprovals: 2,
    upcomingReviews: 1,
    unreadDocuments: 3,
    attendancePercentage: 98.5,
  };
}

export function getQuickActions(userId: string): QuickAction[] {
  return [
    {
      id: 'request-leave',
      label: 'Request Leave',
      icon: 'Calendar',
      path: '/leave-management',
      description: 'Submit a time-off request',
    },
    {
      id: 'submit-expense',
      label: 'Submit Expense',
      icon: 'Receipt',
      path: '/expenses',
      description: 'File an expense claim',
    },
    {
      id: 'view-payslips',
      label: 'View Payslips',
      icon: 'FileText',
      path: '/ess/payslips',
      description: 'Access your pay statements',
    },
    {
      id: 'update-profile',
      label: 'Update Profile',
      icon: 'User',
      path: '/ess/profile',
      description: 'Edit your personal information',
    },
    {
      id: 'view-benefits',
      label: 'View Benefits',
      icon: 'Heart',
      path: '/benefits',
      description: 'Review your benefits',
    },
    {
      id: 'clock-in-out',
      label: 'Clock In/Out',
      icon: 'Clock',
      path: '/attendance',
      description: 'Record your attendance',
    },
  ];
}
