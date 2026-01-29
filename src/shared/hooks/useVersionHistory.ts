import { useState, useEffect, useCallback } from 'react';

export interface DocumentVersion {
  id: string;
  content: string;
  timestamp: Date;
  userId: string;
  userName: string;
  userAvatar?: string;
  changeDescription: string;
  changes: {
    added: number;
    removed: number;
  };
}

interface UseVersionHistoryOptions {
  documentId: string;
  currentContent: string;
}

export const useVersionHistory = ({
  documentId,
  currentContent,
}: UseVersionHistoryOptions) => {
  const [versions, setVersions] = useState<DocumentVersion[]>([
    {
      id: '1',
      content: '## Technical Interview Notes\n\n**Candidate:** Initial assessment',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      userId: 'user-1',
      userName: 'Sarah Johnson',
      changeDescription: 'Created document',
      changes: { added: 50, removed: 0 },
    },
    {
      id: '2',
      content: '## Technical Interview Notes\n\n**Candidate:** Technical skills assessment\n\n### Strengths:\n- Strong problem-solving',
      timestamp: new Date(Date.now() - 1000 * 60 * 60),
      userId: 'user-2',
      userName: 'Mike Chen',
      changeDescription: 'Added strengths section',
      changes: { added: 45, removed: 5 },
    },
    {
      id: '3',
      content: '## Technical Interview Notes\n\n**Candidate:** Technical skills assessment\n\n### Strengths:\n- Strong problem-solving abilities\n- Good communication skills',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      userId: 'user-3',
      userName: 'Emily Davis',
      changeDescription: 'Expanded strengths',
      changes: { added: 35, removed: 0 },
    },
  ]);

  const [selectedVersion, setSelectedVersion] = useState<DocumentVersion | null>(null);

  const saveVersion = useCallback((content: string, userId: string, userName: string, description: string) => {
    const lastVersion = versions[versions.length - 1];
    const added = Math.max(0, content.length - (lastVersion?.content.length || 0));
    const removed = Math.max(0, (lastVersion?.content.length || 0) - content.length);

    const newVersion: DocumentVersion = {
      id: Date.now().toString(),
      content,
      timestamp: new Date(),
      userId,
      userName,
      changeDescription: description,
      changes: { added, removed },
    };

    setVersions(prev => [...prev, newVersion]);
  }, [versions]);

  const restoreVersion = useCallback((versionId: string) => {
    const version = versions.find(v => v.id === versionId);
    return version?.content || '';
  }, [versions]);

  const compareVersions = useCallback((version1Id: string, version2Id: string) => {
    const v1 = versions.find(v => v.id === version1Id);
    const v2 = versions.find(v => v.id === version2Id);
    
    if (!v1 || !v2) return null;

    return {
      from: v1,
      to: v2,
      diff: {
        added: Math.max(0, v2.content.length - v1.content.length),
        removed: Math.max(0, v1.content.length - v2.content.length),
      },
    };
  }, [versions]);

  return {
    versions,
    selectedVersion,
    setSelectedVersion,
    saveVersion,
    restoreVersion,
    compareVersions,
  };
};
