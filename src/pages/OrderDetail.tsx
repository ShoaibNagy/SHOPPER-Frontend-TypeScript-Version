// pages/OrderDetail.tsx
import { Link, useParams } from 'react-router-dom';
import { useOrder } from '@hooks/useOrders';
import { OrderTracker } from '@components/order';
import { OrderStatusBadge } from '@components/ui/Badge';
import { Spinner } from '@components/ui';
import { formatCurrency } from '@utils/formatCurrency';
import { formatDate } from '@utils/formatDate';
import { ROUTES } from '@/router/routes';
import styles from './OrderDetail.module.scss';

export default function OrderDetail() {
  const { id = '' } = useParams<{ id: string }>();
  const { data: order, isLoading } = useOrder(id);

  if (isLoading) return <div className={styles.loading}><Spinner size="xl" centered /></div>;
  if (!order)    return (
    <div className={styles.error}>
      <p>Order not found.</p>
      <Link to={ROUTES.ORDER_HISTORY} className={styles.error__link}>← All orders</Link>
    </div>
  );

  return (
    <div className={styles.page}>
      <div className={styles.container}>

        {/* Breadcrumb */}
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link to={ROUTES.ORDER_HISTORY} className={styles.breadcrumb__link}>Orders</Link>
          <span aria-hidden="true"> / </span>
          <span>{order.orderNumber}</span>
        </nav>

        {/* Header */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>{order.orderNumber}</h1>
            <p className={styles.date}>Placed on {formatDate(order.createdAt)}</p>
          </div>
          <OrderStatusBadge status={order.status} size="md" />
        </div>

        <div className={styles.layout}>

          {/* Left: tracker + items */}
          <div className={styles.main_col}>

            {/* Order tracker */}
            <section className={styles.section}>
              <h2 className={styles.section__title}>Tracking</h2>
              <OrderTracker order={order} />
            </section>

            {/* Items */}
            <section className={styles.section}>
              <h2 className={styles.section__title}>Items ({order.items.length})</h2>
              <ul className={styles.items}>
                {order.items.map((item) => (
                  <li key={item._id} className={styles.item}>
                    {item.productImage && (
                      <img src={item.productImage} alt={item.productName} className={styles.item__img} loading="lazy" />
                    )}
                    <div className={styles.item__info}>
                      <span className={styles.item__name}>{item.productName}</span>
                      {typeof item.variant === 'object' && item.variant && (
                        <span className={styles.item__variant}>
                          {[item.variant.size, item.variant.color].filter(Boolean).join(' · ')}
                        </span>
                      )}
                      <span className={styles.item__qty}>Qty: {item.quantity}</span>
                    </div>
                    <span className={styles.item__price}>{formatCurrency(item.subtotal)}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          {/* Right: summary */}
          <aside className={styles.side_col}>

            {/* Order totals */}
            <div className={styles.card}>
              <h2 className={styles.card__title}>Order summary</h2>
              <div className={styles.totals}>
                <Row label="Subtotal"  value={formatCurrency(order.subtotal)} />
                {order.discount > 0 && <Row label="Discount" value={`−${formatCurrency(order.discount)}`} accent="success" />}
                <Row label="Shipping"  value={order.shippingFee === 0 ? 'Free' : formatCurrency(order.shippingFee)} />
                <Row label="Total" value={formatCurrency(order.total)} bold />
              </div>
            </div>

            {/* Payment */}
            <div className={styles.card}>
              <h2 className={styles.card__title}>Payment</h2>
              <p className={styles.card__body}>
                {order.paymentMethod === 'stripe' ? 'Credit / Debit card' : 'Cash on delivery'}
              </p>
              <p className={`${styles.card__body} ${order.paymentStatus === 'paid' ? styles['card__body--success'] : ''}`}>
                {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
              </p>
            </div>

            {/* Shipping address */}
            <div className={styles.card}>
              <h2 className={styles.card__title}>Shipping address</h2>
              <address className={styles.address}>
                {order.shipping.fullName}<br />
                {order.shipping.address.street}<br />
                {order.shipping.address.city}, {order.shipping.address.state} {order.shipping.address.postalCode}<br />
                {order.shipping.address.country}<br />
                {order.shipping.phone}
              </address>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, accent, bold }: { label: string; value: string; accent?: 'success'; bold?: boolean }) {
  return (
    <div className={styles.total_row}>
      <span className={`${styles.total_row__label} ${bold ? styles['total_row__label--bold'] : ''}`}>{label}</span>
      <span className={`${styles.total_row__value} ${accent === 'success' ? styles['total_row__value--success'] : ''} ${bold ? styles['total_row__value--bold'] : ''}`}>{value}</span>
    </div>
  );
}