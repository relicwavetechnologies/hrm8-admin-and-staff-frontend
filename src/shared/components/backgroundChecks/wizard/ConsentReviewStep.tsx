import { UseFormReturn } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { FileText, Calendar, AlertCircle } from 'lucide-react';
import { BackgroundCheckWizardFormData } from './SelectChecksStep';
import { BACKGROUND_CHECK_PRICING } from '@/shared/lib/backgroundChecks/pricingConstants';
import { PRIVACY_POLICY_URL } from '@/shared/lib/backgroundChecks/legalTemplates';
import { format, addDays } from 'date-fns';

interface ConsentReviewStepProps {
  form: UseFormReturn<BackgroundCheckWizardFormData>;
  candidateName: string;
  candidateEmail: string;
}

export function ConsentReviewStep({ form, candidateName, candidateEmail }: ConsentReviewStepProps) {
  const selectedChecks = form.watch('checkTypes') || [];
  const expiryDate = addDays(new Date(), 7);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Review Consent Requirements</h3>
        <p className="text-sm text-muted-foreground">
          Review what the candidate will see in their consent request
        </p>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          The candidate will receive a consent request email and must accept before any checks are initiated.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Candidate Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>
            <span className="text-sm font-medium">Name:</span>
            <span className="text-sm ml-2">{candidateName}</span>
          </div>
          <div>
            <span className="text-sm font-medium">Email:</span>
            <span className="text-sm ml-2">{candidateEmail}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Requested Background Checks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {selectedChecks.map((checkType) => {
              const pricing = BACKGROUND_CHECK_PRICING[checkType];
              return (
                <div key={checkType} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{pricing.icon}</span>
                    <div>
                      <div className="font-medium text-sm">{pricing.name}</div>
                      <div className="text-xs text-muted-foreground">
                        via {pricing.provider} • {pricing.estimatedTime}
                      </div>
                    </div>
                  </div>
                  <Badge variant="secondary">${pricing.cost}</Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Consent Timeline
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Request sent:</span>
            <span className="font-medium">{format(new Date(), 'PPP')}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Expires:</span>
            <span className="font-medium">{format(expiryDate, 'PPP')}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Valid for:</span>
            <span className="font-medium">7 days</span>
          </div>
        </CardContent>
      </Card>

      <Card className="border-primary/50 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-base">Legal Disclosure & Privacy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>
            The candidate will be presented with:
          </p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>Full legal disclosure under the Fair Credit Reporting Act (FCRA)</li>
            <li>Summary of their rights as a consumer</li>
            <li>Explanation of each background check type</li>
            <li>Digital signature requirement for consent</li>
            <li>Privacy policy and data handling procedures</li>
          </ul>
          <div className="pt-2">
            <a
              href={PRIVACY_POLICY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline text-sm"
            >
              View Privacy Policy →
            </a>
          </div>
        </CardContent>
      </Card>

      <Alert variant="default" className="bg-muted">
        <AlertDescription>
          <strong>Next step:</strong> After you confirm, an email will be sent to {candidateEmail} with a secure link to review and provide consent. You'll be notified once the candidate responds.
        </AlertDescription>
      </Alert>
    </div>
  );
}
