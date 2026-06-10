import { roleService } from "@/services/roleService";
import { Role } from "@/types/role";
import { useQuery } from "@tanstack/react-query";

export function getAllRoles() {
  return useQuery<Role[]>({
    queryKey: ["all-roles"],
    queryFn: roleService.getAllRoles,
  });
}
