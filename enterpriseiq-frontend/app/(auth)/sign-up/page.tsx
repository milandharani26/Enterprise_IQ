"use client";

import { SignUpForm } from "../../_components/SignUpForm";
import { VantaPanel } from "../../_components/Vantapanel";
import { Zap, LayoutGrid, ShieldCheck } from "lucide-react";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* ── Main split ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* ─── LEFT: Content panel (Shade of white/gray in light mode, dark bg in dark mode) ─── */}
        {/* ─── LEFT: Content panel ─── */}
        <div className="hidden lg:flex flex-col justify-center w-[52%] px-14 py-16 relative overflow-hidden bg-slate-50/70 dark:bg-background border-r border-border/30">
          <VantaPanel />

          <div
            className="absolute inset-0 pointer-events-none transition-colors duration-300"
            style={{
              background:
                "linear-gradient(135deg, var(--background) 0%, rgba(var(--color-background), 0.2) 50%, var(--background) 100%)",
            }}
          />

          <div
            className="absolute top-0 right-0 bottom-0 w-px z-10"
            style={{
              background:
                "linear-gradient(to bottom, transparent, var(--border) 30%, var(--border) 70%, transparent)",
            }}
          />

          <div className="relative z-10 max-w-[540px]">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 mb-9 px-3 py-[5px] rounded-full bg-[var(--brand-10)] border border-[var(--brand-20)] animate-[fadeUp_0.55s_ease_0.1s_both]">
              <div className="w-1.5 h-1.5 rounded-full animate-pulse bg-[var(--brand)]" />
              <span className="text-[11px] font-medium uppercase tracking-[0.1em] text-[var(--brand-light)]">
                Now in beta · Free for teams
              </span>
            </div>

            {/* Headline */}
            <div className="mb-5 animate-[fadeUp_0.55s_ease_0.25s_both]">
              <h1 className="text-[80px] font-medium leading-[1.12] tracking-tight text-foreground">
                Enterprise data
              </h1>
              <h1 className="text-[50px] font-medium leading-[1.12] tracking-tight text-muted-foreground">
                managed simply.
              </h1>
            </div>

            {/* Accent rule */}
            <div className="w-8 h-[1.5px] rounded-full mb-5 bg-[var(--brand)]/40 animate-[fadeUp_0.55s_ease_0.25s_both]" />

            {/* Body */}
            <p className="text-[14.5px] leading-[1.75] text-muted-foreground/80 max-w-[360px] animate-[fadeUp_0.55s_ease_0.4s_both]">
              State management, clean layouts, and real-time server
              orchestration — all in one platform built for modern engineering
              teams.
            </p>
          </div>
        </div>

        {/* ─── RIGHT: Form panel ─── */}
        <div className="flex-1 flex flex-col items-center justify-center px-8 py-16 relative bg-background">
          {/* Very subtle dot grid reacting dynamically to borders */}
          <div
            className="absolute inset-0 pointer-events-none opacity-60 dark:opacity-100"
            style={{
              backgroundImage: `radial-gradient(circle, var(--border) 1px, transparent 1px)`,
              backgroundSize: "32px 32px",
            }}
          />

          {/* Faint brand glow behind form */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] pointer-events-none"
            style={{
              background:
                "radial-gradient(circle, var(--brand-4) 0%, transparent 65%)",
            }}
          />

          <div className="relative z-10 w-full max-w-[400px]">
            <SignUpForm />
          </div>
        </div>
      </div>
    </div>
  );
}
