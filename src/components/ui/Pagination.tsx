// ─────────────────────────────────────────────────────────────
// components/ui/Pagination.tsx
// ─────────────────────────────────────────────────────────────

import { useMemo } from 'react';
import { cn } from '@utils/cn';
import styles from './Pagination.module.scss';
import type { PaginationMeta } from '@types';

export interface PaginationProps {
  pagination: PaginationMeta;
  onPageChange: (page: number) => void;
  /** Max page buttons visible (excluding prev/next/ellipsis). Default 5 */
  siblingCount?: number;
  className?: string;
}

// ── Page range builder ────────────────────────────────────────
const DOTS = '…' as const;
type PageItem = number | typeof DOTS;

function buildRange(current: number, total: number, siblings: number): PageItem[] {
  // Always show first, last, current ± siblings
  const totalVisible = siblings * 2 + 5; // siblings + current + 2 ends + 2 ellipsis slots

  if (total <= totalVisible) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const leftSibling  = Math.max(current - siblings, 1);
  const rightSibling = Math.min(current + siblings, total);
  const showLeftDots  = leftSibling > 2;
  const showRightDots = rightSibling < total - 1;

  if (!showLeftDots && showRightDots) {
    const leftRange = Array.from({ length: 3 + siblings * 2 }, (_, i) => i + 1);
    return [...leftRange, DOTS, total];
  }

  if (showLeftDots && !showRightDots) {
    const rightRange = Array.from(
      { length: 3 + siblings * 2 },
      (_, i) => total - (3 + siblings * 2) + i + 1,
    );
    return [1, DOTS, ...rightRange];
  }

  const middleRange = Array.from(
    { length: rightSibling - leftSibling + 1 },
    (_, i) => leftSibling + i,
  );
  return [1, DOTS, ...middleRange, DOTS, total];
}

export default function Pagination({
  pagination,
  onPageChange,
  siblingCount = 1,
  className,
}: PaginationProps) {
  const { page, totalPages, hasNextPage, hasPrevPage } = pagination;

  const pages = useMemo(
    () => buildRange(page, totalPages, siblingCount),
    [page, totalPages, siblingCount],
  );

  if (totalPages <= 1) return null;

  return (
    <nav
      role="navigation"
      aria-label="Pagination"
      className={cn(styles.pagination, className)}
    >
      {/* Prev */}
      <button
        className={cn(styles.page, styles['page--arrow'])}
        onClick={() => onPageChange(page - 1)}
        disabled={!hasPrevPage}
        aria-label="Previous page"
      >
        <ArrowLeft />
      </button>

      {/* Page numbers */}
      {pages.map((p, i) =>
        p === DOTS ? (
          <span
            key={`dots-${i}`}
            className={styles.page__dots}
            aria-hidden="true"
          >
            {DOTS}
          </span>
        ) : (
          <button
            key={p}
            className={cn(
              styles.page,
              p === page && styles['page--active'],
            )}
            onClick={() => onPageChange(p)}
            aria-label={`Page ${p}`}
            aria-current={p === page ? 'page' : undefined}
          >
            {p}
          </button>
        ),
      )}

      {/* Next */}
      <button
        className={cn(styles.page, styles['page--arrow'])}
        onClick={() => onPageChange(page + 1)}
        disabled={!hasNextPage}
        aria-label="Next page"
      >
        <ArrowRight />
      </button>
    </nav>
  );
}

// ── Inline SVG arrows ─────────────────────────────────────────
function ArrowLeft() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ArrowRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}