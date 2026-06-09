// User info decoded from JWT payload (sub=id, email)
export interface User {
  id: string;
  email: string;
  role?: string; // Optional — backend JWT carries sub + email only
}

// Full Database Role relation object payload
export interface DbRole {
  id: string;
  name: string;
  role_code: string;
  assistant_ids: string[] | null;
  created_at: string;
  updated_at: string;
}

// Complete User object layout including DB joins (Used in management / profiles)
export interface UserWithRole {
  id: string;
  email: string;
  password?: string;
  hashedRefreshToken?: string;
  role: DbRole; // Complete nested relations mapping
  role_id: string;
  joined?: string;
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
