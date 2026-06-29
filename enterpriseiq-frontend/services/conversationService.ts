import apiClient from "@/lib/axios";
import { ApiResponse } from "@/types/auth"; // Using your generic ApiResponse wrapper

export interface Conversation {
  id: string;
  user_id: string;
  agent_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface MessageFromApi {
  id: string;
  conversation_id: string;
  role: "user" | "assistant";
  content: string;
  metadata: any;
  created_at: string;
}

export interface ConversationDetails extends Conversation {
  messages: MessageFromApi[];
}

export interface SendMessageResponse {
  userMessage: MessageFromApi;
  assistantMessage: MessageFromApi;
}

export interface GetConversationsParams {
  page?: number;
  limit?: number;
}

export interface PaginatedConversations {
  data: Conversation[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const conversationService = {
  createConversation: async (
    title: string,
    agentId?: string,
  ): Promise<Conversation> => {
    const response = await apiClient.post<ApiResponse<Conversation>>(
      "/conversations",
      {
        title,
        agentId,
      },
    );
    return response.data.data;
  },

  getAllConversations: async (
    params?: GetConversationsParams,
  ): Promise<PaginatedConversations> => {
    const response = await apiClient.get<ApiResponse<PaginatedConversations>>(
      "/conversations",
      {
        params,
      },
    );
    return response.data.data;
  },

  getConversationDetails: async (id: string): Promise<ConversationDetails> => {
    const response = await apiClient.get<ApiResponse<ConversationDetails>>(
      `/conversations/${id}`,
    );
    return response.data.data;
  },

  sendMessage: async (
    id: string,
    content: string,
    agentId?: string,
  ): Promise<SendMessageResponse> => {
    console.log("[VERIFY] Payload Assistant:", agentId || "not provided");
    const response = await apiClient.post<ApiResponse<SendMessageResponse>>(
      `/conversations/${id}/messages`,
      {
        content,
        agentId,
      },
    );
    return response.data.data;
  },

  renameConversation: async (
    id: string,
    title: string,
  ): Promise<Conversation> => {
    const response = await apiClient.patch<ApiResponse<Conversation>>(
      `/conversations/${id}`,
      {
        title,
      },
    );
    return response.data.data;
  },

  deleteConversation: async (id: string): Promise<void> => {
    await apiClient.delete<ApiResponse<void>>(`/conversations/${id}`);
  },
};
