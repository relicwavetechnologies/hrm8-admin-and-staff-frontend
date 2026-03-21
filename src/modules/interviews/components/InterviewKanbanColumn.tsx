// @ts-nocheck
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { InterviewKanbanCard } from "./InterviewKanbanCard";
import { Badge } from "@/shared/components/ui/badge";
import type { Interview } from "@/shared/types/interview";

interface InterviewKanbanColumnProps {
  id: string;
  title: string;
  interviews: Interview[];
  color: string;
  onViewDetails?: (interview: Interview) => void;
  onSendEmail?: (interview: Interview) => void;
  onReschedule?: (interview: Interview) => void;
  onComplete?: (interview: Interview) => void;
  onCancel?: (interview: Interview) => void;
}

export function InterviewKanbanColumn({
  id,
  title,
  interviews,
  color,
  onViewDetails,
  onSendEmail,
  onReschedule,
  onComplete,
  onCancel,
}: InterviewKanbanColumnProps) {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold">{title}</h4>
        <Badge variant="outline">{interviews.length}</Badge>
      </div>

      <SortableContext
        id={id}
        items={interviews.map((interview) => interview.id)}
        strategy={verticalListSortingStrategy}
      >
        <div
          ref={setNodeRef}
          className={`flex-1 space-y-3 p-4 rounded-lg ${color} min-h-[500px]`}
        >
          {interviews.map((interview) => (
            <InterviewKanbanCard
              key={interview.id}
              interview={interview}
              onViewDetails={onViewDetails}
              onSendEmail={onSendEmail}
              onReschedule={onReschedule}
              onComplete={onComplete}
              onCancel={onCancel}
            />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}
