import { useState } from 'react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/shared/components/ui/alert';
import { Button } from '@/shared/components/ui/button';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Label } from '@/shared/components/ui/label';
import { Receipt, CreditCard, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { getEmployerById } from '@/shared/lib/employerService';
import { canUseAccountBilling } from '@/shared/lib/paymentService';

interface PaymentMethodSelectorProps {
  employerId: string;
  amount: number;
  selectedMethod?: 'account' | 'credit_card';
  onMethodSelect: (method: 'account' | 'credit_card', invoiceRequested?: boolean) => void;
}

export function PaymentMethodSelector({
  employerId,
  amount,
  selectedMethod,
  onMethodSelect
}: PaymentMethodSelectorProps) {
  const employer = getEmployerById(employerId);
  const isApproved = employer?.accountType === 'approved';
  const canUseAccount = isApproved && canUseAccountBilling(employerId, amount);
  const [invoiceRequested, setInvoiceRequested] = useState(false);
  
  if (!employer) return null;
  
  const handleCreditCardSelect = () => {
    onMethodSelect('credit_card', invoiceRequested);
  };
  
  return (
    <div className="space-y-4">
      {isApproved ? (
        <div className="space-y-3">
          <Card
            className={cn(
              "cursor-pointer transition-all",
              canUseAccount && "hover:shadow-md",
              !canUseAccount && "opacity-50 cursor-not-allowed",
              selectedMethod === 'account' && "border-primary border-2 shadow-md"
            )}
            onClick={() => canUseAccount && onMethodSelect('account')}
          >
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-primary/10 p-3">
                  <Receipt className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-lg">Add to Account & Invoice</h4>
                    <Badge variant="secondary">Recommended</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Charges will be added to your monthly invoice
                  </p>
                  {employer.paymentTerms && (
                    <p className="text-sm font-medium">
                      Payment Terms: {employer.paymentTerms}
                    </p>
                  )}
                  {!canUseAccount && (
                    <Alert variant="destructive" className="mt-3">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        This would exceed your credit limit of ${employer.creditLimit?.toLocaleString()}.
                        Current balance: ${employer.currentBalance?.toLocaleString()}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card
            className={cn(
              "cursor-pointer transition-all hover:shadow-md",
              selectedMethod === 'credit_card' && "border-primary border-2 shadow-md"
            )}
            onClick={handleCreditCardSelect}
          >
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-blue-500/10 p-3">
                  <CreditCard className="h-6 w-6 text-blue-500" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-lg">Pay with Credit Card</h4>
                  <p className="text-sm text-muted-foreground">
                    Secure payment processed immediately via Stripe
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <>
          <Card className="border-primary border-2">
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-blue-500/10 p-3">
                  <CreditCard className="h-6 w-6 text-blue-500" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-lg">Pay with Credit Card</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Secure payment processed by Stripe
                  </p>
                  <div className="text-2xl font-bold text-primary">
                    ${amount.toLocaleString()}
                  </div>
                </div>
              </div>
              
              <div className="pt-3 border-t">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="invoice-request"
                    checked={invoiceRequested}
                    onCheckedChange={(checked) => setInvoiceRequested(checked as boolean)}
                  />
                  <div className="flex-1">
                    <Label htmlFor="invoice-request" className="cursor-pointer font-medium">
                      Request Invoice Payment Instead
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      We'll send you an invoice, but <strong>no services or job posting will begin until payment is received</strong>
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Want an approved account?</AlertTitle>
            <AlertDescription>
              Contact our team to apply for an approved account with invoicing and credit terms.
              <Button variant="link" className="h-auto p-0 ml-1">
                Learn more
              </Button>
            </AlertDescription>
          </Alert>
        </>
      )}
    </div>
  );
}
