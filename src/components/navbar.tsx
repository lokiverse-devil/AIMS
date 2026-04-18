"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, LogOut, LayoutDashboard, User } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/branches/cse", label: "CSE" },
  { href: "/branches/it", label: "IT" },
  { href: "/branches/elex", label: "ELEX" },
];

interface SessionUser {
  name: string;
  role: "student" | "teacher" | "admin";
  initials: string;
  photoUrl?: string | null;
}

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Check session on mount
  useEffect(() => {
    (async () => {
      try {
        const { getCurrentUser } = await import("@/api/auth");
        const userData = await getCurrentUser();
        if (userData?.user) {
          const u = userData.user;
          const name = (u as any).name || u.email?.split("@")[0] || "User";
          const initials = name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);
          setUser({ name, role: u.role, initials, photoUrl: u.photo_url || null });
        }
      } catch (_) {}
    })();
  }, []);

  const dashboardHref = user?.role === "teacher" ? "/dashboard/teacher" : "/dashboard/student";

  const handleLogout = async () => {
    const { logoutUser } = await import("@/api/auth");
    await logoutUser();
    setUser(null);
    setShowUserMenu(false);
    window.location.href = "/login";
  };

  return (
    <header
      className={`fixed top-0 left-0 w-full z-[100] transition-all duration-500 py-4 
        bg-background/95 backdrop-blur-xl border-b border-border shadow-sm
        before:absolute before:inset-0 before:bg-gradient-to-r before:from-primary/5 before:via-transparent before:to-primary/5 before:pointer-events-none`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="h-10 w-10 rounded-[14px] overflow-hidden flex-shrink-0 shadow-[0_2px_10px_rgba(0,0,0,0.1)] group-hover:shadow-[0_4px_15px_rgba(0,0,0,0.2)] transition-all border border-black/5 dark:border-white/10 bg-white">
             <img src="/assets/college/logo.png" alt="AIMS Logo" className="w-full h-full object-contain" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-lg font-serif font-bold tracking-tight transition-colors text-foreground">AIMS X IT BLOCK</span>
            <span className="text-[9px] font-medium uppercase tracking-widest hidden sm:block transition-colors text-muted-foreground">
              Academic Infrastructure
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                pathname === link.href
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <ThemeToggle />

          {user ? (
            /* Logged-in state */
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border bg-card hover:bg-accent/50 transition-all"
              >
                <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center overflow-hidden border border-primary/20">
                  {user.photoUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={user.photoUrl} alt="User" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[10px] font-bold text-primary">{user.initials}</span>
                  )}
                </div>
                <div className="text-left">
                  <p className="text-xs font-semibold text-foreground leading-none">{user.name}</p>
                  <p className="text-[9px] text-muted-foreground capitalize">{user.role}</p>
                </div>
              </button>

              <AnimatePresence>
                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-border bg-card shadow-xl p-1.5 z-50"
                  >
                    <Link href={dashboardHref} onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-foreground hover:bg-accent transition-colors">
                      <LayoutDashboard size={14} /> Dashboard
                    </Link>
                    <Link href={dashboardHref + "?section=profile"} onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-foreground hover:bg-accent transition-colors">
                      <User size={14} /> Profile
                    </Link>
                    <div className="h-px bg-border my-1" />
                    <button onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-red-500 hover:bg-red-500/10 transition-colors">
                      <LogOut size={14} /> Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className={`hidden md:inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  !scrolled && pathname === "/"
                  ? "text-white/80 hover:text-white hover:bg-white/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5"
                }`}
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="hidden md:inline-flex items-center px-5 py-2 rounded-xl aims-btn-primary text-sm font-medium transition-all"
              >
                Sign Up
              </Link>
            </>
          )}

          <button
            className="md:hidden w-9 h-9 rounded-lg flex items-center justify-center border border-border bg-card hover:bg-accent transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </nav>

      {/* Close user menu on outside click */}
      {showUserMenu && <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />}

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden aims-glass-card border-t overflow-hidden"
          >
            <div className="px-4 py-3 flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    pathname === link.href
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              {user ? (
                <>
                  <Link href={dashboardHref} onClick={() => setMobileOpen(false)}
                    className="px-3.5 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-accent flex items-center gap-2">
                    <LayoutDashboard size={14} /> Dashboard
                  </Link>
                  <button onClick={handleLogout}
                    className="px-3.5 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-500/10 text-left flex items-center gap-2">
                    <LogOut size={14} /> Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setMobileOpen(false)}
                    className="px-3.5 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent">
                    Login
                  </Link>
                  <Link href="/signup" onClick={() => setMobileOpen(false)}
                    className="mt-1 px-3.5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium text-center">
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
