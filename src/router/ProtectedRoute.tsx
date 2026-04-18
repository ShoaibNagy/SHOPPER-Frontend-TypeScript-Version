// ─────────────────────────────────────────────────────────────
// router/ProtectedRoute.tsx
// Wraps routes that require authentication.
// • Unauthenticated → redirect to /login, preserving the
//   originally-requested URL in location.state.from so Login
//   can send the user back after a successful sign-in.
// • Authenticated but wrong role → redirect to home.
// ─────────────────────────────────────────────────────────────

import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@store/auth.store';
import { ROUTES } from './routes';

interface ProtectedRouteProps {
  /** If true, only admin users may access the child routes. */
  adminOnly?: boolean;
}

export default function ProtectedRoute({ adminOnly = false }: ProtectedRouteProps) {
  const location = useLocation();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isAdmin = useAuthStore((s) => s.isAdmin);

  if (!isAuthenticated) {
    return (
      <Navigate
        to={ROUTES.LOGIN}
        state={{ from: location }}
        replace
      />
    );
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to={ROUTES.HOME} replace />;
  }

  return <Outlet />;
}