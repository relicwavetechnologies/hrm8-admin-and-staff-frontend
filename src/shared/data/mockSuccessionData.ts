import { SuccessionPlan, NineBoxPosition, LeadershipPipeline, DevelopmentPath } from '@/shared/types/performance';

export const mockSuccessionPlans: SuccessionPlan[] = [
  {
    id: 'sp-1',
    positionId: 'pos-1',
    positionTitle: 'Chief Technology Officer',
    department: 'Technology',
    level: 'C-Level',
    incumbentId: 'emp-1',
    incumbentName: 'Sarah Johnson',
    criticality: 'critical',
    vacancyRisk: 'medium',
    successors: [
      {
        id: 'sc-1',
        employeeId: 'emp-5',
        employeeName: 'Michael Chen',
        currentRole: 'VP of Engineering',
        department: 'Technology',
        readinessLevel: 'ready-1-2-years',
        potentialLevel: 'exceptional',
        performanceLevel: 'exceptional',
        riskOfLoss: 'medium',
        strengths: ['Technical leadership', 'Strategic thinking', 'Team development'],
        developmentNeeds: ['Executive presence', 'Board-level communication', 'M&A experience'],
        lastAssessmentDate: '2024-01-15',
        assessedBy: 'emp-1',
        assessedByName: 'Sarah Johnson',
        priority: 1
      },
      {
        id: 'sc-2',
        employeeId: 'emp-12',
        employeeName: 'Jennifer Park',
        currentRole: 'Director of Product Engineering',
        department: 'Technology',
        readinessLevel: 'ready-3-5-years',
        potentialLevel: 'high',
        performanceLevel: 'high',
        riskOfLoss: 'low',
        strengths: ['Innovation', 'Cross-functional leadership', 'Product strategy'],
        developmentNeeds: ['Enterprise architecture', 'P&L management', 'Executive leadership'],
        lastAssessmentDate: '2024-01-15',
        assessedBy: 'emp-1',
        assessedByName: 'Sarah Johnson',
        priority: 2
      }
    ],
    developmentPrograms: ['Executive Leadership Program', 'Strategic Thinking Workshop', 'Board Governance Training'],
    notes: 'Critical role with strong succession pipeline. Focus on accelerating readiness of primary successor.',
    lastReviewDate: '2024-01-15',
    nextReviewDate: '2024-07-15',
    createdAt: '2023-06-01',
    updatedAt: '2024-01-15'
  },
  {
    id: 'sp-2',
    positionId: 'pos-2',
    positionTitle: 'VP of Sales',
    department: 'Sales',
    level: 'VP',
    incumbentId: 'emp-3',
    incumbentName: 'Robert Williams',
    criticality: 'high',
    vacancyRisk: 'low',
    successors: [
      {
        id: 'sc-3',
        employeeId: 'emp-8',
        employeeName: 'David Martinez',
        currentRole: 'Regional Sales Director',
        department: 'Sales',
        readinessLevel: 'ready-now',
        potentialLevel: 'high',
        performanceLevel: 'exceptional',
        riskOfLoss: 'high',
        strengths: ['Revenue generation', 'Client relationships', 'Team leadership'],
        developmentNeeds: ['Strategic planning', 'Enterprise sales cycles'],
        lastAssessmentDate: '2024-02-01',
        assessedBy: 'emp-3',
        assessedByName: 'Robert Williams',
        priority: 1
      }
    ],
    developmentPrograms: ['Sales Leadership Excellence', 'Strategic Account Management'],
    notes: 'Primary successor is ready now but has high flight risk. Retention strategy needed.',
    lastReviewDate: '2024-02-01',
    nextReviewDate: '2024-08-01',
    createdAt: '2023-07-01',
    updatedAt: '2024-02-01'
  },
  {
    id: 'sp-3',
    positionId: 'pos-3',
    positionTitle: 'Head of HR',
    department: 'Human Resources',
    level: 'Director',
    incumbentId: 'emp-7',
    incumbentName: 'Emily Davis',
    criticality: 'high',
    vacancyRisk: 'low',
    successors: [
      {
        id: 'sc-4',
        employeeId: 'emp-15',
        employeeName: 'Lisa Anderson',
        currentRole: 'Senior HR Business Partner',
        department: 'Human Resources',
        readinessLevel: 'ready-1-2-years',
        potentialLevel: 'high',
        performanceLevel: 'high',
        riskOfLoss: 'low',
        strengths: ['Employee relations', 'Change management', 'Talent development'],
        developmentNeeds: ['Strategic HR planning', 'Compensation strategy', 'Labor relations'],
        lastAssessmentDate: '2024-01-20',
        assessedBy: 'emp-7',
        assessedByName: 'Emily Davis',
        priority: 1
      },
      {
        id: 'sc-5',
        employeeId: 'emp-18',
        employeeName: 'Mark Thompson',
        currentRole: 'Talent Acquisition Manager',
        department: 'Human Resources',
        readinessLevel: 'ready-3-5-years',
        potentialLevel: 'medium',
        performanceLevel: 'high',
        riskOfLoss: 'low',
        strengths: ['Recruitment strategy', 'Employer branding', 'Analytics'],
        developmentNeeds: ['Broader HR experience', 'Leadership skills', 'Strategic thinking'],
        lastAssessmentDate: '2024-01-20',
        assessedBy: 'emp-7',
        assessedByName: 'Emily Davis',
        priority: 2
      }
    ],
    developmentPrograms: ['HR Leadership Certificate', 'Strategic Workforce Planning'],
    lastReviewDate: '2024-01-20',
    nextReviewDate: '2024-07-20',
    createdAt: '2023-08-01',
    updatedAt: '2024-01-20'
  }
];

export const mockNineBoxData: NineBoxPosition[] = [
  {
    employeeId: 'emp-5',
    employeeName: 'Michael Chen',
    currentRole: 'VP of Engineering',
    department: 'Technology',
    performance: 'exceptional',
    potential: 'exceptional',
    riskOfLoss: 'medium',
    lastAssessmentDate: '2024-01-15'
  },
  {
    employeeId: 'emp-8',
    employeeName: 'David Martinez',
    currentRole: 'Regional Sales Director',
    department: 'Sales',
    performance: 'exceptional',
    potential: 'high',
    riskOfLoss: 'high',
    lastAssessmentDate: '2024-02-01'
  },
  {
    employeeId: 'emp-12',
    employeeName: 'Jennifer Park',
    currentRole: 'Director of Product Engineering',
    department: 'Technology',
    performance: 'high',
    potential: 'high',
    riskOfLoss: 'low',
    lastAssessmentDate: '2024-01-15'
  },
  {
    employeeId: 'emp-15',
    employeeName: 'Lisa Anderson',
    currentRole: 'Senior HR Business Partner',
    department: 'Human Resources',
    performance: 'high',
    potential: 'high',
    riskOfLoss: 'low',
    lastAssessmentDate: '2024-01-20'
  },
  {
    employeeId: 'emp-18',
    employeeName: 'Mark Thompson',
    currentRole: 'Talent Acquisition Manager',
    department: 'Human Resources',
    performance: 'high',
    potential: 'medium',
    riskOfLoss: 'low',
    lastAssessmentDate: '2024-01-20'
  },
  {
    employeeId: 'emp-22',
    employeeName: 'Rachel Green',
    currentRole: 'Senior Software Engineer',
    department: 'Technology',
    performance: 'high',
    potential: 'medium',
    riskOfLoss: 'medium',
    lastAssessmentDate: '2024-01-10'
  },
  {
    employeeId: 'emp-25',
    employeeName: 'James Wilson',
    currentRole: 'Marketing Manager',
    department: 'Marketing',
    performance: 'medium',
    potential: 'high',
    riskOfLoss: 'low',
    lastAssessmentDate: '2024-01-25'
  },
  {
    employeeId: 'emp-28',
    employeeName: 'Anna Lee',
    currentRole: 'Product Manager',
    department: 'Product',
    performance: 'medium',
    potential: 'medium',
    riskOfLoss: 'low',
    lastAssessmentDate: '2024-01-18'
  },
  {
    employeeId: 'emp-30',
    employeeName: 'Chris Brown',
    currentRole: 'Senior Analyst',
    department: 'Finance',
    performance: 'medium',
    potential: 'low',
    riskOfLoss: 'high',
    lastAssessmentDate: '2024-02-05'
  }
];

export const mockLeadershipPipeline: LeadershipPipeline[] = [
  {
    level: 'C-Level',
    positions: [
      {
        positionId: 'pos-1',
        title: 'Chief Technology Officer',
        department: 'Technology',
        incumbentId: 'emp-1',
        incumbentName: 'Sarah Johnson',
        vacancyRisk: 'medium',
        successorCount: 2,
        readyNowCount: 0
      },
      {
        positionId: 'pos-10',
        title: 'Chief Financial Officer',
        department: 'Finance',
        incumbentId: 'emp-2',
        incumbentName: 'John Smith',
        vacancyRisk: 'low',
        successorCount: 1,
        readyNowCount: 1
      }
    ],
    totalPositions: 2,
    coverageRate: 100
  },
  {
    level: 'VP',
    positions: [
      {
        positionId: 'pos-2',
        title: 'VP of Sales',
        department: 'Sales',
        incumbentId: 'emp-3',
        incumbentName: 'Robert Williams',
        vacancyRisk: 'low',
        successorCount: 1,
        readyNowCount: 1
      },
      {
        positionId: 'pos-11',
        title: 'VP of Engineering',
        department: 'Technology',
        incumbentId: 'emp-5',
        incumbentName: 'Michael Chen',
        vacancyRisk: 'medium',
        successorCount: 2,
        readyNowCount: 0
      },
      {
        positionId: 'pos-12',
        title: 'VP of Product',
        department: 'Product',
        vacancyRisk: 'high',
        successorCount: 0,
        readyNowCount: 0
      }
    ],
    totalPositions: 3,
    coverageRate: 67
  },
  {
    level: 'Director',
    positions: [
      {
        positionId: 'pos-3',
        title: 'Head of HR',
        department: 'Human Resources',
        incumbentId: 'emp-7',
        incumbentName: 'Emily Davis',
        vacancyRisk: 'low',
        successorCount: 2,
        readyNowCount: 0
      },
      {
        positionId: 'pos-13',
        title: 'Director of Product Engineering',
        department: 'Technology',
        incumbentId: 'emp-12',
        incumbentName: 'Jennifer Park',
        vacancyRisk: 'low',
        successorCount: 1,
        readyNowCount: 1
      },
      {
        positionId: 'pos-14',
        title: 'Director of Marketing',
        department: 'Marketing',
        incumbentId: 'emp-9',
        incumbentName: 'Amanda White',
        vacancyRisk: 'medium',
        successorCount: 1,
        readyNowCount: 0
      }
    ],
    totalPositions: 3,
    coverageRate: 100
  }
];

export const mockDevelopmentPaths: DevelopmentPath[] = [
  {
    id: 'dp-1',
    candidateId: 'sc-1',
    targetRole: 'Chief Technology Officer',
    estimatedTimeframe: '1-2 years',
    milestones: [
      {
        id: 'dm-1',
        title: 'Complete Executive Leadership Program',
        description: 'Participate in 6-month executive development program',
        type: 'training',
        targetDate: '2024-06-30',
        status: 'in-progress'
      },
      {
        id: 'dm-2',
        title: 'Lead Digital Transformation Initiative',
        description: 'Oversee company-wide digital transformation project',
        type: 'stretch-assignment',
        targetDate: '2024-09-30',
        status: 'pending'
      },
      {
        id: 'dm-3',
        title: 'Board Presentation Experience',
        description: 'Present quarterly technology updates to board of directors',
        type: 'project',
        targetDate: '2024-12-31',
        status: 'pending'
      },
      {
        id: 'dm-4',
        title: 'Complete M&A Integration Project',
        description: 'Lead technology integration for upcoming acquisition',
        type: 'project',
        targetDate: '2025-03-31',
        status: 'pending'
      }
    ],
    requiredSkills: [
      {
        skillId: 'skill-1',
        skillName: 'Executive Presence',
        currentLevel: 'intermediate',
        targetLevel: 'expert'
      },
      {
        skillId: 'skill-2',
        skillName: 'Strategic Planning',
        currentLevel: 'advanced',
        targetLevel: 'expert'
      },
      {
        skillId: 'skill-3',
        skillName: 'Board-level Communication',
        currentLevel: 'beginner',
        targetLevel: 'advanced'
      }
    ],
    assignedMentor: {
      id: 'emp-1',
      name: 'Sarah Johnson'
    },
    progress: 25,
    status: 'in-progress',
    createdAt: '2024-01-15',
    updatedAt: '2024-03-01'
  }
];
