import { UseFormReturn } from "react-hook-form";
import { JobFormData, Job } from "@/shared/types/job";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { User, Briefcase } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";

interface JobEditConsultantAssignmentTabProps {
  form: UseFormReturn<JobFormData>;
  job: Job | null;
}

export function JobEditConsultantAssignmentTab({ form, job }: JobEditConsultantAssignmentTabProps) {
  const assignedConsultantId = form.watch("assignedConsultantId");
  const assignmentMode = form.watch("assignmentMode");

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Briefcase className="h-5 w-5" />
          Consultant Assignment
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Assign a consultant to manage this job posting
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Assignment Settings</CardTitle>
          <CardDescription>
            Configure how consultants are assigned to this job
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <FormField
            control={form.control}
            name="assignmentMode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Assignment Mode</FormLabel>
                <Select
                  value={field.value || "AUTO"}
                  onValueChange={(value) => field.onChange(value as "AUTO" | "MANUAL")}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select assignment mode" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="AUTO">Automatic</SelectItem>
                    <SelectItem value="MANUAL">Manual</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  {field.value === "AUTO" || !field.value
                    ? "Consultants will be automatically assigned based on matching criteria"
                    : "You will manually select a consultant for this job"}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {(assignmentMode === "MANUAL" || !assignmentMode) && (
            <FormField
              control={form.control}
              name="assignedConsultantId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assigned Consultant</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter consultant ID"
                      value={field.value || ""}
                      onChange={(e) => field.onChange(e.target.value || undefined)}
                    />
                  </FormControl>
                  <FormDescription>
                    Enter the ID of the consultant to assign to this job. Leave empty to unassign.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {assignedConsultantId && job?.assignedConsultantName && (
            <div className="rounded-lg border p-4 bg-muted/50">
              <div className="flex items-start gap-4">
                <div className="rounded-full bg-primary/10 p-2">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{job.assignedConsultantName}</span>
                    <Badge variant="secondary">Assigned</Badge>
                  </div>
                  {assignedConsultantId && (
                    <p className="text-sm text-muted-foreground">ID: {assignedConsultantId}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {!assignedConsultantId && (
            <div className="rounded-lg border border-dashed p-6 text-center">
              <User className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                No consultant assigned to this job
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

