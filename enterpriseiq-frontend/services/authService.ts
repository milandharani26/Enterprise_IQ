import apiClient from "@/lib/axios";
import {
  LoginCredentials,
  RegisterCredentials,
  AuthTokens,
  ApiResponse,
} from "@/types/auth";

// Backend base URL — used for server-redirect flows like Google OAuth
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export const authService = {
  /**
   * Sign in with email + password.
   * Backend: POST /auth/signin
   * Returns the unwrapped AuthTokens from the TransformInterceptor envelope.
   */
  login: async (credentials: LoginCredentials): Promise<AuthTokens> => {
    const response = await apiClient.post<ApiResponse<AuthTokens>>(
      "/auth/signin",
      credentials,
    );
    return response.data.data;
  },

  /**
   * Register a new account.
   * Backend: POST /auth/signup
   * Returns the unwrapped AuthTokens.
   */
  register: async (credentials: RegisterCredentials): Promise<AuthTokens> => {
    const response = await apiClient.post<ApiResponse<AuthTokens>>(
      "/auth/signup",
      credentials,
    );
    return response.data.data;
  },

  /**
   * Kick off the Google OAuth flow.
   * Backend: GET /auth/google  → Google login page → GET /auth/google/callback
   * After a successful callback the backend redirects to http://localhost:3000
   */
  googleLogin: () => {
    if (typeof window !== "undefined") {
      window.location.href = `${BACKEND_URL}/auth/google`;
    }
  },
};
