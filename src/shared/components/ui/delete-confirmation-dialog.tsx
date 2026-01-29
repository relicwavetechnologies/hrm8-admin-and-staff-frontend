import { WarningConfirmationDialog } from './warning-confirmation-dialog';

interface DeleteConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  itemName?: string;
  isDeleting?: boolean;
}

/**
 * @deprecated Use WarningConfirmationDialog directly with type="delete"
 * This component is kept for backward compatibility
 */
export function DeleteConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
  title = 'Are you sure?',
  description,
  itemName,
  isDeleting = false,
}: DeleteConfirmationDialogProps) {
  const defaultDescription = itemName
    ? `This will permanently delete "${itemName}". This action cannot be undone.`
    : 'This action cannot be undone. This will permanently delete the item.';

  return (
    <WarningConfirmationDialog
      open={open}
      onOpenChange={onOpenChange}
      onConfirm={onConfirm}
      type="delete"
      title={title}
      description={description || defaultDescription}
      isProcessing={isDeleting}
    />
  );
}
