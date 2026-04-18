// ─────────────────────────────────────────────────────────────
// router/routes.ts
// Single source of truth for every URL path in the app.
// Import this instead of hard-coding strings in <Link> or
// navigate() calls anywhere in the codebase.
// ─────────────────────────────────────────────────────────────

export const ROUTES = {
    // ── Public ────────────────────────────────────────────────
    HOME: '/',
    SHOP: '/shop',
    PRODUCT: '/shop/:slug',
    SEARCH: '/search',
  
    // ── Auth ──────────────────────────────────────────────────
    LOGIN: '/login',
    REGISTER: '/register',
    FORGOT_PASSWORD: '/forgot-password',
    RESET_PASSWORD: '/reset-password',           // + ?token=xxx
  
    // ── Protected: User ───────────────────────────────────────
    CART: '/cart',
    CHECKOUT: '/checkout',
    CHECKOUT_PAYMENT: '/checkout/payment',       // + ?orderId=xxx
    PAYMENT_SUCCESS: '/payment/success',         // + ?orderId=xxx
    PAYMENT_FAILED: '/payment/failed',           // + ?orderId=xxx
    ORDER_HISTORY: '/orders',
    ORDER_DETAIL: '/orders/:id',
    PROFILE: '/profile',
  
    // ── Not found ─────────────────────────────────────────────
    NOT_FOUND: '*',
  } as const;
  
  // ── Path builder helpers ──────────────────────────────────────
  // Use these to build dynamic paths with type-safe params.
  // e.g.  navigate(PATHS.product('cool-sneakers'))
  //       navigate(PATHS.order('abc123'))
  
  export const PATHS = {
    product: (slug: string) => `/shop/${slug}`,
    order: (id: string) => `/orders/${id}`,
    checkoutPayment: (orderId: string) => `/checkout/payment?orderId=${orderId}`,
    paymentSuccess: (orderId: string) => `/payment/success?orderId=${orderId}`,
    paymentFailed: (orderId: string) => `/payment/failed?orderId=${orderId}`,
    resetPassword: (token: string) => `/reset-password?token=${token}`,
  } as const;