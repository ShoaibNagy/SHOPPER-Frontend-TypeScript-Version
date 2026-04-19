// ─────────────────────────────────────────────────────────────
// components/product/ProductGrid.tsx
// ─────────────────────────────────────────────────────────────

import { useState } from 'react';
import { cn } from '@utils/cn';
import ProductCard from './ProductCard';
import { Pagination } from '@components/ui';
import type { PaginatedResponse, ProductSummary } from '@types';
import styles from './ProductGrid.module.scss';

export type GridView = 'grid-2' | 'grid-3' | 'grid-4' | 'list';

export interface ProductGridProps {
  data?: PaginatedResponse<ProductSummary>;
  isLoading?: boolean;
  /** Number of skeletons to show while loading */
  skeletonCount?: number;
  onPageChange?: (page: number) => void;
  /** Controlled view mode — pass undefined to let the grid manage it internally */
  view?: GridView;
  onViewChange?: (view: GridView) => void;
  /** Hide the toolbar (view toggles + result count) */
  hideToolbar?: boolean;
  className?: string;
}

const SKELETON_COUNT = 12;

export default function ProductGrid({
  data,
  isLoading = false,
  skeletonCount = SKELETON_COUNT,
  onPageChange,
  view: controlledView,
  onViewChange,
  hideToolbar = false,
  className,
}: ProductGridProps) {
  const [internalView, setInternalView] = useState<GridView>('grid-3');

  const view = controlledView ?? internalView;
  function setView(v: GridView) {
    setInternalView(v);
    onViewChange?.(v);
  }

  const isListView = view === 'list';
  const isEmpty    = !isLoading && data?.items.length === 0;
  const products   = data?.items ?? [];

  return (
    <section className={cn(styles.section, className)} aria-label="Products">

      {/* ── Toolbar ─────────────────────────────────────────── */}
      {!hideToolbar && (
        <div className={styles.toolbar}>
          {/* Result count */}
          <p className={styles.toolbar__count} aria-live="polite" aria-atomic="true">
            {isLoading ? (
              <span className={cn('skeleton', styles.toolbar__count__skeleton)} />
            ) : data ? (
              <>
                <strong>{data.pagination.total.toLocaleString()}</strong> products
              </>
            ) : null}
          </p>

          {/* View toggle buttons */}
          <div
            className={styles.toolbar__views}
            role="group"
            aria-label="Change product view"
          >
            <ViewBtn icon={<Grid2Icon />} value="grid-2" current={view} onClick={setView} label="2-column grid" />
            <ViewBtn icon={<Grid3Icon />} value="grid-3" current={view} onClick={setView} label="3-column grid" />
            <ViewBtn icon={<Grid4Icon />} value="grid-4" current={view} onClick={setView} label="4-column grid" />
            <ViewBtn icon={<ListIcon />}  value="list"   current={view} onClick={setView} label="List view"     />
          </div>
        </div>
      )}

      {/* ── Empty state ──────────────────────────────────────── */}
      {isEmpty && (
        <div className={styles.empty} role="status">
          <EmptyIcon />
          <h3 className={styles.empty__heading}>No products found</h3>
          <p className={styles.empty__sub}>Try adjusting your filters or search query.</p>
        </div>
      )}

      {/* ── Grid ─────────────────────────────────────────────── */}
      {!isEmpty && (
        <ul
          className={cn(
            styles.grid,
            styles[`grid--${view}`],
          )}
          aria-label="Product list"
        >
          {/* Skeleton tiles */}
          {isLoading &&
            Array.from({ length: skeletonCount }).map((_, i) => (
              <li key={`sk-${i}`}>
                <ProductCard
                  product={{} as ProductSummary}
                  layout={isListView ? 'list' : 'grid'}
                  skeleton
                />
              </li>
            ))}

          {/* Real product tiles */}
          {!isLoading &&
            products.map((product) => (
              <li key={product._id}>
                <ProductCard
                  product={product}
                  layout={isListView ? 'list' : 'grid'}
                />
              </li>
            ))}
        </ul>
      )}

      {/* ── Pagination ───────────────────────────────────────── */}
      {data?.pagination && data.pagination.totalPages > 1 && onPageChange && (
        <div className={styles.pagination_wrap}>
          <Pagination
            pagination={data.pagination}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </section>
  );
}

// ── View toggle button ────────────────────────────────────────
function ViewBtn({
  icon,
  value,
  current,
  onClick,
  label,
}: {
  icon: React.ReactNode;
  value: GridView;
  current: GridView;
  onClick: (v: GridView) => void;
  label: string;
}) {
  return (
    <button
      className={cn(styles.view_btn, current === value && styles['view_btn--active'])}
      onClick={() => onClick(value)}
      aria-label={label}
      aria-pressed={current === value}
      title={label}
    >
      {icon}
    </button>
  );
}

// ── Empty icon ────────────────────────────────────────────────
function EmptyIcon() {
  return (
    <svg className={styles.empty__icon} viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <circle cx="32" cy="32" r="30" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4" />
      <path d="M22 32h20M32 22v20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
    </svg>
  );
}

// ── Grid view icons ───────────────────────────────────────────
function Grid2Icon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <rect x="1" y="1" width="6" height="14" rx="1" /><rect x="9" y="1" width="6" height="14" rx="1" />
    </svg>
  );
}
function Grid3Icon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <rect x="1" y="1" width="4" height="14" rx="1" /><rect x="6" y="1" width="4" height="14" rx="1" /><rect x="11" y="1" width="4" height="14" rx="1" />
    </svg>
  );
}
function Grid4Icon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <rect x="1" y="1" width="3" height="6.5" rx="0.5" /><rect x="5" y="1" width="3" height="6.5" rx="0.5" /><rect x="9" y="1" width="3" height="6.5" rx="0.5" /><rect x="13" y="1" width="3" height="6.5" rx="0.5" />
      <rect x="1" y="8.5" width="3" height="6.5" rx="0.5" /><rect x="5" y="8.5" width="3" height="6.5" rx="0.5" /><rect x="9" y="8.5" width="3" height="6.5" rx="0.5" /><rect x="13" y="8.5" width="3" height="6.5" rx="0.5" />
    </svg>
  );
}
function ListIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <rect x="1" y="1" width="14" height="4" rx="1" /><rect x="1" y="6.5" width="14" height="4" rx="1" /><rect x="1" y="12" width="14" height="3" rx="1" />
    </svg>
  );
}