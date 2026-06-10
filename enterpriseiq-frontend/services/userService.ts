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
  editUserRole: async ({
    userId,
    roleId,
  }: {
    userId: string;
    roleId: string;
  }): Promise<User[]> => {
    const response = await apiClient.patch<ApiResponse<User[]>>(
      `/users/${userId}/role`,
      { roleId },
    );
    return response.data.data;
  },
};
