// ─────────────────────────────────────────────────────────────
// api/reviews.api.ts
// ─────────────────────────────────────────────────────────────

import client from './client';
import type { ApiResponse, PaginatedResponse } from '../types/api.types';
import type {
  CreateReviewPayload,
  Review,
  ReviewFilters,
  UpdateReviewPayload,
} from '../types/review.types';

const BASE = '/reviews';

// ── GET /reviews?productId= ───────────────────────────────────
export async function getProductReviews(
  productId: string,
  filters: ReviewFilters = {},
): Promise<PaginatedResponse<Review>> {
  const { data } = await client.get<ApiResponse<PaginatedResponse<Review>>>(BASE, {
    params: { productId, ...filters },
  });
  return data.data;
}

// ── GET /reviews/my ───────────────────────────────────────────
// Returns the authenticated user's own reviews.
export async function getMyReviews(
  filters: ReviewFilters = {},
): Promise<PaginatedResponse<Review>> {
  const { data } = await client.get<ApiResponse<PaginatedResponse<Review>>>(`${BASE}/my`, {
    params: filters,
  });
  return data.data;
}

// ── GET /reviews/can-review/:productId ───────────────────────
// Returns whether the current user has a delivered order
// containing this product that they haven't reviewed yet.
export async function canReviewProduct(
  productId: string,
): Promise<{ canReview: boolean; orderId?: string }> {
  const { data } = await client.get<ApiResponse<{ canReview: boolean; orderId?: string }>>(
    `${BASE}/can-review/${productId}`,
  );
  return data.data;
}

// ── POST /reviews ─────────────────────────────────────────────
export async function createReview(payload: CreateReviewPayload): Promise<Review> {
  const { data } = await client.post<ApiResponse<Review>>(BASE, payload);
  return data.data;
}

// ── POST /reviews/:id/images (multipart) ─────────────────────
export async function uploadReviewImages(
  reviewId: string,
  files: File[],
): Promise<{ images: string[] }> {
  const form = new FormData();
  files.forEach((file) => form.append('images', file));

  const { data } = await client.post<ApiResponse<{ images: string[] }>>(
    `${BASE}/${reviewId}/images`,
    form,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
  return data.data;
}

// ── PATCH /reviews/:id ────────────────────────────────────────
export async function updateReview(
  reviewId: string,
  payload: UpdateReviewPayload,
): Promise<Review> {
  const { data } = await client.patch<ApiResponse<Review>>(`${BASE}/${reviewId}`, payload);
  return data.data;
}

// ── DELETE /reviews/:id ───────────────────────────────────────
export async function deleteReview(reviewId: string): Promise<void> {
  await client.delete(`${BASE}/${reviewId}`);
}

// ── POST /reviews/:id/helpful ─────────────────────────────────
// Toggles "mark as helpful" for the authenticated user.
export async function toggleHelpful(
  reviewId: string,
): Promise<{ helpfulCount: number; marked: boolean }> {
  const { data } = await client.post<
    ApiResponse<{ helpfulCount: number; marked: boolean }>
  >(`${BASE}/${reviewId}/helpful`);
  return data.data;
}