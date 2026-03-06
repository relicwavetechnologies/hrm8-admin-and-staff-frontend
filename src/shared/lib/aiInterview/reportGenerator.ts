import type { AIInterviewSession } from '@/shared/types/aiInterview';
import type { InterviewReport } from '@/shared/types/aiInterviewReport';
import { v4 as uuidv4 } from 'uuid';

export function generateReportFromSession(session: AIInterviewSession): InterviewReport {
  if (!session.analysis) {
    throw new Error('Interview session must have analysis before generating report');
  }

  return {
    id: uuidv4(),
    sessionId: session.id,
    candidateId: session.candidateId,
    candidateName: session.candidateName,
    jobId: session.jobId,
    jobTitle: session.jobTitle,
    status: 'draft',
    version: 1,
    executiveSummary: session.analysis.summary,
    analysis: session.analysis,
    recommendations: generateRecommendations(session.analysis),
    nextSteps: generateNextSteps(session.analysis),
    isShared: false,
    sharedWith: [],
    permissions: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: session.createdBy
  };
}

function generateRecommendations(analysis: AIInterviewSession['analysis']): string {
  if (!analysis) return '';
  
  const recommendations: string[] = [];
  
  if (analysis.recommendation === 'strongly-recommend') {
    recommendations.push('**Strong recommendation to proceed immediately.** This candidate demonstrates exceptional qualifications.');
  } else if (analysis.recommendation === 'recommend') {
    recommendations.push('**Recommend moving forward** with next interview stages.');
  } else if (analysis.recommendation === 'maybe') {
    recommendations.push('**Consider for alternative positions** or additional screening.');
  } else {
    recommendations.push('**Not recommended** for this position at this time.');
  }
  
  if (analysis.overallScore >= 80) {
    recommendations.push('Candidate scored in the top tier across multiple categories.');
  }
  
  if (analysis.concerns.length > 0) {
    recommendations.push(`\n**Areas to explore in next rounds:**\n${analysis.concerns.map(c => `- ${c}`).join('\n')}`);
  }
  
  if (analysis.redFlags.length > 0) {
    recommendations.push(`\n**⚠️ Red Flags to Address:**\n${analysis.redFlags.map(f => `- ${f}`).join('\n')}`);
  }
  
  return recommendations.join('\n\n');
}

function generateNextSteps(analysis: AIInterviewSession['analysis']): string {
  if (!analysis) return '';
  
  const steps: string[] = [];
  
  if (analysis.recommendation === 'strongly-recommend' || analysis.recommendation === 'recommend') {
    steps.push('1. Schedule technical panel interview with senior team members');
    steps.push('2. Conduct system design assessment');
    steps.push('3. Arrange team fit conversation with potential colleagues');
    steps.push('4. Complete reference checks');
  } else if (analysis.recommendation === 'maybe') {
    steps.push('1. Consider alternative roles that match skill set');
    steps.push('2. Schedule follow-up discussion to address concerns');
    steps.push('3. Request additional work samples or portfolio');
  } else {
    steps.push('1. Send professional rejection notice');
    steps.push('2. Keep in talent pipeline for future opportunities');
  }
  
  return steps.join('\n');
}
