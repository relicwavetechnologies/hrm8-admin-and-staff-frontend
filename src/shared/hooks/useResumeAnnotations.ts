import { useState, useCallback, useEffect } from 'react';
import { resumeAnnotationService } from '@/shared/services/resumeAnnotationService';
import { toast } from 'sonner';

export interface Annotation {
  id: string;
  user_id: string;
  user_name: string;
  user_color: string;
  type: 'highlight' | 'comment';
  text: string;
  comment?: string;
  position: {
    start: number;
    end: number;
  };
  timestamp: Date;
}

interface UseResumeAnnotationsOptions {
  documentId: string;
  currentUserId: string;
  currentUserName: string;
}

export const useResumeAnnotations = ({
  documentId,
  currentUserId,
  currentUserName,
}: UseResumeAnnotationsOptions) => {
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch annotations
  useEffect(() => {
    if (!documentId) return;

    const fetchAnnotations = async () => {
      setIsLoading(true);
      try {
        const data = await resumeAnnotationService.getAnnotations(documentId);
        // Map service response to internal Annotation type if needed
        const mappedAnnotations: Annotation[] = data.map(a => ({
          ...a,
          timestamp: new Date(a.created_at),
          // Ensure position is object if it comes as JSON string from backend (though Prisma Json type usually returns object)
          position: typeof a.position === 'string' ? JSON.parse(a.position) : a.position
        }));
        setAnnotations(mappedAnnotations);
      } catch (error) {
        console.error('Failed to fetch annotations:', error);
        toast.error('Failed to load annotations');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnnotations();
  }, [documentId]);

  const addAnnotation = useCallback(
    async (
      type: 'highlight' | 'comment',
      text: string,
      position: { start: number; end: number },
      comment?: string
    ) => {
      const userColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
      const userColor = userColors[Math.floor(Math.random() * userColors.length)];

      try {
        const newAnnotation = await resumeAnnotationService.createAnnotation({
          resume_id: documentId,
          user_id: currentUserId,
          user_name: currentUserName,
          user_color: userColor,
          type,
          text,
          comment,
          position
        });

        const mappedAnnotation: Annotation = {
          ...newAnnotation,
          timestamp: new Date(newAnnotation.created_at),
          position: typeof newAnnotation.position === 'string' ? JSON.parse(newAnnotation.position) : newAnnotation.position
        };

        setAnnotations((prev) => [...prev, mappedAnnotation]);
        return mappedAnnotation;
      } catch (error) {
        console.error('Failed to create annotation:', error);
        toast.error('Failed to create annotation');
        throw error;
      }
    },
    [documentId, currentUserId, currentUserName]
  );

  const removeAnnotation = useCallback(async (annotationId: string) => {
    try {
      await resumeAnnotationService.deleteAnnotation(documentId, annotationId, currentUserId);
      setAnnotations((prev) => prev.filter((a) => a.id !== annotationId));
    } catch (error) {
        console.error('Failed to delete annotation:', error);
        toast.error('Failed to delete annotation');
    }
  }, [documentId, currentUserId]);

  const updateAnnotation = useCallback((annotationId: string, comment: string) => {
    // TODO: Implement update endpoint if needed
    setAnnotations((prev) =>
      prev.map((a) => (a.id === annotationId ? { ...a, comment } : a))
    );
  }, []);

  const getAnnotationsByUser = useCallback(
    (userId: string) => {
      return annotations.filter((a) => a.user_id === userId);
    },
    [annotations]
  );

  return {
    annotations,
    isLoading,
    addAnnotation,
    removeAnnotation,
    updateAnnotation,
    getAnnotationsByUser,
  };
};
