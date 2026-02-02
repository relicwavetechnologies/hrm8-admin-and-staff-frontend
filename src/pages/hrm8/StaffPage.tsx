import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHrm8Auth } from '@/contexts/Hrm8AuthContext';
import { staffService, StaffMember } from '@/shared/lib/hrm8/staffService';
import { DataTable, Column } from '@/shared/components/tables/DataTable';
import { Button } from '@/shared/components/ui/button';
import { Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { toast } from 'sonner';
import { FormDrawer } from '@/shared/components/ui/form-drawer';
import { StaffForm } from '@/shared/components/hrm8/StaffForm';
import { TableSkeleton } from '@/shared/components/tables/TableSkeleton';
import { StaffStatusBadge } from '@/shared/components/hrm8/StaffStatusBadge';
import { StaffActionsMenu } from '@/shared/components/hrm8/StaffActionsMenu';
import { SuspendStaffDialog } from '@/shared/components/hrm8/SuspendStaffDialog';
import { ReactivateStaffDialog } from '@/shared/components/hrm8/ReactivateStaffDialog';
import { ChangeRoleDialog } from '@/shared/components/hrm8/ChangeRoleDialog';
import { DeleteStaffDialog } from '@/shared/components/hrm8/DeleteStaffDialog';
import { useRegionStore } from '@/shared/stores/useRegionStore';


export default function StaffPage() {
  const navigate = useNavigate();
  const { hrm8User } = useHrm8Auth();
  const { selectedRegionId } = useRegionStore();
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);

  // Dialog states
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
  const [reactivateDialogOpen, setReactivateDialogOpen] = useState(false);
  const [changeRoleDialogOpen, setChangeRoleDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);

  const isGlobalAdmin = hrm8User?.role === 'GLOBAL_ADMIN';
  const canCreate = isGlobalAdmin || hrm8User?.role === 'REGIONAL_LICENSEE';
  const canEdit = canCreate;
  const canSuspend = canCreate;
  const canDelete = isGlobalAdmin; // Only global admin can delete

  useEffect(() => {
    loadStaff();
  }, [selectedRegionId]);

  const loadStaff = async () => {
    try {
      setLoading(true);
      const filters = selectedRegionId && selectedRegionId !== 'all'
        ? { regionId: selectedRegionId }
        : undefined;
      const response = await staffService.getAll(filters);
      if (response.success && response.data?.consultants) {
        setStaffList(response.data.consultants);
      }
    } catch (error) {
      toast.error('Failed to load staff members');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingStaffId(null);
    setDrawerOpen(true);
  };

  const handleEdit = (staff: StaffMember) => {
    setEditingStaffId(staff.id);
    setDrawerOpen(true);
  };

  const handleSave = async () => {
    await loadStaff();
    setDrawerOpen(false);
    setEditingStaffId(null);
  };

  const handleSuspend = (staff: StaffMember) => {
    setSelectedStaff(staff);
    setSuspendDialogOpen(true);
  };

  const handleReactivate = (staff: StaffMember) => {
    setSelectedStaff(staff);
    setReactivateDialogOpen(true);
  };

  const handleChangeRole = (staff: StaffMember) => {
    setSelectedStaff(staff);
    setChangeRoleDialogOpen(true);
  };

  const handleDelete = (staff: StaffMember) => {
    setSelectedStaff(staff);
    setDeleteDialogOpen(true);
  };


  const handleDialogSuccess = async () => {
    await loadStaff();
    setSelectedStaff(null);
  };

  const handleRowClick = (staff: StaffMember) => {
    navigate(`/hrm8/staff/${staff.id}`);
  };

  const columns: Column<StaffMember>[] = [
    {
      key: 'firstName',
      label: 'Name',
      render: (staff: StaffMember) => `${staff.firstName} ${staff.lastName}`,
    },
    {
      key: 'email',
      label: 'Email',
      sortable: true,
    },
    {
      key: 'role',
      label: 'Role',
      render: (staff: StaffMember) => staff.role?.replace('_', ' ') || staff.role || '',
    },
    {
      key: 'status',
      label: 'Status',
      render: (staff: StaffMember) => (
        <StaffStatusBadge status={staff.status} />
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (staff: StaffMember) => (
        <StaffActionsMenu
          staff={staff}
          canEdit={canEdit}
          canSuspend={canSuspend}
          canDelete={canDelete}
          onEdit={handleEdit}
          onChangeRole={handleChangeRole}
          onSuspend={handleSuspend}
          onReactivate={handleReactivate}
          onDelete={handleDelete}
        />
      ),
    },
  ];

  return (
    
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Staff Management</h1>
            <p className="text-muted-foreground">Manage Consultants and Sales Agents</p>
          </div>
          {canCreate && (
            <Button onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Create Staff
            </Button>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Staff Members</CardTitle>
          </CardHeader>
          <CardContent className="overflow-visible">
            {loading ? (
              <TableSkeleton columns={5} />
            ) : (
              <div className="overflow-visible">
                <DataTable
                  data={staffList}
                  columns={columns}
                  searchable
                  searchKeys={['firstName', 'lastName', 'email']}
                  emptyMessage="No staff members found"
                  onRowClick={handleRowClick}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create/Edit Drawer */}
        {canCreate && (
          <FormDrawer
            open={drawerOpen}
            onOpenChange={setDrawerOpen}
            title={editingStaffId ? 'Edit Staff Member' : 'Create Staff Member'}
          >
            <StaffForm
              consultantId={editingStaffId}
              onSave={handleSave}
              onCancel={() => {
                setDrawerOpen(false);
                setEditingStaffId(null);
              }}
            />
          </FormDrawer>
        )}

        {/* Suspend Dialog */}
        <SuspendStaffDialog
          staff={selectedStaff}
          open={suspendDialogOpen}
          onOpenChange={setSuspendDialogOpen}
          onSuccess={handleDialogSuccess}
        />

        {/* Reactivate Dialog */}
        <ReactivateStaffDialog
          staff={selectedStaff}
          open={reactivateDialogOpen}
          onOpenChange={setReactivateDialogOpen}
          onSuccess={handleDialogSuccess}
        />

        {/* Change Role Dialog */}
        <ChangeRoleDialog
          staff={selectedStaff}
          open={changeRoleDialogOpen}
          onOpenChange={setChangeRoleDialogOpen}
          onSuccess={handleDialogSuccess}
        />

        {/* Delete Dialog */}
        <DeleteStaffDialog
          staff={selectedStaff}
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onSuccess={handleDialogSuccess}
        />
      </div>
    
  );
}
