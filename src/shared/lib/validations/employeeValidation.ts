/**
 * Employee validation schemas
 */

import { z } from "zod";
import { commonValidators, commonEnums } from "./common";

/**
 * Employee wizard form schema
 */
export const employeeWizardSchema = z.object({
  // Personal Information
  firstName: commonValidators.firstName(),
  lastName: commonValidators.lastName(),
  email: commonValidators.email(true),
  phone: commonValidators.phone(false),
  dateOfBirth: commonValidators.date("Date of birth", false),
  gender: commonEnums.gender,
  
  // Job Details
  jobTitle: z.string().min(1, "Job title is required").max(100),
  department: commonValidators.shortText("Department", false),
  location: commonValidators.shortText("Location", false),
  employmentType: z.enum(['full-time', 'part-time', 'contract', 'intern', 'casual']),
  status: z.enum(['active', 'on-leave', 'notice-period', 'inactive', 'terminated']),
  hireDate: commonValidators.date("Hire date", true),
  startDate: commonValidators.date("Start date", false),
  
  // Contact Information
  address: commonValidators.shortText("Address", false, 200),
  city: commonValidators.city(),
  state: commonValidators.state(),
  postalCode: commonValidators.shortText("Postal code", false, 20),
  country: z.string().optional(),
  emergencyContactName: commonValidators.shortText("Emergency contact name", false),
  emergencyContactPhone: commonValidators.phone(false),
  emergencyContactRelationship: commonValidators.shortText("Relationship", false),
  
  // Compensation
  salary: commonValidators.currency("Salary"),
  currency: z.string().min(1, "Currency is required"),
});

export type EmployeeWizardFormData = z.infer<typeof employeeWizardSchema>;

/**
 * Employee step field mappings
 */
export const employeeStepFields = {
  personalInfo: ['firstName', 'lastName', 'email', 'phone', 'dateOfBirth', 'gender'] as (keyof EmployeeWizardFormData)[],
  jobDetails: ['jobTitle', 'department', 'location', 'employmentType', 'status', 'hireDate', 'startDate'] as (keyof EmployeeWizardFormData)[],
  contactInfo: ['address', 'city', 'state', 'postalCode', 'country', 'emergencyContactName', 'emergencyContactPhone', 'emergencyContactRelationship'] as (keyof EmployeeWizardFormData)[],
  compensation: ['salary', 'currency'] as (keyof EmployeeWizardFormData)[],
};
