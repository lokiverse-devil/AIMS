-- Run this directly in Supabase SQL Editor to fix student signups!

-- 1. Give users permission to insert into 'students' matching their auth.uid()
CREATE POLICY "Students insert own record" 
  ON students FOR INSERT 
  WITH CHECK (id = auth.uid());
