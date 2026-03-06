import { Card } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Bot, MessageSquare } from 'lucide-react';

interface CurrentQuestionDisplayProps {
  currentQuestion: string;
  questionNumber: number;
  totalQuestions: number;
  isAISpeaking: boolean;
}

export function CurrentQuestionDisplay({
  currentQuestion,
  questionNumber,
  totalQuestions,
  isAISpeaking
}: CurrentQuestionDisplayProps) {
  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
              isAISpeaking ? 'bg-primary animate-pulse' : 'bg-muted'
            }`}>
              <Bot className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium">AI Recruiter</p>
              <p className="text-xs text-muted-foreground">
                {isAISpeaking ? 'Speaking...' : 'Listening'}
              </p>
            </div>
          </div>
          <Badge variant="secondary">
            Question {questionNumber}/{totalQuestions}
          </Badge>
        </div>

        <div className="min-h-[100px] flex items-center">
          {currentQuestion ? (
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <MessageSquare className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                <p className="text-lg leading-relaxed">{currentQuestion}</p>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground text-center w-full">
              Waiting for AI recruiter to begin...
            </p>
          )}
        </div>

        <div className="pt-4 border-t">
          <p className="text-xs text-muted-foreground text-center">
            Speak naturally. The AI will listen and respond when you finish.
          </p>
        </div>
      </div>
    </Card>
  );
}
