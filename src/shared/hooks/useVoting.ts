import { useState, useEffect, useCallback } from 'react';

export type VoteDecision = 'strong-hire' | 'hire' | 'maybe' | 'no-hire' | 'strong-no-hire';

export interface Vote {
  userId: string;
  userName: string;
  userRole: string;
  decision: VoteDecision;
  reasoning: string;
  timestamp: Date;
}

export interface VotingStats {
  totalVotes: number;
  distribution: Record<VoteDecision, number>;
  consensus: number; // 0-100
  recommendation: VoteDecision;
}

interface UseVotingOptions {
  candidateId: string;
  currentUserId: string;
}

export const useVoting = ({ candidateId, currentUserId }: UseVotingOptions) => {
  const [votes, setVotes] = useState<Vote[]>([
    {
      userId: 'user-1',
      userName: 'Sarah Johnson',
      userRole: 'Senior Recruiter',
      decision: 'hire',
      reasoning: 'Strong cultural fit and good technical skills',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
    },
    {
      userId: 'user-2',
      userName: 'Mike Chen',
      userRole: 'Tech Lead',
      decision: 'strong-hire',
      reasoning: 'Exceptional problem-solving and system design skills',
      timestamp: new Date(Date.now() - 1000 * 60 * 20),
    },
    {
      userId: 'user-3',
      userName: 'Emily Davis',
      userRole: 'Engineering Manager',
      decision: 'hire',
      reasoning: 'Great communication and leadership potential',
      timestamp: new Date(Date.now() - 1000 * 60 * 10),
    },
  ]);

  const [currentUserVote, setCurrentUserVote] = useState<Vote | null>(null);

  // Simulate real-time votes
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.85) {
        const users = [
          { id: 'user-4', name: 'Alex Martinez', role: 'HR Manager' },
          { id: 'user-5', name: 'David Kim', role: 'Senior Engineer' },
        ];

        const decisions: VoteDecision[] = [
          'strong-hire',
          'hire',
          'maybe',
          'no-hire',
          'strong-no-hire',
        ];

        const user = users[Math.floor(Math.random() * users.length)];
        const decision = decisions[Math.floor(Math.random() * decisions.length)];

        const existingVoteIndex = votes.findIndex(v => v.userId === user.id);
        
        if (existingVoteIndex === -1) {
          const newVote: Vote = {
            userId: user.id,
            userName: user.name,
            userRole: user.role,
            decision,
            reasoning: 'Updated assessment based on recent discussion',
            timestamp: new Date(),
          };

          setVotes(prev => [...prev, newVote]);
        }
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [votes]);

  const submitVote = useCallback(
    (decision: VoteDecision, reasoning: string, userName: string, userRole: string) => {
      const newVote: Vote = {
        userId: currentUserId,
        userName,
        userRole,
        decision,
        reasoning,
        timestamp: new Date(),
      };

      setVotes(prev => {
        const filtered = prev.filter(v => v.userId !== currentUserId);
        return [...filtered, newVote];
      });

      setCurrentUserVote(newVote);
    },
    [currentUserId]
  );

  const calculateStats = useCallback((): VotingStats => {
    const distribution: Record<VoteDecision, number> = {
      'strong-hire': 0,
      'hire': 0,
      'maybe': 0,
      'no-hire': 0,
      'strong-no-hire': 0,
    };

    votes.forEach(vote => {
      distribution[vote.decision]++;
    });

    // Calculate weighted score
    const weights = {
      'strong-hire': 2,
      'hire': 1,
      'maybe': 0,
      'no-hire': -1,
      'strong-no-hire': -2,
    };

    const totalWeight = votes.reduce((sum, vote) => sum + weights[vote.decision], 0);
    const maxWeight = votes.length * 2;
    const consensus = Math.round(((totalWeight + maxWeight) / (maxWeight * 2)) * 100);

    // Determine recommendation
    const positiveVotes = distribution['strong-hire'] + distribution['hire'];
    const negativeVotes = distribution['no-hire'] + distribution['strong-no-hire'];
    
    let recommendation: VoteDecision = 'maybe';
    if (positiveVotes > negativeVotes + 1) {
      recommendation = distribution['strong-hire'] > distribution['hire'] ? 'strong-hire' : 'hire';
    } else if (negativeVotes > positiveVotes) {
      recommendation = distribution['strong-no-hire'] > distribution['no-hire'] ? 'strong-no-hire' : 'no-hire';
    }

    return {
      totalVotes: votes.length,
      distribution,
      consensus,
      recommendation,
    };
  }, [votes]);

  return {
    votes,
    currentUserVote,
    stats: calculateStats(),
    submitVote,
  };
};
