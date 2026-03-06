/**
 * Consultant validation schemas
 */

import { z } from "zod";
import { commonValidators } from "./common";

/**
 * Consultant wizard form schema
 */
export const consultantWizardSchema = z.object({
  // Basic Information
  firstName: commonValidators.firstName(),
  lastName: commonValidators.lastName(),
  email: commonValidators.email(true),
  phone: commonValidators.phone(true),
  photo: commonValidators.shortText("Photo URL", false, 500),
  location: commonValidators.location(),
  city: commonValidators.city(),
  state: commonValidators.state(),
  country: commonValidators.country(),

  // Professional Information
  type: z.enum(['sales-rep', 'recruiter', '360-consultant', 'industry-partner']),
  status: z.enum(['active', 'on-leave', 'inactive', 'suspended']),
  employmentType: z.enum(['full-time', 'part-time', 'contract', 'freelance']),
  title: commonValidators.shortText("Title", false),
  specialization: z.array(z.string()).min(1, "At least one specialization is required"),
  yearsOfExperience: commonValidators.positiveNumber("Years of experience", 0),
  bio: commonValidators.longText("Bio", 2000),
  linkedInUrl: commonValidators.linkedInUrl(),
  portfolioUrl: commonValidators.url("Portfolio URL", false),

  // Capacity & Commission
  maxEmployers: commonValidators.positiveNumber("Maximum employers", 1),
  maxJobs: commonValidators.positiveNumber("Maximum jobs", 1),
  commissionStructure: z.enum(['percentage', 'flat', 'tiered', 'custom']),
  defaultCommissionRate: commonValidators.percentage("Default commission rate").optional(),
});

export type ConsultantWizardFormData = z.infer<typeof consultantWizardSchema>;

/**
 * Consultant step field mappings
 */
export const consultantStepFields = {
  basicInfo: ['firstName', 'lastName', 'email', 'phone', 'location', 'city', 'state', 'country'] as (keyof ConsultantWizardFormData)[],
  professional: ['type', 'status', 'employmentType', 'specialization', 'yearsOfExperience'] as (keyof ConsultantWizardFormData)[],
  capacity: ['maxEmployers', 'maxJobs', 'commissionStructure'] as (keyof ConsultantWizardFormData)[],
};
