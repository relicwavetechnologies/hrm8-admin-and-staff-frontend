import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { Switch } from "@/shared/components/ui/switch";
import { Label } from "@/shared/components/ui/label";
import { Slider } from "@/shared/components/ui/slider";
import {
  Target,
  MapPin,
  Briefcase,
  Mail,
  CheckCircle,
  Clock,
  Settings,
  Sparkles
} from "lucide-react";
import { Job } from "@/shared/types/job";
import {
  getCandidateMatches,
  getMatchingInsights,
  CandidateMatch,
  MatchingCriteria,
} from "@/shared/lib/candidateMatchingService";

interface CandidateMatchingPanelProps {
  job: Job;
}

export function CandidateMatchingPanel({ job }: CandidateMatchingPanelProps) {
  const [criteria, setCriteria] = useState<MatchingCriteria>({
    includePassiveCandidates: true,
    minimumMatchScore: 60,
    maxResults: 10,
    prioritizeLocation: false,
    prioritizeAvailability: true,
  });

  const [showSettings, setShowSettings] = useState(false);

  const matches = useMemo(() => getCandidateMatches(job, criteria), [job, criteria]);
  const insights = useMemo(() => getMatchingInsights(matches), [matches]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Smart Candidate Matching
            </CardTitle>
            <CardDescription>
              AI-powered candidate recommendations based on job requirements
            </CardDescription>
          </div>
          <Button
            variant={showSettings ? "default" : "outline"}
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Insights */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 border rounded-lg">
            <p className="text-sm text-muted-foreground">Matches Found</p>
            <p className="text-2xl font-bold">{insights.totalMatches}</p>
          </div>
          <div className="p-3 border rounded-lg">
            <p className="text-sm text-muted-foreground">Avg Score</p>
            <p className="text-2xl font-bold">{insights.averageScore.toFixed(0)}%</p>
          </div>
          <div className="p-3 border rounded-lg">
            <p className="text-sm text-muted-foreground">Top Match</p>
            <p className="text-2xl font-bold">{insights.topScore}%</p>
          </div>
          <div className="p-3 border rounded-lg">
            <p className="text-sm text-muted-foreground">Available</p>
            <p className="text-2xl font-bold">{insights.availableCandidates}</p>
          </div>
        </div>

        {showSettings && (
          <div className="p-4 border rounded-lg space-y-4 bg-muted/30">
            <h4 className="font-semibold">Matching Criteria</h4>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="passive">Include passive candidates</Label>
                <Switch
                  id="passive"
                  checked={criteria.includePassiveCandidates}
                  onCheckedChange={(checked) =>
                    setCriteria({ ...criteria, includePassiveCandidates: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="location">Prioritize location match</Label>
                <Switch
                  id="location"
                  checked={criteria.prioritizeLocation}
                  onCheckedChange={(checked) =>
                    setCriteria({ ...criteria, prioritizeLocation: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="availability">Prioritize availability</Label>
                <Switch
                  id="availability"
                  checked={criteria.prioritizeAvailability}
                  onCheckedChange={(checked) =>
                    setCriteria({ ...criteria, prioritizeAvailability: checked })
                  }
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Minimum match score: {criteria.minimumMatchScore}%</Label>
                </div>
                <Slider
                  value={[criteria.minimumMatchScore]}
                  onValueChange={([value]) =>
                    setCriteria({ ...criteria, minimumMatchScore: value })
                  }
                  min={0}
                  max={100}
                  step={5}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Max results: {criteria.maxResults}</Label>
                </div>
                <Slider
                  value={[criteria.maxResults]}
                  onValueChange={([value]) =>
                    setCriteria({ ...criteria, maxResults: value })
                  }
                  min={5}
                  max={50}
                  step={5}
                />
              </div>
            </div>
          </div>
        )}

        <Tabs defaultValue="all">
          <TabsList className="w-full">
            <TabsTrigger value="all" className="flex-1">
              All Matches ({matches.length})
            </TabsTrigger>
            <TabsTrigger value="available" className="flex-1">
              Available ({insights.availableCandidates})
            </TabsTrigger>
            <TabsTrigger value="top" className="flex-1">
              Top 5
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-3 mt-4">
            {matches.map((match) => (
              <CandidateMatchCard key={match.candidateId} match={match} />
            ))}
          </TabsContent>

          <TabsContent value="available" className="space-y-3 mt-4">
            {matches
              .filter((m) => m.status === "available")
              .map((match) => (
                <CandidateMatchCard key={match.candidateId} match={match} />
              ))}
          </TabsContent>

          <TabsContent value="top" className="space-y-3 mt-4">
            {matches.slice(0, 5).map((match) => (
              <CandidateMatchCard key={match.candidateId} match={match} />
            ))}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function CandidateMatchCard({ match }: { match: CandidateMatch }) {
  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-teal";
    if (score >= 75) return "text-primary";
    if (score >= 60) return "text-orange";
    return "text-muted-foreground";
  };

  return (
    <div className="p-4 border rounded-lg hover:border-primary/50 transition-all">
      <div className="flex items-start gap-4">
        <Avatar className="h-12 w-12">
          <AvatarFallback>
            {match.candidateName
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h4 className="font-semibold">{match.candidateName}</h4>
              <p className="text-sm text-muted-foreground">{match.candidateEmail}</p>
            </div>
            <div className="text-right">
              <div className={`text-2xl font-bold ${getScoreColor(match.matchScore)}`}>
                {match.matchScore}%
              </div>
              <p className="text-xs text-muted-foreground">Match Score</p>
            </div>
          </div>

          {/* Match breakdown */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="flex items-center gap-2 text-sm">
              <Target className="h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground">Skills:</span>
              <span className="font-medium">{match.skillsMatch}%</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Briefcase className="h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground">Experience:</span>
              <span className="font-medium">{match.experienceMatch}%</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground">Location:</span>
              <span className="font-medium">{match.locationMatch}%</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground">Availability:</span>
              <span className="font-medium">{match.availabilityMatch}%</span>
            </div>
          </div>

          {/* Match reasons */}
          {match.matchReasons.length > 0 && (
            <div className="space-y-1 mb-3">
              {match.matchReasons.map((reason, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs">
                  <CheckCircle className="h-3 w-3 text-teal mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">{reason.description}</span>
                </div>
              ))}
            </div>
          )}

          {/* Status badge */}
          <div className="flex items-center gap-2">
            <Badge
              variant={
                match.status === "available"
                  ? "teal"
                  : match.status === "passive"
                    ? "secondary"
                    : "purple"
              }
            >
              {match.status}
            </Badge>
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-3">
            <Button size="sm" variant="default" className="flex-1">
              <Mail className="h-3 w-3 mr-1" />
              Contact
            </Button>
            <Button size="sm" variant="outline" className="flex-1">
              View Profile
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
