// ─────────────────────────────────────────────────────────────
// components/layout/CartDrawer.tsx
// ─────────────────────────────────────────────────────────────

import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { useCartStore } from '@store/cart.store';
import { useAuthStore } from '@store/auth.store';
import {
  useCart,
  useRemoveCartItem,
  useUpdateCartItem,
} from '@hooks/useCart';
import { formatCurrency } from '@utils/formatCurrency';
import { ROUTES } from '@/router/routes';
import { cn } from '@utils/cn';
import { Spinner } from '@components/ui';
import styles from './CartDrawer.module.scss';

export default function CartDrawer() {
  const isOpen  = useCartStore((s) => s.isDrawerOpen);
  const closeCart = useCartStore((s) => s.closeCart);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const { data: cart, isLoading } = useCart();
  const { mutate: removeItem, isPending: removing } = useRemoveCartItem();
  const { mutate: updateQty }  = useUpdateCartItem();

  const drawerRef   = useRef<HTMLDivElement>(null);
  const firstFocusRef = useRef<HTMLButtonElement>(null);

  // ── Body scroll lock ─────────────────────────────────────────
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // ── Focus management ─────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    // Small delay so the slide animation doesn't fight focus
    const t = setTimeout(() => firstFocusRef.current?.focus(), 80);
    return () => clearTimeout(t);
  }, [isOpen]);

  // ── Escape to close ───────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') closeCart(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, closeCart]);

  const isEmpty = !cart || cart.items.length === 0;

  return createPortal(
    <>
      {/* ── Backdrop ─────────────────────────────────────── */}
      <div
        className={cn(styles.backdrop, isOpen && styles['backdrop--visible'])}
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* ── Drawer panel ─────────────────────────────────── */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        className={cn(styles.drawer, isOpen && styles['drawer--open'])}
      >
        {/* Header */}
        <div className={styles.drawer__header}>
          <div className={styles.drawer__header__left}>
            <span className={styles.drawer__title}>Your Bag</span>
            {cart && cart.itemCount > 0 && (
              <span className={styles.drawer__count}>{cart.itemCount}</span>
            )}
          </div>
          <button
            ref={firstFocusRef}
            className={styles.drawer__close}
            onClick={closeCart}
            aria-label="Close cart"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Body */}
        <div className={styles.drawer__body}>
          {!isAuthenticated ? (
            <DrawerEmpty
              message="Sign in to view your cart."
              cta={{ label: 'Sign in', to: ROUTES.LOGIN }}
              onClose={closeCart}
            />
          ) : isLoading ? (
            <div className={styles.drawer__loading}>
              <Spinner size="lg" centered />
            </div>
          ) : isEmpty ? (
            <DrawerEmpty
              message="Your bag is empty."
              cta={{ label: 'Start shopping', to: ROUTES.SHOP }}
              onClose={closeCart}
            />
          ) : (
            <ul className={styles.drawer__items} aria-label="Cart items">
              {cart.items.map((item) => {
                const product = typeof item.product === 'object' ? item.product : null;
                const variant  = typeof item.variant  === 'object' ? item.variant  : null;
                const image    = product?.images?.[0]?.url;
                const name     = product?.name ?? 'Product';

                return (
                  <li key={item._id} className={styles.item}>
                    {/* Image */}
                    <Link
                      to={product ? `/shop/${product.slug}` : '#'}
                      className={styles.item__image_wrap}
                      onClick={closeCart}
                      tabIndex={-1}
                      aria-hidden="true"
                    >
                      {image ? (
                        <img src={image} alt={name} className={styles.item__image} />
                      ) : (
                        <div className={styles.item__image_placeholder} />
                      )}
                    </Link>

                    {/* Details */}
                    <div className={styles.item__details}>
                      <Link
                        to={product ? `/shop/${product.slug}` : '#'}
                        className={styles.item__name}
                        onClick={closeCart}
                      >
                        {name}
                      </Link>

                      {variant && (
                        <p className={styles.item__variant}>
                          {[variant.size, variant.color].filter(Boolean).join(' · ')}
                        </p>
                      )}

                      <div className={styles.item__row}>
                        {/* Quantity stepper */}
                        <div className={styles.stepper} role="group" aria-label="Quantity">
                          <button
                            className={styles.stepper__btn}
                            onClick={() =>
                              item.quantity > 1
                                ? updateQty({ itemId: item._id, quantity: item.quantity - 1 })
                                : removeItem(item._id)
                            }
                            aria-label="Decrease quantity"
                          >
                            −
                          </button>
                          <span className={styles.stepper__value}>{item.quantity}</span>
                          <button
                            className={styles.stepper__btn}
                            onClick={() => updateQty({ itemId: item._id, quantity: item.quantity + 1 })}
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>

                        <span className={styles.item__price}>
                          {formatCurrency(item.subtotal)}
                        </span>
                      </div>
                    </div>

                    {/* Remove */}
                    <button
                      className={styles.item__remove}
                      onClick={() => removeItem(item._id)}
                      disabled={removing}
                      aria-label={`Remove ${name}`}
                    >
                      <TrashIcon />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer — only when cart has items */}
        {!isEmpty && cart && (
          <div className={styles.drawer__footer}>
            {/* Coupon code row */}
            {cart.couponCode && (
              <div className={styles.drawer__coupon}>
                <span className={styles.drawer__coupon__label}>
                  Coupon: <strong>{cart.couponCode}</strong>
                </span>
                <span className={styles.drawer__coupon__saving}>
                  −{formatCurrency(cart.discount)}
                </span>
              </div>
            )}

            {/* Totals */}
            <div className={styles.drawer__totals}>
              <div className={styles.drawer__total_row}>
                <span>Subtotal</span>
                <span>{formatCurrency(cart.subtotal)}</span>
              </div>
              {cart.discount > 0 && (
                <div className={cn(styles.drawer__total_row, styles['drawer__total_row--discount'])}>
                  <span>Discount</span>
                  <span>−{formatCurrency(cart.discount)}</span>
                </div>
              )}
              <div className={cn(styles.drawer__total_row, styles['drawer__total_row--total'])}>
                <span>Total</span>
                <span>{formatCurrency(cart.total)}</span>
              </div>
            </div>

            {/* CTA */}
            <Link
              to={ROUTES.CHECKOUT}
              className={styles.drawer__checkout_btn}
              onClick={closeCart}
            >
              Checkout
              <ArrowIcon />
            </Link>
            <Link
              to={ROUTES.CART}
              className={styles.drawer__view_cart}
              onClick={closeCart}
            >
              View full cart
            </Link>
          </div>
        )}
      </div>
    </>,
    document.body,
  );
}

// ── Empty state ───────────────────────────────────────────────
function DrawerEmpty({
  message,
  cta,
  onClose,
}: {
  message: string;
  cta: { label: string; to: string };
  onClose: () => void;
}) {
  return (
    <div className={styles.drawer__empty}>
      <BagEmptyIcon />
      <p className={styles.drawer__empty__msg}>{message}</p>
      <Link
        to={cta.to}
        className={styles.drawer__empty__cta}
        onClick={onClose}
      >
        {cta.label}
      </Link>
    </div>
  );
}

// ── Inline SVG icons ──────────────────────────────────────────
function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" />
    </svg>
  );
}
function ArrowIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}
function BagEmptyIcon() {
  return (
    <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}