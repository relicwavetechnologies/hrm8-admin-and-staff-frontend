import { PerformanceImprovementPlan } from "@/shared/types/performance";

export const mockPIPs: PerformanceImprovementPlan[] = [
  {
    id: "pip-1",
    employeeId: "3",
    employeeName: "Robert Wilson",
    managerId: "manager-1",
    managerName: "Sarah Johnson",
    hrPartnerId: "hr-1",
    hrPartnerName: "Emily Rodriguez",
    startDate: "2024-10-01",
    endDate: "2024-12-31",
    status: "on-track",
    severity: "medium",
    triggerReason: "Consistent failure to meet project deadlines and quality standards over the past quarter",
    performanceIssues: [
      "Missed 4 out of 5 project deadlines in Q3",
      "Code quality below team standards (20+ bugs per sprint)",
      "Lack of communication with team members",
      "Insufficient documentation of work"
    ],
    expectedOutcomes: [
      "Meet all assigned deadlines for 3 consecutive months",
      "Reduce bug count to team average (5 or fewer per sprint)",
      "Improve code review participation and communication",
      "Complete documentation for all major features"
    ],
    consequences: "Failure to meet these expectations may result in reassignment, demotion, or termination of employment",
    milestones: [
      {
        id: "m1",
        title: "Complete Time Management Training",
        description: "Attend and complete the project management and time management workshop",
        targetDate: "2024-10-15",
        completedDate: "2024-10-14",
        status: "completed",
        successCriteria: [
          "Attend all 3 training sessions",
          "Submit time management plan",
          "Receive trainer certification"
        ],
        actualResults: "Completed all sessions with positive feedback from trainer. Submitted comprehensive time management plan.",
        evidence: ["Training certificate", "Time management plan document"]
      },
      {
        id: "m2",
        title: "Deliver Project Alpha on Time",
        description: "Successfully deliver Project Alpha by the agreed deadline with quality standards met",
        targetDate: "2024-11-15",
        status: "in-progress",
        successCriteria: [
          "All features completed by deadline",
          "Less than 5 bugs in QA",
          "Code review approval from 2 senior developers",
          "Complete documentation submitted"
        ]
      },
      {
        id: "m3",
        title: "Consistent Performance for 60 Days",
        description: "Maintain consistent on-time delivery and quality for 60 consecutive days",
        targetDate: "2024-12-31",
        status: "pending",
        successCriteria: [
          "100% on-time task completion",
          "Bug count at or below team average",
          "Positive peer feedback",
          "All documentation up to date"
        ]
      }
    ],
    checkIns: [
      {
        id: "c1",
        scheduledDate: "2024-10-15",
        completedDate: "2024-10-15",
        attendees: [
          { id: "manager-1", name: "Sarah Johnson", role: "Manager" },
          { id: "3", name: "Robert Wilson", role: "Employee" },
          { id: "hr-1", name: "Emily Rodriguez", role: "HR Partner" }
        ],
        discussionPoints: [
          "Training completion and learning outcomes",
          "Current workload and capacity",
          "Support needs and resources"
        ],
        progressRating: 4,
        managerNotes: "Robert has shown strong commitment by completing training early. He's implementing new time management techniques and seeking help proactively.",
        employeeNotes: "The training was very helpful. I'm using the Pomodoro technique and blocking time for focused work. Feeling more confident about meeting deadlines.",
        actionItems: [
          {
            id: "a1",
            description: "Set up weekly planning sessions with manager",
            dueDate: "2024-10-20",
            status: "completed"
          },
          {
            id: "a2",
            description: "Create detailed project breakdown for Project Alpha",
            dueDate: "2024-10-22",
            status: "completed"
          }
        ],
        positives: [
          "Proactive in completing training",
          "Open communication about challenges",
          "Implementing time management techniques"
        ]
      },
      {
        id: "c2",
        scheduledDate: "2024-11-01",
        completedDate: "2024-11-01",
        attendees: [
          { id: "manager-1", name: "Sarah Johnson", role: "Manager" },
          { id: "3", name: "Robert Wilson", role: "Employee" }
        ],
        discussionPoints: [
          "Project Alpha progress review",
          "Code quality improvements",
          "Team collaboration feedback"
        ],
        progressRating: 4,
        managerNotes: "Significant improvement in project planning and execution. Robert is on track to deliver Project Alpha on time. Code quality has improved notably.",
        employeeNotes: "Feeling much better about my progress. The structured approach is helping me stay organized and meet commitments.",
        actionItems: [
          {
            id: "a3",
            description: "Complete Project Alpha feature set",
            dueDate: "2024-11-10",
            status: "pending"
          },
          {
            id: "a4",
            description: "Pair program with senior developer on code review best practices",
            dueDate: "2024-11-08",
            status: "completed"
          }
        ],
        positives: [
          "Consistent on-time task completion",
          "Improved code quality metrics",
          "Better team communication"
        ]
      },
      {
        id: "c3",
        scheduledDate: "2024-11-15",
        attendees: [
          { id: "manager-1", name: "Sarah Johnson", role: "Manager" },
          { id: "3", name: "Robert Wilson", role: "Employee" }
        ],
        discussionPoints: [
          "Milestone 2 completion review",
          "Sustained performance discussion",
          "Path forward planning"
        ],
        progressRating: 3,
        managerNotes: "",
        actionItems: []
      }
    ],
    resources: [
      {
        id: "r1",
        type: "training",
        title: "Project Management Fundamentals",
        description: "3-day workshop covering agile methodologies, time management, and project planning",
        provider: "LinkedIn Learning",
        status: "completed",
        completionDate: "2024-10-14"
      },
      {
        id: "r2",
        type: "mentoring",
        title: "Weekly Mentoring with Senior Developer",
        description: "One-on-one mentoring sessions focusing on code quality and best practices",
        provider: "James Lee (Senior Developer)",
        status: "in-progress"
      },
      {
        id: "r3",
        type: "documentation",
        title: "Code Quality Guidelines",
        description: "Team's comprehensive guide to coding standards and review processes",
        url: "/docs/code-quality",
        status: "completed",
        completionDate: "2024-10-05"
      }
    ],
    alerts: [
      {
        id: "alert-1",
        type: "milestone-due",
        severity: "warning",
        message: "Milestone 2 'Deliver Project Alpha on Time' is due in 7 days",
        date: "2024-11-08",
        acknowledged: true,
        acknowledgedBy: "Robert Wilson",
        acknowledgedDate: "2024-11-08"
      },
      {
        id: "alert-2",
        type: "checkin-due",
        severity: "info",
        message: "Check-in meeting scheduled for November 15, 2024",
        date: "2024-11-12",
        acknowledged: false
      },
      {
        id: "alert-3",
        type: "improvement",
        severity: "info",
        message: "Progress rating improved from 3 to 4 in latest check-in",
        date: "2024-11-01",
        acknowledged: true,
        acknowledgedBy: "Sarah Johnson",
        acknowledgedDate: "2024-11-01"
      }
    ],
    notes: "Robert has shown significant improvement since starting the PIP. His commitment to the training and willingness to adapt his working style is commendable. If current trajectory continues, successful completion is highly likely.",
    createdAt: "2024-10-01T09:00:00",
    updatedAt: "2024-11-06T14:30:00"
  },
  {
    id: "pip-2",
    employeeId: "5",
    employeeName: "Linda Martinez",
    managerId: "manager-2",
    managerName: "Michael Chen",
    hrPartnerId: "hr-1",
    hrPartnerName: "Emily Rodriguez",
    startDate: "2024-09-01",
    endDate: "2024-11-30",
    status: "at-risk",
    severity: "high",
    triggerReason: "Repeated customer complaints regarding communication and service quality",
    performanceIssues: [
      "15+ customer complaints in 3 months",
      "Low customer satisfaction scores (avg 2.3/5)",
      "Poor response time to customer inquiries",
      "Failure to follow escalation procedures"
    ],
    expectedOutcomes: [
      "Reduce complaints to less than 2 per month",
      "Achieve customer satisfaction score of 4.0 or higher",
      "Respond to all inquiries within 24 hours",
      "Follow proper escalation procedures 100% of the time"
    ],
    consequences: "Continued poor performance will result in termination of employment",
    milestones: [
      {
        id: "m1",
        title: "Complete Customer Service Training",
        description: "Finish comprehensive customer service excellence program",
        targetDate: "2024-09-20",
        completedDate: "2024-09-18",
        status: "completed",
        successCriteria: [
          "Complete all training modules",
          "Pass final assessment with 85% or higher",
          "Shadow top performer for 2 days"
        ],
        actualResults: "Completed training with 88% score. Shadowing sessions completed.",
        evidence: ["Training certificate", "Assessment results"]
      },
      {
        id: "m2",
        title: "Achieve 4.0+ Satisfaction for 30 Days",
        description: "Maintain customer satisfaction rating of 4.0 or higher for 30 consecutive days",
        targetDate: "2024-10-31",
        status: "overdue",
        successCriteria: [
          "Average rating 4.0+ for 30 days",
          "No complaints escalated to management",
          "Positive feedback from at least 5 customers"
        ]
      },
      {
        id: "m3",
        title: "Sustained Excellence",
        description: "Maintain improved performance through end of PIP period",
        targetDate: "2024-11-30",
        status: "pending",
        successCriteria: [
          "Consistently high satisfaction scores",
          "Zero valid customer complaints",
          "Meeting all KPIs"
        ]
      }
    ],
    checkIns: [
      {
        id: "c1",
        scheduledDate: "2024-09-20",
        completedDate: "2024-09-20",
        attendees: [
          { id: "manager-2", name: "Michael Chen", role: "Manager" },
          { id: "5", name: "Linda Martinez", role: "Employee" },
          { id: "hr-1", name: "Emily Rodriguez", role: "HR Partner" }
        ],
        discussionPoints: [
          "Training completion review",
          "Initial improvements",
          "Support needs"
        ],
        progressRating: 3,
        managerNotes: "Linda completed the training successfully but still showing resistance to feedback. Need to monitor closely.",
        employeeNotes: "I understand the expectations now but feel the metrics are too strict.",
        actionItems: [
          {
            id: "a1",
            description: "Review and acknowledge customer escalation procedures",
            dueDate: "2024-09-25",
            status: "completed"
          }
        ],
        concerns: [
          "Defensive attitude when receiving feedback",
          "Inconsistent application of training learnings"
        ]
      },
      {
        id: "c2",
        scheduledDate: "2024-10-15",
        completedDate: "2024-10-16",
        attendees: [
          { id: "manager-2", name: "Michael Chen", role: "Manager" },
          { id: "5", name: "Linda Martinez", role: "Employee" }
        ],
        discussionPoints: [
          "Milestone 2 status review",
          "Recent customer interactions",
          "Performance concerns"
        ],
        progressRating: 2,
        managerNotes: "Linda's performance has not improved as expected. Customer satisfaction scores remain low (3.2 avg). Additional coaching provided but limited engagement observed.",
        employeeNotes: "I'm trying my best but some customers are just impossible to please.",
        actionItems: [
          {
            id: "a2",
            description: "Role-play difficult customer scenarios with manager",
            dueDate: "2024-10-20",
            status: "completed"
          },
          {
            id: "a3",
            description: "Daily check-in with manager for 2 weeks",
            dueDate: "2024-10-30",
            status: "pending"
          }
        ],
        concerns: [
          "Blaming customers instead of taking ownership",
          "Not meeting milestone 2 deadline",
          "Satisfaction scores not improving"
        ]
      }
    ],
    resources: [
      {
        id: "r1",
        type: "training",
        title: "Customer Service Excellence Program",
        description: "Comprehensive program covering communication, empathy, and problem-solving",
        provider: "CustomerSuccess Academy",
        status: "completed",
        completionDate: "2024-09-18"
      },
      {
        id: "r2",
        type: "coaching",
        title: "Daily Performance Coaching",
        description: "Daily 15-minute coaching sessions with manager",
        provider: "Michael Chen",
        status: "in-progress"
      },
      {
        id: "r3",
        type: "documentation",
        title: "Customer Escalation Procedures",
        description: "Step-by-step guide for handling customer escalations",
        url: "/docs/escalation-procedures",
        status: "completed"
      }
    ],
    alerts: [
      {
        id: "alert-1",
        type: "at-risk",
        severity: "critical",
        message: "PIP status changed to AT-RISK due to missed milestone and low progress rating",
        date: "2024-10-16",
        acknowledged: true,
        acknowledgedBy: "Michael Chen",
        acknowledgedDate: "2024-10-16"
      },
      {
        id: "alert-2",
        type: "milestone-due",
        severity: "critical",
        message: "Milestone 2 is overdue. Immediate action required.",
        date: "2024-11-01",
        acknowledged: true,
        acknowledgedBy: "Emily Rodriguez",
        acknowledgedDate: "2024-11-01"
      },
      {
        id: "alert-3",
        type: "deadline-approaching",
        severity: "warning",
        message: "PIP end date is 24 days away. Current trajectory may not lead to successful completion.",
        date: "2024-11-06",
        acknowledged: false
      }
    ],
    notes: "URGENT: Linda's performance has not shown the required improvement. Despite training and coaching, customer satisfaction scores remain below acceptable levels. HR recommends preparing for potential unsuccessful PIP outcome.",
    createdAt: "2024-09-01T10:00:00",
    updatedAt: "2024-11-06T16:00:00"
  }
];
