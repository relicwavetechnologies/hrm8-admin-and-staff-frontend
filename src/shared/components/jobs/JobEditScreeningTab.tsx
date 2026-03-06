import { UseFormReturn } from "react-hook-form";
import { JobFormData } from "@/shared/types/job";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/shared/components/ui/form";
import { Switch } from "@/shared/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Filter, FileQuestion } from "lucide-react";
import { Textarea } from "@/shared/components/ui/textarea";

interface JobEditScreeningTabProps {
  form: UseFormReturn<JobFormData>;
}

export function JobEditScreeningTab({ form }: JobEditScreeningTabProps) {
  const screeningEnabled = form.watch("screeningEnabled");
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Screening & Evaluation
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Configure automated screening and evaluation criteria
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Screening Configuration</CardTitle>
          <CardDescription>
            Enable and configure automated candidate screening
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <FormField
            control={form.control}
            name="screeningEnabled"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Enable Screening</FormLabel>
                  <FormDescription>
                    Enable automated screening for candidates applying to this job
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value || false}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {screeningEnabled && (
            <>
              <FormField
                control={form.control}
                name="automatedScreeningEnabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Automated Screening</FormLabel>
                      <FormDescription>
                        Use AI-powered automated screening to evaluate candidates
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value || false}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="screeningCriteria"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Screening Criteria</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='Enter screening criteria as JSON, e.g. {"minExperience": 2, "requiredSkills": ["JavaScript", "React"]}'
                        value={field.value ? JSON.stringify(field.value, null, 2) : ""}
                        onChange={(e) => {
                          try {
                            const value = e.target.value;
                            if (value.trim() === "") {
                              field.onChange(undefined);
                            } else {
                              field.onChange(JSON.parse(value));
                            }
                          } catch {
                            // Invalid JSON, keep the text value for user to fix
                          }
                        }}
                        rows={8}
                        className="font-mono text-sm"
                      />
                    </FormControl>
                    <FormDescription>
                      Define screening criteria as JSON. This will be used to automatically evaluate candidates.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pre-Interview Questionnaire</CardTitle>
          <CardDescription>
            Configure questions candidates must answer before the interview
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FormField
            control={form.control}
            name="preInterviewQuestionnaireEnabled"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base flex items-center gap-2">
                    <FileQuestion className="h-4 w-4" />
                    Enable Pre-Interview Questionnaire
                  </FormLabel>
                  <FormDescription>
                    Require candidates to complete a questionnaire before scheduling an interview
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value || false}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </CardContent>
      </Card>
    </div>
  );
}

