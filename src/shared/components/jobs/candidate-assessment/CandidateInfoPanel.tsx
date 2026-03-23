import { useMemo, useState } from "react";
import { SafeExternalLink } from "@/shared/components/SafeExternalLink";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { Application } from "@/shared/types/application";
import { AIMatchBadge } from "@/shared/components/applications/AIMatchBadge";
import { Download, Eye, Lock, Mail, MapPin, Phone } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface CandidateInfoPanelProps {
  application: Application;
  jobTitle: string;
  canUseAi: boolean;
  aiLockMessage?: string;
  onOfferCandidate?: (applicationId: string) => void;
  onRejectCandidate?: (applicationId: string) => void;
}

export function CandidateInfoPanel({
  application,
  jobTitle,
  canUseAi,
  aiLockMessage,
  onOfferCandidate,
  onRejectCandidate,
}: CandidateInfoPanelProps) {
  const [activeTab, setActiveTab] = useState<"content" | "ai-review">("content");

  const candidateName = application.candidateName || "Unknown Candidate";
  const initials = candidateName
    .split(" ")
    .map((part) => part[0] || "")
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const keyQualifications = useMemo(() => {
    const strengths = application.aiAnalysis?.strengths || [];
    const skills = application.parsedResume?.skills?.slice(0, 6).map((skill) => skill.name) || [];
    return [...strengths, ...skills].filter(Boolean).slice(0, 6);
  }, [application.aiAnalysis?.strengths, application.parsedResume?.skills]);

  const parsedResumeSummary = useMemo(() => {
    const summary = application.parsedResume?.summary?.trim();
    if (summary) return summary;

    const experience = application.parsedResume?.workHistory?.slice(0, 3) || [];
    if (experience.length > 0) {
      return experience
        .map((item) => `${item.title} at ${item.company}`)
        .join(". ");
    }

    return "Parsing resume content...";
  }, [application.parsedResume]);

  const statusTone = (status: string) => {
    switch (status) {
      case "offer":
        return "bg-green-500/10 text-green-700";
      case "interview":
        return "bg-orange-500/10 text-orange-700";
      case "screening":
        return "bg-violet-500/10 text-violet-700";
      case "rejected":
        return "bg-red-500/10 text-red-700";
      case "hired":
        return "bg-emerald-500/10 text-emerald-700";
      default:
        return "bg-blue-500/10 text-blue-700";
    }
  };

  return (
    <div className="h-full border-r bg-background">
      <ScrollArea className="h-full">
        <div className="p-4 space-y-4">
          <div className="rounded-2xl border bg-card p-4">
            <div className="flex items-start gap-3">
              <Avatar className="h-14 w-14 border-2 border-primary/10">
                <AvatarImage src={application.candidatePhoto} />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="truncate text-2xl font-semibold leading-tight">{candidateName}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Applied for <span className="font-medium text-foreground">{jobTitle}</span>
                    </p>
                  </div>
                  {application.aiMatchScore ? <AIMatchBadge score={application.aiMatchScore} size="sm" /> : null}
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Badge className={statusTone(application.status)}>{application.status}</Badge>
                  <Badge variant="outline">{application.stage}</Badge>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <Mail className="h-4 w-4" />
                    {application.candidateEmail}
                  </span>
                  {application.candidatePhone ? (
                    <span className="inline-flex items-center gap-1.5">
                      <Phone className="h-4 w-4" />
                      {application.candidatePhone}
                    </span>
                  ) : null}
                  {(application.candidateCity || application.candidateState || application.candidateCountry) ? (
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="h-4 w-4" />
                      {[application.candidateCity, application.candidateState, application.candidateCountry].filter(Boolean).join(", ")}
                    </span>
                  ) : null}
                  <span>Applied {formatDistanceToNow(application.appliedDate, { addSuffix: true })}</span>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <Button
                    size="sm"
                    className="h-10 rounded-xl bg-green-600 px-5 hover:bg-green-700"
                    onClick={() => onOfferCandidate?.(application.id)}
                    disabled={!onOfferCandidate}
                  >
                    Offer
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-10 rounded-xl border-red-200 px-5 text-red-600 hover:bg-red-50"
                    onClick={() => onRejectCandidate?.(application.id)}
                    disabled={!onRejectCandidate}
                  >
                    Reject
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "content" | "ai-review")} className="space-y-4">
            <TabsList className="grid h-12 w-full grid-cols-2 rounded-2xl bg-muted/40 p-1">
              <TabsTrigger value="content" className="rounded-xl">
                Content
              </TabsTrigger>
              <TabsTrigger value="ai-review" className="rounded-xl">
                AI Review
              </TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="mt-0 space-y-4">
              <Card className="rounded-2xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Resume</CardTitle>
                </CardHeader>
                <CardContent className="flex gap-2">
                  <Button variant="outline" className="flex-1 rounded-xl">
                    <Eye className="mr-2 h-4 w-4" />
                    View
                  </Button>
                  <Button variant="outline" className="flex-1 rounded-xl" asChild={Boolean(application.resumeUrl)}>
                    {application.resumeUrl ? (
                      <SafeExternalLink href={application.resumeUrl}>
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </SafeExternalLink>
                    ) : (
                      <span>
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </span>
                    )}
                  </Button>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-primary/15 bg-primary/5">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Key Qualifications</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {keyQualifications.length > 0 ? (
                    keyQualifications.map((item) => (
                      <div key={item} className="rounded-xl bg-background px-3 py-2 text-sm text-foreground/80">
                        {item}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">AI summary will appear here once analysis is available.</p>
                  )}
                </CardContent>
              </Card>

              <Card className="rounded-2xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Parsed Resume Content</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-6 text-muted-foreground">{parsedResumeSummary}</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="ai-review" className="mt-0">
              <Card className="rounded-2xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">AI Review</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {!canUseAi ? (
                    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                      <div className="flex items-center gap-2 font-medium">
                        <Lock className="h-4 w-4" />
                        AI Review locked
                      </div>
                      <p className="mt-2 text-amber-700">{aiLockMessage || "Upgrade the company plan to unlock AI review."}</p>
                    </div>
                  ) : application.aiAnalysis ? (
                    <>
                      <p className="text-sm leading-6 text-muted-foreground">{application.aiAnalysis.justification}</p>
                      {application.aiAnalysis.concerns?.length ? (
                        <div className="space-y-2">
                          {application.aiAnalysis.concerns.map((concern) => (
                            <div key={concern} className="rounded-xl border border-border bg-muted/20 px-3 py-2 text-sm">
                              {concern}
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">AI review will appear here once analysis completes.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </ScrollArea>
    </div>
  );
}
