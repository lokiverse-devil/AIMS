"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Eye, EyeOff, GraduationCap, LogIn, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { AuthService } from "@/services/authService";
import { ThemeToggle } from "@/components/theme-toggle";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { success, message, data } = await AuthService.login(form.email, form.password);
    
    setLoading(false);
    
    if (!success) {
      setError(message || "Login failed");
      return;
    }

    const role = data?.profile?.role;
    if (role === "student") {
      router.push("/dashboard/student");
    } else if (role === "teacher") {
      router.push("/dashboard/teacher");
    } else if (role === "admin") {
      router.push("/dashboard/admin");
    } else {
      router.push("/");
    }
  };

  return (
    <div className="min-h-screen bg-background flex aims-grid-bg">
      {/* Left Panel — Decorative */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-primary/10 via-accent/20 to-secondary/30 items-center justify-center p-12">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-accent/20 blur-3xl" />
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative text-center max-w-md"
        >
          <div className="w-20 h-20 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-6 border border-primary/20">
            <GraduationCap size={36} className="text-primary" />
          </div>
          <h2 className="text-4xl font-bold text-foreground mb-3">
            AIMS Portal
          </h2>
          <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
            Academic Infrastructure Management System — your centralized hub for campus operations.
          </p>
          <div className="grid grid-cols-2 gap-3 text-left">
            {[
              { label: "Smart Timetables", desc: "Automated scheduling" },
              { label: "Digital ID Cards", desc: "Always accessible" },
              { label: "Lab Booking", desc: "Real-time availability" },
              { label: "Resources Hub", desc: "Notes & materials" },
            ].map((item) => (
              <div key={item.label} className="p-3.5 rounded-xl bg-card/60 border border-border">
                <p className="font-semibold text-sm text-foreground">{item.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative">
        {/* Top bar */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft size={14} />
            Back to Home
          </Link>
          <ThemeToggle />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <div className="flex items-center gap-2.5 mb-8">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-md overflow-hidden p-1.5">
              <img src="/assets/college/logo.png" alt="AIMS Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <p className="font-bold text-foreground leading-none">AIMS</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Academic Portal</p>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-foreground mb-1">Welcome back</h1>
          <p className="text-muted-foreground mb-8">
            Sign in to access your dashboard and academic resources.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Email Address</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="your@email.com"
                className="w-full px-4 py-3 rounded-xl border border-border bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">Password</label>
                <button type="button" className="text-xs text-primary hover:underline">
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-11 rounded-xl border border-border bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 shadow-md shadow-primary/25 hover:shadow-lg hover:shadow-primary/35 hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:pointer-events-none"
            >
              {loading ? (
                <span className="w-4 h-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />
              ) : (
                <>
                  <LogIn size={16} />
                  Sign In to AIMS
                </>
              )}
            </button>
          </form>

          {error && (
            <div className="mt-4 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm text-center font-medium">
              {error}
            </div>
          )}

          <p className="text-sm text-center text-muted-foreground mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-primary font-medium hover:underline">
              Create Account
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
