/**
 * Consultant Messages Page
 * Messaging interface for consultants to communicate with candidates and companies
 * Used by both Consultant and Consultant 360 portals
 */

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useConsultantAuth } from '@/contexts/ConsultantAuthContext';
import { consultantService } from '@/shared/lib/consultant/consultantService';
import { Loader2, MessageSquare, Send, Search } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { Badge } from '@/shared/components/ui/badge';
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { cn } from '@/shared/lib/utils';

interface Conversation {
  id: string;
  participants: Array<{
    participantEmail?: string;
    participant_email?: string;
    displayName?: string;
    display_name?: string;
  }>;
  lastMessage?: { content: string; createdAt: string };
  messages?: Array<{ content: string; created_at: string }>;
  job?: { id: string; title: string };
  status: 'ACTIVE' | 'ARCHIVED' | 'CLOSED';
  createdAt?: string;
  updatedAt?: string;
}

interface Message {
  id: string;
  conversation_id?: string;
  conversationId?: string;
  sender_email?: string;
  senderEmail?: string;
  sender_type?: string;
  senderType?: 'CANDIDATE' | 'EMPLOYER' | 'CONSULTANT' | 'SYSTEM';
  content: string;
  created_at?: string;
  createdAt?: string;
  read_by?: string[];
  readBy?: string[];
}

export default function ConsultantMessagesPage() {
  const { consultant } = useConsultantAuth();
  const [searchParams] = useSearchParams();
  const conversationIdFromUrl = searchParams.get('conversationId');
  const [conversations, setConversations] = useState<Conversation[] | null>(null);
  const [messages, setMessages] = useState<Record<string, Message[]> | null>(null);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, []);

  // When URL has conversationId and conversations are loaded, auto-select it
  useEffect(() => {
    if (conversationIdFromUrl && conversations && conversations.length > 0) {
      const exists = conversations.some((c) => c.id === conversationIdFromUrl);
      if (exists) {
        setSelectedConversationId(conversationIdFromUrl);
      }
    }
  }, [conversationIdFromUrl, conversations]);

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
      const conversationsData = Array.isArray(response.data)
        ? response.data
        : response.data?.conversations;
      if (response.success && conversationsData && Array.isArray(conversationsData)) {
        setConversations(conversationsData);
      }
    } catch (error) {
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      setLoadingMessages(true);
      const response = await consultantService.getMessages(conversationId);
      const messagesData = Array.isArray(response.data)
        ? response.data
        : response.data?.messages;
      if (response.success && messagesData && Array.isArray(messagesData)) {
        setMessages(prev => ({
          ...prev,
          [conversationId]: messagesData
        }));
      }
    } catch (error) {
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
  const getMsgDate = (m: Message) => m.createdAt ?? m.created_at ?? '';
  const sortedMessages = currentMessages
    ? [...currentMessages].sort(
        (a, b) => new Date(getMsgDate(a)).getTime() - new Date(getMsgDate(b)).getTime()
      )
    : [];

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [sortedMessages.length]);

  const getParticipantDisplay = (p?: Conversation['participants'][number]) =>
    p?.displayName ?? p?.display_name ?? 'Unknown';
  const getParticipantEmail = (p?: Conversation['participants'][number]) =>
    p?.participantEmail ?? p?.participant_email ?? '';

  const filteredConversations = conversations?.filter((c) => {
    if (!searchQuery.trim()) return true;
    const other = c.participants.find((p) => getParticipantEmail(p) !== consultant?.email);
    const jobTitle = c.job?.title ?? '';
    const search = searchQuery.toLowerCase();
    return (
      getParticipantDisplay(other).toLowerCase().includes(search) ||
      getParticipantEmail(other).toLowerCase().includes(search) ||
      jobTitle.toLowerCase().includes(search)
    );
  }) ?? [];

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col">
      <header className="shrink-0 px-6 py-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <h1 className="text-xl font-semibold tracking-tight">Messages</h1>
        <p className="text-sm text-muted-foreground">Chat with candidates and companies</p>
      </header>

      <div className="flex-1 flex min-h-0">
        {/* Conversation List Sidebar */}
        <div className="w-80 shrink-0 border-r bg-muted/20 flex flex-col">
          <div className="p-3 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 bg-background"
              />
            </div>
          </div>
          {loading ? (
            <div className="flex items-center justify-center flex-1">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : !conversations || conversations.length === 0 ? (
            <div className="flex items-center justify-center flex-1 text-center p-6">
              <div>
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  <MessageSquare className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-foreground">No conversations yet</p>
                <p className="text-xs text-muted-foreground mt-1">Start when you're assigned to a job</p>
              </div>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="flex items-center justify-center flex-1 text-center p-4">
              <p className="text-sm text-muted-foreground">No matches for "{searchQuery}"</p>
            </div>
          ) : (
            <ScrollArea className="flex-1">
              <div className="p-2 space-y-1">
                {filteredConversations.map((conversation) => {
                  const otherParticipant = conversation.participants.find(
                    (p) => getParticipantEmail(p) !== consultant?.email
                  );
                  const displayName = getParticipantDisplay(otherParticipant);
                  const initials = displayName.split(/\s+/).map((n) => n[0]).join('').slice(0, 2).toUpperCase();
                  const lastMsg =
                    conversation.lastMessage?.content ??
                    conversation.messages?.[0]?.content ??
                    'No messages yet';
                  const lastTime =
                    conversation.lastMessage?.createdAt ?? conversation.messages?.[0]?.created_at;
                  const isSelected = conversation.id === selectedConversationId;

                  return (
                    <div
                      key={conversation.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => setSelectedConversationId(conversation.id)}
                      onKeyDown={(e) => e.key === 'Enter' && setSelectedConversationId(conversation.id)}
                      className={cn(
                        'flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors text-left outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                        isSelected ? 'bg-primary/10 border border-primary/30' : 'hover:bg-muted/70'
                      )}
                    >
                      <Avatar className="h-10 w-10 shrink-0">
                        <AvatarFallback className="text-xs font-medium bg-primary/10 text-primary">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-medium text-sm truncate">{displayName}</span>
                          {lastTime && (
                            <span className="text-[10px] text-muted-foreground shrink-0">
                              {format(new Date(lastTime), 'MMM d')}
                            </span>
                          )}
                        </div>
                        {conversation.job && (
                          <p className="text-xs text-muted-foreground truncate mt-0.5">{conversation.job.title}</p>
                        )}
                        <p className="text-xs text-muted-foreground truncate mt-0.5">{lastMsg}</p>
                        {conversation.status !== 'ACTIVE' && (
                          <Badge variant="outline" className="mt-1.5 text-[10px] px-1.5 py-0">
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
        <div className="flex-1 flex flex-col min-w-0 bg-background">
          {selectedConversationId ? (
            <>
              {/* Chat Header */}
              <div className="shrink-0 h-16 border-b flex items-center gap-3 px-6 bg-background/95">
                <Avatar className="h-10 w-10 shrink-0">
                  <AvatarFallback className="text-sm font-medium bg-primary/10 text-primary">
                    {(
                      getParticipantDisplay(
                        currentConversation?.participants.find(
                          (p) => getParticipantEmail(p) !== consultant?.email
                        )
                      ) ?? '?'
                    )
                      .split(/\s+/)
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h2 className="font-semibold truncate">
                    {getParticipantDisplay(
                      currentConversation?.participants.find(
                        (p) => getParticipantEmail(p) !== consultant?.email
                      )
                    ) || 'Chat'}
                  </h2>
                  {currentConversation?.job && (
                    <p className="text-xs text-muted-foreground truncate">{currentConversation.job.title}</p>
                  )}
                </div>
              </div>

              {/* Messages */}
              {loadingMessages ? (
                <div className="flex-1 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <ScrollArea className="flex-1">
                  <div className="p-6 space-y-3">
                    {sortedMessages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                          <Send className="h-7 w-7 text-muted-foreground" />
                        </div>
                        <p className="text-sm font-medium text-foreground">No messages yet</p>
                        <p className="text-xs text-muted-foreground mt-1">Start the conversation below</p>
                      </div>
                    ) : (
                      sortedMessages.map((message) => {
                        const senderEmail = message.senderEmail ?? message.sender_email ?? '';
                        const isSender = senderEmail === consultant?.email;
                        const senderType = message.senderType ?? message.sender_type ?? '';
                        const isSystemMessage = senderType === 'SYSTEM';

                        return (
                          <div
                            key={message.id}
                            className={cn('flex', isSender ? 'justify-end' : 'justify-start')}
                          >
                            <div
                              className={cn(
                                'max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm',
                                isSystemMessage &&
                                  'mx-auto bg-muted/80 text-muted-foreground text-sm italic text-center',
                                !isSystemMessage &&
                                  isSender &&
                                  'bg-primary text-primary-foreground rounded-br-md',
                                !isSystemMessage &&
                                  !isSender &&
                                  'bg-muted rounded-bl-md'
                              )}
                            >
                              <p className="text-sm break-words whitespace-pre-wrap">{message.content}</p>
                              <span
                                className={cn(
                                  'text-[10px] mt-1 block',
                                  isSender ? 'text-primary-foreground/70' : 'text-muted-foreground'
                                )}
                              >
                                {format(new Date(getMsgDate(message)), 'p')}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
              )}

              {/* Message Input */}
              {currentConversation?.status === 'ACTIVE' ? (
                <form
                  onSubmit={sendMessage}
                  className="shrink-0 p-4 border-t bg-background flex gap-2 items-center"
                >
                  <Input
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="Type a message..."
                    disabled={sendingMessage}
                    className="flex-1 min-w-0"
                  />
                  <Button
                    type="submit"
                    disabled={sendingMessage || !messageInput.trim()}
                    size="icon"
                    className="shrink-0 h-10 w-10"
                  >
                    {sendingMessage ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </form>
              ) : (
                <div className="shrink-0 p-4 border-t bg-muted/50 text-center text-sm text-muted-foreground">
                  This conversation is {currentConversation?.status.toLowerCase()}
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-center p-10 bg-muted/20">
              <div className="max-w-sm">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
                  <MessageSquare className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-1">Select a conversation</h3>
                <p className="text-sm text-muted-foreground">Choose a conversation from the list to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
