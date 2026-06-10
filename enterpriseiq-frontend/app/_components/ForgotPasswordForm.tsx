"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authService } from "@/services/authService";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, ArrowRight, ArrowLeft } from "lucide-react";

export function ForgotPasswordForm() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setEmailError(null);
    setSuccessMessage(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
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

    if (hasError) {
      return;
    }

    try {
      setIsPending(true);
      const res = await authService.forgotPassword(email);
      setSuccessMessage(res.message);
      toast.success(res.message);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to send reset email",
      );
    } finally {
      setIsPending(false);
    }
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
            Reset Password
          </h2>
          <p className="text-sm mt-1 text-muted-foreground">
            Enter your email and we'll send you a link to reset your password.
          </p>
        </motion.div>

        {/* Form fields */}
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
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

          {/* Success Message */}
          <AnimatePresence>
            {successMessage && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <p className="text-xs text-green-600 dark:text-green-400">
                    {successMessage}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit button */}
          <motion.div variants={item}>
            <button
              type="submit"
              disabled={isPending}
              className="group w-full h-10 rounded-lg text-sm font-semibold active:scale-[0.99] transition-all duration-150 disabled:opacity-50 flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary-hover"
            >
              {isPending ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  Send reset link
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform duration-150" />
                </>
              )}
            </button>
          </motion.div>

          <motion.div variants={item} className="flex justify-center mt-4">
            <Link
              href="/sign-in"
              className="text-xs font-medium flex items-center gap-1.5 transition-colors text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to log in
            </Link>
          </motion.div>
        </form>
      </div>
    </motion.div>
  );
}
