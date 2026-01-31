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

interface Category {
    id: string;
    name: string;
    slug: string;
    description?: string;
    icon?: string;
    color?: string;
    order: number;
    is_active: boolean;
    _count: {
        jobs: number;
    };
}

export function JobCategoriesTab() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);

    // Fetch categories
    const { data: categories, isLoading } = useQuery({
        queryKey: ['admin-categories'],
        queryFn: async () => {
            const response = await apiClient.get('/api/admin/categories?includeInactive=true');
            if (!response.success) throw new Error(response.error || 'Failed to fetch categories');
            return response.data as Category[];
        }
    });

    // Create category
    const createMutation = useMutation({
        mutationFn: async (data: Partial<Category>) => {
            const response = await apiClient.post('/api/admin/categories', data);
            if (!response.success) throw new Error(response.error || 'Failed to create category');
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
            setIsCreateOpen(false);
            toast({ title: 'Category created successfully' });
        },
        onError: (error: any) => {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        }
    });

    // Update category
    const updateMutation = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: Partial<Category> }) => {
            const response = await apiClient.put(`/api/admin/categories/${id}`, data);
            if (!response.success) throw new Error(response.error || 'Failed to update category');
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
            setEditingCategory(null);
            toast({ title: 'Category updated successfully' });
        },
        onError: (error: any) => {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        }
    });

    // Delete category
    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const response = await apiClient.delete(`/api/admin/categories/${id}`);
            if (!response.success) throw new Error(response.error || 'Failed to delete category');
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
            toast({ title: 'Category deleted successfully' });
        },
        onError: (error: any) => {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        }
    });

    if (isLoading) return <div className="p-6">Loading categories...</div>;

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-semibold">Job Categories</h3>
                    <p className="text-sm text-muted-foreground">
                        Manage job categories for better organization
                    </p>
                </div>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Create Category
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create New Category</DialogTitle>
                        </DialogHeader>
                        <CategoryForm
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
                            <TableHead>Jobs</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {categories?.map((category) => (
                            <TableRow key={category.id}>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        {category.icon && <span>{category.icon}</span>}
                                        <span className="font-medium">{category.name}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <code className="text-xs bg-muted px-2 py-1 rounded">{category.slug}</code>
                                </TableCell>
                                <TableCell>{category._count.jobs}</TableCell>
                                <TableCell>
                                    <Badge variant={category.is_active ? 'default' : 'secondary'}>
                                        {category.is_active ? 'Active' : 'Inactive'}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setEditingCategory(category)}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => {
                                                if (confirm(`Delete category "${category.name}"?`)) {
                                                    deleteMutation.mutate(category.id);
                                                }
                                            }}
                                            disabled={category._count.jobs > 0}
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
            {editingCategory && (
                <Dialog open={!!editingCategory} onOpenChange={() => setEditingCategory(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit Category</DialogTitle>
                        </DialogHeader>
                        <CategoryForm
                            initialData={editingCategory}
                            onSubmit={(data) => updateMutation.mutate({ id: editingCategory.id, data })}
                            isLoading={updateMutation.isPending}
                        />
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}

// Category Form Component
function CategoryForm({
    initialData,
    onSubmit,
    isLoading
}: {
    initialData?: Partial<Category>;
    onSubmit: (data: Partial<Category>) => void;
    isLoading: boolean;
}) {
    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        slug: initialData?.slug || '',
        description: initialData?.description || '',
        icon: initialData?.icon || '',
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

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="icon">Icon</Label>
                    <Input
                        id="icon"
                        value={formData.icon}
                        onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                        placeholder="e.g., 💼"
                    />
                </div>

                <div>
                    <Label htmlFor="color">Color</Label>
                    <Input
                        id="color"
                        type="color"
                        value={formData.color}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
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
