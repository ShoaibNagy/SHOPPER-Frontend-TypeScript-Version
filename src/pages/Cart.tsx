// pages/Cart.tsx
import { Link } from 'react-router-dom';
import { useCart } from '@hooks/useCart';
import CartItem from '@components/cart/CartItem';
import CartSummary from '@components/cart/CartSummary';
import { Spinner } from '@components/ui';
import { ROUTES } from '@/router/routes';
import styles from './Cart.module.scss';

export default function Cart() {
  const { data: cart, isLoading } = useCart();

  if (isLoading) return <div className={styles.loading}><Spinner size="xl" centered /></div>;

  const empty = !cart || cart.items.length === 0;

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.title}>Your Bag</h1>

        {empty ? (
          <div className={styles.empty}>
            <BagIcon />
            <p className={styles.empty__msg}>Your bag is empty.</p>
            <Link to={ROUTES.SHOP} className={styles.empty__cta}>Start shopping</Link>
          </div>
        ) : (
          <div className={styles.layout}>
            {/* Items */}
            <div className={styles.items_col}>
              <ul className={styles.items_list}>
                {cart.items.map((item) => <CartItem key={item._id} item={item} />)}
              </ul>
              <Link to={ROUTES.SHOP} className={styles.continue_link}>← Continue shopping</Link>
            </div>

            {/* Summary */}
            <div className={styles.summary_col}>
              <CartSummary cart={cart} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function BagIcon() {
  return <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>;
}