// @ts-nocheck
/**
 * Message List Component
 * Displays messages in a conversation with scrollable container
 */

import { useEffect, useRef } from 'react';
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar';
import { MessageData } from '@/shared/types/websocket';
import { cn } from '@/shared/lib/utils';
import { format, isSameDay } from 'date-fns';
import { Loader2 } from 'lucide-react';

interface MessageListProps {
  messages: MessageData[];
  currentUserEmail?: string;
  className?: string;
  hideSystemMessages?: boolean;
  isLoading?: boolean;
  viewerType?: 'HR' | 'CANDIDATE';
}

const ROLE_LABELS: Record<MessageData['senderType'], string> = {
  EMPLOYER: 'Company Member',
  CONSULTANT: 'Consultant/360',
  CANDIDATE: 'Candidate',
  SYSTEM: 'System',
};

const ROLE_STYLES: Record<
  MessageData['senderType'],
  {
    avatar: string;
    bubble: string;
    label: string;
  }
> = {
  EMPLOYER: {
    avatar: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
    bubble: 'bg-amber-500 text-white',
    label: 'text-amber-700 dark:text-amber-300',
  },
  CONSULTANT: {
    avatar: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
    bubble: 'bg-emerald-500 text-white',
    label: 'text-emerald-700 dark:text-emerald-300',
  },
  CANDIDATE: {
    avatar: 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300',
    bubble: 'bg-blue-500 text-white',
    label: 'text-blue-700 dark:text-blue-300',
  },
  SYSTEM: {
    avatar: 'bg-muted text-muted-foreground',
    bubble: 'bg-muted text-foreground',
    label: 'text-muted-foreground',
  },
};

const normalizeEmail = (value?: string) => (value || '').trim().toLowerCase();

const nameFromEmail = (email?: string) => {
  const localPart = (email || '').split('@')[0].trim();
  if (!localPart) return 'Unknown User';

  return localPart
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

const initialsFromName = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '??';

const getMessageIdentity = (message: MessageData) =>
  `${message.senderId || ''}:${normalizeEmail(message.senderEmail)}:${message.senderType}`;

export function MessageList({
  messages,
  currentUserEmail,
  className,
  hideSystemMessages = false,
  isLoading = false,
  viewerType = 'HR',
}: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (isLoading) {
    return (
      <div
        className={cn(
          'flex h-full flex-col items-center justify-center p-8 text-muted-foreground',
          className
        )}
      >
        <Loader2 className="mb-4 h-8 w-8 animate-spin" />
        <p className="text-sm">Loading messages...</p>
      </div>
    );
  }

  const filteredMessages = hideSystemMessages
    ? messages.filter((message) => message.senderType !== 'SYSTEM')
    : messages;

  if (filteredMessages.length === 0) {
    return (
      <div
        className={cn(
          'flex h-full flex-col items-center justify-center p-8 text-muted-foreground',
          className
        )}
      >
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/50">
          <span className="text-2xl">👋</span>
        </div>
        <p className="font-medium text-foreground">No messages yet</p>
        <p className="mt-1 text-sm">Start the conversation by sending a message below.</p>
      </div>
    );
  }

  const groupedMessages: { date: Date; msgs: MessageData[] }[] = [];
  filteredMessages.forEach((message) => {
    const date = new Date(message.createdAt);
    if (Number.isNaN(date.getTime())) return;

    if (groupedMessages.length === 0) {
      groupedMessages.push({ date, msgs: [message] });
      return;
    }

    const lastGroup = groupedMessages[groupedMessages.length - 1];
    if (isSameDay(lastGroup.date, date)) {
      lastGroup.msgs.push(message);
      return;
    }

    groupedMessages.push({ date, msgs: [message] });
  });

  const isOwnMessage = (message: MessageData): boolean => {
    const currentEmail = normalizeEmail(currentUserEmail);
    const senderEmail = normalizeEmail(message.senderEmail);

    if (currentEmail && senderEmail) {
      return currentEmail === senderEmail;
    }

    if (typeof message.isOwn === 'boolean') {
      return message.isOwn;
    }

    if (viewerType === 'HR') {
      return message.senderType !== 'CANDIDATE' && message.senderType !== 'SYSTEM';
    }

    return message.senderType === 'CANDIDATE';
  };

  const getSenderDisplayName = (message: MessageData, isOwn: boolean): string => {
    if (isOwn) return 'You';
    return message.senderDisplayName?.trim() || nameFromEmail(message.senderEmail);
  };

  const getSenderRoleLabel = (message: MessageData): string =>
    message.senderRoleLabel?.trim() || ROLE_LABELS[message.senderType] || 'Participant';

  const formatTimestamp = (value?: string): string => {
    try {
      return value && !Number.isNaN(new Date(value).getTime())
        ? format(new Date(value), 'h:mm a')
        : 'Just now';
    } catch {
      return 'Just now';
    }
  };

  return (
    <div className={cn('flex-1 space-y-6 overflow-y-auto px-4 py-4', className)} ref={scrollRef}>
      {groupedMessages.map((group, groupIndex) => (
        <div key={groupIndex} className="space-y-4">
          <div className="sticky top-0 z-10 flex justify-center py-2">
            <span className="rounded-full border bg-background/80 px-2 py-1 text-[10px] font-medium text-muted-foreground shadow-sm backdrop-blur-sm">
              {format(group.date, 'MMMM d, yyyy')}
            </span>
          </div>

          {group.msgs.map((message, index) => {
            const isOwn = isOwnMessage(message);
            const isSystem = message.senderType === 'SYSTEM';
            const previousMessage = group.msgs[index - 1];
            const isSequence =
              previousMessage && getMessageIdentity(previousMessage) === getMessageIdentity(message);
            const roleStyle = ROLE_STYLES[message.senderType] || ROLE_STYLES.SYSTEM;
            const senderDisplayName = getSenderDisplayName(message, isOwn);
            const senderRoleLabel = getSenderRoleLabel(message);
            const senderInitials = message.senderInitials || initialsFromName(
              message.senderDisplayName?.trim() || nameFromEmail(message.senderEmail)
            );

            if (isSystem) {
              return (
                <div key={message.id} className="flex items-center justify-center py-2">
                  <div className="max-w-md rounded-full border bg-muted/50 px-3 py-1.5 text-center text-[11px] text-muted-foreground">
                    {message.content}
                  </div>
                </div>
              );
            }

            return (
              <div
                key={message.id}
                className={cn(
                  'group flex gap-3',
                  isOwn ? 'flex-row-reverse' : 'flex-row',
                  isSequence ? 'mt-1' : 'mt-4'
                )}
              >
                {!isOwn && (
                  <Avatar
                    className={cn(
                      'h-8 w-8 shrink-0 border border-background shadow-sm',
                      isSequence && 'opacity-0'
                    )}
                  >
                    <AvatarFallback className={cn('text-[10px]', roleStyle.avatar)}>
                      {senderInitials}
                    </AvatarFallback>
                  </Avatar>
                )}

                <div
                  className={cn(
                    'flex max-w-[78%] flex-col gap-1',
                    isOwn ? 'items-end' : 'items-start'
                  )}
                >
                  {!isSequence && (
                    <div
                      className={cn(
                        'flex items-center gap-2 px-1',
                        isOwn && 'flex-row-reverse'
                      )}
                    >
                      <span className={cn('text-xs font-semibold', roleStyle.label)}>
                        {senderDisplayName}
                      </span>
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                        {senderRoleLabel}
                      </span>
                    </div>
                  )}

                  <div
                    className={cn(
                      'relative px-4 py-2.5 text-sm shadow-sm',
                      roleStyle.bubble,
                      isOwn ? 'rounded-2xl rounded-tr-sm' : 'rounded-2xl rounded-tl-sm',
                      isSequence && (isOwn ? 'rounded-tr-2xl' : 'rounded-tl-2xl')
                    )}
                  >
                    <p className="whitespace-pre-wrap break-words leading-relaxed">
                      {message.content}
                    </p>
                  </div>

                  <div className={cn('flex items-center gap-1.5 px-1', isOwn && 'flex-row-reverse')}>
                    <span className="text-[10px] text-muted-foreground">
                      {formatTimestamp(message.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
