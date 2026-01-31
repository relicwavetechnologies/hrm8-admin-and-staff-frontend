import { UseFormReturn } from "react-hook-form";
import { JobFormData, Job } from "@/shared/types/job";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/shared/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Switch } from "@/shared/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { CalendarIcon, Settings, Eye, EyeOff, Video } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import { Button } from "@/shared/components/ui/button";
import { Calendar } from "@/shared/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/shared/lib/utils";

interface JobEditSettingsTabProps {
  form: UseFormReturn<JobFormData>;
  job: Job | null;
}

export function JobEditSettingsTab({ form, job }: JobEditSettingsTabProps) {

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Job Settings & Visibility
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Configure job status, visibility, and other settings
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Job Status</CardTitle>
          <CardDescription>
            Control the current status of this job posting
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select
                  value={field.value || "draft"}
                  onValueChange={(value) => field.onChange(value as "draft" | "open")}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Draft jobs are not visible to candidates. Open jobs are live and accepting applications.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Visibility Settings</CardTitle>
          <CardDescription>
            Control who can see this job posting
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <FormField
            control={form.control}
            name="visibility"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Visibility</FormLabel>
                <Select
                  value={field.value || "public"}
                  onValueChange={(value) => field.onChange(value as "public" | "private")}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select visibility" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Public jobs are visible on job boards. Private jobs are only accessible via direct link.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="stealth"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base flex items-center gap-2">
                    {field.value ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    Stealth Mode
                  </FormLabel>
                  <FormDescription>
                    Hide company name from job listing (anonymous posting)
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

      <Card>
        <CardHeader>
          <CardTitle>Important Dates</CardTitle>
          <CardDescription>
            Set posting and closing dates for this job
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {job?.postingDate && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Posting Date</label>
              <p className="text-sm text-muted-foreground">
                {new Date(job.postingDate).toLocaleDateString()}
              </p>
            </div>
          )}

          <FormField
            control={form.control}
            name="closeDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Close Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(new Date(field.value), "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={(date) => {
                        field.onChange(date ? date.toISOString().split("T")[0] : undefined);
                      }}
                      disabled={(date) => date < new Date("1900-01-01")}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormDescription>
                  Date when this job posting will close and stop accepting applications
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Interview Settings</CardTitle>
          <CardDescription>
            Configure video interviewing options
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FormField
            control={form.control}
            name="videoInterviewingEnabled"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base flex items-center gap-2">
                    <Video className="h-4 w-4" />
                    Enable Video Interviewing
                  </FormLabel>
                  <FormDescription>
                    Allow candidates to schedule video interviews for this job
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

