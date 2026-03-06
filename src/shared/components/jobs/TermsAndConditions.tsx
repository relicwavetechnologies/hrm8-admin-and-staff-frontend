import { Card, CardContent } from '@/shared/components/ui/card';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Label } from '@/shared/components/ui/label';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { Button } from '@/shared/components/ui/button';
import { FileText, ExternalLink, AlertTriangle } from 'lucide-react';

interface TermsAndConditionsProps {
  accepted: boolean;
  onAcceptChange: (accepted: boolean) => void;
  required?: boolean;
}

export function TermsAndConditions({ accepted, onAcceptChange, required = true }: TermsAndConditionsProps) {
  return (
    <Card className={required && !accepted ? 'border-destructive' : ''}>
      <CardContent className="pt-6 space-y-4">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-slate-100 dark:bg-slate-800 p-3">
            <FileText className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-lg mb-2">Terms & Conditions</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Please review and accept our terms and conditions to proceed with job posting
            </p>
            
            <div className="bg-muted/50 rounded-lg p-4 mb-4 max-h-48 overflow-y-auto text-sm space-y-2">
              <p className="font-medium">HRM8 Job Posting Terms & Conditions</p>
              <p>By posting a job on HRM8, you agree to:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Provide accurate and truthful job information</li>
                <li>Comply with all applicable employment laws</li>
                <li>Not discriminate based on protected characteristics</li>
                <li>Pay all agreed fees in accordance with selected payment terms</li>
                <li>Allow HRM8 to promote your job on external platforms if selected</li>
                <li>Refund policy: No refunds after job board promotion begins</li>
                <li>You retain ownership of all candidate data collected</li>
              </ul>
              <p className="text-xs pt-2">Last updated: January 2025</p>
            </div>
            
            <Button variant="link" className="h-auto p-0 text-primary" size="sm">
              <ExternalLink className="h-3 w-3 mr-1" />
              View Full Terms & Conditions
            </Button>
          </div>
        </div>
        
        <div className="flex items-start gap-3 pt-3 border-t">
          <Checkbox
            id="terms-acceptance"
            checked={accepted}
            onCheckedChange={(checked) => onAcceptChange(checked as boolean)}
          />
          <Label htmlFor="terms-acceptance" className="cursor-pointer leading-tight">
            I have read and agree to the HRM8 Terms & Conditions, and confirm that all job information provided is accurate and compliant with applicable laws
            {required && <span className="text-destructive ml-1">*</span>}
          </Label>
        </div>
        
        {required && !accepted && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              You must accept the Terms & Conditions to proceed with posting your job
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
