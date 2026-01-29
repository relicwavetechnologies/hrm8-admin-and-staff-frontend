import { useState, useEffect, useCallback } from 'react';
import { TeamMemberFeedback } from '@/shared/types/collaborativeFeedback';
import { FeedbackConflict, ConflictDetectionResult } from '@/shared/types/feedbackConflict';

interface UseConflictDetectionOptions {
  localFeedback: TeamMemberFeedback | null;
  currentUserId: string;
  onConflictDetected?: (conflicts: FeedbackConflict[]) => void;
}

export const useConflictDetection = ({
  localFeedback,
  currentUserId,
  onConflictDetected,
}: UseConflictDetectionOptions) => {
  const [conflicts, setConflicts] = useState<FeedbackConflict[]>([]);
  const [isChecking, setIsChecking] = useState(false);

  // Simulate checking for conflicts with remote version
  const checkForConflicts = useCallback(async (): Promise<ConflictDetectionResult> => {
    if (!localFeedback) {
      return { hasConflicts: false, conflicts: [] };
    }

    setIsChecking(true);

    // Simulate API call to check remote version
    await new Promise(resolve => setTimeout(resolve, 500));

    // Simulate random conflicts for demo
    const detectedConflicts: FeedbackConflict[] = [];
    
    if (Math.random() > 0.7) {
      // Simulate conflict on overall score
      detectedConflicts.push({
        feedbackId: localFeedback.id,
        field: 'overallScore',
        localValue: localFeedback.overallScore,
        remoteValue: Math.floor(Math.random() * 50) + 50,
        localUser: 'You',
        remoteUser: ['Sarah Johnson', 'Mike Chen', 'Emily Davis'][Math.floor(Math.random() * 3)],
        localTimestamp: new Date(),
        remoteTimestamp: new Date(Date.now() - 30000),
      });
    }

    if (Math.random() > 0.8 && localFeedback.comments.length > 0) {
      // Simulate conflict on comments
      detectedConflicts.push({
        feedbackId: localFeedback.id,
        field: 'comments',
        localValue: localFeedback.comments,
        remoteValue: [
          ...localFeedback.comments,
          {
            id: `comment-${Date.now()}`,
            type: 'concern',
            category: 'technical',
            content: 'Remote user added this concern about communication skills.',
            importance: 'medium',
            createdAt: new Date(Date.now() - 20000).toISOString(),
          },
        ],
        localUser: 'You',
        remoteUser: ['Sarah Johnson', 'Mike Chen', 'Emily Davis'][Math.floor(Math.random() * 3)],
        localTimestamp: new Date(),
        remoteTimestamp: new Date(Date.now() - 20000),
      });
    }

    if (Math.random() > 0.75) {
      // Simulate conflict on recommendation
      const recommendations = ['strong-hire', 'hire', 'maybe', 'no-hire', 'strong-no-hire'] as const;
      detectedConflicts.push({
        feedbackId: localFeedback.id,
        field: 'recommendation',
        localValue: localFeedback.recommendation,
        remoteValue: recommendations[Math.floor(Math.random() * recommendations.length)],
        localUser: 'You',
        remoteUser: ['Sarah Johnson', 'Mike Chen', 'Emily Davis'][Math.floor(Math.random() * 3)],
        localTimestamp: new Date(),
        remoteTimestamp: new Date(Date.now() - 15000),
      });
    }

    setConflicts(detectedConflicts);
    setIsChecking(false);

    if (detectedConflicts.length > 0) {
      onConflictDetected?.(detectedConflicts);
    }

    return {
      hasConflicts: detectedConflicts.length > 0,
      conflicts: detectedConflicts,
    };
  }, [localFeedback, onConflictDetected]);

  const clearConflicts = useCallback(() => {
    setConflicts([]);
  }, []);

  return {
    conflicts,
    isChecking,
    checkForConflicts,
    clearConflicts,
  };
};
