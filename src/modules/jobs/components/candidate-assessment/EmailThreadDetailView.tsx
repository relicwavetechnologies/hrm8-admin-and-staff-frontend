// @ts-nocheck
import { SafeHtml } from '@/shared/components/SafeHtml';
import { Button } from '@/shared/components/ui/button';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { Badge } from '@/shared/components/ui/badge';
import { Card } from '@/shared/components/ui/card';
import { ArrowLeft, Reply, Mail, Plus } from 'lucide-react';
import { GmailThread, GmailMessage } from '@/shared/lib/gmailThreadService';
import { formatDistanceToNow } from 'date-fns';

interface EmailThreadDetailViewProps {
  thread: GmailThread;
  onBack: () => void;
  onReply: (message: GmailMessage) => void;
  onCompose: () => void;
  showReplyButton?: boolean;
}

export function EmailThreadDetailView({
  thread,
  onBack,
  onReply,
  onCompose,
  showReplyButton = true,
}: EmailThreadDetailViewProps) {
  const lastInboundMessage = thread.messages
    .filter(msg => msg.isInbound)
    .pop();

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="px-3 py-2 border-b bg-muted/20 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={onBack}
            >
              <ArrowLeft className="h-3.5 w-3.5" />
            </Button>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold truncate">{thread.subject}</h2>
              <Badge variant="secondary" className="h-4 text-[10px] flex-shrink-0">
                {thread.messageCount}
              </Badge>
            </div>
          </div>
          <Button variant="outline" size="sm" className="h-7 px-2 text-xs gap-1" onClick={onCompose}>
            <Plus className="h-3.5 w-3.5" />
            Compose
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1">
        <div className="p-2.5 space-y-1.5">
          {thread.messages.map((message) => (
              <Card
                key={message.id}
                className={`p-2.5 border-border/80 shadow-none ${message.isInbound ? "mr-6 bg-muted/30" : "ml-6 bg-primary/[0.04]"}`}
              >
                <div className={`flex items-start justify-between mb-1.5 ${message.isInbound ? "" : "flex-row-reverse"}`}>
                  <div>
                    <p className="text-xs font-medium text-foreground">{message.from}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {formatDistanceToNow(new Date(message.date), { addSuffix: true })}
                    </p>
                  </div>
                  <Badge variant={message.isInbound ? "secondary" : "default"} className="h-4 text-[10px]">
                    {message.isInbound ? "Received" : "Sent"}
                  </Badge>
                </div>

                <SafeHtml
                  html={message.body || ''}
                  config="email"
                  className="mt-1 text-xs text-foreground leading-relaxed prose prose-sm dark:prose-invert max-w-none"
                />
              </Card>
            ))}
        </div>
      </ScrollArea>

      {/* Footer */}
      {showReplyButton && lastInboundMessage && (
        <div className="p-2.5 border-t bg-muted/20 flex-shrink-0">
          <Button
            size="sm"
            className="w-full gap-2 h-8 text-xs"
            onClick={() => onReply(lastInboundMessage)}
          >
            <Reply className="h-3.5 w-3.5" />
            Reply to Last Message
          </Button>
        </div>
      )}
      {thread.messages.length === 0 && (
        <div className="p-3 border-t bg-muted/20 flex-shrink-0 text-center text-xs text-muted-foreground">
          No emails sent to candidate yet
        </div>
      )}
    </div>
  );
}
