import {
  AssessmentComment,
  AssessmentRating,
  AssessmentDecision,
  CollaboratorActivity,
  AssessmentCollaborator,
  CollaborationSummary,
  RatingCategory,
  DecisionType,
} from '@/shared/types/assessmentCollaboration';

const COMMENTS_KEY = 'hrm8_assessment_comments';
const RATINGS_KEY = 'hrm8_assessment_ratings';
const DECISIONS_KEY = 'hrm8_assessment_decisions';
const ACTIVITIES_KEY = 'hrm8_assessment_activities';
// const COLLABORATORS_KEY = 'hrm8_assessment_collaborators';

// Mock current user
const CURRENT_USER = {
  id: 'user-1',
  name: 'Sarah Johnson',
  email: 'sarah@company.com',
  avatar: undefined,
};

// Mock data
const mockComments: AssessmentComment[] = [
  {
    id: 'comment-1',
    assessmentId: 'assess-1',
    userId: 'user-2',
    userName: 'Michael Chen',
    content: 'Strong technical performance overall. The candidate demonstrated excellent problem-solving skills in the coding section.',
    createdAt: '2024-03-15T10:30:00Z',
    updatedAt: '2024-03-15T10:30:00Z',
    isEdited: false,
  },
  {
    id: 'comment-2',
    assessmentId: 'assess-1',
    userId: 'user-3',
    userName: 'Emily Rodriguez',
    content: 'I agree with Michael. However, I noticed the communication section score was slightly lower. We should discuss this during the interview.',
    parentId: 'comment-1',
    createdAt: '2024-03-15T11:15:00Z',
    updatedAt: '2024-03-15T11:15:00Z',
    isEdited: false,
    mentions: ['user-2'],
  },
  {
    id: 'comment-3',
    assessmentId: 'assess-1',
    userId: 'user-1',
    userName: 'Sarah Johnson',
    content: 'Time management was impressive - completed 10 minutes under the time limit while maintaining accuracy.',
    createdAt: '2024-03-15T14:20:00Z',
    updatedAt: '2024-03-15T14:20:00Z',
    isEdited: false,
  },
];

const mockRatings: AssessmentRating[] = [
  {
    id: 'rating-1',
    assessmentId: 'assess-1',
    userId: 'user-2',
    userName: 'Michael Chen',
    category: 'technical-skills',
    score: 5,
    comment: 'Exceptional technical abilities',
    createdAt: '2024-03-15T10:35:00Z',
    updatedAt: '2024-03-15T10:35:00Z',
  },
  {
    id: 'rating-2',
    assessmentId: 'assess-1',
    userId: 'user-2',
    userName: 'Michael Chen',
    category: 'problem-solving',
    score: 4,
    createdAt: '2024-03-15T10:35:00Z',
    updatedAt: '2024-03-15T10:35:00Z',
  },
  {
    id: 'rating-3',
    assessmentId: 'assess-1',
    userId: 'user-3',
    userName: 'Emily Rodriguez',
    category: 'communication',
    score: 3,
    comment: 'Adequate but could be improved',
    createdAt: '2024-03-15T11:20:00Z',
    updatedAt: '2024-03-15T11:20:00Z',
  },
  {
    id: 'rating-4',
    assessmentId: 'assess-1',
    userId: 'user-3',
    userName: 'Emily Rodriguez',
    category: 'cultural-fit',
    score: 4,
    createdAt: '2024-03-15T11:20:00Z',
    updatedAt: '2024-03-15T11:20:00Z',
  },
];

const mockDecisions: AssessmentDecision[] = [
  {
    id: 'decision-1',
    assessmentId: 'assess-1',
    userId: 'user-2',
    userName: 'Michael Chen',
    decision: 'proceed',
    reasoning: 'Strong technical skills and problem-solving ability. Recommend moving forward to the next interview stage.',
    createdAt: '2024-03-15T10:40:00Z',
    updatedAt: '2024-03-15T10:40:00Z',
  },
  {
    id: 'decision-2',
    assessmentId: 'assess-1',
    userId: 'user-3',
    userName: 'Emily Rodriguez',
    decision: 'maybe',
    reasoning: 'Technical skills are good, but I want to assess communication skills in a live interview before making a final decision.',
    createdAt: '2024-03-15T11:25:00Z',
    updatedAt: '2024-03-15T11:25:00Z',
  },
];

// Initialize storage
function initializeStorage() {
  if (!localStorage.getItem(COMMENTS_KEY)) {
    localStorage.setItem(COMMENTS_KEY, JSON.stringify(mockComments));
  }
  if (!localStorage.getItem(RATINGS_KEY)) {
    localStorage.setItem(RATINGS_KEY, JSON.stringify(mockRatings));
  }
  if (!localStorage.getItem(DECISIONS_KEY)) {
    localStorage.setItem(DECISIONS_KEY, JSON.stringify(mockDecisions));
  }
  if (!localStorage.getItem(ACTIVITIES_KEY)) {
    localStorage.setItem(ACTIVITIES_KEY, JSON.stringify([]));
  }
}

// Comments
export function getAssessmentComments(assessmentId: string): AssessmentComment[] {
  initializeStorage();
  const comments = JSON.parse(localStorage.getItem(COMMENTS_KEY) || '[]');
  return comments.filter((c: AssessmentComment) => c.assessmentId === assessmentId);
}

export function addAssessmentComment(
  assessmentId: string,
  content: string,
  parentId?: string,
  mentions?: string[]
): AssessmentComment {
  initializeStorage();
  const comments = JSON.parse(localStorage.getItem(COMMENTS_KEY) || '[]');

  const newComment: AssessmentComment = {
    id: `comment-${Date.now()}`,
    assessmentId,
    userId: CURRENT_USER.id,
    userName: CURRENT_USER.name,
    userAvatar: CURRENT_USER.avatar,
    content,
    parentId,
    mentions,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isEdited: false,
  };

  comments.push(newComment);
  localStorage.setItem(COMMENTS_KEY, JSON.stringify(comments));

  // Log activity
  logActivity(assessmentId, 'commented', `Added a comment`);

  return newComment;
}

export function updateAssessmentComment(commentId: string, content: string): void {
  initializeStorage();
  const comments = JSON.parse(localStorage.getItem(COMMENTS_KEY) || '[]');
  const index = comments.findIndex((c: AssessmentComment) => c.id === commentId);

  if (index >= 0) {
    comments[index].content = content;
    comments[index].updatedAt = new Date().toISOString();
    comments[index].isEdited = true;
    localStorage.setItem(COMMENTS_KEY, JSON.stringify(comments));
  }
}

export function deleteAssessmentComment(commentId: string): void {
  initializeStorage();
  const comments = JSON.parse(localStorage.getItem(COMMENTS_KEY) || '[]');
  const filtered = comments.filter((c: AssessmentComment) => c.id !== commentId);
  localStorage.setItem(COMMENTS_KEY, JSON.stringify(filtered));
}

// Ratings
export function getAssessmentRatings(assessmentId: string): AssessmentRating[] {
  initializeStorage();
  const ratings = JSON.parse(localStorage.getItem(RATINGS_KEY) || '[]');
  return ratings.filter((r: AssessmentRating) => r.assessmentId === assessmentId);
}

export function addAssessmentRating(
  assessmentId: string,
  category: RatingCategory,
  score: number,
  comment?: string
): AssessmentRating {
  initializeStorage();
  const ratings = JSON.parse(localStorage.getItem(RATINGS_KEY) || '[]');

  // Remove existing rating for same user and category
  const filtered = ratings.filter(
    (r: AssessmentRating) =>
      !(r.assessmentId === assessmentId && r.userId === CURRENT_USER.id && r.category === category)
  );

  const newRating: AssessmentRating = {
    id: `rating-${Date.now()}`,
    assessmentId,
    userId: CURRENT_USER.id,
    userName: CURRENT_USER.name,
    userAvatar: CURRENT_USER.avatar,
    category,
    score,
    comment,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  filtered.push(newRating);
  localStorage.setItem(RATINGS_KEY, JSON.stringify(filtered));

  // Log activity
  logActivity(assessmentId, 'rated', `Rated ${category}: ${score}/5`);

  return newRating;
}

// Decisions
export function getAssessmentDecisions(assessmentId: string): AssessmentDecision[] {
  initializeStorage();
  const decisions = JSON.parse(localStorage.getItem(DECISIONS_KEY) || '[]');
  return decisions.filter((d: AssessmentDecision) => d.assessmentId === assessmentId);
}

export function addAssessmentDecision(
  assessmentId: string,
  decision: DecisionType,
  reasoning: string
): AssessmentDecision {
  initializeStorage();
  const decisions = JSON.parse(localStorage.getItem(DECISIONS_KEY) || '[]');

  // Remove existing decision for same user
  const filtered = decisions.filter(
    (d: AssessmentDecision) =>
      !(d.assessmentId === assessmentId && d.userId === CURRENT_USER.id)
  );

  const newDecision: AssessmentDecision = {
    id: `decision-${Date.now()}`,
    assessmentId,
    userId: CURRENT_USER.id,
    userName: CURRENT_USER.name,
    userAvatar: CURRENT_USER.avatar,
    decision,
    reasoning,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  filtered.push(newDecision);
  localStorage.setItem(DECISIONS_KEY, JSON.stringify(filtered));

  // Log activity
  logActivity(assessmentId, 'decided', `Decision: ${decision}`);

  return newDecision;
}

// Activities
function logActivity(
  assessmentId: string,
  activityType: CollaboratorActivity['activityType'],
  details: string
): void {
  const activities = JSON.parse(localStorage.getItem(ACTIVITIES_KEY) || '[]');

  const newActivity: CollaboratorActivity = {
    id: `activity-${Date.now()}`,
    assessmentId,
    userId: CURRENT_USER.id,
    userName: CURRENT_USER.name,
    activityType,
    details,
    timestamp: new Date().toISOString(),
  };

  activities.push(newActivity);
  localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(activities));
}

export function getAssessmentActivities(assessmentId: string): CollaboratorActivity[] {
  initializeStorage();
  const activities = JSON.parse(localStorage.getItem(ACTIVITIES_KEY) || '[]');
  return activities
    .filter((a: CollaboratorActivity) => a.assessmentId === assessmentId)
    .sort((a: CollaboratorActivity, b: CollaboratorActivity) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
}

// Collaboration Summary
export function getCollaborationSummary(assessmentId: string): CollaborationSummary {
  const comments = getAssessmentComments(assessmentId);
  const ratings = getAssessmentRatings(assessmentId);
  const decisions = getAssessmentDecisions(assessmentId);
  const activities = getAssessmentActivities(assessmentId);

  // Calculate average ratings by category
  const categories: RatingCategory[] = [
    'technical-skills',
    'problem-solving',
    'communication',
    'cultural-fit',
    'overall',
  ];

  const averageRatings: Record<RatingCategory, number> = {} as any;
  categories.forEach((category) => {
    const categoryRatings = ratings.filter((r) => r.category === category);
    if (categoryRatings.length > 0) {
      averageRatings[category] =
        categoryRatings.reduce((sum, r) => sum + r.score, 0) / categoryRatings.length;
    } else {
      averageRatings[category] = 0;
    }
  });

  // Count decisions
  const decisionCounts = {
    proceed: decisions.filter((d) => d.decision === 'proceed').length,
    reject: decisions.filter((d) => d.decision === 'reject').length,
    maybe: decisions.filter((d) => d.decision === 'maybe').length,
    pending: decisions.filter((d) => d.decision === 'pending').length,
  };

  // Get unique collaborators
  const collaboratorMap = new Map<string, AssessmentCollaborator>();

  [...comments, ...ratings, ...decisions].forEach((item) => {
    if (!collaboratorMap.has(item.userId)) {
      const userComments = comments.filter((c) => c.userId === item.userId);
      const userRatings = ratings.filter((r) => r.userId === item.userId);
      const userDecisions = decisions.filter((d) => d.userId === item.userId);

      collaboratorMap.set(item.userId, {
        userId: item.userId,
        userName: item.userName,
        userEmail: `${item.userName.toLowerCase().replace(' ', '.')}@company.com`,
        userAvatar: item.userAvatar,
        role: 'Recruiter',
        addedAt: item.createdAt,
        hasCommented: userComments.length > 0,
        hasRated: userRatings.length > 0,
        hasDecided: userDecisions.length > 0,
      });
    }
  });

  return {
    totalComments: comments.length,
    totalRatings: ratings.length,
    decisions: decisionCounts,
    averageRatings,
    collaborators: Array.from(collaboratorMap.values()),
    lastActivity: activities[0]?.timestamp || new Date().toISOString(),
  };
}
