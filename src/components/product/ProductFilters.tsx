// ─────────────────────────────────────────────────────────────
// components/product/ProductFilters.tsx
// All filter state is managed via URL search params so filters
// are shareable, bookmarkable, and survive page refresh.
// ─────────────────────────────────────────────────────────────

import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useCategories } from '@hooks/useProducts';
import { cn } from '@utils/cn';
import { Sidebar } from '@components/layout';
import type { SidebarSection } from '@components/layout/Sidebar';
import styles from './ProductFilters.module.scss';

// ── Hardcoded filter options ──────────────────────────────────
const SIZE_OPTIONS   = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const COLOR_OPTIONS  = [
  { label: 'Black',  hex: '#111111' },
  { label: 'White',  hex: '#f5f5f5' },
  { label: 'Navy',   hex: '#1e3a5f' },
  { label: 'Beige',  hex: '#c8b89a' },
  { label: 'Olive',  hex: '#6b7b4a' },
  { label: 'Red',    hex: '#c0392b' },
  { label: 'Pink',   hex: '#e8a0b0' },
  { label: 'Brown',  hex: '#7a5230' },
];
const SORT_OPTIONS = [
  { label: 'Newest',       value: 'createdAt:desc'   },
  { label: 'Price: Low',   value: 'price:asc'        },
  { label: 'Price: High',  value: 'price:desc'       },
  { label: 'Top Rated',    value: 'rating:desc'      },
  { label: 'Best Selling', value: 'soldCount:desc'   },
] as const;

export interface ProductFiltersProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProductFilters({ isOpen, onClose }: ProductFiltersProps) {
  const [params, setParams] = useSearchParams();
  const { data: categories } = useCategories();

  // ── Param helpers ─────────────────────────────────────────
  const get    = useCallback((key: string) => params.get(key) ?? '',   [params]);
  const getArr = useCallback((key: string) => params.getAll(key),      [params]);

  function set(key: string, value: string) {
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) next.set(key, value); else next.delete(key);
      next.delete('page'); // reset pagination on filter change
      return next;
    });
  }

  function toggleArr(key: string, value: string) {
    setParams((prev) => {
      const next    = new URLSearchParams(prev);
      const current = next.getAll(key);
      next.delete(key);
      if (current.includes(value)) {
        current.filter((v) => v !== value).forEach((v) => next.append(key, v));
      } else {
        [...current, value].forEach((v) => next.append(key, v));
      }
      next.delete('page');
      return next;
    });
  }

  function clearAll() {
    setParams(new URLSearchParams());
  }

  // ── Active filter count ───────────────────────────────────
  const activeCount = [
    get('category'), get('minPrice'), get('maxPrice'), get('sort'),
    ...getArr('size'), ...getArr('color'),
  ].filter(Boolean).length;

  // ── Section definitions ───────────────────────────────────
  const sections: SidebarSection[] = [
    {
      id:          'sort',
      title:       'Sort by',
      defaultOpen: true,
      content: (
        <div className={styles.sort_group}>
          {SORT_OPTIONS.map(({ label, value }) => (
            <button
              key={value}
              className={cn(
                styles.sort_btn,
                get('sort') === value && styles['sort_btn--active'],
              )}
              onClick={() => set('sort', get('sort') === value ? '' : value)}
            >
              {label}
              {get('sort') === value && <CheckIcon />}
            </button>
          ))}
        </div>
      ),
    },
    {
      id:          'category',
      title:       'Category',
      defaultOpen: true,
      content: (
        <div className={styles.check_group}>
          {(categories ?? []).map((cat) => (
            <label key={cat._id} className={styles.check_row}>
              <input
                type="radio"
                name="category"
                value={cat.slug}
                checked={get('category') === cat.slug}
                onChange={(e) => set('category', e.target.checked ? cat.slug : '')}
                className={styles.check_input}
              />
              <span className={styles.check_box} aria-hidden="true" />
              <span className={styles.check_label}>{cat.name}</span>
            </label>
          ))}
          {get('category') && (
            <button className={styles.clear_btn} onClick={() => set('category', '')}>
              Clear
            </button>
          )}
        </div>
      ),
    },
    {
      id:          'price',
      title:       'Price range',
      defaultOpen: true,
      content: (
        <div className={styles.price_group}>
          <div className={styles.price_row}>
            <label className={styles.price_label} htmlFor="minPrice">Min</label>
            <div className={styles.price_input_wrap}>
              <span className={styles.price_currency}>$</span>
              <input
                id="minPrice"
                type="number"
                min={0}
                value={get('minPrice')}
                placeholder="0"
                className={styles.price_input}
                onChange={(e) => set('minPrice', e.target.value)}
              />
            </div>
          </div>
          <span className={styles.price_sep}>—</span>
          <div className={styles.price_row}>
            <label className={styles.price_label} htmlFor="maxPrice">Max</label>
            <div className={styles.price_input_wrap}>
              <span className={styles.price_currency}>$</span>
              <input
                id="maxPrice"
                type="number"
                min={0}
                value={get('maxPrice')}
                placeholder="9999"
                className={styles.price_input}
                onChange={(e) => set('maxPrice', e.target.value)}
              />
            </div>
          </div>
        </div>
      ),
    },
    {
      id:          'size',
      title:       'Size',
      defaultOpen: true,
      content: (
        <div className={styles.size_group}>
          {SIZE_OPTIONS.map((size) => {
            const active = getArr('size').includes(size);
            return (
              <button
                key={size}
                className={cn(styles.size_btn, active && styles['size_btn--active'])}
                onClick={() => toggleArr('size', size)}
                aria-pressed={active}
              >
                {size}
              </button>
            );
          })}
        </div>
      ),
    },
    {
      id:          'color',
      title:       'Color',
      defaultOpen: true,
      content: (
        <div className={styles.color_group}>
          {COLOR_OPTIONS.map(({ label, hex }) => {
            const active = getArr('color').includes(label);
            return (
              <button
                key={label}
                className={cn(styles.color_btn, active && styles['color_btn--active'])}
                style={{ '--color-hex': hex } as React.CSSProperties}
                onClick={() => toggleArr('color', label)}
                aria-pressed={active}
                aria-label={label}
                title={label}
              />
            );
          })}
        </div>
      ),
    },
    {
      id:      'availability',
      title:   'Availability',
      content: (
        <label className={styles.check_row}>
          <input
            type="checkbox"
            checked={get('inStock') === 'true'}
            onChange={(e) => set('inStock', e.target.checked ? 'true' : '')}
            className={styles.check_input}
          />
          <span className={styles.check_box} aria-hidden="true" />
          <span className={styles.check_label}>In stock only</span>
        </label>
      ),
    },
  ];

  return (
    <Sidebar
      isOpen={isOpen}
      onClose={onClose}
      sections={sections}
      activeFilterCount={activeCount}
      onClearAll={clearAll}
    />
  );
}

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <polyline points="2 6 5 9 10 3" />
    </svg>
  );
}