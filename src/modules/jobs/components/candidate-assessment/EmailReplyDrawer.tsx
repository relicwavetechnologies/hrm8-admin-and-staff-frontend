// @ts-nocheck
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/shared/components/ui/sheet';
import { EmailComposer } from './EmailComposer';
import { GmailThread, GmailMessage } from '@/shared/lib/gmailThreadService';

interface EmailReplyDrawerProps {
  open: boolean;
  mode: 'new' | 'reply';
  thread: GmailThread | null;
  replyingToMessage: GmailMessage | null;
  applicationId: string;
  candidateName: string;
  candidateEmail?: string;
  jobTitle: string;
  jobId?: string;
  onClose: () => void;
  onEmailSent: (needsReconnect?: boolean) => void;
}

export function EmailReplyDrawer({
  open,
  mode,
  thread,
  replyingToMessage,
  applicationId,
  candidateName,
  candidateEmail,
  jobTitle,
  jobId,
  onClose,
  onEmailSent,
}: EmailReplyDrawerProps) {
  if (mode === 'reply' && (!thread || !replyingToMessage)) return null;

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full p-0 sm:max-w-2xl">
        <SheetHeader className="border-b px-4 py-3">
          <SheetTitle className="text-sm">{mode === 'reply' ? 'Reply to Thread' : 'Compose Email'}</SheetTitle>
        </SheetHeader>

        <div className="h-[calc(100vh-48px)]">
          <EmailComposer
            mode={mode}
            applicationId={applicationId}
            thread={thread}
            replyingToMessage={replyingToMessage}
            candidateName={candidateName}
            candidateEmail={candidateEmail}
            jobTitle={jobTitle}
            jobId={jobId}
            onCancel={onClose}
            onSent={(needsReconnect) => {
              onEmailSent(needsReconnect);
              onClose();
            }}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
