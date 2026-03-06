import { Application } from "@/shared/types/application";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { ExternalLink, FileText, Download, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Separator } from "@/shared/components/ui/separator";

interface CoverLetterViewProps {
  application: Application;
}

interface SentimentAnalysis {
  sentiment: 'positive' | 'neutral' | 'negative';
  confidence: number;
  keyPoints: string[];
  strengths: string[];
  concerns: string[];
}

export function CoverLetterView({ application }: CoverLetterViewProps) {
  // Extract cover letter content (this would come from parsed data or document)
  // For now, we'll check if there's a cover letter URL and attempt to display it
  const hasCoverLetter = !!application.coverLetterUrl;
  
  // If cover letter is in questionnaireData or customAnswers, extract it
  let coverLetterText: string | undefined;
  let sentimentAnalysis: SentimentAnalysis | undefined;

  // Check questionnaireData for cover letter
  if (application.questionnaireData) {
    const questionnaire = application.questionnaireData as any;
    if (questionnaire.coverLetter) {
      coverLetterText = questionnaire.coverLetter;
    }
    if (questionnaire.sentimentAnalysis) {
      sentimentAnalysis = questionnaire.sentimentAnalysis;
    }
  }

  // Check customAnswers for cover letter
  if (!coverLetterText && application.customAnswers) {
    const coverLetterAnswer = application.customAnswers.find(
      answer => answer.question.toLowerCase().includes('cover letter') || 
                answer.question.toLowerCase().includes('letter')
    );
    if (coverLetterAnswer) {
      coverLetterText = Array.isArray(coverLetterAnswer.answer) 
        ? coverLetterAnswer.answer.join('\n') 
        : coverLetterAnswer.answer;
    }
  }

  if (!hasCoverLetter && !coverLetterText) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-sm">No cover letter available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Cover Letter Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Cover Letter
            </CardTitle>
            {application.coverLetterUrl && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(application.coverLetterUrl, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Original
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = application.coverLetterUrl!;
                    link.download = `cover-letter-${application.candidateName.replace(/\s+/g, '-')}.pdf`;
                    link.click();
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {coverLetterText ? (
            <ScrollArea className="h-[400px] pr-4">
              <div className="prose prose-sm max-w-none whitespace-pre-wrap text-sm text-muted-foreground">
                {coverLetterText}
              </div>
            </ScrollArea>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">Cover letter file available but text not parsed</p>
              <p className="text-xs mt-2">Click "View Original" to read the document</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sentiment Analysis */}
      {sentimentAnalysis && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Sentiment Analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Overall Sentiment */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">Overall Sentiment:</span>
              <Badge 
                variant={
                  sentimentAnalysis.sentiment === 'positive' ? 'default' :
                  sentimentAnalysis.sentiment === 'negative' ? 'destructive' : 'secondary'
                }
                className="flex items-center gap-1"
              >
                {sentimentAnalysis.sentiment === 'positive' && <TrendingUp className="h-3 w-3" />}
                {sentimentAnalysis.sentiment === 'negative' && <TrendingDown className="h-3 w-3" />}
                {sentimentAnalysis.sentiment === 'neutral' && <Minus className="h-3 w-3" />}
                {sentimentAnalysis.sentiment.charAt(0).toUpperCase() + sentimentAnalysis.sentiment.slice(1)}
              </Badge>
              <span className="text-xs text-muted-foreground">
                ({Math.round(sentimentAnalysis.confidence * 100)}% confidence)
              </span>
            </div>

            <Separator />

            {/* Key Points */}
            {sentimentAnalysis.keyPoints && sentimentAnalysis.keyPoints.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Key Points</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  {sentimentAnalysis.keyPoints.map((point, idx) => (
                    <li key={idx}>{point}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Strengths */}
            {sentimentAnalysis.strengths && sentimentAnalysis.strengths.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2 text-green-600 dark:text-green-400">Strengths</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  {sentimentAnalysis.strengths.map((strength, idx) => (
                    <li key={idx}>{strength}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Concerns */}
            {sentimentAnalysis.concerns && sentimentAnalysis.concerns.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2 text-orange-600 dark:text-orange-400">Concerns</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  {sentimentAnalysis.concerns.map((concern, idx) => (
                    <li key={idx}>{concern}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

