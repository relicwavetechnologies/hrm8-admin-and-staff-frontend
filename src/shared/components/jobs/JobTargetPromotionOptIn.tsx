import { Card, CardContent } from '@/shared/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/shared/components/ui/alert';
import { Switch } from '@/shared/components/ui/switch';
import { Label } from '@/shared/components/ui/label';
import { Megaphone, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';

interface JobTargetPromotionOptInProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  serviceType: 'self-managed' | 'shortlisting' | 'full-service' | 'executive-search' | 'rpo';
}

export function JobTargetPromotionOptIn({ enabled, onToggle, serviceType }: JobTargetPromotionOptInProps) {
  const isSelfManaged = serviceType === 'self-managed';
  
  return (
    <Card className={enabled ? 'border-primary border-2' : 'border-2 border-dashed'}>
      <CardContent className="pt-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <div className={`rounded-full p-3 ${enabled ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
              <Megaphone className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h4 className="font-semibold text-lg">External Job Board Promotion</h4>
                {!isSelfManaged && enabled && (
                  <span className="text-xs text-muted-foreground">(Included in service)</span>
                )}
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                {isSelfManaged 
                  ? 'Promote your job on major job boards like Indeed, LinkedIn, Glassdoor, and more via JobTarget'
                  : 'Your recruitment service includes professional job board promotion to maximize reach'}
              </p>
              
              {enabled && (
                <div className="flex items-start gap-2 text-sm text-green-600 dark:text-green-500">
                  <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>Your job will be promoted to millions of active job seekers</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Switch
              checked={enabled}
              onCheckedChange={onToggle}
              id="jobtarget-promotion"
            />
            <Label htmlFor="jobtarget-promotion" className="cursor-pointer font-medium">
              {enabled ? 'Enabled' : 'Disabled'}
            </Label>
          </div>
        </div>
        
        {!enabled && isSelfManaged && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Important Warning</AlertTitle>
            <AlertDescription>
              Without external job board promotion, your job will <strong>only appear on HRM8's platform</strong>. 
              This significantly reduces visibility and you are <strong>unlikely to receive applicants</strong>. 
              We strongly recommend enabling JobTarget promotion to maximize your reach.
            </AlertDescription>
          </Alert>
        )}
        
        {enabled && isSelfManaged && (
          <Alert className="border-primary/50 bg-primary/5">
            <TrendingUp className="h-4 w-4 text-primary" />
            <AlertDescription className="text-sm">
              <strong>Pro Tip:</strong> Jobs promoted on external boards receive an average of <strong>10x more applications</strong> 
              compared to HRM8-only postings. Select your promotion budget in the next step.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
