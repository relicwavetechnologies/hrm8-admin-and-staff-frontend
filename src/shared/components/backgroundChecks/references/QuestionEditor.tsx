import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Switch } from '@/shared/components/ui/switch';
import type { QuestionnaireQuestion } from '@/types/referee';

interface QuestionEditorProps {
  question: QuestionnaireQuestion | null;
  open: boolean;
  onClose: () => void;
  onSave: (question: QuestionnaireQuestion) => void;
}

export function QuestionEditor({ question, open, onClose, onSave }: QuestionEditorProps) {
  const [formData, setFormData] = useState<Partial<QuestionnaireQuestion>>({
    type: 'text',
    question: '',
    required: true,
    placeholder: '',
    maxLength: 500,
  });

  useEffect(() => {
    if (question) {
      setFormData(question);
    } else {
      setFormData({
        type: 'text',
        question: '',
        required: true,
        placeholder: '',
        maxLength: 500,
      });
    }
  }, [question, open]);

  const handleSave = () => {
    const newQuestion: QuestionnaireQuestion = {
      id: question?.id || `q${Date.now()}`,
      type: formData.type as QuestionnaireQuestion['type'],
      question: formData.question || '',
      required: formData.required || false,
      order: question?.order || 0,
      ...(formData.type === 'rating' && {
        ratingScale: formData.ratingScale || { min: 1, max: 5 }
      }),
      ...((formData.type === 'text' || formData.type === 'textarea') && {
        placeholder: formData.placeholder,
        maxLength: formData.maxLength,
      }),
    };

    onSave(newQuestion);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{question ? 'Edit Question' : 'Add Question'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="question-type">Question Type</Label>
            <Select
              value={formData.type || 'text'}
              onValueChange={(value) => setFormData({ ...formData, type: value as QuestionnaireQuestion['type'] })}
            >
              <SelectTrigger id="question-type">
                <SelectValue placeholder="Select question type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating">Rating Scale (1-5 stars)</SelectItem>
                <SelectItem value="yes-no">Yes/No Question</SelectItem>
                <SelectItem value="text">Short Text Answer</SelectItem>
                <SelectItem value="textarea">Long Text Answer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="question-text">Question <span className="text-destructive">*</span></Label>
            <Textarea
              id="question-text"
              value={formData.question || ''}
              onChange={(e) => setFormData({ ...formData, question: e.target.value })}
              placeholder="Enter your question..."
              rows={2}
              required
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="required"
              checked={formData.required || false}
              onCheckedChange={(checked) => setFormData({ ...formData, required: checked })}
            />
            <Label htmlFor="required">Required question</Label>
          </div>

          {formData.type === 'rating' && (
            <div className="space-y-3 p-4 bg-muted rounded-lg">
              <h4 className="text-sm font-medium">Rating Scale Settings</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="min-value">Minimum Value</Label>
                  <Input
                    id="min-value"
                    type="number"
                    value={formData.ratingScale?.min?.toString() || '1'}
                    onChange={(e) => setFormData({
                      ...formData,
                      ratingScale: { ...formData.ratingScale!, min: parseInt(e.target.value) }
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max-value">Maximum Value</Label>
                  <Input
                    id="max-value"
                    type="number"
                    value={formData.ratingScale?.max?.toString() || '5'}
                    onChange={(e) => setFormData({
                      ...formData,
                      ratingScale: { ...formData.ratingScale!, max: parseInt(e.target.value) }
                    })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="scale-labels">Labels (comma-separated, optional)</Label>
                <Input
                  id="scale-labels"
                  value={formData.ratingScale?.labels?.join(', ') || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    ratingScale: {
                      ...formData.ratingScale!,
                      labels: e.target.value.split(',').map(l => l.trim()).filter(Boolean)
                    }
                  })}
                  placeholder="Poor, Below Average, Average, Good, Excellent"
                />
              </div>
            </div>
          )}

          {(formData.type === 'text' || formData.type === 'textarea') && (
            <div className="space-y-3 p-4 bg-muted rounded-lg">
              <h4 className="text-sm font-medium">Text Input Settings</h4>
              <div className="space-y-2">
                <Label htmlFor="placeholder">Placeholder Text</Label>
                <Input
                  id="placeholder"
                  value={formData.placeholder || ''}
                  onChange={(e) => setFormData({ ...formData, placeholder: e.target.value })}
                  placeholder="Enter placeholder text..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max-length">Maximum Length (characters)</Label>
                <Input
                  id="max-length"
                  type="number"
                  value={formData.maxLength?.toString() || '500'}
                  onChange={(e) => setFormData({ ...formData, maxLength: parseInt(e.target.value) })}
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!formData.question}>
            {question ? 'Save Changes' : 'Add Question'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
