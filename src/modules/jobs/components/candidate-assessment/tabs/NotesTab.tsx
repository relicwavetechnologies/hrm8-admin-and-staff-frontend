// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { Badge } from '@/shared/components/ui/badge';
import { Loader2, MessageSquare } from 'lucide-react';
import { formatDistanceToNow, isValid, parseISO } from 'date-fns';
import { apiClient } from '@/shared/lib/api';
import { Application } from '@/shared/types/application';

interface NotesTabProps {
  application: Application;
  scope?: 'all' | 'questionnaire' | 'annotation';
}

interface Note {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  createdAt: string;
  mentions: string[];
}

function formatTimeAgo(dateInput: string | undefined): string {
  if (!dateInput) return 'Just now';
  try {
    const date = parseISO(dateInput);
    if (isValid(date)) {
      return formatDistanceToNow(date, { addSuffix: true });
    }
  } catch {
    // Ignore errors
  }
  return 'Just now';
}

const QUESTIONNAIRE_PREFIX = '[Questionnaire Ref';
const ANNOTATION_PREFIX = '[Annotation Ref';
const ASSESSMENT_PREFIX = '[Assessment Ref';

function getNoteScope(content: string): 'questionnaire' | 'annotation' | 'assessment' | 'general' {
  const normalized = (content || '').trim();
  if (normalized.startsWith(ASSESSMENT_PREFIX)) return 'assessment';
  if (normalized.startsWith(QUESTIONNAIRE_PREFIX)) return 'questionnaire';
  if (normalized.startsWith(ANNOTATION_PREFIX)) return 'annotation';
  return 'general';
}

function parseReferencedContent(content: string): {
  kind: 'questionnaire' | 'annotation' | 'assessment' | 'general';
  label?: string;
  body: string;
} {
  const raw = (content || '').trim();

  const assessmentMatch = raw.match(/^\[Assessment Ref:\s*([^\]]+)\]\s*(?:\[Q:([^\]]+)\]\s*)?([\s\S]*)$/i);
  if (assessmentMatch) {
    const body = (assessmentMatch[3] || '').trim();
    return {
      kind: 'assessment',
      label: 'Assessment Question Note',
      body: body || 'Assessment note',
    };
  }

  const questionnaireMatch = raw.match(/^\[(Questionnaire Ref[^\]]*)\]\s*([\s\S]*)$/i);
  if (questionnaireMatch) {
    const remainder = (questionnaireMatch[2] || '').trim();
    const body = remainder.includes('\n\n')
      ? remainder.split('\n\n').slice(1).join('\n\n').trim() || remainder
      : remainder;
    return {
      kind: 'questionnaire',
      label: questionnaireMatch[1],
      body: body || 'Questionnaire note',
    };
  }

  const annotationMatch = raw.match(/^\[(Annotation Ref[^\]]*)\]\s*([\s\S]*)$/i);
  if (annotationMatch) {
    return {
      kind: 'annotation',
      label: annotationMatch[1],
      body: (annotationMatch[2] || '').trim() || 'Annotation note',
    };
  }

  return { kind: 'general', body: raw };
}

export function NotesTab({ application, scope = 'all' }: NotesTabProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchNotes = async () => {
      if (!application.id) return;
      setIsLoading(true);
      try {
        const response = await apiClient.get<{ notes: any[] }>(
          `/api/applications/${application.id}/notes`
        );
        if (response.success && response.data?.notes) {
          const mappedNotes = response.data.notes.map((note: any) => ({
            id: note.id,
            content: note.content,
            authorId: note.author?.id || 'unknown',
            authorName: note.author?.name || 'Unknown',
            authorAvatar: note.author?.avatar,
            createdAt: note.createdAt,
            mentions: note.mentions || [],
          }));
          setNotes(mappedNotes);
        }
      } catch (error) {
        console.error('Failed to fetch notes:', error);
        const storedNotes = localStorage.getItem(`candidate_notes_${application.id}`);
        if (storedNotes) {
          try {
            setNotes(JSON.parse(storedNotes));
          } catch {
            setNotes([]);
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotes();
  }, [application.id]);

  const filteredNotes = notes.filter((note) => {
    const noteScope = getNoteScope(note.content);
    if (scope === 'questionnaire') return noteScope === 'questionnaire';
    if (scope === 'annotation') return noteScope === 'annotation';
    // Whole notes tab should show all notes
    return true;
  });

  const highlightMentions = (content: string) => {
    return content.replace(
      /@(\w+\s?\w*)/g,
      '<span class="text-primary font-medium">@$1</span>'
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (filteredNotes.length === 0) {
    const emptyDescription =
      scope === 'questionnaire'
        ? 'Add a note from any questionnaire response.'
        : scope === 'annotation'
          ? 'Add a highlight or comment in annotations to create notes.'
          : 'Add a note using the input area above';

    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No notes yet</p>
          <p className="text-sm">{emptyDescription}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {filteredNotes.map((note) => (
        <Card key={note.id} className="border-border/70">
          <CardContent className="py-3.5">
            {(() => {
              const parsed = parseReferencedContent(note.content);
              const scopeVariant =
                parsed.kind === 'assessment'
                  ? 'Assessment'
                  : parsed.kind === 'questionnaire'
                    ? 'Questionnaire'
                    : parsed.kind === 'annotation'
                      ? 'Annotation'
                      : null;
              return (
                <>
                  <div className="flex items-center gap-2 mb-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={note.authorAvatar} />
                      <AvatarFallback className="text-xs">
                        {note.authorName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate">{note.authorName}</p>
                        {scopeVariant && (
                          <Badge variant="secondary" className="h-5 px-1.5 text-[10px] font-medium">
                            {scopeVariant}
                          </Badge>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        {formatTimeAgo(note.createdAt)}
                      </p>
                    </div>
                  </div>
                  {parsed.label && (
                    <p className="text-[11px] font-medium text-foreground/80 mb-1.5">
                      {parsed.label}
                    </p>
                  )}
                  <p
                    className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{ __html: highlightMentions(parsed.body) }}
                  />
                </>
              );
            })()}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
