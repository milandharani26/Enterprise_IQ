import { useMutation, useQueryClient } from "@tanstack/react-query";
import { exampleService } from "@/services/exampleService";

export function useCreatePostMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: exampleService.createPost,
    onSuccess: () => {
      // Invalidate the posts query cache to trigger automatic refetching
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}
