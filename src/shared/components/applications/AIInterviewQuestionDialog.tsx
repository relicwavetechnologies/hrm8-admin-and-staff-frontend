import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Separator } from '@/shared/components/ui/separator';
import { Copy, Download, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { useToast } from '@/shared/hooks/use-toast';
import type { AIInterviewQuestion } from '@/shared/lib/aiInterviewQuestions';
import { cn } from '@/shared/lib/utils';

interface AIInterviewQuestionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  questions: AIInterviewQuestion[];
  candidateName: string;
  jobTitle: string;
}

export function AIInterviewQuestionDialog({
  open,
  onOpenChange,
  questions,
  candidateName,
  jobTitle
}: AIInterviewQuestionDialogProps) {
  const { toast } = useToast();
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());

  const toggleExpanded = (questionId: string) => {
    setExpandedQuestions(prev => {
      const next = new Set(prev);
      if (next.has(questionId)) {
        next.delete(questionId);
      } else {
        next.add(questionId);
      }
      return next;
    });
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'technical': return 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20';
      case 'behavioral': return 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20';
      case 'situational': return 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20';
      case 'cultural': return 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20';
      case 'competency': return 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-500/20';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500/10 text-green-700 dark:text-green-400';
      case 'medium': return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400';
      case 'hard': return 'bg-red-500/10 text-red-700 dark:text-red-400';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const copyQuestion = (question: AIInterviewQuestion) => {
    const text = `${question.question}\n\nFollow-up: ${question.followUp || 'N/A'}\n\nFocus Area: ${question.focusArea}\nRationale: ${question.rationale}`;
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied to clipboard',
      description: 'Question copied successfully',
    });
  };

  const exportAllQuestions = () => {
    const text = `AI-Generated Interview Questions\n` +
      `Candidate: ${candidateName}\n` +
      `Position: ${jobTitle}\n` +
      `Generated: ${new Date().toLocaleDateString()}\n\n` +
      `${'='.repeat(60)}\n\n` +
      questions.map((q, idx) => 
        `Question ${idx + 1}: ${q.question}\n` +
        `Category: ${q.category.toUpperCase()} | Difficulty: ${q.difficulty.toUpperCase()} | Focus: ${q.focusArea}\n\n` +
        `Rationale: ${q.rationale}\n\n` +
        `Follow-up: ${q.followUp || 'N/A'}\n\n` +
        `${'-'.repeat(60)}\n\n`
      ).join('');
    
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `interview-questions-${candidateName.replace(/\s+/g, '-').toLowerCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: 'Questions exported',
      description: 'Interview questions downloaded successfully',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div>
              <DialogTitle>AI-Generated Interview Questions</DialogTitle>
              <DialogDescription>
                Custom questions for {candidateName} - {jobTitle}
              </DialogDescription>
            </div>
          </div>
          <div className="flex items-center gap-2 pt-2">
            <Badge variant="outline" className="text-xs">
              {questions.length} Questions Generated
            </Badge>
            <Button variant="outline" size="sm" onClick={exportAllQuestions}>
              <Download className="h-3 w-3 mr-1.5" />
              Export All
            </Button>
          </div>
        </DialogHeader>

        <Separator />

        <div className="space-y-3">
          {questions.map((question, idx) => {
            const isExpanded = expandedQuestions.has(question.id);
            
            return (
              <div 
                key={question.id} 
                className="border rounded-lg p-3 hover:shadow-sm transition-shadow bg-card"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-primary">Q{idx + 1}</span>
                      <Badge className={cn("text-xs", getCategoryColor(question.category))}>
                        {question.category}
                      </Badge>
                      <Badge className={cn("text-xs", getDifficultyColor(question.difficulty))}>
                        {question.difficulty}
                      </Badge>
                    </div>
                    
                    <p className="text-sm font-medium leading-relaxed">{question.question}</p>
                    
                    {isExpanded && (
                      <>
                        {question.followUp && (
                          <div className="pl-3 border-l-2 border-muted">
                            <p className="text-xs text-muted-foreground font-medium mb-1">Follow-up:</p>
                            <p className="text-xs text-foreground">{question.followUp}</p>
                          </div>
                        )}
                        
                        <div className="space-y-1.5 text-xs pt-2">
                          <div className="flex gap-2">
                            <span className="text-muted-foreground font-medium min-w-[70px]">Focus:</span>
                            <span className="text-foreground">{question.focusArea}</span>
                          </div>
                          <div className="flex gap-2">
                            <span className="text-muted-foreground font-medium min-w-[70px]">Rationale:</span>
                            <span className="text-muted-foreground">{question.rationale}</span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => toggleExpanded(question.id)}
                    >
                      {isExpanded ? (
                        <ChevronUp className="h-3.5 w-3.5" />
                      ) : (
                        <ChevronDown className="h-3.5 w-3.5" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => copyQuestion(question)}
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
