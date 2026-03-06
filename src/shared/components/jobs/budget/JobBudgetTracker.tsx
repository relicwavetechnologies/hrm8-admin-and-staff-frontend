import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Progress } from "@/shared/components/ui/progress";
import { Badge } from "@/shared/components/ui/badge";
import { DollarSign, TrendingUp } from "lucide-react";

interface BudgetItem {
  category: string;
  allocated: number;
  spent: number;
  remaining: number;
}

interface JobBudgetTrackerProps {
  jobId: string;
}

export function JobBudgetTracker({ jobId: _jobId }: JobBudgetTrackerProps) {
  // Mock data - in real app, this would come from a service
  const budgetItems: BudgetItem[] = [
    { category: "Job Board Posting", allocated: 1500, spent: 1200, remaining: 300 },
    { category: "Advertising", allocated: 3000, spent: 2100, remaining: 900 },
    { category: "Agency Fees", allocated: 5000, spent: 0, remaining: 5000 },
    { category: "Other Costs", allocated: 500, spent: 250, remaining: 250 },
  ];

  const totalAllocated = budgetItems.reduce((sum, item) => sum + item.allocated, 0);
  const totalSpent = budgetItems.reduce((sum, item) => sum + item.spent, 0);
  const totalRemaining = totalAllocated - totalSpent;
  const spentPercentage = (totalSpent / totalAllocated) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Budget Tracking
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Budget */}
        <div className="p-4 bg-muted rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Total Budget</span>
            <span className="text-2xl font-bold">${totalAllocated.toLocaleString()}</span>
          </div>
          <Progress value={spentPercentage} className="h-2" />
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Spent</p>
              <p className="font-semibold">${totalSpent.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="text-muted-foreground">Remaining</p>
              <p className="font-semibold">${totalRemaining.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Budget Breakdown */}
        <div className="space-y-3">
          <h4 className="font-medium">Budget Breakdown</h4>
          {budgetItems.map((item) => {
            const itemPercentage = (item.spent / item.allocated) * 100;
            const isOverBudget = item.spent > item.allocated;
            const isNearLimit = itemPercentage > 80 && !isOverBudget;

            return (
              <div key={item.category} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{item.category}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">
                      ${item.spent.toLocaleString()} / ${item.allocated.toLocaleString()}
                    </span>
                    {isOverBudget && (
                      <Badge variant="coral" className="text-xs">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        Over
                      </Badge>
                    )}
                    {isNearLimit && (
                      <Badge variant="orange" className="text-xs">
                        Near Limit
                      </Badge>
                    )}
                  </div>
                </div>
                <Progress
                  value={Math.min(itemPercentage, 100)}
                  className="h-1.5"
                />
              </div>
            );
          })}
        </div>

        {/* ROI Estimate */}
        <div className="p-4 border rounded-lg">
          <h4 className="font-medium mb-2">Cost Efficiency</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Cost per Application</p>
              <p className="text-xl font-bold">$48</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Est. Cost per Hire</p>
              <p className="text-xl font-bold">$3,400</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
