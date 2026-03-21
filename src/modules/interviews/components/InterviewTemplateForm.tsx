// @ts-nocheck
import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Separator } from '@/shared/components/ui/separator';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { Plus, Trash2, ArrowLeft, Save } from 'lucide-react';
import type { InterviewTemplate, InterviewQuestion, RatingCriteria } from '@/shared/types/interviewTemplate';
import { saveTemplate } from '@/shared/lib/mockTemplateStorage';
import { useToast } from '@/shared/hooks/use-toast';

interface InterviewTemplateFormProps {
  template: InterviewTemplate | null;
  onClose: () => void;
}

export function InterviewTemplateForm({ template, onClose }: InterviewTemplateFormProps) {
  const [formData, setFormData] = useState<InterviewTemplate>(
    template || {
      id: `tmpl-${Date.now()}`,
      name: '',
      description: '',
      type: 'video',
      duration: 60,
      questions: [],
      ratingCriteria: [],
      createdBy: 'current-user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  );
  const { toast } = useToast();

  const handleAddQuestion = () => {
    const newQuestion: InterviewQuestion = {
      id: `q-${Date.now()}`,
      question: '',
      category: 'general',
      isRequired: true,
      expectedDuration: 10,
    };
    setFormData({
      ...formData,
      questions: [...formData.questions, newQuestion],
    });
  };

  const handleUpdateQuestion = (index: number, field: keyof InterviewQuestion, value: any) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions[index] = { ...updatedQuestions[index], [field]: value };
    setFormData({ ...formData, questions: updatedQuestions });
  };

  const handleRemoveQuestion = (index: number) => {
    setFormData({
      ...formData,
      questions: formData.questions.filter((_, i) => i !== index),
    });
  };

  const handleAddCriteria = () => {
    const newCriteria: RatingCriteria = {
      id: `rc-${Date.now()}`,
      name: '',
      description: '',
      weight: 25,
    };
    setFormData({
      ...formData,
      ratingCriteria: [...formData.ratingCriteria, newCriteria],
    });
  };

  const handleUpdateCriteria = (index: number, field: keyof RatingCriteria, value: any) => {
    const updatedCriteria = [...formData.ratingCriteria];
    updatedCriteria[index] = { ...updatedCriteria[index], [field]: value };
    setFormData({ ...formData, ratingCriteria: updatedCriteria });
  };

  const handleRemoveCriteria = (index: number) => {
    setFormData({
      ...formData,
      ratingCriteria: formData.ratingCriteria.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Template name is required',
        variant: 'destructive',
      });
      return;
    }

    const totalWeight = formData.ratingCriteria.reduce((sum, c) => sum + c.weight, 0);
    if (totalWeight !== 100 && formData.ratingCriteria.length > 0) {
      toast({
        title: 'Validation Error',
        description: 'Rating criteria weights must total 100%',
        variant: 'destructive',
      });
      return;
    }

    saveTemplate(formData);
    toast({
      title: 'Template Saved',
      description: 'Interview template has been saved successfully.',
    });
    onClose();
  };

  const totalWeight = formData.ratingCriteria.reduce((sum, c) => sum + c.weight, 0);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button type="button" variant="ghost" size="icon" onClick={onClose}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold">
              {template ? 'Edit Template' : 'Create Template'}
            </h2>
            <p className="text-muted-foreground">
              Configure interview structure and evaluation criteria
            </p>
          </div>
        </div>
        <Button type="submit">
          <Save className="h-4 w-4 mr-2" />
          Save Template
        </Button>
      </div>

      <ScrollArea className="h-[calc(100vh-200px)]">
        <div className="space-y-6 pr-4">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Template Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Technical Screen, Behavioral Interview"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Brief description of this interview template"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Interview Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: any) =>
                      setFormData({ ...formData, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="phone">Phone</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="in-person">In-Person</SelectItem>
                      <SelectItem value="panel">Panel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="15"
                    max="240"
                    step="15"
                    value={formData.duration}
                    onChange={(e) =>
                      setFormData({ ...formData, duration: parseInt(e.target.value) })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Questions */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Interview Questions</CardTitle>
              <Button type="button" size="sm" onClick={handleAddQuestion}>
                <Plus className="h-4 w-4 mr-2" />
                Add Question
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.questions.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No questions added yet. Click "Add Question" to get started.
                </p>
              ) : (
                formData.questions.map((question, index) => (
                  <div key={question.id} className="space-y-3 p-4 border rounded-lg">
                    <div className="flex items-start justify-between gap-2">
                      <Badge variant="outline">Question {index + 1}</Badge>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveQuestion(index)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <Label>Question *</Label>
                      <Textarea
                        value={question.question}
                        onChange={(e) =>
                          handleUpdateQuestion(index, 'question', e.target.value)
                        }
                        placeholder="Enter interview question"
                        rows={2}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-2">
                        <Label>Category</Label>
                        <Select
                          value={question.category}
                          onValueChange={(value) =>
                            handleUpdateQuestion(index, 'category', value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="technical">Technical</SelectItem>
                            <SelectItem value="behavioral">Behavioral</SelectItem>
                            <SelectItem value="cultural">Cultural</SelectItem>
                            <SelectItem value="general">General</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Duration (min)</Label>
                        <Input
                          type="number"
                          min="1"
                          max="60"
                          value={question.expectedDuration}
                          onChange={(e) =>
                            handleUpdateQuestion(
                              index,
                              'expectedDuration',
                              parseInt(e.target.value)
                            )
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Required</Label>
                        <div className="flex items-center h-10">
                          <Checkbox
                            checked={question.isRequired}
                            onCheckedChange={(checked) =>
                              handleUpdateQuestion(index, 'isRequired', checked)
                            }
                          />
                          <span className="ml-2 text-sm">Required</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Rating Criteria */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Rating Criteria</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Total Weight: {totalWeight}%{' '}
                  {totalWeight === 100 ? (
                    <span className="text-success">✓</span>
                  ) : (
                    <span className="text-destructive">
                      (must equal 100%)
                    </span>
                  )}
                </p>
              </div>
              <Button type="button" size="sm" onClick={handleAddCriteria}>
                <Plus className="h-4 w-4 mr-2" />
                Add Criteria
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.ratingCriteria.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No rating criteria added yet. Click "Add Criteria" to get started.
                </p>
              ) : (
                formData.ratingCriteria.map((criteria, index) => (
                  <div key={criteria.id} className="space-y-3 p-4 border rounded-lg">
                    <div className="flex items-start justify-between gap-2">
                      <Badge variant="outline">Criteria {index + 1}</Badge>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveCriteria(index)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label>Name *</Label>
                        <Input
                          value={criteria.name}
                          onChange={(e) =>
                            handleUpdateCriteria(index, 'name', e.target.value)
                          }
                          placeholder="e.g., Technical Skills"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Weight (%)</Label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={criteria.weight}
                          onChange={(e) =>
                            handleUpdateCriteria(
                              index,
                              'weight',
                              parseInt(e.target.value) || 0
                            )
                          }
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        value={criteria.description}
                        onChange={(e) =>
                          handleUpdateCriteria(index, 'description', e.target.value)
                        }
                        placeholder="Describe what this criteria evaluates"
                        rows={2}
                      />
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </form>
  );
}
