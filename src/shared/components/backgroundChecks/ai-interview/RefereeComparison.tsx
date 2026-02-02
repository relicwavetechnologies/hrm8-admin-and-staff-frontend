import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { Separator } from '@/shared/components/ui/separator';
import type { AITranscriptionSummary } from '@/types/aiReferenceReport';
import { compareAIReports, type ComparisonResult } from '@/shared/lib/backgroundChecks/reportComparison';
import { exportComparisonPDF } from '@/shared/lib/backgroundChecks/comparisonReportPDF';
import { CheckCircle2, AlertTriangle, Info, TrendingUp, Users, Download } from 'lucide-react';
import { Progress } from '@/shared/components/ui/progress';
import { useToast } from '@/shared/hooks/use-toast';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
} from 'recharts';

interface RefereeComparisonProps {
  reports: AITranscriptionSummary[];
  candidateName?: string;
  candidateId?: string;
}

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export default function RefereeComparison({ reports, candidateName, candidateId }: RefereeComparisonProps) {
  const { toast } = useToast();
  const comparison: ComparisonResult = compareAIReports(reports);

  const handleExportPDF = () => {
    try {
      exportComparisonPDF(comparison, reports, {
        candidateName: candidateName || reports[0]?.candidateName || 'Unknown Candidate',
        candidateId: candidateId || reports[0]?.candidateId || 'N/A',
        includeCharts: true,
        includeEvidence: true,
      });
      toast({
        title: "Export successful",
        description: "Multi-referee comparison report has been downloaded as PDF.",
      });
    } catch (error) {
      console.error('Error exporting comparison PDF:', error);
      toast({
        title: "Export failed",
        description: "Failed to generate comparison PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Prepare radar chart data
  const radarData = comparison.categoryComparisons.map((cat) => {
    const dataPoint: any = { category: cat.category };
    cat.scores.forEach((score, idx) => {
      dataPoint[score.refereeName] = score.score;
    });
    dataPoint.average = cat.averageScore;
    return dataPoint;
  });

  // Prepare recommendation distribution data
  const recDistData = Object.entries(comparison.aggregateRecommendation.recommendationDistribution).map(
    ([rec, count]) => ({
      recommendation: rec.replace(/-/g, ' '),
      count,
    })
  );

  const getConsensusColor = (level: string) => {
    switch (level) {
      case 'high':
        return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20';
      case 'medium':
        return 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20';
      case 'low':
        return 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20';
      default:
        return '';
    }
  };

  const getDivergenceColor = (level: string) => {
    switch (level) {
      case 'high':
        return 'border-rose-500/50 bg-rose-500/5';
      case 'medium':
        return 'border-amber-500/50 bg-amber-500/5';
      case 'low':
        return 'border-emerald-500/50 bg-emerald-500/5';
      default:
        return '';
    }
  };

  const getRecommendationColor = (rec: string) => {
    if (rec.includes('strongly-recommend') || rec.includes('recommend')) {
      return 'text-emerald-600 dark:text-emerald-400';
    }
    if (rec.includes('concerns') || rec.includes('not-recommend')) {
      return 'text-rose-600 dark:text-rose-400';
    }
    return 'text-amber-600 dark:text-amber-400';
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header with aggregate recommendation */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Users className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">Multi-Referee Comparison</h2>
            <Badge variant="outline" className="text-sm">
              {comparison.totalReferees} {comparison.totalReferees === 1 ? 'Referee' : 'Referees'}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground max-w-3xl">
            {comparison.aggregateRecommendation.summary}
          </p>
        </div>
        <Button onClick={handleExportPDF} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export as PDF
        </Button>
      </div>

      {/* Aggregate Score Card */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Aggregate Recommendation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Overall Score</p>
              <p className="text-4xl font-bold">{comparison.aggregateRecommendation.overallScore.toFixed(0)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground mb-1">Majority Recommendation</p>
              <p className={`text-lg font-semibold ${getRecommendationColor(comparison.aggregateRecommendation.majorityRecommendation)}`}>
                {comparison.aggregateRecommendation.majorityRecommendation.replace(/-/g, ' ').toUpperCase()}
              </p>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Confidence Level</p>
              <p className="text-sm font-medium">{(comparison.aggregateRecommendation.confidenceLevel * 100).toFixed(0)}%</p>
            </div>
            <Progress value={comparison.aggregateRecommendation.confidenceLevel * 100} />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Category Score Comparison - Radar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Category Score Comparison</CardTitle>
            <CardDescription>Side-by-side performance across all evaluation areas</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="category" tick={{ fill: 'hsl(var(--foreground))', fontSize: 11 }} />
                <PolarRadiusAxis angle={90} domain={[0, 5]} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                {reports.map((report, idx) => (
                  <Radar
                    key={report.sessionId}
                    name={report.refereeInfo.name}
                    dataKey={report.refereeInfo.name}
                    stroke={COLORS[idx % COLORS.length]}
                    fill={COLORS[idx % COLORS.length]}
                    fillOpacity={0.2}
                  />
                ))}
                <Radar
                  name="Average"
                  dataKey="average"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.4}
                  strokeWidth={2}
                  strokeDasharray="5 5"
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recommendation Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Recommendation Distribution</CardTitle>
            <CardDescription>How each referee recommended proceeding</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={recDistData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis dataKey="recommendation" type="category" tick={{ fill: 'hsl(var(--foreground))', fontSize: 11 }} width={140} />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px',
                  }}
                />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Category Details with Consensus Indicators */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Category Analysis</CardTitle>
          <CardDescription>Individual scores and consensus levels for each category</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {comparison.categoryComparisons.map((cat, idx) => (
                <div key={idx} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <h4 className="font-semibold">{cat.category}</h4>
                      <Badge variant="outline" className={getConsensusColor(cat.consensus)}>
                        {cat.consensus} consensus
                      </Badge>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Avg Score</p>
                      <p className="text-lg font-bold">{cat.averageScore.toFixed(1)}/5</p>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    {cat.scores.map((score, scoreIdx) => (
                      <div key={scoreIdx} className="flex items-center justify-between p-2 rounded-md bg-muted/30">
                        <span className="text-sm font-medium">{score.refereeName}</span>
                        <div className="flex items-center gap-3">
                          <Progress value={(score.score / 5) * 100} className="w-24 h-2" />
                          <span className="text-sm font-semibold w-12 text-right">{score.score}/5</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  {idx < comparison.categoryComparisons.length - 1 && <Separator className="mt-4" />}
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Consensus Areas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              Consensus Highlights
            </CardTitle>
            <CardDescription>Areas where most referees agree</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pr-4">
              {comparison.consensusAreas.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">No strong consensus areas identified</p>
              ) : (
                <div className="space-y-4">
                  {comparison.consensusAreas.map((area, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg border ${
                        area.type === 'strength'
                          ? 'border-emerald-500/30 bg-emerald-500/5'
                          : 'border-amber-500/30 bg-amber-500/5'
                      }`}
                    >
                      <div className="flex items-start gap-2 mb-2">
                        {area.type === 'strength' ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                        ) : (
                          <Info className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                        )}
                        <div className="flex-1">
                          <p className="font-medium text-sm">{area.text}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Supported by: {area.supportingReferees.join(', ')}
                          </p>
                        </div>
                      </div>
                      {area.evidence.length > 0 && (
                        <div className="mt-2 pl-6">
                          <p className="text-xs font-medium text-muted-foreground mb-1">Evidence:</p>
                          <ul className="text-xs space-y-1">
                            {area.evidence.slice(0, 2).map((ev, evIdx) => (
                              <li key={evIdx} className="text-muted-foreground italic">
                                "{ev}"
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Divergent Areas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              Divergent Feedback
            </CardTitle>
            <CardDescription>Areas where referees have differing views</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pr-4">
              {comparison.divergentAreas.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">No significant divergence identified</p>
              ) : (
                <div className="space-y-4">
                  {comparison.divergentAreas.map((area, idx) => (
                    <div key={idx} className={`p-3 rounded-lg border ${getDivergenceColor(area.divergenceLevel)}`}>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-sm">{area.category}</h4>
                        <Badge
                          variant="outline"
                          className={
                            area.divergenceLevel === 'high'
                              ? 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20'
                              : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20'
                          }
                        >
                          {area.divergenceLevel} divergence
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        {area.refereeViews.map((view, viewIdx) => (
                          <div key={viewIdx} className="flex items-start gap-2 text-xs">
                            <span className="font-medium flex-shrink-0">{view.name}:</span>
                            <div className="flex-1">
                              <p className="text-muted-foreground">{view.view}</p>
                              {view.score && (
                                <p className="font-semibold mt-1">
                                  Score: {view.score}/5
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Individual Report Summary Cards */}
      <Card>
        <CardHeader>
          <CardTitle>Individual Referee Summaries</CardTitle>
          <CardDescription>Quick overview of each referee's assessment</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {reports.map((report, idx) => (
              <div key={report.sessionId} className="p-4 rounded-lg border bg-card">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold">{report.refereeInfo.name}</h4>
                    <p className="text-xs text-muted-foreground">{report.refereeInfo.relationship}</p>
                    <p className="text-xs text-muted-foreground">{report.refereeInfo.companyName}</p>
                  </div>
                  <div
                    className="h-10 w-10 rounded-full flex items-center justify-center text-lg font-bold text-white"
                    style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                  >
                    {report.refereeInfo.name.charAt(0)}
                  </div>
                </div>
                <Separator className="my-3" />
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Overall Score</span>
                    <span className="text-sm font-bold">{report.recommendation.overallScore}/100</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Recommendation</span>
                    <Badge variant="outline" className="text-xs">
                      {report.recommendation.hiringRecommendation.replace(/-/g, ' ')}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Confidence</span>
                    <span className="text-xs font-medium">{(report.recommendation.confidenceLevel * 100).toFixed(0)}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
