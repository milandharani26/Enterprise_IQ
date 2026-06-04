import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { authService } from "@/services/authService";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import {
  LoginCredentials,
  RegisterCredentials,
  AuthTokens,
} from "@/types/auth";
import { toast } from "react-hot-toast";

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Decode a JWT payload (base64url) without a library.
 * We only read it to populate the Zustand store — never trust it for security.
 */
function decodeJwtPayload(
  token: string,
): { sub: string; email: string } | null {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/**
 * Extract a human-readable error message from an Axios error or plain Error.
 *
 * The backend's HttpExceptionFilter response shape:
 *   { success, statusCode, message: "Error", error: "User already exists" }
 *
 * The specific message lives in `error`, not in `message` (which is always "Error").
 * So we check `error` first, then `message`, then the axios message, then the fallback.
 */
function extractErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data as
      | { error?: string; message?: string }
      | undefined;
    return data?.error || data?.message || error.message || fallback;
  }
  if (error instanceof Error) return error.message;
  return fallback;
}

// ── Mutations ─────────────────────────────────────────────────────────────────

export function useLoginMutation() {
  const loginStore = useAuthStore((state) => state.login);
  const router = useRouter();

  return useMutation<AuthTokens, Error, LoginCredentials>({
    mutationFn: authService.login,

    onSuccess: (tokens) => {
      // 1. Persist access token so the axios interceptor adds the Bearer header
      if (typeof window !== "undefined") {
        localStorage.setItem("access_token", tokens.accessToken);
      }

      // 2. Decode JWT to populate the Zustand store (sub = userId, email)
      const payload = decodeJwtPayload(tokens.accessToken);
      if (payload) {
        loginStore({ id: payload.sub, email: payload.email });
      }

      toast.success("Welcome back!");
      router.push("/");
    },

    onError: (error) => {
      toast.error(
        extractErrorMessage(error, "Failed to login. Please try again."),
      );
    },
  });
}

export function useRegisterMutation() {
  const loginStore = useAuthStore((state) => state.login);
  const router = useRouter();

  return useMutation<AuthTokens, Error, RegisterCredentials>({
    mutationFn: authService.register,

    onSuccess: (tokens) => {
      // 1. Persist access token
      if (typeof window !== "undefined") {
        localStorage.setItem("access_token", tokens.accessToken);
      }

      // 2. Decode JWT to populate the Zustand store
      const payload = decodeJwtPayload(tokens.accessToken);
      if (payload) {
        loginStore({ id: payload.sub, email: payload.email });
      }

      toast.success("Account created successfully!");
      router.push("/");
    },

    onError: (error) => {
      toast.error(
        extractErrorMessage(error, "Registration failed. Please try again."),
      );
    },
  });
}
