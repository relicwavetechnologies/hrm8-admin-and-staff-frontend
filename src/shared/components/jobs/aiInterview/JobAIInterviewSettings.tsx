import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/shared/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Badge } from '@/shared/components/ui/badge';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Plus, X, Sparkles, FileText } from 'lucide-react';
import { toast } from '@/shared/hooks/use-toast';
import type { Job } from '@/shared/types/job';
import type { InterviewMode, QuestionSource, QuestionCategory } from '@/shared/types/aiInterview';

interface JobAIInterviewSettingsProps {
  job: Job;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const questionCategories: { value: QuestionCategory; label: string }[] = [
  { value: 'technical', label: 'Technical' },
  { value: 'behavioral', label: 'Behavioral' },
  { value: 'situational', label: 'Situational' },
  { value: 'cultural', label: 'Cultural Fit' },
  { value: 'experience', label: 'Experience' },
];

export function JobAIInterviewSettings({ job, open, onOpenChange }: JobAIInterviewSettingsProps) {
  const [defaultMode, setDefaultMode] = useState<InterviewMode>(job.aiInterviewConfig?.defaultMode || 'text');
  const [questionSource, setQuestionSource] = useState<QuestionSource>(job.aiInterviewConfig?.questionSource || 'hybrid');
  const [questions, setQuestions] = useState<Array<{ question: string; category: QuestionCategory }>>(
    job.aiInterviewConfig?.defaultQuestions || []
  );
  const [newQuestion, setNewQuestion] = useState('');
  const [newQuestionCategory, setNewQuestionCategory] = useState<QuestionCategory>('technical');

  const handleAddQuestion = () => {
    if (newQuestion.trim()) {
      setQuestions([...questions, { question: newQuestion.trim(), category: newQuestionCategory }]);
      setNewQuestion('');
    }
  };

  const handleRemoveQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    // In a real app, this would save to backend
    // For now, we'll just show a toast
    toast({
      title: 'Settings saved',
      description: 'AI interview configuration updated for this job',
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configure AI Interview Settings</DialogTitle>
          <DialogDescription>
            Set default interview configuration for {job.title}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Default Interview Mode */}
          <div className="space-y-3">
            <Label>Default Interview Mode</Label>
            <RadioGroup value={defaultMode} onValueChange={(value) => setDefaultMode(value as InterviewMode)}>
              <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-accent">
                <RadioGroupItem value="text" id="text" />
                <Label htmlFor="text" className="flex-1 cursor-pointer">
                  <div className="font-medium">Text Interview</div>
                  <div className="text-sm text-muted-foreground">Chat-based AI interview</div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-accent">
                <RadioGroupItem value="video" id="video" />
                <Label htmlFor="video" className="flex-1 cursor-pointer">
                  <div className="font-medium">Video Interview</div>
                  <div className="text-sm text-muted-foreground">Face-to-face AI interview with camera</div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-accent">
                <RadioGroupItem value="phone" id="phone" />
                <Label htmlFor="phone" className="flex-1 cursor-pointer">
                  <div className="font-medium">Phone Interview</div>
                  <div className="text-sm text-muted-foreground">Voice-only AI interview</div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Question Source */}
          <div className="space-y-3">
            <Label>Question Strategy</Label>
            <RadioGroup value={questionSource} onValueChange={(value) => setQuestionSource(value as QuestionSource)}>
              <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-accent">
                <RadioGroupItem value="predefined" id="predefined" />
                <Label htmlFor="predefined" className="flex-1 cursor-pointer">
                  <div className="font-medium flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Predefined Questions
                  </div>
                  <div className="text-sm text-muted-foreground">Use only the questions you configure below</div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-accent">
                <RadioGroupItem value="ai-generated" id="ai-generated" />
                <Label htmlFor="ai-generated" className="flex-1 cursor-pointer">
                  <div className="font-medium flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    AI-Generated Questions
                  </div>
                  <div className="text-sm text-muted-foreground">Dynamically generated based on job and candidate</div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-accent">
                <RadioGroupItem value="hybrid" id="hybrid" />
                <Label htmlFor="hybrid" className="flex-1 cursor-pointer">
                  <div className="font-medium">Hybrid Approach</div>
                  <div className="text-sm text-muted-foreground">Combine predefined and AI-generated questions</div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Default Questions */}
          {(questionSource === 'predefined' || questionSource === 'hybrid') && (
            <div className="space-y-3">
              <Label>Default Interview Questions</Label>
              <Card>
                <CardContent className="pt-6 space-y-4">
                  {/* Existing Questions */}
                  {questions.length > 0 && (
                    <div className="space-y-2">
                      {questions.map((q, index) => (
                        <div key={index} className="flex items-start gap-2 p-3 border rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="secondary" className="text-xs">
                                {questionCategories.find(c => c.value === q.category)?.label}
                              </Badge>
                            </div>
                            <p className="text-sm">{q.question}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveQuestion(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add New Question */}
                  <div className="space-y-3 pt-4 border-t">
                    <Label>Add Question</Label>
                    <div className="flex gap-2">
                      <Select value={newQuestionCategory} onValueChange={(value) => setNewQuestionCategory(value as QuestionCategory)}>
                        <SelectTrigger className="w-[200px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {questionCategories.map((cat) => (
                            <SelectItem key={cat.value} value={cat.value}>
                              {cat.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Textarea
                      placeholder="Enter interview question..."
                      value={newQuestion}
                      onChange={(e) => setNewQuestion(e.target.value)}
                      rows={3}
                    />
                    <Button onClick={handleAddQuestion} variant="outline" className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Question
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Configuration
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
