// ─────────────────────────────────────────────────────────────
// hooks/useOrders.ts
// ─────────────────────────────────────────────────────────────

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import * as ordersApi from '@api/orders.api';
import { queryKeys } from '@utils/queryKeys';
import type { CancelOrderPayload, CreateOrderPayload, OrderFilters } from '@types';

// ── Order list ────────────────────────────────────────────────
export function useOrders(filters: OrderFilters = {}) {
  return useQuery({
    queryKey: queryKeys.orders.list(filters),
    queryFn: () => ordersApi.getOrders(filters),
    staleTime: 2 * 60 * 1000,
    placeholderData: (prev) => prev,
  });
}

// ── Single order by id ────────────────────────────────────────
export function useOrder(orderId: string) {
  return useQuery({
    queryKey: queryKeys.orders.detail(orderId),
    queryFn: () => ordersApi.getOrderById(orderId),
    enabled: Boolean(orderId),
    staleTime: 60 * 1000,
  });
}

// ── Single order by order number ─────────────────────────────
// NOTE: Backend has no dedicated /orders/number/:orderNumber endpoint.
// We look up by id; callers that only have an orderNumber should
// fetch the order list and find the matching entry client-side.
export function useOrderByNumber(orderNumber: string) {
  return useQuery({
    queryKey: queryKeys.orders.byNumber(orderNumber),
    // Fallback: search the user's order list for the matching orderNumber.
    // Returns undefined when not found so the caller can show a loading state.
    queryFn: async () => {
      const result = await ordersApi.getOrders({});
      return result.items.find((o) => o.orderNumber === orderNumber) ?? null;
    },
    enabled: Boolean(orderNumber),
    staleTime: 60 * 1000,
  });
}

// ── Create order ──────────────────────────────────────────────
export function useCreateOrder() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (payload: CreateOrderPayload) => ordersApi.createOrder(payload),
    onSuccess: (order) => {
      queryClient.setQueryData(queryKeys.orders.detail(order._id), order);
      void queryClient.invalidateQueries({ queryKey: queryKeys.orders.lists() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.cart.all });

      if (order.paymentMethod === 'stripe') {
        void navigate(`/checkout/payment?orderId=${order._id}`);
      } else {
        void navigate(`/payment/success?orderId=${order._id}`);
      }
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

// ── Cancel order ──────────────────────────────────────────────
export function useCancelOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    // CancelOrderPayload still accepted in the call signature for forward-compat
    // but not sent to the backend (which doesn't require a body for cancellation).
    mutationFn: ({ orderId }: { orderId: string; payload?: CancelOrderPayload }) =>
      ordersApi.cancelOrder(orderId),
    onSuccess: (updatedOrder) => {
      queryClient.setQueryData(queryKeys.orders.detail(updatedOrder._id), updatedOrder);
      void queryClient.invalidateQueries({ queryKey: queryKeys.orders.lists() });
      toast.success('Order cancelled.');
    },
    onError: (error: Error) => toast.error(error.message),
  });
}