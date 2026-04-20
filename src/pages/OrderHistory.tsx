// pages/OrderHistory.tsx
import { useState } from 'react';
import { useOrders } from '@hooks/useOrders';
import { OrderCard } from '@components/order';
import { Pagination, Spinner } from '@components/ui';
import type { OrderStatus } from '@types';
import styles from './OrderHistory.module.scss';

const STATUS_FILTERS: { label: string; value: OrderStatus | '' }[] = [
  { label: 'All',       value: ''            },
  { label: 'Active',    value: 'confirmed'   },
  { label: 'Shipped',   value: 'shipped'     },
  { label: 'Delivered', value: 'delivered'   },
  { label: 'Cancelled', value: 'cancelled'   },
];

export default function OrderHistory() {
  const [page,   setPage]   = useState(1);
  const [status, setStatus] = useState<OrderStatus | ''>('');

  const { data, isLoading } = useOrders({
    page,
    limit: 10,
    ...(status && { status }),
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const empty = !isLoading && data?.items.length === 0;

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.title}>Order history</h1>

        {/* Status filter tabs */}
        <div className={styles.filter_tabs} role="tablist" aria-label="Filter orders">
          {STATUS_FILTERS.map(({ label, value }) => (
            <button
              key={value}
              role="tab"
              aria-selected={status === value}
              className={`${styles.filter_tab} ${status === value ? styles['filter_tab--active'] : ''}`}
              onClick={() => { setStatus(value); setPage(1); }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Orders list */}
        {isLoading ? (
          <div className={styles.loading}><Spinner size="lg" centered /></div>
        ) : empty ? (
          <div className={styles.empty}>
            <BoxIcon />
            <p className={styles.empty__text}>
              {status ? `No ${status} orders found.` : "You haven't placed any orders yet."}
            </p>
          </div>
        ) : (
          <ul className={styles.list}>
            {data!.items.map((order) => (
              <li key={order._id}><OrderCard order={order} /></li>
            ))}
          </ul>
        )}

        {/* Pagination */}
        {data?.pagination && data.pagination.totalPages > 1 && (
          <div className={styles.pagination_wrap}>
            <Pagination pagination={data.pagination} onPageChange={setPage} />
          </div>
        )}
      </div>
    </div>
  );
}

function BoxIcon() { return <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>; }