import type { AITranscriptionSummary, EditableReport } from '@/shared/types/aiReferenceReport';
import { generateReportHTML } from './reportTemplate';

export function generateMockAIReport(sessionId: string, candidateId: string): EditableReport {
  const summaries: AITranscriptionSummary[] = [
    {
      sessionId,
      candidateId,
      candidateName: 'Sarah Johnson',
      refereeInfo: {
        name: 'Michael Chen',
        relationship: 'manager',
        companyName: 'TechCorp Inc.',
        yearsKnown: '3 years',
      },
      sessionDetails: {
        mode: 'video',
        duration: 1245,
        completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        questionsAsked: 12,
      },
      executiveSummary: `Sarah Johnson demonstrated exceptional technical skills and leadership qualities during her tenure at TechCorp. As her direct manager for three years, I observed consistent high performance, innovative problem-solving, and strong team collaboration. She successfully led multiple high-stakes projects, consistently delivering ahead of schedule. Her communication skills are outstanding, and she has a natural ability to mentor junior team members. Sarah's departure was due to relocation, and I would enthusiastically rehire her given the opportunity.`,
      keyFindings: {
        strengths: [
          'Exceptional technical expertise in full-stack development with React and Node.js',
          'Outstanding leadership skills, successfully managed team of 5 developers',
          'Consistently delivered projects 15-20% ahead of schedule',
          'Strong communication and stakeholder management abilities',
          'Natural mentor who helped onboard 8 new team members',
          'Innovative problem-solver who implemented solutions saving 40% development time',
        ],
        concerns: [
          'Occasionally took on too many responsibilities, leading to minor burnout incidents',
          'Could improve delegation skills when under pressure',
        ],
        neutralObservations: [
          'Preferred working remotely 3 days per week',
          'Most productive during afternoon hours',
          'Enjoyed collaborative work but also valued independent time for complex tasks',
        ],
      },
      categoryBreakdown: [
        {
          category: 'Technical Skills',
          score: 5,
          summary: 'Exceptional technical capabilities across the full stack. Deep expertise in React, TypeScript, Node.js, and cloud architecture. Consistently produced high-quality, maintainable code.',
          evidence: [
            'Led the migration to microservices architecture, reducing system downtime by 60%',
            'Implemented automated testing framework that improved code coverage to 95%',
            'Architected scalable solutions handling 10M+ daily active users',
          ],
        },
        {
          category: 'Leadership & Management',
          score: 4,
          summary: 'Strong leadership skills with proven ability to guide and inspire team members. Successfully managed cross-functional projects and mentored junior developers.',
          evidence: [
            'Led team of 5 developers through successful product launch',
            'Mentored 8 junior developers, 6 of whom were promoted within 18 months',
            'Facilitated agile ceremonies and maintained team morale during challenging sprints',
          ],
        },
        {
          category: 'Communication',
          score: 5,
          summary: 'Excellent communicator at all levels. Effectively translated technical concepts to non-technical stakeholders and maintained clear documentation.',
          evidence: [
            'Presented quarterly technical updates to C-suite executives',
            'Created comprehensive documentation adopted as company standard',
            'Resolved conflicts diplomatically and maintained positive team dynamics',
          ],
        },
        {
          category: 'Work Ethic & Reliability',
          score: 5,
          summary: 'Extremely reliable and dedicated professional. Consistently exceeded expectations and demonstrated strong commitment to quality and deadlines.',
          evidence: [
            'Never missed a project deadline in 3 years',
            'Voluntarily worked extra hours during critical product launches',
            'Maintained 99.5% attendance record',
          ],
        },
        {
          category: 'Problem Solving',
          score: 5,
          summary: 'Outstanding analytical and problem-solving abilities. Demonstrated creativity in addressing complex technical challenges.',
          evidence: [
            'Resolved critical production bug that had stumped team for weeks',
            'Proposed innovative caching solution reducing API costs by 70%',
            'Regularly identified optimization opportunities before they became issues',
          ],
        },
      ],
      conversationHighlights: [
        {
          question: 'Can you describe a challenging project Sarah led and how she handled it?',
          answer: 'Sarah led our microservices migration, which was arguably our most complex technical project. She broke it down into manageable phases, established clear milestones, and kept everyone aligned through daily standups and comprehensive documentation. When we hit unexpected API compatibility issues, she quickly pivoted the approach and found an elegant solution. The project finished two weeks early.',
          significance: 'Demonstrates strong project management, adaptability, and technical problem-solving under pressure',
          timestamp: 145,
        },
        {
          question: 'How would you rate Sarah\'s ability to work with cross-functional teams?',
          answer: 'Excellent. Sarah collaborated closely with product, design, and DevOps teams. She had a unique ability to understand their perspectives and translate between technical and business language. Product managers specifically requested her for high-visibility projects because she made their jobs easier.',
          significance: 'Shows strong cross-functional collaboration and communication skills valued by leadership',
          timestamp: 342,
        },
        {
          question: 'Were there any areas where Sarah struggled or needed improvement?',
          answer: 'The only issue was that Sarah sometimes took on too much. She had trouble saying no to new requests, which occasionally led to working late nights. We had discussions about work-life balance and delegation. She improved in her final year, but it\'s something to monitor.',
          significance: 'Honest assessment of work-life balance challenges and growth areas',
          timestamp: 567,
        },
      ],
      redFlags: [
        {
          severity: 'minor',
          description: 'Tendency to overcommit and take on excessive responsibilities',
          evidence: 'Multiple occasions where Sarah worked late nights or weekends to meet self-imposed high standards. Required coaching on delegation and prioritization.',
        },
      ],
      verificationItems: [
        {
          claim: 'Managed team of 5 developers',
          verified: true,
          notes: 'Confirmed through HR records and org chart',
        },
        {
          claim: 'Led microservices migration project',
          verified: true,
          notes: 'Project documented in company systems, completed Q2 2023',
        },
        {
          claim: 'Mentored 8 junior developers',
          verified: true,
          notes: 'Cross-referenced with performance reviews and mentorship program records',
        },
      ],
      recommendation: {
        overallScore: 92,
        hiringRecommendation: 'strongly-recommend',
        confidenceLevel: 0.95,
        reasoningSummary: 'Sarah Johnson is an exceptional candidate who consistently exceeded expectations in all areas. Her technical expertise, leadership abilities, and communication skills make her an ideal hire for senior engineering roles. The minor concern about overcommitment is manageable with proper boundaries. I would enthusiastically rehire her and believe she would be a valuable asset to any engineering team.',
      },
      generatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      generatedBy: 'ai',
    },
    {
      sessionId: 'session_2',
      candidateId,
      candidateName: 'James Martinez',
      refereeInfo: {
        name: 'Lisa Wong',
        relationship: 'colleague',
        companyName: 'DataFlow Solutions',
      },
      sessionDetails: {
        mode: 'phone',
        duration: 890,
        completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        questionsAsked: 10,
      },
      executiveSummary: `James Martinez is a solid mid-level developer with good technical skills and a positive attitude. During our two years working together, he consistently delivered quality work and was a reliable team player. While he may not be the most innovative developer, his dependability and steady performance made him a valuable contributor. He learns quickly and adapts well to new technologies.`,
      keyFindings: {
        strengths: [
          'Reliable and consistent performer',
          'Good technical skills in React and JavaScript',
          'Positive team player with strong work ethic',
          'Quick learner who adapts to new technologies',
        ],
        concerns: [
          'Limited experience leading projects or teams',
          'Sometimes needs guidance on architectural decisions',
          'Could be more proactive in suggesting improvements',
        ],
        neutralObservations: [
          'Preferred structured tasks with clear requirements',
          'Worked well within established processes',
        ],
      },
      categoryBreakdown: [
        {
          category: 'Technical Skills',
          score: 3,
          summary: 'Competent developer with solid fundamentals. Handles standard development tasks well but needs support on complex architectural decisions.',
          evidence: [
            'Successfully implemented assigned features with minimal bugs',
            'Maintained existing codebase effectively',
          ],
        },
        {
          category: 'Leadership & Management',
          score: 2,
          summary: 'Limited leadership experience. Functions better as an individual contributor under guidance.',
          evidence: [
            'Rarely volunteered for leadership roles',
            'Occasionally assisted junior developers but not consistently',
          ],
        },
        {
          category: 'Communication',
          score: 3,
          summary: 'Clear communicator within the team. Could improve stakeholder communication and presentation skills.',
          evidence: [
            'Provided clear updates in standups',
            'Documentation was adequate but not exceptional',
          ],
        },
        {
          category: 'Work Ethic & Reliability',
          score: 4,
          summary: 'Very reliable and consistent. Always delivered on commitments and maintained good attendance.',
          evidence: [
            'Met all deadlines during our time working together',
            'Dependable team member who showed up prepared',
          ],
        },
      ],
      conversationHighlights: [
        {
          question: 'What are James\'s greatest strengths?',
          answer: 'His reliability and work ethic. You could always count on James to deliver what he committed to. He was also very easy to work with and maintained a positive attitude.',
          significance: 'Emphasizes dependability and team compatibility',
          timestamp: 234,
        },
      ],
      redFlags: [],
      verificationItems: [
        {
          claim: 'Worked together for 2 years',
          verified: true,
          notes: 'Timeframe matches employment records',
        },
      ],
      recommendation: {
        overallScore: 68,
        hiringRecommendation: 'recommend',
        confidenceLevel: 0.75,
        reasoningSummary: 'James is a dependable mid-level developer who would be a solid addition to a team. He may not be a standout performer, but his reliability and positive attitude make him a safe hire for roles that need steady, consistent contributors.',
      },
      generatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      generatedBy: 'ai',
    },
  ];

  const randomSummary = summaries[Math.floor(Math.random() * summaries.length)];

  return {
    id: `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    sessionId,
    summary: {
      ...randomSummary,
      sessionId,
      candidateId,
    },
    editableContent: generateReportHTML({
      ...randomSummary,
      sessionId,
      candidateId,
    }),
    version: 1,
    status: Math.random() > 0.5 ? 'draft' : 'reviewed',
    createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function generateMultipleMockReports(count: number): EditableReport[] {
  const reports: EditableReport[] = [];
  for (let i = 0; i < count; i++) {
    reports.push(generateMockAIReport(
      `session_${i + 1}`,
      `candidate_${i + 1}`
    ));
  }
  return reports;
}
