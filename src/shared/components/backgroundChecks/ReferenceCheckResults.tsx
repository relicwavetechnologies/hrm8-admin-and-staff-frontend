import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Users, FileText, Download } from 'lucide-react';
import { getRefereesByBackgroundCheck } from '@/shared/lib/backgroundChecks/refereeStorage';
import { RefereeStatusCard } from './references/RefereeStatusCard';

interface ReferenceCheckResultsProps {
  backgroundCheckId: string;
}

export function ReferenceCheckResults({ backgroundCheckId }: ReferenceCheckResultsProps) {
  const referees = getRefereesByBackgroundCheck(backgroundCheckId);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            <CardTitle>Reference Check</CardTitle>
          </div>
          <Badge variant="default">
            {referees.filter(r => r.status === 'completed').length} of {referees.length} Completed
          </Badge>
        </div>
        <CardDescription>
          Professional references from colleagues and managers
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {referees.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No referees added for this check</p>
          </div>
        ) : (
          <div className="space-y-4">
            {referees.map((referee) => (
              <RefereeStatusCard
                key={referee.id}
                referee={referee}
                onViewResponse={() => {}}
                onSendReminder={() => {}}
              />
            ))}
          </div>
        )}

        {referees.some(r => r.status === 'completed') && (
          <div className="flex gap-2 pt-4 border-t">
            <Button variant="outline" className="gap-2">
              <FileText className="h-4 w-4" />
              View All Responses
            </Button>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Download Report
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
