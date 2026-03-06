import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Sparkles, TrendingUp, CheckCircle2, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import type { Application } from "@/shared/types/application";
import { AIMatchBadge } from "./AIMatchBadge";

interface RecommendationReason {
  icon: React.ReactNode;
  text: string;
  type: "strength" | "match" | "experience";
}

interface CandidateRecommendation {
  application: Application;
  reasons: RecommendationReason[];
  priority: "high" | "medium";
}

interface CandidateRecommendationsProps {
  applications: Application[];
  jobId?: string;
  maxRecommendations?: number;
}

function generateRecommendationReasons(app: Application): RecommendationReason[] {
  const reasons: RecommendationReason[] = [];
  
  // AI Match score reasoning
  if (app.aiMatchScore && app.aiMatchScore >= 90) {
    reasons.push({
      icon: <Sparkles className="h-3 w-3" />,
      text: "Exceptional AI match score",
      type: "match"
    });
  } else if (app.aiMatchScore && app.aiMatchScore >= 75) {
    reasons.push({
      icon: <CheckCircle2 className="h-3 w-3" />,
      text: "Strong profile alignment",
      type: "match"
    });
  }
  
  // Rating-based reasoning
  if (app.rating && app.rating >= 4) {
    reasons.push({
      icon: <TrendingUp className="h-3 w-3" />,
      text: "High recruiter rating",
      type: "strength"
    });
  }
  
  // Stage-based reasoning
  if (app.stage === "Final Round" || app.stage === "Manager Interview") {
    reasons.push({
      icon: <CheckCircle2 className="h-3 w-3" />,
      text: "Advanced interview stage",
      type: "experience"
    });
  }
  
  // Recent activity
  const daysSinceApplied = Math.floor(
    (new Date().getTime() - new Date(app.appliedDate).getTime()) / (1000 * 60 * 60 * 24)
  );
  if (daysSinceApplied <= 3) {
    reasons.push({
      icon: <Sparkles className="h-3 w-3" />,
      text: "Recently applied",
      type: "match"
    });
  }
  
  return reasons.slice(0, 3); // Max 3 reasons
}

function rankCandidates(applications: Application[]): CandidateRecommendation[] {
  // Filter to only show candidates with good AI match scores
  const qualified = applications.filter(app => 
    app.aiMatchScore && app.aiMatchScore >= 70 && 
    app.status !== 'rejected' && 
    app.status !== 'withdrawn'
  );
  
  // Sort by AI match score and rating
  const sorted = qualified.sort((a, b) => {
    const scoreA = (a.aiMatchScore || 0) + (a.rating || 0) * 5;
    const scoreB = (b.aiMatchScore || 0) + (b.rating || 0) * 5;
    return scoreB - scoreA;
  });
  
  return sorted.map(app => ({
    application: app,
    reasons: generateRecommendationReasons(app),
    priority: (app.aiMatchScore || 0) >= 90 ? "high" : "medium"
  }));
}

export function CandidateRecommendations({ 
  applications, 
  jobId,
  maxRecommendations = 5 
}: CandidateRecommendationsProps) {
  const filteredApps = jobId 
    ? applications.filter(app => app.jobId === jobId)
    : applications;
  
  const recommendations = rankCandidates(filteredApps).slice(0, maxRecommendations);
  
  if (recommendations.length === 0) {
    return (
      <Card>
      <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <CardTitle className="text-base font-semibold">AI Recommendations</CardTitle>
          </div>
        <CardDescription className="text-sm">Top candidate matches based on AI analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-6">
            No recommendations available for the current selection
          </p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <CardTitle className="text-base font-semibold">AI Recommendations</CardTitle>
        </div>
        <CardDescription className="text-sm">
          Top {recommendations.length} candidate{recommendations.length !== 1 ? 's' : ''} based on AI analysis
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-2 px-4 pb-4 max-h-[calc(100vh-500px)] overflow-y-auto">
            {recommendations.map((rec, index) => {
              const { application: app, reasons, priority } = rec;
              const initials = app.candidateName
                .split(' ')
                .map(n => n[0])
                .join('')
                .toUpperCase();
              
              return (
                <Card 
                  key={app.id} 
                  className="relative overflow-hidden transition-all hover:shadow-md"
                >
                  {priority === "high" && (
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-indigo-600" />
                  )}
                  <CardContent className="p-2.5">
                    <div className="flex items-start gap-2.5">
                      <div className="relative flex-shrink-0">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={app.candidatePhoto} />
                          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                        </Avatar>
                        {index === 0 && (
                          <div className="absolute -top-1 -right-1 h-4 w-4 bg-primary rounded-full flex items-center justify-center">
                            <span className="text-[9px] font-bold text-primary-foreground">1</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <Link 
                              to={`/candidates/${app.candidateId}`}
                              className="font-semibold text-sm hover:underline block truncate"
                            >
                              {app.candidateName}
                            </Link>
                            <p className="text-xs text-muted-foreground truncate">
                              {app.jobTitle}
                            </p>
                          </div>
                          {app.aiMatchScore && (
                            <AIMatchBadge score={app.aiMatchScore} size="sm" />
                          )}
                        </div>
                        
                        <div className="space-y-0.5">
                          {reasons.slice(0, 2).map((reason, idx) => (
                            <div 
                              key={idx} 
                              className="flex items-center gap-1 text-xs text-muted-foreground"
                            >
                              {reason.icon}
                              <span className="truncate">{reason.text}</span>
                            </div>
                          ))}
                        </div>
                        
                        <div className="flex items-center justify-between pt-0.5">
                          <Badge variant="outline" className="text-xs h-5 px-1.5">
                            {app.stage}
                          </Badge>
                          <Button 
                            asChild 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 text-xs px-2"
                          >
                            <Link to={`/applications/${app.id}`}>
                              View
                              <ArrowRight className="ml-1 h-3 w-3" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
      </CardContent>
    </Card>
  );
}
