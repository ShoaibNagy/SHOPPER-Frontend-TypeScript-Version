// ─────────────────────────────────────────────────────────────
// router/GuestRoute.tsx
// Wraps routes that should only be visible to unauthenticated
// users (Login, Register, ForgotPassword, ResetPassword).
// • Authenticated → redirect to home (or the originally
//   intended destination if arriving from ProtectedRoute).
// ─────────────────────────────────────────────────────────────

import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@store/auth.store';
import { ROUTES } from './routes';

export default function GuestRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const location = useLocation();

  // If the user was redirected here from a protected page,
  // send them back there after logging in — not just to home.
  const intendedDestination =
    (location.state as { from?: Location } | null)?.from?.pathname ?? ROUTES.HOME;

  if (isAuthenticated) {
    return <Navigate to={intendedDestination} replace />;
  }

  return <Outlet />;
}