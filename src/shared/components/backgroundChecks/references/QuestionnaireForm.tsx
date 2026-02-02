import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { Label } from '@/shared/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/shared/components/ui/radio-group';
import { Progress } from '@/shared/components/ui/progress';
import { Badge } from '@/shared/components/ui/badge';
import { Star, CheckCircle2 } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import type { QuestionnaireQuestion, QuestionAnswer } from '@/types/referee';

interface QuestionnaireFormProps {
  questions: QuestionnaireQuestion[];
  candidateName: string;
  onSubmit: (answers: QuestionAnswer[]) => void;
  isSubmitting?: boolean;
}

export function QuestionnaireForm({
  questions,
  candidateName,
  onSubmit,
  isSubmitting = false
}: QuestionnaireFormProps) {
  const [answers, setAnswers] = useState<Record<string, string | number | boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const progress = (Object.keys(answers).length / questions.length) * 100;

  const updateAnswer = (questionId: string, value: string | number | boolean) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[questionId];
      return newErrors;
    });
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    questions.forEach(q => {
      if (q.required && !answers[q.id]) {
        newErrors[q.id] = 'This field is required';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }

    const formattedAnswers: QuestionAnswer[] = questions.map(q => ({
      questionId: q.id,
      question: q.question,
      value: answers[q.id] ?? '',
      type: q.type
    }));

    onSubmit(formattedAnswers);
  };

  const renderQuestion = (question: QuestionnaireQuestion, index: number) => {
    const hasError = !!errors[question.id];

    return (
      <Card key={question.id} className={cn(hasError && "border-destructive")}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="text-base font-medium">
                {index + 1}. {question.question}
                {question.required && <span className="text-destructive ml-1">*</span>}
              </CardTitle>
            </div>
            <Badge variant="outline" className="shrink-0">
              {question.type === 'rating' ? 'Rating' : 
               question.type === 'yes-no' ? 'Yes/No' : 
               question.type === 'textarea' ? 'Long Answer' : 'Short Answer'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {question.type === 'rating' && question.ratingScale && (
            <div className="space-y-2">
              <div className="flex justify-between items-center gap-2">
                {Array.from({ length: question.ratingScale.max }, (_, i) => i + 1).map(rating => (
                  <Button
                    key={rating}
                    type="button"
                    variant={answers[question.id] === rating ? "default" : "outline"}
                    size="lg"
                    className="flex-1 flex flex-col gap-1 h-auto py-3"
                    onClick={() => updateAnswer(question.id, rating)}
                  >
                    <Star 
                      className={cn(
                        "h-5 w-5",
                        answers[question.id] === rating && "fill-current"
                      )} 
                    />
                    <span className="text-sm font-semibold">{rating}</span>
                  </Button>
                ))}
              </div>
              {question.ratingScale.labels && (
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{question.ratingScale.labels[0]}</span>
                  <span>{question.ratingScale.labels[question.ratingScale.labels.length - 1]}</span>
                </div>
              )}
            </div>
          )}

          {question.type === 'yes-no' && (
            <RadioGroup
              value={answers[question.id]?.toString()}
              onValueChange={(value) => updateAnswer(question.id, value === 'true')}
            >
              <div className="flex gap-4">
                <div className="flex items-center space-x-2 flex-1">
                  <RadioGroupItem value="true" id={`${question.id}-yes`} />
                  <Label htmlFor={`${question.id}-yes`} className="flex-1 cursor-pointer">
                    Yes
                  </Label>
                </div>
                <div className="flex items-center space-x-2 flex-1">
                  <RadioGroupItem value="false" id={`${question.id}-no`} />
                  <Label htmlFor={`${question.id}-no`} className="flex-1 cursor-pointer">
                    No
                  </Label>
                </div>
              </div>
            </RadioGroup>
          )}

          {question.type === 'text' && (
            <Input
              placeholder={question.placeholder || 'Your answer...'}
              value={answers[question.id]?.toString() || ''}
              onChange={(e) => updateAnswer(question.id, e.target.value)}
              maxLength={question.maxLength}
            />
          )}

          {question.type === 'textarea' && (
            <div className="space-y-1">
              <Textarea
                placeholder={question.placeholder || 'Your answer...'}
                value={answers[question.id]?.toString() || ''}
                onChange={(e) => updateAnswer(question.id, e.target.value)}
                maxLength={question.maxLength}
                rows={4}
                className="resize-none"
              />
              {question.maxLength && (
                <p className="text-xs text-muted-foreground text-right">
                  {answers[question.id]?.toString().length || 0} / {question.maxLength}
                </p>
              )}
            </div>
          )}

          {hasError && (
            <p className="text-sm text-destructive">{errors[question.id]}</p>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <CardTitle>Reference Check for {candidateName}</CardTitle>
            <Badge variant="secondary">{Object.keys(answers).length} / {questions.length}</Badge>
          </div>
          <Progress value={progress} className="h-2" />
          <CardDescription className="mt-2">
            Please answer all questions honestly and to the best of your knowledge
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Questions */}
      <div className="space-y-4">
        {questions.map((question, index) => renderQuestion(question, index))}
      </div>

      {/* Submit */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4" />
              {Object.keys(answers).length} of {questions.length} questions answered
            </div>
            <Button
              size="lg"
              onClick={handleSubmit}
              disabled={isSubmitting || Object.keys(answers).length === 0}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Reference'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
