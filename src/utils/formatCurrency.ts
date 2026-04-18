// ─────────────────────────────────────────────────────────────
// utils/formatCurrency.ts
// ─────────────────────────────────────────────────────────────

const DEFAULT_LOCALE = 'en-US';
const DEFAULT_CURRENCY = 'USD';

/**
 * Formats a number as a currency string.
 * @example formatCurrency(29.99)         → "$29.99"
 * @example formatCurrency(29.99, 'EUR')  → "€29.99"
 */
export function formatCurrency(
  amount: number,
  currency = DEFAULT_CURRENCY,
  locale = DEFAULT_LOCALE,
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Calculates the discount percentage between original and sale price.
 * @example discountPercent(100, 79) → 21
 */
export function discountPercent(originalPrice: number, salePrice: number): number {
  if (originalPrice <= 0) return 0;
  return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
}

/**
 * Converts cents (Stripe amounts) to dollars.
 * @example centsToDollars(2999) → 29.99
 */
export function centsToDollars(cents: number): number {
  return cents / 100;
}