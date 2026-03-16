// @ts-nocheck
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { 
  LineChart, 
  Line, 
  BarChart,
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { TrendingUp, TrendingDown, Calendar, Target, Users, Award } from "lucide-react";
import type { CalibrationSession } from "@/shared/types/interview";
import { format } from "date-fns";

interface CalibrationSessionAnalyticsProps {
  sessions: CalibrationSession[];
}

export function CalibrationSessionAnalytics({ sessions }: CalibrationSessionAnalyticsProps) {
  // Sort sessions by date
  const completedSessions = sessions
    .filter(s => s.status === 'completed' && s.alignmentScores)
    .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());

  // Calculate trend data
  const trendData = completedSessions.map((session, index) => ({
    session: `Session ${index + 1}`,
    date: format(new Date(session.scheduledDate), 'MMM d'),
    fullDate: format(new Date(session.scheduledDate), 'PPP'),
    before: session.alignmentScores?.beforeSession || 0,
    after: session.alignmentScores?.afterSession || 0,
    improvement: (session.alignmentScores?.afterSession || 0) - (session.alignmentScores?.beforeSession || 0),
    participants: session.participants.length,
  }));

  // Calculate cumulative improvement
  const cumulativeData = trendData.map((data, index) => {
    const avgImprovement = trendData
      .slice(0, index + 1)
      .reduce((sum, d) => sum + d.improvement, 0) / (index + 1);
    
    return {
      ...data,
      avgImprovement: Number(avgImprovement.toFixed(1)),
      targetImprovement: 25, // Target improvement of 25%
    };
  });

  // Calculate statistics
  const totalSessions = completedSessions.length;
  const averageImprovement = totalSessions > 0
    ? trendData.reduce((sum, d) => sum + d.improvement, 0) / totalSessions
    : 0;
  
  const latestAlignment = completedSessions.length > 0
    ? completedSessions[completedSessions.length - 1].alignmentScores?.afterSession || 0
    : 0;

  const firstAlignment = completedSessions.length > 0
    ? completedSessions[0].alignmentScores?.beforeSession || 0
    : 0;

  const totalImprovement = latestAlignment - firstAlignment;

  // Participant engagement data
  const participantEngagement = completedSessions.map((session, index) => ({
    session: `Session ${index + 1}`,
    date: format(new Date(session.scheduledDate), 'MMM d'),
    participants: session.participants.length,
    exercisesCompleted: session.exercises.filter(e => e.completed).length,
    completionRate: (session.exercises.filter(e => e.completed).length / session.exercises.length) * 100,
  }));

  // Exercise effectiveness
  const exerciseStats = {
    'rating-alignment': { completed: 0, avgImprovement: 0 },
    'scenario-review': { completed: 0, avgImprovement: 0 },
    'rubric-discussion': { completed: 0, avgImprovement: 0 },
    'bias-awareness': { completed: 0, avgImprovement: 0 },
  };

  completedSessions.forEach(session => {
    const improvement = session.alignmentScores?.afterSession! - session.alignmentScores?.beforeSession!;
    session.exercises.forEach(exercise => {
      if (exercise.completed && exerciseStats[exercise.type as keyof typeof exerciseStats]) {
        exerciseStats[exercise.type as keyof typeof exerciseStats].completed++;
        exerciseStats[exercise.type as keyof typeof exerciseStats].avgImprovement += improvement / session.exercises.length;
      }
    });
  });

  const exerciseEffectivenessData = Object.entries(exerciseStats).map(([type, stats]) => ({
    name: type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
    completed: stats.completed,
    avgImprovement: stats.completed > 0 ? Number((stats.avgImprovement / stats.completed).toFixed(1)) : 0,
  }));

  if (completedSessions.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-lg font-medium mb-2">No Analytics Available Yet</p>
          <p className="text-sm text-muted-foreground">
            Complete calibration sessions to see alignment improvement trends
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Session Analytics</h2>
          <p className="text-muted-foreground">
            Track team alignment improvement and calibration trends
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          {totalSessions} Completed Sessions
        </Badge>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              Current Alignment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{latestAlignment}%</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
              {totalImprovement > 0 ? (
                <>
                  <TrendingUp className="h-3 w-3 text-success" />
                  <span className="text-success">+{totalImprovement.toFixed(1)}% from start</span>
                </>
              ) : (
                <>
                  <TrendingDown className="h-3 w-3 text-destructive" />
                  <span className="text-destructive">{totalImprovement.toFixed(1)}% from start</span>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-success" />
              Avg Improvement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">+{averageImprovement.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground mt-1">Per session</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              Total Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalSessions}</div>
            <p className="text-xs text-muted-foreground mt-1">Completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Award className="h-4 w-4 text-warning" />
              Best Session
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              +{Math.max(...trendData.map(d => d.improvement)).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">Highest improvement</p>
          </CardContent>
        </Card>
      </div>

      {/* Alignment Improvement Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Alignment Improvement Over Time</CardTitle>
          <CardDescription>
            Track how team alignment scores have changed across sessions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 100]} />
              <Tooltip 
                labelFormatter={(label) => {
                  const item = trendData.find(d => d.date === label);
                  return item?.fullDate || label;
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="before" 
                stroke="hsl(var(--muted-foreground))" 
                strokeWidth={2}
                name="Before Session" 
                dot={{ r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="after" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                name="After Session"
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Cumulative Improvement */}
      <Card>
        <CardHeader>
          <CardTitle>Cumulative Improvement vs Target</CardTitle>
          <CardDescription>
            Average improvement per session compared to 25% target
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={cumulativeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip 
                labelFormatter={(label) => {
                  const item = cumulativeData.find(d => d.date === label);
                  return item?.fullDate || label;
                }}
              />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="avgImprovement" 
                stroke="hsl(var(--primary))" 
                fill="hsl(var(--primary))"
                fillOpacity={0.3}
                name="Avg Improvement"
              />
              <Line 
                type="monotone" 
                dataKey="targetImprovement" 
                stroke="hsl(var(--success))" 
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Target (25%)"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Session Improvement Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Session Improvement Breakdown</CardTitle>
            <CardDescription>
              Individual session performance comparison
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="session" />
                <YAxis />
                <Tooltip 
                  labelFormatter={(label) => {
                    const item = trendData.find(d => d.session === label);
                    return item?.fullDate || label;
                  }}
                />
                <Legend />
                <Bar 
                  dataKey="improvement" 
                  fill="hsl(var(--primary))"
                  name="Alignment Improvement (%)"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Exercise Effectiveness */}
        <Card>
          <CardHeader>
            <CardTitle>Exercise Effectiveness</CardTitle>
            <CardDescription>
              Average improvement by exercise type
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={exerciseEffectivenessData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={120} />
                <Tooltip />
                <Legend />
                <Bar 
                  dataKey="avgImprovement" 
                  fill="hsl(var(--success))"
                  name="Avg Improvement (%)"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Participant Engagement Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Participant Engagement Trends</CardTitle>
          <CardDescription>
            Track participation and exercise completion rates over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={participantEngagement}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" domain={[0, 100]} />
              <Tooltip 
                labelFormatter={(label) => {
                  const item = participantEngagement.find(d => d.date === label);
                  return item ? `${item.session} (${label})` : label;
                }}
              />
              <Legend />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="participants" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                name="Participants"
                dot={{ r: 4 }}
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="completionRate" 
                stroke="hsl(var(--success))" 
                strokeWidth={2}
                name="Completion Rate (%)"
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Historical Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Historical Session Comparison</CardTitle>
          <CardDescription>
            Compare key metrics across all completed sessions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {completedSessions.map((session, index) => {
              const improvement = session.alignmentScores!.afterSession - session.alignmentScores!.beforeSession;
              const isAboveAverage = improvement > averageImprovement;

              return (
                <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold">{session.name}</h4>
                      <Badge variant={isAboveAverage ? "default" : "secondary"} className="text-xs">
                        {isAboveAverage ? "Above Average" : "Below Average"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(session.scheduledDate), 'PPP')}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {session.participants.length} participants
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground mb-1">Before</p>
                      <p className="text-lg font-semibold">{session.alignmentScores!.beforeSession}%</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {improvement > 0 ? (
                        <TrendingUp className="h-5 w-5 text-success" />
                      ) : (
                        <TrendingDown className="h-5 w-5 text-destructive" />
                      )}
                      <span className={`text-2xl font-bold ${improvement > 0 ? 'text-success' : 'text-destructive'}`}>
                        {improvement > 0 ? '+' : ''}{improvement.toFixed(1)}%
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground mb-1">After</p>
                      <p className="text-lg font-semibold">{session.alignmentScores!.afterSession}%</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
