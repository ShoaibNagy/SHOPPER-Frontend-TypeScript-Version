// ─────────────────────────────────────────────────────────────
// cart.types.ts
// ─────────────────────────────────────────────────────────────

import type { MongoId, Timestamps } from './api.types';
import type { ProductSummary, ProductVariant } from './product.types';

// ── Cart item ─────────────────────────────────────────────────
export interface CartItem {
  _id: MongoId;
  product: ProductSummary | MongoId;
  variant: ProductVariant | MongoId;
  quantity: number;
  unitPrice: number;    // price at time of adding (snapshot)
  subtotal: number;     // unitPrice × quantity
}

// ── Cart model ────────────────────────────────────────────────
export interface Cart extends Timestamps {
  _id: MongoId;
  user: MongoId;
  items: CartItem[];
  itemCount: number;    // total quantity of all items
  subtotal: number;     // sum of item subtotals
  discount: number;     // coupon/promo deduction
  couponCode?: string;
  total: number;        // subtotal - discount
}

// ── Request payloads ─────────────────────────────────────────

export interface AddToCartPayload {
  productId: MongoId;
  variantId: MongoId;
  quantity: number;
}

export interface UpdateCartItemPayload {
  quantity: number;
}

export interface ApplyCouponPayload {
  couponCode: string;
}