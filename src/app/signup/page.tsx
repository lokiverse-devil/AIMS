"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Eye, EyeOff, UserPlus, ArrowLeft, GraduationCap as StudentIcon, BookOpen, Hash, Lock, ShieldCheck, Mail } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { signupStudent, signupTeacher } from "@/api/auth";
import { useRouter } from "next/navigation";

type Role = "student" | "teacher";

const departments = ["Computer Science Engineering", "Information Technology", "Electronics Engineering"];

const selectCls =
  "w-full px-4 py-2.5 rounded-xl border border-border bg-input text-foreground " +
  "focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 " +
  "transition-all text-sm appearance-none cursor-pointer";

const inputCls =
  "w-full px-4 py-3 rounded-xl border border-border bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm shadow-inner";

export default function SignupPage() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("student");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [studentForm, setStudentForm] = useState({
    rollNumber: "", email: "", password: "", confirmPassword: ""
  });

  const [teacherForm, setTeacherForm] = useState({
    name: "", department: "", email: "", password: "", teacherAccessKey: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (role === "student") {
      // Validate passwords match
      if (studentForm.password !== studentForm.confirmPassword) {
        setError("Passwords do not match.");
        setLoading(false);
        return;
      }
      if (studentForm.password.length < 8) {
        setError("Password must be at least 8 characters.");
        setLoading(false);
        return;
      }

      const { data, error: err } = await signupStudent({
        rollNumber: studentForm.rollNumber,
        email: studentForm.email,
        password: studentForm.password,
        role: "student",
      });
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

  const passwordsMatch = studentForm.confirmPassword.length === 0 || studentForm.password === studentForm.confirmPassword;

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
                    {/* Info banner */}
                    <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                        <ShieldCheck size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">Roll Number Registration</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Your teacher must have uploaded your roll number first. Enter it below with a new password to create your account.
                        </p>
                      </div>
                    </div>

                    {/* Roll Number */}
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
                        <Hash size={14} className="text-primary" />
                        Roll Number *
                      </label>
                      <input
                        required
                        value={studentForm.rollNumber}
                        onChange={(e) => setStudentForm({ ...studentForm, rollNumber: e.target.value })}
                        placeholder="e.g. 23009050024"
                        className={inputCls}
                      />
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
                        <Mail size={14} className="text-primary" />
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={studentForm.email}
                        onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                        placeholder="youremail@example.com"
                        className={inputCls}
                      />
                      <p className="text-xs text-muted-foreground">
                        Used for account recovery and notifications.
                      </p>
                    </div>

                    {/* Password */}
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
                        <Lock size={14} className="text-primary" />
                        Password *
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          minLength={8}
                          value={studentForm.password}
                          onChange={(e) => setStudentForm({ ...studentForm, password: e.target.value })}
                          placeholder="Minimum 8 characters"
                          className={`${inputCls} pr-11`}
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                          {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
                        <Lock size={14} className="text-primary" />
                        Confirm Password *
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirm ? "text" : "password"}
                          required
                          minLength={8}
                          value={studentForm.confirmPassword}
                          onChange={(e) => setStudentForm({ ...studentForm, confirmPassword: e.target.value })}
                          placeholder="Re-enter your password"
                          className={`${inputCls} pr-11 ${!passwordsMatch ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""}`}
                        />
                        <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                          {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                      {!passwordsMatch && (
                        <p className="text-xs text-red-500 font-medium mt-1">Passwords do not match</p>
                      )}
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
                          className={inputCls}
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
                        className={inputCls}
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
                          className={`${inputCls} pr-11`}
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
                        className={inputCls}
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
                  disabled={loading || (role === "student" && !passwordsMatch)}
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
