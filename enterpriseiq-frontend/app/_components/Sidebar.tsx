"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useWorkspace } from "../(main)/layout";
import { useAuthStore } from "@/store/useAuthStore";
import { useAllConversations } from "@/hooks/queries/useConversationQueries";
import { useConversationMutations } from "@/hooks/mutations/useConversationMutation";
import {
  Plus,
  PanelLeftClose,
  PanelLeftOpen,
  LayoutDashboardIcon,
  ShieldCheckIcon,
  UsersIcon,
  MessageSquareIcon,
  Trash2,
} from "lucide-react";

export function Avatar({ name, size = 7 }: { name: string; size?: number }) {
  const initials = name
    ? name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "";
  return (
    <div
      className={`w-${size} h-${size} rounded-full flex items-center justify-center text-[11px] font-bold shrink-0`}
      style={{
        background: "var(--brand-15)",
        border: "1px solid var(--brand-25)",
        color: "var(--brand-light)",
      }}
    >
      {initials}
    </div>
  );
}

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { sidebarOpen, setSidebarOpen, activeChat, setActiveChat } =
    useWorkspace();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const { user: storeUser } = useAuthStore();
  const emailPrefix = storeUser?.email ? storeUser.email.split("@")[0] : "User";
  const user = { name: emailPrefix, email: storeUser?.email || "" };

  // Fetch paginated conversation histories using your React Query layer
  const { data: conversationsData, isLoading } = useAllConversations({
    page: 1,
    limit: 30,
  });

  // Pull delete mutation controller from your hook layer
  const { deleteConversation, isDeleting } = useConversationMutations();

  const menuItems = [
    { label: "Dashboard", path: "/dashboard", icon: LayoutDashboardIcon },
    { label: "User Management", path: "/users", icon: UsersIcon },
    { label: "Roles Management", path: "/roles", icon: ShieldCheckIcon },
  ];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node))
        setProfileOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleNavigation = (path: string) => {
    router.push(path);
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  const selectConversation = (id: string) => {
    setActiveChat(id);
    handleNavigation("/chat");
  };

  const handleNewChatInit = () => {
    setActiveChat(null); // Clear context selection state to indicate brand new canvas
    handleNavigation("/chat");
  };

  // Intercept selection triggers and run background database cache invalidation
  const handleDeleteChatClick = async (
    e: React.MouseEvent,
    conversationId: string,
  ) => {
    e.stopPropagation(); // Stop navigation click handler from firing
    if (isDeleting) return;

    try {
      await deleteConversation(conversationId);
      // Reset workspace hook node if user deleted the active room instance
      if (activeChat === conversationId) {
        setActiveChat(null);
      }
    } catch (err) {
      console.error(
        "Failed to cleanly delete conversation target resource:",
        err,
      );
    }
  };

  const sidebarVariants = {
    open: { width: 260, opacity: 1 },
    collapsed: {
      width:
        typeof window !== "undefined" && window.innerWidth >= 1024 ? 68 : 0,
      opacity:
        typeof window !== "undefined" && window.innerWidth >= 1024 ? 1 : 0,
    },
  };

  return (
    <motion.aside
      variants={sidebarVariants}
      animate={sidebarOpen ? "open" : "collapsed"}
      transition={{ duration: 0.22, ease: "easeInOut" }}
      className="fixed inset-y-0 left-0 lg:relative flex flex-col shrink-0 overflow-hidden h-full z-50 shadow-2xl lg:shadow-none"
      style={{
        background: "var(--auth-panel-left)",
        borderRight: "1px solid var(--auth-edge-line)",
      }}
    >
      {/* SIDEBAR HEADER CONTAINER */}
      <div
        className="flex items-center justify-between px-4 py-4 shrink-0 h-[65px]"
        style={{ borderBottom: "1px solid var(--auth-edge-line)" }}
      >
        {sidebarOpen ? (
          <>
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                style={{
                  background: "var(--brand-12)",
                  border: "1px solid var(--brand-25)",
                }}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 16 16">
                  <path
                    d="M2 10 L5 6 L8 10 L11 3 L14 8"
                    stroke="var(--brand-light)"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span
                className="text-sm font-semibold text-ellipsis overflow-hidden whitespace-nowrap"
                style={{ color: "var(--auth-heading)" }}
              >
                EnterpriseIQ
              </span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1 rounded-md transition-colors hover:opacity-70"
              style={{ color: "var(--auth-subtext)" }}
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </>
        ) : (
          <button
            onClick={() => setSidebarOpen(true)}
            className="hidden lg:block mx-auto p-1.5 rounded-md transition-colors hover:opacity-70"
            style={{ color: "var(--brand-light)" }}
          >
            <PanelLeftOpen className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* CORE ROUTING NAVIGATION BUTTONS */}
      <div className="px-3 pt-4 space-y-2 flex-1 overflow-y-auto overflow-x-hidden scrollbar-none">
        <button
          onClick={handleNewChatInit}
          className={`w-full flex items-center rounded-lg transition-all duration-150 active:scale-[0.98] ${
            sidebarOpen ? "px-3 py-2 gap-2 text-sm" : "p-2.5 justify-center"
          }`}
          style={{
            background: "var(--brand-10)",
            border: "1px solid var(--brand-20)",
            color: "var(--brand-light)",
          }}
          title="New Chat"
        >
          <Plus className="w-4 h-4 shrink-0" />
          {sidebarOpen && (
            <span className="font-medium truncate">New Chat</span>
          )}
        </button>

        {/* RECENT CONVERSATIONS SUB-LIST */}
        <div
          className="space-y-1 pt-2"
          style={{ borderTop: "1px solid var(--auth-edge-line)" }}
        >
          {sidebarOpen && (
            <p className="px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground opacity-60 mb-1">
              Recent Chats
            </p>
          )}

          {isLoading
            ? sidebarOpen && (
                <p className="px-3 text-xs text-muted-foreground animate-pulse">
                  Loading histories...
                </p>
              )
            : conversationsData?.data?.map((chat) => {
                const isSelected =
                  activeChat === chat.id && pathname === "/chat";
                return (
                  <div
                    key={chat.id}
                    className="group relative flex items-center w-full"
                  >
                    <button
                      onClick={() => selectConversation(chat.id)}
                      className={`w-full flex items-center rounded-lg transition-all duration-150 ${
                        sidebarOpen
                          ? "px-3 py-1.5 pr-8 gap-3 text-xs"
                          : "p-2.5 justify-center"
                      }`}
                      style={{
                        background: isSelected
                          ? "var(--brand-12)"
                          : "transparent",
                        color: isSelected
                          ? "var(--brand-light)"
                          : "var(--auth-subtext)",
                      }}
                      title={chat.title}
                    >
                      <MessageSquareIcon
                        className={`w-3.5 h-3.5 shrink-0 ${isSelected ? "text-emerald-500" : ""}`}
                      />
                      {sidebarOpen && (
                        <span className="truncate flex-1 text-left">
                          {chat.title}
                        </span>
                      )}
                    </button>

                    {/* MINIMAL HOVER DELETE OVERLAY CONTROLLER */}
                    {sidebarOpen && (
                      <button
                        onClick={(e) => handleDeleteChatClick(e, chat.id)}
                        className="absolute right-2 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/10 text-muted-foreground hover:text-red-400 z-10"
                        title="Delete Conversation"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
        </div>

        {/* MANAGEMENT LINK ITEMS */}
        <div
          className="space-y-1.5 pt-4"
          style={{ borderTop: "1px solid var(--auth-edge-line)" }}
        >
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const active = pathname === item.path;

            return (
              <button
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                className={`w-full flex items-center rounded-lg transition-all duration-150 ${
                  sidebarOpen
                    ? "px-3 py-2 gap-3 text-sm"
                    : "p-2.5 justify-center"
                }`}
                style={{
                  background: active ? "var(--brand-15)" : "transparent",
                  border: active
                    ? "1px solid var(--brand-25)"
                    : "1px solid transparent",
                  color: active ? "var(--brand-light)" : "var(--auth-subtext)",
                }}
                title={item.label}
              >
                <IconComponent className="w-4 h-4 shrink-0" />
                {sidebarOpen && (
                  <span className="font-medium truncate">{item.label}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ACCOUNT FOOTER SECTION */}
      <div
        ref={profileRef}
        className="relative shrink-0 px-3 py-3"
        style={{ borderTop: "1px solid var(--auth-edge-line)" }}
      >
        <div
          className={`w-full flex items-center rounded-xl ${
            sidebarOpen ? "px-3 py-2.5 gap-3" : "p-1.5 justify-center"
          }`}
          style={{
            background: "var(--brand-4)",
            border: "1px solid var(--auth-card-border)",
          }}
        >
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 bg-emerald-600 text-white">
            {user.name
              .split(" ")
              .map((w) => w[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          </div>
          {sidebarOpen && (
            <div className="flex-1 text-left overflow-hidden">
              <p
                className="text-xs font-semibold truncate"
                style={{ color: "var(--auth-heading)" }}
              >
                {user.name}
              </p>
              <p
                className="text-[10px] truncate"
                style={{ color: "var(--auth-label)" }}
              >
                {user.email}
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.aside>
  );
}
