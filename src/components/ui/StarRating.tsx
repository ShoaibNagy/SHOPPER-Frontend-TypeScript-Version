// ─────────────────────────────────────────────────────────────
// components/ui/StarRating.tsx
// Dual-mode: read-only display OR interactive input.
// Half-star rendering for display mode.
// Full keyboard support for interactive mode.
// ─────────────────────────────────────────────────────────────

import { useId, useState } from 'react';
import { cn } from '@utils/cn';
import styles from './StarRating.module.scss';

// ── Display (read-only) ───────────────────────────────────────
export interface StarRatingDisplayProps {
  rating: number;         // 0–5, supports decimals (4.3)
  reviewCount?: number;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  className?: string;
}

export function StarRatingDisplay({
  rating,
  reviewCount,
  size = 'md',
  showValue = false,
  className,
}: StarRatingDisplayProps) {
  const pct = Math.max(0, Math.min(5, rating)) / 5 * 100;

  return (
    <span
      className={cn(styles.display, styles[`display--${size}`], className)}
      aria-label={`Rating: ${rating.toFixed(1)} out of 5${reviewCount !== undefined ? `, ${reviewCount} reviews` : ''}`}
      role="img"
    >
      {/* Empty stars layer */}
      <span className={styles.display__empty} aria-hidden="true">
        {Array.from({ length: 5 }).map((_, i) => (
          <StarIcon key={i} className={styles.star} />
        ))}
      </span>

      {/* Filled stars layer — clipped to exact percentage */}
      <span
        className={styles.display__filled}
        style={{ width: `${pct}%` }}
        aria-hidden="true"
      >
        {Array.from({ length: 5 }).map((_, i) => (
          <StarIcon key={i} className={cn(styles.star, styles['star--filled'])} />
        ))}
      </span>

      {showValue && (
        <span className={styles.display__value}>{rating.toFixed(1)}</span>
      )}

      {reviewCount !== undefined && (
        <span className={styles.display__count}>({reviewCount.toLocaleString()})</span>
      )}
    </span>
  );
}

// ── Interactive (input) ───────────────────────────────────────
export interface StarRatingInputProps {
  value: number;           // 1–5
  onChange: (value: number) => void;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
}

export function StarRatingInput({
  value,
  onChange,
  size = 'lg',
  disabled = false,
  className,
}: StarRatingInputProps) {
  const groupId = useId();
  const [hovered, setHovered] = useState(0);
  const active = hovered > 0 ? hovered : value;

  const LABELS = ['Terrible', 'Poor', 'Fair', 'Good', 'Excellent'];

  return (
    <span
      className={cn(
        styles.input,
        styles[`input--${size}`],
        disabled && styles['input--disabled'],
        className,
      )}
      role="radiogroup"
      aria-label="Star rating"
    >
      {Array.from({ length: 5 }).map((_, i) => {
        const star = i + 1;
        const inputId = `${groupId}-star-${star}`;
        const isActive = star <= active;

        return (
          <label
            key={star}
            htmlFor={inputId}
            className={cn(
              styles.input__star,
              isActive && styles['input__star--active'],
            )}
            onMouseEnter={() => !disabled && setHovered(star)}
            onMouseLeave={() => !disabled && setHovered(0)}
            aria-label={`${star} — ${LABELS[i]}`}
          >
            <input
              type="radio"
              id={inputId}
              name={groupId}
              value={star}
              checked={value === star}
              onChange={() => !disabled && onChange(star)}
              className={styles.input__radio}
              disabled={disabled}
              aria-label={LABELS[i]}
            />
            <StarIcon className={styles.star} />
          </label>
        );
      })}

      {/* Current label */}
      {active > 0 && (
        <span className={styles.input__label} aria-live="polite">
          {LABELS[active - 1]}
        </span>
      )}
    </span>
  );
}

// ── Shared star SVG icon ──────────────────────────────────────
function StarIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

// Default export: display mode (most common usage)
export default StarRatingDisplay;