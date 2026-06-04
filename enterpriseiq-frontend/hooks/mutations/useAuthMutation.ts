import { useMutation } from "@tanstack/react-query";
import { authService } from "@/services/authService";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { LoginCredentials, RegisterCredentials, AuthResponse } from "@/types/auth";
import { toast } from "react-hot-toast";

export function useLoginMutation() {
  const loginStore = useAuthStore((state) => state.login);
  const router = useRouter();

  return useMutation<AuthResponse, Error, LoginCredentials>({
    mutationFn: authService.login,
    onSuccess: (data) => {
      // Save token in localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("auth_token", data.token);
      }
      // Update Zustand store state
      loginStore(data.user);
      toast.success(`Welcome back, ${data.user.name}!`);
      // Redirect to dashboard/home page
      router.push("/");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to login. Please try again.");
    },
  });
}

export function useRegisterMutation() {
  const loginStore = useAuthStore((state) => state.login);
  const router = useRouter();

  return useMutation<AuthResponse, Error, RegisterCredentials>({
    mutationFn: authService.register,
    onSuccess: (data) => {
      // Save token in localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("auth_token", data.token);
      }
      // Update Zustand store state
      loginStore(data.user);
      toast.success("Account created successfully!");
      // Redirect to dashboard/home page
      router.push("/");
    },
    onError: (error) => {
      toast.error(error.message || "Registration failed. Please try again.");
    },
  });
}

