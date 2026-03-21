import { useEffect, useMemo, useState } from 'react';
import { apiClient } from '@/shared/lib/api';
import type {
  ConversationData,
  MessageData,
  WebSocketContextType,
  WSMessageType,
} from '@/shared/types/websocket';

type MessageStore = Record<string, MessageData[]>;

let messageStore: MessageStore = {};
const listeners = new Set<() => void>();

function notifyListeners() {
  listeners.forEach((listener) => listener());
}

function appendMessage(conversationId: string, message: MessageData) {
  const existing = messageStore[conversationId] || [];
  messageStore = {
    ...messageStore,
    [conversationId]: [...existing, message],
  };
  notifyListeners();
}

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function useWebSocket(): WebSocketContextType {
  const [, setVersion] = useState(0);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);

  useEffect(() => {
    const listener = () => setVersion((value) => value + 1);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return useMemo<WebSocketContextType>(
    () => ({
      connectionState: 'connected',
      isConnected: true,
      currentConversationId,
      onlineUsers: [],
      messages: messageStore,
      conversations: [],
      setConversations: (_conversations: ConversationData[]) => {
        // ATS components read this if a full websocket layer exists; consultant/admin uses REST-first loading.
      },
      addMessage: (conversationId: string, message: MessageData) => {
        appendMessage(conversationId, message);
      },
      joinConversation: (conversationId: string) => {
        setCurrentConversationId(conversationId);
      },
      leaveConversation: () => {
        setCurrentConversationId(null);
      },
      onMessage: () => () => {
        // No realtime channel in admin/staff yet; REST-backed screens still work.
      },
      sendMessage: async (type: WSMessageType, payload: unknown) => {
        if (type !== 'send_message') return;

        const data = payload as { conversationId?: string; content?: string };
        if (!data.conversationId || !data.content?.trim()) return;

        try {
          const response = await apiClient.post<MessageData>('/api/messaging/messages', {
            conversationId: data.conversationId,
            content: data.content.trim(),
            type: 'TEXT',
          });

          if (response.success && response.data) {
            appendMessage(data.conversationId, response.data);
          }
        } catch (error) {
          console.error('Failed to send message via messaging fallback:', error);
        }
      },
    }),
    [currentConversationId],
  );
}
