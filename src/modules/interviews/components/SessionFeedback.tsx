// @ts-nocheck
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Textarea } from '@/shared/components/ui/textarea';
import { Label } from '@/shared/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/shared/components/ui/radio-group';
import { MessageSquare, Star } from 'lucide-react';
import { useToast } from '@/shared/hooks/use-toast';

interface SessionFeedbackProps {
  sessionId: string;
  onSubmit: (feedback: SessionFeedbackData) => void;
}

interface SessionFeedbackData {
  rating: string;
  effectiveness: string;
  comments: string;
  improvements: string;
}

const SessionFeedback: React.FC<SessionFeedbackProps> = ({ sessionId, onSubmit }) => {
  const { toast } = useToast();
  const [feedback, setFeedback] = useState<SessionFeedbackData>({
    rating: '',
    effectiveness: '',
    comments: '',
    improvements: '',
  });

  const handleSubmit = () => {
    if (!feedback.rating || !feedback.effectiveness) {
      toast({
        title: "Missing Information",
        description: "Please provide a rating and effectiveness score.",
        variant: "destructive",
      });
      return;
    }

    onSubmit(feedback);
    toast({
      title: "Feedback Submitted",
      description: "Thank you for your feedback!",
    });

    // Reset form
    setFeedback({
      rating: '',
      effectiveness: '',
      comments: '',
      improvements: '',
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Session Feedback
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <Label>Overall Session Rating</Label>
          <RadioGroup
            value={feedback.rating}
            onValueChange={(value) => setFeedback({ ...feedback, rating: value })}
          >
            <div className="flex gap-4">
              {[1, 2, 3, 4, 5].map((rating) => (
                <div key={rating} className="flex items-center space-x-2">
                  <RadioGroupItem value={rating.toString()} id={`rating-${rating}`} />
                  <Label htmlFor={`rating-${rating}`} className="flex items-center cursor-pointer">
                    {rating} <Star className="h-4 w-4 ml-1 fill-primary text-primary" />
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-3">
          <Label>Session Effectiveness</Label>
          <RadioGroup
            value={feedback.effectiveness}
            onValueChange={(value) => setFeedback({ ...feedback, effectiveness: value })}
          >
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="very-effective" id="very-effective" />
                <Label htmlFor="very-effective" className="cursor-pointer">Very Effective</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="effective" id="effective" />
                <Label htmlFor="effective" className="cursor-pointer">Effective</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="neutral" id="neutral" />
                <Label htmlFor="neutral" className="cursor-pointer">Neutral</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="not-effective" id="not-effective" />
                <Label htmlFor="not-effective" className="cursor-pointer">Not Effective</Label>
              </div>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-3">
          <Label htmlFor="comments">What worked well?</Label>
          <Textarea
            id="comments"
            value={feedback.comments}
            onChange={(e) => setFeedback({ ...feedback, comments: e.target.value })}
            placeholder="Share what you found valuable about this calibration session..."
            rows={3}
          />
        </div>

        <div className="space-y-3">
          <Label htmlFor="improvements">Suggestions for improvement</Label>
          <Textarea
            id="improvements"
            value={feedback.improvements}
            onChange={(e) => setFeedback({ ...feedback, improvements: e.target.value })}
            placeholder="How could future sessions be improved?"
            rows={3}
          />
        </div>

        <Button onClick={handleSubmit} className="w-full">
          Submit Feedback
        </Button>
      </CardContent>
    </Card>
  );
};

export default SessionFeedback;
