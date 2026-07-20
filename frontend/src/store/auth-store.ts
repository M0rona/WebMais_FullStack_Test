import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthResponse, User } from '@/common/types';

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (data: AuthResponse) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setAuth: ({ user, accessToken }) => set({ user, token: accessToken }),
      clearAuth: () => set({ user: null, token: null }),
    }),
    { name: 'webmais-auth' },
  ),
);
