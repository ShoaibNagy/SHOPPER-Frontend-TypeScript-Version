// ─────────────────────────────────────────────────────────────
// components/layout/PageWrapper.tsx
// Layout shell shared by all non-standalone pages.
// Renders: Navbar → <Outlet /> (page content) → Footer
//
// Stub — full Navbar/Footer implementations come in the
// components milestone. The structure is wired so the router
// works end-to-end right now.
// ─────────────────────────────────────────────────────────────

import { Outlet } from 'react-router-dom';

export default function PageWrapper() {
  return (
    <>
      {/* Navbar placeholder — replaced in components milestone */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 200,
          height: 68,
          background: 'rgba(10,10,10,0.85)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 2rem',
          color: '#f5f5f5',
          fontFamily: 'sans-serif',
          fontSize: '0.875rem',
          letterSpacing: '0.05em',
        }}
      >
        SHOPPER — Navbar placeholder
      </header>

      {/* Page content injected by React Router */}
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>

      {/* Footer placeholder — replaced in components milestone */}
      <footer
        style={{
          borderTop: '1px solid rgba(255,255,255,0.06)',
          padding: '2rem',
          color: '#525252',
          fontFamily: 'sans-serif',
          fontSize: '0.75rem',
          textAlign: 'center',
        }}
      >
        SHOPPER — Footer placeholder
      </footer>
    </>
  );
}