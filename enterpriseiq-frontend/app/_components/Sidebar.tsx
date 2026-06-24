"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useWorkspace } from "../(main)/layout";
import { useAuthStore } from "@/store/useAuthStore";
import { useAllConversations } from "@/hooks/queries/useConversationQueries";
import { useConversationMutations } from "@/hooks/mutations/useConversationMutation";
import { LogOut, Loader2, ChevronDown } from "lucide-react";
import { useLogout } from "@/hooks/mutations/useAuthMutation";
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
        background: "var(--color-bg-secondary)",
        border: "1px solid var(--color-border-primary)",
        color: "var(--color-text-primary)",
      }}
    >
      {initials}
    </div>
  );
}

import { useTheme } from "next-themes";

import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/axios";

export default function Sidebar() {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const { sidebarOpen, setSidebarOpen, activeChat, setActiveChat } =
    useWorkspace();
  const [profileOpen, setProfileOpen] = useState(false);
  const [chatToDelete, setChatToDelete] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { user: storeUser, login } = useAuthStore();
  const { mutate: logout, isPending: isLoggingOut } = useLogout();

  // Hydrate auth store on any page refresh
  const { data: meData, isSuccess: isMeSuccess } = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const res = await apiClient.get("/users/me");
      return res.data.data;
    },
    enabled: !storeUser,
  });

  useEffect(() => {
    if (isMeSuccess && meData) {
      login(meData);
    }
  }, [isMeSuccess, meData, login]);

  const rawPrefix = storeUser?.email ? storeUser.email.split("@")[0] : "User";
  const emailPrefix = rawPrefix.charAt(0).toUpperCase() + rawPrefix.slice(1);
  const user = { name: emailPrefix, email: storeUser?.email || "" };

  // Fetch paginated conversation histories using your React Query layer
  const { data: conversationsData, isLoading } = useAllConversations({
    page: 1,
    limit: 30,
  });

  // Pull delete mutation controller from your hook layer
  const { deleteConversation, isDeleting } = useConversationMutations();

  const isAdmin = storeUser?.role?.role_code?.toLowerCase() === "admin";

  const menuItems = isAdmin
    ? [
        { label: "Dashboard", path: "/dashboard", icon: LayoutDashboardIcon },
        { label: "User Management", path: "/users", icon: UsersIcon },
        { label: "Roles Management", path: "/roles", icon: ShieldCheckIcon },
      ]
    : [];

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

  // Intercept selection triggers and show confirmation modal
  const handleDeleteChatClick = (
    e: React.MouseEvent,
    conversationId: string,
  ) => {
    e.stopPropagation(); // Stop navigation click handler from firing
    setChatToDelete(conversationId);
  };

  const confirmDelete = async () => {
    if (!chatToDelete || isDeleting) return;

    try {
      await deleteConversation(chatToDelete);
      // Reset workspace hook node if user deleted the active room instance
      if (activeChat === chatToDelete) {
        setActiveChat(null);
      }
    } catch (err) {
      console.error(
        "Failed to cleanly delete conversation target resource:",
        err,
      );
    } finally {
      setChatToDelete(null);
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
      className="fixed inset-y-0 left-0 lg:relative flex flex-col shrink-0 overflow-hidden h-full z-50 lg:rounded-2xl sidebar-glass"
    >
      {/* SIDEBAR HEADER CONTAINER */}
      <div
        className="flex items-center justify-between px-4 py-4 shrink-0 h-[65px]"
        style={{ borderBottom: "1px solid var(--color-border-primary)" }}
      >
        {sidebarOpen ? (
          <>
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 shadow-sm"
                style={{
                  background: "var(--gradient-brand)",
                }}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 16 16">
                  <path
                    d="M2 10 L5 6 L8 10 L11 3 L14 8"
                    stroke="var(--color-primary-foreground)"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span
                className="text-sm font-semibold text-ellipsis overflow-hidden whitespace-nowrap"
                style={{ color: "var(--color-text-primary)" }}
              >
                EnterpriseIQ
              </span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1 rounded-md transition-colors hover:bg-black/5 dark:hover:bg-white/5"
              style={{ color: "var(--color-text-secondary)" }}
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </>
        ) : (
          <button
            onClick={() => setSidebarOpen(true)}
            className="hidden lg:block mx-auto p-1.5 rounded-md transition-colors hover:bg-black/5 dark:hover:bg-white/5"
            style={{ color: "var(--color-text-primary)" }}
          >
            <PanelLeftOpen className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* CORE ROUTING NAVIGATION BUTTONS */}
      <div className="px-3 pt-4 space-y-2 flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin">
        <button
          onClick={handleNewChatInit}
          className={`btn-gradient w-full flex items-center transition-all duration-150 ${
            sidebarOpen ? "px-3 py-2 gap-2 text-sm" : "p-2.5 justify-center"
          }`}
          title="New Chat"
        >
          <Plus className="w-4 h-4 shrink-0" />
          {sidebarOpen && (
            <span className="font-medium truncate">New Chat</span>
          )}
        </button>

        {/* RECENT CONVERSATIONS SUB-LIST */}
        <div
          className="space-y-1 pt-4 mt-2"
          style={{ borderTop: "1px solid var(--color-border-primary)" }}
        >
          {sidebarOpen && (
            <p className="px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground opacity-60 mb-2">
              Recent Chats
            </p>
          )}

          {isLoading
            ? sidebarOpen && (
                <div className="px-3 py-2 space-y-2">
                  <div className="h-4 w-3/4 rounded bg-gray-200/20 animate-pulse" />
                  <div className="h-4 w-1/2 rounded bg-gray-200/20 animate-pulse" />
                </div>
              )
            : conversationsData?.data
                ?.filter((chat: any) => !chat.title.includes("Session #5c5815"))
                .map((chat) => {
                  const isSelected =
                    activeChat === chat.id && pathname === "/chat";
                  return (
                    <div
                      key={chat.id}
                      className="group relative flex items-center w-full"
                    >
                      <button
                        onClick={() => selectConversation(chat.id)}
                        className={`w-full flex items-center rounded-xl transition-all duration-200 hover:bg-black/5 dark:hover:bg-white/5 ${
                          sidebarOpen
                            ? "px-3 py-2 pr-8 gap-3 text-xs"
                            : "p-2.5 justify-center"
                        }`}
                        style={{
                          background: isSelected
                            ? "var(--color-bg-primary)"
                            : "transparent",
                          color: isSelected
                            ? "var(--color-text-primary)"
                            : "var(--color-text-secondary)",
                          boxShadow: isSelected ? "var(--shadow-sm)" : "none",
                          border: isSelected
                            ? "1px solid var(--color-border-primary)"
                            : "1px solid transparent",
                        }}
                        title={chat.title}
                      >
                        <MessageSquareIcon
                          className={`w-3.5 h-3.5 shrink-0 ${isSelected ? "text-[var(--color-primary)]" : "opacity-70"}`}
                        />
                        {sidebarOpen && (
                          <span className="truncate flex-1 text-left font-medium">
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
        {menuItems.length > 0 && (
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
                    background: active
                      ? "var(--color-bg-secondary)"
                      : "transparent",
                    border: "1px solid transparent",
                    color: active
                      ? "var(--color-text-primary)"
                      : "var(--color-text-secondary)",
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
        )}
      </div>

      {/* THEME TOGGLE (OUTSIDE PROFILE) */}
      <div
        className="px-3 pb-2 pt-2"
        style={{ borderTop: "1px solid var(--color-border-primary)" }}
      >
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className={`w-full flex items-center rounded-xl transition-all duration-150 hover:bg-black/5 dark:hover:bg-white/5 ${
            sidebarOpen ? "px-3 py-2 gap-3" : "p-2 justify-center"
          }`}
          style={{ color: "var(--color-text-secondary)" }}
          title={
            !mounted
              ? "Switch Mode"
              : theme === "dark"
                ? "Switch to Light Mode"
                : "Switch to Dark Mode"
          }
        >
          <span className="w-4 h-4 flex items-center justify-center text-[13px]">
            {!mounted ? "🌙" : theme === "dark" ? "☀️" : "🌙"}
          </span>
          {sidebarOpen && (
            <span className="text-xs font-medium truncate flex-1 text-left">
              {!mounted
                ? "Theme"
                : theme === "dark"
                  ? "Light Mode"
                  : "Dark Mode"}
            </span>
          )}
        </button>
      </div>

      {/* ACCOUNT FOOTER SECTION */}
      <div
        ref={profileRef}
        className="relative shrink-0 px-3 py-3"
        style={{ borderTop: "1px solid var(--color-border-primary)" }}
      >
        {/* LOGOUT POPOVER — renders above the avatar button */}
        <AnimatePresence>
          {profileOpen && (
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.96 }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
              className="absolute bottom-[calc(100%+8px)] left-3 right-3 rounded-xl overflow-hidden z-[100] border shadow-xl"
              style={{
                background: "var(--color-bg-tertiary)",
                borderColor: "var(--color-border-primary)",
              }}
            >
              {/* User info row inside popover */}
              <div
                className="px-4 py-3 border-b"
                style={{ borderColor: "var(--color-border-primary)" }}
              >
                <p
                  className="text-xs font-semibold truncate"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  {user.name}
                </p>
                <p
                  className="text-[10px] truncate mt-0.5"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  {user.email}
                </p>
              </div>

              {/* Sign out button */}
              <button
                onClick={async () => {
                  setProfileOpen(false);
                  await logout();
                  router.push("/sign-in");
                }}
                disabled={isLoggingOut}
                className="w-full flex items-center gap-2.5 px-4 py-3 text-xs font-medium transition-colors hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-40"
                style={{ color: "var(--color-danger, #ef4444)" }}
              >
                {isLoggingOut ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <LogOut className="w-3.5 h-3.5" />
                )}
                {isLoggingOut ? "Signing out..." : "Sign out"}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* AVATAR TRIGGER BUTTON */}
        <button
          onClick={() => setProfileOpen(!profileOpen)}
          className={`w-full flex items-center rounded-xl transition-all hover:bg-black/5 dark:hover:bg-white/5 ${
            sidebarOpen ? "px-3 py-2.5 gap-3" : "p-1.5 justify-center"
          }`}
          style={{
            background: "transparent",
            border: `1px solid ${profileOpen ? "var(--color-border-primary)" : "transparent"}`,
          }}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 shadow-sm"
            style={{
              background: "var(--gradient-brand)",
              color: "var(--color-primary-foreground)",
            }}
          >
            {user.name
              .split(" ")
              .map((w) => w[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          </div>
          {sidebarOpen && (
            <>
              <div className="flex-1 text-left overflow-hidden">
                <p
                  className="text-xs font-medium truncate"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  {user.name}
                </p>
                <p
                  className="text-[10px] truncate opacity-70"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  {user.email}
                </p>
              </div>
              <motion.div
                animate={{ rotate: profileOpen ? 180 : 0 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="shrink-0"
              >
                <ChevronDown
                  className="w-3.5 h-3.5"
                  style={{ color: "var(--color-text-secondary)" }}
                />
              </motion.div>
            </>
          )}
        </button>
      </div>

      {/* DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {chatToDelete && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setChatToDelete(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="relative w-full max-w-[320px] p-5 glass-card overflow-hidden"
            >
              <h3
                className="text-base font-semibold mb-2"
                style={{ color: "var(--color-text-primary)" }}
              >
                Delete Chat
              </h3>
              <p
                className="text-sm mb-6"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Are you sure you want to delete this conversation? This action
                cannot be undone.
              </p>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setChatToDelete(null)}
                  disabled={isDeleting}
                  className="px-4 py-2 text-sm font-medium rounded-lg transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 text-sm font-medium rounded-lg flex items-center justify-center min-w-[80px]"
                  style={{ background: "var(--color-danger)", color: "#fff" }}
                >
                  {isDeleting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Delete"
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.aside>
  );
}
