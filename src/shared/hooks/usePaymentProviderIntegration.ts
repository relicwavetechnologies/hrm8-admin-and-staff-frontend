/**
 * Payment provider integration hook.
 * Handles billing-provider-required responses and payment onboarding prompts.
 */

import { useState, useCallback } from 'react';

export function usePaymentProviderIntegration() {
    const [showProviderPrompt, setShowProviderPrompt] = useState(false);
    const [providerRedirectPath, setProviderRedirectPath] = useState('/integrations?tab=payments');

    /**
     * Handle fetch response - checks for 402 and shows prompt if needed
     * Returns true if request should proceed, false if  blocked
     */
    const checkProviderRequired = useCallback((response: Response) => {
        if (response.status === 402) {
            response.json().then((data) => {
                setProviderRedirectPath(data.redirectTo || '/integrations?tab=payments');
                setShowProviderPrompt(true);
            }).catch(() => {
                setProviderRedirectPath('/integrations?tab=payments');
                setShowProviderPrompt(true);
            });
            return false;
        }
        return true;
    }, []);

    /**
     * Wrapper for fetch that automatically handles 402 errors
     */
    const fetchWithProviderCheck = useCallback(async (
        input: RequestInfo | URL,
        init?: RequestInit
    ): Promise<Response | null> => {
        const response = await fetch(input, init);

        if (!checkProviderRequired(response)) {
            return null;
        }

        return response;
    }, [checkProviderRequired]);

    return {
        showProviderPrompt,
        setShowProviderPrompt,
        providerRedirectPath,
        checkProviderRequired,
        fetchWithProviderCheck,
        /** @deprecated Use showProviderPrompt instead. */
        showPrompt: showProviderPrompt,
        /** @deprecated Use setShowProviderPrompt instead. */
        setShowPrompt: setShowProviderPrompt,
        /** @deprecated Use providerRedirectPath instead. */
        redirectPath: providerRedirectPath,
    };
}
