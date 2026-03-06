import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/shared/components/ui/sheet";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Search, Loader2, UserPlus, MapPin, Mail, Phone, Linkedin, CheckCircle, X } from "lucide-react";
import { talentPoolService, TalentPoolCandidate } from "@/shared/lib/applicationService";
import { toast } from "sonner";
import { applicationService } from "@/shared/lib/applicationService";
import { useDebounce } from "@/shared/hooks/use-debounce";

interface TalentPoolSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobId: string;
  jobTitle?: string;
  onCandidateAdded?: () => void;
}

export function TalentPoolSearchDialog({
  open,
  onOpenChange,
  jobId,
  jobTitle = "this position",
  onCandidateAdded,
}: TalentPoolSearchDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [candidates, setCandidates] = useState<(TalentPoolCandidate & { hasApplied?: boolean; hasPendingInvitation?: boolean })[]>([]);
  const [loading, setLoading] = useState(false);
  const [addingCandidateId, setAddingCandidateId] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [inviteEmail, setInviteEmail] = useState("");
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [sendingInvite, setSendingInvite] = useState(false);
  const limit = 20;

  useEffect(() => {
    if (open) {
      // Initial load when dialog opens
      handleSearch();
    } else {
      // Reset when dialog closes
      setSearchQuery("");
      setCandidates([]);
      setOffset(0);
      setTotal(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Trigger search when debounced query changes (but not on initial open)
  useEffect(() => {
    if (open && debouncedSearchQuery !== undefined && debouncedSearchQuery !== "") {
      // Only search if user has typed something and it's debounced
      handleSearch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchQuery]);

  const handleSearch = async (query?: string) => {
    const searchTerm = query !== undefined ? query : debouncedSearchQuery;
    
    if (!searchTerm.trim() && candidates.length === 0) {
      // Initial load - show some candidates
      setLoading(true);
      try {
        const response = await talentPoolService.searchCandidates({
          jobId, // Pass jobId to check if candidates have already applied
          limit,
          offset: 0,
        });
        if (response.success) {
          setCandidates(response.data?.candidates || []);
          setTotal(response.data?.total || 0);
          setOffset(limit);
        }
      } catch (error) {
        console.error("Failed to search talent pool:", error);
        toast.error("Failed to load candidates");
      } finally {
        setLoading(false);
      }
      return;
    }

    setLoading(true);
    try {
      const response = await talentPoolService.searchCandidates({
        search: searchTerm,
        jobId, // Pass jobId to check if candidates have already applied
        limit,
        offset: 0,
      });
      if (response.success) {
        setCandidates(response.data?.candidates || []);
        setTotal(response.data?.total || 0);
        setOffset(limit);
      }
    } catch (error) {
      console.error("Failed to search talent pool:", error);
      toast.error("Failed to search candidates");
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = async () => {
    setLoading(true);
    try {
      const response = await talentPoolService.searchCandidates({
        search: searchQuery,
        jobId, // Pass jobId to check if candidates have already applied
        limit,
        offset,
      });
      if (response.success) {
        setCandidates((prev) => [...prev, ...(response.data?.candidates || [])]);
        setOffset((prev) => prev + limit);
      }
    } catch (error) {
      console.error("Failed to load more candidates:", error);
      toast.error("Failed to load more candidates");
    } finally {
      setLoading(false);
    }
  };

  const handleAddCandidate = async (candidate: TalentPoolCandidate & { hasApplied?: boolean }) => {
    // Check if already applied (client-side check)
    if (candidate.hasApplied) {
      toast.info(`${candidate.firstName} ${candidate.lastName} has already applied to this job`);
      return;
    }

    // Disable button immediately to prevent race conditions
    setAddingCandidateId(candidate.id);
    
    try {
      const response = await applicationService.addFromTalentPool({
        jobId,
        candidateId: candidate.id,
      });
      
      if (response.success) {
        toast.success(`Invitation sent to ${candidate.firstName} ${candidate.lastName}`, {
          description: `The candidate will receive an email invitation to apply for ${jobTitle}.`,
          action: {
            label: "Add Another",
            onClick: () => {
              // Keep dialog open for adding more candidates
            },
          },
        });
        
        // Optimistically update the candidate's status
        setCandidates(prev => prev.map(c => 
          c.id === candidate.id 
            ? { ...c, hasApplied: false, hasPendingInvitation: true }
            : c
        ));
        
        // Refresh the list to get updated statuses (but don't close dialog)
        onCandidateAdded?.();
        // Don't close dialog automatically - let user decide
      } else {
        // Handle all error codes with specific messages
        const errorCode = response.code;
        const candidateName = `${candidate.firstName} ${candidate.lastName}`;
        
        switch (errorCode) {
          case 'ALREADY_APPLIED':
            toast.info(`${candidateName} has already applied to this job`, {
              description: "This candidate is already in the application pipeline.",
            });
            // Update hasApplied status
            setCandidates(prev => prev.map(c => 
              c.id === candidate.id ? { ...c, hasApplied: true } : c
            ));
            break;
            
          case 'INVITATION_EXISTS':
            toast.info(`An invitation has already been sent to ${candidateName}`, {
              description: "Please wait for the candidate to respond or check pending invitations.",
            });
            // Update invitation status
            setCandidates(prev => prev.map(c => 
              c.id === candidate.id ? { ...c, hasPendingInvitation: true } : c
            ));
            break;
            
          case 'JOB_NOT_FOUND':
            toast.error("Job not found", {
              description: "The job may have been deleted. Please refresh the page.",
            });
            break;
            
          case 'CANDIDATE_NOT_FOUND':
            toast.error("Candidate not found", {
              description: "This candidate may have been removed from the talent pool. Refreshing list...",
            });
            // Refresh the list
          handleSearch();
            break;
            
          case 'JOB_NOT_ACCEPTING':
            toast.error("Job is not accepting applications", {
              description: "This job may be closed, filled, or on hold. Please check the job status.",
            });
            break;
            
          case 'UNAUTHORIZED':
            toast.error("Unauthorized", {
              description: "You don't have permission to add candidates to this job. Please contact your administrator.",
            });
            break;
            
          case 'RATE_LIMITED':
            toast.error("Too many requests", {
              description: "Please wait a moment before adding more candidates.",
            });
            break;
            
          default:
            toast.error(response.error || "Failed to add candidate", {
              description: errorCode 
                ? `Error code: ${errorCode}. Please try again or contact support if the issue persists.`
                : "Please try again or contact support if the issue persists.",
            });
        }
      }
    } catch (error) {
      console.error("Failed to add candidate:", error);
      
      // Check if it's a network error
      const isNetworkError = error instanceof TypeError && error.message.includes('fetch');
      
      if (isNetworkError) {
        toast.error("Network error", {
          description: "Unable to connect to the server. Please check your internet connection and try again.",
          action: {
            label: "Retry",
            onClick: () => handleAddCandidate(candidate),
          },
        });
      } else {
        toast.error("Failed to add candidate to job", {
          description: error instanceof Error ? error.message : "An unexpected error occurred. Please try again.",
        });
      }
    } finally {
      setAddingCandidateId(null);
    }
  };

  const handleSendInvite = async () => {
    if (!inviteEmail.trim()) {
      toast.error("Please enter an email address");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inviteEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setSendingInvite(true);
    try {
      const response = await talentPoolService.sendJobInvitation({
        email: inviteEmail,
        jobId,
      });
      if (response.success) {
        toast.success(`Invitation email sent to ${inviteEmail}`);
        setInviteEmail("");
        setShowInviteForm(false);
      } else {
        if (response.code === 'CANDIDATE_EXISTS') {
          toast.info("This candidate already exists in the talent pool. Search for them to add directly.");
        } else {
          toast.error(response.error || "Failed to send invitation");
        }
      }
    } catch (error) {
      console.error("Failed to send invitation:", error);
      toast.error("Failed to send invitation email");
    } finally {
      setSendingInvite(false);
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl lg:max-w-3xl flex flex-col p-0">
        <div className="sticky top-0 z-10 bg-background border-b px-6 py-4">
          <SheetHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <SheetTitle>Search Talent Pool</SheetTitle>
                <SheetDescription className="mt-1">
            Search and add candidates from the HRM8 Talent Pool to {jobTitle}
                </SheetDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 -mr-2"
                onClick={() => onOpenChange(false)}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </Button>
            </div>
          </SheetHeader>
        </div>

        {/* Search Bar */}
        <div className="flex gap-2 px-6 pb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch(searchQuery);
                }
              }}
              className="pl-10"
            />
          </div>
          <Button onClick={() => handleSearch(searchQuery)} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setShowInviteForm(!showInviteForm)}
          >
            <Mail className="h-4 w-4 mr-2" />
            Invite by Email
          </Button>
        </div>

        {/* Invite by Email Form */}
        {showInviteForm && (
          <div className="px-6">
          <div className="p-4 border rounded-lg bg-muted/50 mt-2">
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="Enter email address..."
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSendInvite();
                  }
                }}
                className="flex-1"
              />
              <Button 
                onClick={handleSendInvite} 
                disabled={sendingInvite || !inviteEmail.trim()}
              >
                {sendingInvite ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Mail className="h-4 w-4 mr-2" />
                    Send Invite
                  </>
                )}
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => {
                  setShowInviteForm(false);
                  setInviteEmail("");
                }}
              >
                Cancel
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Send a job invitation email to candidates not yet in the talent pool
            </p>
          </div>
          </div>
        )}

        {/* Results */}
        <ScrollArea className="flex-1">
          <div className="px-6 pb-6">
          {loading && candidates.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : candidates.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No candidates found. Try a different search term.
            </div>
          ) : (
            <div className="space-y-2">
              {candidates.map((candidate) => (
                <div
                  key={candidate.id}
                  className="flex items-center gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors overflow-hidden"
                >
                  <Avatar className="h-12 w-12 flex-shrink-0">
                    <AvatarImage src={candidate.photo} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {getInitials(candidate.firstName, candidate.lastName)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0 overflow-hidden">
                    <div className="flex items-center gap-2 min-w-0">
                      <h4 className="font-semibold truncate" title={`${candidate.firstName} ${candidate.lastName}`}>
                        {candidate.firstName} {candidate.lastName}
                      </h4>
                      {candidate.emailVerified && (
                        <Badge variant="outline" className="text-xs flex-shrink-0">
                          Verified
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground flex-wrap">
                      {candidate.email && (
                        <div className="flex items-center gap-1 min-w-0">
                          <Mail className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate max-w-[200px]" title={candidate.email}>{candidate.email}</span>
                        </div>
                      )}
                      {candidate.phone && (
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <Phone className="h-3 w-3" />
                          <span className="truncate">{candidate.phone}</span>
                        </div>
                      )}
                      {(candidate.city || candidate.state) && (
                        <div className="flex items-center gap-1 min-w-0">
                          <MapPin className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate max-w-[150px]" title={[candidate.city, candidate.state].filter(Boolean).join(", ")}>
                            {[candidate.city, candidate.state].filter(Boolean).join(", ")}
                          </span>
                        </div>
                      )}
                      {candidate.linkedInUrl && (
                        <a
                          href={candidate.linkedInUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 hover:text-primary flex-shrink-0"
                        >
                          <Linkedin className="h-3 w-3" />
                          <span>LinkedIn</span>
                        </a>
                      )}
                    </div>
                    {candidate.jobTypePreference.length > 0 && (
                      <div className="flex gap-1 mt-2 flex-wrap">
                        {candidate.jobTypePreference.slice(0, 3).map((pref, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {pref}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <Button
                    size="sm"
                    onClick={() => handleAddCandidate(candidate)}
                    disabled={addingCandidateId === candidate.id || candidate.hasApplied || candidate.hasPendingInvitation}
                    variant={candidate.hasApplied ? "outline" : candidate.hasPendingInvitation ? "secondary" : "default"}
                    className="flex-shrink-0"
                  >
                    {addingCandidateId === candidate.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : candidate.hasApplied ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        <span className="hidden sm:inline">Already Applied</span>
                        <span className="sm:hidden">Applied</span>
                      </>
                    ) : candidate.hasPendingInvitation ? (
                      <>
                        <Mail className="h-4 w-4 mr-2" />
                        <span className="hidden sm:inline">Invited</span>
                        <span className="sm:hidden">Sent</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add
                      </>
                    )}
                  </Button>
                </div>
              ))}

              {candidates.length < total && (
                <div className="flex justify-center pt-4">
                  <Button variant="outline" onClick={handleLoadMore} disabled={loading}>
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    Load More ({total - candidates.length} remaining)
                  </Button>
                </div>
              )}
            </div>
          )}
          </div>
        </ScrollArea>
        <div className="sticky bottom-0 bg-background border-t px-6 py-3">
          <div className="text-sm text-muted-foreground">
          Showing {candidates.length} of {total} candidates
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

