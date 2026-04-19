// ─────────────────────────────────────────────────────────────
// components/order/OrderCard.tsx
// Order history list card — shows key order info at a glance.
// Expandable to preview up to 3 item thumbnails.
// ─────────────────────────────────────────────────────────────

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PATHS } from '@/router/routes';
import { useCancelOrder } from '@hooks/useOrders';
import { formatCurrency } from '@utils/formatCurrency';
import { formatDate } from '@utils/formatDate';
import { cn } from '@utils/cn';
import { Modal } from '@components/ui';
import { OrderStatusBadge } from '@components/ui/Badge';
import type { OrderSummary } from '@types';
import styles from './OrderCard.module.scss';

export interface OrderCardProps {
  order: OrderSummary;
}

const CANCELLABLE_STATUSES = new Set(['pending', 'payment_pending', 'confirmed']);

export default function OrderCard({ order }: OrderCardProps) {
  const [cancelOpen,  setCancelOpen]  = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const { mutate: cancelOrder, isPending: cancelling } = useCancelOrder();

  const canCancel   = CANCELLABLE_STATUSES.has(order.status);
  const previewItems = order.items.slice(0, 3);
  const extraCount   = Math.max(0, order.items.length - 3);

  function handleCancel() {
    if (!cancelReason.trim()) return;
    cancelOrder(
      { orderId: order._id, payload: { reason: cancelReason } },
      { onSuccess: () => setCancelOpen(false) },
    );
  }

  return (
    <>
      <article className={styles.card}>

        {/* ── Header row ─────────────────────────────────── */}
        <div className={styles.card__header}>
          <div className={styles.card__header__left}>
            <span className={styles.card__order_num}>
              {order.orderNumber}
            </span>
            <span className={styles.card__date}>
              {formatDate(order.createdAt)}
            </span>
          </div>

          <div className={styles.card__header__right}>
            <OrderStatusBadge status={order.status} />
            <span className={styles.card__total}>
              {formatCurrency(order.total)}
            </span>
          </div>
        </div>

        {/* ── Item thumbnails preview ─────────────────────── */}
        <div className={styles.card__items}>
          {previewItems.map((item) => {
            const product = typeof item.product === 'object' ? item.product : null;
            const image   = item.productImage ?? product?.images?.[0]?.url;
            const name    = item.productName  ?? product?.name ?? 'Product';

            return (
              <div key={item._id} className={styles.card__thumb_wrap} title={name}>
                {image ? (
                  <img
                    src={image}
                    alt={name}
                    className={styles.card__thumb}
                    loading="lazy"
                  />
                ) : (
                  <div className={styles.card__thumb_placeholder} aria-hidden="true" />
                )}
                {item.quantity > 1 && (
                  <span className={styles.card__thumb_qty}>×{item.quantity}</span>
                )}
              </div>
            );
          })}
          {extraCount > 0 && (
            <div className={styles.card__thumb_more}>+{extraCount}</div>
          )}
        </div>

        {/* ── Footer row ─────────────────────────────────── */}
        <div className={styles.card__footer}>
          <div className={styles.card__meta}>
            <span className={styles.card__meta__item}>
              <BoxIcon />
              {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
            </span>
            <span className={styles.card__meta__sep} aria-hidden="true">·</span>
            <span className={styles.card__meta__item}>
              <PaymentIcon />
              {order.paymentMethod === 'stripe' ? 'Card' : 'Cash on delivery'}
            </span>
          </div>

          <div className={styles.card__actions}>
            {canCancel && (
              <button
                className={styles.card__action_btn}
                onClick={() => setCancelOpen(true)}
              >
                Cancel
              </button>
            )}
            <Link
              to={PATHS.order(order._id)}
              className={cn(styles.card__action_btn, styles['card__action_btn--primary'])}
            >
              View order
              <ChevronRightIcon />
            </Link>
          </div>
        </div>
      </article>

      {/* ── Cancel confirmation modal ───────────────────── */}
      <Modal
        isOpen={cancelOpen}
        onClose={() => setCancelOpen(false)}
        title="Cancel order"
        description={`Are you sure you want to cancel ${order.orderNumber}? This cannot be undone.`}
        size="sm"
        footer={
          <>
            <button
              className={styles.modal_btn}
              onClick={() => setCancelOpen(false)}
              disabled={cancelling}
            >
              Keep order
            </button>
            <button
              className={cn(styles.modal_btn, styles['modal_btn--danger'])}
              onClick={handleCancel}
              disabled={!cancelReason.trim() || cancelling}
            >
              {cancelling ? 'Cancelling…' : 'Yes, cancel order'}
            </button>
          </>
        }
      >
        <label className={styles.modal_label} htmlFor="cancel-reason">
          Reason for cancellation
        </label>
        <textarea
          id="cancel-reason"
          value={cancelReason}
          onChange={(e) => setCancelReason(e.target.value)}
          placeholder="e.g. Changed my mind, ordered by mistake…"
          rows={3}
          className={styles.modal_textarea}
          aria-required="true"
        />
      </Modal>
    </>
  );
}

// ── Icons ─────────────────────────────────────────────────────
function BoxIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>;
}
function PaymentIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>;
}
function ChevronRightIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>;
}