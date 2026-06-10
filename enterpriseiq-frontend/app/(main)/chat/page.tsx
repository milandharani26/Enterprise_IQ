"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWorkspace } from "@/app/(main)/layout";
import { Send, Sparkles, ChevronDown, User, Check } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/axios";
import { useAuthStore } from "@/store/useAuthStore";
import { getRoleWithAssistantById } from "@/hooks/queries/useRoleQueries";
import { useConversationDetails } from "@/hooks/queries/useConversationQueries";
import { useConversationMutations } from "@/hooks/mutations/useConversationMutation";
import { assistant as AssistantType } from "@/types/assistants";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
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
  const { user, login } = useAuthStore();

  const [input, setInput] = useState("");
  const [selectedAssistant, setSelectedAssistant] =
    useState<AssistantType | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesScrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // ── Fetch assistants for current user's role ──
  const { data: assistants = [], isSuccess: assistantsSuccess } =
    getRoleWithAssistantById(user?.role_id || "");

  // ── Fetch conversation messages for active chat ──
  const { data: conversationDetails, isLoading: loadingChatDetails } =
    useConversationDetails(activeChat || "");

  // ── Mutation methods ──
  const { createConversation, sendMessage, isSending } =
    useConversationMutations();

  // ── Fetch /me if user not in store ──
  const { data: meData, isSuccess: isMeSuccess } = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const res = await apiClient.get("/users/me");
      return res.data.data;
    },
    enabled: !user,
  });

  // Auto-select first assistant
  useEffect(() => {
    if (assistantsSuccess && assistants.length > 0 && !selectedAssistant) {
      setSelectedAssistant(assistants[0]);
    }
  }, [assistantsSuccess, assistants, selectedAssistant]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Hydrate auth store from /me
  useEffect(() => {
    if (isMeSuccess && meData) {
      login(meData);
    }
  }, [isMeSuccess, meData, login]);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 160)}px`;
    }
  }, [input]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [conversationDetails?.messages, isSending]);

  const messages: Message[] = conversationDetails?.messages ?? [];

  const handleSendMessage = async () => {
    const text = input.trim();
    if (!text || isSending) return;

    setInput("");

    try {
      let currentChatId = activeChat;

      if (!currentChatId) {
        const created = await createConversation({
          title: text.length > 26 ? `${text.slice(0, 25)}...` : text,
          agentId: selectedAssistant?.id,
        });
        currentChatId = created.id;
        setActiveChat(currentChatId);
      }

      await sendMessage({ id: currentChatId, content: text });
    } catch (err) {
      console.error("Failed to route core message pipeline invocation:", err);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestion = (s: string) => {
    setInput(s);
    inputRef.current?.focus();
  };

  // ── Assistant Dropdown ──
  const renderAssistantDropdown = () => (
    <div className="relative flex items-center" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="mr-2 h-8 px-3 rounded-xl flex items-center gap-1.5 text-xs font-medium transition-all duration-150 border max-w-[160px] truncate"
        style={{
          background: "var(--color-bg-secondary)",
          borderColor: "var(--color-border-secondary)",
          color: "var(--color-text-secondary)",
          backdropFilter: "blur(8px)",
        }}
      >
        <User className="w-3 h-3 shrink-0" />
        <span className="truncate">
          {selectedAssistant?.name || "Select Assistant"}
        </span>
        <ChevronDown className="w-3 h-3 shrink-0 opacity-60" />
      </button>

      <AnimatePresence>
        {dropdownOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="absolute top-full right-2 mt-2 w-56 rounded-xl border p-1 z-[999] shadow-2xl max-h-60 overflow-y-auto scrollbar-thin"
            style={{
              background: "var(--color-bg-elevated)",
              backgroundColor: "rgba(20, 20, 25, 0.85)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              borderColor: "var(--color-border-tertiary)",
              boxShadow: "0 12px 40px rgba(0, 0, 0, 0.6), var(--shadow-md)",
            }}
          >
            <div
              className="px-2.5 py-1.5 text-[10px] font-semibold tracking-wider uppercase opacity-50"
              style={{ color: "var(--color-text-tertiary)" }}
            >
              Available Assistants
            </div>

            {assistantsSuccess && assistants.length > 0 ? (
              assistants.map((assistant: AssistantType) => {
                const isSelected = selectedAssistant?.id === assistant.id;
                return (
                  <button
                    key={assistant.id}
                    type="button"
                    onClick={() => {
                      setSelectedAssistant(assistant);
                      setDropdownOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-2.5 py-2 text-xs rounded-lg transition-all duration-150 text-left hover:bg-white/5 group"
                    style={{
                      background: isSelected
                        ? "rgba(255, 255, 255, 0.08)"
                        : "transparent",
                      color: isSelected
                        ? "var(--color-text-primary)"
                        : "var(--color-text-secondary)",
                    }}
                  >
                    <span className="truncate pr-2 group-hover:text-[var(--color-text-primary)]">
                      {assistant.name}
                    </span>
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    )}
                  </button>
                );
              })
            ) : (
              <div
                className="px-2.5 py-4 text-xs text-center opacity-50"
                style={{ color: "var(--color-text-tertiary)" }}
              >
                No assistants allowed for this role
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  // ── Shared input box ──
  const renderInputBox = () => (
    <div className="input-glow-wrap">
      <div className="chat-input-border">
        <div
          className="relative overflow-visible group"
          style={{
            background: "var(--color-bg-elevated)",
            borderRadius: "1rem",
            boxShadow: "var(--shadow-md)",
          }}
        >
          <div
            className="absolute inset-0 pointer-events-none opacity-10 group-focus-within:opacity-25 rounded-2xl"
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
              disabled={isSending}
              placeholder={
                selectedAssistant
                  ? `Message ${selectedAssistant.name}…`
                  : "Ask EnterpriseIQ anything…"
              }
              rows={1}
              className="w-full px-5 pt-4 pb-2 text-sm resize-none bg-transparent outline-none leading-relaxed disabled:opacity-60"
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
              <div className="flex items-center">
                {renderAssistantDropdown()}
                <motion.button
                  onClick={handleSendMessage}
                  disabled={!input.trim() || isSending}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 disabled:opacity-20"
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
                  <Send className="w-3.5 h-3.5" />
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div
      className="flex flex-col flex-1 min-w-0 overflow-hidden"
      style={{ background: "var(--color-bg-tertiary)" }}
    >
      {/* ── Top bar ── */}
      <div className="nav-glass flex items-center gap-3 px-5 py-3 shrink-0 overflow-visible min-h-[48px]">
        <span
          className="text-sm font-semibold"
          style={{ color: "var(--color-text-secondary)" }}
        >
          {activeChat
            ? conversationDetails?.title || "Active Session"
            : "New Chat"}
        </span>
        {activeChat && (
          <span className="ml-2 text-[11px] px-2 py-0.5 rounded-full font-medium badge-info">
            Session #{activeChat.slice(-6)}
          </span>
        )}
      </div>

      {/* ══════════════════════════════════════════
          EMPTY STATE
          ══════════════════════════════════════════ */}
      {messages.length === 0 && !loadingChatDetails ? (
        <div className="flex flex-col flex-1 min-h-0">
          <div className="flex flex-col items-center justify-center flex-1 px-4 gap-0">
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
                {renderInputBox()}
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
        /* ══════════════════════════════════════════
            CHAT STATE
            ══════════════════════════════════════════ */
        <>
          <div
            ref={messagesScrollRef}
            className="flex-1 overflow-y-auto min-h-0 pt-8 pb-6 scrollbar-thin"
          >
            <div className="w-full max-w-3xl mx-auto px-4 space-y-5">
              <AnimatePresence initial={false}>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
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
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Typing indicator driven by isSending */}
              <AnimatePresence>
                {isSending && (
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
          </div>

          {/* Pinned input footer */}
          <div className="shrink-0 pb-5 pt-2">
            <div className="w-full max-w-3xl mx-auto px-4">
              {renderInputBox()}
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
