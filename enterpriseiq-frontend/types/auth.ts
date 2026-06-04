// User info decoded from JWT payload (sub=id, email)
export interface User {
  id: string;
  email: string;
  name?: string; // Optional — backend JWT carries sub + email only
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
}

// What the backend auth endpoints return in `data`
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

// Generic wrapper produced by TransformInterceptor on every backend response
export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
}

// Convenience alias kept so existing imports don't break
export type AuthResponse = ApiResponse<AuthTokens>;
