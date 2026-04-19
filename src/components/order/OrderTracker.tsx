// ─────────────────────────────────────────────────────────────
// components/order/OrderTracker.tsx
// Full order status timeline shown on the Order Detail page.
// Renders every pipeline step with animated connector lines.
// Supports both a compact "current status" header and
// the full vertical timeline with shipping events.
// ─────────────────────────────────────────────────────────────

import { cn } from '@utils/cn';
import { formatDateTime } from '@utils/formatDate';
import type { Order, OrderStatus, TrackingEvent } from '@types';
import styles from './OrderTracker.module.scss';

// ── Status pipeline definition ────────────────────────────────
// Only the "happy path" steps — cancellation/return are handled
// separately since they branch off the main flow.
const PIPELINE_STEPS: {
  status: OrderStatus;
  label: string;
  icon: React.ReactNode;
}[] = [
  { status: 'pending',           label: 'Order placed',     icon: <ClipboardIcon /> },
  { status: 'confirmed',         label: 'Confirmed',        icon: <CheckIcon />     },
  { status: 'processing',        label: 'Processing',       icon: <BoxIcon />       },
  { status: 'shipped',           label: 'Shipped',          icon: <TruckIcon />     },
  { status: 'out_for_delivery',  label: 'Out for delivery', icon: <MapPinIcon />    },
  { status: 'delivered',         label: 'Delivered',        icon: <HomeIcon />      },
];

// Which pipeline index each status corresponds to
const STATUS_INDEX: Partial<Record<OrderStatus, number>> = {
  pending:           0,
  payment_pending:   0,  // same visual step as pending
  confirmed:         1,
  processing:        2,
  shipped:           3,
  out_for_delivery:  4,
  delivered:         5,
};

const TERMINAL_STATUSES = new Set<OrderStatus>(['cancelled', 'returned', 'refunded', 'return_requested']);

export interface OrderTrackerProps {
  order: Order;
  className?: string;
}

export default function OrderTracker({ order, className }: OrderTrackerProps) {
  const isTerminal  = TERMINAL_STATUSES.has(order.status);
  const currentStep = isTerminal ? -1 : (STATUS_INDEX[order.status] ?? 0);

  return (
    <section className={cn(styles.tracker, className)} aria-label="Order status">

      {/* ── Cancelled / Returned banner ─────────────────── */}
      {isTerminal && (
        <TerminalBanner status={order.status} reason={order.cancelReason!} />
      )}

      {/* ── Progress pipeline ────────────────────────────── */}
      {!isTerminal && (
        <div className={styles.pipeline} role="list">
          {PIPELINE_STEPS.map((step, i) => {
            const isDone    = i < currentStep;
            const isActive  = i === currentStep;
            const isFuture  = i > currentStep;

            return (
              <div
                key={step.status}
                className={cn(
                  styles.step,
                  isDone   && styles['step--done'],
                  isActive && styles['step--active'],
                  isFuture && styles['step--future'],
                )}
                role="listitem"
                aria-current={isActive ? 'step' : undefined}
              >
                {/* Connector line (before every step except the first) */}
                {i > 0 && (
                  <div
                    className={cn(
                      styles.step__line,
                      isDone && styles['step__line--filled'],
                    )}
                    aria-hidden="true"
                  />
                )}

                {/* Icon bubble */}
                <div className={styles.step__icon} aria-hidden="true">
                  {isDone ? <CheckIcon /> : step.icon}
                </div>

                {/* Label */}
                <span className={styles.step__label}>{step.label}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Shipping details ─────────────────────────────── */}
      {(order.shipping.trackingNumber || order.shipping.carrier) && (
        <div className={styles.shipping}>
          <h3 className={styles.shipping__title}>Shipping details</h3>
          <dl className={styles.shipping__dl}>
            {order.shipping.carrier && (
              <Row label="Carrier" value={order.shipping.carrier} />
            )}
            {order.shipping.trackingNumber && (
              <Row
                label="Tracking"
                value={
                  order.shipping.trackingUrl ? (
                    <a
                      href={order.shipping.trackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.tracking_link}
                    >
                      {order.shipping.trackingNumber}
                      <ExternalLinkIcon />
                    </a>
                  ) : (
                    order.shipping.trackingNumber
                  )
                }
              />
            )}
            {order.shipping.estimatedDelivery && (
              <Row
                label="Est. delivery"
                value={formatDateTime(order.shipping.estimatedDelivery)}
              />
            )}
          </dl>
        </div>
      )}

      {/* ── Tracking events timeline ─────────────────────── */}
      {order.shipping.events.length > 0 && (
        <div className={styles.events}>
          <h3 className={styles.events__title}>Tracking history</h3>
          <ol className={styles.events__list} aria-label="Tracking events">
            {order.shipping.events.map((event, i) => (
              <TrackingEventRow key={i} event={event} isLatest={i === 0} />
            ))}
          </ol>
        </div>
      )}
    </section>
  );
}

// ── Sub-components ────────────────────────────────────────────
function TerminalBanner({
  status,
  reason,
}: {
  status: OrderStatus;
  reason?: string;
}) {
  const config: Record<string, { label: string; icon: React.ReactNode; mod: string }> = {
    cancelled:        { label: 'Order cancelled',       icon: <XCircleIcon />,  mod: 'danger'  },
    return_requested: { label: 'Return requested',      icon: <AlertIcon />,    mod: 'warning' },
    returned:         { label: 'Order returned',        icon: <ReturnIcon />,   mod: 'neutral' },
    refunded:         { label: 'Order refunded',        icon: <RefundIcon />,   mod: 'neutral' },
  };
  const c = config[status] ?? config.cancelled;

  return (
    <div className={cn(styles.banner, styles[`banner--${c.mod}`])}>
      <span className={styles.banner__icon}>{c.icon}</span>
      <div>
        <p className={styles.banner__title}>{c.label}</p>
        {reason && <p className={styles.banner__reason}>{reason}</p>}
      </div>
    </div>
  );
}

function TrackingEventRow({
  event,
  isLatest,
}: {
  event: TrackingEvent;
  isLatest: boolean;
}) {
  return (
    <li className={cn(styles.event, isLatest && styles['event--latest'])}>
      <div className={styles.event__dot} aria-hidden="true" />
      <div className={styles.event__content}>
        <span className={styles.event__status}>{event.status}</span>
        <span className={styles.event__desc}>{event.description}</span>
        <div className={styles.event__meta}>
          {event.location && (
            <span className={styles.event__location}>
              <MapPinIcon />
              {event.location}
            </span>
          )}
          <time className={styles.event__time} dateTime={event.timestamp}>
            {formatDateTime(event.timestamp)}
          </time>
        </div>
      </div>
    </li>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <>
      <dt className={styles.shipping__dt}>{label}</dt>
      <dd className={styles.shipping__dd}>{value}</dd>
    </>
  );
}

// ── Icons ─────────────────────────────────────────────────────
function CheckIcon()     { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>; }
function ClipboardIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>; }
function BoxIcon()       { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>; }
function TruckIcon()     { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>; }
function MapPinIcon()    { return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>; }
function HomeIcon()      { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>; }
function XCircleIcon()   { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>; }
function AlertIcon()     { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>; }
function ReturnIcon()    { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.65"/></svg>; }
function RefundIcon()    { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>; }
function ExternalLinkIcon() { return <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>; }