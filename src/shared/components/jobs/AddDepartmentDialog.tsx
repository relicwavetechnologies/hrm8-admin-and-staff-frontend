import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect } from "react";
import { Department } from "@/shared/types/entities";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { Button } from "@/shared/components/ui/button";
import { Building2 } from "lucide-react";

const departmentSchema = z.object({
  name: z.string().min(2, "Department name must be at least 2 characters").max(50),
  description: z.string().max(200).optional(),
  headOfDepartment: z.string().max(100).optional(),
  costCenter: z.string().max(50).optional(),
});

type DepartmentFormData = z.infer<typeof departmentSchema>;

interface AddDepartmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (department: DepartmentFormData) => void;
  employerName?: string;
  editMode?: boolean;
  initialData?: Department;
}

export function AddDepartmentDialog({
  open,
  onOpenChange,
  onAdd,
  employerName,
  editMode = false,
  initialData,
}: AddDepartmentDialogProps) {
  const form = useForm<DepartmentFormData>({
    resolver: zodResolver(departmentSchema),
    defaultValues: initialData ? {
      name: initialData.name,
      description: initialData.description || "",
      headOfDepartment: initialData.headOfDepartment || "",
      costCenter: initialData.costCenter || "",
    } : {
      name: "",
      description: "",
      headOfDepartment: "",
      costCenter: "",
    },
  });

  // Reset form when editing different department
  useEffect(() => {
    if (editMode && initialData) {
      form.reset({
        name: initialData.name,
        description: initialData.description || "",
        headOfDepartment: initialData.headOfDepartment || "",
        costCenter: initialData.costCenter || "",
      });
    } else if (!editMode) {
      form.reset({
        name: "",
        description: "",
        headOfDepartment: "",
        costCenter: "",
      });
    }
  }, [editMode, initialData, form]);

  const onSubmit = (data: DepartmentFormData) => {
    onAdd(data);
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            {editMode ? "Edit Department" : "Add New Department"}
          </DialogTitle>
          <DialogDescription>
            {editMode 
              ? `Update the department details for ${employerName || "this employer"}.`
              : employerName 
                ? `Add a new department to ${employerName}'s profile.`
                : "Add a new department. This will be available for future jobs."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Engineering, Sales, Marketing" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Brief description of this department..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Max 200 characters
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="headOfDepartment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department Head (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. John Smith" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="costCenter"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cost Center (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. CC-1001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">{editMode ? "Update Department" : "Add Department"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
