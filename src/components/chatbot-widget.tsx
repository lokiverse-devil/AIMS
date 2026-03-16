"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, Bot, User, Play, ExternalLink, ChevronDown } from "lucide-react";
import chatbotData from "@/lib/chatbotData.json";

// ── Types ─────────────────────────────────────────────────────────────

interface FaqEntry {
  id: string;
  keywords: string[];
  question: string;
  answer: string;
  video?: string;
  videoLabel?: string;
  link?: string;
  linkLabel?: string;
}

interface BotResponse {
  text: string;
  video?: string;
  videoLabel?: string;
  link?: string;
  linkLabel?: string;
}

interface Message {
  id: string;
  role: "bot" | "user";
  response: BotResponse;
  time: string;
}

// ── Response Engine ────────────────────────────────────────────────────

function getResponse(input: string): BotResponse {
  const lower = input.toLowerCase().trim();
  const faqs = chatbotData.faqs as FaqEntry[];

  // Find best matching FAQ
  for (const faq of faqs) {
    if (faq.keywords.some((kw: string) => lower.includes(kw))) {
      return {
        text: faq.answer,
        video: faq.video,
        videoLabel: faq.videoLabel,
        link: faq.link,
        linkLabel: faq.linkLabel,
      };
    }
  }

  return { text: chatbotData.defaultResponse };
}

/**
 * Fetch a response from the Python FastAPI backend (POST /chat).
 * Returns null on any error so the caller can fall back to getResponse().
 * Requires NEXT_PUBLIC_API_URL to be set in .env.local.
 */
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

async function fetchBotResponse(message: string): Promise<BotResponse | null> {
  if (!API_URL) return null;
  try {
    const res = await fetch(`${API_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return {
      text: data.answer ?? chatbotData.defaultResponse,
      video: data.video_url ?? undefined,
      link: data.navigation_link ?? undefined,
    };
  } catch {
    return null;
  }
}

function formatTime() {
  return new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

// ── Message Bubble ─────────────────────────────────────────────────────

function BotBubble({ response }: { response: BotResponse }) {
  const [videoOpen, setVideoOpen] = useState(false);

  return (
    <div className="flex flex-col gap-1.5">
      {/* Text answer */}
      <div className="px-3 py-2 rounded-2xl rounded-tl-sm bg-muted text-foreground text-sm leading-relaxed">
        {response.text}
      </div>

      {/* Navigation video button */}
      {response.video && (
        <div>
          <button
            onClick={() => setVideoOpen(!videoOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors w-full text-left"
          >
            <Play size={12} />
            {response.videoLabel || "Play Navigation Video"}
            {/* TODO: Replace with Supabase guide video URL */}
            {/* TODO: https://PROJECT.supabase.co/storage/v1/object/public/guide-videos/{filename} */}
          </button>
          <AnimatePresence>
            {videoOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2 rounded-xl overflow-hidden border border-border bg-muted"
              >
                <div className="p-3 text-center">
                  <div className="w-full aspect-video bg-black/20 rounded-lg flex items-center justify-center">
                    {/* TODO: Replace src with Supabase Storage URL */}
                    {/* <video src={`https://PROJECT.supabase.co/storage/v1/object/public/guide-videos/${response.video}`} controls className="w-full h-full rounded-lg" /> */}
                    <div className="text-center">
                      <Play size={32} className="text-muted-foreground mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground">Video: {response.video}</p>
                      <p className="text-[10px] text-muted-foreground/60 mt-1">
                        {/* TODO: Replace with Supabase guide-videos bucket URL */}
                        Will load from Supabase guide-videos bucket
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Department / page link */}
      {response.link && (
        <a
          href={response.link}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-card border border-border text-foreground text-xs font-medium hover:border-primary/40 hover:text-primary transition-colors"
        >
          <ExternalLink size={11} />
          {response.linkLabel || "Open Page"}
        </a>
      )}
    </div>
  );
}

// ── Suggestion Chips ───────────────────────────────────────────────────

function SuggestionChips({ onSelect }: { onSelect: (q: string) => void }) {
  const suggestions = (chatbotData.suggestions as string[]) || [];
  return (
    <div className="px-3 pb-2 flex flex-wrap gap-1.5">
      {suggestions.map((s) => (
        <button
          key={s}
          onClick={() => onSelect(s)}
          className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors border border-primary/20 whitespace-nowrap"
        >
          {s}
        </button>
      ))}
    </div>
  );
}

// ── Main Widget ──────────────────────────────────────────────────────────

export function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "bot",
      response: { text: chatbotData.greeting },
      time: formatTime(),
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && !minimized) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open, minimized]);

  const sendMessage = (text?: string) => {
    const msgText = (text || input).trim();
    if (!msgText) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      response: { text: msgText },
      time: formatTime(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTyping(true);
    setShowSuggestions(false);

    // Try Python backend first; fall back to local engine if unavailable.
    const delay = 800 + Math.random() * 400;
    setTimeout(async () => {
      const apiResponse = await fetchBotResponse(msgText);
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "bot",
        response: apiResponse ?? getResponse(msgText),
        time: formatTime(),
      };
      setMessages((prev) => [...prev, botMsg]);
      setTyping(false);
    }, delay);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleSuggestion = (q: string) => {
    sendMessage(q);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col-reverse items-end gap-4">
      {/* Chat Window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.92 }}
            transition={{ duration: 0.22 }}
            className="w-80 sm:w-96 rounded-2xl overflow-hidden shadow-2xl border border-border bg-card/80 backdrop-blur-2xl flex flex-col"
            style={{ height: minimized ? "auto" : "520px" }}
          >
            {/* Header */}
            <div className="bg-primary px-4 py-3 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                  <Bot size={16} className="text-primary-foreground" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-primary-foreground">AIMS Assistant</p>
                  <p className="text-[10px] text-primary-foreground/70">Campus Navigation & Help</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                {/* Minimize toggle */}
                <button
                  onClick={() => setMinimized(!minimized)}
                  className="w-7 h-7 rounded-full bg-primary-foreground/20 flex items-center justify-center hover:bg-primary-foreground/30 transition-colors"
                  title={minimized ? "Expand" : "Minimize"}
                >
                  <ChevronDown
                    size={14}
                    className={`text-primary-foreground transition-transform ${minimized ? "rotate-180" : ""}`}
                  />
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="w-7 h-7 rounded-full bg-primary-foreground/20 flex items-center justify-center hover:bg-primary-foreground/30 transition-colors"
                >
                  <X size={14} className="text-primary-foreground" />
                </button>
              </div>
            </div>

            {/* Expandable body */}
            {!minimized && (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5 ${msg.role === "bot"
                          ? "bg-primary/15 text-primary"
                          : "bg-muted text-muted-foreground"
                          }`}
                      >
                        {msg.role === "bot" ? <Bot size={12} /> : <User size={12} />}
                      </div>
                      <div
                        className={`max-w-[82%] flex flex-col gap-0.5 ${msg.role === "user" ? "items-end" : "items-start"
                          }`}
                      >
                        {msg.role === "bot" ? (
                          <BotBubble response={msg.response} />
                        ) : (
                          <div className="px-3 py-2 rounded-2xl rounded-tr-sm bg-primary text-primary-foreground text-sm leading-relaxed">
                            {msg.response.text}
                          </div>
                        )}
                        <span className="text-[10px] text-muted-foreground px-1">{msg.time}</span>
                      </div>
                    </div>
                  ))}

                  {/* Typing indicator */}
                  {typing && (
                    <div className="flex gap-2 items-start">
                      <div className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center mt-0.5">
                        <Bot size={12} className="text-primary" />
                      </div>
                      <div className="px-3 py-2 rounded-2xl rounded-tl-sm bg-muted flex gap-1 items-center">
                        {[0, 1, 2].map((i) => (
                          <span
                            key={i}
                            className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce"
                            style={{ animationDelay: `${i * 0.15}s` }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  <div ref={bottomRef} />
                </div>

                {/* Suggestion chips */}
                {showSuggestions && messages.length <= 1 && (
                  <SuggestionChips onSelect={handleSuggestion} />
                )}

                {/* Input */}
                <div className="border-t border-border p-3 flex-shrink-0">
                  <div className="flex gap-2 items-end">
                    <input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKey}
                      placeholder="Ask about labs, faculty, cabin..."
                      className="flex-1 px-3 py-2 text-sm rounded-xl bg-muted border border-border focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
                    />
                    <button
                      onClick={() => sendMessage()}
                      disabled={!input.trim()}
                      className="w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-40 hover:shadow-md hover:shadow-primary/25 transition-all"
                    >
                      <Send size={14} />
                    </button>
                  </div>
                  <p className="text-[10px] text-muted-foreground text-center mt-2">
                    Ask for navigation help, faculty info & student services
                  </p>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB Button */}
      <motion.button
        onClick={() => { setOpen(!open); setMinimized(false); }}
        className="w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 flex items-center justify-center hover:shadow-xl hover:shadow-primary/40 transition-all relative"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
      >
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.span key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.18 }}>
              <X size={22} />
            </motion.span>
          ) : (
            <motion.span key="chat" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.18 }}>
              <MessageSquare size={22} />
            </motion.span>
          )}
        </AnimatePresence>
        {/* Pulse ring for attention */}
        {!open && (
          <span className="absolute inset-0 rounded-full bg-primary animate-ping opacity-20 pointer-events-none" />
        )}
      </motion.button>
    </div>
  );
}
