"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import Sidebar from "../_components/Sidebar";

interface WorkspaceContextType {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  activeChat: string | null;
  setActiveChat: (id: string | null) => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(
  undefined,
);

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context)
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  return context;
}

export default function MainLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeChat, setActiveChat] = useState<string | null>(null);

  return (
    <WorkspaceContext.Provider
      value={{ sidebarOpen, setSidebarOpen, activeChat, setActiveChat }}
    >
      <div
        className="flex h-screen w-screen overflow-hidden"
        style={{ background: "var(--auth-panel-right)" }}
      >
        {/* Persistent Shared Layout Sidebar Component */}
        <Sidebar />

        {/* Dynamic page container view */}
        <main className="flex-1 min-w-0 h-full relative flex flex-col">
          {children}
        </main>
      </div>
    </WorkspaceContext.Provider>
  );
}
