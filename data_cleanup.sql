-- =============================================================
-- AIMS Data Cleanup — Semester Normalization
-- Run this in Supabase Dashboard → SQL Editor
-- =============================================================

-- We are moving to purely numeric string semesters ("1", "2", "3", "4", "5", "6")
-- This script safely cleans up existing text-based semester and year values.

-- 1. Normalize `users` table
UPDATE users SET semester = '1' WHERE semester ILIKE '1st%';
UPDATE users SET semester = '2' WHERE semester ILIKE '2nd%';
UPDATE users SET semester = '3' WHERE semester ILIKE '3rd%';
UPDATE users SET semester = '4' WHERE semester ILIKE '4th%';
UPDATE users SET semester = '5' WHERE semester ILIKE '5th%';
UPDATE users SET semester = '6' WHERE semester ILIKE '6th%';

-- 2. Normalize `students` table (copying over 'year' values to 'semester' if applicable, or cleaning up 'semester')
-- If your students table has 'year' like '1st Year', this makes a best-guess mapping:
UPDATE students SET semester = '1' WHERE year ILIKE '1st Year' AND semester IS NULL;
UPDATE students SET semester = '3' WHERE year ILIKE '2nd Year' AND semester IS NULL;
UPDATE students SET semester = '5' WHERE year ILIKE '3rd Year' AND semester IS NULL;

-- Normalize any existing semester values in students
UPDATE students SET semester = '1' WHERE semester ILIKE '1st%';
UPDATE students SET semester = '2' WHERE semester ILIKE '2nd%';
UPDATE students SET semester = '3' WHERE semester ILIKE '3rd%';
UPDATE students SET semester = '4' WHERE semester ILIKE '4th%';
UPDATE students SET semester = '5' WHERE semester ILIKE '5th%';
UPDATE students SET semester = '6' WHERE semester ILIKE '6th%';

-- 3. Normalize `unit_test_marks`
UPDATE unit_test_marks SET semester = '1' WHERE semester ILIKE '1st%';
UPDATE unit_test_marks SET semester = '2' WHERE semester ILIKE '2nd%';
UPDATE unit_test_marks SET semester = '3' WHERE semester ILIKE '3rd%';
UPDATE unit_test_marks SET semester = '4' WHERE semester ILIKE '4th%';
UPDATE unit_test_marks SET semester = '5' WHERE semester ILIKE '5th%';
UPDATE unit_test_marks SET semester = '6' WHERE semester ILIKE '6th%';

-- 4. Normalize `resources`
UPDATE resources SET semester = '1' WHERE semester ILIKE '1st%';
UPDATE resources SET semester = '2' WHERE semester ILIKE '2nd%';
UPDATE resources SET semester = '3' WHERE semester ILIKE '3rd%';
UPDATE resources SET semester = '4' WHERE semester ILIKE '4th%';
UPDATE resources SET semester = '5' WHERE semester ILIKE '5th%';
UPDATE resources SET semester = '6' WHERE semester ILIKE '6th%';

-- 5. Add structured targeting columns to `notices`
ALTER TABLE notices ADD COLUMN IF NOT EXISTS target_branch text;
ALTER TABLE notices ADD COLUMN IF NOT EXISTS target_type text;
ALTER TABLE notices ADD COLUMN IF NOT EXISTS target_value text;

-- Best-effort migration of existing unstructured 'audience' to structured columns
UPDATE notices SET target_branch = 'All', target_type = 'All', target_value = 'All' 
WHERE audience ILIKE '%All%' OR audience ILIKE '%General%';

-- After running this, existing features using the new structure will work properly.
