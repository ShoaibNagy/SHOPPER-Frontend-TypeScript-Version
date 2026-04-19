// ─────────────────────────────────────────────────────────────
// components/review/ReviewList.tsx
// Paginated list of product reviews with rating histogram,
// sort controls, and filter by star rating.
// ─────────────────────────────────────────────────────────────

import { useState } from 'react';
import { useProductReviews } from '@hooks/useReviews';
import { useProductReviewStats } from '@hooks/useProducts';
import { cn } from '@utils/cn';
import { Pagination, Spinner } from '@components/ui';
import { StarRatingDisplay } from '@components/ui/StarRating';
import ReviewCard from './ReviewCard';
import type { Review, ReviewFilters } from '@types';
import styles from './ReviewList.module.scss';

export interface ReviewListProps {
  productId: string;
  onEditReview?: (review: Review) => void;
  className?: string;
}

type SortOption = 'createdAt:desc' | 'rating:desc' | 'rating:asc' | 'helpfulCount:desc';

const SORT_OPTIONS: { label: string; value: SortOption }[] = [
  { label: 'Most recent',  value: 'createdAt:desc'    },
  { label: 'Highest rated', value: 'rating:desc'      },
  { label: 'Lowest rated', value: 'rating:asc'        },
  { label: 'Most helpful', value: 'helpfulCount:desc' },
];

export default function ReviewList({
  productId,
  onEditReview,
  className,
}: ReviewListProps) {
  const [filters, setFilters] = useState<ReviewFilters>({
    page: 1,
    limit: 6,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  const [starFilter, setStarFilter] = useState<number | null>(null);

  const activeFilters: ReviewFilters = {
    ...filters,
    ...(starFilter !== null && { rating: starFilter }),
  };

  const { data, isLoading }         = useProductReviews(productId, activeFilters);
  const { data: stats, isLoading: statsLoading } = useProductReviewStats(productId);

  function setSort(value: SortOption) {
    const [sortBy, sortOrder] = value.split(':') as [string, 'asc' | 'desc'];
    setFilters((f) => ({ ...f, sortBy, sortOrder, page: 1 }));
  }

  function currentSort(): SortOption {
    return `${filters.sortBy}:${filters.sortOrder}` as SortOption;
  }

  function handleStarFilter(star: number) {
    setStarFilter((prev) => (prev === star ? null : star));
    setFilters((f) => ({ ...f, page: 1 }));
  }

  const isEmpty = !isLoading && data?.items.length === 0;

  return (
    <section className={cn(styles.section, className)} aria-label="Customer reviews">

      {/* ── Section heading ─────────────────────────────── */}
      <h2 className={styles.section__heading}>
        Customer reviews
        {data?.pagination.total !== undefined && (
          <span className={styles.section__count}>
            {data.pagination.total.toLocaleString()}
          </span>
        )}
      </h2>

      <div className={styles.layout}>

        {/* ── Left: histogram sidebar ──────────────────── */}
        <aside className={styles.histogram_wrap} aria-label="Rating breakdown">
          {statsLoading ? (
            <div className={styles.histogram_skeleton}>
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className={cn('skeleton', styles.histogram_skeleton__row)} />
              ))}
            </div>
          ) : stats ? (
            <>
              {/* Overall average */}
              <div className={styles.histogram__avg}>
                <span className={styles.histogram__avg__number}>
                  {stats.averageRating.toFixed(1)}
                </span>
                <StarRatingDisplay
                  rating={stats.averageRating}
                  size="md"
                />
                <span className={styles.histogram__avg__count}>
                  {stats.totalReviews.toLocaleString()} reviews
                </span>
              </div>

              {/* Per-star bars */}
              <div className={styles.histogram__bars}>
                {([5, 4, 3, 2, 1] as const).map((star) => {
                  const count = stats.distribution[star] ?? 0;
                  const pct   = stats.totalReviews > 0
                    ? (count / stats.totalReviews) * 100
                    : 0;
                  const isActive = starFilter === star;

                  return (
                    <button
                      key={star}
                      className={cn(
                        styles.histogram__bar_row,
                        isActive && styles['histogram__bar_row--active'],
                      )}
                      onClick={() => handleStarFilter(star)}
                      aria-pressed={isActive}
                      aria-label={`Filter by ${star} star${star !== 1 ? 's' : ''} (${count})`}
                    >
                      <span className={styles.histogram__bar_label}>{star}★</span>
                      <div className={styles.histogram__bar_track}>
                        <div
                          className={styles.histogram__bar_fill}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className={styles.histogram__bar_count}>{count}</span>
                    </button>
                  );
                })}
              </div>

              {/* Clear star filter */}
              {starFilter !== null && (
                <button
                  className={styles.histogram__clear}
                  onClick={() => setStarFilter(null)}
                >
                  Show all ratings
                </button>
              )}
            </>
          ) : null}
        </aside>

        {/* ── Right: reviews ────────────────────────────── */}
        <div className={styles.reviews_col}>

          {/* Sort bar */}
          <div className={styles.sort_bar}>
            <span className={styles.sort_bar__label}>Sort by:</span>
            <div className={styles.sort_bar__options} role="group">
              {SORT_OPTIONS.map(({ label, value }) => (
                <button
                  key={value}
                  className={cn(
                    styles.sort_btn,
                    currentSort() === value && styles['sort_btn--active'],
                  )}
                  onClick={() => setSort(value)}
                  aria-pressed={currentSort() === value}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Reviews */}
          {isLoading ? (
            <div className={styles.loading_wrap} aria-live="polite" aria-label="Loading reviews">
              <Spinner size="lg" centered />
            </div>
          ) : isEmpty ? (
            <div className={styles.empty}>
              <EmptyStarIcon />
              <p className={styles.empty__text}>
                {starFilter !== null
                  ? `No ${starFilter}-star reviews yet.`
                  : 'No reviews yet. Be the first!'}
              </p>
            </div>
          ) : (
            <ul className={styles.list} aria-label="Review list">
              {data!.items.map((review) => (
                <li key={review._id}>
                  <ReviewCard
                    review={review}
                    onEdit={onEditReview!}
                  />
                </li>
              ))}
            </ul>
          )}

          {/* Pagination */}
          {data?.pagination && data.pagination.totalPages > 1 && (
            <div className={styles.pagination_wrap}>
              <Pagination
                pagination={data.pagination}
                onPageChange={(p) => setFilters((f) => ({ ...f, page: p }))}
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function EmptyStarIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  );
}