// ─────────────────────────────────────────────────────────────
// main.tsx — Application entry point
// ─────────────────────────────────────────────────────────────

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './styles/main.scss';

// ── TanStack Query client config ──────────────────────────────
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data is considered fresh for 1 minute by default
      staleTime: 60 * 1000,
      // Retry failed requests once (not 3 times — reduces bad UX on real errors)
      retry: 1,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10_000),
      // Keep previous data visible while refetching (no loading flash)
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});

// ── Listen for forced logout (dispatched by Axios interceptor) ─
window.addEventListener('auth:logout', () => {
  queryClient.clear();
});

const root = document.getElementById('root');
if (!root) throw new Error('#root element not found in index.html');

createRoot(root).render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1a1a1a',
              color: '#f5f5f5',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '0.75rem',
              fontSize: '0.875rem',
            },
            success: {
              iconTheme: { primary: '#f97316', secondary: '#1a1a1a' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#1a1a1a' },
            },
          }}
        />
        {process.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>,
);