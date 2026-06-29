import { useMutation, useQueryClient } from "@tanstack/react-query";
import { conversationService } from "@/services/conversationService";

export function useConversationMutations() {
  const queryClient = useQueryClient();

  // 1. Create a brand new chat instance
  const createConversationMutation = useMutation({
    mutationFn: ({ title, agentId }: { title: string; agentId?: string }) =>
      conversationService.createConversation(title, agentId),
    onSuccess: (data) => {
      // Immediately initialise conversation-details cache so optimistic updates work
      queryClient.setQueryData(["conversation-details", data.id], {
        ...data,
        messages: [],
      });
      // Refresh sidebar list in background
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
          const base = old || { id: variables.id, messages: [] };
          return {
            ...base,
            messages: [
              ...(base.messages || []),
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
      } else {
        // Remove optimistic messages if no previous cache existed
        queryClient.setQueryData(
          ["conversation-details", variables.id],
          (old: any) => {
            if (!old) return old;
            return {
              ...old,
              messages: (old.messages || []).filter(
                (m: any) => !m.id?.startsWith("optimistic-"),
              ),
            };
          },
        );
      }
    },
    onSettled: (data, error, variables) => {
      // Immediately insert server response, replacing optimistic message
      if (data) {
        queryClient.setQueryData(
          ["conversation-details", variables.id],
          (old: any) => {
            const base = old || { id: variables.id, messages: [] };
            const filtered = (base.messages || []).filter(
              (m: any) => !m.id?.startsWith("optimistic-"),
            );
            return {
              ...base,
              messages: [...filtered, data.userMessage, data.assistantMessage],
            };
          },
        );
      }
      // Background refetch to ensure consistency
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
