// pages/PaymentFailed.tsx
import { Link, useSearchParams } from 'react-router-dom';
import { ROUTES, PATHS } from '@/router/routes';
import styles from './PaymentFailed.module.scss';

export default function PaymentFailed() {
  const [params] = useSearchParams();
  const orderId  = params.get('orderId') ?? '';

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.icon_wrap} aria-hidden="true">
          <XCircleIcon />
        </div>

        <h1 className={styles.heading}>Payment failed</h1>
        <p className={styles.sub}>
          We couldn't process your payment. Your order has been saved —
          you can try again or choose a different payment method.
        </p>

        <div className={styles.actions}>
          {orderId && (
            <Link to={PATHS.checkoutPayment(orderId)} className={styles.btn_primary}>
              Try again
            </Link>
          )}
          <Link to={ROUTES.CART} className={styles.btn_secondary}>
            Return to cart
          </Link>
        </div>

        <div className={styles.help}>
          <p className={styles.help__text}>
            If the problem persists, check that your card details are correct
            or contact your bank. Need help?{' '}
            <a href="mailto:support@shopper.com" className={styles.help__link}>
              Contact support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

function XCircleIcon() { return <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>; }