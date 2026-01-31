import type { Application, ApplicationStatus, ApplicationStage } from '@/shared/types/application';
import { mockCandidatesData } from './mockCandidatesData';
import { mockJobs } from './mockTableData';

const statuses: ApplicationStatus[] = ['applied', 'screening', 'interview', 'offer', 'hired', 'rejected', 'withdrawn'];

const stagesByStatus: Record<ApplicationStatus, ApplicationStage[]> = {
  applied: ['New Application', 'Resume Review'],
  screening: ['Phone Screen', 'Resume Review'],
  interview: ['Technical Interview', 'Manager Interview', 'Final Round'],
  offer: ['Reference Check', 'Offer Extended'],
  hired: ['Offer Accepted'],
  rejected: ['Rejected'],
  withdrawn: ['Withdrawn'],
};

export const mockApplicationsData: Application[] = [];

// Create 200+ applications linking candidates to jobs
for (let i = 0; i < 200; i++) {
  const candidate = mockCandidatesData[i % mockCandidatesData.length];
  const job = mockJobs[i % mockJobs.length];
  const status = statuses[i % statuses.length];
  const stageOptions = stagesByStatus[status];
  const stage = stageOptions[i % stageOptions.length];

  const daysAgo = i % 60;
  const appliedDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
  const createdAt = appliedDate;
  const updatedAt = new Date(appliedDate.getTime() + (i % 10) * 24 * 60 * 60 * 1000);

  // AI Match Score: 45-98 range for variety
  const aiMatchScore = 45 + Math.floor(Math.random() * 54);

  // New applications (last 2 days)
  const isNew = daysAgo <= 2;

  // 30% of applications are unread
  const isRead = Math.random() > 0.3;

  // Generate sample tags based on application characteristics
  const tags: string[] = [];
  if (aiMatchScore >= 90) tags.push('High Potential');
  if (aiMatchScore >= 85 && aiMatchScore < 90) tags.push('Technical Expert');
  if (i % 3 === 0) tags.push('Culture Fit');
  if (i % 5 === 0) tags.push('Leadership Material');
  if (candidate.workArrangement === 'remote') tags.push('Remote Ready');
  if (stage === 'Final Round' || stage === 'Offer Extended') tags.push('Quick Learner');
  if (i % 7 === 0) tags.push('Team Player');
  if (daysAgo <= 5) tags.push('Immediate Start');
  if (i % 11 === 0) tags.push('Internal Referral');
  if (i % 13 === 0) tags.push('Diverse Candidate');

  const application: Application = {
    id: `app-${i + 1}`,
    candidateId: candidate.id,
    candidateName: candidate.name,
    candidateEmail: candidate.email,
    candidatePhoto: candidate.photo,
    jobId: job.id,
    jobTitle: job.title,
    employerName: job.employer,

    appliedDate,
    status,
    stage,

    resumeUrl: candidate.resumeUrl,
    coverLetterUrl: candidate.coverLetterUrl,
    portfolioUrl: candidate.portfolioUrl,
    linkedInUrl: candidate.linkedInUrl,

    // Add parsed resume data for some applications
    parsedResume: i % 3 === 0 ? {
      workHistory: [
        {
          id: `work-${i}-1`,
          company: i % 2 === 0 ? 'TechCorp Inc.' : 'Digital Solutions Ltd.',
          title: candidate.currentPosition || 'Software Engineer',
          startDate: new Date(Date.now() - (candidate.experienceYears * 365 + 100) * 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() - 730 * 24 * 60 * 60 * 1000),
          current: false,
          location: candidate.location,
          employmentType: 'full-time',
          responsibilities: [
            'Led development of core product features used by 100K+ users',
            'Mentored junior developers and conducted code reviews',
            'Collaborated with cross-functional teams to deliver projects on time',
            'Optimized application performance, reducing load time by 40%'
          ],
          achievements: [
            'Received Employee of the Quarter award for outstanding performance',
            'Successfully launched 3 major product releases with zero critical bugs',
            'Improved test coverage from 60% to 95%'
          ],
          technologies: candidate.skills.slice(0, 5),
          reasonForLeaving: 'Seeking new challenges and growth opportunities'
        },
        {
          id: `work-${i}-2`,
          company: 'StartupCo',
          title: i % 2 === 0 ? 'Junior Developer' : 'Developer',
          startDate: new Date(Date.now() - (candidate.experienceYears * 365 + 1500) * 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() - (candidate.experienceYears * 365 + 100) * 24 * 60 * 60 * 1000),
          current: false,
          location: candidate.city || 'Remote',
          employmentType: 'full-time',
          responsibilities: [
            'Developed and maintained web applications using modern frameworks',
            'Participated in agile development process and daily standups',
            'Wrote unit tests and documented code',
            'Fixed bugs and implemented new features based on user feedback'
          ],
          achievements: [
            'Reduced page load time by 30% through optimization',
            'Implemented automated testing pipeline'
          ],
          technologies: candidate.skills.slice(2, 7),
        },
        {
          id: `work-${i}-3`,
          company: 'Current Company',
          title: candidate.currentPosition || 'Senior Software Engineer',
          startDate: new Date(Date.now() - 730 * 24 * 60 * 60 * 1000),
          current: true,
          location: candidate.location,
          employmentType: 'full-time',
          responsibilities: [
            'Lead technical design and architecture decisions',
            'Manage team of 5 engineers',
            'Drive technical excellence and best practices',
            'Collaborate with product and design teams'
          ],
          achievements: [
            'Led migration to microservices architecture',
            'Reduced deployment time from 2 hours to 15 minutes',
            'Improved system reliability to 99.9% uptime'
          ],
          technologies: candidate.skills.slice(0, 8),
        }
      ],
      education: [
        {
          id: `edu-${i}-1`,
          institution: i % 3 === 0 ? 'Stanford University' : i % 3 === 1 ? 'MIT' : 'UC Berkeley',
          degree: 'Bachelor of Science',
          field: 'Computer Science',
          startDate: new Date(Date.now() - (candidate.experienceYears * 365 + 2000) * 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() - (candidate.experienceYears * 365 + 1500) * 24 * 60 * 60 * 1000),
          gpa: 3.7 + Math.random() * 0.3,
          maxGpa: 4.0,
          honors: i % 2 === 0 ? 'Magna Cum Laude' : 'Cum Laude',
          relevantCoursework: [
            'Data Structures',
            'Algorithms',
            'Software Engineering',
            'Database Systems',
            'Machine Learning'
          ],
          thesisTitle: i % 2 === 0 ? 'Optimizing Neural Networks for Edge Computing' : undefined
        }
      ],
      skills: candidate.skills.map((skill, idx) => ({
        name: skill,
        category: idx % 3 === 0 ? 'Frontend' : idx % 3 === 1 ? 'Backend' : 'Tools',
        proficiency: idx % 4 === 0 ? 'expert' : idx % 4 === 1 ? 'advanced' : idx % 4 === 2 ? 'intermediate' : 'beginner',
        yearsExperience: Math.floor(Math.random() * candidate.experienceYears) + 1,
        lastUsed: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
        endorsements: Math.floor(Math.random() * 20)
      })),
      certifications: i % 2 === 0 ? [
        {
          id: `cert-${i}-1`,
          name: 'AWS Certified Solutions Architect',
          issuer: 'Amazon Web Services',
          issueDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
          expiryDate: new Date(Date.now() + 730 * 24 * 60 * 60 * 1000),
          credentialId: `AWS-${i}-${Math.random().toString(36).substring(7)}`,
          verificationUrl: 'https://aws.amazon.com/verification',
          description: 'Demonstrates expertise in designing distributed systems on AWS'
        },
        {
          id: `cert-${i}-2`,
          name: 'Certified Scrum Master',
          issuer: 'Scrum Alliance',
          issueDate: new Date(Date.now() - 730 * 24 * 60 * 60 * 1000),
          credentialId: `CSM-${i}-${Math.random().toString(36).substring(7)}`,
          description: 'Professional certification in Scrum methodology'
        }
      ] : [],
      summary: `Experienced ${candidate.currentPosition || 'software engineer'} with ${candidate.experienceYears}+ years of experience in building scalable web applications. Strong expertise in ${candidate.skills.slice(0, 3).join(', ')}. Passionate about clean code, best practices, and continuous learning. Proven track record of delivering high-quality solutions and leading technical initiatives.`,
      parsedAt: new Date(Date.now() - (i % 5) * 24 * 60 * 60 * 1000)
    } : undefined,

    customAnswers: [
      {
        questionId: 'q1',
        question: 'Why are you interested in this position?',
        answer: 'I am excited about this opportunity because it aligns perfectly with my career goals and technical expertise.',
      },
      {
        questionId: 'q2',
        question: 'What are your salary expectations?',
        answer: `$${candidate.salaryMin} - $${candidate.salaryMax}`,
      },
    ],

    // Add questionnaire data for some applications
    questionnaireData: i % 2 === 0 ? {
      responses: [
        {
          questionId: 'qq1',
          question: 'What interests you most about this position?',
          answer: `I'm particularly drawn to this role because it offers the opportunity to work on cutting-edge technologies and contribute to meaningful projects. My ${candidate.experienceYears} years of experience in ${candidate.skills.slice(0, 2).join(' and ')} have prepared me well for the challenges this position presents. I'm excited about the prospect of working with a talented team and continuing to grow professionally.`,
          type: 'text',
          aiAnalysis: {
            sentiment: 'positive',
            qualityScore: 85 + Math.floor(Math.random() * 10),
            keyInsights: [
              'Demonstrates genuine interest in the role and company',
              'Shows clear understanding of position requirements',
              'Connects personal experience to job needs'
            ],
            strengths: [
              'Well-articulated response with specific details',
              'Positive and enthusiastic tone',
              'Mentions relevant experience and skills'
            ]
          }
        },
        {
          questionId: 'qq2',
          question: 'Describe a challenging project you led and how you overcame obstacles.',
          answer: `In my previous role at ${i % 2 === 0 ? 'TechCorp' : 'Digital Solutions'}, I led a critical project to migrate our legacy system to a modern architecture. We faced significant challenges including tight deadlines, limited resources, and resistance to change from stakeholders. I addressed these by breaking the project into smaller milestones, implementing a phased rollout strategy, and conducting regular stakeholder meetings to address concerns. The project was completed 2 weeks ahead of schedule and resulted in a 40% improvement in system performance.`,
          type: 'text',
          aiAnalysis: {
            sentiment: 'positive',
            qualityScore: 90 + Math.floor(Math.random() * 8),
            keyInsights: [
              'Demonstrates strong leadership and problem-solving skills',
              'Uses specific metrics to quantify success',
              'Shows ability to manage stakeholder relationships'
            ],
            strengths: [
              'Structured response following STAR method',
              'Includes concrete outcomes and metrics',
              'Shows proactive approach to challenges'
            ]
          }
        },
        {
          questionId: 'qq3',
          question: 'How do you stay current with technology trends?',
          answer: `I maintain my technical edge through multiple channels: I regularly attend industry conferences and meetups, contribute to open-source projects on GitHub, and dedicate time each week to online courses and tutorials. I'm an active member of several tech communities and enjoy sharing knowledge through blog posts and presentations. Recently, I completed certifications in ${candidate.skills[0]} and have been experimenting with ${candidate.skills[1]} in personal projects.`,
          type: 'text',
          aiAnalysis: {
            sentiment: 'positive',
            qualityScore: 88 + Math.floor(Math.random() * 7),
            keyInsights: [
              'Shows commitment to continuous learning',
              'Demonstrates active engagement with tech community',
              'Balances theoretical knowledge with practical application'
            ],
            strengths: [
              'Multiple learning methods mentioned',
              'Provides specific examples of recent learning',
              'Shows initiative beyond job requirements'
            ]
          }
        },
        {
          questionId: 'qq4',
          question: 'What is your preferred work environment and why?',
          answer: candidate.workArrangement === 'remote'
            ? 'I thrive in remote work environments where I can focus deeply on complex problems while maintaining flexibility. I value the autonomy remote work provides and have developed strong communication practices to stay connected with my team through regular video calls, Slack channels, and project management tools.'
            : 'I prefer collaborative office environments where I can easily brainstorm with teammates and build strong working relationships. I find that in-person interactions often lead to more creative solutions and faster problem-solving. However, I also appreciate flexibility for focused work when needed.',
          type: 'text',
          aiAnalysis: {
            sentiment: 'neutral',
            qualityScore: 75 + Math.floor(Math.random() * 10),
            keyInsights: [
              'Clear understanding of personal work preferences',
              'Demonstrates awareness of communication needs',
              'Shows adaptability to different work styles'
            ],
            concerns: [
              'May need to verify alignment with company work culture'
            ]
          }
        },
        {
          questionId: 'qq5',
          question: 'How would you handle disagreement with a team member about technical approach?',
          answer: 'I believe healthy technical debates lead to better solutions. I would start by actively listening to understand their perspective and the reasoning behind their approach. Then I would present my viewpoint with supporting data or examples. If we still disagree, I would suggest we prototype both approaches or consult with other team members for additional input. Ultimately, I respect that the team needs to move forward, and I would support the final decision even if it differs from my initial preference.',
          type: 'text',
          aiAnalysis: {
            sentiment: 'positive',
            qualityScore: 92 + Math.floor(Math.random() * 6),
            keyInsights: [
              'Shows emotional intelligence and conflict resolution skills',
              'Demonstrates collaborative problem-solving approach',
              'Values both individual input and team consensus'
            ],
            strengths: [
              'Structured approach to handling disagreements',
              'Emphasizes data-driven decision making',
              'Shows flexibility and team orientation'
            ]
          }
        }
      ],
      overallScore: 82 + Math.floor(Math.random() * 15),
      completionRate: 100,
      timeSpent: 15 + Math.floor(Math.random() * 10)
    } : undefined,

    score: i % 3 === 0 ? 60 + Math.floor(Math.random() * 40) : undefined,
    rating: i % 4 === 0 ? Math.floor(Math.random() * 3) + 3 : undefined,
    aiMatchScore,
    isRead,
    isNew,
    tags,

    notes: [],
    activities: [
      {
        id: `activity-${i}-1`,
        type: 'status_change',
        description: `Application submitted for ${job.title} position`,
        userId: 'user-1',
        userName: 'System',
        createdAt: appliedDate,
        isRead: true,
      },
      ...(isRead ? [{
        id: `activity-${i}-2`,
        type: 'application_viewed' as const,
        description: 'Application reviewed by recruitment team',
        userId: 'recruiter-1',
        userName: i % 3 === 0 ? 'John Recruiter' : 'Jane Recruiter',
        createdAt: new Date(appliedDate.getTime() + 1 * 24 * 60 * 60 * 1000),
        isRead: true,
      }] : []),
      ...(status !== 'applied' ? [{
        id: `activity-${i}-3`,
        type: 'status_change' as const,
        description: `Application status changed to ${status}`,
        userId: 'recruiter-1',
        userName: i % 3 === 0 ? 'John Recruiter' : 'Jane Recruiter',
        createdAt: new Date(appliedDate.getTime() + 2 * 24 * 60 * 60 * 1000),
        isRead: daysAgo > 3,
      }] : []),
      ...(i % 2 === 0 ? [{
        id: `activity-${i}-4`,
        type: 'email_sent' as const,
        description: 'Application received confirmation email sent to candidate',
        userId: 'system',
        userName: 'System',
        createdAt: new Date(appliedDate.getTime() + 0.5 * 60 * 60 * 1000),
        isRead: true,
      }] : []),
      ...(status === 'screening' || status === 'interview' || status === 'offer' || status === 'hired' ? [{
        id: `activity-${i}-5`,
        type: 'note_added' as const,
        description: 'Initial screening notes added: Strong technical background, good communication skills',
        userId: 'recruiter-1',
        userName: i % 3 === 0 ? 'John Recruiter' : 'Jane Recruiter',
        createdAt: new Date(appliedDate.getTime() + 2.5 * 24 * 60 * 60 * 1000),
        isRead: daysAgo > 5,
      }] : []),
      ...(status === 'interview' || status === 'offer' || status === 'hired' ? [{
        id: `activity-${i}-6`,
        type: 'email_sent' as const,
        description: 'Interview invitation sent to candidate',
        userId: 'recruiter-1',
        userName: i % 3 === 0 ? 'John Recruiter' : 'Jane Recruiter',
        createdAt: new Date(appliedDate.getTime() + 3 * 24 * 60 * 60 * 1000),
        isRead: daysAgo > 7,
      }] : []),
      ...(i % 3 === 0 && (status === 'interview' || status === 'offer' || status === 'hired') ? [{
        id: `activity-${i}-7`,
        type: 'rating_changed' as const,
        description: 'Rating updated to 4 stars based on initial assessment',
        userId: 'recruiter-1',
        userName: i % 3 === 0 ? 'John Recruiter' : 'Jane Recruiter',
        createdAt: new Date(appliedDate.getTime() + 5 * 24 * 60 * 60 * 1000),
        isRead: daysAgo > 10,
      }] : []),
      ...(status === 'rejected' ? [{
        id: `activity-${i}-8`,
        type: 'status_change' as const,
        description: 'Application rejected - Not enough experience with required technologies',
        userId: 'recruiter-1',
        userName: i % 3 === 0 ? 'John Recruiter' : 'Jane Recruiter',
        createdAt: updatedAt,
        isRead: false,
      }] : []),
      ...(status === 'offer' || status === 'hired' ? [{
        id: `activity-${i}-9`,
        type: 'email_sent' as const,
        description: 'Offer letter sent to candidate',
        userId: 'recruiter-1',
        userName: i % 3 === 0 ? 'John Recruiter' : 'Jane Recruiter',
        createdAt: new Date(appliedDate.getTime() + 14 * 24 * 60 * 60 * 1000),
        isRead: false,
      }] : []),
    ],

    interviews: status === 'interview' || status === 'offer' || status === 'hired' ? [
      // Completed phone screen
      {
        id: `interview-${i}-1`,
        type: 'phone',
        scheduledDate: new Date(appliedDate.getTime() + 3 * 24 * 60 * 60 * 1000),
        duration: 30,
        interviewers: ['Sarah Smith - Recruiter'],
        status: 'completed',
        feedback: 'Initial phone screen went well. Candidate shows strong communication skills and genuine interest in the role. Good culture fit potential. Recommended for technical interview.',
        rating: 4,
        notes: 'Candidate asked thoughtful questions about team structure and growth opportunities.',
      },
      // Completed technical interview
      {
        id: `interview-${i}-2`,
        type: 'technical',
        scheduledDate: new Date(appliedDate.getTime() + 7 * 24 * 60 * 60 * 1000),
        duration: 90,
        interviewers: ['John Manager', 'Jane Tech Lead'],
        location: i % 2 === 0 ? undefined : 'Conference Room A',
        meetingLink: i % 2 === 0 ? 'https://zoom.us/j/123456789' : undefined,
        status: 'completed',
        feedback: 'Strong technical performance. Candidate demonstrated solid problem-solving skills and clean coding practices. Completed all coding challenges within the time limit with optimal solutions. Good understanding of system design principles.',
        rating: 4,
        recordingUrl: 'https://example.com/recordings/interview-123',
        notes: 'Impressed by their approach to debugging and optimization. Would be a great addition to the team.',
      },
      // Upcoming/Today's behavioral interview (only if status is 'interview')
      ...(status === 'interview' ? [{
        id: `interview-${i}-3`,
        type: 'behavioral' as const,
        scheduledDate: i % 3 === 0
          ? new Date(Date.now() + 2 * 60 * 60 * 1000) // Today, in 2 hours
          : new Date(Date.now() + (3 + i % 5) * 24 * 60 * 60 * 1000), // Future
        duration: 60,
        interviewers: ['Michael Chen - Senior Engineer', 'Lisa Park - Product Manager'],
        meetingLink: 'https://zoom.us/j/987654321',
        status: 'scheduled' as const,
        notes: 'Focus on collaboration examples and problem-solving approach.',
      }] : []),
      // Final round interview (only for offer status)
      ...(status === 'offer' || status === 'hired' ? [{
        id: `interview-${i}-4`,
        type: 'onsite' as const,
        scheduledDate: new Date(appliedDate.getTime() + 14 * 24 * 60 * 60 * 1000),
        duration: 180,
        interviewers: ['System'],
        location: 'Main Office - 5th Floor',
        status: 'completed' as const,
        feedback: 'Exceptional final round performance. Candidate impressed all panel members with their technical depth, leadership potential, and cultural fit. Strong recommendation to proceed with offer. Team consensus on hire.',
        rating: 5,
        recordingUrl: 'https://example.com/recordings/final-round-456',
        notes: 'All interviewers gave unanimous strong hire recommendation. Candidate would be an excellent addition.',
      }] : []),
      // Occasional cancelled interview
      ...(i % 7 === 0 ? [{
        id: `interview-${i}-5`,
        type: 'video' as const,
        scheduledDate: new Date(appliedDate.getTime() + 5 * 24 * 60 * 60 * 1000),
        duration: 45,
        interviewers: ['Tom Brown - Engineering Manager'],
        status: 'cancelled' as const,
        notes: 'Rescheduled due to interviewer availability conflict.',
      }] : []),
    ] : [],

    shortlisted: false,
    manuallyAdded: false,
    // Status is already defined above? No, step 2137 added it below.
    // original: status: 'Applied' as ApplicationStatus, (line 80-ish)
    // duplicate at 482.
    // I should remove the added block or merge correctly.
    // I will remove the block I added and add missing props to the main object definition if possible,
    // OR just remove duplicate status line here.


    // Add scorecards for candidates in interview or later stages
    scorecards: (status === 'interview' || status === 'offer' || status === 'hired') && i % 2 === 0 ? [
      {
        id: `scorecard-${i}-1`,
        evaluatorId: 'eval-1',
        evaluatorName: 'Sarah Johnson',
        evaluatorRole: 'Engineering Manager',
        evaluatorPhoto: `https://i.pravatar.cc/150?u=eval1${i}`,
        template: 'Technical Interview',
        criteria: [
          {
            id: `crit-${i}-1`,
            name: 'Technical Skills',
            description: 'Proficiency in required technologies and problem-solving ability',
            rating: 4 + Math.random(),
            weight: 35,
            notes: 'Demonstrated strong understanding of core concepts. Solved coding challenges efficiently with clean, well-structured code.'
          },
          {
            id: `crit-${i}-2`,
            name: 'System Design',
            description: 'Ability to architect scalable systems',
            rating: 3.5 + Math.random() * 1.5,
            weight: 25,
            notes: 'Good grasp of distributed systems concepts. Could improve on considering edge cases in design discussions.'
          },
          {
            id: `crit-${i}-3`,
            name: 'Communication',
            description: 'Clarity in explaining technical concepts',
            rating: 4 + Math.random(),
            weight: 20,
            notes: 'Excellent communicator. Explained complex ideas clearly and asked thoughtful questions.'
          },
          {
            id: `crit-${i}-4`,
            name: 'Problem Solving',
            description: 'Analytical thinking and debugging skills',
            rating: 3.8 + Math.random() * 1.2,
            weight: 20,
            notes: 'Approached problems methodically. Strong debugging skills when encountering issues.'
          }
        ],
        overallScore: 4.1 + Math.random() * 0.7,
        recommendation: Math.random() > 0.3 ? 'hire' : 'strong-hire',
        strengths: [
          'Excellent technical foundation and coding skills',
          'Strong problem-solving approach with clear methodology',
          'Great communication and collaboration abilities',
          'Quick learner who adapts to new concepts easily'
        ],
        concerns: [
          'Limited experience with some specific technologies in our stack',
          'Could benefit from more exposure to large-scale system architecture'
        ],
        overallFeedback: `${candidate.name} is a strong technical candidate with solid fundamentals and excellent problem-solving skills. They demonstrated deep knowledge in their areas of expertise and showed strong potential for growth. Their communication style is clear and collaborative, which would make them a great addition to the team. While they have some gaps in specific technologies we use, their learning ability and strong foundation suggest they would ramp up quickly.`,
        notes: 'Would recommend moving forward to next round. Consider pairing with senior engineer for mentorship.',
        status: 'completed',
        completedAt: new Date(appliedDate.getTime() + 10 * 24 * 60 * 60 * 1000),
        createdAt: new Date(appliedDate.getTime() + 9 * 24 * 60 * 60 * 1000)
      },
      {
        id: `scorecard-${i}-2`,
        evaluatorId: 'eval-2',
        evaluatorName: 'Michael Chen',
        evaluatorRole: 'Senior Software Engineer',
        evaluatorPhoto: `https://i.pravatar.cc/150?u=eval2${i}`,
        template: 'Culture Fit',
        criteria: [
          {
            id: `crit-${i}-5`,
            name: 'Team Collaboration',
            description: 'Ability to work effectively with others',
            rating: 4.2 + Math.random() * 0.8,
            weight: 30,
            notes: 'Shows strong collaborative mindset. Values team input and is receptive to feedback.'
          },
          {
            id: `crit-${i}-6`,
            name: 'Cultural Alignment',
            description: 'Fit with company values and culture',
            rating: 4 + Math.random(),
            weight: 30,
            notes: 'Aligns well with our values of continuous learning and innovation. Demonstrated growth mindset.'
          },
          {
            id: `crit-${i}-7`,
            name: 'Initiative & Ownership',
            description: 'Self-motivation and accountability',
            rating: 3.8 + Math.random() * 1.2,
            weight: 25,
            notes: 'Takes ownership of tasks and shows initiative. Several examples of going above and beyond in previous roles.'
          },
          {
            id: `crit-${i}-8`,
            name: 'Adaptability',
            description: 'Comfort with change and learning',
            rating: 4.3 + Math.random() * 0.7,
            weight: 15,
            notes: 'Very adaptable. Comfortable with ambiguity and embraces new challenges.'
          }
        ],
        overallScore: 4.0 + Math.random() * 0.8,
        recommendation: Math.random() > 0.4 ? 'hire' : 'strong-hire',
        strengths: [
          'Excellent team player with strong collaboration skills',
          'Growth mindset and enthusiasm for learning',
          'Values align well with company culture',
          'Positive attitude and professional demeanor'
        ],
        concerns: [],
        overallFeedback: `${candidate.name} would be a great cultural fit for our team. They demonstrate strong collaboration skills, a growth mindset, and values that align well with our company culture. Their enthusiasm for the role and the company is evident, and they show genuine interest in our mission. I believe they would integrate smoothly into the team and contribute positively to our culture.`,
        status: 'completed',
        completedAt: new Date(appliedDate.getTime() + 12 * 24 * 60 * 60 * 1000),
        createdAt: new Date(appliedDate.getTime() + 11 * 24 * 60 * 60 * 1000)
      }
    ] : undefined,

    // Team Reviews (add for interview, offer, or hired status)
    teamReviews: (status === 'interview' || status === 'offer' || status === 'hired') ? [
      {
        id: `review-${i}-1`,
        candidateId: candidate.id,
        applicationId: `app-${i + 1}`,
        reviewerId: 'user-1',
        reviewerName: 'Sarah Johnson',
        reviewerRole: 'Senior Engineer',
        ratings: [
          { criterionId: '1', value: 8 + Math.floor(Math.random() * 2), confidence: 4, notes: 'Strong technical foundation with deep understanding' },
          { criterionId: '2', value: 7 + Math.floor(Math.random() * 2), confidence: 4, notes: 'Excellent problem-solving approach' },
          { criterionId: '3', value: 8, confidence: 3, notes: 'Good communication skills' },
          { criterionId: '4', value: 7 + Math.floor(Math.random() * 2), confidence: 4, notes: 'Great cultural fit' },
          { criterionId: '5', value: 7, confidence: 3, notes: 'Shows leadership potential' },
          { criterionId: '6', value: 8 + Math.floor(Math.random() * 2), confidence: 5, notes: 'Very eager to learn' },
        ],
        comments: [
          {
            id: `c-${i}-1`,
            type: 'strength',
            category: 'Technical',
            content: 'Demonstrated deep understanding of system design patterns and best practices',
            importance: 'high',
            createdAt: new Date(appliedDate.getTime() + 8 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: `c-${i}-2`,
            type: 'strength',
            category: 'Problem Solving',
            content: 'Approached coding challenges methodically with clear reasoning',
            importance: 'high',
            createdAt: new Date(appliedDate.getTime() + 8 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ],
        overallScore: 78 + Math.floor(Math.random() * 10),
        recommendation: Math.random() > 0.3 ? 'hire' : 'strong-hire',
        confidence: 4,
        submittedAt: new Date(appliedDate.getTime() + 8 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(appliedDate.getTime() + 8 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: `review-${i}-2`,
        candidateId: candidate.id,
        applicationId: `app-${i + 1}`,
        reviewerId: 'user-2',
        reviewerName: 'Michael Chen',
        reviewerRole: 'Engineering Manager',
        ratings: [
          { criterionId: '1', value: 7 + Math.floor(Math.random() * 2), confidence: 5, notes: 'Solid technical foundation' },
          { criterionId: '2', value: 8 + Math.floor(Math.random() * 2), confidence: 4, notes: 'Excellent analytical skills' },
          { criterionId: '3', value: 8, confidence: 4, notes: 'Communicates clearly and effectively' },
          { criterionId: '4', value: 8 + Math.floor(Math.random() * 2), confidence: 5, notes: 'Perfect fit for our team culture' },
          { criterionId: '5', value: 7 + Math.floor(Math.random() * 2), confidence: 4, notes: 'Natural leadership qualities' },
          { criterionId: '6', value: 8, confidence: 4, notes: 'Growth oriented mindset' },
        ],
        comments: [
          {
            id: `c-${i}-3`,
            type: 'strength',
            category: 'Leadership',
            content: 'Led successful projects demonstrating strong project management skills',
            importance: 'high',
            createdAt: new Date(appliedDate.getTime() + 9 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: `c-${i}-4`,
            type: 'observation',
            category: 'Communication',
            content: 'Could improve presentation skills slightly for executive audiences',
            importance: 'low',
            createdAt: new Date(appliedDate.getTime() + 9 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ],
        overallScore: 80 + Math.floor(Math.random() * 12),
        recommendation: Math.random() > 0.2 ? 'strong-hire' : 'hire',
        confidence: 5,
        submittedAt: new Date(appliedDate.getTime() + 9 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(appliedDate.getTime() + 9 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: `review-${i}-3`,
        candidateId: candidate.id,
        applicationId: `app-${i + 1}`,
        reviewerId: 'user-3',
        reviewerName: 'Emily Rodriguez',
        reviewerRole: 'HR Manager',
        ratings: [
          { criterionId: '1', value: 7, confidence: 3, notes: 'Adequate technical skills for the role' },
          { criterionId: '2', value: 7 + Math.floor(Math.random() * 2), confidence: 3, notes: 'Good problem solver with practical approach' },
          { criterionId: '3', value: 8 + Math.floor(Math.random() * 2), confidence: 5, notes: 'Excellent communicator and listener' },
          { criterionId: '4', value: 8, confidence: 4, notes: 'Strong cultural alignment with company values' },
          { criterionId: '5', value: 7, confidence: 3, notes: 'Some leadership experience with room to grow' },
          { criterionId: '6', value: 8, confidence: 4, notes: 'Eager to develop skills and take on challenges' },
        ],
        comments: [
          {
            id: `c-${i}-5`,
            type: 'strength',
            category: 'Communication',
            content: 'Outstanding communication and interpersonal skills',
            importance: 'high',
            createdAt: new Date(appliedDate.getTime() + 9 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: `c-${i}-6`,
            type: 'strength',
            category: 'Cultural Fit',
            content: 'Values align perfectly with our company culture and mission',
            importance: 'medium',
            createdAt: new Date(appliedDate.getTime() + 9 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ],
        overallScore: 75 + Math.floor(Math.random() * 10),
        recommendation: 'hire',
        confidence: 4,
        submittedAt: new Date(appliedDate.getTime() + 9 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(appliedDate.getTime() + 9 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ] : undefined,

    assignedTo: i % 3 === 0 ? 'recruiter-1' : i % 3 === 1 ? 'recruiter-2' : undefined,
    assignedToName: i % 3 === 0 ? 'John Recruiter' : i % 3 === 1 ? 'Jane Recruiter' : undefined,

    rejectionReason: status === 'rejected' ? 'Not enough experience with required technologies' : undefined,
    rejectionDate: status === 'rejected' ? updatedAt : undefined,

    createdAt,
    updatedAt,
  };

  mockApplicationsData.push(application);
}
