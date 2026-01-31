import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Separator } from '@/shared/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import {
  Video,
  Calendar as CalendarIcon,
  Users,
  Settings,
  Plus,
  BarChart3,
  CheckCircle2,
  Clock,
  List
} from 'lucide-react';
import { videoInterviewService, type VideoInterview } from '@/shared/lib/videoInterviewService';
import { format } from 'date-fns';
import { JobAIInterviewSettings } from './JobAIInterviewSettings';
import { BulkScheduleDialog } from './BulkScheduleDialog';
import { InterviewCalendarView } from './InterviewCalendarView';
import { useToast } from '@/shared/hooks/use-toast';
import type { Job } from '@/shared/types/job';

interface JobAIInterviewsTabProps {
  job: Job;
}

export function JobAIInterviewsTab({ job }: JobAIInterviewsTabProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showSettings, setShowSettings] = useState(false);
  const [showBulkSchedule, setShowBulkSchedule] = useState(false);
  const [interviews, setInterviews] = useState<VideoInterview[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadInterviews();
  }, [job.id]);

  const loadInterviews = async () => {
    setIsLoading(true);
    try {
      const response = await videoInterviewService.getJobInterviews(job.id);
      if (response.success && response.data) {
        setInterviews(response.data.interviews);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to load interviews',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Failed to load interviews:', error);
      toast({
        title: 'Error',
        description: 'Failed to load interviews',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const completedInterviews = interviews.filter(i => i.status === 'COMPLETED');
  const scheduledInterviews = interviews.filter(i => i.status === 'SCHEDULED');
  const inProgressInterviews = interviews.filter(i => i.status === 'IN_PROGRESS');

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Interviews</CardDescription>
            <CardTitle className="text-3xl">{interviews.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Scheduled</CardDescription>
            <CardTitle className="text-3xl text-blue-600">{scheduledInterviews.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>In Progress</CardDescription>
            <CardTitle className="text-3xl text-yellow-600">{inProgressInterviews.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Completed</CardDescription>
            <CardTitle className="text-3xl text-green-600">{completedInterviews.length}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Action Cards */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h3 className="font-semibold flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Bulk Schedule Interviews
                </h3>
                <p className="text-sm text-muted-foreground">
                  Schedule AI interviews for multiple applicants at once
                </p>
                <div className="pt-2 text-sm text-muted-foreground">
                  {job.applicantsCount} applicant{job.applicantsCount !== 1 ? 's' : ''} available
                </div>
              </div>
              <Button onClick={() => setShowBulkSchedule(true)}>
                <CalendarIcon className="h-4 w-4 mr-2" />
                Schedule
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h3 className="font-semibold flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Interview Configuration
                </h3>
                <p className="text-sm text-muted-foreground">
                  Configure default questions and settings for this job
                </p>
                <div className="pt-2">
                  {job.aiInterviewConfig?.defaultQuestions ? (
                    <Badge variant="outline">
                      {job.aiInterviewConfig.defaultQuestions.length} default questions
                    </Badge>
                  ) : (
                    <Badge variant="secondary">Not configured</Badge>
                  )}
                </div>
              </div>
              <Button variant="outline" onClick={() => setShowSettings(true)}>
                <Settings className="h-4 w-4 mr-2" />
                Configure
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Interview List and Calendar Views */}
      <Tabs defaultValue="list" className="w-full">
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="list">
              <List className="h-4 w-4 mr-2" />
              List View
            </TabsTrigger>
            <TabsTrigger value="calendar">
              <CalendarIcon className="h-4 w-4 mr-2" />
              Calendar View
            </TabsTrigger>
          </TabsList>
          <Button variant="outline" onClick={() => navigate('/ai-interviews/analytics')}>
            <BarChart3 className="h-4 w-4 mr-2" />
            View Analytics
          </Button>
        </div>

        <TabsContent value="list">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Interview History</CardTitle>
                <CardDescription>All AI interviews conducted for this position</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Loading interviews...</p>
                </div>
              ) : interviews.length === 0 ? (
                <div className="text-center py-12">
                  <Video className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">No video interviews scheduled yet</p>
                  <Button onClick={() => setShowBulkSchedule(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Schedule First Interview
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Status Summary */}
                  <div className="flex gap-4 text-sm">
                    {scheduledInterviews.length > 0 && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-blue-600" />
                        <span>{scheduledInterviews.length} Scheduled</span>
                      </div>
                    )}
                    {inProgressInterviews.length > 0 && (
                      <div className="flex items-center gap-2">
                        <Video className="h-4 w-4 text-yellow-600" />
                        <span>{inProgressInterviews.length} In Progress</span>
                      </div>
                    )}
                    {completedInterviews.length > 0 && (
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span>{completedInterviews.length} Completed</span>
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Interview Cards */}
                  <div className="space-y-3">
                    {interviews.slice(0, 10).map((interview) => {
                      const candidateName = interview.application?.candidateName ||
                        (interview.candidate ? `${interview.candidate.firstName} ${interview.candidate.lastName}` : 'Unknown');

                      return (
                        <div
                          key={interview.id}
                          className="border rounded-lg p-4 hover:bg-accent transition-colors cursor-pointer"
                          onClick={() => navigate(`/ai-interviews/${interview.id}`)}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center justify-between">
                                <h4 className="font-semibold">{candidateName}</h4>
                                <Select
                                  value={interview.status}
                                  onValueChange={async (newStatus) => {
                                    try {
                                      await videoInterviewService.updateInterview(interview.id, { status: newStatus as any });
                                      toast({
                                        title: 'Status updated',
                                        description: `Interview status changed to ${newStatus.replace('_', ' ')}`,
                                      });
                                      loadInterviews();
                                    } catch (error) {
                                      toast({
                                        title: 'Error',
                                        description: 'Failed to update interview status',
                                        variant: 'destructive',
                                      });
                                    }
                                  }}
                                >
                                  <SelectTrigger className="w-[140px]">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                                    <SelectItem value="COMPLETED">Completed</SelectItem>
                                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                                    <SelectItem value="NO_SHOW">No Show</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <CalendarIcon className="h-3 w-3" />
                                  <span>{format(new Date(interview.scheduledDate), 'PPp')}</span>
                                </div>
                                <span className="capitalize">{interview.type.replace('_', ' ').toLowerCase()}</span>
                                <span>{interview.duration} min</span>
                              </div>

                              {interview.meetingLink && (
                                <div className="pt-2">
                                  <a
                                    href={interview.meetingLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-primary hover:underline"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    Join Meeting →
                                  </a>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {interviews.length > 10 && (
                    <div className="text-center pt-4">
                      <Button variant="outline" onClick={() => navigate('/ai-interviews', { state: { jobId: job.id } })}>
                        View All {interviews.length} Interviews
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar">
          <InterviewCalendarView jobId={job.id} jobTitle={job.title} />
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      {showSettings && (
        <JobAIInterviewSettings
          job={job}
          open={showSettings}
          onOpenChange={setShowSettings}
        />
      )}

      {showBulkSchedule && (
        <BulkScheduleDialog
          job={job}
          open={showBulkSchedule}
          onOpenChange={setShowBulkSchedule}
          onScheduled={loadInterviews}
        />
      )}
    </div>
  );
}
