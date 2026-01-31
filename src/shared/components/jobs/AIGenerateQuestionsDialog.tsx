/**
 * AI Generate Questions Dialog
 * Dialog for generating application form questions using AI
 */

import { useState } from 'react';
import { ApplicationQuestion } from '@/shared/types/applicationForm';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,

} from '@/shared/components/ui/sheet';
import { Button } from '@/shared/components/ui/button';
import { Textarea } from '@/shared/components/ui/textarea';
import { Label } from '@/shared/components/ui/label';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Sparkles, Loader2 } from 'lucide-react';
import { questionService } from '@/shared/lib/api/questionService';
import { useToast } from '@/shared/hooks/use-toast';
import { questionTypeLabels, questionTypeIcons } from '@/shared/lib/applicationFormUtils';

interface AIGenerateQuestionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onQuestionsSelected: (questions: ApplicationQuestion[]) => void;
  jobId: string;
  jobTitle: string;
  jobDescription: string;
  requirements: string[];
  responsibilities: string[];
}

export function AIGenerateQuestionsDialog({
  open,
  onOpenChange,
  onQuestionsSelected,
  jobId,
  jobTitle,
  jobDescription,
  requirements,
  responsibilities,
}: AIGenerateQuestionsDialogProps) {
  const [userNotes, setUserNotes] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<ApplicationQuestion[]>([]);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<Set<string>>(new Set());
  const [questionsGenerated, setQuestionsGenerated] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const { toast } = useToast();

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGeneratedQuestions([]);
    setSelectedQuestionIds(new Set());

    try {
      // Prepare job data if jobId is not available
      const requestData: any = {
        userNotes: userNotes.trim() || undefined,
        questionCount: 2, // Generate only 2 questions initially
      };

      // If no jobId, include job data in request
      if (!jobId) {
        requestData.jobData = {
          title: jobTitle,
          description: jobDescription,
          requirements,
          responsibilities,
        };
      }

      const questions = await questionService.generateQuestions(jobId || 'new', requestData);

      // Add IDs and order to questions
      const questionsWithIds = questions.map((q, index) => ({
        ...q,
        id: `generated-${Date.now()}-${index}`,
        order: index + 1,
      }));

      setGeneratedQuestions(questionsWithIds);
      setQuestionsGenerated(6); // Show that 6 more questions can be generated
      setCurrentQuestionIndex(0); // Start with first question
      // Select first question by default
      setSelectedQuestionIds(new Set([questionsWithIds[0]?.id].filter(Boolean)));
    } catch (error) {
      console.error('Failed to generate questions:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to generate questions',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleToggleQuestion = (questionId: string) => {
    const newSelected = new Set(selectedQuestionIds);
    if (newSelected.has(questionId)) {
      newSelected.delete(questionId);
    } else {
      newSelected.add(questionId);
    }
    setSelectedQuestionIds(newSelected);
  };

  const handleAddSelected = () => {
    const selectedQuestions = generatedQuestions.filter((q) => selectedQuestionIds.has(q.id));

    if (selectedQuestions.length === 0) {
      toast({
        title: 'No Questions Selected',
        description: 'Please select at least one question to add',
        variant: 'destructive',
      });
      return;
    }

    onQuestionsSelected(selectedQuestions);
    toast({
      title: 'Questions Added',
      description: `Added ${selectedQuestions.length} question${selectedQuestions.length > 1 ? 's' : ''} to your form`,
    });

    // Reset and close
    setGeneratedQuestions([]);
    setSelectedQuestionIds(new Set());
    setUserNotes('');
    onOpenChange(false);
  };

  const handleLoadMore = async () => {
    if (!jobTitle || !jobDescription) return;

    setIsLoadingMore(true);

    try {
      const requestData: any = {
        userNotes: userNotes.trim() || undefined,
        questionCount: 6, // Generate 6 more questions
      };

      if (!jobId) {
        requestData.jobData = {
          title: jobTitle,
          description: jobDescription,
          requirements,
          responsibilities,
        };
      }

      const newQuestions = await questionService.generateQuestions(jobId || 'new', requestData);

      // Add IDs and order to new questions
      const startIndex = generatedQuestions.length;
      const newQuestionsWithIds = newQuestions.map((q, index) => ({
        ...q,
        id: `generated-${Date.now()}-${startIndex + index}`,
        order: startIndex + index + 1,
      }));

      const allQuestions = [...generatedQuestions, ...newQuestionsWithIds];
      setGeneratedQuestions(allQuestions);
      // Auto-select first new question if no questions were selected
      if (selectedQuestionIds.size === 0 && newQuestionsWithIds.length > 0) {
        setSelectedQuestionIds(new Set([newQuestionsWithIds[0].id]));
        setCurrentQuestionIndex(generatedQuestions.length);
      } else {
        // Keep existing selection
        const newSelected = new Set(selectedQuestionIds);
        newQuestionsWithIds.forEach((q) => newSelected.add(q.id));
        setSelectedQuestionIds(newSelected);
      }
      setQuestionsGenerated(0); // Reset counter after loading more
    } catch (error) {
      console.error('Failed to load more questions:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load more questions',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleClose = () => {
    setGeneratedQuestions([]);
    setSelectedQuestionIds(new Set());
    setUserNotes('');
    setQuestionsGenerated(0);
    setCurrentQuestionIndex(0);
    onOpenChange(false);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < generatedQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const currentQuestion = generatedQuestions[currentQuestionIndex];

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Generate Questions with AI
          </SheetTitle>
          <SheetDescription>
            AI will analyze your job description and generate relevant application form questions
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {/* Job Context Preview */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Job Context</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div>
                <span className="font-medium">Title:</span> {jobTitle}
              </div>
              <div>
                <span className="font-medium">Description:</span>{' '}
                <span className="text-muted-foreground">
                  {jobDescription.substring(0, 150)}
                  {jobDescription.length > 150 ? '...' : ''}
                </span>
              </div>
              {requirements.length > 0 && (
                <div>
                  <span className="font-medium">Requirements:</span> {requirements.length} items
                </div>
              )}
              {responsibilities.length > 0 && (
                <div>
                  <span className="font-medium">Responsibilities:</span> {responsibilities.length} items
                </div>
              )}
            </CardContent>
          </Card>

          {/* User Notes */}
          <div className="space-y-2">
            <Label htmlFor="user-notes">Additional Instructions (Optional)</Label>
            <Textarea
              id="user-notes"
              placeholder="e.g., Focus on problem-solving skills, emphasize teamwork, assess cultural fit..."
              value={userNotes}
              onChange={(e) => setUserNotes(e.target.value)}
              rows={3}
              disabled={isGenerating}
            />
            <p className="text-xs text-muted-foreground">
              Provide any specific areas you'd like the AI to focus on when generating questions
            </p>
          </div>

          {/* Generate Button */}
          {generatedQuestions.length === 0 && (
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !jobTitle || !jobDescription}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating Questions...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Questions
                </>
              )}
            </Button>
          )}

          {/* Generated Questions - Show One at a Time */}
          {generatedQuestions.length > 0 && currentQuestion && (
            <div className="space-y-4">
              {/* Question Counter */}
              <div className="flex items-center justify-between">
                <Label>
                  Question {currentQuestionIndex + 1} of {generatedQuestions.length}
                </Label>
                <Badge variant="secondary">
                  {selectedQuestionIds.size} selected
                </Badge>
              </div>

              {/* Current Question Card */}
              <Card
                className={`transition-colors ${selectedQuestionIds.has(currentQuestion.id) ? 'border-primary bg-primary/5' : ''
                  }`}
              >
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 flex-1">
                        {(() => {
                          const TypeIcon = questionTypeIcons[currentQuestion.type];
                          return <TypeIcon className="h-5 w-5 text-muted-foreground shrink-0" />;
                        })()}
                        <span className="font-medium text-base">{currentQuestion.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {questionTypeLabels[currentQuestion.type]}
                        </Badge>
                        {currentQuestion.required && (
                          <Badge variant="destructive" className="text-xs">
                            Required
                          </Badge>
                        )}
                      </div>
                    </div>

                    {currentQuestion.description && (
                      <p className="text-sm text-muted-foreground">{currentQuestion.description}</p>
                    )}

                    {currentQuestion.options && currentQuestion.options.length > 0 && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Options:</Label>
                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                          {currentQuestion.options.map((opt) => (
                            <li key={opt.id}>{opt.label}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Select Question Checkbox */}
                    <div className="flex items-center space-x-2 pt-2 border-t">
                      <Checkbox
                        id={`select-${currentQuestion.id}`}
                        checked={selectedQuestionIds.has(currentQuestion.id)}
                        onCheckedChange={() => handleToggleQuestion(currentQuestion.id)}
                      />
                      <Label
                        htmlFor={`select-${currentQuestion.id}`}
                        className="text-sm font-medium cursor-pointer"
                      >
                        Include this question in the form
                      </Label>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between gap-2">
                <Button
                  onClick={handlePreviousQuestion}
                  disabled={currentQuestionIndex === 0}
                  variant="outline"
                  className="flex-1"
                >
                  Previous
                </Button>
                <div className="flex gap-1">
                  {generatedQuestions.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentQuestionIndex(index)}
                      className={`h-2 w-2 rounded-full transition-colors ${index === currentQuestionIndex
                          ? 'bg-primary'
                          : selectedQuestionIds.has(generatedQuestions[index].id)
                            ? 'bg-primary/30'
                            : 'bg-muted'
                        }`}
                      aria-label={`Go to question ${index + 1}`}
                    />
                  ))}
                </div>
                <Button
                  onClick={handleNextQuestion}
                  disabled={currentQuestionIndex === generatedQuestions.length - 1}
                  variant="outline"
                  className="flex-1"
                >
                  Next
                </Button>
              </div>

              {/* Load More Button */}
              {questionsGenerated > 0 && (
                <Button
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  variant="outline"
                  className="w-full"
                >
                  {isLoadingMore ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating More Questions...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Load More Questions ({questionsGenerated} available)
                    </>
                  )}
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {generatedQuestions.length > 0 && (
          <div className="mt-6 pt-4 border-t flex items-center justify-between gap-2">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button onClick={handleAddSelected} disabled={selectedQuestionIds.size === 0}>
              Add Selected Questions ({selectedQuestionIds.size})
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

