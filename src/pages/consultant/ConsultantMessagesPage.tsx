/**
 * Consultant Messages Page
 * Messaging interface for consultants to communicate with candidates
 */

import { useState, useEffect } from 'react';
import { useConsultantAuth } from '@/contexts/ConsultantAuthContext';
import { consultantService } from '@/shared/lib/consultant/consultantService';
import { Loader2, MessageSquare, Send } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { Badge } from '@/shared/components/ui/badge';
import { toast } from 'sonner';

interface Conversation {
  id: string;
  participants: Array<{ participantEmail: string; displayName: string }>;
  lastMessage?: { content: string; createdAt: string };
  job?: { id: string; title: string };
  status: 'ACTIVE' | 'ARCHIVED' | 'CLOSED';
  createdAt: string;
  updatedAt: string;
}

interface Message {
  id: string;
  conversationId: string;
  senderEmail: string;
  senderType: 'CANDIDATE' | 'EMPLOYER' | 'CONSULTANT' | 'SYSTEM';
  content: string;
  createdAt: string;
  readBy?: string[];
}

export default function ConsultantMessagesPage() {
  const { consultant } = useConsultantAuth();
  const [conversations, setConversations] = useState<Conversation[] | null>(null);
  const [messages, setMessages] = useState<Record<string, Message[]> | null>(null);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, []);

  // Load messages when conversation selected
  useEffect(() => {
    if (selectedConversationId) {
      loadMessages(selectedConversationId);
      markAsRead(selectedConversationId);
    }
  }, [selectedConversationId]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const response = await consultantService.getConversations();
      console.log('[MessagesPage] Conversations response:', response);

      // Handle both response formats
      const conversationsData = Array.isArray(response.data)
        ? response.data
        : response.data?.conversations;
      console.log('[MessagesPage] Conversations data:', conversationsData);

      if (response.success && conversationsData && Array.isArray(conversationsData)) {
        setConversations(conversationsData);
      }
    } catch (error) {
      console.error('[MessagesPage] Error loading conversations:', error);
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      setLoadingMessages(true);
      const response = await consultantService.getMessages(conversationId);
      console.log('[MessagesPage] Messages response:', response);

      // Handle both response formats
      const messagesData = Array.isArray(response.data)
        ? response.data
        : response.data?.messages;
      console.log('[MessagesPage] Messages data:', messagesData);

      if (response.success && messagesData && Array.isArray(messagesData)) {
        setMessages(prev => ({
          ...prev,
          [conversationId]: messagesData
        }));
      }
    } catch (error) {
      console.error('[MessagesPage] Error loading messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoadingMessages(false);
    }
  };

  const markAsRead = async (conversationId: string) => {
    try {
      await consultantService.markMessagesRead(conversationId);
    } catch (error) {
      console.error('[MessagesPage] Error marking as read:', error);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConversationId || !messageInput.trim()) return;

    try {
      setSendingMessage(true);
      const response = await consultantService.sendMessage(selectedConversationId, messageInput);
      console.log('[MessagesPage] Send message response:', response);

      if (response.success) {
        setMessageInput('');
        // Reload messages to include the new one
        await loadMessages(selectedConversationId);
        toast.success('Message sent');
      } else {
        toast.error('Failed to send message');
      }
    } catch (error) {
      console.error('[MessagesPage] Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  const currentConversation = conversations?.find(c => c.id === selectedConversationId) || null;
  const currentMessages = selectedConversationId && messages ? (messages[selectedConversationId] || []) : [];

  // Sort messages by date (oldest first)
  const sortedMessages = currentMessages ? [...currentMessages].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  ) : [];

  return (
    <div className="h-[calc(100vh-64px)] p-6 space-y-6 bg-gradient-to-b from-background via-background to-muted/40">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Messages</h1>
          <p className="text-muted-foreground">Chat with candidates</p>
        </div>
      </header>

      <div className="h-[calc(100vh-180px)] flex rounded-lg border bg-card shadow-sm overflow-hidden">
        {/* Conversation List Sidebar */}
        <div className="w-full md:w-1/3 lg:w-1/4 border-r bg-muted/20 flex flex-col">
          {loading ? (
            <div className="flex items-center justify-center flex-1">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : !conversations || conversations.length === 0 ? (
            <div className="flex items-center justify-center flex-1 text-center p-4">
              <div>
                <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No conversations yet</p>
              </div>
            </div>
          ) : (
            <ScrollArea className="flex-1">
              <div className="space-y-1 p-4">
                {(conversations || []).map(conversation => {
                  const otherParticipant = conversation.participants.find(
                    p => p.participantEmail !== consultant?.email
                  );
                  const lastMsg = conversation.lastMessage?.content || 'No messages';
                  const isSelected = conversation.id === selectedConversationId;

                  return (
                    <div
                      key={conversation.id}
                      onClick={() => setSelectedConversationId(conversation.id)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-primary/10 border border-primary'
                          : 'hover:bg-muted'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">
                            {otherParticipant?.displayName || 'Candidate'}
                          </p>
                          {conversation.job && (
                            <p className="text-xs text-muted-foreground truncate">
                              {conversation.job.title}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground truncate mt-1">
                            {lastMsg.substring(0, 40)}
                          </p>
                        </div>
                        {conversation.status !== 'ACTIVE' && (
                          <Badge variant="outline" className="text-xs">
                            {conversation.status}
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-muted/30">
          {selectedConversationId ? (
            <>
              {/* Header */}
              <div className="p-4 border-b bg-background/50 backdrop-blur-sm">
                <div>
                  <h2 className="font-semibold">
                    {currentConversation
                      ? currentConversation.participants.find(p => p.participantEmail !== consultant?.email)?.displayName
                      : 'Chat'}
                  </h2>
                  {currentConversation?.job && (
                    <p className="text-xs text-muted-foreground">
                      {currentConversation.job.title}
                    </p>
                  )}
                </div>
              </div>

              {/* Messages */}
              {loadingMessages ? (
                <div className="flex-1 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {sortedMessages.length === 0 ? (
                      <div className="text-center text-muted-foreground py-8">
                        No messages yet. Start the conversation!
                      </div>
                    ) : (
                      sortedMessages.map((message) => {
                        const isSender = message.senderEmail === consultant?.email;
                        const isSystemMessage = message.senderType === 'SYSTEM';

                        return (
                          <div
                            key={message.id}
                            className={`flex ${isSender ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-xs px-4 py-2 rounded-lg ${
                                isSystemMessage
                                  ? 'bg-muted text-muted-foreground text-sm italic text-center'
                                  : isSender
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-muted'
                              }`}
                            >
                              <p className="text-sm break-words">{message.content}</p>
                              <p className="text-xs opacity-70 mt-1">
                                {new Date(message.createdAt).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </ScrollArea>
              )}

              {/* Message Input */}
              {currentConversation?.status === 'ACTIVE' ? (
                <form onSubmit={sendMessage} className="p-4 border-t bg-background/50 backdrop-blur-sm flex gap-2">
                  <Input
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="Type a message..."
                    disabled={sendingMessage}
                    className="flex-1"
                  />
                  <Button
                    type="submit"
                    disabled={sendingMessage || !messageInput.trim()}
                    size="icon"
                  >
                    {sendingMessage ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </form>
              ) : (
                <div className="p-4 border-t bg-muted/50 text-center text-sm text-muted-foreground">
                  This conversation is {currentConversation?.status.toLowerCase()}
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-center p-10">
              <div className="max-w-md">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                  <MessageSquare className="h-7 w-7" />
                </div>
                <h3 className="text-lg font-medium mb-1">No conversation selected</h3>
                <p className="text-sm text-muted-foreground">
                  Select a conversation to start messaging
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
