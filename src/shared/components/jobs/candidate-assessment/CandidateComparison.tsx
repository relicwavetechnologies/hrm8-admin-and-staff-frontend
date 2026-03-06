import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { Separator } from '@/shared/components/ui/separator';
import { Progress } from '@/shared/components/ui/progress';
import { Users, X, Star, Mail, Calendar, GraduationCap, Briefcase } from 'lucide-react';
import { useCandidateComparison } from '@/shared/hooks/useCandidateComparison';
import { formatDistanceToNow } from 'date-fns';

interface CandidateComparisonProps {
  candidateIds?: string[];
}

export const CandidateComparison: React.FC<CandidateComparisonProps> = ({
  candidateIds = ['cand-1', 'cand-2', 'cand-3'],
}) => {
  const { selectedCandidates, removeCandidate } = useCandidateComparison({
    candidateIds,
  });

  const [highlightedMetric, setHighlightedMetric] = useState<string | null>(null);

  const comparisonMetrics = [
    { key: 'overallScore', label: 'Overall Score', icon: Star },
    { key: 'technicalScore', label: 'Technical Skills', icon: Star },
    { key: 'culturalFitScore', label: 'Cultural Fit', icon: Star },
    { key: 'communicationScore', label: 'Communication', icon: Star },
  ];

  const getBestInMetric = (metricKey: string) => {
    return selectedCandidates.reduce((best, candidate) => {
      const candidateValue = candidate[metricKey as keyof typeof candidate] as number;
      const bestValue = best[metricKey as keyof typeof best] as number;
      return candidateValue > bestValue ? candidate : best;
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Candidate Comparison
            <Badge variant="secondary">{selectedCandidates.length} candidates</Badge>
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent>
        <ScrollArea className="h-[600px]">
          {/* Candidate Headers */}
          <div className="grid gap-4 mb-6" style={{ gridTemplateColumns: `repeat(${selectedCandidates.length}, minmax(250px, 1fr))` }}>
            {selectedCandidates.map((candidate) => (
              <Card key={candidate.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-3">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={candidate.photo} />
                      <AvatarFallback>
                        {candidate.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeCandidate(candidate.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <h3 className="font-semibold mb-1">{candidate.name}</h3>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                    <Mail className="h-3 w-3" />
                    {candidate.email}
                  </div>

                  <Badge variant="outline" className="mb-3">
                    {candidate.status}
                  </Badge>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                      <span className="text-xs">{candidate.experience}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-muted-foreground" />
                      <span className="text-xs">{candidate.education}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-xs">
                        Applied {formatDistanceToNow(candidate.appliedDate, { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Separator className="my-6" />

          {/* Skills Comparison */}
          <div className="mb-6">
            <h4 className="font-semibold mb-4">Skills</h4>
            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${selectedCandidates.length}, minmax(250px, 1fr))` }}>
              {selectedCandidates.map((candidate) => (
                <Card key={candidate.id}>
                  <CardContent className="pt-4">
                    <div className="flex flex-wrap gap-2">
                      {candidate.skills.map((skill) => (
                        <Badge key={skill} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <Separator className="my-6" />

          {/* Scores Comparison */}
          <div className="space-y-6">
            <h4 className="font-semibold">Performance Metrics</h4>
            
            {comparisonMetrics.map((metric) => {
              const bestCandidate = getBestInMetric(metric.key);
              
              return (
                <div
                  key={metric.key}
                  className={`p-4 rounded-lg border transition-colors ${
                    highlightedMetric === metric.key ? 'border-primary bg-primary/5' : ''
                  }`}
                  onMouseEnter={() => setHighlightedMetric(metric.key)}
                  onMouseLeave={() => setHighlightedMetric(null)}
                >
                  <h5 className="font-medium mb-4">{metric.label}</h5>
                  <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${selectedCandidates.length}, minmax(250px, 1fr))` }}>
                    {selectedCandidates.map((candidate) => {
                      const score = candidate[metric.key as keyof typeof candidate] as number;
                      const isBest = candidate.id === bestCandidate.id;
                      
                      return (
                        <div key={candidate.id} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-2xl font-bold">{score.toFixed(1)}</span>
                            {isBest && (
                              <Badge variant="default" className="bg-yellow-500">
                                Best
                              </Badge>
                            )}
                          </div>
                          <Progress value={score * 20} className="h-2" />
                          <span className="text-xs text-muted-foreground">out of 5.0</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <Separator className="my-6" />

          {/* Notes */}
          <div>
            <h4 className="font-semibold mb-4">Assessment Notes</h4>
            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${selectedCandidates.length}, minmax(250px, 1fr))` }}>
              {selectedCandidates.map((candidate) => (
                <Card key={candidate.id}>
                  <CardContent className="pt-4">
                    <p className="text-sm text-muted-foreground">{candidate.notes}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
