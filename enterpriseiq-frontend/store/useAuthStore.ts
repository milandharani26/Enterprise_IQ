import { create } from "zustand";
import type { UserWithRole } from "@/types/auth";

interface AuthState {
  user: UserWithRole | null;
  isAuthenticated: boolean;
  login: (user: UserWithRole) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  login: (user) => set({ user, isAuthenticated: true }),
  logout: () => set({ user: null, isAuthenticated: false }),
}));
