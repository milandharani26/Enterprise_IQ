"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLoginMutation } from "@/hooks/mutations/useAuthMutation";
import { authService } from "@/services/authService";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";

const GoogleIcon = () => (
  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

const MicrosoftIcon = () => (
  <svg className="w-4 h-4 shrink-0" viewBox="0 0 21 21">
    <rect x="1" y="1" width="9" height="9" fill="#F25022" />
    <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
    <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
    <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
  </svg>
);

export function LoginForm() {
  const router = useRouter();
  const { mutate, isPending, isError, error } = useLoginMutation();

  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setEmailError(null);
    setPasswordError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    let hasError = false;

    if (!email) {
      setEmailError("Email is required.");
      hasError = true;
    } else {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(email)) {
        setEmailError("Please enter a valid email address.");
        hasError = true;
      }
    }

    if (!password) {
      setPasswordError("Password is required.");
      hasError = true;
    }

    if (hasError) {
      toast.error("Please fix the errors below.");
      return;
    }
    mutate({ email, password });
  };

  const wrap = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.06, delayChildren: 0.05 },
    },
  };
  const item = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const },
    },
  };

  if (!mounted) return null;

  return (
    <motion.div
      variants={wrap}
      initial="hidden"
      animate="visible"
      className="w-full"
    >
      {/* Card */}
      <div className="relative rounded-2xl p-8 overflow-hidden bg-card/40 border border-border">
        {/* Top-right emerald gradient orb */}
        <div
          className="absolute -top-16 -right-16 w-48 h-48 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, var(--brand-12) 0%, var(--brand-4) 45%, transparent 70%)",
          }}
        />
        {/* Subtle top border glow */}
        <div
          className="absolute top-0 left-8 right-8 h-px pointer-events-none"
          style={{
            background:
              "linear-gradient(90deg, transparent, var(--brand-35), transparent)",
          }}
        />

        {/* Header */}
        <motion.div variants={item} className="mb-7">
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Welcome back
          </h2>
          <p className="text-sm mt-1 text-muted-foreground">
            Sign in to continue to{" "}
            <span className="text-foreground font-semibold">EnterpriseIQ</span>
          </p>
        </motion.div>

        {/* Form fields */}
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {/* Email */}
          <motion.div variants={item} className="space-y-1.5">
            <Label
              htmlFor="email"
              className="text-xs font-medium text-muted-foreground/80"
            >
              Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/50" />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@company.com"
                className={`pl-9 h-10 rounded-lg text-sm placeholder:text-muted-foreground/40 bg-muted/40 border-border text-foreground
                  focus-visible:ring-1 focus-visible:ring-[var(--brand-30)] focus-visible:border-[var(--brand-40)]
                  transition-all duration-150
                  ${emailError ? "border-red-400/50 focus-visible:ring-red-400/20" : ""}`}
              />
            </div>
            <AnimatePresence>
              {emailError && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-[11px] text-red-500 dark:text-red-400"
                >
                  {emailError}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Password */}
          <motion.div variants={item} className="space-y-1.5">
            <Label
              htmlFor="password"
              className="text-xs font-medium text-muted-foreground/80"
            >
              Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/50" />
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className={`pl-9 pr-9 h-10 rounded-lg text-sm placeholder:text-muted-foreground/40 bg-muted/40 border-border text-foreground
                  focus-visible:ring-1 focus-visible:ring-[var(--brand-30)] focus-visible:border-[var(--brand-40)]
                  transition-all duration-150
                  ${passwordError ? "border-red-400/50 focus-visible:ring-red-400/20" : ""}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-muted-foreground transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-3.5 h-3.5" />
                ) : (
                  <Eye className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
            <AnimatePresence>
              {passwordError && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-[11px] text-red-500 dark:text-red-400"
                >
                  {passwordError}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Forgot password */}
          <motion.div variants={item} className="flex justify-end">
            <Link
              href="/forgot-password"
              className="text-xs transition-colors underline underline-offset-2 text-muted-foreground hover:text-foreground"
            >
              Forgot password?
            </Link>
          </motion.div>

          {/* Log in button */}
          <motion.div variants={item}>
            <button
              type="submit"
              disabled={isPending}
              className="group w-full h-10 rounded-lg text-sm font-semibold active:scale-[0.99] transition-all duration-150 disabled:opacity-50 flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary-hover"
            >
              {isPending ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Log in
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform duration-150" />
                </>
              )}
            </button>
          </motion.div>

          {/* Divider */}
          <motion.div variants={item} className="flex items-center gap-3">
            <div className="h-px flex-1 bg-border/70" />
            <span className="text-[10px] uppercase tracking-widest font-medium text-muted-foreground/60">
              or continue with
            </span>
            <div className="h-px flex-1 bg-border/70" />
          </motion.div>

          {/* SSO buttons */}
          <motion.div variants={item} className="grid grid-cols-2 gap-3">
            <button
              type="button"
              id="google-login-btn"
              disabled={isPending}
              onClick={() => authService.googleLogin()}
              className="h-10 flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-all duration-150 disabled:opacity-50 bg-muted/40 border border-border text-foreground hover:bg-muted/80"
            >
              <GoogleIcon />
              Google
            </button>
            <button
              type="button"
              disabled={isPending}
              className="h-10 flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-all duration-150 disabled:opacity-50 bg-muted/40 border border-border text-foreground hover:bg-muted/80"
            >
              <MicrosoftIcon />
              Microsoft
            </button>
          </motion.div>
        </form>
      </div>

      {/* Sign up */}
      <motion.p
        variants={item}
        className="text-center text-xs mt-5 text-muted-foreground"
      >
        Don&apos;t have an account?{" "}
        <button
          type="button"
          onClick={() => router.push("/sign-up")}
          className="font-semibold underline underline-offset-2 text-muted-foreground/80 hover:text-foreground transition-colors"
        >
          Create one free
        </button>
      </motion.p>
    </motion.div>
  );
}
