import { useEffect, useMemo, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { careersRequestService, CareersRequest, CareersContent } from '@/shared/services/hrm8/careersRequestService';
import { Hrm8PageLayout } from '@/shared/components/layouts/Hrm8PageLayout';
import { useToast } from '@/shared/hooks/use-toast';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { Textarea } from '@/shared/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import {
  ArrowRightLeft,
  Building2,
  CheckCircle2,
  Clock3,
  Image as ImageIcon,
  Loader2,
  Sparkles,
  XCircle,
} from 'lucide-react';

const sectionLabels: Record<string, string> = {
  logoUrl: 'Logo',
  bannerUrl: 'Banner',
  about: 'About',
  social: 'Social',
  images: 'Gallery',
};

function getChangedSections(pending: CareersContent | null): string[] {
  if (!pending) return [];
  const changed: string[] = [];
  if (pending.logoUrl !== undefined) changed.push('logoUrl');
  if (pending.bannerUrl !== undefined) changed.push('bannerUrl');
  if (pending.about !== undefined) changed.push('about');
  if (pending.social !== undefined) changed.push('social');
  if (pending.images !== undefined) changed.push('images');
  return changed;
}

function formatSubmittedAt(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return formatDistanceToNow(date, { addSuffix: true });
}

function MediaPreview({ src, alt, className }: { src?: string | null; alt: string; className?: string }) {
  if (!src) {
    return (
      <div className={`rounded-xl border border-dashed border-muted-foreground/30 bg-muted/40 ${className || ''}`}>
        <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">Not set</div>
      </div>
    );
  }
  return <img src={src} alt={alt} className={`rounded-xl border object-cover ${className || ''}`} />;
}

function FieldComparison({
  label,
  currentValue,
  pendingValue,
}: {
  label: string;
  currentValue?: string | null;
  pendingValue?: string | null;
}) {
  return (
    <div className="rounded-xl border">
      <div className="border-b px-4 py-2 text-sm font-medium">{label}</div>
      <div className="grid gap-0 md:grid-cols-2">
        <div className="border-b px-4 py-3 md:border-b-0 md:border-r">
          <p className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">Current</p>
          <p className="text-sm whitespace-pre-wrap">{currentValue || 'Not set'}</p>
        </div>
        <div className="px-4 py-3">
          <p className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">Pending</p>
          <p className="text-sm whitespace-pre-wrap">{pendingValue || 'Not set'}</p>
        </div>
      </div>
    </div>
  );
}

export default function CareersRequestsPage() {
  const { toast } = useToast();
  const [requests, setRequests] = useState<CareersRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<CareersRequest | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [requestToReject, setRequestToReject] = useState<CareersRequest | null>(null);

  useEffect(() => {
    loadRequests();
  }, []);

  const summary = useMemo(() => {
    const total = requests.length;
    const newPages = requests.filter((request) => request.type === 'NEW_PAGE').length;
    const totalChangedSections = requests.reduce((sum, request) => sum + getChangedSections(request.pending).length, 0);
    const avgChangedSections = total === 0 ? 0 : Math.round((totalChangedSections / total) * 10) / 10;
    return { total, newPages, totalChangedSections, avgChangedSections };
  }, [requests]);

  const loadRequests = async () => {
    setIsLoading(true);
    try {
      const data = await careersRequestService.getRequests();
      setRequests(Array.isArray(data?.requests) ? data.requests : []);
    } catch (_error) {
      toast({
        title: 'Error',
        description: 'Failed to load careers requests',
        variant: 'destructive',
      });
      setRequests([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (request: CareersRequest, section?: string) => {
    setProcessingId(request.id);
    try {
      await careersRequestService.approve(request.id, section);
      toast({
        title: 'Approved',
        description: section
          ? `${sectionLabels[section] || section} section approved`
          : 'Careers page approved',
      });
      await loadRequests();
      setSelectedRequest(null);
    } catch (_error) {
      toast({
        title: 'Error',
        description: 'Failed to approve request',
        variant: 'destructive',
      });
    } finally {
      setProcessingId(null);
    }
  };

  const openRejectDialog = (request: CareersRequest) => {
    setRequestToReject(request);
    setRejectReason('');
    setRejectDialogOpen(true);
  };

  const handleReject = async () => {
    if (!requestToReject || !rejectReason.trim()) return;

    setProcessingId(requestToReject.id);
    try {
      await careersRequestService.reject(requestToReject.id, rejectReason.trim());
      toast({
        title: 'Rejected',
        description: 'Feedback sent to company admin',
      });
      await loadRequests();
      setRejectDialogOpen(false);
      setSelectedRequest(null);
    } catch (_error) {
      toast({
        title: 'Error',
        description: 'Failed to reject request',
        variant: 'destructive',
      });
    } finally {
      setProcessingId(null);
      setRequestToReject(null);
    }
  };

  return (
    <Hrm8PageLayout
      title="Careers Review Queue"
      subtitle="Review submitted company careers updates and publish only launch-ready experiences"
      actions={
        <Badge variant="secondary" className="text-base px-4 py-2">
          <Clock3 className="h-4 w-4 mr-2" />
          {summary.total} In Review
        </Badge>
      }
    >
      <div className="p-6 space-y-6">
        <section className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Submitted</p>
              <p className="mt-2 text-2xl font-semibold">{summary.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">New Brand Pages</p>
              <p className="mt-2 text-2xl font-semibold">{summary.newPages}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Changed Sections</p>
              <p className="mt-2 text-2xl font-semibold">{summary.totalChangedSections}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Avg Changes / Request</p>
              <p className="mt-2 text-2xl font-semibold">{summary.avgChangedSections}</p>
            </CardContent>
          </Card>
        </section>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <Skeleton className="h-6 w-48 mb-2" />
                  <Skeleton className="h-4 w-32" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : requests.length === 0 ? (
          <Card className="p-12 text-center">
            <CheckCircle2 className="h-12 w-12 mx-auto text-green-500/60 mb-4" />
            <h3 className="text-lg font-semibold mb-1">Review Queue Is Clear</h3>
            <p className="text-muted-foreground">No submitted careers pages are waiting for approval.</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => {
              const changedSections = getChangedSections(request.pending);
              const primaryLogo = request.pending?.logoUrl || request.current?.logoUrl;

              return (
                <Card key={request.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="border-b bg-muted/20 px-6 py-3 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock3 className="h-4 w-4" />
                        Submitted {formatSubmittedAt(request.submittedAt)}
                      </div>
                      <Badge variant={request.type === 'NEW_PAGE' ? 'default' : 'secondary'}>
                        {request.type === 'NEW_PAGE' ? 'New Page' : 'Update'}
                      </Badge>
                    </div>

                    <div className="p-6">
                      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex items-start gap-4">
                          <div className="h-14 w-14 rounded-xl border bg-muted/40 flex items-center justify-center overflow-hidden shrink-0">
                            {primaryLogo ? (
                              <img src={primaryLogo} alt={request.companyName} className="h-full w-full object-cover" />
                            ) : (
                              <Building2 className="h-6 w-6 text-muted-foreground" />
                            )}
                          </div>
                          <div className="space-y-2">
                            <div>
                              <h3 className="text-lg font-semibold">{request.companyName}</h3>
                              <p className="text-sm text-muted-foreground">{request.domain}</p>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              {changedSections.map((section) => (
                                <Badge key={section} variant="outline" className="text-xs">
                                  {sectionLabels[section]}
                                </Badge>
                              ))}
                              {changedSections.length === 0 && (
                                <Badge variant="outline" className="text-xs">Metadata Update</Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <Button variant="outline" onClick={() => setSelectedRequest(request)}>
                            <ArrowRightLeft className="h-4 w-4 mr-2" />
                            Compare
                          </Button>
                          <Button
                            onClick={() => handleApprove(request)}
                            disabled={processingId === request.id}
                          >
                            {processingId === request.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                Approve
                              </>
                            )}
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() => openRejectDialog(request)}
                            disabled={processingId === request.id}
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject
                          </Button>
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

      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="max-w-5xl max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              {selectedRequest?.companyName}
            </DialogTitle>
            <DialogDescription>
              Side-by-side comparison of current live content and pending submission.
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">Current Banner</p>
                  <MediaPreview
                    src={selectedRequest.current?.bannerUrl}
                    alt="Current banner"
                    className="h-36 w-full"
                  />
                </div>
                <div>
                  <p className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">Pending Banner</p>
                  <MediaPreview
                    src={selectedRequest.pending?.bannerUrl}
                    alt="Pending banner"
                    className="h-36 w-full"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">Current Logo</p>
                  <MediaPreview
                    src={selectedRequest.current?.logoUrl}
                    alt="Current logo"
                    className="h-24 w-24"
                  />
                </div>
                <div>
                  <p className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">Pending Logo</p>
                  <MediaPreview
                    src={selectedRequest.pending?.logoUrl}
                    alt="Pending logo"
                    className="h-24 w-24"
                  />
                </div>
              </div>

              <FieldComparison
                label="About"
                currentValue={selectedRequest.current?.about}
                pendingValue={selectedRequest.pending?.about}
              />

              <FieldComparison
                label="Social Links"
                currentValue={selectedRequest.current?.social ? JSON.stringify(selectedRequest.current.social, null, 2) : null}
                pendingValue={selectedRequest.pending?.social ? JSON.stringify(selectedRequest.pending.social, null, 2) : null}
              />

              <div className="rounded-xl border">
                <div className="border-b px-4 py-2 text-sm font-medium flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" />
                  Gallery
                </div>
                <div className="grid gap-0 md:grid-cols-2">
                  <div className="border-b px-4 py-3 md:border-b-0 md:border-r">
                    <p className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">Current</p>
                    <div className="grid grid-cols-3 gap-2">
                      {(selectedRequest.current?.images || []).slice(0, 6).map((url, index) => (
                        <img key={index} src={url} alt={`Current gallery ${index + 1}`} className="h-16 w-full rounded-md border object-cover" />
                      ))}
                      {(!selectedRequest.current?.images || selectedRequest.current.images.length === 0) && (
                        <p className="col-span-3 text-sm text-muted-foreground">No gallery images</p>
                      )}
                    </div>
                  </div>
                  <div className="px-4 py-3">
                    <p className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">Pending</p>
                    <div className="grid grid-cols-3 gap-2">
                      {(selectedRequest.pending?.images || []).slice(0, 6).map((url, index) => (
                        <img key={index} src={url} alt={`Pending gallery ${index + 1}`} className="h-16 w-full rounded-md border object-cover" />
                      ))}
                      {(!selectedRequest.pending?.images || selectedRequest.pending.images.length === 0) && (
                        <p className="col-span-3 text-sm text-muted-foreground">No gallery images</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setSelectedRequest(null)}>
              Close
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (selectedRequest) {
                  openRejectDialog(selectedRequest);
                }
              }}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject
            </Button>
            <Button
              onClick={() => {
                if (selectedRequest) {
                  handleApprove(selectedRequest);
                }
              }}
              disabled={processingId === selectedRequest?.id}
            >
              {processingId === selectedRequest?.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Approve
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Submission</DialogTitle>
            <DialogDescription>
              Share clear feedback for {requestToReject?.companyName} so they can improve and resubmit quickly.
            </DialogDescription>
          </DialogHeader>

          <Textarea
            placeholder="Explain what needs to change before approval..."
            value={rejectReason}
            onChange={(event) => setRejectReason(event.target.value)}
            rows={4}
          />

          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={!rejectReason.trim() || processingId === requestToReject?.id}
            >
              {processingId === requestToReject?.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Hrm8PageLayout>
  );
}
