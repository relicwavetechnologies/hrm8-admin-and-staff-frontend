export type GoalStatus = 'not-started' | 'in-progress' | 'completed' | 'on-hold' | 'cancelled';
export type GoalPriority = 'low' | 'medium' | 'high' | 'critical';
export type ReviewCycle = 'monthly' | 'quarterly' | 'bi-annual' | 'annual';
export type ReviewStatus = 'not-started' | 'in-progress' | 'completed' | 'overdue';
export type FeedbackType = 'self' | 'manager' | 'peer' | 'direct-report' | 'other';

export interface PerformanceGoal {
  id: string;
  employeeId: string;
  employeeName: string;
  title: string;
  description: string;
  category: string;
  priority: GoalPriority;
  status: GoalStatus;
  startDate: string;
  targetDate: string;
  completedDate?: string;
  progress: number; // 0-100
  kpis: GoalKPI[];
  alignedWith?: string; // Parent goal or OKR ID
  alignmentType?: 'company-okr' | 'team-objective' | 'individual-goal';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CompanyOKR {
  id: string;
  title: string;
  description: string;
  category: string;
  owner: string;
  ownerName: string;
  startDate: string;
  targetDate: string;
  progress: number;
  status: GoalStatus;
  keyResults: KeyResult[];
  createdAt: string;
  updatedAt: string;
}

export interface KeyResult {
  id: string;
  title: string;
  target: number;
  current: number;
  unit: string;
  progress: number;
}

export interface TeamObjective {
  id: string;
  title: string;
  description: string;
  teamName: string;
  alignedWithOKR: string; // Company OKR ID
  owner: string;
  ownerName: string;
  startDate: string;
  targetDate: string;
  progress: number;
  status: GoalStatus;
  createdAt: string;
  updatedAt: string;
}

export interface GoalKPI {
  id: string;
  name: string;
  target: number;
  current: number;
  unit: string;
  description?: string;
}

export interface PerformanceReviewTemplate {
  id: string;
  name: string;
  description?: string;
  cycle: ReviewCycle;
  sections: ReviewSection[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewSection {
  id: string;
  title: string;
  description?: string;
  questions: ReviewQuestion[];
  weight: number; // Percentage weight in overall score
}

export interface ReviewQuestion {
  id: string;
  question: string;
  type: 'rating' | 'text' | 'yes-no' | 'multiple-choice';
  required: boolean;
  options?: string[]; // For multiple choice
  helpText?: string;
}

export interface PerformanceReview {
  id: string;
  employeeId: string;
  employeeName: string;
  reviewerId: string;
  reviewerName: string;
  templateId: string;
  templateName: string;
  reviewPeriodStart: string;
  reviewPeriodEnd: string;
  status: ReviewStatus;
  dueDate: string;
  completedDate?: string;
  overallRating?: number; // 1-5
  responses: ReviewResponse[];
  strengths?: string;
  areasForImprovement?: string;
  goals?: string;
  managerComments?: string;
  employeeComments?: string;
  approvalWorkflow?: ApprovalWorkflow;
  createdAt: string;
  updatedAt: string;
}

export interface ApprovalWorkflow {
  stages: ApprovalStage[];
  currentStageIndex: number;
  overallStatus: 'pending' | 'in-progress' | 'approved' | 'rejected';
}

export interface ApprovalStage {
  id: string;
  name: string;
  role: 'manager' | 'hr' | 'senior-manager' | 'executive';
  approverId?: string;
  approverName?: string;
  status: 'pending' | 'approved' | 'rejected';
  comments?: string;
  actionDate?: string;
  required: boolean;
}

export interface ReviewResponse {
  sectionId: string;
  questionId: string;
  rating?: number;
  textResponse?: string;
  selectedOptions?: string[];
}

export interface Feedback360 {
  id: string;
  employeeId: string;
  employeeName: string;
  reviewCycle: string;
  requestedBy: string;
  requestedByName: string;
  providers: FeedbackProvider[];
  questions: FeedbackQuestion[];
  responses?: FeedbackResponse[];
  status: 'pending' | 'in-progress' | 'completed';
  dueDate: string;
  createdAt: string;
  completedAt?: string;
}

export interface FeedbackQuestion {
  id: string;
  question: string;
}

export interface FeedbackProvider {
  id: string;
  providerId: string;
  providerName: string;
  relationship: string;
  email: string;
  status: 'pending' | 'submitted';
  submittedAt?: string;
}

export interface FeedbackResponse {
  id: string;
  providerId: string;
  providerName: string;
  relationship: string;
  questionId: string;
  question: string;
  rating: number;
  comment: string;
  submittedAt: string;
}

export interface ReviewSchedule {
  id: string;
  name: string;
  templateId: string;
  templateName: string;
  cycle: ReviewCycle;
  nextReviewDate: string;
  employeeIds: string[]; // If empty, applies to all
  autoAssignToManager: boolean;
  sendReminders: boolean;
  reminderDaysBefore: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PerformanceMetrics {
  employeeId: string;
  averageRating: number;
  goalsCompleted: number;
  goalsInProgress: number;
  totalGoals: number;
  lastReviewDate?: string;
  nextReviewDate?: string;
  improvementTrend: 'improving' | 'stable' | 'declining' | 'new';
}

export interface MeetingAgendaTemplate {
  id: string;
  name: string;
  description: string;
  sections: {
    id: string;
    title: string;
    description?: string;
    order: number;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface MeetingActionItem {
  id: string;
  description: string;
  assignedTo: string;
  assignedToName: string;
  dueDate: string;
  status: 'pending' | 'in-progress' | 'completed' | 'blocked';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  completedAt?: string;
}

export interface OneOnOneMeeting {
  id: string;
  employeeId: string;
  employeeName: string;
  managerId: string;
  managerName: string;
  scheduledDate: string;
  duration: number;
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  templateId?: string;
  agendaItems: {
    id: string;
    sectionTitle: string;
    notes: string;
    order: number;
  }[];
  actionItems: MeetingActionItem[];
  privateNotes?: {
    employeeNotes?: string;
    managerNotes?: string;
  };
  recurringSchedule?: {
    frequency: 'weekly' | 'biweekly' | 'monthly';
    nextMeetingDate?: string;
  };
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface CalibrationSession {
  id: string;
  name: string;
  description?: string;
  scheduledDate: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  facilitatorId: string;
  facilitatorName: string;
  participants: CalibrationParticipant[];
  employees: CalibrationEmployee[];
  ratingDistribution?: {
    beforeCalibration: Record<number, number>;
    afterCalibration: Record<number, number>;
  };
  discussionNotes?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface CalibrationParticipant {
  id: string;
  userId: string;
  userName: string;
  role: string;
  department: string;
  attendance: 'pending' | 'attending' | 'declined';
}

export interface CalibrationEmployee {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  role: string;
  managerId: string;
  managerName: string;
  initialRating: number;
  proposedRating?: number;
  finalRating?: number;
  rationale?: string;
  discussionNotes?: string;
  performanceHighlights?: string[];
  developmentAreas?: string[];
  comparisonMetrics?: {
    goalsCompleted: number;
    totalGoals: number;
    avgReviewRating: number;
    tenure: number;
  };
}

export type ProficiencyLevel = 'none' | 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface SkillCategory {
  id: string;
  name: string;
  description?: string;
  type: 'technical' | 'soft' | 'leadership' | 'domain';
  skills: Skill[];
}

export interface Skill {
  id: string;
  name: string;
  description?: string;
  categoryId: string;
  importance: 'low' | 'medium' | 'high' | 'critical';
}

export interface SkillAssessment {
  id: string;
  employeeId: string;
  employeeName: string;
  role: string;
  department: string;
  assessorId: string;
  assessorName: string;
  assessmentDate: string;
  assessmentType: 'self' | 'manager' | 'peer' | '360';
  skillRatings: SkillRating[];
  overallNotes?: string;
  developmentPlan?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SkillRating {
  skillId: string;
  skillName: string;
  categoryId: string;
  currentLevel: ProficiencyLevel;
  targetLevel?: ProficiencyLevel;
  requiredLevel?: ProficiencyLevel;
  lastAssessed: string;
  trend?: 'improving' | 'stable' | 'declining';
  notes?: string;
  evidenceLinks?: string[];
}

export interface RoleSkillRequirement {
  id: string;
  roleName: string;
  department: string;
  level: 'junior' | 'mid' | 'senior' | 'lead' | 'principal';
  requiredSkills: {
    skillId: string;
    skillName: string;
    categoryId: string;
    minimumLevel: ProficiencyLevel;
    importance: 'required' | 'preferred' | 'nice-to-have';
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface SkillGapAnalysis {
  employeeId: string;
  employeeName: string;
  role: string;
  targetRole?: string;
  gaps: {
    skillId: string;
    skillName: string;
    currentLevel: ProficiencyLevel;
    requiredLevel: ProficiencyLevel;
    gap: number;
    priority: 'low' | 'medium' | 'high' | 'critical';
  }[];
  strengths: {
    skillId: string;
    skillName: string;
    level: ProficiencyLevel;
  }[];
  developmentRecommendations: string[];
}

export type PIPStatus = 'active' | 'on-track' | 'at-risk' | 'completed' | 'failed' | 'cancelled';
export type PIPSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface PerformanceImprovementPlan {
  id: string;
  employeeId: string;
  employeeName: string;
  managerId: string;
  managerName: string;
  hrPartnerId?: string;
  hrPartnerName?: string;
  startDate: string;
  endDate: string;
  status: PIPStatus;
  severity: PIPSeverity;
  triggerReason: string;
  performanceIssues: string[];
  expectedOutcomes: string[];
  consequences: string;
  milestones: PIPMilestone[];
  checkIns: PIPCheckIn[];
  resources: PIPResource[];
  alerts: PIPAlert[];
  notes?: string;
  finalOutcome?: {
    status: 'successful' | 'unsuccessful';
    summary: string;
    nextSteps: string;
    completedDate: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface PIPMilestone {
  id: string;
  title: string;
  description: string;
  targetDate: string;
  completedDate?: string;
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  successCriteria: string[];
  actualResults?: string;
  evidence?: string[];
}

export interface PIPCheckIn {
  id: string;
  scheduledDate: string;
  completedDate?: string;
  attendees: {
    id: string;
    name: string;
    role: string;
  }[];
  discussionPoints: string[];
  progressRating: 1 | 2 | 3 | 4 | 5;
  managerNotes: string;
  employeeNotes?: string;
  actionItems: {
    id: string;
    description: string;
    dueDate: string;
    status: 'pending' | 'completed';
  }[];
  concerns?: string[];
  positives?: string[];
}

export interface PIPResource {
  id: string;
  type: 'training' | 'mentoring' | 'coaching' | 'documentation' | 'tool' | 'other';
  title: string;
  description: string;
  url?: string;
  provider?: string;
  completionDate?: string;
  status: 'pending' | 'in-progress' | 'completed';
}

export interface PIPAlert {
  id: string;
  type: 'milestone-due' | 'checkin-due' | 'at-risk' | 'improvement' | 'deadline-approaching';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  date: string;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedDate?: string;
}

export type ReadinessLevel = 'ready-now' | 'ready-1-2-years' | 'ready-3-5-years' | 'not-ready';
export type PotentialLevel = 'low' | 'medium' | 'high' | 'exceptional';
export type PerformanceLevel = 'low' | 'medium' | 'high' | 'exceptional';
export type RiskOfLoss = 'low' | 'medium' | 'high' | 'critical';

export interface SuccessionPlan {
  id: string;
  positionId: string;
  positionTitle: string;
  department: string;
  level: string;
  incumbentId?: string;
  incumbentName?: string;
  criticality: 'low' | 'medium' | 'high' | 'critical';
  vacancyRisk: RiskOfLoss;
  successors: SuccessionCandidate[];
  developmentPrograms: string[];
  notes?: string;
  lastReviewDate: string;
  nextReviewDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface SuccessionCandidate {
  id: string;
  employeeId: string;
  employeeName: string;
  currentRole: string;
  department: string;
  readinessLevel: ReadinessLevel;
  potentialLevel: PotentialLevel;
  performanceLevel: PerformanceLevel;
  riskOfLoss: RiskOfLoss;
  strengths: string[];
  developmentNeeds: string[];
  developmentPlan?: DevelopmentPath;
  lastAssessmentDate: string;
  assessedBy: string;
  assessedByName: string;
  priority: number; // 1 = highest priority
}

export interface DevelopmentPath {
  id: string;
  candidateId: string;
  targetRole: string;
  estimatedTimeframe: string;
  milestones: DevelopmentMilestone[];
  requiredSkills: {
    skillId: string;
    skillName: string;
    currentLevel: ProficiencyLevel;
    targetLevel: ProficiencyLevel;
  }[];
  assignedMentor?: {
    id: string;
    name: string;
  };
  progress: number;
  status: 'not-started' | 'in-progress' | 'completed' | 'on-hold';
  createdAt: string;
  updatedAt: string;
}

export interface DevelopmentMilestone {
  id: string;
  title: string;
  description: string;
  type: 'training' | 'project' | 'mentorship' | 'stretch-assignment' | 'certification' | 'other';
  targetDate: string;
  completedDate?: string;
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
}

export interface NineBoxPosition {
  employeeId: string;
  employeeName: string;
  currentRole: string;
  department: string;
  performance: PerformanceLevel;
  potential: PotentialLevel;
  riskOfLoss: RiskOfLoss;
  lastAssessmentDate: string;
}

export interface LeadershipPipeline {
  level: string;
  positions: {
    positionId: string;
    title: string;
    department: string;
    incumbentId?: string;
    incumbentName?: string;
    vacancyRisk: RiskOfLoss;
    successorCount: number;
    readyNowCount: number;
  }[];
  totalPositions: number;
  coverageRate: number; // Percentage of positions with ready successors
}

// Learning & Development Types
export type CourseLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';
export type CourseFormat = 'online' | 'in-person' | 'hybrid' | 'self-paced';
export type CourseStatus = 'draft' | 'published' | 'archived';
export type EnrollmentStatus = 'not-started' | 'in-progress' | 'completed' | 'failed' | 'expired';
export type CertificationStatus = 'active' | 'expired' | 'revoked' | 'pending';

export interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  level: CourseLevel;
  format: CourseFormat;
  status: CourseStatus;
  duration: number; // in hours
  instructor: string;
  instructorAvatar?: string;
  thumbnail?: string;
  skills: string[];
  prerequisites: string[];
  learningObjectives: string[];
  price: number;
  currency: string;
  rating: number;
  enrollmentCount: number;
  maxCapacity?: number;
  startDate?: Date;
  endDate?: Date;
  modules: CourseModule[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CourseModule {
  id: string;
  title: string;
  description: string;
  order: number;
  duration: number; // in minutes
  lessons: Lesson[];
  assessment?: Assessment;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  order: number;
  duration: number; // in minutes
  contentType: 'video' | 'document' | 'quiz' | 'assignment' | 'interactive';
  contentUrl?: string;
  isRequired: boolean;
}

export interface Assessment {
  id: string;
  title: string;
  type: 'quiz' | 'assignment' | 'project' | 'exam';
  passingScore: number;
  maxAttempts: number;
  timeLimit?: number; // in minutes
  questions: AssessmentQuestion[];
}

export interface AssessmentQuestion {
  id: string;
  question: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer' | 'essay';
  options?: string[];
  correctAnswer?: string | string[];
  points: number;
}

export interface TrainingPath {
  id: string;
  title: string;
  description: string;
  category: string;
  targetRole?: string;
  level: CourseLevel;
  estimatedDuration: number; // total hours
  courses: string[]; // course IDs in order
  skills: string[];
  prerequisites: string[];
  completionCertificate?: string;
  enrollmentCount: number;
  createdBy: string;
  isRecommended: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CourseEnrollment {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeAvatar?: string;
  courseId: string;
  courseTitle: string;
  status: EnrollmentStatus;
  progress: number; // 0-100
  enrolledDate: Date;
  startedDate?: Date;
  completedDate?: Date;
  dueDate?: Date;
  currentModule?: string;
  completedModules: string[];
  timeSpent: number; // in minutes
  lastAccessedDate?: Date;
  assessmentScores: {
    moduleId: string;
    score: number;
    attempts: number;
    passedAt?: Date;
  }[];
  certificateId?: string;
  assignedBy?: string;
  isRequired: boolean;
  notes?: string;
}

export interface Certification {
  id: string;
  title: string;
  description: string;
  issuingOrganization: string;
  category: string;
  level: CourseLevel;
  validityPeriod?: number; // in months, null for lifetime
  requirements: {
    courses?: string[];
    assessments?: string[];
    experience?: string;
    prerequisites?: string[];
  };
  badgeUrl?: string;
  verificationUrl?: string;
  createdAt: Date;
}

export interface EmployeeCertification {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeAvatar?: string;
  certificationId: string;
  certificationTitle: string;
  status: CertificationStatus;
  issuedDate: Date;
  expiryDate?: Date;
  certificateNumber: string;
  certificateUrl?: string;
  verificationUrl?: string;
  issuingOrganization: string;
  renewalRequired: boolean;
  renewalDate?: Date;
  creditsEarned?: number;
  notes?: string;
}

export interface SkillDevelopmentProgram {
  id: string;
  title: string;
  description: string;
  targetSkills: string[];
  currentLevel: CourseLevel;
  targetLevel: CourseLevel;
  employeeId: string;
  employeeName: string;
  managerId: string;
  managerName: string;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  startDate: Date;
  targetEndDate: Date;
  actualEndDate?: Date;
  trainingPaths: string[];
  courses: string[];
  milestones: DevelopmentMilestone[];
  progress: number; // 0-100
  budget?: number;
  spentAmount?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LearningAnalytics {
  employeeId: string;
  totalCoursesEnrolled: number;
  coursesCompleted: number;
  coursesInProgress: number;
  totalLearningHours: number;
  certificationsEarned: number;
  averageAssessmentScore: number;
  skillsAcquired: string[];
  learningStreak: number; // days
  lastActivityDate: Date;
  monthlyProgress: {
    month: string;
    hoursSpent: number;
    coursesCompleted: number;
  }[];
}

// ============= Certificate System Types =============

export interface Certificate {
  id: string;
  employeeId: string;
  employeeName: string;
  type: 'course' | 'certification' | 'skill-mastery' | 'program-completion';
  title: string;
  description: string;
  issueDate: Date;
  expiryDate?: Date;
  issuer: string;
  issuerSignature: string;
  verificationCode: string;
  skills: string[];
  credentialUrl: string;
  certificateData: {
    courseId?: string;
    courseName?: string;
    score?: number;
    hours?: number;
    instructorName?: string;
  };
}

export interface CertificateTemplate {
  id: string;
  name: string;
  type: string;
  layout: 'landscape' | 'portrait';
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  logoUrl?: string;
  backgroundPattern?: string;
}

// ============= Gamification Types =============

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'achievement' | 'skill' | 'milestone' | 'special';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  requirements: {
    type: string;
    target: number;
    criteria: string;
  };
  points: number;
}

export interface EmployeeBadge {
  id: string;
  employeeId: string;
  badgeId: string;
  badge: Badge;
  earnedDate: Date;
  progress?: number;
}

export interface GamificationProfile {
  employeeId: string;
  totalPoints: number;
  level: number;
  rank: string;
  badges: EmployeeBadge[];
  streak: number;
  longestStreak: number;
  completedChallenges: string[];
  achievements: Achievement[];
  lastActivity: Date;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlockedDate: Date;
  icon: string;
  points: number;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'weekly' | 'monthly' | 'team' | 'skill';
  startDate: Date;
  endDate: Date;
  target: number;
  current: number;
  reward: {
    points: number;
    badges?: string[];
  };
  participants: string[];
  status: 'active' | 'completed' | 'expired';
}

export interface LeaderboardEntry {
  rank: number;
  employeeId: string;
  employeeName: string;
  department: string;
  points: number;
  level: number;
  badges: number;
  change: number; // position change from last period
}
