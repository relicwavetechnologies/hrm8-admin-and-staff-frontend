import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Textarea } from '@/shared/components/ui/textarea';
import { Skeleton } from '@/shared/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { toast } from 'sonner';
import { apiClient } from '@/shared/lib/api';
import {
  Building2,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  Eye,
  FileEdit,
  Image as ImageIcon,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface CareersRequest {
  id: string;
  companyName: string;
  domain: string;
  type: 'NEW_PAGE' | 'SECTION_UPDATE';
  status: string;
  pending: {
    logoUrl?: string;
    bannerUrl?: string;
    about?: string;
    social?: {
      linkedin?: string;
      twitter?: string;
      facebook?: string;
      instagram?: string;
    };
  };
  current: {
    logoUrl?: string;
    bannerUrl?: string;
    about?: string;
    social?: any;
  } | null;
  submittedAt: string;
}

export default function CareersRequestsPage() {
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

  const loadRequests = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get<{ requests: CareersRequest[]; total: number }>(
        '/api/hrm8/careers/requests'
      );
      if (response.success && response.data) {
        setRequests(response.data.requests);
      }
    } catch (error) {
      console.error('Failed to load careers requests:', error);
      toast.error('Failed to load careers requests');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (request: CareersRequest, section?: string) => {
    setProcessingId(request.id);
    try {
      const response = await apiClient.post(`/api/hrm8/careers/${request.id}/approve`, {
        section,
      });

      if (response.success) {
        toast.success(section
          ? `${section.charAt(0).toUpperCase() + section.slice(1)} section approved`
          : 'Careers page approved');
        loadRequests();
        setSelectedRequest(null);
      }
    } catch (error) {
      console.error('Failed to approve:', error);
      toast.error('Failed to approve request');
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
      const response = await apiClient.post(`/api/hrm8/careers/${requestToReject.id}/reject`, {
        reason: rejectReason,
      });

      if (response.success) {
        toast.success('Careers page rejected with feedback');
        loadRequests();
        setRejectDialogOpen(false);
        setSelectedRequest(null);
      }
    } catch (error) {
      console.error('Failed to reject:', error);
      toast.error('Failed to reject request');
    } finally {
      setProcessingId(null);
      setRequestToReject(null);
    }
  };

  const getPendingSections = (pending: CareersRequest['pending']) => {
    const sections = [];
    if (pending.logoUrl !== undefined) sections.push('logo');
    if (pending.bannerUrl !== undefined) sections.push('banner');
    if (pending.about !== undefined) sections.push('about');
    if (pending.social !== undefined) sections.push('social');
    return sections;
  };

  return (
    
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Careers Page Requests</h1>
            <p className="text-muted-foreground">Review and approve company careers page submissions</p>
          </div>
          <Badge variant="secondary" className="text-sm px-3 py-1">
            <Clock className="h-4 w-4 mr-2" />
            {requests.length} Pending
          </Badge>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-6 w-48 mb-2" />
                  <Skeleton className="h-4 w-32" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : requests.length === 0 ? (
          <Card className="p-12 text-center">
            <CheckCircle className="h-12 w-12 mx-auto text-green-500/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">All Caught Up!</h3>
            <p className="text-muted-foreground">No pending careers page requests to review</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => {
              const pendingSections = getPendingSections(request.pending);

              return (
                <Card key={request.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                          {request.pending.logoUrl ? (
                            <img
                              src={request.pending.logoUrl}
                              alt={request.companyName}
                              className="h-full w-full object-cover rounded-lg"
                            />
                          ) : (
                            <Building2 className="h-6 w-6 text-primary" />
                          )}
                        </div>

                        <div>
                          <h3 className="font-semibold text-lg">{request.companyName}</h3>
                          <p className="text-sm text-muted-foreground">{request.domain}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant={request.type === 'NEW_PAGE' ? 'default' : 'secondary'}>
                              {request.type === 'NEW_PAGE' ? 'New Page' : 'Section Update'}
                            </Badge>
                            {pendingSections.length > 0 && request.type === 'SECTION_UPDATE' && (
                              <div className="flex gap-1">
                                {pendingSections.map((s) => (
                                  <Badge key={s} variant="outline" className="text-xs">
                                    {s}
                                  </Badge>
                                ))}
                              </div>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(request.submittedAt), { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedRequest(request)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Preview
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleApprove(request)}
                          disabled={processingId === request.id}
                        >
                          {processingId === request.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Approve
                            </>
                          )}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => openRejectDialog(request)}
                          disabled={processingId === request.id}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Preview Dialog */}
        <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                {selectedRequest?.companyName}
              </DialogTitle>
              <DialogDescription>
                Review the pending changes before approving or rejecting
              </DialogDescription>
            </DialogHeader>

            {selectedRequest && (
              <div className="space-y-6">
                {/* Banner Preview */}
                {selectedRequest.pending.bannerUrl && (
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <ImageIcon className="h-4 w-4" />
                      Banner
                    </h4>
                    <div
                      className="h-32 rounded-lg bg-muted bg-cover bg-center"
                      style={{ backgroundImage: `url(${selectedRequest.pending.bannerUrl})` }}
                    />
                  </div>
                )}

                {/* Logo Preview */}
                {selectedRequest.pending.logoUrl && (
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Logo
                    </h4>
                    <img
                      src={selectedRequest.pending.logoUrl}
                      alt="Logo"
                      className="h-20 w-20 rounded-lg object-cover border"
                    />
                  </div>
                )}

                {/* About Preview */}
                {selectedRequest.pending.about && (
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <FileEdit className="h-4 w-4" />
                      About
                    </h4>
                    <Card>
                      <CardContent className="p-4 text-sm whitespace-pre-wrap">
                        {selectedRequest.pending.about}
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Social Preview */}
                {selectedRequest.pending.social && (
                  <div>
                    <h4 className="font-medium mb-2">Social Links</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {selectedRequest.pending.social.linkedin && (
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">LinkedIn</Badge>
                          <span className="truncate">{selectedRequest.pending.social.linkedin}</span>
                        </div>
                      )}
                      {selectedRequest.pending.social.twitter && (
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">Twitter</Badge>
                          <span className="truncate">{selectedRequest.pending.social.twitter}</span>
                        </div>
                      )}
                      {selectedRequest.pending.social.facebook && (
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">Facebook</Badge>
                          <span className="truncate">{selectedRequest.pending.social.facebook}</span>
                        </div>
                      )}
                      {selectedRequest.pending.social.instagram && (
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">Instagram</Badge>
                          <span className="truncate">{selectedRequest.pending.social.instagram}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
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
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reject Dialog */}
        <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Careers Page</DialogTitle>
              <DialogDescription>
                Provide feedback for {requestToReject?.companyName} so they can make improvements
              </DialogDescription>
            </DialogHeader>

            <Textarea
              placeholder="Please provide a reason for rejection. This will be visible to the company admin..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
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
      </div>
    
  );
}
