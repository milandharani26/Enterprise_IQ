"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";

// Dynamically import Spline to run exclusively on the client side
const Spline = dynamic(() => import("@splinetool/react-spline"), {
  ssr: false,
});
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Database,
  FileText,
  HardDrive,
  Cpu,
  Key,
  BarChart2,
  ShieldCheck,
  Zap,
  Menu,
  X,
  Sun,
  Moon,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Search,
  Sparkles,
  RefreshCw,
} from "lucide-react";

export default function Home() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isNavbarMobileOpen, setIsNavbarMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");
  const [splineLoaded, setSplineLoaded] = useState(false);
  const [splineError, setSplineError] = useState(false);
  const [activeFeature, setActiveFeature] = useState<"sql" | "rag" | "drive">(
    "sql",
  );
  const router = useRouter();
  const currentTheme = resolvedTheme || theme;

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset loader when theme is toggled to download the new 3D model
  useEffect(() => {
    if (mounted) {
      setSplineLoaded(false);
    }
  }, [currentTheme, mounted]);

  // Track scroll position to update active navbar link
  useEffect(() => {
    const handleScroll = () => {
      const sections = ["hero", "features", "overview"];
      const scrollPosition = window.scrollY + 200;

      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setIsNavbarMobileOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="relative min-h-screen bg-primary-bg text-primary-text transition-colors duration-300 overflow-x-hidden">
      {/* Background Mesh Gradient auroras matching 3D models */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-primary/12 blur-[120px] dark:bg-primary/6" />
        <div className="absolute bottom-[20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-accent-primary/10 blur-[100px] dark:bg-accent-primary/5" />
        <div className="absolute top-[40%] left-[30%] w-[40%] h-[40%] rounded-full bg-primary/8 blur-[110px] dark:bg-primary/4" />
      </div>

      {/* Glassmorphic Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-border-color bg-secondary-bg/70 backdrop-blur-xl backdrop-saturate-[180%] transition-all duration-300">
        <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between">
          {/* Logo */}
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => scrollToSection("hero")}
          >
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white shadow-[0_0_12px_rgba(0,122,255,0.4)] dark:shadow-[0_0_12px_rgba(10,132,255,0.4)]">
              <Sparkles size={18} />
            </div>
            <span className="font-sans font-extrabold text-lg tracking-tight bg-gradient-to-r from-primary-text to-secondary-text bg-clip-text text-transparent">
              EnterpriseIQ
            </span>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-6">
            <button
              onClick={() => scrollToSection("hero")}
              className={`text-[13px] font-semibold tracking-wide transition-colors cursor-pointer ${activeSection === "hero" ? "text-primary" : "text-secondary-text hover:text-primary-text"}`}
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection("features")}
              className={`text-[13px] font-semibold tracking-wide transition-colors cursor-pointer ${activeSection === "features" ? "text-primary" : "text-secondary-text hover:text-primary-text"}`}
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection("overview")}
              className={`text-[13px] font-semibold tracking-wide transition-colors cursor-pointer ${activeSection === "overview" ? "text-primary" : "text-secondary-text hover:text-primary-text"}`}
            >
              Overview
            </button>
          </div>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={() =>
                setTheme(currentTheme === "dark" ? "light" : "dark")
              }
              className="cursor-pointer text-secondary-text w-9 h-9 flex items-center justify-center rounded-full transition-all duration-150 hover:bg-card-bg hover:text-primary-text outline-none"
              aria-label="Toggle theme"
            >
              {mounted && currentTheme === "dark" ? (
                <Sun size={18} />
              ) : (
                <Moon size={18} />
              )}
            </button>
            <button
              onClick={() => router.push("/sign-in")}
              className="inline-flex items-center justify-center text-xs font-semibold rounded-full transition-all duration-300 outline-none cursor-pointer h-9 px-5 text-primary-foreground bg-primary hover:bg-primary-hover shadow-[0_0_10px_rgba(0,122,255,0.2)] dark:shadow-[0_0_10px_rgba(10,132,255,0.2)] hover:shadow-[0_0_15px_rgba(0,122,255,0.4)] dark:hover:shadow-[0_0_15px_rgba(10,132,255,0.4)] hover:-translate-y-0.5"
            >
              Start Free Trial
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden items-center gap-3">
            <button
              onClick={() =>
                setTheme(currentTheme === "dark" ? "light" : "dark")
              }
              className="cursor-pointer text-secondary-text w-8 h-8 flex items-center justify-center rounded-full hover:bg-card-bg hover:text-primary-text outline-none"
              aria-label="Toggle theme"
            >
              {mounted && currentTheme === "dark" ? (
                <Sun size={18} />
              ) : (
                <Moon size={18} />
              )}
            </button>
            <button
              onClick={() => setIsNavbarMobileOpen(!isNavbarMobileOpen)}
              className="p-1 rounded-lg hover:bg-card-bg text-secondary-text hover:text-primary-text transition-colors outline-none cursor-pointer"
            >
              {isNavbarMobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isNavbarMobileOpen && (
          <div className="absolute top-16 left-0 right-0 border-b border-border-color bg-primary-bg/95 backdrop-blur-2xl px-6 py-6 flex flex-col gap-4 shadow-lg animate-page-enter md:hidden">
            <button
              onClick={() => scrollToSection("hero")}
              className={`text-left text-sm font-semibold py-2 border-b border-border-color/30 ${activeSection === "hero" ? "text-primary" : "text-secondary-text"}`}
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection("features")}
              className={`text-left text-sm font-semibold py-2 border-b border-border-color/30 ${activeSection === "features" ? "text-primary" : "text-secondary-text"}`}
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection("overview")}
              className={`text-left text-sm font-semibold py-2 ${activeSection === "overview" ? "text-primary" : "text-secondary-text"}`}
            >
              Overview
            </button>
            <button
              onClick={() => router.push("/sign-in")}
              className="w-full mt-2 inline-flex items-center justify-center text-sm font-semibold rounded-xl transition-all duration-300 outline-none cursor-pointer h-11 text-primary-foreground bg-primary hover:bg-primary-hover"
            >
              Start Free Trial
            </button>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section
        id="hero"
        className="relative z-10 pt-28 md:pt-36 pb-20 md:pb-28 px-6 max-w-7xl mx-auto flex items-center min-h-[calc(100vh-64px)]"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center w-full">
          {/* Left Side: 3D Spline Canvas (Borderless, floating seamlessly) */}
          <div className="relative w-full h-[350px] sm:h-[450px] lg:h-[550px] rounded-2xl overflow-hidden group">
            {/* Skeleton Loader */}
            {!splineLoaded && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-card-bg/20 z-10 p-8 rounded-2xl">
                <div className="relative w-16 h-16 flex items-center justify-center mb-6">
                  <div className="absolute inset-0 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary animate-pulse">
                    <Sparkles size={16} />
                  </div>
                </div>
                <h4 className="text-sm font-semibold text-primary-text mb-1.5">
                  Loading 3D Visualizer
                </h4>
                <p className="text-xs text-muted-text text-center max-w-[240px]">
                  Configuring spline environment canvas vectors...
                </p>
              </div>
            )}

            {/* Spline Component or Fallback */}
            <div className="w-full h-full relative">
              {splineError ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-gradient-to-br from-card-bg/5 to-card-bg/15 rounded-2xl">
                  {/* Glowing 3D CSS Animation */}
                  <div
                    className="relative w-48 h-48 flex items-center justify-center mb-6"
                    style={{
                      perspective: "1000px",
                      transformStyle: "preserve-3d",
                    }}
                  >
                    {/* Ring 1 */}
                    <div
                      className="absolute w-40 h-40 rounded-full border border-dashed border-primary/45 animate-[spin_12s_linear_infinite]"
                      style={{ transform: "rotateX(60deg) rotateY(15deg)" }}
                    />
                    {/* Ring 2 */}
                    <div
                      className="absolute w-32 h-32 rounded-full border border-accent-primary/30 animate-[spin_8s_linear_infinite_reverse]"
                      style={{ transform: "rotateX(15deg) rotateY(60deg)" }}
                    />
                    {/* Core Sphere */}
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent-primary shadow-[0_0_30px_rgba(0,122,255,0.5)] dark:shadow-[0_0_30px_rgba(10,132,255,0.5)] animate-pulse flex items-center justify-center">
                      <Sparkles size={24} className="text-white" />
                    </div>
                  </div>
                  <h4 className="text-sm font-semibold text-primary-text mb-1">
                    Interactive Preview Mode
                  </h4>
                  <p className="text-xs text-muted-text text-center max-w-[280px]">
                    Spline 3D CDN offline or blocked. Showing lightweight CSS
                    rendering.
                  </p>
                </div>
              ) : (
                <Spline
                  key={currentTheme}
                  scene="https://prod.spline.design/UO412l4nTDTh8klc/scene.splinecode"
                  onLoad={() => setSplineLoaded(true)}
                  onError={() => {
                    setSplineError(true);
                    setSplineLoaded(true);
                  }}
                />
              )}
            </div>
          </div>

          {/* Right Side: Hero Content */}
          <div className="flex flex-col text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 dark:border-primary/30 backdrop-blur-md mb-6 w-max">
              <Zap size={12} className="animate-pulse text-primary" />
              <span>Enterprise search, simplified</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] text-primary-text mb-6">
              All your company's data.{" "}
              <span className="bg-gradient-to-r from-primary to-accent-primary bg-clip-text text-transparent">
                Accessible
              </span>{" "}
              in seconds.
            </h1>

            <p className="text-base sm:text-lg text-secondary-text mb-8 max-w-xl leading-relaxed">
              EnterpriseIQ securely connects your databases, local documents,
              and Google Drive folders. Ask questions in plain English and get
              instant answers without writing SQL or digging through folders.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => router.push("/sign-in")}
                className="group inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-300 outline-none cursor-pointer h-12 px-8 text-sm text-primary-foreground bg-primary hover:bg-primary-hover shadow-[0_0_20px_rgba(0,122,255,0.3)] dark:shadow-[0_0_20px_rgba(10,132,255,0.3)] hover:shadow-[0_0_25px_rgba(0,122,255,0.5)] dark:hover:shadow-[0_0_25px_rgba(10,132,255,0.5)] hover:-translate-y-0.5"
              >
                Start free trial
                <ArrowRight
                  size={16}
                  className="ml-2 transition-transform group-hover:translate-x-0.5"
                />
              </button>
              <Button
                variant="secondary"
                onClick={() => scrollToSection("features")}
                className="rounded-xl px-7 h-12"
              >
                See features
              </Button>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-6 pt-12 mt-12 border-t border-border-color">
              <div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-primary-text">
                  10x
                </h3>
                <p className="text-[11px] sm:text-xs text-muted-text uppercase font-semibold tracking-wider mt-1">
                  Faster search
                </p>
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-primary-text">
                  100%
                </h3>
                <p className="text-[11px] sm:text-xs text-muted-text uppercase font-semibold tracking-wider mt-1">
                  Secure & private
                </p>
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-primary-text">
                  Zero
                </h3>
                <p className="text-[11px] sm:text-xs text-muted-text uppercase font-semibold tracking-wider mt-1">
                  SQL required
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="relative z-10 py-20 md:py-28 px-6 border-t border-border-color bg-card-bg/10"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-primary-text mb-4">
              Connect your tools. Ask your questions.
            </h2>
            <p className="text-base sm:text-lg text-secondary-text">
              EnterpriseIQ securely hooks into your existing data hubs so your
              team can query everything from one unified workspace.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            {/* Left Column: Dynamic Visual Showcase Component */}
            <div className="lg:sticky lg:top-24 w-full h-[400px] sm:h-[450px] bg-card-bg/60 border border-border-color backdrop-blur-2xl rounded-2xl shadow-xl flex flex-col p-6 overflow-hidden transition-all duration-500">
              {/* Window Header */}
              <div className="flex items-center justify-between pb-4 border-b border-border-color/50 mb-4 select-none">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-accent-danger/70" />
                  <div className="w-2.5 h-2.5 rounded-full bg-accent-warning/70" />
                  <div className="w-2.5 h-2.5 rounded-full bg-accent-success/70" />
                </div>
                <div className="text-[10px] font-mono text-muted-text bg-card-bg border border-border-color px-2 py-0.5 rounded">
                  {activeFeature === "sql" && "sql_guard_engine.py"}
                  {activeFeature === "rag" && "hybrid_rag_pipeline.py"}
                  {activeFeature === "drive" && "drive_sync_worker.py"}
                </div>
                <div className="flex items-center gap-1.5 text-muted-text text-[10px] font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  active
                </div>
              </div>

              {/* Dynamic Views */}
              <div className="flex-1 flex flex-col font-sans relative overflow-hidden">
                <AnimatePresence mode="wait">
                  {activeFeature === "sql" && (
                    <motion.div
                      key="sql"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -12 }}
                      transition={{ duration: 0.22, ease: [0.25, 1, 0.5, 1] }}
                      className="flex-1 flex flex-col justify-between text-left h-full"
                    >
                      <div>
                        {/* NL input */}
                        <div className="flex items-center gap-2 p-2 bg-secondary-bg/80 border border-border-color rounded-lg mb-4 text-xs">
                          <Search size={12} className="text-primary" />
                          <span className="text-primary-text font-medium">
                            "Retrieve California revenues for Q2 2026"
                          </span>
                        </div>

                        {/* AST verify badge */}
                        <div className="flex items-center gap-1.5 mb-4 text-[10px] font-mono text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded w-max">
                          <ShieldCheck size={11} />
                          AST Safety Guard: APPROVED (READ-ONLY)
                        </div>

                        {/* SQL syntax code box */}
                        <div className="bg-primary-bg/70 border border-border-color p-3.5 rounded-lg font-mono text-[11px] text-primary leading-normal overflow-x-auto">
                          <span className="text-secondary-text">SELECT</span>{" "}
                          <span className="text-pink-500">SUM</span>(u.revenue){" "}
                          <span className="text-secondary-text">AS</span>{" "}
                          q2_revenue,
                          <br />
                          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;l.state_code
                          <br />
                          <span className="text-secondary-text">FROM</span>{" "}
                          users u<br />
                          <span className="text-secondary-text">JOIN</span>{" "}
                          locations l{" "}
                          <span className="text-secondary-text">ON</span>{" "}
                          u.loc_id = l.id
                          <br />
                          <span className="text-secondary-text">
                            WHERE
                          </span>{" "}
                          l.state_code ={" "}
                          <span className="text-orange-400">'CA'</span>
                          <br />
                          &nbsp;&nbsp;
                          <span className="text-secondary-text">AND</span>{" "}
                          u.joined_at{" "}
                          <span className="text-secondary-text">BETWEEN</span>{" "}
                          <span className="text-orange-400">'2026-04-01'</span>{" "}
                          <span className="text-secondary-text">AND</span>{" "}
                          <span className="text-orange-400">'2026-06-30'</span>;
                        </div>
                      </div>

                      {/* Result Card */}
                      <div className="mt-4 p-3 bg-secondary-bg/50 border border-border-color rounded-lg">
                        <div className="text-[10px] uppercase font-bold text-muted-text tracking-wider mb-2">
                          Live Schema Exec Results
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-[10px] text-muted-text">
                              q2_revenue
                            </div>
                            <div className="text-sm font-bold text-primary-text">
                              $1,482,900.00
                            </div>
                          </div>
                          <div>
                            <div className="text-[10px] text-muted-text">
                              state_code
                            </div>
                            <div className="text-sm font-bold text-primary-text">
                              CA
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeFeature === "rag" && (
                    <motion.div
                      key="rag"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -12 }}
                      transition={{ duration: 0.22, ease: [0.25, 1, 0.5, 1] }}
                      className="flex-1 flex flex-col justify-between text-left h-full"
                    >
                      <div>
                        {/* Document details */}
                        <div className="flex items-center justify-between p-2.5 bg-secondary-bg/80 border border-border-color rounded-lg mb-4">
                          <div className="flex items-center gap-2.5">
                            <FileText size={16} className="text-primary" />
                            <div>
                              <div className="text-xs font-bold text-primary-text">
                                Q4_Strategy_Assessment.pdf
                              </div>
                              <div className="text-[9px] text-muted-text">
                                14.2 MB • PDF Document Loader
                              </div>
                            </div>
                          </div>
                          <span className="text-[9px] bg-primary/10 text-primary border border-primary/25 px-2 py-0.5 rounded font-mono">
                            Parsed
                          </span>
                        </div>

                        {/* Chunk processing */}
                        <div className="space-y-3">
                          <div className="text-[10px] text-muted-text uppercase font-bold tracking-wider">
                            Semantic Similarity Chunking
                          </div>
                          <div className="p-3 bg-primary-bg/50 border-l-2 border-primary rounded-r-lg text-[11px] leading-relaxed text-secondary-text">
                            <span className="font-bold text-primary-text block mb-1">
                              Vector Chunk #4 (Match Score: 0.923)
                            </span>
                            "...all department budgets for operations must be
                            approved by the chief financial officer prior to
                            September 1st, 2026. Submissions under $15k can
                            follow self-review..."
                          </div>
                          <div className="p-3 bg-primary-bg/50 border-l-2 border-border-color rounded-r-lg text-[11px] leading-relaxed text-muted-text">
                            <span className="font-semibold text-secondary-text block mb-1">
                              Vector Chunk #9 (Match Score: 0.817)
                            </span>
                            "...corporate spending policies specify limits for
                            travel and expenses. Lodging expenses in tier 1
                            cities have an upper threshold of $350/night..."
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between text-[10px] font-mono text-muted-text">
                        <div className="flex items-center gap-1">
                          <RefreshCw
                            size={11}
                            className="animate-spin text-primary"
                          />
                          Indexing to pgvector
                        </div>
                        <div>Embedding model: text-embedding-3-small</div>
                      </div>
                    </motion.div>
                  )}

                  {activeFeature === "drive" && (
                    <motion.div
                      key="drive"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -12 }}
                      transition={{ duration: 0.22, ease: [0.25, 1, 0.5, 1] }}
                      className="flex-1 flex flex-col justify-between text-left h-full"
                    >
                      <div>
                        {/* Active directory sync status */}
                        <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg mb-4 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <HardDrive size={18} className="text-primary" />
                            <div>
                              <div className="text-xs font-bold text-primary-text">
                                Google Drive Sync Pipeline
                              </div>
                              <div className="text-[9px] text-muted-text">
                                Target Folder: /Corporate_Policies_2026
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                            <span className="text-[10px] font-semibold text-primary-text">
                              Syncing
                            </span>
                          </div>
                        </div>

                        {/* Sync progress items */}
                        <div className="space-y-2">
                          <div className="text-[10px] text-muted-text uppercase font-bold tracking-wider mb-1">
                            Background Worker Queue
                          </div>
                          <div className="flex items-center justify-between p-2 bg-primary-bg/60 border border-border-color rounded-lg text-[11px]">
                            <span className="text-primary-text font-medium flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                              Security_Handbook.docx
                            </span>
                            <span className="text-primary font-mono text-[10px]">
                              Synced
                            </span>
                          </div>
                          <div className="flex items-center justify-between p-2 bg-primary-bg/60 border border-border-color rounded-lg text-[11px]">
                            <span className="text-primary-text font-medium flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                              Executive_Summary.pdf
                            </span>
                            <span className="text-primary font-mono text-[10px]">
                              Synced
                            </span>
                          </div>
                          <div className="flex items-center justify-between p-2 bg-primary-bg/60 border border-primary/20 rounded-lg text-[11px] bg-primary/5">
                            <span className="text-primary-text font-medium flex items-center gap-2">
                              <RefreshCw
                                size={11}
                                className="animate-spin text-primary"
                              />
                              Employee_Travel_FAQ.xlsx
                            </span>
                            <span className="text-primary font-mono text-[10px] animate-pulse">
                              47% Loaded
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 p-2.5 bg-secondary-bg/40 border border-border-color rounded-lg flex items-center justify-between text-[10px] font-mono">
                        <span className="text-muted-text">
                          Interval: Every 15 min
                        </span>
                        <span className="text-secondary-text">
                          Orchestration: Celery + Redis
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Right Column: Three Feature Cards */}
            <div className="flex flex-col gap-6">
              {/* Feature 1: SQL Integration */}
              <div
                onMouseEnter={() => setActiveFeature("sql")}
                onClick={() => setActiveFeature("sql")}
                className={`glass-card glass-card-hover p-6 relative overflow-hidden transition-all duration-300 cursor-pointer text-left ${activeFeature === "sql" ? "border-primary shadow-[0_0_20px_rgba(0,122,255,0.15)] bg-card-bg/95" : "border-border-color/60 hover:bg-card-bg/30"}`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 ${activeFeature === "sql" ? "bg-primary text-primary-foreground shadow-[0_4px_12px_rgba(0,122,255,0.2)]" : "bg-card-bg border border-border-color text-secondary-text"}`}
                >
                  <Database size={20} />
                </div>
                <h3 className="text-lg font-bold text-primary-text mb-2 flex items-center gap-2">
                  Talk to your SQL databases
                  <ChevronRight
                    size={16}
                    className={`text-primary transition-all duration-300 transform ${activeFeature === "sql" ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"}`}
                  />
                </h3>
                <p className="text-sm text-secondary-text leading-relaxed">
                  Type questions and get live data tables back instantly.
                  EnterpriseIQ automatically translates your natural language
                  into safe, read-only SQL queries so you don't need code to
                  analyze metrics.
                </p>
                <motion.div
                  initial={false}
                  animate={{
                    height: activeFeature === "sql" ? "auto" : 0,
                    opacity: activeFeature === "sql" ? 1 : 0,
                  }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="mt-4 pt-4 border-t border-border-color/50 flex flex-wrap gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-primary-bg text-secondary-text">
                      AST Security Guard
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-primary-bg text-secondary-text">
                      Postgres & MySQL
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-primary-bg text-secondary-text">
                      Read-Only Enforced
                    </span>
                  </div>
                </motion.div>
              </div>

              {/* Feature 2: Hybrid RAG */}
              <div
                onMouseEnter={() => setActiveFeature("rag")}
                onClick={() => setActiveFeature("rag")}
                className={`glass-card glass-card-hover p-6 relative overflow-hidden transition-all duration-300 cursor-pointer text-left ${activeFeature === "rag" ? "border-primary shadow-[0_0_20px_rgba(0,122,255,0.15)] bg-card-bg/95" : "border-border-color/60 hover:bg-card-bg/30"}`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 ${activeFeature === "rag" ? "bg-primary text-primary-foreground shadow-[0_4px_12px_rgba(0,122,255,0.2)]" : "bg-card-bg border border-border-color text-secondary-text"}`}
                >
                  <FileText size={20} />
                </div>
                <h3 className="text-lg font-bold text-primary-text mb-2 flex items-center gap-2">
                  Search PDFs and local docs
                  <ChevronRight
                    size={16}
                    className={`text-primary transition-all duration-300 transform ${activeFeature === "rag" ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"}`}
                  />
                </h3>
                <p className="text-sm text-secondary-text leading-relaxed">
                  Upload strategies, policies, or spreadsheets. Our vector
                  indexing searches document contents contextually to return the
                  exact paragraphs you need, with instant citations.
                </p>
                <motion.div
                  initial={false}
                  animate={{
                    height: activeFeature === "rag" ? "auto" : 0,
                    opacity: activeFeature === "rag" ? 1 : 0,
                  }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="mt-4 pt-4 border-t border-border-color/50 flex flex-wrap gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-primary-bg text-secondary-text">
                      pgvector Search
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-primary-bg text-secondary-text">
                      Asynchronous Chunking
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-primary-bg text-secondary-text">
                      Source Citations
                    </span>
                  </div>
                </motion.div>
              </div>

              {/* Feature 3: Google Drive Sync */}
              <div
                onMouseEnter={() => setActiveFeature("drive")}
                onClick={() => setActiveFeature("drive")}
                className={`glass-card glass-card-hover p-6 relative overflow-hidden transition-all duration-300 cursor-pointer text-left ${activeFeature === "drive" ? "border-primary shadow-[0_0_20px_rgba(0,122,255,0.15)] bg-card-bg/95" : "border-border-color/60 hover:bg-card-bg/30"}`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 ${activeFeature === "drive" ? "bg-primary text-primary-foreground shadow-[0_4px_12px_rgba(0,122,255,0.2)]" : "bg-card-bg border border-border-color text-secondary-text"}`}
                >
                  <HardDrive size={20} />
                </div>
                <h3 className="text-lg font-bold text-primary-text mb-2 flex items-center gap-2">
                  Auto-sync Google Drive folders
                  <ChevronRight
                    size={16}
                    className={`text-primary transition-all duration-300 transform ${activeFeature === "drive" ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"}`}
                  />
                </h3>
                <p className="text-sm text-secondary-text leading-relaxed">
                  Link your shared team drives once. EnterpriseIQ tracks changes
                  in the background and indexes new files automatically, keeping
                  your knowledge base up to date in real time.
                </p>
                <motion.div
                  initial={false}
                  animate={{
                    height: activeFeature === "drive" ? "auto" : 0,
                    opacity: activeFeature === "drive" ? 1 : 0,
                  }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="mt-4 pt-4 border-t border-border-color/50 flex flex-wrap gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-primary-bg text-secondary-text">
                      Secure OAuth
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-primary-bg text-secondary-text">
                      Background Workers
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-primary-bg text-secondary-text">
                      Incremental Sync
                    </span>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Project Overview Section */}
      <section
        id="overview"
        className="relative z-10 py-20 md:py-28 px-6 max-w-7xl mx-auto"
      >
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 backdrop-blur-md mb-4">
            <CheckCircle2 size={12} />
            <span>Secure, fast, and production-ready</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-primary-text mb-4">
            Built for modern teams
          </h2>
          <p className="text-base sm:text-lg text-secondary-text">
            EnterpriseIQ runs safely on your system, integrating with your
            existing workflows while protecting sensitive company information.
          </p>
        </div>

        {/* 3 Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {/* Pillar 1 */}
          <div className="glass-card glass-card-hover p-6 text-left hover:border-border-hover transition-colors duration-300">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-5">
              <Key size={20} />
            </div>
            <h4 className="text-base font-bold text-primary-text mb-2.5">
              Developer-friendly API
            </h4>
            <p className="text-xs sm:text-sm text-secondary-text leading-relaxed">
              Build custom integrations or chat portals. Generate secure API
              keys to fetch context, search results, and database records
              directly into your own internal apps.
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="glass-card glass-card-hover p-6 text-left hover:border-border-hover transition-colors duration-300">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-5">
              <Cpu size={20} />
            </div>
            <h4 className="text-base font-bold text-primary-text mb-2.5">
              Granular access control
            </h4>
            <p className="text-xs sm:text-sm text-secondary-text leading-relaxed">
              Keep sensitive files private. Set permissions by role so team
              members can only query the specific databases, documents, and
              folders they're authorized to see.
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="glass-card glass-card-hover p-6 text-left hover:border-border-hover transition-colors duration-300">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-5">
              <BarChart2 size={20} />
            </div>
            <h4 className="text-base font-bold text-primary-text mb-2.5">
              Interactive data blocks
            </h4>
            <p className="text-xs sm:text-sm text-secondary-text leading-relaxed">
              Get visual answers. Rather than walls of text, query results are
              returned as clean markdown tables, interactive charts, and trends
              that help you understand your metrics.
            </p>
          </div>
        </div>

        {/* Dashboard Outcomes Preview */}
        <div className="glass-card p-6 sm:p-8 text-left shadow-lg overflow-hidden relative border border-border-color">
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            <div className="lg:col-span-2">
              <h4 className="text-lg font-bold text-primary-text mb-2 flex items-center gap-2">
                <ShieldCheck size={18} className="text-primary" />
                Strict read-only safety guardrails
              </h4>
              <p className="text-xs sm:text-sm text-secondary-text leading-relaxed">
                EnterpriseIQ translates text questions into Abstract Syntax
                Trees (ASTs) to verify query safety. If a query contains write
                instructions (like `UPDATE` or `DROP`) or database mutations, it
                is blocked immediately. Your live databases remain completely
                safe and untouched.
              </p>
            </div>
            <div className="flex justify-start lg:justify-end">
              <button
                onClick={() => router.push("/sign-in")}
                className="inline-flex items-center justify-center text-xs font-semibold rounded-xl transition-all duration-300 outline-none cursor-pointer h-10 px-5 text-secondary-text hover:text-primary-text bg-secondary-bg hover:bg-tertiary-bg border border-border-color"
              >
                Launch Admin Control Panel
                <ArrowRight size={14} className="ml-1.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border-color/60 bg-secondary-bg/20 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-muted-text">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-primary/20 text-primary flex items-center justify-center">
              <Sparkles size={12} />
            </div>
            <span className="font-semibold text-primary-text">
              EnterpriseIQ AI Platform
            </span>
          </div>
          <div>
            &copy; {new Date().getFullYear()} EnterpriseIQ AI Engine. All rights
            reserved.
          </div>
          <div className="flex gap-6 font-semibold">
            <a href="#" className="hover:text-primary-text transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-primary-text transition-colors">
              Terms of Service
            </a>
            <a href="#" className="hover:text-primary-text transition-colors">
              Documentation
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
