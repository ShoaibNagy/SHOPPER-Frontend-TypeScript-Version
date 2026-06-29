// api/products.api.ts

import client from './client';
import type { ApiResponse, PaginatedResponse } from '../types/api.types';
import type {
  CreateProductPayload,
  Product,
  ProductFilters,
  ProductSummary,
  UpdateProductPayload,
} from '../types/product.types';
import type { ReviewStats } from '../types/review.types';

const BASE = '/products';

// ── Products ──────────────────────────────────────────────────

export async function getProducts(filters: ProductFilters = {}): Promise<PaginatedResponse<ProductSummary>> {
  const { data } = await client.get<ApiResponse<PaginatedResponse<ProductSummary>>>(BASE, { params: filters });
  return data.data;
}

// FIX 7: was '/products/featured' — now matches the new backend route
export async function getFeaturedProducts(limit = 8): Promise<ProductSummary[]> {
  const { data } = await client.get<ApiResponse<ProductSummary[]>>(`${BASE}/featured`, { params: { limit } });
  return data.data;
}

// FIX 8: was '/products/new-arrivals' — backend now has this route
export async function getNewArrivals(limit = 8): Promise<ProductSummary[]> {
  const { data } = await client.get<ApiResponse<ProductSummary[]>>(`${BASE}/new-arrivals`, { params: { limit } });
  return data.data;
}

// FIX 9: was '/products/search?q=' — backend now has this route
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

// FIX 10: was '/:slug' — backend GET /:idOrSlug accepts both ObjectId and slug
export async function getProductBySlug(slug: string): Promise<Product> {
  const { data } = await client.get<ApiResponse<Product>>(`${BASE}/${slug}`);
  return data.data;
}

// FIX 11: was '/:id/review-stats' — backend now has this route
export async function getProductReviewStats(productId: string): Promise<ReviewStats> {
  const { data } = await client.get<ApiResponse<ReviewStats>>(`${BASE}/${productId}/review-stats`);
  return data.data;
}

export async function getRelatedProducts(productId: string, limit = 4): Promise<ProductSummary[]> {
  const { data } = await client.get<ApiResponse<ProductSummary[]>>(
    `${BASE}/${productId}/related`,
    { params: { limit } },
  );
  return data.data;
}

// ── Admin-only ────────────────────────────────────────────────

export async function createProduct(payload: CreateProductPayload): Promise<Product> {
  const { data } = await client.post<ApiResponse<Product>>(BASE, payload);
  return data.data;
}

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

export async function updateProduct(productId: string, payload: UpdateProductPayload): Promise<Product> {
  const { data } = await client.patch<ApiResponse<Product>>(`${BASE}/${productId}`, payload);
  return data.data;
}

export async function deleteProduct(productId: string): Promise<void> {
  await client.delete(`${BASE}/${productId}`);
}

// ── Categories ────────────────────────────────────────────────
// The backend doesn't have a dedicated /categories resource.
// Categories are derived from the distinct 'category' values on products.
// We call GET /products with a large limit and extract unique categories.

export interface SimpleCategory {
  _id: string;
  slug: string;
  name: string;
  image?: string;
}

export async function getCategories(): Promise<SimpleCategory[]> {
  // Backend ProductCategory enum: men | women | kids
  // Return them as a static list (matches the backend enum)
  return [
    { _id: 'men',   slug: 'men',   name: 'Men'   },
    { _id: 'women', slug: 'women', name: 'Women' },
    { _id: 'kids',  slug: 'kids',  name: 'Kids'  },
  ];
}

export async function getCategoryBySlug(slug: string): Promise<SimpleCategory> {
  const all = await getCategories();
  const found = all.find((c) => c.slug === slug);
  if (!found) throw new Error(`Category '${slug}' not found.`);
  return found;
}