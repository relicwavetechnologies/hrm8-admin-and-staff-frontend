import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { GraduationCap, CheckCircle, AlertCircle, FileText, Download } from 'lucide-react';
import type { BackgroundCheckResult } from '@/types/backgroundCheck';

interface QualificationVerificationResultsProps {
  result?: BackgroundCheckResult;
}

export function QualificationVerificationResults({ result }: QualificationVerificationResultsProps) {
  if (!result) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-purple-600" />
            <CardTitle>Qualification Verification</CardTitle>
          </div>
          <CardDescription>Verify educational credentials and professional qualifications</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Qualification verification not yet completed</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const getStatusIcon = () => {
    if (result.status === 'clear') return <CheckCircle className="h-5 w-5 text-green-600" />;
    if (result.status === 'review-required' || result.status === 'not-clear')
      return <AlertCircle className="h-5 w-5 text-red-600" />;
    return <GraduationCap className="h-5 w-5 text-gray-600" />;
  };

  const getStatusBadge = () => {
    if (result.status === 'clear') return <Badge variant="default" className="bg-green-600">Verified</Badge>;
    if (result.status === 'review-required') return <Badge variant="secondary">Review Required</Badge>;
    if (result.status === 'not-clear') return <Badge variant="destructive">Not Verified</Badge>;
    return <Badge variant="outline">Pending</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <CardTitle>Qualification Verification</CardTitle>
          </div>
          {getStatusBadge()}
        </div>
        <CardDescription>Verify educational credentials and professional qualifications</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {result.status === 'clear' && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              All qualifications successfully verified. Credentials are authentic.
            </AlertDescription>
          </Alert>
        )}

        {(result.status === 'review-required' || result.status === 'not-clear') && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {result.details || 'Qualification verification failed or discrepancies found.'}
            </AlertDescription>
          </Alert>
        )}

        {result.details && result.status !== 'clear' && (
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Details:</h4>
            <p className="text-sm text-muted-foreground">{result.details}</p>
          </div>
        )}

        {result.completedDate && (
          <div className="space-y-2 pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Completed on {new Date(result.completedDate).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
          </div>
        )}

        {result.documents && result.documents.length > 0 && (
          <div className="space-y-2 pt-4 border-t">
            <h4 className="font-semibold text-sm">Verified Documents:</h4>
            <div className="space-y-2">
              {result.documents.map((doc, idx) => (
                <Button key={idx} variant="outline" size="sm" className="w-full justify-start gap-2">
                  <FileText className="h-4 w-4" />
                  {doc.name}
                  <Download className="h-4 w-4 ml-auto" />
                </Button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
