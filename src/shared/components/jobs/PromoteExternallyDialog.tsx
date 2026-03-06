import { useState } from "react";
import { Job } from "@/shared/types/job";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/components/ui/card";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Label } from "@/shared/components/ui/label";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import {
  Megaphone,
  Info,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useToast } from "@/shared/hooks/use-toast";

interface PromoteExternallyDialogProps {
  job: Job;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPromote?: (channels: string[], budget: number) => void;
}

const AVAILABLE_CHANNELS = [
  { id: 'seek', label: 'SEEK', description: 'Australia & New Zealand' },
  { id: 'linkedin', label: 'LinkedIn', description: 'Global professional network' },
  { id: 'indeed', label: 'Indeed', description: 'Global job search' },
  { id: 'glassdoor', label: 'Glassdoor', description: 'Company reviews & jobs' },
  { id: 'monster', label: 'Monster', description: 'Global job board' },
  { id: 'ziprecruiter', label: 'ZipRecruiter', description: 'US job board' },
];

const NICHE_BOARDS = [
  { id: 'dice', label: 'Dice', description: 'Tech jobs' },
  { id: 'stackoverflow', label: 'Stack Overflow', description: 'Developer jobs' },
  { id: 'angel', label: 'AngelList', description: 'Startup jobs' },
  { id: 'remoteok', label: 'RemoteOK', description: 'Remote jobs' },
];

export function PromoteExternallyDialog({
  job,
  open,
  onOpenChange,
  onPromote,
}: PromoteExternallyDialogProps) {
  const { toast } = useToast();
  const [selectedChannels, setSelectedChannels] = useState<string[]>(
    job.jobTargetChannels || []
  );
  const [selectedNicheBoards, setSelectedNicheBoards] = useState<string[]>([]);
  const [budget, setBudget] = useState<number>(job.jobTargetBudget || 0);
  const [_isHRM8Service, _setIsHRM8Service] = useState(
    job.serviceType !== 'self-managed'
  );
  const [channelsApproved, setChannelsApproved] = useState(false);

  const handleChannelToggle = (channelId: string) => {
    setSelectedChannels((prev) =>
      prev.includes(channelId)
        ? prev.filter((id) => id !== channelId)
        : [...prev, channelId]
    );
  };

  const handleNicheBoardToggle = (boardId: string) => {
    setSelectedNicheBoards((prev) =>
      prev.includes(boardId)
        ? prev.filter((id) => id !== boardId)
        : [...prev, boardId]
    );
  };

  const handlePromote = () => {
    if (selectedChannels.length === 0 && selectedNicheBoards.length === 0) {
      toast({
        title: "No Channels Selected",
        description: "Please select at least one channel to promote",
        variant: "destructive",
      });
      return;
    }

    if (budget <= 0) {
      toast({
        title: "Budget Required",
        description: "Please set a promotion budget",
        variant: "destructive",
      });
      return;
    }

    if (_isHRM8Service && !channelsApproved) {
      toast({
        title: "Approval Required",
        description: "Please approve the recommended channels",
        variant: "destructive",
      });
      return;
    }

    const allChannels = [...selectedChannels, ...selectedNicheBoards];
    if (onPromote) {
      onPromote(allChannels, budget);
    } else {
      // TODO: Call JobTarget API when integration is ready
      toast({
        title: "Promotion Initiated",
        description: "JobTarget integration coming soon. Your promotion will be processed once integration is complete.",
      });
    }
    onOpenChange(false);
  };

  const recommendedChannels = _isHRM8Service
    ? ['seek', 'linkedin', 'indeed']
    : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Megaphone className="h-5 w-5" />
            Promote Externally via JobTarget
          </DialogTitle>
          <DialogDescription>
            Select job boards and set your promotion budget to reach more candidates
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Info Alert */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              This step is post-submission and focuses on external job board distribution via JobTarget.
              You can add or re-post anytime while the role is live in HRM8.
            </AlertDescription>
          </Alert>

          {/* Recommended Channels (for HRM8 services) */}
          {_isHRM8Service && recommendedChannels.length > 0 && (
            <Card className="border-primary/30 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Recommended Channels
                </CardTitle>
                <CardDescription>
                  For HRM8 Recruitment Support roles, these channels are recommended for company approval
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {recommendedChannels.map((channelId) => {
                  const channel = AVAILABLE_CHANNELS.find((c) => c.id === channelId);
                  if (!channel) return null;
                  return (
                    <div key={channelId} className="flex items-center space-x-3 p-3 border rounded-lg bg-background">
                      <Checkbox
                        checked={selectedChannels.includes(channelId)}
                        onCheckedChange={() => handleChannelToggle(channelId)}
                        disabled
                      />
                      <div className="flex-1">
                        <Label className="font-medium">{channel.label}</Label>
                        <p className="text-xs text-muted-foreground">{channel.description}</p>
                      </div>
                      <Badge variant="secondary">Recommended</Badge>
                    </div>
                  );
                })}
                <div className="flex items-center space-x-2 pt-2 border-t">
                  <Checkbox
                    checked={channelsApproved}
                    onCheckedChange={(checked) => setChannelsApproved(!!checked)}
                    id="approve-channels"
                  />
                  <Label htmlFor="approve-channels" className="cursor-pointer">
                    I approve these recommended channels
                  </Label>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Select Channels */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Select Promotion Channels</CardTitle>
              <CardDescription>
                Choose where you want to post this job
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {AVAILABLE_CHANNELS.map((channel) => (
                <div
                  key={channel.id}
                  className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <Checkbox
                    checked={selectedChannels.includes(channel.id)}
                    onCheckedChange={() => handleChannelToggle(channel.id)}
                    id={`channel-${channel.id}`}
                  />
                  <Label
                    htmlFor={`channel-${channel.id}`}
                    className="flex-1 cursor-pointer"
                  >
                    <div className="font-medium">{channel.label}</div>
                    <div className="text-xs text-muted-foreground">
                      {channel.description}
                    </div>
                  </Label>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Niche Boards */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Niche Job Boards</CardTitle>
              <CardDescription>
                Specialized job boards for specific industries or roles
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {NICHE_BOARDS.map((board) => (
                <div
                  key={board.id}
                  className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <Checkbox
                    checked={selectedNicheBoards.includes(board.id)}
                    onCheckedChange={() => handleNicheBoardToggle(board.id)}
                    id={`board-${board.id}`}
                  />
                  <Label
                    htmlFor={`board-${board.id}`}
                    className="flex-1 cursor-pointer"
                  >
                    <div className="font-medium">{board.label}</div>
                    <div className="text-xs text-muted-foreground">
                      {board.description}
                    </div>
                  </Label>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Budget Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Promotion Budget</CardTitle>
              <CardDescription>
                Set your budget for this promotion campaign
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="budget">Total Budget (USD)</Label>
                <Input
                  id="budget"
                  type="number"
                  min="0"
                  step="10"
                  value={budget}
                  onChange={(e) => setBudget(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                />
              </div>
              {budget > 0 && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Estimated reach: {Math.floor(budget * 100)}+ candidates
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Note */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Note:</strong> JobTarget integration is coming soon. Your selections will be saved and processed once the integration is complete.
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handlePromote} disabled={selectedChannels.length === 0 && selectedNicheBoards.length === 0}>
            Promote Now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


