// ─────────────────────────────────────────────────────────────
// api/index.ts  —  barrel export
// Import like: import { login, getProducts } from '@api'
// ─────────────────────────────────────────────────────────────

export * from './auth.api';
export * from './cart.api';
export * from './orders.api';
export * from './payments.api';
export * from './products.api';
export * from './reviews.api';
export { default as client, ApiError, tokenStorage } from './client';