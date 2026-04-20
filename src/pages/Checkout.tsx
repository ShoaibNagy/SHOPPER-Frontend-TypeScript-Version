// pages/Checkout.tsx — multi-step: Shipping → Review → Payment method selection
import { useState } from 'react';
import { useCart } from '@hooks/useCart';
import { useCreateOrder } from '@hooks/useOrders';
import { ShippingForm, OrderSummary } from '@components/checkout';
import type { ShippingFormValues } from '@components/checkout';
import { Spinner } from '@components/ui';
import type { PaymentMethod } from '@types';
import styles from './Checkout.module.scss';

type Step = 'shipping' | 'review';

export default function Checkout() {
  const [step,           setStep]    = useState<Step>('shipping');
  const [shippingData,   setShipping] = useState<ShippingFormValues | null>(null);
  const [paymentMethod,  setMethod]  = useState<PaymentMethod>('stripe');

  const { data: cart, isLoading } = useCart();
  const { mutate: createOrder, isPending: creating } = useCreateOrder();

  if (isLoading) return <div className={styles.loading}><Spinner size="xl" centered /></div>;
  if (!cart || cart.items.length === 0) return (
    <div className={styles.empty}><p>Your cart is empty.</p></div>
  );

  function handleShippingSubmit(values: ShippingFormValues) {
    setShipping(values);
    setStep('review');
  }

  function handlePlaceOrder() {
    if (!shippingData) return;
    createOrder({
      paymentMethod,
      shippingAddress: {
        street: shippingData.street,
        city: shippingData.city,
        state: shippingData.state,
        postalCode: shippingData.postalCode,
        country: shippingData.country,
      },
      fullName: shippingData.fullName,
      phone:    shippingData.phone,
    });
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>

        {/* Progress steps */}
        <div className={styles.steps}>
          <StepDot n={1} label="Shipping" active={step === 'shipping'} done={step === 'review'} onClick={() => setStep('shipping')} />
          <div className={`${styles.steps__line} ${step === 'review' ? styles['steps__line--done'] : ''}`} aria-hidden="true" />
          <StepDot n={2} label="Review"   active={step === 'review'}   done={false}              />
        </div>

        <div className={styles.layout}>
          {/* Left col: form */}
          <div className={styles.form_col}>
            {step === 'shipping' && (
              <section>
                <h1 className={styles.step_title}>Shipping information</h1>
                <ShippingForm formId="checkout-shipping" onSubmit={handleShippingSubmit} />
                <button form="checkout-shipping" type="submit" className={styles.next_btn}>
                  Continue to review →
                </button>
              </section>
            )}

            {step === 'review' && shippingData && (
              <section>
                <h1 className={styles.step_title}>Review & payment</h1>

                {/* Shipping summary */}
                <div className={styles.shipping_review}>
                  <div className={styles.shipping_review__header}>
                    <h2 className={styles.shipping_review__title}>Shipping to</h2>
                    <button className={styles.shipping_review__edit} onClick={() => setStep('shipping')}>Edit</button>
                  </div>
                  <p className={styles.shipping_review__addr}>
                    {shippingData.fullName} · {shippingData.phone}<br />
                    {shippingData.street}, {shippingData.city}, {shippingData.state} {shippingData.postalCode}, {shippingData.country}
                  </p>
                </div>

                {/* Payment method */}
                <div className={styles.payment_select}>
                  <h2 className={styles.payment_select__title}>Payment method</h2>
                  <div className={styles.method_options} role="radiogroup">
                    {(['stripe', 'cash_on_delivery'] as PaymentMethod[]).map((m) => (
                      <label key={m} className={`${styles.method_opt} ${paymentMethod === m ? styles['method_opt--active'] : ''}`}>
                        <input type="radio" name="payment" value={m} checked={paymentMethod === m}
                          onChange={() => setMethod(m)} className={styles.method_radio} />
                        <span className={styles.method_dot} aria-hidden="true" />
                        <span className={styles.method_label}>
                          {m === 'stripe' ? '💳 Credit / Debit card' : '💵 Cash on delivery'}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <button className={styles.place_btn} onClick={handlePlaceOrder} disabled={creating}>
                  {creating ? <><Spinner size="xs" color="white" /> Placing order…</> : 'Place order →'}
                </button>
              </section>
            )}
          </div>

          {/* Right col: order summary */}
          <div className={styles.summary_col}>
            <OrderSummary cart={cart} defaultExpanded />
          </div>
        </div>
      </div>
    </div>
  );
}

function StepDot({ n, label, active, done, onClick }: { n: number; label: string; active: boolean; done: boolean; onClick?: () => void }) {
  return (
    <button className={`${styles.step_dot} ${active ? styles['step_dot--active'] : ''} ${done ? styles['step_dot--done'] : ''}`}
      onClick={onClick} disabled={!done && !active} aria-current={active ? 'step' : undefined}>
      <span className={styles.step_dot__n}>{done ? '✓' : n}</span>
      <span className={styles.step_dot__label}>{label}</span>
    </button>
  );
}