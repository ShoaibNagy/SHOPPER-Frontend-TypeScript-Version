// ─────────────────────────────────────────────────────────────
// pages/CheckoutPayment.tsx
// Stripe payment step. Receives orderId via URL query param.
// Creates a PaymentIntent, mounts Stripe <Elements>, then
// delegates to <PaymentForm> for the actual card form + submit.
// ─────────────────────────────────────────────────────────────

import { useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useCreatePaymentIntent } from '@hooks/usePayments';
import { useOrder } from '@hooks/useOrders';
import { PaymentForm } from '@components/checkout';
import { Spinner } from '@components/ui';
import { formatCurrency } from '@utils/formatCurrency';
import { ROUTES, PATHS } from '@/router/routes';
import styles from './CheckoutPayment.module.scss';

// Initialise Stripe once outside the component
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string);

// Stripe Elements appearance — matches the dark design system
const STRIPE_APPEARANCE = {
  theme: 'night' as const,
  variables: {
    colorPrimary:        '#f97316',
    colorBackground:     '#1a1a1a',
    colorText:           '#f5f5f5',
    colorDanger:         '#ef4444',
    fontFamily:          '"DM Sans", sans-serif',
    borderRadius:        '8px',
    spacingUnit:         '4px',
  },
  rules: {
    '.Input': {
      border:       '1px solid rgba(255,255,255,0.08)',
      boxShadow:    'none',
      paddingTop:   '10px',
      paddingBottom:'10px',
    },
    '.Input:focus': {
      border:    '1px solid #f97316',
      boxShadow: '0 0 0 3px rgba(249,115,22,0.15)',
    },
    '.Label': {
      fontFamily:    '"Unbounded", sans-serif',
      fontSize:      '10px',
      fontWeight:    '600',
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      color:         '#a3a3a3',
    },
  },
};

export default function CheckoutPayment() {
  const [params]       = useSearchParams();
  const orderId        = params.get('orderId') ?? '';
  const navigate       = useNavigate();

  const { data: order, isLoading: orderLoading } = useOrder(orderId);
  const { mutate: createIntent, isPending: intentPending, data: intentData } =
    useCreatePaymentIntent();

  // Fire the PaymentIntent creation once we have a valid orderId
  useEffect(() => {
    if (orderId && !intentData) {
      createIntent(orderId);
    }
  }, [orderId, intentData, createIntent]);

  // Guard: no orderId in URL
  if (!orderId) {
    return (
      <div className={styles.error_page}>
        <p className={styles.error_msg}>No order ID found.</p>
        <Link to={ROUTES.CART} className={styles.back_link}>← Back to cart</Link>
      </div>
    );
  }

  const isLoading = orderLoading || intentPending || !intentData;

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <Spinner size="xl" />
        <p className={styles.loading__msg}>Preparing secure payment…</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>

        {/* Header */}
        <div className={styles.page__header}>
          <Link to={ROUTES.CHECKOUT} className={styles.back_link}>
            <ChevronLeftIcon /> Back
          </Link>
          <div className={styles.secure_badge}>
            <LockIcon />
            <span>Secure payment</span>
          </div>
        </div>

        <div className={styles.layout}>

          {/* Payment form */}
          <div className={styles.form_col}>
            <h1 className={styles.page_title}>Payment</h1>
            <p className={styles.amount_due}>
              Amount due: <strong>{formatCurrency(order?.total ?? 0)}</strong>
            </p>

            <Elements
              stripe={stripePromise}
              options={{
                clientSecret: intentData.clientSecret,
                appearance: STRIPE_APPEARANCE,
              }}
            >
              <PaymentForm
                orderId={orderId}
                initialMethod="stripe"
                onCodConfirm={() => navigate(PATHS.paymentSuccess(orderId))}
              />
            </Elements>
          </div>

          {/* Order summary */}
          {order && (
            <div className={styles.summary_col}>
              {/* Re-use the cart-based OrderSummary by reconstructing a Cart-like shape */}
              <div className={styles.order_recap}>
                <h2 className={styles.order_recap__title}>Order {order.orderNumber}</h2>
                <ul className={styles.order_recap__items}>
                  {order.items.map((item) => (
                    <li key={item._id} className={styles.recap_item}>
                      <span className={styles.recap_item__name}>{item.productName}</span>
                      <span className={styles.recap_item__qty}>×{item.quantity}</span>
                      <span className={styles.recap_item__price}>
                        {formatCurrency(item.subtotal)}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className={styles.recap_total}>
                  <span>Total</span>
                  <strong>{formatCurrency(order.total)}</strong>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function LockIcon()        { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>; }
function ChevronLeftIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg>; }