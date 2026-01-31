import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { Button } from '@/shared/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { Badge } from '@/shared/components/ui/badge';
import { History, RotateCcw, Plus, Minus } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useVersionHistory, DocumentVersion } from '@/shared/hooks/useVersionHistory';
import { useToast } from '@/shared/hooks/use-toast';

interface VersionHistoryProps {
  documentId: string;
  currentContent: string;
  onRestore: (content: string) => void;
}

export const VersionHistory: React.FC<VersionHistoryProps> = ({
  documentId,
  currentContent,
  onRestore,
}) => {
  const { versions, selectedVersion, setSelectedVersion, restoreVersion } = useVersionHistory({
    documentId,
    currentContent,
  });
  const { toast } = useToast();

  const handleRestore = (versionId: string) => {
    const content = restoreVersion(versionId);
    if (content) {
      onRestore(content);
      toast({
        title: 'Version restored',
        description: 'Document has been restored to selected version.',
      });
    }
  };

  const handleVersionClick = (version: DocumentVersion) => {
    setSelectedVersion(version);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Version History
          <Badge variant="secondary">{versions.length} versions</Badge>
        </CardTitle>
      </CardHeader>

      <CardContent>
        <ScrollArea className="h-[500px]">
          <div className="space-y-3">
            {versions.map((version, index) => (
              <div
                key={version.id}
                className={`p-4 rounded-lg border transition-all cursor-pointer ${
                  selectedVersion?.id === version.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                } ${index === versions.length - 1 ? 'border-green-500 bg-green-50' : ''}`}
                onClick={() => handleVersionClick(version)}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={version.userAvatar} />
                      <AvatarFallback>
                        {version.userName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-semibold">{version.userName}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(version.timestamp, { addSuffix: true })}
                      </p>
                    </div>
                  </div>

                  {index === versions.length - 1 && (
                    <Badge variant="default">Current</Badge>
                  )}
                </div>

                <p className="text-sm mb-2">{version.changeDescription}</p>

                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center gap-1 text-xs">
                    <Plus className="h-3 w-3 text-green-600" />
                    <span className="text-green-600">{version.changes.added}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs">
                    <Minus className="h-3 w-3 text-red-600" />
                    <span className="text-red-600">{version.changes.removed}</span>
                  </div>
                </div>

                {index !== versions.length - 1 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRestore(version.id);
                    }}
                  >
                    <RotateCcw className="h-3 w-3 mr-1" />
                    Restore this version
                  </Button>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>

        {selectedVersion && (
          <div className="mt-4 p-4 rounded-lg border bg-muted">
            <h4 className="text-sm font-semibold mb-2">Preview</h4>
            <ScrollArea className="h-[200px]">
              <pre className="text-xs font-mono whitespace-pre-wrap">
                {selectedVersion.content}
              </pre>
            </ScrollArea>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
