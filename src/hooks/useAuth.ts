// ─────────────────────────────────────────────────────────────
// hooks/useAuth.ts
// ─────────────────────────────────────────────────────────────

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import * as authApi from '@api/auth.api';
import { tokenStorage } from '@api/client';
import { useAuthStore } from '@store/auth.store';
import { queryKeys } from '@utils/queryKeys';
import type {
  ChangePasswordPayload,
  ForgotPasswordPayload,
  LoginPayload,
  RegisterPayload,
  ResetPasswordPayload,
  UpdateProfilePayload,
} from '@types';

// ── Fetch the authenticated user ──────────────────────────────
export function useMe() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: queryKeys.auth.me(),
    queryFn: authApi.getMe,
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 min — profile doesn't change often
  });
}

// ── Register ──────────────────────────────────────────────────
export function useRegister() {
  const { setAuth } = useAuthStore();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (payload: RegisterPayload) => authApi.register(payload),
    onSuccess: ({ user, tokens }) => {
      tokenStorage.setTokens(tokens.accessToken, tokens.refreshToken);
      setAuth(user, tokens);
      queryClient.setQueryData(queryKeys.auth.me(), user);
      toast.success(`Welcome, ${user.name}!`);
      void navigate('/');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// ── Login ─────────────────────────────────────────────────────
export function useLogin() {
  const { setAuth } = useAuthStore();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (payload: LoginPayload) => authApi.login(payload),
    onSuccess: ({ user, tokens }) => {
      tokenStorage.setTokens(tokens.accessToken, tokens.refreshToken);
      setAuth(user, tokens);
      queryClient.setQueryData(queryKeys.auth.me(), user);
      toast.success('Welcome back!');
      void navigate('/');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// ── Logout ────────────────────────────────────────────────────
export function useLogout() {
  const { clearAuth } = useAuthStore();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: () => {
      const refreshToken = tokenStorage.getRefresh();
      return refreshToken ? authApi.logout(refreshToken) : Promise.resolve();
    },
    onSettled: () => {
      // Always clear local state, even if the server call fails
      tokenStorage.clear();
      clearAuth();
      queryClient.clear();
      void navigate('/login');
    },
  });
}

// ── Update profile ────────────────────────────────────────────
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) => authApi.updateProfile(payload),
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(queryKeys.auth.me(), updatedUser);
      toast.success('Profile updated.');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// ── Upload avatar ─────────────────────────────────────────────
export function useUploadAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => authApi.uploadAvatar(file),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.auth.me() });
      toast.success('Avatar updated.');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// ── Forgot password ───────────────────────────────────────────
export function useForgotPassword() {
  return useMutation({
    mutationFn: (payload: ForgotPasswordPayload) => authApi.forgotPassword(payload),
    onSuccess: ({ message }) => {
      toast.success(message);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// ── Reset password ────────────────────────────────────────────
export function useResetPassword() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (payload: ResetPasswordPayload) => authApi.resetPassword(payload),
    onSuccess: ({ message }) => {
      toast.success(message);
      void navigate('/login');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// ── Change password ───────────────────────────────────────────
export function useChangePassword() {
  return useMutation({
    mutationFn: (payload: ChangePasswordPayload) => authApi.changePassword(payload),
    onSuccess: ({ message }) => {
      toast.success(message);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}