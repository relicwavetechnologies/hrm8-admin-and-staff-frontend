import { UseFormReturn } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Separator } from '@/shared/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/shared/components/ui/alert';
import { DollarSign, CheckCircle2, Mail } from 'lucide-react';
import { BackgroundCheckWizardFormData } from './SelectChecksStep';
import { BACKGROUND_CHECK_PRICING } from '@/shared/lib/backgroundChecks/pricingConstants';

interface CostSummaryStepProps {
  form: UseFormReturn<BackgroundCheckWizardFormData>;
  candidateName: string;
  candidateEmail: string;
}

export function CostSummaryStep({ form, candidateName, candidateEmail }: CostSummaryStepProps) {
  const selectedChecks = form.watch('checkTypes') || [];
  const referees = form.watch('referees') || [];

  const checksWithCost = selectedChecks.map(checkType => ({
    type: checkType,
    ...BACKGROUND_CHECK_PRICING[checkType]
  }));

  const totalCost = checksWithCost.reduce((sum, check) => sum + check.cost, 0);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Confirmation & Cost Summary</h3>
        <p className="text-sm text-muted-foreground">
          Review the final details before sending the consent request
        </p>
      </div>

      <Alert className="border-primary bg-primary/5">
        <CheckCircle2 className="h-4 w-4" />
        <AlertTitle>Ready to Send</AlertTitle>
        <AlertDescription>
          Once confirmed, {candidateName} will receive a consent request email at {candidateEmail}
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Cost Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {checksWithCost.map((check, index) => (
              <div key={check.type} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{check.icon}</span>
                  <div>
                    <div className="font-medium text-sm">{check.name}</div>
                    <div className="text-xs text-muted-foreground">{check.provider}</div>
                  </div>
                </div>
                <span className="font-semibold">${check.cost}</span>
              </div>
            ))}

            <Separator className="my-4" />

            <div className="flex items-center justify-between text-lg font-bold">
              <span>Total Cost</span>
              <span>${totalCost}</span>
            </div>

            <div className="text-xs text-muted-foreground">
              Costs will be added to your next billing cycle
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Background Checks Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="text-sm font-medium mb-2">Candidate</div>
            <div className="text-sm text-muted-foreground">{candidateName}</div>
            <div className="text-sm text-muted-foreground">{candidateEmail}</div>
          </div>

          <Separator />

          <div>
            <div className="text-sm font-medium mb-2">Selected Checks</div>
            <div className="flex flex-wrap gap-2">
              {checksWithCost.map(check => (
                <Badge key={check.type} variant="secondary">
                  {check.icon} {check.name}
                </Badge>
              ))}
            </div>
          </div>

          {selectedChecks.includes('reference' as any) && referees.length > 0 && (
            <>
              <Separator />
              <div>
                <div className="text-sm font-medium mb-2">
                  Reference Checks ({referees.length} referee{referees.length !== 1 ? 's' : ''})
                </div>
                <div className="space-y-2">
                  {referees.map((referee, index) => (
                    <div key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                      <Mail className="h-3 w-3" />
                      {referee.name} ({referee.relationship})
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Alert>
        <Mail className="h-4 w-4" />
        <AlertDescription>
          <strong>What happens next:</strong>
          <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
            <li>{candidateName} will receive a consent request email</li>
            <li>They have 7 days to review and provide consent</li>
            <li>Once consent is given, all selected checks will begin automatically</li>
            <li>You'll receive notifications as checks are completed</li>
            <li>Results will be available in the candidate's background checks tab</li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  );
}
