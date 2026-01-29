import { z } from "zod";

export interface PipelineStage {
  id: string;
  name: string;
  color: string;
  order: number;
  isActive: boolean;
}

export interface PipelineCandidate {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  jobId: string;
  jobTitle: string;
  stageId: string;
  priority: 'high' | 'medium' | 'low';
  tags: string[];
  appliedDate: string;
  lastUpdated: string;
  resumeUrl?: string;
  matchScore?: number;
  notes?: string;
  nextInterviewDate?: string;
}

export interface PipelineMove {
  candidateId: string;
  fromStageId: string;
  toStageId: string;
  movedAt: string;
  movedBy: string;
}

export interface PipelineAnalytics {
  totalCandidates: number;
  candidatesByStage: Record<string, number>;
  conversionRates: Record<string, number>;
  averageTimeInStage: Record<string, number>;
  bottlenecks: { stageId: string; stageName: string; count: number }[];
  recentMoves: PipelineMove[];
}

// Validation schemas
export const candidateSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().max(20).optional(),
  jobId: z.string(),
  stageId: z.string(),
  priority: z.enum(['high', 'medium', 'low']),
  tags: z.array(z.string().max(50)).max(10),
  notes: z.string().max(1000).optional(),
});

// Default pipeline stages
const defaultStages: PipelineStage[] = [
  { id: 'applied', name: 'Applied', color: '#3b82f6', order: 1, isActive: true },
  { id: 'screening', name: 'Phone Screen', color: '#8b5cf6', order: 2, isActive: true },
  { id: 'technical', name: 'Technical', color: '#ec4899', order: 3, isActive: true },
  { id: 'final', name: 'Final Interview', color: '#f59e0b', order: 4, isActive: true },
  { id: 'offer', name: 'Offer', color: '#10b981', order: 5, isActive: true },
  { id: 'hired', name: 'Hired', color: '#06b6d4', order: 6, isActive: true },
  { id: 'rejected', name: 'Rejected', color: '#ef4444', order: 7, isActive: true },
];

// Mock candidates data
const mockCandidates: PipelineCandidate[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah.j@email.com',
    phone: '+1 555-0101',
    jobId: '1',
    jobTitle: 'Senior Software Engineer',
    stageId: 'applied',
    priority: 'high',
    tags: ['React', 'TypeScript', 'Senior'],
    appliedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    lastUpdated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    matchScore: 92,
  },
  {
    id: '2',
    name: 'Michael Chen',
    email: 'm.chen@email.com',
    phone: '+1 555-0102',
    jobId: '1',
    jobTitle: 'Senior Software Engineer',
    stageId: 'screening',
    priority: 'high',
    tags: ['Python', 'Django', 'Full-Stack'],
    appliedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    lastUpdated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    matchScore: 88,
    nextInterviewDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    email: 'emily.r@email.com',
    jobId: '1',
    jobTitle: 'Senior Software Engineer',
    stageId: 'technical',
    priority: 'medium',
    tags: ['React', 'Vue.js', 'Frontend'],
    appliedDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    lastUpdated: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    matchScore: 85,
  },
  {
    id: '4',
    name: 'David Kim',
    email: 'david.kim@email.com',
    jobId: '2',
    jobTitle: 'Product Manager',
    stageId: 'final',
    priority: 'high',
    tags: ['Product', 'Strategy', 'Leadership'],
    appliedDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    lastUpdated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    matchScore: 90,
    nextInterviewDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '5',
    name: 'Jessica Martinez',
    email: 'j.martinez@email.com',
    jobId: '1',
    jobTitle: 'Senior Software Engineer',
    stageId: 'offer',
    priority: 'high',
    tags: ['React', 'Node.js', 'Full-Stack'],
    appliedDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    lastUpdated: new Date().toISOString(),
    matchScore: 95,
  },
  {
    id: '6',
    name: 'Alex Thompson',
    email: 'alex.t@email.com',
    jobId: '1',
    jobTitle: 'Senior Software Engineer',
    stageId: 'applied',
    priority: 'medium',
    tags: ['Java', 'Spring', 'Backend'],
    appliedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    lastUpdated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    matchScore: 78,
  },
  {
    id: '7',
    name: 'Olivia Brown',
    email: 'olivia.b@email.com',
    jobId: '2',
    jobTitle: 'Product Manager',
    stageId: 'screening',
    priority: 'low',
    tags: ['Product', 'Analytics'],
    appliedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    lastUpdated: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    matchScore: 72,
  },
];

const mockMoves: PipelineMove[] = [];

export function getPipelineStages(): PipelineStage[] {
  return [...defaultStages].sort((a, b) => a.order - b.order);
}

export function getPipelineCandidates(filters?: {
  jobId?: string;
  stageId?: string;
  priority?: 'high' | 'medium' | 'low';
  search?: string;
}): PipelineCandidate[] {
  let filtered = [...mockCandidates];

  if (filters?.jobId) {
    filtered = filtered.filter((c) => c.jobId === filters.jobId);
  }
  if (filters?.stageId) {
    filtered = filtered.filter((c) => c.stageId === filters.stageId);
  }
  if (filters?.priority) {
    filtered = filtered.filter((c) => c.priority === filters.priority);
  }
  if (filters?.search) {
    const search = filters.search.toLowerCase().trim();
    filtered = filtered.filter(
      (c) =>
        c.name.toLowerCase().includes(search) ||
        c.email.toLowerCase().includes(search) ||
        c.jobTitle.toLowerCase().includes(search)
    );
  }

  return filtered;
}

export function moveCandidateToStage(
  candidateId: string,
  toStageId: string,
  movedBy: string = 'current-user'
): PipelineCandidate | null {
  const candidate = mockCandidates.find((c) => c.id === candidateId);
  if (!candidate) return null;

  const fromStageId = candidate.stageId;

  // Update candidate stage
  candidate.stageId = toStageId;
  candidate.lastUpdated = new Date().toISOString();

  // Record move
  mockMoves.unshift({
    candidateId,
    fromStageId,
    toStageId,
    movedAt: new Date().toISOString(),
    movedBy,
  });

  return candidate;
}

export function getPipelineAnalytics(): PipelineAnalytics {
  const stages = getPipelineStages();
  const candidates = getPipelineCandidates();

  const candidatesByStage: Record<string, number> = {};
  stages.forEach((stage) => {
    candidatesByStage[stage.id] = candidates.filter(
      (c) => c.stageId === stage.id
    ).length;
  });

  // Calculate conversion rates (simplified)
  const conversionRates: Record<string, number> = {};
  for (let i = 0; i < stages.length - 1; i++) {
    const currentStage = stages[i];
    const nextStage = stages[i + 1];
    const currentCount = candidatesByStage[currentStage.id] || 0;
    const nextCount = candidatesByStage[nextStage.id] || 0;

    if (currentCount > 0) {
      conversionRates[currentStage.id] = Math.round(
        (nextCount / (currentCount + nextCount)) * 100
      );
    } else {
      conversionRates[currentStage.id] = 0;
    }
  }

  // Mock average time in stage (days)
  const averageTimeInStage: Record<string, number> = {
    applied: 2,
    screening: 5,
    technical: 7,
    final: 4,
    offer: 6,
    hired: 0,
    rejected: 0,
  };

  // Identify bottlenecks (stages with most candidates)
  const bottlenecks = Object.entries(candidatesByStage)
    .map(([stageId, count]) => ({
      stageId,
      stageName: stages.find((s) => s.id === stageId)?.name || stageId,
      count,
    }))
    .filter((b) => b.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  return {
    totalCandidates: candidates.length,
    candidatesByStage,
    conversionRates,
    averageTimeInStage,
    bottlenecks,
    recentMoves: mockMoves.slice(0, 10),
  };
}

export function updateCandidatePriority(
  candidateId: string,
  priority: 'high' | 'medium' | 'low'
): PipelineCandidate | null {
  const candidate = mockCandidates.find((c) => c.id === candidateId);
  if (!candidate) return null;

  candidate.priority = priority;
  candidate.lastUpdated = new Date().toISOString();
  return candidate;
}

export function addCandidateToPipeline(
  data: Omit<PipelineCandidate, 'id' | 'appliedDate' | 'lastUpdated'>
): PipelineCandidate {
  candidateSchema.parse(data);

  const newCandidate: PipelineCandidate = {
    ...data,
    id: Date.now().toString(),
    appliedDate: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
  };

  mockCandidates.push(newCandidate);
  return newCandidate;
}
