import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Phone, GraduationCap, DollarSign, Sparkles, Headphones } from 'lucide-react';
import { InterventionType } from '@/types/churnPrediction';

export function InterventionStrategiesCard() {
  const strategies = [
    {
      type: 'outreach' as InterventionType,
      icon: Phone,
      title: 'Executive Check-ins',
      description: 'High-touch outreach for critical accounts',
      effectiveness: 85,
      avgImpact: '15-20%',
      cost: 'Low',
      applicableTo: 8
    },
    {
      type: 'training' as InterventionType,
      icon: GraduationCap,
      title: 'Product Training',
      description: 'Increase engagement through education',
      effectiveness: 72,
      avgImpact: '10-15%',
      cost: 'Low',
      applicableTo: 12
    },
    {
      type: 'discount' as InterventionType,
      icon: DollarSign,
      title: 'Loyalty Incentives',
      description: 'Discounts for early renewal commitment',
      effectiveness: 78,
      avgImpact: '20-25%',
      cost: 'High',
      applicableTo: 15
    },
    {
      type: 'upgrade' as InterventionType,
      icon: Sparkles,
      title: 'Feature Upgrades',
      description: 'Trial premium features to show value',
      effectiveness: 68,
      avgImpact: '15-18%',
      cost: 'Medium',
      applicableTo: 10
    },
    {
      type: 'support' as InterventionType,
      icon: Headphones,
      title: 'Dedicated Support',
      description: 'Priority support for faster resolutions',
      effectiveness: 65,
      avgImpact: '8-12%',
      cost: 'Medium',
      applicableTo: 18
    }
  ];

  const getCostColor = (cost: string) => {
    switch (cost) {
      case 'High': return 'bg-red-100 text-red-800 border-red-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Intervention Strategies</CardTitle>
        <CardDescription>
          Proven strategies to reduce churn and retain customers
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {strategies.map((strategy) => {
            const Icon = strategy.icon;
            return (
              <div key={strategy.type} className="border rounded-lg p-4">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold mb-1">{strategy.title}</h4>
                        <p className="text-sm text-muted-foreground">{strategy.description}</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Apply
                      </Button>
                    </div>

                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Effectiveness:</span>
                        <span className="font-medium">{strategy.effectiveness}%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Impact:</span>
                        <span className="font-medium">{strategy.avgImpact}</span>
                      </div>
                      <Badge variant="outline" className={getCostColor(strategy.cost)}>
                        {strategy.cost} Cost
                      </Badge>
                    </div>

                    <p className="text-xs text-muted-foreground">
                      Applicable to <span className="font-medium">{strategy.applicableTo} at-risk customers</span>
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
