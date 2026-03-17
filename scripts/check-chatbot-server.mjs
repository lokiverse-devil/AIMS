#!/usr/bin/env node
/**
 * check-chatbot-server.mjs
 * ─────────────────────────
 * Runs before `next dev` to tell the developer whether the
 * Python FastAPI chatbot server is reachable.
 *
 * Reads NEXT_PUBLIC_API_URL from .env.local (or falls back to
 * NEXT_PUBLIC_CHATBOT_SERVER_HOST + PORT).
 */

import { readFileSync } from "fs";
import { resolve } from "path";

// ── Parse .env.local ────────────────────────────────────────────
function loadEnv() {
  const vars = {};
  try {
    const raw = readFileSync(resolve(process.cwd(), ".env.local"), "utf-8");
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const [key, ...rest] = trimmed.split("=");
      vars[key.trim()] = rest.join("=").trim();
    }
  } catch {
    // .env.local not found – that's fine
  }
  return vars;
}

// ── Ping the server ─────────────────────────────────────────────
async function checkServer(url) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    return res.ok || res.status < 500;
  } catch {
    return false;
  }
}

// ── Main ────────────────────────────────────────────────────────
const env = loadEnv();

const host = env.NEXT_PUBLIC_CHATBOT_SERVER_HOST || "127.0.0.1";
const port = env.NEXT_PUBLIC_CHATBOT_SERVER_PORT || "8000";
const apiUrl = env.NEXT_PUBLIC_API_URL || `http://${host}:${port}`;

const SEP = "─".repeat(58);
const BOLD = "\x1b[1m";
const RESET = "\x1b[0m";
const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const YELLOW = "\x1b[33m";
const CYAN = "\x1b[36m";

console.log(`\n${CYAN}${SEP}${RESET}`);
console.log(`${BOLD}  🤖  AIMS Chatbot Server Check${RESET}`);
console.log(`${CYAN}${SEP}${RESET}`);
console.log(`  Server URL : ${BOLD}${apiUrl}${RESET}`);

const alive = await checkServer(apiUrl);

if (alive) {
  console.log(`  Status     : ${GREEN}${BOLD}✔  ONLINE${RESET} — server is reachable`);
  console.log(`${CYAN}${SEP}${RESET}`);
  console.log(`  ${GREEN}Chatbot will use the Python FastAPI backend.${RESET}\n`);
} else {
  console.log(`  Status     : ${YELLOW}${BOLD}✘  OFFLINE${RESET} — server is not reachable`);
  console.log(`${CYAN}${SEP}${RESET}`);
  console.log(`  ${YELLOW}Chatbot will fall back to local JSON data.${RESET}`);
  console.log(`  ${YELLOW}To enable the server, run your FastAPI backend at:${RESET}`);
  console.log(`    ${BOLD}${apiUrl}${RESET}`);
  console.log(`  ${YELLOW}Or update .env.local with the correct IP/port.${RESET}\n`);
}
