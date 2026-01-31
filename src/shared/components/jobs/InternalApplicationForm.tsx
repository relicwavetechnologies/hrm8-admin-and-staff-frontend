import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/shared/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/shared/components/ui/form";
import { Textarea } from "@/shared/components/ui/textarea";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Badge } from "@/shared/components/ui/badge";
import { Building2 } from "lucide-react";

const internalApplicationSchema = z.object({
  reasonForTransfer: z.string().min(50, "Please provide a detailed reason (minimum 50 characters)"),
  relevantExperience: z.string().min(50, "Please describe your relevant experience"),
  notifyManager: z.boolean().default(false),
});

type InternalApplicationFormData = z.infer<typeof internalApplicationSchema>;

interface InternalApplicationFormProps {
  jobTitle: string;
  currentPosition: string;
  currentDepartment: string;
  onSubmit: (data: InternalApplicationFormData) => void;
  onCancel: () => void;
}

export function InternalApplicationForm({
  jobTitle,
  currentPosition,
  currentDepartment,
  onSubmit,
  onCancel,
}: InternalApplicationFormProps) {
  const form = useForm<InternalApplicationFormData>({
    resolver: zodResolver(internalApplicationSchema),
    defaultValues: {
      notifyManager: false,
    },
  });

  return (
    <div className="space-y-6">
      <div className="bg-muted/50 p-4 rounded-lg space-y-2">
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" />
          <Badge variant="secondary">Internal Transfer</Badge>
        </div>
        <h3 className="font-semibold text-lg">{jobTitle}</h3>
        <p className="text-sm text-muted-foreground">
          Current: {currentPosition} - {currentDepartment}
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="reasonForTransfer"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Why are you interested in this position?</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Explain why you want to transfer to this role and how it aligns with your career goals..."
                    rows={5}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Share your motivation and how this role fits your career development
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="relevantExperience"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Relevant Experience & Skills</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe your relevant experience, projects, and skills that make you suitable for this position..."
                    rows={5}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Highlight accomplishments from your current role that are relevant to this position
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="notifyManager"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    Notify my current manager
                  </FormLabel>
                  <FormDescription>
                    Your current manager will be informed about your internal application. 
                    Unchecking this keeps your application confidential.
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />

          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Note:</strong> Your current employment details and performance history 
              will be automatically included in your application.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">Submit Internal Application</Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
