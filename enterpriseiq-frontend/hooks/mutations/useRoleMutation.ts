import { useMutation, useQueryClient } from "@tanstack/react-query";
import { roleService } from "@/services/roleService";

export function useEditUserRoleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: roleService.editRole,
    onSuccess: () => {
      // 1. Invalidate the management list query cache pool
      queryClient.invalidateQueries({ queryKey: ["all-users"] });
      queryClient.invalidateQueries({ queryKey: ["all-roles"] });

      // 2. Invalidate the active session profiles state pool
      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
  });
}
