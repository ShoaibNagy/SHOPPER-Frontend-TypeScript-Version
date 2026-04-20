// pages/Shop.tsx
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useProducts } from '@hooks/useProducts';
import { ProductGrid, ProductFilters } from '@components/product';
import type { ProductFilters as FilterType } from '@types';
import styles from './Shop.module.scss';

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filterOpen, setFilterOpen]     = useState(false);

  const page = Number(searchParams.get('page')) || 1;
  const category = searchParams.get('category');
  const minPriceRaw = searchParams.get('minPrice');
  const maxPriceRaw = searchParams.get('maxPrice');
  const search = searchParams.get('q');
  const sort = searchParams.get('sort');
  const sortBy = sort?.split(':')[0];
  const sortOrder = sort?.split(':')[1] as 'asc' | 'desc' | undefined;
  const sizes = searchParams.getAll('size');
  const colors = searchParams.getAll('color');

  const filters: FilterType = {
    page,
    limit: 24,
    ...(category ? { category } : {}),
    ...(minPriceRaw ? { minPrice: Number(minPriceRaw) } : {}),
    ...(maxPriceRaw ? { maxPrice: Number(maxPriceRaw) } : {}),
    ...(searchParams.get('inStock') === 'true' ? { inStock: true } : {}),
    ...(searchParams.get('isFeatured') === 'true' ? { isFeatured: true } : {}),
    ...(searchParams.get('isNew') === 'true' ? { isNew: true } : {}),
    ...(search ? { search } : {}),
    ...(sortBy ? { sortBy } : {}),
    ...(sortOrder ? { sortOrder } : {}),
    ...(sizes.length ? { size: sizes.join(',') } : {}),
    ...(colors.length ? { color: colors.join(',') } : {}),
  };

  const { data, isLoading } = useProducts(filters);

  function handlePageChange(page: number) {
    setSearchParams((prev) => { const n = new URLSearchParams(prev); n.set('page', String(page)); return n; });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const searchQuery = searchParams.get('q');

  return (
    <div className={styles.page}>
      <div className={styles.page__header}>
        <div className={styles.page__header__inner}>
          <div>
            <h1 className={styles.page__title}>
              {searchQuery ? `Results for "${searchQuery}"` : 'Shop'}
            </h1>
            {filters.category && (
              <p className={styles.page__subtitle}>{filters.category.charAt(0).toUpperCase() + filters.category.slice(1)}</p>
            )}
          </div>
          <button className={styles.filter_trigger} onClick={() => setFilterOpen(true)} aria-label="Open filters">
            <FilterIcon /> Filters
          </button>
        </div>
      </div>

      <div className={styles.layout}>
        <ProductFilters isOpen={filterOpen} onClose={() => setFilterOpen(false)} />
        <div className={styles.grid_col}>
          <ProductGrid data={data!} isLoading={isLoading} onPageChange={handlePageChange} />
        </div>
      </div>
    </div>
  );
}

function FilterIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/></svg>;
}