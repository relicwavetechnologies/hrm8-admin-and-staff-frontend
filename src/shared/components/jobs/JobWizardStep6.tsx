import { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { JobFormData } from '@/shared/types/job';
import { PaymentMethodSelector } from './PaymentMethodSelector';
import { TermsAndConditions } from './TermsAndConditions';
import { calculateTotalJobCost } from '@/shared/lib/paymentService';
import { Rocket, DollarSign, Info, Megaphone, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/shared/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { RECRUITMENT_SERVICES } from '@/shared/lib/subscriptionConfig';
import { useAuth } from '@/contexts/AuthContext';

interface JobWizardStep6Props {
  form: UseFormReturn<JobFormData>;
}

export function JobWizardStep6({ form }: JobWizardStep6Props) {
  const formData = form.watch();
  const { user } = useAuth();

  const [termsAccepted, setTermsAccepted] = useState(formData.termsAccepted || false);

  const isSelfManaged = formData.serviceType === 'self-managed' || formData.serviceType === 'rpo';

  const costBreakdown = calculateTotalJobCost(
    user?.companyId || '',
    formData.serviceType,
    { min: formData.salaryMin || 0, max: formData.salaryMax || 0 }
  );

  const serviceName = RECRUITMENT_SERVICES[formData.serviceType as keyof typeof RECRUITMENT_SERVICES]?.name || '';

  const handlePaymentMethodSelect = (method: 'account' | 'credit_card', invoiceRequested?: boolean) => {
    form.setValue('selectedPaymentMethod', method);
    form.setValue('paymentInvoiceRequested', invoiceRequested);
  };

  const handleTermsAcceptChange = (accepted: boolean) => {
    setTermsAccepted(accepted);
    form.setValue('termsAccepted', accepted);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Rocket className="h-5 w-5" />
          Submit & Activate
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Complete payment (if required) and activate your job posting. It will be live on HRM8 internal job board and your careers page.
        </p>
      </div>

      {/* Activation Info */}
      <Alert className="border-2 border-primary/30 bg-primary/5">
        <CheckCircle2 className="h-5 w-5 text-primary" />
        <AlertTitle className="text-base font-semibold">What happens next?</AlertTitle>
        <AlertDescription className="text-base mt-2">
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Job will be activated and visible on HRM8 internal job board</li>
            <li>Job will be published on your corporate careers page</li>
            <li>You'll receive access to post-launch tools (alerts, sharing, templates)</li>
            <li>Option to promote externally via JobTarget will be available</li>
          </ul>
        </AlertDescription>
      </Alert>

      {/* Cost Breakdown - Only show if payment required */}
      {costBreakdown.totalUpfront > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Payment Required
            </CardTitle>
            <CardDescription>
              Complete payment to activate your job posting
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Job Posting Cost */}
            <div className="flex justify-between items-center pb-3 border-b">
              <div>
                <p className="font-medium">Job Posting</p>
                <p className="text-sm text-muted-foreground">
                  {costBreakdown.jobPostingCost === 0
                    ? 'Included in your plan'
                    : '30-day HRM8 posting'}
                </p>
              </div>
              <p className="text-lg font-semibold">
                {costBreakdown.jobPostingCost === 0 ? 'FREE' : `$${costBreakdown.jobPostingCost}`}
              </p>
            </div>

            {/* Recruitment Service Cost (if not self-managed) */}
            {!isSelfManaged && costBreakdown.recruitmentServiceCost > 0 && (
              <div className="flex justify-between items-center pb-3 border-b">
                <div>
                  <p className="font-medium">Recruitment Service</p>
                  <p className="text-sm text-muted-foreground">
                    {serviceName} - Full payment
                  </p>
                </div>
                <p className="text-lg font-semibold">
                  ${costBreakdown.upfrontRecruitmentCost}
                </p>
              </div>
            )}

            {/* Total Due Now */}
            <div className="flex justify-between items-center pt-3">
              <p className="text-lg font-semibold">Total Due Now</p>
              <p className="text-2xl font-bold text-primary">
                {costBreakdown.totalUpfront === 0 ? 'FREE' : `$${costBreakdown.totalUpfront}`}
              </p>
            </div>

          </CardContent>
        </Card>
      )}

      {/* Payment Info for Paid Packages */}
      {costBreakdown.totalUpfront > 0 && !isSelfManaged && (
        <Alert className="border-2 border-primary/30 bg-primary/5">
          <Info className="h-5 w-5 text-primary" />
          <AlertTitle className="text-base font-semibold">Payment Required</AlertTitle>
          <AlertDescription className="text-base mt-2">
            <p className="mb-2">
              When you click "Pay & Publish", you will be redirected to a secure payment page to complete your payment via Stripe.
            </p>
            <p className="text-sm text-muted-foreground">
              Your job will be published automatically after successful payment.
            </p>
          </AlertDescription>
        </Alert>
      )}

      {/* Payment Method (only for self-managed jobs with payment) */}
      {costBreakdown.totalUpfront > 0 && isSelfManaged && (
        <PaymentMethodSelector
          employerId={user?.companyId || ''}
          amount={costBreakdown.totalUpfront}
          selectedMethod={formData.selectedPaymentMethod}
          onMethodSelect={handlePaymentMethodSelect}
        />
      )}

      {/* Free Job Posting Info */}
      {costBreakdown.totalUpfront === 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              No Payment Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Your job posting is free and will be activated immediately upon submission.
            </p>
          </CardContent>
        </Card>
      )}

      <TermsAndConditions
        accepted={termsAccepted}
        onAcceptChange={handleTermsAcceptChange}
        required={true}
      />

      {isSelfManaged && costBreakdown.jobPostingCost === 0 && (
        <Alert className="border-2 border-primary/30 bg-primary/5">
          <Megaphone className="h-5 w-5 text-primary" />
          <AlertTitle className="text-base font-semibold">🎉 Free Job Posting Activated!</AlertTitle>
          <AlertDescription className="text-base">
            Your job will be posted to HRM8 at <span className="font-semibold text-primary">no cost</span>. Want to reach 10x more candidates? After publishing, you'll have the option to <span className="font-semibold text-primary">promote to external job boards</span> for maximum visibility.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
