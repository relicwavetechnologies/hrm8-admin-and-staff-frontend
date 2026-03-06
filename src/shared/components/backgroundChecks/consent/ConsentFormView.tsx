import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Separator } from '@/shared/components/ui/separator';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { DigitalSignature } from './DigitalSignature';
import type { ConsentRequest } from '@/types/consent';
import { FileText, Shield, DollarSign, Calendar, AlertCircle, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';

interface ConsentFormViewProps {
  consentRequest: ConsentRequest;
  onAccept: (signatureDataUrl: string) => void;
  onDecline: () => void;
  isSubmitting?: boolean;
}

export function ConsentFormView({ 
  consentRequest, 
  onAccept, 
  onDecline,
  isSubmitting = false 
}: ConsentFormViewProps) {
  const [signature, setSignature] = useState<string | null>(null);
  const [hasReadDisclosure, setHasReadDisclosure] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [scrolledToBottom, setScrolledToBottom] = useState(false);

  const totalCost = consentRequest.requestedChecks.reduce((sum, check) => sum + check.cost, 0);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    const isAtBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 10;
    if (isAtBottom && !scrolledToBottom) {
      setScrolledToBottom(true);
    }
  };

  const canSubmit = signature && hasReadDisclosure && agreeToTerms;

  const handleAccept = () => {
    if (canSubmit && signature) {
      onAccept(signature);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Background Check Consent Request
          </CardTitle>
          <CardDescription>
            Please review and provide consent for the following background checks
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Candidate</p>
              <p className="text-base font-semibold">{consentRequest.candidateName}</p>
              <p className="text-sm text-muted-foreground">{consentRequest.candidateEmail}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Request Details</p>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                Expires {format(new Date(consentRequest.expiryDate), 'MMM d, yyyy')}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Requested by {consentRequest.createdByName}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Requested Checks */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Requested Background Checks</CardTitle>
          <CardDescription>
            The following checks will be conducted
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {consentRequest.requestedChecks.map((check, index) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex-1">
                <p className="font-medium">{check.description}</p>
                <p className="text-sm text-muted-foreground">Provider: {check.provider}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">${check.cost}</p>
                <p className="text-xs text-muted-foreground">per check</p>
              </div>
            </div>
          ))}
          
          <Separator />
          
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">Total Cost</span>
            </div>
            <span className="text-xl font-bold">${totalCost}</span>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              These costs are covered by the requesting organization. No charges will be made to you.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Legal Disclosure */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Shield className="h-5 w-5" />
            Legal Disclosure
          </CardTitle>
          <CardDescription>
            Please read the disclosure carefully before signing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ScrollArea 
            className="h-64 border rounded-lg p-4 bg-muted/20"
            onScrollCapture={handleScroll}
          >
            <div className="prose prose-sm max-w-none text-foreground">
              <div dangerouslySetInnerHTML={{ __html: consentRequest.legalDisclosure }} />
            </div>
          </ScrollArea>

          {!scrolledToBottom && (
            <p className="text-sm text-muted-foreground italic">
              * Please scroll to the bottom to continue
            </p>
          )}

          <div className="flex items-start space-x-2">
            <Checkbox
              id="disclosure-read"
              checked={hasReadDisclosure}
              onCheckedChange={(checked) => setHasReadDisclosure(checked === true)}
              disabled={!scrolledToBottom}
            />
            <label
              htmlFor="disclosure-read"
              className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              I have read and understood the disclosure statement above
            </label>
          </div>

          <div className="flex items-start space-x-2">
            <Checkbox
              id="terms-agree"
              checked={agreeToTerms}
              onCheckedChange={(checked) => setAgreeToTerms(checked === true)}
            />
            <label
              htmlFor="terms-agree"
              className="text-sm leading-none"
            >
              I consent to the background checks listed above and agree to the{' '}
              <a 
                href={consentRequest.privacyPolicyUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline inline-flex items-center gap-1"
              >
                Privacy Policy <ExternalLink className="h-3 w-3" />
              </a>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Digital Signature */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Digital Signature</CardTitle>
          <CardDescription>
            Sign below to provide your consent
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DigitalSignature
            onSignatureChange={setSignature}
            value={signature}
          />
          <p className="text-xs text-muted-foreground mt-2">
            By signing, you certify that all information provided is accurate and that you consent to the requested background checks.
          </p>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3 justify-end">
        <Button
          variant="outline"
          onClick={onDecline}
          disabled={isSubmitting}
        >
          Decline
        </Button>
        <Button
          onClick={handleAccept}
          disabled={!canSubmit || isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Accept & Sign'}
        </Button>
      </div>
    </div>
  );
}
