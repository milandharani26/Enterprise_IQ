"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useWorkspace } from "../(main)/layout";
import { useAuthStore } from "@/store/useAuthStore";
import {
  Plus,
  PanelLeftClose,
  PanelLeftOpen,
  LayoutDashboardIcon,
  ShieldCheckIcon,
  UsersIcon,
} from "lucide-react";

// ── Shared Component Framework Interfaces ─────────────────────────────────────
interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  ts: Date;
}
interface ChatSession {
  id: string;
  title: string;
  ts: Date;
  messages: Message[];
}

const FAKE_HISTORY: ChatSession[] = [
  {
    id: "1",
    title: "How to set up SSO with Okta",
    ts: new Date(Date.now() - 1000 * 60 * 30),
    messages: [],
  },
  {
    id: "2",
    title: "Explain rate limiting strategies",
    ts: new Date(Date.now() - 1000 * 60 * 60 * 3),
    messages: [],
  },
  {
    id: "3",
    title: "Debug Prisma N+1 query issue",
    ts: new Date(Date.now() - 1000 * 60 * 60 * 26),
    messages: [],
  },
  {
    id: "4",
    title: "Next.js app router vs pages",
    ts: new Date(Date.now() - 1000 * 60 * 60 * 50),
    messages: [],
  },
  {
    id: "5",
    title: "Docker multi-stage build setup",
    ts: new Date(Date.now() - 1000 * 60 * 60 * 72),
    messages: [],
  },
];

function groupByDate(sessions: ChatSession[]) {
  const today: ChatSession[] = [],
    yesterday: ChatSession[] = [],
    older: ChatSession[] = [];
  const now = new Date();
  const yest = new Date(now);
  yest.setDate(yest.getDate() - 1);
  sessions.forEach((s) => {
    const d = new Date(s.ts);
    if (d.toDateString() === now.toDateString()) today.push(s);
    else if (d.toDateString() === yest.toDateString()) yesterday.push(s);
    else older.push(s);
  });
  return { today, yesterday, older };
}

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
  const { sidebarOpen, setSidebarOpen, setActiveChat } = useWorkspace();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const { user: storeUser } = useAuthStore();
  const emailPrefix = storeUser?.email ? storeUser.email.split("@")[0] : "User";
  const user = { name: emailPrefix, email: storeUser?.email || "" };

  const grouped = groupByDate(sessions);
  const user = { name: "Priyank Godhani", email: "priyank@acme.com" };

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

  // Handle route click adjustments for mobile screens
  const handleNavigation = (path: string) => {
    router.push(path);
    // Automatically slide sidebar shut after selecting a route on mobile viewports
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  // Responsive Framer Motion Animation Settings
  const sidebarVariants = {
    open: { width: 260, opacity: 1 },
    collapsed: {
      // Dynamic fallback check: If screen viewport width is desktop, fall back to mini-rail width, else hide fully
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
      className={`fixed inset-y-0 left-0 lg:relative flex flex-col shrink-0 overflow-hidden h-full z-50 shadow-2xl lg:shadow-none`}
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
          /* Desktop layout expansion button toggle */
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
        {/* Action: Setup New Chat Instance */}
        <button
          onClick={() => {
            setActiveChat(null);
            handleNavigation("/chat");
          }}
          className={`w-full flex items-center rounded-lg transition-all duration-150 active:scale-[0.98] ${sidebarOpen ? "px-3 py-2 gap-2 text-sm" : "p-2.5 justify-center"}`}
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

        <div className="space-y-1.5 pt-2">
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
          className={`w-full flex items-center rounded-xl ${sidebarOpen ? "px-3 py-2.5 gap-3" : "p-1.5 justify-center"}`}
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
