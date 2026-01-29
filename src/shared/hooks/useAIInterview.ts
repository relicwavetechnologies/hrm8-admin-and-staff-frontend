import { useState, useEffect, useCallback } from 'react';
import type { AIInterviewSession, TranscriptEntry } from '@/shared/types/aiInterview';
import {
  getAIInterviewById,
  updateAIInterviewSession,
  saveAIInterviewSession
} from '@/shared/lib/aiInterview/aiInterviewStorage';
import { calculateInterviewScore } from '@/shared/lib/aiInterview/scoreCalculator';

export function useAIInterview(sessionId: string) {
  const [session, setSession] = useState<AIInterviewSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadSession();
  }, [sessionId]);

  const loadSession = useCallback(() => {
    const data = getAIInterviewById(sessionId);
    setSession(data || null);
    setLoading(false);
  }, [sessionId]);

  const startInterview = useCallback(() => {
    if (!session) return;
    
    const updates = {
      status: 'in-progress' as const,
      startedAt: new Date().toISOString()
    };
    
    updateAIInterviewSession(sessionId, updates);
    setSession({ ...session, ...updates });
  }, [session, sessionId]);

  const addTranscriptEntry = useCallback((entry: Omit<TranscriptEntry, 'id' | 'timestamp'>) => {
    if (!session) return;
    
    const newEntry: TranscriptEntry = {
      ...entry,
      id: `transcript-${Date.now()}`,
      timestamp: new Date().toISOString()
    };
    
    const updatedTranscript = [...session.transcript, newEntry];
    
    updateAIInterviewSession(sessionId, { transcript: updatedTranscript });
    setSession({ ...session, transcript: updatedTranscript });
  }, [session, sessionId]);

  const nextQuestion = useCallback(() => {
    if (!session) return;
    
    const newIndex = session.currentQuestionIndex + 1;
    updateAIInterviewSession(sessionId, { currentQuestionIndex: newIndex });
    setSession({ ...session, currentQuestionIndex: newIndex });
  }, [session, sessionId]);

  const completeInterview = useCallback(async () => {
    if (!session) return;
    
    setIsProcessing(true);
    
    // Simulate AI analysis delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const analysis = calculateInterviewScore(session.transcript);
    
    const updates = {
      status: 'completed' as const,
      completedAt: new Date().toISOString(),
      duration: session.startedAt 
        ? Math.floor((Date.now() - new Date(session.startedAt).getTime()) / 1000)
        : 0,
      analysis
    };
    
    updateAIInterviewSession(sessionId, updates);
    setSession({ ...session, ...updates });
    setIsProcessing(false);
  }, [session, sessionId]);

  const updateSession = useCallback((updates: Partial<AIInterviewSession>) => {
    if (!session) return;
    
    updateAIInterviewSession(sessionId, updates);
    setSession({ ...session, ...updates });
  }, [session, sessionId]);

  return {
    session,
    loading,
    isProcessing,
    startInterview,
    addTranscriptEntry,
    nextQuestion,
    completeInterview,
    updateSession,
    refreshSession: loadSession
  };
}
