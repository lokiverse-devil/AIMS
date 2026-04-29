"use client";

/**
 * BotpressChat — Botpress Webchat Integration (v3.6)
 * ────────────────────────────────────────────────────
 * Embeds the Botpress webchat widget using the inject.js v3.6 script,
 * themed to match the AIMS visionOS-inspired spatial design system.
 *
 * Config extracted from:
 *   https://files.bpcontent.cloud/2026/02/20/15/20260220154443-QFNTQ1VM.json
 *
 * Architecture:
 *   Website → Botpress Webchat → Botpress Cloud (flow) → POST /api/chat → JSON → Render
 *
 * Botpress handles ONLY the UI relay. All business logic lives in the
 * Next.js API route (/api/chat).
 */

import { useEffect, useRef } from "react";
import Script from "next/script";
import { useTheme } from "next-themes";

// ── Credentials from .env.local ──────────────────────────────────────────

const CLIENT_ID = process.env.NEXT_PUBLIC_BOTPRESS_CLIENT_ID ?? "";
const BOT_ID = process.env.NEXT_PUBLIC_BOTPRESS_BOT_ID ?? "";

// ── Custom CSS to match AIMS spatial theme ───────────────────────────────

const AIMS_THEME_CSS = `
  /* ============================================================
     AIMS Botpress Webchat Theme Override
     visionOS-inspired spatial design system
     ============================================================ */

  /* FAB Button — match existing chatbot FAB */
  .bpFab {
    width: 64px !important;
    height: 64px !important;
    border-radius: 1.25rem !important;
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3) !important;
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1) !important;
  }
  .bpFab:hover {
    transform: scale(1.05) !important;
  }

  /* Chat Container — glass card styling */
  .bpWebchatContainer,
  .bpModalContainer {
    border-radius: 2rem !important;
    overflow: hidden !important;
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3) !important;
    border: 1px solid rgba(255, 255, 255, 0.06) !important;
  }

  /* Header — glass effect */
  .bpHeaderContainer {
    border-radius: 0 !important;
    backdrop-filter: blur(28px) saturate(160%) !important;
    -webkit-backdrop-filter: blur(28px) saturate(160%) !important;
  }
  .bpHeaderContentTitle {
    font-weight: 700 !important;
    font-size: 15px !important;
    letter-spacing: -0.01em !important;
  }
  .bpHeaderContentSubtitle {
    font-size: 9px !important;
    font-weight: 700 !important;
    letter-spacing: 0.2em !important;
    text-transform: uppercase !important;
  }

  /* Message Bubbles */
  .bpMessageBubble {
    border-radius: 1.5rem !important;
    font-size: 13px !important;
    font-weight: 500 !important;
    line-height: 1.6 !important;
    padding: 12px 16px !important;
  }
  .bpBotMessage .bpMessageBubble {
    border-top-left-radius: 0.25rem !important;
  }
  .bpUserMessage .bpMessageBubble {
    border-top-right-radius: 0.25rem !important;
  }

  /* Composer / Input */
  .bpComposerInput {
    border-radius: 1rem !important;
    font-size: 14px !important;
    font-weight: 500 !important;
  }
  .bpComposerSendButton {
    border-radius: 1rem !important;
    width: 48px !important;
    height: 48px !important;
  }

  /* Scrollbar */
  .bpMessageList::-webkit-scrollbar {
    width: 5px !important;
  }
  .bpMessageList::-webkit-scrollbar-track {
    background: transparent !important;
  }
  .bpMessageList::-webkit-scrollbar-thumb {
    border-radius: 999px !important;
    opacity: 0.3 !important;
  }

  /* Timestamps */
  .bpTimestamp {
    font-size: 9px !important;
    font-weight: 700 !important;
    text-transform: uppercase !important;
    letter-spacing: 0.1em !important;
  }

  /* Avatar */
  .bpBotAvatar {
    border-radius: 0.75rem !important;
  }
`;

// ── Component ────────────────────────────────────────────────────────────

export function BotpressChat() {
  const { resolvedTheme } = useTheme();
  const initializedRef = useRef(false);

  const isDark = resolvedTheme === "dark";

  // AIMS primary color mapped to both modes
  //   Light: oklch(0.35 0.05 250) ≈ #3B4470
  //   Dark:  oklch(0.75 0.04 250) ≈ #A8B0D8
  const primaryColor = isDark ? "#A8B0D8" : "#3B4470";

  const doInit = () => {
    if (typeof window === "undefined") return false;
    const bp = (window as any).botpress;
    if (!bp) return false;
    if (initializedRef.current) return true;

    initializedRef.current = true;
    bp.init({
      botId: BOT_ID,
      clientId: CLIENT_ID,
      configuration: {
        // Preserve the bot's existing identity
        botName: "AIMS Assistant",
        botAvatar:
          "https://files.bpcontent.cloud/2026/02/20/17/20260220171634-7H33XJXX.svg",
        botDescription: "Infrastructure Support",
        composerPlaceholder: "Ask about IT-Block navigation or services...",

        // Theme — match AIMS design system
        color: primaryColor,
        themeMode: isDark ? "dark" : "light",
        variant: "soft",
        headerVariant: "glass",
        fontFamily: "inter",
        radius: 2,

        // Behaviour
        feedbackEnabled: false,
        soundEnabled: false,
        conversationHistory: false,
        footer: "",

        // Custom CSS injection
        additionalStylesheet: AIMS_THEME_CSS,
      },
    });
    return true;
  };

  // Initialize once script is loaded
  useEffect(() => {
    if (!CLIENT_ID && !BOT_ID) return;

    // Poll until window.botpress appears (script lazy-loads)
    const id = setInterval(() => {
      if (doInit()) clearInterval(id);
    }, 150);

    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Dynamic theme switching
  useEffect(() => {
    if (!initializedRef.current || typeof window === "undefined") return;
    const bp = (window as any).botpress;
    if (bp?.config) {
      bp.config({
        configuration: {
          color: primaryColor,
          themeMode: isDark ? "dark" : "light",
        },
      });
    }
  }, [isDark, primaryColor]);

  // No credentials → render nothing (fallback widget will show)
  if (!CLIENT_ID && !BOT_ID) return null;

  return (
    <Script
      src="https://cdn.botpress.cloud/webchat/v3.6/inject.js"
      strategy="lazyOnload"
    />
  );
}
