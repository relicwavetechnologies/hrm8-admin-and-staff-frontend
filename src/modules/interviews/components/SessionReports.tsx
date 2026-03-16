// @ts-nocheck
import React from 'react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { CalibrationSession } from '@/shared/types/interview';
import { FileDown, FileText, Mail } from 'lucide-react';
import { useToast } from '@/shared/hooks/use-toast';

interface SessionReportsProps {
  session: CalibrationSession;
}

const SessionReports: React.FC<SessionReportsProps> = ({ session }) => {
  const { toast } = useToast();

  const generatePDFReport = () => {
    toast({
      title: "Generating PDF Report",
      description: "Your session report will download shortly.",
    });
    
    // Simulate PDF generation
    setTimeout(() => {
      toast({
        title: "Report Generated",
        description: "Session report has been downloaded.",
      });
    }, 2000);
  };

  const generateSummary = () => {
    const improvement = session.alignmentScores 
      ? ((session.alignmentScores.afterSession - session.alignmentScores.beforeSession) / session.alignmentScores.beforeSession * 100).toFixed(1)
      : 'N/A';
    
    const summary = `
Calibration Session Report
==========================

Session: ${session.name}
Date: ${new Date(session.scheduledDate).toLocaleDateString()}
Status: ${session.status}

Participants: ${session.participants.length}
Focus Interviews: ${session.focusInterviews.length}

Exercises Completed: ${session.exercises.filter(e => e.completed).length}/${session.exercises.length}

Alignment Scores:
- Before Session: ${session.alignmentScores?.beforeSession || 'N/A'}
- After Session: ${session.alignmentScores?.afterSession || 'N/A'}
- Improvement: ${improvement}%

Key Takeaways:
${session.notes || 'No notes available'}
    `.trim();

    navigator.clipboard.writeText(summary);
    toast({
      title: "Summary Copied",
      description: "Session summary copied to clipboard.",
    });
  };

  const emailReport = () => {
    const subject = encodeURIComponent(`Calibration Session Report: ${session.name}`);
    const body = encodeURIComponent(`Please find the calibration session report for ${session.name} scheduled on ${new Date(session.scheduledDate).toLocaleDateString()}.`);
    
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    
    toast({
      title: "Email Client Opened",
      description: "Draft email created with session details.",
    });
  };

  const calculateMetrics = () => {
    const completedExercises = session.exercises.filter(e => e.completed).length;
    const completionRate = (completedExercises / session.exercises.length * 100).toFixed(0);
    const improvement = session.alignmentScores 
      ? ((session.alignmentScores.afterSession - session.alignmentScores.beforeSession) / session.alignmentScores.beforeSession * 100).toFixed(0)
      : 0;
    
    return {
      completionRate,
      improvement,
      participationRate: '100', // Mock data
      avgEngagement: '92', // Mock data
    };
  };

  const metrics = calculateMetrics();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Session Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-sm text-muted-foreground">Completion Rate</p>
              <p className="text-2xl font-bold">{metrics.completionRate}%</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Alignment Improvement</p>
              <p className="text-2xl font-bold">{metrics.improvement}%</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Participation Rate</p>
              <p className="text-2xl font-bold">{metrics.participationRate}%</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg Engagement</p>
              <p className="text-2xl font-bold">{metrics.avgEngagement}%</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-semibold">Key Outcomes</h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• {session.exercises.filter(e => e.completed).length} exercises completed</li>
              <li>• {session.participants.length} participants actively engaged</li>
              <li>• {session.focusInterviews.length} interviews calibrated</li>
              <li>• Discussion notes captured</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Export & Share</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button 
            onClick={generatePDFReport} 
            className="w-full justify-start"
            variant="outline"
          >
            <FileDown className="h-4 w-4 mr-2" />
            Download PDF Report
          </Button>
          
          <Button 
            onClick={generateSummary} 
            className="w-full justify-start"
            variant="outline"
          >
            <FileText className="h-4 w-4 mr-2" />
            Copy Summary to Clipboard
          </Button>
          
          <Button 
            onClick={emailReport} 
            className="w-full justify-start"
            variant="outline"
          >
            <Mail className="h-4 w-4 mr-2" />
            Email Report
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SessionReports;
