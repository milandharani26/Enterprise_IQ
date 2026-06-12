import { useMutation, useQueryClient } from "@tanstack/react-query";
import { conversationService } from "@/services/conversationService";

export function useConversationMutations() {
  const queryClient = useQueryClient();

  // 1. Create a brand new chat instance
  const createConversationMutation = useMutation({
    mutationFn: ({ title, agentId }: { title: string; agentId?: string }) =>
      conversationService.createConversation(title, agentId),
    onSuccess: () => {
      // Refresh sidebar list immediately
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });

  // 2. Append user message and await automated AI reply stream
  const sendMessageMutation = useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) =>
      conversationService.sendMessage(id, content),
    onSuccess: (data, variables) => {
      // Invalidate both the target chat messages and the general history order list
      queryClient.invalidateQueries({
        queryKey: ["conversation-details", variables.id],
      });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });

  // 3. Rename existing room context title
  const renameConversationMutation = useMutation({
    mutationFn: ({ id, title }: { id: string; title: string }) =>
      conversationService.renameConversation(id, title),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["conversation-details", variables.id],
      });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });

  // 4. Wipe history node
  const deleteConversationMutation = useMutation({
    mutationFn: (id: string) => conversationService.deleteConversation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });

  return {
    createConversation: createConversationMutation.mutateAsync,
    isCreating: createConversationMutation.isPending,

    sendMessage: sendMessageMutation.mutateAsync,
    isSending: sendMessageMutation.isPending,

    renameConversation: renameConversationMutation.mutateAsync,
    isRenaming: renameConversationMutation.isPending,

    deleteConversation: deleteConversationMutation.mutateAsync,
    isDeleting: deleteConversationMutation.isPending,
  };
}
