/**
 * Common validation builders and utilities
 * Reusable validation patterns for all forms
 */

import { z } from "zod";

/**
 * Common field validators
 */
export const commonValidators = {
  // Name fields
  firstName: () => z.string().min(1, "First name is required").max(50, "First name must be less than 50 characters"),
  lastName: () => z.string().min(1, "Last name is required").max(50, "Last name must be less than 50 characters"),
  middleName: () => z.string().max(50, "Middle name must be less than 50 characters").optional(),
  
  // Contact fields
  email: (required = true) => 
    required 
      ? z.string().email("Invalid email address").max(255, "Email must be less than 255 characters")
      : z.string().email("Invalid email address").max(255).optional().or(z.literal("")),
  
  phone: (required = false) => 
    required
      ? z.string().min(1, "Phone number is required").regex(/^\+?[\d\s\-\(\)]+$/, "Invalid phone number format").max(30)
      : z.string().regex(/^\+?[\d\s\-\(\)]+$/, "Invalid phone number format").max(30).optional().or(z.literal("")),
  
  // URL fields
  url: (fieldName = "URL", required = false) =>
    required
      ? z.string().url(`Invalid ${fieldName}`)
      : z.string().url(`Invalid ${fieldName}`).optional().or(z.literal("")),
  
  linkedInUrl: () => z.string().url("Invalid LinkedIn URL").optional().or(z.literal("")),
  websiteUrl: () => z.string().url("Invalid website URL").optional().or(z.literal("")),
  
  // Text fields
  shortText: (fieldName: string, required = false, maxLength = 100) =>
    required
      ? z.string().min(1, `${fieldName} is required`).max(maxLength, `${fieldName} must be less than ${maxLength} characters`)
      : z.string().max(maxLength, `${fieldName} must be less than ${maxLength} characters`).optional().or(z.literal("")),
  
  longText: (fieldName: string, maxLength = 1000) =>
    z.string().max(maxLength, `${fieldName} must be less than ${maxLength} characters`).optional().or(z.literal("")),
  
  // Location fields
  location: () => z.string().min(1, "Location is required").max(100),
  city: () => z.string().max(100).optional().or(z.literal("")),
  state: () => z.string().max(50).optional().or(z.literal("")),
  country: () => z.string().min(1, "Country is required").max(100),
  postalCode: () => z.string().min(1, "Postal code is required").max(20),
  addressLine: (lineNumber: number, required = true) =>
    required
      ? z.string().min(1, `Address line ${lineNumber} is required`).max(200)
      : z.string().max(200).optional().or(z.literal("")),
  
  // Date fields
  date: (fieldName: string, required = true) =>
    required
      ? z.string().min(1, `${fieldName} is required`)
      : z.string().optional(),
  
  dateObject: (fieldName: string, required = true) =>
    required
      ? z.date({ required_error: `${fieldName} is required` })
      : z.date().optional(),
  
  // Numeric fields
  positiveNumber: (fieldName: string, min = 0) =>
    z.number().min(min, `${fieldName} must be at least ${min}`),
  
  percentage: (fieldName = "Percentage") =>
    z.number().min(0, `${fieldName} must be at least 0`).max(100, `${fieldName} cannot exceed 100`),
  
  currency: (fieldName = "Amount") =>
    z.number().min(0, `${fieldName} must be non-negative`),
};

/**
 * Common enum validators
 */
export const commonEnums = {
  gender: z.enum(["male", "female", "non-binary", "prefer-not-to-say"]),
  
  employmentType: z.enum(["full-time", "part-time", "contract", "intern", "casual", "freelance"]),
  
  status: z.enum(["active", "inactive", "pending", "trial", "expired", "on-leave", "notice-period", "terminated", "suspended"]),
  
  priority: z.enum(["low", "medium", "high", "urgent"]),
  
  currency: z.enum(["USD", "EUR", "GBP", "CAD", "AUD"]),
};

/**
 * Validation refinements
 */
export const validationRefinements = {
  // Date range validation
  dateRange: (startDateKey: string, endDateKey: string) => ({
    refine: (data: any) => {
      if (!data[startDateKey] || !data[endDateKey]) return true;
      return new Date(data[startDateKey]) <= new Date(data[endDateKey]);
    },
    message: "End date must be after or equal to start date",
    path: [endDateKey],
  }),
  
  // Conditional required field
  conditionalRequired: (conditionKey: string, conditionValue: any, requiredKey: string, fieldName: string) => ({
    refine: (data: any) => {
      if (data[conditionKey] === conditionValue && !data[requiredKey]) {
        return false;
      }
      return true;
    },
    message: `${fieldName} is required`,
    path: [requiredKey],
  }),
};

/**
 * Common validation messages
 */
export const validationMessages = {
  required: (fieldName: string) => `${fieldName} is required`,
  invalid: (fieldName: string) => `Invalid ${fieldName}`,
  minLength: (fieldName: string, length: number) => `${fieldName} must be at least ${length} characters`,
  maxLength: (fieldName: string, length: number) => `${fieldName} must be less than ${length} characters`,
  min: (fieldName: string, value: number) => `${fieldName} must be at least ${value}`,
  max: (fieldName: string, value: number) => `${fieldName} cannot exceed ${value}`,
};
