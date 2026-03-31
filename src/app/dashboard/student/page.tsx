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
  Edit2, Save, XCircle, Camera, Plus, Table2, Users as UsersIcon
} from "lucide-react";
import { getBranchLabel, getBranchKey, BRANCH_MAP } from "@/lib/constants";
import { ThemeToggle } from "@/components/theme-toggle";
import { supabase } from "@/lib/supabaseClient";

// ── Types ──────────────────────────────────────────────────────────
interface StudentProfile {
  id: string; name: string; rollNumber: string; branch: string;
  semester: string; year: string; yearLabel: string;
  email: string; phone: string; section: string; initials: string;
  photoUrl: string | null;
}

type BadgeMap = Record<string, number>;



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

// ── Avatar Component ────────────────────────────────────────────
function Avatar({ photoUrl, initials, size = 36, className = "" }: { photoUrl?: string | null; initials: string; size?: number; className?: string }) {
  return (
    <div className={`rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border-2 border-primary/20 overflow-hidden flex-shrink-0 ${className}`}
      style={{ width: size, height: size }}>
      {photoUrl
        // eslint-disable-next-line @next/next/no-img-element
        ? <img src={photoUrl} alt="Profile" className="w-full h-full object-cover" />
        : <span className="font-bold text-primary" style={{ fontSize: size * 0.35 }}>{initials}</span>}
    </div>
  );
}

// ── Timetable Section (live from DB by branch+year) ────────────────
const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday"];

function TimetableSection({ branch, semester }: { branch: string; semester: string }) {
  const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
  const [activeDay, setActiveDay] = useState(DAYS.includes(today) ? today : "Monday");
  const [allEntries, setAllEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { fetchClassTimetable } = await import("@/api/timetable_entries");
        setAllEntries(await fetchClassTimetable(getBranchKey(branch), semester));
      } catch(e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, [branch, semester]);

  const dayEntries = allEntries
    .filter(e => e.day_of_week === activeDay)
    .sort((a, b) => a.start_time.localeCompare(b.start_time));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
              <Calendar size={20} />
            </span>
            Schedule
          </h2>
          <p className="text-sm text-muted-foreground mt-1 ml-13">Classes for {branch} — Semester {semester}</p>
        </div>
      </div>

      <div className="flex gap-2.5 overflow-x-auto pb-4 scrollbar-hide">
        {DAYS.map(d => (
          <button key={d} onClick={() => setActiveDay(d)}
            className={`flex-shrink-0 px-6 py-2.5 rounded-2xl text-sm font-bold transition-all duration-300 relative overflow-hidden ${activeDay === d ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-105" : "bg-card/50 text-muted-foreground hover:bg-card border border-border/50 hover:border-primary/30"}`}>
            {d.slice(0, 3)}
            {activeDay === d && <motion.div layoutId="day-accent" className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white opacity-60" />}
          </button>
        ))}
      </div>

      {loading ? <LoadingState text="Fetching your schedule…" /> : dayEntries.length === 0 ? (
        <EmptyState text="Clear schedule! No classes listed for today yet." />
      ) : (
        <div className="grid gap-4">
          <AnimatePresence mode="wait">
            {dayEntries.map((slot, i) => (
              <motion.div 
                key={slot.id ?? i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="group relative flex items-center gap-6 p-5 rounded-3xl border border-border/50 bg-card/40 backdrop-blur-md hover:border-primary/40 hover:bg-card/60 transition-all duration-300 shadow-sm"
              >
                <div className="flex flex-col items-center justify-center w-24 flex-shrink-0 py-2 rounded-2xl bg-primary/[0.03] border border-primary/5">
                  <span className="text-xs font-bold text-primary uppercase tracking-tight">{slot.start_time}</span>
                  <div className="w-px h-3 bg-primary/20 my-1" />
                  <span className="text-[10px] font-bold text-muted-foreground/60">{slot.end_time}</span>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-foreground text-base tracking-tight truncate">{slot.subject}</h4>
                    <span className="px-2 py-0.5 rounded-lg bg-muted text-[10px] font-bold text-muted-foreground uppercase">{slot.class_name}</span>
                  </div>
                  <p className="text-xs text-muted-foreground font-medium flex items-center gap-1.5 grayscale group-hover:grayscale-0 transition-all">
                    <User size={12} className="text-primary/70" /> {slot.teacher_name || "Assigned Faculty"}
                  </p>
                </div>

                <div className="hidden sm:flex flex-col items-end gap-2">
                   <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-accent/10 border border-accent/20">
                     <Hash size={12} className="text-accent-foreground/70" />
                     <span className="text-xs font-bold text-accent-foreground tracking-tight">{slot.room}</span>
                   </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
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
  
  const getGradeTheme = (p: number) => {
    if (p >= 80) return { color: "text-emerald-500", bg: "bg-emerald-500", light: "bg-emerald-500/10", border: "border-emerald-500/20" };
    if (p >= 60) return { color: "text-amber-500", bg: "bg-amber-500", light: "bg-amber-500/10", border: "border-amber-500/20" };
    return { color: "text-rose-500", bg: "bg-rose-500", light: "bg-rose-500/10", border: "border-rose-500/20" };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2 gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
              <BarChart2 size={20} />
            </span>
            Performance
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Unit test results and academic tracking</p>
        </div>
        {subjects.length > 0 && (
          <select value={filterSubject} onChange={e => setFilterSubject(e.target.value)}
            className="px-4 py-2 rounded-2xl border border-border bg-card/50 backdrop-blur-md text-foreground text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all outline-none">
            <option value="All">All Subjects</option>
            {subjects.map(s => <option key={s}>{s}</option>)}
          </select>
        )}
      </div>

      {loading ? <LoadingState text="Analyzing performance data…" /> : filtered.length === 0 ? <EmptyState text="No evaluation records found for this semester." /> : (
        <div className="grid gap-4">
          {filtered.map((m, idx) => {
            const p = (m.marks/m.max_marks)*100;
            const theme = getGradeTheme(p);
            return (
              <motion.div 
                key={m.id || idx}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.04 }}
                className="p-6 rounded-[32px] border border-border/50 bg-card/40 backdrop-blur-md hover:border-primary/30 transition-all group overflow-hidden relative shadow-sm"
              >
                <div className={`absolute top-0 right-0 w-32 h-32 ${theme.light} rounded-full blur-3xl -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                
                <div className="flex flex-col md:flex-row md:items-center gap-6 relative z-10">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <h4 className="font-bold text-foreground text-lg tracking-tight truncate">{m.subject}</h4>
                      <span className={`px-2 py-0.5 rounded-lg ${theme.light} ${theme.color} text-[10px] font-bold uppercase border ${theme.border}`}>
                        {m.test_name}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground font-bold tracking-wide uppercase opacity-60">Session 2024–25</p>
                  </div>

                  <div className="flex items-center gap-8 border-l border-border/50 pl-0 md:pl-8">
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase mb-0.5 opacity-60">Score</p>
                      <div className="flex items-baseline gap-1">
                        <span className={`text-3xl font-bold tracking-tight ${theme.color}`}>{m.marks}</span>
                        <span className="text-sm font-bold text-muted-foreground/40">/{m.max_marks}</span>
                      </div>
                    </div>

                    <div className="w-32 space-y-2">
                       <div className="flex justify-between items-end">
                         <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">Progress</span>
                         <span className={`text-xs font-bold ${theme.color}`}>{Math.round(p)}%</span>
                       </div>
                       <div className="h-2 rounded-full bg-muted/40 overflow-hidden border border-border/10">
                         <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${p}%` }}
                            transition={{ duration: 1, delay: idx * 0.1, ease: "circOut" }}
                            className={`h-full rounded-full ${theme.bg} shadow-[0_0_12px_rgba(0,0,0,0.1)]`} 
                          />
                       </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Semester Results ───────────────────────────────────────────────
function SemesterResultsSection({ semester }: { semester: string }) {
  const semNum = parseInt(semester.replace(/\D/g,"")) || 6;
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-3">
        <span className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
          <Award size={20} />
        </span>
        Results
      </h2>
      
      <div className="p-8 rounded-[32px] border border-border/50 bg-card/40 backdrop-blur-md space-y-8 relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -mr-32 -mt-32" />
        
        <div className="flex items-start gap-4 p-5 rounded-2xl bg-amber-500/5 border border-amber-500/10 relative z-10">
          <AlertCircle size={20} className="text-amber-500 mt-1 flex-shrink-0" />
          <div className="space-y-1">
            <p className="font-bold text-amber-600 dark:text-amber-400 text-sm italic">University Disclaimer</p>
            <p className="text-xs text-muted-foreground leading-relaxed font-medium">
              Official semester marksheets are issued and managed by the University Portal. The data below is for internal tracking and quick reference only.
            </p>
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-4 opacity-60">Academic Progress</p>
          <div className="flex flex-wrap gap-2.5">
            {["1st","2nd","3rd","4th","5th","6th"].map((sem, i) => (
              <span key={sem} className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all duration-300 ${i+1===semNum?"bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20 scale-105":"bg-muted/40 text-muted-foreground border-border/50 opacity-60"}`}>
                Semester {sem}
              </span>
            ))}
          </div>
        </div>

        <a href="https://ubterex.in/" target="_blank" rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-bold text-sm shadow-xl shadow-primary/20 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/30 transition-all group relative z-10">
          <ExternalLink size={18} className="group-hover:rotate-12 transition-transform" /> 
          Access University Portal
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
<<<<<<< HEAD
      try { const { fetchResources } = await import("@/api/resources"); setResources(await fetchResources(undefined, semester||undefined, branch||undefined)); }
=======
      try { const { fetchResources } = await import("@/api/resources"); setResources(await fetchResources(getBranchLabel(branch)||undefined, semester||undefined, undefined)); }
>>>>>>> 5a15271eeff93dbebaba0c35e012ac29322b9f3a
      catch(e) { console.error(e); } finally { setLoading(false); }
    })();
  }, [branch, semester]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-3">
        <span className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
          <BookOpen size={20} />
        </span>
        Knowledge Hub
      </h2>
      {loading ? <LoadingState text="Curating resources…" /> : resources.length === 0 ? <EmptyState text="No study materials available for your current branch/semester yet." /> : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {resources.map((r, i) => (
            <motion.div 
              key={r.id} 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="flex flex-col p-6 rounded-[28px] border border-border/50 bg-card/40 backdrop-blur-md hover:border-primary/40 hover:bg-card/60 hover:-translate-y-1 transition-all duration-300 group shadow-sm"
            >
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-primary/20 transition-all shadow-inner">
                <BookMarked size={22} className="text-primary" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-foreground text-sm tracking-tight line-clamp-2 leading-tight mb-1">{r.title}</h4>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider opacity-60 mb-3">{r.subject}</p>
                <div className="flex items-center gap-2 text-[10px] font-medium text-muted-foreground/60 mb-4">
                  <Calendar size={10} /> {new Date(r.created_at).toLocaleDateString()}
                </div>
              </div>
              <a href={r.file_url} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-primary/5 border border-primary/20 text-xs font-bold text-primary hover:bg-primary hover:text-white transition-all shadow-sm">
                <Download size={14} /> Download File
              </a>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Labs ───────────────────────────────────────────────────────────
function LabsSection() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-3">
        <span className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
          <FlaskConical size={20} />
        </span>
        Laboratory Status
      </h2>
      <div className="grid sm:grid-cols-2 gap-4">
        {labs.map((lab, idx) => (
          <motion.div 
            key={lab.name} 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="p-6 rounded-[32px] border border-border/50 bg-card/40 backdrop-blur-md hover:border-primary/20 hover:bg-card/60 transition-all group relative overflow-hidden shadow-sm"
          >
            <div className={`absolute top-0 right-0 w-2 h-full ${lab.available ? "bg-emerald-500/20" : "bg-rose-500/20"}`} />
            
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                <FlaskConical size={22} className="text-primary" />
              </div>
              <span className={`text-[10px] font-bold tracking-wider uppercase px-3 py-1 rounded-full border ${lab.available ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-rose-500/10 text-rose-500 border-rose-500/20"}`}>
                {lab.available ? "Ready" : "In Use"}
              </span>
            </div>
            
            <h4 className="font-bold text-foreground text-base tracking-tight mb-1">{lab.name}</h4>
            <div className="flex items-center gap-3 text-xs font-bold text-muted-foreground opacity-60">
              <span className="flex items-center gap-1.5"><Table2 size={12}/> {lab.floor} Floor</span>
              <span className="w-1 h-1 rounded-full bg-border" />
              <span className="flex items-center gap-1.5"><UsersIcon size={12}/> {lab.seats} Units</span>
            </div>

            {!lab.available && lab.currentClass && (
              <div className="mt-5 p-3 rounded-2xl bg-rose-500/5 border border-rose-500/10 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                <p className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">{lab.currentClass}</p>
              </div>
            )}
          </motion.div>
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

  const handleDeleteTicket = async (id: string) => {
    if (!confirm("Remove this ticket from your history?")) return;
    try {
      const { deleteTicket } = await import("@/api/tickets");
      await deleteTicket(id);
      setTickets(prev => prev.filter(t => t.id !== id));
    } catch (e) { console.error(e); }
  };

  const inputCls = "w-full px-4 py-3 rounded-2xl border border-border bg-card/50 backdrop-blur-md text-foreground text-sm font-medium focus:outline-none focus:border-primary/50 transition-all";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
              <MessageSquare size={20} />
            </span>
            Help Desk
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Submit and track your academic concerns</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="px-6 py-2.5 rounded-2xl bg-primary text-primary-foreground text-sm font-bold hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/30 transition-all flex items-center gap-2">
           {showForm ? <XCircle size={18}/> : <Plus size={18}/>}
           {showForm ? "Close" : "New Ticket"}
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity:0, y: -20, scale: 0.95 }} animate={{ opacity:1, y: 0, scale: 1 }} exit={{ opacity:0, y: -20, scale: 0.95 }}
            className="p-8 rounded-[32px] border border-primary/30 bg-primary/[0.03] backdrop-blur-md space-y-4 overflow-hidden shadow-xl shadow-primary/5">
            <div className="grid sm:grid-cols-2 gap-4">
               <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1">Issue Category</label>
                  <select value={form.category} onChange={e=>setForm({...form,category:e.target.value})} className={inputCls}>
                    <option value="">Select Category</option>
                    {["Infrastructure","Academic","Facility","IT Support","WiFi","Other"].map(c=><option key={c}>{c}</option>)}
                  </select>
               </div>
               <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1">Brief Subject</label>
                  <input placeholder="Short summary" value={form.subject} onChange={e=>setForm({...form,subject:e.target.value})} className={inputCls}/>
               </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1">Detailed Description</label>
              <textarea rows={4} placeholder="Please provide specific details about the issue…" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} className={`${inputCls} resize-none`}/>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={handleSubmit} disabled={submitting} className="px-8 py-3 rounded-2xl bg-primary text-primary-foreground text-sm font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all disabled:opacity-50">
                {submitting ? "Processing…" : "Dispatch Ticket"}
              </button>
              <button onClick={()=>setShowForm(false)} className="px-8 py-3 rounded-2xl bg-muted/50 text-muted-foreground text-sm font-bold hover:bg-muted transition-all">Discard</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? <LoadingState text="Syncing tickets…" /> : tickets.length===0 ? <EmptyState text="You have a clean history! No active tickets." /> : (
        <div className="grid sm:grid-cols-2 gap-4">
          {tickets.map((t, idx) => (
            <motion.div 
              key={t.id} 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              className="p-6 rounded-[28px] border border-border/50 bg-card/40 backdrop-blur-md hover:border-primary/30 transition-all group overflow-hidden relative shadow-sm"
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-primary/60 tracking-wider uppercase">#{t.id?.slice(0,6)}</span>
                  <h4 className="font-bold text-foreground text-base tracking-tight leading-tight">{t.subject}</h4>
                </div>
                <StatusBadge status={t.status}/>
              </div>
              
              <div className="flex items-center gap-4 mb-5 pb-5 border-b border-border/40 text-[10px] font-bold text-muted-foreground uppercase tracking-wider opacity-60">
                <span className="px-2 py-1 rounded bg-muted/60">{t.category}</span>
                <span className="w-1 h-1 rounded-full bg-border" />
                <span>{new Date(t.created_at).toLocaleDateString()}</span>
              </div>

              {t.status==="In Progress" && (
                <button onClick={()=>handleMarkResolved(t.id)}
                  className="flex items-center gap-2 text-xs font-bold text-emerald-500 hover:text-emerald-600 transition-colors group/btn">
                  <Check size={16} className="p-0.5 rounded-full bg-emerald-500/10 group-hover/btn:bg-emerald-500/20 transition-all"/>
                  Mark as Resolved
                </button>
              )}
              {t.status==="Resolved" && (
                <button onClick={()=>handleDeleteTicket(t.id)}
                  className="flex items-center gap-2 text-xs font-bold text-red-500 hover:text-red-600 transition-colors group/btn mt-2">
                  <Trash2 size={16} className="p-0.5 rounded-full bg-red-500/10 group-hover/btn:bg-red-500/20 transition-all"/>
                  Delete Ticket
                </button>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Digital ID Card (with PDF download) ────────────────────────────
function IDCardSection({ student }: { student: StudentProfile }) {
  const [downloading, setDownloading] = useState(false);

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");
      const el = document.getElementById("student-id-card");
      if (!el) return;
      const canvas = await html2canvas(el, { scale: 3, useCORS: true, backgroundColor: null });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: [86, 140] });
      pdf.addImage(imgData, "PNG", 0, 0, 86, 140, undefined, "FAST");
      pdf.save(`ID-CARD-${student.rollNumber}.pdf`);
    } catch (e) { console.error("PDF generation error:", e); alert("Failed to generate PDF. Please try again."); }
    finally { setDownloading(false); }
  };

  return (
    <div className="space-y-8">
      <div className="text-center md:text-left">
        <h2 className="text-2xl font-bold text-foreground tracking-tight flex items-center justify-center md:justify-start gap-3">
          <span className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
            <CreditCard size={20} />
          </span>
          UGIP
        </h2>
        <p className="text-sm text-muted-foreground mt-1">Verified academic identification card</p>
      </div>

      <div className="max-w-md mx-auto perspective-1000">
        <motion.div 
          initial={{ rotateY: 20, opacity: 0 }}
          animate={{ rotateY: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          id="student-id-card" 
          className="rounded-[32px] overflow-hidden border border-white/20 shadow-2xl bg-gradient-to-br from-card to-card/50 backdrop-blur-3xl relative"
        >
          {/* Decorative glass elements */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl -mr-24 -mt-24 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent/10 rounded-full blur-2xl -ml-16 -mb-16 pointer-events-none" />
          
          {/* Header */}
          <div className="bg-primary/90 backdrop-blur-md px-8 py-6 flex items-center gap-4 border-b border-white/10 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-lg flex items-center justify-center border border-white/20 shadow-inner">
              <GraduationCap size={24} className="text-white"/>
            </div>
            <div className="flex-1">
              <h3 className="text-white font-bold text-lg tracking-tight leading-none uppercase">UGIP</h3>
              <p className="text-white/60 text-[8px] font-bold tracking-[0.2em] mt-1 uppercase italic">Verification Secured</p>
            </div>
            <div className="text-right">
              <p className="text-white font-bold text-[10px] uppercase opacity-40">Branch</p>
              <p className="text-white font-bold text-[10px] uppercase">{getBranchLabel(student.branch)}</p>
            </div>
          </div>

          <div className="px-8 py-8 space-y-6 relative z-10">
            <div className="flex items-center gap-6">
              <div className="relative">
                <Avatar photoUrl={student.photoUrl} initials={student.initials} size={100} className="rounded-[28px] border-[3px] border-primary/20 shadow-lg shadow-primary/10 ring-4 ring-white/10" />
                <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl bg-emerald-500 border-4 border-card flex items-center justify-center shadow-lg">
                   <Check size={14} className="text-white" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-primary uppercase tracking-wider mb-0.5">Student Academic</p>
                <h3 className="font-bold text-foreground text-xl tracking-tight truncate leading-tight mb-1">{student.name}</h3>
                <p className="text-xs font-bold text-muted-foreground opacity-80">{student.branch} Department</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider opacity-60">Roll Number</p>
                <p className="font-mono text-sm font-bold text-foreground tracking-tight">{student.rollNumber}</p>
              </div>
              <div className="flex justify-between items-center py-2.5 border-b border-border/40">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Branch</p>
              <p className="text-[11px] font-bold text-foreground uppercase">{getBranchLabel(student.branch)}</p>
            </div>
              <div className="space-y-1">
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider opacity-60">Academic Year</p>
                <p className="text-sm font-bold text-foreground tracking-tight">{student.yearLabel}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider opacity-60">Section</p>
                <p className="text-sm font-bold text-foreground tracking-tight">{student.section || "N/A"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider opacity-60">Status</p>
                <p className="text-xs font-bold text-emerald-500 uppercase flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Active</p>
              </div>
            </div>

            <div className="pt-4 border-t border-border/40">
               <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-[0.2em] opacity-50">Authorized By</p>
                    <p className="text-[10px] font-serif italic text-foreground opacity-80">Principal, UGIP</p>
                  </div>
                  <div className="w-20 h-6 bg-muted/30 rounded border border-border/40 flex items-center justify-center">
                    <div className="w-full h-px bg-foreground/10 mx-2" />
                  </div>
               </div>
            </div>
          </div>

          {/* Footer chip */}
          <div className="bg-primary/5 px-8 py-3 border-t border-border/40 text-center">
            <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-[0.3em] opacity-40 italic">UBTER ( AICTE APPROVED )</p>
          </div>
        </motion.div>

        <button onClick={handleDownloadPDF} disabled={downloading}
          className="mt-6 w-full py-4 rounded-[24px] bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-bold text-sm shadow-xl shadow-primary/20 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/30 transition-all flex items-center justify-center gap-3 disabled:opacity-50 group">
          {downloading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Download size={18} className="group-hover:translate-y-0.5 transition-transform" />
          )}
          {downloading ? "Processing Asset…" : "Export Verification ID"}
        </button>
      </div>
    </div>
  );
}

// ── Notifications ──────────────────────────────────────────────────
function NotificationsSection({ branch, semester }: { branch: string; semester: string }) {
  const [notices, setNotices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try { const { fetchNotices } = await import("@/api/timetable"); setNotices(await fetchNotices(branch, semester) || []); }
      catch(e) { console.error(e); } finally { setLoading(false); }
    })();
  }, [branch, semester]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-3">
        <span className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
          <Bell size={20} />
        </span>
        Updates & Notices
      </h2>
      {loading ? <LoadingState text="Syncing announcement board…" /> : notices.length===0 ? <EmptyState text="Clean slate! No new announcements for your section."/> : (
        <div className="grid gap-3">
          {notices.map((n, i)=>{
            const isUrgent = n.priority==="High";
            return (
              <motion.div 
                key={n.id} 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`p-6 rounded-[28px] border transition-all hover:bg-card/60 relative overflow-hidden group ${isUrgent?"bg-rose-500/[0.03] border-rose-500/20 hover:border-rose-500/40":"bg-card/40 border-border/50 hover:border-primary/30"}`}
              >
                {isUrgent && <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-3xl -mr-12 -mt-12" />}
                
                <div className="flex items-start gap-4 p-x relative z-10">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-inner group-hover:scale-110 transition-transform ${isUrgent?"bg-rose-500/10 text-rose-500":"bg-primary/10 text-primary"}`}>
                    {isUrgent ? <AlertCircle size={18} /> : <Bell size={18} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-4 mb-1">
                      <h4 className={`font-bold text-sm tracking-tight ${isUrgent?"text-rose-600 dark:text-rose-400":"text-foreground"}`}>{n.title}</h4>
                      <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-wider">{new Date(n.created_at).toLocaleDateString()}</span>
                    </div>
                    {n.content && <p className="text-xs text-muted-foreground font-medium leading-relaxed mt-1 opacity-80">{n.content}</p>}
                    <div className="flex items-center gap-2 mt-4">
                      <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${isUrgent?"bg-rose-500/10 text-rose-500 border-rose-500/20":"bg-muted text-muted-foreground border-border/50"}`}>
                        {n.audience}
                      </span>
                      {isUrgent && <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-500 text-white animate-pulse">Urgent</span>}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Editable Profile ───────────────────────────────────────────────
function ProfileSection({ student, onUpdate }: { student: StudentProfile; onUpdate: (s: Partial<StudentProfile>) => void }) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [form, setForm] = useState({ phone: student.phone || "", email: student.email || "" });
  const fileRef = useRef<HTMLInputElement>(null);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { updateStudentProfile } = await import("@/api/users");
      const { error } = await updateStudentProfile(student.rollNumber, { phone: form.phone, email: form.email });
      if (error) { alert("Failed to save: " + error.message); return; }
      onUpdate({ phone: form.phone, email: form.email });
      setEditing(false);
    } catch(e) { console.error(e); }
    finally { setSaving(false); }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${student.rollNumber}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("student-photos").upload(path, file, { upsert: true });
      if (uploadError) { console.error("Photo upload error:", uploadError); alert("Failed to upload photo: " + uploadError.message); return; }
      const { data: urlData } = supabase.storage.from("student-photos").getPublicUrl(path);
      const photoUrl = urlData.publicUrl + "?t=" + Date.now();
      const { updateStudentProfile } = await import("@/api/users");
      await updateStudentProfile(student.rollNumber, { photo_url: photoUrl });
      onUpdate({ photoUrl });
    } catch(err) { console.error(err); }
    finally { setUploadingPhoto(false); }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-3">
        <span className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
          <User size={20} />
        </span>
        Account Settings
      </h2>
      
      <div className="max-w-4xl grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <div className="p-8 rounded-[40px] border border-border/50 bg-card/40 backdrop-blur-md text-center group relative overflow-hidden shadow-sm">
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-primary/10 to-transparent" />
            <div className="relative z-10">
              <div className="relative mx-auto w-32 h-32 mb-6 group cursor-pointer" onClick={()=>fileRef.current?.click()}>
                <Avatar photoUrl={student.photoUrl} initials={student.initials} size={128} className="rounded-[40px] border-[5px] border-card shadow-2xl ring-1 ring-primary/10" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all rounded-[40px] flex flex-col items-center justify-center text-white backdrop-blur-[2px]">
                   {uploadingPhoto ? <Loader2 size={24} className="animate-spin" /> : <Camera size={24} />}
                   <span className="text-[10px] font-bold uppercase tracking-wider mt-2">{uploadingPhoto ? "Syncing..." : "Change"}</span>
                </div>
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload}/>
              <h3 className="font-bold text-xl tracking-tight text-foreground leading-none">{student.name}</h3>
              <p className="text-xs font-bold text-muted-foreground mt-2 opacity-60 uppercase tracking-wider">Active Student</p>
            </div>
          </div>
          
          <div className="p-6 rounded-[32px] border border-border/50 bg-primary/[0.03] backdrop-blur-md">
             <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary"><Award size={16}/></div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-foreground">Verified ID</p>
             </div>
             <p className="font-mono text-sm font-bold text-primary/80 tracking-tight">{student.rollNumber}</p>
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="p-8 rounded-[40px] border border-border/50 bg-card/40 backdrop-blur-md shadow-sm">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-border/40">
              <h4 className="font-bold text-foreground text-base tracking-tight italic opacity-80">Academic Profile</h4>
              {!editing && (
                <button onClick={()=>setEditing(true)} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-primary hover:scale-105 transition-all">
                  <Edit2 size={12}/> Edit Details
                </button>
              )}
            </div>

            {editing ? (
              <div className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1">Personal Phone</label>
                    <input value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} className="w-full px-5 py-3.5 rounded-[20px] border border-border bg-background focus:ring-4 focus:ring-primary/10 transition-all font-bold text-sm" placeholder="+91 00000 00000" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1">Email Address</label>
                    <input value={form.email} onChange={e=>setForm({...form,email:e.target.value})} className="w-full px-5 py-3.5 rounded-[20px] border border-border bg-background focus:ring-4 focus:ring-primary/10 transition-all font-bold text-sm" placeholder="student@example.com" />
                  </div>
                </div>
                <div className="flex gap-3 pt-4 border-t border-border/40">
                   <button onClick={handleSave} disabled={saving} className="px-8 py-3.5 rounded-2xl bg-primary text-primary-foreground text-sm font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all flex items-center gap-2">
                     {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16}/>} {saving ? "Saving Changes..." : "Save Profile"}
                   </button>
                   <button onClick={()=>setEditing(false)} className="px-8 py-3.5 rounded-2xl bg-muted/50 text-muted-foreground text-sm font-bold hover:bg-muted transition-all">Discard Changes</button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-x-12 gap-y-8">
                {[
                  ["Department", student.branch, GraduationCap],
                  ["Semester", student.semester, BookMarked],
                  ["Section", student.section || "—", Hash],
                  ["Phone", student.phone || "—", Phone],
                  ["Primary Email", student.email, Mail],
                  ["Enrollment Year", student.yearLabel, Calendar]
                ].map(([label, value, Icon]: any, i) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    key={label} 
                    className={`space-y-1.5 ${label==="Primary Email" ? "col-span-2" : ""}`}
                  >
                    <div className="flex items-center gap-2 opacity-50">
                      <Icon size={12}/>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{label}</p>
                    </div>
                    <p className="font-bold text-foreground text-sm tracking-tight leading-relaxed">{value}</p>
                  </motion.div>
                ))}
              </div>
            )}
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
        let section = ""; let phone = ""; let photoUrl: string | null = null;

        try {
          const { fetchStudentByRollNo } = await import("@/api/users");
          if (rollNo) {
            const sd = await fetchStudentByRollNo(rollNo);
            if (sd) {
              name=(sd as any).name||name;
              semester=(sd as any).year||(sd as any).semester||semester;
              section=(sd as any).section||"";
              phone=(sd as any).phone||"";
              photoUrl=(sd as any).photo_url||null;
            }
          }
        } catch(_) {}

        const semNum = parseInt(semester.replace(/\D/g,"")) || 1;
        const derivedYear = Math.ceil(semNum / 2);
        const year = derivedYear === 1 ? "FY" : derivedYear === 2 ? "SY" : "TY";
        const yearLabel = derivedYear === 1 ? "1st Year" : derivedYear === 2 ? "2nd Year" : "3rd Year";
        
        setStudent({
          id:u.id, name, rollNumber:rollNo, branch:u.branch||"CSE", semester: semNum.toString(),
          year, yearLabel,
          email:u.email||"", phone, section,
          initials:name.split(" ").map((n:string)=>n[0]).join("").toUpperCase().slice(0,2),
          photoUrl,
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
      .on("postgres_changes", { event:"INSERT", schema:"public", table:"resources" }, (payload:any) => {
        if (activeSection!=="resources")
          setBadges(b=>({...b, resources:(b.resources||0)+1}));
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [student?.id, student?.branch, activeSection]);

  const handleSectionChange = (id: string) => {
    setActiveSection(id);
    setSidebarOpen(false);
    setBadges(b=>({...b, [id]:0}));
  };

  const handleProfileUpdate = (updates: Partial<StudentProfile>) => {
    setStudent(prev => prev ? { ...prev, ...updates } : prev);
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
    timetable:     <TimetableSection branch={student.branch} semester={student.semester}/>,
    marks:         <MarksSection rollNumber={student.rollNumber}/>,
    results:       <SemesterResultsSection semester={student.semester}/>,
    resources:     <ResourcesSection branch={student.branch} semester={student.semester}/>,
    labs:          <LabsSection/>,
    complaints:    <ComplaintsSection userId={student.id} rollNumber={student.rollNumber} onNewActivity={()=>setBadges(b=>({...b,complaints:(b.complaints||0)+1}))}/>,
    idcard:        <IDCardSection student={student}/>,
    notifications: <NotificationsSection branch={student.branch} semester={student.semester}/>,
    profile:       <ProfileSection student={student} onUpdate={handleProfileUpdate}/>,
  };

  const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.8, 
      ease: [0.22, 1, 0.36, 1] as any 
    } 
  }
};

  return (
    <div className="min-h-screen bg-background flex selection:bg-primary/20">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-1/4 -right-1/4 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute -bottom-1/4 -left-1/4 w-[500px] h-[500px] rounded-full bg-accent/10 blur-[100px]" />
      </div>

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-card/40 backdrop-blur-2xl border-r border-border/50 flex flex-col transition-all duration-300 lg:translate-x-0 ${sidebarOpen?"translate-x-0 shadow-2xl":"-translate-x-full"}`}>
        {/* Logo */}
        <div className="h-20 flex items-center gap-3 px-6 border-b border-border/50">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/20">
            <GraduationCap size={20} className="text-primary-foreground"/>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-base tracking-tight text-foreground">AIMS PORTAL</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold opacity-70">Academic Excellence</span>
          </div>
          <button onClick={()=>setSidebarOpen(false)} className="ml-auto lg:hidden p-2 rounded-lg hover:bg-accent text-muted-foreground transition-colors"><X size={18}/></button>
        </div>

        {/* User profile card in sidebar */}
        <div className="mx-4 mt-6 mb-4 p-4 rounded-2xl bg-gradient-to-br from-primary/[0.07] to-transparent border border-primary/10 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl -mr-8 -mt-8 group-hover:bg-primary/10 transition-colors" />
          <div className="flex items-center gap-3 relative z-10">
            <Avatar photoUrl={student.photoUrl} initials={student.initials} size={42} className="shadow-sm border-white/20 dark:border-black/20" />
            <div className="min-w-0">
              <p className="text-sm font-bold text-foreground truncate">{student.name}</p>
              <p className="text-[11px] text-muted-foreground/80 font-medium">{student.rollNumber}</p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-1.5 relative z-10">
            <span className="text-[9px] px-2 py-0.5 rounded-full bg-primary/15 text-primary font-bold border border-primary/10">{student.year}</span>
            <span className="text-[9px] px-2 py-0.5 rounded-full bg-accent/10 text-accent-foreground font-bold border border-accent/10">{student.branch}</span>
            <span className="text-[9px] px-2 py-0.5 rounded-full bg-muted/60 text-muted-foreground font-bold border border-border/50 truncate">Sem {student.semester.replace(/\D/g,"")}</span>
          </div>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto scrollbar-hide">
          {sidebarItems.map((item, idx)=>(
            <motion.button 
              key={item.id} 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.03 }}
              onClick={()=>handleSectionChange(item.id)}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-semibold transition-all relative group ${activeSection===item.id?"bg-primary text-primary-foreground shadow-lg shadow-primary/20":"text-muted-foreground hover:text-foreground hover:bg-accent/40"}`}>
              <item.icon size={18} className={`${activeSection===item.id ? "" : "group-hover:scale-110 transition-transform"}`}/>
              {item.label}
              {(badges[item.id]||0) > 0 && (
                <span className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-red-500 shadow-sm shadow-red-500/50 animate-pulse border border-white dark:border-black" />
              )}
              {activeSection===item.id && (
                <motion.div layoutId="active-pill" className="absolute left-0 w-1 h-6 bg-white rounded-full ml-1.5" />
              )}
            </motion.button>
          ))}
        </nav>

        <div className="px-4 pb-6 space-y-1.5 mt-auto border-t border-border/40 pt-4">
          <Link href="/" className="w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-accent/40 transition-all">
            <Home size={18}/>Back to Home
          </Link>
          <button onClick={async()=>{const{logoutUser}=await import("@/api/auth");await logoutUser();router.push("/login");}}
            className="w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-semibold text-red-500 hover:bg-red-500/5 transition-all">
            <LogOut size={18}/>Logout
          </button>
        </div>
      </aside>


      <div className="flex-1 lg:ml-72 flex flex-col min-h-screen relative z-10">
        <header className="h-20 border-b border-border/50 bg-background/60 backdrop-blur-2xl sticky top-0 z-30 flex items-center px-6 gap-4">
          <button className="lg:hidden w-10 h-10 rounded-xl border border-border/50 flex items-center justify-center bg-card/50" onClick={()=>setSidebarOpen(true)}><Menu size={20}/></button>
          
          <div className="flex-1">
            <p className="text-xs font-bold text-primary uppercase tracking-[0.2em] mb-0.5 opacity-80">Dashboard</p>
            <h1 className="text-xl font-bold text-foreground tracking-tight">
              {sidebarItems.find(i=>i.id===activeSection)?.label || "Welcome"}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 p-1 rounded-xl bg-muted/60 border border-border/50">
              <ThemeToggle />
            </div>
            <div className="w-10 h-10 rounded-xl overflow-hidden border border-border/50 shadow-sm ring-1 ring-primary/10">
              <Avatar photoUrl={student.photoUrl} initials={student.initials} size={40} className="border-0" />
            </div>
          </div>
        </header>
        <main className="flex-1 p-6 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div 
              key={activeSection}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, y: -10 }}
              className="max-w-6xl mx-auto"
            >
              {sections[activeSection]}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
