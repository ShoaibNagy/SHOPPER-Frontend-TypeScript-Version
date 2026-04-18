// ─────────────────────────────────────────────────────────────
// api/cart.api.ts
// ─────────────────────────────────────────────────────────────

import client from './client';
import type { ApiResponse } from '@/types/api.types';
import type {
  AddToCartPayload,
  ApplyCouponPayload,
  Cart,
  UpdateCartItemPayload,
} from '@/types/cart.types';

const BASE = '/cart';

// ── GET /cart ─────────────────────────────────────────────────
export async function getCart(): Promise<Cart> {
  const { data } = await client.get<ApiResponse<Cart>>(BASE);
  return data.data;
}

// ── POST /cart/items ──────────────────────────────────────────
export async function addToCart(payload: AddToCartPayload): Promise<Cart> {
  const { data } = await client.post<ApiResponse<Cart>>(`${BASE}/items`, payload);
  return data.data;
}

// ── PATCH /cart/items/:itemId ─────────────────────────────────
export async function updateCartItem(
  itemId: string,
  payload: UpdateCartItemPayload,
): Promise<Cart> {
  const { data } = await client.patch<ApiResponse<Cart>>(`${BASE}/items/${itemId}`, payload);
  return data.data;
}

// ── DELETE /cart/items/:itemId ────────────────────────────────
export async function removeCartItem(itemId: string): Promise<Cart> {
  const { data } = await client.delete<ApiResponse<Cart>>(`${BASE}/items/${itemId}`);
  return data.data;
}

// ── DELETE /cart ──────────────────────────────────────────────
export async function clearCart(): Promise<Cart> {
  const { data } = await client.delete<ApiResponse<Cart>>(BASE);
  return data.data;
}

// ── POST /cart/coupon ─────────────────────────────────────────
export async function applyCoupon(payload: ApplyCouponPayload): Promise<Cart> {
  const { data } = await client.post<ApiResponse<Cart>>(`${BASE}/coupon`, payload);
  return data.data;
}

// ── DELETE /cart/coupon ───────────────────────────────────────
export async function removeCoupon(): Promise<Cart> {
  const { data } = await client.delete<ApiResponse<Cart>>(`${BASE}/coupon`);
  return data.data;
}