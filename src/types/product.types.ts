// ─────────────────────────────────────────────────────────────
// product.types.ts
// ─────────────────────────────────────────────────────────────

import type { MongoId, PaginationParams, SortParams, Timestamps } from './api.types';

// ── Category ──────────────────────────────────────────────────
export interface Category extends Timestamps {
  _id: MongoId;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parent?: MongoId;     // nested categories
  isActive: boolean;
}

// ── Product Image ─────────────────────────────────────────────
export interface ProductImage {
  url: string;
  alt?: string;
  isPrimary: boolean;
}

// ── Product Variant (size, color combinations) ────────────────
export interface ProductVariant {
  _id: MongoId;
  size?: string;        // e.g. "S", "M", "L", "XL"
  color?: string;       // e.g. "Black", "White"
  colorHex?: string;    // e.g. "#000000"
  sku: string;
  stock: number;
  price?: number;       // optional override of base price
}

// ── Product model ─────────────────────────────────────────────
export interface Product extends Timestamps {
  _id: MongoId;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  price: number;
  compareAtPrice?: number;   // original price for "sale" display
  images: ProductImage[];
  category: Category | MongoId;
  tags: string[];
  variants: ProductVariant[];
  totalStock: number;        // computed: sum of all variant stock
  isActive: boolean;
  isFeatured: boolean;
  isNew: boolean;
  rating: number;            // average, 0–5
  reviewCount: number;
  soldCount: number;
}

// ── Product summary (lightweight, for cards/lists) ────────────
export type ProductSummary = Pick<
  Product,
  | '_id'
  | 'name'
  | 'slug'
  | 'price'
  | 'compareAtPrice'
  | 'images'
  | 'category'
  | 'rating'
  | 'reviewCount'
  | 'isFeatured'
  | 'isNew'
  | 'totalStock'
>;

// ── Query params for GET /products ───────────────────────────
export interface ProductFilters extends PaginationParams, SortParams {
  category?: string;         // category slug or id
  minPrice?: number;
  maxPrice?: number;
  size?: string;
  color?: string;
  tags?: string;
  search?: string;
  isFeatured?: boolean;
  isNew?: boolean;
  inStock?: boolean;
}

// ── Admin payloads ────────────────────────────────────────────
export interface CreateProductPayload {
  name: string;
  description: string;
  shortDescription?: string;
  price: number;
  compareAtPrice?: number;
  category: MongoId;
  tags?: string[];
  variants: Omit<ProductVariant, '_id'>[];
  isFeatured?: boolean;
  isNew?: boolean;
}

export type UpdateProductPayload = Partial<CreateProductPayload>;