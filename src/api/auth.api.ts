// api/auth.api.ts

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

// FIX 4: was POST /auth/register — backend now exposes BOTH /register and /signup.
// Keeping /register as the canonical name here since it matches frontend types.
export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  // Backend SignupDTO expects { username, email, password }.
  // Frontend RegisterPayload has { name, email, password, phone? }.
  // Map 'name' → 'username' so the backend validator passes.
  const { data } = await client.post<ApiResponse<AuthResponse>>(`${BASE}/register`, {
    username: payload.name,
    email:    payload.email,
    password: payload.password,
  });
  return data.data;
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const { data } = await client.post<ApiResponse<AuthResponse>>(`${BASE}/login`, payload);
  return data.data;
}

export async function logout(refreshToken: string): Promise<void> {
  await client.post(`${BASE}/logout`, { refreshToken });
}

// FIX 5: endpoint was /auth/refresh-token — matches the backend route now.
export async function refreshToken(token: string): Promise<AuthTokens> {
  const { data } = await client.post<ApiResponse<AuthTokens>>(`${BASE}/refresh-token`, {
    refreshToken: token,
  });
  return data.data;
}

export async function getMe(): Promise<User> {
  const { data } = await client.get<ApiResponse<User>>(`${BASE}/me`);
  return data.data;
}

export async function updateProfile(payload: UpdateProfilePayload): Promise<User> {
  const { data } = await client.patch<ApiResponse<User>>(`${BASE}/profile`, payload);
  return data.data;
}

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

export async function forgotPassword(payload: ForgotPasswordPayload): Promise<{ message: string }> {
  const { data } = await client.post<ApiResponse<{ message: string }>>(
    `${BASE}/forgot-password`,
    payload,
  );
  return data.data;
}

export async function resetPassword(payload: ResetPasswordPayload): Promise<{ message: string }> {
  const { data } = await client.post<ApiResponse<{ message: string }>>(
    `${BASE}/reset-password`,
    payload,
  );
  return data.data;
}

export async function changePassword(payload: ChangePasswordPayload): Promise<{ message: string }> {
  const { data } = await client.patch<ApiResponse<{ message: string }>>(
    `${BASE}/change-password`,
    payload,
  );
  return data.data;
}