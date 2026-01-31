import { Card } from '@/shared/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table';
import { Badge } from '@/shared/components/ui/badge';
import { Progress } from '@/shared/components/ui/progress';
import { Trophy, TrendingUp, Clock } from 'lucide-react';
import type { RecruiterPerformance } from '@/shared/lib/applications/analyticsService';

interface RecruiterPerformanceTableProps {
  data: RecruiterPerformance;
}

export function RecruiterPerformanceTable({ data }: RecruiterPerformanceTableProps) {
  const sortedRecruiters = [...data.recruiters].sort(
    (a, b) => b.conversionRate - a.conversionRate
  );

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Recruiter Performance</h3>
        {data.topPerformers.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Trophy className="h-4 w-4 text-yellow-600" />
            Top Performers: {data.topPerformers.join(', ')}
          </div>
        )}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Rank</TableHead>
              <TableHead>Recruiter</TableHead>
              <TableHead className="text-right">Applications</TableHead>
              <TableHead className="text-right">Active</TableHead>
              <TableHead>Conversion Rate</TableHead>
              <TableHead className="text-right">Avg Time to Hire</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedRecruiters.map((recruiter, index) => (
              <TableRow key={recruiter.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">#{index + 1}</span>
                    {index < 3 && (
                      <Trophy className={`h-4 w-4 ${
                        index === 0 ? 'text-yellow-600' :
                        index === 1 ? 'text-gray-400' :
                        'text-amber-700'
                      }`} />
                    )}
                  </div>
                </TableCell>
                <TableCell className="font-medium">{recruiter.name}</TableCell>
                <TableCell className="text-right">{recruiter.applicationsProcessed}</TableCell>
                <TableCell className="text-right">
                  <Badge variant="secondary">{recruiter.activeApplications}</Badge>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{recruiter.conversionRate}%</span>
                      {recruiter.conversionRate >= 70 && (
                        <TrendingUp className="h-3 w-3 text-green-600" />
                      )}
                    </div>
                    <Progress value={recruiter.conversionRate} className="h-2" />
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span>{recruiter.avgTimeToHire} days</span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {sortedRecruiters.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No recruiter performance data available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
