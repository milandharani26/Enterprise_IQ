import apiClient from "@/lib/axios";
import { assistantResponse } from "@/types/assistants";

export const assistantService = {
  getAllAssistents: async () => {
    const res = await apiClient.get<assistantResponse>("/assistants");
    return res.data.data;
  },
};
