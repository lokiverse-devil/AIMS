-- =============================================================
-- AIMS Dashboard Enhancements — Supabase SQL
-- Run this in Supabase Dashboard → SQL Editor
-- =============================================================

-- 1. Add missing columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS photo_url text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone text;

-- 2. Add missing columns to teachers table
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS photo_url text;

-- 3. Add missing columns to students table (if not already there)
ALTER TABLE students ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE students ADD COLUMN IF NOT EXISTS section text;
ALTER TABLE students ADD COLUMN IF NOT EXISTS photo_url text;
ALTER TABLE students ADD COLUMN IF NOT EXISTS semester text;

-- ─── STORAGE POLICIES ──────────────────────────────────────────

-- 4. Fix resources storage bucket — allow authenticated uploads
-- Go to Dashboard → Storage → resources → Policies → New Policy
-- Or run:
CREATE POLICY "Allow authenticated uploads on resources"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'resources');

CREATE POLICY "Allow authenticated reads on resources"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'resources');

-- 5. Student photos bucket policies
-- First create the bucket in Dashboard → Storage → New Bucket: "student-photos" (Public ✓)
CREATE POLICY "Allow authenticated uploads on student-photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'student-photos');

CREATE POLICY "Allow authenticated updates on student-photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'student-photos');

CREATE POLICY "Allow public reads on student-photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'student-photos');

-- 6. Teacher photos bucket policies
-- First create the bucket in Dashboard → Storage → New Bucket: "teacher-photos" (Public ✓)
CREATE POLICY "Allow authenticated uploads on teacher-photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'teacher-photos');

CREATE POLICY "Allow authenticated updates on teacher-photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'teacher-photos');

CREATE POLICY "Allow public reads on teacher-photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'teacher-photos');

-- ─── TABLE RLS POLICIES (additions) ───────────────────────────

-- 7. Allow students to read student list
CREATE POLICY "Authenticated users read students"
ON students FOR SELECT
TO authenticated
USING (true);

-- 8. Allow students to update their own row (by matching auth user → users.roll_no → students.roll_no)
CREATE POLICY "Students update own student record"
ON students FOR UPDATE
TO authenticated
USING (
  roll_no = (SELECT roll_no FROM users WHERE id = auth.uid())
);

-- 9. Teachers can update their own profile  
CREATE POLICY "Teachers update own record"
ON teachers FOR UPDATE
TO authenticated
USING (id = auth.uid());

-- 10. Allow teachers to insert students (for CSV upload)
CREATE POLICY "Teachers insert students"
ON students FOR INSERT
TO authenticated
WITH CHECK (
  (SELECT role FROM users WHERE id = auth.uid()) = 'teacher'
);
