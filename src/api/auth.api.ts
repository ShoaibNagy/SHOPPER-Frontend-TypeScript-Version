// ─────────────────────────────────────────────────────────────
// api/auth.api.ts
// ─────────────────────────────────────────────────────────────

import client from './client';
import type { ApiResponse } from '../types/api.types';
import type {
  AuthResponse,
  AuthTokens,
  ChangePasswordPayload,
  ForgotPasswordPayload,
  LoginPayload,
  RegisterPayload,
  ResetPasswordPayload,
  UpdateProfilePayload,
  User,
} from '../types/auth.types';

const BASE = '/auth';

// ── POST /auth/register ───────────────────────────────────────
export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  const { data } = await client.post<ApiResponse<AuthResponse>>(`${BASE}/register`, payload);
  return data.data;
}

// ── POST /auth/login ──────────────────────────────────────────
export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const { data } = await client.post<ApiResponse<AuthResponse>>(`${BASE}/login`, payload);
  return data.data;
}

// ── POST /auth/logout ─────────────────────────────────────────
export async function logout(refreshToken: string): Promise<void> {
  await client.post(`${BASE}/logout`, { refreshToken });
}

// ── POST /auth/refresh-token ──────────────────────────────────
// Called automatically by the client interceptor — rarely needed directly.
export async function refreshToken(token: string): Promise<AuthTokens> {
  const { data } = await client.post<ApiResponse<AuthTokens>>(`${BASE}/refresh-token`, {
    refreshToken: token,
  });
  return data.data;
}

// ── GET /auth/me ──────────────────────────────────────────────
export async function getMe(): Promise<User> {
  const { data } = await client.get<ApiResponse<User>>(`${BASE}/me`);
  return data.data;
}

// ── PATCH /auth/profile ───────────────────────────────────────
export async function updateProfile(payload: UpdateProfilePayload): Promise<User> {
  const { data } = await client.patch<ApiResponse<User>>(`${BASE}/profile`, payload);
  return data.data;
}

// ── POST /auth/profile/avatar ─────────────────────────────────
// Multipart — multer handles this on the backend
export async function uploadAvatar(file: File): Promise<{ avatar: string }> {
  const form = new FormData();
  form.append('avatar', file);

  const { data } = await client.post<ApiResponse<{ avatar: string }>>(
    `${BASE}/profile/avatar`,
    form,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
  return data.data;
}

// ── POST /auth/forgot-password ────────────────────────────────
export async function forgotPassword(payload: ForgotPasswordPayload): Promise<{ message: string }> {
  const { data } = await client.post<ApiResponse<{ message: string }>>(
    `${BASE}/forgot-password`,
    payload,
  );
  return data.data;
}

// ── POST /auth/reset-password ─────────────────────────────────
export async function resetPassword(payload: ResetPasswordPayload): Promise<{ message: string }> {
  const { data } = await client.post<ApiResponse<{ message: string }>>(
    `${BASE}/reset-password`,
    payload,
  );
  return data.data;
}

// ── PATCH /auth/change-password ───────────────────────────────
export async function changePassword(payload: ChangePasswordPayload): Promise<{ message: string }> {
  const { data } = await client.patch<ApiResponse<{ message: string }>>(
    `${BASE}/change-password`,
    payload,
  );
  return data.data;
}