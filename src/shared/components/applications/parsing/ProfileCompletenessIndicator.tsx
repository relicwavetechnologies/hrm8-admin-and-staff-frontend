import { Application } from "@/shared/types/application";
import { Badge } from "@/shared/components/ui/badge";
import { Progress } from "@/shared/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/shared/components/ui/tooltip";
import { CheckCircle2, AlertCircle, Info } from "lucide-react";

interface ProfileCompletenessIndicatorProps {
  application: Application;
  showProgress?: boolean;
  showDetails?: boolean;
}

export function ProfileCompletenessIndicator({ 
  application, 
  showProgress = true,
  showDetails = false 
}: ProfileCompletenessIndicatorProps) {
  const completeness = calculateCompleteness(application);
  const { percentage, missingItems, availableItems } = completeness;

  const getBadgeVariant = (percentage: number) => {
    if (percentage >= 90) return "default";
    if (percentage >= 70) return "secondary";
    if (percentage >= 50) return "outline";
    return "destructive";
  };

  const getIcon = (percentage: number) => {
    if (percentage >= 90) return <CheckCircle2 className="h-3 w-3" />;
    if (percentage >= 70) return <Info className="h-3 w-3" />;
    return <AlertCircle className="h-3 w-3" />;
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {getIcon(percentage)}
                <span className="text-xs font-medium">Profile Completeness</span>
              </div>
              <Badge variant={getBadgeVariant(percentage)} className="text-xs">
                {percentage}%
              </Badge>
            </div>
            {showProgress && (
              <Progress value={percentage} className="h-2" />
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <div className="space-y-2">
            <div className="text-sm font-medium">
              Profile Completeness: {percentage}%
            </div>
            {showDetails && (
              <>
                <div className="text-xs space-y-1">
                  <div className="font-medium text-green-600 dark:text-green-400">Available:</div>
                  <ul className="list-disc list-inside space-y-0.5 ml-2">
                    {availableItems.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
                {missingItems.length > 0 && (
                  <div className="text-xs space-y-1">
                    <div className="font-medium text-orange-600 dark:text-orange-400">Missing:</div>
                    <ul className="list-disc list-inside space-y-0.5 ml-2">
                      {missingItems.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

interface CompletenessResult {
  percentage: number;
  missingItems: string[];
  availableItems: string[];
}

function calculateCompleteness(application: Application): CompletenessResult {
  const items: { key: string; label: string; check: () => boolean }[] = [
    { key: 'resume', label: 'Resume', check: () => !!application.resumeUrl },
    { key: 'coverLetter', label: 'Cover Letter', check: () => !!application.coverLetterUrl },
    { key: 'parsedResume', label: 'Parsed Resume Data', check: () => !!application.parsedResume },
    { key: 'questionnaire', label: 'Questionnaire Responses', check: () => !!application.questionnaireData && (application.questionnaireData as any).responses?.length > 0 },
    { key: 'customAnswers', label: 'Custom Answers', check: () => !!application.customAnswers && application.customAnswers.length > 0 },
    { key: 'aiAnalysis', label: 'AI Analysis', check: () => !!application.aiAnalysis },
    { key: 'score', label: 'Fit Score', check: () => application.score !== undefined && application.score !== null },
    { key: 'portfolio', label: 'Portfolio', check: () => !!application.portfolioUrl },
    { key: 'linkedIn', label: 'LinkedIn', check: () => !!application.linkedInUrl },
  ];

  const availableItems: string[] = [];
  const missingItems: string[] = [];

  items.forEach(item => {
    if (item.check()) {
      availableItems.push(item.label);
    } else {
      missingItems.push(item.label);
    }
  });

  const percentage = Math.round((availableItems.length / items.length) * 100);

  return {
    percentage,
    missingItems,
    availableItems,
  };
}

