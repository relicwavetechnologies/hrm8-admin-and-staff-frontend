import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { Label } from "@/shared/components/ui/label";
import { Checkbox } from "@/shared/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Send, Eye } from "lucide-react";
import { toast } from "@/shared/hooks/use-toast";
import type { EditableReport } from "@/types/aiReferenceReport";

interface EmailReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  report: EditableReport | null;
}

const EMAIL_TEMPLATES = {
  standard: {
    subject: "AI Reference Check Report - {{candidateName}}",
    message: `Dear Recipient,

Please find attached the AI-generated reference check report for {{candidateName}}, who has applied for the position of {{position}}.

This comprehensive report includes:
- Executive summary and overall assessment
- Detailed category breakdown with evidence
- Conversation highlights from the interview
- Key strengths and areas of concern
- Final hiring recommendation

The AI interview was conducted with {{refereeName}} ({{refereeRelation}}) on {{interviewDate}}.

Please review the attached report and let us know if you have any questions.

Best regards,
{{recruiterName}}`
  },
  concise: {
    subject: "Reference Check Report: {{candidateName}}",
    message: `Hi,

Attached is the reference check report for {{candidateName}}.

Key highlights:
- Overall Score: {{score}}/100
- Recommendation: {{recommendation}}
- Interview Date: {{interviewDate}}

Please review and let me know your thoughts.

Thanks,
{{recruiterName}}`
  },
  detailed: {
    subject: "Comprehensive AI Reference Check Analysis - {{candidateName}}",
    message: `Dear Team,

I'm sharing the detailed AI reference check analysis for {{candidateName}}, conducted with {{refereeName}} ({{refereeRelation}}).

Report Overview:
- Candidate: {{candidateName}}
- Position: {{position}}
- Interview Mode: Video Call
- Duration: {{duration}} minutes
- Interview Date: {{interviewDate}}

The AI analysis provides comprehensive insights including:
• Executive summary with key takeaways
• Category-specific scores and evidence
• Strengths and development areas
• Risk flags (if any)
• Overall hiring recommendation with confidence level

The report is attached for your detailed review. {{transcriptNote}}

Please review at your earliest convenience and share your feedback.

Best regards,
{{recruiterName}}`
  }
};

export function EmailReportDialog({ open, onOpenChange, report }: EmailReportDialogProps) {
  const [emailTo, setEmailTo] = useState("");
  const [emailCc, setEmailCc] = useState("");
  const [emailBcc, setEmailBcc] = useState("");
  const [template, setTemplate] = useState<keyof typeof EMAIL_TEMPLATES>("standard");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [includeTranscript, setIncludeTranscript] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Initialize template when report or template changes
  useState(() => {
    if (report) {
      const templateData = EMAIL_TEMPLATES[template];
      const populatedSubject = populateTemplate(templateData.subject, report);
      const populatedMessage = populateTemplate(templateData.message, report);
      setSubject(populatedSubject);
      setMessage(populatedMessage);
    }
  });

  const populateTemplate = (text: string, report: EditableReport): string => {
    return text
      .replace(/{{candidateName}}/g, report.summary.candidateName)
      .replace(/{{position}}/g, "the applied position")
      .replace(/{{refereeName}}/g, report.summary.refereeInfo.name)
      .replace(/{{refereeRelation}}/g, report.summary.refereeInfo.relationship)
      .replace(/{{interviewDate}}/g, new Date(report.summary.sessionDetails.completedAt).toLocaleDateString())
      .replace(/{{score}}/g, report.summary.recommendation.overallScore.toString())
      .replace(/{{recommendation}}/g, report.summary.recommendation.hiringRecommendation)
      .replace(/{{duration}}/g, Math.round(report.summary.sessionDetails.duration / 60).toString())
      .replace(/{{transcriptNote}}/g, includeTranscript ? "The complete interview transcript is also included." : "")
      .replace(/{{recruiterName}}/g, "Your Name");
  };

  const handleTemplateChange = (value: string) => {
    const newTemplate = value as keyof typeof EMAIL_TEMPLATES;
    setTemplate(newTemplate);
    if (report) {
      const templateData = EMAIL_TEMPLATES[newTemplate];
      setSubject(populateTemplate(templateData.subject, report));
      setMessage(populateTemplate(templateData.message, report));
    }
  };

  const handleSend = () => {
    if (!emailTo) {
      toast({
        title: "Email required",
        description: "Please enter at least one recipient email address.",
        variant: "destructive"
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const recipients = emailTo.split(',').map(e => e.trim());
    const invalidEmails = recipients.filter(email => !emailRegex.test(email));
    
    if (invalidEmails.length > 0) {
      toast({
        title: "Invalid email",
        description: `Please check the email format: ${invalidEmails.join(', ')}`,
        variant: "destructive"
      });
      return;
    }

    // Mock email sending
    toast({
      title: "Report sent successfully",
      description: `AI reference report sent to ${recipients.length} recipient${recipients.length > 1 ? 's' : ''}${includeTranscript ? ' (with transcript)' : ''}`,
    });
    
    onOpenChange(false);
  };

  const getPreviewContent = () => {
    if (!report) return null;

    return (
      <div className="space-y-4 p-4 bg-muted/30 rounded-lg border">
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1">To:</p>
          <p className="text-sm">{emailTo || "No recipients"}</p>
        </div>
        
        {emailCc && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">CC:</p>
            <p className="text-sm">{emailCc}</p>
          </div>
        )}
        
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1">Subject:</p>
          <p className="text-sm font-medium">{subject}</p>
        </div>
        
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1">Message:</p>
          <p className="text-sm whitespace-pre-line">{message}</p>
        </div>
        
        <div className="pt-2 border-t">
          <p className="text-xs font-medium text-muted-foreground mb-2">Attachments:</p>
          <div className="flex items-center gap-2 text-sm">
            <span>📄 AI_Reference_Report_{report.summary.candidateName.replace(' ', '_')}.pdf</span>
            {includeTranscript && (
              <span className="text-muted-foreground">(includes full transcript)</span>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (!report) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Email AI Reference Report
          </DialogTitle>
          <DialogDescription>
            Send the AI-generated reference check report for {report.summary.candidateName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="template">Email Template</Label>
            <Select value={template} onValueChange={handleTemplateChange}>
              <SelectTrigger id="template">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Standard Report</SelectItem>
                <SelectItem value="concise">Concise Summary</SelectItem>
                <SelectItem value="detailed">Detailed Analysis</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="emailTo">To *</Label>
            <Input
              id="emailTo"
              type="email"
              placeholder="recipient@company.com, another@company.com"
              value={emailTo}
              onChange={(e) => setEmailTo(e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-1">Separate multiple emails with commas</p>
          </div>

          <div>
            <Label htmlFor="emailCc">CC</Label>
            <Input
              id="emailCc"
              type="email"
              placeholder="cc@company.com"
              value={emailCc}
              onChange={(e) => setEmailCc(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="emailBcc">BCC</Label>
            <Input
              id="emailBcc"
              type="email"
              placeholder="bcc@company.com"
              value={emailBcc}
              onChange={(e) => setEmailBcc(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="subject">Subject *</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="message">Message *</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={12}
              className="font-mono text-sm"
            />
          </div>

          <div className="flex items-center space-x-2 pt-2 border-t">
            <Checkbox
              id="includeTranscript"
              checked={includeTranscript}
              onCheckedChange={(checked) => setIncludeTranscript(checked as boolean)}
            />
            <Label
              htmlFor="includeTranscript"
              className="text-sm font-normal cursor-pointer"
            >
              Include full interview transcript in PDF (adds 5-10 pages)
            </Label>
          </div>

          <div className="pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
              className="w-full"
            >
              <Eye className="h-4 w-4 mr-2" />
              {showPreview ? "Hide Preview" : "Show Email Preview"}
            </Button>
          </div>

          {showPreview && getPreviewContent()}

          <div className="p-3 rounded-lg bg-muted/50 text-sm">
            <p className="font-medium mb-1">Report Summary</p>
            <p className="text-muted-foreground">
              {report.summary.candidateName} • {report.summary.refereeInfo.name} ({report.summary.refereeInfo.relationship}) • 
              Score: {report.summary.recommendation.overallScore}/100 • 
              {report.summary.recommendation.hiringRecommendation}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSend}>
            <Send className="h-4 w-4 mr-2" />
            Send Report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
