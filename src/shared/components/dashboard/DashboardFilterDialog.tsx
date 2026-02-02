import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Filter as FilterIcon } from "lucide-react";

interface FilterOption {
  value: string;
  label: string;
}

interface DashboardFilterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: {
    name: string;
    label: string;
    value: string;
    options: FilterOption[];
    onChange: (value: string) => void;
  }[];
  onReset: () => void;
  onApply: () => void;
  title?: string;
  description?: string;
}

export function DashboardFilterDialog({
  open,
  onOpenChange,
  filters,
  onReset,
  onApply,
  title = "Dashboard Filters",
  description = "Apply filters to customize your dashboard view",
}: DashboardFilterDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <FilterIcon className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {filters.map((filter) => (
            <div key={filter.name} className="space-y-2">
              <Label>{filter.label}</Label>
              <Select value={filter.value} onValueChange={filter.onChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {filter.options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
          <div className="flex gap-2">
            <Button onClick={onReset} variant="outline" className="flex-1">
              Reset Filters
            </Button>
            <Button onClick={onApply} className="flex-1">
              Apply
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
