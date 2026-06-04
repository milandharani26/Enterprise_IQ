"use client";

import React, { useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { usePostsQuery } from "@/hooks/queries/useExampleQuery";
import { useCreatePostMutation } from "@/hooks/mutations/useExampleMutation";

export default function Home() {
  // Zustand Store values
  const { user, isAuthenticated, login, logout } = useAuthStore();

  // Local state for adding a post
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  // React Query: Get Posts
  const { data: posts, isLoading, error, refetch, isFetching } = usePostsQuery(5);

  // React Query: Create Post mutation
  const createPostMutation = useCreatePostMutation();

  const handleLoginDemo = () => {
    login({
      id: "usr_123",
      name: "Jane Doe",
      email: "jane.doe@enterpriseiq.com",
    });
  };

  const handleAddPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;

    await createPostMutation.mutateAsync({
      title,
      body,
    });

    // Reset fields
    setTitle("");
    setBody("");
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-sans p-6 sm:p-12 md:p-24 transition-colors duration-200">
      <main className="max-w-4xl mx-auto w-full space-y-12">
        {/* Header */}
        <header className="border-b border-border pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-primary">EnterpriseIQ</h1>
            <p className="text-zinc-500 mt-1 text-sm dark:text-zinc-400">
              React Query, Zustand & Axios integration playground
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">
              Ready
            </span>
          </div>
        </header>

        {/* Store Management Demo (Zustand) */}
        <section className="bg-card border border-border p-6 rounded-2xl shadow-sm transition-all">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span>👤</span> Zustand Store State
          </h2>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              {isAuthenticated ? (
                <div>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">Logged in as:</p>
                  <p className="font-semibold text-lg">{user?.name}</p>
                  <p className="text-xs text-zinc-400">{user?.email}</p>
                </div>
              ) : (
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  No active user session.
                </p>
              )}
            </div>
            <button
              onClick={isAuthenticated ? logout : handleLoginDemo}
              className="px-5 py-2.5 rounded-xl font-medium bg-primary text-primary-foreground hover:bg-primary-hover transition-colors active:scale-[0.98]"
            >
              {isAuthenticated ? "Logout Session" : "Login as Demo User"}
            </button>
          </div>
        </section>

        {/* Data Fetching Demo (React Query & Axios) */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Query Section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <span>⚡</span> React Query Posts
              </h2>
              <button
                onClick={() => refetch()}
                disabled={isLoading || isFetching}
                className="text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-primary transition-colors flex items-center gap-1 disabled:opacity-50"
              >
                {isFetching ? "Syncing..." : "Force Sync"}
              </button>
            </div>

            <div className="space-y-3">
              {isLoading ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-20 bg-card border border-border rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : error ? (
                <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-xl">
                  Failed to fetch posts.
                </div>
              ) : (
                posts?.map((post) => (
                  <div key={post.id} className="p-4 bg-card border border-border rounded-xl shadow-xs">
                    <h3 className="font-semibold text-sm line-clamp-1">{post.title}</h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2">
                      {post.body}
                    </p>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Mutation Section */}
          <section className="bg-card border border-border p-6 rounded-2xl shadow-sm self-start space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <span>✍️</span> Create Post Mutation
            </h2>
            <form onSubmit={handleAddPost} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1 text-zinc-500 dark:text-zinc-400">
                  Post Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter title..."
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1 text-zinc-500 dark:text-zinc-400">
                  Post Body
                </label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Enter content..."
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={createPostMutation.isPending}
                className="w-full py-2.5 bg-primary text-primary-foreground font-medium rounded-xl hover:bg-primary-hover transition-colors active:scale-[0.98] disabled:opacity-50 text-sm"
              >
                {createPostMutation.isPending ? "Creating Post..." : "Create Post"}
              </button>
            </form>
            {createPostMutation.isSuccess && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs rounded-xl">
                Post created successfully (Simulated response logged to query client)!
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

