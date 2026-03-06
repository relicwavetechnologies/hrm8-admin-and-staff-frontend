import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { getLTVByService } from '@/shared/lib/addons/cohortAnalytics';
import { useCurrencyFormat } from '@/contexts/CurrencyFormatContext';
import { Badge } from "@/shared/components/ui/badge";
import { TrendingUp, Users, Clock } from 'lucide-react';

export function LTVByServiceChart() {
  const { formatCurrency } = useCurrencyFormat();
  const data = getLTVByService();

  const colors = {
    aiInterviews: 'hsl(var(--chart-1))',
    assessments: 'hsl(var(--chart-2))',
    backgroundChecks: 'hsl(var(--chart-3))'
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Lifetime Value by Service</CardTitle>
        <CardDescription>Average LTV and customer metrics per add-on service</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} layout="vertical" margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <XAxis
              type="number"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => formatCurrency(value)}
            />
            <YAxis
              type="category"
              dataKey="serviceName"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12 }}
              width={120}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
              cursor={{ fill: 'transparent' }}
              formatter={(value: number) => formatCurrency(value)}
              labelFormatter={(label) => `Service: ${label}`}
            />
            <Bar dataKey="averageLTV" radius={[0, 4, 4, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[entry.service]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* Service Details */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {data.map((service) => (
            <div key={service.service} className="p-4 border rounded-lg bg-muted/30">
              <h4 className="font-semibold mb-3">{service.serviceName}</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" /> Avg LTV
                  </span>
                  <Badge variant="secondary">
                    {formatCurrency(service.averageLTV)}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Users className="h-3 w-3" /> Customers
                  </span>
                  <span className="font-medium">{service.customerCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" /> Avg Lifespan
                  </span>
                  <span className="font-medium">{service.avgLifespan} months</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Monthly Revenue</span>
                  <span className="font-medium">{formatCurrency(service.avgMonthlyRevenue)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Churn Rate</span>
                  <Badge variant={service.churnRate < 8 ? 'default' : 'destructive'}>
                    {service.churnRate}%
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
