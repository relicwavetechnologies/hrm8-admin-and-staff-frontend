// @ts-nocheck
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Textarea } from "@/shared/components/ui/textarea";
import { Label } from "@/shared/components/ui/label";
import { Application } from "@/shared/types/application";
import { MessageSquare, Send, Clock, User, CheckCircle2, XCircle, AlertCircle, Loader2 } from "lucide-react";
import { apiClient } from "@/shared/lib/api";
import { toast } from "sonner";
import { format } from "date-fns";

interface SmsTabProps {
  application: Application;
}

interface SmsLog {
  id: string;
  to_number: string;
  from_number?: string;
  message: string;
  status: string;
  error_message?: string;
  created_at: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export function SmsTab({ application }: SmsTabProps) {
  const [smsLogs, setSmsLogs] = useState<SmsLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [isComposing, setIsComposing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const maxLength = 1600;
  const charCount = message.length;
  const segmentCount = Math.ceil(charCount / 160);

  useEffect(() => {
    fetchSmsLogs();
  }, [application.id]);

  const fetchSmsLogs = async () => {
    try {
      const response = await apiClient.get(`/api/applications/${application.id}/sms`);
      setSmsLogs(response.data?.smsLogs || []);
    } catch (error) {
      console.error("Error fetching SMS logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      toast.error("Message is required");
      return;
    }

    setSubmitting(true);
    try {
      await apiClient.post(`/api/applications/${application.id}/sms`, {
        message: message.trim(),
      });

      toast.success("SMS queued for delivery");
      setIsComposing(false);
      setMessage("");
      fetchSmsLogs();
    } catch (error: any) {
      console.error("Error sending SMS:", error);
      toast.error(error.response?.data?.message || "Failed to send SMS");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; icon: any }> = {
      SENT: { color: "bg-green-100 text-green-800", icon: CheckCircle2 },
      DELIVERED: { color: "bg-blue-100 text-blue-800", icon: CheckCircle2 },
      FAILED: { color: "bg-red-100 text-red-800", icon: XCircle },
      PENDING: { color: "bg-yellow-100 text-yellow-800", icon: Clock },
    };

    const config = statusConfig[status] || statusConfig.PENDING;
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} gap-1`}>
        <Icon className="h-3 w-3" />
        {status}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">SMS Messages</h3>
        {!isComposing && (
          <Button onClick={() => setIsComposing(true)} size="sm">
            <MessageSquare className="h-4 w-4 mr-2" />
            Send SMS
          </Button>
        )}
      </div>

      {/* Twilio Warning */}
      <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900">
        <CardContent className="py-3 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <span className="text-sm text-amber-800 dark:text-amber-200">
            SMS functionality requires Twilio configuration. Messages will be logged but may not be delivered.
          </span>
        </CardContent>
      </Card>

      {isComposing && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Compose SMS</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSend} className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Message</Label>
                  <span className={`text-xs ${charCount > maxLength ? "text-red-500" : "text-muted-foreground"}`}>
                    {charCount}/{maxLength} ({segmentCount} segment{segmentCount !== 1 ? "s" : ""})
                  </span>
                </div>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your SMS message..."
                  rows={4}
                  maxLength={maxLength}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  SMS messages over 160 characters will be split into multiple segments.
                </p>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsComposing(false);
                    setMessage("");
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting || charCount > maxLength}>
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  Send SMS
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {smsLogs.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No SMS messages yet</p>
            <p className="text-sm">Send your first SMS to this candidate</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {smsLogs.map((sms) => (
            <Card key={sms.id}>
              <CardContent className="py-4">
                <div className="flex items-start justify-between mb-2">
                  <span className="text-sm text-muted-foreground">To: {sms.to_number}</span>
                  {getStatusBadge(sms.status)}
                </div>
                <p className="text-sm mb-3">{sms.message}</p>
                {sms.error_message && (
                  <p className="text-xs text-red-500 mb-2">Error: {sms.error_message}</p>
                )}
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {format(new Date(sms.created_at), "MMM d, yyyy 'at' h:mm a")}
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {sms.user.name}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
