import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Separator } from '@/shared/components/ui/separator';
import { JobTargetPromotionOptIn } from './JobTargetPromotionOptIn';
import { JobBoardBudgetSelector } from './JobBoardBudgetSelector';
import { Megaphone, ExternalLink, X } from 'lucide-react';
import { Job } from '@/shared/types/job';
import { toast } from '@/shared/hooks/use-toast';

interface ExternalPromotionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job: Job;
  onSuccess?: () => void;
}

export function ExternalPromotionDialog({ open, onOpenChange, job, onSuccess }: ExternalPromotionDialogProps) {
  const [promotionEnabled, setPromotionEnabled] = useState(false);
  const [selectedTier, setSelectedTier] = useState<string>('standard');
  const [customAmount, setCustomAmount] = useState<number>(0);

  const handlePromotionToggle = (enabled: boolean) => {
    setPromotionEnabled(enabled);
    if (enabled) {
      setSelectedTier('standard');
    } else {
      setSelectedTier('none');
    }
  };

  const handleTierChange = (tier: string) => {
    setSelectedTier(tier);
  };

  const handleCustomAmountChange = (amount: number) => {
    setCustomAmount(amount);
  };

  const handleContinueToJobTarget = () => {
    // Construct JobTarget URL with job details as query parameters
    const jobTargetUrl = new URL('https://jobtarget.com/post');
    jobTargetUrl.searchParams.set('jobId', job.id);
    jobTargetUrl.searchParams.set('title', job.title);
    jobTargetUrl.searchParams.set('location', job.location);
    jobTargetUrl.searchParams.set('employmentType', job.employmentType);
    if (job.salaryMin) jobTargetUrl.searchParams.set('salaryMin', job.salaryMin.toString());
    if (job.salaryMax) jobTargetUrl.searchParams.set('salaryMax', job.salaryMax.toString());
    
    // Open JobTarget in new tab
    window.open(jobTargetUrl.toString(), '_blank');
    
    toast({
      title: "Redirected to JobTarget",
      description: "Complete your job board promotion on JobTarget's platform",
    });
    
    onOpenChange(false);
    if (onSuccess) onSuccess();
  };

  const handleSkip = () => {
    toast({
      title: "Job Posted Successfully",
      description: "Your job is now live on HRM8. You can promote to external boards anytime from the job detail page.",
    });
    
    onOpenChange(false);
    if (onSuccess) onSuccess();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Megaphone className="h-6 w-6 text-primary" />
            Boost Your Job's Reach with External Promotion
          </DialogTitle>
          <DialogDescription>
            Your job is now live on HRM8! Maximize your reach by promoting it to major job boards through JobTarget.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-primary" />
              Why Promote to External Job Boards?
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>Reach 50M+ candidates across major job boards like Indeed, LinkedIn, and Glassdoor</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>Get 3-5x more qualified applicants on average</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>Reduce time-to-hire with broader candidate exposure</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>Flexible budget options starting from $500</span>
              </li>
            </ul>
          </div>

          <Separator />

          <JobTargetPromotionOptIn
            enabled={promotionEnabled}
            onToggle={handlePromotionToggle}
            serviceType={job.serviceType}
          />

          {promotionEnabled && (
            <>
              <Separator />
              <JobBoardBudgetSelector
                selectedTier={selectedTier}
                customAmount={customAmount}
                onTierChange={handleTierChange}
                onCustomAmountChange={handleCustomAmountChange}
                serviceType={job.serviceType}
              />
            </>
          )}

          <Separator />

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              variant="outline"
              onClick={handleSkip}
              className="flex-1"
            >
              <X className="h-4 w-4 mr-2" />
              Skip for Now
            </Button>
            <Button
              onClick={handleContinueToJobTarget}
              disabled={!promotionEnabled || selectedTier === 'none'}
              className="flex-1"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Continue to JobTarget
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            You can always promote your job to external boards later from the job detail page
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
