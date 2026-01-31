import { Card, CardContent } from '@/shared/components/ui/card';
import { Label } from '@/shared/components/ui/label';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { JOBTARGET_BUDGET_TIERS } from '@/shared/types/billing';
import { Check, Sparkles, AlertTriangle, Target } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface JobBoardBudgetSelectorProps {
  selectedTier: string;
  customAmount: number;
  onTierChange: (tier: string) => void;
  onCustomAmountChange: (amount: number) => void;
  serviceType: 'self-managed' | 'shortlisting' | 'full-service' | 'executive-search' | 'rpo';
}

export function JobBoardBudgetSelector({
  selectedTier,
  customAmount,
  onTierChange,
  onCustomAmountChange,
  serviceType
}: JobBoardBudgetSelectorProps) {
  const isSelfManaged = serviceType === 'self-managed';
  
  return (
    <div className="space-y-4">
      <div>
        <Label className="text-base font-semibold">Select Promotion Budget</Label>
        <p className="text-sm text-muted-foreground mt-1">
          {isSelfManaged 
            ? 'Choose how much to invest in promoting your job to external candidates'
            : 'Allocate budget for your consultant to distribute across job boards'}
        </p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {JOBTARGET_BUDGET_TIERS.filter(t => t.id !== 'custom').map((tier) => {
          const isSelected = selectedTier === tier.id;
          const isNone = tier.id === 'none';
          
          return (
            <Card
              key={tier.id}
              className={cn(
                "cursor-pointer transition-all hover:shadow-md relative",
                isSelected && !isNone && "border-primary border-2 shadow-md",
                isSelected && isNone && "border-destructive border-2 shadow-md",
                isNone && !isSelected && "border-dashed opacity-70"
              )}
              onClick={() => onTierChange(tier.id)}
            >
              <CardContent className="pt-6 text-center relative pb-4">
                {tier.recommended && (
                  <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-primary">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Recommended
                  </Badge>
                )}
                {isSelected && !isNone && (
                  <div className="absolute top-2 right-2">
                    <div className="rounded-full bg-primary text-primary-foreground p-1">
                      <Check className="h-3 w-3" />
                    </div>
                  </div>
                )}
                {isNone && (
                  <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-destructive" />
                )}
                {!isNone && tier.id !== 'none' && (
                  <Target className="h-8 w-8 mx-auto mb-2 text-primary" />
                )}
                <div className={cn(
                  "text-2xl font-bold mb-1",
                  isNone ? "text-destructive" : "text-primary"
                )}>
                  {tier.amount === 0 && !isNone ? 'FREE' : isNone ? '$0' : `$${tier.amount.toLocaleString()}`}
                </div>
                <div className="text-sm font-medium mb-1">{tier.name}</div>
                <div className="text-xs text-muted-foreground mb-2">
                  {tier.description}
                </div>
                {tier.reach && (
                  <div className="text-xs font-medium text-primary">
                    {tier.reach}
                  </div>
                )}
                {tier.warning && isSelected && (
                  <div className="text-xs text-destructive font-medium mt-2">
                    Not recommended
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      <Card
        className={cn(
          "cursor-pointer transition-all hover:shadow-md",
          selectedTier === 'custom' && "border-primary border-2 shadow-md"
        )}
        onClick={() => onTierChange('custom')}
      >
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Label className="font-semibold">Custom Budget</Label>
              <p className="text-sm text-muted-foreground">
                Enter your own promotion budget amount
              </p>
            </div>
            {selectedTier === 'custom' && (
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">$</span>
                <Input
                  type="number"
                  min="0"
                  step="100"
                  value={customAmount || ''}
                  onChange={(e) => onCustomAmountChange(Number(e.target.value))}
                  className="w-32 text-xl font-bold"
                  placeholder="0"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {selectedTier === 'none' && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Warning:</strong> Skipping external job board promotion means your job will only appear on HRM8's platform. 
            This dramatically reduces your reach and you're unlikely to receive qualified applicants. 
            Consider selecting at least the Basic tier ($500) for better results.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
