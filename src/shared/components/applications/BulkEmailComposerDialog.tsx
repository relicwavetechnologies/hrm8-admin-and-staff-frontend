import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { RichTextEditor } from '@/shared/components/ui/rich-text-editor';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Calendar } from '@/shared/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover';
import { Card } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Save, Send, Eye, Copy, CalendarIcon, Clock } from 'lucide-react';
import { useToast } from '@/shared/hooks/use-toast';
import { format } from 'date-fns';
import { cn } from '@/shared/lib/utils';
import { getApplicationEmailTemplates, saveApplicationEmailTemplate } from '@/shared/lib/applicationEmailTemplates';

interface BulkEmailComposerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCount: number;
  onSend: (subject: string, body: string) => void;
}

const DYNAMIC_FIELDS = [
  { key: '{candidateName}', label: 'Candidate Name', example: 'John Doe' },
  { key: '{jobTitle}', label: 'Job Title', example: 'Senior Developer' },
  { key: '{companyName}', label: 'Company Name', example: 'TechCorp' },
  { key: '{recruiterName}', label: 'Recruiter Name', example: 'Jane Smith' },
  { key: '{applicationDate}', label: 'Application Date', example: 'Jan 15, 2024' },
  { key: '{currentStage}', label: 'Current Stage', example: 'Phone Screen' },
];

export function BulkEmailComposerDialog({
  open,
  onOpenChange,
  selectedCount,
  onSend,
}: BulkEmailComposerDialogProps) {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [templateName, setTemplateName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [templates, setTemplates] = useState(getApplicationEmailTemplates());
  const [scheduleMode, setScheduleMode] = useState<'now' | 'later'>('now');
  const [scheduleDate, setScheduleDate] = useState<Date>();
  const [scheduleTime, setScheduleTime] = useState('09:00');
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      setTemplates(getApplicationEmailTemplates());
    }
  }, [open]);

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setSubject(template.subject);
      setBody(template.body);
      setTemplateName('');
    }
  };

  const handleSaveTemplate = () => {
    if (!templateName.trim()) {
      toast({
        title: "Template name required",
        description: "Please enter a name for your template",
        variant: "destructive",
      });
      return;
    }

    if (!subject.trim() || !body.trim()) {
      toast({
        title: "Content required",
        description: "Please enter both subject and body",
        variant: "destructive",
      });
      return;
    }

    saveApplicationEmailTemplate({
      name: templateName,
      subject,
      body,
    });

    setTemplates(getApplicationEmailTemplates());
    setTemplateName('');

    toast({
      title: "Template saved",
      description: "Your email template has been saved successfully",
    });
  };

  const handleSendEmails = () => {
    if (!subject.trim() || !body.trim()) {
      toast({
        title: "Content required",
        description: "Please enter both subject and body",
        variant: "destructive",
      });
      return;
    }

    onSend(subject, body);
    onOpenChange(false);

    // Reset form
    setSubject('');
    setBody('');
    setSelectedTemplate('');
  };

  const copyFieldToClipboard = (field: string) => {
    navigator.clipboard.writeText(field);
    toast({
      title: "Copied",
      description: `${field} copied to clipboard`,
    });
  };

  const previewBody = () => {
    let preview = body;
    DYNAMIC_FIELDS.forEach(field => {
      const regex = new RegExp(field.key.replace(/[{}]/g, '\\$&'), 'g');
      preview = preview.replace(regex, `<span class="bg-primary/20 px-1 rounded">${field.example}</span>`);
    });
    return preview;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Compose Bulk Email</DialogTitle>
          <DialogDescription>
            Send personalized emails to {selectedCount} selected application{selectedCount > 1 ? 's' : ''}. Use dynamic fields for personalization.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-4">
            {/* Template Selection */}
            <div className="space-y-2">
              <Label>Load Template (Optional)</Label>
              <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a template..." />
                </SelectTrigger>
                <SelectContent>
                  {templates.map(template => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Subject */}
            <div className="space-y-2">
              <Label htmlFor="subject">Subject *</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter email subject..."
              />
            </div>

            {/* Body */}
            <div className="space-y-2">
              <Label>Email Body *</Label>
              {showPreview ? (
                <Card className="p-4">
                  <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: previewBody() }} />
                </Card>
              ) : (
                <RichTextEditor
                  content={body}
                  onChange={setBody}
                  placeholder="Compose your email message..."
                  className="min-h-[300px]"
                />
              )}
            </div>

            {/* Preview Toggle */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
            >
              <Eye className="h-4 w-4 mr-2" />
              {showPreview ? 'Edit' : 'Preview with Example Data'}
            </Button>

            {/* Save as Template */}
            <div className="space-y-2 pt-4 border-t">
              <Label htmlFor="templateName">Save as Template (Optional)</Label>
              <div className="flex gap-2">
                <Input
                  id="templateName"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="Template name..."
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleSaveTemplate}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
              </div>
            </div>

            {/* Scheduling */}
            <div className="space-y-4 pt-4 border-t">
              <Label>Send Options</Label>
              <Tabs value={scheduleMode} onValueChange={(v: any) => setScheduleMode(v)}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="now">Send Now</TabsTrigger>
                  <TabsTrigger value="later">Schedule for Later</TabsTrigger>
                </TabsList>

                <TabsContent value="later" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {scheduleDate ? format(scheduleDate, 'PPP') : 'Pick a date'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={scheduleDate}
                            onSelect={setScheduleDate}
                            disabled={(date) => date < new Date()}
                            className={cn("pointer-events-auto")}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-2">
                      <Label>Time</Label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="time"
                          value={scheduleTime}
                          onChange={(e) => setScheduleTime(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* Dynamic Fields Sidebar */}
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-semibold">Dynamic Fields</Label>
              <p className="text-xs text-muted-foreground mt-1">
                Click to copy, then paste into your email
              </p>
            </div>

            <div className="space-y-2">
              {DYNAMIC_FIELDS.map(field => (
                <Card
                  key={field.key}
                  className="p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => copyFieldToClipboard(field.key)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs font-mono">
                          {field.key}
                        </Badge>
                        <Copy className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {field.label}
                      </p>
                      <p className="text-xs text-muted-foreground/70 mt-0.5">
                        Ex: {field.example}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSendEmails} disabled={!subject.trim() || !body.trim()}>
            <Send className="h-4 w-4 mr-2" />
            {scheduleMode === 'later' ? 'Schedule Email' : `Send to ${selectedCount} Recipient${selectedCount > 1 ? 's' : ''}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
