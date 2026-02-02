import { useEffect, useRef } from 'react';
import { Card } from '@/shared/components/ui/card';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { User, Bot } from 'lucide-react';

export interface TranscriptTurn {
  id: string;
  speaker: 'ai' | 'referee';
  text: string;
  timestamp: string;
}

interface TranscriptDisplayProps {
  turns: TranscriptTurn[];
}

export function TranscriptDisplay({ turns }: TranscriptDisplayProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-scroll to bottom when new turns are added
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [turns]);

  if (turns.length === 0) {
    return (
      <Card className="p-6 h-full flex items-center justify-center">
        <p className="text-sm text-muted-foreground text-center">
          Transcript will appear here as the conversation progresses...
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-4 h-full">
      <ScrollArea className="h-full pr-4" ref={scrollRef}>
        <div className="space-y-4">
          {turns.map((turn) => (
            <div
              key={turn.id}
              className={`flex gap-3 ${
                turn.speaker === 'ai' ? 'flex-row' : 'flex-row-reverse'
              }`}
            >
              <div
                className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
                  turn.speaker === 'ai'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground'
                }`}
              >
                {turn.speaker === 'ai' ? (
                  <Bot className="h-4 w-4" />
                ) : (
                  <User className="h-4 w-4" />
                )}
              </div>
              <div
                className={`flex-1 ${
                  turn.speaker === 'ai' ? 'text-left' : 'text-right'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-muted-foreground">
                    {turn.speaker === 'ai' ? 'AI Recruiter' : 'You'}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {turn.timestamp}
                  </span>
                </div>
                <div
                  className={`inline-block px-4 py-2 rounded-lg ${
                    turn.speaker === 'ai'
                      ? 'bg-muted text-foreground'
                      : 'bg-primary/10 text-foreground'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{turn.text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
}
