// @ts-nocheck
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Input } from '@/shared/components/ui/input';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import {
  Plus,
  FileText,
  Clock,
  Edit,
  Trash2,
  Copy,
  Video,
  Phone,
  Users,
  MapPin,
  Search,
} from 'lucide-react';
import { getTemplates, deleteTemplate } from '@/shared/lib/mockTemplateStorage';
import type { InterviewTemplate } from '@/shared/types/interviewTemplate';
import { InterviewTemplateForm } from './InterviewTemplateForm';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog';
import { useToast } from '@/shared/hooks/use-toast';

export function InterviewTemplateManager() {
  const [templates, setTemplates] = useState<InterviewTemplate[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<InterviewTemplate | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = () => {
    setTemplates(getTemplates());
  };

  const handleCreateNew = () => {
    setSelectedTemplate(null);
    setIsFormOpen(true);
  };

  const handleEdit = (template: InterviewTemplate) => {
    setSelectedTemplate(template);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteTemplate(id);
    loadTemplates();
    setDeleteConfirmId(null);
    toast({
      title: 'Template Deleted',
      description: 'Interview template has been deleted successfully.',
    });
  };

  const handleDuplicate = (template: InterviewTemplate) => {
    const newTemplate: InterviewTemplate = {
      ...template,
      id: `tmpl-${Date.now()}`,
      name: `${template.name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setSelectedTemplate(newTemplate);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedTemplate(null);
    loadTemplates();
  };

  const getTypeIcon = (type: InterviewTemplate['type']) => {
    const icons = {
      phone: <Phone className="h-4 w-4" />,
      video: <Video className="h-4 w-4" />,
      'in-person': <MapPin className="h-4 w-4" />,
      panel: <Users className="h-4 w-4" />,
    };
    return icons[type];
  };

  const filteredTemplates = templates.filter(
    (template) =>
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isFormOpen) {
    return (
      <InterviewTemplateForm
        template={selectedTemplate}
        onClose={handleFormClose}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Interview Templates</h2>
          <p className="text-muted-foreground">
            Create and manage standardized interview templates
          </p>
        </div>
        <Button onClick={handleCreateNew}>
          <Plus className="h-4 w-4 mr-2" />
          Create Template
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search templates..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <CardDescription className="mt-1">
                    {template.description}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  {getTypeIcon(template.type)}
                  <span className="capitalize">{template.type}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{template.duration} min</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Questions</span>
                  <Badge variant="outline">{template.questions.length}</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Rating Criteria</span>
                  <Badge variant="outline">{template.ratingCriteria.length}</Badge>
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleEdit(template)}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDuplicate(template)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDeleteConfirmId(template.id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredTemplates.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="py-12 text-center">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">No Templates Found</p>
              <p className="text-sm text-muted-foreground mb-4">
                {searchQuery
                  ? 'Try adjusting your search'
                  : 'Create your first interview template'}
              </p>
              {!searchQuery && (
                <Button onClick={handleCreateNew}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Template
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      <AlertDialog
        open={deleteConfirmId !== null}
        onOpenChange={(open) => !open && setDeleteConfirmId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this template? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
