// ─────────────────────────────────────────────────────────────
// router/ScrollToTop.tsx
// Scrolls window to top on every route change.
// React Router v7 does not do this automatically.
// ─────────────────────────────────────────────────────────────

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);

  return null;
}