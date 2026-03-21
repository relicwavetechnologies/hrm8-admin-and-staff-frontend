// @ts-nocheck
import React, { useMemo, useRef, useState } from 'react';
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
import { apiClient } from '@/shared/lib/api';

interface ResumeAnnotationsProps {
  candidateId: string;
  applicationId?: string;
  resumeText: string;
}

export const ResumeAnnotations: React.FC<ResumeAnnotationsProps> = ({
  candidateId,
  applicationId,
  resumeText,
}) => {
  const { annotations, addAnnotation, removeAnnotation } = useResumeAnnotations({
    documentId: candidateId,
    applicationId,
    currentUserId: 'current-user',
    currentUserName: 'Current User',
  });

  const { toast } = useToast();
  const [selectedText, setSelectedText] = useState('');
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [comment, setComment] = useState('');
  const [selection, setSelection] = useState<{ start: number; end: number } | null>(null);
  const resumeContainerRef = useRef<HTMLDivElement | null>(null);

  const clearSelectionState = () => {
    setSelectedText('');
    setSelection(null);
    setShowCommentBox(false);
    setComment('');
  };

  const buildAnnotationNote = (
    type: 'highlight' | 'comment',
    text: string,
    noteComment?: string
  ) => {
    const safeText = text.length > 220 ? `${text.slice(0, 220)}...` : text;
    const label = type === 'comment' ? 'Comment' : 'Highlight';
    if (type === 'comment' && noteComment) {
      return `[Annotation Ref ${label}] "${safeText}"\n\n${noteComment.trim()}`;
    }
    return `[Annotation Ref ${label}] "${safeText}"`;
  };

  const createAnnotationNote = async (
    type: 'highlight' | 'comment',
    text: string,
    noteComment?: string
  ) => {
    if (!applicationId) return;
    const content = buildAnnotationNote(type, text, noteComment);
    await apiClient.post(`/api/applications/${applicationId}/notes`, {
      content,
      mentions: [],
    });
  };

  const handleTextSelection = () => {
    const browserSelection = window.getSelection();
    if (!browserSelection || browserSelection.rangeCount === 0) {
      clearSelectionState();
      return;
    }

    const range = browserSelection.getRangeAt(0);
    if (!resumeContainerRef.current?.contains(range.commonAncestorContainer)) {
      return;
    }

    const selectedStr = browserSelection.toString().trim();
    if (!selectedStr) {
      clearSelectionState();
      return;
    }

    setSelectedText(selectedStr);

    const start = resumeText.indexOf(selectedStr);
    if (start !== -1) {
      setSelection({ start, end: start + selectedStr.length });
    }
  };

  const handleHighlight = async () => {
    if (selection && selectedText) {
      try {
        await addAnnotation('highlight', selectedText, selection);
        await createAnnotationNote('highlight', selectedText);
        toast({
          title: 'Text highlighted',
          description: 'Your highlight has been saved.',
        });
        clearSelectionState();
      } catch (error) {
        // Hook already displays user-facing error toast; keep this handler resilient.
      }
    }
  };

  const handleAddComment = async () => {
    if (selection && selectedText && comment) {
      try {
        const trimmedComment = comment.trim();
        await addAnnotation('comment', selectedText, selection, trimmedComment);
        await createAnnotationNote('comment', selectedText, trimmedComment);
        toast({
          title: 'Comment added',
          description: 'Your comment has been saved.',
        });
        clearSelectionState();
      } catch (error) {
        // Hook already displays user-facing error toast; keep this handler resilient.
      }
    }
  };
  const selectedTextPreview = useMemo(() => {
    if (!selectedText) return '';
    return selectedText.length > 180 ? `${selectedText.slice(0, 180)}...` : selectedText;
  }, [selectedText]);

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
            className="rounded-[3px] px-0.5 cursor-pointer transition-colors"
            style={{
              backgroundColor: `${segment.annotation.user_color}36`,
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div className="lg:col-span-2">
        <Card className="border-border/80 shadow-none">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <Highlighter className="h-4 w-4 text-muted-foreground" />
                Resume
              </CardTitle>
              <Badge variant="outline" className="text-[11px] font-medium">
                <Users className="h-3 w-3 mr-1" />
                {annotations.length} annotations
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">Select text and add a highlight or comment.</p>
          </CardHeader>

          <CardContent className="space-y-3">
            <div className="rounded-lg border bg-background overflow-hidden">
            <ScrollArea className="h-[560px]">
              <div
                ref={resumeContainerRef}
                className="font-mono text-[13px] whitespace-pre-wrap leading-7 select-text p-5 text-foreground/95"
                onMouseUp={handleTextSelection}
              >
                {renderAnnotatedText()}
              </div>
            </ScrollArea>
            </div>

            {selectedText && (
              <div className="sticky bottom-0 z-20 rounded-lg border bg-background p-3 shadow-none">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[11px] uppercase tracking-wide font-medium text-muted-foreground mb-1">Selected Text</p>
                    <p className="text-sm text-foreground break-words">"{selectedTextPreview}"</p>
                  </div>
                  <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={clearSelectionState}>
                    Clear
                  </Button>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <Button size="sm" className="h-8 px-3" onClick={handleHighlight}>
                    <Highlighter className="h-3 w-3 mr-1" />
                    Highlight
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 px-3"
                    onClick={() => setShowCommentBox(!showCommentBox)}
                  >
                    <MessageSquare className="h-3 w-3 mr-1" />
                    {showCommentBox ? 'Hide Comment' : 'Add Comment'}
                  </Button>
                </div>

                {showCommentBox && (
                  <div className="mt-3 space-y-2">
                    <Textarea
                      placeholder="Add concise review feedback for this selection"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="min-h-[92px] resize-none"
                    />
                    <div className="flex gap-2">
                      <Button size="sm" className="h-8" onClick={handleAddComment} disabled={!comment.trim()}>
                        Save Comment
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8"
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

      <div>
        <Card className="border-border/80 shadow-none">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                Annotations
              </CardTitle>
              <Badge variant="outline" className="text-[11px] font-medium">{annotations.length}</Badge>
            </div>
          </CardHeader>

          <CardContent>
            <ScrollArea className="h-[560px]">
              {annotations.length === 0 ? (
                <div className="text-center py-12 px-4">
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
                      className="p-3 rounded-md border bg-card/60"
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
                        <Badge variant="secondary" className="mb-2 text-[10px] uppercase tracking-wide">
                          {annotation.type}
                        </Badge>
                        <p
                          className="text-xs p-2 rounded-sm"
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
