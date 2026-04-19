// ─────────────────────────────────────────────────────────────
// components/cart/CartSummary.tsx
// Sticky order summary panel shown alongside the cart item list.
// Handles coupon input, totals breakdown, and checkout CTA.
// ─────────────────────────────────────────────────────────────

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApplyCoupon, useRemoveCoupon } from '@hooks/useCart';
import { formatCurrency } from '@utils/formatCurrency';
import { ROUTES } from '@/router/routes';
import { cn } from '@utils/cn';
import type { Cart } from '@types';
import styles from './CartSummary.module.scss';

const ESTIMATED_SHIPPING_THRESHOLD = 150; // free shipping above this amount

export interface CartSummaryProps {
  cart: Cart;
}

export default function CartSummary({ cart }: CartSummaryProps) {
  const [couponInput, setCouponInput]   = useState('');
  const [couponError, setCouponError]   = useState('');
  const { mutate: applyCoupon, isPending: applying } = useApplyCoupon();
  const { mutate: removeCoupon, isPending: removing } = useRemoveCoupon();

  const isOnSale          = cart.discount > 0;
  const toFreeShipping    = Math.max(0, ESTIMATED_SHIPPING_THRESHOLD - cart.subtotal);
  const qualifiesForFree  = cart.subtotal >= ESTIMATED_SHIPPING_THRESHOLD;
  const freeShippingPct   = Math.min(100, (cart.subtotal / ESTIMATED_SHIPPING_THRESHOLD) * 100);

  function handleApplyCoupon(e: React.FormEvent) {
    e.preventDefault();
    setCouponError('');
    if (!couponInput.trim()) return;

    applyCoupon(
      { couponCode: couponInput.trim().toUpperCase() },
      {
        onSuccess: () => setCouponInput(''),
        onError:   (err) => setCouponError(err.message),
      },
    );
  }

  return (
    <aside className={styles.summary} aria-label="Order summary">

      <h2 className={styles.summary__title}>Order Summary</h2>

      {/* ── Free shipping progress bar ─────────────────────── */}
      <div className={styles.shipping_bar}>
        {qualifiesForFree ? (
          <p className={styles.shipping_bar__msg}>
            <CheckCircleIcon />
            You qualify for <strong>free shipping</strong>!
          </p>
        ) : (
          <p className={styles.shipping_bar__msg}>
            Spend <strong>{formatCurrency(toFreeShipping)}</strong> more for free shipping
          </p>
        )}
        <div className={styles.shipping_bar__track} role="progressbar" aria-valuenow={freeShippingPct} aria-valuemin={0} aria-valuemax={100}>
          <div
            className={cn(
              styles.shipping_bar__fill,
              qualifiesForFree && styles['shipping_bar__fill--complete'],
            )}
            style={{ width: `${freeShippingPct}%` }}
          />
        </div>
      </div>

      {/* ── Coupon ─────────────────────────────────────────── */}
      <div className={styles.coupon}>
        {cart.couponCode ? (
          <div className={styles.coupon__applied}>
            <div className={styles.coupon__applied__info}>
              <TagIcon />
              <span className={styles.coupon__applied__code}>{cart.couponCode}</span>
              <span className={styles.coupon__applied__saving}>
                −{formatCurrency(cart.discount)}
              </span>
            </div>
            <button
              className={styles.coupon__remove_btn}
              onClick={() => removeCoupon()}
              disabled={removing}
              aria-label="Remove coupon"
            >
              Remove
            </button>
          </div>
        ) : (
          <form onSubmit={handleApplyCoupon} className={styles.coupon__form} noValidate>
            <div className={cn(styles.coupon__input_wrap, couponError && styles['coupon__input_wrap--error'])}>
              <TagIcon />
              <input
                type="text"
                value={couponInput}
                onChange={(e) => { setCouponInput(e.target.value.toUpperCase()); setCouponError(''); }}
                placeholder="Coupon code"
                className={styles.coupon__input}
                aria-label="Enter coupon code"
                aria-invalid={Boolean(couponError)}
                aria-describedby={couponError ? 'coupon-error' : undefined}
                autoCapitalize="characters"
                spellCheck={false}
              />
              <button
                type="submit"
                className={styles.coupon__apply_btn}
                disabled={!couponInput.trim() || applying}
              >
                {applying ? '…' : 'Apply'}
              </button>
            </div>
            {couponError && (
              <p id="coupon-error" className={styles.coupon__error} role="alert">
                {couponError}
              </p>
            )}
          </form>
        )}
      </div>

      {/* ── Totals ─────────────────────────────────────────── */}
      <div className={styles.totals}>
        <TotalRow label="Subtotal" value={formatCurrency(cart.subtotal)} />

        {isOnSale && (
          <TotalRow
            label={`Discount${cart.couponCode ? ` (${cart.couponCode})` : ''}`}
            value={`−${formatCurrency(cart.discount)}`}
            accent="success"
          />
        )}

        <TotalRow
          label="Shipping"
          value={qualifiesForFree ? 'Free' : 'Calculated at checkout'}
          accent={qualifiesForFree ? 'success' : 'muted'}
        />

        <TotalRow
          label="Estimated total"
          value={formatCurrency(cart.total)}
          isTotal
        />
      </div>

      {/* ── Checkout CTA ───────────────────────────────────── */}
      <Link to={ROUTES.CHECKOUT} className={styles.checkout_btn}>
        Proceed to checkout
        <ArrowIcon />
      </Link>

      <p className={styles.summary__legal}>
        Taxes and final shipping calculated at checkout.
      </p>

      {/* ── Trust badges ───────────────────────────────────── */}
      <div className={styles.trust}>
        <TrustBadge icon={<ShieldIcon />}  label="Secure checkout" />
        <TrustBadge icon={<ReturnIcon />}  label="Free returns"    />
        <TrustBadge icon={<LockIcon />}    label="SSL encrypted"   />
      </div>
    </aside>
  );
}

// ── Sub-components ────────────────────────────────────────────
function TotalRow({
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
    <div className={cn(styles.total_row, isTotal && styles['total_row--total'])}>
      <span className={cn(
        styles.total_row__label,
        accent === 'muted' && styles['total_row__label--muted'],
      )}>
        {label}
      </span>
      <span className={cn(
        styles.total_row__value,
        accent === 'success' && styles['total_row__value--success'],
        accent === 'muted'   && styles['total_row__value--muted'],
      )}>
        {value}
      </span>
    </div>
  );
}

function TrustBadge({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className={styles.trust__badge}>
      {icon}
      <span>{label}</span>
    </div>
  );
}

// ── Icons ─────────────────────────────────────────────────────
function TagIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>;
}
function ArrowIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>;
}
function CheckCircleIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
}
function ShieldIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
}
function ReturnIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.65"/></svg>;
}
function LockIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
}