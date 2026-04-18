// ─────────────────────────────────────────────────────────────
// store/cart.store.ts
// Zustand store for CART UI STATE only.
//
// The actual cart data (items, totals) lives in TanStack Query
// cache (useCart hook). This store only tracks UI concerns:
//   • Whether the cart drawer is open
//   • Optimistic item count (for the navbar badge before the
//     query resolves)
// ─────────────────────────────────────────────────────────────

import { create } from 'zustand';

interface CartUIState {
  isDrawerOpen: boolean;
  // Optimistic count — updated immediately on add/remove actions,
  // then reconciled once the server query resolves.
  optimisticCount: number;
}

interface CartUIActions {
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  setOptimisticCount: (count: number) => void;
  incrementCount: (by?: number) => void;
  decrementCount: (by?: number) => void;
}

type CartStore = CartUIState & CartUIActions;

export const useCartStore = create<CartStore>()((set) => ({
  isDrawerOpen: false,
  optimisticCount: 0,

  openCart: () => set({ isDrawerOpen: true }),
  closeCart: () => set({ isDrawerOpen: false }),
  toggleCart: () => set((s) => ({ isDrawerOpen: !s.isDrawerOpen })),

  setOptimisticCount: (count) => set({ optimisticCount: count }),

  incrementCount: (by = 1) =>
    set((s) => ({ optimisticCount: s.optimisticCount + by })),

  decrementCount: (by = 1) =>
    set((s) => ({ optimisticCount: Math.max(0, s.optimisticCount - by) })),
}));