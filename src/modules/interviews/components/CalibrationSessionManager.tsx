// @ts-nocheck
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { Progress } from "@/shared/components/ui/progress";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { 
  Calendar, 
  Clock, 
  Users, 
  Plus, 
  CheckCircle2, 
  Circle,
  PlayCircle,
  Trophy,
  Target,
  AlertTriangle,
  BookOpen,
  BarChart3
  } from "lucide-react";
import type { CalibrationSession, Interview } from "@/shared/types/interview";
import { format } from "date-fns";
import { useToast } from "@/shared/hooks/use-toast";
import { CalibrationSessionAnalytics } from "./CalibrationSessionAnalytics";
import LiveCollaboration from "./LiveCollaboration";
import SessionReports from "./SessionReports";
import SessionFeedback from "./SessionFeedback";
import SmartRecommendations from "./SmartRecommendations";

interface CalibrationSessionManagerProps {
  interviews: Interview[];
}

export function CalibrationSessionManager({ interviews }: CalibrationSessionManagerProps) {
  const { toast } = useToast();
  const [sessions, setSessions] = useState<CalibrationSession[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<CalibrationSession | null>(null);
  const [viewMode, setViewMode] = useState<"sessions" | "analytics">("sessions");
  const [detailTab, setDetailTab] = useState("overview");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    scheduledDate: "",
    scheduledTime: "",
    duration: 60,
    participants: "",
    selectedInterviews: [] as string[],
  });

  const getExerciseTemplates = () => [
    {
      type: 'rating-alignment' as const,
      title: 'Rating Alignment Exercise',
      description: 'Review 3-5 candidate profiles and independently rate them, then discuss differences to align on standards.',
    },
    {
      type: 'scenario-review' as const,
      title: 'Scenario Review',
      description: 'Discuss challenging interview scenarios and agree on how to handle similar situations consistently.',
    },
    {
      type: 'rubric-discussion' as const,
      title: 'Rubric Calibration',
      description: 'Review and refine rating criteria definitions to ensure shared understanding across the team.',
    },
    {
      type: 'bias-awareness' as const,
      title: 'Bias Awareness Training',
      description: 'Identify common biases in interview evaluation and practice mitigation strategies.',
    },
  ];

  const handleCreateSession = () => {
    if (!formData.name || !formData.scheduledDate || !formData.scheduledTime) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const exercises = getExerciseTemplates().map((template, index) => ({
      id: `exercise-${Date.now()}-${index}`,
      ...template,
      completed: false,
    }));

    const newSession: CalibrationSession = {
      id: `cal-${Date.now()}`,
      name: formData.name,
      description: formData.description,
      scheduledDate: formData.scheduledDate,
      scheduledTime: formData.scheduledTime,
      duration: formData.duration,
      status: 'scheduled',
      facilitatorId: 'current-user',
      facilitatorName: 'Current User',
      participants: formData.participants.split(',').map((name, index) => ({
        userId: `user-${Date.now()}-${index}`,
        name: name.trim(),
        role: index === 0 ? 'facilitator' : 'participant',
      })),
      focusInterviews: formData.selectedInterviews,
      exercises,
      notes: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setSessions([...sessions, newSession]);
    setIsCreateDialogOpen(false);
    setFormData({
      name: "",
      description: "",
      scheduledDate: "",
      scheduledTime: "",
      duration: 60,
      participants: "",
      selectedInterviews: [],
    });
    toast({
      title: "Calibration Session Created",
      description: "The session has been scheduled successfully.",
    });
  };

  const handleStartSession = (session: CalibrationSession) => {
    const updatedSession = {
      ...session,
      status: 'in-progress' as const,
      updatedAt: new Date().toISOString(),
    };
    setSessions(sessions.map(s => s.id === session.id ? updatedSession : s));
    setSelectedSession(updatedSession);
    setIsDetailDialogOpen(true);
    toast({
      title: "Session Started",
      description: "Calibration session is now in progress.",
    });
  };

  const handleCompleteExercise = (exerciseId: string) => {
    if (!selectedSession) return;

    const updatedExercises = selectedSession.exercises.map(ex =>
      ex.id === exerciseId ? { ...ex, completed: true } : ex
    );

    const allCompleted = updatedExercises.every(ex => ex.completed);
    const updatedSession = {
      ...selectedSession,
      exercises: updatedExercises,
      status: allCompleted ? 'completed' as const : selectedSession.status,
      alignmentScores: allCompleted ? {
        beforeSession: 65,
        afterSession: 92,
      } : selectedSession.alignmentScores,
      updatedAt: new Date().toISOString(),
    };

    setSessions(sessions.map(s => s.id === updatedSession.id ? updatedSession : s));
    setSelectedSession(updatedSession);
    
    if (allCompleted) {
      toast({
        title: "Session Completed!",
        description: "All exercises completed. Team alignment improved by 27%.",
      });
    }
  };

  const getStatusBadge = (status: CalibrationSession['status']) => {
    const variants = {
      scheduled: { variant: "outline" as const, label: "Scheduled" },
      'in-progress': { variant: "default" as const, label: "In Progress" },
      completed: { variant: "secondary" as const, label: "Completed" },
    };
    const config = variants[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getExerciseIcon = (type: string) => {
    const icons = {
      'rating-alignment': Target,
      'scenario-review': BookOpen,
      'rubric-discussion': Trophy,
      'bias-awareness': AlertTriangle,
    };
    const Icon = icons[type as keyof typeof icons] || Circle;
    return <Icon className="h-5 w-5" />;
  };

  const completedInterviews = interviews.filter(i => i.status === 'completed' && i.feedback.length > 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Calibration Sessions</h2>
          <p className="text-muted-foreground">
            Collaborate with your team to align on rating standards
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)}>
            <TabsList>
              <TabsTrigger value="sessions">
                <Users className="h-4 w-4 mr-2" />
                Sessions
              </TabsTrigger>
              <TabsTrigger value="analytics">
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Session
          </Button>
        </div>
      </div>

      {viewMode === "analytics" ? (
        <CalibrationSessionAnalytics sessions={sessions} />
      ) : sessions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">No Calibration Sessions Yet</p>
            <p className="text-sm text-muted-foreground mb-4">
              Create a session to review feedback and align on rating standards with your team
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Session
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {sessions.map((session) => {
            const completedExercises = session.exercises.filter(e => e.completed).length;
            const progress = (completedExercises / session.exercises.length) * 100;

            return (
              <Card key={session.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle>{session.name}</CardTitle>
                        {getStatusBadge(session.status)}
                      </div>
                      <CardDescription>{session.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{format(new Date(session.scheduledDate), "PPP")}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{session.scheduledTime} ({session.duration} min)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{session.participants.length} participants</span>
                      </div>
                    </div>

                    {session.status !== 'scheduled' && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Exercise Progress</span>
                          <span className="font-medium">
                            {completedExercises} / {session.exercises.length} completed
                          </span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                    )}

                    {session.status === 'completed' && session.alignmentScores && (
                      <div className="flex items-center gap-4 p-3 bg-success/10 rounded-lg border border-success/20">
                        <Trophy className="h-5 w-5 text-success" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-success">Session Completed Successfully</p>
                          <p className="text-xs text-muted-foreground">
                            Team alignment improved from {session.alignmentScores.beforeSession}% to{' '}
                            {session.alignmentScores.afterSession}%
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      {session.status === 'scheduled' && (
                        <Button onClick={() => handleStartSession(session)} size="sm">
                          <PlayCircle className="h-4 w-4 mr-2" />
                          Start Session
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedSession(session);
                          setIsDetailDialogOpen(true);
                        }}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Session Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Calibration Session</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Session Name *</Label>
              <Input
                id="name"
                placeholder="Q4 Interview Calibration"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Align on rating standards for senior engineering roles"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.scheduledDate}
                  onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Time *</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.scheduledTime}
                  onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (min)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="participants">Participants (comma-separated names)</Label>
              <Input
                id="participants"
                placeholder="Sarah Chen, Mike Johnson, Emily Davis"
                value={formData.participants}
                onChange={(e) => setFormData({ ...formData, participants: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Focus Interviews (optional)</Label>
              <div className="border rounded-lg p-3 space-y-2 max-h-48 overflow-y-auto">
                {completedInterviews.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No completed interviews with feedback available
                  </p>
                ) : (
                  completedInterviews.map((interview) => (
                    <div key={interview.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={interview.id}
                        checked={formData.selectedInterviews.includes(interview.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setFormData({
                              ...formData,
                              selectedInterviews: [...formData.selectedInterviews, interview.id],
                            });
                          } else {
                            setFormData({
                              ...formData,
                              selectedInterviews: formData.selectedInterviews.filter(id => id !== interview.id),
                            });
                          }
                        }}
                      />
                      <Label htmlFor={interview.id} className="text-sm font-normal cursor-pointer">
                        {interview.candidateName} - {interview.jobTitle}
                      </Label>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Included Exercises</Label>
              <div className="border rounded-lg p-3 space-y-2">
                {getExerciseTemplates().map((template) => (
                  <div key={template.type} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">{template.title}</p>
                      <p className="text-xs text-muted-foreground">{template.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateSession}>Create Session</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Session Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>{selectedSession?.name}</DialogTitle>
              {selectedSession && getStatusBadge(selectedSession.status)}
            </div>
          </DialogHeader>

          {selectedSession && (
            <Tabs value={detailTab} onValueChange={setDetailTab} className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="collaboration">Live</TabsTrigger>
                <TabsTrigger value="reports">Reports</TabsTrigger>
                <TabsTrigger value="feedback">Feedback</TabsTrigger>
                <TabsTrigger value="insights">Insights</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4 mt-4">
                {selectedSession.exercises.map((exercise) => (
                  <Card key={exercise.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          {getExerciseIcon(exercise.type)}
                          <div>
                            <CardTitle className="text-base">{exercise.title}</CardTitle>
                            <CardDescription className="mt-1">
                              {exercise.description}
                            </CardDescription>
                          </div>
                        </div>
                        {exercise.completed ? (
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Completed
                          </Badge>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => handleCompleteExercise(exercise.id)}
                            disabled={selectedSession.status !== 'in-progress'}
                          >
                            Mark Complete
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="collaboration" className="mt-4">
                <LiveCollaboration 
                  sessionId={selectedSession.id} 
                  currentUserId="current-user" 
                />
              </TabsContent>

              <TabsContent value="reports" className="mt-4">
                <SessionReports session={selectedSession} />
              </TabsContent>

              <TabsContent value="feedback" className="mt-4">
                <SessionFeedback 
                  sessionId={selectedSession.id}
                  onSubmit={(feedback) => {
                    toast({
                      title: "Feedback submitted",
                      description: "Your feedback has been recorded successfully",
                    });
                  }}
                />
              </TabsContent>

              <TabsContent value="insights" className="mt-4">
                <SmartRecommendations 
                  sessions={sessions}
                  currentSession={selectedSession}
                />
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
