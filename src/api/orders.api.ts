// ─────────────────────────────────────────────────────────────
// api/orders.api.ts
// ─────────────────────────────────────────────────────────────

import client from './client';
import type { ApiResponse, PaginatedResponse } from '../types/api.types';
import type {
  CancelOrderPayload,
  CreateOrderPayload,
  Order,
  OrderFilters,
  OrderStatus,
  OrderSummary,
} from '../types/order.types';

const BASE = '/orders';

// ── POST /orders ──────────────────────────────────────────────
// Creates an order from the current cart contents.
// Returns the full order (including stripePaymentIntentId if applicable).
export async function createOrder(payload: CreateOrderPayload): Promise<Order> {
  const { data } = await client.post<ApiResponse<Order>>(BASE, payload);
  return data.data;
}

// ── GET /orders ───────────────────────────────────────────────
export async function getOrders(
  filters: OrderFilters = {},
): Promise<PaginatedResponse<OrderSummary>> {
  const { data } = await client.get<ApiResponse<PaginatedResponse<OrderSummary>>>(BASE, {
    params: filters,
  });
  return data.data;
}

// ── GET /orders/:id ───────────────────────────────────────────
export async function getOrderById(orderId: string): Promise<Order> {
  const { data } = await client.get<ApiResponse<Order>>(`${BASE}/${orderId}`);
  return data.data;
}

// ── GET /orders/number/:orderNumber ──────────────────────────
export async function getOrderByNumber(orderNumber: string): Promise<Order> {
  const { data } = await client.get<ApiResponse<Order>>(`${BASE}/number/${orderNumber}`);
  return data.data;
}

// ── POST /orders/:id/cancel ───────────────────────────────────
export async function cancelOrder(
  orderId: string,
  payload: CancelOrderPayload,
): Promise<Order> {
  const { data } = await client.post<ApiResponse<Order>>(
    `${BASE}/${orderId}/cancel`,
    payload,
  );
  return data.data;
}

// ── PATCH /orders/:id/status (admin) ─────────────────────────
export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
): Promise<Order> {
  const { data } = await client.patch<ApiResponse<Order>>(`${BASE}/${orderId}/status`, {
    status,
  });
  return data.data;
}