import { CheckCircle, XCircle, Clock, Mail, Eye, Calendar, Globe } from 'lucide-react';
import { Card } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Separator } from '@/shared/components/ui/separator';
import { Button } from '@/shared/components/ui/button';
import { getConsentResponseByRequestId } from '@/shared/lib/backgroundChecks/consentStorage';
import type { BackgroundCheck } from '@/types/backgroundCheck';
import type { ConsentRequest } from '@/types/consent';

interface ConsentStatusSectionProps {
  check: BackgroundCheck;
  consents: ConsentRequest[];
}

export default function ConsentStatusSection({ check: _check, consents }: ConsentStatusSectionProps) {
  const latestConsent = consents[0];

  if (!latestConsent) {
    return (
      <Card className="p-8 text-center">
        <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Consent Request Sent</h3>
        <p className="text-muted-foreground">
          A consent request has not been sent to the candidate yet.
        </p>
      </Card>
    );
  }

  const consentResponse = getConsentResponseByRequestId(latestConsent.id);

  const statusConfig = {
    pending: { label: 'Pending', variant: 'secondary' as const, icon: Clock },
    sent: { label: 'Sent', variant: 'default' as const, icon: Mail },
    viewed: { label: 'Viewed', variant: 'default' as const, icon: Eye },
    accepted: { label: 'Accepted', variant: 'success' as const, icon: CheckCircle },
    declined: { label: 'Declined', variant: 'destructive' as const, icon: XCircle },
    expired: { label: 'Expired', variant: 'secondary' as const, icon: Clock },
  };

  const status = statusConfig[latestConsent.status];
  const StatusIcon = status.icon;

  return (
    <div className="space-y-6">
      {/* Consent Status Card */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Consent Status</h3>
          <Badge variant={status.variant} className="gap-1.5">
            <StatusIcon className="h-3.5 w-3.5" />
            {status.label}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <div className="text-sm text-muted-foreground mb-1">Candidate</div>
            <div className="font-medium">{latestConsent.candidateName}</div>
            <div className="text-sm text-muted-foreground">{latestConsent.candidateEmail}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground mb-1">Requested By</div>
            <div className="font-medium">{latestConsent.createdByName}</div>
            <div className="text-sm text-muted-foreground">
              {new Date(latestConsent.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>

        <Separator className="my-4" />

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Sent Date
            </span>
            <span className="text-sm font-medium">
              {new Date(latestConsent.sentDate).toLocaleString()}
            </span>
          </div>

          {latestConsent.viewedDate && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Viewed Date
              </span>
              <span className="text-sm font-medium">
                {new Date(latestConsent.viewedDate).toLocaleString()}
              </span>
            </div>
          )}

          {latestConsent.respondedDate && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                {latestConsent.status === 'accepted' ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                Response Date
              </span>
              <span className="text-sm font-medium">
                {new Date(latestConsent.respondedDate).toLocaleString()}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Expiry Date
            </span>
            <span className="text-sm font-medium">
              {new Date(latestConsent.expiryDate).toLocaleDateString()}
            </span>
          </div>
        </div>
      </Card>

      {/* Requested Checks */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Requested Checks</h3>
        <div className="space-y-3">
          {latestConsent.requestedChecks.map((check, index) => (
            <div key={index} className="flex items-center justify-between p-3 rounded-lg border bg-card">
              <div className="flex-1">
                <div className="font-medium">{check.checkType}</div>
                <div className="text-sm text-muted-foreground">{check.description}</div>
                <div className="text-xs text-muted-foreground mt-1">Provider: {check.provider}</div>
              </div>
              <div className="text-right">
                <div className="font-semibold">${check.cost.toFixed(2)}</div>
              </div>
            </div>
          ))}
          <Separator />
          <div className="flex items-center justify-between font-semibold">
            <span>Total Cost</span>
            <span>${latestConsent.requestedChecks.reduce((sum, c) => sum + c.cost, 0).toFixed(2)}</span>
          </div>
        </div>
      </Card>

      {/* Consent Response Details */}
      {consentResponse && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Consent Response Details</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
              <span className="text-sm text-muted-foreground">Decision</span>
              <Badge variant={consentResponse.accepted ? 'success' : 'destructive'}>
                {consentResponse.accepted ? 'Accepted' : 'Declined'}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Response Time
              </span>
              <span className="text-sm font-medium">
                {new Date(consentResponse.timestamp).toLocaleString()}
              </span>
            </div>

            {consentResponse.ipAddress && (
              <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  IP Address
                </span>
                <span className="text-sm font-mono">{consentResponse.ipAddress}</span>
              </div>
            )}

            {consentResponse.signatureDataUrl && (
              <div className="p-3 rounded-lg border bg-card">
                <div className="text-sm text-muted-foreground mb-2">Digital Signature</div>
                <div className="border rounded-lg p-4 bg-background">
                  <img
                    src={consentResponse.signatureDataUrl}
                    alt="Digital Signature"
                    className="max-h-24 mx-auto"
                  />
                </div>
              </div>
            )}

            {consentResponse.candidateComments && (
              <div className="p-3 rounded-lg border bg-card">
                <div className="text-sm text-muted-foreground mb-2">Candidate Comments</div>
                <p className="text-sm">{consentResponse.candidateComments}</p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Legal Disclosure */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Legal Disclosure</h3>
        <div className="text-sm text-muted-foreground whitespace-pre-wrap border-l-4 border-primary/20 pl-4">
          {latestConsent.legalDisclosure}
        </div>
        {latestConsent.privacyPolicyUrl && (
          <Button variant="link" className="mt-4 p-0 h-auto" asChild>
            <a href={latestConsent.privacyPolicyUrl} target="_blank" rel="noopener noreferrer">
              View Privacy Policy →
            </a>
          </Button>
        )}
      </Card>
    </div>
  );
}
