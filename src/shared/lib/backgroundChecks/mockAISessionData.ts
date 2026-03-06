import { v4 as uuidv4 } from 'uuid';
import type { 
  AIReferenceCheckSession, 
  InterviewTranscript, 
  TranscriptTurn,
  SessionRecording,
  AIAnalysis,
  CategoryScore 
} from '@/shared/types/aiReferenceCheck';

const SAMPLE_QUESTIONS = [
  "Can you tell me about your professional relationship with the candidate?",
  "How would you describe their work ethic and reliability?",
  "What are their key strengths in a professional setting?",
  "Are there any areas where they could improve?",
  "How do they handle challenging situations or pressure?",
  "Would you recommend them for this position? Why or why not?",
  "How well do they work with team members?",
  "Can you provide a specific example of their leadership or problem-solving skills?",
  "How do they handle feedback and criticism?",
  "Is there anything else you'd like to add about the candidate?"
];

const SAMPLE_RESPONSES = [
  "I worked directly with them for about two years as their manager in the marketing department.",
  "They are extremely reliable and always meet deadlines. I could count on them to deliver quality work consistently.",
  "Their analytical skills are exceptional, and they have great attention to detail. They're also very collaborative.",
  "Sometimes they can be a bit perfectionistic, which occasionally slows down project timelines, but the quality is always worth it.",
  "They remain calm under pressure and often volunteer to help others when things get hectic. Very composed.",
  "Absolutely, I would highly recommend them. They were one of my top performers and would be an asset to any team.",
  "Excellent team player. They actively listen to others and contribute meaningfully to group discussions.",
  "When we had a major client deadline at risk, they took initiative to reorganize the workflow and got us back on track.",
  "They're very receptive to feedback and actively seek it out. I've seen them implement suggestions quickly and effectively.",
  "They're a natural mentor and have helped onboard several new team members during their tenure with us."
];

const CATEGORIES = [
  { name: 'Technical Skills', minScore: 3, maxScore: 5 },
  { name: 'Communication', minScore: 4, maxScore: 5 },
  { name: 'Leadership', minScore: 3, maxScore: 5 },
  { name: 'Teamwork', minScore: 4, maxScore: 5 },
  { name: 'Problem Solving', minScore: 3, maxScore: 5 },
  { name: 'Work Ethic', minScore: 4, maxScore: 5 }
];

const SENTIMENTS = ['positive', 'neutral', 'negative', 'mixed'] as const;
const QUESTION_SOURCES = ['pre-written', 'ai-derived', 'template', 'dynamic'] as const;

function generateTranscript(sessionId: string, numQuestions: number = 8): InterviewTranscript {
  const turns: TranscriptTurn[] = [];
  let currentTimestamp = 0;

  for (let i = 0; i < numQuestions && i < SAMPLE_QUESTIONS.length; i++) {
    // AI asks question
    turns.push({
      id: uuidv4(),
      speaker: 'ai-recruiter',
      text: SAMPLE_QUESTIONS[i],
      timestamp: currentTimestamp,
      confidence: 0.98
    });
    currentTimestamp += Math.floor(Math.random() * 5) + 3; // 3-8 seconds

    // Referee responds
    turns.push({
      id: uuidv4(),
      speaker: 'referee',
      text: SAMPLE_RESPONSES[i] || "Yes, I can provide more details about that.",
      timestamp: currentTimestamp,
      confidence: 0.92 + Math.random() * 0.07 // 0.92-0.99
    });
    currentTimestamp += Math.floor(Math.random() * 30) + 15; // 15-45 seconds
  }

  return {
    sessionId,
    turns,
    summary: "Comprehensive reference check covering professional experience, work ethic, strengths, areas for improvement, and overall recommendation.",
    generatedAt: new Date().toISOString()
  };
}

function generateRecording(sessionId: string, duration: number): SessionRecording {
  return {
    sessionId,
    videoUrl: `/mock-recordings/${sessionId}.mp4`,
    audioUrl: `/mock-recordings/${sessionId}.mp3`,
    duration,
    format: 'mp4',
    size: Math.floor(duration * 1024 * 50), // ~50KB per second
    uploadedAt: new Date().toISOString()
  };
}

function generateAnalysis(sessionId: string): AIAnalysis {
  const categories: CategoryScore[] = CATEGORIES.map(cat => ({
    category: cat.name,
    score: Math.floor(Math.random() * (cat.maxScore - cat.minScore + 1)) + cat.minScore,
    evidence: [
      SAMPLE_RESPONSES[Math.floor(Math.random() * SAMPLE_RESPONSES.length)],
      SAMPLE_RESPONSES[Math.floor(Math.random() * SAMPLE_RESPONSES.length)]
    ]
  }));

  const avgScore = categories.reduce((sum, cat) => sum + cat.score, 0) / categories.length;
  const sentiment = SENTIMENTS[Math.floor(Math.random() * SENTIMENTS.length)];

  return {
    sessionId,
    overallRating: Math.round(avgScore * 10) / 10,
    sentiment,
    keyInsights: [
      "Strong technical competency with proven track record",
      "Excellent collaboration and communication skills",
      "Demonstrates leadership potential",
      "Highly recommended by reference with no significant concerns"
    ],
    strengths: [
      "Analytical thinking and attention to detail",
      "Reliable and consistently meets deadlines",
      "Strong team player and natural mentor",
      "Handles pressure well and remains composed"
    ],
    concerns: [
      "Tendency towards perfectionism may occasionally slow progress",
      "Could benefit from delegating more routine tasks"
    ],
    recommendationScore: Math.floor(Math.random() * 20) + 80, // 80-100
    categories,
    aiConfidence: 0.85 + Math.random() * 0.14, // 0.85-0.99
    generatedAt: new Date().toISOString()
  };
}

export function generateMockAISession(
  refereeId: string,
  candidateId: string,
  backgroundCheckId: string,
  mode: AIReferenceCheckSession['mode'] = 'video',
  status: AIReferenceCheckSession['status'] = 'completed'
): AIReferenceCheckSession {
  const sessionId = uuidv4();
  const duration = Math.floor(Math.random() * 600) + 300; // 5-15 minutes in seconds
  const now = new Date();
  const createdAt = new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(); // Last 7 days

  const session: AIReferenceCheckSession = {
    id: sessionId,
    refereeId,
    candidateId,
    backgroundCheckId,
    mode,
    status,
    questionSource: QUESTION_SOURCES[Math.floor(Math.random() * QUESTION_SOURCES.length)],
    createdAt,
    updatedAt: createdAt
  };

  if (status === 'scheduled') {
    session.scheduledDate = new Date(now.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(); // Next 7 days
  }

  if (status === 'in-progress') {
    session.startedAt = new Date(now.getTime() - Math.random() * 600 * 1000).toISOString(); // Started within last 10 minutes
  }

  if (status === 'completed') {
    const startTime = new Date(now.getTime() - Math.random() * 5 * 24 * 60 * 60 * 1000); // Last 5 days
    session.startedAt = startTime.toISOString();
    session.completedAt = new Date(startTime.getTime() + duration * 1000).toISOString();
    session.duration = duration;
    session.transcript = generateTranscript(sessionId);
    session.analysis = generateAnalysis(sessionId);
    
    if (mode === 'video') {
      session.recording = generateRecording(sessionId, duration);
    } else if (mode === 'phone') {
      session.recording = {
        ...generateRecording(sessionId, duration),
        videoUrl: undefined
      };
    }
  }

  return session;
}

export function generateMockAISessions(count: number = 10): AIReferenceCheckSession[] {
  const sessions: AIReferenceCheckSession[] = [];
  const modes: AIReferenceCheckSession['mode'][] = ['video', 'phone', 'questionnaire'];
  const statuses: AIReferenceCheckSession['status'][] = ['scheduled', 'in-progress', 'completed', 'completed', 'completed']; // Weight towards completed

  for (let i = 0; i < count; i++) {
    const mode = modes[Math.floor(Math.random() * modes.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    sessions.push(generateMockAISession(
      `referee-${uuidv4()}`,
      `candidate-${uuidv4()}`,
      `bg-check-${uuidv4()}`,
      mode,
      status
    ));
  }

  return sessions;
}

export function getMockTranscriptPreview(transcript: InterviewTranscript, maxTurns: number = 4): TranscriptTurn[] {
  return transcript.turns.slice(0, maxTurns);
}

export function calculateSessionDuration(transcript: InterviewTranscript): number {
  if (transcript.turns.length === 0) return 0;
  const lastTurn = transcript.turns[transcript.turns.length - 1];
  return Math.ceil(lastTurn.timestamp / 60); // Convert to minutes
}

export function getAverageRating(sessions: AIReferenceCheckSession[]): number {
  const completedSessions = sessions.filter(s => s.status === 'completed' && s.analysis);
  if (completedSessions.length === 0) return 0;
  
  const sum = completedSessions.reduce((acc, s) => acc + (s.analysis?.overallRating || 0), 0);
  return Math.round((sum / completedSessions.length) * 10) / 10;
}

export function getCompletionRate(sessions: AIReferenceCheckSession[]): number {
  if (sessions.length === 0) return 0;
  const completed = sessions.filter(s => s.status === 'completed').length;
  return Math.round((completed / sessions.length) * 100);
}
