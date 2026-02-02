import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Card } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import type { InterviewTranscript } from "@/types/aiReferenceCheck";
import { Clock } from "lucide-react";

interface TranscriptViewerProps {
  transcript: InterviewTranscript;
}

export function TranscriptViewer({ transcript }: TranscriptViewerProps) {
  const formatTimestamp = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="h-full">
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold text-foreground">Interview Transcript</h3>
        <p className="text-sm text-muted-foreground mt-1">
          {transcript.turns.length} conversation turns
        </p>
      </div>
      
      <ScrollArea className="h-[calc(100%-80px)]">
        <div className="p-4 space-y-4">
          {transcript.turns.map((turn) => (
            <div
              key={turn.id}
              className={`space-y-2 ${
                turn.speaker === 'ai-recruiter' 
                  ? 'bg-blue-50 dark:bg-blue-950/20' 
                  : 'bg-muted'
              } p-3 rounded-lg`}
            >
              <div className="flex items-center justify-between gap-2">
                <Badge 
                  variant={turn.speaker === 'ai-recruiter' ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {turn.speaker === 'ai-recruiter' ? 'AI Recruiter' : 'Referee'}
                </Badge>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {formatTimestamp(turn.timestamp)}
                </div>
              </div>
              <p className="text-sm text-foreground leading-relaxed">
                {turn.text}
              </p>
              {turn.confidence && (
                <div className="text-xs text-muted-foreground">
                  Confidence: {Math.round(turn.confidence * 100)}%
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
}
