"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Shield,
  Plus,
  Edit2,
  Trash2,
  Check,
  AlertTriangle,
  Lock,
} from "lucide-react";

interface Permission {
  id: string;
  label: string;
  description: string;
  dangerous?: boolean;
}

interface Role {
  id: string;
  name: string;
  description: string;
  color: string;
  userCount: number;
  permissions: Record<string, boolean>;
}

const PERMISSION_GROUPS: { group: string; items: Permission[] }[] = [
  {
    group: "Queries & Sessions",
    items: [
      {
        id: "query.run",
        label: "Run queries",
        description: "Execute AI queries",
      },
      {
        id: "query.export",
        label: "Export results",
        description: "Download query results",
      },
      {
        id: "query.delete",
        label: "Delete sessions",
        description: "Remove chat sessions",
      },
    ],
  },
  {
    group: "Workspace",
    items: [
      {
        id: "ws.read",
        label: "View workspace",
        description: "Read workspace data",
      },
      {
        id: "ws.manage",
        label: "Manage workspace",
        description: "Edit workspace settings",
      },
      {
        id: "ws.billing",
        label: "Billing access",
        description: "View and manage billing",
        dangerous: true,
      },
    ],
  },
  {
    group: "Administration",
    items: [
      {
        id: "admin.users",
        label: "Manage users",
        description: "Invite, edit, remove users",
      },
      {
        id: "admin.roles",
        label: "Manage roles",
        description: "Create and assign roles",
      },
      {
        id: "admin.api_keys",
        label: "API key management",
        description: "Create/revoke API keys",
        dangerous: true,
      },
      {
        id: "admin.audit",
        label: "View audit logs",
        description: "Access full audit trail",
      },
    ],
  },
];

const INITIAL_ROLES: Role[] = [
  {
    id: "1",
    name: "Admin",
    description: "Full access to all features and settings.",
    color: "var(--color-primary)",
    userCount: 2,
    permissions: {
      "query.run": true,
      "query.export": true,
      "query.delete": true,
      "ws.read": true,
      "ws.manage": true,
      "ws.billing": true,
      "admin.users": true,
      "admin.roles": true,
      "admin.api_keys": true,
      "admin.audit": true,
    },
  },
  {
    id: "2",
    name: "Editor",
    description: "Can run queries and manage workspace, limited admin.",
    color: "var(--color-accent-secondary)",
    userCount: 2,
    permissions: {
      "query.run": true,
      "query.export": true,
      "query.delete": false,
      "ws.read": true,
      "ws.manage": true,
      "ws.billing": false,
      "admin.users": false,
      "admin.roles": false,
      "admin.api_keys": false,
      "admin.audit": false,
    },
  },
  {
    id: "3",
    name: "Viewer",
    description: "Read-only access to workspace and queries.",
    color: "var(--color-text-tertiary)",
    userCount: 3,
    permissions: {
      "query.run": true,
      "query.export": false,
      "query.delete": false,
      "ws.read": true,
      "ws.manage": false,
      "ws.billing": false,
      "admin.users": false,
      "admin.roles": false,
      "admin.api_keys": false,
      "admin.audit": false,
    },
  },
];

function Toggle({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={!disabled ? onChange : undefined}
      className="relative w-9 h-5 rounded-full transition-all duration-200 shrink-0"
      style={{
        background: checked
          ? "var(--color-primary)"
          : "var(--color-bg-secondary)",
        border: `1px solid ${checked ? "var(--color-primary)" : "var(--color-border-secondary)"}`,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.4 : 1,
      }}
    >
      <div
        className="absolute top-0.5 transition-all duration-200 w-3.5 h-3.5 rounded-full bg-white shadow-sm"
        style={{ left: checked ? "calc(100% - 16px)" : "2px" }}
      />
    </button>
  );
}

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>(INITIAL_ROLES);
  const [selectedRole, setSelectedRole] = useState<Role>(INITIAL_ROLES[0]);

  const togglePermission = (permId: string) => {
    setRoles((prev) =>
      prev.map((r) => {
        if (r.id !== selectedRole.id) return r;
        const updated = {
          ...r,
          permissions: { ...r.permissions, [permId]: !r.permissions[permId] },
        };
        setSelectedRole(updated);
        return updated;
      }),
    );
  };

  const allCount = Object.values(selectedRole.permissions).filter(
    Boolean,
  ).length;
  const totalCount = Object.keys(selectedRole.permissions).length;

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
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1
              className="text-xl font-bold tracking-tight"
              style={{ color: "var(--color-text-primary)" }}
            >
              Role Management
            </h1>
            <p
              className="text-xs mt-0.5"
              style={{ color: "var(--color-text-tertiary)" }}
            >
              Configure permissions for each role
            </p>
          </div>
        </div>
        <button className="btn-gradient px-4 py-2.5 text-sm rounded-xl flex items-center gap-2 self-start sm:self-auto">
          <Plus className="w-4 h-4" /> Create Role
        </button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* ── Role cards ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-3"
        >
          {roles.map((role, i) => {
            const isSelected = selectedRole.id === role.id;
            const count = Object.values(role.permissions).filter(
              Boolean,
            ).length;
            return (
              <motion.div
                key={role.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  delay: 0.1 + i * 0.07,
                  duration: 0.35,
                  ease: [0.22, 1, 0.36, 1],
                }}
                onClick={() => setSelectedRole(role)}
                className="glass-card p-4 cursor-pointer transition-all duration-200"
                style={{
                  borderColor: isSelected
                    ? role.color
                    : "var(--color-border-tertiary)",
                  boxShadow: isSelected
                    ? `0 0 0 1px ${role.color}33, var(--shadow-md)`
                    : "var(--shadow-sm)",
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{
                        background: `${role.color}18`,
                        border: `1px solid ${role.color}33`,
                      }}
                    >
                      <Lock
                        className="w-3.5 h-3.5"
                        style={{ color: role.color }}
                      />
                    </div>
                    <div>
                      <p
                        className="text-sm font-bold"
                        style={{
                          color: isSelected
                            ? role.color
                            : "var(--color-text-primary)",
                        }}
                      >
                        {role.name}
                      </p>
                      <p
                        className="text-[11px]"
                        style={{ color: "var(--color-text-tertiary)" }}
                      >
                        {role.userCount} user{role.userCount !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button
                      className="p-1.5 rounded-lg hover:opacity-70 transition-opacity"
                      style={{ color: "var(--color-text-tertiary)" }}
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    {role.name !== "Admin" && (
                      <button
                        className="p-1.5 rounded-lg hover:opacity-70 transition-opacity"
                        style={{ color: "var(--color-danger)" }}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>

                <p
                  className="text-xs mt-2 line-clamp-2"
                  style={{ color: "var(--color-text-tertiary)" }}
                >
                  {role.description}
                </p>

                {/* Permission summary bar */}
                <div className="mt-3">
                  <div className="flex justify-between text-[11px] mb-1">
                    <span style={{ color: "var(--color-text-tertiary)" }}>
                      Permissions
                    </span>
                    <span
                      className="font-semibold"
                      style={{ color: role.color }}
                    >
                      {count}/{Object.keys(role.permissions).length}
                    </span>
                  </div>
                  <div
                    className="h-1 rounded-full overflow-hidden"
                    style={{ background: "var(--color-bg-secondary)" }}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${(count / Object.keys(role.permissions).length) * 100}%`,
                        background: role.color,
                      }}
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* ── Permission editor ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.14, ease: [0.22, 1, 0.36, 1] }}
          className="lg:col-span-2 glass-card overflow-hidden"
        >
          {/* Editor header */}
          <div
            className="px-6 py-5 border-b"
            style={{ borderColor: "var(--color-border-primary)" }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h2
                  className="text-base font-bold"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  {selectedRole.name} Permissions
                </h2>
                <p
                  className="text-xs mt-0.5"
                  style={{ color: "var(--color-text-tertiary)" }}
                >
                  {allCount} of {totalCount} permissions enabled
                </p>
              </div>
              <span
                className="text-xs font-semibold px-3 py-1 rounded-full"
                style={{
                  background: "var(--color-accent-muted)",
                  color: "var(--color-primary)",
                }}
              >
                {selectedRole.name}
              </span>
            </div>

            {/* Warning for Admin */}
            {selectedRole.name === "Admin" && (
              <div
                className="mt-3 flex items-start gap-2 px-3 py-2.5 rounded-lg text-xs"
                style={{
                  background: "var(--color-warning-bg)",
                  border: "1px solid var(--color-warning)33",
                  color: "var(--color-warning)",
                }}
              >
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                Admin permissions are locked and cannot be modified.
              </div>
            )}
          </div>

          {/* Permission groups */}
          <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-320px)] scrollbar-thin">
            {PERMISSION_GROUPS.map((group, gi) => (
              <motion.div
                key={group.group}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.2 + gi * 0.07,
                  duration: 0.35,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                {/* Group header */}
                <div className="flex items-center gap-2 mb-3">
                  <p
                    className="text-[11px] font-semibold uppercase tracking-widest"
                    style={{ color: "var(--color-text-tertiary)" }}
                  >
                    {group.group}
                  </p>
                  <div
                    className="flex-1 h-px"
                    style={{ background: "var(--color-border-primary)" }}
                  />
                </div>

                {/* Permission rows */}
                <div className="space-y-2">
                  {group.items.map((perm) => {
                    const enabled = !!selectedRole.permissions[perm.id];
                    const isAdmin = selectedRole.name === "Admin";
                    return (
                      <div
                        key={perm.id}
                        className="flex items-center justify-between p-3.5 rounded-xl transition-colors"
                        style={{
                          background: perm.dangerous
                            ? "var(--color-danger-bg)"
                            : "var(--color-bg-secondary)",
                          border: perm.dangerous
                            ? "1px solid var(--color-danger)22"
                            : "1px solid var(--color-border-primary)",
                        }}
                      >
                        <div className="flex items-start gap-3">
                          {perm.dangerous && (
                            <AlertTriangle
                              className="w-3.5 h-3.5 mt-0.5 shrink-0"
                              style={{ color: "var(--color-danger)" }}
                            />
                          )}
                          {!perm.dangerous && enabled && (
                            <Check
                              className="w-3.5 h-3.5 mt-0.5 shrink-0"
                              style={{ color: "var(--color-success)" }}
                            />
                          )}
                          {!perm.dangerous && !enabled && (
                            <div
                              className="w-3.5 h-3.5 mt-0.5 shrink-0 rounded-full border-2"
                              style={{
                                borderColor: "var(--color-border-secondary)",
                              }}
                            />
                          )}
                          <div>
                            <p
                              className="text-xs font-semibold"
                              style={{
                                color: perm.dangerous
                                  ? "var(--color-danger)"
                                  : "var(--color-text-primary)",
                              }}
                            >
                              {perm.label}
                            </p>
                            <p
                              className="text-[11px] mt-0.5"
                              style={{ color: "var(--color-text-tertiary)" }}
                            >
                              {perm.description}
                            </p>
                          </div>
                        </div>
                        <Toggle
                          checked={enabled}
                          onChange={() => togglePermission(perm.id)}
                          disabled={isAdmin}
                        />
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Save footer */}
          <div
            className="px-6 py-4 border-t flex justify-end gap-3"
            style={{
              borderColor: "var(--color-border-primary)",
              background: "var(--color-bg-secondary)",
            }}
          >
            <button
              className="px-4 py-2 text-sm font-semibold rounded-xl transition-colors hover:opacity-70"
              style={{
                color: "var(--color-text-secondary)",
                background: "var(--color-bg-elevated)",
                border: "1px solid var(--color-border-secondary)",
              }}
            >
              Reset
            </button>
            <button className="btn-gradient px-5 py-2 text-sm rounded-xl">
              Save Changes
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
