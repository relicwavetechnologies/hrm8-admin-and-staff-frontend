export interface ApplicationReview {
  id: string;
  applicationId: string;
  reviewerId: string;
  reviewerName: string;
  reviewerAvatar?: string;
  rating: number; // 1-5
  categories: {
    technicalSkills: number;
    experience: number;
    culturalFit: number;
    communication: number;
  };
  comment: string;
  recommendation: 'strong-hire' | 'hire' | 'maybe' | 'no-hire' | 'strong-no-hire';
  createdAt: string;
  updatedAt: string;
}

export interface ApplicationVote {
  id: string;
  applicationId: string;
  voterId: string;
  voterName: string;
  voterAvatar?: string;
  decision: 'hire' | 'no-hire' | 'abstain';
  reasoning: string;
  votedAt: string;
}

export interface ApplicationComment {
  id: string;
  applicationId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  parentId?: string;
  mentions?: string[];
  createdAt: string;
  updatedAt: string;
  isEdited: boolean;
}

const REVIEWS_KEY = 'application_reviews';
const VOTES_KEY = 'application_votes';
const COMMENTS_KEY = 'application_comments';

// Reviews
export function getReviewsByApplication(applicationId: string): ApplicationReview[] {
  const reviews = JSON.parse(localStorage.getItem(REVIEWS_KEY) || '[]');
  return reviews.filter((r: ApplicationReview) => r.applicationId === applicationId);
}

export function addReview(review: Omit<ApplicationReview, 'id' | 'createdAt' | 'updatedAt'>): ApplicationReview {
  const reviews = JSON.parse(localStorage.getItem(REVIEWS_KEY) || '[]');
  const newReview: ApplicationReview = {
    ...review,
    id: `review-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  reviews.push(newReview);
  localStorage.setItem(REVIEWS_KEY, JSON.stringify(reviews));
  return newReview;
}

export function updateReview(reviewId: string, updates: Partial<ApplicationReview>): void {
  const reviews = JSON.parse(localStorage.getItem(REVIEWS_KEY) || '[]');
  const index = reviews.findIndex((r: ApplicationReview) => r.id === reviewId);
  if (index !== -1) {
    reviews[index] = {
      ...reviews[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(REVIEWS_KEY, JSON.stringify(reviews));
  }
}

// Votes
export function getVotesByApplication(applicationId: string): ApplicationVote[] {
  const votes = JSON.parse(localStorage.getItem(VOTES_KEY) || '[]');
  return votes.filter((v: ApplicationVote) => v.applicationId === applicationId);
}

export function addVote(vote: Omit<ApplicationVote, 'id' | 'votedAt'>): ApplicationVote {
  const votes = JSON.parse(localStorage.getItem(VOTES_KEY) || '[]');
  
  // Remove existing vote from same voter for this application
  const filteredVotes = votes.filter(
    (v: ApplicationVote) => !(v.applicationId === vote.applicationId && v.voterId === vote.voterId)
  );
  
  const newVote: ApplicationVote = {
    ...vote,
    id: `vote-${Date.now()}`,
    votedAt: new Date().toISOString(),
  };
  filteredVotes.push(newVote);
  localStorage.setItem(VOTES_KEY, JSON.stringify(filteredVotes));
  return newVote;
}

// Comments
export function getCommentsByApplication(applicationId: string): ApplicationComment[] {
  const comments = JSON.parse(localStorage.getItem(COMMENTS_KEY) || '[]');
  return comments.filter((c: ApplicationComment) => c.applicationId === applicationId);
}

export function addComment(comment: Omit<ApplicationComment, 'id' | 'createdAt' | 'updatedAt' | 'isEdited'>): ApplicationComment {
  const comments = JSON.parse(localStorage.getItem(COMMENTS_KEY) || '[]');
  const newComment: ApplicationComment = {
    ...comment,
    id: `comment-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isEdited: false,
  };
  comments.push(newComment);
  localStorage.setItem(COMMENTS_KEY, JSON.stringify(comments));
  return newComment;
}

export function getConsensusMetrics(applicationId: string) {
  const reviews = getReviewsByApplication(applicationId);
  const votes = getVotesByApplication(applicationId);

  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  const voteCount = {
    hire: votes.filter(v => v.decision === 'hire').length,
    noHire: votes.filter(v => v.decision === 'no-hire').length,
    abstain: votes.filter(v => v.decision === 'abstain').length,
  };

  const recommendationCount = {
    'strong-hire': reviews.filter(r => r.recommendation === 'strong-hire').length,
    'hire': reviews.filter(r => r.recommendation === 'hire').length,
    'maybe': reviews.filter(r => r.recommendation === 'maybe').length,
    'no-hire': reviews.filter(r => r.recommendation === 'no-hire').length,
    'strong-no-hire': reviews.filter(r => r.recommendation === 'strong-no-hire').length,
  };

  return {
    totalReviews: reviews.length,
    totalVotes: votes.length,
    averageRating: avgRating,
    voteCount,
    recommendationCount,
  };
}
