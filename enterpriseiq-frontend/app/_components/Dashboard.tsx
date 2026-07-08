"use client";

import { motion } from "framer-motion";
import { useAuthStore } from "@/store/useAuthStore";
import { useDashboardStats } from "@/hooks/queries/useAnalyticsQueries";
import { PageContent } from "@/app/_components/PageContent";
import {
  Users,
  MessageSquare,
  Zap,
  TrendingUp,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Activity,
  Loader2,
} from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const, delay },
});

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({
  icon: Icon,
  label,
  value,
  delta,
  colorVar,
  glowColor,
  valueClassName = "text-3xl font-bold tracking-tight",
}: {
  icon: any;
  label: string;
  value: string | number;
  delta?: string;
  colorVar: string;
  glowColor: string;
  valueClassName?: string;
}) {
  return (
    <div className="glass-card glass-card-hover p-5 relative overflow-hidden">
      <div
        className="absolute top-0 right-0 w-32 h-32 pointer-events-none"
        style={{
          background: `radial-gradient(circle at top right, ${glowColor} 0%, transparent 65%)`,
        }}
      />

      <div className="relative z-10 flex items-start justify-between">
        <div className="flex-1 min-w-0 pr-3">
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-2"
            style={{ color: "var(--color-text-tertiary)" }}
          >
            {label}
          </p>
          <p
            className={`${valueClassName} truncate`}
            style={{ color: colorVar }}
            title={String(value)}
          >
            {value}
          </p>
          {delta && (
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp
                className="w-3.5 h-3.5"
                style={{ color: "var(--color-success)" }}
              />
              <span
                className="text-xs font-medium"
                style={{ color: "var(--color-success)" }}
              >
                {delta}
              </span>
              <span
                className="text-xs"
                style={{ color: "var(--color-text-tertiary)" }}
              >
                vs last week
              </span>
            </div>
          )}
        </div>
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{
            background: glowColor,
            border: `1px solid ${glowColor}`,
          }}
        >
          <Icon className="w-5 h-5" style={{ color: colorVar }} />
        </div>
      </div>
    </div>
  );
}

// ── Progress bar ──────────────────────────────────────────────────────────────
function ProgressBar({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs">
        <span style={{ color: "var(--color-text-secondary)" }}>{label}</span>
        <span
          className="font-semibold"
          style={{ color: "var(--color-text-primary)" }}
        >
          {value}%
        </span>
      </div>
      <div
        className="h-1.5 rounded-full overflow-hidden"
        style={{ background: "var(--color-bg-secondary)" }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="h-full rounded-full"
          style={{ background: color }}
        />
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuthStore();
  const rawName = user?.email ? user.email.split("@")[0] : "User";
  const displayName = rawName.charAt(0).toUpperCase() + rawName.slice(1);
  const { data: stats, isLoading, isError } = useDashboardStats();

  const colors = [
    "var(--color-primary)",
    "var(--color-accent-foreground)",
    "var(--color-success)",
    "var(--color-warning)",
  ];

  return (
    <PageContent>
      <div className="mesh-bg min-h-full p-6 space-y-6">
        {/* ── Hero bento ── */}
        <motion.div
          id="tour-dashboard-welcome"
          {...fadeUp(0)}
          className="bento-hero p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
        >
          <div
            className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl pointer-events-none opacity-30"
            style={{ background: "var(--gradient-brand)" }}
          />

          <div className="relative z-10">
            <p
              className="text-xs font-semibold uppercase tracking-widest mb-2"
              style={{ color: "var(--color-primary)" }}
            >
              Welcome back
            </p>
            <h1
              className="text-3xl font-bold tracking-tight"
              style={{ color: "var(--color-text-primary)" }}
            >
              Good morning,{" "}
              <span style={{ color: "var(--color-primary)" }}>
                {displayName}
              </span>{" "}
              👋
            </h1>
            <p
              className="mt-1 text-sm"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Here's what's happening with your workspace today.
            </p>
          </div>
        </motion.div>

        {/* ── Stat cards ── */}
        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2
              className="w-8 h-8 animate-spin"
              style={{ color: "var(--color-primary)" }}
            />
          </div>
        ) : isError || !stats ? (
          <div
            className="p-4 rounded-xl"
            style={{ background: "var(--color-danger)", color: "#fff" }}
          >
            Failed to load dashboard statistics.
          </div>
        ) : (
          <>
            <div
              id="tour-dashboard-stats"
              className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4"
            >
              <motion.div {...fadeUp(0.08)}>
                <StatCard
                  icon={MessageSquare}
                  label="Total Queries"
                  value={stats.totalQueries.toLocaleString()}
                  colorVar="var(--color-primary)"
                  glowColor="rgba(99,102,241,0.12)"
                />
              </motion.div>
              <motion.div {...fadeUp(0.14)}>
                <StatCard
                  icon={Users}
                  label="Active Users"
                  value={stats.activeUsers.toLocaleString()}
                  colorVar="#ec4899"
                  glowColor="rgba(236,72,153,0.10)"
                />
              </motion.div>
              <motion.div {...fadeUp(0.2)}>
                <StatCard
                  icon={Zap}
                  label="Avg Queries / User"
                  value={stats.avgQueriesPerUser}
                  colorVar="var(--color-success)"
                  glowColor="rgba(16,185,129,0.10)"
                />
              </motion.div>
              <motion.div {...fadeUp(0.26)}>
                <StatCard
                  icon={Activity}
                  label="Top Assistant"
                  value={stats.mostActiveAssistant}
                  colorVar="var(--color-warning)"
                  glowColor="rgba(245,158,11,0.10)"
                  valueClassName="text-xl font-bold tracking-tight"
                />
              </motion.div>
            </div>

            {/* ── 4-col bento ── */}
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
              {/* Model usage breakdown */}
              <motion.div
                id="tour-dashboard-model-usage"
                {...fadeUp(0.32)}
                className="glass-card p-5 space-y-4 xl:col-span-1"
              >
                <div>
                  <p
                    className="text-[11px] font-semibold uppercase tracking-widest"
                    style={{ color: "var(--color-text-tertiary)" }}
                  >
                    Model Usage
                  </p>
                  <h3
                    className="text-base font-bold mt-0.5"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    Breakdown
                  </h3>
                </div>
                <div className="space-y-4">
                  {stats.modelUsage.length === 0 ? (
                    <p
                      className="text-sm"
                      style={{ color: "var(--color-text-secondary)" }}
                    >
                      No data available yet.
                    </p>
                  ) : (
                    stats.modelUsage.map((model, i) => (
                      <ProgressBar
                        key={model.name}
                        label={model.name}
                        value={Math.round(
                          (model.usage / Math.max(1, stats.totalQueries)) * 100,
                        )}
                        color={colors[i % colors.length]}
                      />
                    ))
                  )}
                </div>
              </motion.div>

              {/* Recent Queries Feed */}
              <motion.div
                id="tour-dashboard-recent-queries"
                {...fadeUp(0.38)}
                className="glass-card p-5 space-y-4 xl:col-span-2"
              >
                <div>
                  <p
                    className="text-[11px] font-semibold uppercase tracking-widest"
                    style={{ color: "var(--color-text-tertiary)" }}
                  >
                    Live Feed
                  </p>
                  <h3
                    className="text-base font-bold mt-0.5"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    Recent Queries
                  </h3>
                </div>
                <div className="space-y-3">
                  {stats.recentQueries.length === 0 ? (
                    <p
                      className="text-sm"
                      style={{ color: "var(--color-text-secondary)" }}
                    >
                      No recent activity found.
                    </p>
                  ) : (
                    stats.recentQueries.map((query) => (
                      <div
                        key={query.id}
                        className="p-3 rounded-lg flex gap-3 transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                      >
                        <div className="mt-1 shrink-0">
                          <MessageSquare
                            className="w-4 h-4"
                            style={{ color: "var(--color-primary)" }}
                          />
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <p
                            className="text-sm truncate"
                            style={{ color: "var(--color-text-primary)" }}
                          >
                            "{query.content}"
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span
                              className="text-xs font-medium"
                              style={{ color: "var(--color-text-secondary)" }}
                            >
                              {query.user_email}
                            </span>
                            <span
                              className="text-[10px] uppercase opacity-50"
                              style={{ color: "var(--color-text-tertiary)" }}
                            >
                              • {dayjs(query.created_at).fromNow()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>

              {/* Common Questions */}
              <motion.div
                id="tour-dashboard-insights"
                {...fadeUp(0.44)}
                className="glass-card p-5 space-y-4 xl:col-span-1"
              >
                <div>
                  <p
                    className="text-[11px] font-semibold uppercase tracking-widest"
                    style={{ color: "var(--color-text-tertiary)" }}
                  >
                    Insights
                  </p>
                  <h3
                    className="text-base font-bold mt-0.5"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    Common Questions
                  </h3>
                </div>
                <div className="space-y-3">
                  {!stats.commonQuestions ||
                  stats.commonQuestions.length === 0 ? (
                    <p
                      className="text-sm"
                      style={{ color: "var(--color-text-secondary)" }}
                    >
                      No common questions found.
                    </p>
                  ) : (
                    stats.commonQuestions.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-lg flex items-center justify-between transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div
                            className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                            style={{
                              background: "rgba(99,102,241,0.1)",
                              color: "var(--color-primary)",
                            }}
                          >
                            <span className="text-xs font-semibold">
                              {idx + 1}
                            </span>
                          </div>
                          <p
                            className="text-sm truncate"
                            style={{ color: "var(--color-text-primary)" }}
                          >
                            "{item.question}"
                          </p>
                        </div>
                        <span
                          className="text-xs font-medium ml-2"
                          style={{ color: "var(--color-text-secondary)" }}
                        >
                          {item.count}x
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            </div>
          </>
        )}
      </div>
    </PageContent>
  );
}
