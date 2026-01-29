import { Job } from "@/shared/types/job";

export interface CandidateMatch {
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  candidateAvatar?: string;
  matchScore: number;
  matchReasons: MatchReason[];
  skillsMatch: number;
  experienceMatch: number;
  locationMatch: number;
  availabilityMatch: number;
  status: "available" | "passive" | "interviewed" | "offered";
}

export interface MatchReason {
  category: "skills" | "experience" | "location" | "education" | "other";
  description: string;
  weight: number;
}

export interface MatchingCriteria {
  includePassiveCandidates: boolean;
  minimumMatchScore: number;
  maxResults: number;
  prioritizeLocation: boolean;
  prioritizeAvailability: boolean;
}

// Mock candidate data
const mockCandidates = [
  {
    id: "1",
    name: "Sarah Johnson",
    email: "sarah.j@email.com",
    avatar: undefined,
    skills: ["React", "TypeScript", "Node.js", "AWS", "Docker"],
    experienceYears: 6,
    location: "San Francisco, CA",
    currentRole: "Senior Software Engineer",
    availability: "available",
  },
  {
    id: "2",
    name: "Michael Chen",
    email: "m.chen@email.com",
    avatar: undefined,
    skills: ["Python", "Django", "PostgreSQL", "React", "Docker"],
    experienceYears: 5,
    location: "New York, NY",
    currentRole: "Full Stack Developer",
    availability: "passive",
  },
  {
    id: "3",
    name: "Emily Rodriguez",
    email: "emily.r@email.com",
    avatar: undefined,
    skills: ["React", "Vue.js", "TypeScript", "GraphQL", "AWS"],
    experienceYears: 4,
    location: "Austin, TX",
    currentRole: "Frontend Developer",
    availability: "available",
  },
  {
    id: "4",
    name: "David Kim",
    email: "david.kim@email.com",
    avatar: undefined,
    skills: ["Java", "Spring Boot", "Kubernetes", "AWS", "MongoDB"],
    experienceYears: 8,
    location: "Seattle, WA",
    currentRole: "Lead Backend Engineer",
    availability: "passive",
  },
  {
    id: "5",
    name: "Jessica Martinez",
    email: "j.martinez@email.com",
    avatar: undefined,
    skills: ["React", "TypeScript", "Node.js", "GraphQL", "PostgreSQL"],
    experienceYears: 5,
    location: "San Francisco, CA",
    currentRole: "Senior Full Stack Engineer",
    availability: "available",
  },
];

export function getCandidateMatches(
  job: Job,
  criteria: MatchingCriteria = {
    includePassiveCandidates: true,
    minimumMatchScore: 60,
    maxResults: 10,
    prioritizeLocation: false,
    prioritizeAvailability: true,
  }
): CandidateMatch[] {
  const matches: CandidateMatch[] = [];

  for (const candidate of mockCandidates) {
    // Filter by availability
    if (!criteria.includePassiveCandidates && candidate.availability === "passive") {
      continue;
    }

    // Calculate match scores
    const skillsMatch = calculateSkillsMatch(job, candidate);
    const experienceMatch = calculateExperienceMatch(job, candidate);
    const locationMatch = calculateLocationMatch(job, candidate);
    const availabilityMatch = candidate.availability === "available" ? 100 : 60;

    // Calculate weighted overall score
    const weights = {
      skills: 0.4,
      experience: 0.3,
      location: criteria.prioritizeLocation ? 0.2 : 0.1,
      availability: criteria.prioritizeAvailability ? 0.2 : 0.1,
    };

    const overallScore = Math.round(
      skillsMatch * weights.skills +
      experienceMatch * weights.experience +
      locationMatch * weights.location +
      availabilityMatch * weights.availability
    );

    // Filter by minimum score
    if (overallScore < criteria.minimumMatchScore) {
      continue;
    }

    // Generate match reasons
    const matchReasons = generateMatchReasons(
      job,
      candidate,
      skillsMatch,
      experienceMatch,
      locationMatch
    );

    matches.push({
      candidateId: candidate.id,
      candidateName: candidate.name,
      candidateEmail: candidate.email,
      candidateAvatar: candidate.avatar,
      matchScore: overallScore,
      matchReasons,
      skillsMatch,
      experienceMatch,
      locationMatch,
      availabilityMatch,
      status: candidate.availability as any,
    });
  }

  // Sort by match score
  matches.sort((a, b) => b.matchScore - a.matchScore);

  // Limit results
  return matches.slice(0, criteria.maxResults);
}

function calculateSkillsMatch(job: Job, candidate: any): number {
  // Extract skills from job requirements (simplified)
  const jobSkills = ["React", "TypeScript", "Node.js", "AWS"]; // In real app, parse from job.requirements
  
  const matchingSkills = candidate.skills.filter((skill: string) =>
    jobSkills.some((js) => js.toLowerCase() === skill.toLowerCase())
  );

  return Math.round((matchingSkills.length / jobSkills.length) * 100);
}

function calculateExperienceMatch(job: Job, candidate: any): number {
  const requiredYears = job.experienceLevel === "entry" ? 1 :
                        job.experienceLevel === "mid" ? 3 :
                        job.experienceLevel === "senior" ? 5 : 8;

  if (candidate.experienceYears >= requiredYears) {
    return 100;
  } else if (candidate.experienceYears >= requiredYears * 0.8) {
    return 80;
  } else if (candidate.experienceYears >= requiredYears * 0.6) {
    return 60;
  }
  return 40;
}

function calculateLocationMatch(job: Job, candidate: any): number {
  if (job.workArrangement === "remote") {
    return 100;
  }

  // Simple location matching (in real app, use geo-distance)
  const jobCity = job.location.split(",")[0].toLowerCase();
  const candidateCity = candidate.location.split(",")[0].toLowerCase();

  if (jobCity === candidateCity) {
    return 100;
  }

  // Same state or nearby
  return 50;
}

function generateMatchReasons(
  job: Job,
  candidate: any,
  skillsMatch: number,
  experienceMatch: number,
  locationMatch: number
): MatchReason[] {
  const reasons: MatchReason[] = [];

  if (skillsMatch >= 75) {
    reasons.push({
      category: "skills",
      description: `Strong skills match with ${Math.round(skillsMatch)}% alignment`,
      weight: skillsMatch,
    });
  }

  if (experienceMatch >= 80) {
    reasons.push({
      category: "experience",
      description: `${candidate.experienceYears} years of relevant experience`,
      weight: experienceMatch,
    });
  }

  if (locationMatch === 100) {
    reasons.push({
      category: "location",
      description: job.workArrangement === "remote" ? "Open to remote work" : "Located in same city",
      weight: locationMatch,
    });
  }

  if (candidate.currentRole.toLowerCase().includes(job.title.toLowerCase().split(" ")[0])) {
    reasons.push({
      category: "other",
      description: `Current role similar to position: ${candidate.currentRole}`,
      weight: 85,
    });
  }

  return reasons;
}

export function getMatchingInsights(matches: CandidateMatch[]) {
  return {
    totalMatches: matches.length,
    averageScore: matches.reduce((sum, m) => sum + m.matchScore, 0) / matches.length || 0,
    topScore: matches[0]?.matchScore || 0,
    availableCandidates: matches.filter((m) => m.status === "available").length,
    passiveCandidates: matches.filter((m) => m.status === "passive").length,
  };
}
