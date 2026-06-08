"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useWorkspace } from "../(main)/layout";
import {
  Plus,
  MessageSquare,
  ChevronDown,
  ChevronRight,
  LogOut,
  User,
  Settings,
  Trash2,
  PanelLeftClose,
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
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
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
  const { sidebarOpen, setSidebarOpen, activeChat, setActiveChat } =
    useWorkspace();
  const [historyOpen, setHistoryOpen] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>(FAKE_HISTORY);
  const profileRef = useRef<HTMLDivElement>(null);

  const user = { name: "Priyank Godhani", email: "priyank@acme.com" };
  const grouped = groupByDate(sessions);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node))
        setProfileOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const deleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSessions((prev) => prev.filter((s) => s.id !== id));
    if (activeChat === id) setActiveChat(null);
  };

  const SessionRow = ({ session }: { session: ChatSession }) => {
    const [hovered, setHovered] = useState(false);
    const isActive = activeChat === session.id;
    return (
      <div
        onClick={() => setActiveChat(session.id)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all duration-150 relative"
        style={{
          background: isActive
            ? "var(--brand-8)"
            : hovered
              ? "var(--brand-4)"
              : "transparent",
          border: isActive
            ? "1px solid var(--brand-15)"
            : "1px solid transparent",
        }}
      >
        {isActive && (
          <div
            className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-full"
            style={{ background: "var(--brand-light)" }}
          />
        )}
        <MessageSquare
          className="w-3.5 h-3.5 shrink-0"
          style={{
            color: isActive ? "var(--brand-light)" : "var(--auth-label)",
          }}
        />
        <span
          className="text-xs truncate flex-1"
          style={{
            color: isActive ? "var(--auth-heading)" : "var(--auth-subtext)",
          }}
        >
          {session.title}
        </span>
        {hovered && (
          <button
            onClick={(e) => deleteSession(session.id, e)}
            className="shrink-0 p-0.5 rounded transition-colors hover:text-red-400"
            style={{ color: "var(--auth-label)" }}
          >
            <Trash2 className="w-3 h-3" />
          </button>
        )}
      </div>
    );
  };

  return (
    <AnimatePresence initial={false}>
      {sidebarOpen && (
        <motion.aside
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 260, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="relative flex flex-col shrink-0 overflow-hidden h-full z-20"
          style={{
            background: "var(--auth-panel-left)",
            borderRight: "1px solid var(--auth-edge-line)",
          }}
        >
          {/* Logo Context */}
          <div
            className="flex items-center gap-2.5 px-4 py-4 shrink-0"
            style={{ borderBottom: "1px solid var(--auth-edge-line)" }}
          >
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
              className="text-sm font-semibold"
              style={{ color: "var(--auth-heading)" }}
            >
              EnterpriseIQ
            </span>
            <button
              onClick={() => setSidebarOpen(false)}
              className="ml-auto p-1 rounded-md transition-colors hover:opacity-70"
              style={{ color: "var(--auth-subtext)" }}
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </div>

          {/* Setup Initial Chat Call Trigger */}
          <div className="px-3 pt-3 pb-2 shrink-0">
            <button
              onClick={() => {
                (setActiveChat(null), router.push("/chat"));
              }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 active:scale-[0.98]"
              style={{
                background: "var(--brand-10)",
                border: "1px solid var(--brand-20)",
                color: "var(--brand-light)",
              }}
            >
              <Plus className="w-4 h-4" /> New Chat
            </button>
          </div>

          <div className="px-3 pt-3 pb-2 shrink-0">
            <button
              onClick={() => router.push("/dashboard")}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 active:scale-[0.98]"
              style={{
                background: "var(--brand-10)",
                border: "1px solid var(--brand-20)",
                color: "var(--brand-light)",
              }}
            >
              <LayoutDashboardIcon className="w-4 h-4" /> Dashboard
            </button>
          </div>
          <div className="px-3 pt-3 pb-2 shrink-0">
            <button
              onClick={() => router.push("/users")}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 active:scale-[0.98]"
              style={{
                background: "var(--brand-10)",
                border: "1px solid var(--brand-20)",
                color: "var(--brand-light)",
              }}
            >
              <UsersIcon className="w-4 h-4" /> User Management
            </button>
          </div>
          <div className="px-3 pt-3 pb-2 shrink-0">
            <button
              onClick={() => router.push("/roles")}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 active:scale-[0.98]"
              style={{
                background: "var(--brand-10)",
                border: "1px solid var(--brand-20)",
                color: "var(--brand-light)",
              }}
            >
              <ShieldCheckIcon className="w-4 h-4" /> Roles Management
            </button>
          </div>

          {/* Chat List Navigation Node Container */}
          <div className="flex-1 overflow-y-auto px-3 pb-2 space-y-1 scrollbar-thin">
            <button
              onClick={() => setHistoryOpen(!historyOpen)}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md transition-colors duration-150 group"
              style={{ color: "var(--auth-label)" }}
            >
              <motion.div
                animate={{ rotate: historyOpen ? 90 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </motion.div>
              <span className="text-[11px] font-semibold uppercase tracking-wider">
                Chat History
              </span>
            </button>

            <AnimatePresence initial={false}>
              {historyOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  {grouped.today.length > 0 && (
                    <div className="mb-1">
                      <p
                        className="px-3 py-1 text-[10px] font-medium uppercase tracking-widest"
                        style={{ color: "var(--auth-divider)" }}
                      >
                        Today
                      </p>
                      {grouped.today.map((s) => (
                        <SessionRow key={s.id} session={s} />
                      ))}
                    </div>
                  )}
                  {grouped.yesterday.length > 0 && (
                    <div className="mb-1">
                      <p
                        className="px-3 py-1 text-[10px] font-medium uppercase tracking-widest"
                        style={{ color: "var(--auth-divider)" }}
                      >
                        Yesterday
                      </p>
                      {grouped.yesterday.map((s) => (
                        <SessionRow key={s.id} session={s} />
                      ))}
                    </div>
                  )}
                  {grouped.older.length > 0 && (
                    <div className="mb-1">
                      <p
                        className="px-3 py-1 text-[10px] font-medium uppercase tracking-widest"
                        style={{ color: "var(--auth-divider)" }}
                      >
                        Older
                      </p>
                      {grouped.older.map((s) => (
                        <SessionRow key={s.id} session={s} />
                      ))}
                    </div>
                  )}
                  {sessions.length === 0 && (
                    <p
                      className="px-3 py-4 text-xs text-center"
                      style={{ color: "var(--auth-label)" }}
                    >
                      No history yet
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Account Profile Section */}
          <div
            ref={profileRef}
            className="relative shrink-0 px-3 py-3"
            style={{ borderTop: "1px solid var(--auth-edge-line)" }}
          >
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150"
              style={{
                background: profileOpen ? "var(--brand-6)" : "var(--brand-4)",
                border: "1px solid var(--auth-card-border)",
              }}
            >
              <Avatar name={user.name} size={7} />
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
              <motion.div
                animate={{ rotate: profileOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown
                  className="w-3.5 h-3.5 shrink-0"
                  style={{ color: "var(--auth-label)" }}
                />
              </motion.div>
            </button>

            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  className="absolute bottom-full left-3 right-3 mb-2 rounded-xl overflow-hidden shadow-xl z-50"
                  style={{
                    background: "var(--auth-panel-left)",
                    border: "1px solid var(--auth-card-border)",
                    boxShadow: "0 -8px 32px rgba(0,0,0,0.3)",
                  }}
                >
                  <div
                    className="px-4 py-3"
                    style={{ borderBottom: "1px solid var(--auth-edge-line)" }}
                  >
                    <p
                      className="text-xs font-semibold"
                      style={{ color: "var(--auth-heading)" }}
                    >
                      {user.name}
                    </p>
                    <p
                      className="text-[11px]"
                      style={{ color: "var(--auth-label)" }}
                    >
                      {user.email}
                    </p>
                  </div>
                  {[
                    { icon: User, label: "Profile" },
                    { icon: Settings, label: "Settings" },
                  ].map(({ icon: Icon, label }) => (
                    <button
                      key={label}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors duration-150 text-left hover:bg-brand-4 rounded-lg"
                      style={{ color: "var(--auth-subtext)" }}
                    >
                      <Icon className="w-3.5 h-3.5" /> {label}
                    </button>
                  ))}
                  <div style={{ borderTop: "1px solid var(--auth-edge-line)" }}>
                    <button
                      onClick={() => router.push("/sign-in")}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors duration-150 text-left text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-lg"
                    >
                      <LogOut className="w-3.5 h-3.5" /> Sign out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
