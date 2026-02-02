import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table";
import { Badge } from "@/shared/components/ui/badge";
import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar";
import { Progress } from "@/shared/components/ui/progress";
import { useNavigate } from 'react-router-dom';
import { toast } from '@/shared/hooks/use-toast';
import type { RecruiterPerformance } from '@/shared/lib/backgroundChecks/analyticsService';

interface RecruiterPerformanceTableProps {
  data: RecruiterPerformance[];
}

export function RecruiterPerformanceTable({ data }: RecruiterPerformanceTableProps) {
  const navigate = useNavigate();

  const getPerformanceBadge = (score: number) => {
    if (score >= 90) return <Badge className="bg-green-500">Excellent</Badge>;
    if (score >= 75) return <Badge className="bg-blue-500">Good</Badge>;
    if (score >= 60) return <Badge className="bg-yellow-500">Average</Badge>;
    return <Badge variant="destructive">Needs Improvement</Badge>;
  };

  const handleRecruiterClick = (recruiterId: string, recruiterName: string) => {
    // Navigate to main page with recruiter filter
    const params = new URLSearchParams({
      initiatedBy: recruiterId,
    });
    
    navigate(`/background-checks?${params.toString()}`);
    
    toast({
      title: "Filters Applied",
      description: `Viewing checks initiated by ${recruiterName}`,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recruiter Performance</CardTitle>
        <CardDescription>Individual performance metrics for all recruiters. Click on any row to view that recruiter's checks.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Recruiter</TableHead>
              <TableHead className="text-right">Total Initiated</TableHead>
              <TableHead className="text-right">Avg. Completion Time</TableHead>
              <TableHead>Completion Rate</TableHead>
              <TableHead>On-Time Rate</TableHead>
              <TableHead>Quality Score</TableHead>
              <TableHead>Performance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((recruiter) => (
            <TableRow 
              key={recruiter.recruiterId}
              onClick={() => handleRecruiterClick(recruiter.recruiterId, recruiter.recruiterName)}
              className="cursor-pointer hover:bg-accent/50 transition-colors"
            >
              <TableCell onClick={(e) => {
                e.stopPropagation();
                navigate(`/background-checks/recruiter/${recruiter.recruiterId}`);
              }}>
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {recruiter.recruiterName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium hover:text-primary transition-colors">{recruiter.recruiterName}</span>
                </div>
              </TableCell>
                <TableCell className="text-right font-medium">{recruiter.totalInitiated}</TableCell>
                <TableCell className="text-right">{recruiter.avgCompletionTime} days</TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <Progress value={recruiter.completionRate} className="h-2" />
                    <span className="text-xs text-muted-foreground">{recruiter.completionRate.toFixed(1)}%</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <Progress value={recruiter.onTimeRate} className="h-2" />
                    <span className="text-xs text-muted-foreground">{recruiter.onTimeRate.toFixed(1)}%</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <Progress value={recruiter.qualityScore} className="h-2" />
                    <span className="text-xs text-muted-foreground">{recruiter.qualityScore.toFixed(1)}%</span>
                  </div>
                </TableCell>
                <TableCell>
                  {getPerformanceBadge(
                    (recruiter.completionRate + recruiter.onTimeRate + recruiter.qualityScore) / 3
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
