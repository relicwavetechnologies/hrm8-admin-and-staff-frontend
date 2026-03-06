import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Textarea } from "@/shared/components/ui/textarea";
import { Badge } from "@/shared/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { MessageSquare, CheckSquare, Plus, Lock, Globe } from "lucide-react";
import { getJobNotes, addJobNote, getJobTasks } from "@/shared/lib/jobCollaborationService";
import { formatDistanceToNow } from "date-fns";

interface JobCollaborationPanelProps {
  jobId: string;
}

export function JobCollaborationPanel({ jobId }: JobCollaborationPanelProps) {
  const [noteContent, setNoteContent] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const notes = getJobNotes(jobId);
  const tasks = getJobTasks(jobId);

  const handleAddNote = () => {
    if (!noteContent.trim()) return;

    addJobNote(jobId, noteContent, isPrivate, "Current User");
    setNoteContent("");
    setIsPrivate(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Collaboration</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="notes">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="notes">
              <MessageSquare className="h-4 w-4 mr-2" />
              Notes
            </TabsTrigger>
            <TabsTrigger value="tasks">
              <CheckSquare className="h-4 w-4 mr-2" />
              Tasks
            </TabsTrigger>
          </TabsList>

          <TabsContent value="notes" className="space-y-4">
            <div className="space-y-3">
              <Textarea
                placeholder="Add a note... (use @name to mention someone)"
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                rows={3}
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="private"
                    checked={isPrivate}
                    onCheckedChange={(checked) => setIsPrivate(checked as boolean)}
                  />
                  <label htmlFor="private" className="text-sm flex items-center gap-1">
                    {isPrivate ? <Lock className="h-3 w-3" /> : <Globe className="h-3 w-3" />}
                    {isPrivate ? "Private" : "Visible to team"}
                  </label>
                </div>
                <Button size="sm" onClick={handleAddNote}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Note
                </Button>
              </div>
            </div>

            <div className="space-y-3 mt-6">
              {notes.map((note) => (
                <div key={note.id} className="p-3 border rounded-lg space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-sm">{note.createdBy}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(note.createdAt, { addSuffix: true })}
                      </p>
                    </div>
                    {note.isPrivate && (
                      <Badge variant="outline" className="text-xs">
                        <Lock className="h-3 w-3 mr-1" />
                        Private
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm">{note.content}</p>
                  {note.mentions.length > 0 && (
                    <div className="flex gap-1">
                      {note.mentions.map((mention) => (
                        <Badge key={mention} variant="secondary" className="text-xs">
                          @{mention}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="tasks" className="space-y-4">
            <Button size="sm" className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>

            <div className="space-y-3">
              {tasks.map((task) => (
                <div key={task.id} className="p-3 border rounded-lg space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-2">
                      <Checkbox
                        checked={task.status === "completed"}
                        className="mt-1"
                      />
                      <div>
                        <p className="font-medium text-sm">{task.title}</p>
                        {task.description && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {task.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <Badge
                      variant={
                        task.priority === "high" ? "coral" :
                          task.priority === "medium" ? "orange" : "secondary"
                      }
                    >
                      {task.priority}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Assigned to: {task.assignedTo}</span>
                    {task.dueDate && (
                      <span>Due: {formatDistanceToNow(task.dueDate, { addSuffix: true })}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
