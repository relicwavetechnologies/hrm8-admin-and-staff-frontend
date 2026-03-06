import { JobFormData } from "@/shared/types/job";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Separator } from "@/shared/components/ui/separator";
import {
  MapPin,
  Briefcase,
  DollarSign,
  Calendar,
  Users,
  Eye,
  Clock
} from "lucide-react";
import { EmploymentTypeBadge } from "./EmploymentTypeBadge";
import { formatSalaryRange, formatExperienceLevel } from "@/shared/lib/jobUtils";

interface JobBoardPublicPreviewProps {
  formData: Partial<JobFormData>;
}

export function JobBoardPublicPreview({ formData }: JobBoardPublicPreviewProps) {
  const employerName = (formData as any).postAsHRM8 ? "HRM8" : "Employer Name";

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Section */}
      <div className="space-y-4">
        <div>
          <Badge variant="secondary" className="mb-3">Preview Mode</Badge>
          <h1 className="text-3xl font-bold mb-2">
            {formData.title || "Job Title"}
          </h1>
          <p className="text-lg text-muted-foreground">
            {employerName}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="font-medium text-foreground">0</span>
            <span>applicants</span>
          </div>
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            <span className="font-medium text-foreground">0</span>
            <span>views</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span className="font-medium text-foreground">New</span>
            <span>posting</span>
          </div>
        </div>
      </div>

      {/* Job Details Card */}
      <Card>
        <CardHeader>
          <CardTitle>Job Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {formData.location && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Location:</span>
                <span>{formData.location}</span>
              </div>
            )}

            {formData.workArrangement && (
              <div className="flex items-center gap-2 text-sm">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Arrangement:</span>
                {formData.workArrangement === 'remote' && (
                  <Badge variant="outline" className="gap-1">
                    <MapPin className="h-3 w-3" />
                    Remote
                  </Badge>
                )}
                {formData.workArrangement === 'hybrid' && (
                  <Badge variant="outline" className="gap-1">
                    <Briefcase className="h-3 w-3" />
                    Hybrid
                  </Badge>
                )}
                {formData.workArrangement === 'on-site' && (
                  <Badge variant="outline" className="gap-1">
                    <Briefcase className="h-3 w-3" />
                    On-site
                  </Badge>
                )}
              </div>
            )}

            {formData.employmentType && (
              <div className="flex items-center gap-2 text-sm">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Type:</span>
                <EmploymentTypeBadge type={formData.employmentType} />
              </div>
            )}

            {(formData.salaryMin || formData.salaryMax) && !formData.hideSalary && (
              <div className="space-y-2 col-span-2">
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Salary:</span>
                  <span>
                    {formatSalaryRange(
                      formData.salaryMin,
                      formData.salaryMax,
                      formData.salaryCurrency || 'USD',
                      formData.salaryPeriod
                    )}
                  </span>
                </div>

                {formData.salaryDescription && (
                  <div className="ml-6 text-sm bg-primary/10 border border-primary/20 rounded-md px-3 py-2">
                    <p className="text-foreground italic">
                      💰 {formData.salaryDescription}
                    </p>
                  </div>
                )}
              </div>
            )}

            {formData.experienceLevel && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Experience:</span>
                <span>{formatExperienceLevel(formData.experienceLevel)}</span>
              </div>
            )}
          </div>

          <Separator />

          <div>
            <p className="text-sm text-muted-foreground mb-1">Posted</p>
            <p className="text-sm">Just now</p>
          </div>
        </CardContent>
      </Card>

      {/* Description Card */}
      {formData.description ? (
        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              className="prose prose-sm max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: formData.description }}
            />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <p className="text-sm">No description added yet</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Requirements Card */}
      {formData.requirements && formData.requirements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Requirements</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {formData.requirements.map((req, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <span className="text-primary mt-1">•</span>
                  <span>{typeof req === 'string' ? req : req.text}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Responsibilities Card */}
      {formData.responsibilities && formData.responsibilities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Responsibilities</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {formData.responsibilities.map((resp, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <span className="text-primary mt-1">•</span>
                  <span>{typeof resp === 'string' ? resp : resp.text}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Job Board Distribution Card */}
      {formData.jobBoardDistribution && formData.jobBoardDistribution.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Job Board Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {formData.jobBoardDistribution.map((board) => (
                <Badge key={board} variant="secondary">{board}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Apply CTA */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="py-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg mb-1">Interested in this position?</h3>
              <p className="text-sm text-muted-foreground">
                Submit your application to be considered for this role
              </p>
            </div>
            <Button size="lg" disabled>
              Apply Now
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
