// ─────────────────────────────────────────────────────────────
// api/payments.api.ts
// ─────────────────────────────────────────────────────────────

import client from './client';
import type { ApiResponse } from '../types/api.types';

const BASE = '/payments';

// ── Stripe PaymentIntent ──────────────────────────────────────
export interface PaymentIntentResponse {
  clientSecret: string;         // passed to Stripe.js confirmPayment()
  paymentIntentId: string;
  amount: number;               // in smallest currency unit (e.g. cents)
  currency: string;             // e.g. "usd"
}

// ── POST /payments/create-intent ─────────────────────────────
// Called right before rendering the Stripe payment form.
// The orderId was returned by createOrder().
export async function createPaymentIntent(orderId: string): Promise<PaymentIntentResponse> {
  const { data } = await client.post<ApiResponse<PaymentIntentResponse>>(
    `${BASE}/create-intent`,
    { orderId },
  );
  return data.data;
}

// ── POST /payments/confirm ────────────────────────────────────
// Called after Stripe's client-side confirmPayment() succeeds,
// to let the backend mark the order as paid.
export async function confirmPayment(
  orderId: string,
  paymentIntentId: string,
): Promise<{ success: boolean; orderId: string }> {
  const { data } = await client.post<ApiResponse<{ success: boolean; orderId: string }>>(
    `${BASE}/confirm`,
    { orderId, paymentIntentId },
  );
  return data.data;
}

// ── GET /payments/:orderId/status ─────────────────────────────
export interface PaymentStatusResponse {
  orderId: string;
  paymentStatus: string;
  paidAt?: string;
}

export async function getPaymentStatus(orderId: string): Promise<PaymentStatusResponse> {
  const { data } = await client.get<ApiResponse<PaymentStatusResponse>>(
    `${BASE}/${orderId}/status`,
  );
  return data.data;
}

// ── POST /payments/:orderId/refund (admin) ────────────────────
export interface RefundPayload {
  amount?: number;    // partial refund amount in cents; omit for full refund
  reason?: string;
}

export interface RefundResponse {
  refundId: string;
  amount: number;
  status: string;
}

export async function refundPayment(
  orderId: string,
  payload: RefundPayload = {},
): Promise<RefundResponse> {
  const { data } = await client.post<ApiResponse<RefundResponse>>(
    `${BASE}/${orderId}/refund`,
    payload,
  );
  return data.data;
}