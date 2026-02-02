import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Plus, Save, Eye, Copy, ArrowLeft } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { toast } from 'sonner';
import { QuestionItem } from './QuestionItem';
import { QuestionEditor } from './QuestionEditor';
import { QuestionnaireForm } from './QuestionnaireForm';
import type { QuestionnaireTemplate, QuestionnaireQuestion } from '@/types/referee';
import {
  saveTemplate,
  updateTemplate,
  duplicateTemplate,
  getTemplates,
} from '@/shared/lib/backgroundChecks/questionnaireTemplateStorage';

interface QuestionnaireBuilderProps {
  templateId?: string;
  onBack?: () => void;
}

export function QuestionnaireBuilder({ templateId, onBack }: QuestionnaireBuilderProps) {
  const existingTemplate = templateId ? getTemplates().find(t => t.id === templateId) : null;

  const [template, setTemplate] = useState<Partial<QuestionnaireTemplate>>(
    existingTemplate || {
      name: '',
      description: '',
      category: 'general',
      questions: [],
      isDefault: false,
    }
  );

  const [editingQuestion, setEditingQuestion] = useState<QuestionnaireQuestion | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('builder');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setTemplate((prev) => {
        const questions = prev.questions || [];
        const oldIndex = questions.findIndex((q) => q.id === active.id);
        const newIndex = questions.findIndex((q) => q.id === over.id);

        const reordered = arrayMove(questions, oldIndex, newIndex);
        return {
          ...prev,
          questions: reordered.map((q, idx) => ({ ...q, order: idx + 1 })),
        };
      });
    }
  };

  const handleAddQuestion = () => {
    setEditingQuestion(null);
    setIsEditorOpen(true);
  };

  const handleEditQuestion = (question: QuestionnaireQuestion) => {
    setEditingQuestion(question);
    setIsEditorOpen(true);
  };

  const handleSaveQuestion = (question: QuestionnaireQuestion) => {
    setTemplate((prev) => {
      const questions = prev.questions || [];
      const existingIndex = questions.findIndex((q) => q.id === question.id);

      if (existingIndex >= 0) {
        // Update existing question
        const updated = [...questions];
        updated[existingIndex] = question;
        return { ...prev, questions: updated };
      } else {
        // Add new question
        return {
          ...prev,
          questions: [...questions, { ...question, order: questions.length + 1 }],
        };
      }
    });
  };

  const handleDeleteQuestion = (id: string) => {
    setTemplate((prev) => ({
      ...prev,
      questions: (prev.questions || [])
        .filter((q) => q.id !== id)
        .map((q, idx) => ({ ...q, order: idx + 1 })),
    }));
    toast.success('Question deleted');
  };

  const handleSaveTemplate = () => {
    if (!template.name || !template.questions || template.questions.length === 0) {
      toast.error('Please provide a template name and at least one question');
      return;
    }

    const templateData: QuestionnaireTemplate = {
      id: existingTemplate?.id || `template-${Date.now()}`,
      name: template.name,
      description: template.description || '',
      category: template.category as QuestionnaireTemplate['category'],
      questions: template.questions,
      isDefault: template.isDefault || false,
      createdBy: 'admin',
      createdAt: existingTemplate?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (existingTemplate) {
      updateTemplate(templateData.id, templateData);
      toast.success('Template updated successfully');
    } else {
      saveTemplate(templateData);
      toast.success('Template saved successfully');
    }

    if (onBack) onBack();
  };

  const handleDuplicate = () => {
    if (existingTemplate) {
      const newName = `${existingTemplate.name} (Copy)`;
      duplicateTemplate(existingTemplate.id, newName);
      toast.success('Template duplicated');
      if (onBack) onBack();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <div>
            <h2 className="text-2xl font-bold">
              {existingTemplate ? 'Edit Template' : 'Create New Template'}
            </h2>
            <p className="text-sm text-muted-foreground">
              Build custom reference check questionnaires
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {existingTemplate && (
            <Button variant="outline" onClick={handleDuplicate}>
              <Copy className="h-4 w-4 mr-2" />
              Duplicate
            </Button>
          )}
          <Button onClick={handleSaveTemplate}>
            <Save className="h-4 w-4 mr-2" />
            Save Template
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="builder">Builder</TabsTrigger>
          <TabsTrigger value="preview">
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </TabsTrigger>
        </TabsList>

        <TabsContent value="builder" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Template Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="template-name">Template Name <span className="text-destructive">*</span></Label>
                <Input
                  id="template-name"
                  value={template.name || ''}
                  onChange={(e) => setTemplate({ ...template, name: e.target.value })}
                  placeholder="e.g., Standard Professional Reference"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="template-description">Description</Label>
                <Textarea
                  id="template-description"
                  value={template.description || ''}
                  onChange={(e) => setTemplate({ ...template, description: e.target.value })}
                  placeholder="Brief description of when to use this template..."
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="template-category">Category</Label>
                <Select
                  value={template.category || 'general'}
                  onValueChange={(value) => setTemplate({ ...template, category: value as QuestionnaireTemplate['category'] })}
                >
                  <SelectTrigger id="template-category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="leadership">Leadership</SelectItem>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="sales">Sales</SelectItem>
                    <SelectItem value="quick">Quick Reference</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Questions</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Drag to reorder • {template.questions?.length || 0} questions
                  </p>
                </div>
                <Button onClick={handleAddQuestion}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Question
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {!template.questions || template.questions.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p>No questions added yet</p>
                  <Button variant="outline" className="mt-4" onClick={handleAddQuestion}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Question
                  </Button>
                </div>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={template.questions.map((q) => q.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-3">
                      {template.questions.map((question, index) => (
                        <QuestionItem
                          key={question.id}
                          question={question}
                          index={index}
                          onEdit={handleEditQuestion}
                          onDelete={handleDeleteQuestion}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview">
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
              <p className="text-sm text-muted-foreground">
                This is how referees will see your questionnaire
              </p>
            </CardHeader>
            <CardContent>
              {template.questions && template.questions.length > 0 ? (
                <QuestionnaireForm
                  questions={template.questions}
                  candidateName="John Doe"
                  onSubmit={() => toast.info('Preview mode - submission disabled')}
                  isSubmitting={false}
                />
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <p>Add questions to see preview</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <QuestionEditor
        question={editingQuestion}
        open={isEditorOpen}
        onClose={() => {
          setIsEditorOpen(false);
          setEditingQuestion(null);
        }}
        onSave={handleSaveQuestion}
      />
    </div>
  );
}
