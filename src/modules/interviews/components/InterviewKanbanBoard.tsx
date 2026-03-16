// @ts-nocheck
import { useState, useEffect } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { InterviewKanbanColumn } from "./InterviewKanbanColumn";
import { InterviewKanbanCard } from "./InterviewKanbanCard";
import { Card } from "@/shared/components/ui/card";
import { getInterviews, updateInterview } from "@/shared/lib/mockInterviewStorage";
import type { Interview } from "@/shared/types/interview";
import { toast } from "@/shared/hooks/use-toast";

interface InterviewKanbanBoardProps {
  onRefresh?: () => void;
  onViewDetails?: (interview: Interview) => void;
}

interface Column {
  id: Interview['status'];
  title: string;
  color: string;
}

const columns: Column[] = [
  {
    id: "scheduled",
    title: "Scheduled",
    color: "bg-primary/5",
  },
  {
    id: "completed",
    title: "Completed",
    color: "bg-success/5",
  },
  {
    id: "cancelled",
    title: "Cancelled",
    color: "bg-muted",
  },
  {
    id: "no-show",
    title: "No Show",
    color: "bg-destructive/5",
  },
];

export function InterviewKanbanBoard({ onRefresh, onViewDetails }: InterviewKanbanBoardProps) {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [activeInterview, setActiveInterview] = useState<Interview | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    loadInterviews();
  }, []);

  const loadInterviews = () => {
    setInterviews(getInterviews());
  };

  const handleDragStart = (event: DragStartEvent) => {
    const interview = interviews.find((i) => i.id === event.active.id);
    setActiveInterview(interview || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveInterview(null);

    if (!over) return;

    const interviewId = active.id as string;
    const newStatus = over.id as Interview['status'];

    const interview = interviews.find((i) => i.id === interviewId);
    if (!interview || interview.status === newStatus) return;

    // Update the interview status
    updateInterview(interviewId, { status: newStatus });
    loadInterviews();
    onRefresh?.();

    toast({
      title: "Interview Updated",
      description: `Interview moved to ${newStatus}`,
    });
  };

  const getInterviewsByStatus = (status: Interview['status']) => {
    return interviews.filter((interview) => interview.status === status);
  };

  const handleViewDetailsInternal = (interview: Interview) => {
    onViewDetails?.(interview);
  };

  const handleSendEmail = (interview: Interview) => {
    toast({
      title: "Send Email",
      description: `Sending email to ${interview.candidateName}`,
    });
  };

  const handleReschedule = (interview: Interview) => {
    toast({
      title: "Reschedule",
      description: `Rescheduling interview with ${interview.candidateName}`,
    });
  };

  const handleComplete = (interview: Interview) => {
    updateInterview(interview.id, { status: 'completed' });
    loadInterviews();
    onRefresh?.();
    toast({
      title: "Interview Completed",
      description: `Interview with ${interview.candidateName} marked as completed`,
    });
  };

  const handleCancel = (interview: Interview) => {
    updateInterview(interview.id, { status: 'cancelled' });
    loadInterviews();
    onRefresh?.();
    toast({
      title: "Interview Cancelled",
      description: `Interview with ${interview.candidateName} has been cancelled`,
    });
  };

  return (
    <div className="bg-gradient-soft rounded-lg p-6">
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {columns.map((column) => (
            <InterviewKanbanColumn
              key={column.id}
              id={column.id}
              title={column.title}
              interviews={getInterviewsByStatus(column.id)}
              color={column.color}
              onViewDetails={handleViewDetailsInternal}
              onSendEmail={handleSendEmail}
              onReschedule={handleReschedule}
              onComplete={handleComplete}
              onCancel={handleCancel}
            />
          ))}
        </div>

        <DragOverlay>
          {activeInterview ? (
            <Card className="shadow-xl opacity-90 rotate-3">
              <InterviewKanbanCard interview={activeInterview} />
            </Card>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
