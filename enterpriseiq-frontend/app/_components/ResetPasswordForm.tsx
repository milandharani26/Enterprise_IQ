"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSearchParams } from "next/navigation";
import { useResetPasswordMutation } from "@/hooks/mutations/useAuthMutation";
import { useState, useEffect, Suspense } from "react";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Eye, EyeOff, ArrowRight } from "lucide-react";

function ResetPasswordFormContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const { mutate, isPending } = useResetPasswordMutation();
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!token) {
      toast.error("Invalid or missing reset token.");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPasswordError(null);

    if (!token) {
      toast.error("Invalid or missing reset token.");
      return;
    }

    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;
    let hasError = false;

    if (!password) {
      setPasswordError("Password is required.");
      hasError = true;
    } else {
      const hasCapital = /[A-Z]/.test(password);
      const hasNumber = /\d/.test(password);
      const hasSymbol = /[!@#$%^&*()_+\-=\[\]{};':",./<>?]/.test(password);
      const isValidLength = password.length >= 8 && password.length <= 12;
      if (!isValidLength || !hasCapital || !hasNumber || !hasSymbol) {
        setPasswordError("Must be 8–12 chars with a capital, number & symbol.");
        hasError = true;
      }
    }

    if (hasError) {
      return;
    }

    mutate({ token, newPassword: password });
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
            Set new password
          </h2>
          <p className="text-sm mt-1 text-muted-foreground">
            Please enter your new password below.
          </p>
        </motion.div>

        {/* Form fields */}
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {/* Password */}
          <motion.div variants={item} className="space-y-1.5">
            <Label
              htmlFor="password"
              className="text-xs font-medium text-muted-foreground/80"
            >
              New Password
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

          {/* Submit button */}
          <motion.div variants={item} className="pt-2">
            <button
              type="submit"
              disabled={isPending || !token}
              className="group w-full h-10 rounded-lg text-sm font-semibold active:scale-[0.99] transition-all duration-150 disabled:opacity-50 flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary-hover"
            >
              {isPending ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  Update password
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform duration-150" />
                </>
              )}
            </button>
          </motion.div>
        </form>
      </div>
    </motion.div>
  );
}

export function ResetPasswordForm() {
  return (
    <Suspense
      fallback={
        <div className="h-40 w-full flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      }
    >
      <ResetPasswordFormContent />
    </Suspense>
  );
}
