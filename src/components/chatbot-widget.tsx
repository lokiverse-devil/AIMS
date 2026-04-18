"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, Bot, User, Play, ExternalLink, ChevronDown, Film, MapPin, RefreshCcw } from "lucide-react";
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

  let bestMatch: FaqEntry | null = null;
  let maxScore = 0;

  // Find the match with the longest matching keyword (highest specificity)
  for (const faq of faqs) {
    for (const kw of faq.keywords) {
      if (lower.includes(kw.toLowerCase())) {
        if (kw.length > maxScore) {
          maxScore = kw.length;
          bestMatch = faq;
        }
      }
    }
  }

  if (bestMatch) {
    return {
      text: bestMatch.answer,
      video: bestMatch.video,
      videoLabel: bestMatch.videoLabel,
      link: bestMatch.link,
      linkLabel: bestMatch.linkLabel,
    };
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
  const videoRef = useRef<HTMLVideoElement>(null);

  // Replace these placeholder filenames with actual Supabase Storage URLs when available
  const supabaseBaseUrl = "https://rvamuonqnsbnqdgpskir.supabase.co/storage/v1/object/public/guide-videos"; // e.g. https://xxxx.supabase.co/storage/v1/object/public/guide-videos
  const videoSrc = supabaseBaseUrl && response.video
    ? `${supabaseBaseUrl}/${response.video}`
    : null;

  return (
    <div className="flex flex-col gap-2 relative z-10 w-full max-w-[90%]">
      {/* Text answer */}
      <div className="px-4 py-3 rounded-3xl rounded-tl-sm aims-glass-card bg-primary/5 text-foreground text-[13px] font-medium leading-relaxed border-primary/10 shadow-sm relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent dark:from-white/5 pointer-events-none" />
        {response.text}
      </div>

      {/* Navigation video card */}
      {response.video && (
        <div className="rounded-[1.5rem] overflow-hidden aims-glass-card bg-card/50 shadow-sm relative group/vid">
          {/* Card header — clickable toggle */}
          <button
            onClick={() => {
              setVideoOpen(!videoOpen);
              if (videoOpen && videoRef.current) videoRef.current.pause();
            }}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-all"
          >
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover/vid:bg-primary/20 transition-colors shadow-inner border border-primary/10">
              {videoOpen ? <ChevronDown size={14} className="text-primary drop-shadow-sm" /> : <Film size={14} className="text-primary drop-shadow-sm" />}
            </div>
            <div className="flex-1 text-left">
              <p className="text-xs font-semibold text-primary leading-tight">
                {response.videoLabel || "Watch Navigation Video"}
              </p>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-0.5">
                {videoOpen ? "Click to collapse" : "Campus Navigation Step-by-Step"}
              </p>
            </div>
            <Play size={12} className={`text-primary transition-transform flex-shrink-0 ${videoOpen ? "opacity-0" : "opacity-70"}`} />
          </button>

          {/* Video player */}
          <AnimatePresence>
            {videoOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="p-3 pb-4 bg-muted/10 border-t border-border/30">
                  {videoSrc ? (
                    <div className="space-y-3">
                      <div className="relative rounded-2xl overflow-hidden shadow-md border border-white/10 bg-black">
                        <video
                          ref={videoRef}
                          src={videoSrc}
                          controls
                          className="w-full aspect-video object-contain"
                        />
                      </div>
                      <div className="flex flex-col items-center gap-2">
                        <a 
                          href={videoSrc} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-foreground text-background text-[11px] font-bold hover:shadow-lg hover:-translate-y-0.5 transition-all w-full justify-center"
                        >
                          <ExternalLink size={12} />
                          Open Video in New Tab
                        </a>
                        <p className="text-[9px] text-muted-foreground italic">
                          Use the button above if the video fails to load in the chat bubble.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full aspect-video rounded-xl bg-gradient-to-br from-primary/10 via-muted to-primary/5 flex flex-col items-center justify-center border border-border/30 gap-2">
                      <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center">
                        <MapPin size={18} className="text-primary" />
                      </div>
                      <p className="text-xs font-semibold text-foreground">Navigation Video</p>
                      <p className="text-[10px] text-muted-foreground text-center px-4 leading-relaxed">
                        Video will be available once uploaded to the storage bucket.
                      </p>
                      <code className="text-[9px] bg-muted px-2 py-0.5 rounded font-mono text-muted-foreground border border-border/50">
                        {response.video}
                      </code>
                    </div>
                  )}
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
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl aims-glass-card border-border/50 text-foreground text-[11px] font-bold uppercase tracking-wider hover:border-primary/50 hover:text-primary hover:bg-primary/5 transition-all group w-fit shadow-sm mt-1"
        >
          <ExternalLink size={12} className="group-hover:scale-110 transition-transform text-primary" />
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
          className="px-3.5 py-1.5 rounded-2xl text-[11px] font-bold bg-card border border-border/60 text-foreground hover:bg-foreground hover:text-background transition-all shadow-sm whitespace-nowrap"
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

  const resetChat = () => {
    setMessages([
      {
        id: "welcome-" + Date.now(),
        role: "bot",
        response: { text: chatbotData.greeting },
        time: formatTime(),
      },
    ]);
    setShowSuggestions(true);
    setInput("");
  };

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
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Window – absolutely positioned above the FAB */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.92 }}
            transition={{ duration: 0.22 }}
            className="fixed bottom-24 right-6 w-[22rem] sm:w-[24rem] bg-white dark:bg-zinc-950 rounded-[2.5rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex flex-col border border-border/80 z-50 transition-all duration-300"
            style={{ 
              height: minimized ? "80px" : "600px",
              maxHeight: "calc(100vh - 120px)"
            }}
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent/5 rounded-full blur-2xl -ml-16 -mb-16 pointer-events-none" />

            {/* Header */}
            <div className="px-6 py-5 flex items-center justify-between flex-shrink-0 border-b border-border bg-muted/20 relative z-10 transition-colors">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                  <Bot size={22} className="text-white" />
                </div>
                <div>
                  <p className="text-base font-bold text-foreground leading-tight">AIMS Assistant</p>
                  <p className="text-[10px] font-bold tracking-widest uppercase text-primary">Infrastructure Support</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* NEW CHAT BUTTON */}
                <button
                  onClick={resetChat}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all duration-300 font-bold text-[11px] uppercase tracking-wider"
                >
                  <RefreshCcw size={14} />
                  <span>Restart</span>
                </button>
                {/* Minimize toggle */}
                <button
                  onClick={() => setMinimized(!minimized)}
                  className="w-10 h-10 rounded-xl hover:bg-muted font-bold flex items-center justify-center transition-colors border border-border/50"
                  title={minimized ? "Expand" : "Minimize"}
                >
                  <ChevronDown
                    size={20}
                    className={`text-foreground transition-transform ${minimized ? "rotate-180" : ""}`}
                  />
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="w-8 h-8 rounded-[10px] hover:bg-muted/40 aims-glass-card border-none shadow-none flex items-center justify-center transition-colors"
                >
                  <X size={14} className="text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* Expandable body */}
            {!minimized && (
              <div className="flex-1 min-h-0 flex flex-col">
                {/* Messages Container */}
                <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-5 space-y-4 relative z-10 scrollbar-thin scrollbar-thumb-primary/10 hover:scrollbar-thumb-primary/20">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                    >
                      <div
                        className={`w-8 h-8 rounded-[12px] flex-shrink-0 flex items-center justify-center shadow-inner aims-glass-card ${msg.role === "bot"
                          ? "bg-primary/5 border-primary/20 text-primary"
                          : "bg-muted/50 border-border text-muted-foreground"
                          }`}
                      >
                        {msg.role === "bot" ? <Bot size={14} className="drop-shadow-sm" /> : <User size={14} />}
                      </div>
                      <div
                        className={`max-w-[78%] flex flex-col gap-1 mt-1 ${msg.role === "user" ? "items-end" : "items-start"
                          }`}
                      >
                        {msg.role === "bot" ? (
                          <BotBubble response={msg.response} />
                        ) : (
                          <div className="px-4 py-3 rounded-3xl rounded-tr-sm bg-foreground text-background text-[13px] font-medium leading-relaxed shadow-sm">
                            {msg.response.text}
                          </div>
                        )}
                        <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground px-1">{msg.time}</span>
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
                  <div className="flex-shrink-0">
                    <SuggestionChips onSelect={handleSuggestion} />
                  </div>
                )}

                {/* Input */}
                <div className="border-t border-border/30 p-4 bg-muted/10 backdrop-blur-md flex-shrink-0 relative z-10">
                  <div className="flex gap-2.5 items-end">
                    <input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKey}
                      placeholder="Ask for navigation or info..."
                      className="flex-1 px-4 py-3 text-sm rounded-[1rem] bg-card/50 backdrop-blur-md aims-glass-card border focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all shadow-inner"
                    />
                    <button
                      onClick={() => sendMessage()}
                      disabled={!input.trim()}
                      className="w-12 h-12 rounded-[1rem] bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-40 hover:shadow-xl hover:shadow-primary/25 hover:-translate-y-0.5 transition-all flex-shrink-0"
                    >
                      <Send size={16} className="drop-shadow-sm ml-0.5" />
                    </button>
                  </div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground text-center mt-3 opacity-70">
                    Ask for navigation help, faculty info & student services
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB Highlight Bubble */}
      <AnimatePresence>
        {!open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.8 }}
            className="absolute bottom-20 right-0 mb-2 w-48 sm:w-[15rem]"
          >
            <div className="relative aims-glass-card shadow-2xl p-4 rounded-[1.5rem] border border-border/50 text-center bg-card/60 backdrop-blur-2xl">
              <p className="text-[11px] font-bold leading-relaxed text-foreground">
                Watch <span className="text-primary italic">IT Block Navigation</span> videos or ask about Campus Services!
              </p>
              {/* Triangle pointer */}
              <div className="absolute -bottom-2 right-6 w-4 h-4 bg-card/60 border-r border-b border-border/50 rotate-45 backdrop-blur-2xl" />
              
              {/* Pulse effect on bubble */}
              <motion.div 
                animate={{ opacity: [0.1, 0.2, 0.1], scale: [1, 1.02, 1] }}
                transition={{ repeat: Infinity, duration: 3 }}
                className="absolute inset-0 rounded-[1.5rem] bg-primary pointer-events-none"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB Button */}
      <motion.button
        onClick={() => { setOpen(!open); setMinimized(false); }}
        className="w-16 h-16 rounded-[1.25rem] bg-foreground text-background shadow-2xl shadow-black/30 dark:shadow-white/10 flex items-center justify-center hover:scale-105 transition-all relative border border-white/10 dark:border-white/5 z-50 group"
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
