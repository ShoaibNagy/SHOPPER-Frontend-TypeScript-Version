// pages/PaymentSuccess.tsx
import { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import gsap from 'gsap';
import { useOrder } from '@hooks/useOrders';
import { formatCurrency } from '@utils/formatCurrency';
import { formatDate } from '@utils/formatDate';
import { ROUTES, PATHS } from '@/router/routes';
import { OrderStatusBadge } from '@components/ui/Badge';
import { Spinner } from '@components/ui';
import styles from './PaymentSuccess.module.scss';

export default function PaymentSuccess() {
  const [params] = useSearchParams();
  const orderId  = params.get('orderId') ?? '';

  const { data: order, isLoading } = useOrder(orderId);

  // Celebration entrance animation
  useEffect(() => {
    if (!order) return;
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.from('.success-check',   { scale: 0, opacity: 0, duration: 0.7, ease: 'back.out(2)' })
      .from('.success-heading', { y: 24, opacity: 0, duration: 0.5 }, '-=0.2')
      .from('.success-body > *', { y: 16, opacity: 0, duration: 0.4, stagger: 0.08 }, '-=0.2');
  }, [order]);

  if (isLoading) return <div className={styles.loading}><Spinner size="xl" centered /></div>;

  if (!order) return (
    <div className={styles.error}>
      <p>Order not found.</p>
      <Link to={ROUTES.ORDER_HISTORY} className={styles.link}>View all orders</Link>
    </div>
  );

  return (
    <div className={styles.page}>
      <div className={styles.container}>

        {/* Check circle */}
        <div className={`${styles.check_wrap} success-check`} aria-hidden="true">
          <div className={styles.check_circle}>
            <CheckIcon />
          </div>
          <div className={styles.check_ring} aria-hidden="true" />
        </div>

        <div className="success-heading">
          <h1 className={styles.heading}>Order confirmed!</h1>
          <p className={styles.sub}>
            Thanks for your purchase. We'll send a confirmation to your email.
          </p>
        </div>

        {/* Order summary card */}
        <div className={`${styles.order_card} success-body`}>

          {/* Header */}
          <div className={styles.order_card__header}>
            <div>
              <p className={styles.order_card__num}>{order.orderNumber}</p>
              <p className={styles.order_card__date}>{formatDate(order.createdAt)}</p>
            </div>
            <OrderStatusBadge status={order.status} size="md" />
          </div>

          {/* Items */}
          <ul className={styles.items}>
            {order.items.map((item) => (
              <li key={item._id} className={styles.item}>
                {item.productImage && (
                  <img src={item.productImage} alt={item.productName} className={styles.item__img} loading="lazy" />
                )}
                <div className={styles.item__info}>
                  <span className={styles.item__name}>{item.productName}</span>
                  <span className={styles.item__qty}>Qty: {item.quantity}</span>
                </div>
                <span className={styles.item__price}>{formatCurrency(item.subtotal)}</span>
              </li>
            ))}
          </ul>

          {/* Totals */}
          <div className={styles.totals}>
            {order.discount > 0 && (
              <div className={styles.total_row}>
                <span>Discount</span>
                <span className={styles.total_row__saving}>−{formatCurrency(order.discount)}</span>
              </div>
            )}
            <div className={styles.total_row}>
              <span>Shipping</span>
              <span>{order.shippingFee === 0 ? 'Free' : formatCurrency(order.shippingFee)}</span>
            </div>
            <div className={`${styles.total_row} ${styles['total_row--grand']}`}>
              <span>Total paid</span>
              <strong>{formatCurrency(order.total)}</strong>
            </div>
          </div>

          {/* Shipping address */}
          <div className={styles.address}>
            <span className={styles.address__label}>Shipping to</span>
            <p className={styles.address__value}>
              {order.shipping.fullName}<br />
              {order.shipping.address.street}, {order.shipping.address.city},
              {' '}{order.shipping.address.state} {order.shipping.address.postalCode},
              {' '}{order.shipping.address.country}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className={`${styles.actions} success-body`}>
          <Link to={PATHS.order(order._id)} className={styles.btn_primary}>
            Track your order
          </Link>
          <Link to={ROUTES.SHOP} className={styles.btn_ghost}>
            Continue shopping
          </Link>
        </div>
      </div>
    </div>
  );
}

function CheckIcon() { return <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>; }