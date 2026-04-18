// ─────────────────────────────────────────────────────────────
// auth.types.ts
// ─────────────────────────────────────────────────────────────

import type { MongoId, Timestamps } from './api.types';

// ── User Role ─────────────────────────────────────────────────
export type UserRole = 'user' | 'admin';

// ── User model (as returned by the API) ──────────────────────
export interface User extends Timestamps {
  _id: MongoId;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;      // URL to uploaded profile picture (multer)
  phone?: string;
  address?: UserAddress;
  isEmailVerified: boolean;
  isActive: boolean;
}

export interface UserAddress {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

// ── JWT token pair ────────────────────────────────────────────
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

// ── Auth response (user + tokens together) ───────────────────
export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

// ── Request payloads ─────────────────────────────────────────

export interface RegisterPayload {
  name: string;
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