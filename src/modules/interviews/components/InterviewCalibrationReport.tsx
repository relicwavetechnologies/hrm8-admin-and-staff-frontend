// @ts-nocheck
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Progress } from "@/shared/components/ui/progress";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ScatterChart,
  Scatter,
  ZAxis,
} from "recharts";
import { AlertTriangle, TrendingUp, TrendingDown, Target, Users } from "lucide-react";
import type { Interview } from "@/shared/types/interview";

interface CalibrationStats {
  interviewerId: string;
  interviewerName: string;
  totalInterviews: number;
  averageRating: number;
  standardDeviation: number;
  ratingDistribution: { rating: number; count: number }[];
  categoryAverages: {
    technicalSkills?: number;
    communication?: number;
    cultureFit?: number;
    problemSolving?: number;
  };
  recommendations: {
    'strong-yes': number;
    'yes': number;
    'maybe': number;
    'no': number;
    'strong-no': number;
  };
  bias: 'lenient' | 'harsh' | 'balanced';
  consistency: 'high' | 'medium' | 'low';
}

interface InterviewCalibrationReportProps {
  interviews: Interview[];
}

export function InterviewCalibrationReport({ interviews }: InterviewCalibrationReportProps) {
  // Calculate calibration statistics
  const calculateCalibrationStats = (): CalibrationStats[] => {
    const interviewerMap = new Map<string, CalibrationStats>();

    interviews.forEach((interview) => {
      interview.feedback.forEach((feedback) => {
        if (!interviewerMap.has(feedback.interviewerId)) {
          interviewerMap.set(feedback.interviewerId, {
            interviewerId: feedback.interviewerId,
            interviewerName: feedback.interviewerName,
            totalInterviews: 0,
            averageRating: 0,
            standardDeviation: 0,
            ratingDistribution: [
              { rating: 1, count: 0 },
              { rating: 2, count: 0 },
              { rating: 3, count: 0 },
              { rating: 4, count: 0 },
              { rating: 5, count: 0 },
            ],
            categoryAverages: {},
            recommendations: {
              'strong-yes': 0,
              'yes': 0,
              'maybe': 0,
              'no': 0,
              'strong-no': 0,
            },
            bias: 'balanced',
            consistency: 'medium',
          });
        }

        const stats = interviewerMap.get(feedback.interviewerId)!;
        stats.totalInterviews++;
        
        // Update rating distribution
        const ratingIndex = Math.round(feedback.overallRating) - 1;
        if (ratingIndex >= 0 && ratingIndex < 5) {
          stats.ratingDistribution[ratingIndex].count++;
        }

        // Update recommendations
        stats.recommendations[feedback.recommendation]++;
      });
    });

    // Calculate averages and statistics
    interviewerMap.forEach((stats) => {
      const ratings: number[] = [];
      const categoryRatings: { [key: string]: number[] } = {
        technicalSkills: [],
        communication: [],
        cultureFit: [],
        problemSolving: [],
      };

      interviews.forEach((interview) => {
        interview.feedback.forEach((feedback) => {
          if (feedback.interviewerId === stats.interviewerId) {
            ratings.push(feedback.overallRating);
            
            if (feedback.technicalSkills) categoryRatings.technicalSkills.push(feedback.technicalSkills);
            if (feedback.communication) categoryRatings.communication.push(feedback.communication);
            if (feedback.cultureFit) categoryRatings.cultureFit.push(feedback.cultureFit);
            if (feedback.problemSolving) categoryRatings.problemSolving.push(feedback.problemSolving);
          }
        });
      });

      // Calculate average
      stats.averageRating = ratings.reduce((a, b) => a + b, 0) / ratings.length;

      // Calculate standard deviation
      const variance = ratings.reduce((sum, rating) => 
        sum + Math.pow(rating - stats.averageRating, 2), 0
      ) / ratings.length;
      stats.standardDeviation = Math.sqrt(variance);

      // Calculate category averages
      Object.keys(categoryRatings).forEach((key) => {
        if (categoryRatings[key].length > 0) {
          stats.categoryAverages[key as keyof typeof stats.categoryAverages] = 
            categoryRatings[key].reduce((a, b) => a + b, 0) / categoryRatings[key].length;
        }
      });

      // Determine bias
      if (stats.averageRating >= 4.0) {
        stats.bias = 'lenient';
      } else if (stats.averageRating <= 2.5) {
        stats.bias = 'harsh';
      } else {
        stats.bias = 'balanced';
      }

      // Determine consistency
      if (stats.standardDeviation < 0.5) {
        stats.consistency = 'high';
      } else if (stats.standardDeviation < 1.0) {
        stats.consistency = 'medium';
      } else {
        stats.consistency = 'low';
      }
    });

    return Array.from(interviewerMap.values());
  };

  const calibrationStats = calculateCalibrationStats();
  const globalAverage = calibrationStats.reduce((sum, stat) => sum + stat.averageRating, 0) / 
    (calibrationStats.length || 1);

  // Prepare data for visualizations
  const ratingComparisonData = calibrationStats.map((stat) => ({
    name: stat.interviewerName,
    average: Number(stat.averageRating.toFixed(2)),
    globalAvg: Number(globalAverage.toFixed(2)),
    stdDev: Number(stat.standardDeviation.toFixed(2)),
  }));

  const categoryRadarData = calibrationStats.map((stat) => ({
    interviewer: stat.interviewerName,
    technical: stat.categoryAverages.technicalSkills || 0,
    communication: stat.categoryAverages.communication || 0,
    culture: stat.categoryAverages.cultureFit || 0,
    problemSolving: stat.categoryAverages.problemSolving || 0,
  }));

  const consistencyScatterData = calibrationStats.map((stat) => ({
    name: stat.interviewerName,
    avgRating: stat.averageRating,
    stdDev: stat.standardDeviation,
    interviews: stat.totalInterviews,
  }));

  const getBiasColor = (bias: string) => {
    switch (bias) {
      case 'lenient': return 'text-warning';
      case 'harsh': return 'text-destructive';
      default: return 'text-success';
    }
  };

  const getConsistencyColor = (consistency: string) => {
    switch (consistency) {
      case 'high': return 'text-success';
      case 'medium': return 'text-warning';
      default: return 'text-destructive';
    }
  };

  if (calibrationStats.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-lg font-medium mb-2">No Calibration Data Available</p>
          <p className="text-sm text-muted-foreground">
            Complete more interviews with feedback to generate calibration reports
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Interviewer Calibration Report</h2>
          <p className="text-muted-foreground">
            Analyze rating consistency and identify potential bias patterns
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          {calibrationStats.length} Interviewers
        </Badge>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Global Average Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{globalAverage.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">Across all interviewers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Rating Spread</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {Math.max(...calibrationStats.map(s => s.averageRating)).toFixed(2)} - {Math.min(...calibrationStats.map(s => s.averageRating)).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Highest to lowest average</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Consistency Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {calibrationStats.filter(s => s.consistency === 'low').length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Interviewers with low consistency</p>
          </CardContent>
        </Card>
      </div>

      {/* Interviewer Statistics Table */}
      <Card>
        <CardHeader>
          <CardTitle>Interviewer Statistics</CardTitle>
          <CardDescription>
            Individual performance metrics and bias indicators
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {calibrationStats.map((stat) => (
              <div key={stat.interviewerId} className="space-y-3 pb-4 border-b last:border-b-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h4 className="font-semibold">{stat.interviewerName}</h4>
                      <Badge variant="outline" className="text-xs">
                        {stat.totalInterviews} interviews
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Avg Rating:</span>
                        <span className="font-semibold">{stat.averageRating.toFixed(2)}</span>
                        {stat.averageRating > globalAverage ? (
                          <TrendingUp className="h-4 w-4 text-warning" />
                        ) : stat.averageRating < globalAverage ? (
                          <TrendingDown className="h-4 w-4 text-destructive" />
                        ) : (
                          <Target className="h-4 w-4 text-success" />
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Std Dev:</span>
                        <span className="font-semibold">{stat.standardDeviation.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={getBiasColor(stat.bias)}>
                      {stat.bias === 'lenient' && '↑ '}{stat.bias === 'harsh' && '↓ '}
                      {stat.bias.charAt(0).toUpperCase() + stat.bias.slice(1)}
                    </Badge>
                    <Badge variant="outline" className={getConsistencyColor(stat.consistency)}>
                      {stat.consistency.charAt(0).toUpperCase() + stat.consistency.slice(1)} Consistency
                    </Badge>
                  </div>
                </div>

                {/* Rating Distribution */}
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground font-medium">Rating Distribution</p>
                  <div className="grid grid-cols-5 gap-2">
                    {stat.ratingDistribution.map((dist) => (
                      <div key={dist.rating} className="text-center">
                        <div className="text-xs text-muted-foreground mb-1">★{dist.rating}</div>
                        <Progress 
                          value={(dist.count / stat.totalInterviews) * 100} 
                          className="h-2"
                        />
                        <div className="text-xs font-medium mt-1">{dist.count}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommendations Breakdown */}
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-muted-foreground">Recommendations:</span>
                  <Badge variant="default" className="text-xs">
                    Strong Yes: {stat.recommendations['strong-yes']}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    Yes: {stat.recommendations['yes']}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    Maybe: {stat.recommendations['maybe']}
                  </Badge>
                  <Badge variant="destructive" className="text-xs">
                    No: {stat.recommendations['no'] + stat.recommendations['strong-no']}
                  </Badge>
                </div>

                {/* Bias Warning */}
                {stat.bias !== 'balanced' && (
                  <div className="flex items-start gap-2 p-3 bg-warning/10 rounded-lg border border-warning/20">
                    <AlertTriangle className="h-4 w-4 text-warning flex-shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <p className="font-medium text-warning mb-1">Potential Bias Detected</p>
                      <p className="text-muted-foreground">
                        {stat.bias === 'lenient' 
                          ? `This interviewer's average rating (${stat.averageRating.toFixed(2)}) is ${(stat.averageRating - globalAverage).toFixed(2)} points above the global average, suggesting potentially lenient scoring.`
                          : `This interviewer's average rating (${stat.averageRating.toFixed(2)}) is ${(globalAverage - stat.averageRating).toFixed(2)} points below the global average, suggesting potentially harsh scoring.`
                        }
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Average Rating Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>Average Rating Comparison</CardTitle>
            <CardDescription>Compare interviewer averages to global baseline</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ratingComparisonData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis domain={[0, 5]} />
                <Tooltip />
                <Legend />
                <Bar dataKey="average" fill="hsl(var(--primary))" name="Interviewer Avg" />
                <Bar dataKey="globalAvg" fill="hsl(var(--muted))" name="Global Avg" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Consistency Scatter Plot */}
        <Card>
          <CardHeader>
            <CardTitle>Rating Consistency Analysis</CardTitle>
            <CardDescription>Standard deviation vs. average rating</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  type="number" 
                  dataKey="avgRating" 
                  name="Average Rating" 
                  domain={[0, 5]}
                  label={{ value: 'Average Rating', position: 'insideBottom', offset: -5 }}
                />
                <YAxis 
                  type="number" 
                  dataKey="stdDev" 
                  name="Std Deviation"
                  label={{ value: 'Standard Deviation', angle: -90, position: 'insideLeft' }}
                />
                <ZAxis type="number" dataKey="interviews" range={[50, 400]} name="Interviews" />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Scatter 
                  name="Interviewers" 
                  data={consistencyScatterData} 
                  fill="hsl(var(--primary))"
                />
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Comparison Radar */}
        {categoryRadarData.some(d => d.technical > 0) && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Category Rating Comparison</CardTitle>
              <CardDescription>Compare rating patterns across different evaluation categories</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={[
                  { category: 'Technical', ...Object.fromEntries(categoryRadarData.map(d => [d.interviewer, d.technical])) },
                  { category: 'Communication', ...Object.fromEntries(categoryRadarData.map(d => [d.interviewer, d.communication])) },
                  { category: 'Culture Fit', ...Object.fromEntries(categoryRadarData.map(d => [d.interviewer, d.culture])) },
                  { category: 'Problem Solving', ...Object.fromEntries(categoryRadarData.map(d => [d.interviewer, d.problemSolving])) },
                ]}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="category" />
                  <PolarRadiusAxis domain={[0, 5]} />
                  {categoryRadarData.map((data, index) => (
                    <Radar
                      key={data.interviewer}
                      name={data.interviewer}
                      dataKey={data.interviewer}
                      stroke={`hsl(${(index * 360) / categoryRadarData.length}, 70%, 50%)`}
                      fill={`hsl(${(index * 360) / categoryRadarData.length}, 70%, 50%)`}
                      fillOpacity={0.2}
                    />
                  ))}
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
