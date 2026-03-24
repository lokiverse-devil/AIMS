# AIMS — Full Project TODO

This file tracks every pending task, integration stub, and code TODO in the AIMS codebase.
Grouped by area, ordered by priority.

---

## 🔴 Critical — Supabase Integration (Backend/DB)

These are blockers for any live functionality.

### Supabase Setup
- [ ] Create Supabase project and set environment variables in `.env.local` and `backend/.env`
- [ ] Run all SQL table creation scripts from `supabase.md` in Supabase SQL editor
- [ ] Pre-populate `teacher_keys` table with one-time access codes before teacher signup
- [ ] Create all 6 storage buckets: `guide-videos`, `marks-uploads`, `resources`, `timetables`, `student-photos`, `faculty-videos`
- [ ] Set bucket visibility (public/private) as specified in `supabase.md`
- [ ] Enable Row Level Security (RLS) on all tables and apply all policies from `supabase.md`

### Python Backend (`backend/`)
- [ ] Install `supabase` Python package: `pip install supabase`
- [ ] Uncomment Supabase initialization block in `backend/supabase_client.py`
- [ ] Wire `csv_processor.py` to call `.insert()` into `unit_test_marks` after CSV validation
- [ ] Run and test the FastAPI backend (`python main.py` or `uvicorn main:app`)

---

## 🟠 High Priority — Frontend Supabase Wiring

### `src/lib/supabaseClient.ts`
- [ ] Add `STUDENT_PHOTOS` and `MARKS_UPLOADS` constants to `STORAGE_BUCKETS` object
- [ ] Add helper function `getStudentPhotoUrl(rollNo)` similar to `getResourceUrl()`

### Auth (`src/api/auth.ts`)
- [ ] Wire `loginUser()` to the login page form — currently the login page shows a static form with no submit handler
- [ ] Wire `signupStudent()` to student signup form
- [ ] Wire `signupTeacher()` to teacher signup form (with teacher key validation)
- [ ] Wire `logoutUser()` to both dashboard sidebars' Logout button (currently `alert()`)
- [ ] Wire `getCurrentUser()` / `onAuthStateChange()` to populate dashboard state on load
- [ ] Redirect to `/dashboard/student` or `/dashboard/teacher` based on `role` after login

### Marks (`src/api/marks.ts`)
- [ ] Replace `unitTestMarks` mock array in student dashboard with `fetchStudentMarks(rollNo)`
- [ ] Wire teacher "Upload Marks CSV" button to `uploadMarksCSV(file, teacherId, subject, testName)`
- [ ] After upload, update `test_name` field for newly inserted rows (the `is('test_name', null)` query)
- [ ] Extend `unit_test_marks` table schema: confirm `max_marks` column exists — currently only `marks` is in the SQL in the old `supabase.md`

### Resources (`src/api/resources.ts`)
- [ ] Replace `resources` mock array in student dashboard with `fetchResources(department, semester)`
- [ ] Wire Download button in student Resources section to `getResourceDownloadUrl(filename)`
- [ ] Wire teacher "Upload Resource" button to `uploadResource(file, metadata)`
- [ ] Wire teacher "Upload Student List CSV" button to `uploadStudentCSV(file, department)`
- [ ] Wire teacher "Upload Timetable" button to `uploadTimetable(file, branch, year, type)`
- [ ] Wire student timetable section to `fetchTimetable(branch, year)` when displaying uploaded file

### Tickets (`src/api/tickets.ts`)
- [ ] Replace `complaints` mock array in student dashboard with `fetchTickets(userId, 'student')`
- [ ] Wire student "Submit Ticket" button to `submitComplaint()` — currently calls `alert()`
- [ ] Wire student "Mark as Resolved" button to `updateTicketStatus(ticketId, 'Resolved', userId, 'student')`
- [ ] Replace `tickets` mock array in teacher dashboard with `fetchTickets(userId, 'teacher')`
- [ ] Wire teacher "Acknowledge (In Progress)" button to `updateTicketStatus(ticketId, 'In Progress', userId, 'teacher')`

### Notices (`src/api/timetable.ts` — contains Notice API)
- [ ] Replace `notices` mock array in teacher dashboard with `fetchNotices(audience?)`
- [ ] Wire teacher "Post Notice" button to `postNotice(notice)` — currently calls `alert()`
- [ ] Wire student Notifications section to `fetchNotices()` from Supabase

### Faculty (`src/api/faculty.ts`)
- [ ] Replace faculty mock data on branch pages (`/branches/cse`, `/branches/it`, etc.) with `fetchFacultyByDepartment(department)`
- [ ] Wire faculty intro video in branch pages to `fetchFacultyVideoUrl(filename)`
- [ ] Wire teacher profile "Upload Video" functionality to `uploadFacultyVideo(file, facultyId)`

### Users (`src/api/users.ts`)
- [ ] Wire student dashboard profile data to `fetchUserProfile(userId)` instead of `mockStudent`
- [ ] Wire teacher dashboard profile data to `fetchUserProfile(userId)` instead of `mockTeacher`
- [ ] Wire both "Edit Profile" buttons to `updateUserProfile(userId, updates)` — currently no-op
- [ ] Replace teacher student list mock data with `fetchStudentList(department, year)`
- [ ] Store `phone` and `section` in `students` table — add columns if not present

### Labs (`src/api/labs.ts`)
- [ ] Implement `fetchLabs()` — connect to `labs` Supabase table
- [ ] Implement `fetchLabAvailability(labId, date)` — connect to `lab_bookings` table
- [ ] Implement `bookLab(labId, data)` — insert into `lab_bookings` table
- [ ] Replace `labs` mock array in student dashboard with `fetchLabs()`
- [ ] Wire "Request Booking" button in Labs section to `bookLab()`

---

## 🟡 Medium Priority — Student Dashboard (`src/app/dashboard/student/page.tsx`)

- [ ] Replace `mockStudent` object with real data from `getCurrentUser()` on page load
- [ ] Show student's photo from `student-photos` bucket in ID Card and Profile sections (currently shows initials)
- [ ] Wire photo upload in ID Card section to storage: `supabase.storage.from('student-photos').upload(`${rollNumber}.jpg`, file)` — comment exists at lines 510–511
- [ ] Wire photo upload in ID Card section to update `students.photo_url` column
- [ ] Set `photoPreview` initial value to `students.photo_url` from DB (so saved photo loads on page open)
- [ ] Replace timetable mock data with data from `timetables` Supabase table (fetched by branch/year)
- [ ] Implement "Download PDF ID Card" button (TODO at line 622) — use `jsPDF` or server-side rendering
- [ ] Use college logo (`/assets/ui/logo.png`) in header of Digital ID Card (TODO at line 523)
- [ ] Use college logo in generated PDF ID Card (TODO at line 623)
- [ ] Add `phone` and `section` fields to student profile data from DB

---

## 🟡 Medium Priority — Teacher Dashboard (`src/app/dashboard/teacher/page.tsx`)

- [ ] Replace `mockTeacher` object with real data from `getCurrentUser()` on page load
- [ ] Show teacher photo from `faculty-videos` or a separate `faculty-photos` bucket in Profile section
- [ ] Replace timetable mock data with data from `timetables` table filtered by teacher's department
- [ ] Replace student list mock data with data from `fetchStudentList(department)` — filter by year
- [ ] Replace notices mock data with data from `fetchNotices()` from Supabase
- [ ] Replace tickets mock data with data from `fetchTickets(userId, 'teacher')`
- [ ] Show real subjects from `teachers.subjects` in upload dropdowns and profile

---

## 🟡 Medium Priority — Auth Pages

### Login (`src/app/login/`)
- [ ] Connect login form submit to `loginUser(credentials)` from `src/api/auth.ts`
- [ ] Handle errors (wrong password, unverified email, etc.) with user-friendly messages
- [ ] After login, read user `role` and redirect to `/dashboard/student` or `/dashboard/teacher`
- [ ] Handle "Remember me" / session persistence

### Signup (`src/app/signup/`)
- [ ] Connect student signup form to `signupStudent(formData)`
- [ ] Connect teacher signup form to `signupTeacher(formData)` with teacher key validation
- [ ] Show validation error when teacher access key is invalid or already used
- [ ] After signup, redirect to login with success message (Supabase sends verification email)

---

## 🟡 Medium Priority — Branch Pages (`src/components/branch-page-template.tsx`)

- [ ] Fetch faculty list from `fetchFacultyByDepartment(department)` instead of hardcoded data
- [ ] Fetch and render faculty intro video using `fetchFacultyVideoUrl(faculty.video_filename)`
- [ ] Display faculty `designation` field from `teachers` table
- [ ] Display branch-specific resources from `fetchResources(department)`

---

## 🟢 Lower Priority — UI / UX

### Student Dashboard
- [ ] Add loading states (skeleton loaders) while data is being fetched from Supabase
- [ ] Add error states for failed API calls (e.g. marks, resources)
- [ ] "Semester Results" → Update university result portal URL from `https://ubterex.in/` to the actual portal (TODO at line 312)
- [ ] Add notification/unread badge count to the bell icon (from `fetchNotices()`)
- [ ] Remove "Live data available after Supabase integration" placeholder text once wired

### Teacher Dashboard
- [ ] Add loading states for student list and notices
- [ ] Add success/error toast after CSV upload (use Sonner or similar)
- [ ] Show actual upload results (`rowsInserted`, `failed` count) in the UI after CSV upload

### Both Dashboards
- [ ] Replace `alert()` calls in Logout, ticket submission, notice posting, marks upload, timetable upload, student CSV upload with real implementations or proper UI modals

---

## 🟢 Lower Priority — Assets & Static Content

- [ ] Add actual college logo at `/public/assets/ui/logo.png` and use it in:
  - Sidebar header (both dashboards)
  - Digital ID Card header
  - PDF ID Card export
- [ ] Add student photos convention: upload to `/public/assets/students/{rollNumber}.jpg` OR use `student-photos` Supabase bucket — choose one approach and clean up TODOs in both dashboards
- [ ] Add faculty photos: `/public/assets/faculty/{name}.jpg` OR use Supabase `faculty-videos` / a separate bucket — choose approach and clean up TODOs
- [ ] Update chatbot video URLs in `public/assets/chatbot/chatbotData.json` → `video` fields with real Supabase `guide-videos` bucket URLs

---

## 🟢 Lower Priority — Backend (`backend/`)

- [ ] Wire `POST /upload/students` endpoint in FastAPI to validate CSV and insert into `students` table via Supabase service role
- [ ] Wire `POST /upload/unit-test` endpoint to validate CSV and insert into `unit_test_marks` via Supabase service role
- [ ] Add proper FastAPI error handling (field validation, duplicate roll numbers, etc.)
- [ ] Add authentication to backend endpoints (verify JWT from Supabase before accepting uploads)

---

## 📝 Code Debt / Refactoring

- [ ] Move all mock data (`mockStudent`, `mockTeacher`, `timetable`, `resources`, etc.) out of page files into a separate `__mocks__/` folder or remove once Supabase is wired
- [ ] `src/api/timetable.ts` is misnamed — it contains the **Notices** API, not timetable. Rename to `src/api/notices.ts` and update imports in both dashboards and anywhere else that imports from it
- [ ] `STORAGE_BUCKETS` in `supabaseClient.ts` is missing `timetables`, `student-photos`, and `marks-uploads` — add them and use the constants in all API files instead of string literals
- [ ] `src/app/dashboard/student/page.tsx` and `src/app/dashboard/teacher/page.tsx` are very large single files — consider splitting sections into separate component files under `src/components/dashboard/`
- [ ] Teacher access key validation uses `SELECT` without RLS restriction — consider moving to a Supabase Edge Function or the Python backend to avoid key exposure via `anon` role
- [ ] `src/api/labs.ts` — fully stubbed, needs complete implementation once `labs` and `lab_bookings` tables are created in Supabase
