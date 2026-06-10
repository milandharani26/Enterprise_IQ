import { assistantService } from "@/services/assistantService";
import { assistant } from "@/types/assistants";
import { useQuery } from "@tanstack/react-query";

export function getAllAssistant() {
  return useQuery<assistant[]>({
    queryKey: ["assistants"],
    queryFn: () => {
      return assistantService.getAllAssistents();
    },
  });
}
