import { useState } from 'react';
import { Application } from '@/shared/types/application';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Card } from '@/shared/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { AIMatchBadge } from './AIMatchBadge';
import {
  X,
  Briefcase,
  GraduationCap,
  Award,
  MapPin,
  Calendar,
  Star,
  TrendingUp,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface CandidateComparisonProps {
  applications: Application[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRemoveCandidate: (applicationId: string) => void;
}

export function CandidateComparison({
  applications,
  open,
  onOpenChange,
  onRemoveCandidate
}: CandidateComparisonProps) {
  const [activeTab, setActiveTab] = useState('overview');

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const getSkillsFromAnswers = (_application: Application) => {
    // Mock skills extraction from custom answers
    const skills = ['JavaScript', 'React', 'TypeScript', 'Node.js', 'Python'];
    return skills.slice(0, Math.floor(Math.random() * 3) + 3);
  };

  const getExperienceYears = (_application: Application) => {
    return Math.floor(Math.random() * 10) + 2;
  };

  const getEducation = (_application: Application) => {
    const degrees = ['Bachelor\'s', 'Master\'s', 'PhD'];
    const fields = ['Computer Science', 'Software Engineering', 'Information Technology'];
    return `${degrees[Math.floor(Math.random() * degrees.length)]} in ${fields[Math.floor(Math.random() * fields.length)]}`;
  };

  const getStrengths = (_application: Application) => {
    const allStrengths = [
      'Strong technical background',
      'Excellent communication skills',
      'Leadership experience',
      'Quick learner',
      'Team player',
      'Problem-solving ability'
    ];
    return allStrengths.slice(0, 3);
  };

  const getConcerns = (application: Application) => {
    const allConcerns = [
      'Limited experience in required tech',
      'Salary expectations high',
      'Notice period is long',
      'Gaps in employment history'
    ];
    if (application.aiMatchScore && application.aiMatchScore < 70) {
      return allConcerns.slice(0, 2);
    }
    return application.aiMatchScore && application.aiMatchScore > 85 ? [] : allConcerns.slice(0, 1);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] h-[90vh] p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="text-2xl">Compare Candidates</DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Side-by-side comparison of {applications.length} candidates
          </p>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="mx-6 mt-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="skills">Skills & Experience</TabsTrigger>
            <TabsTrigger value="assessment">Assessment & Scoring</TabsTrigger>
            <TabsTrigger value="strengths">Strengths & Concerns</TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 px-6 pb-6">
            <TabsContent value="overview" className="mt-4 space-y-0">
              <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${applications.length}, minmax(0, 1fr))` }}>
                {applications.map((app) => (
                  <Card key={app.id} className="p-4 relative">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 h-6 w-6"
                      onClick={() => onRemoveCandidate(app.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>

                    <div className="flex flex-col items-center text-center space-y-3">
                      <Avatar className="h-20 w-20">
                        <AvatarImage src={app.candidatePhoto} />
                        <AvatarFallback>{getInitials(app.candidateName)}</AvatarFallback>
                      </Avatar>

                      <div>
                        <h3 className="font-semibold text-lg">{app.candidateName}</h3>
                        <p className="text-sm text-muted-foreground">{app.candidateEmail}</p>
                      </div>

                      <AIMatchBadge score={app.aiMatchScore || 0} size="md" />

                      <div className="w-full pt-3 border-t space-y-2 text-left">
                        <div className="flex items-center gap-2 text-sm">
                          <Briefcase className="h-4 w-4 text-muted-foreground" />
                          <span>{getExperienceYears(app)} years experience</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <GraduationCap className="h-4 w-4 text-muted-foreground" />
                          <span>{getEducation(app)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>Applied {new Date(app.appliedDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{app.employerName}</span>
                        </div>
                      </div>

                      <div className="w-full pt-3 border-t">
                        <Badge variant={
                          app.stage === 'Offer Extended' ? 'default' :
                            app.stage === 'Final Round' ? 'secondary' : 'outline'
                        } className="w-full justify-center">
                          {app.stage}
                        </Badge>
                      </div>

                      {app.rating && (
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${i < app.rating! ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                                }`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="skills" className="mt-4 space-y-0">
              <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${applications.length}, minmax(0, 1fr))` }}>
                {applications.map((app) => (
                  <Card key={app.id} className="p-4">
                    <h3 className="font-semibold mb-3 text-center">{app.candidateName}</h3>

                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Award className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Technical Skills</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {getSkillsFromAnswers(app).map((skill, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Briefcase className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Experience</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {getExperienceYears(app)} years in relevant roles
                        </p>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <GraduationCap className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Education</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {getEducation(app)}
                        </p>
                      </div>

                      {app.customAnswers.length > 0 && (
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Key Qualifications</span>
                          </div>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            {app.customAnswers.slice(0, 2).map((answer, idx) => (
                              <li key={idx} className="flex items-start gap-1.5">
                                <span className="text-primary mt-0.5">•</span>
                                <span className="line-clamp-2">{answer.question}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="assessment" className="mt-4 space-y-0">
              <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${applications.length}, minmax(0, 1fr))` }}>
                {applications.map((app) => (
                  <Card key={app.id} className="p-4">
                    <h3 className="font-semibold mb-3 text-center">{app.candidateName}</h3>

                    <div className="space-y-4">
                      <div className="flex justify-center">
                        <AIMatchBadge score={app.aiMatchScore || 0} size="lg" />
                      </div>

                      {app.score && (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Fit Score</span>
                            <span className="text-sm font-semibold">{app.score}%</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full transition-all"
                              style={{ width: `${app.score}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {app.rating && (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Rating</span>
                            <div className="flex items-center gap-1">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-3.5 w-3.5 ${i < app.rating! ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                                    }`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      <div>
                        <span className="text-sm font-medium block mb-2">Pipeline Stage</span>
                        <Badge variant="outline" className="w-full justify-center">
                          {app.stage}
                        </Badge>
                      </div>

                      <div>
                        <span className="text-sm font-medium block mb-2">Status</span>
                        <Badge
                          variant={
                            app.status === 'hired' ? 'default' :
                              app.status === 'rejected' ? 'destructive' :
                                'secondary'
                          }
                          className="w-full justify-center"
                        >
                          {app.status}
                        </Badge>
                      </div>

                      {app.interviews.length > 0 && (
                        <div>
                          <span className="text-sm font-medium block mb-2">Interviews</span>
                          <p className="text-sm text-muted-foreground">
                            {app.interviews.filter(i => i.status === 'completed').length} completed,{' '}
                            {app.interviews.filter(i => i.status === 'scheduled').length} scheduled
                          </p>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="strengths" className="mt-4 space-y-0">
              <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${applications.length}, minmax(0, 1fr))` }}>
                {applications.map((app) => {
                  const strengths = getStrengths(app);
                  const concerns = getConcerns(app);

                  return (
                    <Card key={app.id} className="p-4">
                      <h3 className="font-semibold mb-3 text-center">{app.candidateName}</h3>

                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-medium">Strengths</span>
                          </div>
                          <ul className="space-y-1.5">
                            {strengths.map((strength, idx) => (
                              <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                                <span className="text-green-600 mt-0.5">✓</span>
                                <span>{strength}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {concerns.length > 0 ? (
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <AlertCircle className="h-4 w-4 text-orange-600" />
                              <span className="text-sm font-medium">Potential Concerns</span>
                            </div>
                            <ul className="space-y-1.5">
                              {concerns.map((concern, idx) => (
                                <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                                  <span className="text-orange-600 mt-0.5">!</span>
                                  <span>{concern}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ) : (
                          <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-md">
                            <p className="text-sm text-green-700 dark:text-green-400">
                              No major concerns identified
                            </p>
                          </div>
                        )}

                        <div className="pt-3 border-t">
                          <span className="text-sm font-medium block mb-2">Recommendation</span>
                          <Badge
                            variant={
                              (app.aiMatchScore || 0) >= 85 ? 'default' :
                                (app.aiMatchScore || 0) >= 70 ? 'secondary' : 'outline'
                            }
                            className="w-full justify-center"
                          >
                            {(app.aiMatchScore || 0) >= 85 ? 'Highly Recommended' :
                              (app.aiMatchScore || 0) >= 70 ? 'Recommended' : 'Consider'}
                          </Badge>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <div className="px-6 py-4 border-t flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            Comparing {applications.length} candidate{applications.length !== 1 ? 's' : ''}
          </p>
          <Button onClick={() => onOpenChange(false)}>Close Comparison</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
