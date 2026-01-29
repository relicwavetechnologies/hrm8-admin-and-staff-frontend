/**
 * Regional Licensees Management Page
 * HRM8 Global Admin licensee management
 */

import { useState, useEffect } from 'react';
import { useAuth } from '@/shared/contexts/AuthContext';
import { licenseeService, RegionalLicensee } from '@/shared/lib/hrm8/licenseeService';
import { DataTable } from '@/shared/components/tables/DataTable';
import { Button } from '@/shared/components/ui/button';
import { Plus, Edit, Trash2, Ban, ShieldAlert, CheckCircle, History, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Hrm8PageLayout } from '@/shared/components/layouts/Hrm8PageLayout';
import { toast } from 'sonner';
import { FormDrawer } from '@/shared/components/ui/form-drawer';
import { LicenseeForm } from '@/shared/components/hrm8/LicenseeForm';
import { Badge } from '@/shared/components/ui/badge';
import { TableSkeleton } from '@/shared/components/tables/TableSkeleton';
import { AuditHistoryDrawer } from '@/shared/components/hrm8/AuditHistoryDrawer';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog";

const columns = [
  {
    key: 'name',
    label: 'Name',
    sortable: true,
  },
  {
    key: 'email',
    label: 'Email',
    sortable: true,
  },
  {
    key: 'status',
    label: 'Status',
    render: (licensee: RegionalLicensee) => {
      const statusColors = {
        ACTIVE: 'bg-green-100 text-green-800 border-green-200',
        SUSPENDED: 'bg-amber-100 text-amber-800 border-amber-200',
        TERMINATED: 'bg-red-100 text-red-800 border-red-200',
      };
      return (
        <Badge variant="outline" className={statusColors[licensee.status]}>
          {licensee.status}
        </Badge>
      );
    },
  },
  {
    key: 'revenueSharePercent',
    label: 'Revenue Share %',
    render: (licensee: RegionalLicensee) => `${licensee.revenueSharePercent}%`,
  },
];

export default function LicenseesPage() {
  const { user } = useAuth();
  const [licensees, setLicensees] = useState<RegionalLicensee[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingLicenseeId, setEditingLicenseeId] = useState<string | null>(null);
  const [confirmSuspendOpen, setConfirmSuspendOpen] = useState(false);
  const [confirmTerminateOpen, setConfirmTerminateOpen] = useState(false);
  const [selectedLicensee, setSelectedLicensee] = useState<RegionalLicensee | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [historyDrawerOpen, setHistoryDrawerOpen] = useState(false);
  const [historyLicensee, setHistoryLicensee] = useState<RegionalLicensee | null>(null);
  const [impactData, setImpactData] = useState<{
    regions: number;
    activeJobs: number;
    consultants: number;
    pendingRevenue: number;
  } | null>(null);
  const [loadingImpact, setLoadingImpact] = useState(false);

  const isGlobalAdmin = user?.role === 'GLOBAL_ADMIN';

  useEffect(() => {
    loadLicensees();
  }, []);

  const loadLicensees = async () => {
    try {
      setLoading(true);
      const response = await licenseeService.getAll();
      if (response.success && response.data?.licensees) {
        setLicensees(response.data.licensees);
      }
    } catch (error) {
      toast.error('Failed to load licensees');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingLicenseeId(null);
    setDrawerOpen(true);
  };

  const handleEdit = (licensee: RegionalLicensee) => {
    setEditingLicenseeId(licensee.id);
    setDrawerOpen(true);
  };

  const fetchImpactPreview = async (licenseeId: string) => {
    try {
      setLoadingImpact(true);
      setImpactData(null);
      const response = await licenseeService.getImpactPreview(licenseeId);
      if (response.success && response.data) {
        setImpactData(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch impact preview:', error);
    } finally {
      setLoadingImpact(false);
    }
  };

  const handleSuspend = async () => {
    if (!selectedLicensee) return;
    try {
      setActionLoading(true);
      const response = await (selectedLicensee.status === 'SUSPENDED'
        ? licenseeService.update(selectedLicensee.id, { status: 'ACTIVE' })
        : licenseeService.suspend(selectedLicensee.id));

      if (response.success) {
        toast.success(`Licensee ${selectedLicensee.status === 'SUSPENDED' ? 'activated' : 'suspended'} successfully`);
        await loadLicensees();
      }
    } catch (error) {
      toast.error('Failed to update licensee status');
    } finally {
      setActionLoading(false);
      setConfirmSuspendOpen(false);
      setSelectedLicensee(null);
    }
  };

  const handleTerminate = async () => {
    if (!selectedLicensee) return;
    try {
      setActionLoading(true);
      const response = await licenseeService.terminate(selectedLicensee.id);
      if (response.success) {
        toast.success('Licensee terminated successfully');
        await loadLicensees();
      }
    } catch (error) {
      toast.error('Failed to terminate licensee');
    } finally {
      setActionLoading(false);
      setConfirmTerminateOpen(false);
      setSelectedLicensee(null);
    }
  };

  const handleSave = async () => {
    await loadLicensees();
    setDrawerOpen(false);
    setEditingLicenseeId(null);
  };

  const pageColumns = [
    ...columns,
    {
      key: 'actions',
      label: 'Actions',
      render: (licensee: RegionalLicensee) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => handleEdit(licensee)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            title="View History"
            onClick={() => {
              setHistoryLicensee(licensee);
              setHistoryDrawerOpen(true);
            }}
          >
            <History className="h-4 w-4" />
          </Button>

          {licensee.status !== 'TERMINATED' && (
            <>
              <Button
                variant="ghost"
                size="sm"
                className={licensee.status === 'SUSPENDED' ? 'text-green-600' : 'text-amber-600'}
                onClick={() => {
                  setSelectedLicensee(licensee);
                  if (licensee.status !== 'SUSPENDED') {
                    fetchImpactPreview(licensee.id);
                  }
                  setConfirmSuspendOpen(true);
                }}
              >
                {licensee.status === 'SUSPENDED' ? <CheckCircle className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="text-red-600"
                onClick={() => {
                  setSelectedLicensee(licensee);
                  setConfirmTerminateOpen(true);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  if (!isGlobalAdmin) {
    return (
      <Hrm8PageLayout
        title="Regional Licensees"
        subtitle="Global Admin access required"
      >
        <div className="p-6" />
      </Hrm8PageLayout>
    );
  }

  return (
    <Hrm8PageLayout
      title="Regional Licensees"
      subtitle="Manage regional licensees"
      actions={
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Create Licensee
        </Button>
      }
    >
      <div className="p-6 space-y-6">

        <Card>
          <CardHeader>
            <CardTitle>Licensees</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <TableSkeleton columns={5} />
            ) : (
              <DataTable
                data={licensees}
                columns={pageColumns}
                searchable
                searchKeys={['name', 'email', 'legalEntityName']}
                emptyMessage="No licensees found"
              />
            )}
          </CardContent>
        </Card>

        <AlertDialog open={confirmSuspendOpen} onOpenChange={setConfirmSuspendOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {selectedLicensee?.status === 'SUSPENDED' ? 'Activate Licensee' : 'Suspend Licensee'}
              </AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to {selectedLicensee?.status === 'SUSPENDED' ? 'activate' : 'suspend'} <strong>{selectedLicensee?.name}</strong>?
                {selectedLicensee?.status !== 'SUSPENDED' && ' This will temporarily disable their access to regional data.'}

                {/* Impact Preview */}
                {selectedLicensee?.status !== 'SUSPENDED' && (
                  <div className="mt-4 p-3 bg-amber-50 rounded-md border border-amber-200">
                    {loadingImpact ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm">Loading impact preview...</span>
                      </div>
                    ) : impactData ? (
                      <>
                        <p className="font-medium text-amber-800">This will affect:</p>
                        <ul className="mt-2 text-sm text-amber-700">
                          <li>• {impactData.regions} region(s)</li>
                          <li>• {impactData.activeJobs} active job(s) will be paused</li>
                          <li>• {impactData.consultants} consultant(s)</li>
                          {impactData.pendingRevenue > 0 && (
                            <li>• ${impactData.pendingRevenue.toFixed(2)} pending revenue</li>
                          )}
                        </ul>
                      </>
                    ) : null}
                  </div>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={(e) => {
                  e.preventDefault();
                  handleSuspend();
                }}
                disabled={actionLoading}
                className={selectedLicensee?.status === 'SUSPENDED' ? 'bg-green-600 hover:bg-green-700' : 'bg-amber-600 hover:bg-amber-700'}
              >
                {actionLoading ? 'Processing...' : (selectedLicensee?.status === 'SUSPENDED' ? 'Activate' : 'Suspend')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={confirmTerminateOpen} onOpenChange={setConfirmTerminateOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-red-600 flex items-center gap-2">
                <ShieldAlert className="h-5 w-5" />
                Terminate Licensee
              </AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to permanently terminate <strong>{selectedLicensee?.name}</strong>?
                This action <strong>cannot be undone</strong> and will revoke all access immediately.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={(e) => {
                  e.preventDefault();
                  handleTerminate();
                }}
                disabled={actionLoading}
                className="bg-red-600 hover:bg-red-700"
              >
                {actionLoading ? 'Terminating...' : 'Terminate Licensee'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <FormDrawer
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
          title={editingLicenseeId ? 'Edit Licensee' : 'Create Licensee'}
        >
          <LicenseeForm
            licenseeId={editingLicenseeId}
            onSave={handleSave}
            onCancel={() => {
              setDrawerOpen(false);
              setEditingLicenseeId(null);
            }}
          />
        </FormDrawer>

        {/* Audit History Drawer */}
        <AuditHistoryDrawer
          open={historyDrawerOpen}
          onOpenChange={setHistoryDrawerOpen}
          entityType="LICENSEE"
          entityId={historyLicensee?.id || ''}
          entityName={historyLicensee?.name || ''}
        />
      </div>
    </Hrm8PageLayout>
  );
}
