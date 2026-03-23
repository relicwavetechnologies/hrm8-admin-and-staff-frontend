// @ts-nocheck
import React, { useEffect, useMemo, useState } from 'react';
import { safeOpenExternal } from '@/shared/lib/safeExternalLink';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { Progress } from '@/shared/components/ui/progress';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { Application } from '@/shared/types/application';
import { AIMatchBadge } from '@/modules/applications/components/AIMatchBadge';
import {
  FileText,
  Brain,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  GraduationCap,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  Users,
  Sparkles,
  Download,
  Eye,
  Tag,
  ClipboardList,
  UserX,
  Check,
  Lock,
} from 'lucide-react';
import { format, isValid, parseISO, formatDistanceToNow } from 'date-fns';
import { applicationService } from '@/modules/applications/lib/applicationService';
import { useCanUseAiFeatures } from '@/shared/hooks/useCanUseAiFeatures';
import { UpgradePlanDialog } from '@/shared/components/UpgradePlanDialog';
import { useToast } from '@/shared/hooks/use-toast';

interface CandidateInfoPanelProps {
  application: Application;
  jobTitle: string;
  onOfferCandidate?: (applicationId: string) => void;
  onRejectCandidate?: (applicationId: string) => void;
  canUseAiOverride?: boolean;
  offerActionsDisabledReason?: string | null;
}

// Helper function to safely format dates
function formatDateSafe(dateInput: string | Date | undefined | null, formatStr: string = 'MMM dd, yyyy'): string | null {
  if (!dateInput) return null;
  try {
    const date = typeof dateInput === 'string' ? parseISO(dateInput) : dateInput;
    if (isValid(date)) {
      return format(date, formatStr);
    }
    const fallbackDate = new Date(dateInput);
    if (isValid(fallbackDate)) {
      return format(fallbackDate, formatStr);
    }
  } catch {
    // Ignore formatting errors
  }
  return null;
}

function formatTimeAgo(dateInput: string | Date | undefined | null): string {
  if (!dateInput) return 'Just now';
  try {
    const date = typeof dateInput === 'string' ? parseISO(dateInput) : dateInput;
    if (isValid(date)) {
      return formatDistanceToNow(date, { addSuffix: true });
    }
    const fallbackDate = new Date(dateInput);
    if (isValid(fallbackDate)) {
      return formatDistanceToNow(fallbackDate, { addSuffix: true });
    }
  } catch {
    // Ignore formatting errors
  }
  return 'Just now';
}

export function CandidateInfoPanel({
  application,
  jobTitle,
  onOfferCandidate,
  onRejectCandidate,
  canUseAiOverride,
  offerActionsDisabledReason,
}: CandidateInfoPanelProps) {
  const { toast } = useToast();
  const { canUseAi } = useCanUseAiFeatures(canUseAiOverride === undefined);
  const effectiveCanUseAi = canUseAiOverride ?? canUseAi;
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [activeTab, setActiveTab] = useState<'content' | 'ai-review'>('content');
  const [resumeContent, setResumeContent] = useState<string>('');
  const [resumeContentLoading, setResumeContentLoading] = useState(false);

  const candidate = application.candidate;
  const parsedResume = application.parsedResume;
  const aiAnalysis = application.aiAnalysis;

  const candidateName = application.candidateName ||
    (candidate ? `${candidate.firstName} ${candidate.lastName}` : 'Unknown');

  const initials = candidateName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Calculate years of experience safely
  const totalExperience = parsedResume?.workHistory?.reduce((acc, job) => {
    try {
      const start = new Date(job.startDate);
      const end = job.endDate ? new Date(job.endDate) : new Date();
      if (isValid(start) && isValid(end)) {
        return acc + (end.getTime() - start.getTime());
      }
    } catch {
      // Skip invalid dates
    }
    return acc;
  }, 0) || 0;
  const yearsOfExperience = Math.floor(totalExperience / (1000 * 60 * 60 * 24 * 365));

  const keySkills = parsedResume?.skills?.slice(0, 6) || [];
  const strengths = aiAnalysis?.strengths || [];
  const concerns = aiAnalysis?.concerns || [];
  const recommendation = aiAnalysis?.recommendation || 'pending';
  const normalizedStage = String(application.stage || '').toLowerCase();
  const normalizedStatus = String(application.status || '').toLowerCase();
  const managedPipelineOwner = application.managedPipelineOwner ?? null;
  const isOfferState = normalizedStage.includes('offer') || normalizedStatus === 'offer';
  const isHiredState = normalizedStage.includes('hired') || normalizedStatus === 'hired';
  const isRejectedState = normalizedStage.includes('reject') || normalizedStatus === 'rejected';
  const isFullServiceHandoffState =
    managedPipelineOwner === 'COMPANY' || Boolean(application.offerHandoffAt);
  const isShortlistedState =
    !isFullServiceHandoffState &&
    !isRejectedState &&
    !isHiredState &&
    (isOfferState || Boolean(application.shortlisted));

  useEffect(() => {
    let cancelled = false;

    const fetchResumeContent = async () => {
      if (!application?.id) return;
      setResumeContentLoading(true);
      try {
        const response = await applicationService.getApplicationResume(application.id);
        if (!cancelled && response.success && response.data?.content) {
          setResumeContent(String(response.data.content));
        } else if (!cancelled) {
          setResumeContent('');
        }
      } catch {
        if (!cancelled) setResumeContent('');
      } finally {
        if (!cancelled) setResumeContentLoading(false);
      }
    };

    fetchResumeContent();
    return () => {
      cancelled = true;
    };
  }, [application?.id]);

  const parsedResumeSections = useMemo(() => {
    if (!resumeContent) {
      return { summary: '', experience: [] as string[], education: [] as string[], skills: [] as string[] };
    }

    const lines = resumeContent
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    const summary = lines.slice(0, 6).join(' ').slice(0, 900);
    const experience = lines.filter((line) => /(experience|worked|engineer|developer|manager|consultant)/i.test(line)).slice(0, 6);
    const education = lines.filter((line) => /(education|university|college|bachelor|master|degree|gpa)/i.test(line)).slice(0, 5);
    const skills = lines
      .filter((line) => /(skills|technologies|tools|stack|javascript|python|java|react|node|sql|aws)/i.test(line))
      .slice(0, 8);

    return { summary, experience, education, skills };
  }, [resumeContent]);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      applied: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
      screening: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
      interview: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
      offer: "bg-green-500/10 text-green-700 dark:text-green-400",
      hired: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
      rejected: "bg-red-500/10 text-red-700 dark:text-red-400",
      withdrawn: "bg-gray-500/10 text-gray-700 dark:text-gray-400",
    };
    return colors[status] || colors.applied;
  };

  const handleLockedOfferAction = () => {
    if (offerActionsDisabledReason) {
      toast({
        title: "Action locked",
        description: offerActionsDisabledReason,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="h-full flex flex-col bg-muted/20">
      {/* Candidate Header - Consolidated from CandidateProfileHeader */}
      <div className="p-3 border-b bg-background flex-shrink-0">
        <div className="flex items-start gap-2.5">
          <Avatar className="h-12 w-12 border-2 border-primary/20 flex-shrink-0">
            <AvatarImage src={application.candidatePhoto || application.candidate?.photo} />
            <AvatarFallback className="text-lg bg-primary/10 text-primary font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h2 className="text-base font-semibold truncate leading-tight">{candidateName}</h2>
              {application.aiMatchScore && (
                <AIMatchBadge score={application.aiMatchScore} size="sm" />
              )}
            </div>
            <p className="text-xs text-muted-foreground truncate mt-0.5">
              Applied for <span className="font-medium text-foreground">{jobTitle}</span>
            </p>
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              <Badge className={`${getStatusColor(application.status)} text-[10px] py-0`}>
                {application.status}
              </Badge>
              {application.stage && (
                <Badge variant="outline" className="text-[10px] py-0">
                  {application.stage}
                </Badge>
              )}
              {!isFullServiceHandoffState && isShortlistedState && (
                <Badge className="text-[10px] py-0 bg-green-600 hover:bg-green-600">
                  Shortlisted
                </Badge>
              )}
              {isHiredState && (
                <Badge className="text-[10px] py-0 bg-emerald-600 hover:bg-emerald-600">
                  Hired
                </Badge>
              )}
              {isRejectedState && (
                <Badge variant="destructive" className="text-[10px] py-0">
                  Rejected
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Contact Info Row */}
        <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground flex-wrap">
          {application.candidateEmail && (
            <a
              href={`mailto:${application.candidateEmail}`}
              className="flex items-center gap-1 hover:text-foreground transition-colors"
            >
              <Mail className="h-3 w-3" />
              <span className="truncate max-w-[120px]">{application.candidateEmail}</span>
            </a>
          )}
          {application.candidatePhone && (
            <div className="flex items-center gap-1">
              <Phone className="h-3 w-3" />
              <span>{application.candidatePhone}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground flex-wrap">
          {(application.candidateCity || application.candidateCountry) && (
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              <span>
                {[application.candidateCity, application.candidateCountry].filter(Boolean).join(', ')}
              </span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>Applied {formatTimeAgo(application.appliedDate)}</span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-1 mt-3 flex-wrap">
          <Button
            variant="default"
            size="sm"
            className="h-6 px-2 text-[10px] gap-1 bg-green-600 hover:bg-green-700"
            onClick={() => {
              if (offerActionsDisabledReason) {
                handleLockedOfferAction();
                return;
              }
              onOfferCandidate?.(application.id);
            }}
            disabled={Boolean(offerActionsDisabledReason) || isOfferState || isRejectedState || isHiredState}
          >
            <Check className="h-3 w-3" />
            Offer
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-[10px] gap-1 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40"
            onClick={() => {
              if (offerActionsDisabledReason) {
                handleLockedOfferAction();
                return;
              }
              onRejectCandidate?.(application.id);
            }}
            disabled={Boolean(offerActionsDisabledReason) || isRejectedState || isHiredState}
          >
            <UserX className="h-3 w-3" />
            Reject
          </Button>
        </div>
        {offerActionsDisabledReason && (
          <div className="flex items-center gap-1 mt-2 text-[10px] text-muted-foreground">
            <Lock className="h-3 w-3" />
            <span>{offerActionsDisabledReason}</span>
          </div>
        )}
      </div>

      {/* Content/AI Review Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="grid w-full grid-cols-2 mx-2 mt-2 flex-shrink-0" style={{ width: 'calc(100% - 16px)' }}>
          <TabsTrigger value="content" className="gap-1.5 text-xs">
            <FileText className="h-3.5 w-3.5" />
            Content
          </TabsTrigger>
          <TabsTrigger value="ai-review" className="gap-1.5 text-xs">
            {effectiveCanUseAi ? <Brain className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5 text-amber-600" />}
            AI Review
          </TabsTrigger>
        </TabsList>

        <ScrollArea className="flex-1">
          {/* Content Tab */}
          <TabsContent value="content" className="m-0 p-3 space-y-4">
            {/* Resume Section */}
            {application.resumeUrl && (
              <Card>
                <CardHeader className="pb-2 pt-3 px-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    Resume
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-3 pb-3 space-y-2">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 text-xs"
                      onClick={() => safeOpenExternal(application.resumeUrl)}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 text-xs"
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = application.resumeUrl!;
                        link.download = `${candidateName.replace(/\s+/g, '_')}_Resume.pdf`;
                        link.click();
                      }}
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Download
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Key Qualifications - AI Summary */}
            <Card className="bg-gradient-to-br from-blue-500/5 to-purple-500/5 border-primary/20">
              <CardHeader className="pb-2 pt-3 px-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Key Qualifications
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 pb-3 space-y-3">
                {/* Years of Experience */}
                {yearsOfExperience > 0 && (
                  <div className="flex items-center gap-2 p-2 bg-background/60 rounded">
                    <Briefcase className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-xs font-medium">{yearsOfExperience}+ Years Experience</p>
                      <p className="text-[10px] text-muted-foreground">
                        {parsedResume?.workHistory?.[0]?.role || parsedResume?.workHistory?.[0]?.title || 'Professional'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Top Skills */}
                {keySkills.length > 0 && (
                  <div>
                    <p className="text-xs font-medium mb-1.5">Top Skills</p>
                    <div className="flex flex-wrap gap-1">
                      {keySkills.slice(0, 4).map((skill, index) => (
                        <Badge key={index} className="text-[10px] bg-primary/10 text-primary hover:bg-primary/20">
                          {skill.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Key Strengths from AI */}
                {strengths.length > 0 && (
                  <div>
                    <p className="text-xs font-medium mb-1.5 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3 text-green-500" />
                      Strengths
                    </p>
                    <ul className="space-y-1">
                      {strengths.slice(0, 3).map((strength, index) => (
                        <li key={index} className="text-[11px] text-muted-foreground flex items-start gap-1.5">
                          <span className="text-green-500 mt-px">•</span>
                          <span className="line-clamp-2">{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* AI Match Summary */}
                {(application.aiMatchScore || aiAnalysis?.overallScore) && (
                  <div className="flex items-center justify-between p-2 bg-background/60 rounded">
                    <span className="text-xs text-muted-foreground">AI Match</span>
                    <Badge variant="secondary" className="font-semibold">
                      {aiAnalysis?.overallScore || application.aiMatchScore}%
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2 pt-3 px-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <ClipboardList className="h-4 w-4 text-primary" />
                  Parsed Resume Content
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 pb-3 space-y-2">
                {resumeContentLoading ? (
                  <p className="text-xs text-muted-foreground">Parsing resume content...</p>
                ) : parsedResumeSections.summary ? (
                  <>
                    <p className="text-xs leading-relaxed text-muted-foreground">{parsedResumeSections.summary}</p>
                    {parsedResumeSections.experience.length > 0 && (
                      <div>
                        <p className="text-[11px] font-medium mb-1">Experience Highlights</p>
                        <ul className="space-y-1">
                          {parsedResumeSections.experience.map((item, idx) => (
                            <li key={idx} className="text-xs text-muted-foreground flex gap-1.5">
                              <span>•</span>
                              <span className="line-clamp-2">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {parsedResumeSections.education.length > 0 && (
                      <div>
                        <p className="text-[11px] font-medium mb-1">Education Highlights</p>
                        <ul className="space-y-1">
                          {parsedResumeSections.education.map((item, idx) => (
                            <li key={idx} className="text-xs text-muted-foreground flex gap-1.5">
                              <span>•</span>
                              <span className="line-clamp-2">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-xs text-muted-foreground">Resume parsed content not available yet.</p>
                )}
              </CardContent>
            </Card>

            {/* Work Experience Summary */}
            {parsedResume?.workHistory && parsedResume.workHistory.length > 0 && (
              <Card>
                <CardHeader className="pb-2 pt-3 px-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-primary" />
                    Experience ({yearsOfExperience}+ years)
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-3 pb-3 space-y-3">
                  {parsedResume.workHistory.slice(0, 3).map((job, index) => (
                    <div key={index} className="text-sm">
                      <p className="font-medium">{job.role || job.title || 'Experience'}</p>
                      <p className="text-muted-foreground text-xs">{job.company}</p>
                      <p className="text-muted-foreground text-xs">
                        {job.startDate} - {job.endDate || 'Present'}
                      </p>
                    </div>
                  ))}
                  {parsedResume.workHistory.length > 3 && (
                    <p className="text-xs text-muted-foreground">
                      +{parsedResume.workHistory.length - 3} more positions
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Skills */}
            {keySkills.length > 0 && (
              <Card>
                <CardHeader className="pb-2 pt-3 px-3">
                  <CardTitle className="text-sm">Skills</CardTitle>
                </CardHeader>
                <CardContent className="px-3 pb-3">
                  <div className="flex flex-wrap gap-1.5">
                    {keySkills.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {skill.name}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Education */}
            {parsedResume?.education && parsedResume.education.length > 0 && (
              <Card>
                <CardHeader className="pb-2 pt-3 px-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-primary" />
                    Education
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-3 pb-3 space-y-2">
                  {parsedResume.education.slice(0, 2).map((edu, index) => (
                    <div key={index} className="text-sm">
                      <p className="font-medium">{edu.degree || edu.field || 'Education'}</p>
                      <p className="text-muted-foreground text-xs">{edu.institution}</p>
                      {(edu.endDate || edu.graduationDate) && (
                        <p className="text-muted-foreground text-xs">{edu.endDate || edu.graduationDate}</p>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Tags */}
            {application.tags && application.tags.length > 0 && (
              <Card>
                <CardHeader className="pb-2 pt-3 px-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Tag className="h-4 w-4 text-primary" />
                    Tags
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-3 pb-3">
                  <div className="flex flex-wrap gap-1.5">
                    {application.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* AI Review Tab */}
          <TabsContent value="ai-review" className="m-0 p-3 space-y-4">
            {!effectiveCanUseAi && (
              <div
                className="flex items-start gap-2 rounded-lg border border-amber-200/60 bg-amber-50/80 px-3 py-2.5 dark:border-amber-800/40 dark:bg-amber-950/30"
                role="alert"
              >
                <Lock className="h-4 w-4 mt-0.5 flex-shrink-0 text-amber-600 dark:text-amber-500" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-amber-800 dark:text-amber-200">
                    AI Review locked
                  </p>
                  <p className="text-[11px] text-amber-700/90 dark:text-amber-300/90 mt-0.5">
                    AI features require a paid plan (Small or higher). Upgrade to unlock AI analysis.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2 h-6 text-[11px] border-amber-300 dark:border-amber-700"
                    onClick={() => setShowUpgradeDialog(true)}
                  >
                    Upgrade to unlock
                  </Button>
                </div>
              </div>
            )}
            {/* AI Match Score */}
            <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <CardHeader className="pb-2 pt-3 px-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  AI Match Score
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 pb-3">
                <div className="flex items-center justify-center py-2">
                  <div className="text-center">
                    <span className="text-4xl font-bold text-primary">
                      {aiAnalysis?.overallScore || application.aiMatchScore || 0}%
                    </span>
                    <p className="text-xs text-muted-foreground mt-1">Match Score</p>
                  </div>
                </div>
                <Progress
                  value={aiAnalysis?.overallScore || application.aiMatchScore || 0}
                  className="h-2 mt-2"
                />
              </CardContent>
            </Card>

            {aiAnalysis?.scores && (
              <Card>
                <CardHeader className="pb-2 pt-3 px-3">
                  <CardTitle className="text-sm">Score Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="px-3 pb-3 space-y-2">
                  {Object.entries(aiAnalysis.scores).map(([key, value]) => (
                    <div key={key} className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="capitalize text-muted-foreground">{key}</span>
                        <span className="font-medium">{Number(value || 0)}%</span>
                      </div>
                      <Progress value={Number(value || 0)} className="h-1.5" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* AI Executive Summary */}
            <Card>
              <CardHeader className="pb-2 pt-3 px-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Brain className="h-4 w-4 text-primary" />
                  Executive Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 pb-3">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {aiAnalysis?.summary || aiAnalysis?.detailedAnalysis?.overallAssessment || "AI analysis pending..."}
                </p>
                {aiAnalysis?.recommendation && (
                  <div className="mt-3 flex items-center justify-between rounded-md border bg-muted/20 p-2">
                    <span className="text-xs text-muted-foreground">Recommendation</span>
                    <Badge variant={recommendation.includes('no_hire') ? 'destructive' : recommendation === 'maybe' ? 'secondary' : 'default'}>
                      {String(aiAnalysis.recommendation).replace(/_/g, ' ')}
                    </Badge>
                  </div>
                )}
                {aiAnalysis?.justification && (
                  <div className="mt-2">
                    <p className="text-[11px] font-medium mb-1">Justification</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{aiAnalysis.justification}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Strengths */}
            {strengths.length > 0 && (
              <Card>
                <CardHeader className="pb-2 pt-3 px-3">
                  <CardTitle className="text-sm flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="h-4 w-4" />
                    Key Strengths
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-3 pb-3">
                  <ul className="space-y-1.5">
                    {strengths.slice(0, 4).map((strength, index) => (
                      <li key={index} className="flex items-start gap-2 text-xs">
                        <CheckCircle2 className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">{strength}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Areas of Concern */}
            {concerns.length > 0 && (
              <Card className="border-red-200 bg-red-50/50 dark:bg-red-950/10 dark:border-red-900/50">
                <CardHeader className="pb-2 pt-3 px-3">
                  <CardTitle className="text-sm flex items-center gap-2 text-red-600 dark:text-red-400">
                    <AlertTriangle className="h-4 w-4" />
                    Areas of Concern
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-3 pb-3">
                  <ul className="space-y-1.5">
                    {concerns.slice(0, 4).map((concern, index) => (
                      <li key={index} className="flex items-start gap-2 text-xs">
                        <span className="text-red-500 mt-0.5">•</span>
                        <span className="text-foreground/80">{concern}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Cultural Fit */}
            <Card>
              <CardHeader className="pb-2 pt-3 px-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  Cultural Fit
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 pb-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl font-bold text-primary">
                    {aiAnalysis?.culturalFit?.score || 0}%
                  </span>
                  <span className="text-xs text-muted-foreground">Match</span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {aiAnalysis?.culturalFit?.analysis || "Pending analysis..."}
                </p>
                {Array.isArray(aiAnalysis?.culturalFit?.valuesMatched) && aiAnalysis.culturalFit.valuesMatched.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {aiAnalysis.culturalFit.valuesMatched.slice(0, 6).map((value: string, idx: number) => (
                      <Badge key={idx} variant="outline" className="text-[10px]">{value}</Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Compensation */}
            <Card>
              <CardHeader className="pb-2 pt-3 px-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-primary" />
                  Compensation
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 pb-3 space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Market Benchmark</span>
                  <Badge variant="outline">
                    {aiAnalysis?.salaryBenchmark?.position || "Unknown"}
                  </Badge>
                </div>
                <div className="p-2 bg-muted/30 rounded text-center">
                  <p className="text-sm font-medium">
                    {aiAnalysis?.salaryBenchmark?.marketRange || "Data unavailable"}
                  </p>
                  <p className="text-[10px] text-muted-foreground">Est. Market Range</p>
                </div>
              </CardContent>
            </Card>

            {(aiAnalysis?.communicationStyle || aiAnalysis?.careerTrajectory || aiAnalysis?.flightRisk?.reason) && (
              <Card>
                <CardHeader className="pb-2 pt-3 px-3">
                  <CardTitle className="text-sm">Behavioral & Risk Insights</CardTitle>
                </CardHeader>
                <CardContent className="px-3 pb-3 space-y-2">
                  {aiAnalysis?.communicationStyle && (
                    <div>
                      <p className="text-[11px] font-medium">Communication Style</p>
                      <p className="text-xs text-muted-foreground">{aiAnalysis.communicationStyle}</p>
                    </div>
                  )}
                  {aiAnalysis?.careerTrajectory && (
                    <div>
                      <p className="text-[11px] font-medium">Career Trajectory</p>
                      <p className="text-xs text-muted-foreground">{aiAnalysis.careerTrajectory}</p>
                    </div>
                  )}
                  {aiAnalysis?.flightRisk?.reason && (
                    <div>
                      <p className="text-[11px] font-medium">Flight Risk Detail</p>
                      <p className="text-xs text-muted-foreground">{aiAnalysis.flightRisk.reason}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {Array.isArray(aiAnalysis?.improvementAreas) && aiAnalysis.improvementAreas.length > 0 && (
              <Card>
                <CardHeader className="pb-2 pt-3 px-3">
                  <CardTitle className="text-sm">Improvement Areas</CardTitle>
                </CardHeader>
                <CardContent className="px-3 pb-3">
                  <ul className="space-y-1.5">
                    {aiAnalysis.improvementAreas.slice(0, 6).map((item: string, idx: number) => (
                      <li key={idx} className="text-xs text-muted-foreground flex gap-1.5">
                        <span>•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {aiAnalysis?.detailedAnalysis && (
              <Card>
                <CardHeader className="pb-2 pt-3 px-3">
                  <CardTitle className="text-sm">Detailed Analysis</CardTitle>
                </CardHeader>
                <CardContent className="px-3 pb-3 space-y-2">
                  {aiAnalysis.detailedAnalysis.skillsAnalysis && (
                    <div>
                      <p className="text-[11px] font-medium">Skills</p>
                      <p className="text-xs text-muted-foreground">{aiAnalysis.detailedAnalysis.skillsAnalysis}</p>
                    </div>
                  )}
                  {aiAnalysis.detailedAnalysis.experienceAnalysis && (
                    <div>
                      <p className="text-[11px] font-medium">Experience</p>
                      <p className="text-xs text-muted-foreground">{aiAnalysis.detailedAnalysis.experienceAnalysis}</p>
                    </div>
                  )}
                  {aiAnalysis.detailedAnalysis.educationAnalysis && (
                    <div>
                      <p className="text-[11px] font-medium">Education</p>
                      <p className="text-xs text-muted-foreground">{aiAnalysis.detailedAnalysis.educationAnalysis}</p>
                    </div>
                  )}
                  {aiAnalysis.detailedAnalysis.culturalFitAnalysis && (
                    <div>
                      <p className="text-[11px] font-medium">Culture Fit</p>
                      <p className="text-xs text-muted-foreground">{aiAnalysis.detailedAnalysis.culturalFitAnalysis}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </ScrollArea>
      </Tabs>
      <UpgradePlanDialog
        open={showUpgradeDialog}
        onOpenChange={setShowUpgradeDialog}
        title="Upgrade to unlock AI Review"
        description="AI Match Score, Executive Summary, Cultural Fit, and Compensation insights require a paid plan (Small or higher). Upgrade to unlock AI-powered candidate analysis."
      />
    </div>
  );
}
