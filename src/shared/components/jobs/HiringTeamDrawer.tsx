/**
 * Hiring Team Management Drawer
 * Allows managing hiring team members for a job posting
 */

import { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/shared/components/ui/sheet';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Badge } from '@/shared/components/ui/badge';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { Separator } from '@/shared/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { Checkbox } from '@/shared/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog';
import {
  UserPlus,
  X,
  Search,
  Users,
  Trash2,
  Shield,
  UserCheck,
  Briefcase,
  Mail,
  Check,
  Loader2,
} from 'lucide-react';
import { useToast } from '@/shared/hooks/use-toast';
import { jobService } from '@/shared/lib/api/jobService';

// Types
export interface HiringTeamMember {
  id: string;
  userId: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'hiring_manager' | 'recruiter' | 'interviewer' | 'coordinator' | 'approver';
  responsibilities: {
    newCandidates: boolean;
    assessment: boolean;
    interview: boolean;
    offer: boolean;
  };
  addedAt: string;
  addedBy?: string;
}

export interface HiringTeamData {
  members: HiringTeamMember[];
}

// Role configuration
const ROLES = [
  { value: 'hiring_manager', label: 'Hiring Manager', icon: Shield, description: 'Full access to all candidates and decisions' },
  { value: 'recruiter', label: 'Recruiter', icon: UserCheck, description: 'Manages candidate pipeline and communication' },
  { value: 'interviewer', label: 'Interviewer', icon: Briefcase, description: 'Conducts interviews and provides feedback' },
  { value: 'coordinator', label: 'Coordinator', icon: Users, description: 'Schedules interviews and manages logistics' },
  { value: 'approver', label: 'Approver', icon: Check, description: 'Reviews and approves hiring decisions' },
] as const;

// Responsibility options
const RESPONSIBILITIES = [
  { key: 'newCandidates', label: 'New Candidates', description: 'Notified when new candidates apply' },
  { key: 'assessment', label: 'Assessment', description: 'Can review and score assessments' },
  { key: 'interview', label: 'Interview', description: 'Can conduct and schedule interviews' },
  { key: 'offer', label: 'Offer', description: 'Can view and approve offers' },
] as const;

interface HiringTeamDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobId: string;
  jobTitle: string;
  hiringTeam?: HiringTeamData | null;
  onUpdate: () => void;
}

export function HiringTeamDrawer({
  open,
  onOpenChange,
  jobId,
  jobTitle,
  hiringTeam,
  onUpdate,
}: HiringTeamDrawerProps) {
  const { toast } = useToast();
  const [members, setMembers] = useState<HiringTeamMember[]>([]);
  const [searchQuery, setSearchQuery] = useState(''); const [isSaving, setIsSaving] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);

  // New member form state
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<HiringTeamMember['role']>('interviewer');
  const [newMemberResponsibilities, setNewMemberResponsibilities] = useState({
    newCandidates: false,
    assessment: false,
    interview: true,
    offer: false,
  });

  // Initialize members from props
  useEffect(() => {
    if (hiringTeam?.members) {
      setMembers(hiringTeam.members);
    } else {
      setMembers([]);
    }
  }, [hiringTeam]);

  const handleAddMember = async () => {
    if (!newMemberEmail || !newMemberName) {
      toast({
        title: 'Validation Error',
        description: 'Please enter both name and email',
        variant: 'destructive',
      });
      return;
    }

    // Check for duplicate
    if (members.some(m => m.email.toLowerCase() === newMemberEmail.toLowerCase())) {
      toast({
        title: 'Duplicate Member',
        description: 'This team member has already been added',
        variant: 'destructive',
      });
      return;
    }

    const newMember: HiringTeamMember = {
      id: `member_${Date.now()}`,
      userId: `user_${Date.now()}`,
      name: newMemberName,
      email: newMemberEmail,
      role: newMemberRole,
      responsibilities: newMemberResponsibilities,
      addedAt: new Date().toISOString(),
    };

    const updatedMembers = [...members, newMember];
    setMembers(updatedMembers);

    // Reset form
    setNewMemberEmail('');
    setNewMemberName('');
    setNewMemberRole('interviewer');
    setNewMemberResponsibilities({
      newCandidates: false,
      assessment: false,
      interview: true,
      offer: false,
    });
    setShowAddMember(false);

    toast({
      title: 'Team Member Added',
      description: `${newMemberName} has been added to the hiring team`,
    });
  };

  const handleRemoveMember = (memberId: string) => {
    const member = members.find(m => m.id === memberId);
    setMembers(members.filter(m => m.id !== memberId));
    setRemovingMemberId(null);

    toast({
      title: 'Team Member Removed',
      description: `${member?.name} has been removed from the hiring team`,
    });
  };

  const handleUpdateMemberRole = (memberId: string, role: HiringTeamMember['role']) => {
    setMembers(members.map(m =>
      m.id === memberId ? { ...m, role } : m
    ));
  };

  const handleUpdateMemberResponsibility = (
    memberId: string,
    responsibility: keyof HiringTeamMember['responsibilities'],
    value: boolean
  ) => {
    setMembers(members.map(m =>
      m.id === memberId
        ? { ...m, responsibilities: { ...m.responsibilities, [responsibility]: value } }
        : m
    ));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await jobService.updateJob(jobId, {
        hiringTeam: { members } as any,
      });

      if (response.success) {
        toast({
          title: 'Hiring Team Updated',
          description: 'The hiring team has been saved successfully',
        });
        onUpdate();
        onOpenChange(false);
      } else {
        throw new Error(response.error || 'Failed to save hiring team');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save hiring team',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const filteredMembers = members.filter(m =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.email.toLowerCase().includes(searchQuery.toLowerCase())
  );


  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-xl overflow-hidden flex flex-col">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Hiring Team
            </SheetTitle>
            <SheetDescription>
              Manage the hiring team for <span className="font-medium">{jobTitle}</span>
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 flex flex-col min-h-0 mt-4">
            {/* Actions Bar */}
            <div className="flex items-center gap-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search team members..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button onClick={() => setShowAddMember(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Add
              </Button>
            </div>

            {/* Add Member Form */}
            {showAddMember && (
              <Card className="mb-4">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center justify-between">
                    Add Team Member
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => setShowAddMember(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="name" className="text-xs">Name</Label>
                      <Input
                        id="name"
                        placeholder="John Doe"
                        value={newMemberName}
                        onChange={(e) => setNewMemberName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="email" className="text-xs">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="john@company.com"
                        value={newMemberEmail}
                        onChange={(e) => setNewMemberEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs">Role</Label>
                    <Select value={newMemberRole} onValueChange={(v) => setNewMemberRole(v as HiringTeamMember['role'])}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ROLES.map((role) => (
                          <SelectItem key={role.value} value={role.value}>
                            <div className="flex items-center gap-2">
                              <role.icon className="h-4 w-4" />
                              {role.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Responsibilities</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {RESPONSIBILITIES.map((resp) => (
                        <label
                          key={resp.key}
                          className="flex items-center gap-2 text-sm cursor-pointer"
                        >
                          <Checkbox
                            checked={newMemberResponsibilities[resp.key as keyof typeof newMemberResponsibilities]}
                            onCheckedChange={(checked) =>
                              setNewMemberResponsibilities(prev => ({
                                ...prev,
                                [resp.key]: checked === true,
                              }))
                            }
                          />
                          {resp.label}
                        </label>
                      ))}
                    </div>
                  </div>

                  <Button onClick={handleAddMember} className="w-full">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add to Team
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Team Members List */}
            <ScrollArea className="flex-1">
              <div className="space-y-3 pr-4">
                {filteredMembers.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                    <h3 className="font-medium mb-1">No team members</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {searchQuery
                        ? 'No members match your search'
                        : 'Add hiring managers, recruiters, and interviewers'}
                    </p>
                    {!searchQuery && (
                      <Button variant="outline" onClick={() => setShowAddMember(true)}>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add First Member
                      </Button>
                    )}
                  </div>
                ) : (
                  filteredMembers.map((member) => {
                    return (
                      <Card key={member.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <Avatar className="h-10 w-10">
                              {member.avatar && <AvatarImage src={member.avatar} />}
                              <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                            </Avatar>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className="font-medium truncate">{member.name}</h4>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                  onClick={() => setRemovingMemberId(member.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>

                              <p className="text-sm text-muted-foreground flex items-center gap-1 mb-2">
                                <Mail className="h-3 w-3" />
                                {member.email}
                              </p>

                              {/* Role Selector */}
                              <div className="flex items-center gap-2 mb-3">
                                <Select
                                  value={member.role}
                                  onValueChange={(v) => handleUpdateMemberRole(member.id, v as HiringTeamMember['role'])}
                                >
                                  <SelectTrigger className="h-8 text-xs w-[160px]">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {ROLES.map((role) => (
                                      <SelectItem key={role.value} value={role.value}>
                                        <div className="flex items-center gap-2">
                                          <role.icon className="h-3.5 w-3.5" />
                                          {role.label}
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>

                              {/* Responsibilities */}
                              <div className="flex flex-wrap gap-1.5">
                                {RESPONSIBILITIES.map((resp) => {
                                  const isActive = member.responsibilities[resp.key as keyof typeof member.responsibilities];
                                  return (
                                    <Badge
                                      key={resp.key}
                                      variant={isActive ? 'default' : 'outline'}
                                      className="cursor-pointer text-xs"
                                      onClick={() =>
                                        handleUpdateMemberResponsibility(
                                          member.id,
                                          resp.key as keyof HiringTeamMember['responsibilities'],
                                          !isActive
                                        )
                                      }
                                    >
                                      {isActive && <Check className="h-3 w-3 mr-1" />}
                                      {resp.label}
                                    </Badge>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            </ScrollArea>

            {/* Footer Actions */}
            <Separator className="my-4" />
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {members.length} team member{members.length !== 1 ? 's' : ''}
              </p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Remove Confirmation Dialog */}
      <AlertDialog open={!!removingMemberId} onOpenChange={(open) => !open && setRemovingMemberId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove{' '}
              <span className="font-medium">
                {members.find(m => m.id === removingMemberId)?.name}
              </span>{' '}
              from the hiring team? They will lose access to this job's candidates and interviews.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => removingMemberId && handleRemoveMember(removingMemberId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
