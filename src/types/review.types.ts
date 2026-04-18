// ─────────────────────────────────────────────────────────────
// review.types.ts
// ─────────────────────────────────────────────────────────────

import type { MongoId, PaginationParams, SortParams, Timestamps } from './api.types';
import type { User } from './auth.types';

// ── Review model ──────────────────────────────────────────────
export interface Review extends Timestamps {
  _id: MongoId;
  product: MongoId;
  user: Pick<User, '_id' | 'name' | 'avatar'> | MongoId;
  order: MongoId;        // must have purchased to review
  rating: number;        // 1–5
  title: string;
  body: string;
  images?: string[];     // uploaded review images
  isVerifiedPurchase: boolean;
  helpfulCount: number;
  isApproved: boolean;
}

// ── Rating distribution (for the product detail histogram) ───
export interface RatingDistribution {
  1: number;
  2: number;
  3: number;
  4: number;
  5: number;
}

// ── Review stats (returned alongside product detail) ─────────
export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  distribution: RatingDistribution;
}

// ── Request payloads ─────────────────────────────────────────

export interface CreateReviewPayload {
  productId: MongoId;
  orderId: MongoId;
  rating: number;
  title: string;
  body: string;
}

export type UpdateReviewPayload = Partial<Pick<CreateReviewPayload, 'rating' | 'title' | 'body'>>;

export interface ReviewFilters extends PaginationParams, SortParams {
  rating?: number;
  verified?: boolean;
}