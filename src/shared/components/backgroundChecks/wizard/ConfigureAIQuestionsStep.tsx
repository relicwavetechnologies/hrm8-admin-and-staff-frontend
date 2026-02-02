import { useState } from 'react';
import { Card } from '@/shared/components/ui/card';
import { Label } from '@/shared/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/shared/components/ui/radio-group';
import { Textarea } from '@/shared/components/ui/textarea';
import { Badge } from '@/shared/components/ui/badge';
import { Switch } from '@/shared/components/ui/switch';
import { Slider } from '@/shared/components/ui/slider';
import { 
  FileText, 
  Sparkles, 
  Layers, 
  MessageSquare,
  Clock,
  Target
} from 'lucide-react';
import type { QuestionSource } from '@/types/aiReferenceCheck';

interface ConfigureAIQuestionsStepProps {
  questionSource: QuestionSource;
  onQuestionSourceChange: (source: QuestionSource) => void;
  customPrompt: string;
  onCustomPromptChange: (prompt: string) => void;
  focusAreas: string[];
  onFocusAreasChange: (areas: string[]) => void;
  adaptiveMode: boolean;
  onAdaptiveModeChange: (enabled: boolean) => void;
  maxQuestions: number;
  onMaxQuestionsChange: (count: number) => void;
  estimatedDuration: number;
  onEstimatedDurationChange: (minutes: number) => void;
}

const QUESTION_SOURCES = [
  {
    value: 'pre-written' as QuestionSource,
    icon: FileText,
    title: 'Pre-written Questions',
    description: 'Use existing questionnaire templates with proven questions',
    badge: 'Reliable'
  },
  {
    value: 'ai-derived' as QuestionSource,
    icon: Sparkles,
    title: 'AI-Derived Questions',
    description: 'AI analyzes job description and candidate profile to generate custom questions',
    badge: 'Smart'
  },
  {
    value: 'template' as QuestionSource,
    icon: Layers,
    title: 'Template + AI Enhancement',
    description: 'Start with template, let AI add intelligent follow-up questions',
    badge: 'Recommended'
  },
  {
    value: 'dynamic' as QuestionSource,
    icon: MessageSquare,
    title: 'Fully Dynamic',
    description: 'AI generates all questions in real-time based on conversation flow',
    badge: 'Advanced'
  }
];

const FOCUS_AREAS = [
  'Performance & Results',
  'Leadership & Management',
  'Technical Skills',
  'Communication',
  'Teamwork & Collaboration',
  'Problem Solving',
  'Work Ethic & Reliability',
  'Adaptability',
  'Cultural Fit',
  'Conflict Resolution'
];

export function ConfigureAIQuestionsStep({
  questionSource,
  onQuestionSourceChange,
  customPrompt,
  onCustomPromptChange,
  focusAreas,
  onFocusAreasChange,
  adaptiveMode,
  onAdaptiveModeChange,
  maxQuestions,
  onMaxQuestionsChange,
  estimatedDuration,
  onEstimatedDurationChange
}: ConfigureAIQuestionsStepProps) {
  const toggleFocusArea = (area: string) => {
    if (focusAreas.includes(area)) {
      onFocusAreasChange(focusAreas.filter(a => a !== area));
    } else {
      onFocusAreasChange([...focusAreas, area]);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Configure AI Questions</h3>
        <p className="text-sm text-muted-foreground">
          Customize how the AI generates and asks questions during the interview
        </p>
      </div>

      {/* Question Source Selection */}
      <div className="space-y-4">
        <Label className="text-base">Question Generation Method</Label>
        <RadioGroup value={questionSource} onValueChange={(value) => onQuestionSourceChange(value as QuestionSource)}>
          <div className="grid gap-3">
            {QUESTION_SOURCES.map((source) => {
              const Icon = source.icon;
              const isSelected = questionSource === source.value;

              return (
                <Card
                  key={source.value}
                  className={`p-4 cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? 'border-primary border-2 bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => onQuestionSourceChange(source.value)}
                >
                  <div className="flex items-start gap-3">
                    <RadioGroupItem value={source.value} id={source.value} className="mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className="h-4 w-4 text-primary" />
                        <Label htmlFor={source.value} className="font-semibold cursor-pointer">
                          {source.title}
                        </Label>
                        <Badge variant="secondary" className="text-xs">{source.badge}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{source.description}</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </RadioGroup>
      </div>

      {/* Custom Prompt */}
      {(questionSource === 'ai-derived' || questionSource === 'dynamic') && (
        <div className="space-y-2">
          <Label htmlFor="custom-prompt">Custom AI Instructions (Optional)</Label>
          <Textarea
            id="custom-prompt"
            placeholder="E.g., Focus on the candidate's ability to work under pressure and their experience with remote teams..."
            value={customPrompt}
            onChange={(e) => onCustomPromptChange(e.target.value)}
            rows={3}
            className="resize-none"
          />
          <p className="text-xs text-muted-foreground">
            Provide specific instructions to guide the AI's question generation
          </p>
        </div>
      )}

      {/* Focus Areas */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-primary" />
          <Label className="text-base">Focus Areas</Label>
        </div>
        <p className="text-sm text-muted-foreground">
          Select areas the AI should prioritize during the interview
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          {FOCUS_AREAS.map((area) => (
            <Card
              key={area}
              className={`p-3 cursor-pointer transition-all duration-200 ${
                focusAreas.includes(area)
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/50'
              }`}
              onClick={() => toggleFocusArea(area)}
            >
              <div className="flex items-center gap-2">
                <div className={`h-4 w-4 rounded border-2 flex items-center justify-center ${
                  focusAreas.includes(area)
                    ? 'border-primary bg-primary'
                    : 'border-muted-foreground'
                }`}>
                  {focusAreas.includes(area) && (
                    <svg className="h-3 w-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className="text-sm font-medium">{area}</span>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Adaptive Mode Toggle */}
      <Card className="p-4 bg-muted/50">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-4 w-4 text-primary" />
              <Label htmlFor="adaptive-mode" className="font-semibold cursor-pointer">
                Adaptive Questioning
              </Label>
            </div>
            <p className="text-sm text-muted-foreground">
              Allow AI to generate intelligent follow-up questions based on referee's answers
            </p>
          </div>
          <Switch
            id="adaptive-mode"
            checked={adaptiveMode}
            onCheckedChange={onAdaptiveModeChange}
          />
        </div>
      </Card>

      {/* Interview Configuration */}
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-3">
          <Label htmlFor="max-questions">Maximum Questions: {maxQuestions}</Label>
          <Slider
            id="max-questions"
            min={5}
            max={15}
            step={1}
            value={[maxQuestions]}
            onValueChange={(value) => onMaxQuestionsChange(value[0])}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            AI will ask up to {maxQuestions} questions during the interview
          </p>
        </div>

        <div className="space-y-3">
          <Label htmlFor="duration">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Estimated Duration: {estimatedDuration} min
            </div>
          </Label>
          <Slider
            id="duration"
            min={5}
            max={20}
            step={1}
            value={[estimatedDuration]}
            onValueChange={(value) => onEstimatedDurationChange(value[0])}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            Target interview length (actual may vary slightly)
          </p>
        </div>
      </div>

      {/* Preview Sample Questions */}
      <Card className="p-4 bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-semibold text-blue-900 dark:text-blue-100">
              Sample Questions Preview
            </span>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              • Can you describe your professional relationship with the candidate?
            </p>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              • How would you rate their {focusAreas[0]?.toLowerCase() || 'overall performance'}?
            </p>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              • Can you provide a specific example of their work?
            </p>
            {adaptiveMode && (
              <p className="text-sm text-blue-800 dark:text-blue-200 italic">
                • [AI will generate follow-up questions based on responses]
              </p>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
