/**
 * Workflow automation section for Executive Search jobs.
 * Triggers: Application submitted, Moved to stage, Dropped from stage → Send email
 */
import { useEffect, useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Switch } from '@/shared/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/components/ui/dialog';
import { Label } from '@/shared/components/ui/label';
import { Input } from '@/shared/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import {
  executiveSearchService,
  JobAutomation,
  JobAutomationTriggerType,
  JobAutomationAction,
  EmailTemplateOption,
} from '@/shared/lib/consultant/executiveSearchService';
import { Zap, Plus, Trash2, Mail } from 'lucide-react';
import { toast } from 'sonner';

const TRIGGER_LABELS: Record<JobAutomationTriggerType, string> = {
  APPLICATION_SUBMITTED: 'When candidate applies',
  MOVED_TO_STAGE: 'When moved to stage',
  DROPPED_FROM_STAGE: 'When dropped/rejected',
};

const APPLICATION_STAGES = [
  'NEW_APPLICATION',
  'RESUME_REVIEW',
  'PHONE_SCREEN',
  'TECHNICAL_INTERVIEW',
  'ONSITE_INTERVIEW',
  'OFFER_EXTENDED',
  'OFFER_ACCEPTED',
  'REJECTED',
];

interface JobAutomationSectionProps {
  jobId: string;
  trigger?: React.ReactNode;
}

export function JobAutomationSection({ jobId, trigger }: JobAutomationSectionProps) {
  const [automations, setAutomations] = useState<JobAutomation[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [templates, setTemplates] = useState<EmailTemplateOption[]>([]);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    name: '',
    triggerType: 'APPLICATION_SUBMITTED' as JobAutomationTriggerType,
    triggerConfigStage: '',
    templateId: '',
    enabled: true,
  });

  const loadAutomations = async () => {
    if (!jobId) return;
    try {
      setLoading(true);
      const res = await executiveSearchService.listAutomations(jobId);
      if (res.success && res.data?.automations) {
        setAutomations(res.data.automations);
      }
    } catch (e) {
      console.error('Failed to load automations', e);
      toast.error('Failed to load automations');
    } finally {
      setLoading(false);
    }
  };

  const loadTemplates = async () => {
    if (!jobId) return;
    try {
      const res = await executiveSearchService.listEmailTemplates(jobId);
      if (res.success && res.data?.templates) {
        setTemplates(res.data.templates);
      }
    } catch (e) {
      console.error('Failed to load templates', e);
    }
  };

  useEffect(() => {
    if (jobId && dialogOpen) {
      void loadAutomations();
      void loadTemplates();
    }
  }, [jobId, dialogOpen]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobId || !form.name.trim()) {
      toast.error('Name is required');
      return;
    }
    if (!form.templateId.trim()) {
      toast.error('Please select an email template');
      return;
    }
    try {
      setCreating(true);
      const actions: JobAutomationAction[] = [{ type: 'SEND_EMAIL', templateId: form.templateId }];
      const triggerConfig =
        (form.triggerType === 'MOVED_TO_STAGE' || form.triggerType === 'DROPPED_FROM_STAGE') &&
        form.triggerConfigStage
          ? { stage: form.triggerConfigStage }
          : undefined;
      const res = await executiveSearchService.createAutomation(jobId, {
        name: form.name.trim(),
        triggerType: form.triggerType,
        triggerConfig,
        actions,
        enabled: form.enabled,
      });
      if (res.success) {
        toast.success('Automation created');
        setCreateOpen(false);
        setForm({ name: '', triggerType: 'APPLICATION_SUBMITTED', triggerConfigStage: '', templateId: '', enabled: true });
        await loadAutomations();
      } else {
        toast.error(res.error || 'Failed to create');
      }
    } catch (e) {
      toast.error('Failed to create automation');
    } finally {
      setCreating(false);
    }
  };

  const handleToggle = async (auto: JobAutomation) => {
    if (!jobId) return;
    try {
      const res = await executiveSearchService.updateAutomation(jobId, auto.id, {
        enabled: !auto.enabled,
      });
      if (res.success) {
        toast.success(auto.enabled ? 'Automation disabled' : 'Automation enabled');
        await loadAutomations();
      } else {
        toast.error(res.error || 'Failed to update');
      }
    } catch {
      toast.error('Failed to update');
    }
  };

  const handleDelete = async (auto: JobAutomation) => {
    if (!jobId || !confirm(`Delete automation "${auto.name}"?`)) return;
    try {
      const res = await executiveSearchService.deleteAutomation(jobId, auto.id);
      if (res.success) {
        toast.success('Automation deleted');
        await loadAutomations();
      } else {
        toast.error(res.error || 'Failed to delete');
      }
    } catch {
      toast.error('Failed to delete');
    }
  };

  const getTriggerDescription = (auto: JobAutomation) => {
    const base = TRIGGER_LABELS[auto.triggerType as JobAutomationTriggerType] || auto.triggerType;
    const cfg = auto.triggerConfig as { stage?: string } | null;
    if (cfg?.stage) return `${base} (${cfg.stage.replace(/_/g, ' ')})`;
    return base;
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline" size="sm">
            <Zap className="h-4 w-4 mr-2" />
            Automation {automations.length > 0 ? `(${automations.filter((a) => a.enabled).length})` : ''}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Workflow automation
          </DialogTitle>
          <DialogDescription>
            Send emails automatically when candidates apply or move through the pipeline. Executive Search only.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : automations.length === 0 ? (
            <p className="text-sm text-muted-foreground">No automations yet. Create one to send emails on apply or stage change.</p>
          ) : (
            <div className="space-y-2">
              {automations.map((auto) => (
                <div
                  key={auto.id}
                  className="flex items-center justify-between gap-3 rounded-lg border p-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{auto.name}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {getTriggerDescription(auto)} → Send email
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Switch
                      checked={auto.enabled}
                      onCheckedChange={() => handleToggle(auto)}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(auto)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button className="w-full" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add automation
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create automation</DialogTitle>
                <DialogDescription>
                  When the trigger fires, the selected email template will be sent to the candidate.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4 py-4">
                <div>
                  <Label>Name</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. Acknowledge application"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Trigger</Label>
                  <Select
                    value={form.triggerType}
                    onValueChange={(v) =>
                      setForm((f) => ({ ...f, triggerType: v as JobAutomationTriggerType }))
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="APPLICATION_SUBMITTED">
                        {TRIGGER_LABELS.APPLICATION_SUBMITTED}
                      </SelectItem>
                      <SelectItem value="MOVED_TO_STAGE">
                        {TRIGGER_LABELS.MOVED_TO_STAGE}
                      </SelectItem>
                      <SelectItem value="DROPPED_FROM_STAGE">
                        {TRIGGER_LABELS.DROPPED_FROM_STAGE}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {(form.triggerType === 'MOVED_TO_STAGE' || form.triggerType === 'DROPPED_FROM_STAGE') && (
                  <div>
                    <Label>Stage (optional)</Label>
                    <Select
                      value={form.triggerConfigStage || 'any'}
                      onValueChange={(v) =>
                        setForm((f) => ({
                          ...f,
                          triggerConfigStage: v === 'any' ? '' : v,
                        }))
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Any stage" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any stage</SelectItem>
                        {APPLICATION_STAGES.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s.replace(/_/g, ' ')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div>
                  <Label>Email template</Label>
                  <Select
                    value={form.templateId}
                    onValueChange={(v) => setForm((f) => ({ ...f, templateId: v }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select template" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.length === 0 ? (
                        <SelectItem value="_none" disabled>
                          No templates — create in Email Hub first
                        </SelectItem>
                      ) : (
                        templates.map((t) => (
                          <SelectItem key={t.id} value={t.id}>
                            {t.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={form.enabled}
                    onCheckedChange={(v) => setForm((f) => ({ ...f, enabled: v }))}
                  />
                  <Label>Enabled</Label>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={creating || !form.name.trim() || !form.templateId || form.templateId === '_none'}
                  >
                    {creating ? 'Creating…' : 'Create'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </DialogContent>
    </Dialog>
  );
}
