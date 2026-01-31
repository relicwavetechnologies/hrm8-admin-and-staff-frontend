import { useState, useEffect, useCallback, useRef } from 'react';

export interface EditorCursor {
  userId: string;
  userName: string;
  userColor: string;
  position: number;
  selection?: {
    start: number;
    end: number;
  };
}

export interface CollaborativeUser {
  userId: string;
  userName: string;
  userColor: string;
  isTyping: boolean;
  cursor: EditorCursor;
}

interface UseCollaborativeEditorOptions {
  documentId: string;
  currentUserId: string;
  currentUserName: string;
  onContentChange?: (content: string) => void;
}

export const useCollaborativeEditor = ({
  documentId: _documentId,
  currentUserId,
  currentUserName: _currentUserName,
  onContentChange,
}: UseCollaborativeEditorOptions) => {
  const [content, setContent] = useState('');
  const [activeUsers, setActiveUsers] = useState<CollaborativeUser[]>([]);
  const [cursors, setCursors] = useState<EditorCursor[]>([]);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const userColors = [
    '#3b82f6', // blue
    '#10b981', // green
    '#f59e0b', // amber
    '#ef4444', // red
    '#8b5cf6', // violet
    '#ec4899', // pink
  ];

  // Simulate other users editing
  useEffect(() => {
    const mockUsers: CollaborativeUser[] = [
      {
        userId: 'user-1',
        userName: 'Sarah Johnson',
        userColor: userColors[0],
        isTyping: false,
        cursor: {
          userId: 'user-1',
          userName: 'Sarah Johnson',
          userColor: userColors[0],
          position: 0,
        },
      },
      {
        userId: 'user-2',
        userName: 'Mike Chen',
        userColor: userColors[1],
        isTyping: false,
        cursor: {
          userId: 'user-2',
          userName: 'Mike Chen',
          userColor: userColors[1],
          position: 0,
        },
      },
    ];

    setActiveUsers(mockUsers);

    // Simulate cursor movements and typing
    const interval = setInterval(() => {
      if (Math.random() > 0.5) {
        const randomUser = mockUsers[Math.floor(Math.random() * mockUsers.length)];
        const maxPosition = content.length || 100;
        const newPosition = Math.floor(Math.random() * maxPosition);

        setCursors((prev) => {
          const filtered = prev.filter((c) => c.userId !== randomUser.userId);
          return [
            ...filtered,
            {
              ...randomUser.cursor,
              position: newPosition,
            },
          ];
        });

        // Simulate typing indicator
        setActiveUsers((prev) =>
          prev.map((user) =>
            user.userId === randomUser.userId
              ? { ...user, isTyping: Math.random() > 0.7 }
              : user
          )
        );
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [content.length]);

  const updateContent = useCallback(
    (newContent: string) => {
      setContent(newContent);
      onContentChange?.(newContent);
    },
    [onContentChange]
  );

  const updateCursorPosition = useCallback(
    (position: number, selection?: { start: number; end: number }) => {
      // In a real implementation, this would broadcast to other users
      console.log('Cursor updated:', { position, selection });

      // Clear typing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Set new timeout
      typingTimeoutRef.current = setTimeout(() => {
        console.log('User stopped typing');
      }, 1000);
    },
    []
  );

  const getActiveCursors = useCallback(() => {
    return cursors.filter((cursor) => cursor.userId !== currentUserId);
  }, [cursors, currentUserId]);

  return {
    content,
    updateContent,
    activeUsers: activeUsers.filter((u) => u.userId !== currentUserId),
    cursors: getActiveCursors(),
    updateCursorPosition,
  };
};
