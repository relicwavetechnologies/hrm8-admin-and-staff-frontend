import { useState, useEffect, useCallback, useRef } from 'react';

export interface CursorPosition {
  userId: string;
  userName: string;
  x: number;
  y: number;
  isClicking: boolean;
  timestamp: Date;
}

interface UseCursorTrackingOptions {
  applicationId: string;
  currentUserId: string;
  enabled: boolean;
}

export const useCursorTracking = ({
  applicationId,
  currentUserId,
  enabled,
}: UseCursorTrackingOptions) => {
  const [cursors, setCursors] = useState<CursorPosition[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Simulate other users' cursors
  useEffect(() => {
    if (!enabled) return;

    const mockUsers = [
      { userId: 'user-1', userName: 'Sarah Johnson' },
      { userId: 'user-2', userName: 'Mike Chen' },
    ];

    // Simulate random cursor movements
    const interval = setInterval(() => {
      setCursors((prev) => {
        const newCursors = mockUsers.map((user) => {
          const existing = prev.find((c) => c.userId === user.userId);
          
          // Random movement or initialize
          const x = existing
            ? Math.max(0, Math.min(100, existing.x + (Math.random() - 0.5) * 10))
            : Math.random() * 80 + 10;
          const y = existing
            ? Math.max(0, Math.min(100, existing.y + (Math.random() - 0.5) * 10))
            : Math.random() * 80 + 10;

          return {
            userId: user.userId,
            userName: user.userName,
            x,
            y,
            isClicking: Math.random() > 0.95,
            timestamp: new Date(),
          };
        });

        return newCursors;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [enabled, applicationId]);

  // Track local cursor (in real implementation, this would broadcast to others)
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!enabled || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      // In real implementation, broadcast cursor position
      console.log('Local cursor position:', { x, y });
    },
    [enabled]
  );

  const handleClick = useCallback(() => {
    if (!enabled) return;
    // In real implementation, broadcast click event
    console.log('Local cursor click');
  }, [enabled]);

  useEffect(() => {
    if (!enabled || !containerRef.current) return;

    const container = containerRef.current;
    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('click', handleClick);

    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('click', handleClick);
    };
  }, [enabled, handleMouseMove, handleClick]);

  return {
    cursors,
    containerRef,
  };
};
