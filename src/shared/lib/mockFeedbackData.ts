import { TeamMemberFeedback, HiringVote, DecisionHistoryEntry } from '@/shared/types/collaborativeFeedback';

// Mock feedback data for demonstration
export const mockTeamFeedback: TeamMemberFeedback[] = [
  {
    id: '1',
    candidateId: 'candidate-1',
    applicationId: 'app-1',
    interviewId: 'int-1',
    reviewerId: 'user-1',
    reviewerName: 'Sarah Johnson',
    reviewerRole: 'Senior Engineer',
    ratings: [
      { criterionId: '1', value: 9, confidence: 4, notes: 'Excellent technical depth' },
      { criterionId: '2', value: 8, confidence: 5, notes: 'Strong problem-solving approach' },
      { criterionId: '3', value: 7, confidence: 3, notes: 'Good communication skills' },
      { criterionId: '4', value: 8, confidence: 4, notes: 'Great cultural fit' },
      { criterionId: '5', value: 7, confidence: 3, notes: 'Shows leadership potential' },
      { criterionId: '6', value: 9, confidence: 5, notes: 'Very eager to learn' },
    ],
    comments: [
      {
        id: 'c1',
        type: 'strength',
        category: 'Technical',
        content: 'Demonstrated deep understanding of system design patterns',
        importance: 'high',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'c2',
        type: 'strength',
        category: 'Problem Solving',
        content: 'Approached coding challenges methodically',
        importance: 'high',
        createdAt: new Date().toISOString(),
      },
    ],
    overallScore: 82,
    recommendation: 'hire',
    confidence: 4,
    submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    candidateId: 'candidate-1',
    applicationId: 'app-1',
    interviewId: 'int-1',
    reviewerId: 'user-2',
    reviewerName: 'Michael Chen',
    reviewerRole: 'Engineering Manager',
    ratings: [
      { criterionId: '1', value: 8, confidence: 5, notes: 'Solid technical foundation' },
      { criterionId: '2', value: 9, confidence: 4, notes: 'Excellent analytical skills' },
      { criterionId: '3', value: 8, confidence: 4, notes: 'Communicates clearly' },
      { criterionId: '4', value: 9, confidence: 5, notes: 'Perfect fit for our team' },
      { criterionId: '5', value: 8, confidence: 4, notes: 'Natural leadership qualities' },
      { criterionId: '6', value: 8, confidence: 4, notes: 'Growth oriented mindset' },
    ],
    comments: [
      {
        id: 'c3',
        type: 'strength',
        category: 'Leadership',
        content: 'Led successful projects at previous company',
        importance: 'high',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'c4',
        type: 'observation',
        category: 'Communication',
        content: 'Could improve presentation skills slightly',
        importance: 'low',
        createdAt: new Date().toISOString(),
      },
    ],
    overallScore: 85,
    recommendation: 'strong-hire',
    confidence: 5,
    submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    candidateId: 'candidate-2',
    applicationId: 'app-2',
    reviewerId: 'user-3',
    reviewerName: 'Emily Rodriguez',
    reviewerRole: 'HR Manager',
    ratings: [
      { criterionId: '1', value: 6, confidence: 3, notes: 'Adequate technical skills' },
      { criterionId: '2', value: 7, confidence: 3, notes: 'Good problem solver' },
      { criterionId: '3', value: 9, confidence: 5, notes: 'Excellent communicator' },
      { criterionId: '4', value: 7, confidence: 4, notes: 'Good cultural alignment' },
      { criterionId: '5', value: 6, confidence: 3, notes: 'Some leadership experience' },
      { criterionId: '6', value: 8, confidence: 4, notes: 'Eager to develop skills' },
    ],
    comments: [
      {
        id: 'c5',
        type: 'strength',
        category: 'Communication',
        content: 'Outstanding interpersonal skills',
        importance: 'high',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'c6',
        type: 'concern',
        category: 'Technical',
        content: 'May need additional training in our tech stack',
        importance: 'medium',
        createdAt: new Date().toISOString(),
      },
    ],
    overallScore: 71,
    recommendation: 'maybe',
    confidence: 3,
    submittedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
];

export const mockVotes: HiringVote[] = [
  {
    id: 'v1',
    candidateId: 'candidate-1',
    voterId: 'user-1',
    voterName: 'Sarah Johnson',
    voterRole: 'Senior Engineer',
    decision: 'hire',
    reasoning: 'Strong technical skills and great cultural fit. Would be a valuable addition to the team.',
    votedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'v2',
    candidateId: 'candidate-1',
    voterId: 'user-2',
    voterName: 'Michael Chen',
    voterRole: 'Engineering Manager',
    decision: 'hire',
    reasoning: 'Exceptional problem-solving abilities and leadership potential. Highly recommend.',
    votedAt: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'v3',
    candidateId: 'candidate-1',
    voterId: 'user-3',
    voterName: 'Emily Rodriguez',
    voterRole: 'HR Manager',
    decision: 'hire',
    reasoning: 'Great communication skills and aligns well with company values.',
    votedAt: new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'v4',
    candidateId: 'candidate-2',
    voterId: 'user-1',
    voterName: 'Sarah Johnson',
    voterRole: 'Senior Engineer',
    decision: 'no-hire',
    reasoning: 'Technical skills don\'t meet our current requirements for this role.',
    votedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'v5',
    candidateId: 'candidate-2',
    voterId: 'user-3',
    voterName: 'Emily Rodriguez',
    voterRole: 'HR Manager',
    decision: 'hire',
    reasoning: 'Strong soft skills could compensate with proper technical training.',
    votedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
];

export const mockDecisions: DecisionHistoryEntry[] = [
  {
    id: 'd1',
    candidateId: 'candidate-1',
    decision: 'offer-extended',
    decidedBy: 'user-4',
    decidedByName: 'David Park',
    consensusScore: 83.5,
    votingResults: {
      hire: 3,
      noHire: 0,
      abstain: 0,
    },
    rationale: 'Strong unanimous consensus from the team. Candidate demonstrates excellent technical skills, problem-solving abilities, and cultural fit. Leadership potential is evident. Extending offer at senior engineer level.',
    decidedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
];

// Initialize mock data in localStorage
export function initializeMockFeedbackData() {
  const FEEDBACK_KEY = 'collaborative_feedback';
  const VOTES_KEY = 'hiring_votes';
  const DECISIONS_KEY = 'decision_history';

  if (!localStorage.getItem(FEEDBACK_KEY)) {
    localStorage.setItem(FEEDBACK_KEY, JSON.stringify(mockTeamFeedback));
  }
  
  if (!localStorage.getItem(VOTES_KEY)) {
    localStorage.setItem(VOTES_KEY, JSON.stringify(mockVotes));
  }
  
  if (!localStorage.getItem(DECISIONS_KEY)) {
    localStorage.setItem(DECISIONS_KEY, JSON.stringify(mockDecisions));
  }
}
