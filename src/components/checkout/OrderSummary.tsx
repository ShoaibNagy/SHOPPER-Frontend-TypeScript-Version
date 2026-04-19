// ─────────────────────────────────────────────────────────────
// components/checkout/OrderSummary.tsx
// Read-only snapshot of the cart shown in the checkout sidebar.
// Collapses on mobile (user expands to review).
// ─────────────────────────────────────────────────────────────

import { useState } from 'react';
import { formatCurrency } from '@utils/formatCurrency';
import { cn } from '@utils/cn';
import type { Cart } from '@types';
import styles from './OrderSummary.module.scss';

export interface OrderSummaryProps {
  cart: Cart;
  /** Show the full item list or a collapsed summary */
  defaultExpanded?: boolean;
}

export default function OrderSummary({
  cart,
  defaultExpanded = false,
}: OrderSummaryProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <aside className={styles.summary} aria-label="Order summary">

      {/* ── Toggle (mobile) ─────────────────────────────── */}
      <button
        className={styles.summary__toggle}
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        aria-controls="order-summary-items"
      >
        <div className={styles.summary__toggle__left}>
          <BagIcon />
          <span className={styles.summary__toggle__label}>
            {expanded ? 'Hide' : 'Show'} order summary
          </span>
          <ChevronIcon
            className={cn(
              styles.summary__toggle__chevron,
              expanded && styles['summary__toggle__chevron--open'],
            )}
          />
        </div>
        <span className={styles.summary__toggle__total}>
          {formatCurrency(cart.total)}
        </span>
      </button>

      {/* ── Expandable item list ────────────────────────── */}
      <div
        id="order-summary-items"
        className={cn(styles.items_wrap, expanded && styles['items_wrap--open'])}
        aria-hidden={!expanded}
      >
        <ul className={styles.items}>
          {cart.items.map((item) => {
            const product = typeof item.product === 'object' ? item.product : null;
            const variant  = typeof item.variant  === 'object' ? item.variant  : null;
            const image    = product?.images?.[0]?.url;
            const name     = product?.name ?? 'Product';

            return (
              <li key={item._id} className={styles.item}>
                {/* Image with quantity badge */}
                <div className={styles.item__image_wrap}>
                  {image ? (
                    <img src={image} alt={name} className={styles.item__image} loading="lazy" />
                  ) : (
                    <div className={styles.item__image_placeholder} />
                  )}
                  <span className={styles.item__qty} aria-label={`Quantity: ${item.quantity}`}>
                    {item.quantity}
                  </span>
                </div>

                {/* Info */}
                <div className={styles.item__info}>
                  <span className={styles.item__name}>{name}</span>
                  {variant && (
                    <span className={styles.item__variant}>
                      {[variant.size, variant.color].filter(Boolean).join(' · ')}
                    </span>
                  )}
                </div>

                {/* Price */}
                <span className={styles.item__price}>
                  {formatCurrency(item.subtotal)}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      {/* ── Always-visible totals ───────────────────────── */}
      <div className={styles.totals}>
        <div className={styles.totals__divider} />

        <Row label="Subtotal" value={formatCurrency(cart.subtotal)} />

        {cart.discount > 0 && (
          <Row
            label={cart.couponCode ? `Coupon (${cart.couponCode})` : 'Discount'}
            value={`−${formatCurrency(cart.discount)}`}
            accent="success"
          />
        )}

        <Row
          label="Shipping"
          value={cart.subtotal >= 150 ? 'Free' : 'TBD'}
          accent={cart.subtotal >= 150 ? 'success' : 'muted'}
        />

        <div className={styles.totals__divider} />

        <Row
          label="Total"
          value={formatCurrency(cart.total)}
          isTotal
        />
      </div>
    </aside>
  );
}

// ── Row ───────────────────────────────────────────────────────
function Row({
  label,
  value,
  accent,
  isTotal = false,
}: {
  label: string;
  value: string;
  accent?: 'success' | 'muted';
  isTotal?: boolean;
}) {
  return (
    <div className={cn(styles.row, isTotal && styles['row--total'])}>
      <span className={cn(styles.row__label, accent === 'muted' && styles['row__label--muted'])}>
        {label}
      </span>
      <span className={cn(
        styles.row__value,
        accent === 'success' && styles['row__value--success'],
        accent === 'muted'   && styles['row__value--muted'],
      )}>
        {value}
      </span>
    </div>
  );
}

// ── Icons ─────────────────────────────────────────────────────
function BagIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>;
}
function ChevronIcon({ className }: { className?: string }) {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>;
}