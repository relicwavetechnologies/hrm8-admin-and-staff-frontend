// Employee Self-Service Types

export interface PersonalInfo {
  firstName: string;
  middleName?: string;
  lastName: string;
  dateOfBirth: string;
  gender?: string;
  nationality?: string;
  maritalStatus?: string;
  ssn?: string;
}

export interface ContactInfo {
  email: string;
  phone: string;
  alternatePhone?: string;
  address: Address;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  alternatePhone?: string;
  email?: string;
  isPrimary: boolean;
}

export interface Dependent {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  relationship: 'spouse' | 'child' | 'parent' | 'other';
  gender?: string;
  isStudent?: boolean;
  isDisabled?: boolean;
}

export interface BankDetails {
  accountHolderName: string;
  accountNumber: string;
  routingNumber: string;
  accountType: 'checking' | 'savings';
  bankName: string;
}

export interface ESSPreferences {
  language: string;
  timezone: string;
  notificationSettings: NotificationSettings;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
  payslipNotification: boolean;
  leaveApprovalNotification: boolean;
  expenseApprovalNotification: boolean;
}

export interface ESSProfile {
  id: string;
  userId: string;
  employeeId: string;
  personalInfo: PersonalInfo;
  contactInfo: ContactInfo;
  emergencyContacts: EmergencyContact[];
  dependents: Dependent[];
  bankDetails?: BankDetails;
  preferences: ESSPreferences;
  updatedAt: string;
}

export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  path: string;
  description: string;
  requiresPermission?: string;
  badge?: number;
}

export interface ESSStats {
  leaveBalance: number;
  pendingApprovals: number;
  upcomingReviews: number;
  unreadDocuments: number;
  attendancePercentage: number;
}
