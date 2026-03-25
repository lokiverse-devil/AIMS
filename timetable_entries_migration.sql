-- AIMS — Timetable Entries Table Migration (updated: adds teacher_name)
-- Run this in the Supabase SQL editor ONCE.
-- If you already ran the previous version, use the ALTER statement below instead.

-- ─── Option A: Fresh install (table doesn't exist yet) ────────────
CREATE TABLE IF NOT EXISTS timetable_entries (
  id           UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id   UUID        REFERENCES auth.users(id) ON DELETE CASCADE,
  teacher_name TEXT        DEFAULT '',           -- stored name for student view
  branch       TEXT        NOT NULL,             -- "CSE" | "IT" | "ELEX" ...
  year         TEXT        NOT NULL,             -- "1st Year" | "2nd Year" | "3rd Year"
  day_of_week  TEXT        NOT NULL,             -- "Monday" ... "Friday"
  start_time   TEXT        NOT NULL,             -- "09:00"
  end_time     TEXT        NOT NULL,             -- "10:00"
  subject      TEXT        NOT NULL,
  room         TEXT        DEFAULT '',
  class_name   TEXT        DEFAULT '',           -- "CSE 3A"
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE timetable_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Teachers manage own timetable entries"
  ON timetable_entries FOR ALL
  USING (auth.uid() = teacher_id);

CREATE POLICY IF NOT EXISTS "Anyone can read timetable entries"
  ON timetable_entries FOR SELECT USING (true);

CREATE INDEX IF NOT EXISTS idx_timetable_teacher ON timetable_entries (teacher_id);
CREATE INDEX IF NOT EXISTS idx_timetable_class   ON timetable_entries (branch, year);

-- ─── Option B: Table already exists — just add teacher_name column ─
-- ALTER TABLE timetable_entries ADD COLUMN IF NOT EXISTS teacher_name TEXT DEFAULT '';
