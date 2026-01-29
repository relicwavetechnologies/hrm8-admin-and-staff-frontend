import { useEffect, useCallback } from 'react';
import { UseFormReturn } from 'react-hook-form';

const DRAFT_KEY_PREFIX = 'candidate_form_draft_';

export function useCandidateFormDraft(
  candidateId: string | undefined,
  form: UseFormReturn<any>
) {
  const draftKey = `${DRAFT_KEY_PREFIX}${candidateId || 'new'}`;

  // Load draft on mount
  useEffect(() => {
    if (!candidateId) {
      const draft = localStorage.getItem(draftKey);
      if (draft) {
        try {
          const parsedDraft = JSON.parse(draft);
          form.reset(parsedDraft);
        } catch (error) {
          console.error('Failed to load draft:', error);
        }
      }
    }
  }, [candidateId, draftKey, form]);

  // Auto-save draft every 30 seconds
  useEffect(() => {
    if (candidateId) return; // Don't auto-save when editing

    const interval = setInterval(() => {
      const values = form.getValues();
      localStorage.setItem(draftKey, JSON.stringify(values));
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [candidateId, draftKey, form]);

  const clearDraft = useCallback(() => {
    localStorage.removeItem(draftKey);
  }, [draftKey]);

  const saveDraft = useCallback(() => {
    const values = form.getValues();
    localStorage.setItem(draftKey, JSON.stringify(values));
  }, [draftKey, form]);

  return { clearDraft, saveDraft };
}