// ─────────────────────────────────────────────────────────────
// order.types.ts
// ─────────────────────────────────────────────────────────────

import type { MongoId, PaginationParams, SortParams, Timestamps } from './api.types';
import type { UserAddress } from './auth.types';
import type { ProductSummary, ProductVariant } from './product.types';

// ── Order status pipeline ─────────────────────────────────────
export type OrderStatus =
  | 'pending'           // just placed, awaiting payment
  | 'payment_pending'   // payment initiated but not confirmed
  | 'confirmed'         // payment confirmed
  | 'processing'        // being packed
  | 'shipped'           // handed to courier
  | 'out_for_delivery'  // with last-mile carrier
  | 'delivered'         // received by customer
  | 'cancelled'         // cancelled before shipment
  | 'return_requested'  // customer requested return
  | 'returned'          // return completed
  | 'refunded';         // money sent back

// ── Payment method ────────────────────────────────────────────
export type PaymentMethod = 'stripe' | 'cash_on_delivery';

// ── Payment status ────────────────────────────────────────────
export type PaymentStatus = 'unpaid' | 'paid' | 'failed' | 'refunded' | 'partially_refunded';

// ── Order item (snapshot of product at purchase time) ────────
export interface OrderItem {
  _id: MongoId;
  product: ProductSummary | MongoId;
  variant: Pick<ProductVariant, '_id' | 'size' | 'color' | 'sku'> | MongoId;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  productName: string;   // snapshot in case product is deleted
  productImage: string;  // snapshot
}

// ── Tracking event ────────────────────────────────────────────
export interface TrackingEvent {
  status: string;
  description: string;
  location?: string;
  timestamp: string;
}

// ── Shipping info ─────────────────────────────────────────────
export interface ShippingInfo {
  address: UserAddress;
  fullName: string;
  phone: string;
  carrier?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  estimatedDelivery?: string;
  events: TrackingEvent[];
}

// ── Order model ───────────────────────────────────────────────
export interface Order extends Timestamps {
  _id: MongoId;
  orderNumber: string;   // human-readable, e.g. "ORD-20240001"
  user: MongoId;
  items: OrderItem[];
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  stripePaymentIntentId?: string;
  shipping: ShippingInfo;
  subtotal: number;
  shippingFee: number;
  discount: number;
  couponCode?: string;
  total: number;
  notes?: string;
  cancelReason?: string;
}

// ── Order summary (for listing page) ─────────────────────────
export type OrderSummary = Pick<
  Order,
  | '_id'
  | 'orderNumber'
  | 'status'
  | 'paymentStatus'
  | 'paymentMethod'
  | 'total'
  | 'items'
  | 'createdAt'
>;

// ── Request payloads ─────────────────────────────────────────

export interface CreateOrderPayload {
  paymentMethod: PaymentMethod;
  shippingAddress: UserAddress;
  fullName: string;
  phone: string;
  notes?: string;
  couponCode?: string;
}

export interface OrderFilters extends PaginationParams, SortParams {
  status?: OrderStatus;
}

export interface CancelOrderPayload {
  reason: string;
}