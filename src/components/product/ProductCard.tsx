// ─────────────────────────────────────────────────────────────
// components/product/ProductCard.tsx
// ─────────────────────────────────────────────────────────────

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PATHS } from '@/router/routes';
import { useAddToCart } from '@hooks/useCart';
import { useAuthStore } from '@store/auth.store';
import { formatCurrency, discountPercent } from '@utils/formatCurrency';
import { cn } from '@utils/cn';
import { StarRatingDisplay } from '@components/ui/StarRating';
import type { ProductSummary } from '@types';
import styles from './ProductCard.module.scss';

export interface ProductCardProps {
  product: ProductSummary;
  /** 'grid' = standard card | 'list' = horizontal row */
  layout?: 'grid' | 'list';
  /** Skeleton placeholder while loading */
  skeleton?: boolean;
  className?: string;
}

export default function ProductCard({
  product,
  layout = 'grid',
  skeleton = false,
  className,
}: ProductCardProps) {
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);
  const [wishlisted, setWishlisted] = useState(false);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { mutate: addToCart, isPending: adding } = useAddToCart();

  if (skeleton) return <ProductCardSkeleton layout={layout} className={className!} />;

  const primaryImage  = product.images?.[0]?.url;
  const hoverImage    = product.images?.[1]?.url;
  const isOnSale      = Boolean(product.compareAtPrice && product.compareAtPrice > product.price);
  const discount      = isOnSale ? discountPercent(product.compareAtPrice!, product.price) : 0;
  const isOutOfStock  = product.totalStock === 0;

  // Unique color variants for the swatch row
  const colorVariants = product.variants
    ?.filter((v) => v.color && v.colorHex)
    .reduce<typeof product.variants>((acc, v) => {
      if (!acc.some((a) => a.color === v.color)) acc.push(v);
      return acc;
    }, []) ?? [];

  function handleQuickAdd(e: React.MouseEvent) {
    e.preventDefault();
    if (!isAuthenticated || isOutOfStock || adding) return;
    const variant = product.variants?.[selectedVariantIdx];
    if (!variant) return;
    addToCart({ productId: product._id, variantId: variant._id, quantity: 1 });
  }

  function handleWishlist(e: React.MouseEvent) {
    e.preventDefault();
    setWishlisted((v) => !v);
  }

  return (
    <article
      className={cn(
        styles.card,
        styles[`card--${layout}`],
        isOutOfStock && styles['card--sold-out'],
        className,
      )}
    >
      {/* ── Image block ──────────────────────────────────── */}
      <Link
        to={PATHS.product(product.slug)}
        className={styles.card__image_wrap}
        aria-label={product.name}
        tabIndex={-1}
      >
        {primaryImage ? (
          <>
            <img
              src={primaryImage}
              alt={product.name}
              className={cn(styles.card__image, styles['card__image--primary'])}
              loading="lazy"
            />
            {hoverImage && (
              <img
                src={hoverImage}
                alt=""
                aria-hidden="true"
                className={cn(styles.card__image, styles['card__image--hover'])}
                loading="lazy"
              />
            )}
          </>
        ) : (
          <div className={styles.card__image_placeholder} aria-hidden="true" />
        )}

        {/* ── Badges ──────────────────────────────────── */}
        <div className={styles.card__badges}>
          {product.isNew && (
            <span className={cn(styles.card__badge, styles['card__badge--new'])}>New</span>
          )}
          {isOnSale && (
            <span className={cn(styles.card__badge, styles['card__badge--sale'])}>
              −{discount}%
            </span>
          )}
          {isOutOfStock && (
            <span className={cn(styles.card__badge, styles['card__badge--sold-out'])}>
              Sold out
            </span>
          )}
        </div>

        {/* ── Wishlist button ──────────────────────────── */}
        <button
          className={cn(styles.card__wishlist, wishlisted && styles['card__wishlist--active'])}
          onClick={handleWishlist}
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          aria-pressed={wishlisted}
        >
          <HeartIcon filled={wishlisted} />
        </button>

        {/* ── Quick-add overlay ────────────────────────── */}
        {!isOutOfStock && layout === 'grid' && (
          <button
            className={cn(styles.card__quick_add, adding && styles['card__quick_add--loading'])}
            onClick={handleQuickAdd}
            disabled={adding || !isAuthenticated}
            aria-label={`Quick add ${product.name} to cart`}
          >
            {adding ? 'Adding…' : 'Quick add'}
          </button>
        )}
      </Link>

      {/* ── Info block ───────────────────────────────────── */}
      <div className={styles.card__info}>
        {/* Color swatches */}
        {colorVariants.length > 1 && (
          <div className={styles.card__swatches} role="group" aria-label="Color options">
            {colorVariants.slice(0, 6).map((v, i) => (
              <button
                key={v._id}
                className={cn(
                  styles.swatch,
                  selectedVariantIdx === i && styles['swatch--selected'],
                )}
                style={{ background: v.colorHex ?? '#888' }}
                onClick={() => setSelectedVariantIdx(i)}
                aria-label={v.color ?? 'Color'}
                title={v.color}
              />
            ))}
            {colorVariants.length > 6 && (
              <span className={styles.card__swatches__more}>
                +{colorVariants.length - 6}
              </span>
            )}
          </div>
        )}

        {/* Category */}
        {typeof product.category === 'object' && (
          <span className={styles.card__category}>{product.category.name}</span>
        )}

        {/* Name */}
        <Link
          to={PATHS.product(product.slug)}
          className={styles.card__name}
        >
          {product.name}
        </Link>

        {/* Rating */}
        {product.reviewCount > 0 && (
          <StarRatingDisplay
            rating={product.rating}
            reviewCount={product.reviewCount}
            size="sm"
            className={styles.card__rating}
          />
        )}

        {/* Price row */}
        <div className={styles.card__price_row}>
          <span className={cn(styles.card__price, isOnSale && styles['card__price--sale'])}>
            {formatCurrency(product.price)}
          </span>
          {isOnSale && (
            <span className={styles.card__price_original}>
              {formatCurrency(product.compareAtPrice!)}
            </span>
          )}
        </div>

        {/* List layout — inline add button */}
        {layout === 'list' && !isOutOfStock && (
          <button
            className={styles.card__add_btn}
            onClick={handleQuickAdd}
            disabled={adding || !isAuthenticated}
          >
            {adding ? 'Adding…' : 'Add to bag'}
          </button>
        )}
      </div>
    </article>
  );
}

// ── Skeleton placeholder ──────────────────────────────────────
function ProductCardSkeleton({
  layout,
  className,
}: {
  layout: 'grid' | 'list';
  className?: string;
}) {
  return (
    <div
      className={cn(styles.card, styles[`card--${layout}`], styles['card--skeleton'], className)}
      aria-hidden="true"
    >
      <div className={cn(styles.card__image_wrap, 'skeleton')} />
      <div className={styles.card__info}>
        <div className={cn('skeleton', styles.sk__category)} />
        <div className={cn('skeleton', styles.sk__name)} />
        <div className={cn('skeleton', styles.sk__name, styles['sk__name--short'])} />
        <div className={cn('skeleton', styles.sk__price)} />
      </div>
    </div>
  );
}

// ── Heart icon ────────────────────────────────────────────────
function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}