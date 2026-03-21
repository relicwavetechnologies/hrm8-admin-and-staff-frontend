// @ts-nocheck
import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { RichTextEditor } from '@/shared/components/ui/rich-text-editor';
import { Card } from '@/shared/components/ui/card';
import { Save, Edit2 } from 'lucide-react';
import { useToast } from '@/shared/hooks/use-toast';
import type { Interview } from '@/shared/types/interview';

interface InterviewNotesSectionProps {
  interview: Interview;
  onSave?: (notes: string) => void;
}

export function InterviewNotesSection({ interview, onSave }: InterviewNotesSectionProps) {
  const [isEditing, setIsEditing] = useState(!interview.notes);
  const [notes, setNotes] = useState(interview.notes || '');
  const { toast } = useToast();

  const handleSave = () => {
    onSave?.(notes);
    setIsEditing(false);
    toast({
      title: 'Notes saved',
      description: 'Interview notes have been updated successfully.',
    });
  };

  const handleCancel = () => {
    setNotes(interview.notes || '');
    setIsEditing(false);
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">Interview Notes</h3>
          <p className="text-sm text-muted-foreground">
            Collaborative notes for all interviewers
          </p>
        </div>
        {!isEditing && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(true)}
          >
            <Edit2 className="h-4 w-4 mr-2" />
            Edit Notes
          </Button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-4">
          <RichTextEditor
            content={notes}
            onChange={setNotes}
            placeholder="Take notes during the interview... You can format text, add lists, and insert links."
          />
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Notes
            </Button>
          </div>
        </div>
      ) : (
        <div className="prose prose-sm max-w-none">
          {notes ? (
            <div dangerouslySetInnerHTML={{ __html: notes }} />
          ) : (
            <p className="text-muted-foreground italic">
              No notes added yet. Click "Edit Notes" to start taking notes.
            </p>
          )}
        </div>
      )}
    </Card>
  );
}
