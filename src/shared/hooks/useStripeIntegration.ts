/**
 * useStripeIntegration Hook
 * Utility hook for handling Stripe integration requirements and 402 errors
 */

import { useState, useCallback } from 'react';

export function useStripeIntegration() {
    const [showPrompt, setShowPrompt] = useState(false);
    const [redirectPath, setRedirectPath] = useState('/integrations?tab=payments');

    /**
     * Handle fetch response - checks for 402 and shows prompt if needed
     * Returns true if request should proceed, false if  blocked
     */
    const checkStripeRequired = useCallback((response: Response) => {
        if (response.status === 402) {
            response.json().then((data) => {
                setRedirectPath(data.redirectTo || '/integrations?tab=payments');
                setShowPrompt(true);
            }).catch(() => {
                setRedirectPath('/integrations?tab=payments');
                setShowPrompt(true);
            });
            return false;
        }
        return true;
    }, []);

    /**
     * Wrapper for fetch that automatically handles 402 errors
     */
    const fetchWithStripeCheck = useCallback(async (
        input: RequestInfo | URL,
        init?: RequestInit
    ): Promise<Response | null> => {
        const response = await fetch(input, init);

        if (!checkStripeRequired(response)) {
            return null;
        }

        return response;
    }, [checkStripeRequired]);

    return {
        showPrompt,
        setShowPrompt,
        redirectPath,
        checkStripeRequired,
        fetchWithStripeCheck,
    };
}
