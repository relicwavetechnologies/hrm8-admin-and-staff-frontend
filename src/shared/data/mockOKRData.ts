import { CompanyOKR, TeamObjective } from "@/shared/types/performance";

export const mockCompanyOKRs: CompanyOKR[] = [
  {
    id: 'okr1',
    title: 'Accelerate Product Innovation and Market Leadership',
    description: 'Lead the market with cutting-edge product features and establish competitive advantage through rapid innovation',
    category: 'Product & Innovation',
    owner: '100',
    ownerName: 'CEO - Jennifer Martinez',
    startDate: '2025-01-01',
    targetDate: '2025-12-31',
    progress: 45,
    status: 'in-progress',
    keyResults: [
      {
        id: 'kr1',
        title: 'Launch 3 major product features',
        target: 3,
        current: 1,
        unit: 'features',
        progress: 33
      },
      {
        id: 'kr2',
        title: 'Achieve 95% customer satisfaction score',
        target: 95,
        current: 88,
        unit: '%',
        progress: 93
      },
      {
        id: 'kr3',
        title: 'Reduce time-to-market by 30%',
        target: 30,
        current: 12,
        unit: '%',
        progress: 40
      }
    ],
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-20T00:00:00Z'
  },
  {
    id: 'okr2',
    title: 'Scale Revenue Growth and Market Expansion',
    description: 'Drive significant revenue growth through market expansion and customer acquisition',
    category: 'Business Growth',
    owner: '101',
    ownerName: 'CFO - Robert Johnson',
    startDate: '2025-01-01',
    targetDate: '2025-12-31',
    progress: 52,
    status: 'in-progress',
    keyResults: [
      {
        id: 'kr4',
        title: 'Increase annual recurring revenue by 40%',
        target: 40,
        current: 18,
        unit: '%',
        progress: 45
      },
      {
        id: 'kr5',
        title: 'Expand to 5 new markets',
        target: 5,
        current: 3,
        unit: 'markets',
        progress: 60
      },
      {
        id: 'kr6',
        title: 'Acquire 500 new enterprise customers',
        target: 500,
        current: 275,
        unit: 'customers',
        progress: 55
      }
    ],
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-20T00:00:00Z'
  },
  {
    id: 'okr3',
    title: 'Build World-Class Engineering Culture',
    description: 'Attract, develop, and retain top engineering talent while fostering innovation and excellence',
    category: 'People & Culture',
    owner: '102',
    ownerName: 'CTO - Michael Chen',
    startDate: '2025-01-01',
    targetDate: '2025-12-31',
    progress: 38,
    status: 'in-progress',
    keyResults: [
      {
        id: 'kr7',
        title: 'Achieve 90% employee satisfaction',
        target: 90,
        current: 82,
        unit: '%',
        progress: 91
      },
      {
        id: 'kr8',
        title: 'Reduce employee turnover to under 10%',
        target: 10,
        current: 14,
        unit: '%',
        progress: 60
      },
      {
        id: 'kr9',
        title: 'Hire 50 senior engineers',
        target: 50,
        current: 12,
        unit: 'engineers',
        progress: 24
      }
    ],
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-20T00:00:00Z'
  }
];

export const mockTeamObjectives: TeamObjective[] = [
  {
    id: 'team-obj1',
    title: 'Complete Cloud Infrastructure Migration',
    description: 'Migrate all legacy systems to cloud infrastructure for improved scalability and reliability',
    teamName: 'Engineering',
    alignedWithOKR: 'okr1',
    owner: '5',
    ownerName: 'Michael Chen',
    startDate: '2025-01-01',
    targetDate: '2025-06-30',
    progress: 45,
    status: 'in-progress',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-20T00:00:00Z'
  },
  {
    id: 'team-obj2',
    title: 'Launch AI-Powered Analytics Dashboard',
    description: 'Develop and ship new analytics dashboard with AI-driven insights',
    teamName: 'Product Development',
    alignedWithOKR: 'okr1',
    owner: '6',
    ownerName: 'Lisa Anderson',
    startDate: '2024-11-01',
    targetDate: '2025-03-31',
    progress: 68,
    status: 'in-progress',
    createdAt: '2024-11-01T00:00:00Z',
    updatedAt: '2025-01-20T00:00:00Z'
  },
  {
    id: 'team-obj3',
    title: 'Expand Sales Team and Enter New Markets',
    description: 'Build regional sales teams and establish presence in Asia-Pacific markets',
    teamName: 'Sales',
    alignedWithOKR: 'okr2',
    owner: '7',
    ownerName: 'David Rodriguez',
    startDate: '2025-01-01',
    targetDate: '2025-09-30',
    progress: 35,
    status: 'in-progress',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-20T00:00:00Z'
  },
  {
    id: 'team-obj4',
    title: 'Optimize Customer Acquisition Costs',
    description: 'Reduce CAC by 25% through improved targeting and conversion optimization',
    teamName: 'Marketing',
    alignedWithOKR: 'okr2',
    owner: '8',
    ownerName: 'Emily White',
    startDate: '2025-01-01',
    targetDate: '2025-06-30',
    progress: 42,
    status: 'in-progress',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-20T00:00:00Z'
  },
  {
    id: 'team-obj5',
    title: 'Implement Comprehensive Onboarding Program',
    description: 'Create structured onboarding for new engineers to reduce ramp-up time',
    teamName: 'People Operations',
    alignedWithOKR: 'okr3',
    owner: '9',
    ownerName: 'Sarah Thompson',
    startDate: '2025-01-01',
    targetDate: '2025-04-30',
    progress: 55,
    status: 'in-progress',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-20T00:00:00Z'
  },
  {
    id: 'team-obj6',
    title: 'Build Internal Learning Platform',
    description: 'Develop platform for continuous learning and skill development',
    teamName: 'People Operations',
    alignedWithOKR: 'okr3',
    owner: '9',
    ownerName: 'Sarah Thompson',
    startDate: '2025-01-01',
    targetDate: '2025-08-31',
    progress: 28,
    status: 'in-progress',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-20T00:00:00Z'
  }
];
