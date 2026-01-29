import type { AIInterviewSession, TranscriptEntry } from '@/shared/types/aiInterview';
import type { InterviewReport, ReportComment } from '@/shared/types/aiInterviewReport';
import { generateQuestionsForJob } from './questionGenerator';

export function generateMockTranscript(): TranscriptEntry[] {
  return [
    {
      id: '1',
      timestamp: new Date(Date.now() - 600000).toISOString(),
      speaker: 'ai',
      content: 'Hello! Thank you for joining this AI interview. I\'m excited to learn more about you. Are you ready to begin?',
      duration: 5
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 590000).toISOString(),
      speaker: 'candidate',
      content: 'Yes, I\'m ready. Thank you for having me.',
      duration: 3
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 580000).toISOString(),
      speaker: 'ai',
      content: 'Great! Let\'s start with your background. Can you walk me through a complex technical problem you solved recently?',
      duration: 4
    },
    {
      id: '4',
      timestamp: new Date(Date.now() - 570000).toISOString(),
      speaker: 'candidate',
      content: 'Sure. In my last project, we had a performance issue where our API was taking 3-4 seconds to respond. I analyzed the database queries and found we were making multiple redundant calls. I implemented query batching and caching, which reduced response time to under 500ms.',
      duration: 15
    },
    {
      id: '5',
      timestamp: new Date(Date.now() - 550000).toISOString(),
      speaker: 'ai',
      content: 'That\'s impressive! What alternative approaches did you consider?',
      duration: 3
    },
    {
      id: '6',
      timestamp: new Date(Date.now() - 545000).toISOString(),
      speaker: 'candidate',
      content: 'We considered horizontal scaling and switching to a different database, but those were more expensive solutions. The query optimization gave us the best ROI.',
      duration: 8
    }
  ];
}

// Note: This function is kept for backwards compatibility
// The main initialization now happens in initializeMockData.ts
export function generateMockSessions(): AIInterviewSession[] {
  // Return just 3 basic sessions for initial testing
  // Full initialization is handled by initializeAIInterviewMockData()
  return [
    {
      id: 'ai-int-1',
      candidateId: 'cand-1',
      candidateName: 'Sarah Johnson',
      candidateEmail: 'sarah.j@email.com',
      applicationId: 'app-1',
      jobId: 'job-1',
      jobTitle: 'Senior Software Engineer',
      status: 'completed',
      scheduledDate: new Date(Date.now() - 86400000).toISOString(),
      startedAt: new Date(Date.now() - 82800000).toISOString(),
      completedAt: new Date(Date.now() - 79200000).toISOString(),
      duration: 3600,
      interviewMode: 'video',
      questionSource: 'hybrid',
      questions: generateQuestionsForJob('Senior Software Engineer', 10),
      currentQuestionIndex: 10,
      transcript: generateMockTranscript(),
      analysis: {
        overallScore: 85,
        categoryScores: {
          technical: 88,
          communication: 90,
          culturalFit: 82,
          experience: 85,
          problemSolving: 87
        },
        strengths: [
          'Strong technical problem-solving skills',
          'Excellent communication and articulation',
          'Proven experience with performance optimization',
          'Good understanding of cost-benefit analysis'
        ],
        concerns: [
          'Limited experience with distributed systems',
          'Could elaborate more on leadership examples'
        ],
        redFlags: [],
        keyHighlights: [
          {
            quote: 'I implemented query batching and caching, which reduced response time to under 500ms',
            context: 'Discussing technical problem-solving',
            sentiment: 'positive'
          }
        ],
        recommendation: 'recommend',
        confidenceScore: 88,
        summary: 'Strong candidate with excellent technical skills and communication abilities. Demonstrated practical problem-solving experience with measurable results.'
      },
      invitationToken: 'token-1',
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'admin'
    },
    {
      id: 'ai-int-2',
      candidateId: 'cand-2',
      candidateName: 'Michael Chen',
      candidateEmail: 'michael.c@email.com',
      jobId: 'job-2',
      jobTitle: 'Product Manager',
      status: 'scheduled',
      scheduledDate: new Date(Date.now() + 172800000).toISOString(),
      interviewMode: 'video',
      questionSource: 'ai-generated',
      questions: generateQuestionsForJob('Product Manager', 8),
      currentQuestionIndex: 0,
      transcript: [],
      invitationToken: 'token-2',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'admin'
    },
    {
      id: 'ai-int-3',
      candidateId: 'cand-3',
      candidateName: 'Emily Rodriguez',
      candidateEmail: 'emily.r@email.com',
      jobId: 'job-3',
      jobTitle: 'UX Designer',
      status: 'in-progress',
      scheduledDate: new Date(Date.now() - 3600000).toISOString(),
      startedAt: new Date(Date.now() - 1800000).toISOString(),
      interviewMode: 'phone',
      questionSource: 'predefined',
      questions: generateQuestionsForJob('UX Designer', 8),
      currentQuestionIndex: 4,
      transcript: generateMockTranscript().slice(0, 4),
      invitationToken: 'token-3',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'admin'
    }
  ];
}
