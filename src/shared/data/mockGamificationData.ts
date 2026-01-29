import type { Badge, Challenge, GamificationProfile, LeaderboardEntry } from '@/shared/types/performance';

export const mockBadges: Badge[] = [
  // Achievement Badges
  {
    id: 'badge-1',
    name: 'First Steps',
    description: 'Complete your first lesson',
    icon: 'Footprints',
    category: 'achievement',
    rarity: 'common',
    requirements: {
      type: 'lessons_completed',
      target: 1,
      criteria: 'Complete 1 lesson'
    },
    points: 10
  },
  {
    id: 'badge-2',
    name: 'Speed Demon',
    description: 'Complete a course in under 50% of estimated time',
    icon: 'Zap',
    category: 'achievement',
    rarity: 'rare',
    requirements: {
      type: 'fast_completion',
      target: 1,
      criteria: 'Complete course quickly'
    },
    points: 100
  },
  {
    id: 'badge-3',
    name: 'Perfect Scholar',
    description: 'Get 100% on 5 quizzes',
    icon: 'GraduationCap',
    category: 'achievement',
    rarity: 'rare',
    requirements: {
      type: 'perfect_scores',
      target: 5,
      criteria: 'Score 100% on 5 quizzes'
    },
    points: 150
  },
  {
    id: 'badge-4',
    name: 'Week Warrior',
    description: 'Maintain a 7-day learning streak',
    icon: 'Flame',
    category: 'achievement',
    rarity: 'common',
    requirements: {
      type: 'streak',
      target: 7,
      criteria: 'Learn for 7 consecutive days'
    },
    points: 75
  },
  {
    id: 'badge-5',
    name: 'Month Master',
    description: 'Maintain a 30-day learning streak',
    icon: 'Trophy',
    category: 'achievement',
    rarity: 'epic',
    requirements: {
      type: 'streak',
      target: 30,
      criteria: 'Learn for 30 consecutive days'
    },
    points: 300
  },
  
  // Skill Badges
  {
    id: 'badge-6',
    name: 'React Master',
    description: 'Complete all React courses',
    icon: 'Code',
    category: 'skill',
    rarity: 'epic',
    requirements: {
      type: 'skill_courses',
      target: 5,
      criteria: 'Complete all React courses'
    },
    points: 250
  },
  {
    id: 'badge-7',
    name: 'Leadership Pro',
    description: 'Complete all leadership courses',
    icon: 'Users',
    category: 'skill',
    rarity: 'rare',
    requirements: {
      type: 'skill_courses',
      target: 4,
      criteria: 'Complete all leadership courses'
    },
    points: 200
  },
  {
    id: 'badge-8',
    name: 'Data Wizard',
    description: 'Master data analysis skills',
    icon: 'BarChart',
    category: 'skill',
    rarity: 'epic',
    requirements: {
      type: 'skill_mastery',
      target: 1,
      criteria: 'Achieve mastery in data analysis'
    },
    points: 300
  },
  
  // Milestone Badges
  {
    id: 'badge-9',
    name: '10 Courses',
    description: 'Complete 10 courses',
    icon: 'BookOpen',
    category: 'milestone',
    rarity: 'common',
    requirements: {
      type: 'courses_completed',
      target: 10,
      criteria: 'Complete 10 courses'
    },
    points: 100
  },
  {
    id: 'badge-10',
    name: '100 Hours',
    description: 'Spend 100 hours learning',
    icon: 'Clock',
    category: 'milestone',
    rarity: 'rare',
    requirements: {
      type: 'hours_learned',
      target: 100,
      criteria: 'Learn for 100 hours'
    },
    points: 200
  },
  {
    id: 'badge-11',
    name: '1 Year Streak',
    description: 'Maintain learning for an entire year',
    icon: 'Calendar',
    category: 'milestone',
    rarity: 'legendary',
    requirements: {
      type: 'streak',
      target: 365,
      criteria: 'Learn for 365 consecutive days'
    },
    points: 1000
  },
  
  // Special Badges
  {
    id: 'badge-12',
    name: 'Team Player',
    description: 'Help 10 colleagues with their learning',
    icon: 'Heart',
    category: 'special',
    rarity: 'rare',
    requirements: {
      type: 'peer_help',
      target: 10,
      criteria: 'Help 10 colleagues'
    },
    points: 150
  },
  {
    id: 'badge-13',
    name: 'Knowledge Sharer',
    description: 'Create 5 learning resources',
    icon: 'Share2',
    category: 'special',
    rarity: 'epic',
    requirements: {
      type: 'resources_created',
      target: 5,
      criteria: 'Create 5 resources'
    },
    points: 250
  },
  {
    id: 'badge-14',
    name: 'Early Adopter',
    description: 'Be among first 100 platform users',
    icon: 'Star',
    category: 'special',
    rarity: 'legendary',
    requirements: {
      type: 'early_user',
      target: 1,
      criteria: 'Join early'
    },
    points: 500
  },
];

export const mockChallenges: Challenge[] = [
  {
    id: 'challenge-1',
    title: 'Weekly Learning Sprint',
    description: 'Complete 3 lessons this week',
    type: 'weekly',
    startDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    target: 3,
    current: 1,
    reward: {
      points: 50,
      badges: []
    },
    participants: ['emp-1', 'emp-2'],
    status: 'active'
  },
  {
    id: 'challenge-2',
    title: 'Monthly Mastery',
    description: 'Finish a complete certification path',
    type: 'monthly',
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
    target: 1,
    current: 0,
    reward: {
      points: 200,
      badges: ['badge-6']
    },
    participants: ['emp-1'],
    status: 'active'
  },
  {
    id: 'challenge-3',
    title: 'Department Learning Goal',
    description: 'Engineering team: 500 total hours this month',
    type: 'team',
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
    target: 500,
    current: 342,
    reward: {
      points: 100,
      badges: ['badge-12']
    },
    participants: ['emp-1', 'emp-2', 'emp-3', 'emp-4'],
    status: 'active'
  },
  {
    id: 'challenge-4',
    title: 'React in 30 Days',
    description: 'Master React by completing all courses in 30 days',
    type: 'skill',
    startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
    target: 5,
    current: 3,
    reward: {
      points: 300,
      badges: ['badge-6']
    },
    participants: ['emp-1'],
    status: 'active'
  },
];

export const mockGamificationProfiles: GamificationProfile[] = [
  {
    employeeId: 'emp-1',
    totalPoints: 2450,
    level: 8,
    rank: 'Scholar',
    badges: [
      {
        id: 'eb-1',
        employeeId: 'emp-1',
        badgeId: 'badge-1',
        badge: mockBadges[0],
        earnedDate: new Date('2024-01-15')
      },
      {
        id: 'eb-2',
        employeeId: 'emp-1',
        badgeId: 'badge-4',
        badge: mockBadges[3],
        earnedDate: new Date('2024-01-22')
      },
      {
        id: 'eb-3',
        employeeId: 'emp-1',
        badgeId: 'badge-9',
        badge: mockBadges[8],
        earnedDate: new Date('2024-02-10')
      },
    ],
    streak: 12,
    longestStreak: 45,
    completedChallenges: ['challenge-3'],
    achievements: [
      {
        id: 'ach-1',
        title: 'First Course Complete',
        description: 'Completed your first course',
        unlockedDate: new Date('2024-01-18'),
        icon: 'Award',
        points: 50
      },
      {
        id: 'ach-2',
        title: 'Quiz Master',
        description: 'Aced 3 quizzes in a row',
        unlockedDate: new Date('2024-02-05'),
        icon: 'Target',
        points: 75
      },
    ],
    lastActivity: new Date()
  },
];

export const mockLeaderboard: LeaderboardEntry[] = [
  {
    rank: 1,
    employeeId: 'emp-5',
    employeeName: 'Alex Rivera',
    department: 'Engineering',
    points: 4250,
    level: 12,
    badges: 18,
    change: 2
  },
  {
    rank: 2,
    employeeId: 'emp-3',
    employeeName: 'Sarah Chen',
    department: 'Product',
    points: 3890,
    level: 11,
    badges: 15,
    change: -1
  },
  {
    rank: 3,
    employeeId: 'emp-1',
    employeeName: 'Michael Johnson',
    department: 'Engineering',
    points: 2450,
    level: 8,
    badges: 12,
    change: 1
  },
  {
    rank: 4,
    employeeId: 'emp-2',
    employeeName: 'Emma Davis',
    department: 'Design',
    points: 2180,
    level: 7,
    badges: 10,
    change: 0
  },
  {
    rank: 5,
    employeeId: 'emp-4',
    employeeName: 'James Wilson',
    department: 'Marketing',
    points: 1950,
    level: 7,
    badges: 9,
    change: -2
  },
];
