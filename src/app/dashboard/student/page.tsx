"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Calendar, BookOpen, FlaskConical, MessageSquare, CreditCard,
  Bell, User, GraduationCap, LogOut, Menu, X, Download,
  Check, AlertCircle, Home, BookMarked, Hash, Mail, Phone,
  BarChart2, Award, ExternalLink, Upload, Loader2, Trash2,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { supabase } from "@/lib/supabaseClient";

// ── Types ──────────────────────────────────────────────────────────
interface StudentProfile {
  id: string; name: string; rollNumber: string; branch: string;
  semester: string; year: string; yearForDB: string; yearLabel: string;
  email: string; phone: string; section: string; initials: string;
}

type BadgeMap = Record<string, number>;

const YEAR_TO_DB: Record<string, string> = {
  "FY": "1st Year", "SY": "2nd Year", "TY": "3rd Year",
};

const sidebarItems = [
  { id: "timetable",     label: "Timetable",        icon: Calendar },
  { id: "marks",         label: "Unit Test Marks",   icon: BarChart2 },
  { id: "results",       label: "Semester Results",  icon: Award },
  { id: "resources",     label: "Resources",         icon: BookOpen },
  { id: "labs",          label: "Labs",              icon: FlaskConical },
  { id: "complaints",    label: "Complaints",        icon: MessageSquare },
  { id: "idcard",        label: "Digital ID Card",   icon: CreditCard },
  { id: "notifications", label: "Notifications",     icon: Bell },
  { id: "profile",       label: "Profile",           icon: User },
];

const labs = [
  { name: "Computer Lab A", available: true, floor: "Ground", seats: 30, currentClass: null },
  { name: "Computer Lab B", available: false, floor: "1st", seats: 40, currentClass: "ML Lab — 10AM" },
  { name: "AI/ML Research Lab", available: true, floor: "2nd", seats: 20, currentClass: null },
  { name: "Networking Lab", available: true, floor: "Ground", seats: 20, currentClass: null },
];

// ── Helpers ────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const s: Record<string, string> = {
    Resolved: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
    "In Progress": "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    Pending: "bg-red-500/15 text-red-500",
  };
  return <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${s[status] ?? "bg-muted text-muted-foreground"}`}>{status}</span>;
}

function LoadingState({ text = "Loading…" }: { text?: string }) {
  return (
    <div className="flex items-center justify-center py-16 text-muted-foreground gap-2 text-sm">
      <Loader2 size={16} className="animate-spin" />{text}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return <div className="p-8 rounded-xl border border-border bg-card text-center text-sm text-muted-foreground">{text}</div>;
}

// ── Timetable Section (live from DB by branch+year) ────────────────
const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday"];

function TimetableSection({ branch, yearForDB }: { branch: string; yearForDB: string }) {
  const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
  const [activeDay, setActiveDay] = useState(DAYS.includes(today) ? today : "Monday");
  const [allEntries, setAllEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { fetchClassTimetable } = await import("@/api/timetable_entries");
        setAllEntries(await fetchClassTimetable(branch, yearForDB));
      } catch(e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, [branch, yearForDB]);

  const dayEntries = allEntries
    .filter(e => e.day_of_week === activeDay)
    .sort((a, b) => a.start_time.localeCompare(b.start_time));

  return (
    <div>
      <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
        <Calendar size={18} className="text-primary" /> Weekly Timetable
        <span className="text-xs text-muted-foreground font-normal ml-1">({branch} · {yearForDB})</span>
      </h2>
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
        {DAYS.map(d => (
          <button key={d} onClick={() => setActiveDay(d)}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeDay === d ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
            {d.slice(0, 3)}
          </button>
        ))}
      </div>
      {loading ? <LoadingState text="Loading timetable…" /> : dayEntries.length === 0 ? (
        <EmptyState text="No classes scheduled for this day yet. Your teacher needs to add slots." />
      ) : (
        <AnimatePresence mode="wait">
          <motion.div key={activeDay} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }} className="space-y-3">
            {dayEntries.map((slot, i) => (
              <div key={slot.id ?? i} className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:border-primary/30 transition-all">
                <div className="text-xs font-mono text-muted-foreground w-24 flex-shrink-0">{slot.start_time}–{slot.end_time}</div>
                <div className="w-0.5 h-10 rounded-full bg-primary/30 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground text-sm">{slot.subject}</p>
                  <p className="text-xs text-muted-foreground">{slot.teacher_name || "Faculty"} · {slot.class_name}</p>
                </div>
                <span className="text-xs text-muted-foreground flex-shrink-0 hidden sm:block">{slot.room}</span>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}

// ── Marks Section ──────────────────────────────────────────────────
function MarksSection({ rollNumber }: { rollNumber: string }) {
  const [marks, setMarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSubject, setFilterSubject] = useState("All");

  useEffect(() => {
    (async () => {
      if (!rollNumber) { setLoading(false); return; }
      try { const { fetchStudentMarks } = await import("@/api/marks"); setMarks(await fetchStudentMarks(rollNumber)); }
      catch(e) { console.error(e); } finally { setLoading(false); }
    })();
  }, [rollNumber]);

  const subjects = [...new Set(marks.map(m => m.subject))];
  const filtered = filterSubject === "All" ? marks : marks.filter(m => m.subject === filterSubject);
  const getColor = (got: number, max: number) => {
    const p = (got/max)*100;
    return p >= 80 ? "text-emerald-600 dark:text-emerald-400" : p >= 60 ? "text-amber-600 dark:text-amber-400" : "text-red-500";
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2"><BarChart2 size={18} className="text-primary" /> Unit Test Marks</h2>
        {subjects.length > 0 && (
          <select value={filterSubject} onChange={e => setFilterSubject(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-border bg-card text-foreground text-sm focus:outline-none focus:border-primary">
            <option value="All">All Subjects</option>
            {subjects.map(s => <option key={s}>{s}</option>)}
          </select>
        )}
      </div>
      {loading ? <LoadingState text="Loading marks…" /> : filtered.length === 0 ? <EmptyState text="No marks uploaded yet." /> : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Subject</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Test</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Marks</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Progress</th>
            </tr></thead>
            <tbody className="divide-y divide-border">
              {filtered.map(m => (
                <tr key={m.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground text-sm">{m.subject}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{m.test_name}</td>
                  <td className="px-4 py-3">
                    <span className={`font-bold text-sm ${getColor(m.marks, m.max_marks)}`}>{m.marks}</span>
                    <span className="text-xs text-muted-foreground">/{m.max_marks}</span>
                  </td>
                  <td className="px-4 py-3 w-28">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                        <div className={`h-full rounded-full ${(m.marks/m.max_marks)>=0.8?"bg-emerald-500":(m.marks/m.max_marks)>=0.6?"bg-amber-500":"bg-red-500"}`}
                          style={{ width: `${(m.marks/m.max_marks)*100}%` }} />
                      </div>
                      <span className="text-xs text-muted-foreground w-8 flex-shrink-0">{Math.round((m.marks/m.max_marks)*100)}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Semester Results ───────────────────────────────────────────────
function SemesterResultsSection({ semester }: { semester: string }) {
  const semNum = parseInt(semester.replace(/\D/g,"")) || 6;
  return (
    <div>
      <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2"><Award size={18} className="text-primary" /> Semester Results</h2>
      <div className="p-6 rounded-2xl border border-border bg-card space-y-5">
        <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20">
          <AlertCircle size={16} className="text-primary mt-0.5 flex-shrink-0" />
          <p className="text-sm text-muted-foreground leading-relaxed">
            Official semester results are managed by the university portal. Click below to access them.
          </p>
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">Semester</p>
          <div className="flex flex-wrap gap-2">
            {["1st","2nd","3rd","4th","5th","6th"].map((sem, i) => (
              <span key={sem} className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${i+1===semNum?"bg-primary text-primary-foreground border-primary":"bg-muted text-muted-foreground border-border"}`}>
                {sem} Sem
              </span>
            ))}
          </div>
        </div>
        <a href="https://ubterex.in/" target="_blank" rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm shadow-md shadow-primary/20 hover:-translate-y-0.5 transition-all">
          <ExternalLink size={16} /> View Official University Result
        </a>
      </div>
    </div>
  );
}

// ── Resources ──────────────────────────────────────────────────────
function ResourcesSection({ branch, semester }: { branch: string; semester: string }) {
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try { const { fetchResources } = await import("@/api/resources"); setResources(await fetchResources(branch||undefined, semester||undefined)); }
      catch(e) { console.error(e); } finally { setLoading(false); }
    })();
  }, [branch, semester]);

  return (
    <div>
      <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2"><BookOpen size={18} className="text-primary" /> Study Resources</h2>
      {loading ? <LoadingState text="Loading resources…" /> : resources.length === 0 ? <EmptyState text="No resources uploaded yet." /> : (
        <div className="space-y-3">
          {resources.map(r => (
            <div key={r.id} className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:border-primary/30 transition-all group">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <BookMarked size={16} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground text-sm truncate">{r.title}</p>
                <p className="text-xs text-muted-foreground">{r.subject} · {r.created_at ? new Date(r.created_at).toLocaleDateString() : ""}</p>
              </div>
              <a href={r.file_url} target="_blank" rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all">
                <Download size={14} />
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Labs ───────────────────────────────────────────────────────────
function LabsSection() {
  return (
    <div>
      <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2"><FlaskConical size={18} className="text-primary" /> Lab Availability</h2>
      <div className="grid sm:grid-cols-2 gap-4">
        {labs.map(lab => (
          <div key={lab.name} className="p-5 rounded-xl border border-border bg-card">
            <div className="flex items-start justify-between mb-2">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><FlaskConical size={18} className="text-primary" /></div>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${lab.available?"bg-emerald-500/15 text-emerald-600 dark:text-emerald-400":"bg-red-500/15 text-red-500"}`}>
                {lab.available ? "Available" : "Occupied"}
              </span>
            </div>
            <h4 className="font-semibold text-foreground text-sm mt-2">{lab.name}</h4>
            <p className="text-xs text-muted-foreground">{lab.floor} Floor · {lab.seats} seats</p>
            {lab.currentClass && <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">{lab.currentClass}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Complaints ─────────────────────────────────────────────────────
function ComplaintsSection({ userId, rollNumber, onNewActivity }: { userId: string; rollNumber: string; onNewActivity: () => void }) {
  const [showForm, setShowForm] = useState(false);
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ category: "", subject: "", description: "" });

  const loadTickets = useCallback(async () => {
    if (!userId) return;
    try { const { fetchTickets } = await import("@/api/tickets"); setTickets(await fetchTickets(userId, "student")); }
    catch(e) { console.error(e); }
  }, [userId]);

  useEffect(() => { loadTickets().finally(() => setLoading(false)); }, [loadTickets]);

  const handleSubmit = async () => {
    if (!form.category || !form.subject) { alert("Category and subject required"); return; }
    setSubmitting(true);
    try {
      const { submitComplaint } = await import("@/api/tickets");
      const r = await submitComplaint({ category: form.category, subject: form.subject, description: form.description, studentId: userId, studentRollNo: rollNumber });
      if (r.success) { setForm({ category:"", subject:"", description:"" }); setShowForm(false); await loadTickets(); }
      else alert("Failed: " + r.message);
    } catch(e) { console.error(e); } finally { setSubmitting(false); }
  };

  const handleMarkResolved = async (id: string) => {
    const { updateTicketStatus } = await import("@/api/tickets");
    const { error } = await updateTicketStatus(id, "Resolved", userId, "student");
    if (error) { alert("Error: "+error.message); return; }
    setTickets(prev => prev.map(t => t.id===id ? { ...t, status:"Resolved" } : t));
  };

  const inputCls = "w-full px-3 py-2 rounded-lg border border-border bg-input text-foreground text-sm focus:outline-none focus:border-primary";

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2"><MessageSquare size={18} className="text-primary" /> Complaints & Tickets</h2>
        <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:-translate-y-0.5 transition-all">
          {showForm ? "Cancel" : "+ New Ticket"}
        </button>
      </div>
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:"auto" }} exit={{ opacity:0, height:0 }}
            className="mb-4 p-4 rounded-xl border border-primary/30 bg-primary/5 space-y-3 overflow-hidden">
            <select value={form.category} onChange={e=>setForm({...form,category:e.target.value})} className={inputCls}>
              <option value="">Select Category</option>
              {["Infrastructure","Academic","Facility","IT Support","WiFi","Other"].map(c=><option key={c}>{c}</option>)}
            </select>
            <input placeholder="Subject" value={form.subject} onChange={e=>setForm({...form,subject:e.target.value})} className={inputCls}/>
            <textarea rows={3} placeholder="Describe the issue…" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} className={`${inputCls} resize-none`}/>
            <div className="flex gap-2">
              <button onClick={handleSubmit} disabled={submitting} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold disabled:opacity-50">
                {submitting ? "Submitting…" : "Submit Ticket"}
              </button>
              <button onClick={()=>setShowForm(false)} className="px-4 py-2 rounded-lg bg-muted text-muted-foreground text-xs font-semibold">Cancel</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {loading ? <LoadingState text="Loading tickets…" /> : tickets.length===0 ? <EmptyState text="No complaints submitted yet." /> : (
        <div className="space-y-3">
          {tickets.map(t => (
            <div key={t.id} className="p-4 rounded-xl border border-border bg-card">
              <div className="flex items-start justify-between gap-2 mb-1">
                <div>
                  <span className="text-[10px] font-mono text-muted-foreground">{t.id?.slice(0,8).toUpperCase()}</span>
                  <p className="font-semibold text-foreground text-sm">{t.subject}</p>
                </div>
                <StatusBadge status={t.status}/>
              </div>
              <div className="flex gap-3 text-xs text-muted-foreground">
                <span>{t.category}</span><span>·</span>
                <span>{t.created_at ? new Date(t.created_at).toLocaleDateString() : ""}</span>
              </div>
              {t.status==="In Progress" && (
                <button onClick={()=>handleMarkResolved(t.id)}
                  className="mt-2 flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 hover:underline">
                  <Check size={11}/> Mark as Resolved
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Digital ID Card ────────────────────────────────────────────────
function IDCardSection({ student }: { student: StudentProfile }) {
  const [photoPreview, setPhotoPreview] = useState<string|null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handlePrint = () => {
    const el = document.getElementById("student-id-card");
    if (!el) return;
    const win = window.open("","_blank","width=400,height=620");
    if (!win) return;
    win.document.write(`<html><head><title>ID — ${student.name}</title><style>body{font-family:sans-serif;padding:0;margin:0;background:#fff;color:#0f0f0f}*{box-sizing:border-box}</style></head><body>${el.innerHTML}</body></html>`);
    win.document.close(); win.focus(); win.print(); win.close();
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2"><CreditCard size={18} className="text-primary"/> Digital ID Card</h2>
      <div className="max-w-sm mx-auto">
        <div id="student-id-card" className="rounded-2xl overflow-hidden border border-border shadow-xl">
          <div className="bg-primary px-6 py-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary-foreground/20 flex items-center justify-center"><GraduationCap size={18} className="text-primary-foreground"/></div>
            <div><p className="font-bold text-primary-foreground text-sm">AIMS</p><p className="text-[10px] text-primary-foreground/70">Academic Infrastructure Management</p></div>
          </div>
          <div className="bg-card px-6 py-5 space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-primary/15 flex items-center justify-center border-2 border-primary/20 flex-shrink-0 overflow-hidden cursor-pointer relative group"
                onClick={()=>fileRef.current?.click()} title="Click to upload photo">
                {photoPreview
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={photoPreview} alt="Student" className="w-full h-full object-cover"/>
                  : <span className="text-xl font-bold text-primary">{student.initials}</span>}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-[10px]">
                  <Upload size={16} className="text-white"/>
                </div>
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden"
                onChange={e=>{const f=e.target.files?.[0];if(f)setPhotoPreview(URL.createObjectURL(f));}}/>
              <div>
                <p className="font-bold text-foreground">{student.name}</p>
                <p className="text-xs text-primary font-medium">{student.branch} — {student.yearLabel}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{student.semester} Semester</p>
              </div>
            </div>
            <div className="h-px bg-border"/>
            <div className="space-y-2.5 text-sm">
              <div className="flex items-center gap-2"><Hash size={13} className="text-primary flex-shrink-0"/><span className="font-mono text-foreground font-medium text-xs">{student.rollNumber}</span></div>
              <div className="flex items-center gap-2"><Mail size={13} className="text-primary flex-shrink-0"/><span className="text-foreground text-xs">{student.email}</span></div>
              {student.phone&&<div className="flex items-center gap-2"><Phone size={13} className="text-primary flex-shrink-0"/><span className="text-foreground text-xs">{student.phone}</span></div>}
            </div>
            <div className="h-px bg-border"/>
            <div className="flex items-center justify-between">
              <div className="text-xs"><p className="text-muted-foreground">Valid For</p><p className="font-semibold text-foreground">Academic Year 2025–26</p></div>
              <div className="w-14 h-14 rounded-lg bg-muted flex items-center justify-center border border-border">
                <div className="grid grid-cols-3 gap-0.5">
                  {Array.from({length:9}).map((_,i)=><div key={i} className={`w-2.5 h-2.5 rounded-[2px] ${i%3!==1?"bg-foreground":"bg-transparent"}`}/>)}
                </div>
              </div>
            </div>
          </div>
          <div className="bg-primary/5 px-6 py-2.5 border-t border-border">
            <p className="text-[10px] text-center text-muted-foreground">Present at security checkpoint when required.</p>
          </div>
        </div>
        <button onClick={handlePrint}
          className="mt-3 w-full py-2.5 rounded-xl border border-border bg-card text-sm text-muted-foreground hover:text-primary hover:border-primary/40 transition-all flex items-center justify-center gap-2">
          <Download size={14}/> Download / Print ID Card
        </button>
      </div>
    </div>
  );
}

// ── Notifications ──────────────────────────────────────────────────
function NotificationsSection({ branch, yearForDB }: { branch: string; yearForDB: string }) {
  const [notices, setNotices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try { const { fetchNotices } = await import("@/api/timetable"); setNotices(await fetchNotices() || []); }
      catch(e) { console.error(e); } finally { setLoading(false); }
    })();
  }, []);

  return (
    <div>
      <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2"><Bell size={18} className="text-primary"/> Notifications</h2>
      {loading ? <LoadingState /> : notices.length===0 ? <EmptyState text="No notices yet."/> : (
        <div className="space-y-3">
          {notices.map(n=>{
            const isUrgent = n.priority==="High";
            return (
              <div key={n.id} className={`p-4 rounded-xl border ${isUrgent?"bg-red-500/10 border-red-500/20":"bg-primary/10 border-primary/20"}`}>
                <div className="flex items-start gap-3">
                  {isUrgent?<AlertCircle size={16} className="text-red-500 mt-0.5 flex-shrink-0"/>:<Bell size={16} className="text-primary mt-0.5 flex-shrink-0"/>}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground text-sm">{n.title}</p>
                    {n.content&&<p className="text-xs text-muted-foreground mt-0.5">{n.content}</p>}
                    <p className="text-xs text-muted-foreground mt-1">{n.audience}</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground flex-shrink-0">{n.created_at?new Date(n.created_at).toLocaleDateString():""}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Profile ────────────────────────────────────────────────────────
function ProfileSection({ student }: { student: StudentProfile }) {
  return (
    <div>
      <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2"><User size={18} className="text-primary"/> My Profile</h2>
      <div className="max-w-lg">
        <div className="p-6 rounded-2xl border border-border bg-card">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 rounded-2xl bg-primary/15 flex items-center justify-center border-2 border-primary/20">
              <span className="text-2xl font-bold text-primary">{student.initials}</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">{student.name}</h3>
              <p className="text-sm text-primary">{student.branch} · {student.yearLabel}</p>
              <p className="text-xs text-muted-foreground mt-1">{student.rollNumber}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[["Branch",student.branch],["Semester",student.semester],["Year",student.yearLabel],["Section",student.section||"—"],["Email",student.email],["Phone",student.phone||"—"]].map(([label,value])=>(
              <div key={label} className={`p-3 rounded-xl bg-muted/50 ${label==="Email"||label==="Phone"?"col-span-2":""}`}>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="font-medium text-foreground mt-0.5 text-sm break-all">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Dashboard ─────────────────────────────────────────────────
export default function StudentDashboard() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState("timetable");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [student, setStudent] = useState<StudentProfile|null>(null);
  const [badges, setBadges] = useState<BadgeMap>({});

  // ── Auth guard + profile ───────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const { getCurrentUser } = await import("@/api/auth");
        const userData = await getCurrentUser();
        if (!userData?.user) { router.replace("/login"); return; }
        const u = userData.user;
        if (u.role==="teacher") { router.replace("/dashboard/teacher"); return; }

        const rollNo = u.roll_no || "";
        let name = (u as any).name || u.email?.split("@")[0] || "Student";
        let semester = u.semester || "6th";
        let section = ""; let phone = "";

        try {
          const { fetchStudentByRollNo } = await import("@/api/users");
          if (rollNo) {
            const sd = await fetchStudentByRollNo(rollNo);
            if (sd) { name=(sd as any).name||name; semester=(sd as any).semester||semester; section=(sd as any).section||""; phone=(sd as any).phone||""; }
          }
        } catch(_) {}

        const semNum = parseInt(semester.replace(/\D/g,"")) || 6;
        const year = semNum<=2?"FY":semNum<=4?"SY":"TY";
        setStudent({
          id:u.id, name, rollNumber:rollNo, branch:u.branch||"CSE", semester,
          year, yearForDB:YEAR_TO_DB[year]||"3rd Year", yearLabel:semNum<=2?"1st Year":semNum<=4?"2nd Year":"3rd Year",
          email:u.email||"", phone, section,
          initials:name.split(" ").map((n:string)=>n[0]).join("").toUpperCase().slice(0,2),
        });
      } catch(err) { console.error(err); router.replace("/login"); }
      finally { setAuthLoading(false); }
    })();
  }, [router]);

  // ── Real-time subscriptions ────────────────────────────────────
  useEffect(() => {
    if (!student) return;
    const ch = supabase.channel(`student-live-${student.id}`)
      .on("postgres_changes", { event:"INSERT", schema:"public", table:"notices" }, () => {
        if (activeSection!=="notifications") setBadges(b=>({...b, notifications:(b.notifications||0)+1}));
      })
      .on("postgres_changes", { event:"UPDATE", schema:"public", table:"tickets" }, (payload:any) => {
        if (payload.new?.student_id===student.id && activeSection!=="complaints")
          setBadges(b=>({...b, complaints:(b.complaints||0)+1}));
      })
      .on("postgres_changes", { event:"INSERT", schema:"public", table:"timetable_entries" }, (payload:any) => {
        if (payload.new?.branch===student.branch && activeSection!=="timetable")
          setBadges(b=>({...b, timetable:(b.timetable||0)+1}));
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [student?.id, student?.branch, activeSection]);

  const handleSectionChange = (id: string) => {
    setActiveSection(id);
    setSidebarOpen(false);
    setBadges(b=>({...b, [id]:0}));
  };

  if (authLoading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 size={32} className="animate-spin text-primary"/>
        <p className="text-sm text-muted-foreground">Verifying session…</p>
      </div>
    </div>
  );

  if (!student) return null;

  const sections: Record<string,React.ReactNode> = {
    timetable:     <TimetableSection branch={student.branch} yearForDB={student.yearForDB}/>,
    marks:         <MarksSection rollNumber={student.rollNumber}/>,
    results:       <SemesterResultsSection semester={student.semester}/>,
    resources:     <ResourcesSection branch={student.branch} semester={student.semester}/>,
    labs:          <LabsSection/>,
    complaints:    <ComplaintsSection userId={student.id} rollNumber={student.rollNumber} onNewActivity={()=>setBadges(b=>({...b,complaints:(b.complaints||0)+1}))}/>,
    idcard:        <IDCardSection student={student}/>,
    notifications: <NotificationsSection branch={student.branch} yearForDB={student.yearForDB}/>,
    profile:       <ProfileSection student={student}/>,
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-sidebar-border flex flex-col transition-transform duration-300 lg:translate-x-0 ${sidebarOpen?"translate-x-0":"-translate-x-full"}`}>
        <div className="h-16 flex items-center gap-2.5 px-4 border-b border-sidebar-border">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-md"><GraduationCap size={16} className="text-primary-foreground"/></div>
          <div><p className="font-bold text-sm text-sidebar-foreground">AIMS</p><p className="text-[9px] text-sidebar-foreground/50 uppercase tracking-widest">Student Portal</p></div>
          <button onClick={()=>setSidebarOpen(false)} className="ml-auto lg:hidden text-muted-foreground"><X size={16}/></button>
        </div>
        <div className="px-4 py-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-primary">{student.initials}</span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-sidebar-foreground truncate">{student.name}</p>
              <p className="text-xs text-sidebar-foreground/50">{student.rollNumber}</p>
            </div>
          </div>
          <div className="mt-2 flex gap-1.5">
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/15 text-primary font-medium">{student.year}</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">{student.branch}</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">Sem {student.semester.replace(/\D/g,"")}</span>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {sidebarItems.map(item=>(
            <button key={item.id} onClick={()=>handleSectionChange(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all relative ${activeSection===item.id?"bg-primary text-primary-foreground shadow-sm":"text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"}`}>
              <item.icon size={16}/>{item.label}
              {(badges[item.id]||0) > 0 && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                  {badges[item.id]>9?"9+":badges[item.id]}
                </span>
              )}
            </button>
          ))}
        </nav>
        <div className="px-3 pb-4 space-y-1">
          <Link href="/" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-all">
            <Home size={16}/>Back to Home
          </Link>
          <button onClick={async()=>{const{logoutUser}=await import("@/api/auth");await logoutUser();router.push("/login");}}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-500/10 transition-all">
            <LogOut size={16}/>Logout
          </button>
        </div>
      </aside>

      {sidebarOpen&&<div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={()=>setSidebarOpen(false)}/>}

      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        <header className="h-16 border-b border-border bg-card/80 backdrop-blur sticky top-0 z-30 flex items-center px-4 gap-3">
          <button className="lg:hidden w-9 h-9 rounded-lg border border-border flex items-center justify-center" onClick={()=>setSidebarOpen(true)}><Menu size={16}/></button>
          <div className="flex-1">
            <h1 className="font-semibold text-foreground">{sidebarItems.find(i=>i.id===activeSection)?.label||"Dashboard"}</h1>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle/>
            <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
              <span className="text-xs font-bold text-primary">{student.initials}</span>
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6">
          <AnimatePresence mode="wait">
            <motion.div key={activeSection} initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-12}} transition={{duration:0.22}}>
              {sections[activeSection]}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
