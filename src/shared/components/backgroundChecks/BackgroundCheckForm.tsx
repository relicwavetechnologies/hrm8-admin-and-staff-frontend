import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/shared/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/shared/components/ui/form";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Shield } from "lucide-react";

const backgroundCheckSchema = z.object({
  provider: z.enum(["checkr", "sterling", "hireright", "manual"]),
  checkTypes: z.array(z.string()).min(1, "Select at least one check type"),
});

type BackgroundCheckFormData = z.infer<typeof backgroundCheckSchema>;

interface BackgroundCheckFormProps {
  candidateName: string;
  onSubmit: (data: BackgroundCheckFormData) => void;
  onCancel: () => void;
}

const checkTypes = [
  { id: "criminal", label: "Criminal Record Check", required: true },
  { id: "employment", label: "Employment Verification", required: true },
  { id: "education", label: "Education Verification", required: true },
  { id: "credit", label: "Credit Check", required: false },
  { id: "drug-screen", label: "Drug Screening", required: false },
  { id: "reference", label: "Reference Check", required: false },
  { id: "identity", label: "Identity Verification", required: true },
  { id: "professional-license", label: "Professional License Verification", required: false },
];

export function BackgroundCheckForm({ candidateName, onSubmit, onCancel }: BackgroundCheckFormProps) {
  const form = useForm<BackgroundCheckFormData>({
    resolver: zodResolver(backgroundCheckSchema),
    defaultValues: {
      provider: "checkr",
      checkTypes: ["criminal", "employment", "education", "identity"],
    },
  });

  return (
    <div className="space-y-6">
      <div className="bg-muted/50 p-4 rounded-lg flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Shield className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold">Background Check</h3>
          <p className="text-sm text-muted-foreground">{candidateName}</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="provider"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Background Check Provider</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="checkr">Checkr</SelectItem>
                    <SelectItem value="sterling">Sterling</SelectItem>
                    <SelectItem value="hireright">HireRight</SelectItem>
                    <SelectItem value="manual">Manual Process</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Select the provider for conducting background checks
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="checkTypes"
            render={() => (
              <FormItem>
                <div className="mb-4">
                  <FormLabel>Check Types</FormLabel>
                  <FormDescription>
                    Select all checks to be performed. Required checks are pre-selected.
                  </FormDescription>
                </div>
                <div className="space-y-3">
                  {checkTypes.map((checkType) => (
                    <FormField
                      key={checkType.id}
                      control={form.control}
                      name="checkTypes"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={checkType.id}
                            className="flex flex-row items-start space-x-3 space-y-0"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(checkType.id)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...field.value, checkType.id])
                                    : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== checkType.id
                                        )
                                      );
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {checkType.label}
                              {checkType.required && (
                                <span className="text-destructive ml-1">*</span>
                              )}
                            </FormLabel>
                          </FormItem>
                        );
                      }}
                    />
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>Important:</strong> Candidate consent is required before initiating background checks. 
              An email will be sent to the candidate to provide consent and necessary information.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">Initiate Background Check</Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
