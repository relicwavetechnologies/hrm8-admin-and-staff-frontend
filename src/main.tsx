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
import './index.css'

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5,  // 5 min  - after this, background refetch fires on next visit
            gcTime: 1000 * 60 * 30,    // 30 min - data stays in memory even after stale, no spinner on back-navigation
            refetchOnWindowFocus: false,
            retry: 1,
        },
    },
})

createRoot(document.getElementById('root')!).render(
    <StrictMode>
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
    </StrictMode>,
)
