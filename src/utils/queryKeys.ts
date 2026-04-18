// ─────────────────────────────────────────────────────────────
// utils/queryKeys.ts
//
// Centralised TanStack Query key factory.
// Using factory functions (not plain strings) lets us:
//   • Invalidate entire domains: queryClient.invalidateQueries({ queryKey: queryKeys.products.all })
//   • Invalidate specifics:      queryClient.invalidateQueries({ queryKey: queryKeys.products.detail(slug) })
//   • Avoid magic string bugs across the app
// ─────────────────────────────────────────────────────────────

import type { OrderFilters, ProductFilters, ReviewFilters } from '@types';

export const queryKeys = {
  // ── Auth ───────────────────────────────────────────────────
  auth: {
    all: ['auth'] as const,
    me: () => ['auth', 'me'] as const,
  },

  // ── Products ───────────────────────────────────────────────
  products: {
    all: ['products'] as const,
    lists: () => ['products', 'list'] as const,
    list: (filters: ProductFilters) => ['products', 'list', filters] as const,
    featured: (limit?: number) => ['products', 'featured', limit] as const,
    newArrivals: (limit?: number) => ['products', 'new-arrivals', limit] as const,
    search: (query: string, filters: Omit<ProductFilters, 'search'>) =>
      ['products', 'search', query, filters] as const,
    details: () => ['products', 'detail'] as const,
    detail: (slug: string) => ['products', 'detail', slug] as const,
    related: (productId: string, limit?: number) =>
      ['products', 'related', productId, limit] as const,
    reviewStats: (productId: string) => ['products', 'review-stats', productId] as const,
  },

  // ── Categories ─────────────────────────────────────────────
  categories: {
    all: ['categories'] as const,
    list: () => ['categories', 'list'] as const,
    detail: (slug: string) => ['categories', 'detail', slug] as const,
  },

  // ── Cart ───────────────────────────────────────────────────
  cart: {
    all: ['cart'] as const,
    detail: () => ['cart', 'detail'] as const,
  },

  // ── Orders ─────────────────────────────────────────────────
  orders: {
    all: ['orders'] as const,
    lists: () => ['orders', 'list'] as const,
    list: (filters: OrderFilters) => ['orders', 'list', filters] as const,
    details: () => ['orders', 'detail'] as const,
    detail: (orderId: string) => ['orders', 'detail', orderId] as const,
    byNumber: (orderNumber: string) => ['orders', 'number', orderNumber] as const,
  },

  // ── Payments ───────────────────────────────────────────────
  payments: {
    all: ['payments'] as const,
    status: (orderId: string) => ['payments', 'status', orderId] as const,
  },

  // ── Reviews ────────────────────────────────────────────────
  reviews: {
    all: ['reviews'] as const,
    lists: () => ['reviews', 'list'] as const,
    byProduct: (productId: string, filters: ReviewFilters) =>
      ['reviews', 'product', productId, filters] as const,
    mine: (filters: ReviewFilters) => ['reviews', 'my', filters] as const,
    canReview: (productId: string) => ['reviews', 'can-review', productId] as const,
  },
} as const;