import type { PerformanceGoal, PerformanceReviewTemplate, PerformanceReview, Feedback360, ReviewSchedule } from '@/shared/types/performance';
export { mockCompanyOKRs, mockTeamObjectives } from './mockOKRData';

export const mockPerformanceGoals: PerformanceGoal[] = [
  {
    id: 'pg1',
    employeeId: '1',
    employeeName: 'Sarah Johnson',
    title: 'Complete AWS Certification',
    description: 'Obtain AWS Solutions Architect Professional certification to enhance cloud expertise',
    category: 'Professional Development',
    priority: 'high',
    status: 'in-progress',
    startDate: '2025-01-01',
    targetDate: '2025-06-30',
    progress: 65,
    alignedWith: 'team-obj1',
    alignmentType: 'team-objective',
    kpis: [
      {
        id: 'kpi1',
        name: 'Practice Exams Completed',
        target: 10,
        current: 6,
        unit: 'exams',
        description: 'Complete practice exams with 80%+ score'
      },
      {
        id: 'kpi2',
        name: 'Study Hours',
        target: 120,
        current: 75,
        unit: 'hours'
      }
    ],
    createdBy: 'michael.chen@company.com',
    createdAt: '2025-01-01T09:00:00Z',
    updatedAt: '2025-01-20T14:30:00Z',
  },
  {
    id: 'pg2',
    employeeId: '1',
    employeeName: 'Sarah Johnson',
    title: 'Lead Migration Project',
    description: 'Successfully lead the migration of legacy systems to new architecture',
    category: 'Project Delivery',
    priority: 'critical',
    status: 'in-progress',
    startDate: '2024-10-01',
    targetDate: '2025-03-31',
    progress: 45,
    alignedWith: 'team-obj1',
    alignmentType: 'team-objective',
    kpis: [
      {
        id: 'kpi3',
        name: 'Milestones Completed',
        target: 5,
        current: 2,
        unit: 'milestones'
      },
      {
        id: 'kpi4',
        name: 'Team Satisfaction',
        target: 4.5,
        current: 4.2,
        unit: 'rating'
      }
    ],
    createdBy: 'michael.chen@company.com',
    createdAt: '2024-10-01T09:00:00Z',
    updatedAt: '2025-01-18T10:15:00Z',
  },
  {
    id: 'pg3',
    employeeId: '2',
    employeeName: 'David Martinez',
    title: 'Launch New Product Feature',
    description: 'Successfully launch analytics dashboard feature',
    category: 'Product Development',
    priority: 'high',
    status: 'completed',
    startDate: '2024-11-01',
    targetDate: '2025-01-15',
    completedDate: '2025-01-14',
    progress: 100,
    alignedWith: 'team-obj2',
    alignmentType: 'team-objective',
    kpis: [
      {
        id: 'kpi5',
        name: 'User Adoption',
        target: 500,
        current: 650,
        unit: 'users'
      },
      {
        id: 'kpi6',
        name: 'Customer Satisfaction',
        target: 4.0,
        current: 4.3,
        unit: 'rating'
      }
    ],
    createdBy: 'lisa.anderson@company.com',
    createdAt: '2024-11-01T09:00:00Z',
    updatedAt: '2025-01-14T16:45:00Z',
  },
];

export const mockReviewTemplates: PerformanceReviewTemplate[] = [
  {
    id: 'rt1',
    name: 'Annual Performance Review',
    description: 'Comprehensive annual performance evaluation',
    cycle: 'annual',
    sections: [
      {
        id: 'sec1',
        title: 'Job Performance',
        description: 'Evaluate overall job performance and achievements',
        weight: 40,
        questions: [
          {
            id: 'q1',
            question: 'How well does the employee meet job requirements?',
            type: 'rating',
            required: true,
            helpText: 'Rate from 1 (Poor) to 5 (Exceptional)'
          },
          {
            id: 'q2',
            question: 'What are the employee\'s key achievements this year?',
            type: 'text',
            required: true
          }
        ]
      },
      {
        id: 'sec2',
        title: 'Skills & Competencies',
        description: 'Assess technical and soft skills',
        weight: 30,
        questions: [
          {
            id: 'q3',
            question: 'Rate technical proficiency',
            type: 'rating',
            required: true
          },
          {
            id: 'q4',
            question: 'Rate communication skills',
            type: 'rating',
            required: true
          },
          {
            id: 'q5',
            question: 'Rate teamwork and collaboration',
            type: 'rating',
            required: true
          }
        ]
      },
      {
        id: 'sec3',
        title: 'Goals & Development',
        description: 'Review goal achievement and development needs',
        weight: 30,
        questions: [
          {
            id: 'q6',
            question: 'What percentage of goals were achieved?',
            type: 'rating',
            required: true
          },
          {
            id: 'q7',
            question: 'What areas need development?',
            type: 'text',
            required: true
          }
        ]
      }
    ],
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'rt2',
    name: 'Quarterly Check-in',
    description: 'Quick quarterly progress review',
    cycle: 'quarterly',
    sections: [
      {
        id: 'sec4',
        title: 'Progress Update',
        weight: 50,
        questions: [
          {
            id: 'q8',
            question: 'Rate overall progress this quarter',
            type: 'rating',
            required: true
          },
          {
            id: 'q9',
            question: 'Key accomplishments',
            type: 'text',
            required: true
          }
        ]
      },
      {
        id: 'sec5',
        title: 'Support Needed',
        weight: 50,
        questions: [
          {
            id: 'q10',
            question: 'What support do you need?',
            type: 'text',
            required: false
          }
        ]
      }
    ],
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  }
];

export const mockPerformanceReviews: PerformanceReview[] = [
  {
    id: 'pr1',
    employeeId: '1',
    employeeName: 'Sarah Johnson',
    reviewerId: '5',
    reviewerName: 'Michael Chen',
    templateId: 'rt2',
    templateName: 'Quarterly Check-in',
    reviewPeriodStart: '2024-10-01',
    reviewPeriodEnd: '2024-12-31',
    status: 'completed',
    dueDate: '2025-01-15',
    completedDate: '2025-01-12',
    overallRating: 4.5,
    responses: [
      { sectionId: 'sec4', questionId: 'q8', rating: 5 },
      { sectionId: 'sec4', questionId: 'q9', textResponse: 'Led successful migration project, mentored 2 junior developers' },
      { sectionId: 'sec5', questionId: 'q10', textResponse: 'Additional training budget for AWS certification' }
    ],
    strengths: 'Strong technical leadership, excellent communication',
    areasForImprovement: 'Time management for multiple projects',
    goals: 'Complete AWS certification, lead one more major project',
    managerComments: 'Exceptional performance this quarter. Ready for senior role.',
    approvalWorkflow: {
      stages: [
        {
          id: 'stage1',
          name: 'Manager Review',
          role: 'manager',
          approverId: '5',
          approverName: 'Michael Chen',
          status: 'approved',
          comments: 'Great work this quarter. Approved for HR review.',
          actionDate: '2025-01-12T10:00:00Z',
          required: true
        },
        {
          id: 'stage2',
          name: 'HR Verification',
          role: 'hr',
          approverId: '10',
          approverName: 'Emma Wilson',
          status: 'approved',
          comments: 'All documentation complete. Performance aligns with promotion criteria.',
          actionDate: '2025-01-13T14:30:00Z',
          required: true
        }
      ],
      currentStageIndex: 2,
      overallStatus: 'approved'
    },
    createdAt: '2024-12-15T09:00:00Z',
    updatedAt: '2025-01-12T15:30:00Z',
  },
  {
    id: 'pr2',
    employeeId: '2',
    employeeName: 'David Martinez',
    reviewerId: '6',
    reviewerName: 'Lisa Anderson',
    templateId: 'rt2',
    templateName: 'Quarterly Check-in',
    reviewPeriodStart: '2024-10-01',
    reviewPeriodEnd: '2024-12-31',
    status: 'in-progress',
    dueDate: '2025-01-30',
    overallRating: undefined,
    responses: [],
    approvalWorkflow: {
      stages: [
        {
          id: 'stage1',
          name: 'Manager Review',
          role: 'manager',
          approverId: '6',
          approverName: 'Lisa Anderson',
          status: 'pending',
          required: true
        },
        {
          id: 'stage2',
          name: 'HR Verification',
          role: 'hr',
          status: 'pending',
          required: true
        },
        {
          id: 'stage3',
          name: 'Senior Management Sign-off',
          role: 'senior-manager',
          status: 'pending',
          required: false
        }
      ],
      currentStageIndex: 0,
      overallStatus: 'pending'
    },
    createdAt: '2025-01-05T09:00:00Z',
    updatedAt: '2025-01-05T09:00:00Z',
  }
];

export const mockFeedback360: Feedback360[] = [
  {
    id: 'f1',
    employeeId: '1',
    employeeName: 'Sarah Johnson',
    reviewCycle: 'Q4 2024',
    requestedBy: '5',
    requestedByName: 'Michael Chen',
    status: 'in-progress',
    dueDate: '2025-02-15',
    providers: [
      {
        id: 'fp1',
        providerId: '5',
        providerName: 'Michael Chen',
        relationship: 'Manager',
        email: 'michael.chen@example.com',
        status: 'submitted',
        submittedAt: '2025-01-20T14:30:00Z',
      },
      {
        id: 'fp2',
        providerId: '2',
        providerName: 'David Martinez',
        relationship: 'Peer',
        email: 'david.martinez@example.com',
        status: 'pending'
      },
      {
        id: 'fp3',
        providerId: '3',
        providerName: 'Emily Chen',
        relationship: 'Peer',
        email: 'emily.chen@example.com',
        status: 'pending'
      }
    ],
    questions: [
      { id: 'q1', question: 'How would you rate their leadership skills?' },
      { id: 'q2', question: 'How effective is their communication?' },
      { id: 'q3', question: 'How well do they collaborate with the team?' }
    ],
    responses: [
      {
        id: 'r1',
        providerId: '5',
        providerName: 'Michael Chen',
        relationship: 'Manager',
        questionId: 'q1',
        question: 'How would you rate their leadership skills?',
        rating: 5,
        comment: 'Excellent technical leader with great mentoring skills',
        submittedAt: '2025-01-20T14:30:00Z',
      },
      {
        id: 'r2',
        providerId: '5',
        providerName: 'Michael Chen',
        relationship: 'Manager',
        questionId: 'q2',
        question: 'How effective is their communication?',
        rating: 5,
        comment: 'Clear and concise communicator',
        submittedAt: '2025-01-20T14:30:00Z',
      }
    ],
    createdAt: '2025-01-15T09:00:00Z',
  }
];

export const mockReviewSchedules: ReviewSchedule[] = [
  {
    id: 'rs1',
    name: 'Annual Performance Reviews',
    templateId: 'rt1',
    templateName: 'Annual Performance Review',
    cycle: 'annual',
    nextReviewDate: '2025-12-01',
    employeeIds: [],
    autoAssignToManager: true,
    sendReminders: true,
    reminderDaysBefore: 7,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'rs2',
    name: 'Quarterly Check-ins',
    templateId: 'rt2',
    templateName: 'Quarterly Check-in',
    cycle: 'quarterly',
    nextReviewDate: '2025-04-01',
    employeeIds: [],
    autoAssignToManager: true,
    sendReminders: true,
    reminderDaysBefore: 3,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  }
];
