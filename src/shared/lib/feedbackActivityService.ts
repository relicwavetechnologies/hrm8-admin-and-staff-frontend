import { FeedbackActivity, CommentThread, FeedbackVersion } from '@/shared/types/feedbackActivity';

// Mock activities
const mockActivities: FeedbackActivity[] = [
  {
    id: 'act-1',
    type: 'feedback_submitted',
    candidateId: 'candidate-1',
    candidateName: 'John Smith',
    userId: 'user-1',
    userName: 'Sarah Johnson',
    userRole: 'Technical Lead',
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    description: 'submitted feedback for John Smith',
  },
  {
    id: 'act-2',
    type: 'comment_added',
    candidateId: 'candidate-1',
    candidateName: 'John Smith',
    userId: 'user-2',
    userName: 'Mike Chen',
    userRole: 'Senior Developer',
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    description: 'added a comment on technical skills',
    metadata: { section: 'technical_skills' },
  },
  {
    id: 'act-3',
    type: 'vote_cast',
    candidateId: 'candidate-1',
    candidateName: 'John Smith',
    userId: 'user-3',
    userName: 'Emily Davis',
    userRole: 'HR Manager',
    timestamp: new Date(Date.now() - 10 * 60 * 1000),
    description: 'voted "Strong Yes" for John Smith',
  },
  {
    id: 'act-4',
    type: 'feedback_updated',
    candidateId: 'candidate-2',
    candidateName: 'Jane Doe',
    userId: 'user-1',
    userName: 'Sarah Johnson',
    userRole: 'Technical Lead',
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    description: 'updated feedback ratings',
    metadata: {
      oldValue: '7',
      newValue: '8',
      section: 'technical_skills',
    },
  },
];

const mockComments: CommentThread[] = [
  {
    id: 'comment-1',
    candidateId: 'candidate-1',
    feedbackId: 'feedback-1',
    authorId: 'user-1',
    authorName: 'Sarah Johnson',
    authorRole: 'Technical Lead',
    content: 'Excellent problem-solving skills demonstrated during the coding challenge. @Mike Chen what do you think?',
    mentions: ['Mike Chen'],
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    replies: [
      {
        id: 'comment-2',
        candidateId: 'candidate-1',
        feedbackId: 'feedback-1',
        parentCommentId: 'comment-1',
        authorId: 'user-2',
        authorName: 'Mike Chen',
        authorRole: 'Senior Developer',
        content: 'I agree! The approach to the algorithm optimization was impressive.',
        mentions: [],
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
        replies: [],
        reactions: [
          { emoji: '👍', userId: 'user-1', userName: 'Sarah Johnson' },
        ],
      },
    ],
    reactions: [
      { emoji: '👍', userId: 'user-2', userName: 'Mike Chen' },
      { emoji: '🎯', userId: 'user-3', userName: 'Emily Davis' },
    ],
  },
];

const mockVersions: FeedbackVersion[] = [
  {
    id: 'ver-1',
    feedbackId: 'feedback-1',
    version: 1,
    changedBy: 'Sarah Johnson',
    changedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
    changes: [
      {
        field: 'Technical Skills',
        oldValue: 7,
        newValue: 8,
      },
    ],
    snapshot: {},
  },
  {
    id: 'ver-2',
    feedbackId: 'feedback-1',
    version: 2,
    changedBy: 'Sarah Johnson',
    changedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
    changes: [
      {
        field: 'Overall Comment',
        oldValue: 'Good candidate',
        newValue: 'Excellent candidate with strong technical background',
      },
    ],
    snapshot: {},
  },
];

export const getActivities = (filters?: {
  candidateId?: string;
  userId?: string;
  type?: string;
  limit?: number;
}): FeedbackActivity[] => {
  let filtered = [...mockActivities];

  if (filters?.candidateId) {
    filtered = filtered.filter(a => a.candidateId === filters.candidateId);
  }

  if (filters?.userId) {
    filtered = filtered.filter(a => a.userId === filters.userId);
  }

  if (filters?.type) {
    filtered = filtered.filter(a => a.type === filters.type);
  }

  filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  if (filters?.limit) {
    filtered = filtered.slice(0, filters.limit);
  }

  return filtered;
};

export const addActivity = (activity: Omit<FeedbackActivity, 'id' | 'timestamp'>): FeedbackActivity => {
  const newActivity: FeedbackActivity = {
    ...activity,
    id: `act-${Date.now()}`,
    timestamp: new Date(),
  };
  mockActivities.unshift(newActivity);
  return newActivity;
};

export const getCommentThreads = (candidateId: string, feedbackId?: string): CommentThread[] => {
  let filtered = mockComments.filter(c => c.candidateId === candidateId);
  if (feedbackId) {
    filtered = filtered.filter(c => c.feedbackId === feedbackId);
  }
  return filtered;
};

export const addComment = (comment: Omit<CommentThread, 'id' | 'createdAt' | 'replies' | 'reactions'>): CommentThread => {
  const newComment: CommentThread = {
    ...comment,
    id: `comment-${Date.now()}`,
    createdAt: new Date(),
    replies: [],
    reactions: [],
  };

  if (comment.parentCommentId) {
    const parent = mockComments.find(c => c.id === comment.parentCommentId);
    if (parent) {
      parent.replies.push(newComment);
    }
  } else {
    mockComments.unshift(newComment);
  }

  return newComment;
};

export const addReaction = (commentId: string, emoji: string, userId: string, userName: string) => {
  const findAndUpdate = (comments: CommentThread[]): boolean => {
    for (const comment of comments) {
      if (comment.id === commentId) {
        const existing = comment.reactions.find(r => r.userId === userId && r.emoji === emoji);
        if (!existing) {
          comment.reactions.push({ emoji, userId, userName });
        }
        return true;
      }
      if (comment.replies.length > 0 && findAndUpdate(comment.replies)) {
        return true;
      }
    }
    return false;
  };

  findAndUpdate(mockComments);
};

export const getFeedbackVersions = (feedbackId: string): FeedbackVersion[] => {
  return mockVersions
    .filter(v => v.feedbackId === feedbackId)
    .sort((a, b) => b.version - a.version);
};

export const extractMentions = (text: string): string[] => {
  const mentionRegex = /@(\w+\s+\w+)/g;
  const matches = text.match(mentionRegex);
  return matches ? matches.map(m => m.substring(1)) : [];
};
