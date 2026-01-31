/**
 * Job Payment Status Component
 * Displays payment status and allows payment completion for jobs
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/shared/components/ui/alert';
import { Loader2, CreditCard, CheckCircle2, XCircle, AlertCircle, DollarSign } from 'lucide-react';
import { Job } from '@/shared/types/job';
import { createJobCheckoutSession } from '@/shared/lib/payments';
import { useToast } from '@/shared/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';

interface JobPaymentStatusProps {
  job: Job;
  onPaymentComplete?: () => void;
}

export function JobPaymentStatus({ job, onPaymentComplete: _onPaymentComplete }: JobPaymentStatusProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  // Don't show payment status for self-managed jobs
  if (job.serviceType === 'self-managed' || job.servicePackage === 'self-managed') {
    return null;
  }

  const paymentStatus = job.paymentStatus || 'pending';
  const servicePackage = job.servicePackage || job.serviceType;
  const paymentAmount = job.paymentAmount;
  const paymentCurrency = job.paymentCurrency || 'USD';
  const paymentCompletedAt = job.paymentCompletedAt;

  const getStatusBadge = () => {
    switch (paymentStatus) {
      case 'paid':
      case 'PAID':
        return (
          <Badge variant="default" className="bg-green-500">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Paid
          </Badge>
        );
      case 'pending':
      case 'PENDING':
        return (
          <Badge variant="outline" className="border-yellow-500 text-yellow-700">
            <AlertCircle className="h-3 w-3 mr-1" />
            Payment Pending
          </Badge>
        );
      case 'failed':
      case 'FAILED':
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Payment Failed
          </Badge>
        );
      case 'PROCESSING':
      case 'PROCESSING':
        return (
          <Badge variant="outline" className="border-blue-500 text-blue-700">
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            Processing
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            <AlertCircle className="h-3 w-3 mr-1" />
            Payment Required
          </Badge>
        );
    }
  };

  const getPackageLabel = (pkg: string) => {
    const labels: Record<string, string> = {
      'shortlisting': 'Shortlisting',
      'full-service': 'Full Service',
      'executive-search': 'Executive Search',
    };
    return labels[pkg] || pkg;
  };

  const handlePayNow = async () => {
    if (!job.id || !user?.companyId) {
      toast({
        title: "Error",
        description: "Missing required information to process payment",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const response = await createJobCheckoutSession({
        jobId: job.id,
        servicePackage: servicePackage as 'shortlisting' | 'full-service' | 'executive-search',
        companyId: user.companyId,
        customerEmail: user.email,
      });

      if (response.data?.checkoutUrl) {
        // Redirect to Stripe checkout
        window.location.href = response.data.checkoutUrl;
      } else {
        throw new Error('Failed to get checkout URL');
      }
    } catch (error: any) {
      console.error('Payment checkout error:', error);
      toast({
        title: "Payment Setup Failed",
        description: error?.message || "Failed to create payment checkout. Please try again.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  const isPaid = paymentStatus === 'paid' || paymentStatus === 'PAID';
  const isPending = paymentStatus === 'pending' || paymentStatus === 'PENDING';
  const isFailed = paymentStatus === 'failed' || paymentStatus === 'FAILED';

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Payment Status
            </CardTitle>
            <CardDescription>
              Service package: {getPackageLabel(servicePackage)}
            </CardDescription>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {paymentAmount && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Amount</span>
            <span className="text-lg font-semibold">
              {paymentCurrency.toUpperCase()} ${paymentAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        )}

        {paymentCompletedAt && isPaid && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Paid on</span>
            <span className="text-sm font-medium">
              {format(new Date(paymentCompletedAt), 'MMM dd, yyyy')}
            </span>
          </div>
        )}

        {isPending && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Payment Required</AlertTitle>
            <AlertDescription>
              Complete payment to publish this job. You will be redirected to a secure payment page.
            </AlertDescription>
          </Alert>
        )}

        {isFailed && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertTitle>Payment Failed</AlertTitle>
            <AlertDescription>
              Your payment could not be processed. Please try again or contact support.
            </AlertDescription>
          </Alert>
        )}

        {!isPaid && (
          <Button
            onClick={handlePayNow}
            disabled={isProcessing}
            className="w-full"
            size="lg"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="h-4 w-4 mr-2" />
                {isFailed ? 'Retry Payment' : 'Pay Now'}
              </>
            )}
          </Button>
        )}

        {isPaid && (
          <div className="flex items-center gap-2 text-sm text-green-600">
            <CheckCircle2 className="h-4 w-4" />
            <span>
              {job.status === 'open'
                ? 'Payment completed. This job has been published.'
                : 'Payment completed. This job can now be published.'}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}




