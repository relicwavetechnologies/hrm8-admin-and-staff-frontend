import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Progress } from '@/shared/components/ui/progress';
import { SelectChecksStep, BackgroundCheckWizardFormData } from './wizard/SelectChecksStep';
import { SelectInterviewModeStep } from './wizard/SelectInterviewModeStep';
import { ConfigureAIQuestionsStep } from './wizard/ConfigureAIQuestionsStep';
import { ConfigureRefereesStep } from './wizard/ConfigureRefereesStep';
import { ConsentReviewStep } from './wizard/ConsentReviewStep';
import { CostSummaryStep } from './wizard/CostSummaryStep';
import { ChevronLeft, ChevronRight, Send } from 'lucide-react';
import { useToast } from '@/shared/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';
import { saveBackgroundCheck } from '@/shared/lib/mockBackgroundCheckStorage';
import { createConsentRequest, sendConsentEmail } from '@/shared/lib/backgroundChecks/consentService';
import { createReferee } from '@/shared/lib/backgroundChecks/referenceCheckService';
import { getDefaultTemplate } from '@/shared/lib/backgroundChecks/questionnaireTemplateStorage';
import { calculateTotalCost, getCostBreakdown } from '@/shared/lib/backgroundChecks/pricingConstants';
import type { BackgroundCheck } from '@/types/backgroundCheck';
import type { InterviewMode, QuestionSource } from '@/types/aiReferenceCheck';

interface BackgroundCheckWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  onComplete: (checkId: string) => void;
}

const wizardSchema = z.object({
  checkTypes: z.array(z.string()).min(1, 'Select at least one check type'),
  referees: z.array(z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email'),
    phone: z.string().optional(),
    relationship: z.enum(['manager', 'colleague', 'direct-report', 'client', 'other']),
    relationshipDetails: z.string().optional(),
    companyName: z.string().optional(),
    position: z.string().optional()
  })),
  questionnaireTemplateId: z.string()
});

export function BackgroundCheckWizard({
  open,
  onOpenChange,
  candidateId,
  candidateName,
  candidateEmail,
  onComplete
}: BackgroundCheckWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // AI Interview Configuration State
  const [interviewMode, setInterviewMode] = useState<InterviewMode>('video');
  const [questionSource, setQuestionSource] = useState<QuestionSource>('template');
  const [customPrompt, setCustomPrompt] = useState('');
  const [focusAreas, setFocusAreas] = useState<string[]>(['Performance & Results', 'Communication', 'Teamwork & Collaboration']);
  const [adaptiveMode, setAdaptiveMode] = useState(true);
  const [maxQuestions, setMaxQuestions] = useState(10);
  const [estimatedDuration, setEstimatedDuration] = useState(12);

  const form = useForm<BackgroundCheckWizardFormData>({
    resolver: zodResolver(wizardSchema),
    defaultValues: {
      checkTypes: [],
      referees: [],
      questionnaireTemplateId: getDefaultTemplate().id
    }
  });

  const selectedChecks = form.watch('checkTypes') || [];
  const hasReferenceCheck = selectedChecks.includes('reference' as any);
  const referees = form.watch('referees') || [];
  const isAIMode = interviewMode === 'video' || interviewMode === 'phone';

  const steps = [
    {
      title: 'Select Checks',
      component: SelectChecksStep,
      canProceed: () => selectedChecks.length > 0
    },
    ...(hasReferenceCheck ? [
      {
        title: 'Interview Mode',
        component: null, // Handled separately
        canProceed: () => true
      },
      ...(isAIMode ? [{
        title: 'Configure AI Questions',
        component: null, // Handled separately
        canProceed: () => focusAreas.length > 0
      }] : []),
      {
        title: 'Add Referees',
        component: ConfigureRefereesStep,
        canProceed: () => referees.length >= 2
      }
    ] : []),
    {
      title: 'Review Consent',
      component: null, // Handled separately to satisfy TS props narrowing
      canProceed: () => true
    },
    {
      title: 'Confirm & Send',
      component: null, // Handled separately to satisfy TS props narrowing
      canProceed: () => true
    }
  ];

  const CurrentStepComponent = steps[currentStep].component;
  const progress = ((currentStep + 1) / steps.length) * 100;

  const canProceed = steps[currentStep].canProceed();

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const values = form.getValues();
      
      // Create background check
      const backgroundCheck: BackgroundCheck = {
        id: uuidv4(),
        candidateId,
        candidateName,
        provider: 'manual',
        checkTypes: values.checkTypes.map(type => ({
          type: type as any,
          required: true
        })),
        status: 'pending-consent',
        initiatedBy: 'current-user',
        initiatedByName: 'Current User',
        initiatedDate: new Date().toISOString(),
        consentGiven: false,
        results: [],
        totalCost: calculateTotalCost(values.checkTypes as any[]),
        costBreakdown: getCostBreakdown(values.checkTypes as any[]),
        billedTo: 'employer-1',
        billedToName: 'Employer Organization',
        paymentStatus: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      saveBackgroundCheck(backgroundCheck);

      // Create consent request
      const consent = createConsentRequest(
        candidateId,
        candidateName,
        candidateEmail,
        backgroundCheck.id,
        values.checkTypes as any[],
        'current-user',
        'Current User'
      );

      // Send consent email
      sendConsentEmail(consent);

      // Create referees if reference check is selected
      if (hasReferenceCheck && values.referees.length > 0) {
        for (const refereeData of values.referees) {
          const referee = createReferee(candidateId, backgroundCheck.id, {
            ...refereeData,
            name: refereeData.name,
            email: refereeData.email,
            phone: refereeData.phone,
            relationship: refereeData.relationship,
            relationshipDetails: refereeData.relationshipDetails,
            companyName: refereeData.companyName,
            position: refereeData.position
          });

          // Note: We don't send referee invitations until consent is given
          console.log('Referee created, will invite after consent:', referee.id);
        }
      }

      toast({
        title: 'Consent request sent',
        description: `${candidateName} will receive an email to provide consent for the background check.`
      });

      onComplete(backgroundCheck.id);
      onOpenChange(false);
      
      // Reset form
      form.reset();
      setCurrentStep(0);

    } catch (error) {
      console.error('Error initiating background check:', error);
      toast({
        title: 'Error',
        description: 'Failed to initiate background check. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Initiate Background Check</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Step {currentStep + 1} of {steps.length}: {steps[currentStep].title}
              </span>
              <span className="font-medium">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} />
          </div>

          {/* Step Content */}
          <div className="py-4">
            {steps[currentStep].title === 'Interview Mode' ? (
              <SelectInterviewModeStep
                selectedMode={interviewMode}
                onModeChange={setInterviewMode}
              />
            ) : steps[currentStep].title === 'Configure AI Questions' ? (
              <ConfigureAIQuestionsStep
                questionSource={questionSource}
                onQuestionSourceChange={setQuestionSource}
                customPrompt={customPrompt}
                onCustomPromptChange={setCustomPrompt}
                focusAreas={focusAreas}
                onFocusAreasChange={setFocusAreas}
                adaptiveMode={adaptiveMode}
                onAdaptiveModeChange={setAdaptiveMode}
                maxQuestions={maxQuestions}
                onMaxQuestionsChange={setMaxQuestions}
                estimatedDuration={estimatedDuration}
                onEstimatedDurationChange={setEstimatedDuration}
              />
            ) : steps[currentStep].title === 'Review Consent' ? (
              <ConsentReviewStep
                form={form}
                candidateName={candidateName || ''}
                candidateEmail={candidateEmail || ''}
              />
            ) : steps[currentStep].title === 'Confirm & Send' ? (
              <CostSummaryStep
                form={form}
                candidateName={candidateName || ''}
                candidateEmail={candidateEmail || ''}
              />
            ) : CurrentStepComponent ? (
              <CurrentStepComponent form={form} />
            ) : null}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 0 || isSubmitting}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back
            </Button>

            {currentStep < steps.length - 1 ? (
              <Button
                onClick={handleNext}
                disabled={!canProceed || isSubmitting}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!canProceed || isSubmitting}
              >
                <Send className="h-4 w-4 mr-2" />
                {isSubmitting ? 'Sending...' : 'Send Consent Request'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
