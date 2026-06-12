"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import Sidebar from "../_components/Sidebar";
import { Menu } from "lucide-react"; // Import the Hamburger Icon

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
        className="flex h-screen w-screen overflow-hidden relative"
        style={{ background: "var(--auth-panel-right)" }}
      >
        {/* Backdrop for Mobile & Tablet view only (Handles click-outside closing) */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden block transition-opacity duration-200"
          />
        )}

        {/* Adaptive Sidebar Drawer / Rail */}
        <Sidebar />

        {/* Floating Mobile/Tablet Hamburger Trigger - ONLY displays when sidebar is closed */}
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="fixed top-4 left-4 p-2 rounded-lg border shadow-md transition-all duration-150 active:scale-95 z-30 block lg:hidden hover:opacity-80"
            style={{
              background: "var(--auth-panel-left)",
              borderColor: "var(--auth-edge-line)",
              color: "var(--brand-light)",
            }}
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {/* Main Application Page View Frame */}
        {/* Adds padding on mobile when the menu icon is visible so content isn't covered */}
        <main
          className={`flex-1 min-w-0 h-full relative flex flex-col ${!sidebarOpen ? "pt-14 lg:pt-0" : ""}`}
        >
          {children}
        </main>
      </div>
    </WorkspaceContext.Provider>
  );
}
