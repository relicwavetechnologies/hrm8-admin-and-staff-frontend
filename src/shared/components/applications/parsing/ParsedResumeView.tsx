import { ParsedResume, WorkExperience, Education, Skill, Certification } from "@/shared/types/application";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Separator } from "@/shared/components/ui/separator";
import {
  Briefcase, GraduationCap, Award, Code,
  Calendar, MapPin, Building2, ExternalLink,
  ChevronDown, ChevronUp
} from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/shared/components/ui/collapsible";

interface ParsedResumeViewProps {
  parsedResume: ParsedResume;
  resumeUrl?: string;
}

export function ParsedResumeView({ parsedResume, resumeUrl }: ParsedResumeViewProps) {
  const [expandedSections, setExpandedSections] = useState({
    workHistory: true,
    education: true,
    skills: true,
    certifications: true,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };





  return (
    <div className="space-y-4">
      {/* Summary Section */}
      {parsedResume.summary && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Code className="h-4 w-4" />
              Professional Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{parsedResume.summary}</p>
          </CardContent>
        </Card>
      )}

      {/* Work History */}
      <Card>
        <Collapsible
          open={expandedSections.workHistory}
          onOpenChange={() => toggleSection('workHistory')}
        >
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  Work Experience ({parsedResume.workHistory.length})
                </CardTitle>
                {expandedSections.workHistory ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-4">
              {parsedResume.workHistory.length === 0 ? (
                <p className="text-sm text-muted-foreground">No work experience found</p>
              ) : (
                parsedResume.workHistory.map((exp, index) => (
                  <div key={index}>
                    {index > 0 && <Separator className="my-4" />}
                    <WorkExperienceItem experience={exp} />
                  </div>
                ))
              )}
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Education */}
      <Card>
        <Collapsible
          open={expandedSections.education}
          onOpenChange={() => toggleSection('education')}
        >
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  Education ({parsedResume.education.length})
                </CardTitle>
                {expandedSections.education ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-4">
              {parsedResume.education.length === 0 ? (
                <p className="text-sm text-muted-foreground">No education found</p>
              ) : (
                parsedResume.education.map((edu, index) => (
                  <div key={index}>
                    {index > 0 && <Separator className="my-4" />}
                    <EducationItem education={edu} />
                  </div>
                ))
              )}
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Skills */}
      <Card>
        <Collapsible
          open={expandedSections.skills}
          onOpenChange={() => toggleSection('skills')}
        >
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Code className="h-4 w-4" />
                  Skills ({parsedResume.skills.length})
                </CardTitle>
                {expandedSections.skills ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent>
              {parsedResume.skills.length === 0 ? (
                <p className="text-sm text-muted-foreground">No skills found</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {parsedResume.skills.map((skill, index) => (
                    <SkillBadge key={index} skill={skill} />
                  ))}
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Certifications */}
      {parsedResume.certifications.length > 0 && (
        <Card>
          <Collapsible
            open={expandedSections.certifications}
            onOpenChange={() => toggleSection('certifications')}
          >
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Award className="h-4 w-4" />
                    Certifications ({parsedResume.certifications.length})
                  </CardTitle>
                  {expandedSections.certifications ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-4">
                {parsedResume.certifications.map((cert, index) => (
                  <div key={index}>
                    {index > 0 && <Separator className="my-4" />}
                    <CertificationItem certification={cert} />
                  </div>
                ))}
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      )}

      {/* View Original Resume */}
      {resumeUrl && (
        <Card>
          <CardContent className="pt-6">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => window.open(resumeUrl, '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View Original Resume
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Parsed At */}
      <div className="text-xs text-muted-foreground text-center">
        Parsed on {format(new Date(parsedResume.parsedAt), 'MMM d, yyyy')}
      </div>
    </div>
  );
}

function WorkExperienceItem({ experience }: { experience: WorkExperience }) {
  const formatDate = (date: Date | string) => {
    try {
      const d = typeof date === 'string' ? new Date(date) : date;
      return format(d, 'MMM yyyy');
    } catch {
      return 'Date unknown';
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-sm">{experience.title}</h4>
            {experience.current && (
              <Badge variant="outline" className="text-xs">Current</Badge>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
            <Building2 className="h-3 w-3" />
            <span>{experience.company}</span>
            {experience.location && (
              <>
                <span className="mx-1">•</span>
                <MapPin className="h-3 w-3" />
                <span>{experience.location}</span>
              </>
            )}
          </div>
        </div>
        <div className="text-sm text-muted-foreground flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          <span>
            {formatDate(experience.startDate)} - {experience.endDate ? formatDate(experience.endDate) : 'Present'}
          </span>
        </div>
      </div>
      {experience.description && (
        <p className="text-sm text-muted-foreground whitespace-pre-wrap mt-2">
          {experience.description}
        </p>
      )}
      {experience.achievements && experience.achievements.length > 0 && (
        <ul className="list-disc list-inside text-sm text-muted-foreground mt-2 space-y-1">
          {experience.achievements.map((achievement, idx) => (
            <li key={idx}>{achievement}</li>
          ))}
        </ul>
      )}
      {experience.technologies && experience.technologies.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {experience.technologies.map((tech, idx) => (
            <Badge key={idx} variant="secondary" className="text-xs">
              {tech}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

function EducationItem({ education }: { education: Education }) {
  const formatDate = (date: Date | string) => {
    try {
      const d = typeof date === 'string' ? new Date(date) : date;
      return format(d, 'MMM yyyy');
    } catch {
      return 'Date unknown';
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h4 className="font-semibold text-sm">{education.degree}</h4>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
            <Building2 className="h-3 w-3" />
            <span>{education.institution}</span>
          </div>
          {education.field && (
            <p className="text-sm text-muted-foreground mt-1">Field: {education.field}</p>
          )}
          {education.gpa && (
            <p className="text-sm text-muted-foreground">GPA: {education.gpa}</p>
          )}
        </div>
        {education.startDate && (
          <div className="text-sm text-muted-foreground flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>
              {formatDate(education.startDate)}
              {education.endDate && ` - ${formatDate(education.endDate)}`}
            </span>
          </div>
        )}
      </div>

      {education.honors && (
        <div className="mt-2">
          <p className="text-xs font-medium text-muted-foreground mb-1">Honors:</p>
          <div className="flex flex-wrap gap-1">
            <Badge variant="outline" className="text-xs">
              {education.honors}
            </Badge>
          </div>
        </div>
      )}
    </div>
  );
}

function SkillBadge({ skill }: { skill: Skill }) {
  return (
    <Badge
      variant="secondary"
      className="text-xs py-1"
    >
      {skill.name}
      {skill.yearsExperience !== undefined && (
        <span className="ml-1 text-muted-foreground">
          ({skill.yearsExperience}y)
        </span>
      )}
      {skill.proficiency && (
        <span className="ml-1 text-muted-foreground">
          - {skill.proficiency}
        </span>
      )}
    </Badge>
  );
}

function CertificationItem({ certification }: { certification: Certification }) {
  const formatDate = (date: Date | string) => {
    try {
      const d = typeof date === 'string' ? new Date(date) : date;
      return format(d, 'MMM d, yyyy');
    } catch {
      return 'Date unknown';
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h4 className="font-semibold text-sm">{certification.name}</h4>
          <p className="text-sm text-muted-foreground mt-1">Issued by {certification.issuer}</p>
          {certification.description && (
            <p className="text-sm text-muted-foreground mt-1">{certification.description}</p>
          )}
          {certification.credentialId && (
            <p className="text-xs text-muted-foreground mt-1">ID: {certification.credentialId}</p>
          )}
        </div>
        <div className="text-sm text-muted-foreground flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          <span>
            {formatDate(certification.issueDate)}
            {certification.expiryDate && ` - ${formatDate(certification.expiryDate)}`}
          </span>
        </div>
      </div>
      {certification.verificationUrl && (
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs"
          onClick={() => window.open(certification.verificationUrl, '_blank')}
        >
          <ExternalLink className="h-3 w-3 mr-1" />
          Verify
        </Button>
      )}
    </div>
  );
}

