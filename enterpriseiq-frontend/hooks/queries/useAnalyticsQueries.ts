import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/axios";

export interface DashboardStats {
  totalQueries: number;
  activeUsers: number;
  avgQueriesPerUser: string;
  mostActiveAssistant: string;
  avgLatency: string;
  errorRate: string;
  modelUsage: { name: string; usage: number }[];
  recentQueries: {
    id: string;
    content: string;
    created_at: string;
    user_email: string;
  }[];
  commonQuestions: { question: string; count: number }[];
}

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async (): Promise<DashboardStats> => {
      const response = await apiClient.get("/analytics/dashboard");
      return response.data.data;
    },
    staleTime: 60 * 1000, // 1 minute
  });
};
