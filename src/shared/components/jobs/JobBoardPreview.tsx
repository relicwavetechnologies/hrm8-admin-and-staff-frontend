import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { MapPin, Briefcase, DollarSign, Calendar } from "lucide-react";
import { JobFormData } from "@/shared/types/job";
import { formatSalaryRange, formatExperienceLevel } from "@/shared/lib/jobUtils";
import { EmploymentTypeBadge } from "./EmploymentTypeBadge";

interface JobBoardPreviewProps {
  formData: Partial<JobFormData>;
}

export function JobBoardPreview({ formData }: JobBoardPreviewProps) {
  return (
    <Card className="border-2 border-primary/20">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="text-2xl mb-2">
              {formData.title || "Job Title"}
            </CardTitle>
            <p className="text-muted-foreground">
              {(formData as any).employerId ? "Employer Name" : "HRM8"}
            </p>
          </div>
          <Badge variant="secondary">Preview</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Quick Info */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          {formData.location && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{formData.location}</span>
            </div>
          )}

          {formData.workArrangement && (
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              <Badge variant="outline" className="text-xs">{formData.workArrangement === 'on-site' ? 'On-site' : formData.workArrangement === 'remote' ? 'Remote' : 'Hybrid'}</Badge>
            </div>
          )}

          {formData.employmentType && (
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              <EmploymentTypeBadge type={formData.employmentType} />
            </div>
          )}

          {formData.salaryMin && formData.salaryMax && !formData.hideSalary && (
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span>
                {formatSalaryRange(
                  formData.salaryMin,
                  formData.salaryMax,
                  formData.salaryCurrency || 'USD'
                )}
              </span>
            </div>
          )}

          {formData.experienceLevel && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{formatExperienceLevel(formData.experienceLevel)}</span>
            </div>
          )}
        </div>

        {/* Description */}
        {formData.description && (
          <div>
            <h3 className="font-semibold text-lg mb-3">About the Role</h3>
            <div
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: formData.description }}
            />
          </div>
        )}

        {/* Requirements */}
        {formData.requirements && formData.requirements.length > 0 && (
          <div>
            <h3 className="font-semibold text-lg mb-3">Requirements</h3>
            <ul className="space-y-2">
              {formData.requirements.map((req, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <span className="text-primary mt-1">•</span>
                  <span>{typeof req === 'string' ? req : req.text}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Responsibilities */}
        {formData.responsibilities && formData.responsibilities.length > 0 && (
          <div>
            <h3 className="font-semibold text-lg mb-3">Responsibilities</h3>
            <ul className="space-y-2">
              {formData.responsibilities.map((resp, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <span className="text-primary mt-1">•</span>
                  <span>{typeof resp === 'string' ? resp : resp.text}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
