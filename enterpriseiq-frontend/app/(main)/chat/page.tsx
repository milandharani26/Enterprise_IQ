"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWorkspace } from "@/app/(main)/layout";
import { Send, Plus, Sparkles, PanelLeftOpen } from "lucide-react";

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
  const user = { name: "Priyank Godhani" };

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
      {/* ── Top bar ── */}
      <div className="nav-glass flex items-center gap-3 px-5 py-3 shrink-0">
        {!sidebarOpen && (
          <>
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-1.5 rounded-lg transition-colors hover:opacity-70"
              style={{ color: "var(--color-text-tertiary)" }}
            >
              <PanelLeftOpen className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveChat(null)}
              className="p-1.5 rounded-lg transition-colors hover:opacity-70"
              style={{ color: "var(--color-text-tertiary)" }}
            >
              <Plus className="w-4 h-4" />
            </button>
            <div
              className="w-px h-4 mx-1"
              style={{ background: "var(--color-border-primary)" }}
            />
          </>
        )}
        <span
          className="text-sm font-semibold"
          style={{ color: "var(--color-text-secondary)" }}
        >
          {activeChat ? "Active Session" : "New Chat"}
        </span>
        {activeChat && (
          <span className="ml-2 text-[11px] px-2 py-0.5 rounded-full font-medium badge-info">
            Session #{activeChat.slice(-6)}
          </span>
        )}
      </div>

      {/* ════════════════════════════════════════════════════════════
          EMPTY STATE — everything in one tight vertical stack
          ════════════════════════════════════════════════════════════ */}
      {messages.length === 0 ? (
        <div className="flex flex-col flex-1 min-h-0">
          {/* Vertically centered content block */}
          <div className="flex flex-col items-center justify-center flex-1 px-4 gap-0">
            {/* Icon */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="relative mb-5"
            >
              <div
                className="absolute inset-0 rounded-3xl blur-2xl opacity-50 scale-[1.6]"
                style={{ background: "var(--gradient-brand)" }}
              />
              <div className="relative w-14 h-14 rounded-2xl flex items-center justify-center btn-gradient shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
            </motion.div>

            {/* Headline */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.4,
                delay: 0.08,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="text-center mb-2"
            >
              <h2
                className="text-[28px] font-bold tracking-tight leading-tight"
                style={{ color: "var(--color-text-primary)" }}
              >
                How can I <span className="gradient-text">help you?</span>
              </h2>
            </motion.div>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.4,
                delay: 0.13,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="text-sm text-center mb-7 max-w-sm"
              style={{ color: "var(--color-text-tertiary)" }}
            >
              Ask anything about your enterprise data, workflows, or
              integrations.
            </motion.p>

            {/* Suggestion chips — tight row like reference */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.4,
                delay: 0.18,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="flex flex-wrap gap-2 justify-center mb-10 max-w-2xl"
            >
              {SUGGESTIONS.map((s, i) => (
                <motion.button
                  key={s}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.22 + i * 0.05,
                    duration: 0.35,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  onClick={() => handleSuggestion(s)}
                  className="px-4 py-2 text-sm font-medium rounded-xl cursor-pointer transition-all duration-150 hover:opacity-80 active:scale-[0.98]"
                  style={{
                    background: "var(--color-bg-primary)",
                    backdropFilter: "blur(12px)",
                    border: "1px solid var(--color-border-secondary)",
                    color: "var(--color-text-secondary)",
                    boxShadow: "var(--shadow-sm)",
                  }}
                >
                  {s}
                </motion.button>
              ))}
            </motion.div>

            {/* Input bar — part of the centered block, not floating */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.4,
                delay: 0.25,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="w-full"
            >
              <div className="w-full max-w-3xl mx-auto px-4">
                <div className="input-glow-wrap">
                  <div className="chat-input-border">
                    <div
                      className="relative overflow-hidden group"
                      style={{
                        background: "var(--color-bg-elevated)",
                        borderRadius: "1rem",
                        boxShadow: "var(--shadow-md)",
                      }}
                    >
                      <div
                        className="absolute inset-0 pointer-events-none opacity-10 group-focus-within:opacity-25"
                        style={{
                          backgroundImage: "var(--gradient-brand)",
                          mixBlendMode: "plus-lighter",
                          transition: "opacity 350ms ease",
                        }}
                      />
                      <div
                        className="absolute top-0 left-10 right-10 h-px pointer-events-none opacity-60 group-focus-within:opacity-100"
                        style={{
                          background:
                            "linear-gradient(90deg, transparent, var(--color-primary), transparent)",
                          transition: "opacity 350ms ease",
                        }}
                      />
                      <div className="relative z-10">
                        <textarea
                          ref={inputRef}
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          onKeyDown={handleKeyDown}
                          placeholder="Ask EnterpriseIQ anything…"
                          rows={1}
                          className="w-full px-5 pt-4 pb-2 text-sm resize-none bg-transparent outline-none leading-relaxed"
                          style={{
                            color: "var(--color-text-primary)",
                            minHeight: 52,
                            maxHeight: 160,
                            caretColor: "var(--color-primary)",
                          }}
                        />
                        <div className="flex items-center justify-between px-5 pb-3 pt-1">
                          <p
                            className="text-[11px]"
                            style={{ color: "var(--color-text-tertiary)" }}
                          >
                            <kbd
                              className="px-1.5 py-0.5 rounded text-[10px] font-medium"
                              style={{
                                background: "var(--color-bg-secondary)",
                                border:
                                  "1px solid var(--color-border-secondary)",
                              }}
                            >
                              Enter
                            </kbd>{" "}
                            to send ·{" "}
                            <kbd
                              className="px-1.5 py-0.5 rounded text-[10px] font-medium"
                              style={{
                                background: "var(--color-bg-secondary)",
                                border:
                                  "1px solid var(--color-border-secondary)",
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
                            className="w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 disabled:opacity-20"
                            style={{
                              background: input.trim()
                                ? "var(--gradient-brand)"
                                : "var(--color-bg-secondary)",
                              boxShadow: input.trim()
                                ? "var(--shadow-glow)"
                                : "none",
                              color: input.trim()
                                ? "#ffffff"
                                : "var(--color-text-tertiary)",
                            }}
                          >
                            <Send className="w-3.5 h-3.5" />
                          </motion.button>
                        </div>
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
            </motion.div>
          </div>
        </div>
      ) : (
        /* ════════════════════════════════════════════════════════════
           CHAT STATE — messages + pinned input at bottom
           ════════════════════════════════════════════════════════════ */
        <>
          {/* Messages scroll area */}
          <div className="flex-1 overflow-y-auto px-4 py-6 space-y-5 scrollbar-thin">
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {/* Assistant icon */}
                  {msg.role === "assistant" && (
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 btn-gradient">
                      <Sparkles className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}

                  {/* Bubble */}
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
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Typing indicator */}
            <AnimatePresence>
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
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
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>

          {/* Pinned input at bottom */}
          <div className="shrink-0 pb-5 pt-2">
            <div className="w-full max-w-3xl mx-auto px-4">
              <div className="input-glow-wrap">
                <div className="chat-input-border">
                  <div
                    className="relative overflow-hidden group"
                    style={{
                      background: "var(--color-bg-elevated)",
                      borderRadius: "1rem",
                      boxShadow: "var(--shadow-md)",
                    }}
                  >
                    <div
                      className="absolute inset-0 pointer-events-none opacity-10 group-focus-within:opacity-25"
                      style={{
                        backgroundImage: "var(--gradient-brand)",
                        mixBlendMode: "plus-lighter",
                        transition: "opacity 350ms ease",
                      }}
                    />
                    <div
                      className="absolute top-0 left-10 right-10 h-px pointer-events-none opacity-60 group-focus-within:opacity-100"
                      style={{
                        background:
                          "linear-gradient(90deg, transparent, var(--color-primary), transparent)",
                        transition: "opacity 350ms ease",
                      }}
                    />
                    <div className="relative z-10">
                      <textarea
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask EnterpriseIQ anything…"
                        rows={1}
                        className="w-full px-5 pt-4 pb-2 text-sm resize-none bg-transparent outline-none leading-relaxed"
                        style={{
                          color: "var(--color-text-primary)",
                          minHeight: 52,
                          maxHeight: 160,
                          caretColor: "var(--color-primary)",
                        }}
                      />
                      <div className="flex items-center justify-between px-5 pb-3 pt-1">
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
                          className="w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 disabled:opacity-20"
                          style={{
                            background: input.trim()
                              ? "var(--gradient-brand)"
                              : "var(--color-bg-secondary)",
                            boxShadow: input.trim()
                              ? "var(--shadow-glow)"
                              : "none",
                            color: input.trim()
                              ? "#ffffff"
                              : "var(--color-text-tertiary)",
                          }}
                        >
                          <Send className="w-3.5 h-3.5" />
                        </motion.button>
                      </div>
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
        </>
      )}
    </div>
  );
}
