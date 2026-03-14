/**
 * Assign Consultant to Request Dialog
 * Dialog for assigning a consultant to a pending ConsultantAssignmentRequest
 */

import { useState, useEffect, useCallback } from 'react';
import { useDebounce } from '@/shared/hooks/use-debounce';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Badge } from '@/shared/components/ui/badge';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { Loader2, Search, Users, CheckCircle } from 'lucide-react';
import { jobAllocationService, ConsultantForAssignment } from '@/shared/services/hrm8/jobAllocationService';
import { consultantAssignmentRequestService } from '@/shared/services/hrm8/consultantAssignmentRequestService';
import { toast } from 'sonner';

interface AssignConsultantToRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requestId: string;
  jobTitle: string;
  companyName: string;
  regionId: string | null;
  onSuccess?: () => void;
}

type ConsultantScope = 'region' | 'all';

export function AssignConsultantToRequestDialog({
  open,
  onOpenChange,
  requestId,
  jobTitle,
  companyName,
  regionId,
  onSuccess,
}: AssignConsultantToRequestDialogProps) {
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [consultants, setConsultants] = useState<ConsultantForAssignment[]>([]);
  const [selectedConsultantId, setSelectedConsultantId] = useState<string>('');
  const [consultantScope, setConsultantScope] = useState<ConsultantScope>(
    regionId ? 'region' : 'all'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);

  const effectiveRegionId = consultantScope === 'all' ? 'all' : (regionId || 'all');

  const loadConsultants = useCallback(async () => {
    if (!effectiveRegionId) return;
    try {
      setLoading(true);
      const res = await jobAllocationService.getConsultantsForAssignment({
        regionId: effectiveRegionId,
        search: debouncedSearch?.trim() || undefined,
        limit: 25,
        offset: 0,
      });
      if (res.success && res.data?.consultants) {
        setConsultants(res.data.consultants);
      } else {
        setConsultants([]);
      }
    } catch {
      setConsultants([]);
      toast.error('Failed to load consultants');
    } finally {
      setLoading(false);
    }
  }, [effectiveRegionId, debouncedSearch]);

  useEffect(() => {
    if (open) {
      loadConsultants();
      setSelectedConsultantId('');
    }
  }, [open, loadConsultants]);

  const handleAssign = async () => {
    if (!selectedConsultantId) return;
    try {
      setAssigning(true);
      const res = await consultantAssignmentRequestService.assign(
        requestId,
        selectedConsultantId,
        consultantScope === 'all'
      );
      if (res.success) {
        toast.success('Consultant assigned successfully');
        onSuccess?.();
        onOpenChange(false);
      } else {
        toast.error(res.error || 'Failed to assign consultant');
      }
    } catch {
      toast.error('Failed to assign consultant');
    } finally {
      setAssigning(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Assign Consultant</DialogTitle>
          <DialogDescription>
            Select a consultant for {companyName} – {jobTitle}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Scope toggle */}
          <div className="space-y-2">
            <Label>Consultant scope</Label>
            <Select
              value={consultantScope}
              onValueChange={(v) => setConsultantScope(v as ConsultantScope)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="region" disabled={!regionId}>
                  Job&apos;s region only
                </SelectItem>
                <SelectItem value="all">All regions (global)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Search */}
          <div className="space-y-2">
            <Label>Search consultants</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Consultants list */}
          <div className="space-y-2">
            <Label>Select consultant</Label>
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : consultants.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No consultants found
              </p>
            ) : (
              <div className="space-y-2 max-h-[280px] overflow-y-auto">
                {consultants.map((c) => {
                  const isSelected = selectedConsultantId === c.id;
                  const workloadPercent =
                    c.maxJobs > 0 ? (c.currentJobs / c.maxJobs) * 100 : 0;
                  return (
                    <Card
                      key={c.id}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'border-primary bg-primary/5' : ''
                      }`}
                      onClick={() => setSelectedConsultantId(c.id)}
                    >
                      <CardContent className="py-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">
                                {c.firstName} {c.lastName}
                              </span>
                              {isSelected && (
                                <CheckCircle className="h-4 w-4 text-primary" />
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{c.email}</p>
                            <div className="flex gap-2 mt-1">
                              <Badge variant="secondary" className="text-xs">
                                {c.role || 'CONSULTANT'}
                              </Badge>
                              <Badge
                                variant={
                                  c.availability === 'AVAILABLE' ? 'default' : 'secondary'
                                }
                                className="text-xs"
                              >
                                {c.currentJobs}/{c.maxJobs} jobs
                              </Badge>
                            </div>
                            <div className="w-full bg-secondary rounded-full h-1.5 mt-1.5">
                              <div
                                className="h-1.5 rounded-full bg-primary"
                                style={{
                                  width: `${Math.min(workloadPercent, 100)}%`,
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleAssign}
            disabled={!selectedConsultantId || assigning}
          >
            {assigning ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Users className="mr-2 h-4 w-4" />
            )}
            Assign
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
