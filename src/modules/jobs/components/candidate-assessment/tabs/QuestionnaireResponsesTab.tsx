// @ts-nocheck
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Progress } from '@/shared/components/ui/progress';
import { Separator } from '@/shared/components/ui/separator';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { Textarea } from '@/shared/components/ui/textarea';
import { Button } from '@/shared/components/ui/button';
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar';
import { jobService } from '@/modules/jobs/lib/jobService';
import { Loader2 } from 'lucide-react';
import { apiClient } from '@/shared/lib/api';
import { useToast } from '@/shared/hooks/use-toast';
import { getJobTeamEndpoint } from '../teamEndpoint';
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/shared/components/ui/resizable";
import { NotesTab } from './NotesTab';
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  Minus,
  Star,
  FileText,
  Target,
  Lightbulb,
  AlertTriangle,
  Send,
  AtSign,
  X
} from 'lucide-react';
import type { Application } from '@/shared/types/application';
import { cn } from '@/shared/lib/utils';

interface QuestionnaireResponsesTabProps {
  application: Application;
  jobId?: string;
}

export function QuestionnaireResponsesTab({ application, jobId }: QuestionnaireResponsesTabProps) {
  const { questionnaireData, customAnswers } = application;
  const questionnaireResponses = React.useMemo(
    () => (Array.isArray(questionnaireData?.responses) ? questionnaireData.responses : []),
    [questionnaireData?.responses]
  );
  const [questions, setQuestions] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [noteText, setNoteText] = React.useState('');
  const [isSubmittingNote, setIsSubmittingNote] = React.useState(false);
  const [referenceContext, setReferenceContext] = React.useState<{ questionLabel: string; questionIndex: number; answerSnippet: string } | null>(null);
  const [hiringTeam, setHiringTeam] = React.useState<Array<{ userId?: string; name: string }>>([]);
  const [showMentions, setShowMentions] = React.useState(false);
  const [mentionSearch, setMentionSearch] = React.useState('');
  const [notesRefreshKey, setNotesRefreshKey] = React.useState(0);
  const noteInputRef = React.useRef<HTMLTextAreaElement | null>(null);
  const noteComposerRef = React.useRef<HTMLDivElement | null>(null);
  const { toast } = useToast();

  React.useEffect(() => {
    const fetchQuestions = async () => {
      if (!jobId) return;
      setLoading(true);
      try {
        const response = await jobService.getApplicationForm(jobId);
        if (response.success && response.data?.form?.questions) {
          setQuestions(response.data.form.questions);
        }
      } catch (error) {
        console.error('Failed to fetch application form questions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [jobId]);

  React.useEffect(() => {
    const fetchHiringTeam = async () => {
      if (!jobId) return;
      try {
        const response = await apiClient.get<any>(getJobTeamEndpoint(jobId));
        const team = Array.isArray(response.data) ? response.data : response.data?.team;
        if (response.success && Array.isArray(team)) {
          setHiringTeam(team.map((member: any) => ({ userId: member.userId || member.user_id, name: member.name })));
        }
      } catch (error) {
        console.error('Failed to fetch hiring team', error);
      }
    };
    fetchHiringTeam();
  }, [jobId]);

  const handleNoteInputChange = (value: string) => {
    setNoteText(value);
    const cursorPosition = noteInputRef.current?.selectionStart ?? value.length;
    const textBeforeCursor = value.substring(0, cursorPosition);
    const mentionMatch = textBeforeCursor.match(/@([a-zA-Z0-9\s]*)$/);
    if (mentionMatch) {
      setShowMentions(true);
      setMentionSearch(mentionMatch[1].toLowerCase().trim());
    } else {
      setShowMentions(false);
      setMentionSearch('');
    }
  };

  const filteredTeam = React.useMemo(
    () => hiringTeam.filter((member) => member.name.toLowerCase().includes(mentionSearch)),
    [hiringTeam, mentionSearch]
  );

  const insertMention = (memberName: string) => {
    const textarea = noteInputRef.current;
    if (!textarea) return;
    const cursorPosition = textarea.selectionStart || 0;
    const textBeforeCursor = noteText.substring(0, cursorPosition);
    const textAfterCursor = noteText.substring(cursorPosition);
    const lastAt = textBeforeCursor.lastIndexOf('@');
    const newContent = `${noteText.substring(0, lastAt)}@${memberName} ${textAfterCursor}`;
    setNoteText(newContent);
    setShowMentions(false);
    setMentionSearch('');
    setTimeout(() => {
      textarea.focus();
      const nextPos = lastAt + memberName.length + 2;
      textarea.setSelectionRange(nextPos, nextPos);
    }, 0);
  };

  const handleAddReferenceNote = (questionLabel: string, questionIndex: number, answerValue: unknown) => {
    const answerText =
      typeof answerValue === 'string'
        ? answerValue
        : answerValue == null
          ? 'No response provided'
          : JSON.stringify(answerValue);
    setReferenceContext({
      questionLabel,
      questionIndex,
      answerSnippet: answerText.length > 180 ? `${answerText.slice(0, 180)}...` : answerText,
    });
    setNoteText((prev) => (prev.trim() ? prev : `Observation for Q${questionIndex}: `));
    setTimeout(() => {
      noteComposerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      noteInputRef.current?.focus();
    }, 50);
  };

  const handleSubmitNote = async () => {
    if (!noteText.trim() || isSubmittingNote) return;
    const mentionRegex = /@(\w+\s?\w*)/g;
    const mentions: string[] = [];
    let match;
    while ((match = mentionRegex.exec(noteText)) !== null) {
      mentions.push(match[1]);
    }

    const content = referenceContext
      ? `[Questionnaire Ref Q${referenceContext.questionIndex}: ${referenceContext.questionLabel}]\n${referenceContext.answerSnippet}\n\n${noteText.trim()}`
      : noteText.trim();

    setIsSubmittingNote(true);
    try {
      const response = await apiClient.post<{ note: any }>(`/api/applications/${application.id}/notes`, {
        content,
        mentions,
      });
      if (response.success) {
        toast({ title: 'Note added' });
        setNoteText('');
        setReferenceContext(null);
        setShowMentions(false);
        setNotesRefreshKey((k) => k + 1);
      } else {
        toast({ title: response.error || 'Failed to add note', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Failed to add note', variant: 'destructive' });
    } finally {
      setIsSubmittingNote(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Helper to find answer for a question
  const getAnswerForQuestion = (questionId: string) => {
    // Check in questionnaireData first (if populated)
    if (questionnaireResponses.length > 0) {
      const response = questionnaireResponses.find((r: any) => r.questionId === questionId);
      if (response) return response;
    }

    // Fallback to customAnswers
    if (customAnswers && Array.isArray(customAnswers)) {
      const answer = customAnswers.find((a: any) => a.questionId === questionId);
      if (answer) return { answer: answer.answer };
    }

    // Check if customAnswers is an object (legacy format maybe?)
    if (customAnswers && typeof customAnswers === 'object' && !Array.isArray(customAnswers)) {
      return { answer: customAnswers[questionId] };
    }

    return null;
  };

  if (questionnaireResponses.length === 0 && (!questions || questions.length === 0)) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center h-full">
        <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Questionnaire Data</h3>
        <p className="text-sm text-muted-foreground max-w-md">
          This application does not include questionnaire responses.
        </p>
      </div>
    );
  }

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'negative':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'negative':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Very Good';
    if (score >= 70) return 'Good';
    if (score >= 60) return 'Fair';
    return 'Needs Improvement';
  };

  return (
    <div className="h-[calc(100vh-15.5rem)]">
      <ResizablePanelGroup direction="horizontal" className="h-full rounded-md border border-border/80 bg-background">
        {/* Questionnaire Panel (60%) */}
        <ResizablePanel defaultSize={65} minSize={35}>
          <div className="h-full overflow-hidden">
            <div className="sticky top-0 z-10 border-b bg-background px-4 py-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Questionnaire Responses</h3>
                <Badge variant="outline" className="text-[11px] font-medium">{questions.length || questionnaireResponses.length || 0} items</Badge>
              </div>
            </div>
            <ScrollArea className="h-[calc(100%-41px)] scroll-smooth">
            <div className="p-4 space-y-3">
              {/* Summary Section (Only show if we have scored data) */}
              {questionnaireData?.overallScore !== undefined && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 mb-2">
                  <Card className="border-border/70 shadow-none">
                    <CardHeader className="pb-1 pt-3 px-3">
                      <CardTitle className="text-xs font-medium flex items-center gap-1.5">
                        <Target className="h-4 w-4 text-primary" />
                        Overall Score
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-3 pb-3 pt-0">
                      <div className="flex items-end gap-1.5">
                        <span className={cn("text-xl font-semibold", getScoreColor(questionnaireData.overallScore || 0))}>
                          {questionnaireData.overallScore || 0}
                        </span>
                        <span className="text-[11px] text-muted-foreground mb-0.5">/100</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {getScoreLabel(questionnaireData.overallScore || 0)}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-border/70 shadow-none">
                    <CardHeader className="pb-1 pt-3 px-3">
                      <CardTitle className="text-xs font-medium flex items-center gap-1.5">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                        Completion Rate
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-3 pb-3 pt-0">
                      <div className="flex items-end gap-1.5">
                        <span className="text-xl font-semibold">
                          {questionnaireData.completionRate}%
                        </span>
                      </div>
                      <Progress value={questionnaireData.completionRate} className="mt-1.5 h-1.5" />
                    </CardContent>
                  </Card>

                  <Card className="border-border/70 shadow-none">
                    <CardHeader className="pb-1 pt-3 px-3">
                      <CardTitle className="text-xs font-medium flex items-center gap-1.5">
                        <Clock className="h-4 w-4 text-primary" />
                        Time Spent
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-3 pb-3 pt-0">
                      <div className="flex items-end gap-1.5">
                        <span className="text-xl font-semibold">
                          {questionnaireData.timeSpent || 0}
                        </span>
                        <span className="text-[11px] text-muted-foreground mb-0.5">min</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Average: {Math.round((questionnaireData.timeSpent || 0) / (questions.length || 1))} min/question
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Responses Section */}
              <div className="space-y-3">
                {questions.length > 0 ? (
                  questions.map((question, index) => {
                    const response = getAnswerForQuestion(question.id);
                    // Use response data if available, otherwise fallback to basic question info
                    const hasAnalysis = response && response.aiAnalysis;

                    return (
                      <Card key={question.id} className="overflow-hidden border-border/70 shadow-none">
                        <CardHeader className="bg-muted/20 py-3 px-3.5">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-1.5 mb-1.5">
                                <Badge variant="outline" className="text-[10px] h-5 px-1.5">
                                  Q{index + 1}
                                </Badge>
                                <Badge variant="secondary" className="text-[10px] h-5 px-1.5 capitalize">
                                  {question.type.replace('_', ' ')}
                                </Badge>
                              </div>
                              <CardTitle className="text-sm font-semibold leading-snug">
                                {question.label}
                              </CardTitle>
                            </div>
                            {hasAnalysis && (
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1">
                                  <Star className={cn("h-4 w-4", getScoreColor(response.aiAnalysis.qualityScore))} />
                                  <span className={cn("text-xs font-semibold", getScoreColor(response.aiAnalysis.qualityScore))}>
                                    {response.aiAnalysis.qualityScore}
                                  </span>
                                </div>
                                <Badge variant="outline" className={cn("border h-5 px-1.5", getSentimentColor(response.aiAnalysis.sentiment))}>
                                  <span className="flex items-center gap-1">
                                    {getSentimentIcon(response.aiAnalysis.sentiment)}
                                    <span className="capitalize text-[10px]">{response.aiAnalysis.sentiment}</span>
                                  </span>
                                </Badge>
                              </div>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent className="pt-3 px-3.5 pb-3">
                          {/* Candidate's Answer */}
                          <div className="mb-2.5">
                            <h4 className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5">
                              <FileText className="h-3.5 w-3.5" />
                              Candidate's Response
                            </h4>
                            <div className="bg-muted/40 rounded-md p-3">
                              <p className="text-xs leading-relaxed whitespace-pre-wrap">
                                {response ? (typeof response.answer === 'string' ? response.answer : JSON.stringify(response.answer)) : <span className="text-muted-foreground italic">No response provided</span>}
                              </p>
                            </div>
                          </div>
                          <div className="mb-1 flex items-center justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-[11px] px-2.5"
                              onClick={() => handleAddReferenceNote(question.label, index + 1, response?.answer)}
                            >
                              <MessageSquare className="mr-1.5 h-3.5 w-3.5" />
                              Add Note for Q{index + 1}
                            </Button>
                          </div>

                          {/* AI Analysis (Existing Logic) */}
                          {hasAnalysis && (
                            <div className="space-y-3">
                              <Separator />

                              {/* Key Insights */}
                              {response.aiAnalysis.keyInsights && response.aiAnalysis.keyInsights.length > 0 && (
                                <div>
                                  <h4 className="text-xs font-medium mb-1.5 flex items-center gap-1.5">
                                    <Lightbulb className="h-3.5 w-3.5 text-primary" />
                                    Key Insights
                                  </h4>
                                  <ul className="space-y-1">
                                    {response.aiAnalysis.keyInsights.map((insight: string, idx: number) => (
                                      <li key={idx} className="text-xs text-muted-foreground flex items-start gap-1.5 leading-relaxed">
                                        <span className="text-primary mt-0.5">•</span>
                                        <span>{insight}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {/* Strengths */}
                              {response.aiAnalysis.strengths && response.aiAnalysis.strengths.length > 0 && (
                                <div>
                                  <h4 className="text-xs font-medium mb-1.5 flex items-center gap-1.5 text-green-600">
                                    <TrendingUp className="h-3.5 w-3.5" />
                                    Strengths
                                  </h4>
                                  <ul className="space-y-1">
                                    {response.aiAnalysis.strengths.map((strength: string, idx: number) => (
                                      <li key={idx} className="text-xs flex items-start gap-1.5 leading-relaxed">
                                        <span className="text-green-600 mt-0.5">✓</span>
                                        <span>{strength}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {/* Concerns */}
                              {response.aiAnalysis.concerns && response.aiAnalysis.concerns.length > 0 && (
                                <div>
                                  <h4 className="text-xs font-medium mb-1.5 flex items-center gap-1.5 text-amber-600">
                                    <AlertTriangle className="h-3.5 w-3.5" />
                                    Areas of Concern
                                  </h4>
                                  <ul className="space-y-1">
                                    {response.aiAnalysis.concerns.map((concern: string, idx: number) => (
                                      <li key={idx} className="text-xs flex items-start gap-1.5 leading-relaxed">
                                        <span className="text-amber-600 mt-0.5">!</span>
                                        <span>{concern}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })
                ) : (
                  // Fallback to existing display if no questions fetched but we have questionnaireData
                  questionnaireResponses.map((response: any, index: number) => (
                    <Card key={response.questionId} className="overflow-hidden border-border/70 shadow-none">
                      <CardHeader className="bg-muted/20 py-3 px-3.5">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-1.5 mb-1.5">
                              <Badge variant="outline" className="text-[10px] h-5 px-1.5">
                                Q{index + 1}
                              </Badge>
                              <Badge variant="secondary" className="text-[10px] h-5 px-1.5 capitalize">
                                {response.type.replace('-', ' ')}
                              </Badge>
                            </div>
                            <CardTitle className="text-sm font-semibold leading-snug">
                              {response.question}
                            </CardTitle>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-3 px-3.5 pb-3">
                        <div className="mb-2.5">
                          <h4 className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5">
                            <FileText className="h-3.5 w-3.5" />
                            Candidate's Response
                          </h4>
                          <div className="bg-muted/40 rounded-md p-3">
                            <p className="text-xs leading-relaxed whitespace-pre-wrap">{response.answer}</p>
                          </div>
                        </div>
                        <div className="mb-1 flex items-center justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-[11px] px-2.5"
                            onClick={() => handleAddReferenceNote(response.question || `Question ${index + 1}`, index + 1, response.answer)}
                          >
                            <MessageSquare className="mr-1.5 h-3.5 w-3.5" />
                            Add Note for Q{index + 1}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </ScrollArea>
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Notes Panel (40%) */}
        <ResizablePanel defaultSize={35} minSize={22}>
          <div className="h-full flex flex-col p-2.5">
            <div className="mb-1.5">
              <h3 className="text-sm font-semibold flex items-center gap-1.5">
                <MessageSquare className="h-4 w-4" />
                Notes
              </h3>
              <p className="text-[11px] text-muted-foreground">Capture feedback and mention teammates.</p>
            </div>
            <div ref={noteComposerRef} className="mb-2.5 rounded-md border bg-muted/10 p-2.5">
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mb-1.5">
                <AtSign className="h-3.5 w-3.5" />
                Use @ to mention hiring team members
              </div>
              {referenceContext && (
                <div className="mb-1.5 rounded-md border bg-background p-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Reference</p>
                      <p className="text-[11px] font-medium truncate">Q{referenceContext.questionIndex}: {referenceContext.questionLabel}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{referenceContext.answerSnippet}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 p-0 flex-shrink-0 text-muted-foreground hover:text-foreground"
                      onClick={() => setReferenceContext(null)}
                      aria-label="Remove reference"
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              )}
              <div className="relative">
                <Textarea
                  ref={noteInputRef}
                  value={noteText}
                  onChange={(e) => handleNoteInputChange(e.target.value)}
                  placeholder="Add a note... (@name to mention)"
                  className="min-h-[78px] resize-none bg-background text-xs leading-relaxed"
                />
                {showMentions && filteredTeam.length > 0 && (
                  <div className="absolute left-0 right-0 top-full z-20 mt-1 rounded-md border bg-popover shadow-md max-h-40 overflow-y-auto">
                    {filteredTeam.map((member) => (
                      <Button
                        key={member.userId || member.name}
                        type="button"
                        variant="ghost"
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm h-auto justify-start rounded-none"
                        onClick={() => insertMention(member.name)}
                      >
                        <Avatar className="h-5 w-5">
                          <AvatarFallback className="text-[10px]">
                            {member.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <span>{member.name}</span>
                      </Button>
                    ))}
                  </div>
                )}
              </div>
              <div className="mt-1.5 flex justify-end">
                <Button size="sm" className="h-7 text-[11px]" onClick={handleSubmitNote} disabled={!noteText.trim() || isSubmittingNote}>
                  {isSubmittingNote ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Send className="mr-1.5 h-3.5 w-3.5" />}
                  Add Note
                </Button>
              </div>
            </div>
            <div className="flex-1 overflow-hidden rounded-md border">
              <ScrollArea className="h-full">
                <div className="p-2.5">
                  <NotesTab key={`q-notes-${notesRefreshKey}`} application={application} scope="questionnaire" />
                </div>
              </ScrollArea>
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
