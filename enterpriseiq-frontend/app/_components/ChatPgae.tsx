"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWorkspace } from "@/app/(main)/layout";
import { Avatar } from "./Sidebar";
import { Send, Plus, Sparkles, PanelLeftOpen } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  ts: Date;
}

const SUGGESTIONS = [
  "Explain my data flow",
  "Set up SSO with Okta",
  "Debug an API error",
  "Optimise slow queries",
];

export default function ChatPage() {
  const { sidebarOpen, setSidebarOpen, activeChat, setActiveChat } =
    useWorkspace();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { user: storeUser } = useAuthStore();
  const emailPrefix = storeUser?.email ? storeUser.email.split("@")[0] : "User";
  const user = { name: emailPrefix };

  // Dynamic textarea height adjustment
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 160)}px`;
    }
  }, [input]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    if (activeChat) {
      setMessages([
        {
          id: "reopen",
          role: "assistant",
          ts: new Date(),
          content: `Session #${activeChat} restored. How can I help you continue?`,
        },
      ]);
    } else {
      setMessages([]);
    }
  }, [activeChat]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text) return;
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      ts: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);
    if (!activeChat) setActiveChat(Date.now().toString());

    await new Promise((r) => setTimeout(r, 1000 + Math.random() * 800));
    const reply: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      ts: new Date(),
      content: `I've analysed your request about "${text.slice(0, 50)}${text.length > 50 ? "…" : ""}"\n\nEnterpriseIQ routes this through the real-time orchestration layer, applying multi-model routing and workspace-aware context.\n\nWould you like me to dive deeper into any specific aspect?`,
    };
    setMessages((prev) => [...prev, reply]);
    setIsTyping(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleSuggestion = (s: string) => {
    setInput(s);
    inputRef.current?.focus();
  };

  return (
    <div
      className="flex flex-col flex-1 min-w-0 h-full"
      style={{ background: "var(--color-bg-tertiary)" }}
    >
      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto px-4 py-8 space-y-6 scrollbar-thin">
        {messages.length === 0 ? (
          /* ── Empty state ── */
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center justify-center h-full gap-8 text-center px-4"
          >
            <div className="relative">
              <div
                className="absolute inset-0 rounded-3xl blur-2xl opacity-40 scale-150"
                style={{ background: "var(--gradient-brand)" }}
              />
              <div className="relative w-16 h-16 rounded-3xl flex items-center justify-center btn-gradient">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
            </div>

            <div className="space-y-2">
              <h2
                className="text-3xl font-bold tracking-tight"
                style={{ color: "var(--color-text-primary)" }}
              >
                How can I <span className="gradient-text">help you?</span>
              </h2>
              <p
                className="text-sm max-w-sm mx-auto"
                style={{ color: "var(--color-text-tertiary)" }}
              >
                Ask anything about your enterprise data, workflows, or
                integrations.
              </p>
            </div>

            <div className="flex flex-wrap gap-2.5 justify-center max-w-lg">
              {SUGGESTIONS.map((s, i) => (
                <motion.button
                  key={s}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.1 + i * 0.07,
                    duration: 0.4,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  onClick={() => handleSuggestion(s)}
                  className="glass-card glass-card-hover px-4 py-2.5 text-xs font-medium cursor-pointer"
                  style={{
                    color: "var(--color-text-secondary)",
                    borderRadius: "var(--radius-md)",
                  }}
                >
                  {s}
                </motion.button>
              ))}
            </div>
          </motion.div>
        ) : (
          <>
            <AnimatePresence initial={false}>
              {messages.map((msg, i) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.35,
                    ease: [0.22, 1, 0.36, 1],
                    delay: i === 0 ? 0 : 0,
                  }}
                  className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "assistant" && (
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 btn-gradient">
                      <Sparkles className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}

                  <div
                    className="rounded-2xl px-4 py-3 text-sm leading-relaxed max-w-[75%] whitespace-pre-wrap"
                    style={
                      msg.role === "user"
                        ? {
                            background: "var(--gradient-brand)",
                            color: "#ffffff",
                            borderRadius: "16px 16px 4px 16px",
                            boxShadow: "var(--shadow-md)",
                          }
                        : {
                            background: "var(--color-bg-primary)",
                            backdropFilter: "blur(16px)",
                            border: "1px solid var(--color-border-tertiary)",
                            color: "var(--color-text-primary)",
                            borderRadius: "16px 16px 16px 4px",
                            boxShadow: "var(--shadow-sm)",
                          }
                    }
                  >
                    {msg.content}
                  </div>

                  {msg.role === "user" && <Avatar name={user.name} size={8} />}
                </motion.div>
              ))}
            </AnimatePresence>

            {isTyping && (
              <AnimatePresence>
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  className="flex gap-3 items-start"
                >
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 btn-gradient">
                    <Sparkles className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div
                    className="glass-card px-4 py-3.5 flex items-center gap-1.5"
                    style={{ borderRadius: "16px 16px 16px 4px" }}
                  >
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="w-2 h-2 rounded-full animate-bounce"
                        style={{
                          background: "var(--color-primary)",
                          animationDelay: `${i * 0.18}s`,
                        }}
                      />
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* ── Input bar ── */}
      {/* ── Input bar ── */}
      {/* ── Input bar ── */}
      <div className="px-4 pb-6 pt-3 shrink-0">
        <div className="max-w-3xl mx-auto">
          <div className="chat-input-border">
            {/* The main container wrapper */}
            <div
              className="relative overflow-hidden group"
              style={{
                background: "var(--color-bg-elevated)",
                borderRadius: "1rem",
                boxShadow: "var(--shadow-md)",
                border: "1px solid var(--color-border-secondary)",
              }}
            >
              {/* FORCE GRADIENT DISPLAY: 
                An absolute block pinned down that forces the background to paint via standard CSS,
                bypassing global * transitions by matching the transition duration explicitly.
              */}
              <div
                className="absolute inset-0 pointer-events-none opacity-15 group-focus-within:opacity-35"
                style={{
                  backgroundImage: "var(--gradient-brand)",
                  mixBlendMode: "plus-lighter",
                  transition: "opacity 300ms ease-in-out",
                }}
              />

              {/* Top hairline border light indicator */}
              <div
                className="absolute top-0 left-10 right-10 h-px pointer-events-none opacity-50 group-focus-within:opacity-100"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, var(--color-primary), transparent)",
                  transition: "opacity 300ms ease",
                }}
              />

              {/* Main Content Layer */}
              <div className="relative z-10 bg-transparent">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask EnterpriseIQ anything…"
                  rows={1}
                  className="w-full px-5 pt-4 pb-2 text-sm resize-none bg-transparent outline-none leading-relaxed placeholder-slate-400 dark:placeholder-zinc-500"
                  style={{
                    color: "var(--color-text-primary)",
                    minHeight: 56,
                    maxHeight: 160,
                    caretColor: "var(--color-primary)",
                    WebkitAppearance: "none",
                  }}
                />

                <div className="flex items-center justify-between px-5 pb-3.5 pt-1 bg-transparent">
                  <p
                    className="text-[11px]"
                    style={{ color: "var(--color-text-tertiary)" }}
                  >
                    <kbd
                      className="px-1.5 py-0.5 rounded text-[10px] font-medium"
                      style={{
                        background: "var(--color-bg-secondary)",
                        border: "1px solid var(--color-border-secondary)",
                      }}
                    >
                      Enter
                    </kbd>{" "}
                    to send ·{" "}
                    <kbd
                      className="px-1.5 py-0.5 rounded text-[10px] font-medium"
                      style={{
                        background: "var(--color-bg-secondary)",
                        border: "1px solid var(--color-border-secondary)",
                      }}
                    >
                      Shift+Enter
                    </kbd>{" "}
                    new line
                  </p>

                  <motion.button
                    onClick={sendMessage}
                    disabled={!input.trim() || isTyping}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 disabled:opacity-20"
                    style={{
                      background: input.trim()
                        ? "var(--gradient-brand)"
                        : "var(--color-bg-secondary)",
                      boxShadow: input.trim() ? "var(--shadow-glow)" : "none",
                      color: input.trim()
                        ? "#ffffff"
                        : "var(--color-text-tertiary)",
                    }}
                  >
                    <Send className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </div>
          </div>

          <p
            className="text-center text-[11px] mt-2"
            style={{ color: "var(--color-text-tertiary)" }}
          >
            EnterpriseIQ can make mistakes. Verify important information.
          </p>
        </div>
      </div>
    </div>
  );
}
