import { useState, useEffect } from 'react';

export interface CandidatePresence {
  userId: string;
  userName: string;
  userRole: string;
  userAvatar?: string;
  tab?: string;
  lastActive: Date;
}

interface UseCandidatePresenceOptions {
  applicationId: string;
  currentUserId: string;
  currentUserName: string;
  currentUserRole: string;
  currentTab: string;
}

export const useCandidatePresence = ({
  applicationId,
  currentUserId,
  currentUserName,
  currentUserRole,
  currentTab,
}: UseCandidatePresenceOptions) => {
  const [activeUsers, setActiveUsers] = useState<CandidatePresence[]>([]);

  // Simulate other users viewing the profile
  useEffect(() => {
    const mockUsers: CandidatePresence[] = [
      {
        userId: 'user-1',
        userName: 'Sarah Johnson',
        userRole: 'Technical Lead',
        tab: 'overview',
        lastActive: new Date(),
      },
      {
        userId: 'user-2',
        userName: 'Mike Chen',
        userRole: 'Senior Developer',
        tab: 'resume',
        lastActive: new Date(),
      },
    ];

    // Add mock users after a delay
    const timeout = setTimeout(() => {
      setActiveUsers(mockUsers);
    }, 1000);

    return () => clearTimeout(timeout);
  }, [applicationId]);

  // Simulate user activity updates
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveUsers((prev) =>
        prev.map((user) => ({
          ...user,
          lastActive: new Date(),
          tab: Math.random() > 0.7 
            ? ['overview', 'application', 'resume', 'questionnaire', 'scorecards', 'interviews'][Math.floor(Math.random() * 6)]
            : user.tab,
        }))
      );
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // Get all users including current user
  const allUsers: CandidatePresence[] = [
    ...activeUsers,
    {
      userId: currentUserId,
      userName: currentUserName,
      userRole: currentUserRole,
      tab: currentTab,
      lastActive: new Date(),
    },
  ];

  return {
    activeUsers: allUsers,
    otherUsers: activeUsers,
  };
};
