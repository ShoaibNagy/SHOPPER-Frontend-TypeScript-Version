// ─────────────────────────────────────────────────────────────
// components/layout/PageWrapper.tsx
// Layout shell — Navbar + page content (Outlet) + Footer.
// CartDrawer is mounted here so it's available on every page.
// ─────────────────────────────────────────────────────────────

import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import CartDrawer from './CartDrawer';
import styles from './PageWrapper.module.scss';

export default function PageWrapper() {
  return (
    <div className={styles.wrapper}>
      <Navbar />
      <main className={styles.main}>
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
    </div>
  );
}