import apiClient from "@/lib/axios";
import { Role, RoleResponse } from "@/types/role";

export const roleService = {
  getAllRoles: async (): Promise<Role[]> => {
    const response = await apiClient.get<RoleResponse>("/roles");
    return response.data.data;
  },
};
