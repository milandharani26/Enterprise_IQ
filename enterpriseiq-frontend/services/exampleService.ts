import apiClient from "@/lib/axios";

export interface Post {
  userId: number;
  id: number;
  title: string;
  body: string;
}

export const exampleService = {
  // Fetch posts (we override the default base URL for demonstration using JSONPlaceholder)
  getPosts: async (limit: number = 5): Promise<Post[]> => {
    const response = await apiClient.get<Post[]>(
      `https://jsonplaceholder.typicode.com/posts?_limit=${limit}`
    );
    return response.data;
  },

  // Create a new post
  createPost: async (post: Omit<Post, "id" | "userId">): Promise<Post> => {
    const response = await apiClient.post<Post>(
      "https://jsonplaceholder.typicode.com/posts",
      {
        ...post,
        userId: 1,
      }
    );
    return response.data;
  },
};
