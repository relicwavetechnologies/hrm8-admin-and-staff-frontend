import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Separator } from "@/shared/components/ui/separator";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import {
  Briefcase,
  GraduationCap,
  Award,
  Calendar,
  MapPin,
  AlertCircle,
  CheckCircle2,
  Star
} from "lucide-react";
import { Application, WorkExperience, Skill } from "@/shared/types/application";
import { format, differenceInMonths } from "date-fns";

interface ExperienceSkillsTabProps {
  application: Application;
}

export function ExperienceSkillsTab({ application }: ExperienceSkillsTabProps) {
  const parsedResume = application.parsedResume;

  const workHistory = application.candidate?.workExperience?.map(exp => ({
    id: exp.id,
    company: exp.company,
    title: exp.role,
    startDate: exp.startDate,
    endDate: exp.endDate,
    current: exp.current,
    location: exp.location,
    description: exp.description,
    responsibilities: [],
    achievements: [],
    technologies: [],
    reasonForLeaving: undefined,
    employmentType: undefined
  })) || parsedResume?.workHistory || [];

  const education = application.candidate?.education?.map(edu => ({
    id: edu.id,
    institution: edu.institution,
    degree: edu.degree,
    field: edu.field,
    startDate: edu.startDate,
    endDate: edu.endDate,
    gpa: edu.grade,
    relevantCoursework: [],
    honors: undefined,
    thesisTitle: undefined
  })) || parsedResume?.education || [];

  const skills = application.candidate?.skills?.map(skill => ({
    name: skill.name,
    category: 'General',
    proficiency: (skill.level?.toLowerCase() || 'intermediate') as 'beginner' | 'intermediate' | 'advanced' | 'expert',
    yearsExperience: undefined,
    endorsements: 0
  })) || parsedResume?.skills || [];

  const certifications = parsedResume?.certifications || [];

  // Calculate career gaps
  const calculateGaps = (workHistory: WorkExperience[]) => {
    if (!workHistory || workHistory.length === 0) return [];

    const sorted = [...workHistory].sort((a, b) => {
      const dateA = a.startDate ? new Date(a.startDate).getTime() : 0;
      const dateB = b.startDate ? new Date(b.startDate).getTime() : 0;
      return dateB - dateA;
    });

    const gaps: { start: Date; end: Date; duration: number }[] = [];

    for (let i = 0; i < sorted.length - 1; i++) {
      const currentEnd = sorted[i].endDate ? new Date(sorted[i].endDate as any) : new Date();
      const nextStart = sorted[i + 1].startDate;

      if (nextStart) {
        const gapMonths = differenceInMonths(new Date(currentEnd as any), new Date(nextStart as any));

        if (gapMonths > 3) {
          gaps.push({
            start: new Date(nextStart),
            end: new Date(currentEnd),
            duration: gapMonths
          });
        }
      }
    }

    return gaps;
  };

  const careerGaps = calculateGaps(workHistory);

  // Group skills by category
  const skillsByCategory = skills.reduce((acc, skill) => {
    if (!acc[skill.category]) acc[skill.category] = [];
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);

  const getProficiencyColor = (proficiency: string) => {
    switch (proficiency) {
      case 'expert': return 'bg-green-600 dark:bg-green-500';
      case 'advanced': return 'bg-blue-600 dark:bg-blue-500';
      case 'intermediate': return 'bg-yellow-600 dark:bg-yellow-500';
      case 'beginner': return 'bg-muted-foreground';
      default: return 'bg-muted-foreground';
    }
  };

  const getProficiencyLevel = (proficiency: string) => {
    switch (proficiency) {
      case 'expert': return 100;
      case 'advanced': return 75;
      case 'intermediate': return 50;
      case 'beginner': return 25;
      default: return 0;
    }
  };

  return (
    <ScrollArea className="h-full">
      <div className="p-12 space-y-6">
        {/* Work Experience Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Work Experience
            </CardTitle>
            <CardDescription>
              Career history and professional achievements
            </CardDescription>
          </CardHeader>
          <CardContent>
            {workHistory.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Briefcase className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No work experience available</p>
              </div>
            ) : (
              <div className="space-y-6">
                {workHistory.map((exp, index) => {
                  const endDate = exp.endDate ? new Date(exp.endDate) : new Date();
                  const duration = differenceInMonths(endDate, new Date(exp.startDate));
                  const years = Math.floor(duration / 12);
                  const months = duration % 12;

                  return (
                    <div key={exp.id} className="relative pl-6 pb-6 border-l-2 border-muted last:pb-0">
                      <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-primary border-4 border-background" />

                      <div className="space-y-3">
                        <div>
                          <div className="flex items-start justify-between mb-1">
                            <div>
                              <h4 className="font-semibold text-lg">{exp.title}</h4>
                              <p className="text-base text-muted-foreground">{exp.company}</p>
                            </div>
                            {exp.current && (
                              <Badge variant="secondary">Current</Badge>
                            )}
                          </div>

                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(exp.startDate), 'MMM yyyy')} - {exp.endDate ? format(new Date(exp.endDate), 'MMM yyyy') : 'Present'}
                            </span>
                            <span>
                              {years > 0 && `${years}y `}
                              {months > 0 && `${months}m`}
                            </span>
                            {exp.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {exp.location}
                              </span>
                            )}
                            {exp.employmentType && (
                              <Badge variant="outline" className="text-xs">
                                {exp.employmentType}
                              </Badge>
                            )}
                          </div>
                        </div>

                        {exp.responsibilities.length > 0 && (
                          <div>
                            <p className="text-sm font-medium mb-2">Key Responsibilities:</p>
                            <ul className="space-y-1 text-sm text-muted-foreground">
                              {exp.responsibilities.map((resp, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <span className="mt-1.5 h-1 w-1 rounded-full bg-muted-foreground flex-shrink-0" />
                                  <span>{resp}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {exp.achievements.length > 0 && (
                          <div>
                            <p className="text-sm font-medium mb-2 flex items-center gap-1">
                              <Star className="h-3 w-3 text-yellow-500" />
                              Key Achievements:
                            </p>
                            <ul className="space-y-1 text-sm text-muted-foreground">
                              {exp.achievements.map((achievement, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <CheckCircle2 className="h-3 w-3 mt-1 text-green-500 flex-shrink-0" />
                                  <span>{achievement}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {exp.technologies.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {exp.technologies.map((tech, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {tech}
                              </Badge>
                            ))}
                          </div>
                        )}

                        {exp.reasonForLeaving && (
                          <div className="text-sm text-muted-foreground italic">
                            Reason for leaving: {exp.reasonForLeaving}
                          </div>
                        )}
                      </div>

                      {/* Show gap if exists */}
                      {index < workHistory.length - 1 && careerGaps[index] && (
                        <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                          <div className="flex items-center gap-2 text-sm text-yellow-700 dark:text-yellow-400">
                            <AlertCircle className="h-4 w-4" />
                            <span className="font-medium">
                              Career gap: {Math.floor(careerGaps[index].duration / 12)}y {careerGaps[index].duration % 12}m
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Education History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Education
            </CardTitle>
            <CardDescription>
              Academic qualifications and degrees
            </CardDescription>
          </CardHeader>
          <CardContent>
            {education.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <GraduationCap className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No education information available</p>
              </div>
            ) : (
              <div className="space-y-6">
                {education.map((edu) => (
                  <div key={edu.id} className="space-y-3">
                    <div>
                      <h4 className="font-semibold text-lg">{edu.degree} in {edu.field}</h4>
                      <p className="text-base text-muted-foreground">{edu.institution}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {edu.startDate ? format(new Date(edu.startDate), 'MMM yyyy') : 'N/A'} - {edu.endDate ? format(new Date(edu.endDate), 'MMM yyyy') : 'Present'}
                        </span>
                        {edu.gpa && (
                          <span>
                            GPA: {edu.gpa}
                          </span>
                        )}
                      </div>
                    </div>

                    {edu.honors && (
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm font-medium">{edu.honors}</span>
                      </div>
                    )}

                    {edu.thesisTitle && (
                      <div className="text-sm">
                        <span className="font-medium">Thesis: </span>
                        <span className="text-muted-foreground">{edu.thesisTitle}</span>
                      </div>
                    )}

                    {edu.relevantCoursework && edu.relevantCoursework.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-2">Relevant Coursework:</p>
                        <div className="flex flex-wrap gap-1">
                          {edu.relevantCoursework.map((course, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {course}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {edu !== education[education.length - 1] && <Separator />}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Certifications */}
        {certifications.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Certifications & Licenses
              </CardTitle>
              <CardDescription>
                Professional certifications and credentials
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {certifications.map((cert) => {
                  const isExpired = cert.expiryDate && new Date(cert.expiryDate) < new Date();
                  const isExpiringSoon = cert.expiryDate &&
                    new Date(cert.expiryDate) < new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);

                  return (
                    <div key={cert.id} className="flex items-start justify-between p-4 border rounded-lg">
                      <div className="space-y-2">
                        <div>
                          <h4 className="font-semibold">{cert.name}</h4>
                          <p className="text-sm text-muted-foreground">{cert.issuer}</p>
                        </div>

                        {cert.description && (
                          <p className="text-sm text-muted-foreground">{cert.description}</p>
                        )}

                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Issued: {format(new Date(cert.issueDate), 'MMM yyyy')}</span>
                          {cert.expiryDate && (
                            <span className={isExpired ? 'text-red-500' : isExpiringSoon ? 'text-yellow-500' : ''}>
                              Expires: {format(new Date(cert.expiryDate), 'MMM yyyy')}
                            </span>
                          )}
                          {cert.credentialId && (
                            <span>ID: {cert.credentialId}</span>
                          )}
                        </div>

                        {cert.verificationUrl && (
                          <Button variant="link" size="sm" className="h-auto p-0">
                            Verify Credential
                          </Button>
                        )}
                      </div>

                      {isExpired ? (
                        <Badge variant="destructive">Expired</Badge>
                      ) : isExpiringSoon ? (
                        <Badge variant="outline" className="text-yellow-500 border-yellow-500">Expiring Soon</Badge>
                      ) : (
                        <Badge variant="secondary">Valid</Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Skills Matrix */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Skills Matrix
            </CardTitle>
            <CardDescription>
              Technical and professional competencies
            </CardDescription>
          </CardHeader>
          <CardContent>
            {skills.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Award className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No skills information available</p>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(skillsByCategory).map(([category, categorySkills]) => (
                  <div key={category}>
                    <h4 className="font-semibold mb-4 text-sm uppercase tracking-wide text-muted-foreground">
                      {category}
                    </h4>
                    <div className="grid gap-3">
                      {categorySkills.map((skill, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="font-medium text-sm">{skill.name}</span>
                              <Badge variant="outline" className="text-xs capitalize">
                                {skill.proficiency}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              {skill.yearsExperience && (
                                <span>{skill.yearsExperience}y exp</span>
                              )}
                              {skill.endorsements && skill.endorsements > 0 && (
                                <span className="flex items-center gap-1">
                                  <CheckCircle2 className="h-3 w-3" />
                                  {skill.endorsements}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className={`h-full ${getProficiencyColor(skill.proficiency)} transition-all`}
                              style={{ width: `${getProficiencyLevel(skill.proficiency)}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Career Gap Analysis */}
        {careerGaps.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-500" />
                Career Gap Analysis
              </CardTitle>
              <CardDescription>
                Employment gaps detected in work history
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {careerGaps.map((gap, index) => {
                  const years = Math.floor(gap.duration / 12);
                  const months = gap.duration % 12;

                  return (
                    <div key={index} className="p-4 border rounded-lg bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-sm">
                            {format(new Date(gap.start), 'MMM yyyy')} - {format(new Date(gap.end), 'MMM yyyy')}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Duration: {years > 0 && `${years} year${years > 1 ? 's' : ''} `}
                            {months > 0 && `${months} month${months > 1 ? 's' : ''}`}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-yellow-700 dark:text-yellow-400 border-yellow-700 dark:border-yellow-400">
                          Gap
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </ScrollArea>
  );
}
