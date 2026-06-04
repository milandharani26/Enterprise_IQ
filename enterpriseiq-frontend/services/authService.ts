import apiClient from "@/lib/axios";
import { LoginCredentials, RegisterCredentials, AuthResponse } from "@/types/auth";

export const authService = {
  // Mock login api request, ready to swap with real backend route (e.g., "/auth/login")
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>("/auth/login", credentials);
    return response.data;
  },

  // Mock register api request, ready to swap with real backend route (e.g., "/auth/register")
  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>("/auth/register", credentials);
    return response.data;
  },
};
