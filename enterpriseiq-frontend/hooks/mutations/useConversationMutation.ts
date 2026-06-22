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
    onMutate: async (variables) => {
      // Cancel any outgoing refetches so they don't overwrite optimistic update
      await queryClient.cancelQueries({
        queryKey: ["conversation-details", variables.id],
      });

      // Snapshot the previous value
      const previousDetails = queryClient.getQueryData([
        "conversation-details",
        variables.id,
      ]);

      // Optimistically update the UI to show the user's message immediately
      queryClient.setQueryData(
        ["conversation-details", variables.id],
        (old: any) => {
          if (!old) return old;
          return {
            ...old,
            messages: [
              ...(old.messages || []),
              {
                id: `optimistic-${Date.now()}`,
                conversation_id: variables.id,
                role: "user",
                content: variables.content,
                created_at: new Date().toISOString(),
              },
            ],
          };
        },
      );

      // Return context for rollback
      return { previousDetails };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousDetails) {
        queryClient.setQueryData(
          ["conversation-details", variables.id],
          context.previousDetails,
        );
      }
    },
    onSettled: (data, error, variables) => {
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
