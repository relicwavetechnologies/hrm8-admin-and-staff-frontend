import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Progress } from "@/shared/components/ui/progress";
import { Application } from "@/shared/types/application";
import { 
  Clock, 
  TrendingUp, 
  CheckCircle2, 
  DollarSign,
  Briefcase,
  AlertTriangle,
  Zap,
  Brain,
  Target,
  Users,
  FileText,
  ExternalLink
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { differenceInDays } from "date-fns";
import { AIMatchScoreCard } from "../AIMatchScoreCard";

interface OverviewTabProps {
  application: Application;
}

export function OverviewTab({ application }: OverviewTabProps) {
  const daysInCurrentStage = differenceInDays(new Date(), application.appliedDate);
  
  const aiAnalysis = application.aiAnalysis;
  const parsedResume = application.parsedResume;

  // Extract skills from parsed resume
  const keySkills = parsedResume?.skills?.slice(0, 5) || [];
  
  // Extract work experience summary
  const totalExperience = parsedResume?.workHistory?.reduce((acc, job) => {
    const start = new Date(job.startDate);
    const end = job.endDate ? new Date(job.endDate) : new Date();
    return acc + (end.getTime() - start.getTime());
  }, 0) || 0;
  const yearsOfExperience = Math.floor(totalExperience / (1000 * 60 * 60 * 24 * 365));

  const redFlags = aiAnalysis?.concerns || [];
  const strengths = aiAnalysis?.strengths || [];

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        
        {/* AI Executive Summary */}
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 shadow-sm">
            <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">AI Executive Summary</CardTitle>
                </div>
            </CardHeader>
            <CardContent>
                <p className="text-sm leading-relaxed text-foreground/90">
                    {aiAnalysis?.summary || aiAnalysis?.detailedAnalysis?.overallAssessment || "AI analysis is currently processing for this candidate..."}
                </p>
                
                {/* Behavioral Traits Badges */}
                {aiAnalysis?.behavioralTraits && aiAnalysis.behavioralTraits.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-primary/10">
                        {aiAnalysis.behavioralTraits.map((trait, i) => (
                            <Badge key={i} variant="secondary" className="bg-background/60 hover:bg-background/80 transition-colors border-primary/10">
                                {trait}
                            </Badge>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>

        {/* Resume Button */}
        {application.resumeUrl && (
          <Button 
            className="w-full shadow-sm" 
            size="sm" 
            variant="outline"
            onClick={() => window.open(application.resumeUrl, '_blank')}
          >
            <FileText className="h-4 w-4 mr-2" />
            View Original Resume
            <ExternalLink className="h-3 w-3 ml-2 opacity-50" />
          </Button>
        )}

        {/* At-a-Glance Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard 
                icon={Clock} 
                label="In Stage" 
                value={`${daysInCurrentStage}d`} 
                subtext="Current Stage"
            />
             <MetricCard 
                icon={Briefcase} 
                label="Experience" 
                value={`${yearsOfExperience}+ Years`} 
                subtext="Total Career"
            />
            <MetricCard 
                icon={TrendingUp} 
                label="Trajectory" 
                value={aiAnalysis?.careerTrajectory || "Stable"} 
                subtext="Career Growth"
            />
            <MetricCard 
                icon={Target} 
                label="Flight Risk" 
                value={aiAnalysis?.flightRisk?.level || "Low"} 
                valueColor={getRiskColor(aiAnalysis?.flightRisk?.level)}
                subtext={aiAnalysis?.flightRisk?.reason ? "View Analysis" : "Based on history"}
            />
        </div>

        {/* Key Qualifications (Real Data) */}
        <Card>
          <CardHeader>
            <CardTitle>Key Qualifications</CardTitle>
            <CardDescription>Core skills and experience extracted from resume</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Skills */}
            <div>
              <h4 className="text-sm font-semibold mb-3">Top Skills</h4>
              <div className="space-y-3">
                {keySkills.length > 0 ? keySkills.map((skill) => (
                  <div key={skill.name} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{skill.name}</span>
                      <span className="text-muted-foreground capitalize">{skill.proficiency}</span>
                    </div>
                    <Progress value={getSkillValue(skill.proficiency)} className="h-2" />
                  </div>
                )) : (
                    <div className="text-center py-4 text-muted-foreground text-sm bg-muted/30 rounded-lg">
                        No skills extracted yet.
                    </div>
                )}
              </div>
            </div>

            {/* AI Insights: Strengths */}
            <div className="pt-4 border-t">
              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-500" />
                Key Strengths
              </h4>
              <ul className="space-y-2">
                {strengths.length > 0 ? strengths.map((strength, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{strength}</span>
                  </li>
                )) : (
                    <li className="text-sm text-muted-foreground italic">Pending strength analysis...</li>
                )}
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Application Highlights & Cultural Fit */}
        <div className="grid gap-6 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Cultural Fit
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-center py-4">
                        <div className="relative flex flex-col items-center justify-center">
                            <span className="text-4xl font-bold text-primary">{aiAnalysis?.culturalFit?.score || 0}%</span>
                            <span className="text-xs text-muted-foreground mt-1">Match Score</span>
                        </div>
                    </div>
                    <p className="text-sm text-muted-foreground text-center line-clamp-3">
                        {aiAnalysis?.culturalFit?.analysis || "Pending cultural fit analysis..."}
                    </p>
                    {aiAnalysis?.culturalFit?.valuesMatched && (
                        <div className="flex flex-wrap gap-2 justify-center pt-2">
                            {aiAnalysis.culturalFit.valuesMatched.map((val, i) => (
                                <Badge key={i} variant="outline" className="text-xs">{val}</Badge>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                 <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Compensation
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm items-center">
                             <span className="text-muted-foreground">Market Benchmark</span>
                             <Badge variant={getBenchmarkVariant(aiAnalysis?.salaryBenchmark?.position)}>
                                {aiAnalysis?.salaryBenchmark?.position || "Unknown"}
                             </Badge>
                        </div>
                        <div className="p-3 bg-muted/30 rounded-lg text-center">
                             <p className="text-sm font-medium">
                                {aiAnalysis?.salaryBenchmark?.marketRange || "Data unavailable"}
                            </p>
                            <p className="text-[10px] text-muted-foreground mt-1">Estimated Market Range</p>
                        </div>
                    </div>
                    
                    {aiAnalysis?.flightRisk && (
                        <div className="pt-4 border-t space-y-2">
                            <div className="flex justify-between text-sm items-center">
                                <span className="text-muted-foreground">Flight Risk</span>
                                <Badge variant="outline" className={getRiskColor(aiAnalysis.flightRisk.level)}>
                                    {aiAnalysis.flightRisk.level}
                                </Badge>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>

        {/* Red Flags */}
        {redFlags.length > 0 && (
          <Card className="border-red-200 bg-red-50/50 dark:bg-red-950/10 dark:border-red-900">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <CardTitle className="text-red-700 dark:text-red-400">Areas of Concern</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {redFlags.map((flag, index) => (
                  <li key={index} className="flex items-start gap-3 text-sm">
                    <span className="text-red-600 mt-0.5">•</span>
                    <span className="text-foreground/80">{flag}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Right Sidebar - AI Match Score */}
      <div>
        <AIMatchScoreCard application={application} />
      </div>
    </div>
  );
}

interface MetricCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  valueColor?: string;
  subtext: string;
}

function MetricCard({ icon: Icon, label, value, valueColor, subtext }: MetricCardProps) {
    return (
        <Card>
            <CardContent className="p-4 flex flex-col items-center text-center space-y-2">
                <div className="p-2 bg-primary/5 rounded-full">
                    <Icon className="h-4 w-4 text-primary" />
                </div>
                <div className="space-y-0.5">
                    <p className={`text-xl font-bold ${valueColor || ''}`}>{value}</p>
                    <p className="text-xs font-medium text-muted-foreground">{label}</p>
                </div>
                <p className="text-[10px] text-muted-foreground/70">{subtext}</p>
            </CardContent>
        </Card>
    )
}

function getRiskColor(level?: string) {
    switch(level) {
        case 'High': return 'text-red-500';
        case 'Medium': return 'text-yellow-500';
        case 'Low': return 'text-green-500';
        default: return '';
    }
}

function getSkillValue(proficiency: string) {
     switch (proficiency.toLowerCase()) {
      case 'expert': return 100;
      case 'advanced': return 75;
      case 'intermediate': return 50;
      case 'beginner': return 25;
      default: return 0;
    }
}

function getBenchmarkVariant(position?: string): "default" | "secondary" | "destructive" | "outline" {
    if (position === 'Within') return 'outline';
    if (position === 'Below') return 'secondary';
    if (position === 'Above') return 'destructive';
    return 'outline';
}
