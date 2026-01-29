import { useState, useEffect, ReactNode } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  Trash2, 
  Archive,
  X,
  LucideIcon
} from "lucide-react";
import { cn } from "@/shared/lib/utils";

export type WarningType = 
  | 'delete' 
  | 'archive' 
  | 'unarchive'
  | 'cancel' 
  | 'warning' 
  | 'info'
  | 'custom';

export type WarningSeverity = 'destructive' | 'warning' | 'info' | 'default';

interface WarningConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void | Promise<void>;
  
  // Content
  title: string;
  description?: string;
  
  // Type and severity
  type?: WarningType;
  severity?: WarningSeverity;
  
  // Custom icon (optional, will use default based on type)
  icon?: LucideIcon;
  
  // Buttons
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  
  // Processing state
  isProcessing?: boolean;
  
  // Confirmation requirements
  requireTextConfirmation?: string; // e.g., "DELETE" - user must type this to confirm
  requireCheckboxConfirmation?: string; // Checkbox label - user must check this to confirm
  requireBothConfirmations?: boolean; // If true, both text and checkbox are required
  
  // Custom content sections
  alertContent?: ReactNode; // Custom alert/content to show
  detailsContent?: ReactNode; // Additional details/content
  
  // Items to list in warning (for delete operations)
  items?: Array<{ label: string; value?: string }>;
  
  // Additional warning points (shown as bullet list)
  warningPoints?: string[];
}

const DEFAULT_CONFIG = {
  delete: {
    icon: Trash2,
    severity: 'destructive' as WarningSeverity,
    confirmVariant: 'destructive' as const,
    defaultTitle: 'Delete Item',
    defaultDescription: 'This action cannot be undone.',
  },
  archive: {
    icon: Archive,
    severity: 'warning' as WarningSeverity,
    confirmVariant: 'default' as const,
    defaultTitle: 'Archive Item',
    defaultDescription: 'This item will be hidden from active listings.',
  },
  unarchive: {
    icon: Archive,
    severity: 'info' as WarningSeverity,
    confirmVariant: 'default' as const,
    defaultTitle: 'Unarchive Item',
    defaultDescription: 'This item will be restored to active listings.',
  },
  cancel: {
    icon: X,
    severity: 'warning' as WarningSeverity,
    confirmVariant: 'default' as const,
    defaultTitle: 'Cancel Action',
    defaultDescription: 'Are you sure you want to cancel?',
  },
  warning: {
    icon: AlertTriangle,
    severity: 'warning' as WarningSeverity,
    confirmVariant: 'default' as const,
    defaultTitle: 'Warning',
    defaultDescription: 'Please confirm this action.',
  },
  info: {
    icon: Info,
    severity: 'info' as WarningSeverity,
    confirmVariant: 'default' as const,
    defaultTitle: 'Confirm Action',
    defaultDescription: 'Please confirm to continue.',
  },
  custom: {
    icon: AlertCircle,
    severity: 'default' as WarningSeverity,
    confirmVariant: 'default' as const,
    defaultTitle: 'Confirm',
    defaultDescription: 'Are you sure?',
  },
};

export function WarningConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  type = 'warning',
  severity,
  icon: CustomIcon,
  confirmLabel,
  cancelLabel = 'Cancel',
  confirmVariant,
  isProcessing = false,
  requireTextConfirmation,
  requireCheckboxConfirmation,
  requireBothConfirmations = false,
  alertContent,
  detailsContent,
  items,
  warningPoints,
}: WarningConfirmationDialogProps) {
  const [confirmText, setConfirmText] = useState("");
  const [confirmCheckbox, setConfirmCheckbox] = useState(false);

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setConfirmText("");
      setConfirmCheckbox(false);
    }
  }, [open]);

  const config = DEFAULT_CONFIG[type] || DEFAULT_CONFIG.custom;
  const effectiveSeverity = severity || config.severity;
  const effectiveConfirmVariant = confirmVariant || config.confirmVariant;
  const Icon = CustomIcon || config.icon;

  // Determine if confirmation is valid
  const hasTextConfirmation = requireTextConfirmation 
    ? confirmText.toUpperCase() === requireTextConfirmation.toUpperCase()
    : true;
  
  const hasCheckboxConfirmation = requireCheckboxConfirmation
    ? confirmCheckbox
    : true;

  const isConfirmValid = requireBothConfirmations
    ? hasTextConfirmation && hasCheckboxConfirmation
    : hasTextConfirmation && hasCheckboxConfirmation;

  const handleConfirm = async () => {
    if (!isConfirmValid) return;
    await onConfirm();
  };

  const handleCancel = () => {
    setConfirmText("");
    setConfirmCheckbox(false);
    onOpenChange(false);
  };

  // Determine button text
  const getConfirmLabel = () => {
    if (confirmLabel) return confirmLabel;
    if (isProcessing) {
      switch (type) {
        case 'delete': return 'Deleting...';
        case 'archive': return 'Archiving...';
        case 'unarchive': return 'Unarchiving...';
        case 'cancel': return 'Cancelling...';
        default: return 'Processing...';
      }
    }
    switch (type) {
      case 'delete': return 'Delete';
      case 'archive': return 'Archive';
      case 'unarchive': return 'Unarchive';
      case 'cancel': return 'Cancel';
      default: return 'Confirm';
    }
  };

  // Get alert variant based on severity
  const getAlertVariant = (): "default" | "destructive" => {
    return effectiveSeverity === 'destructive' ? 'destructive' : 'default';
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-lg">
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            <Icon 
              className={cn(
                "h-5 w-5",
                effectiveSeverity === 'destructive' && "text-destructive",
                effectiveSeverity === 'warning' && "text-yellow-600",
                effectiveSeverity === 'info' && "text-blue-600",
                effectiveSeverity === 'default' && "text-muted-foreground"
              )} 
            />
            <AlertDialogTitle>{title}</AlertDialogTitle>
          </div>
          {description && (
            <AlertDialogDescription>{description}</AlertDialogDescription>
          )}
        </AlertDialogHeader>

        <div className="space-y-4 py-4">
          {/* Custom alert content or default warning */}
          {alertContent ? (
            alertContent
          ) : (
            effectiveSeverity === 'destructive' && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {warningPoints && warningPoints.length > 0 ? (
                    <>
                      <strong>Warning: This action is permanent!</strong>
                      <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                        {warningPoints.map((point, index) => (
                          <li key={index}>{point}</li>
                        ))}
                      </ul>
                    </>
                  ) : (
                    <strong>Warning: This action cannot be undone.</strong>
                  )}
                </AlertDescription>
              </Alert>
            )
          )}

          {/* Items list */}
          {items && items.length > 0 && (
            <div className="p-3 bg-muted rounded-md space-y-1">
              {items.map((item, index) => (
                <div key={index}>
                  <p className="text-sm font-medium">{item.label}</p>
                  {item.value && (
                    <p className="text-xs text-muted-foreground">{item.value}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Details content */}
          {detailsContent}

          {/* Text confirmation */}
          {requireTextConfirmation && (
            <div className="space-y-2">
              <Label htmlFor="confirm-text">
                Type <strong className={cn(
                  effectiveSeverity === 'destructive' && "text-destructive"
                )}>{requireTextConfirmation}</strong> to confirm
              </Label>
              <Input
                id="confirm-text"
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder={requireTextConfirmation}
                className="font-mono"
                disabled={isProcessing}
              />
            </div>
          )}

          {/* Checkbox confirmation */}
          {requireCheckboxConfirmation && (
            <div className="flex items-start space-x-3 p-3 border rounded-md bg-muted/50">
              <Checkbox
                id="confirm-checkbox"
                checked={confirmCheckbox}
                onCheckedChange={(checked) => setConfirmCheckbox(checked as boolean)}
                disabled={isProcessing}
                className="mt-1"
              />
              <label 
                htmlFor="confirm-checkbox" 
                className="text-sm leading-relaxed cursor-pointer"
              >
                {requireCheckboxConfirmation}
              </label>
            </div>
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel 
            onClick={handleCancel}
            disabled={isProcessing}
          >
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isProcessing || !isConfirmValid}
            className={cn(
              effectiveConfirmVariant === 'destructive' && 
              "bg-destructive text-destructive-foreground hover:bg-destructive/90"
            )}
          >
            {getConfirmLabel()}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

