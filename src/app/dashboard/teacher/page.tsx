"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Calendar, Upload, Users, Bell, User, GraduationCap,
  LogOut, Menu, X, Home, ChevronDown, FileText,
  Check, AlertCircle, Plus, Search,
  Ticket, BookOpen, Hash, BarChart2, Table2,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

// ── Mock Data ──────────────────────────────────────────────────

const mockTeacher = {
  name: "Dr. Anil Sharma",
  designation: "Professor & HOD",
  department: "Computer Science Engineering",
  subjects: ["Data Structures", "Algorithms", "Discrete Mathematics"],
  email: "anil.sharma@aims.edu",
  initials: "AS",
  // TODO: Replace with /assets/faculty/sharma.jpg
};

const timetable: Record<string, { time: string; subject: string; room: string; class: string }[]> = {
  Monday: [
    { time: "09:00–10:00", subject: "Data Structures", room: "Lab A", class: "CSE 3A" },
    { time: "11:00–12:00", subject: "Algorithms", room: "Room 201", class: "CSE 4B" },
    { time: "02:00–03:00", subject: "Discrete Math", room: "Room 301", class: "CSE 2A" },
  ],
  Tuesday: [
    { time: "10:00–11:00", subject: "Data Structures Lab", room: "Lab A", class: "CSE 3A" },
    { time: "02:00–04:00", subject: "Project Review", room: "Seminar Hall", class: "CSE Final Year" },
  ],
  Wednesday: [
    { time: "09:00–10:00", subject: "Algorithms", room: "Room 201", class: "CSE 4A" },
    { time: "10:15–11:15", subject: "Data Structures", room: "Room 203", class: "CSE 3B" },
  ],
  Thursday: [
    { time: "09:00–10:00", subject: "Discrete Math", room: "Room 301", class: "CSE 2B" },
    { time: "11:00–12:00", subject: "Algorithms Lab", room: "Lab A", class: "CSE 4A" },
  ],
  Friday: [
    { time: "09:00–10:00", subject: "Data Structures", room: "Lab A", class: "CSE 3A" },
    { time: "10:15–11:15", subject: "Faculty Meeting", room: "Conference Room", class: "HOD" },
    { time: "02:00–03:00", subject: "Dissertation Review", room: "Room 401", class: "CSE PhD" },
  ],
};

// Year labels: FY = 1st Year, SY = 2nd Year, TY = 3rd Year, Final = 4th Year
const yearOptions = [
  { label: "All", value: "All" },
  { label: "FY", value: "1st Year" },
  { label: "SY", value: "2nd Year" },
  { label: "TY", value: "3rd Year" },
  { label: "Final", value: "4th Year" },
];

const allStudents = [
  { id: 1, name: "Rahul Sharma", roll: "CSE2022047", semester: "6th", year: "3rd Year", attendance: 88, grade: "A" },
  { id: 2, name: "Priya Menon", roll: "CSE2022023", semester: "6th", year: "3rd Year", attendance: 94, grade: "A+" },
  { id: 3, name: "Arjun Nair", roll: "CSE2022061", semester: "6th", year: "3rd Year", attendance: 72, grade: "B" },
  { id: 4, name: "Sneha Patil", roll: "CSE2023011", semester: "4th", year: "2nd Year", attendance: 91, grade: "A" },
  { id: 5, name: "Karan Shah", roll: "CSE2023034", semester: "4th", year: "2nd Year", attendance: 65, grade: "C" },
  { id: 6, name: "Anita Rao", roll: "CSE2024008", semester: "2nd", year: "1st Year", attendance: 96, grade: "A+" },
  { id: 7, name: "Nikhil Verma", roll: "CSE2021090", semester: "8th", year: "4th Year", attendance: 85, grade: "A" },
  { id: 8, name: "Deepika Iyer", roll: "CSE2021043", semester: "8th", year: "4th Year", attendance: 78, grade: "B+" },
];

const tickets = [
  { id: "TKT-2026-002", student: "Rahul Sharma", category: "Academic", subject: "Timetable clash for DBMS and ML Lab", status: "In Progress", date: "Feb 16" },
  { id: "TKT-2026-005", student: "Priya Menon", category: "Infrastructure", subject: "Request for additional reference materials", status: "Pending", date: "Feb 18" },
  { id: "TKT-2026-007", student: "Karan Shah", category: "Academic", subject: "Attendance discrepancy in DSA", status: "Resolved", date: "Feb 14" },
  { id: "TKT-2026-009", student: "Anita Rao", category: "IT Support", subject: "Lab computer not working properly", status: "Pending", date: "Feb 19" },
];

const notices = [
  { id: 1, title: "Mid-Semester Exam — Seating Arrangements", audience: "CSE All Years", date: "Feb 18", priority: "High" },
  { id: 2, title: "DSA Assignment 3 — Due Feb 25", audience: "CSE 3rd Year", date: "Feb 17", priority: "Normal" },
  { id: 3, title: "Faculty Development Program — March 3–5", audience: "All Faculty", date: "Feb 15", priority: "Normal" },
];

// ── Sidebar Nav ──────────────────────────────────────────────────

const sidebarItems = [
  { id: "timetable", label: "Timetable", icon: Calendar },
  { id: "upload", label: "Upload / CSV", icon: Upload },
  { id: "students", label: "Student List", icon: Users },
  { id: "notices", label: "Notices", icon: Bell },
  { id: "tickets", label: "Tickets", icon: Ticket },
  { id: "profile", label: "Profile", icon: User },
];

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Resolved: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
    "In Progress": "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    Pending: "bg-red-500/15 text-red-500",
  };
  return <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${styles[status] || "bg-muted text-muted-foreground"}`}>{status}</span>;
}

// ── Timetable ─────────────────────────────────────────────────────────

function TimetableSection() {
  const days = Object.keys(timetable);
  const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
  const [activeDay, setActiveDay] = useState(days.includes(today) ? today : "Monday");

  return (
    <div>
      <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
        <Calendar size={18} className="text-primary" /> My Teaching Schedule
      </h2>
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
        {days.map((d) => (
          <button
            key={d}
            onClick={() => setActiveDay(d)}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeDay === d ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
          >
            {d.slice(0, 3)}
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={activeDay}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18 }}
          className="space-y-3"
        >
          {timetable[activeDay].map((slot, i) => (
            <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:border-primary/30 transition-all">
              <div className="text-xs font-mono text-muted-foreground w-24 flex-shrink-0">{slot.time}</div>
              <div className="w-0.5 h-10 rounded-full bg-primary/30 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground text-sm">{slot.subject}</p>
                <p className="text-xs text-muted-foreground">{slot.class}</p>
              </div>
              <span className="text-xs text-muted-foreground flex-shrink-0 hidden sm:block px-2.5 py-1 rounded-lg bg-muted">{slot.room}</span>
            </div>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ── Upload / CSV Section (tabbed) ─────────────────────────────────────

type UploadTab = "resources" | "marks" | "timetable" | "students";

function UploadSection() {
  const [activeTab, setActiveTab] = useState<UploadTab>("resources");

  const tabs: { id: UploadTab; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }[] = [
    { id: "resources", label: "Resources", icon: BookOpen },
    { id: "marks", label: "Marks CSV", icon: BarChart2 },
    { id: "timetable", label: "Timetable", icon: Calendar },
    { id: "students", label: "Student List CSV", icon: Table2 },
  ];

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
        <Upload size={18} className="text-primary" /> Upload Center
      </h2>

      {/* Tab bar */}
      <div className="flex gap-1 p-1 rounded-xl bg-muted border border-border overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${activeTab === tab.id
                ? "bg-card text-foreground shadow-sm border border-border"
                : "text-muted-foreground hover:text-foreground"
              }`}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18 }}
        >
          {/* ── Resources tab ── */}
          {activeTab === "resources" && (
            <div className="space-y-5">
              <div className="p-5 rounded-2xl border border-border bg-card">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Plus size={16} className="text-primary" /> New Resource Upload
                </h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { label: "Title *", placeholder: "e.g. DSA Notes Module 4" },
                  ].map((f) => (
                    <div key={f.label} className="space-y-1.5">
                      <label className="text-xs font-medium text-foreground">{f.label}</label>
                      <input
                        placeholder={f.placeholder}
                        className="w-full px-3 py-2.5 rounded-xl border border-border bg-input text-foreground text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  ))}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground">Subject *</label>
                    <select className="w-full px-3 py-2.5 rounded-xl border border-border bg-input text-foreground text-sm focus:outline-none focus:border-primary">
                      <option value="">Select Subject</option>
                      {mockTeacher.subjects.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground">Semester</label>
                    <select className="w-full px-3 py-2.5 rounded-xl border border-border bg-input text-foreground text-sm focus:outline-none focus:border-primary">
                      <option value="">All Semesters</option>
                      {["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th"].map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                {/* Drop zone */}
                <div className="mt-4 border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
                  <Upload size={24} className="text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm font-medium text-foreground">Drop file here or click to browse</p>
                  <p className="text-xs text-muted-foreground mt-1">PDF, PPT, DOC — max 50MB</p>
                  {/* TODO: Upload to Supabase Storage bucket: resources */}
                </div>
                <button
                  onClick={() => alert("Upload requires Supabase Storage integration")}
                  className="mt-4 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:-translate-y-0.5 transition-all shadow-md shadow-primary/20"
                >
                  Upload Resource
                  {/* TODO: Connect to api/resources.ts uploadResource() */}
                </button>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-3 text-sm uppercase tracking-wide">Recently Uploaded</h3>
                <div className="space-y-3">
                  {[
                    { name: "DSA Notes — Module 3", subject: "Data Structures", type: "PDF", date: "Feb 18", downloads: 47 },
                    { name: "Algorithm Analysis Slides", subject: "Algorithms", type: "PPT", date: "Feb 14", downloads: 32 },
                    { name: "DM Question Bank 2025", subject: "Discrete Mathematics", type: "PDF", date: "Feb 10", downloads: 61 },
                  ].map((r) => (
                    <div key={r.name} className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <FileText size={16} className="text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground text-sm truncate">{r.name}</p>
                        <p className="text-xs text-muted-foreground">{r.subject} · {r.date}</p>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0 text-xs text-muted-foreground">
                        <span>{r.downloads} downloads</span>
                        <span className="px-2 py-0.5 rounded-lg bg-muted">{r.type}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Marks CSV tab ── */}
          {activeTab === "marks" && (
            <div className="space-y-5">
              <div className="p-5 rounded-2xl border border-border bg-card">
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <BarChart2 size={16} className="text-primary" /> Upload Unit Test Marks via CSV
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Upload a CSV file containing student marks. Roll numbers will automatically map marks to student profiles.
                </p>

                {/* CSV format guide */}
                <div className="mb-4 p-4 rounded-xl bg-muted/50 border border-border">
                  <p className="text-xs font-semibold text-foreground mb-2 uppercase tracking-wider">Required CSV Format</p>
                  <div className="overflow-x-auto">
                    <table className="text-xs w-full">
                      <thead>
                        <tr className="border-b border-border">
                          {["roll_no", "subject", "marks", "semester"].map((h) => (
                            <th key={h} className="px-3 py-1.5 text-left font-mono text-primary">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          ["CSE2022047", "Data Structures", "18", "6th"],
                          ["CSE2022023", "Data Structures", "17", "6th"],
                          ["CSE2022061", "Data Structures", "14", "6th"],
                        ].map((row, i) => (
                          <tr key={i} className="border-b border-border/50">
                            {row.map((cell, j) => (
                              <td key={j} className="px-3 py-1.5 font-mono text-muted-foreground">{cell}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground">Test Name *</label>
                    <input
                      placeholder="e.g. Unit Test 1"
                      className="w-full px-3 py-2.5 rounded-xl border border-border bg-input text-foreground text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground">Subject *</label>
                    <select className="w-full px-3 py-2.5 rounded-xl border border-border bg-input text-foreground text-sm focus:outline-none focus:border-primary">
                      <option value="">Select Subject</option>
                      {mockTeacher.subjects.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
                  <Upload size={24} className="text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm font-medium text-foreground">Drop marks CSV file here</p>
                  <p className="text-xs text-muted-foreground mt-1">.csv format only</p>
                  {/* TODO: uploadMarksCSV() from /src/api/marks.ts */}
                  {/* TODO: Supabase Storage bucket: marks-uploads */}
                </div>
                <button
                  onClick={() => alert("Marks upload requires Supabase integration")}
                  className="mt-4 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:-translate-y-0.5 transition-all shadow-md shadow-primary/20"
                >
                  Upload Marks CSV
                  {/* TODO: Connect to api/marks.ts uploadMarksCSV() */}
                </button>
              </div>
            </div>
          )}

          {/* ── Timetable tab ── */}
          {activeTab === "timetable" && (
            <div className="p-5 rounded-2xl border border-border bg-card space-y-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Calendar size={16} className="text-primary" /> Upload Timetable
              </h3>
              <p className="text-sm text-muted-foreground">
                Upload class or lab timetable as a PDF or image. Students can view it in their dashboard.
              </p>
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Branch</label>
                  <select className="w-full px-3 py-2.5 rounded-xl border border-border bg-input text-foreground text-sm focus:outline-none focus:border-primary">
                    <option>CSE</option><option>IT</option><option>ELEX</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Year</label>
                  <select className="w-full px-3 py-2.5 rounded-xl border border-border bg-input text-foreground text-sm focus:outline-none focus:border-primary">
                    {yearOptions.filter(y => y.value !== "All").map((y) => (
                      <option key={y.value} value={y.value}>{y.label} — {y.value}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Type</label>
                  <select className="w-full px-3 py-2.5 rounded-xl border border-border bg-input text-foreground text-sm focus:outline-none focus:border-primary">
                    <option>Class Timetable</option>
                    <option>Lab Schedule</option>
                  </select>
                </div>
              </div>
              <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
                <Upload size={24} className="text-muted-foreground mx-auto mb-2" />
                <p className="text-sm font-medium text-foreground">Drop timetable PDF or image here</p>
                <p className="text-xs text-muted-foreground mt-1">PDF, PNG, JPG — max 10MB</p>
                {/* TODO: uploadTimetable() from /src/api/resources.ts */}
                {/* TODO: Supabase Storage bucket: timetables */}
              </div>
              <button
                onClick={() => alert("Timetable upload requires Supabase integration")}
                className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:-translate-y-0.5 transition-all shadow-md shadow-primary/20"
              >
                Upload Timetable
              </button>
            </div>
          )}

          {/* ── Student List CSV tab ── */}
          {activeTab === "students" && (
            <div className="space-y-5">
              <div className="p-5 rounded-2xl border border-border bg-card">
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Users size={16} className="text-primary" /> Upload Student List via CSV
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Upload the student list for your department. Roll numbers will be used to link marks and resources.
                </p>

                {/* CSV format guide */}
                <div className="mb-4 p-4 rounded-xl bg-muted/50 border border-border">
                  <p className="text-xs font-semibold text-foreground mb-2 uppercase tracking-wider">Required CSV Format</p>
                  <div className="overflow-x-auto">
                    <table className="text-xs w-full">
                      <thead>
                        <tr className="border-b border-border">
                          {["roll_no", "name", "year", "branch"].map((h) => (
                            <th key={h} className="px-3 py-1.5 text-left font-mono text-primary">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          ["CSE2022047", "Rahul Sharma", "3rd Year", "CSE"],
                          ["CSE2023011", "Sneha Patil", "2nd Year", "CSE"],
                          ["CSE2024008", "Anita Rao", "1st Year", "CSE"],
                        ].map((row, i) => (
                          <tr key={i} className="border-b border-border/50">
                            {row.map((cell, j) => (
                              <td key={j} className="px-3 py-1.5 font-mono text-muted-foreground">{cell}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="space-y-1.5 mb-4">
                  <label className="text-xs font-medium text-foreground">Department</label>
                  <select className="w-full px-3 py-2.5 rounded-xl border border-border bg-input text-foreground text-sm focus:outline-none focus:border-primary">
                    <option>Computer Science Engineering</option>
                    <option>Information Technology</option>
                    <option>Electronics Engineering</option>
                  </select>
                </div>

                <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
                  <Upload size={24} className="text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm font-medium text-foreground">Drop student list CSV here</p>
                  <p className="text-xs text-muted-foreground mt-1">.csv format only</p>
                  {/* TODO: uploadStudentCSV() from /src/api/resources.ts */}
                  {/* TODO: Supabase table: students */}
                </div>
                <button
                  onClick={() => alert("Student CSV upload requires Supabase integration")}
                  className="mt-4 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:-translate-y-0.5 transition-all shadow-md shadow-primary/20"
                >
                  Upload Student List
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ── Student List (FY/SY/TY filter) ────────────────────────────────────

function StudentsSection() {
  const [yearFilter, setYearFilter] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = allStudents.filter((s) => {
    const matchesYear = yearFilter === "All" || s.year === yearFilter;
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.roll.toLowerCase().includes(search.toLowerCase());
    return matchesYear && matchesSearch;
  });

  return (
    <div>
      <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
        <Users size={18} className="text-primary" /> Student List
      </h2>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        {/* FY/SY/TY/Final filter */}
        <div className="flex gap-1.5">
          {yearOptions.map((y) => (
            <button
              key={y.label}
              onClick={() => setYearFilter(y.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${yearFilter === y.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
            >
              {y.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1 min-w-40">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or roll no..."
            className="w-full pl-8 pr-4 py-2 rounded-xl border border-border bg-card text-foreground text-sm focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      <p className="text-xs text-muted-foreground mb-3">{filtered.length} students found</p>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Student</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Roll No.</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground hidden sm:table-cell">Year</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground hidden md:table-cell">Attendance</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Grade</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((s) => (
              <tr key={s.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-[10px] font-bold text-primary">{s.name.split(" ").map((n) => n[0]).join("")}</span>
                    </div>
                    <span className="font-medium text-foreground">{s.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{s.roll}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground hidden sm:table-cell">
                  <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-medium">
                    {yearOptions.find(y => y.value === s.year)?.label || s.year}
                  </span>
                  {" — "}{s.year}
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full ${s.attendance >= 85 ? "bg-emerald-500" : s.attendance >= 70 ? "bg-amber-500" : "bg-red-500"}`}
                        style={{ width: `${s.attendance}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-8">{s.attendance}%</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${s.grade.startsWith("A") ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" :
                      s.grade.startsWith("B") ? "bg-primary/10 text-primary" :
                        "bg-amber-500/15 text-amber-600"
                    }`}>
                    {s.grade}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Notices ─────────────────────────────────────────────────────────────

function NoticesSection({ userId }: { userId?: string }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", audience: "", content: "" });
  const [notices, setNotices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  // Fetch notices safely on mount
  useEffect(() => {
    async function loadNotices() {
      try {
        const { fetchNotices } = await import('@/api/timetable');
        const data = await fetchNotices();
        setNotices(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadNotices();
  }, []);

  const handlePost = async () => {
    if (!form.title || !form.audience) {
      alert("Title and audience are required");
      return;
    }
    if (!userId) {
      alert("You must be logged in to post a notice.");
      return;
    }
    setPosting(true);
    try {
      const { postNotice } = await import('@/api/timetable');
      const { data, error } = await postNotice({
        title: form.title,
        content: form.content,
        audience: form.audience,
        posted_by: userId,
        priority: "Normal"
      });
      
      if (error) {
        alert("Failed to post: " + error.message);
      } else if (data) {
        setNotices([data, ...notices]);
        setForm({ title: "", audience: "", content: "" });
        setShowForm(false);
      }
    } catch (err) {
      console.error(err);
      alert("Error posting notice");
    } finally {
      setPosting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Bell size={18} className="text-primary" /> Notices & Announcements
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:-translate-y-0.5 transition-all"
        >
          {showForm ? "Cancel" : "+ Post Notice"}
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 p-4 rounded-xl border border-primary/30 bg-primary/5 space-y-3 overflow-hidden"
          >
            <h3 className="font-semibold text-foreground text-sm">Post a New Notice</h3>
            <input
              placeholder="Notice title..."
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-border bg-input text-foreground text-sm focus:outline-none focus:border-primary"
            />
            <div className="relative">
              <select
                value={form.audience}
                onChange={(e) => setForm({ ...form, audience: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-input text-foreground text-sm appearance-none focus:outline-none focus:border-primary cursor-pointer"
              >
                <option value="" disabled>Select Audience</option>
                {["CSE All Years", "CSE FY", "CSE SY", "CSE TY", "CSE Final Year", "All Faculty", "General Campus"].map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
            </div>
            <textarea
              rows={3}
              placeholder="Notice content..."
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-border bg-input text-foreground text-sm focus:outline-none focus:border-primary resize-none"
            />
            <div className="flex gap-2">
              <button 
                onClick={handlePost} 
                disabled={posting}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold disabled:opacity-50"
              >
                {posting ? "Posting..." : "Post Notice"}
              </button>
              <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg bg-muted text-muted-foreground text-xs font-semibold">Cancel</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-3">
        {loading ? (
          <div className="p-4 rounded-xl border border-border bg-card text-center text-sm text-muted-foreground">Loading notices...</div>
        ) : notices.length === 0 ? (
          <div className="p-4 rounded-xl border border-border bg-card text-center text-sm text-muted-foreground">No notices posted yet.</div>
        ) : (
          notices.map((n) => (
            <div key={n.id} className="p-4 rounded-xl border border-border bg-card flex items-start flex-col gap-2">
              <div className="w-full flex items-center gap-2 flex-wrap mb-1">
                <div className={`w-1.5 h-4 rounded-full flex-shrink-0 ${n.priority === "High" ? "bg-primary" : "bg-muted-foreground/30"}`} />
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">{n.audience}</span>
                {n.priority === "High" && <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 font-semibold">Priority</span>}
                <span className="text-[10px] text-muted-foreground ml-auto">
                  {new Date(n.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="pl-3.5">
                <p className="font-semibold text-foreground text-sm leading-snug">{n.title}</p>
                {n.content && <p className="text-xs text-muted-foreground mt-1.5 whitespace-pre-wrap leading-relaxed">{n.content}</p>}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ── Tickets ──────────────────────────────────────────────────────────────

function TicketsSection() {
  return (
    <div>
      <h2 className="text-xl font-bold text-foreground mb-1 flex items-center gap-2">
        <Ticket size={18} className="text-primary" /> Student Tickets
      </h2>
      <p className="text-xs text-muted-foreground mb-4">
        You can view and acknowledge tickets (mark &quot;In Progress&quot;). Only the student who submitted can mark a complaint as Resolved.
      </p>
      <div className="space-y-3">
        {tickets.map((t) => (
          <div key={t.id} className="p-4 rounded-xl border border-border bg-card">
            <div className="flex items-start justify-between gap-2 mb-1">
              <div>
                <span className="text-[10px] font-mono text-muted-foreground">{t.id}</span>
                <p className="font-semibold text-foreground text-sm">{t.subject}</p>
              </div>
              <StatusBadge status={t.status} />
            </div>
            <div className="flex gap-3 text-xs text-muted-foreground mt-1.5 flex-wrap">
              <span className="font-medium text-foreground/70">{t.student}</span>
              <span>·</span>
              <span>{t.category}</span>
              <span>·</span>
              <span>{t.date}</span>
            </div>
            {/* Teachers can only move to In Progress — not Resolved */}
            {t.status === "Pending" && (
              <button
                onClick={() => alert("Status update requires Supabase integration")}
                className="mt-3 px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-medium hover:bg-amber-500/20 transition-colors flex items-center gap-1"
              >
                <AlertCircle size={12} /> Acknowledge (In Progress)
                {/* NOTE: Teachers can only set "In Progress". Students mark their own tickets Resolved. */}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Profile ───────────────────────────────────────────────────────────────

function ProfileSection() {
  return (
    <div>
      <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
        <User size={18} className="text-primary" /> My Profile
      </h2>
      <div className="max-w-lg">
        <div className="p-6 rounded-2xl border border-border bg-card">
          <div className="flex items-center gap-4 mb-6">
            {/* TODO: Replace with /assets/faculty/sharma.jpg */}
            <div className="w-20 h-20 rounded-2xl bg-primary/15 flex items-center justify-center border-2 border-primary/20 flex-shrink-0">
              <span className="text-2xl font-bold text-primary">{mockTeacher.initials}</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">{mockTeacher.name}</h3>
              <p className="text-sm text-primary">{mockTeacher.designation}</p>
              <p className="text-xs text-muted-foreground mt-1">{mockTeacher.email}</p>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-xs text-muted-foreground mb-2">Subjects Taught</p>
            <div className="flex flex-wrap gap-2">
              {mockTeacher.subjects.map((s) => (
                <span key={s} className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-xs font-medium">{s}</span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              ["Department", mockTeacher.department],
              ["Email", mockTeacher.email],
            ].map(([label, value]) => (
              <div key={label} className="p-3 rounded-xl bg-muted/50 col-span-2">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="font-medium text-foreground mt-0.5 text-sm">{value}</p>
              </div>
            ))}
          </div>

          <button className="mt-4 w-full py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:text-primary hover:border-primary/40 transition-all">
            Edit Profile
            {/* TODO: Connect to users API */}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────

export default function TeacherDashboard() {
  const [activeSection, setActiveSection] = useState("timetable");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userId, setUserId] = useState<string | undefined>();

  useEffect(() => {
    async function fetchUser() {
      try {
        const { getCurrentUser } = await import('@/api/auth');
        const userData = await getCurrentUser();
        if (userData?.user) {
          setUserId(userData.user.id);
        }
      } catch (err) {
        console.error("Failed to load user:", err);
      }
    }
    fetchUser();
  }, []);

  const sectionComponents: Record<string, React.ReactNode> = {
    timetable: <TimetableSection />,
    upload: <UploadSection />,
    students: <StudentsSection />,
    notices: <NoticesSection userId={userId} />,
    tickets: <TicketsSection />,
    profile: <ProfileSection />,
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-sidebar-border flex flex-col transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className="h-16 flex items-center gap-2.5 px-4 border-b border-sidebar-border">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-md">
            <GraduationCap size={16} className="text-primary-foreground" />
          </div>
          <div>
            <p className="font-bold text-sm text-sidebar-foreground">AIMS</p>
            <p className="text-[9px] text-sidebar-foreground/50 uppercase tracking-widest">Faculty Portal</p>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="ml-auto lg:hidden text-muted-foreground">
            <X size={16} />
          </button>
        </div>

        <div className="px-4 py-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-primary">{mockTeacher.initials}</span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-sidebar-foreground truncate">{mockTeacher.name}</p>
              <p className="text-xs text-sidebar-foreground/50 truncate">{mockTeacher.designation}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveSection(item.id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${activeSection === item.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                }`}
            >
              <item.icon size={16} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="px-3 pb-4 space-y-1">
          <Link href="/" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-all">
            <Home size={16} />
            Back to Home
          </Link>
          <button
            onClick={async () => {
              const { logoutUser } = await import('@/api/auth');
              await logoutUser();
              window.location.href = '/login';
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-500/10 transition-all"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        <header className="h-16 border-b border-border bg-card/80 backdrop-blur sticky top-0 z-30 flex items-center px-4 gap-3">
          <button className="lg:hidden w-9 h-9 rounded-lg border border-border flex items-center justify-center" onClick={() => setSidebarOpen(true)}>
            <Menu size={16} />
          </button>
          <div className="flex-1">
            <h1 className="font-semibold text-foreground capitalize">
              {sidebarItems.find((i) => i.id === activeSection)?.label || "Dashboard"}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
              <span className="text-xs font-bold text-primary">{mockTeacher.initials}</span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22 }}
            >
              {sectionComponents[activeSection]}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
