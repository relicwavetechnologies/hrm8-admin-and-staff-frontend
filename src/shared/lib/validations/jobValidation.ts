import { z } from 'zod';

// Base schema without refinements (for merging in jobFormSchema)
const baseJobBasicDetailsSchema = z.object({
  serviceType: z.enum(['self-managed', 'shortlisting', 'full-service', 'executive-search', 'rpo']),
  title: z.string().min(5, "Job title must be at least 5 characters"),
  numberOfVacancies: z.number()
    .min(1, "At least 1 vacancy is required")
    .max(999, "Maximum 999 vacancies allowed")
    .default(1),
  department: z.string().min(2, "Department is required"),
  location: z.string().min(2, "Location is required"),
  employmentType: z.enum(['full-time', 'part-time', 'contract', 'casual']),
  experienceLevel: z.enum(['entry', 'mid', 'senior', 'executive']),
  workArrangement: z.enum(['on-site', 'remote', 'hybrid']).default('on-site'),
  tags: z.array(z.string().min(1, "Tag cannot be empty").max(20, "Tag must be 20 characters or less"))
    .max(5, "Maximum 5 tags allowed")
    .default([]),
  salaryMin: z.number().min(0, "Minimum salary must be a positive number").optional(),
  salaryMax: z.number().min(0, "Maximum salary must be a positive number").optional(),
  salaryCurrency: z.string().default('USD'),
  salaryPeriod: z.enum(['hourly', 'daily', 'weekly', 'monthly', 'annual']).default('annual'),
  salaryDescription: z.string().max(100, "Salary description must be 100 characters or less").optional(),
  hideSalary: z.boolean().default(false),
});

// Exported schema with refinements (for step validation)
export const jobBasicDetailsSchema = baseJobBasicDetailsSchema.refine(
  (data) => {
    if (data.salaryMin && data.salaryMax) {
      return data.salaryMax >= data.salaryMin;
    }
    return true;
  },
  {
    message: "Maximum salary must be greater than or equal to minimum salary",
    path: ["salaryMax"],
  }
);

// Schema for requirement/responsibility objects
const requirementItemSchema = z.object({
  id: z.string(),
  text: z.string().min(1, "Requirement text cannot be empty"),
  order: z.number().optional(),
});

const responsibilityItemSchema = z.object({
  id: z.string(),
  text: z.string().min(1, "Responsibility text cannot be empty"),
  order: z.number().optional(),
});

export const jobDescriptionSchema = z.object({
  // Description is optional for HRM8 paid services which skip steps 2-5
  description: z.string()
    .default("")
    .optional()
    .transform(val => val || "")
    .refine((val) => {
      // Allow empty description for HRM8 paid services
      if (!val || val.length === 0) return true;
      // If provided, strip HTML tags to check actual text content length
      const textContent = val.replace(/<[^>]*>/g, '').trim();
      return textContent.length >= 50;
    }, {
      message: "Job description must contain at least 50 characters of actual content"
    }),
  requirements: z.array(z.union([
    z.string().min(1), // Support old string format
    requirementItemSchema // Support new object format
  ]))
    .optional()
    .default([]),
  responsibilities: z.array(z.union([
    z.string().min(1), // Support old string format
    responsibilityItemSchema // Support new object format
  ]))
    .optional()
    .default([]),
});

export const jobCompensationSchema = z.object({
  closeDate: z.string().optional(),
  visibility: z.enum(['public', 'private']),
  stealth: z.boolean().default(false),
  hiringTeam: z.array(z.any()).optional(),
});

const standardFieldSchema = z.object({
  included: z.boolean(),
  required: z.boolean(),
});

export const jobPublishSchema = z.object({
  status: z.enum(['draft', 'open']),
  jobBoardDistribution: z.array(z.string()),
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: "You must accept the Terms & Conditions to proceed",
  }),
  selectedPaymentMethod: z.enum(['account', 'credit_card']).optional(),
  paymentInvoiceRequested: z.boolean().optional(),
  applicationForm: z.object({
    id: z.string(),
    name: z.string(),
    questions: z.array(z.any()),
    includeStandardFields: z.object({
      resume: standardFieldSchema,
      coverLetter: standardFieldSchema,
      portfolio: standardFieldSchema,
      linkedIn: standardFieldSchema,
      website: standardFieldSchema,
    }),
  }).optional(),
});

// Full form schema (without refinement from compensation)
const baseCompensationSchema = z.object({
  closeDate: z.string().optional(),
  visibility: z.enum(['public', 'private']),
  stealth: z.boolean().default(false),
});

export const jobFormSchema = baseJobBasicDetailsSchema
  .merge(jobDescriptionSchema)
  .merge(baseCompensationSchema)
  .merge(jobPublishSchema)
  .refine((data) => {
    if (data.salaryMin && data.salaryMax) {
      return data.salaryMax >= data.salaryMin;
    }
    return true;
  }, {
    message: "Maximum salary must be greater than or equal to minimum salary",
    path: ["salaryMax"],
  });

export const templateSchema = z.object({
  templateName: z.string().min(3, "Template name must be at least 3 characters"),
  title: z.string().min(5, "Job title must be at least 5 characters"),
  description: z.string().min(50, "Description must be at least 50 characters"),
  requirements: z.array(z.string().min(1)).min(1, "At least one requirement is needed"),
  responsibilities: z.array(z.string().min(1)).min(1, "At least one responsibility is needed"),
  employmentType: z.string(),
  department: z.string(),
  experienceLevel: z.string(),
});

export type JobBasicDetailsInput = z.infer<typeof jobBasicDetailsSchema>;
export type JobDescriptionInput = z.infer<typeof jobDescriptionSchema>;
export type JobCompensationInput = z.infer<typeof jobCompensationSchema>;
export type JobPublishInput = z.infer<typeof jobPublishSchema>;
export type JobFormInput = z.infer<typeof jobFormSchema>;
export type TemplateInput = z.infer<typeof templateSchema>;
