import type { Badge, Challenge, GamificationProfile, EmployeeBadge, Achievement, LeaderboardEntry } from '@/shared/types/performance';
import { mockBadges, mockChallenges, mockGamificationProfiles, mockLeaderboard } from '@/shared/data/mockGamificationData';

const GAMIFICATION_PROFILES_KEY = 'gamificationProfiles';
const CHALLENGES_KEY = 'challenges';
const LEADERBOARD_KEY = 'leaderboard';

// Badges
export function getBadges(): Badge[] {
  return mockBadges;
}

export function getBadgeById(id: string): Badge | undefined {
  return mockBadges.find(b => b.id === id);
}

// Gamification Profiles
export function getGamificationProfile(employeeId: string): GamificationProfile | undefined {
  const stored = localStorage.getItem(GAMIFICATION_PROFILES_KEY);
  const profiles = stored ? JSON.parse(stored) : mockGamificationProfiles;
  return profiles.find((p: GamificationProfile) => p.employeeId === employeeId);
}

export function saveGamificationProfile(profile: GamificationProfile): void {
  const stored = localStorage.getItem(GAMIFICATION_PROFILES_KEY);
  const profiles = stored ? JSON.parse(stored) : mockGamificationProfiles;
  const index = profiles.findIndex((p: GamificationProfile) => p.employeeId === profile.employeeId);
  
  if (index >= 0) {
    profiles[index] = profile;
  } else {
    profiles.push(profile);
  }
  
  localStorage.setItem(GAMIFICATION_PROFILES_KEY, JSON.stringify(profiles));
}

export function awardBadge(employeeId: string, badgeId: string): void {
  const profile = getGamificationProfile(employeeId);
  const badge = getBadgeById(badgeId);
  
  if (!profile || !badge) return;
  
  // Check if already earned
  if (profile.badges.some(b => b.badgeId === badgeId)) return;
  
  const employeeBadge: EmployeeBadge = {
    id: `eb-${Date.now()}`,
    employeeId,
    badgeId,
    badge,
    earnedDate: new Date()
  };
  
  profile.badges.push(employeeBadge);
  profile.totalPoints += badge.points;
  
  // Update level based on points
  profile.level = calculateLevel(profile.totalPoints);
  profile.rank = calculateRank(profile.totalPoints);
  
  saveGamificationProfile(profile);
}

export function awardPoints(employeeId: string, points: number, achievementTitle?: string): void {
  const profile = getGamificationProfile(employeeId);
  if (!profile) return;
  
  profile.totalPoints += points;
  profile.level = calculateLevel(profile.totalPoints);
  profile.rank = calculateRank(profile.totalPoints);
  profile.lastActivity = new Date();
  
  if (achievementTitle) {
    const achievement: Achievement = {
      id: `ach-${Date.now()}`,
      title: achievementTitle,
      description: `Earned ${points} points`,
      unlockedDate: new Date(),
      icon: 'Star',
      points
    };
    profile.achievements.push(achievement);
  }
  
  saveGamificationProfile(profile);
}

export function updateStreak(employeeId: string): void {
  const profile = getGamificationProfile(employeeId);
  if (!profile) return;
  
  const now = new Date();
  const lastActivity = new Date(profile.lastActivity);
  const hoursSinceLastActivity = (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60);
  
  // If within 24-48 hours, increment streak
  if (hoursSinceLastActivity >= 24 && hoursSinceLastActivity <= 48) {
    profile.streak += 1;
    if (profile.streak > profile.longestStreak) {
      profile.longestStreak = profile.streak;
    }
    awardPoints(employeeId, 10, 'Daily Streak');
  } 
  // If more than 48 hours, reset streak
  else if (hoursSinceLastActivity > 48) {
    profile.streak = 1;
  }
  
  profile.lastActivity = now;
  saveGamificationProfile(profile);
}

function calculateLevel(points: number): number {
  if (points < 500) return 1;
  if (points < 1000) return 2;
  if (points < 1500) return 3;
  if (points < 2000) return 4;
  if (points < 2500) return 5;
  if (points < 3000) return 6;
  if (points < 4000) return 7;
  if (points < 5000) return 8;
  if (points < 6000) return 9;
  return Math.floor(points / 1000) + 1;
}

function calculateRank(points: number): string {
  if (points < 500) return 'Novice';
  if (points < 1500) return 'Learner';
  if (points < 3000) return 'Scholar';
  if (points < 6000) return 'Expert';
  return 'Master';
}

// Challenges
export function getChallenges(status?: 'active' | 'completed' | 'expired'): Challenge[] {
  const stored = localStorage.getItem(CHALLENGES_KEY);
  let challenges = stored ? JSON.parse(stored) : mockChallenges;
  
  if (status) {
    challenges = challenges.filter((c: Challenge) => c.status === status);
  }
  
  return challenges;
}

export function updateChallengeProgress(challengeId: string, employeeId: string, increment: number = 1): void {
  const stored = localStorage.getItem(CHALLENGES_KEY);
  const challenges = stored ? JSON.parse(stored) : mockChallenges;
  const challenge = challenges.find((c: Challenge) => c.id === challengeId);
  
  if (!challenge) return;
  
  challenge.current = Math.min(challenge.target, challenge.current + increment);
  
  // Check if completed
  if (challenge.current >= challenge.target && challenge.status === 'active') {
    challenge.status = 'completed';
    awardPoints(employeeId, challenge.reward.points, `Challenge: ${challenge.title}`);
    
    // Award badges
    if (challenge.reward.badges) {
      challenge.reward.badges.forEach(badgeId => {
        awardBadge(employeeId, badgeId);
      });
    }
    
    // Mark challenge as completed in profile
    const profile = getGamificationProfile(employeeId);
    if (profile) {
      profile.completedChallenges.push(challengeId);
      saveGamificationProfile(profile);
    }
  }
  
  localStorage.setItem(CHALLENGES_KEY, JSON.stringify(challenges));
}

// Leaderboard
export function getLeaderboard(department?: string): LeaderboardEntry[] {
  const stored = localStorage.getItem(LEADERBOARD_KEY);
  let leaderboard = stored ? JSON.parse(stored) : mockLeaderboard;
  
  if (department) {
    leaderboard = leaderboard.filter((e: LeaderboardEntry) => e.department === department);
  }
  
  return leaderboard.sort((a: LeaderboardEntry, b: LeaderboardEntry) => b.points - a.points);
}

export function updateLeaderboard(): void {
  // Recalculate leaderboard from all profiles
  const stored = localStorage.getItem(GAMIFICATION_PROFILES_KEY);
  const profiles = stored ? JSON.parse(stored) : mockGamificationProfiles;
  
  const leaderboard: LeaderboardEntry[] = profiles.map((profile: GamificationProfile, index: number) => ({
    rank: index + 1,
    employeeId: profile.employeeId,
    employeeName: `Employee ${profile.employeeId}`, // In real app, fetch from employee data
    department: 'Engineering', // In real app, fetch from employee data
    points: profile.totalPoints,
    level: profile.level,
    badges: profile.badges.length,
    change: 0
  })).sort((a: LeaderboardEntry, b: LeaderboardEntry) => b.points - a.points);
  
  // Recalculate ranks
  leaderboard.forEach((entry, index) => {
    entry.rank = index + 1;
  });
  
  localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(leaderboard));
}
