import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/lib/api';
import { Button } from '@/shared/components/ui/button';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useToast } from '@/shared/hooks/use-toast';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/shared/components/ui/table';
import { Badge } from '@/shared/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/shared/components/ui/dialog';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { Label } from '@/shared/components/ui/label';
import { Switch } from '@/shared/components/ui/switch';

interface Tag {
    id: string;
    name: string;
    slug: string;
    color?: string;
    description?: string;
    is_active: boolean;
    _count: {
        jobs: number;
    };
}

export function JobTagsTab() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingTag, setEditingTag] = useState<Tag | null>(null);

    // Fetch tags
    const { data: tags, isLoading } = useQuery({
        queryKey: ['admin-tags'],
        queryFn: async () => {
            const response = await apiClient.get('/api/admin/tags?includeInactive=true');
            if (!response.success) throw new Error(response.error || 'Failed to fetch tags');
            return response.data as Tag[];
        }
    });

    // Create tag
    const createMutation = useMutation({
        mutationFn: async (data: Partial<Tag>) => {
            const response = await apiClient.post('/api/admin/tags', data);
            if (!response.success) throw new Error(response.error || 'Failed to create tag');
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-tags'] });
            setIsCreateOpen(false);
            toast({ title: 'Tag created successfully' });
        },
        onError: (error: any) => {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        }
    });

    // Update tag
    const updateMutation = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: Partial<Tag> }) => {
            const response = await apiClient.put(`/api/admin/tags/${id}`, data);
            if (!response.success) throw new Error(response.error || 'Failed to update tag');
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-tags'] });
            setEditingTag(null);
            toast({ title: 'Tag updated successfully' });
        },
        onError: (error: any) => {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        }
    });

    // Delete tag
    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const response = await apiClient.delete(`/api/admin/tags/${id}`);
            if (!response.success) throw new Error(response.error || 'Failed to delete tag');
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-tags'] });
            toast({ title: 'Tag deleted successfully' });
        },
        onError: (error: any) => {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        }
    });

    if (isLoading) return <div className="p-6">Loading tags...</div>;

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-semibold">Job Tags</h3>
                    <p className="text-sm text-muted-foreground">
                        Manage job tags for filtering and organization
                    </p>
                </div>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Create Tag
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create New Tag</DialogTitle>
                        </DialogHeader>
                        <TagForm
                            onSubmit={(data) => createMutation.mutate(data)}
                            isLoading={createMutation.isPending}
                        />
                    </DialogContent>
                </Dialog>
            </div>

            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Slug</TableHead>
                            <TableHead>Color</TableHead>
                            <TableHead>Usage</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tags?.map((tag) => (
                            <TableRow key={tag.id}>
                                <TableCell className="font-medium">{tag.name}</TableCell>
                                <TableCell>
                                    <code className="text-xs bg-muted px-2 py-1 rounded">{tag.slug}</code>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="w-4 h-4 rounded border"
                                            style={{ backgroundColor: tag.color || '#3B82F6' }}
                                        />
                                        <span className="text-xs text-muted-foreground">{tag.color}</span>
                                    </div>
                                </TableCell>
                                <TableCell>{tag._count.jobs} jobs</TableCell>
                                <TableCell>
                                    <Badge variant={tag.is_active ? 'default' : 'secondary'}>
                                        {tag.is_active ? 'Active' : 'Inactive'}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setEditingTag(tag)}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => {
                                                if (confirm(`Delete tag "${tag.name}"? This will remove it from ${tag._count.jobs} jobs.`)) {
                                                    deleteMutation.mutate(tag.id);
                                                }
                                            }}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Edit Dialog */}
            {editingTag && (
                <Dialog open={!!editingTag} onOpenChange={() => setEditingTag(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit Tag</DialogTitle>
                        </DialogHeader>
                        <TagForm
                            initialData={editingTag}
                            onSubmit={(data) => updateMutation.mutate({ id: editingTag.id, data })}
                            isLoading={updateMutation.isPending}
                        />
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}

// Tag Form Component
function TagForm({
    initialData,
    onSubmit,
    isLoading
}: {
    initialData?: Partial<Tag>;
    onSubmit: (data: Partial<Tag>) => void;
    isLoading: boolean;
}) {
    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        slug: initialData?.slug || '',
        description: initialData?.description || '',
        color: initialData?.color || '#3B82F6',
        is_active: initialData?.is_active ?? true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                />
            </div>

            <div>
                <Label htmlFor="slug">Slug</Label>
                <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="Auto-generated from name"
                />
            </div>

            <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
            </div>

            <div>
                <Label htmlFor="color">Color</Label>
                <div className="flex gap-2">
                    <Input
                        id="color"
                        type="color"
                        value={formData.color}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        className="w-20"
                    />
                    <Input
                        value={formData.color}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        placeholder="#3B82F6"
                    />
                </div>
            </div>

            <div className="flex items-center space-x-2">
                <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">Active</Label>
            </div>

            <div className="flex justify-end gap-2">
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Saving...' : 'Save'}
                </Button>
            </div>
        </form>
    );
}
