import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Switch } from "@/shared/components/ui/switch";
import { Calendar, Clock, Zap, Plus } from "lucide-react";
import {
  getAutomationRules,
  toggleAutomationRule,
  getScheduledJobs,
  AutomationRule
} from "@/shared/lib/jobAutomationService";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/shared/hooks/use-toast";

interface JobAutomationPanelProps {
  jobId?: string;
}

export function JobAutomationPanel({ jobId }: JobAutomationPanelProps) {
  const rules = getAutomationRules();
  const scheduledJobs = jobId ? getScheduledJobs(jobId) : [];
  const { toast } = useToast();

  const handleToggleRule = (id: string, name: string) => {
    toggleAutomationRule(id);
    toast({
      title: "Automation updated",
      description: `"${name}" has been updated.`,
    });
  };

  const getTriggerText = (rule: AutomationRule): string => {
    switch (rule.trigger.type) {
      case "inactivity_days":
        return `After ${rule.trigger.days} days of inactivity`;
      case "applicant_count":
        return `When applicants reach ${rule.trigger.count}`;
      case "closing_soon":
        return `${rule.trigger.days} days before closing`;
      case "offer_accepted":
        return "When offer is accepted";
      default:
        return "Unknown trigger";
    }
  };

  const getActionText = (rule: AutomationRule): string => {
    switch (rule.action.type) {
      case "close_job":
        return "Close job";
      case "change_status":
        return `Change status to ${rule.action.status}`;
      case "notify":
        return `Notify ${rule.action.recipients.join(", ")}`;
      case "archive":
        return "Archive job";
      case "publish":
        return "Publish job";
      default:
        return "Unknown action";
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Automation Rules
            </CardTitle>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Rule
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {rules.map(rule => (
              <div key={rule.id} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-medium">{rule.name}</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      <span className="font-medium">When:</span> {getTriggerText(rule)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium">Then:</span> {getActionText(rule)}
                    </p>
                  </div>
                  <Switch
                    checked={rule.isActive}
                    onCheckedChange={() => handleToggleRule(rule.id, rule.name)}
                  />
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <Badge variant={rule.isActive ? "teal" : "secondary"}>
                    {rule.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {jobId && scheduledJobs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Scheduled Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {scheduledJobs.map(scheduled => (
                <div key={scheduled.id} className="p-3 border rounded-lg flex items-center justify-between">
                  <div>
                    <p className="font-medium capitalize">{scheduled.action}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(scheduled.scheduledDate, { addSuffix: true })}
                    </p>
                  </div>
                  <Badge variant={
                    scheduled.status === "pending" ? "orange" :
                      scheduled.status === "completed" ? "teal" : "secondary"
                  }>
                    {scheduled.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
