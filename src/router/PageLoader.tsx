// ─────────────────────────────────────────────────────────────
// router/PageLoader.tsx
// Shown as the Suspense fallback while lazy-loaded page
// chunks are being fetched from the CDN.
// Kept intentionally minimal — just a centered spinner so
// the user knows something is happening.
// ─────────────────────────────────────────────────────────────

export default function PageLoader() {
    return (
      <div
        style={{
          minHeight: '100dvh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0a0a0a',
        }}
        aria-label="Loading page"
        role="status"
      >
        {/* Brand-colored spinning ring */}
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            border: '3px solid rgba(249,115,22,0.2)',
            borderTopColor: '#f97316',
            animation: 'spin 0.7s linear infinite',
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }