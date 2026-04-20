// pages/NotFound.tsx
import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ROUTES } from '@/router/routes';
import styles from './NotFound.module.scss';

export default function NotFound() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.nf-el', {
        y: 30, opacity: 0, duration: 0.7,
        ease: 'power3.out', stagger: 0.1,
      });
    }, rootRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={rootRef} className={styles.page}>
      <div className={styles.container}>
        <p className={`${styles.code} nf-el`} aria-hidden="true">404</p>
        <h1 className={`${styles.heading} nf-el`}>Page not found</h1>
        <p className={`${styles.sub} nf-el`}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className={`${styles.actions} nf-el`}>
          <Link to={ROUTES.HOME}  className={styles.btn_primary}>Go home</Link>
          <Link to={ROUTES.SHOP}  className={styles.btn_ghost}>Browse shop</Link>
        </div>
        {/* Decorative large number behind */}
        <span className={styles.bg_num} aria-hidden="true">404</span>
      </div>
    </div>
  );
}