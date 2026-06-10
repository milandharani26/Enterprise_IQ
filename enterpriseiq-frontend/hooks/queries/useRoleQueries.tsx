import { roleService } from "@/services/roleService";
import { Role } from "@/types/role";
import { useQuery } from "@tanstack/react-query";

export function getAllRoles() {
  return useQuery<Role[]>({
    queryKey: ["all-roles"],
    queryFn: roleService.getAllRoles,
  });
}

export function getRoleWithAssistantById(roleId: string) {
  return useQuery({
    queryKey: ["role-assistants", roleId],
    queryFn: () => roleService.getRoleWithAssistantById(roleId),
  });
}
