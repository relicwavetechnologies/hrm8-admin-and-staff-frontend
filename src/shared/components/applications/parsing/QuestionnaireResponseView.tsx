import { QuestionnaireData, QuestionnaireResponse } from "@/shared/types/application";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Separator } from "@/shared/components/ui/separator";
import { Progress } from "@/shared/components/ui/progress";
import { 
  FileText, CheckCircle, Clock, AlertCircle,
  TrendingUp, MessageSquare, CheckCircle2, XCircle
} from "lucide-react";
import { ScrollArea } from "@/shared/components/ui/scroll-area";

interface QuestionnaireResponseViewProps {
  questionnaireData: QuestionnaireData;
}

export function QuestionnaireResponseView({ questionnaireData }: QuestionnaireResponseViewProps) {
  const { responses, overallScore, completionRate, timeSpent } = questionnaireData;

  if (!responses || responses.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-sm">No questionnaire responses available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Completion Rate */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Completion Rate</span>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">{Math.round(completionRate * 100)}%</span>
                </div>
                <Progress value={completionRate * 100} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Overall Score */}
        {overallScore !== undefined && (
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Overall Score</span>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">{overallScore.toFixed(1)}</span>
                  <Badge variant={overallScore >= 80 ? "default" : overallScore >= 60 ? "secondary" : "destructive"}>
                    {overallScore >= 80 ? "Excellent" : overallScore >= 60 ? "Good" : "Needs Review"}
                  </Badge>
                </div>
                <Progress value={overallScore} className="h-2" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Time Spent */}
        {timeSpent !== undefined && (
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Time Spent</span>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">{timeSpent}</span>
                  <span className="text-sm text-muted-foreground">minutes</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Responses */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Question Responses ({responses.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-6">
              {responses.map((response, index) => (
                <div key={index}>
                  {index > 0 && <Separator className="my-6" />}
                  <QuestionResponseItem response={response} index={index} />
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

function QuestionResponseItem({ response, index }: { response: QuestionnaireResponse; index: number }) {
  const { question, answer, type, aiAnalysis } = response;

  return (
    <div className="space-y-3">
      {/* Question */}
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center">
          {index + 1}
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-sm mb-1">{question}</h4>
          <Badge variant="outline" className="text-xs">
            {type === 'multiple-choice' ? 'Multiple Choice' :
             type === 'yes-no' ? 'Yes/No' :
             type === 'rating' ? 'Rating' :
             type === 'file' ? 'File Upload' :
             'Text'}
          </Badge>
        </div>
      </div>

      {/* Answer */}
      <div className="ml-9">
        <div className="bg-muted/50 rounded-md p-3">
          {type === 'file' ? (
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{answer}</span>
              <a 
                href={answer} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline ml-auto"
              >
                View File
              </a>
            </div>
          ) : (
            <p className="text-sm text-foreground whitespace-pre-wrap">{answer}</p>
          )}
        </div>
      </div>

      {/* AI Analysis */}
      {aiAnalysis && (
        <div className="ml-9 space-y-3">
          <Separator />
          <div className="bg-muted/30 rounded-md p-3 space-y-3">
            {/* Sentiment */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">Sentiment:</span>
              <Badge 
                variant={
                  aiAnalysis.sentiment === 'positive' ? 'default' :
                  aiAnalysis.sentiment === 'negative' ? 'destructive' : 'secondary'
                }
                className="text-xs flex items-center gap-1"
              >
                {aiAnalysis.sentiment === 'positive' && <CheckCircle2 className="h-3 w-3" />}
                {aiAnalysis.sentiment === 'negative' && <XCircle className="h-3 w-3" />}
                {aiAnalysis.sentiment === 'neutral' && <AlertCircle className="h-3 w-3" />}
                {aiAnalysis.sentiment.charAt(0).toUpperCase() + aiAnalysis.sentiment.slice(1)}
              </Badge>
              {aiAnalysis.qualityScore !== undefined && (
                <span className="text-xs text-muted-foreground">
                  Quality: {aiAnalysis.qualityScore}/100
                </span>
              )}
            </div>

            {/* Key Insights */}
            {aiAnalysis.keyInsights && aiAnalysis.keyInsights.length > 0 && (
              <div>
                <h5 className="text-xs font-medium mb-2">Key Insights</h5>
                <ul className="list-disc list-inside space-y-1 text-xs text-muted-foreground">
                  {aiAnalysis.keyInsights.map((insight, idx) => (
                    <li key={idx}>{insight}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Strengths */}
            {aiAnalysis.strengths && aiAnalysis.strengths.length > 0 && (
              <div>
                <h5 className="text-xs font-medium mb-2 text-green-600 dark:text-green-400">Strengths</h5>
                <ul className="list-disc list-inside space-y-1 text-xs text-muted-foreground">
                  {aiAnalysis.strengths.map((strength, idx) => (
                    <li key={idx}>{strength}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Concerns */}
            {aiAnalysis.concerns && aiAnalysis.concerns.length > 0 && (
              <div>
                <h5 className="text-xs font-medium mb-2 text-orange-600 dark:text-orange-400">Concerns</h5>
                <ul className="list-disc list-inside space-y-1 text-xs text-muted-foreground">
                  {aiAnalysis.concerns.map((concern, idx) => (
                    <li key={idx}>{concern}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

