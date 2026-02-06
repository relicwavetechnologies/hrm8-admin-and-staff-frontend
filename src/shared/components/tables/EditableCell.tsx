import { useState, useEffect, useRef } from "react";
import { Input } from "@/shared/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Button } from "@/shared/components/ui/button";
import { Check, X, Pencil } from "lucide-react";

export type EditableFieldType = "text" | "select" | "number" | "date";

export interface SelectOption {
  value: string;
  label: string;
}

interface EditableCellProps {
  value: any;
  onSave: (value: any) => void;
  onCancel: () => void;
  fieldType?: EditableFieldType;
  selectOptions?: SelectOption[];
  isEditing: boolean;
  onStartEdit: () => void;
  renderView?: (value: any) => React.ReactNode;
}

export function EditableCell({
  value,
  onSave,
  onCancel,
  fieldType = "text",
  selectOptions = [],
  isEditing,
  onStartEdit,
  renderView,
}: EditableCellProps) {
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      setEditValue(value);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [isEditing, value]);

  const handleSave = () => {
    onSave(editValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      e.preventDefault();
      onCancel();
    }
  };

  if (!isEditing) {
    return (
      <div className="group flex items-center justify-between gap-2">
        <span className="flex-1">
          {renderView ? renderView(value) : String(value ?? '')}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={onStartEdit}
        >
          <Pencil className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {fieldType === "select" ? (
        <Select value={editValue} onValueChange={setEditValue}>
          <SelectTrigger className="h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {selectOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <Input
          ref={inputRef}
          type={fieldType}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="h-8"
        />
      )}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-green-600 hover:text-green-700 hover:bg-green-50"
          onClick={handleSave}
        >
          <Check className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={onCancel}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
