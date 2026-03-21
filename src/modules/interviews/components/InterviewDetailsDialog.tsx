// @ts-nocheck
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Separator } from '@/shared/components/ui/separator';
import { Video, Phone, Users, MapPin, Calendar, Clock, Mail, ExternalLink, Star } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Interview } from '@/shared/types/interview';

interface InterviewDetailsDialogProps {
  interview: Interview | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddFeedback?: (interviewId: string) => void;
}

export function InterviewDetailsDialog({ 
  interview, 
  open, 
  onOpenChange,
  onAddFeedback 
}: InterviewDetailsDialogProps) {
  if (!interview) return null;

  const getInterviewTypeIcon = () => {
    switch (interview.type) {
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'phone':
        return <Phone className="h-4 w-4" />;
      case 'panel':
        return <Users className="h-4 w-4" />;
      case 'in-person':
        return <MapPin className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getRecommendationBadge = (rec: string) => {
    const colors: Record<string, string> = {
      'strong-yes': 'bg-green-500/10 text-green-700 dark:text-green-300',
      'yes': 'bg-blue-500/10 text-blue-700 dark:text-blue-300',
      'maybe': 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-300',
      'no': 'bg-orange-500/10 text-orange-700 dark:text-orange-300',
      'strong-no': 'bg-red-500/10 text-red-700 dark:text-red-300'
    };
    
    return (
      <Badge className={colors[rec] || 'bg-muted'}>
        {rec.replace('-', ' ').toUpperCase()}
      </Badge>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Interview Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Candidate Info */}
          <div>
            <h3 className="text-lg font-semibold mb-3">{interview.candidateName}</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Position:</span>
                <p className="font-medium">{interview.jobTitle}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Type:</span>
                <p className="font-medium capitalize">{interview.type}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Interview Schedule */}
          <div>
            <h4 className="font-semibold mb-3">Schedule</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                {getInterviewTypeIcon()}
                <span className="capitalize">{interview.type} Interview</span>
                <Badge>{interview.status}</Badge>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{format(parseISO(interview.scheduledDate), 'EEEE, MMMM d, yyyy')}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{interview.scheduledTime} - {interview.duration} minutes</span>
              </div>
              {interview.location && (
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{interview.location}</span>
                </div>
              )}
              {interview.meetingLink && (
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <a href={interview.meetingLink} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Join Meeting
                  </a>
                </Button>
              )}
            </div>
          </div>

          <Separator />

          {/* Interviewers */}
          <div>
            <h4 className="font-semibold mb-3">Interviewers</h4>
            <div className="space-y-2">
              {interview.interviewers.map(interviewer => (
                <div key={interviewer.userId} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">{interviewer.name}</p>
                    <p className="text-sm text-muted-foreground capitalize">{interviewer.role}</p>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <a href={`mailto:${interviewer.email}`}>
                      <Mail className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Feedback */}
          {interview.feedback.length > 0 && (
            <>
              <Separator />
              <div>
                <h4 className="font-semibold mb-3">Feedback</h4>
                <div className="space-y-4">
                  {interview.feedback.map((fb, idx) => (
                    <div key={idx} className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{fb.interviewerName}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(parseISO(fb.submittedAt), 'MMM d, yyyy')}
                          </p>
                        </div>
                        {getRecommendationBadge(fb.recommendation)}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <span className="text-muted-foreground">Overall:</span>
                          <div className="flex items-center">
                            <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                            <span className="ml-1">{fb.overallRating}/5</span>
                          </div>
                        </div>
                        {fb.technicalSkills && (
                          <div>
                            <span className="text-muted-foreground">Technical:</span> {fb.technicalSkills}/5
                          </div>
                        )}
                        {fb.communication && (
                          <div>
                            <span className="text-muted-foreground">Communication:</span> {fb.communication}/5
                          </div>
                        )}
                        {fb.cultureFit && (
                          <div>
                            <span className="text-muted-foreground">Culture Fit:</span> {fb.cultureFit}/5
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Strengths:</p>
                          <p className="text-sm">{fb.strengths}</p>
                        </div>
                        {fb.concerns && (
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Concerns:</p>
                            <p className="text-sm">{fb.concerns}</p>
                          </div>
                        )}
                        {fb.notes && (
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Notes:</p>
                            <p className="text-sm">{fb.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Notes */}
          {interview.notes && (
            <>
              <Separator />
              <div>
                <h4 className="font-semibold mb-2">Notes</h4>
                <p className="text-sm text-muted-foreground">{interview.notes}</p>
              </div>
            </>
          )}

          {/* Actions */}
          {interview.status === 'completed' && interview.feedback.length === 0 && onAddFeedback && (
            <Button onClick={() => onAddFeedback(interview.id)} className="w-full">
              Add Feedback
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
