"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import type { Step } from "react-joyride";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import dynamic from "next/dynamic";

const Joyride = dynamic<any>(
  () => import("react-joyride").then((mod) => mod.Joyride),
  { ssr: false },
);

const LS_KEY = "enterpriseiq_tour_completed";

// ─── Per-page step groups ────────────────────────────────────────────────────

interface PageTour {
  route: string;
  adminOnly?: boolean;
  steps: Step[];
}

const TOUR_PAGES: PageTour[] = [
  {
    route: "/dashboard",
    steps: [
      {
        target: "body",
        placement: "center" as const,
        title: "Welcome to EnterpriseIQ! ✨",
        content:
          "Let's take a quick interactive tour to show you around your new enterprise AI workspace. Click 'Next' to begin!",
      },
      {
        target: "#tour-sidebar",
        placement: "right" as const,
        title: "Sidebar Navigation",
        content:
          "This is your sidebar navigation drawer — the central hub for chats, features, and management utilities.",
      },
      {
        target: "#tour-logo",
        placement: "right" as const,
        title: "Platform Identity",
        content:
          "Click the logo to return to the main dashboard from any page.",
      },
      {
        target: "#tour-sidebar-toggle",
        placement: "right" as const,
        title: "Collapse Sidebar",
        content:
          "Need more screen space? Collapse or expand the sidebar using this toggle.",
      },
      {
        target: "#tour-dashboard-welcome",
        placement: "bottom" as const,
        title: "Analytics Hub",
        content:
          "Your personalized welcome deck with workspace activity information and quick-access actions.",
      },
      {
        target: "#tour-dashboard-stats",
        placement: "bottom" as const,
        title: "Workspace Statistics",
        content:
          "Track key performance indicators — total AI queries, active users, and system load at a glance.",
      },
      {
        target: "#tour-dashboard-model-usage",
        placement: "left" as const,
        title: "Model Usage Analytics",
        content:
          "See which AI models (GPT-4, Claude, local LLMs) are being queried the most in your workspace.",
      },
      {
        target: "#tour-dashboard-recent-queries",
        placement: "top" as const,
        title: "Recent Live Queries",
        content:
          "A live scrollable feed of the latest prompt interactions processed by the platform.",
      },
      {
        target: "#tour-dashboard-insights",
        placement: "top" as const,
        title: "Common Insights",
        content:
          "Explore the most frequently queried questions to see what your workspace is asking.",
      },
    ],
  },
  {
    route: "/chat",
    steps: [
      {
        target: "#tour-new-chat",
        placement: "right" as const,
        title: "Start a New Chat",
        content:
          "Click here to open a fresh AI chat session — query data, write code, or consult your knowledge base.",
      },
      {
        target: "#tour-chat-input",
        placement: "top" as const,
        title: "Interactive Chat Input",
        content:
          "Type your query here. Press Enter to submit, or Shift+Enter for a new line.",
      },
      {
        target: "#tour-recent-chats",
        placement: "right" as const,
        title: "Recent Chat History",
        content:
          "Your recent conversations are saved here. Click any chat to resume, or hover to delete.",
      },
    ],
  },
  {
    route: "/users",
    adminOnly: true,
    steps: [
      {
        target: "#tour-management-links",
        placement: "right" as const,
        title: "Administration Pages",
        content:
          "As an Admin, access User Management and Role Management pages from the sidebar.",
      },
      {
        target: "#tour-users-title",
        placement: "bottom" as const,
        title: "User Management Dashboard",
        content:
          "Control panel to manage team members, view login activity, and control account access.",
      },
      {
        target: "#tour-users-add-button",
        placement: "bottom" as const,
        title: "Provision Team Members",
        content:
          "Click here to provision new workspace user accounts and assign them initial roles.",
      },
      {
        target: "#tour-users-table",
        placement: "top" as const,
        title: "Users Directory Table",
        content:
          "View all active user profiles, their assigned roles, and edit access control settings.",
      },
    ],
  },
  {
    route: "/roles",
    adminOnly: true,
    steps: [
      {
        target: "#tour-roles-title",
        placement: "bottom" as const,
        title: "Role Access Management",
        content:
          "Define permission tiers and allocate which AI assistants each role can access.",
      },
      {
        target: "#tour-roles-sync-button",
        placement: "bottom" as const,
        title: "Synchronize Assistants",
        content:
          "Sync assistants with your deployed AI models to keep access controls up to date.",
      },
      {
        target: "#tour-roles-container",
        placement: "top" as const,
        title: "Role Allocation Panel",
        content:
          "Select a role card on the left, toggle assistant access on the right, then click 'Save Changes'.",
      },
    ],
  },
  {
    route: "/dashboard",
    steps: [
      {
        target: "#tour-theme-toggle",
        placement: "right" as const,
        title: "Theme Toggle",
        content:
          "Switch between dark and light themes for your preferred working environment.",
      },
      {
        target: "#tour-profile",
        placement: "right" as const,
        title: "Your Account",
        content:
          "Click your avatar to view your email, sign out, or restart this tour anytime.",
      },
      {
        target: "body",
        placement: "center" as const,
        title: "Tour Complete! 🚀",
        content:
          "You're all set! Enjoy your enterprise AI workspace. Restart this tour anytime from your profile menu.",
      },
    ],
  },
];

// ─── Glassmorphic Tooltip ────────────────────────────────────────────────────
function CustomTooltip({
  index,
  step,
  backProps,
  closeProps,
  primaryProps,
  skipProps,
  tooltipProps,
  isLastStep,
}: any) {
  return (
    <div
      {...tooltipProps}
      className="glass-panel max-w-[360px] p-6 rounded-2xl border shadow-2xl relative select-none animate-page-enter"
      style={{
        background: "var(--color-bg-elevated)",
        borderColor: "var(--color-border-primary)",
        backdropFilter: "blur(32px) saturate(200%)",
        WebkitBackdropFilter: "blur(32px) saturate(200%)",
      }}
    >
      <button
        {...closeProps}
        className="absolute top-4 right-4 text-secondary-text hover:text-primary-text transition-colors p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 outline-none cursor-pointer"
        title="Close Tour"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      {step.title && (
        <h4
          className="text-sm font-bold tracking-tight mb-2 pr-6"
          style={{ color: "var(--color-text-primary)" }}
        >
          {step.title}
        </h4>
      )}

      <div
        className="text-xs leading-relaxed mb-6"
        style={{ color: "var(--color-text-secondary)" }}
      >
        {step.content}
      </div>

      <div className="flex items-center justify-between">
        {!isLastStep ? (
          <button
            {...skipProps}
            className="text-[11px] font-semibold transition-colors outline-none cursor-pointer"
            style={{ color: "var(--color-text-tertiary)" }}
          >
            Skip Tour
          </button>
        ) : (
          <div />
        )}

        <div className="flex items-center gap-2">
          {index > 0 && (
            <button
              {...backProps}
              className="text-[11px] font-semibold px-3 py-1.5 rounded-lg transition-all outline-none cursor-pointer"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Back
            </button>
          )}
          <button
            {...primaryProps}
            className="text-[11px] font-semibold px-3.5 py-1.5 rounded-lg transition-all outline-none cursor-pointer"
            style={{
              background: "var(--gradient-brand)",
              color: "var(--color-primary-foreground)",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            {isLastStep ? "Continue →" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function waitForElement(selector: string, timeoutMs = 6000): Promise<boolean> {
  if (selector === "body") return Promise.resolve(true);
  return new Promise((resolve) => {
    if (document.querySelector(selector)) {
      resolve(true);
      return;
    }
    let elapsed = 0;
    const iv = setInterval(() => {
      elapsed += 100;
      if (document.querySelector(selector)) {
        clearInterval(iv);
        resolve(true);
      } else if (elapsed >= timeoutMs) {
        clearInterval(iv);
        resolve(false);
      }
    }, 100);
  });
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function WebsiteTour() {
  const [mounted, setMounted] = useState(false);
  const [run, setRun] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuthStore();

  const isAdmin = user?.role?.role_code?.toLowerCase() === "admin";

  // Use refs to avoid stale closures in callbacks
  const pageIndexRef = useRef(pageIndex);
  const pathnameRef = useRef(pathname);
  const transitioning = useRef(false);

  // Keep refs in sync
  useEffect(() => {
    pageIndexRef.current = pageIndex;
  }, [pageIndex]);
  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  // Filter page groups based on role
  const tourPages = useMemo(() => {
    return TOUR_PAGES.filter((p) => !p.adminOnly || isAdmin);
  }, [isAdmin]);
  const tourPagesRef = useRef(tourPages);
  useEffect(() => {
    tourPagesRef.current = tourPages;
  }, [tourPages]);

  // Current page's steps
  const currentSteps = tourPages[pageIndex]?.steps ?? [];

  useEffect(() => {
    setMounted(true);
  }, []);

  // ── Navigate to a page and start its tour segment ──────────────────────────
  const goToPage = async (idx: number) => {
    const pages = tourPagesRef.current;
    console.log(`[Tour] goToPage(${idx}), total pages: ${pages.length}`);

    if (idx >= pages.length) {
      console.log("[Tour] All pages done. Marking tour complete.");
      setRun(false);
      localStorage.setItem(LS_KEY, "true");
      return;
    }

    transitioning.current = true;
    setRun(false);

    const page = pages[idx];
    console.log(
      `[Tour] Target route: ${page.route}, current: ${pathnameRef.current}`,
    );

    // Navigate if needed
    if (pathnameRef.current !== page.route) {
      console.log(`[Tour] Navigating to ${page.route}...`);
      router.push(page.route);
    }

    // Wait for the first step's target
    const firstTarget = page.steps[0]?.target;
    const selector = typeof firstTarget === "string" ? firstTarget : "body";
    console.log(`[Tour] Waiting for element: ${selector}`);
    const found = await waitForElement(selector, 6000);
    console.log(`[Tour] Element ${selector} found: ${found}`);

    // Extra buffer for page render/animations
    await new Promise((r) => setTimeout(r, 600));

    transitioning.current = false;

    // Update page index (this changes the Joyride key, causing remount)
    setPageIndex(idx);

    // Start the tour in the next tick to ensure Joyride has remounted
    setTimeout(() => {
      console.log(`[Tour] Starting page ${idx} tour`);
      setRun(true);
    }, 100);
  };

  // ── Start tour on first visit ──────────────────────────────────────────────
  useEffect(() => {
    if (!mounted) return;
    const completed = localStorage.getItem(LS_KEY);
    if (completed === "true") {
      console.log("[Tour] Already completed. Skipping.");
      return;
    }
    console.log("[Tour] First visit detected. Starting tour...");
    const timer = setTimeout(() => goToPage(0), 1500);
    return () => clearTimeout(timer);
  }, [mounted]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Restart tour event ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!mounted) return;
    const handleRestart = () => {
      console.log("[Tour] Restart event received.");
      localStorage.removeItem(LS_KEY);
      goToPage(0);
    };
    window.addEventListener("restart-tour", handleRestart);
    return () => window.removeEventListener("restart-tour", handleRestart);
  }, [mounted]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Joyride callback ──────────────────────────────────────────────────────
  const handleCallback = (data: any) => {
    const { status, action, type, index } = data;
    console.log("[Tour] callback:", {
      status,
      action,
      type,
      index,
      transitioning: transitioning.current,
      pageIndex: pageIndexRef.current,
    });

    // Ignore everything during page transitions
    if (transitioning.current) return;

    // Check status FIRST (most reliable signal)
    if (status === "finished") {
      console.log("[Tour] Page segment finished. Moving to next page...");
      const nextIdx = pageIndexRef.current + 1;
      goToPage(nextIdx);
      return;
    }

    if (status === "skipped") {
      console.log("[Tour] Tour skipped by user.");
      setRun(false);
      localStorage.setItem(LS_KEY, "true");
      return;
    }

    // User explicitly closed the tour
    if (action === "close" && type === "step:after") {
      console.log("[Tour] User closed tour.");
      setRun(false);
      localStorage.setItem(LS_KEY, "true");
      return;
    }
  };

  if (!mounted) return null;

  console.log("[Tour] Render:", {
    pageIndex,
    run,
    stepsCount: currentSteps.length,
  });

  return (
    <Joyride
      key={`tour-page-${pageIndex}`}
      steps={currentSteps}
      run={run}
      continuous
      showSkipButton
      spotlightClicks
      tooltipComponent={CustomTooltip}
      onEvent={handleCallback}
      disableOverlayClose
      styles={{
        options: {
          arrowColor: "transparent",
          backgroundColor: "transparent",
          zIndex: 99999,
        },
      }}
    />
  );
}
