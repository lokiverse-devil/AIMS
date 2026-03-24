# AIMS — Supabase Migration Queries

These are **update-only** queries. They assume the following tables already exist:
`notices`, `students`, `tickets`, `unit_test_marks`, `users`

Run each block in **Supabase → SQL Editor** in order.

---

## Step 1 — Add Missing Columns to Existing Tables

```sql
-- students: add phone, section, photo_url
ALTER TABLE students
  ADD COLUMN IF NOT EXISTS phone     text,
  ADD COLUMN IF NOT EXISTS section   text,
  ADD COLUMN IF NOT EXISTS photo_url text;

-- users: add name, department, semester, subjects
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS name       text,
  ADD COLUMN IF NOT EXISTS department text,
  ADD COLUMN IF NOT EXISTS semester   text,
  ADD COLUMN IF NOT EXISTS subjects   text[];

-- tickets: add student_roll_no, description, updated_at
ALTER TABLE tickets
  ADD COLUMN IF NOT EXISTS student_roll_no text,
  ADD COLUMN IF NOT EXISTS description     text,
  ADD COLUMN IF NOT EXISTS updated_at      timestamptz;

-- unit_test_marks: add test_name, max_marks
ALTER TABLE unit_test_marks
  ADD COLUMN IF NOT EXISTS test_name text,
  ADD COLUMN IF NOT EXISTS max_marks integer DEFAULT 20;
```

---

## Step 2 — Create New Tables

```sql
-- teachers
CREATE TABLE IF NOT EXISTS teachers (
  id             uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name           text NOT NULL,
  department     text NOT NULL,
  subjects       text[],
  email          text NOT NULL,
  designation    text,
  video_filename text,
  created_at     timestamptz DEFAULT now()
);

-- teacher_keys (one-time signup codes)
CREATE TABLE IF NOT EXISTS teacher_keys (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key        text NOT NULL UNIQUE,
  used       boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- resources
CREATE TABLE IF NOT EXISTS resources (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title       text NOT NULL,
  subject     text NOT NULL,
  semester    text,
  department  text,
  file_url    text NOT NULL,
  type        text,
  size        text,
  uploaded_by uuid REFERENCES users(id),
  created_at  timestamptz DEFAULT now()
);

-- timetables
CREATE TABLE IF NOT EXISTS timetables (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  branch      text NOT NULL,
  year        text NOT NULL,
  type        text CHECK (type IN ('class', 'lab')),
  file_url    text NOT NULL,
  uploaded_at timestamptz DEFAULT now()
);

-- labs
CREATE TABLE IF NOT EXISTS labs (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text NOT NULL,
  floor      text,
  seats      integer,
  department text,
  available  boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- lab_bookings
CREATE TABLE IF NOT EXISTS lab_bookings (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lab_id     uuid REFERENCES labs(id),
  booked_by  uuid REFERENCES users(id),
  date       date NOT NULL,
  start_time time,
  end_time   time,
  purpose    text,
  status     text DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected')),
  created_at timestamptz DEFAULT now()
);
```

---

## Step 3 — Seed Teacher Access Keys

Replace key values with your own secret codes before running.

```sql
INSERT INTO teacher_keys (key) VALUES
  ('AIMS-TEACH-001'),
  ('AIMS-TEACH-002'),
  ('AIMS-TEACH-003'),
  ('AIMS-TEACH-004'),
  ('AIMS-TEACH-005');
```

---

## Step 4 — Enable RLS on New Tables

(Existing tables already have RLS enabled from your previous setup.)

```sql
ALTER TABLE teachers       ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_keys   ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources      ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetables     ENABLE ROW LEVEL SECURITY;
ALTER TABLE labs           ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_bookings   ENABLE ROW LEVEL SECURITY;
```

---

## Step 5 — RLS Policies

> All policies are dropped first so this block is safe to re-run even if some policies already exist.

### For existing tables

```sql
-- ── users ─────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Users read own profile"   ON users;
DROP POLICY IF EXISTS "Users update own profile" ON users;
DROP POLICY IF EXISTS "Users insert own profile" ON users;

CREATE POLICY "Users read own profile"
  ON users FOR SELECT USING (id = auth.uid());
CREATE POLICY "Users update own profile"
  ON users FOR UPDATE USING (id = auth.uid());
CREATE POLICY "Users insert own profile"
  ON users FOR INSERT WITH CHECK (id = auth.uid());

-- ── students ──────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Students read own record"  ON students;
DROP POLICY IF EXISTS "Teachers read all students" ON students;
DROP POLICY IF EXISTS "Teachers upsert students"  ON students;
DROP POLICY IF EXISTS "Teachers update students"  ON students;

CREATE POLICY "Students read own record"
  ON students FOR SELECT
  USING (roll_no = (SELECT roll_no FROM users WHERE id = auth.uid()));
CREATE POLICY "Teachers read all students"
  ON students FOR SELECT
  USING ((SELECT role FROM users WHERE id = auth.uid()) IN ('teacher', 'admin'));
CREATE POLICY "Teachers upsert students"
  ON students FOR INSERT
  WITH CHECK ((SELECT role FROM users WHERE id = auth.uid()) IN ('teacher', 'admin'));
CREATE POLICY "Teachers update students"
  ON students FOR UPDATE
  USING ((SELECT role FROM users WHERE id = auth.uid()) IN ('teacher', 'admin'));

-- ── unit_test_marks ───────────────────────────────────────────────
DROP POLICY IF EXISTS "Students see own marks"  ON unit_test_marks;
DROP POLICY IF EXISTS "Teachers see all marks"  ON unit_test_marks;
DROP POLICY IF EXISTS "Teachers insert marks"   ON unit_test_marks;
DROP POLICY IF EXISTS "Teachers update marks"   ON unit_test_marks;

CREATE POLICY "Students see own marks"
  ON unit_test_marks FOR SELECT
  USING (roll_no = (SELECT roll_no FROM users WHERE id = auth.uid()));
CREATE POLICY "Teachers see all marks"
  ON unit_test_marks FOR SELECT
  USING ((SELECT role FROM users WHERE id = auth.uid()) IN ('teacher', 'admin'));
CREATE POLICY "Teachers insert marks"
  ON unit_test_marks FOR INSERT
  WITH CHECK ((SELECT role FROM users WHERE id = auth.uid()) IN ('teacher', 'admin'));
CREATE POLICY "Teachers update marks"
  ON unit_test_marks FOR UPDATE
  USING ((SELECT role FROM users WHERE id = auth.uid()) IN ('teacher', 'admin'));

-- ── notices ───────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Anyone reads notices"        ON notices;
DROP POLICY IF EXISTS "Teachers post notices"       ON notices;
DROP POLICY IF EXISTS "Teachers delete own notices" ON notices;

CREATE POLICY "Anyone reads notices"
  ON notices FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Teachers post notices"
  ON notices FOR INSERT
  WITH CHECK ((SELECT role FROM users WHERE id = auth.uid()) IN ('teacher', 'admin'));
CREATE POLICY "Teachers delete own notices"
  ON notices FOR DELETE USING (posted_by = auth.uid());

-- ── tickets ───────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Students see own tickets"          ON tickets;
DROP POLICY IF EXISTS "Teachers see all tickets"          ON tickets;
DROP POLICY IF EXISTS "Students create tickets"           ON tickets;
DROP POLICY IF EXISTS "Students and teachers update tickets" ON tickets;

CREATE POLICY "Students see own tickets"
  ON tickets FOR SELECT USING (student_id = auth.uid());
CREATE POLICY "Teachers see all tickets"
  ON tickets FOR SELECT
  USING ((SELECT role FROM users WHERE id = auth.uid()) IN ('teacher', 'admin'));
CREATE POLICY "Students create tickets"
  ON tickets FOR INSERT WITH CHECK (student_id = auth.uid());
CREATE POLICY "Students and teachers update tickets"
  ON tickets FOR UPDATE
  USING (
    student_id = auth.uid()
    OR (SELECT role FROM users WHERE id = auth.uid()) IN ('teacher', 'admin')
  );
```

### For new tables

```sql
-- teachers
CREATE POLICY "Anyone reads teachers"
  ON teachers FOR SELECT USING (true);
CREATE POLICY "Teacher inserts own record"
  ON teachers FOR INSERT WITH CHECK (id = auth.uid());
CREATE POLICY "Teacher updates own record"
  ON teachers FOR UPDATE USING (id = auth.uid());

-- teacher_keys
CREATE POLICY "Anyone can validate a key"
  ON teacher_keys FOR SELECT USING (true);
CREATE POLICY "Admins manage keys"
  ON teacher_keys FOR ALL
  USING ((SELECT role FROM users WHERE id = auth.uid()) = 'admin');

-- resources
CREATE POLICY "Authenticated users read resources"
  ON resources FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Teachers upload resources"
  ON resources FOR INSERT
  WITH CHECK ((SELECT role FROM users WHERE id = auth.uid()) IN ('teacher', 'admin'));
CREATE POLICY "Teachers delete own resources"
  ON resources FOR DELETE USING (uploaded_by = auth.uid());

-- timetables
CREATE POLICY "Anyone reads timetables"
  ON timetables FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Teachers upload timetables"
  ON timetables FOR INSERT
  WITH CHECK ((SELECT role FROM users WHERE id = auth.uid()) IN ('teacher', 'admin'));

-- labs
CREATE POLICY "Anyone reads labs"
  ON labs FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins manage labs"
  ON labs FOR ALL
  USING ((SELECT role FROM users WHERE id = auth.uid()) = 'admin');

-- lab_bookings
CREATE POLICY "Users see own bookings"
  ON lab_bookings FOR SELECT USING (booked_by = auth.uid());
CREATE POLICY "Teachers see all bookings"
  ON lab_bookings FOR SELECT
  USING ((SELECT role FROM users WHERE id = auth.uid()) IN ('teacher', 'admin'));
CREATE POLICY "Users create bookings"
  ON lab_bookings FOR INSERT WITH CHECK (booked_by = auth.uid());
CREATE POLICY "Admins update booking status"
  ON lab_bookings FOR UPDATE
  USING ((SELECT role FROM users WHERE id = auth.uid()) IN ('teacher', 'admin'));
```

---

## Step 6 — Storage Buckets (manual — UI only)

Create these in **Supabase → Storage → New bucket** (cannot be done via SQL):

| Bucket name      | Public? | Status          |
|------------------|---------|-----------------|
| `student-photos` | ✅ Yes  | Create new      |
| `faculty-videos` | ✅ Yes  | Create new      |
| `resources`      | ✅ Yes  | Create new      |
| `timetables`     | ✅ Yes  | Create new      |
| `guide-videos`   | ✅ Yes  | Create new      |
| `marks-uploads`  | ❌ No   | Create new      |

---

## ✅ Done

Your existing schema is now fully migrated. Next: fill in `.env.local` and wire the frontend API calls per `todo.md`.
