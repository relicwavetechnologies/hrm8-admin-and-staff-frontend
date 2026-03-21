// @ts-nocheck
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { Label } from "@/shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Application } from "@/shared/types/application";
import { Phone, Clock, User, Calendar, Plus, CheckCircle2, XCircle, PhoneOff, PhoneMissed, VoicemailIcon, AlertCircle } from "lucide-react";
import { apiClient } from "@/shared/lib/api";
import { toast } from "sonner";
import { format } from "date-fns";

interface CallLogsTabProps {
  application: Application;
}

interface CallLog {
  id: string;
  call_date: string;
  outcome: string;
  phone_number?: string;
  duration?: number;
  notes?: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

const outcomeOptions = [
  { value: "PICKED_UP", label: "Picked Up", icon: CheckCircle2, color: "bg-green-100 text-green-800" },
  { value: "BUSY", label: "Busy", icon: PhoneOff, color: "bg-yellow-100 text-yellow-800" },
  { value: "NO_ANSWER", label: "No Answer", icon: PhoneMissed, color: "bg-red-100 text-red-800" },
  { value: "LEFT_VOICEMAIL", label: "Left Voicemail", icon: VoicemailIcon, color: "bg-blue-100 text-blue-800" },
  { value: "WRONG_NUMBER", label: "Wrong Number", icon: XCircle, color: "bg-gray-100 text-gray-800" },
  { value: "SCHEDULED_CALLBACK", label: "Scheduled Callback", icon: Calendar, color: "bg-purple-100 text-purple-800" },
];

export function CallLogsTab({ application }: CallLogsTabProps) {
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [newCall, setNewCall] = useState({
    callDate: new Date().toISOString().slice(0, 16),
    outcome: "PICKED_UP",
    phoneNumber: "",
    duration: "",
    notes: "",
  });

  useEffect(() => {
    fetchCallLogs();
  }, [application.id]);

  const fetchCallLogs = async () => {
    try {
      const response = await apiClient.get(`/api/applications/${application.id}/calls`);
      setCallLogs(response.data?.callLogs || []);
    } catch (error) {
      console.error("Error fetching call logs:", error);
      toast.error("Failed to load call logs");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await apiClient.post(`/api/applications/${application.id}/calls`, {
        callDate: new Date(newCall.callDate).toISOString(),
        outcome: newCall.outcome,
        phoneNumber: newCall.phoneNumber || undefined,
        duration: newCall.duration ? parseInt(newCall.duration) : undefined,
        notes: newCall.notes || undefined,
      });

      toast.success("Call logged successfully");
      setIsAdding(false);
      setNewCall({
        callDate: new Date().toISOString().slice(0, 16),
        outcome: "PICKED_UP",
        phoneNumber: "",
        duration: "",
        notes: "",
      });
      fetchCallLogs();
    } catch (error) {
      console.error("Error logging call:", error);
      toast.error("Failed to log call");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "-";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getOutcomeInfo = (outcome: string) => {
    return outcomeOptions.find((o) => o.value === outcome) || outcomeOptions[0];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Call History</h3>
        {!isAdding && (
          <Button onClick={() => setIsAdding(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Log Call
          </Button>
        )}
      </div>

      {isAdding && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Log New Call</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date & Time</Label>
                  <Input
                    type="datetime-local"
                    value={newCall.callDate}
                    onChange={(e) => setNewCall({ ...newCall, callDate: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Outcome</Label>
                  <Select
                    value={newCall.outcome}
                    onValueChange={(value) => setNewCall({ ...newCall, outcome: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {outcomeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <option.icon className="h-4 w-4" />
                            {option.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Phone Number (optional)</Label>
                  <Input
                    type="tel"
                    placeholder="Override default number"
                    value={newCall.phoneNumber}
                    onChange={(e) => setNewCall({ ...newCall, phoneNumber: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Duration (seconds)</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 300"
                    value={newCall.duration}
                    onChange={(e) => setNewCall({ ...newCall, duration: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  placeholder="Add notes about the call..."
                  value={newCall.notes}
                  onChange={(e) => setNewCall({ ...newCall, notes: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsAdding(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Saving..." : "Log Call"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {callLogs.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Phone className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No call logs yet</p>
            <p className="text-sm">Log your first call with this candidate</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {callLogs.map((call) => {
            const outcomeInfo = getOutcomeInfo(call.outcome);
            const Icon = outcomeInfo.icon;
            return (
              <Card key={call.id}>
                <CardContent className="py-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-full ${outcomeInfo.color}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{outcomeInfo.label}</span>
                          {call.phone_number && (
                            <span className="text-sm text-muted-foreground">
                              {call.phone_number}
                            </span>
                          )}
                        </div>
                        {call.notes && (
                          <p className="text-sm text-muted-foreground mt-1">{call.notes}</p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(call.call_date), "MMM d, yyyy 'at' h:mm a")}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDuration(call.duration)}
                          </span>
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {call.user.name}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
