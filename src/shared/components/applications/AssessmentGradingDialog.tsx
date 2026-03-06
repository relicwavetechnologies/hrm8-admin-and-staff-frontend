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
import { Loader2, ChevronLeft, ChevronRight, MessageSquare } from "lucide-react";
import { apiClient } from "@/shared/lib/api";
import { toast } from "sonner";
import { format } from "date-fns";

interface AssessmentGradingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assessmentId: string;
  readOnly?: boolean;
}

interface GradingData {
  id: string;
  Application: {
    candidate: {
      firstName: string;
      lastName: string;
      email: string;
    }
  };
  AssessmentQuestion: Array<{
    id: string;
    question_text: string;
    question_type: string;
    options?: unknown;
    order: number;
  }>;
  AssessmentResponse: Array<{
    id: string;
    question_id: string;
    response: unknown;
    AssessmentGrade: Array<{
      id: string;
      score: number | null;
      comment: string | null;
      User: {
        id: string;
        name: string;
      }
    }>;
  }>;
  AssessmentComment: Array<{
    id: string;
    comment: string;
    created_at: string;
    User: {
      id: string;
      name: string;
    }
  }>;
}

export function AssessmentGradingDialog({
  open,
  onOpenChange,
  assessmentId,
  readOnly
}: AssessmentGradingDialogProps) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<GradingData | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [gradeScore, setGradeScore] = useState<string>("");
  const [gradeComment, setGradeComment] = useState("");
  const [overallComment, setOverallComment] = useState("");
  const [submittingGrade, setSubmittingGrade] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);

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
    if (!data) return null;
    let total = 0;
    let count = 0;
    data.AssessmentResponse.forEach(r => {
      r.AssessmentGrade.forEach(g => {
        if (g.score !== null) {
          total += g.score;
          count++;
        }
      });
    });
    return count > 0 ? (total / count).toFixed(1) : null;
  }, [data]);

  const handleSaveGrade = async () => {
    if (!data) return;

    const question = data.AssessmentQuestion[currentQuestionIndex];
    const response = data.AssessmentResponse.find(r => r.question_id === question.id);

    if (!response) {
      toast.error("No response found for this question");
      return;
    }

    setSubmittingGrade(true);
    try {
      const scoreValue = gradeScore.trim() === "" ? null : Number(gradeScore);
      const safeScore = Number.isFinite(scoreValue as number) ? scoreValue : null;
      const res = await apiClient.post(`/api/assessments/grade`, {
        responseId: response.id,
        score: safeScore,
        comment: gradeComment
      });

      if (res.success) {
        toast.success("Grade saved");
        // Update local state to reflect new grade
        await fetchData();
      }
    } catch (error) {
      console.error("Failed to save grade", error);
      toast.error("Failed to save grade");
    } finally {
      setSubmittingGrade(false);
    }
  };

  const handleSaveOverallComment = async () => {
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
      const question = data.AssessmentQuestion[currentQuestionIndex];
      const _response = data.AssessmentResponse.find(r => r.question_id === question.id);
      void _response;
      // Ideally find current user's grade to pre-fill, but we don't have current user ID easily available here without context.
      // We can leave empty or try to find if we passed user info.
      setGradeScore("");
      setGradeComment("");
    }
  }, [currentQuestionIndex, data]);

  if (!open) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent overlayClassName="bg-transparent" className="w-[85vw] sm:w-[85vw] sm:max-w-[85vw] flex flex-col h-full p-0 gap-0" side="right">
        {loading || !data ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <SheetHeader className="p-6 pb-2 border-b">
              <SheetTitle>
                Grading: {data.Application.candidate.firstName} {data.Application.candidate.lastName}
              </SheetTitle>
              <div className="flex items-center gap-4">
                <div className="flex items-center text-sm text-muted-foreground">
                  {data.Application.candidate.email}
                </div>
                {averageScore && (
                  <Badge variant={Number(averageScore) >= 70 ? "success" : "secondary"}>
                    Avg Score: {averageScore}
                  </Badge>
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
                        Question {currentQuestionIndex + 1} of {data.AssessmentQuestion.length}
                      </h3>
                      <Badge variant="outline">{data.AssessmentQuestion[currentQuestionIndex].question_type}</Badge>
                    </div>

                    <Card>
                      <CardContent className="p-4 bg-muted/30">
                        <p className="text-base font-medium">{data.AssessmentQuestion[currentQuestionIndex].question_text}</p>
                      </CardContent>
                    </Card>

                    <div className="space-y-2">
                      <Label>Candidate Response</Label>
                      <Card>
                        <CardContent className="p-4">
                          {(() => {
                            const question = data.AssessmentQuestion[currentQuestionIndex];
                            const response = data.AssessmentResponse.find(r => r.question_id === question.id);

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

                    {!readOnly && (
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
                              <Label>Comment</Label>
                              <Textarea
                                value={gradeComment}
                                onChange={(e) => setGradeComment(e.target.value)}
                                placeholder="Add a comment about this answer..."
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

                    {/* Other Grades */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-sm text-muted-foreground">{readOnly ? "Evaluations" : "Other Grades"}</h4>
                      {(() => {
                        const question = data.AssessmentQuestion[currentQuestionIndex];
                        const response = data.AssessmentResponse.find(r => r.question_id === question.id);

                        if (!response) {
                          return <p className="text-sm text-muted-foreground italic">No grades yet</p>;
                        }

                        const grades = response.AssessmentGrade || [];

                        if (grades.length === 0) {
                          return <p className="text-sm text-muted-foreground italic">No grades yet</p>;
                        }

                        return (
                          <div className="space-y-3">
                            {grades.map(grade => (
                              <div key={grade.id} className="bg-muted/30 p-3 rounded-md text-sm">
                                <div className="flex justify-between mb-1">
                                  <span className="font-medium">{grade.User.name}</span>
                                  <Badge>{grade.score}</Badge>
                                </div>
                                {grade.comment && <p className="text-muted-foreground">{grade.comment}</p>}
                              </div>
                            ))}
                          </div>
                        );
                      })()}
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
                    {currentQuestionIndex + 1} / {data.AssessmentQuestion.length}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentQuestionIndex(prev => Math.min(data.AssessmentQuestion.length - 1, prev + 1))}
                    disabled={currentQuestionIndex === data.AssessmentQuestion.length - 1}
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
                    {data.AssessmentComment.map(comment => (
                      <div key={comment.id} className="bg-background border p-3 rounded-md shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs">
                              {(comment.User.name || '').split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs font-medium">
                            {comment.User.name}
                          </span>
                          <span className="text-[10px] text-muted-foreground ml-auto">
                            {format(new Date(comment.created_at), 'MMM d, h:mm a')}
                          </span>
                        </div>
                        <p className="text-sm">{comment.comment}</p>
                      </div>
                    ))}
                    {data.AssessmentComment.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No comments yet
                      </p>
                    )}
                  </div>
                </ScrollArea>
                {!readOnly && (
                  <div className="p-4 border-t bg-background">
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
                    >
                      {submittingComment ? <Loader2 className="h-4 w-4 animate-spin" /> : "Post Comment"}
                    </Button>
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
