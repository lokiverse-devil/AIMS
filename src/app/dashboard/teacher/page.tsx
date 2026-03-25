"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Calendar, Upload, Users, Bell, User, GraduationCap,
  LogOut, Menu, X, Home, FileText, Check, AlertCircle,
  Plus, Search, Ticket, BookOpen, BarChart2, Table2,
  Loader2, Trash2, Download, Edit2, Hash, Mail, Phone,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { supabase } from "@/lib/supabaseClient";
// ── Types ──────────────────────────────────────────────────────────
interface TeacherProfile {
  id: string; name: string; designation: string;
  department: string; subjects: string[]; email: string; initials: string;
}
interface TEntry {
  id: string; day_of_week: string; start_time: string; end_time: string;
  subject: string; room: string; class_name: string; branch: string; year: string;
}

// ── Constants ──────────────────────────────────────────────────────
const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday"];
const YEARS = ["All","1st Year","2nd Year","3rd Year"];
const BRANCHES = ["CSE","IT","ELEX","CIVIL","MECH"];
const YEAR_LABELS: Record<string,string> = {"1st Year":"FY","2nd Year":"SY","3rd Year":"TY"};

const sidebarItems = [
  { id:"timetable", label:"Timetable", icon:Calendar },
  { id:"upload", label:"Upload / CSV", icon:Upload },
  { id:"students", label:"Student List", icon:Users },
  { id:"notices", label:"Notices", icon:Bell },
  { id:"tickets", label:"Tickets", icon:Ticket },
  { id:"profile", label:"Profile", icon:User },
];

// ── Helpers ────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const s: Record<string,string> = {
    Resolved:"bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
    "In Progress":"bg-amber-500/15 text-amber-600 dark:text-amber-400",
    Pending:"bg-red-500/15 text-red-500",
  };
  return <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${s[status]||"bg-muted text-muted-foreground"}`}>{status}</span>;
}

function LoadingState({ text="Loading…" }: { text?: string }) {
  return (
    <div className="flex items-center justify-center py-16 text-muted-foreground gap-2 text-sm">
      <Loader2 size={16} className="animate-spin" />{text}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return <div className="p-8 rounded-xl border border-border bg-card text-center text-sm text-muted-foreground">{text}</div>;
}

function downloadCSV(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

// ── Timetable Section ─────────────────────────────────────────────
function TimetableSection({ teacher }: { teacher: TeacherProfile }) {
  const [entries, setEntries] = useState<TEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay] = useState(
    DAYS.includes(new Date().toLocaleDateString("en-US",{weekday:"long"}))
      ? new Date().toLocaleDateString("en-US",{weekday:"long"})
      : "Monday"
  );
  const [showEditor, setShowEditor] = useState(false);
  const [editId, setEditId] = useState<string|null>(null);
  const [form, setForm] = useState({ day_of_week:"Monday", start_time:"09:00", end_time:"10:00", subject:"", room:"", class_name:"", branch:"CSE", year:"1st Year" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { fetchTeacherTimetable } = await import("@/api/timetable_entries");
        setEntries(await fetchTeacherTimetable(teacher.id));
      } catch(e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, [teacher.id]);

  const dayEntries = entries.filter(e => e.day_of_week === activeDay)
    .sort((a,b) => a.start_time.localeCompare(b.start_time));

  const handleSave = async () => {
    if (!form.subject || !form.start_time || !form.end_time) { alert("Subject and times are required"); return; }
    setSaving(true);
    try {
      if (editId) {
        const { updateTimetableEntry } = await import("@/api/timetable_entries");
        const { data, error } = await updateTimetableEntry(editId, form);
        if (error) { alert("Error: "+error.message); return; }
        setEntries(prev => prev.map(e => e.id===editId ? { ...e, ...data } as TEntry : e));
      } else {
        const { insertTimetableEntry } = await import("@/api/timetable_entries");
        const { data, error } = await insertTimetableEntry({ ...form, teacher_id: teacher.id, teacher_name: teacher.name });
        if (error) { alert("Error: "+error.message); return; }
        if (data) setEntries(prev => [...prev, data as TEntry]);
      }
      setShowEditor(false); setEditId(null);
      setForm({ day_of_week:"Monday", start_time:"09:00", end_time:"10:00", subject:"", room:"", class_name:"", branch:"CSE", year:"1st Year" });
    } catch(e) { console.error(e); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this slot?")) return;
    const { deleteTimetableEntry } = await import("@/api/timetable_entries");
    await deleteTimetableEntry(id);
    setEntries(prev => prev.filter(e => e.id!==id));
  };

  const startEdit = (e: TEntry) => {
    setEditId(e.id);
    setForm({ day_of_week:e.day_of_week, start_time:e.start_time, end_time:e.end_time, subject:e.subject, room:e.room, class_name:e.class_name, branch:e.branch, year:e.year });
    setShowEditor(true);
  };

  const inputCls = "w-full px-3 py-2 rounded-lg border border-border bg-input text-foreground text-sm focus:outline-none focus:border-primary";

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Calendar size={18} className="text-primary" /> My Teaching Schedule
        </h2>
        <button onClick={() => { setEditId(null); setShowEditor(!showEditor); }}
          className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:-translate-y-0.5 transition-all">
          {showEditor ? "Cancel" : "+ Add Slot"}
        </button>
      </div>

      {/* Editor form */}
      <AnimatePresence>
        {showEditor && (
          <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:"auto" }} exit={{ opacity:0, height:0 }}
            className="mb-4 p-4 rounded-xl border border-primary/30 bg-primary/5 space-y-3 overflow-hidden">
            <h3 className="font-semibold text-foreground text-sm">{editId ? "Edit Slot" : "Add New Slot"}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Day</label>
                <select value={form.day_of_week} onChange={e=>setForm({...form,day_of_week:e.target.value})} className={inputCls}>
                  {DAYS.map(d=><option key={d}>{d}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Start Time</label>
                <input type="time" value={form.start_time} onChange={e=>setForm({...form,start_time:e.target.value})} className={inputCls} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">End Time</label>
                <input type="time" value={form.end_time} onChange={e=>setForm({...form,end_time:e.target.value})} className={inputCls} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Subject *</label>
                <input placeholder="e.g. Data Structures" value={form.subject} onChange={e=>setForm({...form,subject:e.target.value})} className={inputCls} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Room</label>
                <input placeholder="e.g. Lab A" value={form.room} onChange={e=>setForm({...form,room:e.target.value})} className={inputCls} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Class</label>
                <input placeholder="e.g. CSE 3A" value={form.class_name} onChange={e=>setForm({...form,class_name:e.target.value})} className={inputCls} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Branch</label>
                <select value={form.branch} onChange={e=>setForm({...form,branch:e.target.value})} className={inputCls}>
                  {BRANCHES.map(b=><option key={b}>{b}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Year</label>
                <select value={form.year} onChange={e=>setForm({...form,year:e.target.value})} className={inputCls}>
                  {YEARS.filter(y=>y!=="All").map(y=><option key={y}>{y}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={handleSave} disabled={saving}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold disabled:opacity-50">
                {saving ? "Saving…" : editId ? "Update Slot" : "Save Slot"}
              </button>
              <button onClick={()=>{setShowEditor(false);setEditId(null);}} className="px-4 py-2 rounded-lg bg-muted text-muted-foreground text-xs font-semibold">Cancel</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Day tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
        {DAYS.map(d=>(
          <button key={d} onClick={()=>setActiveDay(d)}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeDay===d?"bg-primary text-primary-foreground":"bg-muted text-muted-foreground hover:text-foreground"}`}>
            {d.slice(0,3)}
          </button>
        ))}
      </div>

      {loading ? <LoadingState text="Loading schedule…" /> : dayEntries.length===0 ? (
        <EmptyState text="No classes scheduled for this day. Click + Add Slot to create one." />
      ) : (
        <AnimatePresence mode="wait">
          <motion.div key={activeDay} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}} transition={{duration:0.18}} className="space-y-3">
            {dayEntries.map(slot=>(
              <div key={slot.id} className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:border-primary/30 transition-all group">
                <div className="text-xs font-mono text-muted-foreground w-24 flex-shrink-0">{slot.start_time}–{slot.end_time}</div>
                <div className="w-0.5 h-10 rounded-full bg-primary/30 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground text-sm">{slot.subject}</p>
                  <p className="text-xs text-muted-foreground">{slot.class_name} · {slot.branch} {YEAR_LABELS[slot.year]||slot.year}</p>
                </div>
                <span className="text-xs text-muted-foreground flex-shrink-0 hidden sm:block px-2.5 py-1 rounded-lg bg-muted">{slot.room}</span>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={()=>startEdit(slot)} className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center hover:bg-primary/10 hover:text-primary transition-all"><Edit2 size={12}/></button>
                  <button onClick={()=>handleDelete(slot.id)} className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center hover:bg-red-500/10 hover:text-red-500 transition-all"><Trash2 size={12}/></button>
                </div>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}

// ── Upload / CSV Section ──────────────────────────────────────────
type UploadTab = "resources" | "marks" | "students";

function UploadSection({ teacher }: { teacher: TeacherProfile }) {
  const [activeTab, setActiveTab] = useState<UploadTab>("resources");
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type:"success"|"error"; text:string }|null>(null);

  // Resource upload state
  const [resTitle, setResTitle] = useState("");
  const [resSubject, setResSubject] = useState("");
  const [resSemester, setResSemester] = useState("");
  const resFileRef = useRef<HTMLInputElement>(null);

  // Marks CSV state
  const [marksTestName, setMarksTestName] = useState("");
  const [marksSubject, setMarksSubject] = useState("");
  const marksFileRef = useRef<HTMLInputElement>(null);

  // Student CSV state
  const studentsFileRef = useRef<HTMLInputElement>(null);

  const tabs: {id:UploadTab;label:string;icon:React.ComponentType<{size?:number;className?:string}>}[] = [
    {id:"resources",label:"Resources",icon:BookOpen},
    {id:"marks",label:"Marks CSV",icon:BarChart2},
    {id:"students",label:"Student List CSV",icon:Table2},
  ];

  const showMsg = (type:"success"|"error", text:string) => {
    setMessage({type,text});
    setTimeout(()=>setMessage(null), 4000);
  };

  const handleResourceUpload = async () => {
    const file = resFileRef.current?.files?.[0];
    if (!file) { showMsg("error","Please select a file"); return; }
    if (!resTitle || !resSubject) { showMsg("error","Title and subject are required"); return; }
    setUploading(true);
    try {
      const { uploadResource } = await import("@/api/resources");
      const { data, error } = await uploadResource(file, {
        title: resTitle, subject: resSubject, semester: resSemester,
        department: teacher.department, uploaded_by: teacher.id,
      });
      if (error) showMsg("error","Upload failed: "+error.message);
      else { showMsg("success",`"${data?.title}" uploaded successfully!`); setResTitle(""); setResSubject(""); setResSemester(""); if(resFileRef.current) resFileRef.current.value=""; }
    } catch(e) { showMsg("error","Upload error"); }
    finally { setUploading(false); }
  };

  const handleMarksUpload = async () => {
    const file = marksFileRef.current?.files?.[0];
    if (!file) { showMsg("error","Please select a CSV file"); return; }
    if (!marksTestName || !marksSubject) { showMsg("error","Test name and subject are required"); return; }
    setUploading(true);
    try {
      const { uploadMarksCSV } = await import("@/api/marks");
      const result = await uploadMarksCSV(file, teacher.id, marksSubject, marksTestName);
      if (result.success) {
        showMsg("success",result.message);
        setMarksTestName(""); setMarksSubject(""); if(marksFileRef.current) marksFileRef.current.value="";
      } else showMsg("error",result.message);
    } catch(e) { showMsg("error","Upload error"); }
    finally { setUploading(false); }
  };

  const handleStudentsUpload = async () => {
    const file = studentsFileRef.current?.files?.[0];
    if (!file) { showMsg("error","Please select a CSV file"); return; }
    setUploading(true);
    try {
      const { uploadStudentCSV } = await import("@/api/resources");
      const result = await uploadStudentCSV(file, teacher.department);
      if (result.success) {
        showMsg("success",result.message);
        if(studentsFileRef.current) studentsFileRef.current.value="";
      } else showMsg("error",result.message);
    } catch(e) { showMsg("error","Upload error"); }
    finally { setUploading(false); }
  };

  const DropZone = ({ fileRef, accept="*", label }: { fileRef: React.RefObject<HTMLInputElement|null>; accept?: string; label: string }) => (
    <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 transition-colors cursor-pointer"
      onClick={()=>fileRef.current?.click()}>
      <Upload size={24} className="text-muted-foreground mx-auto mb-2" />
      <p className="text-sm font-medium text-foreground">{label}</p>
      <p className="text-xs text-muted-foreground mt-1">{accept==="text/csv" ? ".csv only" : "PDF, PPT, DOC — max 50 MB"}</p>
      <input ref={fileRef} type="file" accept={accept} className="hidden" onChange={()=>setMessage(null)} />
    </div>
  );

  const inputCls = "w-full px-3 py-2.5 rounded-xl border border-border bg-input text-foreground text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-bold text-foreground flex items-center gap-2"><Upload size={18} className="text-primary"/>Upload Center</h2>
      <div className="flex gap-1 p-1 rounded-xl bg-muted border border-border overflow-x-auto">
        {tabs.map(tab=>(
          <button key={tab.id} onClick={()=>{setActiveTab(tab.id);setMessage(null);}}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${activeTab===tab.id?"bg-card text-foreground shadow-sm border border-border":"text-muted-foreground hover:text-foreground"}`}>
            <tab.icon size={14}/>{tab.label}
          </button>
        ))}
      </div>

      {message && (
        <div className={`p-3 rounded-xl text-sm font-medium ${message.type==="success"?"bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400":"bg-red-500/10 border border-red-500/20 text-red-500"}`}>
          {message.text}
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}} transition={{duration:0.18}}>

          {/* Resources tab */}
          {activeTab==="resources" && (
            <div className="p-5 rounded-2xl border border-border bg-card space-y-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2"><Plus size={16} className="text-primary"/>New Resource Upload</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Title *</label>
                  <input value={resTitle} onChange={e=>setResTitle(e.target.value)} placeholder="e.g. DSA Notes Module 4" className={inputCls}/>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Subject *</label>
                  <select value={resSubject} onChange={e=>setResSubject(e.target.value)} className={inputCls}>
                    <option value="">Select Subject</option>
                    {teacher.subjects.map(s=><option key={s}>{s}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Semester</label>
                  <select value={resSemester} onChange={e=>setResSemester(e.target.value)} className={inputCls}>
                    <option value="">All Semesters</option>
                    {["1st","2nd","3rd","4th","5th","6th"].map(s=><option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <DropZone fileRef={resFileRef} accept=".pdf,.ppt,.pptx,.doc,.docx" label="Drop file here or click to browse"/>
              <button onClick={handleResourceUpload} disabled={uploading}
                className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:-translate-y-0.5 transition-all shadow-md shadow-primary/20 disabled:opacity-50">
                {uploading ? "Uploading…" : "Upload Resource"}
              </button>
            </div>
          )}

          {/* Marks CSV tab */}
          {activeTab==="marks" && (
            <div className="p-5 rounded-2xl border border-border bg-card space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground flex items-center gap-2"><BarChart2 size={16} className="text-primary"/>Upload Unit Test Marks</h3>
                <button onClick={()=>downloadCSV("marks_template.csv","roll_no,subject,marks,max_marks,semester\nCSE2022047,Data Structures,18,20,6th\nCSE2022023,Data Structures,17,20,6th")}
                  className="flex items-center gap-1.5 text-xs text-primary hover:underline">
                  <Download size={12}/> Download Template
                </button>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Test Name *</label>
                  <input value={marksTestName} onChange={e=>setMarksTestName(e.target.value)} placeholder="e.g. Unit Test 1" className={inputCls}/>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Subject *</label>
                  <select value={marksSubject} onChange={e=>setMarksSubject(e.target.value)} className={inputCls}>
                    <option value="">Select Subject</option>
                    {teacher.subjects.map(s=><option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-muted/50 border border-border text-xs font-mono text-muted-foreground">
                roll_no, subject, marks, max_marks, semester
              </div>
              <DropZone fileRef={marksFileRef} accept="text/csv,.csv" label="Drop marks CSV here"/>
              <button onClick={handleMarksUpload} disabled={uploading}
                className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:-translate-y-0.5 transition-all shadow-md shadow-primary/20 disabled:opacity-50">
                {uploading ? "Uploading…" : "Upload Marks CSV"}
              </button>
            </div>
          )}

          {/* Student list CSV tab */}
          {activeTab==="students" && (
            <div className="p-5 rounded-2xl border border-border bg-card space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground flex items-center gap-2"><Users size={16} className="text-primary"/>Upload Student List</h3>
                <button onClick={()=>downloadCSV("students_template.csv","roll_no,name,year,branch\nCSE2022047,Rahul Sharma,3rd Year,CSE\nCSE2023011,Sneha Patil,2nd Year,CSE")}
                  className="flex items-center gap-1.5 text-xs text-primary hover:underline">
                  <Download size={12}/> Download Template
                </button>
              </div>
              <div className="p-3 rounded-xl bg-muted/50 border border-border text-xs font-mono text-muted-foreground">
                roll_no, name, year, branch
              </div>
              <DropZone fileRef={studentsFileRef} accept="text/csv,.csv" label="Drop student list CSV here"/>
              <button onClick={handleStudentsUpload} disabled={uploading}
                className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:-translate-y-0.5 transition-all shadow-md shadow-primary/20 disabled:opacity-50">
                {uploading ? "Uploading…" : "Upload Student List"}
              </button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ── Student List ──────────────────────────────────────────────────
function StudentsSection() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [yearFilter, setYearFilter] = useState("All");
  const [search, setSearch] = useState("");

  useEffect(() => {
    (async () => {
      try {
        // Fetch ALL students — no department filter (mismatch between full name vs code)
        const { fetchStudentList } = await import("@/api/users");
        setStudents(await fetchStudentList());
      } catch(e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, []);

  const filtered = students.filter(s => {
    const matchYear = yearFilter==="All" || s.year===yearFilter;
    const matchSearch = !search || s.name?.toLowerCase().includes(search.toLowerCase()) || s.roll_no?.toLowerCase().includes(search.toLowerCase());
    return matchYear && matchSearch;
  });

  return (
    <div>
      <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2"><Users size={18} className="text-primary"/>Student List</h2>
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="flex gap-1.5">
          {YEARS.map(y=>(
            <button key={y} onClick={()=>setYearFilter(y)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${yearFilter===y?"bg-primary text-primary-foreground":"bg-muted text-muted-foreground hover:text-foreground"}`}>
              {y==="All" ? "All" : YEAR_LABELS[y]||y}
            </button>
          ))}
        </div>
        <div className="relative flex-1 min-w-40">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name or roll no..."
            className="w-full pl-8 pr-4 py-2 rounded-xl border border-border bg-card text-foreground text-sm focus:outline-none focus:border-primary"/>
        </div>
      </div>
      {loading ? <LoadingState text="Loading students…"/> : students.length===0 ? (
        <EmptyState text="No students found. Upload a student list CSV to populate the database."/>
      ) : filtered.length===0 ? <EmptyState text="No students match your filter."/> : (
        <>
          <p className="text-xs text-muted-foreground mb-3">{filtered.length} student{filtered.length!==1?"s":""} found</p>
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Student</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Roll No.</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground hidden sm:table-cell">Year</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground hidden sm:table-cell">Branch</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((s,i)=>(
                  <tr key={s.id||s.roll_no||i} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-[10px] font-bold text-primary">{s.name?.split(" ").map((n:string)=>n[0]).join("").slice(0,2)}</span>
                        </div>
                        <span className="font-medium text-foreground">{s.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{s.roll_no}</td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-medium">{YEAR_LABELS[s.year]||s.year}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground hidden sm:table-cell">{s.branch}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

// ── Notices ───────────────────────────────────────────────────────
function NoticesSection({ userId }: { userId: string }) {
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string|null>(null);
  const [form, setForm] = useState({ title:"", audience:"", content:"", priority:"Normal" as "Normal"|"High" });
  const [notices, setNotices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    (async () => {
      try { const { fetchNotices } = await import("@/api/timetable"); setNotices(await fetchNotices()||[]); }
      catch(e) { console.error(e); } finally { setLoading(false); }
    })();
  }, []);

  const handlePost = async () => {
    if (!form.title || !form.audience) { alert("Title and audience are required"); return; }
    setPosting(true);
    try {
      const { postNotice, updateNotice } = await import("@/api/timetable");
      if (editId) {
        const { data, error } = await updateNotice(editId, { title:form.title, content:form.content, audience:form.audience, priority:form.priority });
        if (error) alert("Failed: "+error.message);
        else if (data) { setNotices(prev=>prev.map(n=>n.id===editId?{...n,...data}:n)); closeForm(); }
      } else {
        const { data, error } = await postNotice({ title:form.title, content:form.content, audience:form.audience, posted_by:userId, priority:form.priority });
        if (error) alert("Failed: "+error.message);
        else if (data) { setNotices([data,...notices]); closeForm(); }
      }
    } catch(e) { console.error(e); } finally { setPosting(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this notice?")) return;
    const { deleteNotice } = await import("@/api/timetable");
    await deleteNotice(id);
    setNotices(prev=>prev.filter(n=>n.id!==id));
  };

  const startEdit = (n: any) => {
    setEditId(n.id);
    setForm({ title:n.title, audience:n.audience, content:n.content||"", priority:n.priority });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false); setEditId(null);
    setForm({ title:"", audience:"", content:"", priority:"Normal" });
  };

  const inputCls = "w-full px-3 py-2 rounded-lg border border-border bg-input text-foreground text-sm focus:outline-none focus:border-primary";

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2"><Bell size={18} className="text-primary"/>Notices & Announcements</h2>
        <button onClick={()=>{if(showForm)closeForm(); else setShowForm(true);}} className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:-translate-y-0.5 transition-all">
          {showForm ? "Cancel" : "+ Post Notice"}
        </button>
      </div>
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:"auto"}} exit={{opacity:0,height:0}}
            className="mb-4 p-4 rounded-xl border border-primary/30 bg-primary/5 space-y-3 overflow-hidden">
            <h3 className="font-semibold text-foreground text-sm">{editId ? "Edit Notice" : "Post a New Notice"}</h3>
            <input placeholder="Notice title..." value={form.title} onChange={e=>setForm({...form,title:e.target.value})} className={inputCls}/>
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <select value={form.audience} onChange={e=>setForm({...form,audience:e.target.value})} className={`${inputCls} appearance-none`}>
                  <option value="" disabled>Select Audience</option>
                  {["CSE All Years","CSE FY","CSE SY","CSE TY","All Faculty","General Campus"].map(a=><option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              <div className="relative">
                <select value={form.priority} onChange={e=>setForm({...form,priority:e.target.value as "Normal"|"High"})} className={`${inputCls} appearance-none`}>
                  <option value="Normal">Priority: Normal</option>
                  <option value="High">Priority: High 🔴</option>
                </select>
              </div>
            </div>
            <textarea rows={3} placeholder="Notice content..." value={form.content} onChange={e=>setForm({...form,content:e.target.value})} className={`${inputCls} resize-none`}/>
            <div className="flex gap-2">
              <button onClick={handlePost} disabled={posting} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold disabled:opacity-50">
                {posting ? "Saving…" : editId ? "Save Changes" : "Post Notice"}
              </button>
              <button onClick={closeForm} className="px-4 py-2 rounded-lg bg-muted text-muted-foreground text-xs font-semibold">Cancel</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="space-y-3">
        {loading ? <LoadingState/> : notices.length===0 ? <EmptyState text="No notices posted yet."/> : notices.map(n=>(
          <div key={n.id} className="p-4 rounded-xl border border-border bg-card flex flex-col gap-2 group">
            <div className="w-full flex items-center gap-2 flex-wrap">
              <div className={`w-1.5 h-4 rounded-full flex-shrink-0 ${n.priority==="High"?"bg-red-500":"bg-muted-foreground/30"}`}/>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">{n.audience}</span>
              {n.priority==="High" && <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/15 text-red-500 font-semibold">High Priority</span>}
              <span className="text-[10px] text-muted-foreground ml-auto">{n.created_at ? new Date(n.created_at).toLocaleDateString() : ""}</span>
            </div>
            <div className="pl-3.5 flex justify-between items-start">
              <div>
                <p className="font-semibold text-foreground text-sm">{n.title}</p>
                {n.content && <p className="text-xs text-muted-foreground mt-1 whitespace-pre-wrap">{n.content}</p>}
              </div>
              {n.posted_by === userId && (
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <button onClick={()=>startEdit(n)} className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center hover:bg-primary/10 hover:text-primary transition-all"><Edit2 size={12}/></button>
                  <button onClick={()=>handleDelete(n.id)} className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center hover:bg-red-500/10 hover:text-red-500 transition-all"><Trash2 size={12}/></button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Tickets ───────────────────────────────────────────────────────
function TicketsSection({ userId }: { userId: string }) {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!userId) { setLoading(false); return; }
      try { const { fetchTickets } = await import("@/api/tickets"); setTickets(await fetchTickets(userId,"teacher")); }
      catch(e) { console.error(e); } finally { setLoading(false); }
    })();
  }, [userId]);

  const handleAck = async (id: string) => {
    const { updateTicketStatus } = await import("@/api/tickets");
    const { error } = await updateTicketStatus(id,"In Progress",userId,"teacher");
    if (error) { alert("Error: "+error.message); return; }
    setTickets(prev=>prev.map(t=>t.id===id?{...t,status:"In Progress"}:t));
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-foreground mb-1 flex items-center gap-2"><Ticket size={18} className="text-primary"/>Student Tickets</h2>
      <p className="text-xs text-muted-foreground mb-4">You can acknowledge tickets. Only the student who submitted can mark as Resolved.</p>
      {loading ? <LoadingState text="Loading tickets…"/> : tickets.length===0 ? <EmptyState text="No tickets submitted yet."/> : (
        <div className="space-y-3">
          {tickets.map(t=>(
            <div key={t.id} className="p-4 rounded-xl border border-border bg-card">
              <div className="flex items-start justify-between gap-2 mb-1">
                <div>
                  <span className="text-[10px] font-mono text-muted-foreground">{t.id?.slice(0,8).toUpperCase()}</span>
                  <p className="font-semibold text-foreground text-sm">{t.subject}</p>
                </div>
                <StatusBadge status={t.status}/>
              </div>
              <div className="flex gap-3 text-xs text-muted-foreground flex-wrap">
                <span>{t.category}</span><span>·</span>
                <span>{t.created_at ? new Date(t.created_at).toLocaleDateString() : ""}</span>
              </div>
              {t.status==="Pending" && (
                <button onClick={()=>handleAck(t.id)}
                  className="mt-3 px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-medium hover:bg-amber-500/20 transition-colors flex items-center gap-1">
                  <AlertCircle size={12}/> Acknowledge (In Progress)
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Profile + ID Card ─────────────────────────────────────────────
function ProfileSection({ teacher }: { teacher: TeacherProfile }) {
  const [photoUrl, setPhotoUrl] = useState<string|null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handlePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const preview = URL.createObjectURL(file);
    setPhotoUrl(preview);
    setUploading(true);
    try {
      const { supabase } = await import("@/lib/supabaseClient");
      const path = `${teacher.id}-${Date.now()}.${file.name.split(".").pop()}`;
      const { error } = await supabase.storage.from("teacher-photos").upload(path, file, { upsert: true });
      if (error) { console.error("Photo upload error:", error); return; }
      const { data: urlData } = supabase.storage.from("teacher-photos").getPublicUrl(path);
      setPhotoUrl(urlData.publicUrl);
    } catch(err) { console.error(err); } finally { setUploading(false); }
  };

  const handlePrint = () => {
    const printContent = document.getElementById("teacher-id-card");
    if (!printContent) return;
    const win = window.open("","_blank","width=400,height=600");
    if (!win) return;
    win.document.write(`<html><head><title>ID Card — ${teacher.name}</title><style>body{font-family:sans-serif;padding:0;margin:0;background:#fff;color:#0f0f0f}*{box-sizing:border-box}</style></head><body>${printContent.innerHTML}</body></html>`);
    win.document.close();
    win.focus(); win.print(); win.close();
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2"><User size={18} className="text-primary"/>My Profile</h2>
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Profile card */}
        <div className="p-6 rounded-2xl border border-border bg-card">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative group cursor-pointer" onClick={()=>fileRef.current?.click()} title="Click to upload photo">
              <div className="w-20 h-20 rounded-2xl bg-primary/15 flex items-center justify-center border-2 border-primary/20 overflow-hidden">
                {photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photoUrl} alt="Profile" className="w-full h-full object-cover"/>
                ) : (
                  <span className="text-2xl font-bold text-primary">{teacher.initials}</span>
                )}
              </div>
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center">
                {uploading ? <Loader2 size={16} className="text-white animate-spin"/> : <Upload size={16} className="text-white"/>}
              </div>
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto}/>
            <div>
              <h3 className="text-lg font-bold text-foreground">{teacher.name}</h3>
              <p className="text-sm text-primary">{teacher.designation}</p>
              <p className="text-xs text-muted-foreground mt-1">{teacher.email}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Click photo to change</p>
            </div>
          </div>
          <div className="mb-4">
            <p className="text-xs text-muted-foreground mb-2">Subjects Taught</p>
            <div className="flex flex-wrap gap-2">
              {teacher.subjects.length>0 ? teacher.subjects.map(s=>(
                <span key={s} className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-xs font-medium">{s}</span>
              )) : <span className="text-xs text-muted-foreground">No subjects assigned</span>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[["Department",teacher.department],["Email",teacher.email]].map(([label,value])=>(
              <div key={label} className="p-3 rounded-xl bg-muted/50 col-span-2">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="font-medium text-foreground mt-0.5 text-sm">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ID Card */}
        <div>
          <div id="teacher-id-card" className="rounded-2xl overflow-hidden border border-border shadow-xl mb-3">
            <div className="bg-primary px-6 py-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary-foreground/20 flex items-center justify-center">
                <GraduationCap size={18} className="text-primary-foreground"/>
              </div>
              <div>
                <p className="font-bold text-primary-foreground text-sm">AIMS</p>
                <p className="text-[10px] text-primary-foreground/70">Academic Infrastructure Management</p>
              </div>
            </div>
            <div className="bg-card px-6 py-5 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-primary/15 flex items-center justify-center border-2 border-primary/20 flex-shrink-0 overflow-hidden">
                  {photoUrl
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={photoUrl} alt="" className="w-full h-full object-cover"/>
                    : <span className="text-xl font-bold text-primary">{teacher.initials}</span>}
                </div>
                <div>
                  <p className="font-bold text-foreground">{teacher.name}</p>
                  <p className="text-xs text-primary font-medium">{teacher.designation}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{teacher.department}</p>
                </div>
              </div>
              <div className="h-px bg-border"/>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground"><Mail size={13} className="text-primary flex-shrink-0"/><span className="text-foreground text-xs">{teacher.email}</span></div>
              </div>
              <div className="h-px bg-border"/>
              <div className="flex items-center justify-between">
                <div className="text-xs"><p className="text-muted-foreground">Valid For</p><p className="font-semibold text-foreground">Academic Year 2025–26</p></div>
                <div className="w-14 h-14 rounded-lg bg-muted flex items-center justify-center border border-border">
                  <div className="grid grid-cols-3 gap-0.5">
                    {Array.from({length:9}).map((_,i)=>(
                      <div key={i} className={`w-2.5 h-2.5 rounded-[2px] ${i%3!==1?"bg-foreground":"bg-transparent"}`}/>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-primary/5 px-6 py-2.5 border-t border-border">
              <p className="text-[10px] text-center text-muted-foreground">Faculty ID — Present at security checkpoint.</p>
            </div>
          </div>
          <button onClick={handlePrint}
            className="w-full py-2.5 rounded-xl border border-border bg-card text-sm text-muted-foreground hover:text-primary hover:border-primary/40 transition-all flex items-center justify-center gap-2">
            <Download size={14}/> Download / Print ID Card
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────
export default function TeacherDashboard() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState("timetable");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [teacher, setTeacher] = useState<TeacherProfile|null>(null);
  const [badges, setBadges] = useState<Record<string,number>>({});

  useEffect(() => {
    (async () => {
      try {
        const { getCurrentUser } = await import("@/api/auth");
        const userData = await getCurrentUser();
        if (!userData?.user) { router.replace("/login"); return; }
        const u = userData.user;
        if (u.role==="student") { router.replace("/dashboard/student"); return; }

        let name = (u as any).name || u.email?.split("@")[0] || "Teacher";
        let designation = "Faculty";
        let department = u.department || u.branch || "Computer Science Engineering";
        let subjects: string[] = [];
        let email = u.email || "";

        try {
          const { supabase } = await import("@/lib/supabaseClient");
          const { data: td } = await supabase.from("teachers").select("*").eq("id",u.id).single();
          if (td) { name=td.name||name; department=td.department||department; subjects=td.subjects||[]; email=td.email||email; designation=td.designation||"Faculty"; }
        } catch(_) { /* use defaults */ }

        const initials = name.split(" ").map((n:string)=>n[0]).join("").toUpperCase().slice(0,2);
        setTeacher({ id:u.id, name, designation, department, subjects, email, initials });
      } catch(err) { console.error(err); router.replace("/login"); }
      finally { setAuthLoading(false); }
    })();
  }, [router]);

  // ── Real-time subscriptions ────────────────────────────────────
  useEffect(() => {
    if (!teacher) return;
    const ch = supabase.channel(`teacher-live-${teacher.id}`)
      .on("postgres_changes", { event:"INSERT", schema:"public", table:"tickets" }, () => {
        if (activeSection!=="tickets") setBadges(b=>({...b, tickets:(b.tickets||0)+1}));
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [teacher?.id, activeSection]);

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

  if (!teacher) return null;

  const sections: Record<string,React.ReactNode> = {
    timetable: <TimetableSection teacher={teacher}/>,
    upload: <UploadSection teacher={teacher}/>,
    students: <StudentsSection/>,
    notices: <NoticesSection userId={teacher.id}/>,
    tickets: <TicketsSection userId={teacher.id}/>,
    profile: <ProfileSection teacher={teacher}/>,
  };

  return (
    <div className="min-h-screen bg-background flex">
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-sidebar-border flex flex-col transition-transform duration-300 lg:translate-x-0 ${sidebarOpen?"translate-x-0":"-translate-x-full"}`}>
        <div className="h-16 flex items-center gap-2.5 px-4 border-b border-sidebar-border">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-md"><GraduationCap size={16} className="text-primary-foreground"/></div>
          <div><p className="font-bold text-sm text-sidebar-foreground">AIMS</p><p className="text-[9px] text-sidebar-foreground/50 uppercase tracking-widest">Faculty Portal</p></div>
          <button onClick={()=>setSidebarOpen(false)} className="ml-auto lg:hidden text-muted-foreground"><X size={16}/></button>
        </div>
        <div className="px-4 py-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-primary">{teacher.initials}</span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-sidebar-foreground truncate">{teacher.name}</p>
              <p className="text-xs text-sidebar-foreground/50 truncate">{teacher.designation}</p>
            </div>
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

      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={()=>setSidebarOpen(false)}/>}

      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        <header className="h-16 border-b border-border bg-card/80 backdrop-blur sticky top-0 z-30 flex items-center px-4 gap-3">
          <button className="lg:hidden w-9 h-9 rounded-lg border border-border flex items-center justify-center" onClick={()=>setSidebarOpen(true)}><Menu size={16}/></button>
          <div className="flex-1"><h1 className="font-semibold text-foreground">{sidebarItems.find(i=>i.id===activeSection)?.label||"Dashboard"}</h1></div>
          <div className="flex items-center gap-2">
            <ThemeToggle/>
            <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
              <span className="text-xs font-bold text-primary">{teacher.initials}</span>
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
