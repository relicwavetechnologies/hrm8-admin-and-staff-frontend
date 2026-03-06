import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Textarea } from '@/shared/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { Badge } from '@/shared/components/ui/badge';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { MessageSquare, Send, Reply, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useTypingIndicator } from '@/shared/hooks/useTypingIndicator';
import { createNotification } from '@/shared/lib/notificationStorage';
import { useToast } from '@/shared/hooks/use-toast';

interface Comment {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  userAvatar?: string;
  content: string;
  mentions: string[];
  createdAt: Date;
  parentId?: string;
  replies: Comment[];
}

interface LiveCommentThreadProps {
  candidateId: string;
  candidateName: string;
  currentUserId: string;
  currentUserName: string;
}

export const LiveCommentThread: React.FC<LiveCommentThreadProps> = ({
  candidateId,
  candidateName,
  currentUserId,
  currentUserName,
}) => {
  const [comments, setComments] = useState<Comment[]>([
    {
      id: '1',
      userId: 'user-1',
      userName: 'Sarah Johnson',
      userRole: 'Senior Recruiter',
      content: 'Strong technical background. Their experience with React and TypeScript is impressive.',
      mentions: [],
      createdAt: new Date(Date.now() - 1000 * 60 * 30),
      replies: [
        {
          id: '2',
          userId: 'user-2',
          userName: 'Mike Chen',
          userRole: 'Tech Lead',
          content: '@Sarah Johnson Agreed! I was particularly impressed by their system design answers.',
          mentions: ['user-1'],
          createdAt: new Date(Date.now() - 1000 * 60 * 20),
          replies: [],
        },
      ],
    },
    {
      id: '3',
      userId: 'user-3',
      userName: 'Emily Davis',
      userRole: 'Engineering Manager',
      content: 'One concern - they seemed unsure about scaling strategies. Worth a follow-up discussion?',
      mentions: [],
      createdAt: new Date(Date.now() - 1000 * 60 * 10),
      replies: [],
    },
  ]);
  
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionSearch, setMentionSearch] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { typingUsers, startTyping, stopTyping } = useTypingIndicator({
    candidateId,
    currentUserId,
  });
  const { toast } = useToast();

  const teamMembers = [
    { id: 'user-1', name: 'Sarah Johnson', role: 'Senior Recruiter' },
    { id: 'user-2', name: 'Mike Chen', role: 'Tech Lead' },
    { id: 'user-3', name: 'Emily Davis', role: 'Engineering Manager' },
  ];

  const filteredMembers = mentionSearch
    ? teamMembers.filter(m => 
        m.name.toLowerCase().includes(mentionSearch.toLowerCase())
      )
    : teamMembers;

  useEffect(() => {
    if (showMentions && textareaRef.current) {
      const textarea = textareaRef.current;
      const cursorPosition = textarea.selectionStart;
      const textBeforeCursor = newComment.substring(0, cursorPosition);
      const lastAtSymbol = textBeforeCursor.lastIndexOf('@');
      
      if (lastAtSymbol !== -1) {
        const searchText = textBeforeCursor.substring(lastAtSymbol + 1);
        setMentionSearch(searchText);
      }
    }
  }, [newComment, showMentions]);

  const handleInputChange = (value: string) => {
    setNewComment(value);
    startTyping('comments');
    
    const lastChar = value[value.length - 1];
    if (lastChar === '@') {
      setShowMentions(true);
      setMentionSearch('');
    } else if (!value.includes('@')) {
      setShowMentions(false);
    }
  };

  const handleMentionSelect = (member: typeof teamMembers[0]) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const cursorPosition = textarea.selectionStart;
    const textBeforeCursor = newComment.substring(0, cursorPosition);
    const lastAtSymbol = textBeforeCursor.lastIndexOf('@');
    
    const newText = 
      newComment.substring(0, lastAtSymbol) + 
      `@${member.name} ` + 
      newComment.substring(cursorPosition);
    
    setNewComment(newText);
    setShowMentions(false);
    textarea.focus();
  };

  const handleSubmit = () => {
    if (!newComment.trim()) return;

    const mentions = newComment.match(/@(\w+\s\w+)/g)?.map(m => m.substring(1)) || [];
    
    const comment: Comment = {
      id: Date.now().toString(),
      userId: currentUserId,
      userName: currentUserName,
      userRole: 'Current User',
      content: newComment,
      mentions,
      createdAt: new Date(),
      replies: [],
    };

    // Send notifications for mentions
    mentions.forEach(mentionedName => {
      createNotification({
        userId: 'user-mentioned', // In real app, lookup user ID by name
        type: 'info',
        category: 'system',
        priority: 'medium',
        title: 'You were mentioned',
        message: `${currentUserName} mentioned you in a comment`,
        metadata: {
          candidateId,
          candidateName,
          commentId: comment.id,
        },
        read: false,
        archived: false,
      });

      toast({
        title: 'Mention notification sent',
        description: `Notified ${mentionedName}`,
      });
    });

    // Send notification for new comment
    if (!replyingTo) {
      createNotification({
        userId: 'team-member', // In real app, notify relevant team members
        type: 'info',
        category: 'system',
        priority: 'low',
        title: 'New comment added',
        message: `${currentUserName} added a comment about ${candidateName}`,
        metadata: {
          candidateId,
          candidateName,
          commentId: comment.id,
        },
        read: false,
        archived: false,
      });
    }

    if (replyingTo) {
      setComments(prevComments => 
        addReplyToComment(prevComments, replyingTo, comment)
      );
      setReplyingTo(null);
    } else {
      setComments(prev => [...prev, comment]);
    }

    setNewComment('');
    stopTyping();
  };

  const addReplyToComment = (
    comments: Comment[],
    parentId: string,
    reply: Comment
  ): Comment[] => {
    return comments.map(comment => {
      if (comment.id === parentId) {
        return { ...comment, replies: [...comment.replies, reply] };
      }
      if (comment.replies.length > 0) {
        return {
          ...comment,
          replies: addReplyToComment(comment.replies, parentId, reply),
        };
      }
      return comment;
    });
  };

  const renderComment = (comment: Comment, level: number = 0) => {
    const typingInThisThread = typingUsers.filter(
      u => u.section === 'comments'
    );

    return (
      <div key={comment.id} className={level > 0 ? 'ml-12 mt-4' : 'mb-6'}>
        <div className="flex gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={comment.userAvatar} />
            <AvatarFallback>
              {comment.userName.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-sm">{comment.userName}</span>
              <Badge variant="outline" className="text-xs">
                {comment.userRole}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(comment.createdAt, { addSuffix: true })}
              </span>
            </div>
            
            <p className="text-sm mb-2">{comment.content}</p>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setReplyingTo(comment.id);
                textareaRef.current?.focus();
              }}
              className="h-7 text-xs"
            >
              <Reply className="h-3 w-3 mr-1" />
              Reply
            </Button>

            {comment.replies.map(reply => renderComment(reply, level + 1))}
          </div>
        </div>

        {level === 0 && typingInThisThread.length > 0 && (
          <div className="ml-11 mt-2 flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>
              {typingInThisThread.map(u => u.userName).join(', ')} 
              {typingInThisThread.length === 1 ? ' is' : ' are'} typing...
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Team Discussion
          <Badge variant="secondary" className="ml-auto">
            {comments.length + comments.reduce((sum, c) => sum + c.replies.length, 0)} comments
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ScrollArea className="h-[400px] pr-4">
          {comments.map(comment => renderComment(comment))}
        </ScrollArea>

        <div className="relative">
          {replyingTo && (
            <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
              <Reply className="h-4 w-4" />
              <span>Replying to a comment</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setReplyingTo(null)}
                className="ml-auto h-6"
              >
                Cancel
              </Button>
            </div>
          )}

          <div className="relative">
            <Textarea
              ref={textareaRef}
              placeholder="Add a comment... Use @ to mention team members"
              value={newComment}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.ctrlKey) {
                  handleSubmit();
                }
              }}
              className="min-h-[80px]"
            />

            {showMentions && filteredMembers.length > 0 && (
              <Card className="absolute bottom-full mb-2 w-full z-10">
                <ScrollArea className="max-h-[200px]">
                  <div className="p-2">
                    {filteredMembers.map(member => (
                      <Button
                        key={member.id}
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => handleMentionSelect(member)}
                      >
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback>
                              {member.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="text-left">
                            <div className="font-medium text-sm">{member.name}</div>
                            <div className="text-xs text-muted-foreground">{member.role}</div>
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
              </Card>
            )}
          </div>

          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-muted-foreground">
              Press Ctrl+Enter to post
            </span>
            <Button onClick={handleSubmit} disabled={!newComment.trim()}>
              <Send className="h-4 w-4 mr-2" />
              Post Comment
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
