// ─────────────────────────────────────────────────────────────
// components/cart/CartItem.tsx
// Full-page cart row — more detailed than the CartDrawer item.
// Shows: image, name, category, variant, unit price, stepper,
// line subtotal, and a remove button.
// ─────────────────────────────────────────────────────────────

import { Link } from 'react-router-dom';
import { PATHS } from '@/router/routes';
import { useRemoveCartItem, useUpdateCartItem } from '@hooks/useCart';
import { formatCurrency } from '@utils/formatCurrency';
import { cn } from '@utils/cn';
import type { CartItem as CartItemType } from '@types';
import styles from './CartItem.module.scss';

export interface CartItemProps {
  item: CartItemType;
}

export default function CartItem({ item }: CartItemProps) {
  const { mutate: updateQty,  isPending: updating } = useUpdateCartItem();
  const { mutate: removeItem, isPending: removing  } = useRemoveCartItem();

  const product = typeof item.product === 'object' ? item.product : null;
  const variant  = typeof item.variant  === 'object' ? item.variant  : null;
  const image    = product?.images?.[0]?.url;
  const name     = product?.name ?? 'Product';
  const slug     = product?.slug;
  const category = typeof product?.category === 'object' ? product.category.name : null;

  const isProcessing = updating || removing;

  function decrease() {
    if (item.quantity > 1) {
      updateQty({ itemId: item._id, quantity: item.quantity - 1 });
    } else {
      removeItem(item._id);
    }
  }

  function increase() {
    updateQty({ itemId: item._id, quantity: item.quantity + 1 });
  }

  return (
    <li className={cn(styles.item, isProcessing && styles['item--processing'])}>

      {/* ── Image ──────────────────────────────────────────── */}
      <Link
        to={slug ? PATHS.product(slug) : '#'}
        className={styles.item__image_wrap}
        tabIndex={-1}
        aria-hidden="true"
      >
        {image ? (
          <img src={image} alt={name} className={styles.item__image} loading="lazy" />
        ) : (
          <div className={styles.item__image_placeholder} />
        )}
      </Link>

      {/* ── Details ────────────────────────────────────────── */}
      <div className={styles.item__details}>
        <div className={styles.item__meta}>
          {category && <span className={styles.item__category}>{category}</span>}
          <Link
            to={slug ? PATHS.product(slug) : '#'}
            className={styles.item__name}
          >
            {name}
          </Link>

          {/* Variant pills */}
          {variant && (
            <div className={styles.item__variants}>
              {variant.size  && <VariantPill label="Size"  value={variant.size}  />}
              {variant.color && <VariantPill label="Color" value={variant.color} colorHex={variant.colorHex!} />}
              {variant.sku   && <VariantPill label="SKU"   value={variant.sku}   muted />}
            </div>
          )}
        </div>

        {/* ── Controls row ──────────────────────────────────── */}
        <div className={styles.item__controls}>

          {/* Quantity stepper */}
          <div
            className={cn(styles.stepper, isProcessing && styles['stepper--disabled'])}
            role="group"
            aria-label={`Quantity for ${name}`}
          >
            <button
              className={styles.stepper__btn}
              onClick={decrease}
              disabled={isProcessing}
              aria-label={item.quantity === 1 ? 'Remove item' : 'Decrease quantity'}
            >
              {item.quantity === 1 ? <TrashIcon /> : '−'}
            </button>
            <span className={styles.stepper__value} aria-live="polite">
              {item.quantity}
            </span>
            <button
              className={styles.stepper__btn}
              onClick={increase}
              disabled={isProcessing}
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>

          {/* Unit price + subtotal */}
          <div className={styles.item__pricing}>
            {item.quantity > 1 && (
              <span className={styles.item__unit_price}>
                {formatCurrency(item.unitPrice)} × {item.quantity}
              </span>
            )}
            <span className={styles.item__subtotal}>
              {formatCurrency(item.subtotal)}
            </span>
          </div>
        </div>
      </div>

      {/* ── Remove button ──────────────────────────────────── */}
      <button
        className={styles.item__remove}
        onClick={() => removeItem(item._id)}
        disabled={isProcessing}
        aria-label={`Remove ${name} from cart`}
      >
        <TrashIcon />
      </button>
    </li>
  );
}

// ── Variant pill ──────────────────────────────────────────────
function VariantPill({
  label,
  value,
  colorHex,
  muted = false,
}: {
  label: string;
  value: string;
  colorHex?: string;
  muted?: boolean;
}) {
  return (
    <span className={cn(styles.variant_pill, muted && styles['variant_pill--muted'])}>
      {colorHex && (
        <span
          className={styles.variant_pill__swatch}
          style={{ background: colorHex }}
          aria-hidden="true"
        />
      )}
      <span className={styles.variant_pill__label}>{label}:</span>
      <span className={styles.variant_pill__value}>{value}</span>
    </span>
  );
}

// ── Icons ─────────────────────────────────────────────────────
function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4h6v2" />
    </svg>
  );
}