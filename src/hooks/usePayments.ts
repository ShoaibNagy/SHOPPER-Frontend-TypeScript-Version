// ─────────────────────────────────────────────────────────────
// hooks/usePayments.ts
// ─────────────────────────────────────────────────────────────

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import * as paymentsApi from '@api/payments.api';
import type { RefundPayload } from '@api/payments.api';
import { queryKeys } from '@utils/queryKeys';

// ── Get payment status ────────────────────────────────────────
export function usePaymentStatus(orderId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.payments.status(orderId),
    queryFn: () => paymentsApi.getPaymentStatus(orderId),
    enabled: Boolean(orderId) && enabled,
    staleTime: 30 * 1000,
    // Poll every 3 seconds while payment is pending
    refetchInterval: (query) => {
      const status = query.state.data?.paymentStatus;
      return status === 'unpaid' ? 3_000 : false;
    },
  });
}

// ── Create Stripe PaymentIntent ───────────────────────────────
// Returns { clientSecret } which is passed to Stripe.js
export function useCreatePaymentIntent() {
  return useMutation({
    mutationFn: (orderId: string) => paymentsApi.createPaymentIntent(orderId),
    onError: (error: Error) => toast.error(error.message),
  });
}

// ── Confirm payment (after Stripe client-side success) ────────
export function useConfirmPayment() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: ({
      orderId,
      paymentIntentId,
    }: {
      orderId: string;
      paymentIntentId: string;
    }) => paymentsApi.confirmPayment(orderId, paymentIntentId),

    onSuccess: ({ orderId }) => {
      // Invalidate both the order and payment status so they reload fresh
      void queryClient.invalidateQueries({ queryKey: queryKeys.orders.detail(orderId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.payments.status(orderId) });
      void navigate(`/payment/success?orderId=${orderId}`);
    },

    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// ── Admin: refund payment ─────────────────────────────────────
export function useRefundPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, payload }: { orderId: string; payload: RefundPayload }) =>
      paymentsApi.refundPayment(orderId, payload),
    onSuccess: (_data, { orderId }) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.orders.detail(orderId) });
      toast.success('Refund processed.');
    },
    onError: (error: Error) => toast.error(error.message),
  });
}