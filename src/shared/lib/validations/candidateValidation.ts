import { z } from 'zod';

// Phone number validation (basic US format)
const phoneRegex = /^[\d\s\-\(\)]+$/;

// URL validation
const urlSchema = z.string().url().optional().or(z.literal(''));

export const candidateBasicInfoSchema = z.object({
  firstName: z.string()
    .min(1, 'First name is required')
    .max(100, 'First name must be less than 100 characters')
    .trim(),
  lastName: z.string()
    .min(1, 'Last name is required')
    .max(100, 'Last name must be less than 100 characters')
    .trim(),
  email: z.string()
    .email('Invalid email address')
    .max(255, 'Email must be less than 255 characters')
    .trim(),
  phone: z.string()
    .regex(phoneRegex, 'Invalid phone number format')
    .min(10, 'Phone number must be at least 10 digits')
    .max(20, 'Phone number must be less than 20 characters'),
  photo: z.string().optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(50).optional(),
  country: z.string().min(1, 'Country is required').max(100),
});

export const candidateProfessionalSchema = z.object({
  currentPosition: z.string()
    .max(200, 'Position must be less than 200 characters')
    .optional(),
  desiredPosition: z.string()
    .max(200, 'Position must be less than 200 characters')
    .optional(),
  experienceYears: z.number()
    .min(0, 'Experience cannot be negative')
    .max(70, 'Experience seems unrealistic'),
  experienceLevel: z.enum(['entry', 'mid', 'senior', 'executive']),
  skills: z.array(z.string()).min(1, 'At least one skill is required'),
  education: z.string().max(500).optional(),
  certifications: z.array(z.string()).optional(),
});

export const candidatePreferencesSchema = z.object({
  salaryMin: z.number()
    .min(0, 'Salary cannot be negative')
    .optional(),
  salaryMax: z.number()
    .min(0, 'Salary cannot be negative')
    .optional(),
  salaryCurrency: z.string().default('USD'),
  workArrangement: z.enum(['remote', 'hybrid', 'onsite', 'flexible']),
  employmentTypePreferences: z.array(z.enum(['full-time', 'part-time', 'contract']))
    .min(1, 'At least one employment type preference is required'),
  noticePeriod: z.string().max(100).optional(),
  availabilityDate: z.date().optional(),
});

export const candidateDocumentsSchema = z.object({
  resumeUrl: urlSchema,
  coverLetterUrl: urlSchema,
  portfolioUrl: urlSchema,
  linkedInUrl: urlSchema,
  githubUrl: urlSchema,
  websiteUrl: urlSchema,
});

export const candidateAdditionalSchema = z.object({
  status: z.enum(['active', 'placed', 'inactive']).default('active'),
  source: z.enum(['job_board', 'referral', 'direct', 'linkedin', 'agency', 'career_fair', 'other']),
  sourceDetails: z.string().max(500).optional(),
  tags: z.array(z.string()).default([]),
  rating: z.number().min(0).max(5).optional(),
  assignedTo: z.string().optional(),
});

export const fullCandidateSchema = candidateBasicInfoSchema
  .merge(candidateProfessionalSchema)
  .merge(candidatePreferencesSchema)
  .merge(candidateDocumentsSchema)
  .merge(candidateAdditionalSchema)
  .refine((data) => {
    if (data.salaryMin !== undefined && data.salaryMax !== undefined) {
      return data.salaryMax >= data.salaryMin;
    }
    return true;
  }, {
    message: 'Maximum salary must be greater than or equal to minimum salary',
    path: ['salaryMax'],
  });

export const candidateNoteSchema = z.object({
  candidateId: z.string(),
  noteType: z.enum(['general', 'interview_feedback', 'phone_screen', 'reference_check', 'other']),
  content: z.string()
    .min(1, 'Note content is required')
    .max(5000, 'Note must be less than 5000 characters'),
  isPrivate: z.boolean().default(false),
});

export const candidateSearchSchema = z.object({
  query: z.string().optional(),
  status: z.array(z.enum(['active', 'placed', 'inactive'])).optional(),
  experienceLevel: z.array(z.enum(['entry', 'mid', 'senior', 'executive'])).optional(),
  skills: z.array(z.string()).optional(),
  location: z.string().optional(),
  source: z.enum(['job_board', 'referral', 'direct', 'linkedin', 'agency', 'career_fair', 'other']).optional(),
  assignedTo: z.string().optional(),
  availableFrom: z.date().optional(),
  availableTo: z.date().optional(),
});

export type CandidateBasicInfo = z.infer<typeof candidateBasicInfoSchema>;
export type CandidateProfessional = z.infer<typeof candidateProfessionalSchema>;
export type CandidatePreferences = z.infer<typeof candidatePreferencesSchema>;
export type CandidateDocuments = z.infer<typeof candidateDocumentsSchema>;
export type CandidateAdditional = z.infer<typeof candidateAdditionalSchema>;
export type FullCandidateForm = z.infer<typeof fullCandidateSchema>;
export type CandidateNoteForm = z.infer<typeof candidateNoteSchema>;
export type CandidateSearchForm = z.infer<typeof candidateSearchSchema>;
