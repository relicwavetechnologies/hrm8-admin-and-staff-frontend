import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Textarea } from '@/shared/components/ui/textarea';
import { Label } from '@/shared/components/ui/label';
import { Slider } from '@/shared/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/shared/components/ui/radio-group';
import { Star, MessageSquare, ThumbsUp, ThumbsDown, Minus } from 'lucide-react';
import { addReview, addVote, type ApplicationReview } from '@/shared/lib/applications/collaborativeReview';
import { useToast } from '@/shared/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { notifyReviewAdded, notifyVoteAdded, followApplication } from '@/shared/lib/applications/notifications';

interface ApplicationReviewDialogProps {
  applicationId: string;
  candidateName: string;
  jobTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReviewAdded?: () => void;
}

export function ApplicationReviewDialog({
  applicationId,
  candidateName,
  jobTitle,
  open,
  onOpenChange,
  onReviewAdded,
}: ApplicationReviewDialogProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'review' | 'vote'>('review');

  // Review state
  const [rating, setRating] = useState(3);
  const [technicalSkills, setTechnicalSkills] = useState(3);
  const [experience, setExperience] = useState(3);
  const [culturalFit, setCulturalFit] = useState(3);
  const [communication, setCommunication] = useState(3);
  const [comment, setComment] = useState('');
  const [recommendation, setRecommendation] = useState<ApplicationReview['recommendation']>('maybe');

  // Vote state
  const [voteDecision, setVoteDecision] = useState<'hire' | 'no-hire' | 'abstain'>('abstain');
  const [voteReasoning, setVoteReasoning] = useState('');

  const handleSubmitReview = () => {
    if (!comment.trim()) {
      toast({
        title: 'Comment required',
        description: 'Please provide a comment with your review',
        variant: 'destructive',
      });
      return;
    }

    addReview({
      applicationId,
      reviewerId: 'current-user-id',
      reviewerName: 'Current User',
      rating,
      categories: {
        technicalSkills,
        experience,
        culturalFit,
        communication,
      },
      comment,
      recommendation,
    });

    // Auto-follow application when reviewing
    followApplication('current-user-id', applicationId);

    // Notify followers
    notifyReviewAdded(
      applicationId,
      candidateName,
      jobTitle,
      'current-user-id',
      'Current User'
    );

    toast({
      title: 'Review submitted',
      description: 'Your review has been added successfully',
    });

    onReviewAdded?.();
    onOpenChange(false);
    resetForm();
  };

  const handleSubmitVote = () => {
    if (!voteReasoning.trim()) {
      toast({
        title: 'Reasoning required',
        description: 'Please provide reasoning for your vote',
        variant: 'destructive',
      });
      return;
    }

    addVote({
      applicationId,
      voterId: 'current-user-id',
      voterName: 'Current User',
      decision: voteDecision,
      reasoning: voteReasoning,
    });

    // Auto-follow application when voting
    followApplication('current-user-id', applicationId);

    // Notify followers
    notifyVoteAdded(
      applicationId,
      candidateName,
      jobTitle,
      'current-user-id',
      'Current User',
      voteDecision
    );

    toast({
      title: 'Vote submitted',
      description: 'Your vote has been recorded',
    });

    onReviewAdded?.();
    onOpenChange(false);
    resetForm();
  };

  const resetForm = () => {
    setRating(3);
    setTechnicalSkills(3);
    setExperience(3);
    setCulturalFit(3);
    setCommunication(3);
    setComment('');
    setRecommendation('maybe');
    setVoteDecision('abstain');
    setVoteReasoning('');
  };

  const renderStars = (value: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= value ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Review Application - {candidateName}</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'review' | 'vote')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="review" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              Review & Rate
            </TabsTrigger>
            <TabsTrigger value="vote" className="gap-2">
              <ThumbsUp className="h-4 w-4" />
              Vote
            </TabsTrigger>
          </TabsList>

          <TabsContent value="review" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Overall Rating</Label>
              <div className="flex items-center gap-4">
                <Slider
                  value={[rating]}
                  onValueChange={(v) => setRating(v[0])}
                  min={1}
                  max={5}
                  step={1}
                  className="flex-1"
                />
                {renderStars(rating)}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Technical Skills</Label>
                <div className="flex items-center gap-2">
                  <Slider
                    value={[technicalSkills]}
                    onValueChange={(v) => setTechnicalSkills(v[0])}
                    min={1}
                    max={5}
                    step={1}
                    className="flex-1"
                  />
                  {renderStars(technicalSkills)}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Experience</Label>
                <div className="flex items-center gap-2">
                  <Slider
                    value={[experience]}
                    onValueChange={(v) => setExperience(v[0])}
                    min={1}
                    max={5}
                    step={1}
                    className="flex-1"
                  />
                  {renderStars(experience)}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Cultural Fit</Label>
                <div className="flex items-center gap-2">
                  <Slider
                    value={[culturalFit]}
                    onValueChange={(v) => setCulturalFit(v[0])}
                    min={1}
                    max={5}
                    step={1}
                    className="flex-1"
                  />
                  {renderStars(culturalFit)}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Communication</Label>
                <div className="flex items-center gap-2">
                  <Slider
                    value={[communication]}
                    onValueChange={(v) => setCommunication(v[0])}
                    min={1}
                    max={5}
                    step={1}
                    className="flex-1"
                  />
                  {renderStars(communication)}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Recommendation</Label>
              <RadioGroup value={recommendation} onValueChange={(v) => setRecommendation(v as any)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="strong-hire" id="strong-hire" />
                  <Label htmlFor="strong-hire" className="font-normal cursor-pointer">
                    Strong Hire
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="hire" id="hire" />
                  <Label htmlFor="hire" className="font-normal cursor-pointer">
                    Hire
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="maybe" id="maybe" />
                  <Label htmlFor="maybe" className="font-normal cursor-pointer">
                    Maybe
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no-hire" id="no-hire" />
                  <Label htmlFor="no-hire" className="font-normal cursor-pointer">
                    No Hire
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="strong-no-hire" id="strong-no-hire" />
                  <Label htmlFor="strong-no-hire" className="font-normal cursor-pointer">
                    Strong No Hire
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label>Comments</Label>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your thoughts about this candidate..."
                rows={6}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmitReview}>Submit Review</Button>
            </div>
          </TabsContent>

          <TabsContent value="vote" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Your Vote</Label>
              <RadioGroup value={voteDecision} onValueChange={(v) => setVoteDecision(v as any)}>
                <div className="flex items-center space-x-2 p-3 border rounded-lg">
                  <RadioGroupItem value="hire" id="vote-hire" />
                  <ThumbsUp className="h-4 w-4 text-green-600" />
                  <Label htmlFor="vote-hire" className="font-normal cursor-pointer flex-1">
                    Hire - Recommend moving forward
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg">
                  <RadioGroupItem value="no-hire" id="vote-no-hire" />
                  <ThumbsDown className="h-4 w-4 text-red-600" />
                  <Label htmlFor="vote-no-hire" className="font-normal cursor-pointer flex-1">
                    No Hire - Do not recommend
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg">
                  <RadioGroupItem value="abstain" id="vote-abstain" />
                  <Minus className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="vote-abstain" className="font-normal cursor-pointer flex-1">
                    Abstain - No strong opinion
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label>Reasoning</Label>
              <Textarea
                value={voteReasoning}
                onChange={(e) => setVoteReasoning(e.target.value)}
                placeholder="Explain your voting decision..."
                rows={6}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmitVote}>Submit Vote</Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
