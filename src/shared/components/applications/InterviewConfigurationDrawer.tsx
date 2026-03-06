/**
 * Interview Configuration Drawer
 * Allows admins to configure interviews for a job round
 */

import { useState, useEffect } from "react";
import { FormDrawer } from "@/shared/components/ui/form-drawer";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Switch } from "@/shared/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Separator } from "@/shared/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { interviewService } from "@/shared/lib/api/interviewService";
import { userService, CompanyUser } from "@/shared/lib/api/userService";
import { toast } from "sonner";
import { Plus, Trash2, Save, X } from "lucide-react";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar";

interface InterviewConfigurationDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobId: string;
  roundId: string;
  roundName: string;
  jobRounds?: Array<{ id: string; name: string }>; // For selecting next round on pass/fail
  onSuccess?: () => void;
}

export function InterviewConfigurationDrawer({
  open,
  onOpenChange,
  jobId,
  roundId,
  roundName,
  onSuccess,
}: InterviewConfigurationDrawerProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Basic Settings
  const [enabled, setEnabled] = useState(false);
  const [autoSchedule, setAutoSchedule] = useState(true);
  
  // Interview Format
  const [interviewFormat, setInterviewFormat] = useState<'LIVE_VIDEO' | 'PHONE' | 'IN_PERSON' | 'PANEL'>('LIVE_VIDEO');
  const [defaultDuration, setDefaultDuration] = useState<number>(60);
  
  // Scheduling
  const [autoScheduleWindowDays, setAutoScheduleWindowDays] = useState<number>(7);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>(['09:00', '10:00', '14:00', '15:00']);
  const [bufferTimeMinutes, setBufferTimeMinutes] = useState<number>(15);
  const [autoRescheduleOnNoShow, setAutoRescheduleOnNoShow] = useState(false);
  const [autoRescheduleOnCancel, setAutoRescheduleOnCancel] = useState(false);
  
  // Assign Interview
  const [assignedInterviewerIds, setAssignedInterviewerIds] = useState<string[]>([]);
  const [companyUsers, setCompanyUsers] = useState<CompanyUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);

  // Load existing configuration
  useEffect(() => {
    if (open && jobId && roundId) {
      loadConfiguration();
    }
  }, [open, jobId, roundId]);

  useEffect(() => {
    if (open) {
      fetchCompanyUsers();
    }
  }, [open]);

  const fetchCompanyUsers = async () => {
    setUsersLoading(true);
    try {
      const users = await userService.getCompanyUsers();
      setCompanyUsers(users);
    } catch (error) {
      console.error("Failed to fetch company users:", error);
      toast.error("Failed to load users");
    } finally {
      setUsersLoading(false);
    }
  };

  const loadConfiguration = async () => {
    setLoading(true);
    try {
      const response = await interviewService.getInterviewConfig(jobId, roundId);
      if (response.success && response.data?.config) {
        const config = response.data.config;
        setEnabled(config.enabled);
        setAutoSchedule(config.autoSchedule ?? true);
        setInterviewFormat(config.interviewFormat || 'LIVE_VIDEO');
        setDefaultDuration(config.defaultDuration || 60);
        setAutoScheduleWindowDays(config.autoScheduleWindowDays || 7);
        setAvailableTimeSlots(config.availableTimeSlots || ['09:00', '10:00', '14:00', '15:00']);
        setBufferTimeMinutes(config.bufferTimeMinutes || 15);
        setAutoRescheduleOnNoShow(config.autoRescheduleOnNoShow ?? false);
        setAutoRescheduleOnCancel(config.autoRescheduleOnCancel ?? false);
        setAssignedInterviewerIds(config.assignedInterviewerIds || []);
      } else {
        // Initialize with defaults
        resetToDefaults();
      }
    } catch (error) {
      console.error("Failed to load interview configuration:", error);
      toast.error("Failed to load interview configuration");
      resetToDefaults();
    } finally {
      setLoading(false);
    }
  };

  const resetToDefaults = () => {
    setEnabled(false);
    setAutoSchedule(true);
    setInterviewFormat('LIVE_VIDEO');
    setDefaultDuration(60);
    setAutoScheduleWindowDays(7);
    setAvailableTimeSlots(['09:00', '10:00', '14:00', '15:00']);
    setBufferTimeMinutes(15);
    setAutoRescheduleOnNoShow(false);
    setAutoRescheduleOnCancel(false);
    setAssignedInterviewerIds([]);
  };

  const handleAddTimeSlot = () => {
    setAvailableTimeSlots([...availableTimeSlots, '09:00']);
  };

  const handleRemoveTimeSlot = (index: number) => {
    setAvailableTimeSlots(availableTimeSlots.filter((_, i) => i !== index));
  };

  const handleTimeSlotChange = (index: number, value: string) => {
    const updated = [...availableTimeSlots];
    updated[index] = value;
    setAvailableTimeSlots(updated);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const config = {
        enabled,
        autoSchedule,
        interviewFormat,
        defaultDuration,
        autoScheduleWindowDays,
        availableTimeSlots: availableTimeSlots.filter((s) => s.trim() !== ''),
        bufferTimeMinutes,
        autoRescheduleOnNoShow,
        autoRescheduleOnCancel,
        assignedInterviewerIds,
      };

      const response = await interviewService.configureInterview(jobId, roundId, config);
      
      if (response.success) {
        toast.success("Interview configuration saved successfully");
        onSuccess?.();
        onOpenChange(false);
      } else {
        throw new Error(response.error || "Failed to save configuration");
      }
    } catch (error) {
      console.error("Failed to save interview configuration:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save configuration");
    } finally {
      setSaving(false);
    }
  };

  const handleAddInterviewer = (userId: string) => {
    if (!assignedInterviewerIds.includes(userId)) {
      setAssignedInterviewerIds([...assignedInterviewerIds, userId]);
    }
  };

  const handleRemoveInterviewer = (userId: string) => {
    setAssignedInterviewerIds(assignedInterviewerIds.filter(id => id !== userId));
  };

  return (
    <FormDrawer
      open={open}
      onOpenChange={onOpenChange}
      title={`Configure Interview: ${roundName}`}
      description="Set up interview settings and scheduling"
      width="2xl"
    >
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Loading configuration...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Basic Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Settings</CardTitle>
              <CardDescription>Enable and configure the interview for this round</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="enabled">Enable Interview</Label>
                  <p className="text-sm text-muted-foreground">
                    Turn on interview for this round
                  </p>
                </div>
                <Switch
                  id="enabled"
                  checked={enabled}
                  onCheckedChange={setEnabled}
                />
              </div>

              {enabled && (
                <>
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="auto-schedule">Auto-Schedule Interview</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically schedule interview when candidate enters this round
                      </p>
                    </div>
                    <Switch
                      id="auto-schedule"
                      checked={autoSchedule}
                      onCheckedChange={setAutoSchedule}
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {enabled && (
            <Tabs defaultValue="format" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="format">Format & Type</TabsTrigger>
                <TabsTrigger value="scheduling">Scheduling</TabsTrigger>
                <TabsTrigger value="assignment">Assign Interview</TabsTrigger>
              </TabsList>

              {/* Interview Format & Type */}
              <TabsContent value="format" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Interview Format</CardTitle>
                    <CardDescription>Select the type and format of interview</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="interview-format">Interview Format</Label>
                      <Select value={interviewFormat} onValueChange={(value) => setInterviewFormat(value as 'LIVE_VIDEO' | 'PHONE' | 'IN_PERSON' | 'PANEL')}>
                        <SelectTrigger id="interview-format">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="LIVE_VIDEO">Live Video Interview</SelectItem>
                          <SelectItem value="PHONE">Phone Interview</SelectItem>
                          <SelectItem value="IN_PERSON">In-Person Interview</SelectItem>
                          <SelectItem value="PANEL">Panel Interview</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="duration">Default Duration (Minutes)</Label>
                        <Input
                          id="duration"
                          type="number"
                          min="15"
                          max="480"
                          value={defaultDuration}
                          onChange={(e) => setDefaultDuration(parseInt(e.target.value) || 60)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Scheduling Settings */}
              <TabsContent value="scheduling" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Scheduling Settings</CardTitle>
                    <CardDescription>Configure automatic scheduling behavior</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="window-days">Auto-Schedule Window (Days)</Label>
                        <Input
                          id="window-days"
                          type="number"
                          min="1"
                          max="30"
                          value={autoScheduleWindowDays}
                          onChange={(e) => setAutoScheduleWindowDays(parseInt(e.target.value) || 7)}
                        />
                        <p className="text-xs text-muted-foreground">
                          How many days ahead to schedule interviews
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="buffer-time">Buffer Time (Minutes)</Label>
                        <Input
                          id="buffer-time"
                          type="number"
                          min="0"
                          max="60"
                          value={bufferTimeMinutes}
                          onChange={(e) => setBufferTimeMinutes(parseInt(e.target.value) || 15)}
                        />
                        <p className="text-xs text-muted-foreground">
                          Time between consecutive interviews
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Available Time Slots</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleAddTimeSlot}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Slot
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {availableTimeSlots.map((slot, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Input
                              type="time"
                              value={slot}
                              onChange={(e) => handleTimeSlotChange(index, e.target.value)}
                              className="flex-1"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveTimeSlot(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="auto-reschedule-no-show">Auto-Reschedule on No-Show</Label>
                          <p className="text-sm text-muted-foreground">
                            Automatically reschedule if candidate doesn't show up
                          </p>
                        </div>
                        <Switch
                          id="auto-reschedule-no-show"
                          checked={autoRescheduleOnNoShow}
                          onCheckedChange={setAutoRescheduleOnNoShow}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="auto-reschedule-cancel">Auto-Reschedule on Cancel</Label>
                          <p className="text-sm text-muted-foreground">
                            Automatically reschedule if interview is cancelled
                          </p>
                        </div>
                        <Switch
                          id="auto-reschedule-cancel"
                          checked={autoRescheduleOnCancel}
                          onCheckedChange={setAutoRescheduleOnCancel}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Assignment Settings */}
              <TabsContent value="assignment" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Assign Interview</CardTitle>
                    <CardDescription>Select employees to assign to this interview</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <Label>Assigned Interviewers</Label>
                      {assignedInterviewerIds.length === 0 ? (
                        <div className="text-sm text-muted-foreground italic border border-dashed rounded-md p-4 text-center">
                          No interviewers assigned yet
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {assignedInterviewerIds.map(id => {
                            const user = companyUsers.find(u => u.id === id);
                            return (
                              <div key={id} className="flex items-center justify-between p-2 border rounded-md">
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-8 w-8">
                                    <AvatarFallback>{user?.name.charAt(0)}</AvatarFallback>
                                  </Avatar>
                                  <div className="flex flex-col">
                                    <span className="text-sm font-medium">{user?.name || 'Unknown User'}</span>
                                    <span className="text-xs text-muted-foreground">{user?.email}</span>
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleRemoveInterviewer(id)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <Label>Available Employees</Label>
                      {usersLoading ? (
                        <div className="text-sm text-muted-foreground">Loading users...</div>
                      ) : (
                        <ScrollArea className="h-[200px] border rounded-md p-2">
                          <div className="space-y-2">
                            {companyUsers
                              .filter(u => !assignedInterviewerIds.includes(u.id))
                              .map(user => (
                                <div key={user.id} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-md transition-colors">
                                  <div className="flex items-center gap-2">
                                    <Avatar className="h-8 w-8">
                                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col">
                                      <span className="text-sm font-medium">{user.name}</span>
                                      <span className="text-xs text-muted-foreground">{user.email}</span>
                                    </div>
                                  </div>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleAddInterviewer(user.id)}
                                  >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Assign
                                  </Button>
                                </div>
                              ))}
                          </div>
                        </ScrollArea>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}

          {/* Save Button */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving || loading}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Saving..." : "Save Configuration"}
            </Button>
          </div>
        </div>
      )}
    </FormDrawer>
  );
}
