import { UseFormReturn } from 'react-hook-form';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Label } from '@/shared/components/ui/label';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import type { BackgroundCheckType } from '@/types/backgroundCheck';
import { BACKGROUND_CHECK_PRICING } from '@/shared/lib/backgroundChecks/pricingConstants';

export interface BackgroundCheckWizardFormData {
  checkTypes: BackgroundCheckType[];
  referees: Array<{
    name: string;
    email: string;
    phone?: string;
    relationship: 'manager' | 'colleague' | 'direct-report' | 'client' | 'other';
    relationshipDetails?: string;
    companyName?: string;
    position?: string;
  }>;
  questionnaireTemplateId: string;
}

interface SelectChecksStepProps {
  form: UseFormReturn<BackgroundCheckWizardFormData>;
}

export function SelectChecksStep({ form }: SelectChecksStepProps) {
  const selectedChecks = form.watch('checkTypes') || [];
  
  const toggleCheck = (checkType: BackgroundCheckType) => {
    const current = form.getValues('checkTypes') || [];
    if (current.includes(checkType)) {
      form.setValue('checkTypes', current.filter(t => t !== checkType));
    } else {
      form.setValue('checkTypes', [...current, checkType]);
    }
  };

  const totalCost = selectedChecks.reduce((sum, type) => {
    return sum + (BACKGROUND_CHECK_PRICING[type]?.cost || 0);
  }, 0);

  const availableChecks: BackgroundCheckType[] = [
    'reference',
    'criminal',
    'education',
    'identity',
    'employment',
    'credit',
    'drug-screen',
    'professional-license'
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Select Background Checks</h3>
        <p className="text-sm text-muted-foreground">
          Choose one or more background checks to perform. Each check is priced separately.
        </p>
      </div>

      <div className="grid gap-4">
        {availableChecks.map((checkType) => {
          const pricing = BACKGROUND_CHECK_PRICING[checkType];
          const isSelected = selectedChecks.includes(checkType);

          return (
            <Card
              key={checkType}
              className={`cursor-pointer transition-colors ${
                isSelected ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
              }`}
              onClick={() => toggleCheck(checkType)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => toggleCheck(checkType)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">{pricing.icon}</span>
                      <Label className="text-base font-medium cursor-pointer">
                        {pricing.name}
                      </Label>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {pricing.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs">
                      <Badge variant="secondary">{pricing.provider}</Badge>
                      <span className="text-muted-foreground">
                        ⏱️ {pricing.estimatedTime}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold">${pricing.cost}</div>
                    <div className="text-xs text-muted-foreground">per check</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {selectedChecks.length === 0 && (
        <div className="text-center py-8 text-sm text-muted-foreground">
          Please select at least one background check to continue
        </div>
      )}

      {selectedChecks.length > 0 && (
        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold">Total Cost</div>
                <div className="text-sm text-muted-foreground">
                  {selectedChecks.length} check{selectedChecks.length !== 1 ? 's' : ''} selected
                </div>
              </div>
              <div className="text-2xl font-bold">${totalCost}</div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
