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

// ── PATCH /cart/items (body: { productId, quantity }) ────────
export async function updateCartItem(
  productId: string,
  payload: UpdateCartItemPayload,
): Promise<Cart> {
  const { data } = await client.patch<ApiResponse<Cart>>(`${BASE}/items`, {
    productId,
    ...payload,
  });
  return data.data;
}

// ── DELETE /cart/items (body: { productId }) ──────────────────
export async function removeCartItem(productId: string): Promise<Cart> {
  const { data } = await client.delete<ApiResponse<Cart>>(`${BASE}/items`, {
    data: { productId },
  });
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