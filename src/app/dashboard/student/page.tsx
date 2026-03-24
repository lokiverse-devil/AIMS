"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Calendar, BookOpen, FlaskConical, MessageSquare, CreditCard,
  Bell, User, GraduationCap, LogOut, Menu, X, ChevronRight,
  Download, Clock, Check, AlertCircle, Home, BookMarked,
  Hash, Mail, Phone, BarChart2, Award, ExternalLink, Upload,
  FileText,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

// ── Mock Data ──────────────────────────────────────────────────────

const mockStudent = {
  name: "Rahul Sharma",
  rollNumber: "CSE2022047",
  branch: "CSE",
  semester: "6th",
  year: "TY",           // FY / SY / TY
  yearLabel: "3rd Year",
  email: "rahul.sharma@aims.edu",
  phone: "+91 98765 43210",
  section: "A",
  initials: "RS",
  // TODO: Replace with /assets/students/{rollNumber}.jpg
};

const timetable: Record<string, { time: string; subject: string; faculty: string; room: string }[]> = {
  Monday: [
    { time: "09:00–10:00", subject: "Data Structures", faculty: "Dr. Anil Sharma", room: "Lab A" },
    { time: "10:00–11:00", subject: "Machine Learning", faculty: "Prof. Kavita Joshi", room: "Room 201" },
    { time: "11:15–12:15", subject: "Computer Networks", faculty: "Prof. Priya Desai", room: "Room 203" },
    { time: "02:00–03:00", subject: "DBMS Lab", faculty: "Dr. Suhas Patil", room: "Lab B" },
  ],
  Tuesday: [
    { time: "09:00–10:00", subject: "Machine Learning Lab", faculty: "Prof. Kavita Joshi", room: "AI Lab" },
    { time: "10:15–11:15", subject: "Operating Systems", faculty: "Dr. Ramesh Nair", room: "Room 102" },
    { time: "02:00–03:00", subject: "Web Development", faculty: "Prof. Anjali Mehta", room: "Lab C" },
  ],
  Wednesday: [
    { time: "09:00–10:00", subject: "Data Structures", faculty: "Dr. Anil Sharma", room: "Room 201" },
    { time: "10:00–11:00", subject: "Computer Networks", faculty: "Prof. Priya Desai", room: "Room 203" },
    { time: "11:15–12:15", subject: "Software Engineering", faculty: "Dr. Suhas Patil", room: "Room 301" },
  ],
  Thursday: [
    { time: "09:00–11:00", subject: "DSA Lab", faculty: "Dr. Anil Sharma", room: "Lab A" },
    { time: "11:15–12:15", subject: "Operating Systems", faculty: "Dr. Ramesh Nair", room: "Room 102" },
    { time: "02:00–03:00", subject: "Machine Learning", faculty: "Prof. Kavita Joshi", room: "Room 201" },
  ],
  Friday: [
    { time: "09:00–10:00", subject: "Web Development", faculty: "Prof. Anjali Mehta", room: "Lab C" },
    { time: "10:15–11:15", subject: "DBMS", faculty: "Dr. Suhas Patil", room: "Room 301" },
    { time: "02:00–04:00", subject: "Mini Project Review", faculty: "Dr. Anil Sharma", room: "Seminar Hall" },
  ],
};

const resources = [
  { id: 1, name: "DSA Notes — Module 3", subject: "Data Structures", type: "PDF", size: "2.4 MB", uploadedBy: "Dr. Anil Sharma", date: "Feb 18", semester: "6th" },
  { id: 2, name: "ML Assignment 2 — Linear Regression", subject: "Machine Learning", type: "PDF", size: "1.1 MB", uploadedBy: "Prof. Kavita Joshi", date: "Feb 17", semester: "6th" },
  { id: 3, name: "Networks Lab Manual", subject: "Computer Networks", type: "PDF", size: "3.2 MB", uploadedBy: "Prof. Priya Desai", date: "Feb 15", semester: "6th" },
  { id: 4, name: "OS Question Bank 2025", subject: "Operating Systems", type: "PDF", size: "890 KB", uploadedBy: "Dr. Ramesh Nair", date: "Feb 12", semester: "6th" },
];

const labs = [
  { name: "Computer Lab A", available: true, floor: "Ground", seats: 30, currentClass: null },
  { name: "Computer Lab B", available: false, floor: "1st", seats: 40, currentClass: "ML Lab — 10AM" },
  { name: "AI/ML Research Lab", available: true, floor: "2nd", seats: 20, currentClass: null },
  { name: "Networking Lab", available: true, floor: "Ground", seats: 20, currentClass: null },
];

// Mock unit test marks
const unitTestMarks = [
  { id: 1, subject: "Data Structures", testName: "Unit Test 1", marksObtained: 18, maxMarks: 20, semester: "6th" },
  { id: 2, subject: "Machine Learning", testName: "Unit Test 1", marksObtained: 16, maxMarks: 20, semester: "6th" },
  { id: 3, subject: "Computer Networks", testName: "Unit Test 1", marksObtained: 14, maxMarks: 20, semester: "6th" },
  { id: 4, subject: "Operating Systems", testName: "Unit Test 1", marksObtained: 19, maxMarks: 20, semester: "6th" },
  { id: 5, subject: "Data Structures", testName: "Unit Test 2", marksObtained: 17, maxMarks: 20, semester: "6th" },
  { id: 6, subject: "Machine Learning", testName: "Unit Test 2", marksObtained: 15, maxMarks: 20, semester: "6th" },
  // TODO: fetchStudentMarks(rollNo) from /src/api/marks.ts — connect to Supabase
];

const complaints = [
  { id: "TKT-2026-001", category: "Infrastructure", subject: "Projector not working in Room 201", status: "Resolved", date: "Feb 10" },
  { id: "TKT-2026-002", category: "Academic", subject: "Timetable clash for DBMS and ML Lab", status: "In Progress", date: "Feb 16" },
  { id: "TKT-2026-003", category: "Facility", subject: "Air conditioning issue in Lab A", status: "Pending", date: "Feb 19" },
];

const notifications = [
  { id: 1, type: "urgent", title: "Mid-Semester Exam Timetable Released", desc: "Exams start April 14. Check your schedule.", time: "2h ago" },
  { id: 2, type: "info", title: "New ML Notes Uploaded", desc: "Prof. Kavita Joshi uploaded Module 4 notes.", time: "5h ago" },
  { id: 3, type: "success", title: "Complaint #TKT-2026-001 Resolved", desc: "Projector in Room 201 has been repaired.", time: "1d ago" },
  { id: 4, type: "info", title: "Fee Payment Reminder", desc: "Last date: March 5, 2026.", time: "2d ago" },
];

// ── Sidebar Nav ──────────────────────────────────────────────────

const sidebarItems = [
  { id: "timetable", label: "Timetable", icon: Calendar },
  { id: "marks", label: "Unit Test Marks", icon: BarChart2 },
  { id: "results", label: "Semester Results", icon: Award },
  { id: "resources", label: "Resources", icon: BookOpen },
  { id: "labs", label: "Labs", icon: FlaskConical },
  { id: "complaints", label: "Complaints", icon: MessageSquare },
  { id: "idcard", label: "Digital ID Card", icon: CreditCard },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "profile", label: "Profile", icon: User },
];

// ── Status Badge ─────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Resolved: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
    "In Progress": "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    Pending: "bg-red-500/15 text-red-500",
  };
  return (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${styles[status] || "bg-muted text-muted-foreground"}`}>
      {status}
    </span>
  );
}

// ── Dashboard Sections ───────────────────────────────────────────

function TimetableSection() {
  const days = Object.keys(timetable);
  const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
  const [activeDay, setActiveDay] = useState(days.includes(today) ? today : "Monday");

  return (
    <div>
      <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
        <Calendar size={18} className="text-primary" /> Weekly Timetable
      </h2>
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
        {days.map((d) => (
          <button
            key={d}
            onClick={() => setActiveDay(d)}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeDay === d
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted text-muted-foreground hover:text-foreground"
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
                <p className="text-xs text-muted-foreground">{slot.faculty}</p>
              </div>
              <span className="text-xs text-muted-foreground flex-shrink-0 hidden sm:block">{slot.room}</span>
            </div>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ── Unit Test Marks Section ────────────────────────────────────────

function MarksSection() {
  const subjects = [...new Set(unitTestMarks.map((m) => m.subject))];
  const [filterSubject, setFilterSubject] = useState("All");

  const filtered = filterSubject === "All"
    ? unitTestMarks
    : unitTestMarks.filter((m) => m.subject === filterSubject);

  const getGradeColor = (marks: number, max: number) => {
    const pct = (marks / max) * 100;
    if (pct >= 80) return "text-emerald-600 dark:text-emerald-400";
    if (pct >= 60) return "text-amber-600 dark:text-amber-400";
    return "text-red-500";
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <BarChart2 size={18} className="text-primary" /> Unit Test Marks
        </h2>
        <select
          value={filterSubject}
          onChange={(e) => setFilterSubject(e.target.value)}
          className="px-3 py-1.5 rounded-xl border border-border bg-card text-foreground text-sm focus:outline-none focus:border-primary"
        >
          <option value="All">All Subjects</option>
          {subjects.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Subject</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Test</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Marks</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground hidden sm:table-cell">Semester</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Progress</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((m) => (
              <tr key={m.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <span className="font-medium text-foreground text-sm">{m.subject}</span>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{m.testName}</td>
                <td className="px-4 py-3">
                  <span className={`font-bold text-sm ${getGradeColor(m.marksObtained, m.maxMarks)}`}>
                    {m.marksObtained}
                  </span>
                  <span className="text-xs text-muted-foreground">/{m.maxMarks}</span>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground hidden sm:table-cell">{m.semester}</td>
                <td className="px-4 py-3 w-28">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${(m.marksObtained / m.maxMarks) >= 0.8
                            ? "bg-emerald-500"
                            : (m.marksObtained / m.maxMarks) >= 0.6
                              ? "bg-amber-500"
                              : "bg-red-500"
                          }`}
                        style={{ width: `${(m.marksObtained / m.maxMarks) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-8 flex-shrink-0">
                      {Math.round((m.marksObtained / m.maxMarks) * 100)}%
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted-foreground mt-3 text-center">
        {/* TODO: fetchStudentMarks() from /src/api/marks.ts — connect to Supabase */}
        Marks are uploaded by faculty via CSV. Live data available after Supabase integration.
      </p>
    </div>
  );
}

// ── Semester Results Section ───────────────────────────────────────

function SemesterResultsSection() {
  return (
    <div>
      <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
        <Award size={18} className="text-primary" /> Semester Results
      </h2>

      <div className="p-6 rounded-2xl border border-border bg-card space-y-5">
        {/* Info card */}
        <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20">
          <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center flex-shrink-0 mt-0.5">
            <AlertCircle size={16} className="text-primary" />
          </div>
          <div>
            <p className="font-semibold text-foreground text-sm">Official Results via University Portal</p>
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
              AIMS does <span className="font-medium text-foreground">not</span> store official semester examination marksheets.
              These are managed directly by the university. Click below to access the official university result portal.
            </p>
          </div>
        </div>

        {/* Semester selector */}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">Filter by Semester</p>
          <div className="flex flex-wrap gap-2">
            {["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th"].map((sem) => (
              <span
                key={sem}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${sem === mockStudent.semester
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-muted text-muted-foreground border-border"
                  }`}
              >
                {sem} Sem
              </span>
            ))}
          </div>
        </div>

        {/* CTA Button */}
        <a
          href="https://ubterex.in/"
          // TODO: Replace # with actual university result portal URL
          // e.g., https://results.university.ac.in/
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 transition-all"
        >
          <ExternalLink size={16} />
          View Official University Result
          {/* TODO: Replace href with: https://[university-portal]/results */}
        </a>

        <p className="text-[10px] text-muted-foreground text-center">
          You will be redirected to the official university examination portal.
          {/* TODO: Add university portal URL once available */}
        </p>
      </div>
    </div>
  );
}

function ResourcesSection() {
  return (
    <div>
      <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
        <BookOpen size={18} className="text-primary" /> Study Resources
      </h2>
      <div className="space-y-3">
        {resources.map((r) => (
          <div key={r.id} className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:border-primary/30 transition-all group">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <BookMarked size={16} className="text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground text-sm truncate">{r.name}</p>
              <p className="text-xs text-muted-foreground">{r.subject} · {r.uploadedBy} · {r.date}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-xs text-muted-foreground hidden sm:block">{r.size}</span>
              {/* TODO: Replace with Supabase Storage download URL */}
              <button className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all group-hover:scale-105">
                <Download size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground mt-4 text-center">
        {/* TODO: Resources fetched from Supabase Storage bucket: resources */}
        PDF downloads will be available after Supabase integration.
      </p>
    </div>
  );
}

function LabsSection() {
  return (
    <div>
      <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
        <FlaskConical size={18} className="text-primary" /> Lab Availability
      </h2>
      <div className="grid sm:grid-cols-2 gap-4">
        {labs.map((lab) => (
          <div key={lab.name} className="p-5 rounded-xl border border-border bg-card">
            <div className="flex items-start justify-between mb-2">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <FlaskConical size={18} className="text-primary" />
              </div>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${lab.available ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" : "bg-red-500/15 text-red-500"}`}>
                {lab.available ? "Available" : "Occupied"}
              </span>
            </div>
            <h4 className="font-semibold text-foreground text-sm mt-2">{lab.name}</h4>
            <p className="text-xs text-muted-foreground">{lab.floor} Floor · {lab.seats} seats</p>
            {lab.currentClass && (
              <div className="mt-2 flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
                <Clock size={11} />
                {lab.currentClass}
              </div>
            )}
            {lab.available && (
              <button className="mt-3 w-full py-2 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors">
                Request Booking
                {/* TODO: Connect to labs API */}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ComplaintsSection() {
  const [showForm, setShowForm] = useState(false);
  const [newComplaint, setNewComplaint] = useState({ category: "", subject: "", description: "" });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <MessageSquare size={18} className="text-primary" /> Complaints & Tickets
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:-translate-y-0.5 transition-all"
        >
          + New Ticket
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
            <h3 className="font-semibold text-foreground text-sm">Raise a New Ticket</h3>
            <select
              value={newComplaint.category}
              onChange={(e) => setNewComplaint({ ...newComplaint, category: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-border bg-input text-foreground text-sm focus:outline-none focus:border-primary"
            >
              <option value="">Select Category</option>
              {["Infrastructure", "Academic", "Facility", "IT Support", "WiFi", "Other"].map((c) => <option key={c}>{c}</option>)}
            </select>
            <input
              placeholder="Subject"
              value={newComplaint.subject}
              onChange={(e) => setNewComplaint({ ...newComplaint, subject: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-border bg-input text-foreground text-sm focus:outline-none focus:border-primary"
            />
            <textarea
              placeholder="Describe the issue..."
              rows={3}
              value={newComplaint.description}
              onChange={(e) => setNewComplaint({ ...newComplaint, description: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-border bg-input text-foreground text-sm focus:outline-none focus:border-primary resize-none"
            />
            <div className="flex gap-2">
              <button
                onClick={() => { setShowForm(false); alert("Ticket submission requires Supabase integration"); /* TODO: submitComplaint() from /src/api/tickets.ts */ }}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold"
              >
                Submit Ticket
              </button>
              <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg bg-muted text-muted-foreground text-xs font-semibold">
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-3">
        {complaints.map((c) => (
          <div key={c.id} className="p-4 rounded-xl border border-border bg-card">
            <div className="flex items-start justify-between gap-2 mb-1">
              <div>
                <span className="text-[10px] font-mono text-muted-foreground">{c.id}</span>
                <p className="font-semibold text-foreground text-sm">{c.subject}</p>
              </div>
              <StatusBadge status={c.status} />
            </div>
            <div className="flex gap-3 text-xs text-muted-foreground">
              <span>{c.category}</span>
              <span>·</span>
              <span>{c.date}</span>
            </div>
            {/* Students can mark their own resolved complaints */}
            {c.status === "In Progress" && (
              <button
                onClick={() => alert("Mark resolved — requires Supabase integration")}
                className="mt-2 flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                <Check size={11} /> Mark as Resolved
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Enhanced ID Card Section ───────────────────────────────────────

function IDCardSection() {
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPhotoPreview(url);
    // TODO: Upload photo to Supabase Storage bucket: student-photos
    // const { data } = await supabase.storage.from('student-photos').upload(`${rollNumber}.jpg`, file);
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
        <CreditCard size={18} className="text-primary" /> Digital ID Card
      </h2>
      <div className="max-w-sm mx-auto">
        <div className="rounded-2xl overflow-hidden border border-border shadow-xl">
          {/* Card Header */}
          <div className="bg-primary px-6 py-4 flex items-center gap-3">
            {/* TODO: Use /assets/ui/logo.png here */}
            <div className="w-8 h-8 rounded-lg bg-primary-foreground/20 flex items-center justify-center">
              <GraduationCap size={18} className="text-primary-foreground" />
            </div>
            <div>
              <p className="font-bold text-primary-foreground text-sm">AIMS</p>
              <p className="text-[10px] text-primary-foreground/70">Academic Infrastructure Management</p>
            </div>
          </div>

          {/* Card Body */}
          <div className="bg-card px-6 py-5 space-y-4">
            {/* Photo + Name */}
            <div className="flex items-center gap-4">
              {/* Photo slot */}
              <div
                className="w-16 h-16 rounded-xl bg-primary/15 flex items-center justify-center border-2 border-primary/20 flex-shrink-0 overflow-hidden cursor-pointer relative group"
                onClick={() => fileRef.current?.click()}
                title="Click to upload photo"
              >
                {photoPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photoPreview} alt="Student" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xl font-bold text-primary">{mockStudent.initials}</span>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-[10px]">
                  <Upload size={16} className="text-white" />
                </div>
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoChange}
              // TODO: Upload to Supabase Storage bucket: student-photos
              />
              <div>
                <p className="font-bold text-foreground">{mockStudent.name}</p>
                <p className="text-xs text-primary font-medium">{mockStudent.branch} — {mockStudent.yearLabel}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{mockStudent.semester} Semester</p>
              </div>
            </div>

            <div className="aims-divider" />

            <div className="space-y-2.5 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Hash size={13} className="text-primary flex-shrink-0" />
                <span className="font-mono text-foreground font-medium">{mockStudent.rollNumber}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail size={13} className="text-primary flex-shrink-0" />
                <span className="text-foreground text-xs">{mockStudent.email}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone size={13} className="text-primary flex-shrink-0" />
                <span className="text-foreground text-xs">{mockStudent.phone}</span>
              </div>
            </div>

            <div className="aims-divider" />

            <div className="flex items-center justify-between">
              <div className="text-xs">
                <p className="text-muted-foreground">Valid For</p>
                <p className="font-semibold text-foreground">Academic Year 2025–26</p>
              </div>
              {/* QR placeholder */}
              <div className="w-14 h-14 rounded-lg bg-muted flex items-center justify-center border border-border">
                <div className="grid grid-cols-3 gap-0.5">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div key={i} className={`w-2.5 h-2.5 rounded-[2px] ${i % 3 !== 1 ? "bg-foreground" : "bg-transparent"}`} />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-primary/5 px-6 py-2.5 border-t border-border">
            <p className="text-[10px] text-center text-muted-foreground">
              This is a digital ID card. Present at security checkpoint when required.
            </p>
          </div>
        </div>

        {/* Photo upload hint */}
        {!photoPreview && (
          <button
            onClick={() => fileRef.current?.click()}
            className="mt-3 w-full py-2 rounded-xl border border-dashed border-border text-xs text-muted-foreground hover:text-primary hover:border-primary/40 transition-all flex items-center justify-center gap-1.5"
          >
            <Upload size={13} /> Upload Your Photo
          </button>
        )}

        <button className="mt-3 w-full py-2.5 rounded-xl border border-border bg-card text-sm text-muted-foreground hover:text-primary hover:border-primary/40 transition-all flex items-center justify-center gap-2">
          <Download size={14} /> Download PDF ID Card
          {/* TODO: Generate PDF with jsPDF or server-side rendering */}
          {/* TODO: Use college logo from /assets/ui/logo.png in generated PDF */}
        </button>
      </div>
    </div>
  );
}

function NotificationsSection() {
  const typeStyles: Record<string, { bg: string; icon: React.ComponentType<{ size?: number; className?: string }> }> = {
    urgent: { bg: "bg-red-500/10 border-red-500/20", icon: AlertCircle },
    info: { bg: "bg-primary/10 border-primary/20", icon: Bell },
    success: { bg: "bg-emerald-500/10 border-emerald-500/20", icon: Check },
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
        <Bell size={18} className="text-primary" /> Notifications
      </h2>
      <div className="space-y-3">
        {notifications.map((n) => {
          const style = typeStyles[n.type];
          const Icon = style.icon;
          return (
            <div key={n.id} className={`p-4 rounded-xl border ${style.bg}`}>
              <div className="flex items-start gap-3">
                <Icon size={16} className="text-primary mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground text-sm">{n.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{n.desc}</p>
                </div>
                <span className="text-[10px] text-muted-foreground flex-shrink-0">{n.time}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ProfileSection() {
  return (
    <div>
      <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
        <User size={18} className="text-primary" /> My Profile
      </h2>
      <div className="max-w-lg">
        <div className="p-6 rounded-2xl border border-border bg-card">
          <div className="flex items-center gap-4 mb-6">
            {/* TODO: Replace with /assets/students/{rollNumber}.jpg */}
            <div className="w-20 h-20 rounded-2xl bg-primary/15 flex items-center justify-center border-2 border-primary/20">
              <span className="text-2xl font-bold text-primary">{mockStudent.initials}</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">{mockStudent.name}</h3>
              <p className="text-sm text-primary">{mockStudent.branch} · {mockStudent.yearLabel}</p>
              <p className="text-xs text-muted-foreground mt-1">{mockStudent.rollNumber}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              ["Branch", mockStudent.branch],
              ["Semester", mockStudent.semester],
              ["Year", `${mockStudent.year} — ${mockStudent.yearLabel}`],
              ["Section", mockStudent.section],
              ["Email", mockStudent.email],
              ["Phone", mockStudent.phone],
            ].map(([label, value]) => (
              <div key={label} className={`p-3 rounded-xl bg-muted/50 ${label === "Email" || label === "Phone" ? "col-span-2" : ""}`}>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="font-medium text-foreground mt-0.5 text-sm break-all">{value}</p>
              </div>
            ))}
          </div>
          <button className="mt-4 w-full py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:text-primary hover:border-primary/40 transition-all">
            Edit Profile
            {/* TODO: Connect to users API updateUserProfile() */}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Dashboard ───────────────────────────────────────────────────

export default function StudentDashboard() {
  const [activeSection, setActiveSection] = useState("timetable");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const sectionComponents: Record<string, React.ReactNode> = {
    timetable: <TimetableSection />,
    marks: <MarksSection />,
    results: <SemesterResultsSection />,
    resources: <ResourcesSection />,
    labs: <LabsSection />,
    complaints: <ComplaintsSection />,
    idcard: <IDCardSection />,
    notifications: <NotificationsSection />,
    profile: <ProfileSection />,
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-sidebar-border flex flex-col transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center gap-2.5 px-4 border-b border-sidebar-border">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-md">
            <GraduationCap size={16} className="text-primary-foreground" />
          </div>
          <div>
            <p className="font-bold text-sm text-sidebar-foreground">AIMS</p>
            <p className="text-[9px] text-sidebar-foreground/50 uppercase tracking-widest">Student Portal</p>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="ml-auto lg:hidden text-muted-foreground">
            <X size={16} />
          </button>
        </div>

        {/* Student info */}
        <div className="px-4 py-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-primary">{mockStudent.initials}</span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-sidebar-foreground truncate">{mockStudent.name}</p>
              <p className="text-xs text-sidebar-foreground/50">{mockStudent.rollNumber}</p>
            </div>
          </div>
          {/* Year badge */}
          <div className="mt-2 flex gap-1.5">
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/15 text-primary font-medium">{mockStudent.year}</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">{mockStudent.branch}</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">Sem {mockStudent.semester.replace("th", "").replace("st", "").replace("nd", "").replace("rd", "")}</span>
          </div>
        </div>

        {/* Nav */}
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

        {/* Footer */}
        <div className="px-3 pb-4 space-y-1">
          <Link
            href="/"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-all"
          >
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

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="h-16 border-b border-border bg-card/80 backdrop-blur sticky top-0 z-30 flex items-center px-4 gap-3">
          <button
            className="lg:hidden w-9 h-9 rounded-lg border border-border flex items-center justify-center"
            onClick={() => setSidebarOpen(true)}
          >
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
              <span className="text-xs font-bold text-primary">{mockStudent.initials}</span>
            </div>
          </div>
        </header>

        {/* Content */}
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
