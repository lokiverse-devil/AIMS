# ─────────────────────────────────────────────────────────────────────────────
# AIMS — Supabase Client Placeholder
# ─────────────────────────────────────────────────────────────────────────────
#
# This file is intentionally left as a placeholder.
# Supabase will be configured manually by the developer.
#
# ─── SETUP STEPS ─────────────────────────────────────────────────────────────
#
# 1. Install the Supabase Python client:
#       pip install supabase
#
# 2. Create a .env file in the /backend directory with the following variables:
#
#       SUPABASE_URL=https://<your-project-ref>.supabase.co
#       SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
#
#    IMPORTANT: Use the SERVICE ROLE key (not the anon/public key) for
#    server-side operations. Never expose this key in the frontend.
#
# 3. Uncomment and use the initialization code below:
#
# ─── INITIALIZATION (uncomment when ready) ───────────────────────────────────
#
# import os
# from supabase import create_client, Client
# from dotenv import load_dotenv
#
# load_dotenv()
#
# SUPABASE_URL: str = os.environ["SUPABASE_URL"]
# SUPABASE_SERVICE_ROLE_KEY: str = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
#
# supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
#
# ─── USAGE EXAMPLES ───────────────────────────────────────────────────────────
#
# Insert a row into the 'students' table:
#   supabase.table("students").insert({
#       "roll_no": "CSE2022001",
#       "name": "Rahul Sharma",
#       "year": "3rd Year",
#       "branch": "CSE"
#   }).execute()
#
# Insert a row into the 'unit_test_marks' table:
#   supabase.table("unit_test_marks").insert({
#       "roll_no": "CSE2022001",
#       "subject": "Data Structures",
#       "marks": 18,
#       "semester": "6th"
#   }).execute()
#
# Query marks for a student:
#   supabase.table("unit_test_marks").select("*").eq("roll_no", "CSE2022001").execute()
#
# Upload a file to Supabase Storage:
#   with open("marks_upload.csv", "rb") as f:
#       supabase.storage.from_("marks-uploads").upload("uploads/marks_upload.csv", f)
#
# ─── REQUIRED TABLE SCHEMAS ───────────────────────────────────────────────────
#
# Table: students
#   id          uuid PRIMARY KEY DEFAULT gen_random_uuid()
#   roll_no     text NOT NULL UNIQUE
#   name        text NOT NULL
#   year        text
#   branch      text
#   created_at  timestamptz DEFAULT now()
#
# Table: unit_test_marks
#   id          uuid PRIMARY KEY DEFAULT gen_random_uuid()
#   roll_no     text NOT NULL
#   subject     text NOT NULL
#   marks       integer NOT NULL
#   semester    text NOT NULL
#   uploaded_by text
#   uploaded_at timestamptz DEFAULT now()
#
# ─────────────────────────────────────────────────────────────────────────────
# Replace this entire file with the uncommented code above once Supabase
# is configured. Then import `supabase` from this module in csv_processor.py:
#
#   from supabase_client import supabase
#
# ─────────────────────────────────────────────────────────────────────────────

# Placeholder — no Supabase client initialized yet.
supabase = None
