// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar';
import { Users, Eye, Edit3 } from 'lucide-react';

interface Participant {
  id: string;
  name: string;
  status: 'viewing' | 'editing';
  lastActive: Date;
}

interface LiveCollaborationProps {
  sessionId: string;
  currentUserId: string;
}

const LiveCollaboration: React.FC<LiveCollaborationProps> = ({ sessionId, currentUserId }) => {
  const [activeParticipants, setActiveParticipants] = useState<Participant[]>([]);

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setActiveParticipants(prev => 
        prev.map(p => ({
          ...p,
          lastActive: new Date(),
          status: Math.random() > 0.3 ? p.status : (p.status === 'viewing' ? 'editing' : 'viewing')
        }))
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getStatusColor = (status: string) => {
    return status === 'editing' ? 'bg-primary' : 'bg-muted';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Active Participants ({activeParticipants.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activeParticipants.map(participant => (
            <div key={participant.id} className="flex items-center justify-between p-2 rounded-lg border">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className={getStatusColor(participant.status)}>
                    {getInitials(participant.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{participant.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Active {Math.floor((Date.now() - participant.lastActive.getTime()) / 1000)}s ago
                  </p>
                </div>
              </div>
              <Badge variant={participant.status === 'editing' ? 'default' : 'secondary'}>
                {participant.status === 'editing' ? (
                  <><Edit3 className="h-3 w-3 mr-1" /> Editing</>
                ) : (
                  <><Eye className="h-3 w-3 mr-1" /> Viewing</>
                )}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default LiveCollaboration;
