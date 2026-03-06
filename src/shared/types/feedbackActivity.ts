export type ActivityType = 
  | 'feedback_submitted'
  | 'feedback_updated'
  | 'comment_added'
  | 'vote_cast'
  | 'decision_recorded'
  | 'feedback_requested'
  | 'mention';

export interface FeedbackActivity {
  id: string;
  type: ActivityType;
  candidateId: string;
  candidateName: string;
  userId: string;
  userName: string;
  userRole: string;
  timestamp: Date;
  description: string;
  metadata?: {
    oldValue?: string;
    newValue?: string;
    section?: string;
    [key: string]: any;
  };
}

export interface CommentThread {
  id: string;
  candidateId: string;
  feedbackId: string;
  parentCommentId?: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  content: string;
  mentions: string[];
  createdAt: Date;
  updatedAt?: Date;
  replies: CommentThread[];
  reactions: {
    emoji: string;
    userId: string;
    userName: string;
  }[];
}

export interface FeedbackVersion {
  id: string;
  feedbackId: string;
  version: number;
  changedBy: string;
  changedAt: Date;
  changes: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
  snapshot: any;
}
