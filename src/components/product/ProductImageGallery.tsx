// ─────────────────────────────────────────────────────────────
// components/product/ProductImageGallery.tsx
// ─────────────────────────────────────────────────────────────

import {
  useRef,
  useState,
  type KeyboardEvent,
  type TouchEvent,
} from 'react';
import { cn } from '@utils/cn';
import type { ProductImage } from '@types';
import styles from './ProductImageGallery.module.scss';

export interface ProductImageGalleryProps {
  images: ProductImage[];
  productName: string;
  className?: string;
}

export default function ProductImageGallery({
  images,
  productName,
  className,
}: ProductImageGalleryProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [zoomed,    setZoomed]    = useState(false);
  const [zoomPos,   setZoomPos]   = useState({ x: 50, y: 50 });
  const [isLoaded,  setIsLoaded]  = useState<boolean[]>(() => images.map(() => false));

  const mainRef     = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const prevIdx     = useRef(activeIdx);
  const prevImages  = useRef(images);

  const total   = images.length;
  const current = images[activeIdx];

  // Plain functions — React Compiler handles memoisation automatically.
  // Removed useCallback to satisfy the react-hooks/preserve-manual-memoization rule.
  function prev() { setActiveIdx((i) => (i - 1 + total) % total); }
  function next() { setActiveIdx((i) => (i + 1) % total); }

  // ── Keyboard navigation ───────────────────────────────────────
  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'ArrowLeft')  prev();
    if (e.key === 'ArrowRight') next();
    if (e.key === 'Escape')     setZoomed(false);
  }

  // ── Touch swipe on mobile ─────────────────────────────────────
  function handleTouchStart(e: TouchEvent) {
    touchStartX.current = e.touches[0]?.clientX ?? null;
  }

  function handleTouchEnd(e: TouchEvent) {
    if (touchStartX.current === null) return;
    const delta = (e.changedTouches[0]?.clientX ?? 0) - touchStartX.current;
    // FIX: was `delta < 0 ? next() : prev()` (bare expression, no void/assignment)
    if (Math.abs(delta) > 40) {
      if (delta < 0) { next(); } else { prev(); }
    }
    touchStartX.current = null;
  }

  // ── Zoom: track cursor for CSS transform-origin ───────────────
  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!zoomed || !mainRef.current) return;
    const { left, top, width, height } = mainRef.current.getBoundingClientRect();
    setZoomPos({
      x: ((e.clientX - left) / width)  * 100,
      y: ((e.clientY - top)  / height) * 100,
    });
  }

  // ── Reset zoom when switching images ─────────────────────────
  // Adjust state during render (React-recommended pattern) to avoid
  // calling setState inside an effect body.
  if (prevIdx.current !== activeIdx) {
    prevIdx.current = activeIdx;
    setZoomed(false);
  }

  // ── Reset isLoaded array when the images prop changes ─────────
  if (prevImages.current !== images) {
    prevImages.current = images;
    setIsLoaded(images.map(() => false));
  }

  function markLoaded(idx: number) {
    setIsLoaded((prev) => {
      const next = [...prev];
      next[idx] = true;
      return next;
    });
  }

  if (!images.length) return <GalleryPlaceholder />;

  return (
    <div className={cn(styles.gallery, className)}>

      {/* ── Main image ────────────────────────────────────── */}
      <div
        ref={mainRef}
        className={cn(styles.main, zoomed && styles['main--zoomed'])}
        role="img"
        aria-label={`${productName} — image ${activeIdx + 1} of ${total}`}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onClick={() => setZoomed((v) => !v)}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setZoomed(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={zoomed ? ({ '--zoom-x': `${zoomPos.x}%`, '--zoom-y': `${zoomPos.y}%` } as React.CSSProperties) : undefined}
        aria-pressed={zoomed}
        aria-description={zoomed ? 'Click to zoom out' : 'Click to zoom in'}
      >
        {!isLoaded[activeIdx] && (
          <div className={cn('skeleton', styles.main__skeleton)} aria-hidden="true" />
        )}

        <img
          key={current.url}
          src={current.url}
          alt={current.alt ?? `${productName} — view ${activeIdx + 1}`}
          className={cn(
            styles.main__img,
            isLoaded[activeIdx] && styles['main__img--loaded'],
            zoomed && styles['main__img--zoomed'],
          )}
          onLoad={() => markLoaded(activeIdx)}
          draggable={false}
        />

        <div className={cn(styles.main__zoom_hint, zoomed && styles['main__zoom_hint--active'])} aria-hidden="true">
          {zoomed ? <ZoomOutIcon /> : <ZoomInIcon />}
        </div>

        {total > 1 && (
          <>
            <button
              className={cn(styles.arrow, styles['arrow--prev'])}
              onClick={(e) => { e.stopPropagation(); prev(); }}
              aria-label="Previous image"
            >
              <ChevronLeftIcon />
            </button>
            <button
              className={cn(styles.arrow, styles['arrow--next'])}
              onClick={(e) => { e.stopPropagation(); next(); }}
              aria-label="Next image"
            >
              <ChevronRightIcon />
            </button>
          </>
        )}

        {total > 1 && (
          <div className={styles.dots} role="tablist" aria-label="Image navigation">
            {images.map((_, i) => (
              <button
                key={i}
                role="tab"
                aria-selected={i === activeIdx}
                aria-label={`Image ${i + 1}`}
                className={cn(styles.dot, i === activeIdx && styles['dot--active'])}
                onClick={(e) => { e.stopPropagation(); setActiveIdx(i); }}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Thumbnail strip ────────────────────────────────── */}
      {total > 1 && (
        <div className={styles.thumbs} role="tablist" aria-label="Product images">
          {images.map((img, i) => (
            <button
              key={img.url}
              role="tab"
              aria-selected={i === activeIdx}
              aria-label={`View image ${i + 1}`}
              className={cn(styles.thumb, i === activeIdx && styles['thumb--active'])}
              onClick={() => setActiveIdx(i)}
              onMouseEnter={() => setActiveIdx(i)}
            >
              <img src={img.url} alt="" aria-hidden="true" className={styles.thumb__img} loading="lazy" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function GalleryPlaceholder() {
  return (
    <div className={styles.placeholder} aria-label="No images available">
      <ImageIcon />
    </div>
  );
}

function ChevronLeftIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}
function ChevronRightIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}
function ZoomInIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35M11 8v6M8 11h6" />
    </svg>
  );
}
function ZoomOutIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35M8 11h6" />
    </svg>
  );
}
function ImageIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
    </svg>
  );
}