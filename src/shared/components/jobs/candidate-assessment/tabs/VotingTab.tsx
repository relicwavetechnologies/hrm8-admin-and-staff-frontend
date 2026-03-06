import { VotingDashboard } from '../VotingDashboard';

interface VotingTabProps {
  candidateId: string;
  candidateName: string;
}

export function VotingTab({ candidateId, candidateName }: VotingTabProps) {
  return (
    <div className="space-y-6">
      <VotingDashboard candidateId={candidateId} candidateName={candidateName} />
    </div>
  );
}
