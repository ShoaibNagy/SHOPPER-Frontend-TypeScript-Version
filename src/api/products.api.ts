// ─────────────────────────────────────────────────────────────
// api/products.api.ts
// ─────────────────────────────────────────────────────────────

import client from './client';
import type { ApiResponse, PaginatedResponse } from '../types/api.types';
import type {
  Category,
  CreateProductPayload,
  Product,
  ProductFilters,
  ProductSummary,
  UpdateProductPayload,
} from '../types/product.types';
import type { ReviewStats } from '../types/review.types';

const BASE = '/products';
const CATEGORIES = '/categories';

// ─────────────────────────────────────────────────────────────
// Products
// ─────────────────────────────────────────────────────────────

// ── GET /products ─────────────────────────────────────────────
export async function getProducts(
  filters: ProductFilters = {},
): Promise<PaginatedResponse<ProductSummary>> {
  const { data } = await client.get<ApiResponse<PaginatedResponse<ProductSummary>>>(BASE, {
    params: filters,
  });
  return data.data;
}

// ── GET /products/featured ────────────────────────────────────
export async function getFeaturedProducts(limit = 8): Promise<ProductSummary[]> {
  const { data } = await client.get<ApiResponse<ProductSummary[]>>(`${BASE}/featured`, {
    params: { limit },
  });
  return data.data;
}

// ── GET /products/new-arrivals ────────────────────────────────
export async function getNewArrivals(limit = 8): Promise<ProductSummary[]> {
  const { data } = await client.get<ApiResponse<ProductSummary[]>>(`${BASE}/new-arrivals`, {
    params: { limit },
  });
  return data.data;
}

// ── GET /products/search?q= ───────────────────────────────────
export async function searchProducts(
  query: string,
  filters: Omit<ProductFilters, 'search'> = {},
): Promise<PaginatedResponse<ProductSummary>> {
  const { data } = await client.get<ApiResponse<PaginatedResponse<ProductSummary>>>(
    `${BASE}/search`,
    { params: { q: query, ...filters } },
  );
  return data.data;
}

// ── GET /products/:slug ───────────────────────────────────────
export async function getProductBySlug(slug: string): Promise<Product> {
  const { data } = await client.get<ApiResponse<Product>>(`${BASE}/${slug}`);
  return data.data;
}

// ── GET /products/:id/review-stats ───────────────────────────
export async function getProductReviewStats(productId: string): Promise<ReviewStats> {
  const { data } = await client.get<ApiResponse<ReviewStats>>(
    `${BASE}/${productId}/review-stats`,
  );
  return data.data;
}

// ── GET /products/:id/related ─────────────────────────────────
export async function getRelatedProducts(
  productId: string,
  limit = 4,
): Promise<ProductSummary[]> {
  const { data } = await client.get<ApiResponse<ProductSummary[]>>(
    `${BASE}/${productId}/related`,
    { params: { limit } },
  );
  return data.data;
}

// ─────────────────────────────────────────────────────────────
// Categories
// ─────────────────────────────────────────────────────────────

// ── GET /categories ───────────────────────────────────────────
export async function getCategories(): Promise<Category[]> {
  const { data } = await client.get<ApiResponse<Category[]>>(CATEGORIES);
  return data.data;
}

// ── GET /categories/:slug ─────────────────────────────────────
export async function getCategoryBySlug(slug: string): Promise<Category> {
  const { data } = await client.get<ApiResponse<Category>>(`${CATEGORIES}/${slug}`);
  return data.data;
}

// ─────────────────────────────────────────────────────────────
// Admin-only endpoints
// ─────────────────────────────────────────────────────────────

// ── POST /products (admin) ────────────────────────────────────
export async function createProduct(payload: CreateProductPayload): Promise<Product> {
  const { data } = await client.post<ApiResponse<Product>>(BASE, payload);
  return data.data;
}

// ── POST /products/:id/images (admin, multipart) ──────────────
export async function uploadProductImages(
  productId: string,
  files: File[],
): Promise<{ images: Product['images'] }> {
  const form = new FormData();
  files.forEach((file) => form.append('images', file));

  const { data } = await client.post<ApiResponse<{ images: Product['images'] }>>(
    `${BASE}/${productId}/images`,
    form,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
  return data.data;
}

// ── PATCH /products/:id (admin) ───────────────────────────────
export async function updateProduct(
  productId: string,
  payload: UpdateProductPayload,
): Promise<Product> {
  const { data } = await client.patch<ApiResponse<Product>>(`${BASE}/${productId}`, payload);
  return data.data;
}

// ── DELETE /products/:id (admin) ──────────────────────────────
export async function deleteProduct(productId: string): Promise<void> {
  await client.delete(`${BASE}/${productId}`);
}