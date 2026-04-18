// ─────────────────────────────────────────────────────────────
// components/ui/Modal.tsx
// ─────────────────────────────────────────────────────────────

import {
    useEffect,
    useRef,
    type KeyboardEvent,
    type MouseEvent,
    type ReactNode,
  } from 'react';
  import { createPortal } from 'react-dom';
  import { cn } from '@utils/cn';
  import styles from './Modal.module.scss';
  
  export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';
  
  export interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    description?: string;
    size?: ModalSize;
    /** Prevent closing when clicking the backdrop */
    preventBackdropClose?: boolean;
    /** Prevent closing with Escape key */
    preventEscClose?: boolean;
    children: ReactNode;
    footer?: ReactNode;
    className?: string;
  }
  
  export default function Modal({
    isOpen,
    onClose,
    title,
    description,
    size = 'md',
    preventBackdropClose = false,
    preventEscClose = false,
    children,
    footer,
    className,
  }: ModalProps) {
    const dialogRef = useRef<HTMLDivElement>(null);
  
    // ── Lock body scroll when open ──────────────────────────────
    useEffect(() => {
      if (!isOpen) return;
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }, [isOpen]);
  
    // ── Focus trap & Escape handler ─────────────────────────────
    useEffect(() => {
      if (!isOpen) return;
  
      // Focus the dialog itself on open
      dialogRef.current?.focus();
  
      function handleKeyDown(e: globalThis.KeyboardEvent) {
        if (e.key === 'Escape' && !preventEscClose) {
          onClose();
          return;
        }
  
        // Focus trap — keep tab navigation inside the modal
        if (e.key !== 'Tab' || !dialogRef.current) return;
  
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
  
        if (e.shiftKey) {
          if (document.activeElement === first) { e.preventDefault(); last?.focus(); }
        } else {
          if (document.activeElement === last) { e.preventDefault(); first?.focus(); }
        }
      }
  
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose, preventEscClose]);
  
    function handleBackdropClick(e: MouseEvent<HTMLDivElement>) {
      if (!preventBackdropClose && e.target === e.currentTarget) onClose();
    }
  
    function handleBackdropKeyDown(e: KeyboardEvent<HTMLDivElement>) {
      if (!preventBackdropClose && (e.key === 'Enter' || e.key === ' ')) onClose();
    }
  
    if (!isOpen) return null;
  
    return createPortal(
      <div
        className={styles.backdrop}
        onClick={handleBackdropClick}
        onKeyDown={handleBackdropKeyDown}
        role="presentation"
        aria-hidden="false"
      >
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? 'modal-title' : undefined}
          aria-describedby={description ? 'modal-desc' : undefined}
          tabIndex={-1}
          className={cn(
            styles.modal,
            styles[`modal--${size}`],
            className,
          )}
          // Stop click propagation so backdrop handler doesn't fire
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          {(title ?? description) && (
            <div className={styles.modal__header}>
              {title && (
                <h2 id="modal-title" className={styles.modal__title}>
                  {title}
                </h2>
              )}
              {description && (
                <p id="modal-desc" className={styles.modal__description}>
                  {description}
                </p>
              )}
            </div>
          )}
  
          {/* Close button */}
          <button
            className={styles.modal__close}
            onClick={onClose}
            aria-label="Close modal"
          >
            {/* ✕ drawn as CSS cross */}
            <span aria-hidden="true" />
            <span aria-hidden="true" />
          </button>
  
          {/* Body */}
          <div className={styles.modal__body}>{children}</div>
  
          {/* Footer */}
          {footer && <div className={styles.modal__footer}>{footer}</div>}
        </div>
      </div>,
      document.body,
    );
  }