import { ApplicationQuestion } from "@/shared/types/applicationForm";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { GripVertical, MoreVertical, Edit, Copy, Trash2, BookmarkPlus, Sparkles } from "lucide-react";
import { questionTypeLabels, questionTypeIcons } from "@/shared/lib/applicationFormUtils";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface ApplicationQuestionCardProps {
  question: ApplicationQuestion;
  onEdit: (question: ApplicationQuestion) => void;
  onDuplicate: (question: ApplicationQuestion) => void;
  onDelete: (questionId: string) => void;
  onSaveToLibrary?: (question: ApplicationQuestion) => void;
}

export function ApplicationQuestionCard({
  question,
  onEdit,
  onDuplicate,
  onDelete,
  onSaveToLibrary,
}: ApplicationQuestionCardProps) {
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

  const TypeIcon = questionTypeIcons[question.type];

  // Check if evaluation settings are enabled
  const hasEvaluation = question.evaluation && (
    question.evaluation.mandatory?.enabled ||
    question.evaluation.scoring?.enabled ||
    question.evaluation.autoTagging?.enabled ||
    question.evaluation.triggers?.enabled
  );

  // Get evaluation summary for tooltip
  const getEvaluationSummary = () => {
    if (!question.evaluation) return '';
    const parts: string[] = [];
    if (question.evaluation.mandatory?.enabled) {
      parts.push('Auto-disqualify');
    }
    if (question.evaluation.scoring?.enabled) {
      parts.push('Scoring');
    }
    if (question.evaluation.autoTagging?.enabled) {
      parts.push('Auto-tagging');
    }
    if (question.evaluation.triggers?.enabled) {
      parts.push('Triggers');
    }
    return parts.join(', ');
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-start gap-3 p-4 border rounded-lg bg-card"
    >
      <button
        type="button"
        className="cursor-grab active:cursor-grabbing mt-1"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2 mb-2">
          <div className="flex items-center gap-2 flex-1">
            <TypeIcon className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="font-medium">{question.order}.</span>
            <span className="flex-1">{question.label}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Badge variant="outline" className="text-xs">
              {questionTypeLabels[question.type]}
            </Badge>
            {question.required && (
              <Badge variant="destructive" className="text-xs">
                Required
              </Badge>
            )}
            {hasEvaluation && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge 
                      variant="secondary" 
                      className="text-xs bg-gradient-to-r from-purple-500/10 to-blue-500/10 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-700"
                    >
                      <Sparkles className="h-3 w-3 mr-1" />
                      Smart Eval
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs">
                    <div className="space-y-1">
                      <p className="font-semibold text-sm">Smart Evaluation Active</p>
                      <p className="text-xs text-muted-foreground">
                        {getEvaluationSummary()}
                      </p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>

        {question.description && (
          <p className="text-sm text-muted-foreground mb-2">
            {question.description}
          </p>
        )}

        {question.options && question.options.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {question.options.slice(0, 3).map((option) => (
              <Badge key={option.id} variant="outline" className="text-xs">
                {option.label}
              </Badge>
            ))}
            {question.options.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{question.options.length - 3} more
              </Badge>
            )}
          </div>
        )}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button type="button" variant="ghost" size="icon" className="shrink-0">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onEdit(question)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onDuplicate(question)}>
            <Copy className="h-4 w-4 mr-2" />
            Duplicate
          </DropdownMenuItem>
          
          {onSaveToLibrary && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onSaveToLibrary(question)}>
                <BookmarkPlus className="h-4 w-4 mr-2" />
                Save to Library
              </DropdownMenuItem>
            </>
          )}
          
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => onDelete(question.id)}
            className="text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
