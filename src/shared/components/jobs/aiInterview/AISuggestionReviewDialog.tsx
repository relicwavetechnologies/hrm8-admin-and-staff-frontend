import { useState, useEffect } from 'react';
import { FormDrawer } from '@/shared/components/ui/form-drawer';
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import { Input } from '@/shared/components/ui/input';

import { Badge } from '@/shared/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Calendar, Clock, Sparkles, CheckCircle2, Edit2, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from '@/shared/hooks/use-toast';
import { videoInterviewService } from '@/shared/lib/videoInterviewService';

export interface AISuggestion {
  candidateId: string;
  applicationId: string;
  suggestedDate: string;
  alternativeDates: string[];
  reasoning?: string;
  confidence?: number;
  candidateName?: string;
  candidateEmail?: string;
}

interface AISuggestionReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  suggestions: AISuggestion[];
  jobId: string;
  jobTitle: string;
  onFinalized?: () => void;
}

export function AISuggestionReviewDialog({
  open,
  onOpenChange,
  suggestions,
  jobId,
  jobTitle,
  onFinalized,
}: AISuggestionReviewDialogProps) {
  const [editedSuggestions, setEditedSuggestions] = useState<Map<string, string>>(new Map());
  const [isFinalizing, setIsFinalizing] = useState(false);

  // Initialize edited suggestions with AI suggestions
  useEffect(() => {
    if (suggestions.length > 0) {
      const initial = new Map<string, string>();
      suggestions.forEach(s => {
        initial.set(s.candidateId, s.suggestedDate);
      });
      setEditedSuggestions(initial);
    }
  }, [suggestions]);

  const handleDateChange = (candidateId: string, newDate: string) => {
    setEditedSuggestions(prev => {
      const updated = new Map(prev);
      updated.set(candidateId, newDate);
      return updated;
    });
  };

  const handleUseSuggestion = (candidateId: string, date: string) => {
    handleDateChange(candidateId, date);
  };

  const handleFinalize = async () => {
    if (editedSuggestions.size === 0) {
      toast({
        title: 'No interviews to schedule',
        description: 'Please review and confirm at least one interview time',
        variant: 'destructive',
      });
      return;
    }

    setIsFinalizing(true);

    try {
      // Convert edited suggestions to finalize format
      const finalSuggestions = suggestions
        .filter(s => editedSuggestions.has(s.candidateId))
        .map(s => ({
          applicationId: s.applicationId,
          candidateId: s.candidateId,
          jobId,
          scheduledDate: editedSuggestions.get(s.candidateId) || s.suggestedDate,
          duration: 60, // Default duration
          type: 'VIDEO' as const,
          interviewerIds: [],
        }));

      const response = await videoInterviewService.finalizeInterviews(finalSuggestions);

      if (response.success && response.data) {
        toast({
          title: 'Interviews scheduled successfully',
          description: `Successfully scheduled ${response.data.count} interview(s)`,
        });
        onFinalized?.();
        onOpenChange(false);
      } else {
        throw new Error(response.error || 'Failed to finalize interviews');
      }
    } catch (error) {
      console.error('Failed to finalize interviews:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to finalize interviews',
        variant: 'destructive',
      });
    } finally {
      setIsFinalizing(false);
    }
  };

  const getCurrentDate = (candidateId: string): string => {
    return editedSuggestions.get(candidateId) || suggestions.find(s => s.candidateId === candidateId)?.suggestedDate || '';
  };

  return (
    <FormDrawer
      open={open}
      onOpenChange={onOpenChange}
      title="Review AI-Suggested Interview Times"
      description={`Review and adjust the AI-suggested interview times for ${jobTitle}. You can change any time before finalizing.`}
      width="xl"
    >
      <div className="space-y-4">
        {/* Summary */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Total Candidates:</span>
                <span className="ml-2 font-medium">{suggestions.length}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Ready to Schedule:</span>
                <span className="ml-2 font-medium">{editedSuggestions.size}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Suggestions List */}
        <div className="border rounded-lg p-4">
          <div className="space-y-4">
            {suggestions.map((suggestion, index) => {
              const currentDate = getCurrentDate(suggestion.candidateId);
              const currentDateObj = currentDate ? new Date(currentDate) : null;

              return (
                <Card key={suggestion.candidateId} className="p-4">
                  <div className="space-y-4">
                    {/* Candidate Info */}
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-semibold">
                          {suggestion.candidateName || `Candidate ${index + 1}`}
                        </div>
                        {suggestion.candidateEmail && (
                          <div className="text-sm text-muted-foreground">{suggestion.candidateEmail}</div>
                        )}
                      </div>
                      {suggestion.confidence && (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Sparkles className="h-3 w-3" />
                          {Math.round(suggestion.confidence * 100)}% confidence
                        </Badge>
                      )}
                    </div>

                    {/* Current Selected Time */}
                    <div className="space-y-2">
                      <Label>Selected Interview Time</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="datetime-local"
                          value={currentDateObj ? format(currentDateObj, "yyyy-MM-dd'T'HH:mm") : ''}
                          onChange={(e) => {
                            if (e.target.value) {
                              handleDateChange(suggestion.candidateId, new Date(e.target.value).toISOString());
                            }
                          }}
                          className="flex-1"
                        />
                        {currentDateObj && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>{format(currentDateObj, 'PPp')}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* AI Suggestion */}
                    <div className="bg-muted/50 p-3 rounded-lg space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Sparkles className="h-4 w-4 text-primary" />
                        AI Suggested Time
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{format(new Date(suggestion.suggestedDate), 'PPp')}</span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUseSuggestion(suggestion.candidateId, suggestion.suggestedDate)}
                          disabled={currentDate === suggestion.suggestedDate}
                        >
                          <Edit2 className="h-3 w-3 mr-1" />
                          Use This
                        </Button>
                      </div>
                      {suggestion.reasoning && (
                        <p className="text-xs text-muted-foreground mt-2">{suggestion.reasoning}</p>
                      )}
                    </div>

                    {/* Alternative Times */}
                    {suggestion.alternativeDates && suggestion.alternativeDates.length > 0 && (
                      <div className="space-y-2">
                        <Label className="text-sm">Alternative Times</Label>
                        <div className="grid grid-cols-1 gap-2">
                          {suggestion.alternativeDates.map((altDate, altIndex) => (
                            <div
                              key={altIndex}
                              className="flex items-center justify-between p-2 border rounded-lg hover:bg-accent transition-colors"
                            >
                              <div className="flex items-center gap-2 text-sm">
                                <Clock className="h-3 w-3 text-muted-foreground" />
                                <span>{format(new Date(altDate), 'PPp')}</span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleUseSuggestion(suggestion.candidateId, altDate)}
                                disabled={currentDate === altDate}
                              >
                                Select
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isFinalizing}>
            Cancel
          </Button>
          <Button onClick={handleFinalize} disabled={isFinalizing || editedSuggestions.size === 0}>
            {isFinalizing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Finalizing...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Finalize Schedule ({editedSuggestions.size} interview{editedSuggestions.size !== 1 ? 's' : ''})
              </>
            )}
          </Button>
        </div>
      </div>
    </FormDrawer>
  );
}

