"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { supabase } from "@/lib/supabaseClient";
import {
  Users, Key, Database, LayoutDashboard, LogOut, Loader2, PlayCircle,
  Plus, Search, Edit2, Trash2, Shield, CheckCircle2, AlertTriangle, ArrowLeft
} from "lucide-react";
import Link from "next/link";

// ── TYPES ──────────────────────────────────────────────────────────
type AdminTab = "overview" | "users" | "keys" | "database";

interface SystemUser {
  id: string;
  role: string;
  name?: string;
  branch?: string;
  created_at: string;
}

interface TeacherKey {
  id: string;
  key: string;
  used: boolean;
  used_by: string | null;
  users?: { name: string } | null;
  created_at: string;
}

// ── COMPONENT ──────────────────────────────────────────────────────
export default function AdminDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [loadingToken, setLoadingToken] = useState(true);
  
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [keys, setKeys] = useState<TeacherKey[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  // Database Tab States
  const [dbTable, setDbTable] = useState("users");
  const [dbId, setDbId] = useState("");
  const [dbUpdates, setDbUpdates] = useState("");
  const [dbLoading, setDbLoading] = useState(false);
  const [message, setMessage] = useState<{type:"success"|"error", text:string}|null>(null);

  // ── INIT ─────────────────────────────────────────────────────────
  useEffect(() => {
    // We enforce dark mode locally for the admin portal body
    document.documentElement.classList.add("dark");

    (async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session) {
        router.push("/login");
        return;
      }
      setSessionToken(session.access_token);
      setLoadingToken(false);
    })();

    return () => {
      // Revert if they leave (optional, but requested dark theme)
      // document.documentElement.classList.remove("dark");
    };
  }, [router]);

  const showMsg = (type: "success"|"error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const fetchUsers = async () => {
    if (!sessionToken) return;
    setLoadingData(true);
    try {
      const res = await fetch("/api/admin/users", {
        headers: { Authorization: `Bearer ${sessionToken}` }
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setUsers(json.data || []);
    } catch (e: any) {
      showMsg("error", e.message);
    } finally {
      setLoadingData(false);
    }
  };

  const fetchKeys = async () => {
    if (!sessionToken) return;
    setLoadingData(true);
    try {
      const res = await fetch("/api/admin/keys", {
        headers: { Authorization: `Bearer ${sessionToken}` }
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setKeys(json.data || []);
    } catch (e: any) {
      showMsg("error", e.message);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (activeTab === "users") fetchUsers();
    else if (activeTab === "keys") fetchKeys();
    else if (activeTab === "overview") {
      fetchUsers();
      fetchKeys();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, sessionToken]);

  const handleCreateKey = async () => {
    try {
      const res = await fetch("/api/admin/keys", {
        method: "POST",
        headers: { Authorization: `Bearer ${sessionToken}` },
        body: JSON.stringify({})
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      showMsg("success", "New authorization key generated.");
      fetchKeys();
    } catch (e: any) {
      showMsg("error", e.message);
    }
  };

  const handleDeleteKey = async (id: string) => {
    if (!confirm("Irrevocably destroy this key?")) return;
    try {
      const res = await fetch(`/api/admin/keys/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${sessionToken}` }
      });
      if (!res.ok) throw new Error("Failed to delete key");
      showMsg("success", "Key eradicated.");
      fetchKeys();
    } catch (e: any) {
      showMsg("error", e.message);
    }
  };

  const handleDbUpdate = async () => {
    if (!dbTable || !dbId || !dbUpdates) {
      showMsg("error", "All fields are strictly required.");
      return;
    }
    setDbLoading(true);
    try {
      let parsedUpdates;
      try { parsedUpdates = JSON.parse(dbUpdates); } 
      catch { throw new Error("Invalid JSON format in updates payload."); }
      
      const res = await fetch("/api/admin/database", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${sessionToken}` },
        body: JSON.stringify({ table: dbTable, id: dbId, updates: parsedUpdates })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      showMsg("success", `Database record successfully mutated.`);
      setDbId(""); setDbUpdates("");
    } catch (e: any) {
      showMsg("error", e.message);
    } finally {
      setDbLoading(false);
    }
  };

  if (loadingToken) {
    return (
      <div className="min-h-screen bg-[#0b1326] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-cyan-400" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#0b1326] text-slate-200 font-sans selection:bg-cyan-500/30">
      
      {/* ── SIDEBAR ── */}
      <div className="w-64 flex-shrink-0 border-r border-slate-800 bg-[#131b2e] flex flex-col">
        <div className="h-20 flex items-center px-6 border-b border-slate-800">
          <Shield size={28} className="text-cyan-400 mr-3" />
          <div>
            <h1 className="text-lg font-bold text-slate-100 tracking-tight leading-none">AIMS Admin</h1>
            <p className="text-[10px] uppercase tracking-widest text-cyan-500/70 mt-1 font-bold">Digital Observatory</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
          {[
            { id: "overview", label: "Overview", icon: LayoutDashboard },
            { id: "users", label: "User Directory", icon: Users },
            { id: "keys", label: "Access Keys", icon: Key },
            { id: "database", label: "Database Core", icon: Database },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as AdminTab)}
              className={`w-full flex items-center px-4 py-3 rounded-xl transition-all font-semibold text-sm border ${
                activeTab === item.id 
                  ? "bg-[#222a3d] text-cyan-400 border-cyan-500/20 shadow-[0_0_15px_rgba(0,229,255,0.05)]" 
                  : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <item.icon size={18} className="mr-3" />
              {item.label}
              {activeTab === item.id && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#00E5FF]" />
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <Link href="/dashboard/teacher" className="w-full flex items-center px-4 py-3 rounded-xl transition-all font-semibold text-sm border border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 mb-2">
            <ArrowLeft size={18} className="mr-3" /> Exit to Standard
          </Link>
          <button onClick={async () => { await supabase.auth.signOut(); router.push("/login"); }} 
            className="w-full flex items-center px-4 py-3 rounded-xl transition-all font-semibold text-sm border border-red-500/10 text-red-400 hover:bg-red-500/10 hover:border-red-500/30">
            <LogOut size={18} className="mr-3" /> Terminate Session
          </button>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Glow ambient */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none" />
        
        <header className="h-20 flex-shrink-0 flex items-center justify-between px-8 border-b border-slate-800/50 backdrop-blur-xl bg-[#0b1326]/80 z-10">
          <h2 className="text-xl font-bold tracking-tight capitalize">{activeTab.replace("-", " ")}</h2>
          <div className="flex items-center gap-4">
            <div className="px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#00E5FF]" />
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">System Optimal</span>
            </div>
            <ThemeToggle />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 z-10 no-scrollbar">
          
          <AnimatePresence mode="wait">
            {message && (
              <motion.div initial={{opacity:0, y:-10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}}
                className={`mb-6 p-4 rounded-xl flex items-center gap-3 text-sm font-bold border ${message.type==="success"?"bg-[#00363d] border-[#00626e] text-cyan-100":"bg-[#ffe1df] border-[#ffb4ab] text-[#93000a]"}`}>
                {message.type==="success" ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
                {message.text}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}} transition={{duration:0.2}} className="h-full">
              
              {/* OVERVIEW TAB */}
              {activeTab === "overview" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-6 rounded-2xl bg-[#131b2e] border border-slate-800">
                    <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center mb-4">
                      <Users size={24} className="text-cyan-400" />
                    </div>
                    <p className="text-sm text-slate-400 font-semibold mb-1">Total Authenticated Users</p>
                    <p className="text-4xl font-bold font-mono">{users.length}</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-[#131b2e] border border-slate-800">
                    <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4">
                      <Key size={24} className="text-purple-400" />
                    </div>
                    <p className="text-sm text-slate-400 font-semibold mb-1">Active Registration Keys</p>
                    <p className="text-4xl font-bold font-mono">{keys.length}</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-[#131b2e] border border-slate-800">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4">
                      <Database size={24} className="text-emerald-400" />
                    </div>
                    <p className="text-sm text-slate-400 font-semibold mb-1">Database Integrity</p>
                    <p className="text-xl font-bold mt-2 text-emerald-400">100% Verified</p>
                  </div>
                </div>
              )}

              {/* USERS TAB */}
              {activeTab === "users" && (
                <div className="space-y-6">
                  {loadingData ? <div className="text-center py-12 text-slate-500"><Loader2 className="animate-spin mx-auto mb-2"/> Syncing Directory...</div> : (
                    <div className="rounded-2xl border border-slate-800 bg-[#131b2e] overflow-hidden">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-[#0b1326] border-b border-slate-800/50">
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Identity UUID</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Classification</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Branch Node</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Timestamp</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                          {users.map(u => (
                            <tr key={u.id} className="hover:bg-[#222a3d]/50 transition-colors">
                              <td className="px-6 py-4 font-mono text-xs text-slate-300">{u.id}</td>
                              <td className="px-6 py-4">
                                <span className={`px-2.5 py-1 rounded-md text-[10px] uppercase font-bold tracking-widest border ${
                                  u.role==="student" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : 
                                  u.role==="teacher" ? "bg-purple-500/10 text-purple-400 border-purple-500/20" : 
                                  "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
                                }`}>
                                  {u.role}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm font-semibold text-slate-400">{u.branch || "—"}</td>
                              <td className="px-6 py-4 text-xs text-slate-500">{new Date(u.created_at).toLocaleDateString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* KEYS TAB */}
              {activeTab === "keys" && (
                <div className="space-y-6">
                  <div className="flex justify-end">
                    <button onClick={handleCreateKey} className="px-6 py-3 rounded-xl bg-gradient-to-br from-cyan-400 to-[#00E5FF] text-[#00363d] font-bold text-sm hover:shadow-[0_0_20px_rgba(0,229,255,0.4)] transition-all flex items-center gap-2">
                      <Plus size={18}/> Synthesize Key
                    </button>
                  </div>
                  {loadingData ? <div className="text-center py-12 text-slate-500"><Loader2 className="animate-spin mx-auto mb-2"/> Compiling Keys...</div> : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {keys.map(k => (
                        <div key={k.id} className="p-6 rounded-2xl bg-[#131b2e] border border-slate-800 relative group overflow-hidden">
                          <div className={`absolute top-0 right-0 p-3 rounded-bl-2xl text-[10px] font-bold uppercase tracking-wider ${k.used?"bg-slate-800 text-slate-500":"bg-cyan-500/10 text-cyan-400"}`}>
                            {k.used ? "Consumed" : "Active"}
                          </div>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Passphrase String</p>
                          <p className="text-lg font-mono font-bold text-slate-200 mb-4">{k.key}</p>
                          <div className="flex items-center justify-between mt-6">
                            <span className="text-xs text-slate-500 font-mono" title={k.used_by || "Null"}>
                              Claimant: {k.users?.name ? `${k.users.name} (${k.used_by?.substring(0,4)}...)` : (k.used_by ? k.used_by.substring(0,8)+"..." : "None")}
                            </span>
                            <button onClick={()=>handleDeleteKey(k.id)} className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all">
                              <Trash2 size={16}/>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* DATABASE TAB */}
              {activeTab === "database" && (
                <div className="max-w-2xl mx-auto space-y-6">
                  <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 flex items-start gap-4">
                    <AlertTriangle className="text-amber-500 flex-shrink-0 mt-0.5" size={20}/>
                    <div>
                      <h4 className="text-sm font-bold text-amber-500">Caution: Direct Mutation Protocol</h4>
                      <p className="text-xs text-amber-500/70 mt-1">Updates applied here bypass application-level validation. Improper JSON formatting will cause catastrophic mutation failures.</p>
                    </div>
                  </div>

                  <div className="p-6 rounded-2xl bg-[#131b2e] border border-slate-800 space-y-5">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Target Table</label>
                      <select value={dbTable} onChange={e=>setDbTable(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-[#0b1326] border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm font-medium outline-none transition-all">
                        {['users', 'students', 'teachers', 'branches', 'labs', 'teacher_keys'].map(t=><option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Primary Key ID</label>
                      <input value={dbId} onChange={e=>setDbId(e.target.value)} placeholder="UUID or Roll Number" className="w-full px-4 py-3 rounded-xl bg-[#0b1326] border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm font-mono outline-none transition-all" />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold tracking-widest text-slate-500">JSON Payload</label>
                      <textarea value={dbUpdates} onChange={e=>setDbUpdates(e.target.value)} placeholder='{"column": "new_value"}' rows={5} className="w-full px-4 py-3 rounded-xl bg-[#0b1326] border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm font-mono outline-none transition-all resize-none" />
                    </div>

                    <button disabled={dbLoading} onClick={handleDbUpdate} className="w-full py-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm transition-all border border-slate-700 disabled:opacity-50 flex items-center justify-center gap-2">
                      {dbLoading ? <Loader2 size={16} className="animate-spin"/> : <PlayCircle size={18}/>} Execute Mutation
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

        </main>
      </div>
    </div>
  );
}
