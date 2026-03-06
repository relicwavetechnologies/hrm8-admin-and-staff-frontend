import React, { useRef, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Textarea } from '@/shared/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
  FileEdit,
  Users,
  Save,
  Download,
  Bold,
  Italic,
  List,
} from 'lucide-react';
import { useCollaborativeEditor } from '@/shared/hooks/useCollaborativeEditor';
import { useToast } from '@/shared/hooks/use-toast';

interface CollaborativeEditorProps {
  documentId: string;
  candidateName: string;
  initialContent?: string;
}

export const CollaborativeEditor: React.FC<CollaborativeEditorProps> = ({
  documentId,
  candidateName,
  initialContent = '',
}) => {
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const cursorContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const {
    content,
    updateContent,
    activeUsers,
    cursors,
    updateCursorPosition,
  } = useCollaborativeEditor({
    documentId,
    currentUserId: 'current-user',
    currentUserName: 'You',
  });

  const [localContent, setLocalContent] = useState(initialContent);
  const [isSaving, setIsSaving] = useState(false);
  const [cursorPositions, setCursorPositions] = useState<Map<string, { x: number; y: number }>>(
    new Map()
  );

  useEffect(() => {
    if (content && content !== localContent) {
      setLocalContent(content);
    }
  }, [content]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setLocalContent(newContent);
    updateContent(newContent);

    // Update cursor position
    const cursorPos = e.target.selectionStart;
    updateCursorPosition(cursorPos);
  };

  const handleSelectionChange = () => {
    if (!editorRef.current) return;

    const start = editorRef.current.selectionStart;
    const end = editorRef.current.selectionEnd;

    if (start !== end) {
      updateCursorPosition(start, { start, end });
    } else {
      updateCursorPosition(start);
    }
  };

  // Calculate cursor positions based on text content
  useEffect(() => {
    if (!editorRef.current || !cursorContainerRef.current) return;

    const newPositions = new Map<string, { x: number; y: number }>();

    cursors.forEach((cursor) => {
      // Calculate approximate position based on character index
      const lines = localContent.substring(0, cursor.position).split('\n');
      const lineNumber = lines.length - 1;
      const charInLine = lines[lines.length - 1].length;

      // Approximate positioning (would need more sophisticated calculation in production)
      const lineHeight = 24; // approximate line height in pixels
      const charWidth = 8; // approximate character width in pixels

      newPositions.set(cursor.userId, {
        x: charInLine * charWidth + 16,
        y: lineNumber * lineHeight + 16,
      });
    });

    setCursorPositions(newPositions);
  }, [cursors, localContent]);

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate save
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
    toast({
      title: 'Notes saved',
      description: 'Interview notes have been saved successfully.',
    });
  };

  const handleExport = () => {
    const blob = new Blob([localContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `interview-notes-${candidateName}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: 'Notes exported',
      description: 'Interview notes downloaded successfully.',
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileEdit className="h-5 w-5" />
            Interview Notes
            <Badge variant="secondary" className="ml-2">
              <Users className="h-3 w-3 mr-1" />
              {activeUsers.length + 1} editing
            </Badge>
          </CardTitle>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
            >
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleSave}
              disabled={isSaving}
            >
              <Save className="h-4 w-4 mr-1" />
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>

        {/* Active users */}
        <div className="flex items-center gap-2 mt-3">
          <span className="text-sm text-muted-foreground">Active editors:</span>
          <div className="flex items-center -space-x-2">
            <Avatar className="h-6 w-6 border-2 border-background">
              <AvatarFallback className="text-xs">You</AvatarFallback>
            </Avatar>
            {activeUsers.map((user) => (
              <Avatar
                key={user.userId}
                className="h-6 w-6 border-2 border-background"
                style={{ borderColor: user.userColor }}
              >
                <AvatarFallback
                  className="text-xs"
                  style={{ backgroundColor: `${user.userColor}20` }}
                >
                  {user.userName.split(' ').map((n) => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
            ))}
          </div>

          {/* Typing indicators */}
          {activeUsers.some((u) => u.isTyping) && (
            <div className="flex items-center gap-1 ml-2">
              {activeUsers
                .filter((u) => u.isTyping)
                .map((user) => (
                  <Badge
                    key={user.userId}
                    variant="secondary"
                    className="text-xs animate-pulse"
                  >
                    {user.userName} is typing...
                  </Badge>
                ))}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {/* Toolbar */}
        <div className="flex items-center gap-2 mb-3 pb-3 border-b">
          <Button variant="ghost" size="sm" title="Bold">
            <Bold className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" title="Italic">
            <Italic className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" title="List">
            <List className="h-4 w-4" />
          </Button>
        </div>

        {/* Editor with cursors */}
        <div className="relative">
          <Textarea
            ref={editorRef}
            value={localContent}
            onChange={handleContentChange}
            onSelect={handleSelectionChange}
            onKeyUp={handleSelectionChange}
            onClick={handleSelectionChange}
            placeholder="Start typing interview notes... Other team members can see your edits in real-time."
            className="min-h-[400px] font-mono text-sm resize-none"
          />

          {/* Remote cursors overlay */}
          <div
            ref={cursorContainerRef}
            className="absolute inset-0 pointer-events-none overflow-hidden"
          >
            {cursors.map((cursor) => {
              const position = cursorPositions.get(cursor.userId);
              if (!position) return null;

              return (
                <div
                  key={cursor.userId}
                  className="absolute transition-all duration-200"
                  style={{
                    left: `${position.x}px`,
                    top: `${position.y}px`,
                  }}
                >
                  {/* Cursor line */}
                  <div
                    className="w-0.5 h-5 animate-pulse"
                    style={{ backgroundColor: cursor.userColor }}
                  />

                  {/* User label */}
                  <div
                    className="absolute -top-6 left-0 px-2 py-0.5 rounded text-white text-xs whitespace-nowrap shadow-lg"
                    style={{ backgroundColor: cursor.userColor }}
                  >
                    {cursor.userName}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Character count */}
        <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
          <span>{localContent.length} characters</span>
          <span>Last saved: Just now</span>
        </div>
      </CardContent>
    </Card>
  );
};
