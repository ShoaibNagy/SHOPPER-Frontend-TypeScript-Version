// ─────────────────────────────────────────────────────────────
// components/product/ProductImageGallery.tsx
// ─────────────────────────────────────────────────────────────

import {
    useCallback,
    useEffect,
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
    const [activeIdx,  setActiveIdx]  = useState(0);
    const [zoomed,     setZoomed]     = useState(false);
    const [zoomPos,    setZoomPos]    = useState({ x: 50, y: 50 });
    const [isLoaded,   setIsLoaded]   = useState<boolean[]>(() => images.map(() => false));
  
    const mainRef   = useRef<HTMLDivElement>(null);
    const touchStartX = useRef<number | null>(null);
  
    const total   = images.length;
    const current = images[activeIdx];
  
    // ── Keyboard navigation on the main image ────────────────────
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft')  prev();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'Escape')     setZoomed(false);
    }
  
    const prev = useCallback(() => setActiveIdx((i) => (i - 1 + total) % total), [total]);
    const next = useCallback(() => setActiveIdx((i) => (i + 1) % total),         [total]);
  
    // ── Touch swipe on mobile ─────────────────────────────────────
    function handleTouchStart(e: TouchEvent) {
      touchStartX.current = e.touches[0]?.clientX ?? null;
    }
  
    function handleTouchEnd(e: TouchEvent) {
      if (touchStartX.current === null) return;
      const delta = (e.changedTouches[0]?.clientX ?? 0) - touchStartX.current;
      if (Math.abs(delta) > 40) delta < 0 ? next() : prev();
      touchStartX.current = null;
    }
  
    // ── Zoom: track cursor for CSS transform-origin ───────────────
    function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
      if (!zoomed || !mainRef.current) return;
      const { left, top, width, height } = mainRef.current.getBoundingClientRect();
      const x = ((e.clientX - left) / width)  * 100;
      const y = ((e.clientY - top)  / height) * 100;
      setZoomPos({ x, y });
    }
  
    // Reset zoom when switching images
    useEffect(() => { setZoomed(false); }, [activeIdx]);
  
    // Mark image as loaded
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
          style={zoomed ? { '--zoom-x': `${zoomPos.x}%`, '--zoom-y': `${zoomPos.y}%` } as React.CSSProperties : undefined}
          aria-pressed={zoomed}
          aria-description={zoomed ? 'Click to zoom out' : 'Click to zoom in'}
        >
          {/* Loading shimmer */}
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
  
          {/* Zoom cursor indicator */}
          <div className={cn(styles.main__zoom_hint, zoomed && styles['main__zoom_hint--active'])} aria-hidden="true">
            {zoomed ? <ZoomOutIcon /> : <ZoomInIcon />}
          </div>
  
          {/* Prev / Next arrows — shown on hover */}
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
  
          {/* Dot indicators (mobile) */}
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
          <div
            className={styles.thumbs}
            role="tablist"
            aria-label="Product images"
          >
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
                <img
                  src={img.url}
                  alt=""
                  aria-hidden="true"
                  className={styles.thumb__img}
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }
  
  // ── Placeholder when no images ────────────────────────────────
  function GalleryPlaceholder() {
    return (
      <div className={styles.placeholder} aria-label="No images available">
        <ImageIcon />
      </div>
    );
  }
  
  // ── Inline SVG icons ──────────────────────────────────────────
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