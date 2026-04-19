// ─────────────────────────────────────────────────────────────
// hooks/useReviews.ts
// ─────────────────────────────────────────────────────────────

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import * as reviewsApi from '@api/reviews.api';
import { queryKeys } from '@utils/queryKeys';
import type { CreateReviewPayload, ReviewFilters, UpdateReviewPayload } from '@types';
import * as reviewsApi from '@api/reviews.api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@utils/queryKeys';
import toast from 'react-hot-toast';

// ── Reviews for a product ─────────────────────────────────────
export function useProductReviews(productId: string, filters: ReviewFilters = {}) {
  return useQuery({
    queryKey: queryKeys.reviews.byProduct(productId, filters),
    queryFn: () => reviewsApi.getProductReviews(productId, filters),
    enabled: Boolean(productId),
    staleTime: 2 * 60 * 1000,
    placeholderData: (prev) => prev,
  });
}

// ── Current user's own reviews ────────────────────────────────
export function useMyReviews(filters: ReviewFilters = {}) {
  return useQuery({
    queryKey: queryKeys.reviews.mine(filters),
    queryFn: () => reviewsApi.getMyReviews(filters),
    staleTime: 2 * 60 * 1000,
  });
}

// ── Can the current user review this product? ─────────────────
export function useCanReview(productId: string) {
  return useQuery({
    queryKey: queryKeys.reviews.canReview(productId),
    queryFn: () => reviewsApi.canReviewProduct(productId),
    enabled: Boolean(productId),
    staleTime: 5 * 60 * 1000,
  });
}

// ── Create review ─────────────────────────────────────────────
export function useCreateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateReviewPayload) => reviewsApi.createReview(payload),
    onSuccess: (review) => {
      // Invalidate both the review list and review stats for this product
      void queryClient.invalidateQueries({
        queryKey: queryKeys.reviews.byProduct(review.product as string, {}),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.products.reviewStats(review.product as string),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.reviews.canReview(review.product as string),
      });
      void queryClient.invalidateQueries({ queryKey: queryKeys.reviews.mine({}) });
      toast.success('Review submitted!');
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

// ── Update review ─────────────────────────────────────────────
export function useUpdateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateReviewPayload }) =>
      reviewsApi.updateReview(id, payload),
    onSuccess: (review) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.reviews.byProduct(review.product as string, {}),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.products.reviewStats(review.product as string),
      });
      toast.success('Review updated.');
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

// ── Delete review ─────────────────────────────────────────────
export function useDeleteReview(productId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reviewId: string) => reviewsApi.deleteReview(reviewId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.reviews.byProduct(productId, {}),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.products.reviewStats(productId),
      });
      void queryClient.invalidateQueries({ queryKey: queryKeys.reviews.mine({}) });
      toast.success('Review deleted.');
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

// ── Toggle helpful ────────────────────────────────────────────
export function useToggleHelpful(productId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reviewId: string) => reviewsApi.toggleHelpful(reviewId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.reviews.byProduct(productId, {}),
      });
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useUploadReviewImages() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ reviewId, files }: { reviewId: string; files: File[] }) =>
      reviewsApi.uploadReviewImages(reviewId, files),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.reviews.all });
    },
    onError: (err: Error) => toast.error(err.message),
  });
}