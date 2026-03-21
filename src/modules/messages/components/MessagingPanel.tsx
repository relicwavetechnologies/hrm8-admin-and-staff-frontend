// @ts-nocheck
import { useState, useEffect } from 'react';
import { useWebSocket } from '@/app/providers/WebSocketContext';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { messagingService } from '@/shared/services/messagingService';
import { Loader2 } from 'lucide-react';
import { ConversationData, MessageData } from '@/shared/types/websocket';
import { cn } from '@/shared/lib/utils';

interface MessagingPanelProps {
    conversationId: string;
    className?: string;
    currentUserEmail?: string; // For distinguishing own messages
    title?: string;
    viewerType?: 'HR' | 'CANDIDATE';
}

export function MessagingPanel({
    conversationId,
    className,
    currentUserEmail,
    title,
    viewerType = 'HR'
}: MessagingPanelProps) {
    const { messages, joinConversation, leaveConversation, isConnected } = useWebSocket();
    const [loading, setLoading] = useState(false);
    const [localMessages, setLocalMessages] = useState<MessageData[]>([]);

    useEffect(() => {
        let mounted = true;

        const loadMessages = async () => {
            if (!conversationId) return;

            setLoading(true);
            try {
                // Use different endpoint based on viewer type
                const response = viewerType === 'HR'
                    ? await messagingService.getAdminMessages(conversationId)
                    : await messagingService.getMessages(conversationId);
                if (mounted && response.success && response.data) {
                    setLocalMessages(response.data);
                }
            } catch (error) {
                console.error('Failed to load messages:', error);
            } finally {
                if (mounted) setLoading(false);
            }
        };

        loadMessages();
        joinConversation(conversationId);

        return () => {
            mounted = false;
            leaveConversation();
        };
    }, [conversationId, joinConversation, leaveConversation]);

    // Combine initial loaded messages with realtime updates
    const conversationMessages = messages[conversationId] || localMessages;
    // If realtime messages are empty but we have local messages, use local. 
    // Wait, messages[conversationId] in context might be updated by 'messages_loaded' event too or 'new_message'.
    // If we rely on context messages, we should initialize context messages with loaded ones or let websocket handle loading completely.
    // The current WebSocketProvider handles 'messages_loaded' event.
    // BUT the REST API `getMessages` is faster for initial paint.
    // Optimization: Merge unique messages.

    const displayMessages = conversationMessages.length > 0 ? conversationMessages : localMessages;

    return (
        <Card className={cn("flex flex-col h-full overflow-hidden border-none shadow-none", className)}>
            {title && (
                <CardHeader className="px-4 py-3 border-b shrink-0">
                    <CardTitle className="text-base font-medium">{title}</CardTitle>
                </CardHeader>
            )}

            <CardContent className="flex-1 overflow-hidden p-0 flex flex-col relative h-[500px]">
                {/* h-[500px] is arbitrary default, parent should control height */}

                <MessageList
                    messages={displayMessages}
                    currentUserEmail={currentUserEmail}
                    isLoading={loading && displayMessages.length === 0}
                    viewerType={viewerType}
                    className="flex-1"
                />

                <MessageInput
                    conversationId={conversationId}
                    className="shrink-0"
                />

            </CardContent>
        </Card>
    );
}
