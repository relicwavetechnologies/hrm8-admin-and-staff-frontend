// @ts-nocheck
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Textarea } from "@/shared/components/ui/textarea";
import { Label } from "@/shared/components/ui/label";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Application } from "@/shared/types/application";
import { Hash, Send, Clock, User, Users, Loader2, MessageCircle } from "lucide-react";
import { apiClient } from "@/shared/lib/api";
import { toast } from "sonner";
import { format } from "date-fns";
import { useParams } from "react-router-dom";
import { getJobTeamEndpoint } from "../teamEndpoint";

interface SlackTabProps {
  application: Application;
}

interface SlackLog {
  id: string;
  recipient_ids: string[];
  message: string;
  channel_id?: string;
  created_at: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  hiringRole: string;
}

export function SlackTab({ application }: SlackTabProps) {
  const [slackLogs, setSlackLogs] = useState<SlackLog[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [isComposing, setIsComposing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [message, setMessage] = useState("");
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const params = useParams<{ jobId: string }>();
  useEffect(() => {
    fetchData();
  }, [application.id, application.jobId]);

  const fetchData = async () => {
    try {

      let jobId = application?.jobId || application?.job?.id;
      
      // Fallback to route params if jobId is missing in application object
      if (!jobId && params.jobId) {
        jobId = params.jobId;
      }

      // If still no jobId, we might need to fetch the application details first to get the jobId
      if (!jobId && application?.id) {
         try {
             const appDetails = await apiClient.get(`/api/applications/${application.id}`);
             if (appDetails.data?.application?.jobId) {
                 jobId = appDetails.data.application.jobId;
             } else if (appDetails.data?.jobId) {
                 jobId = appDetails.data.jobId;
             }
         } catch (e) {
             console.error("Failed to fetch application details for jobId", e);
         }
      }



      const [logsRes, teamRes] = await Promise.all([
        apiClient.get(`/api/applications/${application.id}/slack`),
        jobId ? apiClient.get(getJobTeamEndpoint(jobId)) : Promise.resolve({ data: { team: [] } }),
      ]);
      
      setSlackLogs(logsRes.data?.slackLogs || []);
      // Backend returns members directly or as 'members' array based on controller
      const teamData = teamRes.data;
      setTeamMembers(Array.isArray(teamData) ? teamData : (teamData?.members || teamData?.team || []));
    } catch (error) {
      console.error("Error fetching Slack data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRecipientToggle = (memberId: string) => {
    setSelectedRecipients((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleSelectAll = () => {
    if (selectedRecipients.length === teamMembers.length) {
      setSelectedRecipients([]);
    } else {
      setSelectedRecipients(teamMembers.map((m) => m.id));
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      toast.error("Message is required");
      return;
    }
    if (selectedRecipients.length === 0) {
      toast.error("Please select at least one recipient");
      return;
    }

    setSubmitting(true);
    try {
      await apiClient.post(`/api/applications/${application.id}/slack`, {
        recipientIds: selectedRecipients,
        message: message.trim(),
      });

      toast.success("Slack message sent");
      setIsComposing(false);
      setMessage("");
      setSelectedRecipients([]);
      fetchData();
    } catch (error) {
      console.error("Error sending Slack message:", error);
      toast.error("Failed to send Slack message");
    } finally {
      setSubmitting(false);
    }
  };

  const getRoleBadge = (role: string) => {
    const colors: Record<string, string> = {
      ADMIN: "bg-purple-100 text-purple-800",
      HIRING_MANAGER: "bg-blue-100 text-blue-800",
      RECRUITER: "bg-green-100 text-green-800",
      INTERVIEWER: "bg-orange-100 text-orange-800",
    };
    return <Badge className={colors[role] || "bg-gray-100 text-gray-800"}>{role}</Badge>;
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
        <h3 className="text-lg font-semibold">Slack Messages</h3>
        {!isComposing && (
          <Button onClick={() => setIsComposing(true)} size="sm">
            <Hash className="h-4 w-4 mr-2" />
            Message Team
          </Button>
        )}
      </div>

      {isComposing && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Send Slack Message</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSend} className="space-y-4">
              {/* Recipient Selection */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Select Recipients</Label>
                  {teamMembers.length > 0 && (
                    <Button type="button" variant="ghost" size="sm" onClick={handleSelectAll}>
                      {selectedRecipients.length === teamMembers.length ? "Deselect All" : "Select All"}
                    </Button>
                  )}
                </div>
                {teamMembers.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No hiring team members found for this job.</p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto border rounded-md p-2">
                    {teamMembers.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-2 hover:bg-muted/50 rounded"
                      >
                        <div className="flex items-center gap-3">
                          <Checkbox
                            id={`member-${member.id}`}
                            checked={selectedRecipients.includes(member.id)}
                            onCheckedChange={() => handleRecipientToggle(member.id)}
                          />
                          <Label 
                            htmlFor={`member-${member.id}`}
                            className="text-sm cursor-pointer select-none grid gap-0.5"
                          >
                            <span className="font-medium">{member.name}</span>
                            <span className="text-xs text-muted-foreground">{member.email}</span>
                          </Label>
                        </div>
                        {getRoleBadge(member.hiringRole || member.role)}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Message */}
              <div className="space-y-2">
                <Label>Message</Label>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={`Write a message about ${application.candidateName || "this candidate"}...`}
                  rows={4}
                  required
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsComposing(false);
                    setMessage("");
                    setSelectedRecipients([]);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting || selectedRecipients.length === 0}>
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  Send to {selectedRecipients.length} recipient{selectedRecipients.length !== 1 ? "s" : ""}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {slackLogs.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No Slack messages yet</p>
            <p className="text-sm">Send a message to the hiring team about this candidate</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {slackLogs.map((slack) => (
            <Card key={slack.id}>
              <CardContent className="py-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      Sent to {slack.recipient_ids.length} recipient{slack.recipient_ids.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  {slack.channel_id && (
                    <Badge variant="outline" className="gap-1">
                      <Hash className="h-3 w-3" />
                      DM
                    </Badge>
                  )}
                </div>
                <p className="text-sm mb-3">{slack.message}</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {format(new Date(slack.created_at), "MMM d, yyyy 'at' h:mm a")}
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {slack.user.name}
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
