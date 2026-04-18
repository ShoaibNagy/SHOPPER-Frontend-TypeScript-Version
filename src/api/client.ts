// ─────────────────────────────────────────────────────────────
// api/client.ts
// Central Axios instance with:
//   • Auth header injection from Zustand store
//   • Silent token refresh on 401 (single-flight)
//   • Normalized ApiError thrown on every failure
// ─────────────────────────────────────────────────────────────

import axios, {
    type AxiosError,
    type AxiosInstance,
    type AxiosResponse,
    type InternalAxiosRequestConfig,
  } from 'axios';
  import type { ApiErrorResponse, FieldError } from '@types';
  
  // ── Custom error class ────────────────────────────────────────
  export class ApiError extends Error {
    statusCode: number;
    errors: FieldError[];
  
    constructor(message: string, statusCode: number, errors: FieldError[] = []) {
      super(message);
      this.name = 'ApiError';
      this.statusCode = statusCode;
      this.errors = errors;
    }
  }
  
  // ── Token storage helpers (kept outside Zustand for use here) ─
  // The auth store writes to these keys; the client reads them.
  const TOKEN_KEY = 'shopper_access_token';
  const REFRESH_KEY = 'shopper_refresh_token';
  
  export const tokenStorage = {
    getAccess: (): string | null => localStorage.getItem(TOKEN_KEY),
    getRefresh: (): string | null => localStorage.getItem(REFRESH_KEY),
    setTokens: (access: string, refresh: string): void => {
      localStorage.setItem(TOKEN_KEY, access);
      localStorage.setItem(REFRESH_KEY, refresh);
    },
    clear: (): void => {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_KEY);
    },
  };
  
  // ── Create base instance ──────────────────────────────────────
  const client: AxiosInstance = axios.create({
    baseURL: process.env.VITE_API_BASE_URL ?? '/api/v1',
    timeout: 15_000,
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  // ── Request interceptor: attach Bearer token ──────────────────
  client.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = tokenStorage.getAccess();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error: unknown) => Promise.reject(error),
  );
  
  // ── Single-flight refresh lock ────────────────────────────────
  // Prevents multiple parallel 401s from each firing a refresh.
  let isRefreshing = false;
  let refreshSubscribers: Array<(token: string) => void> = [];
  
  function subscribeTokenRefresh(callback: (token: string) => void): void {
    refreshSubscribers.push(callback);
  }
  
  function onRefreshSuccess(newToken: string): void {
    refreshSubscribers.forEach((cb) => cb(newToken));
    refreshSubscribers = [];
  }
  
  // ── Response interceptor: 401 → refresh → retry ──────────────
  client.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError<ApiErrorResponse>) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & {
        _retry?: boolean;
      };
  
      if (error.response?.status === 401 && !originalRequest._retry) {
        const refreshToken = tokenStorage.getRefresh();
  
        if (!refreshToken) {
          // No refresh token — force logout
          tokenStorage.clear();
          window.dispatchEvent(new CustomEvent('auth:logout'));
          return Promise.reject(normalizeError(error));
        }
  
        if (isRefreshing) {
          // Queue the request until refresh completes
          return new Promise((resolve) => {
            subscribeTokenRefresh((newToken) => {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              resolve(client(originalRequest));
            });
          });
        }
  
        originalRequest._retry = true;
        isRefreshing = true;
  
        try {
          const { data } = await axios.post<{
            data: { accessToken: string; refreshToken: string };
          }>(`${process.env.VITE_API_BASE_URL ?? '/api/v1'}/auth/refresh-token`, {
            refreshToken,
          });
  
          const { accessToken, refreshToken: newRefresh } = data.data;
          tokenStorage.setTokens(accessToken, newRefresh);
          onRefreshSuccess(accessToken);
  
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return client(originalRequest);
        } catch {
          tokenStorage.clear();
          window.dispatchEvent(new CustomEvent('auth:logout'));
          return Promise.reject(normalizeError(error));
        } finally {
          isRefreshing = false;
        }
      }
  
      return Promise.reject(normalizeError(error));
    },
  );
  
  // ── Normalize any Axios error into ApiError ───────────────────
  function normalizeError(error: AxiosError<ApiErrorResponse>): ApiError {
    const status = error.response?.status ?? 0;
    const body = error.response?.data;
  
    if (body) {
      return new ApiError(
        body.message ?? 'An unexpected error occurred.',
        status,
        body.errors ?? [],
      );
    }
  
    if (error.code === 'ECONNABORTED') {
      return new ApiError('Request timed out. Please try again.', 408);
    }
  
    if (!navigator.onLine) {
      return new ApiError('You appear to be offline.', 0);
    }
  
    return new ApiError(error.message || 'Network error.', status);
  }
  
  export default client;