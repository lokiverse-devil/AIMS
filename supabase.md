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
  created_at timestamptz DEFAULT now()
);
```

### `unit_test_marks` table
```sql
CREATE TABLE unit_test_marks (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  roll_no     text NOT NULL,
  subject     text NOT NULL,
  marks       integer NOT NULL,
  semester    text NOT NULL,
  uploaded_by text,
  uploaded_at timestamptz DEFAULT now()
);
```

### `users` table (for auth)
```sql
CREATE TABLE users (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role        text NOT NULL CHECK (role IN ('student', 'teacher', 'admin')),
  roll_no     text UNIQUE,
  branch      text,
  created_at  timestamptz DEFAULT now()
);
```

### `notices` table
```sql
CREATE TABLE notices (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title      text NOT NULL,
  content    text,
  audience   text,
  priority   text DEFAULT 'Normal',
  posted_by  uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now()
);
```

### `tickets` table
```sql
CREATE TABLE tickets (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES users(id),
  category   text,
  subject    text NOT NULL,
  status     text DEFAULT 'Pending' CHECK (status IN ('Pending', 'In Progress', 'Resolved')),
  created_at timestamptz DEFAULT now()
);
```

---

## 3. Create Storage Buckets

In the Supabase dashboard → **Storage** → **New bucket**:

| Bucket name     | Public | Purpose                          |
|-----------------|--------|----------------------------------|
| `guide-videos`  | ✅ Yes | Chatbot navigation video files   |
| `marks-uploads` | ❌ No  | Raw CSV files uploaded by teachers |
| `resources`     | ✅ Yes | PDFs, slides, lab manuals        |
| `timetables`    | ✅ Yes | Timetable PDFs/images            |

For `guide-videos` and `resources`, set the bucket to **public** so the frontend can construct direct URLs.

### Video URL format (chatbot)
After uploading a video to `guide-videos`, the URL will be:
```
https://<project-ref>.supabase.co/storage/v1/object/public/guide-videos/<filename>
```
Update `public/assets/chatbot/chatbotData.json` to reference this full URL in the `video` field.

---

## 4. Row Level Security (RLS)

Enable RLS on sensitive tables and add policies. Example for `unit_test_marks`:

```sql
-- Enable RLS
ALTER TABLE unit_test_marks ENABLE ROW LEVEL SECURITY;

-- Students can only see their own marks
CREATE POLICY "Students see own marks"
ON unit_test_marks FOR SELECT
USING (roll_no = (SELECT roll_no FROM users WHERE id = auth.uid()));

-- Teachers (service role) can insert marks
-- Use the service role key in the Python backend to bypass RLS.
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

Open `src/lib/supabaseClient.ts` (existing file) and uncomment/configure the client using:
```typescript
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
export default supabase;
```
Then wire `src/api/auth.ts`, `src/api/marks.ts`, etc. to use this client.
