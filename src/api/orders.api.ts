// api/orders.api.ts

import client from './client';
import type { ApiResponse, PaginatedResponse } from '../types/api.types';
import type {
  CreateOrderPayload,
  Order,
  OrderFilters,
  OrderStatus,
  OrderSummary,
} from '../types/order.types';

const BASE = '/orders';

export async function createOrder(payload: CreateOrderPayload): Promise<Order> {
  const { data } = await client.post<ApiResponse<Order>>(BASE, payload);
  return data.data;
}

export async function getOrders(filters: OrderFilters = {}): Promise<PaginatedResponse<OrderSummary>> {
  const { data } = await client.get<ApiResponse<PaginatedResponse<OrderSummary>>>(`${BASE}/my`, {
    params: filters,
  });
  return data.data;
}

export async function getOrderById(orderId: string): Promise<Order> {
  const { data } = await client.get<ApiResponse<Order>>(`${BASE}/${orderId}`);
  return data.data;
}

// Backend supports both DELETE and POST on /:id/cancel
export async function cancelOrder(orderId: string): Promise<Order> {
  const { data } = await client.post<ApiResponse<Order>>(`${BASE}/${orderId}/cancel`);
  return data.data;
}

export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order> {
  const { data } = await client.patch<ApiResponse<Order>>(`${BASE}/${orderId}/status`, { status });
  return data.data;
}