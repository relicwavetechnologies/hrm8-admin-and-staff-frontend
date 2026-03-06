/**
 * Validation schemas for Employer CRM
 */

import { z } from "zod";
import { commonValidators } from "./common";

/**
 * Employer wizard form schema
 */
export const employerWizardSchema = z.object({
  // Company Information
  name: z.string().min(1, "Company name is required").max(100),
  email: commonValidators.email(false),
  website: commonValidators.websiteUrl(),
  industry: z.string().min(1, "Industry is required").max(100),
  location: commonValidators.location(),
  companySize: z.string().optional(),
  description: commonValidators.longText("Description"),
  
  // Account Setup
  accountType: z.enum(['approved', 'payg']),
  status: z.enum(['active', 'inactive', 'pending', 'trial', 'expired']),
  creditLimit: commonValidators.currency("Credit limit").optional(),
  paymentTerms: z.string().optional(),
  
  // Subscription
  subscriptionTier: z.enum(['ats-lite', 'payg', 'small', 'medium', 'large', 'enterprise']),
  maxOpenJobs: commonValidators.positiveNumber("Maximum open jobs", 1),
  maxUsers: commonValidators.positiveNumber("Maximum users", 1),
  monthlySubscriptionFee: commonValidators.currency("Monthly subscription fee").optional(),
});

export type EmployerWizardFormData = z.infer<typeof employerWizardSchema>;

/**
 * Employer step field mappings
 */
export const employerStepFields = {
  companyInfo: ['name', 'email', 'website', 'industry', 'location'] as (keyof EmployerWizardFormData)[],
  accountSetup: ['accountType', 'status'] as (keyof EmployerWizardFormData)[],
  subscription: ['subscriptionTier', 'maxOpenJobs', 'maxUsers'] as (keyof EmployerWizardFormData)[],
};

// Employer validation
export const employerSchema = z.object({
  name: z.string().min(2, "Company name must be at least 2 characters").max(100),
  industry: z.string().min(1, "Industry is required"),
  website: z.string().url("Invalid website URL").optional().or(z.literal("")),
  description: z.string().max(1000, "Description must be less than 1000 characters").optional(),
  location: z.string().min(1, "Primary location is required"),
  companySize: z.enum(["1-10", "11-50", "51-200", "201-500", "501-1000", "1000+"]).optional(),
  accountType: z.enum(["approved", "payg"]),
  subscriptionTier: z.enum(["free", "small", "medium", "large", "enterprise"]),
  status: z.enum(["active", "inactive", "pending", "trial", "expired"]),
  creditLimit: z.number().min(0).optional(),
  paymentTerms: z.number().min(0).max(90).optional(),
  accountManagerId: z.string().optional(),
});

export type EmployerFormData = z.infer<typeof employerSchema>;

// Contact validation
export const contactSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50),
  lastName: z.string().min(1, "Last name is required").max(50),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  title: z.string().max(100).optional(),
  department: z.string().max(100).optional(),
  isPrimary: z.boolean().default(false),
  roles: z.array(z.enum(["decision-maker", "technical", "billing", "hr", "recruiter", "other"])),
  linkedInUrl: z.string().url("Invalid LinkedIn URL").optional().or(z.literal("")),
  notes: z.string().max(500).optional(),
});

export type ContactFormData = z.infer<typeof contactSchema>;

// Note validation
export const noteSchema = z.object({
  category: z.enum(["general", "meeting", "call", "email", "issue", "opportunity"]),
  content: z.string().min(1, "Note content is required").max(5000),
  isPrivate: z.boolean().default(false),
});

export type NoteFormData = z.infer<typeof noteSchema>;

// Document validation
export const documentSchema = z.object({
  type: z.enum(["contract", "proposal", "agreement", "invoice", "msa", "other"]),
  name: z.string().min(1, "Document name is required").max(200),
  notes: z.string().max(500).optional(),
});

export type DocumentFormData = z.infer<typeof documentSchema>;

// Subscription change validation
export const subscriptionChangeSchema = z.object({
  newTier: z.enum(["free", "small", "medium", "large", "enterprise"]),
  reason: z.string().max(500).optional(),
  effectiveDate: z.date(),
});

export type SubscriptionChangeFormData = z.infer<typeof subscriptionChangeSchema>;

// Task validation
export const taskSchema = z.object({
  title: z.string().min(1, "Task title is required").max(200),
  description: z.string().max(1000).optional(),
  dueDate: z.date(),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  assignedTo: z.string().min(1, "Assignee is required"),
});

export type TaskFormData = z.infer<typeof taskSchema>;

// Invoice validation
export const invoiceSchema = z.object({
  items: z.array(z.object({
    description: z.string().min(1, "Description is required"),
    quantity: z.number().min(1),
    unitPrice: z.number().min(0),
  })).min(1, "At least one line item is required"),
  dueDate: z.date(),
  notes: z.string().max(500).optional(),
});

export type InvoiceFormData = z.infer<typeof invoiceSchema>;

// Employer User validation
export const employerUserSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50),
  lastName: z.string().min(1, "Last name is required").max(50),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  title: z.string().max(100).optional(),
  department: z.string().max(100).optional(),
  role: z.enum(['owner', 'admin', 'recruiter', 'hiring-manager', 'viewer']),
  permissions: z.array(z.string()),
});

export type EmployerUserFormData = z.infer<typeof employerUserSchema>;

// Location validation
export const locationSchema = z.object({
  name: z.string().min(1, "Location name is required").max(100),
  addressLine1: z.string().min(1, "Address is required").max(200),
  addressLine2: z.string().max(200).optional().or(z.literal("")),
  city: z.string().min(1, "City is required").max(100),
  postalCode: z.string().min(1, "Post code/zip code is required").max(20),
  state: z.string().max(50).optional().or(z.literal("")),
  country: z.string().min(1, "Country is required").max(100),
  phone: z.string().min(1, "Phone number is required").regex(/^\+?[\d\s\-\(\)]+$/, "Invalid phone number format").max(30),
  isPrimary: z.boolean().default(false),
  capacity: z.number().min(0).optional(),
});

export type LocationFormData = z.infer<typeof locationSchema>;

// Department validation (update existing)
export const departmentSchemaExtended = z.object({
  name: z.string().min(1, "Department name is required").max(100),
  description: z.string().max(500).optional().or(z.literal("")),
  headOfDepartment: z.string().max(100).optional().or(z.literal("")),
  costCenter: z.string().max(50).optional().or(z.literal("")),
});

export type DepartmentFormData = z.infer<typeof departmentSchemaExtended>;
