import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Application } from "@/shared/types/application";
import {
  Calendar,
  DollarSign,
  Briefcase,
  Clock,
  FileText,
  Shield,
  CheckCircle2,
} from "lucide-react";
import { format } from "date-fns";

interface ApplicationDetailsTabProps {
  application: Application;
}

export function ApplicationDetailsTab({ application }: ApplicationDetailsTabProps) {
  return (
    <div className="max-w-5xl space-y-6">


      {/* Application Metadata */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Application Metadata
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Application Date</label>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm">{format(application.appliedDate, "PPP 'at' p")}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Application Source</label>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary">LinkedIn</Badge>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Application ID</label>
                <p className="text-sm text-muted-foreground mt-1 font-mono">
                  {application.id}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                <div className="flex items-center gap-2 mt-1">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm">{format(application.updatedAt, "PPP 'at' p")}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Referral</label>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-sm">Direct application</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Device Used</label>
                <p className="text-sm text-muted-foreground mt-1">
                  Desktop - Chrome (San Francisco, CA)
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Job Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Job Preferences & Expectations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Desired Salary Range</label>
                <div className="flex items-center gap-2 mt-1">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  {application.candidatePreferences?.salaryPreference ? (
                    <>
                      <p className="text-sm font-medium">
                        {application.candidatePreferences.salaryPreference.min?.toLocaleString()} - {application.candidatePreferences.salaryPreference.max?.toLocaleString()}
                      </p>
                      <Badge variant="secondary" className="text-xs">
                        {application.candidatePreferences.salaryPreference.currency}/{application.candidatePreferences.salaryPreference.period}
                      </Badge>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">Not provided</p>
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Work Arrangement Preference</label>
                <div className="flex items-center gap-2 mt-1">
                  {application.candidatePreferences?.workArrangement && application.candidatePreferences.workArrangement.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {application.candidatePreferences.workArrangement.map((pref, i) => (
                        <Badge key={i} variant="outline">{pref}</Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">Not provided</p>
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Employment Type</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {application.candidatePreferences?.employmentType && application.candidatePreferences.employmentType.length > 0 ? (
                    application.candidatePreferences.employmentType.map((type, i) => (
                      <Badge key={i} variant="secondary">{type}</Badge>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground italic">Not provided</p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Start Date Availability</label>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  {application.candidatePreferences?.startDate ? (
                    <p className="text-sm">{format(new Date(application.candidatePreferences.startDate), "PPP")}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">Not provided</p>
                  )}
                </div>
                {application.candidatePreferences?.noticePeriod && (
                  <p className="text-xs text-muted-foreground mt-1">{application.candidatePreferences.noticePeriod}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Willing to Relocate</label>
                <div className="flex items-center gap-2 mt-1">
                  <CheckCircle2 className={`h-4 w-4 ${application.candidatePreferences?.willingToRelocate ? 'text-green-500' : 'text-muted-foreground'}`} />
                  <p className="text-sm">
                    {application.candidatePreferences?.willingToRelocate === undefined
                      ? <span className="text-muted-foreground italic">Not provided</span>
                      : application.candidatePreferences.willingToRelocate ? 'Yes' : 'No'}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Visa Sponsorship</label>
                <div className="flex items-center gap-2 mt-1">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm">
                    {application.candidatePreferences?.visaStatus || <span className="text-muted-foreground italic">Not provided</span>}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Custom Application Questions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Application Questions & Responses
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {application.customAnswers && application.customAnswers.length > 0 ? (
            application.customAnswers.map((q, index) => (
              <div key={q.questionId || index} className={index > 0 ? "pt-6 border-t" : ""}>
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-4">
                    <h4 className="text-sm font-semibold">
                      Question {index + 1}: {q.question}
                    </h4>
                  </div>

                  <div className="bg-muted/50 rounded-lg p-4">
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {Array.isArray(q.answer) ? q.answer.join(', ') : q.answer}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-muted-foreground text-sm">
              No application questions available.
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
}
