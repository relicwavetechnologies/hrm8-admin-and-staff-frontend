import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Textarea } from '@/shared/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar';
import { Badge } from '@/shared/components/ui/badge';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { Separator } from '@/shared/components/ui/separator';
import { Highlighter, MessageSquare, Trash2, Users } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useResumeAnnotations } from '@/shared/hooks/useResumeAnnotations';
import { useToast } from '@/shared/hooks/use-toast';

interface ResumeAnnotationsProps {
  candidateId: string;
  resumeText: string;
}

export const ResumeAnnotations: React.FC<ResumeAnnotationsProps> = ({
  candidateId,
  resumeText,
}) => {
  const { annotations, addAnnotation, removeAnnotation } = useResumeAnnotations({
    documentId: candidateId,
    currentUserId: 'current-user',
    currentUserName: 'Current User',
  });

  const { toast } = useToast();
  const [selectedText, setSelectedText] = useState('');
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [comment, setComment] = useState('');
  const [selection, setSelection] = useState<{ start: number; end: number } | null>(null);

  const handleTextSelection = () => {
    const selectedStr = window.getSelection()?.toString();
    if (selectedStr && selectedStr.length > 0) {
      setSelectedText(selectedStr);

      // Find position in resume text
      const start = resumeText.indexOf(selectedStr);
      if (start !== -1) {
        setSelection({ start, end: start + selectedStr.length });
      }
    }
  };

  const handleHighlight = () => {
    if (selection && selectedText) {
      addAnnotation('highlight', selectedText, selection);
      toast({
        title: 'Text highlighted',
        description: 'Your highlight has been saved.',
      });
      setSelectedText('');
      setSelection(null);
    }
  };

  const handleAddComment = () => {
    if (selection && selectedText && comment) {
      addAnnotation('comment', selectedText, selection, comment);
      toast({
        title: 'Comment added',
        description: 'Your comment has been saved.',
      });
      setComment('');
      setShowCommentBox(false);
      setSelectedText('');
      setSelection(null);
    }
  };

  const renderAnnotatedText = () => {
    const result = resumeText;
    const sortedAnnotations = [...annotations].sort((a, b) => a.position.start - b.position.start);

    // Create segments with annotations
    const segments: Array<{ text: string; annotation?: typeof annotations[0] }> = [];
    let lastIndex = 0;

    sortedAnnotations.forEach((annotation) => {
      // Add text before annotation
      if (annotation.position.start > lastIndex) {
        segments.push({
          text: result.substring(lastIndex, annotation.position.start),
        });
      }

      // Add annotated text
      segments.push({
        text: result.substring(annotation.position.start, annotation.position.end),
        annotation,
      });

      lastIndex = annotation.position.end;
    });

    // Add remaining text
    if (lastIndex < result.length) {
      segments.push({ text: result.substring(lastIndex) });
    }

    return segments.map((segment, index) => {
      if (segment.annotation) {
        return (
          <mark
            key={index}
            className="px-1 rounded cursor-pointer"
            style={{
              backgroundColor: `${segment.annotation.user_color}40`,
              borderBottom: `2px solid ${segment.annotation.user_color}`,
            }}
            title={segment.annotation.comment}
          >
            {segment.text}
          </mark>
        );
      }
      return <span key={index}>{segment.text}</span>;
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Resume View */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Highlighter className="h-5 w-5" />
                Resume
              </CardTitle>
              <Badge variant="secondary">
                <Users className="h-3 w-3 mr-1" />
                {annotations.length} annotations
              </Badge>
            </div>
          </CardHeader>

          <CardContent>
            <ScrollArea className="h-[600px]">
              <div
                className="font-mono text-sm whitespace-pre-wrap leading-relaxed select-text"
                onMouseUp={handleTextSelection}
              >
                {renderAnnotatedText()}
              </div>
            </ScrollArea>

            {selectedText && (
              <div className="mt-4 p-4 rounded-lg border bg-muted space-y-3">
                <p className="text-sm font-medium">Selected: "{selectedText}"</p>
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleHighlight}>
                    <Highlighter className="h-3 w-3 mr-1" />
                    Highlight
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowCommentBox(!showCommentBox)}
                  >
                    <MessageSquare className="h-3 w-3 mr-1" />
                    Add Comment
                  </Button>
                </div>

                {showCommentBox && (
                  <div className="space-y-2">
                    <Textarea
                      placeholder="Add your comment..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="min-h-[80px]"
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleAddComment}>
                        Save Comment
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setShowCommentBox(false);
                          setComment('');
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Annotations Sidebar */}
      <div>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Annotations
            </CardTitle>
          </CardHeader>

          <CardContent>
            <ScrollArea className="h-[600px]">
              {annotations.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No annotations yet. Select text to highlight or comment.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {annotations.map((annotation) => (
                    <div
                      key={annotation.id}
                      className="p-3 rounded-lg border"
                      style={{ borderLeftColor: annotation.user_color, borderLeftWidth: '3px' }}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs">
                              {annotation.user_name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-xs font-semibold">{annotation.user_name}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatDistanceToNow(annotation.timestamp, { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => removeAnnotation(annotation.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>

                      <div className="mb-2">
                        <Badge variant="outline" className="mb-2">
                          {annotation.type}
                        </Badge>
                        <p
                          className="text-xs p-2 rounded"
                          style={{ backgroundColor: `${annotation.user_color}20` }}
                        >
                          "{annotation.text}"
                        </p>
                      </div>

                      {annotation.comment && (
                        <>
                          <Separator className="my-2" />
                          <p className="text-sm">{annotation.comment}</p>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
