// ─────────────────────────────────────────────────────────────
// components/ui/Input.tsx
// ─────────────────────────────────────────────────────────────

import { forwardRef, useId } from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';
import { cn } from '@utils/cn';
import styles from './Input.module.scss';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string | undefined;
  hint?: string;
  prefixIcon?: ReactNode;
  suffixIcon?: ReactNode;
  /** Replaces the suffix icon with a clickable action (e.g. show/hide password) */
  suffixAction?: ReactNode;
  fullWidth?: boolean;
  /** Visual-only — does not change HTML type */
  inputSize?: 'sm' | 'md' | 'lg';
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      prefixIcon,
      suffixIcon,
      suffixAction,
      fullWidth = false,
      inputSize = 'md',
      className,
      id: externalId,
      disabled,
      required,
      ...rest
    },
    ref,
  ) => {
    const autoId = useId();
    const id = externalId ?? autoId;
    const errorId = `${id}-error`;
    const hintId = `${id}-hint`;

    const hasError = Boolean(error);
    const hasSuffix = Boolean(suffixIcon ?? suffixAction);

    return (
      <div
        className={cn(
          styles.field,
          fullWidth && styles['field--full'],
        )}
      >
        {/* Label */}
        {label && (
          <label htmlFor={id} className={styles.field__label}>
            {label}
            {required && (
              <span className={styles.field__required} aria-hidden="true">
                {' '}*
              </span>
            )}
          </label>
        )}

        {/* Input wrapper — positions icons */}
        <div
          className={cn(
            styles.field__wrap,
            styles[`field__wrap--${inputSize}`],
            hasError && styles['field__wrap--error'],
            disabled && styles['field__wrap--disabled'],
          )}
        >
          {prefixIcon && (
            <span className={styles.field__prefix} aria-hidden="true">
              {prefixIcon}
            </span>
          )}

          <input
            ref={ref}
            id={id}
            disabled={disabled}
            required={required}
            aria-invalid={hasError}
            aria-describedby={
              [hasError && errorId, hint && hintId].filter(Boolean).join(' ') || undefined
            }
            className={cn(
              styles.field__input,
              prefixIcon && styles['field__input--prefix'],
              hasSuffix && styles['field__input--suffix'],
              className,
            )}
            {...rest}
          />

          {(suffixIcon ?? suffixAction) && (
            <span
              className={cn(
                styles.field__suffix,
                suffixAction && styles['field__suffix--action'],
              )}
              aria-hidden={!suffixAction}
            >
              {suffixAction ?? suffixIcon}
            </span>
          )}
        </div>

        {/* Error message */}
        {hasError && (
          <p id={errorId} className={styles.field__error} role="alert">
            {error}
          </p>
        )}

        {/* Hint text */}
        {hint && !hasError && (
          <p id={hintId} className={styles.field__hint}>
            {hint}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';
export default Input;