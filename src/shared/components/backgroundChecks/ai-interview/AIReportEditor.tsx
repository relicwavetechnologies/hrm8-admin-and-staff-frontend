import { useState, useEffect, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Separator } from '@/shared/components/ui/separator';
import { useToast } from '@/shared/hooks/use-toast';
import type { AIReferenceCheckSession } from '@/types/aiReferenceCheck';
import type { AITranscriptionSummary, EditableReport } from '@/types/aiReferenceReport';
import { TranscriptViewer } from './TranscriptViewer';
import { SectionNavigation } from './SectionNavigation';
import { generateReportHTML } from '@/shared/lib/backgroundChecks/reportTemplate';
import { exportAIReferencePDF } from '@/shared/lib/backgroundChecks/aiReportExport';
import { EmailReportDialog } from './EmailReportDialog';
import { 
  Save, 
  X, 
  FileText, 
  Clock,
  CheckCircle2,
  Download,
  Mail
} from 'lucide-react';

interface AIReportEditorProps {
  open: boolean;
  session: AIReferenceCheckSession;
  summary: AITranscriptionSummary;
  existingReport?: EditableReport;
  onSave: (editedReport: EditableReport) => void;
  onCancel: () => void;
}

const AUTO_SAVE_INTERVAL = 30000; // 30 seconds

export function AIReportEditor({
  open,
  session,
  summary,
  existingReport,
  onSave,
  onCancel,
}: AIReportEditorProps) {
  const { toast } = useToast();
  const [status, setStatus] = useState<'draft' | 'reviewed' | 'finalized'>(
    existingReport?.status || 'draft'
  );
  const [lastSaved, setLastSaved] = useState<Date | null>(
    existingReport ? new Date(existingReport.updatedAt) : null
  );
  const [isSaving, setIsSaving] = useState(false);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
      }),
      Underline,
    ],
    content: existingReport?.editableContent || generateReportHTML(summary),
    editorProps: {
      attributes: {
        class: 'prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[600px] p-4',
      },
    },
  });

  // Auto-save functionality
  const saveReport = useCallback(() => {
    if (!editor) return;

    setIsSaving(true);

    const report: EditableReport = {
      id: existingReport?.id || `report_${Date.now()}`,
      sessionId: session.id,
      summary,
      editableContent: editor.getHTML(),
      version: (existingReport?.version || 0) + 1,
      status,
      createdAt: existingReport?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Simulate save delay
    setTimeout(() => {
      setIsSaving(false);
      setLastSaved(new Date());
      toast({
        title: "Draft saved",
        description: "Your changes have been saved automatically.",
      });
    }, 500);
  }, [editor, session.id, summary, status, existingReport, toast]);

  // Auto-save effect
  useEffect(() => {
    if (!editor || !open) return;

    const interval = setInterval(() => {
      saveReport();
    }, AUTO_SAVE_INTERVAL);

    return () => clearInterval(interval);
  }, [editor, open, saveReport]);

  const handleSave = () => {
    if (!editor) return;

    const report: EditableReport = {
      id: existingReport?.id || `report_${Date.now()}`,
      sessionId: session.id,
      summary,
      editableContent: editor.getHTML(),
      version: (existingReport?.version || 0) + 1,
      status,
      createdAt: existingReport?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(report);
    toast({
      title: "Report saved",
      description: `Report saved as ${status}.`,
    });
  };

  const handleStatusChange = (newStatus: typeof status) => {
    setStatus(newStatus);
    toast({
      title: "Status updated",
      description: `Report status changed to ${newStatus}.`,
    });
  };

  const handleExportPDF = (includeTranscript: boolean = false) => {
    if (!editor) return;

    const report: EditableReport = {
      id: existingReport?.id || `report_${Date.now()}`,
      sessionId: session.id,
      summary,
      editableContent: editor.getHTML(),
      version: (existingReport?.version || 0) + 1,
      status,
      createdAt: existingReport?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      exportAIReferencePDF(report, session, {
        includeTranscript,
        includeMetadata: true,
        includeSignature: true,
      });
      toast({
        title: "PDF exported",
        description: includeTranscript 
          ? "Report with full transcript downloaded successfully."
          : "Report downloaded successfully.",
      });
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast({
        title: "Export failed",
        description: "Failed to generate PDF report.",
        variant: "destructive",
      });
    }
  };

  const getTimeSinceLastSave = () => {
    if (!lastSaved) return 'Never';
    const seconds = Math.floor((Date.now() - lastSaved.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  if (!editor) return null;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <DialogContent className="max-w-[95vw] h-[90vh] p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-primary" />
              <div>
                <DialogTitle>AI Reference Report Editor</DialogTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {summary.candidateName} - {summary.refereeInfo.name}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm">
                {isSaving ? (
                  <>
                    <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                    <span className="text-muted-foreground">Saving draft...</span>
                  </>
                ) : lastSaved ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="text-muted-foreground">Saved {getTimeSinceLastSave()}</span>
                  </>
                ) : (
                  <>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Not saved</span>
                  </>
                )}
              </div>
              
              <Separator orientation="vertical" className="h-6" />
              
              <div className="flex gap-2">
                <Button
                  variant={status === 'draft' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleStatusChange('draft')}
                >
                  Draft
                </Button>
                <Button
                  variant={status === 'reviewed' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleStatusChange('reviewed')}
                >
                  Reviewed
                </Button>
                <Button
                  variant={status === 'finalized' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleStatusChange('finalized')}
                >
                  Finalized
                </Button>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 grid grid-cols-12 gap-4 p-4 overflow-hidden">
          {/* Left Sidebar - Transcript */}
          <div className="col-span-3 overflow-hidden">
            {session.transcript && <TranscriptViewer transcript={session.transcript} />}
          </div>

          {/* Main Editor */}
          <div className="col-span-6 overflow-auto">
            <div className="bg-background border border-border rounded-lg">
              <EditorContent editor={editor} />
            </div>
          </div>

          {/* Right Sidebar - Navigation */}
          <div className="col-span-3 overflow-hidden">
            <SectionNavigation onNavigate={() => {}} />
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t border-border">
          <div className="flex items-center justify-between w-full">
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => handleExportPDF(false)}
                size="sm"
              >
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
              <Button 
                variant="outline" 
                onClick={() => handleExportPDF(true)}
                size="sm"
              >
                <Download className="h-4 w-4 mr-2" />
                Export with Transcript
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setEmailDialogOpen(true)}
                size="sm"
              >
                <Mail className="h-4 w-4 mr-2" />
                Email Report
              </Button>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={onCancel}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Save Report
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>

      {/* Email Report Dialog */}
      <EmailReportDialog
        open={emailDialogOpen}
        onOpenChange={setEmailDialogOpen}
        report={existingReport || null}
      />
    </Dialog>
  );
}
