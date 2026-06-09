import apiClient from "@/lib/axios";
import { ApiResponse, User } from "@/types/auth";

export const userService = {
  getMe: async (): Promise<User> => {
    const response = await apiClient.get<ApiResponse<User>>("/users/me");
    return response.data.data;
  },
  getAllUsers: async (): Promise<User[]> => {
    const response = await apiClient.get<ApiResponse<User[]>>("/users");
    return response.data.data;
  },
};
