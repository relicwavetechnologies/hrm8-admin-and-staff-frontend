// @ts-nocheck
import { useEffect, useState } from 'react';
import { SafeExternalLink } from '@/shared/components/SafeExternalLink';
import { ResumeAnnotations } from '../ResumeAnnotations';
import { applicationService } from '@/shared/lib/applicationService';
import { Loader2, FileText, ExternalLink, Highlighter } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { NotesTab } from './NotesTab';
import type { Application } from '@/shared/types/application';

interface ResumeAnnotationsTabProps {
  candidateId: string; // Note: This is actually the application ID in the current usage
  application: Application;
}

export function ResumeAnnotationsTab({ candidateId, application }: ResumeAnnotationsTabProps) {
  const [resumeText, setResumeText] = useState<string>('');
  const [resumeId, setResumeId] = useState<string>('');
  const [resumeUrl, setResumeUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResume = async () => {
      if (!candidateId) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch resume using application ID
        const response = await applicationService.getApplicationResume(candidateId);
        
        if (response.success && response.data) {
          setResumeUrl(response.data.fileUrl || '');
          setResumeId(response.data.id);
          if (response.data.content) {
            setResumeText(response.data.content);
          } else {
            setError('Resume content is not available for text annotations.');
          }
        } else {
          setError('Failed to load resume.');
        }
      } catch (err) {
        console.error('Error loading resume:', err);
        setError('An error occurred while loading the resume.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchResume();
  }, [candidateId]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-muted-foreground">Loading resume...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] gap-4">
        <div className="p-4 rounded-full bg-muted text-muted-foreground">
          <FileText className="h-8 w-8" /> 
        </div>
        <p className="text-muted-foreground text-center max-w-md">{error}</p>
        {resumeUrl && (
          <Button variant="outline" asChild>
            <SafeExternalLink href={resumeUrl} className="flex items-center gap-2">
              <ExternalLink className="h-4 w-4" />
              View Original Resume
            </SafeExternalLink>
          </Button>
        )}
      </div>
    );
  }

  if (!resumeText) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] text-muted-foreground">
        <p>No resume text available for annotation.</p>
        <p className="text-xs mt-2">Resume ID: {resumeId || 'None'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-lg border bg-background px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center">
            <Highlighter className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-semibold">Resume Annotation Workspace</p>
            <p className="text-xs text-muted-foreground">Highlight key evidence and add comments for team review.</p>
          </div>
        </div>
        <Badge variant="outline" className="text-[11px] font-medium">{resumeText.length.toLocaleString()} chars</Badge>
      </div>
      <ResumeAnnotations
        candidateId={resumeId}
        applicationId={candidateId}
        resumeText={resumeText}
      />
      <div className="rounded-lg border bg-background">
        <div className="border-b px-4 py-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Annotation Notes</p>
        </div>
        <ScrollArea className="max-h-[280px]">
          <div className="p-3">
            <NotesTab application={application} scope="annotation" />
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
