export type EmployeeStatus = 'active' | 'on-leave' | 'notice-period' | 'inactive' | 'terminated';
export type EmploymentType = 'full-time' | 'part-time' | 'contract' | 'intern' | 'casual';
export type Gender = 'male' | 'female' | 'non-binary' | 'prefer-not-to-say';

export interface Employee {
  id: string;
  employeeId: string; // Employee number/code
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: Gender;
  avatar?: string;
  
  // Job Information
  jobTitle: string;
  department: string;
  location: string;
  managerId?: string;
  managerName?: string;
  employmentType: EmploymentType;
  status: EmployeeStatus;
  hireDate: string;
  startDate: string;
  endDate?: string;
  
  // Contact Information
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
  
  // Compensation
  salary: number;
  currency: string;
  payFrequency: 'hourly' | 'weekly' | 'biweekly' | 'monthly' | 'annually';
  
  // Additional Info
  skills?: string[];
  certifications?: string[];
  notes?: string;
  
  // Custom Fields
  customFields?: Record<string, any>;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  lastActivityAt?: string;
}

export interface EmploymentHistory {
  id: string;
  employeeId: string;
  position: string;
  department: string;
  location: string;
  startDate: string;
  endDate?: string;
  salary: number;
  changeReason?: string;
  notes?: string;
  createdAt: string;
  createdBy: string;
}

export interface EmployeeDocument {
  id: string;
  employeeId: string;
  name: string;
  type: EmployeeDocumentType;
  description?: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  version: number;
  uploadedBy: string;
  uploadedAt: string;
  expiryDate?: string;
  status: 'active' | 'expired' | 'archived';
  tags?: string[];
}

export type EmployeeDocumentType = 
  | 'contract'
  | 'identification'
  | 'certification'
  | 'tax-form'
  | 'visa'
  | 'license'
  | 'policy-acknowledgment'
  | 'performance-review'
  | 'resume'
  | 'other';

export interface EmployeeNote {
  id: string;
  employeeId: string;
  content: string;
  category: 'general' | 'performance' | 'disciplinary' | 'achievement' | 'feedback';
  isPrivate: boolean;
  createdBy: string;
  createdByName: string;
  createdAt: string;
  updatedAt?: string;
  attachments?: string[];
}

export interface CustomField {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'multiselect' | 'boolean' | 'textarea';
  options?: string[]; // For select/multiselect
  required: boolean;
  section: 'personal' | 'job' | 'compensation' | 'other';
  order: number;
  isActive: boolean;
  createdAt: string;
}

export interface EmployeePermission {
  id: string;
  role: 'admin' | 'hr-manager' | 'manager' | 'employee';
  canViewPersonalInfo: boolean;
  canEditPersonalInfo: boolean;
  canViewCompensation: boolean;
  canEditCompensation: boolean;
  canViewDocuments: boolean;
  canUploadDocuments: boolean;
  canViewNotes: boolean;
  canAddNotes: boolean;
  canViewHistory: boolean;
  canTerminate: boolean;
}
