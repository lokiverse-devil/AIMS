/**
 * AIMS — Server Startup Health Checks
 * =====================================
 * Next.js runs this file once when the server starts (Node.js runtime only).
 * It checks both Supabase and the Python backend and logs the result to the
 * server console, similar to the Python backend's own startup logs.
 *
 * Docs: https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

export async function register() {
  // Only run in the Node.js server environment, not in the edge runtime or browser.
  if (process.env.NEXT_RUNTIME !== 'nodejs') return

  const RESET  = '\x1b[0m'
  const BOLD   = '\x1b[1m'
  const GREEN  = '\x1b[32m'
  const RED    = '\x1b[31m'
  const YELLOW = '\x1b[33m'
  const CYAN   = '\x1b[36m'
  const DIM    = '\x1b[2m'

  const ok   = `${GREEN}${BOLD}✔ connected${RESET}`
  const fail = (msg: string) => `${RED}${BOLD}✘ ${msg}${RESET}`
  const warn = (msg: string) => `${YELLOW}⚠  ${msg}${RESET}`

  console.log(`\n${CYAN}${BOLD}━━━  AIMS Startup Checks  ━━━${RESET}`)

  // ── 1. Supabase ──────────────────────────────────────────────────────────────
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.log(`  ${BOLD}Supabase${RESET}         ${warn('env vars missing — set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local')}`)
  } else {
    try {
      const { createClient } = await import('@supabase/supabase-js')
      const supabase = createClient(supabaseUrl, supabaseKey)

      // Lightweight ping — query a single row from the users table.
      // PGRST116 = "no rows" which still means the connection is alive.
      const { error } = await supabase.from('users').select('id').limit(1)

      if (!error || error.code === 'PGRST116') {
        console.log(`  ${BOLD}Supabase${RESET}         ${ok}`)
      } else if (error.message.includes('relation') && error.message.includes('does not exist')) {
        console.log(`  ${BOLD}Supabase${RESET}         ${warn("connected but 'users' table not found — run supabase_run.md migrations")}`)
      } else {
        console.log(`  ${BOLD}Supabase${RESET}         ${fail(error.message)}`)
      }
    } catch (e) {
      console.log(`  ${BOLD}Supabase${RESET}         ${fail(e instanceof Error ? e.message : String(e))}`)
    }
  }

  // ── 2. Python Backend ────────────────────────────────────────────────────────
  const apiUrl = process.env.NEXT_PUBLIC_API_URL

  if (!apiUrl) {
    console.log(`  ${BOLD}Python Backend${RESET}    ${warn('env var missing — set NEXT_PUBLIC_API_URL in .env.local')}`)
  } else {
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 3000)

      const res = await fetch(`${apiUrl}/health`, { signal: controller.signal })
      clearTimeout(timeout)

      if (res.ok) {
        const json = await res.json() as { status?: string }
        console.log(`  ${BOLD}Python Backend${RESET}    ${ok} ${DIM}— ${json.status ?? 'ok'} (${apiUrl})${RESET}`)
      } else {
        console.log(`  ${BOLD}Python Backend${RESET}    ${fail(`HTTP ${res.status} from ${apiUrl}/health`)}`)
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      if (msg.includes('abort') || msg.includes('fetch') || msg.includes('ECONNREFUSED')) {
        console.log(`  ${BOLD}Python Backend${RESET}    ${warn(`not reachable at ${apiUrl} — start with: uvicorn main:app --reload`)}`)
      } else {
        console.log(`  ${BOLD}Python Backend${RESET}    ${fail(msg)}`)
      }
    }
  }

  console.log(`${CYAN}${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}\n`)
}
