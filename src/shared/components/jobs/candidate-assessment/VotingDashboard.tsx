import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Textarea } from '@/shared/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar';
import { Badge } from '@/shared/components/ui/badge';
import { Progress } from '@/shared/components/ui/progress';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import {
  ThumbsUp,
  ThumbsDown,
  Minus,
  CheckCircle2,
  XCircle,
  TrendingUp,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useVoting, VoteDecision } from '@/shared/hooks/useVoting';
import { useToast } from '@/shared/hooks/use-toast';

interface VotingDashboardProps {
  candidateId: string;
  candidateName: string;
}

export const VotingDashboard: React.FC<VotingDashboardProps> = ({
  candidateId,
}) => {
  const { votes, currentUserVote, stats, submitVote } = useVoting({
    candidateId,
    currentUserId: 'current-user',
  });

  const { toast } = useToast();
  const [showVoteForm, setShowVoteForm] = useState(false);
  const [selectedDecision, setSelectedDecision] = useState<VoteDecision>('hire');
  const [reasoning, setReasoning] = useState('');

  const voteOptions: Array<{
    value: VoteDecision;
    label: string;
    icon: React.ReactNode;
    color: string;
  }> = [
      {
        value: 'strong-hire',
        label: 'Strong Hire',
        icon: <CheckCircle2 className="h-5 w-5" />,
        color: 'bg-green-600 hover:bg-green-700',
      },
      {
        value: 'hire',
        label: 'Hire',
        icon: <ThumbsUp className="h-5 w-5" />,
        color: 'bg-green-500 hover:bg-green-600',
      },
      {
        value: 'maybe',
        label: 'Maybe',
        icon: <Minus className="h-5 w-5" />,
        color: 'bg-yellow-500 hover:bg-yellow-600',
      },
      {
        value: 'no-hire',
        label: 'No Hire',
        icon: <ThumbsDown className="h-5 w-5" />,
        color: 'bg-red-500 hover:bg-red-600',
      },
      {
        value: 'strong-no-hire',
        label: 'Strong No Hire',
        icon: <XCircle className="h-5 w-5" />,
        color: 'bg-red-600 hover:bg-red-700',
      },
    ];

  const handleSubmitVote = () => {
    if (!reasoning.trim()) {
      toast({
        title: 'Reasoning required',
        description: 'Please provide reasoning for your decision.',
        variant: 'destructive',
      });
      return;
    }

    submitVote(selectedDecision, reasoning, 'Current User', 'Hiring Manager');
    setShowVoteForm(false);
    setReasoning('');

    toast({
      title: 'Vote submitted',
      description: 'Your hiring decision has been recorded.',
    });
  };

  const getDecisionColor = (decision: VoteDecision) => {
    const option = voteOptions.find(o => o.value === decision);
    return option?.color || 'bg-gray-500';
  };

  const getDecisionLabel = (decision: VoteDecision) => {
    const option = voteOptions.find(o => o.value === decision);
    return option?.label || decision;
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Team Consensus
            <Badge variant="secondary" className="ml-auto">
              {stats.totalVotes} votes
            </Badge>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Consensus Score */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Consensus Level</span>
              <span className="text-2xl font-bold">{stats.consensus}%</span>
            </div>
            <Progress value={stats.consensus} className="h-3" />
            <p className="text-xs text-muted-foreground mt-2">
              Team recommendation: <span className="font-semibold">{getDecisionLabel(stats.recommendation)}</span>
            </p>
          </div>

          {/* Vote Distribution */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Vote Distribution</h4>
            {voteOptions.map(option => {
              const count = stats.distribution[option.value];
              const percentage = stats.totalVotes > 0 ? (count / stats.totalVotes) * 100 : 0;

              return (
                <div key={option.value} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      {option.icon}
                      <span>{option.label}</span>
                    </div>
                    <span className="font-semibold">{count}</span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Vote Form or Current Vote */}
      <Card>
        <CardHeader>
          <CardTitle>Your Vote</CardTitle>
        </CardHeader>

        <CardContent>
          {!currentUserVote && !showVoteForm ? (
            <Button onClick={() => setShowVoteForm(true)} className="w-full">
              Cast Your Vote
            </Button>
          ) : currentUserVote && !showVoteForm ? (
            <div className="space-y-4">
              <div className="p-4 rounded-lg border bg-muted">
                <div className="flex items-center justify-between mb-2">
                  <Badge className={getDecisionColor(currentUserVote.decision)}>
                    {getDecisionLabel(currentUserVote.decision)}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(currentUserVote.timestamp, { addSuffix: true })}
                  </span>
                </div>
                <p className="text-sm">{currentUserVote.reasoning}</p>
              </div>
              <Button
                variant="outline"
                onClick={() => setShowVoteForm(true)}
                className="w-full"
              >
                Change Vote
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                {voteOptions.map(option => (
                  <Button
                    key={option.value}
                    variant={selectedDecision === option.value ? 'default' : 'outline'}
                    onClick={() => setSelectedDecision(option.value)}
                    className="flex items-center gap-2"
                  >
                    {option.icon}
                    {option.label}
                  </Button>
                ))}
              </div>

              <Textarea
                placeholder="Provide your reasoning for this decision..."
                value={reasoning}
                onChange={(e) => setReasoning(e.target.value)}
                className="min-h-[100px]"
              />

              <div className="flex gap-2">
                <Button onClick={handleSubmitVote} className="flex-1">
                  Submit Vote
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowVoteForm(false);
                    setReasoning('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* All Votes */}
      <Card>
        <CardHeader>
          <CardTitle>Team Votes</CardTitle>
        </CardHeader>

        <CardContent>
          <ScrollArea className="h-[400px]">
            <div className="space-y-4">
              {votes.map((vote) => (
                <div
                  key={vote.userId}
                  className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {vote.userName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <div>
                          <p className="font-semibold text-sm">{vote.userName}</p>
                          <p className="text-xs text-muted-foreground">{vote.userRole}</p>
                        </div>
                        <Badge className={getDecisionColor(vote.decision)}>
                          {getDecisionLabel(vote.decision)}
                        </Badge>
                      </div>

                      <p className="text-sm mb-2">{vote.reasoning}</p>

                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(vote.timestamp, { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};
