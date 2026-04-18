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
export function useOrderByNumber(orderNumber: string) {
  return useQuery({
    queryKey: queryKeys.orders.byNumber(orderNumber),
    queryFn: () => ordersApi.getOrderByNumber(orderNumber),
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
      // Pre-populate the cache so the success page loads instantly
      queryClient.setQueryData(queryKeys.orders.detail(order._id), order);
      // Invalidate the list so order history reflects the new order
      void queryClient.invalidateQueries({ queryKey: queryKeys.orders.lists() });
      // Clear the cart cache — it's now empty
      void queryClient.invalidateQueries({ queryKey: queryKeys.cart.all });

      if (order.paymentMethod === 'stripe') {
        // Navigate to payment with orderId to create the PaymentIntent
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
    mutationFn: ({ orderId, payload }: { orderId: string; payload: CancelOrderPayload }) =>
      ordersApi.cancelOrder(orderId, payload),
    onSuccess: (updatedOrder) => {
      queryClient.setQueryData(queryKeys.orders.detail(updatedOrder._id), updatedOrder);
      void queryClient.invalidateQueries({ queryKey: queryKeys.orders.lists() });
      toast.success('Order cancelled.');
    },
    onError: (error: Error) => toast.error(error.message),
  });
}