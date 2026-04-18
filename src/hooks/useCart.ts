// ─────────────────────────────────────────────────────────────
// hooks/useCart.ts
// ─────────────────────────────────────────────────────────────

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import * as cartApi from '@api/cart.api';
import { useAuthStore } from '@store/auth.store';
import { useCartStore } from '@store/cart.store';
import { queryKeys } from '@utils/queryKeys';
import type { AddToCartPayload, ApplyCouponPayload, Cart } from '@types';

// ── Fetch cart (server state) ─────────────────────────────────
export function useCart() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: queryKeys.cart.detail(),
    queryFn: cartApi.getCart,
    enabled: isAuthenticated,
    staleTime: 30 * 1000, // cart can change from other tabs
  });
}

// ── Add to cart ───────────────────────────────────────────────
export function useAddToCart() {
  const queryClient = useQueryClient();
  const { openCart } = useCartStore();

  return useMutation({
    mutationFn: (payload: AddToCartPayload) => cartApi.addToCart(payload),
    onSuccess: (updatedCart) => {
      queryClient.setQueryData<Cart>(queryKeys.cart.detail(), updatedCart);
      toast.success('Added to cart!');
      openCart();
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

// ── Update item quantity ──────────────────────────────────────
export function useUpdateCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      cartApi.updateCartItem(itemId, { quantity }),

    // Optimistic update — feels instant
    onMutate: async ({ itemId, quantity }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.cart.detail() });
      const previous = queryClient.getQueryData<Cart>(queryKeys.cart.detail());

      if (previous) {
        queryClient.setQueryData<Cart>(queryKeys.cart.detail(), (old) => {
          if (!old) return old;
          const items = old.items.map((item) =>
            item._id === itemId
              ? { ...item, quantity, subtotal: item.unitPrice * quantity }
              : item,
          );
          return {
            ...old,
            items,
            itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
            subtotal: items.reduce((sum, i) => sum + i.subtotal, 0),
          };
        });
      }

      return { previous };
    },

    onError: (_err, _vars, ctx) => {
      // Roll back on failure
      if (ctx?.previous) {
        queryClient.setQueryData(queryKeys.cart.detail(), ctx.previous);
      }
      toast.error('Could not update quantity.');
    },

    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.cart.detail() });
    },
  });
}

// ── Remove item ───────────────────────────────────────────────
export function useRemoveCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemId: string) => cartApi.removeCartItem(itemId),

    onMutate: async (itemId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.cart.detail() });
      const previous = queryClient.getQueryData<Cart>(queryKeys.cart.detail());

      if (previous) {
        queryClient.setQueryData<Cart>(queryKeys.cart.detail(), (old) => {
          if (!old) return old;
          const items = old.items.filter((i) => i._id !== itemId);
          return {
            ...old,
            items,
            itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
            subtotal: items.reduce((sum, i) => sum + i.subtotal, 0),
          };
        });
      }

      return { previous };
    },

    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(queryKeys.cart.detail(), ctx.previous);
      }
      toast.error('Could not remove item.');
    },

    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.cart.detail() });
    },
  });
}

// ── Clear cart ────────────────────────────────────────────────
export function useClearCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cartApi.clearCart,
    onSuccess: (emptyCart) => {
      queryClient.setQueryData(queryKeys.cart.detail(), emptyCart);
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

// ── Apply coupon ──────────────────────────────────────────────
export function useApplyCoupon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ApplyCouponPayload) => cartApi.applyCoupon(payload),
    onSuccess: (updatedCart) => {
      queryClient.setQueryData(queryKeys.cart.detail(), updatedCart);
      toast.success('Coupon applied!');
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

// ── Remove coupon ─────────────────────────────────────────────
export function useRemoveCoupon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cartApi.removeCoupon,
    onSuccess: (updatedCart) => {
      queryClient.setQueryData(queryKeys.cart.detail(), updatedCart);
      toast.success('Coupon removed.');
    },
    onError: (error: Error) => toast.error(error.message),
  });
}