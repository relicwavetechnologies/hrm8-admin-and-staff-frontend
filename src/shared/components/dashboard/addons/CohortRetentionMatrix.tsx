import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { getCohortRetentionData } from '@/shared/lib/addons/cohortAnalytics';
import { Badge } from "@/shared/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/shared/components/ui/tooltip";

export function CohortRetentionMatrix() {
  const cohorts = getCohortRetentionData();
  
  // Get max months for column headers
  const maxMonths = Math.max(...cohorts.map(c => Object.keys(c.retention).length));
  const monthHeaders = Array.from({ length: maxMonths }, (_, i) => `M${i}`);
  
  // Color scale for retention percentages
  const getRetentionColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30';
    if (percentage >= 75) return 'bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/20';
    if (percentage >= 60) return 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/30';
    if (percentage >= 45) return 'bg-orange-500/20 text-orange-700 dark:text-orange-400 border-orange-500/30';
    return 'bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/30';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cohort Retention Analysis</CardTitle>
        <CardDescription>Customer retention rates by acquisition month</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <TooltipProvider>
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  <th className="text-left p-2 font-semibold border-b border-border">Cohort</th>
                  <th className="text-right p-2 font-semibold border-b border-border">Size</th>
                  {monthHeaders.map(month => (
                    <th key={month} className="text-center p-2 font-semibold border-b border-border">
                      {month}
                    </th>
                  ))}
                  <th className="text-right p-2 font-semibold border-b border-border">LTV</th>
                </tr>
              </thead>
              <tbody>
                {cohorts.map((cohort, index) => (
                  <tr key={cohort.cohortMonth} className={index % 2 === 0 ? 'bg-muted/30' : ''}>
                    <td className="p-2 font-medium">{cohort.cohortMonth}</td>
                    <td className="p-2 text-right text-muted-foreground">{cohort.cohortSize}</td>
                    {monthHeaders.map(month => {
                      const retention = cohort.retention[month];
                      if (retention === undefined) {
                        return <td key={month} className="p-1"></td>;
                      }
                      
                      return (
                        <td key={month} className="p-1">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex justify-center">
                                <Badge 
                                  variant="outline" 
                                  className={`${getRetentionColor(retention)} font-mono text-xs px-2 py-0.5 cursor-help`}
                                >
                                  {retention}%
                                </Badge>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="font-semibold">{cohort.cohortMonth} - {month}</p>
                              <p>{retention}% retention</p>
                              <p>{Math.round(cohort.cohortSize * (retention / 100))} customers</p>
                            </TooltipContent>
                          </Tooltip>
                        </td>
                      );
                    })}
                    <td className="p-2 text-right font-semibold">
                      <Badge variant="secondary" className="font-mono">
                        ${cohort.ltv.toLocaleString()}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TooltipProvider>
        </div>
        
        <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
          <span className="font-semibold">Legend:</span>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-green-500/20 text-green-700 border-green-500/30">90%+</Badge>
            <span>Excellent</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-yellow-500/20 text-yellow-700 border-yellow-500/30">60-89%</Badge>
            <span>Good</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-red-500/20 text-red-700 border-red-500/30">&lt;60%</Badge>
            <span>Needs Attention</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
