import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

// Create a custom axios instance
export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "https://api.example.com", // Fallback fallback URL
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Request Interceptor
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Perform actions before request is sent (e.g. inject authorization token)
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("auth_token");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response Interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Handle error responses centrally (e.g. logging, redirection on 401/403)
    if (error.response) {
      const { status } = error.response;
      if (status === 401) {
        console.warn("Unauthorized access - logging out or redirecting...");
        if (typeof window !== "undefined") {
          localStorage.removeItem("auth_token");
        }
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
