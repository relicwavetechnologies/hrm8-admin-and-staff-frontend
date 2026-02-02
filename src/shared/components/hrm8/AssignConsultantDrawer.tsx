/**
 * Assign Consultant Drawer
 * Drawer component for assigning a consultant to a job
 */

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Badge } from '@/shared/components/ui/badge';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Separator } from '@/shared/components/ui/separator';
import { Loader2, Search, Users, CheckCircle, XCircle, Briefcase } from 'lucide-react';
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
  const [loading, setLoading] = useState(true);
  const [loadingConsultants, setLoadingConsultants] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [jobInfo, setJobInfo] = useState<JobAssignmentInfo | null>(null);
  const jobInfoRef = useRef<JobAssignmentInfo | null>(null);
  const [consultants, setConsultants] = useState<ConsultantForAssignment[]>([]);
  const [selectedConsultantId, setSelectedConsultantId] = useState<string>('');
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
      if (jobInfoRes.success && jobInfoRes.data) {
        setJobInfo(jobInfoRes.data);
        jobInfoRef.current = jobInfoRes.data;
      }
    } catch (error) {
      toast.error('Failed to load job info');
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  const loadConsultants = useCallback(
    async () => {
      try {
        const regionId = jobInfoRef.current?.job.regionId;
        if (!regionId) return;
        setLoadingConsultants(true);
        const consultantsRes = await jobAllocationService.getConsultantsForAssignment({
          regionId,
          role: roleFilter && roleFilter !== 'all' ? roleFilter : undefined,
          availability: availabilityFilter && availabilityFilter !== 'all' ? availabilityFilter : undefined,
          industry: industryFilter || undefined,
          language: languageFilter || undefined,
          search: debouncedSearch?.trim() ? debouncedSearch.trim() : undefined,
        });
        if (consultantsRes.success && consultantsRes.data) {
          setConsultants(consultantsRes.data.consultants);
        } else {
          setConsultants([]);
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
      setJobInfo(null);
      jobInfoRef.current = null;
    }
  }, [open, jobId, loadJobInfo]);

  // Reload consultants when filters or search change
  useEffect(() => {
    if (open && jobInfoRef.current) {
      loadConsultants();
    }
  }, [open, jobInfo?.job.id, roleFilter, availabilityFilter, industryFilter, languageFilter, loadConsultants, debouncedSearch]);

  const handleAssign = async (consultantId: string) => {
    if (!jobInfo) return;

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
      const response = await jobAllocationService.assignConsultant(jobId, consultantId);

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

  const handleAutoAssign = async () => {
    try {
      setAssigning(true);
      const response = await jobAllocationService.autoAssign(jobId);

      if (response.success) {
        if (response.data?.consultantId) {
          toast.success('Job auto-assigned successfully');
        } else {
          toast.warning('No suitable consultant found for auto-assignment');
        }
        onSuccess?.();
        onOpenChange(false);
      } else {
        toast.error(response.error || 'Failed to auto-assign job');
      }
    } catch (error) {
      toast.error('Failed to auto-assign job');
    } finally {
      setAssigning(false);
    }
  };

  // Client-side filtering removed as backend handles it
  const filteredConsultants = consultants;

  const selectedConsultant = consultants.find(c => c.id === selectedConsultantId);

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
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
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

              {/* Auto-assign Button */}
              <Button
                variant="outline"
                onClick={handleAutoAssign}
                disabled={assigning}
                className="w-full"
              >
                {assigning ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle className="mr-2 h-4 w-4" />
                )}
                Try Auto-Assignment
              </Button>

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
              </div>

              {/* Consultants List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>
                    Select Consultant
                    {searchQuery && (
                      <span className="text-sm text-muted-foreground ml-2">
                        ({filteredConsultants.length} of {consultants.length})
                      </span>
                    )}
                  </Label>
                  {loadingConsultants && (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                </div>
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {loadingConsultants ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                      Loading consultants...
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
                                  <Badge variant="secondary">{consultant.role}</Badge>
                                  <Badge variant={consultant.availability === 'AVAILABLE' ? 'default' : 'destructive'}>
                                    {consultant.availability}
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
                  disabled={!selectedConsultantId || assigning}
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
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Override Modal */}
      {jobInfo && (
        <AutoAssignmentOverrideModal
          open={showOverrideModal}
          onOpenChange={setShowOverrideModal}
          jobTitle={jobInfo.job.title}
          currentConsultantName={
            jobInfo.consultants.find(c => c.id === jobInfo.job.assignedConsultantId)?.firstName + ' ' +
            jobInfo.consultants.find(c => c.id === jobInfo.job.assignedConsultantId)?.lastName
          }
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




