import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/shared/contexts/AuthContext'
import { CurrencyFormatProvider } from '@/shared/contexts/CurrencyFormatContext'
import App from './App.tsx'
import './index.css'

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 1,
            refetchOnWindowFocus: false,
        },
    },
})

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <BrowserRouter>
            <QueryClientProvider client={queryClient}>
                <AuthProvider>
                    <CurrencyFormatProvider>
                        <App />
                    </CurrencyFormatProvider>
                </AuthProvider>
            </QueryClientProvider>
        </BrowserRouter>
    </StrictMode>,
)
