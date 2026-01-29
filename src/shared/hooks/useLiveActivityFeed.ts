import { useState, useEffect, useCallback } from 'react';

export type ActivityAction = 
  | 'viewed'
  | 'commented'
  | 'rated'
  | 'status_changed'
  | 'decision_made'
  | 'document_uploaded'
  | 'interview_scheduled'
  | 'note_added'
  | 'mentioned';

export interface ActivityItem {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  userAvatar?: string;
  action: ActivityAction;
  description: string;
  metadata?: {
    rating?: number;
    oldStatus?: string;
    newStatus?: string;
    decision?: string;
    section?: string;
    [key: string]: any;
  };
  timestamp: Date;
  candidateId: string;
  candidateName: string;
}

interface UseLiveActivityFeedOptions {
  candidateId?: string;
  enabled?: boolean;
  maxItems?: number;
}

export const useLiveActivityFeed = ({
  candidateId,
  enabled = true,
  maxItems = 50,
}: UseLiveActivityFeedOptions) => {
  const [activities, setActivities] = useState<ActivityItem[]>([
    {
      id: '1',
      userId: 'user-1',
      userName: 'Sarah Johnson',
      userRole: 'Senior Recruiter',
      action: 'viewed',
      description: 'viewed the candidate profile',
      timestamp: new Date(Date.now() - 1000 * 60 * 2),
      candidateId: 'cand-1',
      candidateName: 'John Smith',
    },
    {
      id: '2',
      userId: 'user-2',
      userName: 'Mike Chen',
      userRole: 'Tech Lead',
      action: 'rated',
      description: 'rated the candidate 4.5/5',
      metadata: { rating: 4.5 },
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      candidateId: 'cand-1',
      candidateName: 'John Smith',
    },
    {
      id: '3',
      userId: 'user-3',
      userName: 'Emily Davis',
      userRole: 'Engineering Manager',
      action: 'commented',
      description: 'added a comment on technical skills',
      metadata: { section: 'technical-skills' },
      timestamp: new Date(Date.now() - 1000 * 60 * 10),
      candidateId: 'cand-1',
      candidateName: 'John Smith',
    },
    {
      id: '4',
      userId: 'user-1',
      userName: 'Sarah Johnson',
      userRole: 'Senior Recruiter',
      action: 'status_changed',
      description: 'moved candidate to Technical Interview',
      metadata: { oldStatus: 'Phone Screen', newStatus: 'Technical Interview' },
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      candidateId: 'cand-1',
      candidateName: 'John Smith',
    },
  ]);

  // Simulate real-time activity updates
  useEffect(() => {
    if (!enabled) return;

    const interval = setInterval(() => {
      if (Math.random() > 0.6) {
        const users = [
          { id: 'user-1', name: 'Sarah Johnson', role: 'Senior Recruiter' },
          { id: 'user-2', name: 'Mike Chen', role: 'Tech Lead' },
          { id: 'user-3', name: 'Emily Davis', role: 'Engineering Manager' },
          { id: 'user-4', name: 'Alex Martinez', role: 'HR Manager' },
        ];

        const candidates = [
          { id: 'cand-1', name: 'John Smith' },
          { id: 'cand-2', name: 'Jane Doe' },
          { id: 'cand-3', name: 'Alex Brown' },
        ];

        const activityTypes: Array<{
          action: ActivityAction;
          getDescription: (user: string) => string;
          getMetadata?: () => any;
        }> = [
          {
            action: 'viewed',
            getDescription: (user) => `viewed the candidate profile`,
          },
          {
            action: 'commented',
            getDescription: (user) => `added a comment`,
          },
          {
            action: 'rated',
            getDescription: (user) => {
              const rating = (Math.random() * 2 + 3).toFixed(1);
              return `rated the candidate ${rating}/5`;
            },
            getMetadata: () => ({ rating: parseFloat((Math.random() * 2 + 3).toFixed(1)) }),
          },
          {
            action: 'status_changed',
            getDescription: (user) => `moved candidate to Final Round`,
            getMetadata: () => ({ oldStatus: 'Technical Interview', newStatus: 'Final Round' }),
          },
          {
            action: 'decision_made',
            getDescription: (user) => `recommended to proceed with offer`,
            getMetadata: () => ({ decision: 'proceed' }),
          },
          {
            action: 'interview_scheduled',
            getDescription: (user) => `scheduled a technical interview`,
          },
          {
            action: 'note_added',
            getDescription: (user) => `added interview notes`,
          },
          {
            action: 'document_uploaded',
            getDescription: (user) => `uploaded a document`,
          },
        ];

        const user = users[Math.floor(Math.random() * users.length)];
        const candidate = candidates[Math.floor(Math.random() * candidates.length)];
        const activityType = activityTypes[Math.floor(Math.random() * activityTypes.length)];

        const newActivity: ActivityItem = {
          id: `activity-${Date.now()}-${Math.random()}`,
          userId: user.id,
          userName: user.name,
          userRole: user.role,
          action: activityType.action,
          description: activityType.getDescription(user.name),
          metadata: activityType.getMetadata?.(),
          timestamp: new Date(),
          candidateId: candidate.id,
          candidateName: candidate.name,
        };

        // Filter by candidateId if provided
        if (!candidateId || candidate.id === candidateId) {
          setActivities((prev) => [newActivity, ...prev].slice(0, maxItems));
        }
      }
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, [enabled, candidateId, maxItems]);

  const clearActivities = useCallback(() => {
    setActivities([]);
  }, []);

  const filterByCandidateId = useCallback((id: string) => {
    return activities.filter(a => a.candidateId === id);
  }, [activities]);

  const filterByAction = useCallback((action: ActivityAction) => {
    return activities.filter(a => a.action === action);
  }, [activities]);

  return {
    activities: candidateId ? activities.filter(a => a.candidateId === candidateId) : activities,
    allActivities: activities,
    clearActivities,
    filterByCandidateId,
    filterByAction,
  };
};
