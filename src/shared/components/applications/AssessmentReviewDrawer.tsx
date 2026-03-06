import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/shared/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar";
import { Separator } from "@/shared/components/ui/separator";
import { format } from "date-fns";
import { Loader2, Eye, Send, CheckCircle2, Clock, AlertCircle, ArrowRight } from "lucide-react";
import { JobRound } from "@/shared/lib/api/jobRoundService";
import { apiClient } from "@/shared/lib/api";
import { toast } from "sonner";
import { AssessmentGradingDialog } from "./AssessmentGradingDialog";

interface AssessmentReviewDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobId: string;
  round: JobRound;
  onMoveToNextRound?: (applicationId: string) => void;
}

interface RoundAssessment {
  id: string;
  applicationId: string;
  candidateName: string;
  candidateEmail: string;
  status: string;
  score: number | null;
  averageScore?: number | null;
  invitedAt: string;
  completedAt: string | null;
  invitationToken: string;
  isMovedToNextRound?: boolean;
  applicationStage?: string;
}

export function AssessmentReviewDrawer({
  open,
  onOpenChange,
  jobId,
  round,
  onMoveToNextRound
}: AssessmentReviewDrawerProps) {
  const [loading, setLoading] = useState(false);
  const [assessments, setAssessments] = useState<RoundAssessment[]>([]);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string | null>(null);
  const [gradingOpen, setGradingOpen] = useState(false);
  const [resendingId, setResendingId] = useState<string | null>(null);

  useEffect(() => {
    if (open && jobId && round?.id) {
      fetchAssessments();
    }
  }, [open, jobId, round]);

  const fetchAssessments = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get<RoundAssessment[]>(`/api/jobs/${jobId}/rounds/${round.id}/assessments`);
      if (response.success && response.data) {
        setAssessments(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch assessments", error);
      toast.error("Failed to load assessments");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async (id: string) => {
    setResendingId(id);
    try {
      const response = await apiClient.post(`/api/assessments/${id}/resend`);
      if (response.success) {
        toast.success("Invitation resent successfully");
        fetchAssessments(); // Refresh to update timestamp
      }
    } catch (error) {
      console.error("Failed to resend invitation", error);
      toast.error("Failed to resend invitation");
    } finally {
      setResendingId(null);
    }
  };

  const handleGrade = (id: string) => {
    setSelectedAssessmentId(id);
    setGradingOpen(true);
  };

  const submissions = assessments.filter(a => a.status === 'COMPLETED' && !a.isMovedToNextRound);
  const pending = assessments.filter(a => a.status !== 'COMPLETED' && !a.isMovedToNextRound);
  const passed = assessments.filter(a => a.isMovedToNextRound);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-[85vw] sm:w-[85vw] sm:max-w-[85vw]">
          <SheetHeader className="mb-6">
            <SheetTitle>Assessment Review: {round.name}</SheetTitle>
            <SheetDescription>
              Manage assessments, review submissions, and grade candidates.
            </SheetDescription>
          </SheetHeader>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Tabs defaultValue="submissions" className="h-[calc(100vh-150px)]">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="submissions">
                  Submissions ({submissions.length})
                </TabsTrigger>
                <TabsTrigger value="pending">
                  Pending ({pending.length})
                </TabsTrigger>
                <TabsTrigger value="passed">
                  Passed ({passed.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="submissions" className="h-full mt-4">
                <ScrollArea className="h-[calc(100vh-200px)] pr-4">
                  {submissions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                      <CheckCircle2 className="h-10 w-10 mb-2 opacity-20" />
                      <p>No submissions yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {submissions.map((assessment) => (
                        <Card key={assessment.id} className="overflow-hidden">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Avatar>
                                  <AvatarFallback>{getInitials(assessment.candidateName)}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <h4 className="font-medium">{assessment.candidateName}</h4>
                                  <div className="flex items-center text-xs text-muted-foreground gap-2">
                                    <span>{assessment.candidateEmail}</span>
                                    <span>•</span>
                                    <Badge variant="secondary" className="text-sm h-6 px-2.5 rounded-full">
                                      {assessment.averageScore != null ? `Avg: ${assessment.averageScore}` : 'Avg: N/A'}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleGrade(assessment.id)}
                                >
                                  <Eye className="h-3 w-3 mr-2" />
                                  Review & Grade
                                </Button>
                                {onMoveToNextRound && (
                                  <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={() => onMoveToNextRound(assessment.applicationId)}
                                  >
                                    <ArrowRight className="h-3 w-3 mr-2" />
                                    Next Stage
                                  </Button>
                                )}
                              </div>
                            </div>
                            <Separator className="my-3" />
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Completed: {assessment.completedAt ? format(new Date(assessment.completedAt), 'PP p') : '-'}
                              </div>
                              <Badge variant={assessment.score && assessment.score >= 70 ? "success" : "secondary"}>
                                {assessment.status}
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>

              <TabsContent value="pending" className="h-full mt-4">
                <ScrollArea className="h-[calc(100vh-200px)] pr-4">
                  {pending.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                      <AlertCircle className="h-10 w-10 mb-2 opacity-20" />
                      <p>No pending assessments</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {pending.map((assessment) => (
                        <Card key={assessment.id} className="overflow-hidden">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Avatar>
                                  <AvatarFallback>{getInitials(assessment.candidateName)}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <h4 className="font-medium">{assessment.candidateName}</h4>
                                  <p className="text-xs text-muted-foreground">{assessment.candidateEmail}</p>
                                </div>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleResend(assessment.id)}
                                disabled={resendingId === assessment.id}
                              >
                                {resendingId === assessment.id ? (
                                  <Loader2 className="h-3 w-3 animate-spin mr-2" />
                                ) : (
                                  <Send className="h-3 w-3 mr-2" />
                                )}
                                Resend
                              </Button>
                            </div>
                            <Separator className="my-3" />
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Invited: {assessment.invitedAt ? format(new Date(assessment.invitedAt), 'PP p') : '-'}
                              </div>
                              <Badge variant="outline">
                                {assessment.status}
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>

              <TabsContent value="passed" className="h-full mt-4">
                <ScrollArea className="h-[calc(100vh-200px)] pr-4">
                  {passed.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                      <CheckCircle2 className="h-10 w-10 mb-2 opacity-20" />
                      <p>No passed candidates</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {passed.map((assessment) => (
                        <Card key={assessment.id} className="overflow-hidden opacity-75">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Avatar>
                                  <AvatarFallback>{getInitials(assessment.candidateName)}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <h4 className="font-medium">{assessment.candidateName}</h4>
                                  <div className="flex items-center text-xs text-muted-foreground gap-2">
                                    <span>{assessment.candidateEmail}</span>
                                    <span>•</span>
                                    <Badge variant="secondary" className="text-sm h-6 px-2.5 rounded-full">
                                      {assessment.averageScore != null ? `Avg: ${assessment.averageScore}` : 'Avg: N/A'}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleGrade(assessment.id)}
                                >
                                  <Eye className="h-3 w-3 mr-2" />
                                  View Details
                                </Button>
                                <Badge variant="success" className="h-9 px-3">
                                  Passed
                                </Badge>
                              </div>
                            </div>
                            <Separator className="my-3" />
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Completed: {assessment.completedAt ? format(new Date(assessment.completedAt), 'PP p') : '-'}
                              </div>
                              <Badge variant={assessment.score && assessment.score >= 70 ? "success" : "secondary"}>
                                {assessment.status}
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>
            </Tabs>
          )}
        </SheetContent>
      </Sheet>

      {selectedAssessmentId && (
        <AssessmentGradingDialog
          open={gradingOpen}
          onOpenChange={setGradingOpen}
          assessmentId={selectedAssessmentId}
          readOnly={assessments.find(a => a.id === selectedAssessmentId)?.isMovedToNextRound}
        />
      )}
    </>
  );
}
