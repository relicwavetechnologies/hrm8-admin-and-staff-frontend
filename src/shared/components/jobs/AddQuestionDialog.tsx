import { useState, useEffect } from "react";
import { ApplicationQuestion, QuestionType, QuestionOption, QuestionEvaluationSettings } from "@/shared/types/applicationForm";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { Switch } from "@/shared/components/ui/switch";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Separator } from "@/shared/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

import { questionTypeLabels, questionTypeIcons, needsOptions, getDefaultValidation } from "@/shared/lib/applicationFormUtils";
import { saveQuestionToLibrary, getCategories } from "@/shared/lib/questionLibraryStorage";
import { Plus, X, BookmarkPlus } from "lucide-react";
import { useToast } from "@/shared/hooks/use-toast";
import { QuestionEvaluationSettings as QuestionEvaluationSettingsComponent } from "./QuestionEvaluationSettings";

interface AddQuestionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (question: ApplicationQuestion) => void;
  editQuestion?: ApplicationQuestion | null;
  nextOrder: number;
}

export function AddQuestionDialog({
  open,
  onOpenChange,
  onAdd,
  editQuestion,
  nextOrder,
}: AddQuestionDialogProps) {
  const [type, setType] = useState<QuestionType>('short_text');
  const [label, setLabel] = useState('');
  const [description, setDescription] = useState('');
  const [required, setRequired] = useState(false);
  const [options, setOptions] = useState<QuestionOption[]>([]);
  const [newOption, setNewOption] = useState('');
  const [saveToLibrary, setSaveToLibrary] = useState(false);
  const [category, setCategory] = useState('');
  const [evaluation, setEvaluation] = useState<QuestionEvaluationSettings | undefined>(undefined);
  const { toast } = useToast();

  const categories = getCategories();

  useEffect(() => {
    if (editQuestion) {
      setType(editQuestion.type);
      setLabel(editQuestion.label);
      setDescription(editQuestion.description || '');
      setRequired(editQuestion.required);
      setOptions(editQuestion.options || []);
      setEvaluation(editQuestion.evaluation);
    } else {
      resetForm();
    }
  }, [editQuestion, open]);

  const resetForm = () => {
    setType('short_text');
    setLabel('');
    setDescription('');
    setRequired(false);
    setOptions([]);
    setNewOption('');
    setSaveToLibrary(false);
    setCategory('');
    setEvaluation(undefined);
  };

  const handleAddOption = () => {
    if (!newOption.trim()) return;

    const option: QuestionOption = {
      id: `option-${Date.now()}-${Math.random()}`,
      label: newOption.trim(),
      value: newOption.trim().toLowerCase().replace(/\s+/g, '_'),
    };

    setOptions([...options, option]);
    setNewOption('');
  };

  const handleRemoveOption = (optionId: string) => {
    setOptions(options.filter((opt) => opt.id !== optionId));
  };

  const handleSubmit = () => {
    if (!label.trim()) return;
    if (needsOptions(type) && options.length < 2) return;

    const question: ApplicationQuestion = {
      id: editQuestion?.id || `question-${Date.now()}`,
      type,
      label: label.trim(),
      description: description.trim() || undefined,
      required,
      options: needsOptions(type) ? options : undefined,
      validation: getDefaultValidation(type),
      order: editQuestion?.order || nextOrder,
      evaluation: evaluation,
    };

    // Save to library if checked and not editing
    if (saveToLibrary && !editQuestion) {
      saveQuestionToLibrary({
        ...question,
        libraryId: `user-${Date.now()}`,
        isSystemTemplate: false,
        savedAt: new Date().toISOString(),
        usageCount: 0,
        category: category || undefined,
      });

      toast({
        title: "Question Saved",
        description: "Question added to your library for future use",
      });
    }

    onAdd(question);
    resetForm();
    onOpenChange(false);
  };

  const handleTypeChange = (newType: QuestionType) => {
    setType(newType);
    if (!needsOptions(newType)) {
      setOptions([]);
    }
  };

  const questionTypes: QuestionType[] = [
    'short_text',      // Short Answer
    'long_text',       // Long Answer
    'multiple_choice', // Multiple Choice (single select)
    'checkbox',        // Multiple Choice (multi-select)
    'dropdown',        // Dropdown Selection
    'file_upload',     // File Upload
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editQuestion ? 'Edit Question' : 'Add Question'}
          </DialogTitle>
          <DialogDescription>
            Configure the question details and validation rules
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Question Type</Label>
            <Select value={type} onValueChange={handleTypeChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {questionTypes.map((qType) => {
                  const Icon = questionTypeIcons[qType];
                  return (
                    <SelectItem key={qType} value={qType}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        {questionTypeLabels[qType]}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="question-label">Question Label *</Label>
            <Input
              id="question-label"
              placeholder="e.g., Why are you interested in this role?"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="question-desc">Description (Optional)</Label>
            <Textarea
              id="question-desc"
              placeholder="Add helpful context or instructions for applicants"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="required-toggle">Required Question</Label>
            <Switch
              id="required-toggle"
              checked={required}
              onCheckedChange={setRequired}
            />
          </div>

          {needsOptions(type) && (
            <div className="space-y-2">
              <Label>Answer Options *</Label>
              <div className="space-y-2">
                {options.map((option, index) => (
                  <div key={option.id} className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground w-6">
                      {index + 1}.
                    </span>
                    <Input
                      value={option.label}
                      disabled
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveOption(option.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground w-6">
                    {options.length + 1}.
                  </span>
                  <Input
                    placeholder="Add an option"
                    value={newOption}
                    onChange={(e) => setNewOption(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddOption();
                      }
                    }}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleAddOption}
                    disabled={!newOption.trim()}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {options.length < 2 && (
                  <p className="text-sm text-muted-foreground">
                    Add at least 2 options for this question type
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Smart Evaluation Settings */}
          <Separator className="my-4" />
          <QuestionEvaluationSettingsComponent
            questionType={type}
            options={options}
            evaluation={evaluation}
            onChange={setEvaluation}
          />

          {/* Save to Library section - only for new questions */}
          {!editQuestion && (
            <>
              <Separator className="my-4" />
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="save-to-library"
                    checked={saveToLibrary}
                    onCheckedChange={(checked) => setSaveToLibrary(checked as boolean)}
                  />
                  <Label
                    htmlFor="save-to-library"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <BookmarkPlus className="h-4 w-4" />
                      Save this question to my library for future use
                    </div>
                  </Label>
                </div>

                {saveToLibrary && (
                  <div className="space-y-2 ml-6">
                    <Label htmlFor="category">Category (Optional)</Label>
                    <Input
                      id="category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      placeholder="e.g., Motivation, Experience, Legal..."
                      list="category-suggestions"
                    />
                    <datalist id="category-suggestions">
                      {categories.map((cat) => (
                        <option key={cat} value={cat} />
                      ))}
                    </datalist>
                    <p className="text-xs text-muted-foreground">
                      Organize questions by category for easier browsing
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!label.trim() || (needsOptions(type) && options.length < 2)}
          >
            {editQuestion ? 'Update Question' : 'Add Question'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
