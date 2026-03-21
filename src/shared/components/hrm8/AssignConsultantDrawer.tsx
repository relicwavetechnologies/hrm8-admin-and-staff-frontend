/**
 * Assign Consultant Drawer
 * Drawer component for assigning a consultant to a job
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDebounce } from '@/shared/hooks/use-debounce';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/shared/components/ui/sheet';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Badge } from '@/shared/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/shared/components/ui/alert';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Separator } from '@/shared/components/ui/separator';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { Loader2, Search, Users, CheckCircle, Briefcase, AlertTriangle } from 'lucide-react';
import { jobAllocationService, ConsultantForAssignment, JobAssignmentInfo } from '@/shared/services/hrm8/jobAllocationService';
import { toast } from 'sonner';
import { AutoAssignmentOverrideModal } from './AutoAssignmentOverrideModal';

interface AssignConsultantDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobId: string;
  onSuccess?: () => void;
}

export function AssignConsultantDrawer({
  open,
  onOpenChange,
  jobId,
  onSuccess,
}: AssignConsultantDrawerProps) {
  const navigate = useNavigate();
  const CONSULTANTS_PAGE_SIZE = 10;
  const [loading, setLoading] = useState(true);
  const [loadingConsultants, setLoadingConsultants] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [jobInfo, setJobInfo] = useState<JobAssignmentInfo | null>(null);
  const jobInfoRef = useRef<JobAssignmentInfo | null>(null);
  const [consultants, setConsultants] = useState<ConsultantForAssignment[]>([]);
  const [consultantsTotal, setConsultantsTotal] = useState(0);
  const [consultantsOffset, setConsultantsOffset] = useState(0);
  const [hasMoreConsultants, setHasMoreConsultants] = useState(false);
  const [selectedConsultantId, setSelectedConsultantId] = useState<string>('');
  const [reassignmentReason, setReassignmentReason] = useState('');
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [pendingConsultantId, setPendingConsultantId] = useState<string>('');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('all');
  const [industryFilter, setIndustryFilter] = useState<string>('');
  const [languageFilter, setLanguageFilter] = useState<string>('');

  const debouncedSearch = useDebounce(searchQuery, 300);

  const loadJobInfo = useCallback(async () => {
    try {
      setLoading(true);
      const jobInfoRes = await jobAllocationService.getAssignmentInfo(jobId);
      if (jobInfoRes.success && jobInfoRes.data?.job) {
        setJobInfo(jobInfoRes.data);
        jobInfoRef.current = jobInfoRes.data;
      } else {
        setJobInfo(null);
        jobInfoRef.current = null;
        toast.error(jobInfoRes.error || 'Failed to load job info');
      }
    } catch (error) {
      toast.error('Failed to load job info');
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  const loadConsultants = useCallback(
    async (append = false, nextOffset?: number) => {
      try {
        const regionId = jobInfoRef.current?.job.regionId;
        if (!regionId) return;
        setLoadingConsultants(true);
        const offset = append ? (nextOffset ?? consultantsOffset) : 0;
        const consultantsRes = await jobAllocationService.getConsultantsForAssignment({
          regionId,
          role: roleFilter && roleFilter !== 'all' ? roleFilter : undefined,
          availability: availabilityFilter && availabilityFilter !== 'all' ? availabilityFilter : undefined,
          industry: industryFilter || undefined,
          language: languageFilter || undefined,
          search: debouncedSearch?.trim() ? debouncedSearch.trim() : undefined,
          limit: CONSULTANTS_PAGE_SIZE,
          offset,
        });
        if (consultantsRes.success) {
          const nextConsultants = consultantsRes.data?.consultants ?? [];
          setConsultants((prev) => (append ? [...prev, ...nextConsultants] : nextConsultants));
          setConsultantsTotal(consultantsRes.data?.total ?? nextConsultants.length);
          setHasMoreConsultants(Boolean(consultantsRes.data?.hasMore));
          setConsultantsOffset(offset + nextConsultants.length);
        } else {
          setConsultants([]);
          setConsultantsTotal(0);
          setHasMoreConsultants(false);
          setConsultantsOffset(0);
        }
      } catch (error) {
        toast.error('Failed to load consultants');
      } finally {
        setLoadingConsultants(false);
      }
    },
    [availabilityFilter, industryFilter, languageFilter, roleFilter, debouncedSearch]
  );

  useEffect(() => {
    if (open && jobId) {
      loadJobInfo();
    } else {
      // Reset state when drawer closes
      setSelectedConsultantId('');
      setSearchQuery('');
      setRoleFilter('all');
      setAvailabilityFilter('all');
      setIndustryFilter('');
      setLanguageFilter('');
      setConsultants([]);
      setConsultantsTotal(0);
      setConsultantsOffset(0);
      setHasMoreConsultants(false);
      setReassignmentReason('');
      setJobInfo(null);
      jobInfoRef.current = null;
    }
  }, [open, jobId, loadJobInfo]);

  // Reload consultants when filters or search change
  useEffect(() => {
    if (open && jobInfoRef.current) {
      setConsultants([]);
      setConsultantsTotal(0);
      setConsultantsOffset(0);
      setHasMoreConsultants(false);
      loadConsultants(false);
    }
  }, [open, jobInfo?.job.id, roleFilter, availabilityFilter, industryFilter, languageFilter, loadConsultants, debouncedSearch]);

  const handleLoadMoreConsultants = async () => {
    await loadConsultants(true, consultantsOffset);
  };

  const handleAssign = async (consultantId: string) => {
    if (!jobInfo) return;
    const isReassignment = Boolean(
      jobInfo.job.assignedConsultantId && jobInfo.job.assignedConsultantId !== consultantId
    );

    if (isReassignment && !reassignmentReason.trim()) {
      toast.error('Reason is required for reassignment');
      return;
    }

    // Check if job is auto-assigned
    if (jobInfo.job.assignmentSource === 'AUTO_RULES' && jobInfo.job.assignedConsultantId) {
      setPendingConsultantId(consultantId);
      setShowOverrideModal(true);
      return;
    }

    await performAssignment(consultantId);
  };

  const performAssignment = async (consultantId: string) => {
    try {
      setAssigning(true);
      const response = await jobAllocationService.assignConsultant(
        jobId,
        consultantId,
        undefined,
        reassignmentReason.trim() || undefined
      );

      if (response.success) {
        toast.success('Consultant assigned successfully');
        onSuccess?.();
        onOpenChange(false);
      } else {
        toast.error(response.error || 'Failed to assign consultant');
      }
    } catch (error) {
      toast.error('Failed to assign consultant');
    } finally {
      setAssigning(false);
    }
  };

  const handleOverrideConfirm = () => {
    setShowOverrideModal(false);
    if (pendingConsultantId) {
      performAssignment(pendingConsultantId);
      setPendingConsultantId('');
    }
  };

  // Client-side filtering removed as backend handles it
  const filteredConsultants = consultants ?? [];
  const isReassignmentFlow = Boolean(
    jobInfo?.job.assignedConsultantId &&
    selectedConsultantId &&
    selectedConsultantId !== jobInfo.job.assignedConsultantId
  );
  const currentConsultant = jobInfo?.consultants.find(c => c.id === jobInfo?.job.assignedConsultantId);
  const nextConsultant = filteredConsultants.find(c => c.id === selectedConsultantId);
  const requiresReason = isReassignmentFlow;
  const canSubmitAssign = Boolean(selectedConsultantId) && !assigning && (!requiresReason || Boolean(reassignmentReason.trim()));
  const requiresManagedReview = Boolean(
    jobInfo?.job.managementType === 'hrm8-managed' &&
    jobInfo?.job.assignmentRequestId
  );

  const openManagedReview = () => {
    if (!jobInfo?.job.assignmentRequestId) return;
    onOpenChange(false);
    navigate(
      `/hrm8/job-board/job/${jobId}?tab=managed&assignmentRequestId=${jobInfo.job.assignmentRequestId}&source=job-allocation`
    );
  };


  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Assign Consultant</SheetTitle>
            <SheetDescription>
              Select a consultant to assign to this job
            </SheetDescription>
          </SheetHeader>

          {loading ? (
            <div className="space-y-6 mt-6">
              <div className="space-y-2">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-80" />
              </div>
              <Skeleton className="h-10 w-full rounded-lg" />
              <div className="space-y-3">
                <Skeleton className="h-10 w-full rounded-lg" />
                <div className="grid grid-cols-2 gap-4">
                  <Skeleton className="h-10 w-full rounded-lg" />
                  <Skeleton className="h-10 w-full rounded-lg" />
                </div>
              </div>
              <div className="space-y-3">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-20 w-full rounded-lg" />
                <Skeleton className="h-20 w-full rounded-lg" />
                <Skeleton className="h-20 w-full rounded-lg" />
              </div>
            </div>
          ) : (
            <div className="space-y-6 mt-6">
              {/* Job Info */}
              {jobInfo && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <Briefcase className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div className="flex-1">
                        <h3 className="font-semibold">{jobInfo.job.title}</h3>
                        {jobInfo.job.assignedConsultantId && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Currently assigned to: {jobInfo.consultants.find(c => c.id === jobInfo.job.assignedConsultantId)?.firstName} {jobInfo.consultants.find(c => c.id === jobInfo.job.assignedConsultantId)?.lastName}
                          </p>
                        )}
                        {jobInfo.job.assignmentSource === 'AUTO_RULES' && (
                          <Badge variant="default" className="mt-2">
                            Auto-assigned
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {requiresManagedReview ? (
                <div className="space-y-4">
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Review required for managed jobs</AlertTitle>
                    <AlertDescription>
                      HRM8 Managed Recruitment jobs must be reviewed from the dedicated job detail page before consultant confirmation or reassignment.
                    </AlertDescription>
                  </Alert>
                  <Button className="w-full" onClick={openManagedReview}>
                    <Users className="mr-2 h-4 w-4" />
                    Open review page
                  </Button>
                </div>
              ) : (
                <>
              <Separator />

              {/* Filters */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Search Consultants</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name or email..."
                      value={searchQuery}
                      onChange={(e) => {
                        const value = e.target.value;
                        setSearchQuery(value);
                      }}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Role</Label>
                    <Select value={roleFilter} onValueChange={setRoleFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All roles" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All roles</SelectItem>
                        <SelectItem value="RECRUITER">Recruiter</SelectItem>
                        <SelectItem value="CONSULTANT_360">360 Consultant</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Availability</Label>
                    <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="AVAILABLE">Available</SelectItem>
                        <SelectItem value="AT_CAPACITY">At Capacity</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {isReassignmentFlow && (
                  <Alert variant="destructive" className="border-amber-300 text-amber-900 dark:text-amber-100 dark:border-amber-700">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Reassignment warning</AlertTitle>
                    <AlertDescription>
                      <p>
                        You are reassigning this job from <strong>{currentConsultant ? `${currentConsultant.firstName} ${currentConsultant.lastName}` : 'current consultant'}</strong> to <strong>{nextConsultant ? `${nextConsultant.firstName} ${nextConsultant.lastName}` : 'selected consultant'}</strong>.
                      </p>
                      <p className="mt-2">
                        Outcome: pipeline stage/progress will continue, ownership will move, workload will be shifted, and both consultants will be notified with your reason.
                      </p>
                    </AlertDescription>
                  </Alert>
                )}

                {isReassignmentFlow && (
                  <div className="space-y-2">
                    <Label>Reason for reassignment</Label>
                    <Textarea
                      placeholder="Mention why this job is being reassigned..."
                      value={reassignmentReason}
                      onChange={(e) => setReassignmentReason(e.target.value)}
                      rows={3}
                    />
                  </div>
                )}
              </div>

              {/* Consultants List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>
                    Select Consultant
                    {searchQuery && (
                      <span className="text-sm text-muted-foreground ml-2">
                        ({filteredConsultants.length} of {consultantsTotal || consultants.length})
                      </span>
                    )}
                  </Label>
                  {loadingConsultants && (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                </div>
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {loadingConsultants ? (
                    <div className="space-y-3 py-2">
                      <Skeleton className="h-20 w-full rounded-lg" />
                      <Skeleton className="h-20 w-full rounded-lg" />
                      <Skeleton className="h-20 w-full rounded-lg" />
                    </div>
                  ) : filteredConsultants.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      {searchQuery ? 'No consultants match your search' : 'No consultants found'}
                    </div>
                  ) : (
                    filteredConsultants.map((consultant) => {
                      const workloadPercent = consultant.maxJobs > 0
                        ? (consultant.currentJobs / consultant.maxJobs) * 100
                        : 0;
                      const isSelected = selectedConsultantId === consultant.id;

                      return (
                        <Card
                          key={consultant.id}
                          className={`cursor-pointer transition-colors ${isSelected ? 'border-primary bg-primary/5' : ''
                            }`}
                          onClick={() => setSelectedConsultantId(consultant.id)}
                        >
                          <CardContent className="pt-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-semibold">
                                    {consultant.firstName} {consultant.lastName}
                                  </h4>
                                  {isSelected && (
                                    <CheckCircle className="h-4 w-4 text-primary" />
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {consultant.email}
                                </p>
                                <div className="flex flex-wrap gap-2 mt-2">
                                  <Badge variant="secondary">{consultant.role || 'CONSULTANT'}</Badge>
                                  <Badge variant={consultant.availability === 'AVAILABLE' ? 'default' : 'destructive'}>
                                    {consultant.availability || 'AVAILABLE'}
                                  </Badge>
                                </div>
                                <div className="mt-2 text-sm">
                                  <p className="text-muted-foreground">
                                    Workload: {consultant.currentJobs}/{consultant.maxJobs} jobs
                                  </p>
                                  <div className="w-full bg-secondary rounded-full h-2 mt-1">
                                    <div
                                      className={`h-2 rounded-full ${workloadPercent >= 100
                                        ? 'bg-red-500'
                                        : workloadPercent >= 80
                                          ? 'bg-yellow-500'
                                          : 'bg-green-500'
                                        }`}
                                      style={{ width: `${Math.min(workloadPercent, 100)}%` }}
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })
                  )}
                </div>
                {!loadingConsultants && hasMoreConsultants && filteredConsultants.length > 0 && (
                  <div className="pt-2">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={handleLoadMoreConsultants}
                    >
                      Load more consultants
                    </Button>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => selectedConsultantId && handleAssign(selectedConsultantId)}
                  disabled={!canSubmitAssign}
                  className="flex-1"
                >
                  {assigning ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Users className="mr-2 h-4 w-4" />
                  )}
                  Assign Consultant
                </Button>
              </div>
                </>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Override Modal */}
      {jobInfo && (
        <AutoAssignmentOverrideModal
          open={showOverrideModal}
          onOpenChange={setShowOverrideModal}
          currentConsultantName={(() => {
            const c = jobInfo.consultants.find(c => c.id === jobInfo.job.assignedConsultantId);
            return c ? `${c.firstName} ${c.lastName}` : 'Unknown';
          })()}
          onConfirm={handleOverrideConfirm}
          onCancel={() => {
            setShowOverrideModal(false);
            setPendingConsultantId('');
          }}
        />
      )}
    </>
  );
}
