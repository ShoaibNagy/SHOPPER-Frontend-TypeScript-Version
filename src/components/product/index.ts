// ─────────────────────────────────────────────────────────────
// components/product/index.ts  —  barrel export
// ─────────────────────────────────────────────────────────────

export { default as ProductCard }          from './ProductCard';
export type { ProductCardProps }           from './ProductCard';

export { default as ProductGrid }          from './ProductGrid';
export type { ProductGridProps, GridView } from './ProductGrid';

export { default as ProductFilters }       from './ProductFilters';
export type { ProductFiltersProps }        from './ProductFilters';

export { default as ProductImageGallery }  from './ProductImageGallery';
export type { ProductImageGalleryProps }   from './ProductImageGallery';