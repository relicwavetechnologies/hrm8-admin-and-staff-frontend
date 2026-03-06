import { z } from 'zod';

export const applicationSchema = z.object({
  job_id: z.string().uuid({ message: "Invalid job ID" }),
  candidate_id: z.string().uuid({ message: "Invalid candidate ID" }),
  status: z.enum(['new', 'screening', 'interview', 'offer', 'hired', 'rejected']).default('new'),
  stage: z.enum(['applied', 'phone-screen', 'technical', 'onsite', 'offer', 'hired']).default('applied'),
  cover_letter: z.string().max(5000, { message: "Cover letter must be less than 5000 characters" }).optional(),
  resume_url: z.string().url({ message: "Invalid resume URL" }).optional(),
  rating: z.number().int().min(1).max(5).optional(),
  notes: z.string().max(2000, { message: "Notes must be less than 2000 characters" }).optional(),
  rejection_reason: z.string().max(500, { message: "Rejection reason must be less than 500 characters" }).optional(),
});

export const candidateSchema = z.object({
  first_name: z.string().trim().min(1, { message: "First name is required" }).max(100),
  last_name: z.string().trim().min(1, { message: "Last name is required" }).max(100),
  email: z.string().trim().email({ message: "Invalid email address" }).max(255),
  phone: z.string().trim().max(50).optional(),
  location: z.string().trim().max(200).optional(),
  linkedin_url: z.string().url({ message: "Invalid LinkedIn URL" }).optional().or(z.literal('')),
  resume_url: z.string().url({ message: "Invalid resume URL" }).optional().or(z.literal('')),
  skills: z.array(z.string()).optional(),
  experience_years: z.number().int().min(0).max(100).optional(),
  education: z.string().max(1000).optional(),
  notes: z.string().max(2000).optional(),
  source: z.string().max(100).optional(),
});

export const interviewSchema = z.object({
  application_id: z.string().uuid({ message: "Invalid application ID" }),
  title: z.string().trim().min(1, { message: "Title is required" }).max(200),
  interview_type: z.enum(['phone', 'video', 'in-person', 'technical']),
  scheduled_date: z.string().datetime({ message: "Invalid date/time" }),
  duration_minutes: z.number().int().min(15).max(480).default(60),
  location: z.string().max(500).optional(),
  meeting_link: z.string().url({ message: "Invalid meeting link" }).optional().or(z.literal('')),
  interviewer_ids: z.array(z.string().uuid()).optional(),
  status: z.enum(['scheduled', 'completed', 'cancelled', 'no-show']).default('scheduled'),
  feedback: z.string().max(5000).optional(),
  rating: z.number().int().min(1).max(5).optional(),
  recommendation: z.enum(['strong-hire', 'hire', 'maybe', 'no-hire', 'strong-no-hire']).optional(),
  notes: z.string().max(2000).optional(),
});

export const offerSchema = z.object({
  application_id: z.string().uuid({ message: "Invalid application ID" }),
  job_title: z.string().trim().min(1, { message: "Job title is required" }).max(200),
  salary: z.number().int().min(0, { message: "Salary must be positive" }),
  start_date: z.string().optional(),
  employment_type: z.string().max(100).optional(),
  benefits: z.string().max(5000).optional(),
  additional_terms: z.string().max(5000).optional(),
  status: z.enum(['draft', 'pending-approval', 'sent', 'accepted', 'rejected', 'withdrawn']).default('draft'),
  sent_date: z.string().datetime().optional(),
  response_deadline: z.string().datetime().optional(),
  response_date: z.string().datetime().optional(),
});

export const requisitionSchema = z.object({
  title: z.string().trim().min(1, { message: "Title is required" }).max(200),
  department: z.string().trim().min(1, { message: "Department is required" }).max(200),
  position_count: z.number().int().min(1).max(100).default(1),
  employment_type: z.string().max(100).optional(),
  salary_range_min: z.number().int().min(0).optional(),
  salary_range_max: z.number().int().min(0).optional(),
  justification: z.string().max(5000).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  status: z.enum(['pending', 'approved', 'rejected', 'cancelled']).default('pending'),
});

export const backgroundCheckSchema = z.object({
  application_id: z.string().uuid({ message: "Invalid application ID" }),
  check_type: z.enum(['criminal', 'employment', 'education', 'credit', 'drug-test']),
  provider: z.string().max(200).optional(),
  status: z.enum(['pending', 'in-progress', 'completed', 'failed']).default('pending'),
  result: z.enum(['clear', 'flagged', 'failed']).optional(),
  notes: z.string().max(2000).optional(),
  consent_given: z.boolean().default(false),
  consent_date: z.string().datetime().optional(),
});
