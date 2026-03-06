import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Slider } from '@/shared/components/ui/slider';
import { Progress } from '@/shared/components/ui/progress';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { Sparkles, TrendingUp, TrendingDown, Minus, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import type { Application } from '@/shared/types/application';
import { bulkScoreCandidates, getScoreChangeLabel, getScoreChangeColor, type ScoringCriteria, type BulkScoringProgress, type BulkScoringResult } from '@/shared/lib/bulkAIScoring';
import { updateApplication } from '@/shared/lib/mockApplicationStorage';

interface BulkAIScoringDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  applications: Application[];
  onComplete?: () => void;
}

export function BulkAIScoringDialog({
  open,
  onOpenChange,
  applications,
  onComplete
}: BulkAIScoringDialogProps) {
  const [jobRequirements, setJobRequirements] = useState('');
  const [weights, setWeights] = useState({
    skills: 40,
    experience: 30,
    education: 20,
    cultural_fit: 10,
  });
  const [isScoring, setIsScoring] = useState(false);
  const [progress, setProgress] = useState<BulkScoringProgress | null>(null);
  const [results, setResults] = useState<BulkScoringResult[] | null>(null);

  const handleStartScoring = async () => {
    if (!jobRequirements.trim()) {
      toast.error('Please enter job requirements');
      return;
    }

    setIsScoring(true);
    setResults(null);

    const criteria: ScoringCriteria = {
      job: { id: applications[0]?.jobId || 'unknown' } as any, // backend only needs jobId from criteria.job.id
    };

    try {
      const scoringResults = await bulkScoreCandidates(
        applications,
        criteria,
        setProgress
      );

      setResults(scoringResults);

      // Update applications with new scores
      scoringResults.forEach(result => {
        if (result.success) {
          updateApplication(result.applicationId, {
            aiMatchScore: result.newScore,
          });
        }
      });

      const successCount = scoringResults.filter(r => r.success).length;
      const failedCount = scoringResults.filter(r => !r.success).length;

      toast.success(
        `Scoring complete! ${successCount} candidate${successCount !== 1 ? 's' : ''} re-scored successfully.` +
        (failedCount > 0 ? ` ${failedCount} failed.` : '')
      );

      onComplete?.();
    } catch (error) {
      toast.error('Failed to score candidates');
      console.error('Bulk scoring error:', error);
    } finally {
      setIsScoring(false);
    }
  };

  const handleClose = () => {
    if (!isScoring) {
      onOpenChange(false);
      // Reset state after dialog closes
      setTimeout(() => {
        setJobRequirements('');
        setProgress(null);
        setResults(null);
      }, 300);
    }
  };

  const progressPercentage = progress ? (progress.completed / progress.total) * 100 : 0;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            Bulk AI Re-scoring
          </DialogTitle>
          <DialogDescription>
            Re-score {applications.length} candidate{applications.length !== 1 ? 's' : ''} based on updated job requirements and criteria
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden space-y-4">
          {!results ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="job-requirements">Job Requirements</Label>
                <Textarea
                  id="job-requirements"
                  placeholder="Enter updated job requirements, key skills, and qualifications..."
                  value={jobRequirements}
                  onChange={(e) => setJobRequirements(e.target.value)}
                  disabled={isScoring}
                  className="min-h-[100px]"
                />
              </div>

              <div className="space-y-4">
                <Label>Scoring Weights</Label>

                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span>Skills Match</span>
                      <span className="font-medium">{weights.skills}%</span>
                    </div>
                    <Slider
                      value={[weights.skills]}
                      onValueChange={([value]) => setWeights(prev => ({ ...prev, skills: value }))}
                      max={100}
                      step={5}
                      disabled={isScoring}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span>Experience</span>
                      <span className="font-medium">{weights.experience}%</span>
                    </div>
                    <Slider
                      value={[weights.experience]}
                      onValueChange={([value]) => setWeights(prev => ({ ...prev, experience: value }))}
                      max={100}
                      step={5}
                      disabled={isScoring}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span>Education</span>
                      <span className="font-medium">{weights.education}%</span>
                    </div>
                    <Slider
                      value={[weights.education]}
                      onValueChange={([value]) => setWeights(prev => ({ ...prev, education: value }))}
                      max={100}
                      step={5}
                      disabled={isScoring}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span>Cultural Fit</span>
                      <span className="font-medium">{weights.cultural_fit}%</span>
                    </div>
                    <Slider
                      value={[weights.cultural_fit]}
                      onValueChange={([value]) => setWeights(prev => ({ ...prev, cultural_fit: value }))}
                      max={100}
                      step={5}
                      disabled={isScoring}
                    />
                  </div>
                </div>
              </div>

              {isScoring && progress && (
                <div className="space-y-2 pt-4 border-t">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {progress.currentCandidate ? `Scoring ${progress.currentCandidate}...` : 'Processing...'}
                    </span>
                    <span className="font-medium">
                      {progress.completed} / {progress.total}
                    </span>
                  </div>
                  <Progress value={progressPercentage} className="h-2" />
                </div>
              )}
            </>
          ) : (
            <ScrollArea className="h-[400px]">
              <div className="space-y-2 pr-4">
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-3 border border-green-200 dark:border-green-800">
                    <div className="text-xs text-green-600 dark:text-green-400 mb-1">Successful</div>
                    <div className="text-lg font-bold text-green-700 dark:text-green-300">
                      {results.filter(r => r.success).length}
                    </div>
                  </div>
                  <div className="bg-red-50 dark:bg-red-950/20 rounded-lg p-3 border border-red-200 dark:border-red-800">
                    <div className="text-xs text-red-600 dark:text-red-400 mb-1">Failed</div>
                    <div className="text-lg font-bold text-red-700 dark:text-red-300">
                      {results.filter(r => !r.success).length}
                    </div>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
                    <div className="text-xs text-blue-600 dark:text-blue-400 mb-1">Improved</div>
                    <div className="text-lg font-bold text-blue-700 dark:text-blue-300">
                      {results.filter(r => r.scoreDelta > 0).length}
                    </div>
                  </div>
                </div>

                {results.map((result) => (
                  <div
                    key={result.applicationId}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      {result.success ? (
                        <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">
                          {result.candidateName}
                        </div>
                        {result.error && (
                          <div className="text-xs text-red-600 dark:text-red-400 truncate">
                            {result.error}
                          </div>
                        )}
                      </div>
                    </div>

                    {result.success && (
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-xs text-muted-foreground">
                            {result.oldScore !== undefined ? `${result.oldScore}% → ` : ''}
                            <span className="font-medium text-foreground">{result.newScore}%</span>
                          </div>
                        </div>

                        <div className={`flex items-center gap-1 text-sm font-medium ${getScoreChangeColor(result.scoreDelta)}`}>
                          {result.scoreDelta > 0 && <TrendingUp className="h-3 w-3" />}
                          {result.scoreDelta < 0 && <TrendingDown className="h-3 w-3" />}
                          {result.scoreDelta === 0 && <Minus className="h-3 w-3" />}
                          {getScoreChangeLabel(result.scoreDelta)}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={handleClose} disabled={isScoring}>
            {results ? 'Close' : 'Cancel'}
          </Button>
          {!results && (
            <Button onClick={handleStartScoring} disabled={isScoring}>
              <Sparkles className="h-4 w-4 mr-2" />
              {isScoring ? 'Scoring...' : 'Start Re-scoring'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
