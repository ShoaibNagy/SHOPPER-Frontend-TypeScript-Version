// ─────────────────────────────────────────────────────────────
// components/ui/Badge.tsx
// ─────────────────────────────────────────────────────────────

import type { ReactNode } from 'react';
import { cn } from '@utils/cn';
import styles from './Badge.module.scss';

export type BadgeVariant =
  | 'brand'       // orange — default
  | 'success'     // green
  | 'warning'     // amber
  | 'danger'      // red
  | 'info'        // blue
  | 'neutral'     // gray
  | 'outline';    // transparent with border

export type BadgeSize = 'sm' | 'md';

export interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  /** Shows a coloured pulse dot before the label */
  dot?: boolean;
  /** Shows an × and calls onRemove when clicked */
  onRemove?: () => void;
  children: ReactNode;
  className?: string;
}

export default function Badge({
  variant = 'neutral',
  size = 'md',
  dot = false,
  onRemove,
  children,
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        styles.badge,
        styles[`badge--${variant}`],
        styles[`badge--${size}`],
        className,
      )}
    >
      {dot && (
        <span
          className={cn(styles.badge__dot, styles[`badge__dot--${variant}`])}
          aria-hidden="true"
        />
      )}

      <span className={styles.badge__label}>{children}</span>

      {onRemove && (
        <button
          type="button"
          className={styles.badge__remove}
          onClick={onRemove}
          aria-label={`Remove ${String(children)}`}
        >
          ×
        </button>
      )}
    </span>
  );
}

// ── Order-status badge helper ─────────────────────────────────
// Maps backend OrderStatus strings → Badge variants
import type { OrderStatus } from '@types';

const ORDER_STATUS_VARIANT: Record<OrderStatus, BadgeVariant> = {
  pending:           'warning',
  payment_pending:   'warning',
  confirmed:         'info',
  processing:        'info',
  shipped:           'brand',
  out_for_delivery:  'brand',
  delivered:         'success',
  cancelled:         'danger',
  return_requested:  'warning',
  returned:          'neutral',
  refunded:          'neutral',
};

const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  pending:           'Pending',
  payment_pending:   'Payment Pending',
  confirmed:         'Confirmed',
  processing:        'Processing',
  shipped:           'Shipped',
  out_for_delivery:  'Out for Delivery',
  delivered:         'Delivered',
  cancelled:         'Cancelled',
  return_requested:  'Return Requested',
  returned:          'Returned',
  refunded:          'Refunded',
};

export function OrderStatusBadge({
  status,
  size = 'md',
}: {
  status: OrderStatus;
  size?: BadgeSize;
}) {
  return (
    <Badge variant={ORDER_STATUS_VARIANT[status]} size={size} dot>
      {ORDER_STATUS_LABEL[status]}
    </Badge>
  );
}