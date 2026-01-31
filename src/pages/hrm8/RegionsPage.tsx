import { useState, useEffect } from 'react';
import { useHrm8Auth } from '@/contexts/Hrm8AuthContext';
import { regionService, Region } from '@/shared/lib/hrm8/regionService';
import { DataTable } from '@/shared/components/tables/DataTable';
import { Button } from '@/shared/components/ui/button';
import { AuditHistoryDrawer } from '@/shared/components/hrm8/AuditHistoryDrawer';
import { Plus, Edit, Trash2, MoreVertical, Link2, ArrowRightLeft, History } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { toast } from 'sonner';
import { FormDrawer } from '@/shared/components/ui/form-drawer';
import { RegionForm } from '@/shared/components/hrm8/RegionForm';
import { DeleteConfirmationDialog } from '@/shared/components/ui/delete-confirmation-dialog';
import { AssignLicenseeDialog } from '@/shared/components/hrm8/AssignLicenseeDialog';
import { TransferRegionDialog } from '@/shared/components/hrm8/TransferRegionDialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/shared/components/ui/dropdown-menu';
import { Badge } from '@/shared/components/ui/badge';
import { TableSkeleton } from '@/shared/components/tables/TableSkeleton';

const createColumns = (
  onEdit: (region: Region) => void,
  onDelete: (region: Region) => void,
  onAssignLicensee: (region: Region) => void,
  onTransfer: (region: Region) => void,
  onViewHistory: (region: Region) => void
) => [
    {
      key: 'code',
      label: 'Code',
      sortable: true,
    },
    {
      key: 'name',
      label: 'Name',
      sortable: true,
    },
    {
      key: 'country',
      label: 'Country',
      sortable: true,
    },
    {
      key: 'ownerType',
      label: 'Owner',
      render: (region: Region) => (
        <span className={region.ownerType === 'HRM8' ? 'text-blue-600' : 'text-purple-600'}>
          {region.ownerType}
        </span>
      ),
    },
    {
      key: 'licensee',
      label: 'Licensee',
      render: (region: Region) => {
        if (!region.licensee) {
          return (
            <span className="text-muted-foreground text-sm">—</span>
          );
        }
        return (
          <div className="flex flex-col">
            <span className="font-medium text-sm">{region.licensee.name}</span>
            <span className="text-xs text-muted-foreground">{region.licensee.legalEntityName}</span>
          </div>
        );
      },
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (region: Region) => (
        <Badge variant={region.isActive ? 'default' : 'secondary'}>
          {region.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      width: '100px',
      render: (region: Region) => (
        <div onClick={(e) => e.stopPropagation()} className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            title="View History"
            onClick={() => onViewHistory(region)}
          >
            <History className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(region)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Region
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAssignLicensee(region)}>
                {region.licensee ? (
                  <>
                    <Link2 className="h-4 w-4 mr-2" />
                    Change Licensee
                  </>
                ) : (
                  <>
                    <Link2 className="h-4 w-4 mr-2" />
                    Assign Licensee
                  </>
                )}
              </DropdownMenuItem>
              {region.licensee && (
                <DropdownMenuItem onClick={() => onTransfer(region)}>
                  <ArrowRightLeft className="h-4 w-4 mr-2" />
                  Transfer Ownership
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => onDelete(region)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

export default function RegionsPage() {
  const { hrm8User } = useHrm8Auth();
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingRegionId, setEditingRegionId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [regionToDelete, setRegionToDelete] = useState<string | null>(null);
  const [assignLicenseeDialogOpen, setAssignLicenseeDialogOpen] = useState(false);
  const [regionForLicensee, setRegionForLicensee] = useState<Region | null>(null);
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [regionForTransfer, setRegionForTransfer] = useState<Region | null>(null);
  const [historyDrawerOpen, setHistoryDrawerOpen] = useState(false);
  const [historyRegion, setHistoryRegion] = useState<Region | null>(null);

  const isGlobalAdmin = hrm8User?.role === 'GLOBAL_ADMIN';

  useEffect(() => {
    loadRegions();
  }, []);

  const loadRegions = async () => {
    try {
      setLoading(true);
      const response = await regionService.getAll();
      if (response.success && response.data?.regions) {
        setRegions(response.data.regions);
      }
    } catch (error) {
      toast.error('Failed to load regions');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingRegionId(null);
    setDrawerOpen(true);
  };

  const handleEdit = (region: Region) => {
    setEditingRegionId(region.id);
    setDrawerOpen(true);
  };

  const handleDelete = (region: Region) => {
    setRegionToDelete(region.id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!regionToDelete) return;

    try {
      const response = await regionService.delete(regionToDelete);
      if (response.success) {
        toast.success('Region deleted successfully');
        await loadRegions();
      } else {
        toast.error(response.error || 'Failed to delete region');
      }
    } catch (error) {
      toast.error('Failed to delete region');
    } finally {
      setDeleteDialogOpen(false);
      setRegionToDelete(null);
    }
  };

  const handleSave = async () => {
    await loadRegions();
    setDrawerOpen(false);
    setEditingRegionId(null);
  };

  const handleAssignLicensee = (region: Region) => {
    setRegionForLicensee(region);
    setAssignLicenseeDialogOpen(true);
  };

  const handleLicenseeAssigned = async () => {
    await loadRegions();
  };

  const handleTransfer = (region: Region) => {
    setRegionForTransfer(region);
    setTransferDialogOpen(true);
  };

  const handleTransferComplete = async () => {
    await loadRegions();
  };

  const columns = createColumns(
    handleEdit,
    handleDelete,
    handleAssignLicensee,
    handleTransfer,
    (region) => {
      setHistoryRegion(region);
      setHistoryDrawerOpen(true);
    }
  );

  if (!isGlobalAdmin) {
    return (
      
        <div className="p-6">
          <h1 className="text-2xl font-bold tracking-tight">Regions Management</h1>
          <p className="text-muted-foreground">Global Admin access required</p>
        </div>
      
    );
  }

  return (
    
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Regions Management</h1>
            <p className="text-muted-foreground">Manage geographic regions</p>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Create Region
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Regions</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <TableSkeleton columns={6} />
            ) : (
              <DataTable
                data={regions}
                columns={columns}
                searchable
                searchKeys={['code', 'name', 'country']}
                emptyMessage="No regions found"
              />
            )}
          </CardContent>
        </Card>

        <FormDrawer
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
          title={editingRegionId ? 'Edit Region' : 'Create Region'}
        >
          <RegionForm
            regionId={editingRegionId}
            onSave={handleSave}
            onCancel={() => {
              setDrawerOpen(false);
              setEditingRegionId(null);
            }}
          />
        </FormDrawer>

        <DeleteConfirmationDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={confirmDelete}
          title="Delete Region"
          description="Are you sure you want to delete this region? This action cannot be undone."
        />

        <AssignLicenseeDialog
          open={assignLicenseeDialogOpen}
          onOpenChange={setAssignLicenseeDialogOpen}
          region={regionForLicensee}
          onSuccess={handleLicenseeAssigned}
        />

        <TransferRegionDialog
          open={transferDialogOpen}
          onOpenChange={setTransferDialogOpen}
          region={regionForTransfer}
          onSuccess={handleTransferComplete}
        />

        <AuditHistoryDrawer
          open={historyDrawerOpen}
          onOpenChange={setHistoryDrawerOpen}
          entityType="REGION"
          entityId={historyRegion?.id || ''}
          entityName={historyRegion?.name || ''}
        />
      </div>
    
  );
}
