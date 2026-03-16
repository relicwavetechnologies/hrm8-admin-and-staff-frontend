// @ts-nocheck
import { useState, useEffect, useMemo } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/shared/components/ui/sheet";
import { Button } from "@/shared/components/ui/button";
import { Textarea } from "@/shared/components/ui/textarea";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar";
import { Separator } from "@/shared/components/ui/separator";
import { Loader2, ChevronLeft, ChevronRight, Save, MessageSquare, CheckCircle2, ThumbsUp, ThumbsDown } from "lucide-react";
import { apiClient } from "@/shared/lib/api";
import { assessmentService } from "@/shared/lib/assessmentService";
import { toast } from "sonner";
import { format } from "date-fns";

interface AssessmentGradingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assessmentId: string;
  readOnly?: boolean;
  onGraded?: () => void;
}

interface GradingData {
  id: string;
  application: {
    candidate: {
      first_name: string;
      last_name: string;
      email: string;
    }
  };
  assessment_question: Array<{
    id: string;
    question_text: string;
    question_type: string;
    options?: unknown;
    order: number;
  }>;
  assessment_response: Array<{
    id: string;
    question_id: string;
    response: unknown;
    assessment_grade: Array<{
      id: string;
      score: number | null;
      comment: string | null;  // Changed from feedback to comment to match Prisma
      grader_id: string;
      user?: { // Added user
        id: string;
        first_name: string;
        last_name: string;
        email?: string; // Optional
      };
    }>;
  }>;
  // Optional for now as backend might not return it yet
  assessment_comment?: Array<{
    id: string;
    comment: string;
    created_at: string;
    user: {
      id: string;
      first_name: string;
      last_name: string;
      email?: string;
      photo?: string;
    }
  }>;
  assessmentConfig?: { evaluation_mode?: string };
  assessment_vote?: Array<{
    id: string;
    user_id: string;
    vote: string;
    comment?: string | null;
    user?: { id: string; first_name: string; last_name: string };
  }>;
}

export function AssessmentGradingDialog({
  open,
  onOpenChange,
  assessmentId,
  readOnly,
  onGraded
}: AssessmentGradingDialogProps) {
  // ... (keep state same)
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<GradingData | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [gradeScore, setGradeScore] = useState<string>("");
  const [gradeComment, setGradeComment] = useState("");
  const [overallComment, setOverallComment] = useState("");
  const [submittingGrade, setSubmittingGrade] = useState(false);
  const [submittingVote, setSubmittingVote] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [finalizing, setFinalizing] = useState(false);

  const isVotingMode = (data?.assessmentConfig?.evaluation_mode ?? "GRADING") === "VOTING";

  const handleSaveVote = async (vote: "APPROVE" | "REJECT") => {
    setSubmittingVote(true);
    try {
      const res = await assessmentService.saveVote(assessmentId, vote, gradeComment);
      if (res.success) {
        toast.success(`Vote (${vote}) saved`);
        await fetchData();
        if (onGraded) onGraded();
      }
    } catch (error) {
      console.error("Failed to save vote", error);
      toast.error("Failed to save vote");
    } finally {
      setSubmittingVote(false);
    }
  };

  const handleFinalize = async () => {
     // ...
     setFinalizing(true);
    try {
      const res = await apiClient.post(`/api/assessments/${assessmentId}/finalize`);
      if (res.success) {
        toast.success("Assessment finalized");
        if (onGraded) onGraded();
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Failed to finalize assessment", error);
      toast.error("Failed to finalize assessment");
    } finally {
      setFinalizing(false);
    }
  };

  useEffect(() => {
    if (open && assessmentId) {
      fetchData();
    }
  }, [open, assessmentId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get<GradingData>(`/api/assessments/${assessmentId}/grading`);
      if (response.success && response.data) {
        setData(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch assessment details", error);
      toast.error("Failed to load assessment details");
    } finally {
      setLoading(false);
    }
  };

  const averageScore = useMemo(() => {
    if (!data || !data.assessment_response) return null;
    let total = 0;
    let count = 0;
    data.assessment_response.forEach(r => {
      if (r.assessment_grade) {
        r.assessment_grade.forEach(g => {
          if (g.score !== null) {
            total += g.score;
            count++;
          }
        });
      }
    });
    return count > 0 ? (total / count).toFixed(1) : null;
  }, [data]);

  const handleSaveGrade = async () => {
     // ...
     if (!data) return;
    
    const question = data.assessment_question[currentQuestionIndex];
    const response = data.assessment_response.find(r => r.question_id === question.id);
    
    if (!response) {
      toast.error("No response found for this question");
      return;
    }

    setSubmittingGrade(true);
    try {
      const scoreValue = gradeScore.trim() === "" ? null : Number(gradeScore);
      const safeScore = Number.isFinite(scoreValue as number) ? scoreValue : null;
      // Note: Backend expects array of grades
      const res = await apiClient.post(`/api/assessments/${assessmentId}/grade`, {
        grades: [{
          questionId: question.id,
          score: safeScore,
          feedback: gradeComment
        }]
      });

      if (res.success) {
        toast.success("Grade saved");
        await fetchData(); 
        if (onGraded) {
          onGraded();
        }
      }
    } catch (error) {
      console.error("Failed to save grade", error);
      toast.error("Failed to save grade");
    } finally {
      setSubmittingGrade(false);
    }
  };

  const handleSaveOverallComment = async () => {
     // ...
     if (!overallComment.trim()) return;

    setSubmittingComment(true);
    try {
      const res = await apiClient.post(`/api/assessments/${assessmentId}/comment`, {
        comment: overallComment
      });

      if (res.success) {
        toast.success("Comment added");
        setOverallComment("");
        fetchData();
      }
    } catch (error) {
      console.error("Failed to add comment", error);
      toast.error("Failed to add comment");
    } finally {
      setSubmittingComment(false);
    }
  };

  // Reset inputs when question changes
  useEffect(() => {
    if (data) {
      const question = data.assessment_question[currentQuestionIndex];
      const response = data.assessment_response.find(r => r.question_id === question.id);
      
      const myGrade = response?.assessment_grade?.[0]; // Assuming 1 grade for now
      
      setGradeScore(myGrade?.score?.toString() || "");
      setGradeComment(myGrade?.comment || "");
    }
  }, [currentQuestionIndex, data]);

  if (!open) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent overlayClassName="bg-black/20 backdrop-blur-sm" className="w-[90vw] sm:w-[90vw] sm:max-w-7xl flex flex-col h-[95vh] sm:h-[90vh] my-auto mr-4 rounded-2xl border bg-background shadow-2xl p-0 gap-0 overflow-hidden" side="right">
        {loading || !data ? (
          <div className="flex flex-col h-full"> 
             <SheetHeader className="p-6 pb-2 border-b">
                <SheetTitle>Loading...</SheetTitle>
             </SheetHeader>
             <div className="flex items-center justify-center flex-1">
               <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
             </div>
          </div>
        ) : (
          <>
            <SheetHeader className="p-6 pb-2 border-b">
              <SheetTitle>
                {isVotingMode ? "Vote" : "Grading"}: {data.application.candidate.first_name} {data.application.candidate.last_name}
              </SheetTitle>
              <div className="flex items-center gap-4">
                <div className="flex items-center text-sm text-muted-foreground">
                  {data.application.candidate.email}
                </div>
                {isVotingMode ? (
                  data.assessment_vote && data.assessment_vote.length > 0 && (
                    <Badge variant="outline">
                      {data.assessment_vote.filter((v) => v.vote === "APPROVE").length} approve / {data.assessment_vote.filter((v) => v.vote === "REJECT").length} reject
                    </Badge>
                  )
                ) : (
                  averageScore && (
                    <Badge variant={Number(averageScore) >= 70 ? "success" : "secondary"}>
                      Avg Score: {averageScore}
                    </Badge>
                  )
                )}
              </div>
            </SheetHeader>

            <div className="flex flex-1 overflow-hidden">
              {/* Main Content: Question & Answer */}
              <div className="flex-1 flex flex-col border-r overflow-hidden">
                <ScrollArea className="flex-1 p-6">
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">
                        Question {currentQuestionIndex + 1} of {data.assessment_question.length}
                      </h3>
                      <Badge variant="outline">{data.assessment_question[currentQuestionIndex].question_type}</Badge>
                    </div>
                    
                    <Card>
                      <CardContent className="p-4 bg-muted/30">
                        <p className="text-base font-medium">{data.assessment_question[currentQuestionIndex].question_text}</p>
                      </CardContent>
                    </Card>

                    <div className="space-y-2">
                       {/* ... Candidate Response ... */}
                      <Label>Candidate Response</Label>
                      <Card>
                        <CardContent className="p-4">
                          {(() => {
                            const question = data.assessment_question[currentQuestionIndex];
                            const response = data.assessment_response.find(r => r.question_id === question.id);
                            
                            if (!response) return <p className="text-muted-foreground italic">No response</p>;
                            
                            const v: unknown = response.response;
                            if (typeof v === 'string') {
                              return <p className="whitespace-pre-wrap">{v}</p>;
                            }
                            return <pre className="text-sm overflow-auto">{JSON.stringify(v as object, null, 2)}</pre>;
                          })()}
                        </CardContent>
                      </Card>
                    </div>

                    <Separator />

                    {!readOnly && !isVotingMode && (
                      <>
                        <div className="space-y-4">
                          <h4 className="font-semibold flex items-center gap-2">
                            <MessageSquare className="h-4 w-4" />
                            Your Grade & Comment
                          </h4>
                          <div className="grid grid-cols-4 gap-4">
                            <div className="col-span-1 space-y-2">
                              <Label>Score (0-100)</Label>
                              <Input 
                                type="number" 
                                min="0" 
                                max="100"
                                value={gradeScore}
                                onChange={(e) => setGradeScore(e.target.value)}
                                placeholder="Score"
                              />
                            </div>
                            <div className="col-span-3 space-y-2">
                              <Label>Feedback</Label>
                              <Textarea 
                                value={gradeComment}
                                onChange={(e) => setGradeComment(e.target.value)}
                                placeholder="Add feedback..."
                                className="resize-none"
                                rows={3}
                              />
                            </div>
                          </div>
                          <div className="flex justify-end">
                            <Button 
                              onClick={handleSaveGrade} 
                              disabled={submittingGrade}
                            >
                              {submittingGrade && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                              Save Grade
                            </Button>
                          </div>
                        </div>
                        <Separator />
                      </>
                    )}

                    {!readOnly && isVotingMode && (
                      <>
                        <div className="space-y-4">
                          <h4 className="font-semibold flex items-center gap-2">
                            <MessageSquare className="h-4 w-4" />
                            Your Vote
                          </h4>
                          <div className="space-y-2">
                            <Label>Comment (optional)</Label>
                            <Textarea 
                              value={gradeComment}
                              onChange={(e) => setGradeComment(e.target.value)}
                              placeholder="Add a comment..."
                              className="resize-none"
                              rows={3}
                            />
                          </div>
                          <div className="flex gap-3">
                            <Button 
                              variant="default" 
                              onClick={() => handleSaveVote("APPROVE")} 
                              disabled={submittingVote}
                              className="gap-2"
                            >
                              {submittingVote && <Loader2 className="h-4 w-4 animate-spin" />}
                              <ThumbsUp className="h-4 w-4" />
                              Approve
                            </Button>
                            <Button 
                              variant="destructive" 
                              onClick={() => handleSaveVote("REJECT")} 
                              disabled={submittingVote}
                              className="gap-2"
                            >
                              {submittingVote && <Loader2 className="h-4 w-4 animate-spin" />}
                              <ThumbsDown className="h-4 w-4" />
                              Reject
                            </Button>
                          </div>
                        </div>
                        <Separator />
                      </>
                    )}

                    {/* Other Grades / Votes */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm text-muted-foreground">
              {isVotingMode ? "Votes" : readOnly ? "Evaluations" : "Previous Grades"}
            </h4>
            {isVotingMode && data.assessment_vote && data.assessment_vote.length > 0 ? (
              <div className="space-y-4">
                {data.assessment_vote.map((v) => (
                  <div key={v.id} className="bg-muted/40 p-4 rounded-xl text-sm border border-border/40">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">
                        {v.user ? `${v.user.first_name || ""} ${v.user.last_name || ""}`.trim() || "Unknown" : "Unknown"}
                      </span>
                      <Badge variant={v.vote === "APPROVE" ? "default" : "destructive"}>
                        {v.vote === "APPROVE" ? <ThumbsUp className="h-3 w-3 mr-1" /> : <ThumbsDown className="h-3 w-3 mr-1" />}
                        {v.vote}
                      </Badge>
                    </div>
                    {v.comment && <p className="text-muted-foreground mt-2 text-xs">{v.comment}</p>}
                  </div>
                ))}
              </div>
            ) : isVotingMode ? (
              <p className="text-sm text-muted-foreground italic">No votes yet</p>
            ) : (
              (() => {
                const question = data.assessment_question[currentQuestionIndex];
                const response = data.assessment_response.find(r => r.question_id === question.id);
                if (!response || !response.assessment_grade || response.assessment_grade.length === 0) {
                  return <p className="text-sm text-muted-foreground italic">No grades yet</p>;
                }
                const grades = response.assessment_grade;
                return (
                  <div className="space-y-4">
                    {grades.map(grade => (
                      <div key={grade.id} className="bg-muted/40 p-4 rounded-xl text-sm border border-border/40 shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                                {grade.user?.first_name?.[0] || (grade.user?.email?.[0]?.toUpperCase() || 'U')}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-semibold text-foreground/80">
                              {grade.user ? (grade.user.first_name ? `${grade.user.first_name} ${grade.user.last_name || ''}` : (grade.user.email || 'Recruiter')) : 'Unknown User'}
                            </span>
                          </div>
                          <Badge variant="outline" className="bg-background/50 font-mono">{grade.score}/100</Badge>
                        </div>
                        {grade.comment && <p className="text-muted-foreground pl-8">{grade.comment}</p>}
                      </div>
                    ))}
                  </div>
                );
              })()
            )}
          </div>
                  </div>
                </ScrollArea>
                
                {/* Navigation */}
                <div className="p-4 border-t bg-background flex justify-between items-center">
                  <Button 
                    variant="outline" 
                    onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                    disabled={currentQuestionIndex === 0}
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {currentQuestionIndex + 1} / {data.assessment_question.length}
                  </span>
                  <Button 
                    variant="outline" 
                    onClick={() => setCurrentQuestionIndex(prev => Math.min(data.assessment_question.length - 1, prev + 1))}
                    disabled={currentQuestionIndex === data.assessment_question.length - 1}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>

              {/* Sidebar: Overall Comments */}
              <div className="w-80 flex flex-col bg-muted/10">
                <div className="p-4 border-b font-semibold">
                  Overall Comments
                </div>
                <ScrollArea className="flex-1 p-4">
                   <div className="space-y-4">
                    {data.assessment_comment && data.assessment_comment.length > 0 ? (
                      data.assessment_comment.map(comment => (
                        <div key={comment.id} className="bg-card p-4 rounded-xl border border-border/40 text-sm shadow-sm transition-all hover:shadow-md">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                                  {comment.user?.first_name?.[0] || (comment.user?.email?.[0]?.toUpperCase() || 'U')}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-semibold text-xs text-foreground/80">
                                {comment.user ? (comment.user.first_name ? `${comment.user.first_name} ${comment.user.last_name || ''}` : (comment.user.email || 'Recruiter')) : 'Unknown User'}
                              </span>
                            </div>
                            <span className="text-[10px] text-muted-foreground">{new Date(comment.created_at).toLocaleDateString()}</span>
                          </div>
                          <p className="text-foreground/90 whitespace-pre-wrap pl-8">{comment.comment}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No comments yet
                      </p>
                    )}
                  </div>
                </ScrollArea>
                {!readOnly && (
                  <div className="p-4 border-t bg-background space-y-4">
                    <div>
                      <Label className="mb-2 block">Add Comment</Label>
                      <Textarea 
                        value={overallComment}
                        onChange={(e) => setOverallComment(e.target.value)}
                        placeholder="Type your comment..."
                        className="mb-2 resize-none"
                        rows={3}
                      />
                      <Button 
                        className="w-full" 
                        onClick={handleSaveOverallComment}
                        disabled={submittingComment || !overallComment.trim()}
                        variant="secondary"
                      >
                        {submittingComment ? <Loader2 className="h-4 w-4 animate-spin" /> : "Post Comment"}
                      </Button>
                    </div>
                    
                    <Separator />
                    
                    <div className="pt-2">
                      <Button 
                        className="w-full bg-primary hover:bg-primary/90" 
                        onClick={handleFinalize}
                        disabled={finalizing}
                      >
                        {finalizing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                        Finalize Assessment
                      </Button>
                      <p className="text-xs text-muted-foreground text-center mt-2">
                        Calculate final score and apply automation rules
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
