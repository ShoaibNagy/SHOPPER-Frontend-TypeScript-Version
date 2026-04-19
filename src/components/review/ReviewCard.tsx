// ─────────────────────────────────────────────────────────────
// components/review/ReviewCard.tsx
// ─────────────────────────────────────────────────────────────

import { useState } from 'react';
import { useAuthStore } from '@store/auth.store';
import { useDeleteReview, useToggleHelpful } from '@hooks/useReviews';
import { formatRelativeTime } from '@utils/formatDate';
import { cn } from '@utils/cn';
import { StarRatingDisplay } from '@components/ui/StarRating';
import type { Review } from '@types';
import styles from './ReviewCard.module.scss';

export interface ReviewCardProps {
  review: Review;
  onEdit?: (review: Review) => void;
  className?: string;
}

export default function ReviewCard({ review, onEdit, className }: ReviewCardProps) {
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  const currentUser     = useAuthStore((s) => s.user);
  const productId       = review.product as string;
  const isOwner         = currentUser?._id === (typeof review.user === 'object' ? review.user._id : review.user);

  const { mutate: toggleHelpful, isPending: toggling } = useToggleHelpful(productId);
  const { mutate: deleteReview,  isPending: deleting  } = useDeleteReview(productId);

  const reviewer = typeof review.user === 'object' ? review.user : null;
  const initials = reviewer?.name
    ? reviewer.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  return (
    <>
      <article className={cn(styles.card, className)}>

        {/* ── Header ────────────────────────────────────── */}
        <div className={styles.card__header}>
          {/* Avatar */}
          <div className={styles.card__avatar} aria-hidden="true">
            {reviewer?.avatar ? (
              <img src={reviewer.avatar} alt={reviewer.name} className={styles.card__avatar__img} />
            ) : (
              <span className={styles.card__avatar__initials}>{initials}</span>
            )}
          </div>

          {/* Name + meta */}
          <div className={styles.card__meta}>
            <span className={styles.card__name}>
              {reviewer?.name ?? 'Anonymous'}
            </span>
            <time
              className={styles.card__time}
              dateTime={review.createdAt}
              title={new Date(review.createdAt).toLocaleDateString()}
            >
              {formatRelativeTime(review.createdAt)}
            </time>
          </div>

          {/* Verified badge */}
          {review.isVerifiedPurchase && (
            <span className={styles.card__verified} title="Verified purchase">
              <VerifiedIcon />
              Verified
            </span>
          )}

          {/* Owner actions */}
          {isOwner && (
            <div className={styles.card__owner_actions}>
              {onEdit && (
                <button
                  className={styles.card__owner_btn}
                  onClick={() => onEdit(review)}
                  aria-label="Edit review"
                >
                  <EditIcon />
                </button>
              )}
              <button
                className={cn(styles.card__owner_btn, styles['card__owner_btn--danger'])}
                onClick={() => deleteReview(review._id)}
                disabled={deleting}
                aria-label="Delete review"
              >
                <TrashIcon />
              </button>
            </div>
          )}
        </div>

        {/* ── Rating + title ─────────────────────────────── */}
        <div className={styles.card__rating_row}>
          <StarRatingDisplay rating={review.rating} size="sm" />
          <h3 className={styles.card__title}>{review.title}</h3>
        </div>

        {/* ── Body ──────────────────────────────────────── */}
        <p className={styles.card__body}>{review.body}</p>

        {/* ── Image gallery ─────────────────────────────── */}
        {review.images && review.images.length > 0 && (
          <div className={styles.card__images} role="list" aria-label="Review images">
            {review.images.map((src, i) => (
              <button
                key={i}
                role="listitem"
                className={styles.card__img_btn}
                onClick={() => setLightboxSrc(src)}
                aria-label={`View review image ${i + 1}`}
              >
                <img
                  src={src}
                  alt={`Review image ${i + 1}`}
                  className={styles.card__img}
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        )}

        {/* ── Footer: helpful ────────────────────────────── */}
        <div className={styles.card__footer}>
          <span className={styles.card__helpful_label}>Helpful?</span>
          <button
            className={styles.card__helpful_btn}
            onClick={() => toggleHelpful(review._id)}
            disabled={toggling}
            aria-label={`Mark as helpful (${review.helpfulCount})`}
          >
            <ThumbIcon />
            <span>{review.helpfulCount}</span>
          </button>
        </div>
      </article>

      {/* ── Lightbox ────────────────────────────────────── */}
      {lightboxSrc && (
        <div
          className={styles.lightbox}
          onClick={() => setLightboxSrc(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Image preview"
        >
          <button
            className={styles.lightbox__close}
            onClick={() => setLightboxSrc(null)}
            aria-label="Close image"
          >
            <CloseIcon />
          </button>
          <img
            src={lightboxSrc}
            alt="Review image full size"
            className={styles.lightbox__img}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}

// ── Icons ─────────────────────────────────────────────────────
function VerifiedIcon() { return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>; }
function ThumbIcon()    { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/><path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>; }
function EditIcon()     { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>; }
function TrashIcon()    { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>; }
function CloseIcon()    { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>; }