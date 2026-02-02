import { Card } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Video, Phone, ClipboardList, Check } from 'lucide-react';
import type { InterviewMode } from '@/types/aiReferenceCheck';

interface SelectInterviewModeStepProps {
  selectedMode: InterviewMode;
  onModeChange: (mode: InterviewMode) => void;
}

const INTERVIEW_MODES = [
  {
    mode: 'video' as InterviewMode,
    icon: Video,
    title: 'AI Video Interview',
    description: 'Virtual AI recruiter conducts face-to-face video interview with referee',
    badge: 'Recommended',
    badgeVariant: 'default' as const,
    features: [
      'Real-time AI conversation',
      'Video recording for review',
      'Advanced sentiment analysis',
      'Automated transcript generation'
    ],
    duration: '10-15 minutes',
    pricing: '$99 per referee'
  },
  {
    mode: 'phone' as InterviewMode,
    icon: Phone,
    title: 'AI Phone Interview',
    description: 'Audio-only AI interview via phone call for maximum convenience',
    badge: 'Popular',
    badgeVariant: 'secondary' as const,
    features: [
      'No video required',
      'Works on any phone',
      'Audio recording included',
      'Automated transcript generation'
    ],
    duration: '10-15 minutes',
    pricing: '$79 per referee'
  },
  {
    mode: 'questionnaire' as InterviewMode,
    icon: ClipboardList,
    title: 'Traditional Questionnaire',
    description: 'Standard form-based reference check with structured questions',
    badge: 'Fallback',
    badgeVariant: 'outline' as const,
    features: [
      'Complete at own pace',
      'No scheduling needed',
      'Simple form submission',
      'Works offline'
    ],
    duration: '5-10 minutes',
    pricing: '$69 per referee'
  }
];

export function SelectInterviewModeStep({ selectedMode, onModeChange }: SelectInterviewModeStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Select Interview Mode</h3>
        <p className="text-sm text-muted-foreground">
          Choose how the AI recruiter should conduct reference checks with your referees
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {INTERVIEW_MODES.map((modeConfig) => {
          const Icon = modeConfig.icon;
          const isSelected = selectedMode === modeConfig.mode;

          return (
            <Card
              key={modeConfig.mode}
              className={`relative p-6 cursor-pointer transition-all duration-300 hover:shadow-lg ${
                isSelected
                  ? 'border-primary border-2 bg-primary/5 shadow-md'
                  : 'border-border hover:border-primary/50'
              }`}
              onClick={() => onModeChange(modeConfig.mode)}
            >
              {isSelected && (
                <div className="absolute top-3 right-3">
                  <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                    <Check className="h-4 w-4 text-primary-foreground" />
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-lg ${
                      isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted'
                    }`}>
                      <Icon className="h-6 w-6" />
                    </div>
                  </div>
                  <Badge variant={modeConfig.badgeVariant}>{modeConfig.badge}</Badge>
                </div>

                <div>
                  <h4 className="font-semibold mb-1">{modeConfig.title}</h4>
                  <p className="text-sm text-muted-foreground">{modeConfig.description}</p>
                </div>

                <div className="space-y-2">
                  {modeConfig.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      <span className="text-xs text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-border space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Duration</span>
                    <span className="font-medium">{modeConfig.duration}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Pricing</span>
                    <span className="font-semibold text-primary">{modeConfig.pricing}</span>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="bg-muted/50 border border-border rounded-lg p-4">
        <div className="flex gap-3">
          <div className="text-blue-600 dark:text-blue-400 mt-0.5">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium mb-1">AI Interview Benefits</p>
            <p className="text-xs text-muted-foreground">
              AI-conducted interviews provide richer insights through natural conversation, automatic analysis, 
              and faster turnaround times compared to traditional questionnaires. Video mode offers the most comprehensive 
              assessment with visual cues and body language analysis.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
