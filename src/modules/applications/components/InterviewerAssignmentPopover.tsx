// @ts-nocheck
import React, { useState, useEffect } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/components/ui/popover';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { UserPlus, Search, Loader2, Check, Users } from 'lucide-react';
import { apiClient } from '@/shared/lib/api';
import { toast } from 'sonner';

interface Interviewer {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: string;
  department?: string;
}

interface InterviewerAssignmentPopoverProps {
  interviewId: string;
  applicationId: string;
  jobId: string;
  roundId: string;
  currentInterviewerIds: string[];
  onAssign?: () => void;
}

// Compact avatar display for assigned interviewers
export function InterviewerAvatars({ 
  interviewerIds, 
  maxDisplay = 3 
}: { 
  interviewerIds: string[]; 
  maxDisplay?: number;
}) {
  if (!interviewerIds || interviewerIds.length === 0) {
    return (
      <span className="text-xs text-muted-foreground flex items-center gap-1">
        <Users className="h-3 w-3" />
        No interviewers
      </span>
    );
  }

  const displayCount = Math.min(interviewerIds.length, maxDisplay);
  const remaining = interviewerIds.length - displayCount;

  return (
    <div className="flex items-center -space-x-2">
      {interviewerIds.slice(0, displayCount).map((id, idx) => (
        <Avatar key={id} className="h-6 w-6 border-2 border-background">
          <AvatarFallback className="text-[10px] bg-primary/10">
            {String.fromCharCode(65 + idx)}
          </AvatarFallback>
        </Avatar>
      ))}
      {remaining > 0 && (
        <div className="h-6 w-6 rounded-full bg-muted border-2 border-background flex items-center justify-center">
          <span className="text-[10px] font-medium">+{remaining}</span>
        </div>
      )}
    </div>
  );
}

export function InterviewerAssignmentPopover({
  interviewId,
  applicationId,
  jobId,
  roundId,
  currentInterviewerIds,
  onAssign,
}: InterviewerAssignmentPopoverProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [interviewers, setInterviewers] = useState<Interviewer[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(currentInterviewerIds));

  useEffect(() => {
    if (open) {
      loadInterviewers();
      setSelectedIds(new Set(currentInterviewerIds));
    }
  }, [open, currentInterviewerIds]);

  const loadInterviewers = async () => {
    setLoading(true);
    try {
      // Get team members / users that can be interviewers
      const response = await apiClient.get<{ users?: any[]; data?: any[] }>('/api/users');
      
      if (response.success && response.data) {
        const users = response.data.users || response.data.data || (Array.isArray(response.data) ? response.data : []);
        setInterviewers(users.map((u: any) => ({
          id: u.id,
          name: u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email,
          email: u.email,
          avatar: u.avatar || u.photo,
          role: u.role,
          department: u.department,
        })));
      }
    } catch (error) {
      console.error('Failed to load interviewers:', error);
      // Fallback to mock data for demo
      setInterviewers([
        { id: '1', name: 'John Smith', email: 'john@company.com', role: 'Engineering Manager' },
        { id: '2', name: 'Sarah Johnson', email: 'sarah@company.com', role: 'Senior Developer' },
        { id: '3', name: 'Mike Chen', email: 'mike@company.com', role: 'Tech Lead' },
        { id: '4', name: 'Emily Davis', email: 'emily@company.com', role: 'HR Manager' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const toggleInterviewer = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleAssign = async () => {
    setSaving(true);
    try {
      await apiClient.put(`/api/interviews/${interviewId}`, {
        interviewerIds: Array.from(selectedIds),
      });
      toast.success('Interviewers assigned successfully');
      setOpen(false);
      onAssign?.();
    } catch (error) {
      console.error('Failed to assign interviewers:', error);
      toast.error('Failed to assign interviewers');
    } finally {
      setSaving(false);
    }
  };

  const filteredInterviewers = interviewers.filter(
    (i) =>
      i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const hasChanges = 
    selectedIds.size !== currentInterviewerIds.length ||
    !currentInterviewerIds.every(id => selectedIds.has(id));

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 gap-2 px-2">
          <InterviewerAvatars interviewerIds={currentInterviewerIds} />
          <UserPlus className="h-3.5 w-3.5 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="p-3 border-b">
          <h4 className="font-medium text-sm">Assign Interviewers</h4>
          <p className="text-xs text-muted-foreground mt-1">
            Select team members to conduct this interview
          </p>
        </div>

        <div className="p-2 border-b">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-9"
            />
          </div>
        </div>

        <div className="max-h-[240px] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : filteredInterviewers.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              No interviewers found
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {filteredInterviewers.map((interviewer) => (
                <div
                  key={interviewer.id}
                  className="flex items-center gap-3 p-2 rounded-md hover:bg-muted cursor-pointer"
                  onClick={() => toggleInterviewer(interviewer.id)}
                >
                  <Checkbox checked={selectedIds.has(interviewer.id)} />
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={interviewer.avatar} />
                    <AvatarFallback className="text-xs">
                      {interviewer.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{interviewer.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {interviewer.role || interviewer.email}
                    </p>
                  </div>
                  {selectedIds.has(interviewer.id) && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-2 border-t flex justify-between items-center">
          <span className="text-xs text-muted-foreground">
            {selectedIds.size} selected
          </span>
          <Button
            size="sm"
            onClick={handleAssign}
            disabled={saving || !hasChanges}
          >
            {saving && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
            Assign
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
