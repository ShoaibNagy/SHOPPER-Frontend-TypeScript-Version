// ─────────────────────────────────────────────────────────────
// components/checkout/PaymentForm.tsx
// Step 2 of checkout — payment method selection + Stripe.
//
// Flow:
//   1. User selects Stripe or Cash on Delivery.
//   2. If Stripe: renders <PaymentElement /> from Stripe.js.
//      Parent must wrap this in <Elements> with clientSecret.
//   3. On submit: calls stripe.confirmPayment() then the
//      backend confirmPayment() API to mark the order paid.
// ─────────────────────────────────────────────────────────────

import { useState } from 'react';
import {
  PaymentElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js';
import { useConfirmPayment } from '@hooks/usePayments';
import { cn } from '@utils/cn';
import { Spinner } from '@components/ui';
import type { PaymentMethod } from '@types';
import styles from './PaymentForm.module.scss';

export interface PaymentFormProps {
  orderId: string;
  /** Pre-selected method passed from the Checkout page */
  initialMethod?: PaymentMethod;
  /** Called when COD is confirmed (no Stripe flow needed) */
  onCodConfirm: () => void;
}

export default function PaymentForm({
  orderId,
  initialMethod = 'stripe',
  onCodConfirm,
}: PaymentFormProps) {
  const [method, setMethod]       = useState<PaymentMethod>(initialMethod);
  const [stripeReady, setReady]   = useState(false);
  const [stripeError, setError]   = useState<string | null>(null);

  const stripe   = useStripe();
  const elements = useElements();
  const { mutate: confirmPayment, isPending: confirming } = useConfirmPayment();

  const isProcessing = confirming || !stripe || !elements;

  async function handleStripeSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;

    setError(null);

    // 1. Trigger Stripe's client-side validation + payment confirmation
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',  // don't redirect — handle manually
    });

    if (error) {
      setError(error.message ?? 'Payment failed. Please try again.');
      return;
    }

    if (!paymentIntent) {
      setError('Payment could not be confirmed. Please try again.');
      return;
    }

    // 2. Tell the backend the payment succeeded
    confirmPayment({ orderId, paymentIntentId: paymentIntent.id });
  }

  function handleCodSubmit(e: React.FormEvent) {
    e.preventDefault();
    onCodConfirm();
  }

  return (
    <div className={styles.container}>

      {/* ── Method selector ─────────────────────────────── */}
      <div className={styles.methods} role="radiogroup" aria-label="Payment method">
        <MethodCard
          id="stripe"
          label="Pay by card"
          description="Visa, Mastercard, Amex — secured by Stripe"
          icon={<CardIcon />}
          selected={method === 'stripe'}
          onSelect={() => setMethod('stripe')}
        />
        <MethodCard
          id="cash_on_delivery"
          label="Cash on delivery"
          description="Pay in cash when your order arrives"
          icon={<CashIcon />}
          selected={method === 'cash_on_delivery'}
          onSelect={() => setMethod('cash_on_delivery')}
        />
      </div>

      {/* ── Stripe payment form ──────────────────────────── */}
      {method === 'stripe' && (
        <form onSubmit={handleStripeSubmit} className={styles.stripe_form} id="payment-form">
          <div className={cn(styles.stripe_element_wrap, !stripeReady && styles['stripe_element_wrap--loading'])}>
            {/* Loading shimmer while Stripe iframe mounts */}
            {!stripeReady && (
              <div className={styles.stripe_loading}>
                <Spinner size="sm" />
                <span>Loading secure payment form…</span>
              </div>
            )}

            <PaymentElement
              onReady={() => setReady(true)}
              options={{
                layout: 'tabs',
                defaultValues: { billingDetails: { address: { country: 'US' } } },
              }}
            />
          </div>

          {/* Stripe error */}
          {stripeError && (
            <div className={styles.error} role="alert">
              <ErrorIcon />
              {stripeError}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            className={styles.submit_btn}
            disabled={!stripeReady || isProcessing}
          >
            {confirming ? (
              <>
                <Spinner size="xs" color="white" />
                Confirming payment…
              </>
            ) : (
              <>
                <LockIcon />
                Pay securely
              </>
            )}
          </button>

          <p className={styles.stripe_badge}>
            <LockIcon />
            Payments are processed securely by Stripe. We never store your card details.
          </p>
        </form>
      )}

      {/* ── Cash on delivery ─────────────────────────────── */}
      {method === 'cash_on_delivery' && (
        <form onSubmit={handleCodSubmit} className={styles.cod_form} id="payment-form">
          <div className={styles.cod_info}>
            <CashIcon />
            <div>
              <p className={styles.cod_info__title}>Pay on delivery</p>
              <p className={styles.cod_info__desc}>
                Have the exact amount ready when your package arrives.
                Our delivery partner accepts cash only.
              </p>
            </div>
          </div>

          <button type="submit" className={styles.submit_btn}>
            Place order
            <ArrowIcon />
          </button>
        </form>
      )}
    </div>
  );
}

// ── Method selector card ──────────────────────────────────────
function MethodCard({
  id,
  label,
  description,
  icon,
  selected,
  onSelect,
}: {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <label
      htmlFor={`method-${id}`}
      className={cn(styles.method_card, selected && styles['method_card--selected'])}
    >
      <input
        type="radio"
        id={`method-${id}`}
        name="payment-method"
        value={id}
        checked={selected}
        onChange={onSelect}
        className={styles.method_radio}
      />
      <span className={cn(styles.method_dot, selected && styles['method_dot--selected'])} aria-hidden="true" />
      <span className={styles.method_icon}>{icon}</span>
      <span className={styles.method_text}>
        <span className={styles.method_text__label}>{label}</span>
        <span className={styles.method_text__desc}>{description}</span>
      </span>
    </label>
  );
}

// ── Icons ─────────────────────────────────────────────────────
function CardIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>;
}
function CashIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>;
}
function LockIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
}
function ArrowIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>;
}
function ErrorIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;
}