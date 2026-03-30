/**
 * Renders assistant tool `_viz` recipes using the shared ChartContainer (shadcn/recharts).
 * Lazy-loaded from AiAssistantSidebar so simple chats avoid eager Recharts cost.
 */

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/shared/components/ui/chart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { cn } from "@/shared/lib/utils";
import { BarChart2 } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, XAxis, YAxis } from "recharts";

type BarRecipe = {
  recipeVersion: 1;
  chartType: "bar";
  title: string;
  subtitle?: string;
  xKey: string;
  yKey: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  data: Record<string, unknown>[];
};

type PieRecipe = {
  recipeVersion: 1;
  chartType: "pie";
  title: string;
  subtitle?: string;
  nameKey: string;
  valueKey: string;
  data: Record<string, unknown>[];
};

type MultiRecipe = {
  recipeVersion: 1;
  chartType: "multi";
  title: string;
  subtitle?: string;
  panels: Array<BarRecipe | PieRecipe>;
};

type LineRecipe = {
  recipeVersion: 1;
  chartType: "line";
  title: string;
  subtitle?: string;
  xKey: string;
  series: Array<{ key: string; label: string }>;
  data: Record<string, unknown>[];
};

type EmptyRecipe = {
  recipeVersion: 1;
  chartType: "empty";
  title: string;
  message: string;
  metrics?: {
    totalApplications?: number;
    avgTimeToHireDays?: number;
    hiredCount?: number;
  };
};

/** Theme chart tokens (see globals.css / chart.tsx) */
const BAR_FILLS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
] as const;

function isBarRecipe(v: unknown): v is BarRecipe {
  if (!v || typeof v !== "object") return false;
  const o = v as Record<string, unknown>;
  return o.recipeVersion === 1 && o.chartType === "bar" && Array.isArray(o.data) && typeof o.xKey === "string" && typeof o.yKey === "string";
}

function isPieRecipe(v: unknown): v is PieRecipe {
  if (!v || typeof v !== "object") return false;
  const o = v as Record<string, unknown>;
  return (
    o.recipeVersion === 1 &&
    o.chartType === "pie" &&
    Array.isArray(o.data) &&
    typeof o.nameKey === "string" &&
    typeof o.valueKey === "string"
  );
}

function isMultiRecipe(v: unknown): v is MultiRecipe {
  if (!v || typeof v !== "object") return false;
  const o = v as Record<string, unknown>;
  return o.recipeVersion === 1 && o.chartType === "multi" && Array.isArray(o.panels);
}

function isEmptyRecipe(v: unknown): v is EmptyRecipe {
  if (!v || typeof v !== "object") return false;
  const o = v as Record<string, unknown>;
  return o.recipeVersion === 1 && o.chartType === "empty" && typeof o.title === "string" && typeof o.message === "string";
}

function isLineRecipe(v: unknown): v is LineRecipe {
  if (!v || typeof v !== "object") return false;
  const o = v as Record<string, unknown>;
  return (
    o.recipeVersion === 1 &&
    o.chartType === "line" &&
    typeof o.xKey === "string" &&
    Array.isArray(o.series) &&
    Array.isArray(o.data)
  );
}

const LINE_STROKES = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
] as const;

function LineRecipeChart({ recipe, className }: { recipe: LineRecipe; className?: string }) {
  const { xKey, data, title, subtitle, series } = recipe;
  const chartConfig = Object.fromEntries(
    series.map((s, i) => [
      s.key,
      { label: s.label, color: LINE_STROKES[i % LINE_STROKES.length] },
    ]),
  );

  return (
    <Card
      className={cn(
        "mt-2 overflow-hidden border-border/70 bg-card shadow-sm ring-1 ring-border/40",
        className,
      )}
    >
      <CardHeader className="space-y-0.5 border-b border-border/40 bg-muted/20 px-4 py-3">
        <div className="flex items-start gap-2">
          <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
            <BarChart2 className="h-3.5 w-3.5" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <CardTitle className="text-sm font-semibold leading-snug">{title}</CardTitle>
            {subtitle ? <CardDescription className="mt-0.5 text-[11px] leading-snug">{subtitle}</CardDescription> : null}
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-2 pb-3 pt-3 sm:px-3">
        <ChartContainer config={chartConfig} className="h-[min(240px,42vh)] w-full min-h-[200px]">
          <LineChart data={data} margin={{ left: 0, right: 4, top: 12, bottom: 8 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/60" />
            <XAxis
              dataKey={xKey}
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={6}
              width={36}
              allowDecimals={false}
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
            />
            <ChartTooltip
              cursor={{ stroke: "hsl(var(--border))" }}
              content={<ChartTooltipContent className="border-border/80 shadow-md" />}
            />
            {series.map((s, i) => (
              <Line
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.label}
                stroke={LINE_STROKES[i % LINE_STROKES.length]}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 3 }}
              />
            ))}
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

function EmptyRecipePanel({ recipe }: { recipe: EmptyRecipe }) {
  const m = recipe.metrics;
  const hasMetrics =
    m &&
    (m.totalApplications !== undefined || m.avgTimeToHireDays !== undefined || m.hiredCount !== undefined);

  return (
    <Card className="mt-2 overflow-hidden border-dashed border-border/80 bg-gradient-to-b from-muted/30 to-muted/10 shadow-sm">
      <CardHeader className="space-y-1 px-4 pb-2 pt-4">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-muted/80 text-muted-foreground">
            <BarChart2 className="h-3.5 w-3.5" aria-hidden />
          </span>
          <CardTitle className="text-sm font-semibold leading-tight">{recipe.title}</CardTitle>
        </div>
        <CardDescription className="text-xs leading-relaxed">{recipe.message}</CardDescription>
      </CardHeader>
      {hasMetrics ? (
        <CardContent className="px-4 pb-4 pt-0">
          <div className="grid grid-cols-3 gap-2">
            {m!.totalApplications !== undefined ? (
              <div className="rounded-lg border border-border/50 bg-background/80 px-2.5 py-2 text-center shadow-sm">
                <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Applications</p>
                <p className="mt-0.5 font-mono text-lg font-semibold tabular-nums text-foreground">{m!.totalApplications}</p>
              </div>
            ) : null}
            {m!.avgTimeToHireDays !== undefined ? (
              <div className="rounded-lg border border-border/50 bg-background/80 px-2.5 py-2 text-center shadow-sm">
                <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Avg. hire</p>
                <p className="mt-0.5 font-mono text-lg font-semibold tabular-nums text-foreground">{m!.avgTimeToHireDays}d</p>
              </div>
            ) : null}
            {m!.hiredCount !== undefined ? (
              <div className="rounded-lg border border-border/50 bg-background/80 px-2.5 py-2 text-center shadow-sm">
                <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Hired</p>
                <p className="mt-0.5 font-mono text-lg font-semibold tabular-nums text-foreground">{m!.hiredCount}</p>
              </div>
            ) : null}
          </div>
          <p className="mt-3 text-center text-[10px] text-muted-foreground/90">No bars to show — all counts are zero for this filter.</p>
        </CardContent>
      ) : (
        <CardContent className="px-4 pb-4 pt-0">
          <p className="text-center text-[10px] text-muted-foreground/90">No data in range to visualize.</p>
        </CardContent>
      )}
    </Card>
  );
}

function PieRecipeChart({ recipe, className }: { recipe: PieRecipe; className?: string }) {
  const { data, title, subtitle, nameKey, valueKey } = recipe;
  const chartConfig = Object.fromEntries(
    data.map((row, i) => [
      String(row[nameKey] ?? i),
      { label: String(row[nameKey] ?? i), color: BAR_FILLS[i % BAR_FILLS.length] },
    ]),
  );

  return (
    <Card
      className={cn(
        "mt-2 overflow-hidden border-border/70 bg-card shadow-sm ring-1 ring-border/40",
        className,
      )}
    >
      <CardHeader className="space-y-0.5 border-b border-border/40 bg-muted/20 px-4 py-3">
        <div className="flex items-start gap-2">
          <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
            <BarChart2 className="h-3.5 w-3.5" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <CardTitle className="text-sm font-semibold leading-snug">{title}</CardTitle>
            {subtitle ? <CardDescription className="mt-0.5 text-[11px] leading-snug">{subtitle}</CardDescription> : null}
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-2 pb-3 pt-3 sm:px-3">
        <ChartContainer config={chartConfig} className="mx-auto h-[min(220px,38vh)] w-full min-h-[200px]">
          <PieChart margin={{ top: 4, right: 8, bottom: 4, left: 8 }}>
            <ChartTooltip content={<ChartTooltipContent className="border-border/80 shadow-md" />} />
            <Pie
              data={data}
              dataKey={valueKey}
              nameKey={nameKey}
              cx="50%"
              cy="50%"
              innerRadius={44}
              outerRadius={72}
              paddingAngle={2}
              stroke="hsl(var(--background))"
              strokeWidth={1}
            >
              {data.map((_, index) => (
                <Cell key={`slice-${index}`} fill={BAR_FILLS[index % BAR_FILLS.length]} />
              ))}
            </Pie>
            <Legend
              wrapperStyle={{ fontSize: 11 }}
              formatter={(value) => <span className="text-muted-foreground">{value}</span>}
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

function BarRecipeChart({ recipe, className }: { recipe: BarRecipe; className?: string }) {
  const { xKey, yKey, data, title, subtitle, xAxisLabel, yAxisLabel } = recipe;
  const chartConfig = {
    [yKey]: {
      label: yAxisLabel || yKey,
      color: "hsl(var(--chart-1))",
    },
  };

  const maxVal = Math.max(0, ...data.map((row) => Number(row[yKey]) || 0));
  const yDomainMax = maxVal <= 0 ? 1 : Math.ceil(maxVal * 1.15);

  return (
    <Card
      className={cn(
        "mt-2 overflow-hidden border-border/70 bg-card shadow-sm ring-1 ring-border/40",
        className,
      )}
    >
      <CardHeader className="space-y-0.5 border-b border-border/40 bg-muted/20 px-4 py-3">
        <div className="flex items-start gap-2">
          <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
            <BarChart2 className="h-3.5 w-3.5" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <CardTitle className="text-sm font-semibold leading-snug">{title}</CardTitle>
            {subtitle ? <CardDescription className="mt-0.5 text-[11px] leading-snug">{subtitle}</CardDescription> : null}
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-2 pb-3 pt-3 sm:px-3">
        <ChartContainer config={chartConfig} className="h-[min(240px,42vh)] w-full min-h-[200px]">
          <BarChart
            data={data}
            margin={{ left: 0, right: 4, top: 12, bottom: 8 }}
            barCategoryGap="18%"
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/60" />
            <XAxis
              dataKey={xKey}
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              angle={data.length > 5 ? -30 : 0}
              textAnchor={data.length > 5 ? "end" : "middle"}
              height={data.length > 5 ? 52 : 32}
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              label={
                xAxisLabel
                  ? {
                      value: xAxisLabel,
                      position: "insideBottom",
                      offset: data.length > 5 ? -2 : -4,
                      fontSize: 10,
                      fill: "hsl(var(--muted-foreground))",
                    }
                  : undefined
              }
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={6}
              width={36}
              domain={[0, yDomainMax]}
              allowDecimals={false}
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              label={
                yAxisLabel
                  ? {
                      value: yAxisLabel,
                      angle: -90,
                      position: "insideLeft",
                      style: { fontSize: 10, fill: "hsl(var(--muted-foreground))" },
                    }
                  : undefined
              }
            />
            <ChartTooltip
              cursor={{ fill: "hsl(var(--muted) / 0.2)", radius: 6 }}
              content={<ChartTooltipContent className="border-border/80 shadow-md" />}
            />
            <Bar dataKey={yKey} radius={[6, 6, 0, 0]} maxBarSize={52}>
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={BAR_FILLS[index % BAR_FILLS.length]} className="drop-shadow-sm" />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

export default function AssistantToolVizChart({ recipe }: { recipe: unknown }) {
  if (isEmptyRecipe(recipe)) {
    return <EmptyRecipePanel recipe={recipe} />;
  }

  if (isLineRecipe(recipe)) {
    return <LineRecipeChart recipe={recipe} />;
  }

  if (isMultiRecipe(recipe)) {
    return (
      <div className="mt-1 space-y-3">
        <div className="rounded-lg border border-border/50 bg-muted/15 px-3 py-2 shadow-sm">
          <p className="text-sm font-semibold text-foreground">{recipe.title}</p>
          {recipe.subtitle ? <p className="mt-0.5 text-[11px] text-muted-foreground">{recipe.subtitle}</p> : null}
        </div>
        {recipe.panels.map((panel, i) => {
          if (isBarRecipe(panel)) {
            return <BarRecipeChart key={i} recipe={panel} className={cn(i > 0 && "mt-0")} />;
          }
          if (isPieRecipe(panel)) {
            return <PieRecipeChart key={i} recipe={panel} className={cn(i > 0 && "mt-0")} />;
          }
          return null;
        })}
      </div>
    );
  }

  if (isPieRecipe(recipe)) {
    return <PieRecipeChart recipe={recipe} />;
  }

  if (isBarRecipe(recipe)) {
    return <BarRecipeChart recipe={recipe} />;
  }

  return null;
}
