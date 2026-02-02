import { StandardChartCard } from "./StandardChartCard";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, ComposedChart } from "recharts";
import { TrendingUp, TrendingDown, Minus, Download, AlertCircle } from "lucide-react";
import { ForecastResult, getForecastSummary } from "@/shared/lib/forecasting/revenueForecast";
import { Badge } from "@/shared/components/ui/badge";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";

interface RevenueProjectionChartProps {
  title: string;
  description?: string;
  forecast: ForecastResult;
  onDownload?: () => void;
}

export function RevenueProjectionChart({ 
  title, 
  description = "Historical revenue and projected trends with confidence intervals",
  forecast,
  onDownload 
}: RevenueProjectionChartProps) {
  const summary = getForecastSummary(forecast);
  
  // Combine historical and forecast data for chart
  const chartData = [
    ...forecast.historicalData.map(point => ({
      month: point.month,
      actual: point.actual,
      predicted: null,
      upperBound: null,
      lowerBound: null
    })),
    ...forecast.forecastData.map(point => ({
      month: point.month,
      actual: null,
      predicted: point.predicted,
      upperBound: point.upperBound,
      lowerBound: point.lowerBound
    }))
  ];

  const getTrendIcon = () => {
    if (forecast.trend === 'growing') return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (forecast.trend === 'declining') return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  const getConfidenceBadge = () => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      high: "default",
      medium: "secondary",
      low: "destructive"
    };
    return (
      <Badge variant={variants[summary.confidenceLevel]}>
        {summary.confidenceLevel.toUpperCase()} CONFIDENCE
      </Badge>
    );
  };

  const getRiskBadge = () => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      low: "default",
      medium: "secondary",
      high: "destructive"
    };
    return (
      <Badge variant={variants[summary.riskLevel]}>
        {summary.riskLevel.toUpperCase()} RISK
      </Badge>
    );
  };

  return (
    <StandardChartCard
      title={title}
      description={description}
      showDatePicker={false}
      onDownload={onDownload}
      menuItems={[
        { label: "Download Forecast", icon: <Download className="h-4 w-4" />, onClick: onDownload || (() => {}) }
      ]}
    >
      <div className="space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg">
          <div>
            <div className="text-xs text-muted-foreground mb-1">Forecast Accuracy</div>
            <div className="text-lg font-semibold">{forecast.accuracy}%</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">Avg. Growth Rate</div>
            <div className="text-lg font-semibold flex items-center gap-1">
              {getTrendIcon()}
              {Math.abs(forecast.averageGrowthRate)}%
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">Confidence Level</div>
            <div className="mt-1">{getConfidenceBadge()}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">Risk Assessment</div>
            <div className="mt-1">{getRiskBadge()}</div>
          </div>
        </div>

        {/* Risk Alert */}
        {summary.riskLevel === 'high' && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Revenue is projected to decline. Consider implementing growth strategies or reviewing pricing models.
            </AlertDescription>
          </Alert>
        )}

        {/* Chart */}
        <ResponsiveContainer width="100%" height={350}>
          <ComposedChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="month" 
              className="text-xs"
              tick={{ fontSize: 11 }}
            />
            <YAxis 
              className="text-xs"
              tick={{ fontSize: 11 }}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip 
              formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
              contentStyle={{ fontSize: '12px' }}
            />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            
            {/* Confidence Interval Area */}
            <Area
              type="monotone"
              dataKey="upperBound"
              stroke="none"
              fill="hsl(var(--primary))"
              fillOpacity={0.1}
              name="Upper Confidence"
            />
            <Area
              type="monotone"
              dataKey="lowerBound"
              stroke="none"
              fill="hsl(var(--primary))"
              fillOpacity={0.1}
              name="Lower Confidence"
            />
            
            {/* Historical Actual Revenue */}
            <Line
              type="monotone"
              dataKey="actual"
              stroke="hsl(var(--chart-1))"
              strokeWidth={2}
              name="Actual Revenue"
              dot={{ r: 4 }}
              connectNulls={false}
            />
            
            {/* Predicted Revenue */}
            <Line
              type="monotone"
              dataKey="predicted"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              strokeDasharray="5 5"
              name="Forecasted Revenue"
              dot={{ r: 4 }}
              connectNulls={false}
            />
          </ComposedChart>
        </ResponsiveContainer>

        {/* Forecast Insights */}
        <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
          <p>
            <strong>Projected Revenue (Next {forecast.forecastData.length} Months):</strong> ${summary.projectedRevenue.toLocaleString()}
          </p>
          <p>
            <strong>Expected Growth:</strong> {summary.projectedGrowth > 0 ? '+' : ''}{summary.projectedGrowth}% vs. current month
          </p>
          <p>
            <strong>Methodology:</strong> Linear regression with 95% confidence intervals. Confidence decreases for longer-term predictions.
          </p>
        </div>
      </div>
    </StandardChartCard>
  );
}
