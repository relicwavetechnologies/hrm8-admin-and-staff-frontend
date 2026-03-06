import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/shared/components/ui/select";
import { X, Mail, Calendar, XCircle, Tag, Star, BookmarkCheck } from "lucide-react";
import { useToast } from "@/shared/hooks/use-toast";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/shared/components/ui/dialog";
import { BulkTaggingDialog } from "./BulkTaggingDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog";
import { useState } from "react";
import { ApplicationStage, ApplicationStatus } from "@/shared/types/application";
import { BulkEmailComposerDialog } from "./BulkEmailComposerDialog";

interface ApplicationBulkActionsToolbarProps {
  selectedCount: number;
  selectedApplicationIds: string[];
  onClearSelection: () => void;
  onBulkStatusUpdate: (status: ApplicationStatus, stage: ApplicationStage) => void;
  onBulkAssignRecruiter: (recruiterId: string) => void;
  onBulkEmail: () => void;
  onBulkScheduleInterview: () => void;
  onBulkReject: () => void;
  onBulkTagsUpdate?: (applicationIds: string[], tags: string[]) => void;
  onBulkScoreUpdate?: (applicationIds: string[], score: number) => void;
  onBulkRankUpdate?: (applicationIds: string[], ranks: Record<string, number>) => void;
  onBulkShortlist?: (applicationIds: string[], shortlisted: boolean) => void;
}

export function ApplicationBulkActionsToolbar({
  selectedCount,
  selectedApplicationIds,
  onClearSelection,
  onBulkStatusUpdate,
  onBulkAssignRecruiter,
  onBulkEmail,
  onBulkScheduleInterview,
  onBulkReject,
  onBulkTagsUpdate,
  onBulkScoreUpdate,
  onBulkRankUpdate: _onBulkRankUpdate,
  onBulkShortlist,
}: ApplicationBulkActionsToolbarProps) {
  const { toast } = useToast();
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [showTagsDialog, setShowTagsDialog] = useState(false);
  const [showScoreDialog, setShowScoreDialog] = useState(false);
  const [showShortlistDialog, setShowShortlistDialog] = useState(false);

  if (selectedCount === 0) return null;

  const handleStageUpdate = (stage: string) => {
    const stageMapping: Record<string, { status: ApplicationStatus; stage: ApplicationStage }> = {
      'new': { status: 'applied', stage: 'New Application' },
      'screening': { status: 'screening', stage: 'Resume Review' },
      'phone-screen': { status: 'screening', stage: 'Phone Screen' },
      'technical': { status: 'interview', stage: 'Technical Interview' },
      'manager': { status: 'interview', stage: 'Manager Interview' },
      'final': { status: 'interview', stage: 'Final Round' },
      'offer': { status: 'offer', stage: 'Offer Extended' },
      'hired': { status: 'hired', stage: 'Offer Accepted' },
    };

    const mapping = stageMapping[stage];
    if (mapping) {
      onBulkStatusUpdate(mapping.status, mapping.stage);
      toast({
        title: "Status updated",
        description: `${selectedCount} application(s) moved to ${mapping.stage}.`,
      });
    }
  };

  const handleAssignRecruiter = (recruiterId: string) => {
    onBulkAssignRecruiter(recruiterId);
    toast({
      title: "Recruiter assigned",
      description: `${selectedCount} application(s) assigned successfully.`,
    });
  };

  const handleReject = () => {
    onBulkReject();
    setShowRejectDialog(false);
    toast({
      title: "Applications rejected",
      description: `${selectedCount} application(s) rejected.`,
      variant: "destructive",
    });
  };

  return (
    <>
      <div className="sticky top-0 z-10 bg-primary/10 border-b border-primary/20 p-4 mb-4 rounded-lg">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Badge variant="default" className="font-semibold">
              {selectedCount} selected
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearSelection}
            >
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Select onValueChange={handleStageUpdate}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Move to Stage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">New Application</SelectItem>
                <SelectItem value="screening">Resume Review</SelectItem>
                <SelectItem value="phone-screen">Phone Screen</SelectItem>
                <SelectItem value="technical">Technical Interview</SelectItem>
                <SelectItem value="manager">Manager Interview</SelectItem>
                <SelectItem value="final">Final Round</SelectItem>
                <SelectItem value="offer">Offer Extended</SelectItem>
                <SelectItem value="hired">Hired</SelectItem>
              </SelectContent>
            </Select>

            <Select onValueChange={handleAssignRecruiter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Assign Recruiter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recruiter-1">Sarah Johnson</SelectItem>
                <SelectItem value="recruiter-2">Michael Chen</SelectItem>
                <SelectItem value="recruiter-3">Emily Rodriguez</SelectItem>
                <SelectItem value="recruiter-4">David Kim</SelectItem>
                <SelectItem value="recruiter-5">Jessica Brown</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowEmailDialog(true)}
            >
              <Mail className="h-4 w-4 mr-2" />
              Send Email
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={onBulkScheduleInterview}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Interview
            </Button>

            {onBulkTagsUpdate && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowTagsDialog(true)}
              >
                <Tag className="h-4 w-4 mr-2" />
                Tag
              </Button>
            )}

            {onBulkScoreUpdate && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowScoreDialog(true)}
              >
                <Star className="h-4 w-4 mr-2" />
                Set Score
              </Button>
            )}

            {onBulkShortlist && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowShortlistDialog(true)}
              >
                <BookmarkCheck className="h-4 w-4 mr-2" />
                Shortlist
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowRejectDialog(true)}
              className="text-destructive hover:text-destructive"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject
            </Button>
          </div>
        </div>
      </div>

      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject {selectedCount} application(s)?</AlertDialogTitle>
            <AlertDialogDescription>
              This will move the selected applications to the rejected stage.
              You can optionally send rejection emails to the candidates.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReject}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Reject Applications
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <BulkEmailComposerDialog
        open={showEmailDialog}
        onOpenChange={setShowEmailDialog}
        selectedCount={selectedCount}
        onSend={(subject, body) => {
          onBulkEmail();
          // In the future, this will pass subject and body to the backend
          console.log('Email to send:', { subject, body });
        }}
      />

      {/* Bulk Tags Dialog */}
      {onBulkTagsUpdate && (
        <BulkTaggingDialog
          open={showTagsDialog}
          onOpenChange={setShowTagsDialog}
          selectedApplicationIds={selectedApplicationIds}
          onComplete={() => {
            setShowTagsDialog(false);
          }}
        />
      )}

      {/* Bulk Score Dialog */}
      {onBulkScoreUpdate && (
        <Dialog open={showScoreDialog} onOpenChange={setShowScoreDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Set Score for {selectedCount} Application(s)</DialogTitle>
            </DialogHeader>
            <BulkScoreDialogContent
              selectedCount={selectedCount}
              onScore={(score) => {
                onBulkScoreUpdate(selectedApplicationIds, score);
                setShowScoreDialog(false);
                toast({
                  title: "Score updated",
                  description: `${selectedCount} application(s) scored successfully.`,
                });
              }}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Bulk Shortlist Dialog */}
      {onBulkShortlist && (
        <AlertDialog open={showShortlistDialog} onOpenChange={setShowShortlistDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Shortlist {selectedCount} application(s)?</AlertDialogTitle>
              <AlertDialogDescription>
                This will mark all selected applications as shortlisted.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  onBulkShortlist(selectedApplicationIds, true);
                  setShowShortlistDialog(false);
                  toast({
                    title: "Applications shortlisted",
                    description: `${selectedCount} application(s) shortlisted successfully.`,
                  });
                }}
              >
                Shortlist
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}

// Bulk Score Dialog Content Component
function BulkScoreDialogContent({
  selectedCount,
  onScore,
}: {
  selectedCount: number;
  onScore: (score: number) => void;
}) {
  const [score, setScore] = useState<string>("");

  const handleSubmit = () => {
    const numScore = parseFloat(score);
    if (isNaN(numScore) || numScore < 0 || numScore > 100) {
      return;
    }
    onScore(numScore);
  };

  return (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="bulk-score">Fit Score (0-100)</Label>
        <Input
          id="bulk-score"
          type="number"
          min="0"
          max="100"
          value={score}
          onChange={(e) => setScore(e.target.value)}
          placeholder="Enter score"
        />
      </div>
      <DialogFooter>
        <Button
          onClick={handleSubmit}
          disabled={!score || parseFloat(score) < 0 || parseFloat(score) > 100}
        >
          Apply to {selectedCount} Application(s)
        </Button>
      </DialogFooter>
    </div>
  );
}
