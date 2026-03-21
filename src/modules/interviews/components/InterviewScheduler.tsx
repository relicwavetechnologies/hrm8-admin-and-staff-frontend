// @ts-nocheck
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/shared/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Calendar, Clock, Video, MapPin, Users, FileText } from "lucide-react";
import { Card } from "@/shared/components/ui/card";
import { getTemplates } from "@/shared/lib/mockTemplateStorage";
import type { InterviewTemplate } from "@/shared/types/interviewTemplate";

const interviewSchema = z.object({
  templateId: z.string().optional(),
  scheduledDate: z.string().min(1, "Date is required"),
  scheduledTime: z.string().min(1, "Time is required"),
  duration: z.coerce.number().min(15, "Duration must be at least 15 minutes"),
  type: z.enum(["phone", "video", "in-person", "panel"]),
  location: z.string().optional(),
  meetingLink: z.string().url().optional().or(z.literal("")),
  agenda: z.string().optional(),
  interviewers: z.string().min(1, "At least one interviewer is required"),
});

type InterviewFormData = z.infer<typeof interviewSchema>;

interface InterviewSchedulerProps {
  candidateName: string;
  jobTitle: string;
  onSubmit: (data: InterviewFormData) => void;
  onCancel: () => void;
}

export function InterviewScheduler({ candidateName, jobTitle, onSubmit, onCancel }: InterviewSchedulerProps) {
  const [templates, setTemplates] = useState<InterviewTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<InterviewTemplate | null>(null);

  const form = useForm<InterviewFormData>({
    resolver: zodResolver(interviewSchema),
    defaultValues: {
      type: "video",
      duration: 60,
    },
  });

  useEffect(() => {
    setTemplates(getTemplates());
  }, []);

  useEffect(() => {
    if (selectedTemplate) {
      form.setValue("type", selectedTemplate.type);
      form.setValue("duration", selectedTemplate.duration);

      // Auto-generate agenda from template questions
      const agendaText = selectedTemplate.questions
        .filter(q => q.isRequired)
        .map((q, idx) => `${idx + 1}. ${q.question} (${q.expectedDuration} min)`)
        .join("\n");

      if (agendaText) {
        form.setValue("agenda", agendaText);
      }
    }
  }, [selectedTemplate, form]);

  const interviewType = form.watch("type");

  const handleTemplateChange = (templateId: string) => {
    if (templateId === "none") {
      setSelectedTemplate(null);
      form.setValue("templateId", undefined);
    } else {
      const template = templates.find(t => t.id === templateId);
      if (template) {
        setSelectedTemplate(template);
        form.setValue("templateId", templateId);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-muted/50 p-4 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">{candidateName}</h3>
            <p className="text-sm text-muted-foreground">{jobTitle}</p>
          </div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="templateId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <FileText className="h-4 w-4 inline mr-2" />
                  Interview Template (Optional)
                </FormLabel>
                <Select onValueChange={handleTemplateChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a template to auto-fill" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">No template</SelectItem>
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name} ({template.duration} min)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {selectedTemplate && (
            <Card className="p-4 bg-muted/50 border-primary/20">
              <div className="space-y-2">
                <p className="text-sm font-medium">Template: {selectedTemplate.name}</p>
                <p className="text-xs text-muted-foreground">{selectedTemplate.description}</p>
                <div className="flex gap-4 text-xs text-muted-foreground">
                  <span>{selectedTemplate.questions.length} questions</span>
                  <span>{selectedTemplate.ratingCriteria.length} rating criteria</span>
                </div>
              </div>
            </Card>
          )}

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Interview Type</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="phone">Phone Screen</SelectItem>
                    <SelectItem value="video">Video Call</SelectItem>
                    <SelectItem value="in-person">In-Person</SelectItem>
                    <SelectItem value="panel">Panel Interview</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="scheduledDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Calendar className="h-4 w-4 inline mr-2" />
                    Date
                  </FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="scheduledTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Clock className="h-4 w-4 inline mr-2" />
                    Time
                  </FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duration (minutes)</FormLabel>
                <Select onValueChange={(val) => field.onChange(Number(val))} value={String(field.value)}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="90">1.5 hours</SelectItem>
                    <SelectItem value="120">2 hours</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {interviewType === "video" && (
            <FormField
              control={form.control}
              name="meetingLink"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Video className="h-4 w-4 inline mr-2" />
                    Meeting Link
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="https://zoom.us/j/..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {interviewType === "in-person" && (
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <MapPin className="h-4 w-4 inline mr-2" />
                    Location
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Office address or meeting room" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="interviewers"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Interviewers (comma-separated emails)</FormLabel>
                <FormControl>
                  <Input placeholder="john@company.com, jane@company.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="agenda"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Agenda (Optional)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Interview topics and discussion points..."
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">Schedule Interview</Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
