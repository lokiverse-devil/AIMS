"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Eye, EyeOff, GraduationCap, UserPlus, ArrowLeft, GraduationCap as StudentIcon, BookOpen } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { signupStudent, signupTeacher } from "@/api/auth";
import { useRouter } from "next/navigation";

type Role = "student" | "teacher";

const branches = ["CSE", "IT", "ELEX"];
const semesters = ["1st", "2nd", "3rd", "4th", "5th", "6th"];
const departments = ["Computer Science Engineering", "Information Technology", "Electronics Engineering"];

// Shared class for all <select> elements
const selectCls =
  "w-full px-4 py-2.5 rounded-xl border border-border bg-input text-foreground " +
  "focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 " +
  "transition-all text-sm appearance-none cursor-pointer";

export default function SignupPage() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("student");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [studentForm, setStudentForm] = useState({
    name: "", rollNumber: "", branch: "", semester: "", email: "", password: ""
  });

  const [teacherForm, setTeacherForm] = useState({
    name: "", department: "", email: "", password: "", teacherAccessKey: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (role === "student") {
      const { data, error: err } = await signupStudent({ ...studentForm, role: "student" });
      setLoading(false);
      if (err) { setError(err.message); return; }
      if (data) router.push("/dashboard/student");
    } else {
      const { data, error: err } = await signupTeacher({
        ...teacherForm,
        role: "teacher",
      });
      setLoading(false);
      if (err) { setError(err.message); return; }
      if (data) router.push("/dashboard/teacher");
    }
  };

  return (
    <div className="min-h-screen bg-background aims-grid-bg">
      {/* Top bar */}
      <div className="fixed top-0 left-0 right-0 z-50 px-4 py-3 flex items-center justify-between border-b border-border/30 bg-background/60 backdrop-blur-3xl shadow-sm">
        <Link href="/" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft size={14} /> Back to Home
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center overflow-hidden border border-primary/20 shadow-sm">
            <img src="/assets/college/logo.png" alt="AIMS Logo" className="w-full h-full object-contain" />
          </div>
          <span className="font-bold text-sm text-foreground">AIMS</span>
        </div>
        <ThemeToggle />
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-24 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-8">
            <h1 className="text-4xl font-serif font-bold text-foreground">Create your AIMS account</h1>
            <p className="text-muted-foreground mt-2">Choose your role and fill in your details below.</p>
          </div>

          {/* Role Selector */}
          <div className="flex gap-3 mb-10 p-2 rounded-[1.5rem] aims-glass-card bg-primary/5">
            {(["student", "teacher"] as Role[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => { setRole(r); setError(null); }}
                className={`flex-1 flex items-center justify-center gap-2.5 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  role === r
                    ? "bg-card text-foreground shadow-sm border-[0.5px] border-white/20 dark:border-white/5"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                }`}
              >
                {r === "student" ? <StudentIcon size={16} /> : <BookOpen size={16} />}
                {r === "student" ? "Student" : "Teacher / Faculty"}
              </button>
            ))}
          </div>

          {/* Form Card */}
          <div className="p-8 rounded-[2rem] aims-glass-card shadow-sm space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
            <AnimatePresence mode="wait">
              <motion.form
                key={role}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.22 }}
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                {role === "student" ? (
                  <>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-foreground">Full Name *</label>
                        <input
                          required
                          value={studentForm.name}
                          onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                          placeholder="Rahul Sharma"
                          className="w-full px-4 py-3 rounded-xl border border-border bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm shadow-inner"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-foreground">Roll Number *</label>
                        <input
                          required
                          value={studentForm.rollNumber}
                          onChange={(e) => setStudentForm({ ...studentForm, rollNumber: e.target.value })}
                          placeholder="CSE2022001"
                          className="w-full px-4 py-3 rounded-xl border border-border bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm shadow-inner"
                        />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-foreground">Branch *</label>
                        <div className="relative">
                          <select
                            required
                            value={studentForm.branch}
                            onChange={(e) => setStudentForm({ ...studentForm, branch: e.target.value })}
                            className={selectCls}
                          >
                            <option value="" disabled className="bg-background text-foreground">Select Branch</option>
                            {branches.map((b) => <option key={b} value={b} className="bg-background text-foreground">{b}</option>)}
                          </select>
                          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-foreground">Semester *</label>
                        <div className="relative">
                          <select
                            required
                            value={studentForm.semester}
                            onChange={(e) => setStudentForm({ ...studentForm, semester: e.target.value })}
                            className={selectCls}
                          >
                            <option value="" disabled className="bg-background text-foreground">Select Semester</option>
                            {semesters.map((s) => <option key={s} value={s} className="bg-background text-foreground">{s}</option>)}
                          </select>
                          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-foreground">Email Address *</label>
                      <input
                        type="email"
                        required
                        value={studentForm.email}
                        onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                        placeholder="rollno@college.edu"
                        className="w-full px-4 py-3 rounded-xl border border-border bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm shadow-inner"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-foreground">Password *</label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          minLength={8}
                          value={studentForm.password}
                          onChange={(e) => setStudentForm({ ...studentForm, password: e.target.value })}
                          placeholder="Minimum 8 characters"
                          className="w-full px-4 py-3 pr-11 rounded-xl border border-border bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm shadow-inner"
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                          {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Teacher Form */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-foreground">Full Name *</label>
                        <input
                          required
                          value={teacherForm.name}
                          onChange={(e) => setTeacherForm({ ...teacherForm, name: e.target.value })}
                          placeholder="Prof. Anil Sharma"
                          className="w-full px-4 py-3 rounded-xl border border-border bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm shadow-inner"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-foreground">Department *</label>
                        <div className="relative">
                          <select
                            required
                            value={teacherForm.department}
                            onChange={(e) => setTeacherForm({ ...teacherForm, department: e.target.value })}
                            className={selectCls}
                          >
                            <option value="" disabled className="bg-background text-foreground">Select Department</option>
                            {departments.map((d) => <option key={d} value={d} className="bg-background text-foreground">{d}</option>)}
                          </select>
                          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          </div>
                        </div>
                      </div>
                    </div>



                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-foreground">Email Address *</label>
                      <input
                        type="email"
                        required
                        value={teacherForm.email}
                        onChange={(e) => setTeacherForm({ ...teacherForm, email: e.target.value })}
                        placeholder="faculty@college.edu"
                        className="w-full px-4 py-3 rounded-xl border border-border bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm shadow-inner"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-foreground">Password *</label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          minLength={8}
                          value={teacherForm.password}
                          onChange={(e) => setTeacherForm({ ...teacherForm, password: e.target.value })}
                          placeholder="Minimum 8 characters"
                          className="w-full px-4 py-3 pr-11 rounded-xl border border-border bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm shadow-inner"
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                          {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-foreground">
                        Teacher Access Key *{" "}
                        <span className="text-muted-foreground font-normal">(Faculty-issued)</span>
                      </label>
                      <input
                        required
                        value={teacherForm.teacherAccessKey}
                        onChange={(e) => setTeacherForm({ ...teacherForm, teacherAccessKey: e.target.value })}
                        placeholder="e.g. AIMS-TEACH-001"
                        className="w-full px-4 py-3 rounded-xl border border-border bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm shadow-inner"
                      />
                      <p className="text-xs text-muted-foreground">
                        Enter the one-time key provided by the faculty administration office.
                      </p>
                    </div>
                  </>
                )}

                {/* Error */}
                {error && (
                  <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm text-center font-medium">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 shadow-md shadow-primary/25 hover:shadow-lg hover:shadow-primary/35 hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:pointer-events-none mt-4 relative overflow-hidden"
                >
                  {loading ? (
                    <span className="w-4 h-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />
                  ) : (
                    <>
                      <UserPlus size={16} />
                      Create {role === "student" ? "Student" : "Faculty"} Account
                    </>
                  )}
                </button>
              </motion.form>
            </AnimatePresence>
          </div>

          <p className="text-sm text-center text-muted-foreground mt-5">
            Already have an account?{" "}
            <Link href="/login" className="text-primary font-medium hover:underline">Sign In</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
