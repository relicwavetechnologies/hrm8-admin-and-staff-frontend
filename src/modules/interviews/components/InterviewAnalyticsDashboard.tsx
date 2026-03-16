// @ts-nocheck
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar";
import { Progress } from "@/shared/components/ui/progress";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Users,
  Star,
  CheckCircle,
  Clock,
  Award,
} from "lucide-react";
import type { Interview } from "@/shared/types/interview";
import { useMemo } from "react";

interface InterviewAnalyticsDashboardProps {
  interviews: Interview[];
}

export function InterviewAnalyticsDashboard({ interviews }: InterviewAnalyticsDashboardProps) {
  const analytics = useMemo(() => {
    const total = interviews.length;
    const completed = interviews.filter((i) => i.status === "completed").length;
    const scheduled = interviews.filter((i) => i.status === "scheduled").length;
    const cancelled = interviews.filter((i) => i.status === "cancelled").length;
    const noShows = interviews.filter((i) => i.status === "no-show").length;

    const completionRate = total > 0 ? (completed / total) * 100 : 0;

    // Average ratings
    const interviewsWithRatings = interviews.filter((i) => i.rating);
    const avgRating =
      interviewsWithRatings.length > 0
        ? interviewsWithRatings.reduce((sum, i) => sum + (i.rating || 0), 0) /
        interviewsWithRatings.length
        : 0;

    // Time-to-hire calculation (days from first interview to completion)
    const completedInterviews = interviews.filter(
      (i) => i.status === "completed" && i.scheduledDate
    );
    const avgTimeToHire =
      completedInterviews.length > 0
        ? completedInterviews.reduce((sum, i) => {
          const interviewDate = new Date(i.scheduledDate);
          const completedDate = new Date(i.updatedAt);
          const days = Math.floor(
            (completedDate.getTime() - interviewDate.getTime()) / (1000 * 60 * 60 * 24)
          );
          return sum + days;
        }, 0) / completedInterviews.length
        : 0;

    // Status distribution
    const statusData = [
      { name: "Completed", value: completed, color: "hsl(var(--success))" },
      { name: "Scheduled", value: scheduled, color: "hsl(var(--primary))" },
      { name: "Cancelled", value: cancelled, color: "hsl(var(--destructive))" },
      { name: "No Show", value: noShows, color: "hsl(var(--muted-foreground))" },
    ];

    // Interview type distribution
    const typeDistribution = interviews.reduce((acc, interview) => {
      acc[interview.type] = (acc[interview.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const typeData = Object.entries(typeDistribution).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      count: value,
    }));

    // Ratings distribution
    const ratingsData = [
      {
        rating: "5 Stars",
        count: interviewsWithRatings.filter((i) => (i.rating || 0) >= 4.5).length,
      },
      {
        rating: "4 Stars",
        count: interviewsWithRatings.filter(
          (i) => (i.rating || 0) >= 3.5 && (i.rating || 0) < 4.5
        ).length,
      },
      {
        rating: "3 Stars",
        count: interviewsWithRatings.filter(
          (i) => (i.rating || 0) >= 2.5 && (i.rating || 0) < 3.5
        ).length,
      },
      {
        rating: "2 Stars",
        count: interviewsWithRatings.filter(
          (i) => (i.rating || 0) >= 1.5 && (i.rating || 0) < 2.5
        ).length,
      },
      {
        rating: "1 Star",
        count: interviewsWithRatings.filter((i) => (i.rating || 0) < 1.5).length,
      },
    ];

    // Interviewer performance
    const interviewerStats = interviews.reduce((acc, interview) => {
      interview.interviewers.forEach((interviewer) => {
        if (!acc[interviewer.userId]) {
          acc[interviewer.userId] = {
            name: interviewer.name,
            totalInterviews: 0,
            completedInterviews: 0,
            totalRating: 0,
            ratingCount: 0,
            feedbackCount: 0,
          };
        }
        acc[interviewer.userId].totalInterviews++;
        if (interview.status === "completed") {
          acc[interviewer.userId].completedInterviews++;
        }

        // Count feedback from this interviewer
        const interviewerFeedback = interview.feedback.filter(
          (f) => f.interviewerId === interviewer.userId
        );
        if (interviewerFeedback.length > 0) {
          acc[interviewer.userId].feedbackCount += interviewerFeedback.length;
          interviewerFeedback.forEach((f) => {
            acc[interviewer.userId].totalRating += f.overallRating;
            acc[interviewer.userId].ratingCount++;
          });
        }
      });
      return acc;
    }, {} as Record<string, { name: string; totalInterviews: number; completedInterviews: number; totalRating: number; ratingCount: number; feedbackCount: number }>);

    const interviewerPerformance = Object.entries(interviewerStats)
      .map(([id, stats]) => ({
        id,
        name: stats.name,
        totalInterviews: stats.totalInterviews,
        completedInterviews: stats.completedInterviews,
        completionRate:
          stats.totalInterviews > 0
            ? (stats.completedInterviews / stats.totalInterviews) * 100
            : 0,
        avgRating: stats.ratingCount > 0 ? stats.totalRating / stats.ratingCount : 0,
        feedbackCount: stats.feedbackCount,
      }))
      .sort((a, b) => b.totalInterviews - a.totalInterviews);

    // Recommendations distribution
    const recommendationStats = interviews.reduce(
      (acc, interview) => {
        interview.feedback.forEach((f) => {
          acc[f.recommendation] = (acc[f.recommendation] || 0) + 1;
        });
        return acc;
      },
      {} as Record<string, number>
    );

    const recommendationData = Object.entries(recommendationStats).map(([name, value]) => ({
      name: name.replace("-", " ").toUpperCase(),
      count: value,
    }));

    return {
      total,
      completed,
      scheduled,
      cancelled,
      noShows,
      completionRate,
      avgRating,
      avgTimeToHire,
      statusData,
      typeData,
      ratingsData,
      interviewerPerformance,
      recommendationData,
    };
  }, [interviews]);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-3 w-3 ${star <= rating
                ? "fill-warning text-warning"
                : "fill-muted text-muted"
              }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Interviews</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.total}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.scheduled} scheduled
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.completionRate.toFixed(1)}%
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Progress value={analytics.completionRate} className="flex-1" />
              <span className="text-xs text-muted-foreground">
                {analytics.completed}/{analytics.total}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.avgRating.toFixed(1)}</div>
            <div className="mt-2">{renderStars(Math.round(analytics.avgRating))}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Time to Hire</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(analytics.avgTimeToHire)}
            </div>
            <p className="text-xs text-muted-foreground">days</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Interview Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  strokeWidth={0}
                >
                  {analytics.statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Interview Type Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Interview Types</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.typeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <Tooltip cursor={{ fill: 'transparent' }} />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ratings Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Rating Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.ratingsData} layout="vertical" margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <YAxis dataKey="rating" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} width={80} />
                <Tooltip cursor={{ fill: 'transparent' }} />
                <Bar dataKey="count" fill="hsl(var(--warning))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recommendations Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Hire Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.recommendationData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <Tooltip cursor={{ fill: 'transparent' }} />
                <Bar dataKey="count" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Interviewer Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Interviewer Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.interviewerPerformance.slice(0, 10).map((interviewer) => (
              <div
                key={interviewer.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {getInitials(interviewer.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-semibold">{interviewer.name}</p>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-sm text-muted-foreground">
                        {interviewer.totalInterviews} interviews
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {interviewer.feedbackCount} feedback
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Completion</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Progress
                        value={interviewer.completionRate}
                        className="w-20"
                      />
                      <span className="text-sm font-medium">
                        {interviewer.completionRate.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Avg Rating</p>
                    <div className="flex items-center gap-2 mt-1">
                      {interviewer.avgRating > 0 ? (
                        <>
                          {renderStars(Math.round(interviewer.avgRating))}
                          <span className="text-sm font-medium">
                            {interviewer.avgRating.toFixed(1)}
                          </span>
                        </>
                      ) : (
                        <span className="text-sm text-muted-foreground">N/A</span>
                      )}
                    </div>
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
