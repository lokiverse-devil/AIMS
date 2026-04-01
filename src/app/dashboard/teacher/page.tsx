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
  MessageSquare, HelpCircle, LayoutDashboard,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { supabase } from "@/lib/supabaseClient";
// ── Types ──────────────────────────────────────────────────────────
interface TeacherProfile {
  id: string; name: string; designation: string;
  department: string; subjects: string[]; email: string; initials: string;
  photo_url?: string;
}
interface TEntry {
  id: string; day_of_week: string; start_time: string; end_time: string;
  subject: string; room: string; class_name: string; branch: string; semester: string;
}

// ── Constants ──────────────────────────────────────────────────────
const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday"];
const SEMESTERS = ["All","1","2","3","4","5","6"];
import { getBranchLabel, getBranchKey, BRANCH_MAP } from "@/lib/constants";

const YEAR_LABELS: Record<string,string> = {"1st Year":"FY","2nd Year":"SY","3rd Year":"TY"};

const sidebarItems = [
  { id:"timetable", label:"Timetable", icon:Calendar },
  { id:"upload", label:"Upload / CSV", icon:Upload },
  { id:"students", label:"Student List", icon:Users },
  { id:"notices", label:"Notices", icon:Bell },
  { id:"tickets", label:"Tickets", icon:Ticket },
  { id:"profile", label:"Profile", icon:User },
];

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
  const [form, setForm] = useState({ day_of_week:"Monday", start_time:"09:00", end_time:"10:00", subject:"", room:"", class_name:"", branch:"CSE", semester:"1" });
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
      setForm({ day_of_week:"Monday", start_time:"09:00", end_time:"10:00", subject:"", room:"", class_name:"", branch:"CSE", semester:"1" });
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
    setForm({ day_of_week:e.day_of_week, start_time:e.start_time, end_time:e.end_time, subject:e.subject, room:e.room, class_name:e.class_name, branch:e.branch, semester:e.semester });
    setShowEditor(true);
  };

  const inputCls = "w-full px-4 py-2.5 rounded-xl border border-border bg-background/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Calendar size={22} strokeWidth={2}/>
            </div>
            Teaching Schedule
          </h2>
          <p className="text-sm text-muted-foreground mt-1 ml-11 font-medium">Manage your weekly lectures and lab sessions.</p>
        </div>
        <button onClick={() => { if(showEditor) { setShowEditor(false); setEditId(null); } else setShowEditor(true); }}
          className={`flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all shadow-lg ${showEditor ? "bg-muted text-muted-foreground hover:bg-muted/80" : "bg-primary text-primary-foreground hover:shadow-primary/25 hover:-translate-y-0.5 active:scale-95"}`}>
          {showEditor ? <X size={18}/> : <Plus size={18}/>}
          {showEditor ? "Close Editor" : "Add New Slot"}
        </button>
      </div>

      <AnimatePresence>
        {showEditor && (
          <motion.div initial={{ opacity: 0, y: -20, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -20, scale: 0.98 }}
            className="p-6 rounded-3xl border border-primary/20 bg-primary/[0.02] backdrop-blur-sm space-y-5 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-primary/50" />
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-foreground flex items-center gap-2">
                <Edit2 size={16} className="text-primary"/>
                {editId ? "Modify Existing Slot" : "Configure New Session"}
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground ml-1">Day of Week</label>
                <select value={form.day_of_week} onChange={e=>setForm({...form,day_of_week:e.target.value})} className={inputCls}>
                  {DAYS.map(d=><option key={d}>{d}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground ml-1">Subject Name</label>
                <input placeholder="e.g. Advanced AI" value={form.subject} onChange={e=>setForm({...form,subject:e.target.value})} className={inputCls} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground ml-1">Start Time</label>
                <input type="time" value={form.start_time} onChange={e=>setForm({...form,start_time:e.target.value})} className={inputCls} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground ml-1">End Time</label>
                <input type="time" value={form.end_time} onChange={e=>setForm({...form,end_time:e.target.value})} className={inputCls} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground ml-1">Room / Lab</label>
                <input placeholder="e.g. Lab 402" value={form.room} onChange={e=>setForm({...form,room:e.target.value})} className={inputCls} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground ml-1">Class Section</label>
                <input placeholder="e.g. CSE-A" value={form.class_name} onChange={e=>setForm({...form,class_name:e.target.value})} className={inputCls} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground ml-1">Academic Branch</label>
                  <select value={form.branch} onChange={e=>setForm({...form, branch:e.target.value})} className={inputCls}>
                    {Object.entries(BRANCH_MAP).map(([k, v])=><option key={k} value={k}>{v}</option>)}
                  </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground ml-1">Academic Semester</label>
                <select value={form.semester} onChange={e=>setForm({...form,semester:e.target.value})} className={inputCls}>
                  {SEMESTERS.filter(y=>y!=="All").map(y=><option key={y}>{y}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={handleSave} disabled={saving}
                className="flex-1 sm:flex-none px-8 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:shadow-lg hover:shadow-primary/20 transition-all disabled:opacity-50">
                {saving ? "Processing..." : editId ? "Update Schedule" : "Confirm Slot"}
              </button>
              <button onClick={()=>{setShowEditor(false);setEditId(null);}} className="flex-1 sm:flex-none px-8 py-3 rounded-xl bg-card border border-border font-bold text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-all">Cancel</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-muted/40 border border-border/50 overflow-x-auto scrollbar-hide no-scrollbar">
        {DAYS.map(d=>(
          <button key={d} onClick={()=>setActiveDay(d)}
            className={`flex-1 min-w-[100px] px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${activeDay===activeDay && d===activeDay?"bg-card text-primary shadow-sm border border-border/50 ring-1 ring-primary/10":"text-muted-foreground hover:text-foreground hover:bg-muted/50"}`}>
            {d}
          </button>
        ))}
      </div>

      {loading ? <LoadingState text="Accessing department servers..." /> : dayEntries.length===0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Calendar size={24} className="text-muted-foreground/50"/>
          </div>
          <h4 className="text-lg font-bold text-foreground">No Classes Scheduled</h4>
          <p className="text-sm text-muted-foreground mt-1 max-w-[280px]">You have no teaching slots assigned for {activeDay}. Enjoy your break!</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          <AnimatePresence mode="popLayout">
            {dayEntries.map((slot, idx)=>(
              <motion.div 
                key={slot.id} 
                layout
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: idx * 0.05 }}
                className="group relative flex flex-col sm:flex-row items-start sm:items-center gap-4 p-5 rounded-3xl border border-border/50 bg-card/40 backdrop-blur-md hover:border-primary/30 transition-all hover:shadow-xl hover:shadow-primary/[0.03]">
                
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-transparent border border-primary/10 flex flex-col items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-primary uppercase leading-tight">{slot.start_time.split(":")[0]}</span>
                    <div className="w-4 h-0.5 bg-primary/20 my-0.5" />
                    <span className="text-[10px] font-bold text-muted-foreground/60">{slot.end_time.split(":")[0]}</span>
                  </div>
                  <div className="flex-1 sm:w-40 xl:w-56 overflow-hidden">
                    <p className="font-bold text-foreground text-base truncate tracking-tight">{slot.subject}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground/80 font-bold mt-0.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      {slot.start_time} – {slot.end_time}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 flex-1 items-center">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20">
                    <Users size={12} className="text-accent-foreground"/>
                    <span className="text-[10px] font-bold uppercase text-accent-foreground">{slot.class_name}</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/5 border border-primary/10">
                    <GraduationCap size={12} className="text-primary"/>
                    <span className="text-[10px] font-bold uppercase text-primary">{slot.branch} Sem {slot.semester}</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/50 border border-border">
                    <Hash size={12} className="text-muted-foreground"/>
                    <span className="text-[10px] font-bold uppercase text-muted-foreground">{slot.room}</span>
                  </div>
                </div>

                <div className="flex gap-2 sm:opacity-0 group-hover:opacity-100 transition-all ml-auto">
                  <button onClick={()=>startEdit(slot)} className="p-2.5 rounded-xl bg-primary/10 text-primary hover:bg-primary transition-all hover:text-primary-foreground shadow-sm">
                    <Edit2 size={16}/>
                  </button>
                  <button onClick={()=>handleDelete(slot.id)} className="p-2.5 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 transition-all hover:text-white shadow-sm">
                    <Trash2 size={16}/>
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

// ── Upload / CSV Section ──────────────────────────────────────────
type UploadTab = "resources" | "marks" | "students";

function UploadSection({ teacher }: { teacher: TeacherProfile }) {
  const [activeTab, setActiveTab] = useState<UploadTab>("resources");
  const [resTitle, setResTitle] = useState("");
  const [resSubject, setResSubject] = useState("");
  const [resSemester, setResSemester] = useState("");
  const [resBranch] = useState(teacher.department);
  const [resFile, setResFile] = useState<File|null>(null);
  const [marksTestName, setMarksTestName] = useState("");
  const [marksSubject, setMarksSubject] = useState("");
  const [marksFile, setMarksFile] = useState<File|null>(null);
  const [studentsFile, setStudentsFile] = useState<File|null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: "success"|"error"; text: string }|null>(null);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    if (activeTab === "resources") {
      (async () => {
        try {
          const { supabase } = await import("@/lib/supabaseClient");
          const { data } = await supabase.from("resources").select("*").eq("uploaded_by", teacher.id).order("created_at", { ascending: false }).limit(5);
          setHistory(data || []);
        } catch(e) {}
      })();
    }
  }, [activeTab, teacher.id]);

  const tabs: {id:UploadTab;label:string;icon:React.ComponentType<{size?:number;className?:string}>;desc:string}[] = [
    {id:"resources",label:"Knowledge Assets",icon:BookOpen,desc:"Upload PDF notes, PPTs, or Research Papers."},
    {id:"marks",label:"Academic Performance",icon:BarChart2,desc:"Batch upload unit test marks via CSV."},
    {id:"students",label:"Student List",icon:Table2,desc:"Update the student list for your branch."},
  ];

  const showMsg = (type:"success"|"error", text:string) => {
    setMessage({type,text});
    setTimeout(()=>setMessage(null), 5000);
  };

  const handleResourceUpload = async () => {
    if (!resFile) { showMsg("error","Please select a file to proceed."); return; }
    if (!resTitle || !resSubject) { showMsg("error","Knowledge asset title and subject are mandatory."); return; }
    setUploading(true);
    try {
      const { uploadResource } = await import("@/api/resources");
      const { data, error } = await uploadResource(resFile, {
        title: resTitle,
        subject: resSubject,
        semester: resSemester || "All",
        department: getBranchKey(resBranch) || resBranch,
        uploaded_by: teacher.id
      });
      if (error) throw error;
      showMsg("success","Asset uploaded successfully.");
      setResFile(null); setResTitle(""); setResSubject(""); setResSemester("");
      if (data) setHistory(prev => [data, ...prev].slice(0, 5));
    } catch(e: any) { showMsg("error","System Error: "+e.message); }
    finally { setUploading(false); }
  };

  const handleMarksUpload = async () => {
    if (!marksFile) { showMsg("error","A valid CSV dataset is required."); return; }
    if (!marksTestName || !marksSubject) { showMsg("error","Assessment name and subject are required."); return; }
    setUploading(true);
    try {
      const { uploadMarksCSV } = await import("@/api/marks");
      const result = await uploadMarksCSV(marksFile, {
        test_name: marksTestName,
        subject: marksSubject,
        teacher_id: teacher.id
      });
      if (result.success) {
        showMsg("success", result.message);
        setMarksFile(null); setMarksTestName(""); setMarksSubject("");
      } else showMsg("error", result.message);
    } catch(e) { showMsg("error","Failed to upload marks."); }
    finally { setUploading(false); }
  };

  const handleStudentsUpload = async () => {
      if (result.success) {
        showMsg("success",result.message);
        setStudentsFile(null);
      } else showMsg("error",result.message);
    } catch(e) { showMsg("error","Failed to update student list."); }
    finally { setUploading(false); }
  };

  const DropZone = ({ selectedFile, onFileSelect, accept="*", label }: { selectedFile: File|null; onFileSelect: (f: File|null)=>void; accept?: string; label: string }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleDrag = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); if (e.type === "dragenter" || e.type === "dragover") setIsDragging(true); else setIsDragging(false); };
    const handleDrop = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); if (e.dataTransfer.files?.[0]) onFileSelect(e.dataTransfer.files[0]); };

    return (
      <div 
        onDragEnter={handleDrag} onDragOver={handleDrag} onDragLeave={handleDrag} onDrop={handleDrop}
        className={`relative group border-2 border-dashed rounded-3xl p-8 text-center transition-all cursor-pointer overflow-hidden ${selectedFile ? "border-primary bg-primary/[0.03]" : isDragging ? "border-primary bg-primary/10 scale-[1.02]" : "border-border/60 hover:border-primary/40 hover:bg-muted/30"}`}
        onClick={()=>fileInputRef.current?.click()}>
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className={`mx-auto w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-all ${selectedFile ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-110" : "bg-muted text-muted-foreground group-hover:scale-110"}`}>
          {selectedFile ? <Check size={28} strokeWidth={2}/> : <Upload size={24} />}
        </div>
        <p className="text-base font-bold text-foreground relative z-10">{selectedFile ? selectedFile.name : label}</p>
        <p className="text-xs text-muted-foreground mt-2 font-medium relative z-10">
          {selectedFile ? `${(selectedFile.size/1024/1024).toFixed(2)} MB — Ready to sync` : (accept.includes("csv") ? "Strictly .CSV format required" : "PDF, PPTX, or DOCX — Maximum 50MB")}
        </p>
        {selectedFile && (
          <button 
            onClick={(e)=>{e.stopPropagation(); onFileSelect(null);}} 
            className="absolute top-4 right-4 p-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all z-20">
            <X size={14} strokeWidth={2}/>
          </button>
        )}
        <input ref={fileInputRef} type="file" accept={accept} className="hidden" 
          onChange={e => { onFileSelect(e.target.files?.[0] || null); setMessage(null); }} 
        />
      </div>
    );
  };

  const inputCls = "w-full px-4 py-3 rounded-2xl border border-border bg-background/50 text-foreground text-sm font-medium focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Upload size={22} strokeWidth={2.5}/>
            </div>
            Faculty Upload Center
          </h2>
          <p className="text-sm text-muted-foreground mt-1 ml-11 font-medium">Distribute resources and synchronize academic data.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 p-1.5 rounded-3xl bg-muted/40 border border-border/50">
        {tabs.map(tab=>(
          <button key={tab.id} onClick={()=>{setActiveTab(tab.id);setMessage(null);}}
            className={`flex flex-col items-center gap-1 px-4 py-3 rounded-2xl text-sm font-bold transition-all relative ${activeTab===tab.id?"bg-card text-primary shadow-xl shadow-black/5 border border-border/50 ring-1 ring-primary/10":"text-muted-foreground hover:text-foreground hover:bg-muted/50"}`}>
            <tab.icon size={18} className="mb-1"/>
            {tab.label}
            <span className="text-[10px] font-medium opacity-60 hidden lg:block">{tab.desc}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{opacity:0, y:15}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-15}} transition={{duration:0.3}}>
          <div className="p-8 rounded-[2.5rem] border border-border/50 bg-card/40 backdrop-blur-xl shadow-2xl shadow-black/5 space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
            
            {message && (
              <motion.div initial={{opacity:0, scale:0.9}} animate={{opacity:1, scale:1}} 
                className={`p-4 rounded-2xl flex items-center gap-3 text-sm font-bold border ${message.type==="success"?"bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400":"bg-red-500/10 border-red-500/20 text-red-500"}`}>
                {message.type==="success" ? <Check size={18} strokeWidth={3}/> : <AlertCircle size={18} strokeWidth={3}/>}
                {message.text}
              </motion.div>
            )}

            {/* Resources tab */}
            {activeTab==="resources" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground ml-1">Asset Title</label>
                    <input value={resTitle} onChange={e=>setResTitle(e.target.value)} placeholder="e.g. Unit 4 - Quantum Computing" className={inputCls}/>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground ml-1">Academic Subject</label>
                    <select value={resSubject} onChange={e=>setResSubject(e.target.value)} className={inputCls}>
                      <option value="">Select Subject</option>
                      {teacher.subjects.map(s=><option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground ml-1">Target Semester</label>
                    <select value={resSemester} onChange={e=>setResSemester(e.target.value)} className={inputCls}>
                      <option value="">All Semesters</option>
                      {["1","2","3","4","5","6"].map(s=><option key={s} value={s}>Semester {s}</option>)}
                    </select>
                  </div>
                </div>
                <DropZone selectedFile={resFile} onFileSelect={setResFile} accept=".pdf,.ppt,.pptx,.doc,.docx" label="Drop lecture material here"/>
                <button onClick={handleResourceUpload} disabled={uploading}
                  className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-sm hover:shadow-2xl hover:shadow-primary/30 hover:-translate-y-1 active:translate-y-0 transition-all shadow-lg disabled:opacity-50">
                  {uploading ? "Uploading..." : "Upload Resources"}
                </button>

                {history.length > 0 && (
                  <div className="pt-6 border-t border-border/20">
                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4 px-1">Recent Knowledge Assets</h4>
                    <div className="space-y-3">
                      {history.map(h => (
                        <div key={h.id} className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 border border-border/40 group/item hover:border-primary/20 transition-all">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center"><BookOpen size={14}/></div>
                            <div>
                              <p className="text-sm font-bold text-foreground leading-none">{h.title}</p>
                              <p className="text-[10px] text-muted-foreground mt-1">{h.subject} • {h.semester}</p>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold text-emerald-500 whitespace-nowrap">Cataloged</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Marks CSV tab */}
            {activeTab==="marks" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground ml-1">Assessment Label</label>
                    <input value={marksTestName} onChange={e=>setMarksTestName(e.target.value)} placeholder="e.g. End Semester Exam" className={inputCls}/>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground ml-1">Associated Subject</label>
                    <select value={marksSubject} onChange={e=>setMarksSubject(e.target.value)} className={inputCls}>
                      <option value="">Select Subject</option>
                      {teacher.subjects.map(s=><option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-3xl bg-muted/40 border border-border/50">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-primary/10 text-primary"><FileText size={20}/></div>
                    <div>
                      <p className="text-sm font-bold text-foreground">Data Template</p>
                      <p className="text-xs text-muted-foreground">roll_no, subject, marks, max_marks, semester</p>
                    </div>
                  </div>
                  <button onClick={()=>downloadCSV("marks_template.csv","roll_no,subject,marks,max_marks,semester\nCSE2022047,Data Structures,18,20,6")}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card border border-border text-xs font-bold text-primary hover:bg-primary hover:text-white transition-all">
                    <Download size={14}/> Get Template
                  </button>
                </div>
                <DropZone selectedFile={marksFile} onFileSelect={setMarksFile} accept="text/csv,.csv" label="Upload Assessment Data"/>
                <button onClick={handleMarksUpload} disabled={uploading}
                  className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-sm hover:shadow-2xl hover:shadow-primary/30 hover:-translate-y-1 active:translate-y-0 transition-all shadow-lg disabled:opacity-50">
                  {uploading ? "Uploading..." : "Upload Marks"}
                </button>
              </div>
            )}

            {/* Student list CSV tab */}
            {activeTab==="students" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-3xl bg-muted/40 border border-border/50">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-accent/10 text-accent-foreground"><Users size={20}/></div>
                    <div>
                      <p className="text-sm font-bold text-foreground">Student List Template</p>
                      <p className="text-xs text-muted-foreground">roll_no, name, semester, branch</p>
                    </div>
                  </div>
                  <button onClick={()=>downloadCSV("students_template.csv","roll_no,name,semester,branch\nCSE2022047,Rahul Sharma,6,CSE")}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card border border-border text-xs font-bold text-accent-foreground hover:bg-accent hover:text-white transition-all">
                    <Download size={14}/> Get Template
                  </button>
                </div>
                <DropZone selectedFile={studentsFile} onFileSelect={setStudentsFile} accept="text/csv,.csv" label="Upload Enrollment Sheet"/>
                <button onClick={handleStudentsUpload} disabled={uploading}
                  className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-sm hover:shadow-2xl hover:shadow-primary/30 hover:-translate-y-1 active:translate-y-0 transition-all shadow-lg disabled:opacity-50">
                  {uploading ? "Uploading..." : "Upload Student List"}
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ── Student List ──────────────────────────────────────────────────
function StudentsSection({ department }: { department: string }) {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [semesterFilter, setSemesterFilter] = useState("All");
  const [search, setSearch] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { fetchStudentList } = await import("@/api/users");
        // Department is already passed from teacher profile, ensuring branch-specific view
        const semParam = semesterFilter !== "All" ? semesterFilter : undefined;
        setStudents(await fetchStudentList(getBranchKey(department), semParam));
      } catch(e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, [department, semesterFilter]);

  const filtered = students.filter(s => {
    const matchSearch = !search || 
      s.name?.toLowerCase().includes(search.toLowerCase()) || 
      s.roll_no?.toLowerCase().includes(search.toLowerCase());
    return matchSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-3">
            <div className="p-2 rounded-xl bg-accent/10 text-accent-foreground">
              <Users size={22} strokeWidth={2.5}/>
            </div>
            Departmental Registry
          </h2>
          <p className="text-sm text-muted-foreground mt-1 ml-11 font-medium">Viewing students enrolled in {department}.</p>
        </div>
        <div className="relative group min-w-[280px]">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors"/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name or roll number..."
            className="w-full pl-11 pr-4 py-3 rounded-2xl border border-border bg-card/40 backdrop-blur-md text-foreground text-sm font-medium focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all shadow-sm"/>
        </div>
      </div>

      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-muted/40 border border-border/50 overflow-x-auto no-scrollbar scrollbar-hide">
        {SEMESTERS.map(s=>(
          <button key={s} onClick={()=>setSemesterFilter(s)}
            className={`flex-1 min-w-[100px] px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${semesterFilter===s?"bg-card text-primary shadow-sm border border-border/50 ring-1 ring-primary/10":"text-muted-foreground hover:text-foreground hover:bg-muted/50"}`}>
            {s==="All" ? "Full Registry" : `Semester ${s}`}
          </button>
        ))}
      </div>

      {loading ? <LoadingState text="Fetching records from registry..." /> : (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
              {filtered.length} Student{filtered.length!==1?"s":""} Cataloged
            </p>
          </div>
          
          {filtered.length===0 ? (
            <EmptyState text={students.length===0 ? "The registry is currently empty for this department." : "No records match your search query."} />
          ) : (
            <div className="overflow-hidden rounded-[2rem] border border-border/50 bg-card/30 backdrop-blur-md shadow-2xl shadow-black/[0.02]">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-muted/30 border-b border-border/50">
                      <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Identification</th>
                      <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Registry ID</th>
                      <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground hidden sm:table-cell">Academic Tier</th>
                      <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground hidden sm:table-cell">Branch</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {filtered.map((s,i)=>(
                      <motion.tr 
                        initial={{opacity:0}} animate={{opacity:1}} transition={{delay: i * 0.02}}
                        key={s.id||s.roll_no||i} className="group hover:bg-primary/[0.02] transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/10 to-transparent flex items-center justify-center border border-primary/20 shadow-sm relative overflow-hidden">
                              <span className="text-xs font-bold text-primary relative z-10">{s.name?.split(" ").map((n:string)=>n[0]).join("").slice(0,2).toUpperCase()}</span>
                              <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <div>
                              <p className="font-bold text-foreground text-sm group-hover:text-primary transition-colors">{s.name}</p>
                              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{s.email || "No email provided"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <code className="text-xs font-bold text-muted-foreground bg-muted/60 px-2 py-1 rounded-lg border border-border/50">{s.roll_no}</code>
                        </td>
                        <td className="px-6 py-4 hidden sm:table-cell">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border bg-primary/10 text-primary border-primary/20`}>
                            Sem {s.semester}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs font-bold text-muted-foreground hidden sm:table-cell">
                          {s.branch}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Notices ───────────────────────────────────────────────────────
function NoticesSection({ userId, department }: { userId: string; department: string }) {
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string|null>(null);
  const [form, setForm] = useState({ title:"", target_branch:getBranchKey(department)||"All", target_type:"All", target_value:"", content:"", priority:"Normal" as "Normal"|"High" });
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
    if (!form.title) { alert("Core announcement details are required."); return; }
    setPosting(true);
    try {
      const { postNotice, updateNotice } = await import("@/api/timetable");
      if (editId) {
        const { data, error } = await updateNotice(editId, { title:form.title, content:form.content, target_branch:form.target_branch, target_type:form.target_type, target_value:form.target_value, priority:form.priority });
        if (error) alert("Sync failed: "+error.message);
        else if (data) { setNotices(prev=>prev.map(n=>n.id===editId?{...n,...data}:n)); closeForm(); }
      } else {
        const { data, error } = await postNotice({ title:form.title, content:form.content, target_branch:form.target_branch, target_type:form.target_type, target_value:form.target_value, posted_by:userId, priority:form.priority });
        if (error) alert("Broadcast failed: "+error.message);
        else if (data) { setNotices([data,...notices]); closeForm(); }
      }
    } catch(e) { console.error(e); } finally { setPosting(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to retract this announcement?")) return;
    const { deleteNotice } = await import("@/api/timetable");
    await deleteNotice(id);
    setNotices(prev=>prev.filter(n=>n.id!==id));
  };

  const startEdit = (n: any) => {
    setEditId(n.id);
    setForm({ title:n.title, target_branch:n.target_branch||"All", target_type:n.target_type||"All", target_value:n.target_value||"", content:n.content||"", priority:n.priority });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false); setEditId(null);
    setForm({ title:"", target_branch:getBranchKey(department)||"All", target_type:"All", target_value:"", content:"", priority:"Normal" });
  };

  const inputCls = "w-full px-4 py-3 rounded-2xl border border-border bg-background/50 text-foreground text-sm font-medium focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Bell size={22} strokeWidth={2.5}/>
            </div>
            Broadcast Hub
          </h2>
          <p className="text-sm text-muted-foreground mt-1 ml-11 font-medium">Issue institutional notices and critical updates.</p>
        </div>
        <button onClick={()=>{if(showForm)closeForm(); else setShowForm(true);}} 
          className={`flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all shadow-lg ${showForm ? "bg-muted text-muted-foreground" : "bg-primary text-primary-foreground hover:shadow-primary/25"}`}>
          {showForm ? <X size={18}/> : <Plus size={18}/>}
          {showForm ? "Cancel Posting" : "Create Announcement"}
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{opacity:0, y:-20}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-20}}
            className="p-8 rounded-[2.5rem] border border-primary/20 bg-primary/[0.02] backdrop-blur-md space-y-5 relative overflow-hidden shadow-2xl shadow-primary/5">
            <div className="absolute top-0 left-0 w-1 h-full bg-primary/50" />
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-foreground text-base tracking-tight">{editId ? "Refine Announcement" : "Draft New Broadcast"}</h3>
            </div>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground ml-1">Announcement Title</label>
                <input placeholder="e.g. Critical: Mid-Term Examination Reschedule" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} className={inputCls}/>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground ml-1">Target Branch</label>
                  <select value={form.target_branch} onChange={e=>setForm({...form,target_branch:e.target.value})} className={inputCls}>
                    <option value="All">All Branches</option>
                    {Object.entries(BRANCH_MAP).map(([k, v])=><option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground ml-1">Target Type</label>
                  <select value={form.target_type} onChange={e=>setForm({...form,target_type:e.target.value})} className={inputCls}>
                    <option value="All">Entire Branch</option>
                    <option value="Semester">Specific Semester</option>
                  </select>
                </div>
                {form.target_type === "Semester" ? (
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground ml-1">Semester Value</label>
                    <select value={form.target_value} onChange={e=>setForm({...form,target_value:e.target.value})} className={inputCls}>
                      <option value="" disabled>Select Sem</option>
                      {["1","2","3","4","5","6"].map(s=><option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                ) : (
                  <div />
                )}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground ml-1">Priority Level</label>
                  <select value={form.priority} onChange={e=>setForm({...form,priority:e.target.value as "Normal"|"High"})} className={inputCls}>
                    <option value="Normal">Routine Dispatch</option>
                    <option value="High">🔴 High Priority (Immediate Alert)</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground ml-1">Announcement Content</label>
                <textarea rows={4} placeholder="Detail the announcement here..." value={form.content} onChange={e=>setForm({...form,content:e.target.value})} className={`${inputCls} resize-none`}/>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={handlePost} disabled={posting} className="flex-1 sm:flex-none px-10 py-3.5 rounded-2xl bg-primary text-primary-foreground font-bold text-sm hover:shadow-xl hover:shadow-primary/20 transition-all disabled:opacity-50">
                {posting ? "Broadcasting..." : editId ? "Update Broadcast" : "Confirm & Dispatch"}
              </button>
              <button onClick={closeForm} className="flex-1 sm:flex-none px-10 py-3.5 rounded-2xl bg-card border border-border font-bold text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-all">Cancel Draft</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {loading ? <LoadingState text="Syncing with Broadcast Hub..." /> : notices.length===0 ? (
          <div className="lg:col-span-2 py-20">
            <EmptyState text="No active announcements in the system."/>
          </div>
        ) : notices.map((n, idx)=>(
          <motion.div 
            initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} transition={{delay: idx * 0.05}}
            key={n.id} className="p-6 rounded-[2rem] border border-border/50 bg-card/40 backdrop-blur-md hover:border-primary/30 transition-all group flex flex-col justify-between shadow-xl shadow-black/[0.01]">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${n.priority==="High"?"bg-red-500/10 text-red-500 border-red-500/20":"bg-primary/10 text-primary border-primary/20"}`}>
                    {n.target_branch ? `${n.target_branch} ${n.target_type !== 'All' ? '- ' + n.target_type + ' ' + n.target_value : ''}` : n.audience}
                  </span>
                  {n.priority==="High" && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-red-500 uppercase tracking-wider animate-pulse">
                      <AlertCircle size={10} strokeWidth={3}/> Urgent
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">
                  {n.created_at ? new Date(n.created_at).toLocaleDateString("en-US", {month:"short", day:"numeric"}) : "Recently"}
                </span>
              </div>
              <div>
                <h4 className="font-bold text-foreground text-base tracking-tight leading-tight group-hover:text-primary transition-colors">{n.title}</h4>
                {n.content && <p className="text-sm text-muted-foreground mt-2 line-clamp-3 font-medium leading-relaxed">{n.content}</p>}
              </div>
            </div>

            {n.posted_by === userId && (
              <div className="mt-6 pt-4 border-t border-border/30 flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50">Managed by you</p>
                <div className="flex gap-1.5">
                  <button onClick={()=>startEdit(n)} className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-all shadow-sm"><Edit2 size={14}/></button>
                  <button onClick={()=>handleDelete(n.id)} className="w-9 h-9 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm"><Trash2 size={14}/></button>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ── Tickets ───────────────────────────────────────────────────────
function TicketsSection({ userId, department }: { userId: string; department: string }) {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"All"|"Pending"|"Resolved">("All");

  useEffect(() => {
    (async () => {
      try {
        const { fetchTickets } = await import("@/api/tickets");
        setTickets(await fetchTickets(userId, "teacher")||[]);
      } catch(e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, [userId]);

  const updateStatus = async (id: string, status: "Pending" | "In Progress" | "Resolved") => {
    try {
      const { updateTicketStatus } = await import("@/api/tickets");
      const { data, error } = await updateTicketStatus(id, status, userId, "teacher");
      if (!error && data) setTickets(prev => prev.map(t => t.id === id ? { ...t, status } : t));
      else if (error) alert("Access Denied: " + error.message);
    } catch (e) { console.error(e); }
  };

  const handleDeleteTicket = async (id: string) => {
    if (!confirm("Permanently delete this ticket record?")) return;
    try {
      const { deleteTicket } = await import("@/api/tickets");
      await deleteTicket(id);
      setTickets(prev => prev.filter(t => t.id !== id));
    } catch (e) { console.error(e); }
  };

  const filtered = tickets.filter(t => filter === "All" || t.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <MessageSquare size={22} strokeWidth={2}/>
            </div>
            Support Intelligence
          </h2>
          <p className="text-sm text-muted-foreground mt-1 ml-11 font-medium">Manage student grievances and academic inquiries.</p>
        </div>
        <div className="flex p-1.5 rounded-2xl bg-muted/40 border border-border/50">
          {["All", "Pending", "Resolved"].map((f: any) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${filter === f ? "bg-card text-foreground shadow-xl shadow-black/5 border border-border/50" : "text-muted-foreground hover:text-foreground"}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? <LoadingState text="Accessing Support Database..." /> : filtered.length === 0 ? (
        <div className="py-20">
          <EmptyState text={tickets.length === 0 ? "The grievance portal is currently silent." : `No tickets match the '${filter}' filter.`} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map((t, idx) => (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.05 }}
              key={t.id} className="p-8 rounded-[2.5rem] border border-border/50 bg-card/40 backdrop-blur-xl hover:border-primary/30 transition-all flex flex-col justify-between shadow-2xl shadow-black/[0.01] relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-5">
                <div className={`text-[9px] font-bold uppercase tracking-[0.2em] px-3.5 py-1.5 rounded-full border ${t.status === "Pending" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"}`}>
                  {t.status}
                </div>
              </div>

              <div className="space-y-5">
                <div className="flex items-center gap-4">
                  <div className={`p-3.5 rounded-2xl ${t.category === "Academic" ? "bg-blue-500/10 text-blue-500" : t.category === "Facility" ? "bg-purple-500/10 text-purple-500" : "bg-emerald-500/10 text-emerald-500"}`}>
                    <HelpCircle size={22} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground opacity-60">{t.category || "General"}</p>
                    <h4 className="font-bold text-foreground text-sm tracking-tight leading-loose">Ticket #{t.id.slice(0, 5)}</h4>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <p className="text-base font-bold text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors">{t.subject}</p>
                  <p className="text-sm text-muted-foreground font-medium leading-relaxed line-clamp-3">{t.description}</p>
                </div>

                <div className="flex items-center gap-3.5 p-4 rounded-3xl bg-muted/40 border border-border/40">
                  <div className="w-10 h-10 rounded-xl bg-card border border-border/50 flex items-center justify-center text-xs font-bold text-primary shadow-sm">
                    {t.student_name?.[0] || "S"}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground">{t.student_name || "Unknown Student"}</p>
                    <p className="text-[10px] font-medium text-muted-foreground uppercase opacity-70 tracking-wider">{t.student_roll || "N/A"}</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-border/20 flex flex-col gap-3">
                <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] px-1 opacity-60">
                  <span>Logged on</span>
                  <span>{new Date(t.created_at).toLocaleDateString()}</span>
                </div>
                {t.status === "Pending" ? (
                  <button onClick={() => updateStatus(t.id, "In Progress")}
                    className="w-full py-4 rounded-2xl bg-amber-500 text-white font-bold text-xs hover:bg-amber-600 hover:shadow-2xl hover:shadow-amber-500/30 hover:-translate-y-1 active:translate-y-0 transition-all">
                    Acknowledge & Start Handling
                  </button>
                ) : t.status === "In Progress" ? (
                  <div className="flex gap-2">
                    <button onClick={() => updateStatus(t.id, "Pending")}
                      className="flex-1 py-4 rounded-2xl bg-muted border border-border/60 text-muted-foreground font-bold text-xs hover:bg-amber-500/5 hover:text-amber-500 hover:border-amber-500/40 transition-all">
                      Re-list Pending
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <p className="py-2.5 text-[10px] text-center font-bold text-emerald-600 uppercase tracking-wider bg-emerald-500/10 rounded-xl border border-emerald-500/20">Case Resolved</p>
                    <button onClick={() => handleDeleteTicket(t.id)}
                      className="w-full py-3 rounded-xl bg-red-500/10 text-red-500 font-bold text-[10px] uppercase tracking-wider hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2">
                      <Trash2 size={12}/> Clear Record
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
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

  const [localSubjects, setLocalSubjects] = useState<string[]>(teacher.subjects || []);
  const [isManagingSubjects, setIsManagingSubjects] = useState(false);
  const [availableData, setAvailableData] = useState<any[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(teacher.subjects || []);
  const [savingSubjects, setSavingSubjects] = useState(false);
  const [activeBranch, setActiveBranch] = useState<string>("");

  const handleManageSubjects = async () => {
    setIsManagingSubjects(true);
    setSelectedSubjects([...localSubjects]);
    if (availableData.length === 0) {
      try {
        const { fetchBranchesAndSubjects } = await import("@/api/subjects");
        const data = await fetchBranchesAndSubjects();
        setAvailableData(data);
        if (data.length > 0) setActiveBranch(data[0].code);
      } catch (err) { console.error(err); }
    }
  };

  const saveSubjects = async () => {
    setSavingSubjects(true);
    try {
      const { updateTeacherSubjects } = await import("@/api/subjects");
      const { success } = await updateTeacherSubjects(teacher.id, selectedSubjects);
      if (success) {
        setLocalSubjects([...selectedSubjects]);
        setIsManagingSubjects(false);
      } else {
        alert("Failed to save subjects.");
      }
    } catch (err) { console.error(err); }
    setSavingSubjects(false);
  };

  const toggleSubject = (subjectName: string) => {
    if (selectedSubjects.includes(subjectName)) {
      setSelectedSubjects(prev => prev.filter(s => s !== subjectName));
    } else {
      setSelectedSubjects(prev => [...prev, subjectName]);
    }
  };

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
      const publicUrl = urlData.publicUrl + "?t=" + Date.now();
      setPhotoUrl(publicUrl);
      try {
        const { updateTeacherProfile } = await import("@/api/users");
        await updateTeacherProfile(teacher.id, { photo_url: publicUrl });
      } catch(_) {}
    } catch(err) { console.error(err); } finally { setUploading(false); }
  };

  const handlePrint = () => {
    const printContent = document.getElementById("teacher-id-card");
    if (!printContent) return;
    const win = window.open("","_blank","width=500,height=700");
    if (!win) return;
    win.document.write(`
      <html>
        <head>
          <title>Academic ID — ${teacher.name}</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>@page { size: auto; margin: 0; }</style>
        </head>
        <body class="bg-slate-100 p-10 flex justify-center items-center h-screen font-sans">
          ${printContent.innerHTML}
          <script>window.onload = () => { window.print(); window.close(); }</script>
        </body>
      </html>
    `);
    win.document.close();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <User size={22} strokeWidth={2.5}/>
            </div>
            Faculty Profile
          </h2>
          <p className="text-sm text-muted-foreground mt-1 ml-11 font-medium">Manage your academic identity and credentials.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="p-8 rounded-[2.5rem] border border-border/50 bg-card/40 backdrop-blur-xl shadow-2xl shadow-black/[0.02] relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
            
            <div className="flex flex-col sm:flex-row items-center gap-8 mb-10">
              <div className="relative group cursor-pointer" onClick={()=>fileRef.current?.click()}>
                <div className="w-32 h-32 rounded-[2rem] bg-gradient-to-br from-primary/10 to-transparent flex items-center justify-center border-2 border-primary/20 p-1 shadow-2xl relative overflow-hidden">
                  <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors" />
                  {photoUrl || teacher.photo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={photoUrl || teacher.photo_url} alt="Profile" className="w-full h-full object-cover rounded-[1.8rem] relative z-10"/>
                  ) : (
                    <span className="text-4xl font-bold text-primary relative z-10">{teacher.initials}</span>
                  )}
                  <div className="absolute inset-x-0 bottom-0 py-2 bg-primary/80 text-white text-[10px] font-bold uppercase text-center backdrop-blur-md opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all z-20">
                    Update Photo
                  </div>
                </div>
                {uploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm rounded-[2rem] z-30">
                    <Loader2 size={24} className="text-primary animate-spin"/>
                  </div>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto}/>

              <div className="text-center sm:text-left space-y-1">
                <h3 className="text-3xl font-bold text-foreground tracking-tight leading-none">{teacher.name}</h3>
                <p className="text-lg font-bold text-primary opacity-80">{teacher.designation}</p>
                <div className="flex items-center justify-center sm:justify-start gap-3 pt-2 text-muted-foreground">
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider"><Mail size={12}/> {teacher.email}</div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-5 rounded-3xl bg-muted/40 border border-border/50">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Academic Department</p>
                  <p className="text-sm font-bold text-foreground">{teacher.department}</p>
                </div>
                <div className="p-5 rounded-3xl bg-muted/40 border border-border/50">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Faculty ID</p>
                  <p className="text-sm font-bold text-foreground">REG-{teacher.id.slice(0,8).toUpperCase()}</p>
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-muted/40 border border-border/50 space-y-3 relative">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Active Subjects</p>
                  <button onClick={handleManageSubjects} className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-bold hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-2 shadow-sm">
                    <Edit2 size={14}/> Manage Subjects
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {localSubjects.length > 0 ? localSubjects.map(s => (
                    <span key={s} className="px-3.5 py-1.5 rounded-xl bg-card border border-border/50 text-primary text-xs font-bold shadow-sm">
                      {s}
                    </span>
                  )) : <span className="text-xs text-muted-foreground font-medium italic">No subjects cataloged in registry</span>}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6 items-center">
          <div id="teacher-id-card" className="w-[320px] aspect-[1/1.58] bg-white rounded-[2.5rem] shadow-2xl relative overflow-hidden group border border-slate-200">
            <div className="absolute top-0 left-0 w-full h-[180px] bg-indigo-600 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 to-indigo-600 opacity-90" />
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
              <div className="absolute top-8 left-0 w-full px-8 flex justify-between items-center text-white z-10">
                <p className="text-[10px] font-bold uppercase tracking-wider">Faculty Permit</p>
                <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                  <GraduationCap size={14} className="text-white"/>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 w-full flex justify-center translate-y-1/2 z-20">
                <div className="w-28 h-28 rounded-3xl border-4 border-white bg-slate-50 shadow-xl overflow-hidden">
                  {teacher.photo_url || photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={teacher.photo_url || photoUrl || ""} alt="User Profile" className="w-full h-full object-cover"/>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-3xl text-indigo-200">{teacher.initials}</div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-20 px-8 text-center space-y-1">
              <h4 className="text-xl font-bold text-slate-800 tracking-tight leading-none">{teacher.name}</h4>
              <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider">{teacher.designation}</p>
            </div>

            <div className="px-8 mt-6 space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Branch</p>
                <p className="text-[10px] font-bold text-slate-700">{getBranchLabel(teacher.department)}</p>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Employee No</p>
                <p className="text-[10px] font-bold text-slate-700">EMP{teacher.id.slice(0,6).toUpperCase()}</p>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Valid Until</p>
                <p className="text-[10px] font-bold text-slate-700">Aug 2028</p>
              </div>
            </div>

            <div className="absolute bottom-8 left-0 w-full px-8 flex justify-center">
              <div className="w-full py-2 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.3em]">AIMS OFFICIAL SYSTEM</span>
              </div>
            </div>
          </div>
          
          <button onClick={handlePrint}
            className="w-[320px] py-4 rounded-2xl bg-card border border-border/60 text-foreground font-bold text-xs hover:bg-muted transition-all flex items-center justify-center gap-2 shadow-sm">
            <Download size={14}/> Download Digital Permit (PDF)
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isManagingSubjects && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={() => !savingSubjects && setIsManagingSubjects(false)} className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
            <motion.div initial={{opacity:0, scale:0.95, y:20}} animate={{opacity:1, scale:1, y:0}} exit={{opacity:0, scale:0.95, y:20}} className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-card border border-border/60 rounded-[2.5rem] shadow-2xl overflow-hidden">
              
              <div className="p-6 sm:p-8 flex items-center justify-between border-b border-border/50 bg-muted/30">
                <div>
                  <h3 className="text-2xl font-bold text-foreground tracking-tight">Manage Teaching Subjects</h3>
                  <p className="text-sm text-muted-foreground font-medium mt-1">Select the subjects you teach across all branches.</p>
                </div>
                <button disabled={savingSubjects} onClick={() => setIsManagingSubjects(false)} className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-muted-foreground/20 transition-all text-muted-foreground">
                  <X size={18}/>
                </button>
              </div>

              <div className="flex flex-1 overflow-hidden min-h-[400px] flex-col sm:flex-row">
                {/* Branch Sidebar */}
                <div className="w-full sm:w-64 border-r border-border/50 bg-muted/10 overflow-y-auto p-4 space-y-2 border-b sm:border-b-0 max-h-48 sm:max-h-full">
                  {availableData.length === 0 ? (
                    <div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary" size={24}/></div>
                  ) : (
                    availableData.map(branch => (
                      <button key={branch.code} onClick={() => setActiveBranch(branch.code)}
                        className={`w-full text-left px-4 py-3 rounded-2xl text-sm font-bold transition-all flex items-center justify-between ${activeBranch === branch.code ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"}`}>
                        <span className="truncate pr-2">{branch.name}</span>
                      </button>
                    ))
                  )}
                </div>

                {/* Subjects Grid */}
                <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-card/50">
                  {availableData.find(b => b.code === activeBranch)?.subjects?.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {availableData.find(b => b.code === activeBranch)?.subjects.map((sub: any) => {
                        const isSelected = selectedSubjects.includes(sub.name);
                        return (
                          <div key={sub.id} onClick={() => toggleSubject(sub.name)}
                            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex gap-3 ${isSelected ? "border-primary bg-primary/5 shadow-sm" : "border-border/40 hover:border-primary/40 bg-card hover:bg-muted/20"}`}>
                            <div className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-colors ${isSelected ? "bg-primary text-primary-foreground" : "border-2 border-muted-foreground/30"}`}>
                              {isSelected && <Check size={14} strokeWidth={3}/>}
                            </div>
                            <div>
                              <p className={`text-sm font-bold leading-tight ${isSelected ? "text-foreground" : "text-muted-foreground"}`}>{sub.name}</p>
                              <div className="flex items-center gap-2 mt-2">
                                {sub.code && <span className="text-[10px] font-bold text-muted-foreground px-2 py-0.5 rounded-md bg-muted/50 uppercase">{sub.code}</span>}
                                {sub.semester && <span className="text-[10px] font-bold text-primary/80 px-2 py-0.5 rounded-md bg-primary/10">Sem {sub.semester}</span>}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <EmptyState text="No subjects found for this branch." />
                  )}
                </div>
              </div>

              <div className="p-6 border-t border-border/50 bg-muted/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  <span className="text-primary">{selectedSubjects.length}</span> Subjects Selected Globally
                </p>
                <div className="flex gap-3 w-full sm:w-auto">
                  <button disabled={savingSubjects} onClick={() => setIsManagingSubjects(false)} className="flex-1 sm:flex-none px-6 py-3 rounded-xl bg-card border border-border font-bold text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-all">Cancel</button>
                  <button disabled={savingSubjects} onClick={saveSubjects} className="flex-1 sm:flex-none px-8 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:shadow-lg hover:shadow-primary/20 transition-all flex items-center justify-center gap-2">
                    {savingSubjects ? <><Loader2 size={16} className="animate-spin"/> Saving...</> : <><Check size={16}/> Save Updates</>}
                  </button>
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
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

  if (authLoading || !teacher) return <div className="h-screen w-full flex items-center justify-center bg-background"><Loader2 className="animate-spin text-primary" size={32}/></div>;

  const sections: Record<string, React.ReactNode> = {
    timetable: <TimetableSection teacher={teacher} />,
    upload: <UploadSection teacher={teacher} />,
    students: <StudentsSection department={teacher.department} />,
    notices: <NoticesSection userId={teacher.id} department={teacher.department} />,
    tickets: <TicketsSection userId={teacher.id} department={teacher.department} />,
    profile: <ProfileSection teacher={teacher} />
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
             <img width={16} height={16} src="/assets/college/logo.png" alt="AIMS Logo" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-base tracking-tight text-foreground">AIMS TEACHER</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold opacity-70">Faculty Portal</span>
          </div>
          <button onClick={()=>setSidebarOpen(false)} className="ml-auto lg:hidden p-2 rounded-lg hover:bg-accent text-muted-foreground transition-colors"><X size={18}/></button>
        </div>

        {/* User profile card in sidebar */}
        <div className="mx-4 mt-6 mb-4 p-4 rounded-2xl bg-gradient-to-br from-primary/[0.07] to-transparent border border-primary/10 shadow-sm relative overflow-hidden group text-center sm:text-left">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl -mr-8 -mt-8 group-hover:bg-primary/10 transition-colors" />
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 flex-shrink-0">
              <span className="text-sm font-bold text-primary">{teacher.initials}</span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-foreground truncate">{teacher.name}</p>
              <p className="text-[10px] text-muted-foreground/80 font-medium">{teacher.designation}</p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-1.5 relative z-10">
            <span className="text-[9px] px-2 py-0.5 rounded-full bg-primary/15 text-primary font-bold border border-primary/10">{teacher.department} Dept</span>
            <span className="text-[9px] px-2 py-0.5 rounded-full bg-accent/10 text-accent-foreground font-bold border border-accent/10">{teacher.subjects.length} Subjects</span>
          </div>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto scrollbar-hide">
          {sidebarItems.map((item, idx) => (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.03 }}
              onClick={() => handleSectionChange(item.id)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold transition-all relative group ${
                activeSection === item.id
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/40"
              }`}
            >
              <div className="flex items-center gap-3.5">
                <item.icon
                  size={18}
                  className={`${
                    activeSection === item.id
                      ? ""
                      : "group-hover:scale-110 transition-transform"
                  }`}
                />
                {item.label}
              </div>
              {badges[item.id] > 0 && (
                <span className="w-5 h-5 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center shadow-lg shadow-red-500/30 animate-pulse">
                  {badges[item.id]}
                </span>
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
            <p className="text-xs font-bold text-primary uppercase tracking-[0.2em] mb-0.5 opacity-80">Faculty Control</p>
            <h1 className="text-xl font-bold text-foreground tracking-tight">
              {sidebarItems.find(i=>i.id===activeSection)?.label || "Welcome"}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 p-1 rounded-xl bg-muted/60 border border-border/50">
              <ThemeToggle />
            </div>
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-border/50 shadow-sm ring-1 ring-primary/10">
              <span className="text-sm font-bold text-primary">{teacher.initials}</span>
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
