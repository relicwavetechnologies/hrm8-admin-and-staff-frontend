// @ts-nocheck
import { useState, useEffect } from 'react';
import { Card } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Video, Phone, Users, MapPin, Calendar, Clock, User, CheckCircle, Star, ArrowRight, XCircle, Eye } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Interview, InterviewFeedback } from '@/shared/types/interview';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/shared/components/ui/dialog';
import { Label } from '@/shared/components/ui/label';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { videoInterviewService, VideoInterview as ServiceVideoInterview } from '@/shared/lib/videoInterviewService';
import { useToast } from '@/shared/components/ui/use-toast';

type FeedbackWithSnake = InterviewFeedback & { 
  overall_rating?: number;
  interviewer_name?: string;
  submitted_at?: string;
};

interface InterviewListProps {
  interviews: Interview[];
  onInterviewClick: (interview: Interview) => void;
  onScheduleClick: () => void;
  onUpdate?: () => void;
}

export function InterviewList({ interviews, onInterviewClick, onScheduleClick, onUpdate }: InterviewListProps) {
  const { toast } = useToast();
  const [isGradeDialogOpen, setIsGradeDialogOpen] = useState(false);
  const [isFeedbackViewOpen, setIsFeedbackViewOpen] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
  const [gradeScore, setGradeScore] = useState<number>(0);
  const [gradeNotes, setGradeNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progressionStatus, setProgressionStatus] = useState<Record<string, { canProgress: boolean; missingInterviewers: string[] }>>({});
  const [feedbackDetails, setFeedbackDetails] = useState<ServiceVideoInterview | null>(null);
  const [isLoadingFeedback, setIsLoadingFeedback] = useState(false);

  // Fetch progression status for completed interviews
  useEffect(() => {
    const fetchProgressionStatus = async () => {
      const completedInterviews = interviews.filter(i => (i.status as string).toLowerCase() === 'completed');
      
      for (const interview of completedInterviews) {
        try {
          const response = await videoInterviewService.getProgressionStatus(interview.id);
          if (response.success && response.data) {
            setProgressionStatus(prev => ({
              ...prev,
              [interview.id]: {
                canProgress: response.data!.canProgress,
                missingInterviewers: response.data!.missingInterviewers
              }
            }));
          }
        } catch (error) {
          console.error(`Failed to fetch progression status for ${interview.id}:`, error);
        }
      }
    };

    if (interviews.length > 0) {
      fetchProgressionStatus();
    }
  }, [interviews]);

  // Fetch feedback details when dialog opens
  useEffect(() => {
    if (isFeedbackViewOpen && selectedInterview) {
      setIsLoadingFeedback(true);
      videoInterviewService.getInterview(selectedInterview.id)
        .then(response => {
          if (response.data?.interview) {
            setFeedbackDetails(response.data.interview);
          }
        })
        .catch(err => console.error('Failed to fetch interview details:', err))
        .finally(() => setIsLoadingFeedback(false));
    } else {
      setFeedbackDetails(null);
    }
  }, [isFeedbackViewOpen, selectedInterview]);

  const getInterviewTypeIcon = (type: Interview['type']) => {
    switch (type) {
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'phone':
        return <Phone className="h-4 w-4" />;
      case 'panel':
        return <Users className="h-4 w-4" />;
      case 'in-person':
        return <MapPin className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: Interview['status']) => {
    const variants: Record<Interview['status'], { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      scheduled: { variant: 'default', label: 'Scheduled' },
      completed: { variant: 'secondary', label: 'Completed' },
      cancelled: { variant: 'destructive', label: 'Cancelled' },
      'no-show': { variant: 'destructive', label: 'No Show' }
    };
    
    const config = variants[status] || { variant: 'default', label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const handleMarkAsComplete = async (e: React.MouseEvent, interview: Interview) => {
    e.stopPropagation();
    try {
      // Assuming interview.id corresponds to the video interview ID
      // Cast to any to bypass strict type checking for status enum mismatch between Interview and VideoInterview types
      await videoInterviewService.updateStatus(interview.id, 'COMPLETED');
      toast({
        title: "Interview marked as complete",
        description: "You can now grade this interview.",
      });
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Failed to update status:', error);
      toast({
        title: "Error",
        description: "Failed to mark interview as complete",
        variant: "destructive",
      });
    }
  };

  const openGradeDialog = (e: React.MouseEvent, interview: Interview) => {
    e.stopPropagation();
    setSelectedInterview(interview);
    setGradeScore(0);
    setGradeNotes('');
    setIsGradeDialogOpen(true);
  };

  const submitGrade = async () => {
    if (!selectedInterview) return;
    
    setIsSubmitting(true);
    try {
      await videoInterviewService.addFeedback(selectedInterview.id, {
        overallRating: gradeScore,
        notes: gradeNotes
      });
      
      toast({
        title: "Feedback submitted",
        description: "Your grading has been recorded.",
      });
      
      setIsGradeDialogOpen(false);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      toast({
        title: "Error",
        description: "Failed to submit feedback",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getAverageGrade = (interview: Interview & { interviewFeedbacks?: Array<{ overallRating?: number; overall_rating?: number }> }) => {
    // Check for interviewFeedbacks (from our backend update) or feedback (from type definition)
    const feedbacks = interview.interviewFeedbacks || interview.feedback;
    
    if (!Array.isArray(feedbacks) || feedbacks.length === 0) return null;
    
    const total = feedbacks.reduce((sum: number, fb: { overallRating?: number; overall_rating?: number }) => sum + (fb.overallRating || fb.overall_rating || 0), 0);
    return {
      average: (total / feedbacks.length).toFixed(1),
      count: feedbacks.length
    };
  };

  if (interviews.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">No interviews scheduled</h3>
        <p className="text-muted-foreground mb-4">Schedule your first interview to get started</p>
        <Button onClick={onScheduleClick}>Schedule Interview</Button>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {interviews.map(interview => {
        const gradeInfo = getAverageGrade(interview);
        // Cast status to string to handle both lowercase (Interview type) and uppercase (VideoInterview type) statuses
        const status = interview.status as string;
        const isCompleted = status === 'completed' || status === 'COMPLETED';
        
        return (
          <Card
            key={interview.id}
            className="p-4 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onInterviewClick(interview)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  {getInterviewTypeIcon(interview.type)}
                </div>
                <div>
                  <h3 className="font-semibold">{interview.candidateName}</h3>
                  <p className="text-sm text-muted-foreground">{interview.jobTitle}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                {getStatusBadge(interview.status)}
                {isCompleted && (
                  <div className="flex flex-col gap-1 items-end">
                    <div className="flex gap-1">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-7 text-xs gap-1"
                        onClick={(e) => openGradeDialog(e, interview)}
                      >
                        <Star className="h-3 w-3" />
                        Grade
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs gap-1"
                        onClick={(e) => {
                            e.stopPropagation();
                            setSelectedInterview(interview);
                            setIsFeedbackViewOpen(true);
                        }}
                      >
                        <Eye className="h-3 w-3" />
                        View Feedback
                      </Button>
                    </div>
                    
                    <div className="flex gap-1 mt-1">
                        <Button 
                            size="sm" 
                            className="h-7 text-xs gap-1 bg-green-600 hover:bg-green-700"
                            disabled={!progressionStatus[interview.id]?.canProgress}
                            title={!progressionStatus[interview.id]?.canProgress ? `Waiting for: ${progressionStatus[interview.id]?.missingInterviewers?.join(', ')}` : 'Move Candidate to Next Stage'}
                            onClick={(e) => { e.stopPropagation(); toast({ title: "Next Stage", description: "This would move the candidate to the next stage." }); }}
                        >
                            <ArrowRight className="h-3 w-3" />
                            Next Stage
                        </Button>
                         <Button 
                            size="sm" 
                            variant="destructive"
                            className="h-7 text-xs gap-1"
                            disabled={!progressionStatus[interview.id]?.canProgress}
                            title={!progressionStatus[interview.id]?.canProgress ? `Waiting for: ${progressionStatus[interview.id]?.missingInterviewers?.join(', ')}` : 'Reject Candidate'}
                            onClick={(e) => { e.stopPropagation(); toast({ title: "Reject", description: "This would reject the candidate." }); }}
                        >
                            <XCircle className="h-3 w-3" />
                            Reject
                        </Button>
                    </div>
                  </div>
                )}
                {!isCompleted && interview.status !== 'cancelled' && interview.status !== 'no-show' && (
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-7 text-xs gap-1 text-muted-foreground hover:text-primary"
                    onClick={(e) => handleMarkAsComplete(e, interview)}
                  >
                    <CheckCircle className="h-3 w-3" />
                    Mark Complete
                  </Button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{format(parseISO(interview.scheduledDate), 'MMM d, yyyy')}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{interview.scheduledTime} ({interview.duration} min)</span>
              </div>
            </div>

            {gradeInfo && (
              <div className="mt-3 py-2 px-3 bg-secondary/50 rounded-md flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Average Grade:</span>
                <div className="flex items-center gap-1 font-medium">
                  <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                  <span>{gradeInfo.average}/100</span>
                  <span className="text-xs text-muted-foreground ml-1">({gradeInfo.count} graders)</span>
                </div>
              </div>
            )}

            <div className="mt-3 pt-3 border-t">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Interviewers:</span>
                <div className="flex gap-2">
                  {interview.interviewers.map(interviewer => (
                    <Badge key={interviewer.userId} variant="outline" className="text-xs">
                      {interviewer.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        );
      })}

      <Dialog open={isGradeDialogOpen} onOpenChange={setIsGradeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Grade Interview</DialogTitle>
            <DialogDescription>
              Provide your feedback and score for {selectedInterview?.candidateName}.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="score">Score (0-100)</Label>
              <Input
                id="score"
                type="number"
                min="0"
                max="100"
                value={gradeScore}
                onChange={(e) => setGradeScore(Number(e.target.value))}
                placeholder="Enter score"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Comments</Label>
              <Textarea
                id="notes"
                value={gradeNotes}
                onChange={(e) => setGradeNotes(e.target.value)}
                placeholder="Enter your feedback comments..."
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsGradeDialogOpen(false)}>Cancel</Button>
            <Button onClick={submitGrade} disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Grade'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isFeedbackViewOpen} onOpenChange={setIsFeedbackViewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Interview Feedback</DialogTitle>
            <DialogDescription>
              Feedback for {selectedInterview?.candidateName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
             {isLoadingFeedback ? (
                <div className="text-center py-8 text-muted-foreground">Loading...</div>
              ) : (feedbackDetails && (feedbackDetails.interviewFeedbacks || feedbackDetails.feedback || []).length > 0) ? (
                ((feedbackDetails.interviewFeedbacks || feedbackDetails.feedback) as unknown as FeedbackWithSnake[]).map((item, index) => {
                    const fb = item;
                    return (
                    <div key={index} className="p-4 border rounded-lg bg-card">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h4 className="font-semibold">{fb.interviewerName || fb.interviewer_name || fb.interviewerId || 'Interviewer'}</h4>
                                <span className="text-sm text-muted-foreground">{fb.submittedAt || fb.submitted_at ? format(parseISO(fb.submittedAt || fb.submitted_at as string), 'MMM d, yyyy h:mm a') : 'Recently'}</span>
                            </div>
                            <Badge variant={(fb.overallRating || fb.overall_rating || 0) >= 70 ? 'default' : (fb.overallRating || fb.overall_rating || 0) >= 40 ? 'secondary' : 'destructive'}>
                                {fb.overallRating || fb.overall_rating || 0}/100
                            </Badge>
                        </div>
                        <p className="text-sm mt-2 whitespace-pre-wrap">{fb.notes}</p>
                    </div>
                )})
             ) : (
                <div className="text-center py-8 text-muted-foreground">
                    No feedback submitted yet.
                </div>
             )}
          </div>
          <DialogFooter>
            <Button onClick={() => setIsFeedbackViewOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
