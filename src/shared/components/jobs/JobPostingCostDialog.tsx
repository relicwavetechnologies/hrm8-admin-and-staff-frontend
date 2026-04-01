import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Progress } from "@/shared/components/ui/progress";

import { getEmployerById } from "@/shared/lib/employerService";
import { SUBSCRIPTION_TIERS, PAYG_JOB_POSTING_COST } from "@/shared/lib/subscriptionConfig";
import { pricingService } from "@/shared/lib/pricingService";
import { Building2, CreditCard, AlertCircle, CheckCircle, ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface JobPostingCostDialogProps {
  open: boolean;
  employerId: string;
  onContinue: () => void;
  onUpgrade: () => void;
  onCancel: () => void;
}

export function JobPostingCostDialog({
  open,
  employerId,
  onContinue,
  onUpgrade,
  onCancel
}: JobPostingCostDialogProps) {
  const employer = getEmployerById(employerId);

  if (!employer) {
    return null;
  }

  const subscriptionTier = employer.subscriptionTier;
  const isPayg = employer.accountType === 'payg' || (!subscriptionTier && employer.accountType === 'approved');
  const isLite = subscriptionTier === 'ats-lite';
  const isSubscription = subscriptionTier && subscriptionTier !== 'ats-lite' && subscriptionTier !== 'payg';
  const hasUsedFreeTier = employer.hasUsedFreeTier || false;
  const currentOpenJobs = employer.currentOpenJobs || 0;
  const maxOpenJobs = employer.maxOpenJobs || 0;
  const { data: pricingTiers } = useQuery({
    queryKey: ['pricing', 'admin-job-posting-cost-dialog'],
    queryFn: () => pricingService.getSubscriptionTiers(),
    staleTime: 5 * 60 * 1000,
  });
  const paygTier = pricingTiers?.find((tier) => tier.planType === 'PAYG');
  const smallTier = pricingTiers?.find((tier) => tier.planType === 'SMALL');
  const mediumTier = pricingTiers?.find((tier) => tier.planType === 'MEDIUM');
  const largeTier = pricingTiers?.find((tier) => tier.planType === 'LARGE');
  const enterpriseTier = pricingTiers?.find((tier) => tier.planType === 'ENTERPRISE');
  const paygPriceLabel = pricingService.formatPrice(paygTier?.price ?? PAYG_JOB_POSTING_COST, paygTier?.currency ?? 'USD');

  // Check if at limit
  const atLimit = isLite && hasUsedFreeTier;
  const subscriptionAtLimit = isSubscription && currentOpenJobs >= maxOpenJobs;

  // Calculate usage percentage
  const usagePercentage = isSubscription && maxOpenJobs > 0
    ? (currentOpenJobs / maxOpenJobs) * 100
    : 0;



  // SUBSCRIPTION USERS
  if (isSubscription) {
    const tierConfig = SUBSCRIPTION_TIERS[subscriptionTier];

    if (subscriptionAtLimit) {
      return (
        <Dialog open={open} onOpenChange={() => { }}>
          <DialogContent className="max-w-lg max-h-[85vh] [&>button]:hidden">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
                Job Limit Reached
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-3 overflow-y-auto">
              <div className="flex items-start gap-2 p-3 border border-destructive/50 rounded-lg bg-destructive/5">
                <AlertCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                <p className="text-sm">
                  Your {tierConfig.name} Plan ({currentOpenJobs}/{maxOpenJobs} jobs used)
                </p>
              </div>

              <Card>
                <CardContent className="pt-4 space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Open Jobs</span>
                      <span className="font-semibold text-destructive">
                        {currentOpenJobs} / {maxOpenJobs} used
                      </span>
                    </div>
                    <Progress value={100} className="h-2" />
                  </div>

                  <p className="text-sm font-medium pt-2">To post this job:</p>

                  <div className="space-y-2">
                    <div>
                      <h4 className="font-semibold text-sm mb-1">1. Close an existing job</h4>
                      <p className="text-sm text-muted-foreground ml-4">
                        → Frees up a slot in your plan
                      </p>
                    </div>

                    <div>
                      <h4 className="font-semibold text-sm mb-1">2. Upgrade to a larger plan</h4>
                      <div className="text-sm text-muted-foreground ml-4 space-y-0.5">
                        {subscriptionTier === 'small' && (
                          <>
                            <p>→ Medium: 25 jobs/month{mediumTier ? ` (${pricingService.formatPrice(mediumTier.price, mediumTier.currency)}/month)` : ''}</p>
                            <p>→ Large: 50 jobs/month{largeTier ? ` (${pricingService.formatPrice(largeTier.price, largeTier.currency)}/month)` : ''}</p>
                          </>
                        )}
                        {subscriptionTier === 'medium' && (
                          <>
                            <p>→ Large: 50 jobs/month{largeTier ? ` (${pricingService.formatPrice(largeTier.price, largeTier.currency)}/month)` : ''}</p>
                            <p>→ Enterprise: Unlimited jobs{enterpriseTier ? ` (${pricingService.formatPrice(enterpriseTier.price, enterpriseTier.currency)}/month)` : ''}</p>
                          </>
                        )}
                        {subscriptionTier === 'large' && (
                          <p>→ Enterprise: Unlimited jobs{enterpriseTier ? ` (${pricingService.formatPrice(enterpriseTier.price, enterpriseTier.currency)}/month)` : ''}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={onCancel} size="sm">
                Cancel
              </Button>
              <Button variant="outline" onClick={() => window.location.href = '/ats/jobs'} size="sm">
                View My Jobs
              </Button>
              <Button onClick={onUpgrade} size="sm">
                Upgrade Plan
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      );
    }

    return (
      <Dialog open={open} onOpenChange={() => { }}>
        <DialogContent className="max-w-lg max-h-[85vh] [&>button]:hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-success" />
              Ready to Post Your Job
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 overflow-y-auto">
            <div className="flex items-start gap-2 p-3 bg-success/5 border border-success/20 rounded-lg">
              <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
              <p className="text-sm">
                Your {tierConfig.name} Plan includes job posting
              </p>
            </div>

            <Card>
              <CardContent className="pt-4 space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Open Jobs</span>
                    <span className="font-semibold">
                      {currentOpenJobs} / {maxOpenJobs === Infinity ? 'Unlimited' : maxOpenJobs} used
                    </span>
                  </div>
                  {maxOpenJobs !== Infinity && (
                    <Progress value={usagePercentage} className="h-2" />
                  )}
                </div>

                <p className="text-sm text-muted-foreground">
                  No additional charge for this posting.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={onCancel} size="sm">
              Cancel
            </Button>
            <Button onClick={onContinue} size="sm" className="flex-1">
              Continue to Next Step
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // PAYG USERS
  if (isPayg) {
    return (
      <Dialog open={open} onOpenChange={() => { }}>
        <DialogContent className="max-w-lg max-h-[85vh] [&>button]:hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Confirm Job Posting
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 overflow-y-auto">
            <Card>
              <CardContent className="pt-4 space-y-3">
                <div className="text-center py-2">
                  <p className="text-sm text-muted-foreground mb-1">Job Posting Fee</p>
                  <div className="text-3xl font-bold text-primary">
                    {paygPriceLabel}
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t">
                  <p className="font-medium text-sm">This includes:</p>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      30-day posting on HRM8
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      Full ATS access
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      Unlimited applicants
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      Candidate management
                    </li>
                  </ul>
                </div>

                <p className="text-xs text-muted-foreground text-center pt-2 border-t">
                  Additional recruitment services available in next step (optional)
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={onCancel} size="sm">
              Cancel
            </Button>
            <Button onClick={onContinue} size="sm" className="flex-1">
              Continue - Charge {paygPriceLabel}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // FREE USERS
  if (atLimit) {
    return (
      <Dialog open={open} onOpenChange={() => { }}>
        <DialogContent className="max-w-lg max-h-[85vh] [&>button]:hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Choose Your Posting Option
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 overflow-y-auto">
            <p className="text-sm text-muted-foreground">
              You've used your complimentary posting. Choose how you'd like to continue:
            </p>

            <Card>
              <CardContent className="pt-4 space-y-4">
                <div>
                  <h4 className="font-semibold text-sm mb-1 flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Pay-As-You-Go: {paygPriceLabel} per job
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-0.5 ml-6">
                    <li>• No commitment</li>
                    <li>• Pay only when posting</li>
                    <li>• All features included</li>
                  </ul>
                </div>

                <div className="text-center text-xs font-medium text-muted-foreground">
                  OR
                </div>

                <div>
                  <h4 className="font-semibold text-sm mb-1 flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Subscribe: {smallTier ? `From ${pricingService.formatPrice(smallTier.price, smallTier.currency)}/month` : 'Monthly plans available in your billing currency'}
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-0.5 ml-6">
                    <li>• 5-50 jobs included monthly</li>
                    <li>• Unlimited users</li>
                    <li>• Save up to 75% per job</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={onCancel} size="sm">
              Cancel
            </Button>
            <Button variant="outline" onClick={() => {/* TODO: Set to PAYG and continue */ }} size="sm">
              Choose PAYG
            </Button>
            <Button onClick={onUpgrade} size="sm">
              View Plans
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // FREE USER - FIRST JOB
  return (
    <Dialog open={open} onOpenChange={() => { }}>
      <DialogContent className="max-w-lg max-h-[85vh] [&>button]:hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-success" />
            Welcome! Your First Job is FREE
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 overflow-y-auto">
          <div className="flex items-start gap-2 p-3 bg-success/5 border border-success/20 rounded-lg">
            <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
            <p className="text-sm font-medium">
              Get started with a complimentary job posting to try HRM8
            </p>
          </div>

          <Card>
            <CardContent className="pt-4 space-y-3">
              <div className="space-y-2">
                <p className="font-medium text-sm">This includes:</p>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                    30-day posting on HRM8
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                    Full ATS access
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                    Unlimited applicants
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                    External Job Board posting
                  </li>
                </ul>
              </div>

              <div className="pt-2 border-t space-y-2">
                <p className="text-xs text-muted-foreground">
                  Future posts: {paygPriceLabel} each (PAYG) or {smallTier ? `switch to monthly plans from ${pricingService.formatPrice(smallTier.price, smallTier.currency)}/month` : 'switch to a monthly subscription plan in your billing currency'}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onUpgrade}
                  className="w-full"
                >
                  Upgrade Now - View Pricing Plans
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-2 pt-2">
          <Button variant="outline" onClick={onCancel} size="sm">
            Cancel
          </Button>
          <Button onClick={onContinue} size="sm" className="flex-1">
            Continue - Post FREE
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
