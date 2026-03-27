-- Run this in the Supabase SQL Editor to add the email column to the students table
ALTER TABLE students ADD COLUMN IF NOT EXISTS email TEXT;
