import { GripVertical, Pencil, Trash2 } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import type { QuestionnaireQuestion } from '@/types/referee';

interface QuestionItemProps {
  question: QuestionnaireQuestion;
  index: number;
  onEdit: (question: QuestionnaireQuestion) => void;
  onDelete: (id: string) => void;
}

export function QuestionItem({ question, index, onEdit, onDelete }: QuestionItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'rating': return 'Rating Scale';
      case 'yes-no': return 'Yes/No';
      case 'text': return 'Short Text';
      case 'textarea': return 'Long Text';
      default: return type;
    }
  };

  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case 'rating': return 'default';
      case 'yes-no': return 'secondary';
      case 'text': return 'outline';
      case 'textarea': return 'outline';
      default: return 'default';
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-start gap-3 p-4 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors"
    >
      <button
        className="mt-1 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-5 w-5" />
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium text-muted-foreground">Q{index + 1}</span>
              <Badge variant={getTypeBadgeVariant(question.type)}>
                {getTypeLabel(question.type)}
              </Badge>
              {question.required && (
                <Badge variant="destructive" className="text-xs">Required</Badge>
              )}
            </div>
            <p className="text-sm font-medium text-foreground">{question.question}</p>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(question)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(question.id)}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>

        {question.type === 'rating' && question.ratingScale && (
          <div className="text-xs text-muted-foreground">
            Scale: {question.ratingScale.min}-{question.ratingScale.max}
            {question.ratingScale.labels && ` (${question.ratingScale.labels.join(', ')})`}
          </div>
        )}
        {question.placeholder && (
          <div className="text-xs text-muted-foreground">
            Placeholder: {question.placeholder}
          </div>
        )}
        {question.maxLength && (
          <div className="text-xs text-muted-foreground">
            Max length: {question.maxLength} characters
          </div>
        )}
      </div>
    </div>
  );
}
