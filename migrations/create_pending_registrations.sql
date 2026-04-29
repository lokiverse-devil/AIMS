-- Migration: Create pending_registrations table
-- This table stores student data uploaded via CSV by teachers,
-- representing students whose registration is still pending.

CREATE TABLE IF NOT EXISTS public.pending_registrations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  roll_no text NOT NULL,
  name text NOT NULL,
  semester text NOT NULL,
  branch text NOT NULL,
  uploaded_by uuid,
  uploaded_at timestamp with time zone DEFAULT now(),
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT pending_registrations_pkey PRIMARY KEY (id),
  CONSTRAINT pending_registrations_roll_no_key UNIQUE (roll_no)
);

-- Enable RLS
ALTER TABLE public.pending_registrations ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to read all pending registrations
CREATE POLICY "Anyone can read pending_registrations"
  ON public.pending_registrations
  FOR SELECT
  USING (true);

-- Policy: Allow authenticated users (teachers) to insert pending registrations
CREATE POLICY "Authenticated users can insert pending_registrations"
  ON public.pending_registrations
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Policy: Allow authenticated users to update pending registrations
CREATE POLICY "Authenticated users can update pending_registrations"
  ON public.pending_registrations
  FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Policy: Allow authenticated users to delete pending registrations
CREATE POLICY "Authenticated users can delete pending_registrations"
  ON public.pending_registrations
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_pending_registrations_status
  ON public.pending_registrations (status);

CREATE INDEX IF NOT EXISTS idx_pending_registrations_branch
  ON public.pending_registrations (branch);

CREATE INDEX IF NOT EXISTS idx_pending_registrations_semester
  ON public.pending_registrations (semester);
