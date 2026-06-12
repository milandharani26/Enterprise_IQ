import { userService } from "@/services/userService";
import { useQuery } from "@tanstack/react-query";
import { User } from "@/types/auth";

export function getAllUsers() {
  return useQuery<User[], Error>({
    queryKey: ["all-users"],
    queryFn: userService.getAllUsers,
    retry: 1,
  });
}

export function getMeQuery() {
  return useQuery<User, Error>({
    queryKey: ["me"],
    queryFn: userService.getMe,
    retry: 1,
  });
}
