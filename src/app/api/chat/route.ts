/**
 * AIMS Chatbot — Node.js API Route
 * ─────────────────────────────────
 * Replaces the Python FastAPI backend with a Next.js API route.
 * Uses fuzzy string matching (Levenshtein-based) to find the best FAQ match.
 *
 * POST /api/chat
 *
 * Request:  { "message": "string" }
 * Response: { "text": "string", "video_url": "string | null" }
 */

import { NextRequest, NextResponse } from "next/server";
import chatbotData from "@/lib/chatbotData.json";

// ── Types ────────────────────────────────────────────────────────────────

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

interface ChatRequest {
  message: string;
}

interface ChatResponse {
  text: string;
  video_url: string | null;
}

// ── Fuzzy Matching (Levenshtein-based token set ratio) ───────────────────

function levenshtein(a: string, b: string): number {
  const an = a.length;
  const bn = b.length;
  const matrix: number[][] = [];

  for (let i = 0; i <= an; i++) matrix[i] = [i];
  for (let j = 0; j <= bn; j++) matrix[0][j] = j;

  for (let i = 1; i <= an; i++) {
    for (let j = 1; j <= bn; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  return matrix[an][bn];
}

/**
 * Token-set ratio: tokenize both strings, compute intersection + remainder,
 * then compare sorted token strings. Returns 0–100 score.
 */
function tokenSetRatio(a: string, b: string): number {
  const tokensA = new Set(a.toLowerCase().trim().split(/\s+/).filter(Boolean));
  const tokensB = new Set(b.toLowerCase().trim().split(/\s+/).filter(Boolean));

  const intersection = new Set([...tokensA].filter((t) => tokensB.has(t)));
  const diffA = new Set([...tokensA].filter((t) => !tokensB.has(t)));
  const diffB = new Set([...tokensB].filter((t) => !tokensA.has(t)));

  const sorted = [...intersection].sort().join(" ");
  const sortedA = sorted + " " + [...diffA].sort().join(" ");
  const sortedB = sorted + " " + [...diffB].sort().join(" ");

  const t0t1 = ratio(sorted.trim(), sortedA.trim());
  const t0t2 = ratio(sorted.trim(), sortedB.trim());
  const t1t2 = ratio(sortedA.trim(), sortedB.trim());

  return Math.max(t0t1, t0t2, t1t2);
}

function ratio(a: string, b: string): number {
  if (a.length === 0 && b.length === 0) return 100;
  const dist = levenshtein(a, b);
  const maxLen = Math.max(a.length, b.length);
  return ((1 - dist / maxLen) * 100);
}

/**
 * Partial ratio: slides the shorter string across the longer one,
 * returning the best substring match ratio.
 */
function partialRatio(a: string, b: string): number {
  const short = a.length <= b.length ? a : b;
  const long = a.length <= b.length ? b : a;

  if (short.length === 0) return 0;

  let best = 0;
  for (let i = 0; i <= long.length - short.length; i++) {
    const sub = long.substring(i, i + short.length);
    const score = ratio(short, sub);
    if (score > best) best = score;
  }
  return best;
}

// ── Score a single FAQ ───────────────────────────────────────────────────

const MATCH_THRESHOLD = 60;

const FAQS = (chatbotData.faqs as FaqEntry[]) || [];
const DEFAULT_RESPONSE =
  chatbotData.defaultResponse ||
  "I'm sorry, I do not have that information in my available data.";

const SUPABASE_VIDEO_BASE =
  "https://rvamuonqnsbnqdgpskir.supabase.co/storage/v1/object/public/guide-videos";

function scoreFaq(userInput: string, faq: FaqEntry): number {
  let best = 0;
  const lower = userInput.toLowerCase().trim();

  for (const keyword of faq.keywords) {
    const score = tokenSetRatio(lower, keyword.toLowerCase());
    if (score > best) best = score;
  }

  const questionScore = partialRatio(lower, (faq.question || "").toLowerCase());
  if (questionScore > best) best = questionScore;

  return best;
}

function getBotResponse(message: string): ChatResponse {
  if (!message || !message.trim()) {
    return {
      text: DEFAULT_RESPONSE,
      video_url: null,
    };
  }

  let bestScore = 0;
  let bestFaq: FaqEntry | null = null;

  for (const faq of FAQS) {
    const score = scoreFaq(message, faq);
    if (score > bestScore) {
      bestScore = score;
      bestFaq = faq;
    }
  }

  if (bestFaq && bestScore >= MATCH_THRESHOLD) {
    const videoFile = bestFaq.video || null;
    return {
      text: bestFaq.answer || DEFAULT_RESPONSE,
      video_url: videoFile ? `${SUPABASE_VIDEO_BASE}/${videoFile}` : null,
    };
  }

  return {
    text: DEFAULT_RESPONSE,
    video_url: null,
  };
}

// ── Route Handler ────────────────────────────────────────────────────────

const FALLBACK_RESPONSE: ChatResponse = {
  text: "I'm sorry, I do not have that information in my available data.",
  video_url: null,
};

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();

    if (!body.message || typeof body.message !== "string" || !body.message.trim()) {
      return NextResponse.json(FALLBACK_RESPONSE, { status: 400 });
    }

    const result = getBotResponse(body.message);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(FALLBACK_RESPONSE, { status: 500 });
  }
}
