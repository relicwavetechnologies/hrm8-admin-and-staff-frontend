// @ts-nocheck
import { useState, useEffect } from "react";
import { Application } from "@/shared/types/application";
import { GmailThread, GmailMessage, gmailThreadService, EmailThreadsResponse } from "@/shared/lib/gmailThreadService";
import { EmailThreadList } from "../EmailThreadList";
import { EmailThreadDetailView } from "../EmailThreadDetailView";
import { EmailReplyDrawer } from "../EmailReplyDrawer";
import { apiClient } from "@/shared/lib/api";
import { Loader2 } from "lucide-react";

type View = 'list' | 'thread';

interface EmailTabProps {
  application: Application;
}

interface GmailStatus {
  connected: boolean;
  email?: string;
}

export function EmailTab({ application }: EmailTabProps) {
  const [view, setView] = useState<View>('list');
  const [loading, setLoading] = useState(true);
  const [threads, setThreads] = useState<GmailThread[]>([]);
  const [gmailConnected, setGmailConnected] = useState(false);
  const [needsReconnect, setNeedsReconnect] = useState(false);
  const [selectedThread, setSelectedThread] = useState<GmailThread | null>(null);
  const [replyingToMessage, setReplyingToMessage] = useState<GmailMessage | null>(null);
  const [composerMode, setComposerMode] = useState<'new' | 'reply'>('new');
  const [replyDrawerOpen, setReplyDrawerOpen] = useState(false);

  useEffect(() => {
    loadThreads();
    checkGmailStatus();
  }, [application.id]);

  const checkGmailStatus = async () => {
    try {
      const response = await apiClient.get<GmailStatus>('/api/auth/google/status');
      if (response.success && response.data) {
        setGmailConnected(response.data.connected);
      }
    } catch (error) {
      console.error('Failed to check Gmail status:', error);
      setGmailConnected(false);
    }
  };

  const loadThreads = async () => {
    setLoading(true);
    try {
      const data: EmailThreadsResponse = await gmailThreadService.getEmailThreads(application.id);
      setThreads(data.gmailThreads || []);
      setGmailConnected(Boolean(data.gmailConnected));
      // Use local response for initial load, but check backend status separately
      if (!gmailConnected) {
        await checkGmailStatus();
      }
    } catch (error) {
      console.error('Failed to load email threads:', error);
      setThreads([]);
    } finally {
      setLoading(false);
    }
  };

  const handleThreadClick = (thread: GmailThread) => {
    setSelectedThread(thread);
    setView('thread');
  };

  const handleReply = (message: GmailMessage) => {
    setComposerMode('reply');
    setReplyingToMessage(message);
    setReplyDrawerOpen(true);
  };

  const handleComposeNew = () => {
    setComposerMode('new');
    setReplyingToMessage(null);
    setReplyDrawerOpen(true);
  };

  const handleBackFromThread = () => {
    setSelectedThread(null);
    setView('list');
  };

  const handleEmailSent = async (needsReconnectParam?: boolean) => {
    if (needsReconnectParam) {
      setNeedsReconnect(true);
    }
    await loadThreads();
    setReplyingToMessage(null);
    setReplyDrawerOpen(false);
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading email threads...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full -m-4">
      {view === 'list' && (
        <EmailThreadList
          threads={threads}
          loading={loading}
          gmailConnected={gmailConnected}
          onThreadClick={handleThreadClick}
          onRefresh={loadThreads}
          onCompose={handleComposeNew}
          needsReconnect={needsReconnect}
        />
      )}

      {view === 'thread' && selectedThread && (
        <EmailThreadDetailView
          thread={selectedThread}
          onBack={handleBackFromThread}
          onReply={handleReply}
          onCompose={handleComposeNew}
        />
      )}

      {/* Reply Drawer */}
      <EmailReplyDrawer
        open={replyDrawerOpen}
        mode={composerMode}
        thread={selectedThread}
        replyingToMessage={replyingToMessage}
        applicationId={application.id}
        candidateName={application.candidateName || "Candidate"}
        candidateEmail={application.candidateEmail || ""}
        jobTitle={application.jobTitle || "Position"}
        jobId={application.jobId}
        onClose={() => {
          setReplyDrawerOpen(false);
          setReplyingToMessage(null);
        }}
        onEmailSent={handleEmailSent}
      />
    </div>
  );
}
