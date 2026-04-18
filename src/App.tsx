// ─────────────────────────────────────────────────────────────
// App.tsx
// Root component. Responsibilities:
//   1. Mount the router.
//   2. Listen for the global auth:logout event dispatched by
//      the Axios interceptor and clear Zustand auth state.
//   3. Sync cart item count from TanStack Query → Zustand
//      optimistic count so the navbar badge is always accurate.
// ─────────────────────────────────────────────────────────────

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import AppRouter from '@/router';
import { useAuthStore } from '@store/auth.store';
import { useCartStore } from '@store/cart.store';
import { tokenStorage } from '@api/client';
import { queryKeys } from '@utils/queryKeys';
import type { Cart } from '@types';

export default function App() {
  const { clearAuth } = useAuthStore();
  const { setOptimisticCount } = useCartStore();
  const queryClient = useQueryClient();

  // ── Handle forced logout from Axios interceptor ─────────────
  useEffect(() => {
    function handleLogout() {
      tokenStorage.clear();
      clearAuth();
      queryClient.clear();
    }

    window.addEventListener('auth:logout', handleLogout);
    return () => window.removeEventListener('auth:logout', handleLogout);
  }, [clearAuth, queryClient]);

  // ── Sync cart count from query cache → store ─────────────────
  // Whenever the cart query data changes (add/remove/update),
  // keep the Zustand optimistic count in sync so the navbar
  // badge is driven from a single source of truth.
  useEffect(() => {
    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if (
        event.type === 'updated' &&
        JSON.stringify(event.query.queryKey) ===
          JSON.stringify(queryKeys.cart.detail())
      ) {
        const cart = queryClient.getQueryData<Cart>(queryKeys.cart.detail());
        setOptimisticCount(cart?.itemCount ?? 0);
      }
    });

    return unsubscribe;
  }, [queryClient, setOptimisticCount]);

  return <AppRouter />;
}