/**
 * Team assignment types for sales reps and recruiters
 */

export interface SalesRepAssignment {
  id: string;
  employerId: string;
  salesRepId: string;
  salesRepName: string;
  isPrimary: boolean;
  assignedBy: string;
  assignedByName: string;
  assignedAt: Date;
  notes?: string;
}

export interface RecruiterAssignment {
  id: string;
  employerId: string;
  recruiterId: string; // Links to Consultant
  recruiterName: string;
  specialization?: string;
  isPrimary: boolean;
  assignedBy: string;
  assignedByName: string;
  assignedAt: Date;
  notes?: string;
}
