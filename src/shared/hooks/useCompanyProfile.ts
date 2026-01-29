import { useCallback, useEffect, useState } from 'react';
import {
  CompanyProfileProgressResponse,
  CompanyProfileSectionKey,
} from '@/shared/types/companyProfile';
import { companyProfileService } from '@/shared/lib/companyProfileService';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/shared/hooks/use-toast';

interface UseCompanyProfileReturn {
  data: CompanyProfileProgressResponse | null;
  isLoading: boolean;
  savingSection: CompanyProfileSectionKey | null;
  isCompleting: boolean;
  refresh: () => Promise<void>;
  saveSection: (
    section: CompanyProfileSectionKey,
    payload: Record<string, unknown>,
    options?: { markComplete?: boolean; successMessage?: string }
  ) => Promise<void>;
  completeProfile: () => Promise<void>;
}

export function useCompanyProfile(): UseCompanyProfileReturn {
  const { user, refreshProfileSummary } = useAuth();
  const { toast } = useToast();
  const [data, setData] = useState<CompanyProfileProgressResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [savingSection, setSavingSection] = useState<CompanyProfileSectionKey | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);

  const fetchProfile = useCallback(async () => {
    if (!user?.companyId) {
      setData(null);
      return;
    }
    setIsLoading(true);
    const response = await companyProfileService.getProfile(user.companyId);
    if (response.success && response.data) {
      setData(response.data);
    } else if (response.error) {
      toast({
        title: 'Unable to load company profile',
        description: response.error,
        variant: 'destructive',
      });
    }
    setIsLoading(false);
  }, [toast, user?.companyId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const saveSection = async (
    section: CompanyProfileSectionKey,
    payload: Record<string, unknown>,
    options?: { markComplete?: boolean; successMessage?: string }
  ) => {
    if (!user?.companyId) return;
    setSavingSection(section);
    const response = await companyProfileService.saveSection(
      user.companyId,
      section,
      payload,
      options?.markComplete
    );

    if (response.success && response.data) {
      setData((prev) =>
        prev
          ? {
              ...prev,
              profile: response.data.profile,
            }
          : {
              profile: response.data.profile,
              requiredSections: [],
              optionalSections: [],
            }
      );
      await refreshProfileSummary();
      toast({
        title: 'Profile updated',
        description: options?.successMessage || 'Section saved successfully.',
      });
    } else if (response.error) {
      toast({
        title: 'Unable to save section',
        description: response.error,
        variant: 'destructive',
      });
    }

    setSavingSection(null);
  };

  const completeProfile = async () => {
    if (!user?.companyId) return;
    setIsCompleting(true);
    const response = await companyProfileService.completeProfile(user.companyId);
    if (response.success && response.data) {
      setData((prev) =>
        prev
          ? {
              ...prev,
              profile: response.data.profile,
            }
          : {
              profile: response.data.profile,
              requiredSections: [],
              optionalSections: [],
            }
      );
      await refreshProfileSummary();
      toast({
        title: 'Company profile completed',
        description: response.data.message || 'You can now post jobs and invite your team.',
      });
    } else if (response.error) {
      toast({
        title: 'Unable to complete profile',
        description: response.error,
        variant: 'destructive',
      });
    }
    setIsCompleting(false);
  };

  return {
    data,
    isLoading,
    savingSection,
    isCompleting,
    refresh: fetchProfile,
    saveSection,
    completeProfile,
  };
}


