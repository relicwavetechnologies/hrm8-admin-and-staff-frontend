import { useState, useEffect, useCallback } from 'react';
import type { ReportComment } from '@/shared/types/aiInterviewReport';
import {
  getCommentsByReport,
  saveReportComment,
  updateReportComment,
  deleteReportComment
} from '@/shared/lib/aiInterview/aiInterviewReportStorage';
import { v4 as uuidv4 } from 'uuid';

export function useReportComments(reportId: string) {
  const [comments, setComments] = useState<ReportComment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadComments();
  }, [reportId]);

  const loadComments = useCallback(() => {
    const data = getCommentsByReport(reportId);
    setComments(data);
    setLoading(false);
  }, [reportId]);

  const addComment = useCallback((
    content: string,
    userId: string,
    userName: string,
    mentions: string[] = [],
    parentId?: string
  ) => {
    const comment: ReportComment = {
      id: uuidv4(),
      reportId,
      userId,
      userName,
      content,
      mentions,
      parentId,
      replies: [],
      createdAt: new Date().toISOString(),
      isEdited: false
    };
    
    saveReportComment(comment);
    loadComments();
  }, [reportId, loadComments]);

  const editComment = useCallback((commentId: string, newContent: string) => {
    updateReportComment(commentId, newContent);
    loadComments();
  }, [loadComments]);

  const removeComment = useCallback((commentId: string) => {
    deleteReportComment(commentId);
    loadComments();
  }, [loadComments]);

  return {
    comments,
    loading,
    addComment,
    editComment,
    removeComment,
    refreshComments: loadComments
  };
}
