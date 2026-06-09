import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

// Create a custom axios instance pointing at the NestJS backend
export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000",
  timeout: 10000,
  withCredentials: true, // Required so httpOnly cookies (accessToken / refreshToken) are sent
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// ── Request interceptor ──────────────────────────────────────────────────────
// Attach the access token from localStorage as a Bearer header on every request
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("access_token");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

// ── Response interceptor ─────────────────────────────────────────────────────
// Centrally handle auth errors; clear stale token on 401
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      const { status } = error.response;
      if (status === 401) {
        console.warn("Unauthorized — clearing stored token.");
        if (typeof window !== "undefined") {
          localStorage.removeItem("access_token");
        }
      }
    }
    return Promise.reject(error);
  },
);

export default apiClient;
