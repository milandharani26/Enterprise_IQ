import { useQuery } from "@tanstack/react-query";
import {
  conversationService,
  GetConversationsParams,
} from "@/services/conversationService";

// Fetch all conversations for the sidebar history list
export function useAllConversations(params?: GetConversationsParams) {
  return useQuery({
    queryKey: ["conversations", params],
    queryFn: () => conversationService.getAllConversations(params),
  });
}

// Fetch single conversation details with its inner message stream
export function useConversationDetails(id: string) {
  return useQuery({
    queryKey: ["conversation-details", id],
    queryFn: () => conversationService.getConversationDetails(id),
    enabled: !!id, // Prevent automatic running if ID is empty/null
  });
}
