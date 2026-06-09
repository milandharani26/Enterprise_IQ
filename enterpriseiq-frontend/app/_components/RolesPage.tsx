"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Bot,
  Plus,
  Edit2,
  Trash2,
  Check,
  AlertTriangle,
  Lock,
  Loader2,
} from "lucide-react";

// Hook and Type Imports
import { getAllRoles } from "@/hooks/queries/useRoleQueries";
import { Role as ApiRole } from "@/types/role";

interface Assistant {
  id: string;
  label: string;
  description: string;
  restricted?: boolean;
}

const ASSISTANT_GROUPS: { group: string; items: Assistant[] }[] = [
  {
    group: "Core Productivity",
    items: [
      {
        id: "asst.query_runner",
        label: "Query Runner Assistant",
        description: "Executes base level AI models and formulas",
      },
      {
        id: "asst.data_exporter",
        label: "Data Export Assistant",
        description: "Compiles and downloads session results",
      },
      {
        id: "asst.session_cleaner",
        label: "Session Manager Assistant",
        description: "Prunes inactive chat arrays and histories",
      },
    ],
  },
  {
    group: "Workspace Integrations",
    items: [
      {
        id: "asst.ws_analyst",
        label: "Workspace Analyst",
        description: "Reads overall workspace metrics and status",
      },
      {
        id: "asst.ws_architect",
        label: "Workspace Architect",
        description: "Edits layouts and environment configurations",
      },
      {
        id: "asst.billing_bot",
        label: "Billing & Ledger Assistant",
        description: "Monitors consumption rates and updates invoices",
        restricted: true,
      },
    ],
  },
  {
    group: "Supervision & Governance",
    items: [
      {
        id: "asst.user_moderator",
        label: "User Provisioning Assistant",
        description: "Invites, suspends, or monitors active users",
      },
      {
        id: "asst.role_governor",
        label: "Role Allocation Assistant",
        description: "Creates and edits system security boundaries",
      },
      {
        id: "asst.security_officer",
        label: "API Access Key Master",
        description: "Spawns and revokes production API gateways",
        restricted: true,
      },
      {
        id: "asst.audit_recorder",
        label: "Audit Trail Inspector",
        description: "Maintains full read tracking over system logs",
      },
    ],
  },
];

// Helper to determine role colors dynamically based on code or name
const getRoleColor = (roleCode: string) => {
  switch (roleCode?.toLowerCase()) {
    case "admin":
      return "var(--color-primary)";
    case "editor":
      return "var(--color-accent-secondary)";
    default:
      return "var(--color-text-tertiary)";
  }
};

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
  // Fetching dynamic dynamic data via React Query
  const { data: dynamicRoles, isLoading, isError, error } = getAllRoles();

  const [selectedRole, setSelectedRole] = useState<ApiRole | null>(null);

  // Synchronize state when data loaded from backend APIs
  useEffect(() => {
    if (dynamicRoles && dynamicRoles.length > 0 && !selectedRole) {
      setSelectedRole(dynamicRoles[0]);
    }
  }, [dynamicRoles, selectedRole]);

  // Aggregate total flat assistants count from layout configuration schemas
  const totalAssistantsCount = ASSISTANT_GROUPS.reduce(
    (acc, group) => acc + group.items.length,
    0,
  );

  // Handle Loading View
  if (isLoading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
        <p className="text-xs text-[var(--color-text-tertiary)] font-medium">
          Loading system access profiles...
        </p>
      </div>
    );
  }

  // Handle Error View
  if (isError) {
    return (
      <div className="p-6 max-w-xl mx-auto mt-10 glass-card border border-[var(--color-danger)]/20 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-[var(--color-danger-bg)] flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6 text-[var(--color-danger)]" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-[var(--color-text-primary)]">
            Failed to Synchronize Access Control Lists
          </h3>
          <p className="text-xs text-[var(--color-text-tertiary)] mt-1">
            {error instanceof Error
              ? error.message
              : "An unknown communication issue occurred."}
          </p>
        </div>
      </div>
    );
  }

  // Active assistant details for the selected role
  const activeCount = selectedRole?.assistant_ids?.length || 0;

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
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1
              className="text-xl font-bold tracking-tight"
              style={{ color: "var(--color-text-primary)" }}
            >
              Role Access Pools
            </h1>
            <p
              className="text-xs mt-0.5"
              style={{ color: "var(--color-text-tertiary)" }}
            >
              Allocate which AI Assistants each role has structural access to
            </p>
          </div>
        </div>
        <button className="btn-gradient px-4 py-2.5 text-sm rounded-xl flex items-center gap-2 self-start sm:self-auto">
          <Plus className="w-4 h-4" /> Create Role
        </button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* ── Dynamic Role Cards ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-3"
        >
          {dynamicRoles?.map((role, i) => {
            const isSelected = selectedRole?.id === role.id;
            const roleColor = getRoleColor(role.role_code);
            const count = role.assistant_ids?.length || 0;

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
                    ? roleColor
                    : "var(--color-border-tertiary)",
                  boxShadow: isSelected
                    ? `0 0 0 1px ${roleColor}33, var(--shadow-md)`
                    : "var(--shadow-sm)",
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{
                        background: `${roleColor}18`,
                        border: `1px solid ${roleColor}33`,
                      }}
                    >
                      <Lock
                        className="w-3.5 h-3.5"
                        style={{ color: roleColor }}
                      />
                    </div>
                    <div>
                      <p
                        className="text-sm font-bold"
                        style={{
                          color: isSelected
                            ? roleColor
                            : "var(--color-text-primary)",
                        }}
                      >
                        {role.name}
                      </p>
                      <p
                        className="text-[11px]"
                        style={{ color: "var(--color-text-tertiary)" }}
                      >
                        Code: {role.role_code}
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
                    {role.role_code?.toLowerCase() !== "admin" && (
                      <button
                        className="p-1.5 rounded-lg hover:opacity-70 transition-opacity"
                        style={{ color: "var(--color-danger)" }}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Assistant allocation summary bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-[11px] mb-1">
                    <span style={{ color: "var(--color-text-tertiary)" }}>
                      Assigned Assistants
                    </span>
                    <span
                      className="font-semibold"
                      style={{ color: roleColor }}
                    >
                      {count}/{totalAssistantsCount}
                    </span>
                  </div>
                  <div
                    className="h-1 rounded-full overflow-hidden"
                    style={{ background: "var(--color-bg-secondary)" }}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${totalAssistantsCount > 0 ? (count / totalAssistantsCount) * 100 : 0}%`,
                        background: roleColor,
                      }}
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* ── Assistant Editor Panel ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.14, ease: [0.22, 1, 0.36, 1] }}
          className="lg:col-span-2 glass-card overflow-hidden"
        >
          {selectedRole ? (
            <>
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
                      {selectedRole.name} Assistant Permissions
                    </h2>
                    <p
                      className="text-xs mt-0.5"
                      style={{ color: "var(--color-text-tertiary)" }}
                    >
                      {activeCount} of {totalAssistantsCount} assistants enabled
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
                {selectedRole.role_code?.toLowerCase() === "admin" && (
                  <div
                    className="mt-3 flex items-start gap-2 px-3 py-2.5 rounded-lg text-xs"
                    style={{
                      background: "var(--color-warning-bg)",
                      border: "1px solid var(--color-warning)33",
                      color: "var(--color-warning)",
                    }}
                  >
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    Admin roles are explicitly fused to all systemic assistants
                    and cannot be modified.
                  </div>
                )}
              </div>

              {/* Assistant groups array */}
              <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-320px)] scrollbar-thin">
                {ASSISTANT_GROUPS.map((group, gi) => (
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

                    {/* Assistant listing grid/rows */}
                    <div className="space-y-2">
                      {group.items.map((asst) => {
                        // Structural bridging checking against incoming ApiRole array
                        const enabled = !!selectedRole.assistant_ids?.includes(
                          asst.id,
                        );
                        const isAdmin =
                          selectedRole.role_code?.toLowerCase() === "admin";
                        return (
                          <div
                            key={asst.id}
                            className="flex items-center justify-between p-3.5 rounded-xl transition-colors"
                            style={{
                              background: asst.restricted
                                ? "var(--color-danger-bg)"
                                : "var(--color-bg-secondary)",
                              border: asst.restricted
                                ? "1px solid var(--color-danger)22"
                                : "1px solid var(--color-border-primary)",
                            }}
                          >
                            <div className="flex items-start gap-3">
                              {asst.restricted && (
                                <AlertTriangle
                                  className="w-3.5 h-3.5 mt-0.5 shrink-0"
                                  style={{ color: "var(--color-danger)" }}
                                />
                              )}
                              {!asst.restricted && enabled && (
                                <Check
                                  className="w-3.5 h-3.5 mt-0.5 shrink-0"
                                  style={{ color: "var(--color-success)" }}
                                />
                              )}
                              {!asst.restricted && !enabled && (
                                <div
                                  className="w-3.5 h-3.5 mt-0.5 shrink-0 rounded-full border-2"
                                  style={{
                                    borderColor:
                                      "var(--color-border-secondary)",
                                  }}
                                />
                              )}
                              <div>
                                <p
                                  className="text-xs font-semibold"
                                  style={{
                                    color: asst.restricted
                                      ? "var(--color-danger)"
                                      : "var(--color-text-primary)",
                                  }}
                                >
                                  {asst.label}
                                </p>
                                <p
                                  className="text-[11px] mt-0.5"
                                  style={{
                                    color: "var(--color-text-tertiary)",
                                  }}
                                >
                                  {asst.description}
                                </p>
                              </div>
                            </div>
                            <Toggle
                              checked={enabled}
                              onChange={() => {
                                // Left unmodified as requested
                              }}
                              disabled={isAdmin}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Action configurations panel */}
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
            </>
          ) : (
            <div className="p-6 text-center text-xs text-[var(--color-text-tertiary)]">
              Select a functional access role profile to verify system
              entitlements.
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
