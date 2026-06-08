"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Plus,
  MoreHorizontal,
  ChevronDown,
  Users,
  Filter,
} from "lucide-react";

const ROLES = ["Admin", "Editor", "Viewer"];

const INITIAL_USERS = [
  {
    id: "1",
    name: "Priyank Godhani",
    email: "priyank@acme.com",
    role: "Admin",
    status: "active",
    joined: "Jan 12, 2024",
    lastSeen: "Just now",
  },
  {
    id: "2",
    name: "Anya Kapoor",
    email: "anya@acme.com",
    role: "Editor",
    status: "active",
    joined: "Feb 3, 2024",
    lastSeen: "2 hr ago",
  },
  {
    id: "3",
    name: "Rohan Sharma",
    email: "rohan@acme.com",
    role: "Viewer",
    status: "active",
    joined: "Mar 8, 2024",
    lastSeen: "1 day ago",
  },
  {
    id: "4",
    name: "Meera Joshi",
    email: "meera@acme.com",
    role: "Editor",
    status: "inactive",
    joined: "Apr 1, 2024",
    lastSeen: "3 days ago",
  },
  {
    id: "5",
    name: "Siddharth R.",
    email: "sid@acme.com",
    role: "Viewer",
    status: "active",
    joined: "Apr 15, 2024",
    lastSeen: "5 hr ago",
  },
  {
    id: "6",
    name: "Kavya Nair",
    email: "kavya@acme.com",
    role: "Admin",
    status: "active",
    joined: "May 2, 2024",
    lastSeen: "30 min ago",
  },
  {
    id: "7",
    name: "Arjun Mehta",
    email: "arjun@acme.com",
    role: "Viewer",
    status: "pending",
    joined: "May 20, 2024",
    lastSeen: "Never",
  },
];

const AVATAR_COLORS = [
  "rgba(99,102,241,0.15)",
  "rgba(236,72,153,0.15)",
  "rgba(6,182,212,0.15)",
  "rgba(16,185,129,0.15)",
  "rgba(245,158,11,0.15)",
  "rgba(139,92,246,0.15)",
  "rgba(239,68,68,0.12)",
];
const AVATAR_TEXT = [
  "var(--color-primary)",
  "var(--color-accent)",
  "var(--color-accent-secondary)",
  "var(--color-success)",
  "var(--color-warning)",
  "#c084fc",
  "var(--color-danger)",
];

function UserAvatar({ name, index }: { name: string; index: number }) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
      style={{
        background: AVATAR_COLORS[index % AVATAR_COLORS.length],
        color: AVATAR_TEXT[index % AVATAR_TEXT.length],
        border: `1px solid ${AVATAR_TEXT[index % AVATAR_TEXT.length]}33`,
      }}
    >
      {initials}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    active: "badge-success",
    inactive: "badge-danger",
    pending: "badge-warning",
  };
  return (
    <span
      className={`${map[status] ?? "badge-info"} text-[11px] font-semibold px-2.5 py-0.5 rounded-full capitalize`}
    >
      {status}
    </span>
  );
}

function RoleDropdown({
  value,
  onChange,
}: {
  value: string;
  onChange: (r: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const color =
    {
      Admin: "var(--color-primary)",
      Editor: "var(--color-accent-secondary)",
      Viewer: "var(--color-text-tertiary)",
    }[value] ?? "var(--color-text-tertiary)";
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors"
        style={{
          background: "var(--color-bg-secondary)",
          color,
          border: "1px solid var(--color-border-primary)",
        }}
      >
        {value} <ChevronDown className="w-3 h-3" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full mt-1 left-0 glass-card z-20 py-1 min-w-[100px]"
            style={{ borderRadius: "var(--radius-md)" }}
          >
            {ROLES.map((r) => (
              <button
                key={r}
                onClick={() => {
                  onChange(r);
                  setOpen(false);
                }}
                className="w-full text-left px-3 py-1.5 text-xs font-medium transition-colors hover:bg-current/5"
                style={{
                  color:
                    r === value
                      ? "var(--color-primary)"
                      : "var(--color-text-secondary)",
                }}
              >
                {r}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function UsersManagementPage() {
  const [users, setUsers] = useState(INITIAL_USERS);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState<string | null>(null);

  const filtered = users.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = filterRole ? u.role === filterRole : true;
    return matchSearch && matchRole;
  });

  const changeRole = (id: string, role: string) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role } : u)));
  };

  const activeCount = users.filter((u) => u.status === "active").length;
  const pendingCount = users.filter((u) => u.status === "pending").length;

  return (
    <div className="mesh-bg min-h-full p-6 space-y-6">
      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl btn-gradient flex items-center justify-center">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1
              className="text-xl font-bold tracking-tight"
              style={{ color: "var(--color-text-primary)" }}
            >
              User Management
            </h1>
            <p
              className="text-xs mt-0.5"
              style={{ color: "var(--color-text-tertiary)" }}
            >
              <span
                className="font-semibold"
                style={{ color: "var(--color-success)" }}
              >
                {activeCount} active
              </span>
              {pendingCount > 0 && (
                <>
                  {" "}
                  ·{" "}
                  <span
                    className="font-semibold"
                    style={{ color: "var(--color-warning)" }}
                  >
                    {pendingCount} pending
                  </span>
                </>
              )}{" "}
              · {users.length} total
            </p>
          </div>
        </div>
        <button className="btn-gradient px-4 py-2.5 text-sm rounded-xl flex items-center gap-2 self-start sm:self-auto">
          <Plus className="w-4 h-4" /> Add User
        </button>
      </motion.div>

      {/* ── Table card ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
        className="glass-card overflow-hidden"
      >
        {/* Toolbar */}
        <div
          className="flex flex-col sm:flex-row items-start sm:items-center gap-3 px-5 py-4 border-b"
          style={{ borderColor: "var(--color-border-primary)" }}
        >
          {/* Search */}
          <div className="relative flex-1 w-full sm:max-w-xs">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5"
              style={{ color: "var(--color-text-tertiary)" }}
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users…"
              className="input-premium w-full pl-9 pr-4 py-2 text-sm"
              style={{ color: "var(--color-text-primary)" }}
            />
          </div>

          {/* Role filter chips */}
          <div className="flex items-center gap-2">
            <Filter
              className="w-3.5 h-3.5"
              style={{ color: "var(--color-text-tertiary)" }}
            />
            {[null, ...ROLES].map((r) => (
              <button
                key={r ?? "all"}
                onClick={() => setFilterRole(r)}
                className="text-xs font-semibold px-2.5 py-1 rounded-full transition-all duration-150"
                style={
                  filterRole === r
                    ? {
                        background: "var(--color-accent-muted)",
                        color: "var(--color-primary)",
                        border: "1px solid var(--color-primary)",
                      }
                    : {
                        background: "var(--color-bg-secondary)",
                        color: "var(--color-text-secondary)",
                        border: "1px solid var(--color-border-primary)",
                      }
                }
              >
                {r ?? "All"}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr style={{ background: "var(--color-bg-secondary)" }}>
                {[
                  "User",
                  "Role",
                  "Status",
                  "Joined",
                  "Last Seen",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3 text-[10px] font-semibold uppercase tracking-wider whitespace-nowrap"
                    style={{ color: "var(--color-text-tertiary)" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filtered.map((u, i) => (
                  <motion.tr
                    key={u.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04, duration: 0.3 }}
                    className="border-t transition-colors"
                    style={{ borderColor: "var(--color-border-primary)" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background =
                        "var(--color-bg-secondary)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    {/* User */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <UserAvatar name={u.name} index={i} />
                        <div>
                          <p
                            className="text-sm font-semibold"
                            style={{ color: "var(--color-text-primary)" }}
                          >
                            {u.name}
                          </p>
                          <p
                            className="text-[11px]"
                            style={{ color: "var(--color-text-tertiary)" }}
                          >
                            {u.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="px-5 py-3.5">
                      <RoleDropdown
                        value={u.role}
                        onChange={(r) => changeRole(u.id, r)}
                      />
                    </td>

                    {/* Status */}
                    <td className="px-5 py-3.5">
                      <StatusBadge status={u.status} />
                    </td>

                    {/* Joined */}
                    <td
                      className="px-5 py-3.5 text-xs whitespace-nowrap"
                      style={{ color: "var(--color-text-secondary)" }}
                    >
                      {u.joined}
                    </td>

                    {/* Last seen */}
                    <td
                      className="px-5 py-3.5 text-xs whitespace-nowrap"
                      style={{ color: "var(--color-text-tertiary)" }}
                    >
                      {u.lastSeen}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5">
                      <button
                        className="p-1.5 rounded-lg transition-colors hover:opacity-70"
                        style={{
                          color: "var(--color-text-tertiary)",
                          background: "var(--color-bg-secondary)",
                        }}
                      >
                        <MoreHorizontal className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="py-16 text-center">
              <p
                className="text-sm"
                style={{ color: "var(--color-text-tertiary)" }}
              >
                No users match your search.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="px-5 py-3 border-t flex items-center justify-between"
          style={{
            borderColor: "var(--color-border-primary)",
            background: "var(--color-bg-secondary)",
          }}
        >
          <p
            className="text-xs"
            style={{ color: "var(--color-text-tertiary)" }}
          >
            Showing {filtered.length} of {users.length} users
          </p>
          <div className="flex gap-1">
            {["Prev", "Next"].map((l) => (
              <button
                key={l}
                className="text-xs px-3 py-1 rounded-lg font-medium transition-colors hover:opacity-80"
                style={{
                  background: "var(--color-bg-elevated)",
                  border: "1px solid var(--color-border-primary)",
                  color: "var(--color-text-secondary)",
                }}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
