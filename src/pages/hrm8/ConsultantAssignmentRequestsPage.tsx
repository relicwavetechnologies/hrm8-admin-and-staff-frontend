import { useEffect, useState } from 'react';
import { consultantAssignmentRequestService, ConsultantAssignmentRequest } from '@/shared/services/hrm8/consultantAssignmentRequestService';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Badge } from '@/shared/components/ui/badge';
import { AssignConsultantToRequestDialog } from '@/shared/components/hrm8/AssignConsultantToRequestDialog';
import { toast } from 'sonner';
import { Users, RefreshCw, Inbox } from 'lucide-react';

type Scope = 'my_regions' | 'all';

export default function ConsultantAssignmentRequestsPage() {
  const [requests, setRequests] = useState<ConsultantAssignmentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [scope, setScope] = useState<Scope>('my_regions');
  const [assigningRequest, setAssigningRequest] = useState<ConsultantAssignmentRequest | null>(null);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const res = await consultantAssignmentRequestService.listPending(scope);
      if (res.success && res.data?.requests) {
        setRequests(res.data.requests);
      } else {
        setRequests([]);
      }
    } catch {
      setRequests([]);
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [scope]);

  const handleAssignSuccess = () => {
    setAssigningRequest(null);
    loadRequests();
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Consultant Assignment Requests</h1>
        <p className="text-muted-foreground">
          Assign consultants to jobs that chose HRM8 managed service but have no consultant in region
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Pending requests ({requests.length})
          </CardTitle>
          <div className="flex items-center gap-2">
            <Select value={scope} onValueChange={(v) => setScope(v as Scope)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="my_regions">My regions only</SelectItem>
                <SelectItem value="all">All regions</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={loadRequests} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3 py-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : requests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Inbox className="h-12 w-12 mb-4 opacity-50" />
              <p>No pending consultant assignment requests</p>
              <p className="text-sm mt-1">Requests appear when a company chooses HRM8 managed service but no consultant is available in their region</p>
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map((req) => (
                <div
                  key={req.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium truncate">{req.job.title}</span>
                      <Badge variant="secondary">{req.job.service_package || req.job.hiring_mode || 'Managed'}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {req.company.name}
                      {req.region && (
                        <span className="ml-2">• {req.region.name}</span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Created {new Date(req.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => setAssigningRequest(req)}
                  >
                    <Users className="mr-2 h-4 w-4" />
                    Assign consultant
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {assigningRequest && (
        <AssignConsultantToRequestDialog
          open={!!assigningRequest}
          onOpenChange={(open) => !open && setAssigningRequest(null)}
          requestId={assigningRequest.id}
          jobTitle={assigningRequest.job.title}
          companyName={assigningRequest.company.name}
          regionId={assigningRequest.region_id}
          onSuccess={handleAssignSuccess}
        />
      )}
    </div>
  );
}
