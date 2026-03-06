export interface AssessmentComment {
  id: string;
  assessmentId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  parentId?: string; // For threaded replies
  createdAt: string;
  updatedAt: string;
  isEdited: boolean;
  mentions?: string[]; // User IDs mentioned in the comment
  attachments?: CommentAttachment[];
}

export interface CommentAttachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
}

export interface AssessmentRating {
  id: string;
  assessmentId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  category: RatingCategory;
  score: number; // 1-5
  comment?: string;
  createdAt: string;
  updatedAt: string;
}

export type RatingCategory =
  | 'technical-skills'
  | 'problem-solving'
  | 'communication'
  | 'cultural-fit'
  | 'overall';

export interface AssessmentDecision {
  id: string;
  assessmentId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  decision: DecisionType;
  reasoning: string;
  createdAt: string;
  updatedAt: string;
}

export type DecisionType = 'proceed' | 'reject' | 'maybe' | 'pending';

export interface CollaboratorActivity {
  id: string;
  assessmentId: string;
  userId: string;
  userName: string;
  activityType: ActivityType;
  details: string;
  timestamp: string;
}

export type ActivityType =
  | 'viewed'
  | 'commented'
  | 'rated'
  | 'decided'
  | 'shared'
  | 'mentioned';

export interface AssessmentCollaborator {
  userId: string;
  userName: string;
  userEmail: string;
  userAvatar?: string;
  role: string;
  addedAt: string;
  lastViewedAt?: string;
  hasCommented: boolean;
  hasRated: boolean;
  hasDecided: boolean;
}

export interface CollaborationSummary {
  totalComments: number;
  totalRatings: number;
  decisions: {
    proceed: number;
    reject: number;
    maybe: number;
    pending: number;
  };
  averageRatings: Record<RatingCategory, number>;
  collaborators: AssessmentCollaborator[];
  lastActivity: string;
}
