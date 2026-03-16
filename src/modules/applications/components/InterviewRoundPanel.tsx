// @ts-nocheck
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { InterviewCalendarView } from '@/modules/interviews/components/InterviewCalendarViewNew';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { interviewService, Interview } from '@/shared/lib/interviewService';
import { videoInterviewService } from '@/shared/lib/videoInterviewService';
import { format } from 'date-fns';
import { 
  Calendar, 
  Clock, 
  Video, 
  Phone, 
  Users, 
  MapPin, 
  Loader2, 
  Plus,
  Filter,
  Search,
  BarChart3,
  Mail,
  CheckCircle2,
  CalendarClock
} from 'lucide-react';
import { toast } from 'sonner';
import { QuickScheduleInterviewDialog } from './QuickScheduleInterviewDialog';
import { InterviewerAssignmentPopover } from './InterviewerAssignmentPopover';
import { InterviewFeedbackBadge } from './InterviewFeedbackBadge';

interface InterviewRoundPanelProps {
  jobId: string;
  roundId: string;
  roundName: string;
  jobTitle?: string;
  onConfigureRound?: () => void;
}

export function InterviewRoundPanel({
  jobId,
  roundId,
  roundName,
  jobTitle,
  onConfigureRound,
}: InterviewRoundPanelProps) {
  
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'calendar' | 'list' | 'statistics'>('calendar');
  const [selectedInterviews, setSelectedInterviews] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
  
  // Dialog states
  const [showRescheduleDialog, setShowRescheduleDialog] = useState(false);
  const [showQuickSchedule, setShowQuickSchedule] = useState(false);
  const [scheduleTargetCandidate, setScheduleTargetCandidate] = useState<{ id: string; name: string } | null>(null);

  const loadInterviews = useCallback(async () => {
    setLoading(true);
    try {
      const response = await interviewService.getInterviews({
        jobId,
        jobRoundId: roundId,
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
  }, [jobId, roundId, statusFilter]);

  useEffect(() => {
    loadInterviews();
  }, [loadInterviews]);

  // Handle actions
  const handleMarkAsComplete = async (interview: Interview) => {
    try {
      let response;
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

  // Statistics
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

  // Filter Logic
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
        if (interview.candidateId?.toLowerCase().includes(query)) return true;
        if (interview.candidate) {
          const fullName = `${interview.candidate.firstName} ${interview.candidate.lastName}`.toLowerCase();
          if (fullName.includes(query)) return true;
          if (interview.candidate.email?.toLowerCase().includes(query)) return true;
        }
        return false;
      });
    }
    
    return filtered;
  }, [interviews, searchQuery, statusFilter]);

  // Grouping
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

  const toggleSelectAll = () => {
    if (selectedInterviews.size === filteredInterviews.length) {
      setSelectedInterviews(new Set());
    } else {
      setSelectedInterviews(new Set(filteredInterviews.map(i => i.id)));
    }
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-1">
         {/* Optional Header - Usually RoundDetailView handles the title, but if we want stats here */}
      </div>

      {/* Statistics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
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
           <Button 
             variant="outline" 
             size="sm" 
             onClick={() => {
               setScheduleTargetCandidate({ id: '', name: 'New Interview' });
               setShowQuickSchedule(true);
             }}
           >
             <Plus className="h-4 w-4 mr-2" />
             Schedule New
           </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
         <TabsList className="grid w-full grid-cols-3 md:w-[400px]">
            <TabsTrigger value="calendar">
              <Calendar className="mr-2 h-4 w-4" />
              Calendar
            </TabsTrigger>
             <TabsTrigger value="list">
              <Clock className="mr-2 h-4 w-4" />
              List
            </TabsTrigger>
             <TabsTrigger value="statistics">
              <BarChart3 className="mr-2 h-4 w-4" />
              Stats
            </TabsTrigger>
         </TabsList>

         <TabsContent value="calendar" className="mt-4">
             {loading ? (
                <div className="flex items-center justify-center p-12">
                   <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
             ) : (
                <InterviewCalendarView
                  jobId={jobId}
                  jobRoundId={roundId}
                  onInterviewClick={(interview) => {
                     toast.info(`Interview with ${interview.candidate?.firstName}`);
                  }}
                  onReschedule={() => {
                     toast.info("Reschedule feature");
                  }}
                />
             )}
         </TabsContent>

         <TabsContent value="list" className="mt-4">
            {loading ? (
               <div className="flex items-center justify-center p-12">
                   <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            ) : filteredInterviews.length === 0 ? (
               <Card>
                 <CardContent className="flex flex-col items-center justify-center py-12">
                   <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                   <p className="text-lg font-medium mb-2">No interviews found</p>
                 </CardContent>
               </Card>
            ) : (
               <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b">
                     <Checkbox
                        checked={selectedInterviews.size === filteredInterviews.length && filteredInterviews.length > 0}
                        onCheckedChange={toggleSelectAll}
                      />
                      <span className="text-sm text-muted-foreground">
                        Select all ({selectedInterviews.size})
                      </span>
                  </div>

                  {interviewsByCandidate.map(([candidateId, candidateInterviews]) => {
                       const candidate = candidateInterviews[0]?.candidate;
                       const candidateName = candidate 
                        ? `${candidate.firstName} ${candidate.lastName}`
                        : `Candidate ${candidateId.substring(0, 8)}...`;
                       const initials = candidate
                        ? `${candidate.firstName?.[0] || ''}${candidate.lastName?.[0] || ''}`.toUpperCase()
                        : '??';

                       return (
                         <Card key={candidateId} className="hover:shadow-md transition-all duration-200 border-l-4 border-l-primary/50">
                            <CardHeader className="pb-3">
                               <div className="flex items-start justify-between">
                                  <div className="flex items-center gap-4">
                                     <Avatar className="h-12 w-12 border-2 border-primary/20">
                                       <AvatarImage src={candidate?.photo} />
                                       <AvatarFallback className="bg-primary/10 text-primary">{initials}</AvatarFallback>
                                     </Avatar>
                                     <div>
                                        <CardTitle className="text-base font-semibold">{candidateName}</CardTitle>
                                        <CardDescription className="flex items-center gap-4 text-xs mt-1">
                                           {candidate?.email && (
                                             <span className="flex items-center gap-1">
                                               <Mail className="h-3 w-3" /> {candidate.email}
                                             </span>
                                           )}
                                        </CardDescription>
                                     </div>
                                  </div>
                                  {/* Quick Schedule Button */}
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-8 text-xs"
                                    onClick={() => {
                                      const interview = candidateInterviews[0];
                                      setScheduleTargetCandidate({
                                        id: interview.applicationId,
                                        name: candidateName,
                                      });
                                      setShowQuickSchedule(true);
                                    }}
                                  >
                                    <CalendarClock className="h-3.5 w-3.5 mr-1.5" />
                                    Schedule
                                  </Button>
                               </div>
                            </CardHeader>
                            <CardContent className="pb-3">
                               <div className="space-y-2">
                                  {candidateInterviews.map((interview) => (
                                     <div key={interview.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                                        <Checkbox
                                          checked={selectedInterviews.has(interview.id)}
                                          onCheckedChange={() => toggleInterviewSelection(interview.id)}
                                        />
                                        <div className="flex-1">
                                           <div className="flex items-center justify-between">
                                              <div className="flex items-center gap-2">
                                                 {getTypeIcon(interview.type || 'VIDEO')}
                                                 <span className="font-medium text-sm">
                                                    {format(new Date(interview.scheduledDate), 'MMM dd, yyyy HH:mm')}
                                                 </span>
                                                 <Badge className={getStatusColor(interview.status || 'SCHEDULED')} variant="outline">
                                                    {interview.status}
                                                  </Badge>
                                              </div>
                                              <div className="flex items-center gap-2">
                                                 {/* Interviewer Assignment */}
                                                 <InterviewerAssignmentPopover
                                                   interviewId={interview.id}
                                                   applicationId={interview.applicationId}
                                                   jobId={jobId}
                                                   roundId={roundId}
                                                   currentInterviewerIds={interview.interviewerIds || []}
                                                   onAssign={() => loadInterviews()}
                                                 />
                                                 {/* Feedback Badge for Completed Interviews */}
                                                 {interview.status === 'COMPLETED' && (
                                                   <InterviewFeedbackBadge
                                                     score={interview.overallScore}
                                                     recommendation={interview.recommendation}
                                                     feedbacks={interview.interviewFeedbacks?.map(f => ({
                                                       id: f.id,
                                                       interviewerName: f.interviewer_name,
                                                       overallRating: f.overall_rating,
                                                       recommendation: 'YES' as const,
                                                       notes: f.notes,
                                                       createdAt: f.createdAt,
                                                     })) || []}
                                                     totalInterviewers={interview.interviewerIds?.length || 1}
                                                     feedbackCount={interview.interviewFeedbacks?.length || 0}
                                                     interviewId={interview.id}
                                                     onViewFull={(id) => toast.info(`View full feedback for ${id}`)}
                                                   />
                                                 )}
                                                 {/* Complete Button */}
                                                 {interview.status === 'SCHEDULED' && (
                                                    <Button 
                                                      size="sm" 
                                                      variant="ghost" 
                                                      className="h-7 text-green-600 hover:text-green-700 hover:bg-green-50"
                                                      onClick={() => handleMarkAsComplete(interview)}
                                                    >
                                                       <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                                                       Complete
                                                    </Button>
                                                 )}
                                              </div>
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
      </Tabs>

      {/* Quick Schedule Dialog */}
      {scheduleTargetCandidate && (
        <QuickScheduleInterviewDialog
          open={showQuickSchedule}
          onOpenChange={setShowQuickSchedule}
          applicationId={scheduleTargetCandidate.id}
          candidateName={scheduleTargetCandidate.name}
          jobId={jobId}
          roundId={roundId}
          onSuccess={() => {
            loadInterviews();
            setScheduleTargetCandidate(null);
          }}
        />
      )}
    </div>
  );
}
