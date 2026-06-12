import { useMutation, useQueryClient } from "@tanstack/react-query";
import { userService } from "@/services/userService";

export function useEditUserRoleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userService.editUserRole,
    onSuccess: () => {
      // 1. Invalidate the management list query cache pool
      queryClient.invalidateQueries({ queryKey: ["all-users"] });

      // 2. Invalidate the active session profiles state pool
      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
  });
}
