import { useState, useEffect } from 'react';
import { useAuth } from '@/shared/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { EnhancedStatCard } from '@/shared/components/dashboard/EnhancedStatCard';
import { RecentActivityCard } from '@/shared/components/dashboard/RecentActivityCard';
import { Briefcase, Building2, CheckCircle, Clock } from 'lucide-react';

export default function ConsultantDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    activeJobs: 0,
    applications: 0,
    interviews: 0,
    placements: 0
  });

  useEffect(() => {
    // Mock data for now, replace with actual service call when available
    setStats({
      activeJobs: 12,
      applications: 45,
      interviews: 8,
      placements: 3
    });
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Consultant Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user?.firstName}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <EnhancedStatCard
          title="Active Allocations"
          value={stats.activeJobs.toString()}
          icon={<Briefcase className="h-4 w-4 text-primary" />}
          trend="up"
          change="+12 vs last month"
        />
        <EnhancedStatCard
          title="Total Applications"
          value={stats.applications.toString()}
          icon={<Building2 className="h-4 w-4 text-blue-600" />}
          trend="up"
          change="+8 vs last month"
        />
        <EnhancedStatCard
          title="Scheduled Interviews"
          value={stats.interviews.toString()}
          icon={<Clock className="h-4 w-4 text-amber-600" />}
          trend="up"
          change="+2 this week"
        />
        <EnhancedStatCard
          title="Placements"
          value={stats.placements.toString()}
          icon={<CheckCircle className="h-4 w-4 text-green-600" />}
          trend="up"
          change="+1 this month"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4">
          <RecentActivityCard />
        </div>
        <div className="col-span-3">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Pipeline Summary</CardTitle>
              <CardDescription>Candidates by stage</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Screening</span>
                  <span className="text-sm text-muted-foreground">12 candidates</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 w-[40%]" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Interviewing</span>
                  <span className="text-sm text-muted-foreground">8 candidates</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 w-[25%]" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Offer</span>
                  <span className="text-sm text-muted-foreground">3 candidates</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 w-[10%]" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

