"""
AIMS — Supabase Client (Backend / Python)
==========================================
Uses the SERVICE ROLE key for server-side operations (bypasses RLS).
Do NOT use the service role key in the frontend.

Setup:
  1. pip install supabase python-dotenv
  2. Create backend/.env with:
       SUPABASE_URL=https://<project-ref>.supabase.co
       SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
"""

import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL: str = os.environ.get("SUPABASE_URL", "")
SUPABASE_SERVICE_ROLE_KEY: str = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    raise EnvironmentError(
        "Missing environment variables. "
        "Create backend/.env with SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
    )

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
