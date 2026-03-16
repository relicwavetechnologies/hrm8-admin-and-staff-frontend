// @ts-nocheck
import { FormDrawer } from "@/shared/components/ui/form-drawer";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Separator } from "@/shared/components/ui/separator";
import { Progress } from "@/shared/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  Phone,
  Users,
  Star,
  MessageSquare,
  Edit,
  Plus,
  PlayCircle,
  Mail,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  Target,
  Info,
  UsersRound,
  StickyNote,
} from "lucide-react";
import type { Interview, InterviewFeedback } from "@/shared/types/interview";
import { format } from "date-fns";
import { useState } from "react";
import { InterviewFeedbackForm } from "./InterviewFeedbackForm";
import { InterviewNotesSection } from "./InterviewNotesSection";
import { InterviewFeedbackTab } from "./InterviewFeedbackTab";

interface InterviewDetailPanelProps {
  interview: Interview | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateInterview?: (interview: Interview) => void;
}

export function InterviewDetailPanel({
  interview,
  open,
  onOpenChange,
  onUpdateInterview,
}: InterviewDetailPanelProps) {
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [editingFeedback, setEditingFeedback] = useState<InterviewFeedback | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  if (!interview) return null;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getTypeIcon = () => {
    const icons = {
      phone: <Phone className="h-4 w-4" />,
      video: <Video className="h-4 w-4" />,
      "in-person": <MapPin className="h-4 w-4" />,
      panel: <Users className="h-4 w-4" />,
    };
    return icons[interview.type];
  };

  const getStatusBadge = () => {
    const statusConfig = {
      scheduled: { label: "Scheduled", variant: "default" as const, icon: Clock },
      completed: { label: "Completed", variant: "default" as const, icon: CheckCircle },
      cancelled: { label: "Cancelled", variant: "destructive" as const, icon: XCircle },
      "no-show": { label: "No Show", variant: "secondary" as const, icon: AlertCircle },
    };
    const config = statusConfig[interview.status];
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getRecommendationColor = (rec?: string) => {
    switch (rec) {
      case "strong-yes":
        return "text-success";
      case "yes":
        return "text-success/80";
      case "maybe":
        return "text-warning";
      case "no":
        return "text-destructive/80";
      case "strong-no":
        return "text-destructive";
      default:
        return "text-muted-foreground";
    }
  };

  const handleFeedbackSubmit = (data: any) => {
    const newFeedback: InterviewFeedback = {
      interviewerId: "current-user",
      interviewerName: "Current User",
      ...data,
      submittedAt: new Date().toISOString(),
    };

    const updatedInterview = {
      ...interview,
      feedback: editingFeedback
        ? interview.feedback.map((f) =>
            f.interviewerId === editingFeedback.interviewerId ? newFeedback : f
          )
        : [...interview.feedback, newFeedback],
    };

    // Calculate average rating
    const totalRating = updatedInterview.feedback.reduce(
      (sum, f) => sum + f.overallRating,
      0
    );
    updatedInterview.rating = totalRating / updatedInterview.feedback.length;

    onUpdateInterview?.(updatedInterview);
    setShowFeedbackForm(false);
    setEditingFeedback(null);
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? "fill-warning text-warning"
                : "fill-muted text-muted"
            }`}
          />
        ))}
      </div>
    );
  };

  if (showFeedbackForm) {
    return (
      <FormDrawer
        open={open}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setShowFeedbackForm(false);
            setEditingFeedback(null);
          }
          onOpenChange(isOpen);
        }}
        title={editingFeedback ? "Edit Feedback" : "Add Feedback"}
        description={`Provide feedback for ${interview.candidateName}'s interview`}
        width="2xl"
      >
        <InterviewFeedbackForm
          candidateName={interview.candidateName}
          jobTitle={interview.jobTitle}
          ratingCriteria={interview.ratingCriteria}
          onSubmit={handleFeedbackSubmit}
          onCancel={() => {
            setShowFeedbackForm(false);
            setEditingFeedback(null);
          }}
        />
      </FormDrawer>
    );
  }

  return (
    <FormDrawer
      open={open}
      onOpenChange={onOpenChange}
      title="Interview Details"
      description={`${interview.candidateName} - ${interview.jobTitle}`}
      width="2xl"
    >
      <div className="space-y-6">
        {/* Header Section */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 border-2 border-primary/10">
                  <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                    {getInitials(interview.candidateName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-2xl font-semibold">{interview.candidateName}</h3>
                  <p className="text-muted-foreground">{interview.jobTitle}</p>
                </div>
              </div>
              {getStatusBadge()}
            </div>
          </CardContent>
        </Card>

        {/* Tabbed Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">
              <Info className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="team-feedback">
              <UsersRound className="h-4 w-4 mr-2" />
              Team Feedback
            </TabsTrigger>
            <TabsTrigger value="interviewer-feedback">
              <MessageSquare className="h-4 w-4 mr-2" />
              Feedback ({interview.feedback.length})
            </TabsTrigger>
            <TabsTrigger value="notes">
              <StickyNote className="h-4 w-4 mr-2" />
              Notes
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 mt-6">

        {/* Interview Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Interview Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Date:</span>
                <span>{format(new Date(interview.scheduledDate), "MMMM dd, yyyy")}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Time:</span>
                <span>{interview.scheduledTime}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                {getTypeIcon()}
                <span className="font-medium">Type:</span>
                <span className="capitalize">{interview.type}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Duration:</span>
                <span>{interview.duration} minutes</span>
              </div>
            </div>

            {interview.meetingLink && (
              <div className="flex items-center gap-2 text-sm">
                <Video className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Meeting Link:</span>
                <a
                  href={interview.meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {interview.meetingLink}
                </a>
              </div>
            )}

            {interview.location && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Location:</span>
                <span>{interview.location}</span>
              </div>
            )}

            {interview.agenda && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  Agenda:
                </div>
                <p className="text-sm text-muted-foreground ml-6">{interview.agenda}</p>
              </div>
            )}

            {interview.recordingUrl && (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" asChild>
                  <a href={interview.recordingUrl} target="_blank" rel="noopener noreferrer">
                    <PlayCircle className="h-4 w-4 mr-2" />
                    View Recording
                  </a>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Interviewers */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Interviewers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {interview.interviewers.map((interviewer, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border-2 border-primary/10">
                      <AvatarFallback className="bg-secondary text-secondary-foreground text-sm">
                        {getInitials(interviewer.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{interviewer.name}</p>
                      <p className="text-sm text-muted-foreground">{interviewer.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="capitalize">
                      {interviewer.role}
                    </Badge>
                    <Badge
                      variant={
                        interviewer.responseStatus === "accepted"
                          ? "default"
                          : interviewer.responseStatus === "declined"
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {interviewer.responseStatus}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Template Questions */}
        {interview.questions && interview.questions.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Interview Questions</CardTitle>
              </div>
              <p className="text-sm text-muted-foreground">
                Questions from the selected interview template
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {interview.questions.map((question, idx) => (
                  <div key={question.id} className="space-y-2">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                        {idx + 1}
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-medium text-sm leading-relaxed">
                            {question.question}
                          </p>
                          {question.isRequired && (
                            <Badge variant="destructive" className="text-xs shrink-0">
                              Required
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <Badge variant="outline" className="capitalize">
                            {question.category}
                          </Badge>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {question.expectedDuration} min
                          </span>
                        </div>
                      </div>
                    </div>
                    {idx < interview.questions.length - 1 && <Separator className="mt-4" />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Rating Criteria */}
        {interview.ratingCriteria && interview.ratingCriteria.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Rating Criteria</CardTitle>
              </div>
              <p className="text-sm text-muted-foreground">
                Use these criteria when evaluating the candidate
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {interview.ratingCriteria.map((criteria) => (
                  <div key={criteria.id} className="space-y-2">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-sm">{criteria.name}</h4>
                          <Badge variant="secondary" className="text-xs">
                            {criteria.weight}%
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {criteria.description}
                        </p>
                      </div>
                    </div>
                    <Progress value={criteria.weight} className="h-2" />
                  </div>
                ))}
                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Total Weight:</span>
                    <span className="font-semibold">
                      {interview.ratingCriteria.reduce((sum, c) => sum + c.weight, 0)}%
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

            {/* Overall Rating */}
            {interview.rating && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Overall Rating</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div className="text-5xl font-bold text-primary">{interview.rating.toFixed(1)}</div>
                    <div className="flex-1">
                      {renderStars(Math.round(interview.rating))}
                      <p className="text-sm text-muted-foreground mt-1">
                        Based on {interview.feedback.length} feedback{interview.feedback.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    {interview.recommendation && (
                      <Badge className={getRecommendationColor(interview.recommendation)}>
                        {interview.recommendation.replace("-", " ").toUpperCase()}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Team Feedback Tab */}
          <TabsContent value="team-feedback" className="mt-6">
            <InterviewFeedbackTab interview={interview} />
          </TabsContent>

          {/* Interviewer Feedback Tab */}
          <TabsContent value="interviewer-feedback" className="space-y-6 mt-6">

            {/* Feedback Section */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Interviewer Feedback</CardTitle>
                <Button size="sm" onClick={() => setShowFeedbackForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Feedback
                </Button>
              </CardHeader>
              <CardContent>
            {interview.feedback.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No feedback submitted yet</p>
              </div>
            ) : (
              <div className="space-y-6">
                {interview.feedback.map((feedback, idx) => (
                  <div key={idx}>
                    {idx > 0 && <Separator className="mb-6" />}
                    <div className="space-y-4">
                      {/* Feedback Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {getInitials(feedback.interviewerName)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold">{feedback.interviewerName}</p>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(feedback.submittedAt), "MMM dd, yyyy 'at' h:mm a")}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingFeedback(feedback);
                              setShowFeedbackForm(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Rating Breakdown */}
                      {feedback.customRatings && interview.ratingCriteria ? (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 mb-2">
                            <Target className="h-4 w-4 text-primary" />
                            <span className="text-sm font-semibold">Scorecard Results</span>
                          </div>
                          {interview.ratingCriteria.map((criteria) => {
                            const rating = feedback.customRatings?.[criteria.id];
                            if (!rating) return null;
                            return (
                              <div key={criteria.id} className="space-y-1">
                                <div className="flex items-center justify-between text-sm">
                                  <div className="flex items-center gap-2">
                                    <span className="text-muted-foreground">{criteria.name}</span>
                                    <Badge variant="secondary" className="text-xs">
                                      {criteria.weight}%
                                    </Badge>
                                  </div>
                                  <span className="font-medium">{rating}/5</span>
                                </div>
                                <Progress value={rating * 20} />
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-4">
                          {feedback.technicalSkills && (
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Technical Skills</span>
                                <span className="font-medium">{feedback.technicalSkills}/5</span>
                              </div>
                              <Progress value={feedback.technicalSkills * 20} />
                            </div>
                          )}
                          {feedback.communication && (
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Communication</span>
                                <span className="font-medium">{feedback.communication}/5</span>
                              </div>
                              <Progress value={feedback.communication * 20} />
                            </div>
                          )}
                          {feedback.cultureFit && (
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Culture Fit</span>
                                <span className="font-medium">{feedback.cultureFit}/5</span>
                              </div>
                              <Progress value={feedback.cultureFit * 20} />
                            </div>
                          )}
                          {feedback.problemSolving && (
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Problem Solving</span>
                                <span className="font-medium">{feedback.problemSolving}/5</span>
                              </div>
                              <Progress value={feedback.problemSolving * 20} />
                            </div>
                          )}
                        </div>
                      )}

                      {/* Overall Rating */}
                      <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                        <span className="font-medium">Overall Rating</span>
                        <div className="flex items-center gap-2">
                          {renderStars(feedback.overallRating)}
                          <span className="font-semibold">{feedback.overallRating}/5</span>
                        </div>
                      </div>

                      {/* Recommendation */}
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Recommendation:</span>
                        <Badge className={getRecommendationColor(feedback.recommendation)}>
                          {feedback.recommendation.replace("-", " ").toUpperCase()}
                        </Badge>
                      </div>

                      {/* Written Feedback */}
                      <div className="space-y-3">
                        {feedback.strengths && (
                          <div>
                            <p className="text-sm font-medium text-success mb-1">Strengths</p>
                            <p className="text-sm text-muted-foreground">{feedback.strengths}</p>
                          </div>
                        )}
                        {feedback.concerns && (
                          <div>
                            <p className="text-sm font-medium text-destructive mb-1">Concerns</p>
                            <p className="text-sm text-muted-foreground">{feedback.concerns}</p>
                          </div>
                        )}
                        {feedback.notes && (
                          <div>
                            <p className="text-sm font-medium mb-1">Additional Notes</p>
                            <p className="text-sm text-muted-foreground">{feedback.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              )}
            </CardContent>
          </Card>
          </TabsContent>

          {/* Notes Tab */}
          <TabsContent value="notes" className="mt-6">
            <InterviewNotesSection 
              interview={interview}
              onSave={(notes) => {
                const updatedInterview = { ...interview, notes };
                onUpdateInterview?.(updatedInterview);
              }}
            />
          </TabsContent>
        </Tabs>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button>
            <Mail className="h-4 w-4 mr-2" />
            Send Email
          </Button>
        </div>
      </div>
    </FormDrawer>
  );
}
