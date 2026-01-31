import { useState, useEffect } from "react";
import { HiringTeamMember } from "@/shared/types/job";
import { userService, CompanyUser } from "@/shared/lib/api/userService";
import { hiringTeamService } from "@/shared/lib/api/hiringTeamService";
import { toast } from "@/shared/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { extractEmailDomain, doDomainsBelongToSameOrg } from "@/shared/lib/utils/domain";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/shared/components/ui/radio-group";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { ComboboxWithAdd } from "@/shared/components/ui/combobox-with-add";

interface AddHiringTeamDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (member: HiringTeamMember) => void;
  editMember?: HiringTeamMember | null;
  currentUserId?: string;
  jobId?: string | null;
}

export function AddHiringTeamDialog({
  open,
  onOpenChange,
  onAdd,
  editMember,
  currentUserId = 'current-user',
  jobId,
}: AddHiringTeamDialogProps) {
  const { user } = useAuth();
  const [selectedUserId, setSelectedUserId] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [role, setRole] = useState<HiringTeamMember['role']>('recruiter');
  const [permissions, setPermissions] = useState({
    canViewApplications: true,
    canShortlist: false,
    canScheduleInterviews: false,
    canMakeOffers: false,
  });
  const [companyUsers, setCompanyUsers] = useState<CompanyUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [emailError, setEmailError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'existing' | 'invite'>('existing');

  // Get company domain from current user's email
  const companyDomain = user?.email ? extractEmailDomain(user.email) : '';

  // Fetch company users when dialog opens
  useEffect(() => {
    if (open && !loadingUsers) {
      setLoadingUsers(true);
      userService
        .getCompanyUsers()
        .then((users) => {
          // Filter out the current user from the list
          const filteredUsers = currentUserId 
            ? users.filter(user => user.id !== currentUserId)
            : users;
          setCompanyUsers(filteredUsers);
        })
        .catch((error) => {
          console.error('Failed to fetch company users:', error);
          toast({
            title: 'Error',
            description: 'Failed to load company users',
            variant: 'destructive',
          });
        })
        .finally(() => {
          setLoadingUsers(false);
        });
    }
  }, [open, currentUserId]);

  // Pre-fill form when editing
  useEffect(() => {
    if (editMember) {
      if (editMember.userId) {
        // Existing user - switch to existing tab
        setActiveTab('existing');
        const user = companyUsers.find(u => u.id === editMember.userId);
        if (user) {
          setSelectedUserId(`${user.name} (${user.email})`);
        }
        // Clear invite fields
        setInviteEmail('');
        setInviteName('');
      } else {
        // Invited user - switch to invite tab
        setActiveTab('invite');
        setInviteEmail(editMember.email);
        setInviteName(editMember.name);
        // Clear existing user selection
        setSelectedUserId('');
      }
      setRole(editMember.role);
      setPermissions(editMember.permissions);
    } else {
      // Not editing - reset form
      resetForm();
      setActiveTab('existing');
    }
  }, [editMember, companyUsers]);

  const resetForm = () => {
    setSelectedUserId('');
    setInviteEmail('');
    setInviteName('');
    setRole('recruiter');
    setPermissions({
      canViewApplications: true,
      canShortlist: false,
      canScheduleInterviews: false,
      canMakeOffers: false,
    });
    setEmailError('');
  };

  const handleAddExisting = () => {
    // When editing, use the original user data
    if (editMember && editMember.userId) {
      const user = companyUsers.find((u) => u.id === editMember.userId);
      if (!user) {
        toast({
          title: 'Error',
          description: 'User not found',
          variant: 'destructive',
        });
        return;
      }

      // Preserve original user data, only update role and permissions
      const member: HiringTeamMember = {
        id: editMember.id,
        userId: editMember.userId, // Preserve original userId
        email: editMember.email, // Preserve original email
        name: editMember.name, // Preserve original name
        role,
        permissions,
        status: editMember.status,
        addedBy: editMember.addedBy,
        invitedAt: editMember.invitedAt,
      };

      onAdd(member);
      resetForm();
      onOpenChange(false);
      
      toast({
        title: 'Success',
        description: 'Team member updated successfully',
      });
      return;
    }

    // For new members, require user selection
    const selectedLabel = selectedUserId;
    const user = companyUsers.find((u) => `${u.name} (${u.email})` === selectedLabel);
    if (!user) {
      toast({
        title: 'Error',
        description: 'Please select a user',
        variant: 'destructive',
      });
      return;
    }

    const member: HiringTeamMember = {
      id: `member-${Date.now()}`,
      userId: user.id,
      email: user.email,
      name: user.name,
      role,
      permissions,
      status: 'active',
      addedBy: currentUserId,
    };

    onAdd(member);
    resetForm();
    onOpenChange(false);
  };

  // Validate email domain on change
  useEffect(() => {
    if (!inviteEmail || !companyDomain) {
      setEmailError('');
      return;
    }

    try {
      const inviteeDomain = extractEmailDomain(inviteEmail);
      const domainsMatch = doDomainsBelongToSameOrg(inviteeDomain, companyDomain);
      
      if (!domainsMatch) {
        setEmailError(`Email must be from your company domain (${companyDomain})`);
      } else {
        setEmailError('');
      }
    } catch (error) {
      setEmailError('Invalid email format');
    }
  }, [inviteEmail, companyDomain]);

  const handleInviteNew = async () => {
    if (!inviteEmail || !inviteName) return;

    // Validate domain before sending
    if (emailError) {
      toast({
        title: 'Invalid Email Domain',
        description: emailError,
        variant: 'destructive',
      });
      return;
    }

    if (!companyDomain) {
      toast({
        title: 'Error',
        description: 'Unable to determine company domain',
        variant: 'destructive',
      });
      return;
    }

    // If editing an existing invited member, just update local state
    // Preserve original email/name, only update role and permissions
    if (editMember && editMember.status === 'pending_invite') {
    const member: HiringTeamMember = {
        id: editMember.id,
        email: editMember.email, // Preserve original email
        name: editMember.name, // Preserve original name
        role,
        permissions,
        status: editMember.status,
        invitedAt: editMember.invitedAt,
        addedBy: editMember.addedBy,
      };

      onAdd(member);
      resetForm();
      onOpenChange(false);
      
      toast({
        title: 'Success',
        description: 'Team member updated successfully',
      });
      return;
    }

    // For new invitations, need jobId
    if (!jobId) {
      toast({
        title: 'Error',
        description: 'Job must be saved before inviting team members',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      // Send invitation via API only for new invites
      await hiringTeamService.inviteMember(jobId, {
      email: inviteEmail,
      name: inviteName,
      role,
      permissions,
      });

      // Add to local state
      const member: HiringTeamMember = {
        id: editMember?.id || `member-${Date.now()}`,
        email: editMember?.email || inviteEmail, // Preserve original email when editing
        name: editMember?.name || inviteName, // Preserve original name when editing
        role,
        permissions,
      status: editMember?.status || 'pending_invite',
      invitedAt: editMember?.invitedAt || new Date().toISOString(),
      addedBy: editMember?.addedBy || currentUserId,
    };

    onAdd(member);
    resetForm();
    onOpenChange(false);
      
      toast({
        title: 'Success',
        description: editMember ? 'Team member updated successfully' : 'Invitation sent successfully',
      });
    } catch (error) {
      console.error('Failed to send invitation:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to send invitation',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const userOptions = companyUsers.map((user) => `${user.name} (${user.email})`);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{editMember ? 'Edit Team Member' : 'Add Team Member'}</DialogTitle>
          <DialogDescription>
            {editMember ? 'Update team member role and permissions' : 'Add existing users or invite new members to the hiring team'}
          </DialogDescription>
        </DialogHeader>

        {editMember ? (
          // When editing, show content directly without tabs
          <div className="space-y-4 pt-4">
            {editMember.userId ? (
              // Editing existing user
              <div className="space-y-2">
                <Label>User</Label>
                <div className="p-3 border rounded-lg bg-muted">
                  <p className="font-medium">{editMember.name}</p>
                  <p className="text-sm text-muted-foreground">{editMember.email}</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  User cannot be changed when editing. Only role and permissions can be modified.
                </p>
              </div>
            ) : (
              // Editing invited user
              <>
                <div className="space-y-2">
                  <Label htmlFor="invite-email">Email Address</Label>
                  <div className="p-3 border rounded-lg bg-muted">
                    <p className="font-medium">{editMember.email}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Email cannot be changed when editing. Only role and permissions can be modified.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="invite-name">Full Name</Label>
                  <div className="p-3 border rounded-lg bg-muted">
                    <p className="font-medium">{editMember.name}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Name cannot be changed when editing. Only role and permissions can be modified.
                  </p>
                </div>
              </>
            )}

            {/* Role Section */}
            <div className="space-y-2">
              <Label>Role</Label>
              <RadioGroup value={role} onValueChange={(value) => setRole(value as HiringTeamMember['role'])}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="hiring_manager" id="edit-role-hm" />
                  <Label htmlFor="edit-role-hm" className="font-normal">Hiring Manager</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="recruiter" id="edit-role-rec" />
                  <Label htmlFor="edit-role-rec" className="font-normal">Recruiter</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="interviewer" id="edit-role-int" />
                  <Label htmlFor="edit-role-int" className="font-normal">Interviewer</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="coordinator" id="edit-role-coord" />
                  <Label htmlFor="edit-role-coord" className="font-normal">Coordinator</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Permissions Section */}
            <div className="space-y-2">
              <Label>Permissions</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="edit-perm-view"
                    checked={permissions.canViewApplications}
                    onCheckedChange={(checked) =>
                      setPermissions({ ...permissions, canViewApplications: !!checked })
                    }
                  />
                  <Label htmlFor="edit-perm-view" className="font-normal">
                    View Applications
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="edit-perm-shortlist"
                    checked={permissions.canShortlist}
                    onCheckedChange={(checked) =>
                      setPermissions({ ...permissions, canShortlist: !!checked })
                    }
                  />
                  <Label htmlFor="edit-perm-shortlist" className="font-normal">
                    Shortlist Candidates
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="edit-perm-schedule"
                    checked={permissions.canScheduleInterviews}
                    onCheckedChange={(checked) =>
                      setPermissions({ ...permissions, canScheduleInterviews: !!checked })
                    }
                  />
                  <Label htmlFor="edit-perm-schedule" className="font-normal">
                    Schedule Interviews
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="edit-perm-offer"
                    checked={permissions.canMakeOffers}
                    onCheckedChange={(checked) =>
                      setPermissions({ ...permissions, canMakeOffers: !!checked })
                    }
                  />
                  <Label htmlFor="edit-perm-offer" className="font-normal">
                    Make Offers
                  </Label>
                </div>
              </div>
            </div>

            {/* Update Button */}
            <Button
              onClick={editMember.userId ? handleAddExisting : handleInviteNew}
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Updating...' : 'Update Team Member'}
            </Button>
          </div>
        ) : (
          // When adding new, show tabs
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'existing' | 'invite')} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="existing">Existing Users</TabsTrigger>
            <TabsTrigger value="invite">Invite New User</TabsTrigger>
          </TabsList>

          <TabsContent value="existing" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Select User</Label>
              <ComboboxWithAdd
                value={selectedUserId}
                onValueChange={setSelectedUserId}
                options={userOptions}
                placeholder="Search users..."
                emptyText="No users found"
                disabled={!!editMember} // Disable when editing
              />
              {editMember && (
                <p className="text-sm text-muted-foreground">
                  User cannot be changed when editing. Only role and permissions can be modified.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Role</Label>
              <RadioGroup value={role} onValueChange={(value) => setRole(value as HiringTeamMember['role'])}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="hiring_manager" id="role-hm" />
                  <Label htmlFor="role-hm" className="font-normal">Hiring Manager</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="recruiter" id="role-rec" />
                  <Label htmlFor="role-rec" className="font-normal">Recruiter</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="interviewer" id="role-int" />
                  <Label htmlFor="role-int" className="font-normal">Interviewer</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="coordinator" id="role-coord" />
                  <Label htmlFor="role-coord" className="font-normal">Coordinator</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label>Permissions</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="perm-view"
                    checked={permissions.canViewApplications}
                    onCheckedChange={(checked) =>
                      setPermissions({ ...permissions, canViewApplications: !!checked })
                    }
                  />
                  <Label htmlFor="perm-view" className="font-normal">
                    View Applications
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="perm-shortlist"
                    checked={permissions.canShortlist}
                    onCheckedChange={(checked) =>
                      setPermissions({ ...permissions, canShortlist: !!checked })
                    }
                  />
                  <Label htmlFor="perm-shortlist" className="font-normal">
                    Shortlist Candidates
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="perm-schedule"
                    checked={permissions.canScheduleInterviews}
                    onCheckedChange={(checked) =>
                      setPermissions({ ...permissions, canScheduleInterviews: !!checked })
                    }
                  />
                  <Label htmlFor="perm-schedule" className="font-normal">
                    Schedule Interviews
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="perm-offer"
                    checked={permissions.canMakeOffers}
                    onCheckedChange={(checked) =>
                      setPermissions({ ...permissions, canMakeOffers: !!checked })
                    }
                  />
                  <Label htmlFor="perm-offer" className="font-normal">
                    Make Offers
                  </Label>
                </div>
              </div>
            </div>

            <Button
              onClick={handleAddExisting}
              disabled={!selectedUserId || loadingUsers}
              className="w-full"
            >
              {loadingUsers ? 'Loading...' : editMember ? 'Update Team Member' : 'Add Team Member'}
            </Button>
          </TabsContent>

          <TabsContent value="invite" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="invite-email">Email Address</Label>
              <Input
                id="invite-email"
                type="email"
                placeholder={`user@${companyDomain || 'company.com'}`}
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className={emailError ? 'border-destructive' : ''}
                disabled={!!editMember} // Disable when editing
              />
              {emailError && (
                <p className="text-sm text-destructive">{emailError}</p>
              )}
              {companyDomain && !emailError && inviteEmail && (
                <p className="text-sm text-muted-foreground">
                  Email must be from {companyDomain}
                </p>
              )}
              {editMember && (
                <p className="text-sm text-muted-foreground">
                  Email cannot be changed when editing. Only role and permissions can be modified.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="invite-name">Full Name</Label>
              <Input
                id="invite-name"
                placeholder="John Doe"
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
                disabled={!!editMember} // Disable when editing
              />
              {editMember && (
                <p className="text-sm text-muted-foreground">
                  Name cannot be changed when editing. Only role and permissions can be modified.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Role</Label>
              <RadioGroup value={role} onValueChange={(value) => setRole(value as HiringTeamMember['role'])}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="hiring_manager" id="invite-role-hm" />
                  <Label htmlFor="invite-role-hm" className="font-normal">Hiring Manager</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="recruiter" id="invite-role-rec" />
                  <Label htmlFor="invite-role-rec" className="font-normal">Recruiter</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="interviewer" id="invite-role-int" />
                  <Label htmlFor="invite-role-int" className="font-normal">Interviewer</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="coordinator" id="invite-role-coord" />
                  <Label htmlFor="invite-role-coord" className="font-normal">Coordinator</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label>Permissions</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="invite-perm-view"
                    checked={permissions.canViewApplications}
                    onCheckedChange={(checked) =>
                      setPermissions({ ...permissions, canViewApplications: !!checked })
                    }
                  />
                  <Label htmlFor="invite-perm-view" className="font-normal">
                    View Applications
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="invite-perm-shortlist"
                    checked={permissions.canShortlist}
                    onCheckedChange={(checked) =>
                      setPermissions({ ...permissions, canShortlist: !!checked })
                    }
                  />
                  <Label htmlFor="invite-perm-shortlist" className="font-normal">
                    Shortlist Candidates
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="invite-perm-schedule"
                    checked={permissions.canScheduleInterviews}
                    onCheckedChange={(checked) =>
                      setPermissions({ ...permissions, canScheduleInterviews: !!checked })
                    }
                  />
                  <Label htmlFor="invite-perm-schedule" className="font-normal">
                    Schedule Interviews
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="invite-perm-offer"
                    checked={permissions.canMakeOffers}
                    onCheckedChange={(checked) =>
                      setPermissions({ ...permissions, canMakeOffers: !!checked })
                    }
                  />
                  <Label htmlFor="invite-perm-offer" className="font-normal">
                    Make Offers
                  </Label>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
              User will receive an email invitation to join the platform and this hiring team
            </div>

            <Button
              onClick={handleInviteNew}
              disabled={!inviteEmail || !inviteName || loading || !jobId || !!emailError}
              className="w-full"
            >
              {loading ? 'Sending...' : editMember ? 'Update Member' : 'Send Invite'}
            </Button>
          </TabsContent>
        </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
