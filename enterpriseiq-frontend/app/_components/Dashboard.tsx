"use client";

import { motion } from "framer-motion";
import {
  Users,
  MessageSquare,
  Zap,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Activity,
} from "lucide-react";

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
  positive,
  colorVar,
  glowColor,
}: {
  icon: any;
  label: string;
  value: string;
  delta: string;
  positive: boolean;
  colorVar: string;
  glowColor: string;
}) {
  return (
    <div className="glass-card glass-card-hover p-5 relative overflow-hidden">
      {/* Corner wash */}
      <div
        className="absolute top-0 right-0 w-32 h-32 pointer-events-none"
        style={{
          background: `radial-gradient(circle at top right, ${glowColor} 0%, transparent 65%)`,
        }}
      />

      <div className="relative z-10 flex items-start justify-between">
        <div>
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-2"
            style={{ color: "var(--color-text-tertiary)" }}
          >
            {label}
          </p>
          <p
            className="text-3xl font-bold tracking-tight"
            style={{ color: colorVar }}
          >
            {value}
          </p>
          <div className="flex items-center gap-1 mt-2">
            {positive ? (
              <TrendingUp
                className="w-3.5 h-3.5"
                style={{ color: "var(--color-success)" }}
              />
            ) : (
              <TrendingDown
                className="w-3.5 h-3.5"
                style={{ color: "var(--color-danger)" }}
              />
            )}
            <span
              className="text-xs font-medium"
              style={{
                color: positive
                  ? "var(--color-success)"
                  : "var(--color-danger)",
              }}
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
        </div>
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{
            background: `${glowColor}`,
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

// ── Page ──────────────────────────────────────────────────────────────────────
export default function Dashboard() {
  return (
    <div className="mesh-bg min-h-full p-6 space-y-6">
      {/* ── Hero bento ── */}
      <motion.div
        {...fadeUp(0)}
        className="bento-hero p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
      >
        {/* Blur orb */}
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
            Good morning, <span className="gradient-text">Priyank</span> 👋
          </h1>
          <p
            className="mt-1 text-sm"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Here's what's happening with your workspace today.
          </p>
        </div>

        <div className="relative z-10 flex gap-3">
          <button className="btn-gradient px-5 py-2.5 text-sm rounded-xl flex items-center gap-2">
            <Zap className="w-4 h-4" /> New Session
          </button>
          <button
            className="glass-card px-5 py-2.5 text-sm font-semibold flex items-center gap-2"
            style={{
              color: "var(--color-text-secondary)",
              borderRadius: "var(--radius-md)",
            }}
          >
            <Activity className="w-4 h-4" /> View Logs
          </button>
        </div>
      </motion.div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          {
            icon: MessageSquare,
            label: "Total Queries",
            value: "24,891",
            delta: "+18%",
            positive: true,
            colorVar: "var(--color-primary)",
            glowColor: "rgba(99,102,241,0.12)",
          },
          {
            icon: Users,
            label: "Active Users",
            value: "1,284",
            delta: "+7%",
            positive: true,
            colorVar: "var(--color-accent)",
            glowColor: "rgba(236,72,153,0.10)",
          },
          {
            icon: Zap,
            label: "Avg Latency",
            value: "48ms",
            delta: "-12%",
            positive: true,
            colorVar: "var(--color-success)",
            glowColor: "rgba(16,185,129,0.10)",
          },
          {
            icon: AlertTriangle,
            label: "Error Rate",
            value: "0.4%",
            delta: "+0.1%",
            positive: false,
            colorVar: "var(--color-warning)",
            glowColor: "rgba(245,158,11,0.10)",
          },
        ].map((s, i) => (
          <motion.div key={s.label} {...fadeUp(0.08 + i * 0.06)}>
            <StatCard {...s} />
          </motion.div>
        ))}
      </div>

      {/* ── 3-col bento ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Model usage breakdown */}
        <motion.div {...fadeUp(0.25)} className="glass-card p-5 space-y-4">
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
            <ProgressBar
              label="GPT-4o"
              value={52}
              color="var(--color-primary)"
            />
            <ProgressBar
              label="Claude 3.5"
              value={31}
              color="var(--color-accent)"
            />
            <ProgressBar
              label="Gemini Pro"
              value={11}
              color="var(--color-accent-secondary)"
            />
            <ProgressBar
              label="Llama 3"
              value={6}
              color="var(--color-warning)"
            />
          </div>

          <div
            className="pt-3 border-t"
            style={{ borderColor: "var(--color-border-primary)" }}
          >
            <div className="flex items-center justify-between">
              <p
                className="text-xs"
                style={{ color: "var(--color-text-tertiary)" }}
              >
                Total tokens this month
              </p>
              <p className="text-sm font-bold gradient-text">12.4M</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
