export type CompanyProfileSectionKey =
  | 'basicDetails'
  | 'primaryLocation'
  | 'personalProfile'
  | 'teamMembers'
  | 'billing'
  | 'branding';

export type CompanyProfileSection =
  | 'BASIC_DETAILS'
  | 'PRIMARY_LOCATION'
  | 'PERSONAL_PROFILE'
  | 'TEAM_MEMBERS'
  | 'BILLING'
  | 'BRANDING';

export type CompanyProfileStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';

export interface CompanyProfilePhone {
  countryCode: string;
  number: string;
  type?: 'mobile' | 'work' | 'office' | 'fax' | 'other';
}

export interface CompanyProfileLocation {
  id: string;
  name: string;
  streetAddress: string;
  city: string;
  stateOrRegion: string;
  postalCode: string;
  country: string;
  isPrimary?: boolean;
}

export interface CompanyProfileBasicDetails {
  companyName: string;
  companySize: string;
  industries: string[];
  phone: CompanyProfilePhone;
  websiteUrl?: string;
  yearFounded?: number;
  overview?: string;
  logoUrl?: string;
  iconUrl?: string;
}

export interface CompanyProfilePersonalInfo {
  positionTitle?: string;
  phone?: CompanyProfilePhone;
  location?: string;
}

export interface CompanyProfileTeamMemberInvite {
  email: string;
  role: string;
  authorizationLevel?: string;
  approvalLevel?: string;
  status?: 'pending' | 'accepted' | 'declined';
}

export interface CompanyProfileBillingData {
  paymentPreference?: 'payg' | 'subscription';
  subscriptionPlan?: string;
  registeredBusinessName?: string;
  taxId?: string;
  registeredCountry?: string;
  isCharity?: boolean;
  supportingDocuments?: Array<{ id: string; name: string; url: string }>;
  paymentMethod?: {
    type: 'card' | 'invoice' | 'bank';
    last4?: string;
    brand?: string;
  };
  billingAddress?: {
    street: string;
    city: string;
    stateOrRegion: string;
    postalCode: string;
    country: string;
  };
  accountsEmail?: string;
}

export interface CompanyProfileBrandingData {
  careersPageEnabled?: boolean;
  subdomain?: string;
  brandColor?: string;
  companyIntroduction?: string;
  logoUrl?: string;
  iconUrl?: string;
}

export interface CompanyProfileData {
  basicDetails?: CompanyProfileBasicDetails;
  primaryLocation?: CompanyProfileLocation;
  additionalLocations?: CompanyProfileLocation[];
  personalProfile?: CompanyProfilePersonalInfo;
  teamMembers?: {
    invites: CompanyProfileTeamMemberInvite[];
    defaultAdminId?: string;
  };
  billing?: CompanyProfileBillingData;
  branding?: CompanyProfileBrandingData;
}

export interface CompanyProfileDTO {
  id: string;
  companyId: string;
  status: CompanyProfileStatus;
  completionPercentage: number;
  completedSections: CompanyProfileSection[];
  profileData?: CompanyProfileData;
  createdAt: string;
  updatedAt: string;
}

export interface CompanyProfileSummary {
  status: CompanyProfileStatus;
  completionPercentage: number;
  completedSections: CompanyProfileSection[];
  requiredSections: CompanyProfileSectionKey[];
  optionalSections: CompanyProfileSectionKey[];
}

export interface CompanyProfileProgressResponse {
  profile: CompanyProfileDTO;
  requiredSections: CompanyProfileSectionKey[];
  optionalSections: CompanyProfileSectionKey[];
}

export const COMPANY_PROFILE_SECTION_ENUM: Record<CompanyProfileSectionKey, CompanyProfileSection> = {
  basicDetails: 'BASIC_DETAILS',
  primaryLocation: 'PRIMARY_LOCATION',
  personalProfile: 'PERSONAL_PROFILE',
  teamMembers: 'TEAM_MEMBERS',
  billing: 'BILLING',
  branding: 'BRANDING',
};


