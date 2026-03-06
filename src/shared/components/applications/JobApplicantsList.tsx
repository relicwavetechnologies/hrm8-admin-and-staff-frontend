import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { applicationService, Application as RawApplication } from "@/shared/lib/applicationService";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Loader2, User2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/shared/lib/utils";

interface JobApplicantsListProps {
  jobId: string;
}

interface JobApplicantRow {
  id: string;
  candidateName: string;
  candidateEmail: string;
  appliedDate: string;
  status: string;
  stage: string;
}

export function JobApplicantsList({ jobId }: JobApplicantsListProps) {
  const [rows, setRows] = useState<JobApplicantRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        console.log('[JobApplicantsList] Loading applications for jobId:', jobId);
        const res = await applicationService.getJobApplications(jobId);
        console.log('[JobApplicantsList] API response:', res);
        const apps: RawApplication[] = res.data?.applications || [];
        console.log('[JobApplicantsList] Applications received:', apps.length, apps);
        const mapped: JobApplicantRow[] = apps.map((app: any) => ({
          id: app.id,
          candidateName:
            app.candidate?.firstName && app.candidate?.lastName
              ? `${app.candidate.firstName} ${app.candidate.lastName}`
              : "Unknown Candidate",
          candidateEmail: app.candidate?.email || "",
          appliedDate: app.appliedDate,
          status: app.status,
          stage: app.stage,
        }));
        setRows(mapped);
      } catch {
        setRows([]);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [jobId]);

  const renderStatus = (status: string) => {
    switch (status) {
      case "NEW":
        return <Badge variant="default">New</Badge>;
      case "SCREENING":
        return <Badge variant="secondary">Screening</Badge>;
      case "INTERVIEW":
        return <Badge variant="outline">Interview</Badge>;
      case "OFFER":
        return <Badge className="bg-green-500">Offer</Badge>;
      case "HIRED":
        return <Badge className="bg-green-600">Hired</Badge>;
      case "REJECTED":
        return <Badge variant="destructive">Rejected</Badge>;
      case "WITHDRAWN":
        return <Badge variant="outline">Withdrawn</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (

    <Card className="border-none shadow-none bg-transparent">
      <CardHeader className="px-0 pt-0 pb-4 flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-lg font-semibold">All Applicants</CardTitle>
          <CardDescription className="mt-1">List of all candidates who applied to this job</CardDescription>
        </div>
        <div className="bg-muted/50 px-3 py-1 rounded-full text-xs font-medium text-muted-foreground">
          {rows.length} applicant{rows.length !== 1 ? "s" : ""}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-muted-foreground gap-2">
            <User2 className="h-8 w-8 opacity-50" />
            <p>No applicants yet for this job.</p>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {rows.map((row) => (
              <div
                key={row.id}
                className="group flex items-center justify-between py-4 px-1 hover:bg-muted/30 transition-colors cursor-pointer -mx-1 rounded-md"
                onClick={() => navigate(`/jobs/${jobId}/applications/${row.id}`)}
              >
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                    <User2 className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-foreground">
                        {row.candidateName}
                      </span>
                      <span className="text-muted-foreground text-xs">•</span>
                      <span className={cn(
                        "text-xs font-medium flex items-center gap-1.5",
                        row.status === 'NEW' && "text-blue-600 dark:text-blue-400",
                        row.status === 'HIRED' && "text-green-600 dark:text-green-400",
                        row.status === 'REJECTED' && "text-red-600 dark:text-red-400",
                        (row.status !== 'NEW' && row.status !== 'HIRED' && row.status !== 'REJECTED') && "text-muted-foreground"
                      )}>
                        {renderStatus(row.status)}
                      </span>

                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <p className="text-xs text-muted-foreground">
                        Applied {row.appliedDate ? formatDistanceToNow(new Date(row.appliedDate), { addSuffix: true }) : "Unknown time"}
                      </p>
                      {row.candidateEmail && (
                        <>
                          <span className="text-muted-foreground text-[10px]">•</span>
                          <p className="text-xs text-muted-foreground">
                            {row.candidateEmail}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity pr-2">
                  <Button variant="ghost" size="sm" className="h-8 text-xs">
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}


