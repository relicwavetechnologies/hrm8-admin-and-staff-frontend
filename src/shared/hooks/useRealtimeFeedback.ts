import { useState, useEffect, useCallback } from 'react';
import { TeamMemberFeedback } from '@/shared/types/collaborativeFeedback';

export interface FeedbackUpdate {
  type: 'new' | 'updated' | 'deleted';
  feedback: TeamMemberFeedback;
  timestamp: Date;
}

interface UseRealtimeFeedbackOptions {
  candidateId: string;
  onUpdate?: (update: FeedbackUpdate) => void;
}

export const useRealtimeFeedback = ({
  candidateId,
  onUpdate,
}: UseRealtimeFeedbackOptions) => {
  const [recentUpdates, setRecentUpdates] = useState<FeedbackUpdate[]>([]);
  const [isConnected, setIsConnected] = useState(true);

  // Simulate real-time feedback updates
  useEffect(() => {
    // Simulate connection
    setIsConnected(true);

    // Simulate random feedback updates from other team members
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        const mockUpdate: FeedbackUpdate = {
          type: Math.random() > 0.3 ? 'new' : 'updated',
          feedback: {
            id: `feedback-${Date.now()}`,
            candidateId,
            reviewerId: `user-${Math.floor(Math.random() * 5) + 1}`,
            reviewerName: ['Sarah Johnson', 'Mike Chen', 'Emily Davis', 'John Smith', 'Lisa Wong'][Math.floor(Math.random() * 5)],
            reviewerRole: ['Senior Engineer', 'Tech Lead', 'Engineering Manager', 'Staff Engineer', 'Principal Engineer'][Math.floor(Math.random() * 5)],
            ratings: [],
            comments: [],
            overallScore: Math.floor(Math.random() * 50) + 50,
            recommendation: (['hire', 'strong-hire', 'maybe'] as const)[Math.floor(Math.random() * 3)],
            confidence: Math.floor(Math.random() * 3) + 3,
            submittedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          timestamp: new Date(),
        };

        setRecentUpdates(prev => [...prev.slice(-4), mockUpdate]);
        onUpdate?.(mockUpdate);
      }
    }, 8000);

    return () => {
      clearInterval(interval);
      setIsConnected(false);
    };
  }, [candidateId, onUpdate]);

  const broadcastFeedback = useCallback((feedback: TeamMemberFeedback, type: 'new' | 'updated') => {
    // In real implementation, this would broadcast to WebSocket
    console.log('Broadcasting feedback:', type, feedback);
    
    const update: FeedbackUpdate = {
      type,
      feedback,
      timestamp: new Date(),
    };
    
    setRecentUpdates(prev => [...prev.slice(-4), update]);
  }, []);

  const clearUpdates = useCallback(() => {
    setRecentUpdates([]);
  }, []);

  return {
    recentUpdates,
    isConnected,
    broadcastFeedback,
    clearUpdates,
  };
};
