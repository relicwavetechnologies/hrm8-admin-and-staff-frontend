import { Button } from '@/shared/components/ui/button';
import { Edit3, Lock } from 'lucide-react';

interface EditModeToggleProps {
  isEditMode: boolean;
  onToggle: () => void;
}

export function EditModeToggle({ isEditMode, onToggle }: EditModeToggleProps) {
  return (
    <Button
      variant={isEditMode ? "default" : "outline-primary"}
      size="sm"
      onClick={onToggle}
    >
      {isEditMode ? (
        <>
          <Lock className="h-4 w-4" />
          Exit Edit Mode
        </>
      ) : (
        <>
          <Edit3 className="h-4 w-4" />
          Edit Layout
        </>
      )}
    </Button>
  );
}
