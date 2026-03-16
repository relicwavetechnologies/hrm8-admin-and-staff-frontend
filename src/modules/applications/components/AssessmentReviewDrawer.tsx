// @ts-nocheck
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
import { Loader2, RefreshCw, Eye, Send, CheckCircle2, Clock, AlertCircle, ArrowRight } from "lucide-react";
import { JobRound } from "@/shared/lib/jobRoundService";
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
            <Tabs defaultValue="in-round" className="h-[calc(100vh-150px)]">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="in-round">
                  In Round ({submissions.length + pending.length})
                </TabsTrigger>
                <TabsTrigger value="past">
                  Past Candidates ({passed.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="in-round" className="h-full mt-4">
                <ScrollArea className="h-[calc(100vh-200px)] pr-4">
                  {(submissions.length === 0 && pending.length === 0) ? (
                    <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                      <Clock className="h-10 w-10 mb-2 opacity-20" />
                      <p>No active candidates in this round</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Submissions Section */}
                      {submissions.length > 0 && (
                        <div>
                          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-primary">
                            <CheckCircle2 className="h-4 w-4" />
                            Ready for Review ({submissions.length})
                          </h3>
                          <div className="space-y-3">
                            {submissions.map((assessment) => (
                              <Card key={assessment.id} className="overflow-hidden border-l-4 border-l-primary/50">
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
                                      {/* Logic for Failed/Passed actions */}
                                      {assessment.score !== null && assessment.score < 70 ? (
                                        <>
                                           <Button 
                                             size="sm" 
                                             variant="ghost"
                                             className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                                             onClick={() => handleGrade(assessment.id)}
                                             title="View Details"
                                           >
                                             <Eye className="h-4 w-4" />
                                           </Button>
                                          <Button size="sm" variant="destructive" className="h-8">Reject</Button>
                                        </>
                                      ) : assessment.score !== null ? (
                                        <>
                                           <Button 
                                             size="sm" 
                                             variant="ghost"
                                             className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                                             onClick={() => handleGrade(assessment.id)}
                                             title="View Details"
                                           >
                                             <Eye className="h-4 w-4" />
                                           </Button>
                                          {onMoveToNextRound && (
                                            <Button 
                                              size="sm"
                                              variant="default" // Changed to primary/default
                                              onClick={() => onMoveToNextRound(assessment.applicationId)}
                                            >
                                              <ArrowRight className="h-3 w-3 mr-2" />
                                              Next Stage
                                            </Button>
                                          )}
                                        </>
                                      ) : (
                                        <Button 
                                          size="sm" 
                                          variant="outline"
                                          onClick={() => handleGrade(assessment.id)}
                                        >
                                          <Eye className="h-3 w-3 mr-2" />
                                          Review & Grade
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
                                    <div>
                                      {assessment.score && assessment.score < 70 ? (
                                        <Badge variant="destructive">Failed</Badge>
                                      ) : (
                                        <Badge variant="success">Passed</Badge>
                                      )}
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Pending Section */}
                      {pending.length > 0 && (
                        <div>
                          {submissions.length > 0 && <Separator className="my-6" />}
                          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            Pending ({pending.length})
                          </h3>
                          <div className="space-y-3">
                            {pending.map((assessment) => (
                              <Card key={assessment.id} className="overflow-hidden bg-muted/30">
                                <CardContent className="p-4">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <Avatar className="opacity-75">
                                        <AvatarFallback>{getInitials(assessment.candidateName)}</AvatarFallback>
                                      </Avatar>
                                      <div>
                                        <h4 className="font-medium text-muted-foreground">{assessment.candidateName}</h4>
                                        <p className="text-xs text-muted-foreground opacity-75">{assessment.candidateEmail}</p>
                                      </div>
                                    </div>
                                    <Button 
                                      size="sm" 
                                      variant="ghost"
                                      className="h-8"
                                      onClick={() => handleResend(assessment.id)}
                                      disabled={resendingId === assessment.id}
                                    >
                                      {resendingId === assessment.id ? (
                                        <Loader2 className="h-3 w-3 animate-spin mr-2" />
                                      ) : (
                                        <Send className="h-3 w-3 mr-2" />
                                      )}
                                      Resend Invite
                                    </Button>
                                  </div>
                                  <Separator className="my-3 opacity-50" />
                                  <div className="flex items-center justify-between text-xs text-muted-foreground opacity-75">
                                    <div className="flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      Invited: {assessment.invitedAt ? format(new Date(assessment.invitedAt), 'PP p') : '-'}
                                    </div>
                                    <Badge variant="outline" className="opacity-75">
                                      {assessment.status}
                                    </Badge>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>

              <TabsContent value="past" className="h-full mt-4">
                <ScrollArea className="h-[calc(100vh-200px)] pr-4">
                  {passed.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                      <CheckCircle2 className="h-10 w-10 mb-2 opacity-20" />
                      <p>No past candidates</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {passed.map((assessment) => (
                        <Card key={assessment.id} className="overflow-hidden opacity-60 hover:opacity-100 transition-opacity">
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
                                <Badge variant="outline" className="h-9 px-3 border-green-200 text-green-700 bg-green-50">
                                  Moved Forward
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
          readOnly={
            (assessments.find(a => a.id === selectedAssessmentId)?.isMovedToNextRound) ||
            (assessments.find(a => a.id === selectedAssessmentId)?.status === 'COMPLETED')
          }
        />
      )}
    </>
  );
}
