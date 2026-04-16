window.addEventListener('unhandledrejection', (event) => {
  console.error('[Unhandled Promise Rejection]', event.reason);
});

// Suppress chrome-extension://invalid/ fetch errors from React DevTools / extension probes
const _fetch = window.fetch
window.fetch = function (input: RequestInfo | URL, init?: RequestInit) {
  const url = typeof input === 'string' ? input : input instanceof Request ? input.url : String(input)
  if (url.startsWith('chrome-extension://invalid')) {
    return Promise.resolve(new Response('', { status: 404 }))
  }
  return _fetch.call(this, input as RequestInfo, init)
}

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/shared/contexts/AuthContext'
import { CurrencyFormatProvider } from '@/shared/contexts/CurrencyFormatContext'
import { ThemeProvider } from 'next-themes'
import App from './App.tsx'
import { ErrorBoundary } from '@/shared/components/ErrorBoundary'
import './index.css'

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5,
            gcTime: 1000 * 60 * 30,
            refetchOnWindowFocus: false,
            retry: (failureCount, error: any) => {
                if (error?.status >= 400 && error?.status < 500) return false;
                return failureCount < 1;
            },
        },
        mutations: {
            onError: (error: any) => {
                const message = error?.message || 'Something went wrong. Please try again.';
                import('sonner').then(({ toast }) => toast.error(message));
            },
        },
    },
})

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <ErrorBoundary>
            <BrowserRouter>
                <QueryClientProvider client={queryClient}>
                    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                        <AuthProvider>
                            <CurrencyFormatProvider>
                                <App />
                            </CurrencyFormatProvider>
                        </AuthProvider>
                    </ThemeProvider>
                </QueryClientProvider>
            </BrowserRouter>
        </ErrorBoundary>
    </StrictMode>,
)
