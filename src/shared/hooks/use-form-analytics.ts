import { useEffect, useRef } from 'react';
import { UseFormReturn, FieldValues, FieldPath } from 'react-hook-form';

interface FieldAnalytics {
  fieldName: string;
  errorCount: number;
  timeSpent: number; // in seconds
  interactionCount: number;
  lastError?: string;
  completionTime?: number;
}

interface FormAnalyticsData {
  formId: string;
  fields: Record<string, FieldAnalytics>;
  startTime: number;
  endTime?: number;
  totalTime?: number;
  submissionAttempts: number;
  successfulSubmission: boolean;
}

interface UseFormAnalyticsOptions<TFieldValues extends FieldValues> {
  form: UseFormReturn<TFieldValues>;
  formId: string;
  enabled?: boolean;
  onSubmitSuccess?: () => void;
  onSubmitError?: () => void;
}

/**
 * Tracks form interactions and analytics
 * Helps identify problematic fields and improve UX
 */
export function useFormAnalytics<TFieldValues extends FieldValues>({
  form,
  formId,
  enabled = true,
  onSubmitSuccess,
  onSubmitError,
}: UseFormAnalyticsOptions<TFieldValues>) {
  const analyticsRef = useRef<FormAnalyticsData>({
    formId,
    fields: {},
    startTime: Date.now(),
    submissionAttempts: 0,
    successfulSubmission: false,
  });

  const fieldTimersRef = useRef<Record<string, number>>({});
  const currentFocusRef = useRef<string | null>(null);

  // Track field focus
  const trackFieldFocus = (fieldName: string) => {
    if (!enabled) return;

    // Stop timer for previous field
    if (currentFocusRef.current) {
      const previousField = currentFocusRef.current;
      const startTime = fieldTimersRef.current[previousField];
      if (startTime) {
        const timeSpent = (Date.now() - startTime) / 1000;
        const analytics = analyticsRef.current.fields[previousField] || {
          fieldName: previousField,
          errorCount: 0,
          timeSpent: 0,
          interactionCount: 0,
        };
        analytics.timeSpent += timeSpent;
        analyticsRef.current.fields[previousField] = analytics;
      }
    }

    // Start timer for current field
    currentFocusRef.current = fieldName;
    fieldTimersRef.current[fieldName] = Date.now();

    // Track interaction
    const analytics = analyticsRef.current.fields[fieldName] || {
      fieldName,
      errorCount: 0,
      timeSpent: 0,
      interactionCount: 0,
    };
    analytics.interactionCount += 1;
    analyticsRef.current.fields[fieldName] = analytics;
  };

  // Track field errors
  const trackFieldError = (fieldName: string, errorMessage: string) => {
    if (!enabled) return;

    const analytics = analyticsRef.current.fields[fieldName] || {
      fieldName,
      errorCount: 0,
      timeSpent: 0,
      interactionCount: 0,
    };
    
    analytics.errorCount += 1;
    analytics.lastError = errorMessage;
    analyticsRef.current.fields[fieldName] = analytics;
  };

  // Track submission
  const trackSubmission = (success: boolean) => {
    if (!enabled) return;

    analyticsRef.current.submissionAttempts += 1;
    
    if (success) {
      analyticsRef.current.successfulSubmission = true;
      analyticsRef.current.endTime = Date.now();
      analyticsRef.current.totalTime = 
        (analyticsRef.current.endTime - analyticsRef.current.startTime) / 1000;
      
      onSubmitSuccess?.();
      
      // Log analytics (in production, send to analytics service)
      console.log('Form Analytics:', analyticsRef.current);
      
      // Identify problematic fields
      const problematicFields = Object.values(analyticsRef.current.fields)
        .filter((field) => field.errorCount > 2 || field.timeSpent > 30)
        .sort((a, b) => b.errorCount - a.errorCount);

      if (problematicFields.length > 0) {
        console.warn('Problematic fields detected:', problematicFields);
      }
    } else {
      onSubmitError?.();
    }
  };

  // Get analytics summary
  const getAnalyticsSummary = () => {
    return {
      ...analyticsRef.current,
      problematicFields: Object.values(analyticsRef.current.fields)
        .filter((field) => field.errorCount > 1 || field.timeSpent > 20)
        .sort((a, b) => b.errorCount - a.errorCount),
    };
  };

  // Monitor form errors
  useEffect(() => {
    if (!enabled) return;

    const errors = form.formState.errors;
    
    Object.keys(errors).forEach((fieldName) => {
      const error = errors[fieldName as keyof typeof errors];
      if (error?.message) {
        trackFieldError(fieldName, error.message as string);
      }
    });
  }, [form.formState.errors, enabled]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (currentFocusRef.current) {
        const fieldName = currentFocusRef.current;
        const startTime = fieldTimersRef.current[fieldName];
        if (startTime) {
          const timeSpent = (Date.now() - startTime) / 1000;
          const analytics = analyticsRef.current.fields[fieldName] || {
            fieldName,
            errorCount: 0,
            timeSpent: 0,
            interactionCount: 0,
          };
          analytics.timeSpent += timeSpent;
          analyticsRef.current.fields[fieldName] = analytics;
        }
      }

      // Send final analytics
      if (enabled && analyticsRef.current.submissionAttempts > 0) {
        console.log('Final Form Analytics:', getAnalyticsSummary());
      }
    };
  }, [enabled]);

  return {
    trackFieldFocus,
    trackFieldError,
    trackSubmission,
    getAnalyticsSummary,
    analytics: analyticsRef.current,
  };
}
