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

export function useForgotPasswordMutation() {
  return useMutation<{ message: string }, Error, string>({
    mutationFn: authService.forgotPassword,
    onError: (error) => {
      toast.error(extractErrorMessage(error, "Failed to send reset email."));
    },
  });
}

export function useResetPasswordMutation() {
  const router = useRouter();

  return useMutation<
    { message: string },
    Error,
    { token: string; newPassword: string }
  >({
    mutationFn: ({ token, newPassword }) =>
      authService.resetPassword(token, newPassword),
    onSuccess: (data) => {
      toast.success(data.message || "Password updated successfully");
      router.push("/sign-in");
    },
    onError: (error) => {
      toast.error(extractErrorMessage(error, "Failed to reset password."));
    },
  });
}

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      // Clear client-side token
      if (typeof window !== "undefined") {
        localStorage.removeItem("access_token");
      }

      // Invalidate all cached queries so stale user data is not reused
      queryClient.clear();

      // Redirect to sign-in page
      router.push("/sign-in");
    },
    onError: () => {
      // Even if the API call fails, force logout on the client side
      if (typeof window !== "undefined") {
        localStorage.removeItem("access_token");
      }
      queryClient.clear();
      router.push("/sign-in");
    },
  });
}
