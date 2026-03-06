import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine } from 'recharts';
import { getRevenueRetention } from '@/shared/lib/addons/cohortAnalytics';
import { Badge } from "@/shared/components/ui/badge";
import { TrendingUp, Info } from 'lucide-react';
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/shared/components/ui/tooltip";

export function RevenueRetentionChart() {
  const data = getRevenueRetention();
  
  // Calculate averages
  const avgNetRetention = data.reduce((sum, d) => sum + d.netRetention, 0) / data.length;
  const avgGrossRetention = data.reduce((sum, d) => sum + d.grossRetention, 0) / data.length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              Revenue Retention Curves
              <TooltipProvider>
                <UITooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="font-semibold mb-2">Revenue Retention Metrics:</p>
                    <p className="text-xs mb-1"><strong>Gross Retention:</strong> Revenue retained from existing customers (excluding expansion)</p>
                    <p className="text-xs mb-1"><strong>Net Retention:</strong> Includes expansion revenue from upsells and cross-sells</p>
                    <p className="text-xs"><strong>Target:</strong> Net retention &gt;100% indicates growth from existing customers</p>
                  </TooltipContent>
                </UITooltip>
              </TooltipProvider>
            </CardTitle>
            <CardDescription>Gross and net revenue retention with expansion impact</CardDescription>
          </div>
          <div className="text-right">
            <Badge variant="default" className="gap-1 bg-green-600 mb-1">
              <TrendingUp className="h-3 w-3" />
              {avgNetRetention.toFixed(1)}% Net
            </Badge>
            <div className="text-xs text-muted-foreground">
              {avgGrossRetention.toFixed(1)}% Gross
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="month" 
              className="text-xs"
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis 
              className="text-xs"
              domain={[85, 110]}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--background))', 
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
              formatter={(value: number, name: string) => {
                const nameMap: Record<string, string> = {
                  grossRetention: 'Gross Retention',
                  netRetention: 'Net Retention',
                  expansion: 'Expansion',
                  contraction: 'Contraction'
                };
                return [`${value}%`, nameMap[name] || name];
              }}
            />
            <Legend 
              formatter={(value) => {
                const nameMap: Record<string, string> = {
                  grossRetention: 'Gross Retention',
                  netRetention: 'Net Retention',
                  expansion: 'Expansion Revenue',
                  contraction: 'Contraction'
                };
                return nameMap[value] || value;
              }}
            />
            
            {/* 100% reference line */}
            <ReferenceLine 
              y={100} 
              stroke="hsl(var(--muted-foreground))" 
              strokeDasharray="3 3"
              label={{ value: '100%', position: 'right' }}
            />
            
            <Line
              type="monotone"
              dataKey="grossRetention"
              stroke="hsl(var(--chart-2))"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
            <Line
              type="monotone"
              dataKey="netRetention"
              stroke="hsl(var(--chart-1))"
              strokeWidth={3}
              dot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="expansion"
              stroke="hsl(var(--chart-3))"
              strokeWidth={1.5}
              strokeDasharray="5 5"
              dot={{ r: 2 }}
            />
            <Line
              type="monotone"
              dataKey="contraction"
              stroke="hsl(var(--destructive))"
              strokeWidth={1.5}
              strokeDasharray="5 5"
              dot={{ r: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
        
        <div className="mt-4 p-4 bg-muted/50 rounded-lg">
          <h4 className="font-semibold text-sm mb-2">Key Insights</h4>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-muted-foreground">Net Retention Rate:</span>
              <p className="font-semibold text-green-600 dark:text-green-400">
                {avgNetRetention > 100 ? '✓' : '!'} {avgNetRetention.toFixed(1)}%
                {avgNetRetention > 100 && ' - Growing from existing customers'}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Gross Retention Rate:</span>
              <p className="font-semibold">{avgGrossRetention.toFixed(1)}%</p>
            </div>
            <div>
              <span className="text-muted-foreground">Avg Expansion:</span>
              <p className="font-semibold text-green-600 dark:text-green-400">
                +{(data.reduce((sum, d) => sum + d.expansion, 0) / data.length).toFixed(1)}%
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Avg Contraction:</span>
              <p className="font-semibold text-orange-600 dark:text-orange-400">
                -{(data.reduce((sum, d) => sum + d.contraction, 0) / data.length).toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
