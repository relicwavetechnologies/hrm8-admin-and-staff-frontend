import { useState, useEffect, useCallback } from 'react';

export interface FeedbackPresence {
  userId: string;
  userName: string;
  userRole: string;
  status: 'viewing' | 'editing';
  section?: 'ratings' | 'comments' | 'decision';
  lastActive: Date;
}

interface UseFeedbackPresenceOptions {
  candidateId: string;
  currentUserId: string;
  currentUserName: string;
  currentUserRole: string;
}

// Mock WebSocket simulation
export const useFeedbackPresence = ({
  candidateId,
  currentUserId,
  currentUserName,
  currentUserRole,
}: UseFeedbackPresenceOptions) => {
  const [activeUsers, setActiveUsers] = useState<FeedbackPresence[]>([]);
  const [currentStatus, setCurrentStatus] = useState<'viewing' | 'editing'>('viewing');
  const [currentSection, setCurrentSection] = useState<'ratings' | 'comments' | 'decision' | undefined>();

  // Simulate other users joining/leaving
  useEffect(() => {
    const mockUsers: FeedbackPresence[] = [
      {
        userId: 'user-1',
        userName: 'Sarah Johnson',
        userRole: 'Technical Lead',
        status: 'viewing',
        lastActive: new Date(),
      },
      {
        userId: 'user-2',
        userName: 'Mike Chen',
        userRole: 'Senior Developer',
        status: 'editing',
        section: 'ratings',
        lastActive: new Date(),
      },
    ];

    // Add mock users after a delay
    const timeout = setTimeout(() => {
      setActiveUsers(mockUsers);
    }, 1000);

    return () => clearTimeout(timeout);
  }, [candidateId]);

  // Simulate user activity updates
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveUsers((prev) =>
        prev.map((user) => ({
          ...user,
          lastActive: new Date(),
          status: Math.random() > 0.7 ? (user.status === 'viewing' ? 'editing' : 'viewing') : user.status,
          section: user.status === 'editing' 
            ? (['ratings', 'comments', 'decision'] as const)[Math.floor(Math.random() * 3)]
            : undefined,
        }))
      );
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  // Update current user's presence
  const updatePresence = useCallback((status: 'viewing' | 'editing', section?: 'ratings' | 'comments' | 'decision') => {
    setCurrentStatus(status);
    setCurrentSection(section);
    
    // In a real implementation, this would send to WebSocket
    console.log('Presence updated:', { candidateId, userId: currentUserId, status, section });
  }, [candidateId, currentUserId]);

  // Get all users including current user
  const allUsers: FeedbackPresence[] = [
    ...activeUsers,
    {
      userId: currentUserId,
      userName: currentUserName,
      userRole: currentUserRole,
      status: currentStatus,
      section: currentSection,
      lastActive: new Date(),
    },
  ];

  return {
    activeUsers: allUsers,
    updatePresence,
    currentStatus,
  };
};
