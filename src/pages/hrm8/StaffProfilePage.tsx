import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Briefcase, Users, TrendingUp, DollarSign, Percent } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { Skeleton } from '@/shared/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/shared/components/ui/dialog';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { staffService, StaffMember } from '@/shared/lib/hrm8/staffService';
import { StaffStatusBadge } from '@/shared/components/hrm8/StaffStatusBadge';
import { toast } from 'sonner';

interface StaffStats {
  jobsCount?: number;
  hireSuccessRate?: number;
  leadsCount?: number;
  conversionRate?: number;
  totalPlacements?: number;
  revenue?: number;
  activeAssignments?: number;
  lastActivityDate?: string;
}

export default function StaffProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [staff, setStaff] = useState<StaffMember | null>(null);
  const [stats, setStats] = useState<StaffStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [commissionDialogOpen, setCommissionDialogOpen] = useState(false);
  const [commissionRate, setCommissionRate] = useState<number>(10);
  const [isUpdatingCommission, setIsUpdatingCommission] = useState(false);

  useEffect(() => {
    loadStaffProfile();
  }, [id]);

  useEffect(() => {
    if (staff?.defaultCommissionRate) {
      setCommissionRate(staff.defaultCommissionRate);
    }
  }, [staff]);

  const loadStaffProfile = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const [staffResponse, statsResponse] = await Promise.all([
        staffService.getById(id),
        staffService.getStats(id)
      ]);

      if (staffResponse.success && staffResponse.data?.consultant) {
        setStaff(staffResponse.data.consultant);
      } else {
        setError('Staff member not found');
      }

      if (statsResponse.success && statsResponse.data?.stats) {
        setStats(statsResponse.data.stats);
      } else {
        setStats(null);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load staff profile');
      toast.error('Failed to load staff profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCommissionRate = async () => {
    if (!staff || !id) return;

    try {
      setIsUpdatingCommission(true);

      // Validate rate is between 0 and 100
      if (commissionRate < 0 || commissionRate > 100) {
        toast.error('Commission rate must be between 0 and 100%');
        return;
      }

      const oldRate = staff.defaultCommissionRate || 10;
      const response = await staffService.update(id, { defaultCommissionRate: commissionRate });
      if (!response.success) {
        toast.error(response.error || 'Failed to update commission rate');
        return;
      }

      setStaff(response.data?.consultant || staff);

      toast.success(
        `Commission rate updated: ${oldRate}% → ${commissionRate}%`,
        {
          description: `New commission rate for ${staff.firstName} ${staff.lastName} is now ${commissionRate}%`,
          duration: 5000,
        }
      );

      setCommissionDialogOpen(false);
    } catch (error) {
      toast.error('Failed to update commission rate');
      console.error(error);
    } finally {
      setIsUpdatingCommission(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/hrm8/staff')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-1/3" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-1/2" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !staff) {
    return (
      <div className="p-6 space-y-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/hrm8/staff')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Alert variant="destructive">
          <AlertDescription>{error || 'Staff member not found'}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const roleLabel = staff.role?.replace('_', ' ') || 'Unknown Role';
  const isRecruiter = staff.role === 'RECRUITER';
  const isSalesAgent = staff.role === 'SALES_AGENT';
  const isConsultant360 = staff.role === 'CONSULTANT_360';

  return (
    <div className="p-6 space-y-6">
      {/* Back Button */}
      <Button variant="ghost" size="sm" onClick={() => navigate('/hrm8/staff')}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold tracking-tight">
                {staff.firstName} {staff.lastName}
              </h1>
              <StaffStatusBadge status={staff.status} />
            </div>
            <p className="text-muted-foreground mb-3">{roleLabel}</p>
            <div className="space-y-1">
              <p className="text-sm">
                <span className="font-medium">Email:</span> {staff.email}
              </p>
              {staff.phone && (
                <p className="text-sm">
                  <span className="font-medium">Phone:</span> {staff.phone}
                </p>
              )}
              {stats?.lastActivityDate && (
                <p className="text-sm">
                  <span className="font-medium">Last Activity:</span>{' '}
                  {new Date(stats.lastActivityDate).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>

          {/* Commission Rate Card */}
          <div className="flex flex-col items-end gap-3">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg px-4 py-3">
              <div className="flex items-center gap-2 mb-1">
                <Percent className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-medium text-blue-600 dark:text-blue-400">Commission Rate</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {staff.defaultCommissionRate ?? 10}%
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Default rate
              </p>
            </div>
            <Button
              onClick={() => setCommissionDialogOpen(true)}
              size="sm"
              className="w-full"
            >
              <Percent className="mr-2 h-4 w-4" />
              Change Rate
            </Button>
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Recruiter-specific metrics */}
        {(isRecruiter || isConsultant360) && (
          <>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Open Jobs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.jobsCount || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  <Briefcase className="inline h-3 w-3 mr-1" />
                  Active positions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Hire Success Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.hireSuccessRate || 0}%</div>
                <p className="text-xs text-muted-foreground mt-1">
                  <TrendingUp className="inline h-3 w-3 mr-1" />
                  Placement success
                </p>
              </CardContent>
            </Card>
          </>
        )}

        {/* Sales Agent-specific metrics */}
        {(isSalesAgent || isConsultant360) && (
          <>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Active Leads
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.leadsCount || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  <Users className="inline h-3 w-3 mr-1" />
                  Prospects in pipeline
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Conversion Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.conversionRate || 0}%</div>
                <p className="text-xs text-muted-foreground mt-1">
                  <TrendingUp className="inline h-3 w-3 mr-1" />
                  Lead conversion
                </p>
              </CardContent>
            </Card>
          </>
        )}

        {/* Common metrics */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Assignments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeAssignments || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <Briefcase className="inline h-3 w-3 mr-1" />
              Current workload
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Consultant 360 - Merged View */}
      {isConsultant360 && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Placements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalPlacements || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Recruitment & sales combined
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${(stats?.revenue || 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                <DollarSign className="inline h-3 w-3 mr-1" />
                Generated revenue
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Additional Info */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Role</label>
            <p className="text-sm text-muted-foreground mt-1">{roleLabel}</p>
          </div>
          <div>
            <label className="text-sm font-medium">Status</label>
            <div className="mt-1">
              <StaffStatusBadge status={staff.status} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Commission Rate Dialog */}
      <Dialog open={commissionDialogOpen} onOpenChange={setCommissionDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Percent className="h-5 w-5 text-blue-600" />
              Change Commission Rate
            </DialogTitle>
            <DialogDescription>
              Update the commission rate for {staff?.firstName} {staff?.lastName}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Current Rate Display */}
            <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-3">
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                Current Rate
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {staff?.defaultCommissionRate ?? 10}%
              </p>
            </div>

            {/* New Rate Input */}
            <div className="space-y-2">
              <Label htmlFor="commission-rate" className="text-base font-medium">
                New Commission Rate (%)
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="commission-rate"
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={commissionRate}
                  onChange={(e) => setCommissionRate(parseFloat(e.target.value) || 0)}
                  className="text-lg font-semibold"
                  placeholder="Enter rate"
                />
                <span className="text-lg font-semibold text-gray-500">%</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Valid range: 0% - 100%
              </p>
            </div>

            {/* Rate Change Preview */}
            {commissionRate !== (staff?.defaultCommissionRate ?? 10) && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                  Change Preview
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-700 dark:text-blue-300">
                    {staff?.defaultCommissionRate ?? 10}% → {commissionRate}%
                  </span>
                  <span className={`text-sm font-semibold ${
                    commissionRate > (staff?.defaultCommissionRate ?? 10)
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {commissionRate > (staff?.defaultCommissionRate ?? 10) ? '+' : ''}{commissionRate - (staff?.defaultCommissionRate ?? 10)}%
                  </span>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setCommissionDialogOpen(false)}
              disabled={isUpdatingCommission}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateCommissionRate}
              disabled={isUpdatingCommission || commissionRate === (staff?.defaultCommissionRate ?? 10)}
            >
              {isUpdatingCommission ? 'Updating...' : 'Update Rate'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
