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
  Loader2,
  X,
  UserCheck,
  Check,
} from "lucide-react";
import { getAllUsers } from "@/hooks/queries/useUserQueries";
import { getAllRoles } from "@/hooks/queries/useRoleQueries";
import { useEditUserRoleMutation } from "@/hooks/mutations/useUserMutation";
import { UserWithRole } from "@/types/auth";
import { Role } from "@/types/role";

// Helper for dynamic colors based on application theme vars
const getRoleColor = (name: string) => {
  switch (name?.toLowerCase()) {
    case "admin":
      return "var(--color-primary)";
    case "manager":
      return "var(--color-accent)";
    case "employee":
      return "var(--color-success)";
    case "editor":
      return "var(--color-accent-secondary)";
    default:
      return "var(--color-text-tertiary)";
  }
};

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

function UserAvatar({ email, index }: { email: string; index: number }) {
  const initials = email ? email.substring(0, 2).toUpperCase() : "US";
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

/* ── MODAL DROPDOWN SELECTOR ── */
function RoleDropdown({
  value,
  roles,
  onChange,
}: {
  value: string;
  roles: Role[];
  onChange: (roleName: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const color = getRoleColor(value);

  return (
    <div className="relative w-full">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full text-sm font-semibold px-4 py-3 rounded-xl transition-all outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
        style={{
          background: "var(--color-bg-secondary)",
          color,
          border: "1px solid var(--color-border-primary)",
        }}
      >
        <span>{value}</span>
        <ChevronDown
          className={`w-4 h-4 opacity-70 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full mt-2 left-0 w-full glass-card z-[100] py-1.5 max-h-[220px] overflow-y-auto shadow-2xl border"
            style={{
              borderRadius: "var(--radius-md)",
              borderColor: "var(--color-border-primary)",
              background: "var(--color-bg-elevated)",
            }}
          >
            {roles.map((r) => {
              const isSelected = r.name === value;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => {
                    onChange(r.name);
                    setOpen(false);
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm font-medium transition-all hover:bg-current/10 flex items-center justify-between"
                  style={{
                    color: isSelected
                      ? "var(--color-primary)"
                      : "var(--color-text-primary)",
                  }}
                >
                  <span className="flex items-center gap-2">{r.name}</span>
                  {isSelected && <Check className="w-4 h-4" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── ACTION OVERLAY POP OVER ── */
function RowActions({ onEdit }: { onEdit: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="relative flex justify-end">
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="p-1.5 rounded-lg transition-colors hover:opacity-70"
        style={{
          color: "var(--color-text-tertiary)",
          background: "var(--color-bg-secondary)",
        }}
      >
        <MoreHorizontal className="w-3.5 h-3.5" />
      </button>
      <AnimatePresence>
        {menuOpen && (
          <>
            <div
              className="fixed inset-0 z-20"
              onClick={() => setMenuOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -5 }}
              transition={{ duration: 0.12 }}
              className="absolute right-0 top-full mt-1 glass-card z-30 py-1 min-w-[110px] shadow-xl"
              style={{ borderRadius: "var(--radius-sm)" }}
            >
              <button
                onClick={() => {
                  onEdit();
                  setMenuOpen(false);
                }}
                className="w-full text-left px-3 py-1.5 text-xs font-semibold transition-colors text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] hover:bg-current/5"
              >
                Edit Role
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

interface SelectedUserStructure {
  id: string;
  email: string;
  currentRole: string;
}

export default function UsersManagementPage() {
  const { data: serverUsers, isLoading: isUsersLoading } = getAllUsers() as {
    data: UserWithRole[] | undefined;
    isLoading: boolean;
  };
  const { data: dynamicRoles, isLoading: isRolesLoading } = getAllRoles();

  // Instantiate the React Query mutation engine
  const { mutateAsync: editUserRole, isPending: isSavingRole } =
    useEditUserRoleMutation();

  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState<string | null>(null);

  // Modal Context Configurations
  const [editingUser, setEditingUser] = useState<SelectedUserStructure | null>(
    null,
  );
  const [modalRoleSelection, setModalRoleSelection] = useState<string>("");

  const isLoading = isUsersLoading || isRolesLoading;
  const safeRoles = dynamicRoles || [];

  if (isLoading) {
    return (
      <div className="mesh-bg min-h-full p-6 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
        <p className="text-xs text-[var(--color-text-tertiary)] font-medium">
          Synchronizing workspace users and role layers...
        </p>
      </div>
    );
  }

  // Derive final values strictly from query caches (local state maps eliminated)
  const users =
    serverUsers?.map((u) => ({
      ...u,
      roleName: u.role?.name || "Viewer",
    })) || [];

  const filtered = users.filter((u) => {
    const matchSearch =
      u.email?.toLowerCase().includes(search.toLowerCase()) ?? false;
    const matchRole = filterRole ? u.roleName === filterRole : true;
    return matchSearch && matchRole;
  });

  const handleOpenEditModal = (
    id: string,
    email: string,
    currentRole: string,
  ) => {
    setEditingUser({ id, email, currentRole });
    setModalRoleSelection(currentRole);
  };

  // Async save handler running the network mutation request
  const handleSaveModalRole = async () => {
    if (!editingUser) return;

    // Find full DB entity corresponding to current text choice
    const targetRoleObj = safeRoles.find(
      (r) => r.name.toLowerCase() === modalRoleSelection.toLowerCase(),
    );

    if (!targetRoleObj) {
      console.error(
        "Selected role was not found in static records configuration mapping database lists.",
      );
      return;
    }

    try {
      // Execute transaction using unified parameter object layout
      await editUserRole({
        userId: editingUser.id,
        roleId: targetRoleObj.id,
      });

      // Clear layout modal context safely upon successful mutation invalidation
      setEditingUser(null);
    } catch (error) {
      console.error(
        "Failed to commit network update mutations to remote access control databases:",
        error,
      );
    }
  };

  return (
    <div className="mesh-bg min-h-full p-6 space-y-6 relative">
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
              Total users: {users.length}
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
              placeholder="Search by email…"
              className="input-premium w-full pl-9 pr-4 py-2 text-sm"
              style={{ color: "var(--color-text-primary)" }}
            />
          </div>

          {/* Dynamic Role Filter Chips */}
          <div className="flex items-center gap-2 flex-wrap">
            <Filter
              className="w-3.5 h-3.5"
              style={{ color: "var(--color-text-tertiary)" }}
            />
            <button
              onClick={() => setFilterRole(null)}
              className="text-xs font-semibold px-2.5 py-1 rounded-full transition-all duration-150"
              style={
                filterRole === null
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
              All
            </button>
            {safeRoles.map((r) => (
              <button
                key={r.id}
                onClick={() => setFilterRole(r.name)}
                className="text-xs font-semibold px-2.5 py-1 rounded-full transition-all duration-150"
                style={
                  filterRole === r.name
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
                {r.name}
              </button>
            ))}
          </div>
        </div>

        {/* Table Container */}
        <div className="overflow-x-auto min-h-[250px] w-full">
          <div className="w-full min-w-[700px] text-left border-collapse select-none">
            {/* ── Table Header ── */}
            <div
              className="grid grid-cols-[2.5fr_1.5fr_1.5fr_100px] items-center px-6 py-3"
              style={{ background: "var(--color-bg-secondary)" }}
            >
              {["User Email", "Role", "Joined"].map((h) => (
                <span
                  key={h}
                  className="text-[10px] font-bold uppercase tracking-wider"
                  style={{ color: "var(--color-text-tertiary)" }}
                >
                  {h}
                </span>
              ))}
              <span
                className="text-[10px] font-bold uppercase tracking-wider text-center"
                style={{ color: "var(--color-text-tertiary)" }}
              >
                Actions
              </span>
            </div>

            {/* ── Table Body Rows ── */}
            <div className="divide-y divide-[var(--color-border-primary)]">
              <AnimatePresence>
                {filtered.map((u, i) => {
                  const currentThemeColor = getRoleColor(u.roleName);
                  return (
                    <motion.div
                      key={u.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.04, duration: 0.3 }}
                      className="grid grid-cols-[2.5fr_1.5fr_1.5fr_100px] items-center px-6 py-3.5 transition-colors border-b"
                      style={{ borderColor: "var(--color-border-primary)" }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background =
                          "var(--color-bg-secondary)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      {/* User Email */}
                      <div className="flex items-center gap-3 pr-4 overflow-hidden">
                        <UserAvatar email={u.email} index={i} />
                        <p
                          className="text-sm font-semibold truncate"
                          style={{ color: "var(--color-text-primary)" }}
                        >
                          {u.email}
                        </p>
                      </div>

                      {/* Role Badge */}
                      <div>
                        <span
                          className="text-xs font-bold px-2.5 py-1 rounded-lg inline-block architecture-badge"
                          style={{
                            background: "var(--color-bg-secondary)",
                            color: currentThemeColor,
                            border: "1px solid var(--color-border-primary)",
                          }}
                        >
                          {u.roleName}
                        </span>
                      </div>

                      {/* Joined Date */}
                      <div
                        className="text-xs font-medium whitespace-nowrap"
                        style={{ color: "var(--color-text-secondary)" }}
                      >
                        {u.joined ||
                          (u.role?.created_at
                            ? new Date(u.role.created_at).toLocaleDateString()
                            : new Date().toLocaleDateString())}
                      </div>

                      {/* Actions Trigger */}
                      <div className="flex justify-center">
                        <RowActions
                          onEdit={() =>
                            handleOpenEditModal(u.id, u.email, u.roleName)
                          }
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>

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

      {/* ── EDIT ROLE MODAL SUBSYSTEM ── */}
      <AnimatePresence>
        {editingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop blur layer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={!isSavingRole ? () => setEditingUser(null) : undefined}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal Body Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="glass-card w-full max-w-md relative shadow-2xl z-10 border p-6 flex flex-col gap-5"
              style={{
                background: "var(--color-bg-elevated)",
                borderColor: "var(--color-border-primary)",
                borderRadius: "var(--radius-xl)",
              }}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[var(--color-accent-muted)] text-[var(--color-primary)] flex items-center justify-center">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold text-[var(--color-text-primary)]">
                    Modify Account Permissions
                  </h3>
                </div>
                <button
                  onClick={() => setEditingUser(null)}
                  disabled={isSavingRole}
                  className="p-1 rounded-lg text-[var(--color-text-tertiary)] hover:bg-current/5 transition-colors disabled:opacity-40"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Fields Layout */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-tertiary)]">
                    Target User Address
                  </label>
                  <div
                    className="px-3 py-2 text-sm font-semibold rounded-xl border select-all"
                    style={{
                      background: "var(--color-bg-secondary)",
                      color: "var(--color-text-primary)",
                      borderColor: "var(--color-border-primary)",
                    }}
                  >
                    {editingUser.email}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-tertiary)]">
                    Assigned Workspace Security Group
                  </label>
                  <RoleDropdown
                    value={modalRoleSelection}
                    roles={safeRoles}
                    onChange={(roleName) => setModalRoleSelection(roleName)}
                  />
                </div>
              </div>

              {/* Actions Footer */}
              <div
                className="flex items-center justify-end gap-2.5 mt-2 border-t pt-4"
                style={{ borderColor: "var(--color-border-primary)" }}
              >
                <button
                  type="button"
                  disabled={isSavingRole}
                  onClick={() => setEditingUser(null)}
                  className="text-xs px-4 py-2 rounded-xl font-semibold transition-colors border disabled:opacity-50"
                  style={{
                    background: "transparent",
                    borderColor: "var(--color-border-primary)",
                    color: "var(--color-text-secondary)",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={
                    isSavingRole ||
                    editingUser.currentRole === modalRoleSelection
                  }
                  onClick={handleSaveModalRole}
                  className="btn-gradient text-xs px-4 py-2 rounded-xl font-bold text-white shadow-md hover:opacity-90 transition-opacity flex items-center gap-2 min-w-[120px] justify-center disabled:opacity-50"
                >
                  {isSavingRole ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Workspace Changes"
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
