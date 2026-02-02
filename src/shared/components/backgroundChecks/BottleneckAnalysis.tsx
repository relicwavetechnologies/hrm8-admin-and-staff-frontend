import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { AlertTriangle, Clock, TrendingDown, ExternalLink } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { toast } from '@/shared/hooks/use-toast';
import type { BottleneckInsight } from '@/shared/lib/backgroundChecks/analyticsService';

interface BottleneckAnalysisProps {
  insights: BottleneckInsight[];
}

export function BottleneckAnalysis({ insights }: BottleneckAnalysisProps) {
  const navigate = useNavigate();

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'medium':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'low':
        return <TrendingDown className="h-5 w-5 text-green-500" />;
      default:
        return null;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'high':
        return <Badge variant="destructive">High Priority</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-500">Medium Priority</Badge>;
      case 'low':
        return <Badge className="bg-green-500">Low Priority</Badge>;
      default:
        return null;
    }
  };

  const handleViewAffectedChecks = (stage: string) => {
    let statusFilter = '';
    
    // Map stage to status filter
    if (stage.toLowerCase().includes('consent')) {
      statusFilter = 'pending-consent';
    } else if (stage.toLowerCase().includes('verification') || stage.toLowerCase().includes('process')) {
      statusFilter = 'in-progress';
    } else if (stage.toLowerCase().includes('review')) {
      statusFilter = 'issues-found';
    }
    
    if (statusFilter) {
      const params = new URLSearchParams({ status: statusFilter });
      navigate(`/background-checks?${params.toString()}`);
      
      toast({
        title: "Filters Applied",
        description: `Viewing checks in ${stage} stage`,
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bottleneck Analysis</CardTitle>
        <CardDescription>Identified delays and recommendations for improvement. Click to view affected checks.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {insights.map((insight, index) => (
            <div 
              key={index}
              className="border border-border rounded-lg p-4 space-y-3 transition-colors hover:bg-accent/50"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3 flex-1">
                  {getSeverityIcon(insight.severity)}
                  <div className="flex-1">
                    <h4 className="font-semibold">{insight.stage}</h4>
                    <p className="text-sm text-muted-foreground">
                      Average Duration: <span className="font-medium text-foreground">{insight.avgDuration} days</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getSeverityBadge(insight.severity)}
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleViewAffectedChecks(insight.stage)}
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    View Checks
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Checks Affected:</span>
                  <span className="ml-2 font-medium">{insight.checksAffected}</span>
                </div>
              </div>
              
              <div className="pt-2 border-t border-border">
                <p className="text-sm">
                  <span className="font-medium">Recommendation:</span>{' '}
                  <span className="text-muted-foreground">{insight.recommendation}</span>
                </p>
              </div>
            </div>
          ))}
          
          {insights.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <TrendingDown className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No significant bottlenecks detected</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
