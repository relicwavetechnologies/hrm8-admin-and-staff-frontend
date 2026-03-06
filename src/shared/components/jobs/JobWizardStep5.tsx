import { UseFormReturn } from "react-hook-form";
import { JobFormData } from "@/shared/types/job";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Separator } from "@/shared/components/ui/separator";
import { formatSalaryRange, formatEmploymentType, formatExperienceLevel } from "@/shared/lib/jobUtils";
import { CheckCircle, Building2, MapPin, Briefcase, Users, Eye, EyeOff, Calendar, FileText, CheckSquare, UserCheck } from "lucide-react";
import { ScrollArea } from "@/shared/components/ui/scroll-area";

interface JobWizardStep5Props {
  form: UseFormReturn<JobFormData>;
}

const formatWorkArrangement = (arrangement: string) => {
  const map: Record<string, string> = {
    'on-site': 'On-Site',
    'remote': 'Remote',
    'hybrid': 'Hybrid',
  };
  return map[arrangement] || arrangement;
};

export function JobWizardStep5({ form }: JobWizardStep5Props) {
  const formData = form.watch();

  const requirements = formData.requirements || [];
  const responsibilities = formData.responsibilities || [];
  const hiringTeam = formData.hiringTeam || [];
  const questions = formData.applicationForm?.questions || [];
  const standardFields = formData.applicationForm?.includeStandardFields;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <CheckCircle className="h-5 w-5" />
          Review & Publish
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Review all details of your job posting before publishing
        </p>
      </div>

      <ScrollArea className="h-[calc(100vh-300px)] pr-4">
        <div className="space-y-6 pb-4">
          {/* Job Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Job Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-xl mb-2">{formData.title || "Job Title"}</h3>
                <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Building2 className="h-4 w-4" />
                    <span>{formData.department || "Department"}</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{formData.location || "Location"}</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{formData.numberOfVacancies || 1} vacancy{formData.numberOfVacancies !== 1 ? 'ies' : 'y'}</span>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Employment Type</p>
                  <p className="font-medium">{formatEmploymentType(formData.employmentType)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Experience Level</p>
                  <p className="font-medium">{formatExperienceLevel(formData.experienceLevel)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Work Arrangement</p>
                  <p className="font-medium">{formatWorkArrangement(formData.workArrangement)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Salary</p>
                  <p className="font-medium">
                    {formData.hideSalary ? (
                      <span className="text-muted-foreground">Not disclosed</span>
                    ) : (formData.salaryMin || formData.salaryMax) ? (
                      formatSalaryRange(formData.salaryMin, formData.salaryMax, formData.salaryCurrency, formData.salaryPeriod)
                    ) : (
                      <span className="text-muted-foreground">Not specified</span>
                    )}
                  </p>
                </div>
              </div>

              {formData.salaryDescription && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Salary Description</p>
                  <p className="text-sm">{formData.salaryDescription}</p>
                </div>
              )}

              {formData.tags && formData.tags.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  {formData.visibility === 'public' ? (
                    <>
                      <Eye className="h-4 w-4 text-muted-foreground" />
                      <span>Public</span>
                    </>
                  ) : (
                    <>
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                      <span>Private</span>
                    </>
                  )}
                </div>
                {formData.stealth && (
                  <Badge variant="outline" className="text-xs">
                    Stealth Mode
                  </Badge>
                )}
                {formData.closeDate && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Closes: {new Date(formData.closeDate).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Job Description */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Job Description
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                <p className="text-sm whitespace-pre-wrap">{formData.description || "No description provided"}</p>
              </div>
            </CardContent>
          </Card>

          {/* Requirements */}
          {requirements.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckSquare className="h-5 w-5" />
                  Requirements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {requirements
                    .sort((a, b) => {
                      const aOrder = typeof a === 'object' ? a.order : 0;
                      const bOrder = typeof b === 'object' ? b.order : 0;
                      return aOrder - bOrder;
                    })
                    .map((req, index) => {
                      const text = typeof req === 'string' ? req : req.text;
                      return (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <span className="text-primary mt-1">•</span>
                          <span>{text}</span>
                        </li>
                      );
                    })}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Responsibilities */}
          {responsibilities.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckSquare className="h-5 w-5" />
                  Responsibilities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {responsibilities
                    .sort((a, b) => {
                      const aOrder = typeof a === 'object' ? a.order : 0;
                      const bOrder = typeof b === 'object' ? b.order : 0;
                      return aOrder - bOrder;
                    })
                    .map((resp, index) => {
                      const text = typeof resp === 'string' ? resp : resp.text;
                      return (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <span className="text-primary mt-1">•</span>
                          <span>{text}</span>
                        </li>
                      );
                    })}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Hiring Team */}
          {hiringTeam.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5" />
                  Hiring Team ({hiringTeam.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {hiringTeam.map((member, index) => (
                    <div key={member.id || index} className="flex items-start justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{member.name}</p>
                        <p className="text-xs text-muted-foreground">{member.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {member.role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </Badge>
                          {member.status === 'pending_invite' && (
                            <Badge variant="secondary" className="text-xs">
                              Pending Invite
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                        {member.permissions.canViewApplications && (
                          <span>View Applications</span>
                        )}
                        {member.permissions.canShortlist && (
                          <span>Shortlist</span>
                        )}
                        {member.permissions.canScheduleInterviews && (
                          <span>Schedule Interviews</span>
                        )}
                        {member.permissions.canMakeOffers && (
                          <span>Make Offers</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Application Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Application Form
              </CardTitle>
              <CardDescription>
                Standard fields and custom questions for applicants
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Standard Fields */}
              {standardFields && (
                <div>
                  <p className="text-sm font-medium mb-2">Standard Fields</p>
                  <div className="space-y-2">
                    {standardFields.resume && (
                      <div className="flex items-center justify-between text-sm p-2 bg-muted rounded">
                        <span>Resume / CV</span>
                        <Badge variant={standardFields.resume.required ? "default" : "secondary"}>
                          {standardFields.resume.required ? "Required" : "Optional"}
                        </Badge>
                      </div>
                    )}
                    {standardFields.coverLetter?.included && (
                      <div className="flex items-center justify-between text-sm p-2 bg-muted rounded">
                        <span>Cover Letter</span>
                        <Badge variant={standardFields.coverLetter.required ? "default" : "secondary"}>
                          {standardFields.coverLetter.required ? "Required" : "Optional"}
                        </Badge>
                      </div>
                    )}
                    {standardFields.portfolio?.included && (
                      <div className="flex items-center justify-between text-sm p-2 bg-muted rounded">
                        <span>Portfolio / Work Samples</span>
                        <Badge variant={standardFields.portfolio.required ? "default" : "secondary"}>
                          {standardFields.portfolio.required ? "Required" : "Optional"}
                        </Badge>
                      </div>
                    )}
                    {standardFields.linkedIn?.included && (
                      <div className="flex items-center justify-between text-sm p-2 bg-muted rounded">
                        <span>LinkedIn Profile</span>
                        <Badge variant={standardFields.linkedIn.required ? "default" : "secondary"}>
                          {standardFields.linkedIn.required ? "Required" : "Optional"}
                        </Badge>
                      </div>
                    )}
                    {standardFields.website?.included && (
                      <div className="flex items-center justify-between text-sm p-2 bg-muted rounded">
                        <span>Personal Website</span>
                        <Badge variant={standardFields.website.required ? "default" : "secondary"}>
                          {standardFields.website.required ? "Required" : "Optional"}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Custom Questions */}
              {questions.length > 0 ? (
                <div>
                  <p className="text-sm font-medium mb-2">Custom Questions ({questions.length})</p>
                  <div className="space-y-2">
                    {questions
                      .sort((a, b) => a.order - b.order)
                      .map((question, index) => (
                        <div key={question.id || index} className="p-3 border rounded-lg">
                          <div className="flex items-start justify-between mb-1">
                            <p className="font-medium text-sm">{question.label}</p>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {question.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </Badge>
                              {question.required && (
                                <Badge variant="destructive" className="text-xs">
                                  Required
                                </Badge>
                              )}
                            </div>
                          </div>
                          {question.description && (
                            <p className="text-xs text-muted-foreground mb-2">{question.description}</p>
                          )}
                          {question.options && question.options.length > 0 && (
                            <div className="text-xs text-muted-foreground">
                              Options: {question.options.map(opt => opt.label).join(', ')}
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No custom questions added</p>
              )}
            </CardContent>
          </Card>

        </div>
      </ScrollArea>
    </div>
  );
}
