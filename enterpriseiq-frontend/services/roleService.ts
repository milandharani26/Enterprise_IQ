import apiClient from "@/lib/axios";
import { Role, RoleResponse } from "@/types/role";

export const roleService = {
  getAllRoles: async (): Promise<Role[]> => {
    const response = await apiClient.get<RoleResponse>("/roles");
    return response.data.data;
  },
  editRole: async ({
    roleId,
    assistents,
  }: {
    roleId: string;
    assistents: string[];
  }): Promise<string> => {
    // Wrap the array inside an object matching your DTO field key
    const response = await apiClient.patch<RoleResponse>(`/roles/${roleId}`, {
      assistant_ids: assistents, // Send as a key-value object
    });
    return response.data.message;
  },
};
