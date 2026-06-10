import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { authService } from "@/services/authService";
import { useRouter } from "next/navigation";
import {
  LoginCredentials,
  RegisterCredentials,
  AuthTokens,
} from "@/types/auth";
import { toast } from "react-hot-toast";

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Extract a human-readable error message from an Axios error or plain Error.
 *
 * The backend's HttpExceptionFilter response shape:
 * { success, statusCode, message: "Error", error: "User already exists" }
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
  const router = useRouter();

  return useMutation<AuthTokens, Error, LoginCredentials>({
    mutationFn: authService.login,

    onSuccess: (tokens) => {
      // Persist access token so the axios interceptor adds the Bearer header
      if (typeof window !== "undefined") {
        localStorage.setItem("access_token", tokens.accessToken);
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
  const router = useRouter();

  return useMutation<AuthTokens, Error, RegisterCredentials>({
    mutationFn: authService.register,

    onSuccess: (tokens) => {
      // Persist access token
      if (typeof window !== "undefined") {
        localStorage.setItem("access_token", tokens.accessToken);
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

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      // 1. Invalidate the management list query cache pool
      queryClient.invalidateQueries({ queryKey: ["all-users"] });

      // 2. Invalidate the active session profiles state pool
      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
  });
}
