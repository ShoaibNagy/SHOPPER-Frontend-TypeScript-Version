// auth.types.ts

import type { MongoId, Timestamps } from './api.types';

export type UserRole = 'user' | 'admin';

// Backend returns 'username'; keep both so UI can use whichever is available.
export interface User extends Timestamps {
  _id: MongoId;
  name: string;
  username?: string;   // backend field name — present on all users
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  address?: UserAddress;   // restored — used by ShippingForm and Profile pages
  isActive: boolean;
}

// UserAddress is imported by order.types.ts, ShippingForm, and Profile
export interface UserAddress {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

// Dual-token pair — matches backend auth.service.ts issueTokenPair()
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

// Auth response wrapper from POST /auth/login and /auth/register
export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

// ── Request payloads ──────────────────────────────────────────

export interface RegisterPayload {
  name: string;       // mapped to 'username' when sent to backend
  email: string;
  password: string;
  phone?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RefreshTokenPayload {
  refreshToken: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UpdateProfilePayload {
  name?: string;
  phone?: string;
  address?: Partial<UserAddress>;
}