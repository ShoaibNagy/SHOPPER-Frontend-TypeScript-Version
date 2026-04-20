// pages/ProductDetail.tsx
import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProduct, useRelatedProducts } from '@hooks/useProducts';
import { useAddToCart } from '@hooks/useCart';
import { useAuthStore } from '@store/auth.store';
import { useCanReview } from '@hooks/useReviews';
import { formatCurrency, discountPercent } from '@utils/formatCurrency';
import { ROUTES } from '@/router/routes';
import { ProductImageGallery, ProductCard } from '@components/product';
import { StarRatingDisplay } from '@components/ui/StarRating';
import { ReviewList, ReviewForm } from '@components/review';
import { Button, Spinner, Modal, Badge } from '@components/ui';
import type { ProductVariant, Review } from '@types';
import styles from './ProductDetail.module.scss';

export default function ProductDetail() {
  const { slug = '' }      = useParams<{ slug: string }>();
  const { data: product, isLoading } = useProduct(slug);
  const { data: related }  = useRelatedProducts(product?._id ?? '', 4);
  const isAuthenticated    = useAuthStore((s) => s.isAuthenticated);
  const { mutate: addToCart, isPending: adding } = useAddToCart();

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity,         setQuantity]        = useState(1);
  const [reviewOpen,       setReviewOpen]      = useState(false);
  const [editReview,       setEditReview]      = useState<Review | null>(null);

  const { data: canReview } = useCanReview(product?._id ?? '');

  if (isLoading) return (
    <div className={styles.loading}><Spinner size="xl" centered /></div>
  );

  if (!product) return (
    <div className={styles.not_found}>
      <h1>Product not found</h1>
      <Link to={ROUTES.SHOP}>Back to shop</Link>
    </div>
  );

  const variant   = selectedVariant ?? product.variants?.[0] ?? null;
  const isOnSale  = Boolean(product.compareAtPrice && product.compareAtPrice > product.price);
  const discount  = isOnSale ? discountPercent(product.compareAtPrice!, product.price) : 0;
  const outOfStock = product.totalStock === 0;
  const category  = typeof product.category === 'object' ? product.category : null;

  // Unique sizes and colors
  const sizes  = [...new Set(product.variants?.map((v) => v.size).filter(Boolean))];
  const colors = product.variants
    ?.filter((v, i, arr) => v.color && arr.findIndex((a) => a.color === v.color) === i);

  function handleAddToCart() {
    if (!variant || !isAuthenticated) return;
    addToCart({ productId: product!._id, variantId: variant._id, quantity });
  }

  return (
    <div className={styles.page}>

      {/* Breadcrumb */}
      <nav className={styles.breadcrumb} aria-label="Breadcrumb">
        <div className={styles.container}>
          <Link to={ROUTES.SHOP} className={styles.breadcrumb__link}>Shop</Link>
          <span aria-hidden="true"> / </span>
          {category && (
            <><Link to={`${ROUTES.SHOP}?category=${category.slug}`} className={styles.breadcrumb__link}>{category.name}</Link><span aria-hidden="true"> / </span></>
          )}
          <span className={styles.breadcrumb__current}>{product.name}</span>
        </div>
      </nav>

      {/* Main product section */}
      <section className={styles.product_section}>
        <div className={styles.container}>
          <div className={styles.product_layout}>

            {/* Gallery */}
            <div className={styles.gallery_col}>
              <ProductImageGallery images={product.images} productName={product.name} />
            </div>

            {/* Info */}
            <div className={styles.info_col}>
              {category && <span className={styles.category_tag}>{category.name}</span>}
              <h1 className={styles.product_name}>{product.name}</h1>

              {/* Rating */}
              {product.reviewCount > 0 && (
                <button className={styles.rating_btn} onClick={() => document.getElementById('reviews')?.scrollIntoView({ behavior: 'smooth' })}>
                  <StarRatingDisplay rating={product.rating} reviewCount={product.reviewCount} size="md" showValue />
                </button>
              )}

              {/* Price */}
              <div className={styles.price_row}>
                <span className={`${styles.price} ${isOnSale ? styles['price--sale'] : ''}`}>
                  {formatCurrency(product.price)}
                </span>
                {isOnSale && (
                  <><span className={styles.price_original}>{formatCurrency(product.compareAtPrice!)}</span>
                  <Badge variant="brand">−{discount}%</Badge></>
                )}
              </div>

              {/* Short description */}
              {product.shortDescription && (
                <p className={styles.short_desc}>{product.shortDescription}</p>
              )}

              {/* Color selector */}
              {colors && colors.length > 0 && (
                <div className={styles.variant_group}>
                  <span className={styles.variant_label}>
                    Color: <strong>{variant?.color ?? colors[0].color}</strong>
                  </span>
                  <div className={styles.color_options}>
                    {colors.map((v) => (
                      <button
                        key={v._id}
                        className={`${styles.color_swatch} ${variant?.color === v.color ? styles['color_swatch--active'] : ''}`}
                        style={{ background: v.colorHex ?? '#888' }}
                        onClick={() => setSelectedVariant(v)}
                        aria-label={v.color ?? ''}
                        title={v.color}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Size selector */}
              {sizes.length > 0 && (
                <div className={styles.variant_group}>
                  <span className={styles.variant_label}>Size</span>
                  <div className={styles.size_options}>
                    {sizes.map((size) => {
                      const v = product.variants?.find((pv) => pv.size === size && (variant?.color ? pv.color === variant.color : true));
                      const outOfStockSize = v ? v.stock === 0 : false;
                      return (
                        <button
                          key={size}
                          className={`${styles.size_btn} ${variant?.size === size ? styles['size_btn--active'] : ''} ${outOfStockSize ? styles['size_btn--sold-out'] : ''}`}
                          onClick={() => v && setSelectedVariant(v)}
                          disabled={outOfStockSize}
                          aria-label={`Size ${size}${outOfStockSize ? ' (sold out)' : ''}`}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quantity + Add to cart */}
              <div className={styles.buy_row}>
                <div className={styles.qty_stepper} role="group" aria-label="Quantity">
                  <button className={styles.qty_btn} onClick={() => setQuantity((q) => Math.max(1, q - 1))} aria-label="Decrease">−</button>
                  <span className={styles.qty_value}>{quantity}</span>
                  <button className={styles.qty_btn} onClick={() => setQuantity((q) => q + 1)} aria-label="Increase">+</button>
                </div>
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  loading={adding}
                  disabled={outOfStock || !isAuthenticated}
                  onClick={handleAddToCart}
                >
                  {outOfStock ? 'Sold out' : !isAuthenticated ? 'Sign in to buy' : 'Add to bag'}
                </Button>
              </div>

              {/* Tags */}
              {product.tags.length > 0 && (
                <div className={styles.tags}>
                  {product.tags.map((tag) => (
                    <Link key={tag} to={`${ROUTES.SHOP}?tags=${tag}`} className={styles.tag}>{tag}</Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Full description */}
          <div className={styles.description_section}>
            <h2 className={styles.description_title}>About this product</h2>
            <p className={styles.description_body}>{product.description}</p>
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section id="reviews" className={styles.reviews_section}>
        <div className={styles.container}>
          <div className={styles.reviews_header}>
            <ReviewList productId={product._id} onEditReview={(r) => { setEditReview(r); setReviewOpen(true); }} />
            {isAuthenticated && canReview?.canReview && (
              <Button variant="outline" onClick={() => { setEditReview(null); setReviewOpen(true); }}>
                Write a review
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Related products */}
      {related && related.length > 0 && (
        <section className={styles.related_section}>
          <div className={styles.container}>
            <h2 className={styles.section_title}>You may also like</h2>
            <div className={styles.related_grid}>
              {related.map((p) => <ProductCard key={p._id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* Review modal */}
      <Modal
        isOpen={reviewOpen}
        onClose={() => setReviewOpen(false)}
        title={editReview ? 'Edit your review' : 'Write a review'}
        size="md"
      >
        <ReviewForm
          productId={product._id}
          editReview={editReview}
          onSuccess={() => setReviewOpen(false)}
          onCancel={() => setReviewOpen(false)}
        />
      </Modal>
    </div>
  );
}