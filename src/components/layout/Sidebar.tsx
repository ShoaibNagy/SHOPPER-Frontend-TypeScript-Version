// ─────────────────────────────────────────────────────────────
// components/layout/Sidebar.tsx
// Collapsible filter sidebar for the Shop page.
// On desktop: persistent panel alongside the product grid.
// On mobile:  slides in from the left as an overlay.
// ─────────────────────────────────────────────────────────────

import { type ReactNode } from 'react';
import { cn } from '@utils/cn';
import styles from './Sidebar.module.scss';

export interface SidebarSection {
  id: string;
  title: string;
  content: ReactNode;
  defaultOpen?: boolean;
}

export interface SidebarProps {
  /** Mobile: whether the sidebar overlay is visible */
  isOpen: boolean;
  onClose: () => void;
  sections: SidebarSection[];
  /** Count of active filters — shown in mobile trigger badge */
  activeFilterCount?: number;
  onClearAll?: () => void;
  className?: string;
}

export default function Sidebar({
  isOpen,
  onClose,
  sections,
  activeFilterCount = 0,
  onClearAll,
  className,
}: SidebarProps) {
  return (
    <>
      {/* ── Sidebar panel ──────────────────────────────────── */}
      <aside
        className={cn(
          styles.sidebar,
          isOpen && styles['sidebar--open'],
          className,
        )}
        aria-label="Product filters"
      >
        {/* Header — only shown on mobile overlay */}
        <div className={styles.sidebar__header}>
          <span className={styles.sidebar__header__title}>
            Filters
            {activeFilterCount > 0 && (
              <span className={styles.sidebar__header__count}>{activeFilterCount}</span>
            )}
          </span>
          <div className={styles.sidebar__header__actions}>
            {activeFilterCount > 0 && onClearAll && (
              <button className={styles.sidebar__clear} onClick={onClearAll}>
                Clear all
              </button>
            )}
            {/* Close button — mobile only */}
            <button
              className={styles.sidebar__close}
              onClick={onClose}
              aria-label="Close filters"
            >
              <CloseIcon />
            </button>
          </div>
        </div>

        {/* Sections */}
        <div className={styles.sidebar__body}>
          {sections.map((section) => (
            <SidebarAccordion key={section.id} section={section} />
          ))}
        </div>
      </aside>

      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className={styles.sidebar__backdrop}
          onClick={onClose}
          aria-hidden="true"
        />
      )}
    </>
  );
}

// ── Accordion section ─────────────────────────────────────────
function SidebarAccordion({ section }: { section: SidebarSection }) {
  return (
    <details
      className={styles.accordion}
      open={section.defaultOpen ?? true}
    >
      <summary className={styles.accordion__trigger}>
        {section.title}
        <ChevronIcon />
      </summary>
      <div className={styles.accordion__content}>
        {section.content}
      </div>
    </details>
  );
}

// ── Inline SVG icons ──────────────────────────────────────────
function ChevronIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.accordion__chevron} aria-hidden="true">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}