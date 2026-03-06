import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CursorPosition } from '@/shared/hooks/useCursorTracking';

interface CursorIndicatorProps {
  cursor: CursorPosition;
}

export const CursorIndicator: React.FC<CursorIndicatorProps> = ({ cursor }) => {
  const [isVisible, setIsVisible] = useState(true);

  // Hide cursor if it hasn't moved in 3 seconds
  useEffect(() => {
    setIsVisible(true);
    const timeout = setTimeout(() => {
      const timeSinceUpdate = Date.now() - cursor.timestamp.getTime();
      if (timeSinceUpdate > 3000) {
        setIsVisible(false);
      }
    }, 3000);

    return () => clearTimeout(timeout);
  }, [cursor.timestamp]);

  // Generate a consistent color for each user
  const getUserColor = (userId: string) => {
    const colors = [
      'hsl(var(--chart-1))',
      'hsl(var(--chart-2))',
      'hsl(var(--chart-3))',
      'hsl(var(--chart-4))',
      'hsl(var(--chart-5))',
    ];
    const index = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[index % colors.length];
  };

  const color = getUserColor(cursor.userId);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          style={{
            position: 'absolute',
            left: `${cursor.x}%`,
            top: `${cursor.y}%`,
            pointerEvents: 'none',
            zIndex: 9999,
          }}
          className="flex flex-col items-start gap-1"
        >
          {/* Cursor pointer */}
          <motion.svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            animate={{
              scale: cursor.isClicking ? 0.8 : 1,
            }}
            transition={{ duration: 0.1 }}
          >
            <path
              d="M5.65376 12.3673L8.97026 15.6838L15.6316 9.02248L12.3152 5.70598L5.65376 12.3673Z"
              fill={color}
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M12.3152 5.70598L17.1417 10.5325L12.3152 5.70598Z"
              fill={color}
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M8.97026 15.6838L12.3152 19.0287L15.6316 15.7122L12.3152 12.3957L8.97026 15.6838Z"
              fill={color}
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </motion.svg>

          {/* Click ripple effect */}
          {cursor.isClicking && (
            <motion.div
              initial={{ scale: 0.5, opacity: 0.8 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{ duration: 0.5 }}
              style={{
                position: 'absolute',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                border: `2px solid ${color}`,
                left: '-4px',
                top: '-4px',
              }}
            />
          )}

          {/* User name label */}
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs font-medium px-2 py-1 rounded shadow-lg whitespace-nowrap"
            style={{
              backgroundColor: color,
              color: 'white',
            }}
          >
            {cursor.userName}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

interface CursorOverlayProps {
  cursors: CursorPosition[];
}

export const CursorOverlay: React.FC<CursorOverlayProps> = ({ cursors }) => {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      {cursors.map((cursor) => (
        <CursorIndicator key={cursor.userId} cursor={cursor} />
      ))}
    </div>
  );
};
