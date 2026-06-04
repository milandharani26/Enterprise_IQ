import { useQuery } from "@tanstack/react-query";
import { exampleService } from "@/services/exampleService";

export function usePostsQuery(limit: number = 5) {
  return useQuery({
    queryKey: ["posts", limit],
    queryFn: () => exampleService.getPosts(limit),
  });
}
