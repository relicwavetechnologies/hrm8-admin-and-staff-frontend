import { useState, useEffect } from 'react';
import { FormDrawer } from '@/shared/components/ui/form-drawer';
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import { Input } from '@/shared/components/ui/input';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { Badge } from '@/shared/components/ui/badge';
import { Calendar as CalendarIcon, Users, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';
import { OfficeHoursConfig, getOfficeHoursConfig } from './OfficeHoursConfig';
import { toast } from '@/shared/hooks/use-toast';
import { saveAIInterviewSession } from '@/shared/lib/aiInterview/aiInterviewStorage';
import { applicationService } from '@/shared/lib/applicationService';
import { videoInterviewService } from '@/shared/lib/videoInterviewService';
import { AISuggestionReviewDialog, type AISuggestion } from './AISuggestionReviewDialog';
import { v4 as uuidv4 } from 'uuid';
import type { Job } from '@/shared/types/job';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover';
import { Calendar } from '@/shared/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/shared/lib/utils';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { Info } from 'lucide-react';
import type { DateRange } from 'react-day-picker';

interface BulkScheduleDialogProps {
  job: Job;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScheduled?: () => void;
}

interface Applicant {
  id: string;
  applicationId: string;
  candidateId: string;
  name: string;
  email: string;
  status: string;
  hasScheduledInterview?: boolean;
  scheduledInterviewId?: string;
}

export function BulkScheduleDialog({ job, open, onOpenChange, onScheduled }: BulkScheduleDialogProps) {
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedApplicants, setSelectedApplicants] = useState<string[]>([]);
  const [scheduledDate, setScheduledDate] = useState('');
  const [isScheduling, setIsScheduling] = useState(false);

  // AI Auto-schedule states
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([]);
  const [showReviewDialog, setShowReviewDialog] = useState(false);

  // Preferred date range for AI scheduling (optional)
  const [preferredDateRange, setPreferredDateRange] = useState<DateRange | undefined>(undefined);

  // Fetch applications when dialog opens
  useEffect(() => {
    if (open) {
      loadApplications();
      // Reset selections when dialog opens
      setSelectedApplicants([]);
      setScheduledDate('');
      setAiSuggestions([]);
      setShowReviewDialog(false);
      setPreferredDateRange(undefined);
    }
  }, [open, job.id]);

  const loadApplications = async () => {
    setIsLoading(true);
    try {
      // Load applications and existing interviews in parallel
      const [applicationsResponse, interviewsResponse] = await Promise.all([
        applicationService.getJobApplications(job.id),
        videoInterviewService.getJobInterviews(job.id),
      ]);

      if (applicationsResponse.success && applicationsResponse.data) {
        // Get scheduled interviews
        const scheduledInterviews = interviewsResponse.success && interviewsResponse.data
          ? interviewsResponse.data.interviews.filter(i => i.status === 'SCHEDULED')
          : [];

        // Filter to only show candidates in interview phase
        const interviewPhaseApps = applicationsResponse.data.applications.filter(
          (app) => app.status?.toLowerCase() === 'interview'
        );

        // Map applications to applicant format
        const mappedApplicants: Applicant[] = interviewPhaseApps.map((app) => {
          // Extract candidate name from candidate object or use fields
          const candidateName = app.candidate
            ? `${app.candidate.firstName || ''} ${app.candidate.lastName || ''}`.trim()
            : app.candidateName || 'Unknown Candidate';

          const candidateEmail = app.candidate?.email || app.candidateEmail || '';

          // Check if this candidate already has a scheduled interview
          const existingInterview = scheduledInterviews.find(
            i => i.candidateId === app.candidateId || i.applicationId === app.id
          );

          return {
            id: app.candidateId,
            applicationId: app.id,
            candidateId: app.candidateId,
            name: candidateName,
            email: candidateEmail,
            status: app.status.toLowerCase() || 'interview',
            hasScheduledInterview: !!existingInterview,
            scheduledInterviewId: existingInterview?.id,
          };
        });
        setApplicants(mappedApplicants);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to load applications',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Failed to load applications:', error);
      toast({
        title: 'Error',
        description: 'Failed to load applications',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleApplicant = (applicantId: string) => {
    setSelectedApplicants(prev =>
      prev.includes(applicantId)
        ? prev.filter(id => id !== applicantId)
        : [...prev, applicantId]
    );
  };

  const handleSelectAll = () => {
    if (selectedApplicants.length === applicants.length) {
      setSelectedApplicants([]);
    } else {
      setSelectedApplicants(applicants.map(a => a.candidateId));
    }
  };

  const handleAIAutoSchedule = async () => {
    if (selectedApplicants.length === 0) {
      toast({
        title: 'No applicants selected',
        description: 'Please select at least one applicant to schedule interviews',
        variant: 'destructive',
      });
      return;
    }

    setIsGeneratingSuggestions(true);

    try {
      // Get office hours configuration from backend
      const officeHours = await getOfficeHoursConfig();

      // Get existing scheduled interviews to avoid conflicts
      await videoInterviewService.getJobInterviews(job.id);


      // Get current date/time
      const now = new Date();

      // Build preferred time slots from office hours
      const preferredTimeSlots = officeHours.workDays.length > 0
        ? [`${officeHours.startTime}-${officeHours.endTime}`]
        : undefined;

      // Use preferred date range if provided, otherwise use current time as start
      const startDate = preferredDateRange?.from
        ? preferredDateRange.from.toISOString()
        : now.toISOString();

      const endDate = preferredDateRange?.to
        ? preferredDateRange.to.toISOString()
        : undefined; // If no end date, AI will schedule based on existing interviews

      const response = await videoInterviewService.generateAISuggestions({
        jobId: job.id,
        candidateIds: selectedApplicants,
        preferredDuration: 60,
        preferredTimeSlots,
        preferredDays: officeHours.workDays,
        timezone: officeHours.timezone,
        startDate: startDate, // Preferred start date or current time
        endDate: endDate, // Preferred end date (optional)
      });

      if (response.success && response.data) {
        // Map suggestions to include candidate info
        const mappedSuggestions: AISuggestion[] = response.data.suggestions.map(suggestion => {
          const applicant = applicants.find(a => a.candidateId === suggestion.candidateId);
          return {
            ...suggestion,
            candidateName: applicant?.name,
            candidateEmail: applicant?.email,
          };
        });

        setAiSuggestions(mappedSuggestions);
        setShowReviewDialog(true);
      } else {
        throw new Error(response.error || 'Failed to generate AI suggestions');
      }
    } catch (error) {
      console.error('Failed to generate AI suggestions:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to generate AI suggestions',
        variant: 'destructive',
      });
    } finally {
      setIsGeneratingSuggestions(false);
    }
  };

  const handleSchedule = async () => {
    if (selectedApplicants.length === 0) {
      toast({
        title: 'No applicants selected',
        description: 'Please select at least one applicant to schedule interviews',
        variant: 'destructive',
      });
      return;
    }

    if (!scheduledDate) {
      toast({
        title: 'Date required',
        description: 'Please select a date and time for the interviews',
        variant: 'destructive',
      });
      return;
    }

    setIsScheduling(true);

    // Schedule interviews for selected applicants
    const scheduledInterviews = selectedApplicants.map((candidateId) => {
      const applicant = applicants.find(a => a.candidateId === candidateId);
      if (!applicant) return null;

      return {
        id: uuidv4(),
        candidateId: applicant.candidateId,
        applicationId: applicant.applicationId,
        candidateName: applicant.name,
        candidateEmail: applicant.email,
        jobId: job.id,
        jobTitle: job.title,
        status: 'scheduled' as const,
        scheduledDate,
        interviewMode: job.aiInterviewConfig?.defaultMode || 'text' as const,
        questionSource: job.aiInterviewConfig?.questionSource || 'hybrid' as const,
        questions: [],
        currentQuestionIndex: 0,
        transcript: [],
        invitationToken: uuidv4(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'current-user',
      };
    }).filter(Boolean);

    // Save all interviews
    scheduledInterviews.forEach(interview => {
      if (interview) saveAIInterviewSession(interview);
    });

    toast({
      title: 'Interviews scheduled',
      description: `Successfully scheduled ${scheduledInterviews.length} AI interviews`,
    });

    setIsScheduling(false);
    onOpenChange(false);
    onScheduled?.();
  };

  const minDate = new Date().toISOString().slice(0, 16);

  return (
    <>
      <FormDrawer
        open={open}
        onOpenChange={onOpenChange}
        title="Bulk Schedule AI Interviews"
        description={`Schedule AI interviews for multiple applicants at once for ${job.title}`}
        width="lg"
      >
        <div className="space-y-6">
          {/* Office Hours Configuration */}
          <div className="flex justify-end">
            <OfficeHoursConfig />
          </div>

          {/* Scheduling Options */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-1 border-t" />
              <span className="text-sm text-muted-foreground">OR</span>
              <div className="flex-1 border-t" />
            </div>

            {/* AI Auto-Schedule Option */}
            <div className="border rounded-lg p-4 space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <Label className="text-base font-semibold">AI Auto-Schedule</Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Let AI analyze candidate profiles and suggest optimal interview times for each candidate
              </p>

              {/* Preferred Date Range (Optional) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="preferredDateRange" className="text-sm">
                    Preferred Date Range <span className="text-muted-foreground font-normal">(Optional)</span>
                  </Label>
                  {preferredDateRange?.from && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPreferredDateRange(undefined)}
                      className="h-auto p-1 text-xs"
                    >
                      Clear
                    </Button>
                  )}
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="preferredDateRange"
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !preferredDateRange?.from && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {preferredDateRange?.from ? (
                        preferredDateRange.to ? (
                          <>
                            {format(preferredDateRange.from, "LLL dd, y")} -{" "}
                            {format(preferredDateRange.to, "LLL dd, y")}
                          </>
                        ) : (
                          format(preferredDateRange.from, "LLL dd, y")
                        )
                      ) : (
                        <span>Select preferred date range (optional)</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={preferredDateRange?.from}
                      selected={preferredDateRange}
                      onSelect={setPreferredDateRange}
                      numberOfMonths={2}
                      disabled={(date) => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        return date < today;
                      }}
                    />
                  </PopoverContent>
                </Popover>
                {preferredDateRange?.from && preferredDateRange?.to && (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      AI will schedule interviews between {format(preferredDateRange.from, "MMM dd, yyyy")} and {format(preferredDateRange.to, "MMM dd, yyyy")}
                    </AlertDescription>
                  </Alert>
                )}
                {!preferredDateRange && (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      If no date range is selected, AI will schedule based on existing interviews, company working hours, and availability.
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              <Button
                onClick={handleAIAutoSchedule}
                disabled={isGeneratingSuggestions || selectedApplicants.length === 0}
                className="w-full"
              >
                {isGeneratingSuggestions ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating AI Suggestions...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Auto-Schedule with AI
                  </>
                )}
              </Button>
            </div>

            {/* Manual Schedule Option */}
            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <Label className="text-base font-semibold">Manual Schedule</Label>
              </div>
              <div className="space-y-2">
                <Label htmlFor="scheduledDate">
                  Interview Date & Time
                </Label>
                <Input
                  id="scheduledDate"
                  type="datetime-local"
                  min={minDate}
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  All selected applicants will receive interview invitations for this time
                </p>
              </div>
            </div>
          </div>

          {/* Applicant Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label>
                  <Users className="h-4 w-4 inline mr-2" />
                  Select Applicants ({selectedApplicants.length} selected)
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Only candidates in interview phase are shown. Candidates with scheduled interviews are marked with a badge.
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={handleSelectAll} disabled={isLoading || applicants.length === 0}>
                {selectedApplicants.length === applicants.length ? 'Deselect All' : 'Select All'}
              </Button>
            </div>

            <ScrollArea className="h-[300px] border rounded-lg p-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-sm text-muted-foreground">Loading applicants...</span>
                </div>
              ) : applicants.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Users className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">No applicants found for this job</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {applicants.map((applicant) => (
                    <div
                      key={applicant.id}
                      className={`flex items-center space-x-3 p-3 border rounded-lg hover:bg-accent transition-colors ${applicant.hasScheduledInterview ? 'bg-blue-50 dark:bg-blue-950/20' : ''
                        }`}
                    >
                      <Checkbox
                        id={applicant.candidateId}
                        checked={selectedApplicants.includes(applicant.candidateId)}
                        onCheckedChange={() => handleToggleApplicant(applicant.candidateId)}
                        disabled={applicant.hasScheduledInterview}
                      />
                      <label
                        htmlFor={applicant.candidateId}
                        className="flex-1 cursor-pointer"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium flex items-center gap-2">
                              {applicant.name}
                              {applicant.hasScheduledInterview && (
                                <Badge variant="default" className="text-xs">
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                  Scheduled
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground">{applicant.email}</div>
                          </div>
                          {!applicant.hasScheduledInterview && (
                            <Badge variant="secondary" className="capitalize">
                              {applicant.status}
                            </Badge>
                          )}
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Interview Configuration Info */}
          {job.aiInterviewConfig && (
            <div className="bg-muted/50 p-4 rounded-lg space-y-2 text-sm">
              <p className="font-medium">Interview Configuration:</p>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Mode: <span className="capitalize">{job.aiInterviewConfig.defaultMode}</span></li>
                <li>• Questions: {job.aiInterviewConfig.questionSource === 'predefined' ? 'Predefined' : job.aiInterviewConfig.questionSource === 'ai-generated' ? 'AI-Generated' : 'Hybrid'}</li>
                {job.aiInterviewConfig.defaultQuestions && job.aiInterviewConfig.defaultQuestions.length > 0 && (
                  <li>• {job.aiInterviewConfig.defaultQuestions.length} default question(s) configured</li>
                )}
              </ul>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSchedule} disabled={isScheduling || !scheduledDate}>
              {isScheduling ? 'Scheduling...' : `Schedule ${selectedApplicants.length} Interview${selectedApplicants.length !== 1 ? 's' : ''}`}
            </Button>
          </div>
        </div>
      </FormDrawer>

      {/* AI Suggestion Review Dialog */}
      {showReviewDialog && aiSuggestions.length > 0 && (
        <AISuggestionReviewDialog
          open={showReviewDialog}
          onOpenChange={(open) => {
            setShowReviewDialog(open);
            if (!open) {
              // When review dialog closes, also close main dialog if interviews were finalized
              // The onFinalized callback will handle refreshing the list
            }
          }}
          suggestions={aiSuggestions}
          jobId={job.id}
          jobTitle={job.title}
          onFinalized={() => {
            onScheduled?.();
            onOpenChange(false);
          }}
        />
      )}
    </>
  );
}
