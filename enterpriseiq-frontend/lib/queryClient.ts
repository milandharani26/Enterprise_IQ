import { QueryClient } from "@tanstack/react-query";

// Function to construct a new query client instance with default options
export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // SSR safe defaults
        staleTime: 60 * 1000, // 1 minute stale time to prevent immediate refetching
        refetchOnWindowFocus: false, // Turn off automatic refetching on window focus in development/production defaults
        retry: 1, // Retry failed queries once before throwing
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

// Retrieve query client instance
export function getQueryClient() {
  if (typeof window === "undefined") {
    // Server: always make a new query client
    return makeQueryClient();
  } else {
    // Client: reuse the client-side instance
    if (!browserQueryClient) {
      browserQueryClient = makeQueryClient();
    }
    return browserQueryClient;
  }
}
