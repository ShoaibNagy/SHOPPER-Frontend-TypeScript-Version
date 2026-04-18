// ─────────────────────────────────────────────────────────────
// components/ui/Spinner.tsx
// ─────────────────────────────────────────────────────────────

import { cn } from '@utils/cn';
import styles from './Spinner.module.scss';

export type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type SpinnerColor = 'brand' | 'white' | 'muted';

export interface SpinnerProps {
  size?: SpinnerSize;
  color?: SpinnerColor;
  /** Screen-reader label — defaults to "Loading" */
  label?: string;
  /** Centers the spinner in its parent container */
  centered?: boolean;
  className?: string;
}

export default function Spinner({
  size = 'md',
  color = 'brand',
  label = 'Loading',
  centered = false,
  className,
}: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label={label}
      className={cn(
        styles.spinner,
        styles[`spinner--${size}`],
        styles[`spinner--${color}`],
        centered && styles['spinner--centered'],
        className,
      )}
    >
      <span className={styles.spinner__ring} aria-hidden="true" />
      <span className={styles.spinner__label}>{label}</span>
    </span>
  );
}