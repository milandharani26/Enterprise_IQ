"use client";

import { ResetPasswordForm } from "../../_components/ResetPasswordForm";
import { VantaPanel } from "../../_components/Vantapanel";
import { ShieldCheck, LockKeyhole, History } from "lucide-react";

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* ── Main split ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* ─── LEFT: Content panel (Shade of white/gray in light mode, dark bg in dark mode) ─── */}
        <div className="hidden lg:flex flex-col justify-center w-[52%] px-16 py-16 relative overflow-hidden bg-slate-50/70 dark:bg-background border-r border-border/30">
          {/* Vanta NET animation fills the background */}
          <VantaPanel />

          {/* Dynamic gradient overlay matching dark/light mode transparent backgrounds */}
          <div
            className="absolute inset-0 pointer-events-none transition-colors duration-300"
            style={{
              background:
                "linear-gradient(135deg, var(--background) 0%, rgba(var(--color-background), 0.2) 50%, var(--background) 100%)",
            }}
          />

          {/* Right edge line */}
          <div
            className="absolute top-0 right-0 bottom-0 w-px z-10"
            style={{
              background:
                "linear-gradient(to bottom, transparent, var(--border) 30%, var(--border) 70%, transparent)",
            }}
          />

          <div className="relative z-10 max-w-[480px]">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 mb-8 px-3 py-1.5 rounded-full bg-[var(--brand-10)] border border-[var(--brand-20)]">
              <div className="w-1.5 h-1.5 rounded-full animate-pulse bg-[var(--brand)]" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--brand-light)]">
                Secure Account Update
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-[44px] font-bold leading-[1.1] tracking-tight mb-5 text-foreground">
              Secure your
              <br />
              <span className="text-slate-500 dark:text-muted-foreground">
                account today.
              </span>
            </h1>

            <p className="text-[15px] leading-relaxed mb-12 text-slate-600 dark:text-muted-foreground/80">
              Create a strong new password to protect your workspace. We enforce
              strong password policies to keep your enterprise data safe.
            </p>

            {/* Feature cards */}
            <div className="space-y-3">
              {[
                {
                  icon: LockKeyhole,
                  title: "Strong cryptography",
                  desc: "Your new password is encrypted before it even leaves your device.",
                },
                {
                  icon: History,
                  title: "Session management",
                  desc: "Updating your password will invalidate old sessions for maximum security.",
                },
                {
                  icon: ShieldCheck,
                  title: "Zero-trust architecture",
                  desc: "We verify every request to ensure your account remains protected.",
                },
              ].map((f, i) => (
                <div
                  key={i}
                  className="flex items-start gap-4 p-4 rounded-xl transition-colors duration-200 bg-background/60 dark:bg-muted/50 border border-border/80 dark:border-border/50 shadow-sm dark:shadow-none"
                >
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 bg-[var(--brand-10)] border border-[var(--brand-20)]">
                    <f.icon
                      className="w-4 h-4 text-[var(--brand-light)]"
                      aria-hidden="true"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-semibold mb-0.5 text-foreground">
                      {f.title}
                    </p>
                    <p className="text-xs leading-relaxed text-slate-500 dark:text-muted-foreground">
                      {f.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
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
            <ResetPasswordForm />
          </div>
        </div>
      </div>
    </div>
  );
}
