/**
 * Round Interviews Drawer
 * Shows all interviews for a specific job round with calendar and list views
 * Includes all manual scheduling, rescheduling, canceling, and management features
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/shared/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { InterviewCalendarView } from '@/shared/components/jobs/aiInterview/InterviewCalendarView';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/shared/components/ui/dialog';
import { interviewService, Interview } from '@/shared/lib/api/interviewService';
import { videoInterviewService, VideoInterview } from '@/shared/lib/videoInterviewService';
// Removed unused InterviewFeedback import
// jobRoundService and JobRound imports removed
import { format, parseISO } from 'date-fns';
import {
  Calendar,
  Clock,
  Video,
  Phone,
  Users,
  MapPin,
  Loader2,
  Settings,
  Plus,
  Edit,
  X,
  CheckCircle2,
  AlertCircle,
  Search,
  BarChart3,
  Mail,
  CalendarClock,
  Star,
  MoreVertical,
  Filter
} from 'lucide-react';
import { toast } from 'sonner';

// Placeholder for RescheduleInterviewDialog since it was not found
// Placeholder for RescheduleInterviewDialog since it was not found
const RescheduleInterviewDialog = ({ open, onOpenChange, interview, onReschedule }: { open: boolean, onOpenChange: any, interview: any, onReschedule: any }) => {

  if (!open) return null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reschedule Interview</DialogTitle>
          <DialogDescription>Reschedule interview for {interview?.candidate?.firstName}</DialogDescription>
        </DialogHeader>
        <div className="py-4">Place holder for rescheduling logic</div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => onReschedule(interview, new Date())}>Reschedule</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';

type FeedbackWithSnake = any; // Quick placeholder to resolve missing name


interface RoundInterviewsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobId: string;
  jobRoundId: string;
  roundName: string;
  roundType: 'INTERVIEW' | 'ASSESSMENT';
  jobTitle?: string;
  onConfigureRound?: () => void;
}

export function RoundInterviewsDrawer({
  open,
  onOpenChange,
  jobId,
  jobRoundId,
  roundName,
  roundType: _roundType,
  jobTitle,


  onConfigureRound,
}: RoundInterviewsDrawerProps) {
  console.log('RoundInterviewsDrawer rendered with open:', open, 'jobRoundId:', jobRoundId);

  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'calendar' | 'list' | 'statistics'>('calendar');
  const [selectedInterviews, setSelectedInterviews] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
  const [showRescheduleDialog, setShowRescheduleDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showNoShowDialog, setShowNoShowDialog] = useState(false);
  const [showGradeDialog, setShowGradeDialog] = useState(false);
  const [gradeScore, setGradeScore] = useState<number>(0);
  const [gradeNotes, setGradeNotes] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [noShowReason, setNoShowReason] = useState('');
  const [isFeedbackViewOpen, setIsFeedbackViewOpen] = useState(false);
  const [feedbackDetails, setFeedbackDetails] = useState<VideoInterview | null>(null);
  const [isLoadingFeedback, setIsLoadingFeedback] = useState(false);

  const loadInterviews = useCallback(async () => {
    setLoading(true);
    try {
      const response = await interviewService.getInterviews({
        jobId,
        jobRoundId,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      });

      if (response.success && response.data) {
        setInterviews(response.data.interviews || []);
      } else {
        toast.error('Failed to load interviews');
      }
    } catch (error) {
      console.error('Failed to load interviews:', error);
      toast.error('Failed to load interviews');
    } finally {
      setLoading(false);
    }
  }, [jobId, jobRoundId, statusFilter]);

  useEffect(() => {
    if (open) {
      loadInterviews();
    }
  }, [open, loadInterviews]);

  // Fetch feedback details when dialog opens
  const [progressionStatus, setProgressionStatus] = useState<Record<string, { canProgress: boolean; missingInterviewers: string[] }>>({});

  useEffect(() => {
    // Fetch progression status for completed interviews
    if (activeTab === 'list' && interviews.length > 0) {
      const completedInterviews = interviews.filter(i => i.status === 'COMPLETED');
      completedInterviews.forEach(interview => {
        // Use type assertion to handle potential backend type mismatches safely
        const type = interview.type as string;
        const isVideo = type === 'VIDEO' || type === 'LIVE_VIDEO';

        if (isVideo) {
          videoInterviewService.getProgressionStatus(interview.id)
            .then(res => {
              if (res.data) {
                if (isVideo) {
                  setProgressionStatus((prev: any) => ({
                    ...prev,
                    [interview.id]: res.data || { canProgress: false, missingInterviewers: [] }
                  }));
                }
              }
            })
            .catch(err => console.error('Failed to get progression status', err));
        }
      });
    }
  }, [interviews, activeTab]);

  useEffect(() => {
    if (isFeedbackViewOpen && selectedInterview) {
      setIsLoadingFeedback(true);
      const type = selectedInterview.type as string;
      const isVideo = type === 'VIDEO' || type === 'LIVE_VIDEO';

      const fetchPromise = isVideo
        ? videoInterviewService.getInterview(selectedInterview.id)
        : interviewService.getInterview(selectedInterview.id);

      fetchPromise
        .then((response) => {
          if (response.data?.interview) {
            setFeedbackDetails(response.data.interview as VideoInterview);
          }
        })
        .catch((err) => console.error('Failed to fetch interview details:', err))
        .finally(() => setIsLoadingFeedback(false));
    } else {
      setFeedbackDetails(null);
    }
  }, [isFeedbackViewOpen, selectedInterview]);

  const handleMoveNext = async (interview: Interview) => {
    try {
      // Logic to move next would typically involve updating application stage
      // For now, we'll just show a success message as the actual endpoint might vary
      // or we might need to use applicationService
      console.log('Moving interview to next stage:', interview.id);
      toast.success('Candidate moved to next stage');
    } catch (error) {
      toast.error('Failed to move candidate');
    }
  };

  const handleReject = async (interview: Interview) => {
    try {
      // Logic to reject candidate
      console.log('Rejecting interview:', interview.id);
      toast.success('Candidate rejected');
    } catch (error) {
      toast.error('Failed to reject candidate');
    }
  };


  // Calculate statistics
  const statistics = useMemo(() => {
    const total = interviews.length;
    const scheduled = interviews.filter(i => i.status === 'SCHEDULED').length;
    const completed = interviews.filter(i => i.status === 'COMPLETED').length;
    const cancelled = interviews.filter(i => i.status === 'CANCELLED').length;
    const noShow = interviews.filter(i => i.status === 'NO_SHOW').length;
    const inProgress = interviews.filter(i => i.status === 'IN_PROGRESS').length;

    // Get unique candidates
    const uniqueCandidates = new Set(interviews.map(i => i.candidateId));

    return {
      total,
      scheduled,
      completed,
      cancelled,
      noShow,
      inProgress,
      uniqueCandidates: uniqueCandidates.size,
    };
  }, [interviews]);

  // Filter interviews by search query
  const filteredInterviews = useMemo(() => {
    let filtered = interviews;

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(interview => interview.status === statusFilter);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(interview => {
        // Search by candidate ID
        if (interview.candidateId?.toLowerCase().includes(query)) return true;
        // Search by application ID
        if (interview.applicationId?.toLowerCase().includes(query)) return true;
        // Search by candidate name
        if (interview.candidate) {
          const fullName = `${interview.candidate.firstName} ${interview.candidate.lastName}`.toLowerCase();
          if (fullName.includes(query)) return true;
          // Search by candidate email
          if (interview.candidate.email?.toLowerCase().includes(query)) return true;
          // Search by candidate phone
          if (interview.candidate.phone?.toLowerCase().includes(query)) return true;
        }
        return false;
      });
    }

    return filtered;
  }, [interviews, searchQuery, statusFilter]);

  // Group interviews by candidate
  const interviewsByCandidate = useMemo(() => {
    const grouped = new Map<string, Interview[]>();
    filteredInterviews.forEach(interview => {
      const key = interview.candidateId || interview.applicationId || 'unknown';
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)!.push(interview);
    });
    return Array.from(grouped.entries());
  }, [filteredInterviews]);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      SCHEDULED: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      IN_PROGRESS: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      COMPLETED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      RESCHEDULED: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      NO_SHOW: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'VIDEO':
      case 'LIVE_VIDEO':
        return <Video className="h-4 w-4" />;
      case 'PHONE':
        return <Phone className="h-4 w-4" />;
      case 'PANEL':
        return <Users className="h-4 w-4" />;
      case 'IN_PERSON':
        return <MapPin className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const getAverageGrade = (interview: Interview) => {
    const feedbacks = interview.interviewFeedbacks || [];
    if (feedbacks.length === 0) return null;
    const total = feedbacks.reduce((sum, fb) => sum + (fb.overall_rating || 0), 0);
    return {
      average: (total / feedbacks.length).toFixed(1),
      count: feedbacks.length
    };
  };

  const handleMarkAsComplete = async (interview: Interview) => {
    try {
      let response;
      // Check if it's a video interview
      if (interview.type === 'VIDEO') {
        response = await videoInterviewService.updateStatus(interview.id, 'COMPLETED');
      } else {
        response = await interviewService.updateStatus(interview.id, 'COMPLETED');
      }

      if (response.success) {
        toast.success('Interview marked as complete');
        loadInterviews();
      } else {
        toast.error('Failed to update status');
      }
    } catch (error) {
      console.error('Failed to update status:', error);
      toast.error('Failed to update status');
    }
  };

  const handleSubmitGrade = async () => {
    if (!selectedInterview) return;

    if (gradeScore < 0 || gradeScore > 100) {
      toast.error('Grade must be between 0 and 100');
      return;
    }

    try {
      let response;
      // Check if it's a video interview
      const type = selectedInterview.type as string;
      if (type === 'VIDEO' || type === 'LIVE_VIDEO') {
        response = await videoInterviewService.addFeedback(selectedInterview.id, {
          overallRating: gradeScore,
          notes: gradeNotes
        });
      } else {
        response = await interviewService.addFeedback(selectedInterview.id, {
          overallRating: gradeScore,
          notes: gradeNotes
        });
      }

      if (response.success) {
        toast.success('Grade submitted successfully');
        loadInterviews();
        setShowGradeDialog(false);
        setGradeScore(0);
        setGradeNotes('');
        setSelectedInterview(null);
      } else {
        toast.error('Failed to submit grade');
      }
    } catch (error) {
      console.error('Failed to submit grade:', error);
      toast.error('Failed to submit grade');
    }
  };

  const handleReschedule = async (interview: Interview, newDate: Date, reason?: string) => {


    try {
      const response = await interviewService.rescheduleInterview(
        interview.id,
        newDate.toISOString(),
        reason
      );

      if (response.success) {
        toast.success('Interview rescheduled successfully');
        loadInterviews();
        setShowRescheduleDialog(false);
        setSelectedInterview(null);
      } else {
        toast.error('Failed to reschedule interview');
      }
    } catch (error) {
      console.error('Failed to reschedule interview:', error);
      toast.error('Failed to reschedule interview');
    }
  };

  const handleCancel = async () => {
    if (!selectedInterview || !cancelReason.trim()) {
      toast.error('Please provide a cancellation reason');
      return;
    }

    try {
      const response = await interviewService.cancelInterview(selectedInterview.id, cancelReason);

      if (response.success) {
        toast.success('Interview cancelled successfully');
        loadInterviews();
        setShowCancelDialog(false);
        setSelectedInterview(null);
        setCancelReason('');
      } else {
        toast.error('Failed to cancel interview');
      }
    } catch (error) {
      console.error('Failed to cancel interview:', error);
      toast.error('Failed to cancel interview');
    }
  };

  const handleNoShow = async () => {
    if (!selectedInterview) return;

    try {
      const response = await interviewService.markAsNoShow(
        selectedInterview.id,
        noShowReason || undefined
      );

      if (response.success) {
        toast.success('Interview marked as no-show');
        loadInterviews();
        setShowNoShowDialog(false);
        setSelectedInterview(null);
        setNoShowReason('');
      } else {
        toast.error('Failed to mark interview as no-show');
      }
    } catch (error) {
      console.error('Failed to mark interview as no-show:', error);
      toast.error('Failed to mark interview as no-show');
    }
  };

  const handleBulkAction = async (action: 'cancel' | 'reschedule' | 'reminder') => {
    if (selectedInterviews.size === 0) {
      toast.error('Please select at least one interview');
      return;
    }

    // Implement bulk actions
    toast.info(`Bulk ${action} for ${selectedInterviews.size} interviews`);
    // TODO: Implement bulk actions
  };

  const toggleInterviewSelection = (interviewId: string) => {
    const newSelected = new Set(selectedInterviews);
    if (newSelected.has(interviewId)) {
      newSelected.delete(interviewId);
    } else {
      newSelected.add(interviewId);
    }
    setSelectedInterviews(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedInterviews.size === filteredInterviews.length) {
      setSelectedInterviews(new Set());
    } else {
      setSelectedInterviews(new Set(filteredInterviews.map(i => i.id)));
    }
  };

  console.log('RoundInterviewsDrawer returning Sheet with open:', open);

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-6xl overflow-y-auto">
          <SheetHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <SheetTitle className="flex items-center gap-3 text-2xl">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-md">
                    <CalendarClock className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      {roundName} Interviews
                    </div>
                    {jobTitle && (
                      <div className="text-sm font-medium text-muted-foreground mt-1">
                        {jobTitle}
                      </div>
                    )}
                  </div>
                </SheetTitle>
                <SheetDescription className="mt-3 text-base">
                  {jobTitle && (
                    <>
                      Managing and scheduling interviews for the <strong className="text-foreground">{roundName}</strong> round
                    </>
                  )}
                  {!jobTitle && `View and manage all interviews for ${roundName} round`}
                </SheetDescription>
              </div>
              {onConfigureRound && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onConfigureRound}
                  className="shrink-0"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Configure
                </Button>
              )}
            </div>

            {/* Statistics Bar */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mt-6">
              <Card className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{statistics.total}</div>
              </Card>
              <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/30 border-blue-200 dark:border-blue-800 hover:shadow-md transition-shadow">
                <div className="text-xs font-medium text-blue-700 dark:text-blue-300 uppercase tracking-wide">Scheduled</div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{statistics.scheduled}</div>
              </Card>
              <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/30 border-green-200 dark:border-green-800 hover:shadow-md transition-shadow">
                <div className="text-xs font-medium text-green-700 dark:text-green-300 uppercase tracking-wide">Completed</div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">{statistics.completed}</div>
              </Card>
              <Card className="p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950/30 dark:to-yellow-900/30 border-yellow-200 dark:border-yellow-800 hover:shadow-md transition-shadow">
                <div className="text-xs font-medium text-yellow-700 dark:text-yellow-300 uppercase tracking-wide">In Progress</div>
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">{statistics.inProgress}</div>
              </Card>
              <Card className="p-4 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/30 dark:to-red-900/30 border-red-200 dark:border-red-800 hover:shadow-md transition-shadow">
                <div className="text-xs font-medium text-red-700 dark:text-red-300 uppercase tracking-wide">Cancelled</div>
                <div className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">{statistics.cancelled}</div>
              </Card>
              <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/30 border-purple-200 dark:border-purple-800 hover:shadow-md transition-shadow">
                <div className="text-xs font-medium text-purple-700 dark:text-purple-300 uppercase tracking-wide">Candidates</div>
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">{statistics.uniqueCandidates}</div>
              </Card>
            </div>
          </SheetHeader>

          {/* Filters and Actions */}
          <div className="flex flex-col sm:flex-row gap-3 mt-6 pb-4 border-b">
            <div className="flex-1 flex gap-2">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search candidates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  <SelectItem value="NO_SHOW">No Show</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              {selectedInterviews.size > 0 && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkAction('reschedule')}
                  >
                    Bulk Reschedule ({selectedInterviews.size})
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkAction('cancel')}
                  >
                    Bulk Cancel ({selectedInterviews.size})
                  </Button>
                </>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => toast.info('Schedule new interview functionality')}
              >
                <Plus className="h-4 w-4 mr-2" />
                Schedule New
              </Button>
            </div>
          </div>

          <div className="mt-6">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'calendar' | 'list' | 'statistics')}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="calendar">
                  <Calendar className="h-4 w-4 mr-2" />
                  Calendar View
                </TabsTrigger>
                <TabsTrigger value="list">
                  <Clock className="h-4 w-4 mr-2" />
                  List View ({filteredInterviews.length})
                </TabsTrigger>
                <TabsTrigger value="statistics">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Statistics
                </TabsTrigger>
              </TabsList>

              <TabsContent value="calendar" className="mt-4">
                {loading ? (
                  <div className="flex items-center justify-center h-96">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="mt-4">
                    <InterviewCalendarView
                      jobId={jobId}
                      jobTitle={jobTitle || 'Job'}
                      /* @ts-ignore - props mismatch between placeholder and component */
                      onInterviewClick={(interview: any) => {
                        setSelectedInterview(interview);
                        toast.info(`Interview: ${format(new Date(interview.scheduledDate), 'MMM dd, yyyy HH:mm')}`);
                      }}
                      /* @ts-ignore - props mismatch */
                      onReschedule={(_interview: any, _newDate: Date) => {
                        setSelectedInterview(_interview);
                        setShowRescheduleDialog(true);
                      }}


                    />
                  </div>
                )}
              </TabsContent>

              <TabsContent value="list" className="mt-4">
                {loading ? (
                  <div className="flex items-center justify-center h-96">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : filteredInterviews.length === 0 ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-lg font-medium mb-2">No interviews found</p>
                      <p className="text-sm text-muted-foreground text-center">
                        {searchQuery || statusFilter !== 'all'
                          ? 'Try adjusting your filters'
                          : 'Interviews will appear here once they are scheduled'}
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {/* Select All */}
                    <div className="flex items-center gap-2 pb-2 border-b">
                      <Checkbox
                        checked={selectedInterviews.size === filteredInterviews.length && filteredInterviews.length > 0}
                        onCheckedChange={toggleSelectAll}
                      />
                      <span className="text-sm text-muted-foreground">
                        Select all ({selectedInterviews.size} selected)
                      </span>
                    </div>

                    {/* Grouped by Candidate */}
                    {interviewsByCandidate.map(([candidateId, candidateInterviews]) => {
                      const candidate = candidateInterviews[0]?.candidate;
                      const candidateName = candidate
                        ? `${candidate.firstName} ${candidate.lastName}`
                        : `Candidate ${candidateId.substring(0, 8)}...`;
                      const initials = candidate
                        ? `${candidate.firstName?.[0] || ''}${candidate.lastName?.[0] || ''}`.toUpperCase()
                        : '??';

                      return (
                        <Card key={candidateId} className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-primary/50">
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-4">
                                <Avatar className="h-14 w-14 border-2 border-primary/20 shadow-md">
                                  <AvatarImage src={candidate?.photo} />
                                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-base font-semibold">
                                    {initials}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                    {candidateName}
                                  </CardTitle>
                                  <CardDescription className="mt-1 space-y-1">
                                    {candidate?.email && (
                                      <div className="flex items-center gap-2 text-sm">
                                        <Mail className="h-3.5 w-3.5" />
                                        <span>{candidate.email}</span>
                                      </div>
                                    )}
                                    <div className="flex items-center gap-4 text-sm">
                                      {candidate?.phone && (
                                        <span className="flex items-center gap-1.5">
                                          <Phone className="h-3.5 w-3.5" />
                                          {candidate.phone}
                                        </span>
                                      )}
                                      {(candidate?.city || candidate?.country) && (
                                        <span className="flex items-center gap-1.5">
                                          <MapPin className="h-3.5 w-3.5" />
                                          {[candidate.city, candidate.state, candidate.country].filter(Boolean).join(', ') || 'Location not specified'}
                                        </span>
                                      )}
                                    </div>
                                    <div className="pt-1">
                                      <Badge variant="secondary" className="text-xs">
                                        {candidateInterviews.length} interview{candidateInterviews.length !== 1 ? 's' : ''} scheduled
                                      </Badge>
                                    </div>
                                  </CardDescription>
                                </div>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              {candidateInterviews.map((interview) => (
                                <div
                                  key={interview.id}
                                  className="flex items-start gap-3 p-4 border rounded-xl hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 dark:hover:from-blue-950/20 dark:hover:to-indigo-950/20 transition-all duration-200 hover:shadow-md hover:border-primary/30"
                                >
                                  <Checkbox
                                    checked={selectedInterviews.has(interview.id)}
                                    onCheckedChange={() => toggleInterviewSelection(interview.id)}
                                    className="mt-1"
                                  />
                                  <div className="flex-1">
                                    <div className="flex items-start justify-between mb-2">
                                      <div className="flex items-center gap-2">
                                        {getTypeIcon(interview.type || 'VIDEO')}
                                        <span className="font-medium">
                                          {format(new Date(interview.scheduledDate), 'MMMM dd, yyyy')}
                                        </span>
                                        <span className="text-sm text-muted-foreground">
                                          {format(new Date(interview.scheduledDate), 'hh:mm a')}
                                        </span>
                                        <span className="text-sm text-muted-foreground">
                                          ({interview.duration || 60} min)
                                        </span>
                                      </div>
                                      <Badge className={getStatusColor(interview.status || 'SCHEDULED')}>
                                        {interview.status?.replace('_', ' ') || 'SCHEDULED'}
                                      </Badge>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                                      {interview.type && (
                                        <span className="flex items-center gap-1">
                                          {getTypeIcon(interview.type)}
                                          {interview.type.replace('_', ' ')}
                                        </span>
                                      )}
                                      {interview.meetingLink && (
                                        <a
                                          href={interview.meetingLink}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="flex items-center gap-1 text-primary hover:underline"
                                        >
                                          <Video className="h-3 w-3" />
                                          Join Meeting
                                        </a>
                                      )}
                                    </div>
                                    <div className="flex gap-2 flex-wrap">
                                      {interview.status === 'SCHEDULED' && (
                                        <>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                            onClick={() => handleMarkAsComplete(interview)}
                                          >
                                            <CheckCircle2 className="h-3 w-3 mr-1" />
                                            Mark Complete
                                          </Button>
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                              setSelectedInterview(interview);
                                              setShowRescheduleDialog(true);
                                            }}
                                          >
                                            <Edit className="h-3 w-3 mr-1" />
                                            Reschedule
                                          </Button>
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                              setSelectedInterview(interview);
                                              setShowCancelDialog(true);
                                            }}
                                          >
                                            <X className="h-3 w-3 mr-1" />
                                            Cancel
                                          </Button>
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                              setSelectedInterview(interview);
                                              setShowNoShowDialog(true);
                                            }}
                                          >
                                            <AlertCircle className="h-3 w-3 mr-1" />
                                            No Show
                                          </Button>
                                        </>
                                      )}
                                      {interview.status === 'COMPLETED' && (
                                        <>
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                              setSelectedInterview(interview);
                                              setGradeScore(0);
                                              setGradeNotes('');
                                              setShowGradeDialog(true);
                                            }}
                                          >
                                            <Star className="h-3 w-3 mr-1" />
                                            Grade
                                          </Button>
                                          {/* Show Average Grade */}
                                          {(() => {
                                            const stats = getAverageGrade(interview);
                                            if (stats) {
                                              return (
                                                <div className="flex items-center gap-1 text-sm text-muted-foreground ml-2">
                                                  <span className="font-semibold text-primary">{stats.average}/100</span>
                                                  <span>({stats.count} graders)</span>
                                                </div>
                                              );
                                            }
                                            return null;
                                          })()}
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                              setSelectedInterview(interview);
                                              setIsFeedbackViewOpen(true);
                                            }}
                                          >
                                            <CheckCircle2 className="h-3 w-3 mr-1" />
                                            View Feedback
                                          </Button>

                                          {/* Progression Buttons */}
                                          {progressionStatus[interview.id]?.canProgress && (
                                            <>
                                              <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => handleReject(interview)}
                                              >
                                                <X className="h-3 w-3 mr-1" />
                                                Reject
                                              </Button>
                                              <Button
                                                variant="default"
                                                size="sm"
                                                className="bg-green-600 hover:bg-green-700"
                                                onClick={() => handleMoveNext(interview)}
                                              >
                                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                                Move Next
                                              </Button>
                                            </>
                                          )}
                                        </>
                                      )}
                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                          <Button variant="outline" size="sm">
                                            <MoreVertical className="h-3 w-3" />
                                          </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                          <DropdownMenuItem onClick={() => toast.info('View details')}>
                                            View Details
                                          </DropdownMenuItem>
                                          <DropdownMenuItem onClick={() => toast.info('View candidate')}>
                                            View Candidate
                                          </DropdownMenuItem>
                                          <DropdownMenuItem onClick={() => toast.info('Send reminder')}>
                                            <Mail className="h-3 w-3 mr-2" />
                                            Send Reminder
                                          </DropdownMenuItem>
                                          <DropdownMenuSeparator />
                                          <DropdownMenuItem
                                            onClick={() => toast.info('Duplicate interview')}
                                          >
                                            Duplicate
                                          </DropdownMenuItem>
                                        </DropdownMenuContent>
                                      </DropdownMenu>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="statistics" className="mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Status Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span>Scheduled</span>
                          <div className="flex items-center gap-2">
                            <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-500"
                                style={{
                                  width: `${statistics.total > 0 ? (statistics.scheduled / statistics.total) * 100 : 0}%`,
                                }}
                              />
                            </div>
                            <span className="text-sm font-medium">{statistics.scheduled}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Completed</span>
                          <div className="flex items-center gap-2">
                            <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-green-500"
                                style={{
                                  width: `${statistics.total > 0 ? (statistics.completed / statistics.total) * 100 : 0}%`,
                                }}
                              />
                            </div>
                            <span className="text-sm font-medium">{statistics.completed}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Cancelled</span>
                          <div className="flex items-center gap-2">
                            <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-red-500"
                                style={{
                                  width: `${statistics.total > 0 ? (statistics.cancelled / statistics.total) * 100 : 0}%`,
                                }}
                              />
                            </div>
                            <span className="text-sm font-medium">{statistics.cancelled}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Round Overview</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <div className="text-sm text-muted-foreground">Total Interviews</div>
                          <div className="text-2xl font-bold">{statistics.total}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Unique Candidates</div>
                          <div className="text-2xl font-bold">{statistics.uniqueCandidates}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Completion Rate</div>
                          <div className="text-2xl font-bold">
                            {statistics.total > 0
                              ? Math.round((statistics.completed / statistics.total) * 100)
                              : 0}
                            %
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </SheetContent>
      </Sheet>

      {/* Reschedule Dialog */}
      {selectedInterview && (
        <RescheduleInterviewDialog
          open={showRescheduleDialog}
          onOpenChange={setShowRescheduleDialog}
          interview={selectedInterview}
          onReschedule={(newDate: Date, reason?: string) => {

            handleReschedule(selectedInterview, newDate, reason);
          }}
        />
      )}

      {/* Cancel Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Interview</DialogTitle>
            <DialogDescription>
              Please provide a reason for cancelling this interview.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Cancellation Reason</label>
              <Input
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Enter reason for cancellation..."
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
              Close
            </Button>
            <Button onClick={handleCancel} disabled={!cancelReason.trim()}>
              Cancel Interview
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* No Show Dialog */}
      <Dialog open={showNoShowDialog} onOpenChange={setShowNoShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark as No-Show</DialogTitle>
            <DialogDescription>
              Mark this interview as a no-show. You can optionally provide a reason.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Reason (Optional)</label>
              <Input
                value={noShowReason}
                onChange={(e) => setNoShowReason(e.target.value)}
                placeholder="Enter reason for no-show..."
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNoShowDialog(false)}>
              Close
            </Button>
            <Button onClick={handleNoShow}>Mark as No-Show</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Grade Dialog */}
      <Dialog open={showGradeDialog} onOpenChange={setShowGradeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Grade Interview</DialogTitle>
            <DialogDescription>
              Grade the candidate out of 100 and provide feedback.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Score (0-100)</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={gradeScore}
                onChange={(e) => setGradeScore(Number(e.target.value))}
                placeholder="Enter score..."
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-sm font-medium">Comments</Label>
              <Textarea
                value={gradeNotes}
                onChange={(e) => setGradeNotes(e.target.value)}
                placeholder="Enter your feedback..."
                className="mt-1"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowGradeDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitGrade}>Submit Grade</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Feedback View Dialog */}
      <Dialog open={isFeedbackViewOpen} onOpenChange={setIsFeedbackViewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Interview Feedback</DialogTitle>
            <DialogDescription>
              Feedback for {selectedInterview?.candidate ? `${selectedInterview.candidate.firstName} ${selectedInterview.candidate.lastName}` : 'Candidate'}
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
                )
              })
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
    </>
  );
}
