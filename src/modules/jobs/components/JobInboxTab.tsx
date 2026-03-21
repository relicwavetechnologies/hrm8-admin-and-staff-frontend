// @ts-nocheck
import { useEffect, useMemo, useState } from 'react';
import { apiClient } from '@/shared/lib/api';
import { GmailMessage, GmailThread, gmailThreadService } from '@/shared/lib/gmailThreadService';
import { EmailThreadDetailView } from '@/modules/jobs/components/candidate-assessment/EmailThreadDetailView';
import { EmailReplyDrawer } from '@/modules/jobs/components/candidate-assessment/EmailReplyDrawer';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { AlertTriangle, Loader2, Mail, RefreshCw, Search } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import type { Application } from '@/shared/types/application';

interface GmailStatus {
  connected: boolean;
}

interface JobThreadRow {
  id: string;
  applicationId: string;
  candidateName: string;
  candidateEmail: string;
  thread: GmailThread;
  inbound: boolean;
  lastMessageDate: string;
}

interface JobInboxTabProps {
  jobId: string;
  jobTitle: string;
  applications: Application[];
}

const toTitleCaseName = (value?: string) => {
  if (!value) return 'Unknown Candidate';
  return value
    .replace(/[._-]+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(' ');
};

const candidateNameFromApp = (app: any) => {
  return (
    app?.candidateName ||
    app?.candidate_name ||
    app?.candidate?.name ||
    `${app?.candidate?.first_name || ''} ${app?.candidate?.last_name || ''}`.trim() ||
    (app?.candidateEmail ? toTitleCaseName(String(app.candidateEmail).split('@')[0]) : '') ||
    (app?.candidate_email ? toTitleCaseName(String(app.candidate_email).split('@')[0]) : '') ||
    'Unknown Candidate'
  );
};

const candidateEmailFromApp = (app: any) => {
  return app?.candidateEmail || app?.candidate_email || app?.email || app?.candidate?.email || '';
};

const formatRelativeDate = (dateStr: string): string => {
  if (!dateStr) return 'Recently';
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  } catch {
    return 'Recently';
  }
};

export function JobInboxTab({ jobId, jobTitle, applications }: JobInboxTabProps) {
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [gmailConnected, setGmailConnected] = useState(false);
  const [threads, setThreads] = useState<JobThreadRow[]>([]);
  const [selected, setSelected] = useState<JobThreadRow | null>(null);
  const [replyDrawerOpen, setReplyDrawerOpen] = useState(false);
  const [composerMode, setComposerMode] = useState<'new' | 'reply'>('new');
  const [replyingToMessage, setReplyingToMessage] = useState<GmailMessage | null>(null);

  const checkGmailStatus = async () => {
    try {
      const response = await apiClient.get<GmailStatus>('/api/auth/google/status');
      if (response.success && response.data) {
        setGmailConnected(response.data.connected);
      } else {
        setGmailConnected(false);
      }
    } catch {
      setGmailConnected(false);
    }
  };

  const loadThreads = async () => {
    setLoading(true);
    try {
      await checkGmailStatus();

      const settled = await Promise.allSettled(
        applications.map(async (app) => {
          const data = await gmailThreadService.getEmailThreads(app.id);
          return data.gmailThreads.map((thread) => {
            const last = thread.messages[thread.messages.length - 1];
            return {
              id: `${app.id}::${thread.threadId}`,
              applicationId: app.id,
              candidateName: candidateNameFromApp(app),
              candidateEmail: candidateEmailFromApp(app),
              thread,
              inbound: last?.isInbound ?? false,
              lastMessageDate: thread.lastMessageDate || last?.date || '',
            } satisfies JobThreadRow;
          });
        }),
      );

      const merged = settled
        .filter((result): result is PromiseFulfilledResult<JobThreadRow[]> => result.status === 'fulfilled')
        .flatMap((result) => result.value)
        .sort((a, b) => new Date(b.lastMessageDate || 0).getTime() - new Date(a.lastMessageDate || 0).getTime());

      setThreads(merged);
      setSelected((prev) => {
        if (!prev) return merged[0] || null;
        return merged.find((item) => item.id === prev.id) || merged[0] || null;
      });
    } catch (error) {
      console.error('[JobInboxTab] Failed to load threads:', error);
      setThreads([]);
      setSelected(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!jobId) return;
    loadThreads();
  }, [jobId, applications.length]);

  const filtered = useMemo(() => {
    if (!query.trim()) return threads;
    const q = query.toLowerCase();
    return threads.filter((row) => {
      return (
        row.candidateName.toLowerCase().includes(q) ||
        row.candidateEmail.toLowerCase().includes(q) ||
        row.thread.subject.toLowerCase().includes(q) ||
        row.thread.snippet.toLowerCase().includes(q)
      );
    });
  }, [threads, query]);

  const stats = useMemo(() => {
    const totalThreads = threads.length;
    const waitingReply = threads.filter((item) => item.inbound).length;
    const totalMessages = threads.reduce((sum, item) => sum + item.thread.messageCount, 0);
    const candidates = new Set(threads.map((item) => item.candidateEmail || item.candidateName)).size;
    return { totalThreads, waitingReply, totalMessages, candidates };
  }, [threads]);

  const handleReply = (message: GmailMessage) => {
    setComposerMode('reply');
    setReplyingToMessage(message);
    setReplyDrawerOpen(true);
  };

  const handleCompose = () => {
    setComposerMode('new');
    setReplyingToMessage(null);
    setReplyDrawerOpen(true);
  };

  return (
    <div className="h-full space-y-3">
      {!gmailConnected && (
        <Card className="border-amber-200/80 bg-amber-50/60 dark:bg-amber-950/20 dark:border-amber-800/70 shadow-none">
          <CardContent className="p-2.5 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-700 dark:text-amber-400 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-amber-800 dark:text-amber-200">Gmail not connected</p>
              <p className="text-xs text-amber-700 dark:text-amber-300">Connect Gmail to load thread history for this job.</p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-3 md:grid-cols-4">
        <Card className="shadow-none border-border/80"><CardContent className="p-2.5"><p className="text-[11px] text-muted-foreground">Threads</p><p className="text-lg font-semibold mt-1 leading-none">{stats.totalThreads}</p></CardContent></Card>
        <Card className="shadow-none border-border/80"><CardContent className="p-2.5"><p className="text-[11px] text-muted-foreground">Waiting Reply</p><p className="text-lg font-semibold mt-1 leading-none">{stats.waitingReply}</p></CardContent></Card>
        <Card className="shadow-none border-border/80"><CardContent className="p-2.5"><p className="text-[11px] text-muted-foreground">Candidates</p><p className="text-lg font-semibold mt-1 leading-none">{stats.candidates}</p></CardContent></Card>
        <Card className="shadow-none border-border/80"><CardContent className="p-2.5"><p className="text-[11px] text-muted-foreground">Messages</p><p className="text-lg font-semibold mt-1 leading-none">{stats.totalMessages}</p></CardContent></Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[50%_50%] h-[calc(100vh-320px)] min-h-[540px]">
        <Card className="border-border/80 shadow-none overflow-hidden">
          <CardContent className="p-2.5 h-full flex flex-col gap-2.5">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search candidate or thread"
                  className="h-8 pl-8 text-xs border-border/70 bg-background"
                />
              </div>
              <Button size="sm" variant="outline" className="h-8 px-2" onClick={loadThreads} disabled={loading}>
                <RefreshCw className={cn('h-3.5 w-3.5', loading && 'animate-spin')} />
              </Button>
              <Button size="sm" className="h-8 px-3 text-xs" onClick={handleCompose} disabled={!selected}>
                <Mail className="h-3.5 w-3.5 mr-1.5" />
                Compose
              </Button>
            </div>

            <div className="rounded-md border border-border/70 overflow-hidden flex-1 min-h-0 bg-background">
              <ScrollArea className="h-full">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/25">
                      <TableHead className="h-8 text-[11px] font-semibold">Candidate</TableHead>
                      <TableHead className="h-8 text-[11px] font-semibold">Thread</TableHead>
                      <TableHead className="h-8 text-[11px] font-semibold">Updated</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      Array.from({ length: 6 }).map((_, idx) => (
                        <TableRow key={`job-thread-skeleton-${idx}`}>
                          <TableCell colSpan={3} className="h-10"><div className="h-4 w-full rounded bg-muted/60 animate-pulse" /></TableCell>
                        </TableRow>
                      ))
                    ) : filtered.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="h-24 text-center text-sm text-muted-foreground">No email threads found for this job.</TableCell>
                      </TableRow>
                    ) : (
                      filtered.map((row) => (
                        <TableRow
                          key={row.id}
                          className={cn('cursor-pointer border-b border-border/60', selected?.id === row.id ? 'bg-primary/5' : 'hover:bg-muted/15')}
                          onClick={() => setSelected(row)}
                        >
                          <TableCell className="py-2.5">
                            <p className="text-sm font-medium truncate max-w-[200px]">{row.candidateName}</p>
                            <p className="text-xs text-muted-foreground truncate max-w-[200px]">{row.candidateEmail || 'No email'}</p>
                          </TableCell>
                          <TableCell className="py-2.5">
                            <p className="text-xs font-medium truncate max-w-[240px]">{row.thread.subject}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <Badge variant="secondary" className="h-4 text-[10px] px-1.5 font-medium">{row.thread.messageCount}</Badge>
                              <Badge
                                variant="outline"
                                className={cn(
                                  'h-4 text-[10px] px-1.5',
                                  row.inbound ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200',
                                )}
                              >
                                {row.inbound ? 'Received' : 'Sent'}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell className="py-2.5 text-xs text-muted-foreground whitespace-nowrap">{formatRelativeDate(row.lastMessageDate)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-none overflow-hidden">
          <CardContent className="p-0 h-full min-h-0">
            {selected ? (
              <EmailThreadDetailView
                thread={selected.thread}
                onBack={() => setSelected(null)}
                onReply={handleReply}
                onCompose={handleCompose}
                showReplyButton
              />
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm bg-muted/[0.15]">
                {loading ? (
                  <div className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Loading threads...</div>
                ) : (
                  'Select a thread to view details'
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {selected && (
        <EmailReplyDrawer
          open={replyDrawerOpen}
          mode={composerMode}
          thread={selected.thread}
          replyingToMessage={replyingToMessage}
          applicationId={selected.applicationId}
          candidateName={selected.candidateName}
          candidateEmail={selected.candidateEmail}
          jobTitle={jobTitle}
          jobId={jobId}
          onClose={() => {
            setReplyDrawerOpen(false);
            setReplyingToMessage(null);
          }}
          onEmailSent={async () => {
            await loadThreads();
          }}
        />
      )}
    </div>
  );
}
