// ─────────────────────────────────────────────────────────────
// store/auth.store.ts
// Zustand store for authentication state.
// Persisted to localStorage via the persist middleware so the
// user stays logged in across page refreshes.
// ─────────────────────────────────────────────────────────────

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AuthTokens, User } from '@types';

interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

interface AuthActions {
  setAuth: (user: User, tokens: AuthTokens) => void;
  setUser: (user: User) => void;
  clearAuth: () => void;
}

type AuthStore = AuthState & AuthActions;

const initialState: AuthState = {
  user: null,
  tokens: null,
  isAuthenticated: false,
  isAdmin: false,
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      ...initialState,

      setAuth: (user, tokens) =>
        set({
          user,
          tokens,
          isAuthenticated: true,
          isAdmin: user.role === 'admin',
        }),

      setUser: (user) =>
        set((state) => ({
          user,
          isAdmin: user.role === 'admin',
          // preserve tokens
          tokens: state.tokens,
          isAuthenticated: true,
        })),

      clearAuth: () => set(initialState),
    }),
    {
      name: 'shopper_auth',
      storage: createJSONStorage(() => localStorage),
      // Only persist user data — tokens are managed by tokenStorage in client.ts
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        isAdmin: state.isAdmin,
      }),
    },
  ),
);