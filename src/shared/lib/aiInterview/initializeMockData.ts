import { v4 as uuidv4 } from 'uuid';
import type { AIInterviewSession, InterviewStatus, InterviewMode, QuestionSource } from '@/shared/types/aiInterview';
import type { ReportVersion, ReportComment } from '@/shared/types/aiInterviewReport';
import { getCandidates } from '@/shared/lib/mockCandidateStorage';
import { getJobs } from '@/shared/lib/mockJobStorage';
import {
  saveAIInterviewSession,
  updateAIInterviewSession
} from './aiInterviewStorage';
import {
  saveInterviewReport,
  saveReportComment,
  saveReportVersion
} from './aiInterviewReportStorage';
import { generateQuestionsForJob } from './questionGenerator';
// import { calculateInterviewScore } from './scoreCalculator';
import { generateReportFromSession } from './reportGenerator';

const INIT_VERSION_KEY = 'hrm8_ai_interview_init_version';
const CURRENT_INIT_VERSION = '1.0.0';

/**
 * Check if mock data has been initialized
 */
export function isDataInitialized(): boolean {
  const version = localStorage.getItem(INIT_VERSION_KEY);
  return version === CURRENT_INIT_VERSION;
}

/**
 * Mark data as initialized
 */
function markAsInitialized(): void {
  localStorage.setItem(INIT_VERSION_KEY, CURRENT_INIT_VERSION);
}

/**
 * Clear all AI interview data
 */
export function clearAllAIInterviewData(): void {
  localStorage.removeItem('hrm8_ai_interviews');
  localStorage.removeItem('hrm8_ai_interview_reports');
  localStorage.removeItem('hrm8_ai_interview_comments');
  localStorage.removeItem('hrm8_ai_interview_versions');
  localStorage.removeItem('hrm8_ai_interview_shares');
  localStorage.removeItem(INIT_VERSION_KEY);
}

/**
 * Reinitialize all mock data from scratch
 */
export function reinitializeMockData(): void {
  clearAllAIInterviewData();
  initializeAIInterviewMockData();
}

/**
 * Generate varied transcript based on interview performance
 */
function generateTranscript(score: number): any[] {
  const baseTranscripts = [
    {
      speaker: 'ai' as const,
      content: 'Hello! Thank you for joining this AI interview. Are you ready to begin?',
      duration: 5
    },
    {
      speaker: 'candidate' as const,
      content: 'Yes, I\'m ready. Thank you for the opportunity.',
      duration: 3
    }
  ];

  if (score >= 80) {
    baseTranscripts.push(
      {
        speaker: 'ai' as const,
        content: 'Can you describe a complex technical problem you solved recently?',
        duration: 4
      },
      {
        speaker: 'candidate' as const,
        content: 'In my last project, we had performance issues with our API taking 3-4 seconds. I analyzed database queries, implemented batching and caching, reducing response time to under 500ms. The solution improved user experience significantly.',
        duration: 15
      },
      {
        speaker: 'ai' as const,
        content: 'Excellent approach! What metrics did you use to measure success?',
        duration: 3
      },
      {
        speaker: 'candidate' as const,
        content: 'We tracked response times, throughput, and user satisfaction scores. All metrics improved by over 80%.',
        duration: 8
      }
    );
  } else if (score >= 60) {
    baseTranscripts.push(
      {
        speaker: 'ai' as const,
        content: 'Tell me about a challenging project you worked on.',
        duration: 4
      },
      {
        speaker: 'candidate' as const,
        content: 'I worked on a project to improve our system, and we made some changes that helped.',
        duration: 6
      },
      {
        speaker: 'ai' as const,
        content: 'Can you be more specific about the changes?',
        duration: 3
      },
      {
        speaker: 'candidate' as const,
        content: 'We updated the code and fixed some bugs.',
        duration: 4
      }
    );
  } else {
    baseTranscripts.push(
      {
        speaker: 'ai' as const,
        content: 'What programming languages are you comfortable with?',
        duration: 4
      },
      {
        speaker: 'candidate' as const,
        content: 'Um, I know some JavaScript.',
        duration: 3
      },
      {
        speaker: 'ai' as const,
        content: 'Can you describe a project where you used JavaScript?',
        duration: 3
      },
      {
        speaker: 'candidate' as const,
        content: 'I made a simple website once.',
        duration: 2
      }
    );
  }

  return baseTranscripts.map((entry, index) => ({
    id: `transcript-${index}`,
    timestamp: new Date(Date.now() - (baseTranscripts.length - index) * 60000).toISOString(),
    ...entry
  }));
}

/**
 * Generate analysis based on score
 */
function generateAnalysis(score: number) {
  const variance = 5;
  const technical = score + Math.floor(Math.random() * variance - variance / 2);
  const communication = score + Math.floor(Math.random() * variance - variance / 2);
  const culturalFit = score + Math.floor(Math.random() * variance - variance / 2);
  const experience = score + Math.floor(Math.random() * variance - variance / 2);
  const problemSolving = score + Math.floor(Math.random() * variance - variance / 2);

  let recommendation: 'strongly-recommend' | 'recommend' | 'maybe' | 'not-recommend';
  if (score >= 85) recommendation = 'strongly-recommend';
  else if (score >= 70) recommendation = 'recommend';
  else if (score >= 55) recommendation = 'maybe';
  else recommendation = 'not-recommend';

  const strengths = score >= 70
    ? ['Strong technical skills', 'Excellent communication', 'Good problem-solving approach', 'Relevant experience']
    : score >= 55
      ? ['Shows potential', 'Basic understanding of concepts', 'Willing to learn']
      : ['Enthusiasm for the role'];

  const concerns = score >= 70
    ? ['Could provide more leadership examples', 'Limited experience with distributed systems']
    : score >= 55
      ? ['Needs more hands-on experience', 'Communication could be more detailed', 'Technical depth could improve']
      : ['Lacks required technical experience', 'Unclear communication', 'Insufficient problem-solving examples'];

  const redFlags = score < 50
    ? ['Insufficient technical knowledge for role', 'Unable to provide concrete examples']
    : score < 65
      ? ['Limited practical experience']
      : [];

  return {
    overallScore: score,
    categoryScores: {
      technical: Math.max(0, Math.min(100, technical)),
      communication: Math.max(0, Math.min(100, communication)),
      culturalFit: Math.max(0, Math.min(100, culturalFit)),
      experience: Math.max(0, Math.min(100, experience)),
      problemSolving: Math.max(0, Math.min(100, problemSolving))
    },
    strengths,
    concerns,
    redFlags,
    keyHighlights: score >= 70 ? [
      {
        quote: 'Demonstrated strong technical problem-solving abilities',
        context: 'Technical assessment',
        sentiment: 'positive' as const
      }
    ] : [],
    recommendation,
    confidenceScore: score >= 70 ? 85 : score >= 55 ? 70 : 55,
    summary: score >= 80
      ? 'Excellent candidate with strong technical skills and clear communication. Highly recommended for next round.'
      : score >= 70
        ? 'Solid candidate with good technical foundation. Recommend proceeding to next stage.'
        : score >= 55
          ? 'Candidate shows potential but needs more experience. Consider for junior positions or with additional training.'
          : 'Candidate does not meet the requirements for this position at this time.'
  };
}

/**
 * Generate comprehensive mock interview sessions
 */
function generateMockSessions(): AIInterviewSession[] {
  const candidates = getCandidates();
  const jobs = getJobs();

  if (candidates.length === 0 || jobs.length === 0) {
    console.warn('No candidates or jobs found. Using fallback data.');
    return generateFallbackSessions();
  }

  const sessions: AIInterviewSession[] = [];
  const statuses: InterviewStatus[] = ['scheduled', 'ready', 'in-progress', 'completed', 'completed', 'completed', 'completed', 'cancelled', 'no-show'];
  const modes: InterviewMode[] = ['video', 'video', 'phone', 'text'];
  const sources: QuestionSource[] = ['hybrid', 'hybrid', 'ai-generated', 'predefined'];
  const scores = [92, 88, 85, 78, 72, 68, 58, 45];

  // Create 15 sessions with variety
  for (let i = 0; i < Math.min(15, candidates.length); i++) {
    const candidate = candidates[i % candidates.length];
    const job = jobs[i % jobs.length];
    const status = statuses[i % statuses.length];
    const mode = modes[i % modes.length];
    const source = sources[i % sources.length];
    const score = scores[i % scores.length];

    const daysAgo = i < 5 ? i : i < 10 ? Math.floor(Math.random() * 30) : Math.floor(Math.random() * 60) + 30;
    const scheduledDate = new Date(Date.now() - daysAgo * 86400000);

    const questions = generateQuestionsForJob(job.title, 8);

    const session: AIInterviewSession = {
      id: `ai-int-${uuidv4()}`,
      candidateId: candidate.id,
      candidateName: candidate.name,
      candidateEmail: candidate.email,
      applicationId: `app-${i}`,
      jobId: job.id,
      jobTitle: job.title,
      status,
      scheduledDate: scheduledDate.toISOString(),
      interviewMode: mode,
      questionSource: source,
      questions,
      currentQuestionIndex: 0,
      transcript: [],
      invitationToken: uuidv4(),
      createdAt: new Date(scheduledDate.getTime() - 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'admin'
    };

    // Add details for non-scheduled sessions
    if (status !== 'scheduled' && status !== 'ready') {
      const startedAt = new Date(scheduledDate.getTime() + 3600000);
      session.startedAt = startedAt.toISOString();
      session.currentQuestionIndex = status === 'completed' ? questions.length : Math.floor(questions.length / 2);

      if (status === 'completed') {
        const completedAt = new Date(startedAt.getTime() + 3600000);
        session.completedAt = completedAt.toISOString();
        session.duration = 3600;
        session.transcript = generateTranscript(score);
        session.analysis = generateAnalysis(score);
      } else if (status === 'in-progress') {
        session.transcript = generateTranscript(score).slice(0, 3);
      }
    }

    sessions.push(session);
  }

  return sessions;
}

/**
 * Fallback sessions when no candidates/jobs exist
 */
function generateFallbackSessions(): AIInterviewSession[] {
  const mockCandidates = [
    { id: 'cand-1', name: 'Sarah Johnson', email: 'sarah.j@email.com' },
    { id: 'cand-2', name: 'Michael Chen', email: 'michael.c@email.com' },
    { id: 'cand-3', name: 'Emily Rodriguez', email: 'emily.r@email.com' }
  ];

  const mockJobs = [
    { id: 'job-1', title: 'Senior Software Engineer' },
    { id: 'job-2', title: 'Product Manager' },
    { id: 'job-3', title: 'UX Designer' }
  ];

  return mockCandidates.map((candidate, i) => {
    const job = mockJobs[i];
    return {
      id: `ai-int-${uuidv4()}`,
      candidateId: candidate.id,
      candidateName: candidate.name,
      candidateEmail: candidate.email,
      jobId: job.id,
      jobTitle: job.title,
      status: 'completed' as InterviewStatus,
      scheduledDate: new Date(Date.now() - i * 86400000).toISOString(),
      startedAt: new Date(Date.now() - i * 86400000 + 3600000).toISOString(),
      completedAt: new Date(Date.now() - i * 86400000 + 7200000).toISOString(),
      duration: 3600,
      interviewMode: 'video' as InterviewMode,
      questionSource: 'hybrid' as QuestionSource,
      questions: generateQuestionsForJob(job.title, 8),
      currentQuestionIndex: 8,
      transcript: generateTranscript(85),
      analysis: generateAnalysis(85),
      invitationToken: uuidv4(),
      createdAt: new Date(Date.now() - (i + 1) * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'admin'
    };
  });
}

/**
 * Generate mock comments for a report
 */
function generateCommentsForReport(reportId: string): ReportComment[] {
  const comments: ReportComment[] = [];
  const commentTemplates = [
    { userName: 'John Smith', content: 'Great candidate! Strong technical skills and communication.' },
    { userName: 'Lisa Anderson', content: 'I agree. The problem-solving approach was impressive.' },
    { userName: 'Mike Johnson', content: 'Should we schedule a technical deep-dive?' },
    { userName: 'Sarah Wilson', content: 'Let\'s move forward with the next round.' },
    { userName: 'David Brown', content: 'One concern: limited distributed systems experience.' }
  ];

  const numComments = Math.floor(Math.random() * 3) + 2; // 2-4 comments

  for (let i = 0; i < numComments; i++) {
    const template = commentTemplates[i % commentTemplates.length];
    comments.push({
      id: uuidv4(),
      reportId,
      userId: `user-${i}`,
      userName: template.userName,
      content: template.content,
      mentions: [],
      replies: [],
      createdAt: new Date(Date.now() - (numComments - i) * 3600000).toISOString(),
      isEdited: false
    });
  }

  return comments;
}

/**
 * Generate report version history
 */
function generateReportVersion(reportId: string, version: number): ReportVersion & { reportId: string } {
  return {
    reportId,
    version,
    timestamp: new Date(Date.now() - (3 - version) * 86400000).toISOString(),
    userId: 'admin',
    userName: 'System Admin',
    changes: version === 1 ? 'Initial report created' : `Updated executive summary and recommendations (v${version})`,
    snapshot: {}
  };
}

/**
 * Main initialization function
 */
export function initializeAIInterviewMockData(): void {
  // Check if already initialized
  if (isDataInitialized()) {
    console.log('AI Interview mock data already initialized');
    return;
  }

  console.log('Initializing AI Interview mock data...');

  // Generate and save sessions
  const sessions = generateMockSessions();
  sessions.forEach(session => saveAIInterviewSession(session));
  console.log(`Generated ${sessions.length} interview sessions`);

  // Generate reports for completed sessions
  let reportCount = 0;
  let commentCount = 0;

  sessions.forEach(session => {
    if (session.status === 'completed' && session.analysis) {
      const report = generateReportFromSession(session);

      // Some reports are finalized
      if (Math.random() > 0.5) {
        report.status = 'finalized';
        report.finalizedAt = new Date().toISOString();
        report.finalizedBy = 'admin';
      } else if (Math.random() > 0.5) {
        report.status = 'in-review';
      }

      saveInterviewReport(report);
      reportCount++;

      // Update session with report ID
      updateAIInterviewSession(session.id, { reportId: report.id });

      // Generate comments for finalized reports
      if (report.status === 'finalized') {
        const comments = generateCommentsForReport(report.id);
        comments.forEach(comment => saveReportComment(comment));
        commentCount += comments.length;
      }

      // Generate version history for some reports
      if (Math.random() > 0.6) {
        saveReportVersion(generateReportVersion(report.id, 2));
        if (Math.random() > 0.7) {
          saveReportVersion(generateReportVersion(report.id, 3));
        }
      }
    }
  });

  console.log(`Generated ${reportCount} reports with ${commentCount} comments`);

  markAsInitialized();
  console.log('AI Interview mock data initialization complete');
}
