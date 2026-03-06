/**
 * Consultant Profile Completion Dialog
 * Prompts consultant to complete their profile on dashboard
 * Shows persistent reminder with 24-hour dismissal option
 */

import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useConsultantAuth } from '@/contexts/ConsultantAuthContext';
import { consultantService, ConsultantProfile } from '@/shared/lib/consultant/consultantService';
import { useToast } from '@/shared/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog';
import { AlertCircle } from 'lucide-react';

const PROFILE_REMINDER_KEY = 'hrm8_consultant_profile_reminder_dismissed_until';

interface ConsultantProfileCompletionDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ConsultantProfileCompletionDialog({
  open: controlledOpen,
  onOpenChange,
}: ConsultantProfileCompletionDialogProps) {
  const { consultant, isAuthenticated } = useConsultantAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const location = useLocation();
  const [localOpen, setLocalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Determine if dialog should be open
  const isOpen = controlledOpen !== undefined ? controlledOpen : localOpen;
  const setIsOpen = onOpenChange || setLocalOpen;

  // Helper functions
  const isProfileComplete = (profile: ConsultantProfile): boolean => {
    const hasBasicInfo =
      !!profile.first_name &&
      !!profile.last_name &&
      !!profile.phone &&
      !!profile.address &&
      !!profile.city &&
      !!profile.state_province &&
      !!profile.country;

    const hasLanguages =
      Array.isArray(profile.languages) &&
      profile.languages.length > 0 &&
      profile.languages.every((l: any) => l.language && l.proficiency);

    const hasIndustries =
      Array.isArray(profile.industry_expertise) &&
      profile.industry_expertise.length > 0 &&
      profile.industry_expertise.length <= 5;

    const hasPayment =
      !!profile.payment_method && Object.keys(profile.payment_method || {}).length > 0;

    const hasTax =
      !!profile.tax_information && Object.keys(profile.tax_information || {}).length > 0;

    return hasBasicInfo && hasLanguages && hasIndustries && hasPayment && hasTax;
  };

  const isDismissed = (): boolean => {
    const dismissedUntil = localStorage.getItem(PROFILE_REMINDER_KEY);
    if (!dismissedUntil) return false;
    return new Date().getTime() < parseInt(dismissedUntil, 10);
  };

  const dismissFor24Hours = (): void => {
    const dismissUntil = new Date().getTime() + 24 * 60 * 60 * 1000; // 24 hours
    localStorage.setItem(PROFILE_REMINDER_KEY, dismissUntil.toString());
  };

  // Check profile completion on mount and when location changes
  useEffect(() => {
    if (!isAuthenticated || !consultant) {
      setIsOpen(false);
      return;
    }

    // Don't show on profile page itself
    if (location.pathname === '/consultant/profile') {
      setIsOpen(false);
      return;
    }

    // Don't show if dismissed
    if (isDismissed()) {
      setIsOpen(false);
      return;
    }

    // Check profile completeness
    checkProfileCompletion();
  }, [isAuthenticated, consultant, location.pathname]);

  const checkProfileCompletion = async () => {
    try {
      setLoading(true);
      const response = await consultantService.getProfile();

      // Handle different response formats - backend returns consultant directly in data
      const profile = (response.data?.consultant || response.data) as ConsultantProfile;

      if (response.success && profile) {
        const complete = isProfileComplete(profile);

        if (!complete) {
          setIsOpen(true);
        } else {
          setIsOpen(false);
        }
      } else {
        setIsOpen(false);
      }
    } catch (error) {
      console.error('[ProfileDialog] Failed to check profile completion:', error);
      setIsOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const handleRemindLater = () => {
    dismissFor24Hours();
    setIsOpen(false);
    toast({
      title: 'Reminder set',
      description: 'We\'ll remind you in 24 hours',
    });
  };

  const handleCompleteProfile = () => {
    setIsOpen(false);
    navigate('/consultant/profile?onboarding=1');
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex gap-3 items-start">
            <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="space-y-1.5">
              <AlertDialogTitle>Complete your consultant profile</AlertDialogTitle>
              <AlertDialogDescription>
                To receive managed recruitment assignments and commissions, please finish setting up
                your profile.
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>

        <div className="bg-muted/50 p-4 rounded-lg space-y-2 text-sm">
          <p className="font-medium">Required information:</p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>Contact & address details</li>
            <li>Languages & proficiency levels</li>
            <li>Industry expertise (1-5 specializations)</li>
            <li>Payment method</li>
            <li>Tax information</li>
          </ul>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleRemindLater} disabled={loading}>
            Remind me later
          </AlertDialogCancel>
          <AlertDialogAction onClick={handleCompleteProfile} disabled={loading}>
            Complete profile now
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
