import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Job } from "@/shared/types/job";
import { JobStatusBadge } from "./JobStatusBadge";
import { ServiceTypeBadge } from "./ServiceTypeBadge";
import { MapPin, Building2, Users, Calendar, Clock, Briefcase } from "lucide-react";
import { formatRelativeDate } from "@/shared/lib/jobUtils";

interface JobOverviewCardProps {
  job: Job;
}

export function JobOverviewCard({ job }: JobOverviewCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">Job Overview & Active Tracking</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Job Title & Department */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Briefcase className="h-4 w-4" />
              <span>Job Title</span>
            </div>
            <p className="font-semibold text-base">{job.title}</p>
            {job.department && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                <Building2 className="h-3.5 w-3.5" />
                <span>{job.department}</span>
              </div>
            )}
          </div>

          {/* Location */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>Location</span>
            </div>
            <p className="font-medium">{job.location}</p>
            {job.country && (
              <p className="text-sm text-muted-foreground">{job.country}</p>
            )}
          </div>

          {/* Applicants Count */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>Applicants</span>
            </div>
            <p className="font-semibold text-2xl">{job.applicantsCount ?? 0}</p>
            {job.unreadApplicants && job.unreadApplicants > 0 && (
              <Badge variant="outline" className="h-6 px-2 text-xs rounded-full">
                {job.unreadApplicants} unread
              </Badge>
            )}
          </div>

          {/* Status */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Status</span>
            </div>
            <JobStatusBadge status={job.status} />
            <div className="flex items-center gap-2 mt-1">
              <ServiceTypeBadge type={job.serviceType} />
            </div>
          </div>
        </div>

        {/* Additional Info Row */}
        <div className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Posted:</span>
            <span className="font-medium">{formatRelativeDate(job.postingDate)}</span>
          </div>
          {job.closeDate && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Closes:</span>
              <span className="font-medium">{formatRelativeDate(job.closeDate)}</span>
            </div>
          )}
          {job.assignedConsultantName && (
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Assigned Consultant:</span>
              <span className="font-medium">{job.assignedConsultantName}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

