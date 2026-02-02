import { CheckCircle, XCircle, AlertTriangle, Clock, FileText, Shield } from 'lucide-react';
import { Card } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Separator } from '@/shared/components/ui/separator';
import { Button } from '@/shared/components/ui/button';
import { Progress } from '@/shared/components/ui/progress';
import type { BackgroundCheck, BackgroundCheckResult } from '@/types/backgroundCheck';

interface CheckResultsSectionProps {
  check: BackgroundCheck;
}

const checkTypeLabels = {
  criminal: 'Criminal Record Check',
  employment: 'Employment Verification',
  education: 'Education Verification',
  credit: 'Credit Check',
  'drug-screen': 'Drug Screening',
  reference: 'Reference Check',
  identity: 'Identity Verification',
  'professional-license': 'Professional License Verification',
};

export default function CheckResultsSection({ check }: CheckResultsSectionProps) {
  const getStatusIcon = (status: BackgroundCheckResult['status']) => {
    switch (status) {
      case 'clear':
        return CheckCircle;
      case 'not-clear':
        return XCircle;
      case 'review-required':
        return AlertTriangle;
      default:
        return Clock;
    }
  };

  const getStatusVariant = (status: BackgroundCheckResult['status']) => {
    switch (status) {
      case 'clear':
        return 'success' as const;
      case 'not-clear':
        return 'destructive' as const;
      case 'review-required':
        return 'warning' as const;
      default:
        return 'secondary' as const;
    }
  };

  const completedChecks = check.results.filter(r => r.status !== 'pending').length;
  const totalChecks = check.checkTypes.length;
  const progressPercentage = (completedChecks / totalChecks) * 100;

  return (
    <div className="space-y-6">
      {/* Overall Status Card */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Overall Status</h3>
          {check.overallStatus && (
            <Badge
              variant={
                check.overallStatus === 'clear'
                  ? 'success'
                  : check.overallStatus === 'not-clear'
                  ? 'destructive'
                  : 'warning'
              }
              className="text-base px-4 py-1"
            >
              {check.overallStatus === 'clear' && 'Clear'}
              {check.overallStatus === 'conditional' && 'Conditional'}
              {check.overallStatus === 'not-clear' && 'Not Clear'}
            </Badge>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">Check Progress</span>
              <span className="font-medium">
                {completedChecks} of {totalChecks} completed
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Provider</div>
              <div className="font-medium">{check.provider.toUpperCase()}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Total Cost</div>
              <div className="font-medium">${check.totalCost?.toFixed(2) || '0.00'}</div>
            </div>
          </div>

          {check.reviewedByName && (
            <>
              <Separator />
              <div>
                <div className="text-sm text-muted-foreground mb-1">Reviewed By</div>
                <div className="font-medium">{check.reviewedByName}</div>
                {check.reviewNotes && (
                  <div className="text-sm text-muted-foreground mt-2 p-3 rounded-lg border bg-muted/50">
                    {check.reviewNotes}
                  </div>
                )}
              </div>
            </>
          )}

          {check.reportUrl && (
            <>
              <Separator />
              <Button variant="outline" className="w-full gap-2" asChild>
                <a href={check.reportUrl} target="_blank" rel="noopener noreferrer">
                  <FileText className="h-4 w-4" />
                  View Full Report
                </a>
              </Button>
            </>
          )}
        </div>
      </Card>

      {/* Individual Check Results */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Individual Check Results</h3>
        {check.checkTypes.map((checkType, index) => {
          const result = check.results.find(r => r.checkType === checkType.type);
          const StatusIcon = result ? getStatusIcon(result.status) : Clock;
          const statusVariant = result ? getStatusVariant(result.status) : 'secondary';

          return (
            <Card key={index} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold">{checkTypeLabels[checkType.type]}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      {checkType.required && (
                        <Badge variant="outline" className="text-xs">
                          Required
                        </Badge>
                      )}
                      {check.costBreakdown?.find(c => c.checkType === checkType.type) && (
                        <span className="text-sm text-muted-foreground">
                          ${check.costBreakdown.find(c => c.checkType === checkType.type)?.cost.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <Badge variant={statusVariant} className="gap-1.5">
                  <StatusIcon className="h-3.5 w-3.5" />
                  {result ? (
                    <>
                      {result.status === 'clear' && 'Clear'}
                      {result.status === 'not-clear' && 'Not Clear'}
                      {result.status === 'review-required' && 'Review Required'}
                      {result.status === 'pending' && 'Pending'}
                    </>
                  ) : (
                    'Pending'
                  )}
                </Badge>
              </div>

              {result && (
                <>
                  {result.details && (
                    <>
                      <Separator className="my-4" />
                      <div>
                        <div className="text-sm font-medium mb-2">Details</div>
                        <div className="text-sm text-muted-foreground p-3 rounded-lg border bg-muted/50">
                          {result.details}
                        </div>
                      </div>
                    </>
                  )}

                  {result.documents && result.documents.length > 0 && (
                    <>
                      <Separator className="my-4" />
                      <div>
                        <div className="text-sm font-medium mb-2">Supporting Documents</div>
                        <div className="space-y-2">
                          {result.documents.map((doc, docIndex) => (
                            <Button
                              key={docIndex}
                              variant="outline"
                              size="sm"
                              className="w-full justify-start gap-2"
                              asChild
                            >
                              <a href={doc.url} target="_blank" rel="noopener noreferrer">
                                <FileText className="h-4 w-4" />
                                {doc.name}
                              </a>
                            </Button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {result.completedDate && (
                    <>
                      <Separator className="my-4" />
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Completed</span>
                        <span className="font-medium">
                          {new Date(result.completedDate).toLocaleDateString()}
                        </span>
                      </div>
                    </>
                  )}
                </>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
