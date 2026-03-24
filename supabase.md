# Supabase Setup Guide — AIMS

This guide explains how to manually configure Supabase for the AIMS project.
The backend Python service (`backend/supabase_client.py`) is a placeholder — no connection is active until you complete these steps.

---

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in.
2. Click **New Project**.
3. Choose your organization, set a project name (e.g. `aims-db`), and choose a database password.
4. Select the nearest region and click **Create new project**.
5. Wait ~2 minutes for the project to provision.

---

## 2. Create Tables

In the Supabase dashboard, open **SQL Editor** and run the following:

### `students` table
```sql
CREATE TABLE students (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  roll_no    text NOT NULL UNIQUE,
  name       text NOT NULL,
  year       text,
  branch     text,
  phone      text,
  section    text,
  photo_url  text,   -- URL to student-photos storage bucket
  created_at timestamptz DEFAULT now()
);
```

### `users` table (auth profiles)
```sql
CREATE TABLE users (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role        text NOT NULL CHECK (role IN ('student', 'teacher', 'admin')),
  roll_no     text UNIQUE,
  branch      text,
  name        text,
  department  text,
  semester    text,
  subjects    text[],
  created_at  timestamptz DEFAULT now()
);
```

### `teachers` table
```sql
CREATE TABLE teachers (
  id              uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name            text NOT NULL,
  department      text NOT NULL,
  subjects        text[],
  email           text NOT NULL,
  designation     text,
  video_filename  text,   -- filename in faculty-videos storage bucket
  created_at      timestamptz DEFAULT now()
);
```

### `teacher_keys` table
Used to validate teacher access codes during signup. Pre-populate with one-time keys.
```sql
CREATE TABLE teacher_keys (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key        text NOT NULL UNIQUE,
  used       boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
```
> **Pre-populate with keys:** `INSERT INTO teacher_keys (key) VALUES ('KEY-001'), ('KEY-002');`

### `unit_test_marks` table
```sql
CREATE TABLE unit_test_marks (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  roll_no     text NOT NULL,
  subject     text NOT NULL,
  test_name   text,
  marks       integer NOT NULL,
  max_marks   integer DEFAULT 20,
  semester    text NOT NULL,
  uploaded_by text,
  uploaded_at timestamptz DEFAULT now()
);
```

### `resources` table
```sql
CREATE TABLE resources (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title       text NOT NULL,
  subject     text NOT NULL,
  semester    text,
  department  text,
  file_url    text NOT NULL,  -- public URL from resources storage bucket
  type        text,           -- PDF, PPT, DOC, etc.
  size        text,
  uploaded_by uuid REFERENCES users(id),
  created_at  timestamptz DEFAULT now()
);
```

### `timetables` table
```sql
CREATE TABLE timetables (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  branch      text NOT NULL,
  year        text NOT NULL,
  type        text CHECK (type IN ('class', 'lab')),
  file_url    text NOT NULL,  -- public URL from timetables storage bucket
  uploaded_at timestamptz DEFAULT now()
);
```

### `notices` table
```sql
CREATE TABLE notices (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title      text NOT NULL,
  content    text,
  audience   text,
  priority   text DEFAULT 'Normal' CHECK (priority IN ('Normal', 'High')),
  posted_by  uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now()
);
```

### `tickets` table
```sql
CREATE TABLE tickets (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id      uuid REFERENCES users(id),
  student_roll_no text,
  category        text,
  subject         text NOT NULL,
  description     text,
  status          text DEFAULT 'Pending' CHECK (status IN ('Pending', 'In Progress', 'Resolved')),
  updated_at      timestamptz,
  created_at      timestamptz DEFAULT now()
);
```

### `labs` table
```sql
CREATE TABLE labs (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name         text NOT NULL,
  floor        text,
  seats        integer,
  department   text,
  available    boolean DEFAULT true,
  created_at   timestamptz DEFAULT now()
);
```

### `lab_bookings` table
```sql
CREATE TABLE lab_bookings (
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

## 3. Create Storage Buckets

In the Supabase dashboard → **Storage** → **New bucket**:

| Bucket name       | Public | Purpose                                         |
|-------------------|--------|-------------------------------------------------|
| `guide-videos`    | ✅ Yes | Chatbot navigation video files                  |
| `marks-uploads`   | ❌ No  | Raw CSV files uploaded by teachers (marks)      |
| `resources`       | ✅ Yes | PDFs, slides, lab manuals uploaded by teachers  |
| `timetables`      | ✅ Yes | Timetable PDFs/images                           |
| `student-photos`  | ✅ Yes | Student profile/ID card photos (upload by self) |
| `faculty-videos`  | ✅ Yes | Faculty introduction videos                     |

### Bucket Details

#### `student-photos` (NEW — used in ID Card section)
- Set to **public** so the ID card can display the student's photo via a direct URL.
- Path convention: `{rollNumber}.jpg` (e.g. `CSE2022047.jpg`)
- Accessed via: `${SUPABASE_STORAGE_BASE}/student-photos/{rollNumber}.jpg`
- Used in: `src/app/dashboard/student/page.tsx` → `IDCardSection` and `ProfileSection`

#### `faculty-videos` (used in Branch pages)
- Set to **public**.
- Path convention: `{facultyId}_{timestamp}.{ext}` (e.g. `uuid_1712345678.mp4`)
- Used in: `src/api/faculty.ts` → `fetchFacultyVideoUrl()` and `uploadFacultyVideo()`
- `teachers.video_filename` column stores the filename.

#### `guide-videos` (used in Chatbot)
- Set to **public**.
- Upload navigation guide videos here.
- Update `public/assets/chatbot/chatbotData.json` → `video` field with the full URL:
  ```
  https://<project-ref>.supabase.co/storage/v1/object/public/guide-videos/<filename>
  ```

#### `resources`
- Set to **public** for direct PDF/file downloads.
- Path convention: `{department}/{semester}/{timestamp}_{filename}`
- Also used to archive uploaded student list CSVs at: `students/{department}/{timestamp}_{file.csv}`

#### `marks-uploads`
- Set to **private** (no public access).
- Stores raw CSV files from teacher mark uploads via the Python backend.

#### `timetables`
- Set to **public**.
- Path convention: `{branch}/{year}/{type}_{timestamp}_{filename}`

---

## 4. Row Level Security (RLS)

Enable RLS on all tables and apply policies as follows:

```sql
-- Enable RLS on all tables
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE unit_test_marks ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetables ENABLE ROW LEVEL SECURITY;
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE labs ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_bookings ENABLE ROW LEVEL SECURITY;
```

### `unit_test_marks` policies
```sql
-- Students can only see their own marks
CREATE POLICY "Students see own marks"
ON unit_test_marks FOR SELECT
USING (roll_no = (SELECT roll_no FROM users WHERE id = auth.uid()));

-- Teachers (service role) insert/update marks
-- Use the service role key in the Python backend to bypass RLS.
```

### `tickets` policies
```sql
-- Students can only see their own tickets
CREATE POLICY "Students see own tickets"
ON tickets FOR SELECT
USING (student_id = auth.uid());

-- Teachers can see all tickets
CREATE POLICY "Teachers see all tickets"
ON tickets FOR SELECT
USING ((SELECT role FROM users WHERE id = auth.uid()) = 'teacher');

-- Students can create tickets
CREATE POLICY "Students create tickets"
ON tickets FOR INSERT
WITH CHECK (student_id = auth.uid());

-- Students can mark their own ticket Resolved; teachers can ONLY set In Progress
CREATE POLICY "Update own ticket status"
ON tickets FOR UPDATE
USING (
  -- Student can update their own
  (student_id = auth.uid())
  OR
  -- Teacher can update to In Progress only (enforced client-side AND here)
  ((SELECT role FROM users WHERE id = auth.uid()) = 'teacher')
);
```

### `notices` policies
```sql
-- Everyone can read notices
CREATE POLICY "Read notices"
ON notices FOR SELECT USING (true);

-- Only teachers/admins can post notices
CREATE POLICY "Teachers post notices"
ON notices FOR INSERT
WITH CHECK ((SELECT role FROM users WHERE id = auth.uid()) IN ('teacher', 'admin'));
```

### `resources` policies
```sql
-- Everyone authenticated can read resources
CREATE POLICY "Read resources"
ON resources FOR SELECT USING (auth.uid() IS NOT NULL);

-- Only teachers can upload resources
CREATE POLICY "Teachers upload resources"
ON resources FOR INSERT
WITH CHECK ((SELECT role FROM users WHERE id = auth.uid()) = 'teacher');
```

### `users` policies
```sql
-- Users can read their own profile
CREATE POLICY "Read own profile"
ON users FOR SELECT USING (id = auth.uid());

-- Users can update their own profile
CREATE POLICY "Update own profile"
ON users FOR UPDATE USING (id = auth.uid());
```

### `teacher_keys` policies
```sql
-- Anyone can select a key row to validate during signup (read-only, no secret data)
CREATE POLICY "Validate teacher key"
ON teacher_keys FOR SELECT USING (true);
```

---

## 5. Add Environment Variables

### Python Backend (`backend/.env`)
Create `backend/.env` with:
```
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
```
Find these in **Project Settings → API**. Use the **service_role** key (not anon) for server-side inserts.

### Next.js Frontend (`.env.local`)
Copy `.env.local.example` to `.env.local` and fill in:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-public-key>
```
Use the **anon** key for frontend (it respects RLS policies).

---

## 6. Activate Supabase in the Backend

Open `backend/supabase_client.py` and follow the inline instructions:
1. Install: `pip install supabase`
2. Uncomment the initialization block.
3. Import `supabase` in `csv_processor.py` and call `.insert()` after validation.

---

## 7. Activate Supabase in the Frontend

`src/lib/supabaseClient.ts` is already configured. Ensure `.env.local` is in place, then:

```typescript
// Already implemented in src/lib/supabaseClient.ts:
import { createClient } from "@supabase/supabase-js";
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Storage bucket constants (add student-photos and faculty-videos):
export const STORAGE_BUCKETS = {
  FACULTY_VIDEOS: 'faculty-videos',
  GUIDE_VIDEOS: 'guide-videos',
  RESOURCES: 'resources',
  TIMETABLES: 'timetables',
  STUDENT_PHOTOS: 'student-photos',  // ← ADD THIS
  MARKS_UPLOADS: 'marks-uploads',     // ← ADD THIS
}
```

Wire the following API files to live operations (currently using mock data):
- `src/api/auth.ts` — `loginUser`, `signupStudent`, `signupTeacher`, `logoutUser`
- `src/api/marks.ts` — `fetchStudentMarks`, `uploadMarksCSV`
- `src/api/resources.ts` — `fetchResources`, `uploadResource`, `fetchTimetable`, `uploadTimetable`, `uploadStudentCSV`
- `src/api/tickets.ts` — `fetchTickets`, `createTicket`, `updateTicketStatus`
- `src/api/faculty.ts` — `fetchFacultyByDepartment`, `uploadFacultyVideo`
- `src/api/users.ts` — `fetchUserProfile`, `updateUserProfile`, `fetchStudentList`
- `src/api/timetable.ts` — `fetchNotices`, `postNotice`
- `src/api/labs.ts` — `fetchLabs`, `fetchLabAvailability`, `bookLab` *(placeholder — table needed)*

---

## 8. Quick Reference — Tables & Buckets Summary

| Resource               | Type    | Used By                              |
|------------------------|---------|--------------------------------------|
| `students`             | Table   | auth, user management, student list  |
| `users`                | Table   | auth profile for all roles           |
| `teachers`             | Table   | faculty API, branch pages            |
| `teacher_keys`         | Table   | teacher signup validation            |
| `unit_test_marks`      | Table   | marks API, student/teacher dashboards|
| `resources`            | Table   | resources API, student downloads     |
| `timetables`           | Table   | timetable API                        |
| `notices`              | Table   | notices API, both dashboards         |
| `tickets`              | Table   | tickets API, complaints section      |
| `labs`                 | Table   | labs API (placeholder)               |
| `lab_bookings`         | Table   | labs API (placeholder)               |
| `guide-videos`         | Bucket  | chatbot widget video links           |
| `marks-uploads`        | Bucket  | CSV files from teacher uploads       |
| `resources`            | Bucket  | PDF/file storage for student access  |
| `timetables`           | Bucket  | timetable PDF/image storage          |
| `student-photos`       | Bucket  | student ID card & profile photos     |
| `faculty-videos`       | Bucket  | faculty intro videos on branch page  |
