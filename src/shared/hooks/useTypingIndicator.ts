import { useState, useEffect, useCallback, useRef } from 'react';

export interface TypingUser {
  userId: string;
  userName: string;
  section: 'ratings' | 'comments' | 'decision';
  timestamp: Date;
}

interface UseTypingIndicatorOptions {
  candidateId: string;
  currentUserId: string;
}

export const useTypingIndicator = ({
  candidateId,
  currentUserId: _currentUserId,
}: UseTypingIndicatorOptions) => {
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Simulate other users typing
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.8) {
        const mockTypingUser: TypingUser = {
          userId: `user-${Math.floor(Math.random() * 3) + 1}`,
          userName: ['Sarah Johnson', 'Mike Chen', 'Emily Davis'][Math.floor(Math.random() * 3)],
          section: (['ratings', 'comments', 'decision'] as const)[Math.floor(Math.random() * 3)],
          timestamp: new Date(),
        };

        setTypingUsers((prev) => {
          const filtered = prev.filter(u => u.userId !== mockTypingUser.userId);
          return [...filtered, mockTypingUser];
        });

        // Remove typing indicator after 3 seconds
        setTimeout(() => {
          setTypingUsers((prev) => prev.filter(u => u.userId !== mockTypingUser.userId));
        }, 3000);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [candidateId]);

  const startTyping = useCallback((section: 'ratings' | 'comments' | 'decision') => {
    // In real implementation, this would send to WebSocket
    console.log('User started typing in:', section);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      console.log('User stopped typing');
    }, 2000);
  }, []);

  const stopTyping = useCallback(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    console.log('User stopped typing');
  }, []);

  return {
    typingUsers,
    startTyping,
    stopTyping,
  };
};
