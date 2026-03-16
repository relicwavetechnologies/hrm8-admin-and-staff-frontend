// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Textarea } from '@/shared/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Badge } from '@/shared/components/ui/badge';
import { Loader2, MessageSquare, Phone, Send, AlertCircle } from 'lucide-react';
import { formatDistanceToNow, isValid, parseISO } from 'date-fns';
import { apiClient } from '@/shared/lib/api';
import { useToast } from '@/shared/hooks/use-toast';
import { Application } from '@/shared/types/application';
import {
  smsTemplates,
  replaceSmsVariables,
  calculateSmsSegments,
} from '@/shared/lib/smsTemplates';

interface SendSmsTabProps {
  application: Application;
}

interface SmsLog {
  id: string;
  to_number: string;
  from_number?: string;
  message: string;
  status: 'PENDING' | 'SENT' | 'DELIVERED' | 'FAILED';
  error_message?: string;
  created_at: string;
  user?: {
    id: string;
    name: string;
  };
}

// SMS character limits
const SINGLE_SMS_LIMIT = 160;
const MULTI_SMS_LIMIT = 153; // 7 chars reserved for concatenation
const MAX_SMS_LENGTH = 1600; // 10 segments max

function formatTimeAgo(dateInput: string | undefined): string {
  if (!dateInput) return 'Just now';
  try {
    const date = parseISO(dateInput);
    if (isValid(date)) {
      return formatDistanceToNow(date, { addSuffix: true });
    }
  } catch {
    // Ignore errors
  }
  return 'Just now';
}

function getStatusColor(status: SmsLog['status']): string {
  switch (status) {
    case 'PENDING':
      return 'bg-yellow-500/10 text-yellow-700 border-yellow-200';
    case 'SENT':
      return 'bg-green-500/10 text-green-700 border-green-200';
    case 'DELIVERED':
      return 'bg-blue-500/10 text-blue-700 border-blue-200';
    case 'FAILED':
      return 'bg-red-500/10 text-red-700 border-red-200';
    default:
      return 'bg-gray-500/10 text-gray-700 border-gray-200';
  }
}

import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover';
import { History } from 'lucide-react';

export function SendSmsTab({ application }: SendSmsTabProps) {
  const [message, setMessage] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [smsHistory, setSmsHistory] = useState<SmsLog[]>([]);
  const { toast } = useToast();

  const candidatePhone = application.candidatePhone || application.phone;
  const candidateName = application.candidateName || 'Candidate';
  const jobTitle = application.jobTitle || 'Position';

  // Fetch SMS history
  useEffect(() => {
    const fetchSmsHistory = async () => {
      if (!application.id) return;
      setIsLoading(true);
      try {
        const response = await apiClient.get<{ sms: SmsLog[] }>(
          `/api/applications/${application.id}/sms`
        );
        if (response.success && response.data?.sms) {
          setSmsHistory(response.data.sms);
        }
      } catch (error) {
        console.error('Failed to fetch SMS history:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSmsHistory();
  }, [application.id]);

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = smsTemplates.find((t) => t.id === templateId);
    if (template) {
      const replacedMessage = replaceSmsVariables(template.message, {
        candidateName,
        jobTitle,
        companyName: application.employerName || 'our company',
      });
      setMessage(replacedMessage);
    }
  };

  const handleSendSms = async () => {
    if (!message.trim()) {
      toast({
        title: 'Message required',
        description: 'Please enter a message to send',
        variant: 'destructive',
      });
      return;
    }

    if (!candidatePhone) {
      toast({
        title: 'No phone number',
        description: 'Candidate phone number is not available',
        variant: 'destructive',
      });
      return;
    }

    if (message.length > MAX_SMS_LENGTH) {
      toast({
        title: 'Message too long',
        description: `Message must be under ${MAX_SMS_LENGTH} characters`,
        variant: 'destructive',
      });
      return;
    }

    setIsSending(true);

    try {
      const response = await apiClient.post<{ smsLog: SmsLog }>(
        `/api/applications/${application.id}/sms`,
        { message: message.trim() }
      );

      if (response.success && response.data?.smsLog) {
        toast({
          title: 'SMS sent!',
          description: `Message sent to ${candidateName}`,
        });
        setSmsHistory((prev) => [response.data.smsLog, ...prev]);
        setMessage('');
        setSelectedTemplate('');
      } else {
        throw new Error(response.error || 'Failed to send SMS');
      }
    } catch (error) {
      console.error('Failed to send SMS:', error);
      toast({
        title: 'Failed to send SMS',
        description: error instanceof Error ? error.message : 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };

  const segments = calculateSmsSegments(message);
  const charCount = message.length;

  if (!candidatePhone) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center space-y-2">
        <AlertCircle className="h-10 w-10 text-yellow-500 opacity-50" />
        <p className="text-xs font-medium text-foreground">Phone number missing</p>
        <p className="text-[10px] text-muted-foreground">Add a phone number to candidate profile to send SMS.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full space-y-2 py-2 overflow-hidden">
      {/* Header Row */}
      <div className="flex items-center justify-between px-1 gap-2">
        <div className="flex items-center gap-1 min-w-0">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">To:</span>
          <div className="bg-muted px-2 py-0.5 rounded-full flex items-center gap-1.5 truncate border border-muted-foreground/10">
            <Phone className="h-2.5 w-2.5 text-muted-foreground" />
            <span className="text-[10px] font-medium text-foreground truncate">{candidatePhone}</span>
          </div>
        </div>
        <Button
          onClick={handleSendSms}
          disabled={!message.trim() || isSending || charCount > MAX_SMS_LENGTH}
          className="h-7 px-3 text-[11px] font-bold"
          size="sm"
        >
          {isSending ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <div className="flex items-center gap-1.5">
              <Send className="h-3 w-3" />
              <span>Send</span>
            </div>
          )}
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 px-1 border-b pb-1">
        <div className="flex-1 max-w-[160px]">
          <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
            <SelectTrigger className="text-[11px] h-7 bg-transparent border-none hover:bg-muted/50 p-0 px-2 [&>span]:truncate">
              <div className="flex items-center gap-1.5 overflow-hidden">
                <MessageSquare className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                <SelectValue placeholder="SMS Templates" />
              </div>
            </SelectTrigger>
            <SelectContent>
              {smsTemplates.map((template) => (
                <SelectItem key={template.id} value={template.id}>
                  <span className="text-[11px]">{template.name}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="h-4 w-px bg-muted-foreground/20" />

        {/* History Popover */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 px-2 gap-1.5 text-[11px] hover:bg-muted/50">
              <History className="h-3.5 w-3.5" />
              History
              {smsHistory.length > 0 && (
                <Badge variant="secondary" className="px-1 h-3.5 min-w-[14px] text-[9px]">
                  {smsHistory.length}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0 shadow-xl border-muted" side="bottom" align="end">
            <div className="p-3 border-b bg-muted/30">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">SMS History</h4>
            </div>
            <ScrollArea className="h-[300px]">
              <div className="p-2 space-y-2">
                {isLoading ? (
                  <div className="py-8 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
                ) : smsHistory.length === 0 ? (
                  <div className="py-8 text-center text-xs text-muted-foreground">No SMS logs found</div>
                ) : (
                  smsHistory.map((sms) => (
                    <div key={sms.id} className="p-2.5 bg-muted/20 rounded border text-[11px] space-y-1">
                      <div className="flex justify-between">
                        <span className="font-semibold">{sms.user?.name || 'Recruiter'}</span>
                        <span className="text-[9px] text-muted-foreground">{formatTimeAgo(sms.created_at)}</span>
                      </div>
                      <p className="text-foreground/80 line-clamp-3">{sms.message}</p>
                      <div className="flex justify-end">
                        <Badge variant="outline" className={`text-[8px] h-3.5 px-1 ${getStatusColor(sms.status)}`}>{sms.status}</Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </PopoverContent>
        </Popover>
      </div>

      {/* Editor Area */}
      <div className="flex-1 min-h-0 px-1 pb-1 flex flex-col">
        <div className="flex-1 min-h-0 bg-background border rounded-md overflow-hidden flex flex-col group focus-within:ring-1 focus-within:ring-primary/20 transition-shadow">
          <Textarea
            placeholder="Type SMS message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-1 resize-none text-xs border-0 focus-visible:ring-0 p-3 leading-relaxed"
            disabled={isSending}
          />
          <div className="px-3 py-1.5 border-t bg-muted/5 min-h-[24px] flex items-center justify-between text-[9px] text-muted-foreground uppercase font-medium">
            <div className="flex items-center gap-2">
              <span>{charCount} / {MAX_SMS_LENGTH}</span>
              <div className="w-px h-2 bg-muted-foreground/20" />
              <span className={segments > 1 ? 'text-primary' : ''}>
                {segments} segment{segments !== 1 ? 's' : ''}
              </span>
            </div>
            {segments > MAX_SMS_LENGTH / SINGLE_SMS_LIMIT && <span className="text-red-500 italic">Too long</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
