// ─────────────────────────────────────────────────────────────
// components/ui/Button.tsx
// ─────────────────────────────────────────────────────────────

import { forwardRef } from 'react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@utils/cn';
import styles from './Button.module.scss';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  children?: ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      fullWidth = false,
      iconLeft,
      iconRight,
      children,
      className,
      disabled,
      ...rest
    },
    ref,
  ) => {
    const isDisabled = disabled ?? loading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        aria-busy={loading}
        className={cn(
          styles.btn,
          styles[`btn--${variant}`],
          styles[`btn--${size}`],
          fullWidth && styles['btn--full'],
          loading && styles['btn--loading'],
          className,
        )}
        {...rest}
      >
        {/* Loading spinner overlay */}
        {loading && (
          <span className={styles.btn__spinner} aria-hidden="true" />
        )}

        {/* Inner content — hidden but space-preserved when loading */}
        <span className={cn(styles.btn__content, loading && styles['btn__content--hidden'])}>
          {iconLeft && (
            <span className={styles.btn__icon} aria-hidden="true">
              {iconLeft}
            </span>
          )}
          {children}
          {iconRight && (
            <span className={cn(styles.btn__icon, styles['btn__icon--right'])} aria-hidden="true">
              {iconRight}
            </span>
          )}
        </span>
      </button>
    );
  },
);

Button.displayName = 'Button';
export default Button;