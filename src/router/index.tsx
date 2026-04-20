// ─────────────────────────────────────────────────────────────
// router/index.tsx
//
// Route tree for the entire SHOPPER app.
//
// Strategy
// ────────
// • Every page is lazy-loaded (React.lazy + Suspense) so the
//   initial JS bundle stays small — users only download the
//   code for pages they actually visit.
//
// • Public routes  → visible to everyone.
// • Guest routes   → login / register / password reset.
//   Redirects authenticated users away (GuestRoute).
// • Protected routes → require auth (ProtectedRoute).
//   Unauthenticated users are sent to /login with the
//   intended destination preserved in location.state.from.
//
// • PageWrapper (Navbar + Footer layout shell) wraps every
//   page that is not a standalone auth page.
//
// Layout nesting
// ──────────────
//   <App>
//     <ScrollToTop />
//     <Routes>
//       ├─ <Route element={<PageWrapper />}>          ← shared layout
//       │   ├─ public routes  (Home, Shop, …)
//       │   ├─ <GuestRoute>                           ← kicks out logged-in users
//       │   │   └─ auth pages embedded in layout
//       │   └─ <ProtectedRoute>                       ← kicks out guests
//       │       └─ Cart, Checkout, Orders, Profile, …
//       └─ <Route path="*" element={<NotFound />} />  ← no layout
// ─────────────────────────────────────────────────────────────

import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';

import ProtectedRoute from './ProtectedRoute';
import GuestRoute from './GuestRoute';
import ScrollToTop from './ScrollToTop';
import PageLoader from './PageLoader';
import { ROUTES } from './routes';

// ── Lazy page imports ─────────────────────────────────────────
// Each dynamic import becomes its own JS chunk — Vite handles
// the splitting automatically.

// Layout shell
const PageWrapper = lazy(() => import('@components/layout/PageWrapper'));

// Public pages
const Home           = lazy(() => import('@pages/Home'));
const Shop           = lazy(() => import('@pages/Shop'));
const ProductDetail  = lazy(() => import('@pages/ProductDetail'));
const Search         = lazy(() => import('@pages/Shop'));           // re-uses Shop page with search mode

// Auth pages (guest only)
const Login          = lazy(() => import('@pages/Login'));
const Register       = lazy(() => import('@pages/Register'));
const ForgotPassword = lazy(() => import('@pages/ForgotPassword'));
const ResetPassword  = lazy(() => import('@pages/ResetPassword'));

// Protected pages
const Cart           = lazy(() => import('@pages/Cart'));
const Checkout       = lazy(() => import('@pages/Checkout'));
const CheckoutPayment = lazy(() => import('@pages/CheckoutPayment'));
const PaymentSuccess = lazy(() => import('@pages/PaymentSuccess'));
const PaymentFailed  = lazy(() => import('@pages/PaymentFailed'));
const OrderHistory   = lazy(() => import('@pages/OrderHistory'));
const OrderDetail    = lazy(() => import('@pages/OrderDetail'));
const Profile        = lazy(() => import('@pages/Profile'));

// Standalone
const NotFound       = lazy(() => import('@pages/NotFound'));

// ── App router ────────────────────────────────────────────────
export default function AppRouter() {
  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<PageLoader />}>
        <Routes>

          {/* ── Routes inside the shared Navbar/Footer layout ── */}
          <Route element={<PageWrapper />}>

            {/* Public — anyone can access */}
            <Route path={ROUTES.HOME}    element={<Home />} />
            <Route path={ROUTES.SHOP}    element={<Shop />} />
            <Route path={ROUTES.PRODUCT} element={<ProductDetail />} />
            <Route path={ROUTES.SEARCH}  element={<Search />} />

            {/* Guest — authenticated users are bounced to home */}
            <Route element={<GuestRoute />}>
              <Route path={ROUTES.LOGIN}           element={<Login />} />
              <Route path={ROUTES.REGISTER}        element={<Register />} />
              <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPassword />} />
              <Route path={ROUTES.RESET_PASSWORD}  element={<ResetPassword />} />
            </Route>

            {/* Protected — guests are bounced to /login */}
            <Route element={<ProtectedRoute />}>
              <Route path={ROUTES.CART}             element={<Cart />} />
              <Route path={ROUTES.CHECKOUT}         element={<Checkout />} />
              <Route path={ROUTES.CHECKOUT_PAYMENT} element={<CheckoutPayment />} />
              <Route path={ROUTES.PAYMENT_SUCCESS}  element={<PaymentSuccess />} />
              <Route path={ROUTES.PAYMENT_FAILED}   element={<PaymentFailed />} />
              <Route path={ROUTES.ORDER_HISTORY}    element={<OrderHistory />} />
              <Route path={ROUTES.ORDER_DETAIL}     element={<OrderDetail />} />
              <Route path={ROUTES.PROFILE}          element={<Profile />} />
            </Route>

          </Route>

          {/* 404 — no layout wrapper, renders standalone */}
          <Route path={ROUTES.NOT_FOUND} element={<NotFound />} />

        </Routes>
      </Suspense>
    </>
  );
}