"use client";

import React, { useState, useEffect } from "react";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import Link from "next/link";
import {
  Monitor,
  Cpu,
  Zap,
  BookOpen,
  Users,
  FlaskConical,
  Bell,
  ChevronRight,
  Building2,
  Wifi,
  Library,
  Shield,
  Clock,
  Award,
  ArrowRight,
  Crown,
  Database,
  FolderOpen,
  FileText,
  Cloud,
  Code,
  Bot,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { ChatbotWidget } from "@/components/chatbot-widget";

// ── Mock data ──────────────────────────────────────────────────

const branches = [
  {
    id: "cse",
    name: "Computer Science Engineering",
    short: "CSE",
    icon: Monitor,
    color: "from-teal-500/20 to-emerald-500/10",
    accent: "bg-teal-500",
    students: 150,
    faculty: 3,
    description:
      "Cutting-edge knowledge in Computer Science Fundamentals.",
    href: "/branches/cse",
  },
  {
    id: "it",
    name: "Information Technology",
    short: "IT",
    icon: Cpu,
    color: "from-slate-500/20 to-teal-500/10",
    accent: "bg-slate-500",
    students: 150,
    faculty: 3,
    description:
      "Cutting-edge knowledge in Information Technology Fundamentals,",
    href: "/branches/it",
  },
  {
    id: "elex",
    name: "Electronics Engineering",
    short: "ELEX",
    icon: Zap,
    color: "from-emerald-500/20 to-cyan-500/10",
    accent: "bg-emerald-600",
    students: 150,
    faculty: 3,
    description:
      "Cutting-edge knowledge in Electronics Fundamentals.",
    href: "/branches/elex",
  },
];

const facilities = [
  { icon: FlaskConical, label: "Labs", count: "6" },
  { icon: Library, label: "Digital Library", count: "40K+ Books" },
  { icon: Wifi, label: "Campus WiFi", count: "100 Mbps" },
  { icon: Building2, label: "Seminar Halls", count: "3" },
  { icon: Shield, label: "24×7 Security", count: "CCTV + Guards" },
];

const labs = [
  {
    name: "CSE LAB",
    capacity: 23,
    equipment: "Intel i5, 8GB RAM",
    available: true,
    wing: "Ground Floor",
  },
  {
    name: "IT LAB",
    capacity: 32,
    equipment: "Intel i5, 8GB RAM",
    available: true,
    wing: "Ground Floor",
  },
  {
    name: "Electronics Lab",
    capacity: 2,
    equipment: "Oscilloscopes, Signal Generators, IOT kits",
    available: true,
    wing: "First Floor",
  },
  {
    name: "IOT and innovation Lab",
    capacity: 20,
    equipment: "IoT kits, Raspberry Pi 5, 3d printer, Robotic Arm",
    available: false,
    wing: "Ground Floor",
  },
];

const facultyPreview = [
  {
    name: "BP Singh",
    designation: "Principal",
    subjects: "Principal of UGIP Kashipur",
    avatar: "/assets/faculty/bp.jpeg",
    initials: "BP",
  },
  {
    name: "MANMOHAN",
    designation: "Head of Department — CSE",
    subjects: "Internet Of Things, Operating Systems, Computer System And Organization, Data Mining and Warehouse",
    avatar: "/assets/faculty/mannu.jpg",
    initials: "MV",
  },
  {
    name: "JAGDISH CHANDRA PANDEY",
    designation: "Head of Department — IT",
    subjects: "Programming In C, Concepts of .NET Technology, Android Application Development, Java Programming",
    avatar: "/assets/faculty/pandey.jpg",
    initials: "JP",
  },
  {
    name: "MANOJ RIKHARI",
    designation: "Head of Department — ELEX",
    subjects: "VLSI Design, Embedded Systems",
    avatar: "/assets/faculty/manoj.jpg",
    initials: "MR",
  },
];

const notices = [
  {
    id: 1,
    tag: "Exam",
    title: "Semester Examinations – May 2026",
    desc: "Semester exams for all branches scheduled from May, 2026. Timetable published on portal.",
    date: "Feb 18, 2026",
    urgent: true,
  },
  {
    id: 2,
    tag: "Event",
    title: "Skill Week",
    desc: "Register now for coding competitions, robotics showcase, and guest lecture series.",
    date: "Feb 27, 2026",
    urgent: false,
  },
  {
    id: 3,
    tag: "Admin",
    title: "Fee Payment Deadline – March 5, 2026",
    desc: "Students are reminded to clear pending dues before the deadline to avoid academic holds.",
    date: "Feb 12, 2026",
    urgent: true,
  },
];

// ── Animation variants ─────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5 },
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.09 } },
};

// ── Components ─────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className="h-0.5 w-8 aims-accent-bar rounded-full" />
      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
        {children}
      </span>
      <div className="h-0.5 w-8 aims-accent-bar rounded-full" />
    </div>
  );
}

// ── Role → Icon map ────────────────────────────────────────────

const roleIconMap: Record<string, LucideIcon> = {
  frontend: Monitor,
  backend: Cpu,
  database: Database,
  awssetup: Cloud,
  assetmanagement: FolderOpen,
  documentation: FileText,
  code: Code,
  chatbot: Bot,
};

// ── Role → Color scheme map ────────────────────────────────────

interface RoleColorScheme {
  bg: string;
  border: string;
  hoverBorder: string;
  shadow: string;
  ring: string;
  gradient: string;
  badge: string;
  badgeText: string;
  accentBg: string;
  accentText: string;
}

const roleColorMap: Record<string, RoleColorScheme> = {
  leader: {
    bg: "bg-teal-500/[0.04] dark:bg-teal-500/[0.08]",
    border: "border-teal-500/40",
    hoverBorder: "hover:border-teal-500/60",
    shadow: "shadow-teal-500/10 hover:shadow-teal-500/20",
    ring: "ring-teal-500/15",
    gradient: "from-teal-500/8 to-emerald-500/5",
    badge: "bg-teal-500/10",
    badgeText: "text-teal-600 dark:text-teal-400",
    accentBg: "bg-teal-500",
    accentText: "text-white",
  },
  frontend: {
    bg: "bg-cyan-500/[0.04] dark:bg-cyan-500/[0.08]",
    border: "border-cyan-500/30",
    hoverBorder: "hover:border-cyan-500/50",
    shadow: "shadow-cyan-500/10 hover:shadow-cyan-500/20",
    ring: "ring-cyan-500/15",
    gradient: "from-cyan-500/8 to-sky-500/5",
    badge: "bg-cyan-500/10",
    badgeText: "text-cyan-600 dark:text-cyan-400",
    accentBg: "bg-cyan-500",
    accentText: "text-white",
  },
  backend: {
    bg: "bg-indigo-500/[0.04] dark:bg-indigo-500/[0.08]",
    border: "border-indigo-500/30",
    hoverBorder: "hover:border-indigo-500/50",
    shadow: "shadow-indigo-500/10 hover:shadow-indigo-500/20",
    ring: "ring-indigo-500/15",
    gradient: "from-indigo-500/8 to-blue-500/5",
    badge: "bg-indigo-500/10",
    badgeText: "text-indigo-600 dark:text-indigo-400",
    accentBg: "bg-indigo-500",
    accentText: "text-white",
  },
  chatbot: {
    bg: "bg-gray-500/[0.04] dark:bg-gray-400/[0.08]",
    border: "border-gray-600/30 dark:border-gray-400/30",
    hoverBorder: "hover:border-gray-600/50 dark:hover:border-gray-300/50",
    shadow: "shadow-gray-500/10 hover:shadow-gray-500/20",
    ring: "ring-gray-500/15",
    gradient: "from-gray-600/8 to-gray-400/5 dark:from-gray-400/8 dark:to-gray-300/5",
    badge: "bg-gray-600/10 dark:bg-gray-400/10",
    badgeText: "text-gray-700 dark:text-gray-300",
    accentBg: "bg-gray-600 dark:bg-gray-400",
    accentText: "text-white dark:text-gray-900",
  },
  database: {
    bg: "bg-violet-500/[0.04] dark:bg-violet-500/[0.08]",
    border: "border-violet-500/30",
    hoverBorder: "hover:border-violet-500/50",
    shadow: "shadow-violet-500/10 hover:shadow-violet-500/20",
    ring: "ring-violet-500/15",
    gradient: "from-violet-500/8 to-purple-500/5",
    badge: "bg-violet-500/10",
    badgeText: "text-violet-600 dark:text-violet-400",
    accentBg: "bg-violet-500",
    accentText: "text-white",
  },
  awssetup: {
    bg: "bg-amber-500/[0.04] dark:bg-amber-500/[0.08]",
    border: "border-amber-500/30",
    hoverBorder: "hover:border-amber-500/50",
    shadow: "shadow-amber-500/10 hover:shadow-amber-500/20",
    ring: "ring-amber-500/15",
    gradient: "from-amber-500/8 to-orange-500/5",
    badge: "bg-amber-500/10",
    badgeText: "text-amber-600 dark:text-amber-400",
    accentBg: "bg-amber-500",
    accentText: "text-white",
  },
  assetmanagement: {
    bg: "bg-rose-500/[0.04] dark:bg-rose-500/[0.08]",
    border: "border-rose-500/30",
    hoverBorder: "hover:border-rose-500/50",
    shadow: "shadow-rose-500/10 hover:shadow-rose-500/20",
    ring: "ring-rose-500/15",
    gradient: "from-rose-500/8 to-pink-500/5",
    badge: "bg-rose-500/10",
    badgeText: "text-rose-600 dark:text-rose-400",
    accentBg: "bg-rose-500",
    accentText: "text-white",
  },
  documentation: {
    bg: "bg-emerald-500/[0.04] dark:bg-emerald-500/[0.08]",
    border: "border-emerald-500/30",
    hoverBorder: "hover:border-emerald-500/50",
    shadow: "shadow-emerald-500/10 hover:shadow-emerald-500/20",
    ring: "ring-emerald-500/15",
    gradient: "from-emerald-500/8 to-green-500/5",
    badge: "bg-emerald-500/10",
    badgeText: "text-emerald-600 dark:text-emerald-400",
    accentBg: "bg-emerald-500",
    accentText: "text-white",
  },
};

const defaultColors: RoleColorScheme = {
  bg: "bg-card",
  border: "border-border",
  hoverBorder: "hover:border-primary/40",
  shadow: "shadow-primary/10 hover:shadow-primary/15",
  ring: "ring-primary/10",
  gradient: "from-primary/5 to-accent/5",
  badge: "bg-primary/10",
  badgeText: "text-primary",
  accentBg: "bg-primary",
  accentText: "text-primary-foreground",
};

function getMemberColors(role: string): RoleColorScheme {
  const allRoles = role.toLowerCase().split(",").map((r) => r.trim().replace(/[-\s]/g, ""));
  // Priority: leader > first role with a color
  for (const r of allRoles) {
    if (roleColorMap[r]) return roleColorMap[r];
  }
  return defaultColors;
}

// ── Types ──────────────────────────────────────────────────────

interface TeamMember {
  name: string;
  role: string;
  image: string;
  github?: string;
}

// ── Page ───────────────────────────────────────────────────────

export default function HomePage() {
  const [teamMembers, setTeamMembers] = useState<
    { id: string; data: TeamMember }[]
  >([]);
  const [uiNotices, setUiNotices] = useState<any[]>(notices);

  const [dashboardHref, setDashboardHref] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [bgVideoUrl, setBgVideoUrl] = useState<string>("/assets/college/it.block.mp4");

  useEffect(() => {
    (async () => {
      try {
        const { getCurrentUser } = await import("@/api/auth");
        const userData = await getCurrentUser();
        if (userData?.user) {
          const u = userData.user;
          const role = u.role;
          const name = (u as any).name || u.email?.split("@")[0] || "User";
          setDashboardHref(role === "teacher" ? "/dashboard/teacher" : "/dashboard/student");
          setUserName(name);
          setUserPhoto(u.photo_url || null);
        }
      } catch (_) { }
    })();
  }, []);

  useEffect(() => {
    async function loadNotices() {
      try {
        const { fetchGeneralNotices } = await import('@/api/timetable');
        const fetched = await fetchGeneralNotices();
        if (fetched && fetched.length > 0) {
          setUiNotices(fetched.map((n: any) => ({
            id: n.id,
            tag: 'General Campus',
            title: n.title,
            desc: n.content,
            date: new Date(n.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            urgent: n.priority === 'High',
            file_url: n.file_url,
          })));
        }
      } catch (err) {
        console.error("Failed to fetch notices:", err);
      }
    }
    loadNotices();
  }, []);

  useEffect(() => {
    fetch("/assets/team/details.json")
      .then((res) => res.json())
      .then((data: Record<string, TeamMember>) => {
        setTeamMembers(
          Object.entries(data).map(([id, member]) => ({ id, data: member }))
        );
      })
      .catch(() => { });
  }, []);

  useEffect(() => {
    fetch("/assets/media.json")
      .then((res) => res.json())
      .then((data) => {
        if (data?.videos?.itBlockBg) {
          setBgVideoUrl(data.videos.itBlockBg);
        }
      })
      .catch(() => { });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* ─── HERO ──────────────────────────────────────────────── */}
      <section
        className="relative min-h-screen flex items-center overflow-hidden aims-grid-bg"
      >
        {/* Background Video */}
        <video
          className="absolute inset-0 w-full h-full object-cover z-0"
          src={bgVideoUrl}
          autoPlay
          loop
          muted
          playsInline
        />


        {/* Gradient & grid overlays */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/15 z-[2]" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 pt-36">
          <motion.div

            variants={stagger}
            initial="hidden"
            animate="visible"
            className="max-w-4xl"
          >
            <motion.div variants={fadeUp} custom={0} className="mb-6">
              <span className="inline-flex items-center gap-2.5 bg-background/40 backdrop-blur-xl px-4 py-2 rounded-2xl border border-white/10 shadow-lg">
                <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-foreground/80">
                  IT BLOCK X AIMS · ACADEMIC EXCELLENCE
                </span>
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              custom={1}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight tracking-tighter mb-8"
            >
              <span className="relative inline-block">
                <span className="relative z-10 text-white drop-shadow-2xl">
                  IT BLOCK:
                </span>
                <span className="absolute -inset-x-4 inset-y-2 bg-primary/20 blur-2xl -z-10 rounded-full" />
              </span>
              <br />
              <span className="text-primary italic">UGIP KASHIPUR</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              custom={2}
              className="text-lg sm:text-xl leading-relaxed max-w-2xl mb-12 font-medium text-white/90"
            >
              <span className="bg-black/20 backdrop-blur-md px-2 py-1 rounded-md box-decoration-clone">
                A centralized, high-performance ecosystem for managing academic infrastructure,
                streamlining resources, and empowering the next generation of engineers.
              </span>
            </motion.p>

            <motion.div
              variants={fadeUp}
              custom={3}
              className="flex flex-wrap gap-4"
            >
              {dashboardHref ? (
                <>
                  <Link
                    href={dashboardHref}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/35 hover:-translate-y-0.5 transition-all duration-200"
                  >
                    Go to Dashboard <ArrowRight size={16} />
                  </Link>
                  <div className="inline-flex items-center gap-3 px-4 py-2 rounded-xl border border-border bg-card/80 backdrop-blur text-foreground font-semibold text-sm">
                    {userPhoto && (
                      <div className="w-6 h-6 rounded-lg overflow-hidden border border-primary/20">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={userPhoto} alt="User" className="w-full h-full object-cover" />
                      </div>
                    )}
                    Welcome back, {userName}
                  </div>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/35 hover:-translate-y-0.5 transition-all duration-200"
                  >
                    Access Dashboard <ArrowRight size={16} />
                  </Link>
                  <Link
                    href="/signup"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-border bg-card/80 backdrop-blur text-foreground font-semibold text-sm hover:border-primary/50 hover:bg-accent/30 transition-all duration-200"
                  >
                    Create Account <ChevronRight size={16} />
                  </Link>
                </>
              )}
            </motion.div>

            {/* Stats row */}
            <motion.div
              variants={fadeUp}
              custom={4}
              className="mt-16 inline-flex flex-wrap gap-8 p-6 sm:p-8 rounded-[2.5rem] bg-black/30 backdrop-blur-md border border-white/10 shadow-2xl"
            >
              {[
                { value: "350", label: "Students Enrolled" },
                { value: "9", label: "Faculty Members" },
                { value: "6", label: "Labs & Facilities" },
                { value: "3", label: "Engineering Branches" },
              ].map((stat) => (
                <div key={stat.label} className="flex flex-col">
                  <span className="text-3xl font-bold text-primary">{stat.value}</span>
                  <span className="text-sm text-white/70">{stat.label}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1"
        >
          <span className="text-xs text-muted-foreground">DIVE IN</span>
          <div className="w-0.5 h-8 rounded-full bg-gradient-to-b from-primary/60 to-transparent" />
        </motion.div>
      </section>

      {/* ─── IT BLOCK INTRO ────────────────────────────────────── */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <SectionLabel>Academic Block</SectionLabel>
              <h2 className="text-3xl font-bold text-foreground mb-4">
                The IT & Engineering Block
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                The state-of-the-art IT block houses the CSE, IT, and Electronics
                departments across two floors, equipped with modern labs,
                seminar halls, faculty cabins, and a digitally-enabled learning
                environment.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-8">
                AIMS digitizes the entire infrastructure —faculty schedules and student resources —
                ensuring smooth day-to-day academic operations.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Building2, label: "2 Floors" },
                  { icon: Users, label: "350 Students" },
                  { icon: FlaskConical, label: "6 Labs" },
                ].map(({ icon: Icon, label }) => (
                  <div
                    key={label}
                    className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card"
                  >
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon size={16} className="text-primary" />
                    </div>
                    <span className="text-sm font-medium text-foreground">{label}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="aspect-video lg:aspect-square rounded-[2.5rem] overflow-hidden bg-muted border-4 border-background shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] dark:shadow-[0_32px_64px_-16px_rgba(0,0,0,1)] relative group">
                <img src="/assets/college/it_block.jpeg" alt="IT Block" className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/40 via-transparent to-transparent opacity-60 mix-blend-overlay" />
                <div className="absolute inset-x-0 bottom-0 p-8 pt-20 bg-gradient-to-t from-black/80 via-black/20 to-transparent">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-xl bg-primary/20 backdrop-blur-md border border-white/10">
                      <Building2 size={24} className="text-white" />
                    </div>
                    <p className="text-xl font-bold text-white tracking-tight">Academic IT Block</p>
                  </div>
                  <p className="text-sm text-white/70 font-medium">Equipped for excellence since 2005</p>
                </div>
              </div>
              {/* Decorative side element */}
              <div className="absolute -bottom-6 -right-6 w-32 h-32 rounded-3xl bg-primary border-4 border-background flex flex-col items-center justify-center shadow-xl z-20">
                <Award size={24} className="text-primary-foreground mb-1" />
                <span className="text-xs font-bold text-primary-foreground uppercase tracking-widest">Est. 2005</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── BRANCHES ──────────────────────────────────────────── */}
      <section className="py-16 bg-muted/30 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <SectionLabel>Our Specializations</SectionLabel>
            <h2 className="text-3xl font-bold text-foreground tracking-tighter">Engineering Departments</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {branches.map((branch, i) => (
              <motion.div
                key={branch.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
              >
                <Link href={branch.href} className="block group h-full">
                  <div className="relative p-8 rounded-[3rem] border border-border bg-card hover:border-primary/50 transition-all duration-500 h-full flex flex-col overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-primary/5">
                    <div className="absolute -top-24 -right-24 w-56 h-56 bg-primary/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                    <div className={`w-16 h-16 rounded-3xl bg-gradient-to-br ${branch.color} flex items-center justify-center mb-8 shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                      <branch.icon size={32} className="text-primary" />
                    </div>

                    <div className="flex-1">
                      <div className="inline-flex items-center gap-3 mb-4">
                        <span className={`w-3 h-3 rounded-full ${branch.accent} shadow-lg`} />
                        <span className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground">{branch.short}</span>
                      </div>
                      <h3 className="text-2xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors leading-tight">{branch.name}</h3>
                      <p className="text-muted-foreground leading-relaxed mb-10">{branch.description}</p>
                    </div>

                    <div className="mt-auto pt-8 border-t border-border flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        <div>
                          <span className="text-foreground block text-lg font-black tracking-tight">{branch.students}</span>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Students</span>
                        </div>
                        <div className="w-px h-8 bg-border" />
                        <div>
                          <span className="text-foreground block text-lg font-black tracking-tight">{branch.faculty}</span>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Faculty</span>
                        </div>
                      </div>
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                        <ArrowRight size={22} />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FACILITIES ────────────────────────────────────────── */}
      <section className="py-16 relative overflow-hidden bg-background">
        <div className="absolute inset-0 bg-primary/[0.02] -z-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <SectionLabel>Infrastructure</SectionLabel>
            <h2 className="text-3xl font-bold text-foreground tracking-tight">
              Premium Campus Facilities
            </h2>
          </motion.div>

          <div className="max-w-6xl mx-auto">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
              {facilities.map((f, i) => (
                <motion.div
                  key={f.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05, duration: 0.4 }}
                  viewport={{ once: true }}
                  className="group relative p-6 rounded-[2rem] border border-border bg-card hover:border-primary/40 hover:shadow-2xl transition-all duration-300 flex flex-col items-center text-center"
                >
                  <div className="w-16 h-16 rounded-2xl bg-primary/5 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary/10 transition-all">
                    <f.icon size={32} className="text-primary" />
                  </div>
                  <p className="text-2xl font-black text-foreground mb-1 tracking-tighter">{f.count}</p>
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground whitespace-nowrap">
                    {f.label}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── SUCCESS STORIES ───────────────────────────────────── */}
      <section className="py-16 bg-primary/5 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 mb-12">
            <div className="h-0.5 w-8 aims-accent-bar rounded-full" />
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Center of Excellence</span>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative order-2 lg:order-1"
            >
              <div className="aspect-[16/10] rounded-[2.5rem] overflow-hidden bg-card border border-primary/20 shadow-2xl relative group">
                <img src="/assets/college/hackathon_winner.jpeg" alt="Hackathon Winners" className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80" />
                <div className="absolute bottom-8 left-8 right-8">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest mb-4">
                    <Crown size={12} /> 1st Position
                  </div>
                  <h3 className="text-2xl font-black text-white mb-2 tracking-tight">State Level Hackathon Champeions</h3>
                  <p className="text-sm text-white/70 font-medium">CSE Department · Rajat Jayanti Samaroh</p>
                </div>
              </div>
              {/* Floating Badge */}
              <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-background border-4 border-primary flex flex-col items-center justify-center shadow-2xl z-20 transform rotate-12">
                <span className="text-xl font-black text-primary">#1</span>
                <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Rank</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="order-1 lg:order-2"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6 leading-[1.1]">
                Nurturing the <br />
                <span className="text-primary italic">Champeions of Tomorrow</span>
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                Our students don't just learn; they compete and win on the biggest stages.
                From college and district level hackathons to state level hackathons, the IT Block
                provides the mentorship and resources needed to excel.
              </p>
              <div className="space-y-4">
                {[
                  { title: "Technical Excellence", desc: "Mastering complex algorithms and real-world system design." },
                  { title: "Collaborative Innovation", desc: "Working in agile teams to solve critical infrastructure problems." }
                ].map((item) => (
                  <div key={item.title} className="flex gap-4 p-4 rounded-2xl bg-background/50 border border-border backdrop-blur-sm">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Zap size={20} className="text-primary" />
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground text-sm">{item.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── LABS ─────────────────────────────────────────────── */}
      <section className="py-20 bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-24 items-center">
            <div className="lg:col-span-5">
              <SectionLabel>Labs & Workspaces</SectionLabel>
              <h2 className="text-3xl md:text-4xl font-black text-foreground mb-8 tracking-tighter leading-none">
                Specialized <br /><span className="text-primary italic">Centers</span>
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-10">
                From high-compute servers to IoT experimentation boards,
                our labs offer everything an engineer needs to turn ideas
                into production-ready software and hardware.
              </p>
              <div className="flex flex-col gap-4">
                {[
                  "Intel i5/i7 Workstations",
                  "100 Mbps Dedicated LAN",
                  "Open-Source Software Stack",
                  "Hardware Prototyping Kits"
                ].map(t => (
                  <div key={t} className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(20,184,166,0.6)]" />
                    <span className="text-xs font-black uppercase tracking-widest text-foreground">{t}</span>
                  </div>
                ))}
              </div>
              <div className="mt-12">
                <Link
                  href="/login"
                  className="group inline-flex items-center gap-3 text-sm font-black text-primary uppercase tracking-[0.3em] hover:gap-5 transition-all"
                >
                  Explore Lab Details <ArrowRight size={18} />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-7 grid sm:grid-cols-2 gap-6">
              {labs.map((lab, i) => (
                <motion.div
                  key={lab.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="group p-6 rounded-[2.5rem] border border-border bg-background hover:border-primary/50 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] transition-all duration-500 relative overflow-hidden"
                >
                  <div className="flex items-center justify-between mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-primary/5 flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:bg-primary/10 transition-all duration-500">
                      <FlaskConical size={28} className="text-primary" />
                    </div>
                    <span
                      className={`text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-sm ${lab.available
                        ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                        : "bg-red-500/10 text-red-500 border border-red-500/20"
                        }`}
                    >
                      {lab.available ? "Ready" : "In Use"}
                    </span>
                  </div>

                  <h4 className="font-bold text-foreground text-xl mb-3 tracking-tight group-hover:text-primary transition-colors">{lab.name}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-8 flex-1">{lab.equipment}</p>

                  <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Building2 size={14} className="opacity-50" />
                      {lab.wing}
                    </div>
                    <div className="flex items-center gap-2">
                      <Users size={14} className="opacity-50" />
                      {lab.capacity} Seats
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── FACULTY PREVIEW ───────────────────────────────────── */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-24">
            <SectionLabel>Mentorship</SectionLabel>
            <h2 className="text-3xl font-bold text-foreground tracking-tighter uppercase">Academic Leadership</h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {facultyPreview.map((f, i) => (
              <motion.div
                key={f.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -10 }}
                className="p-6 rounded-[3rem] border border-border bg-card hover:border-primary/50 transition-all duration-500 text-center flex flex-col shadow-sm hover:shadow-2xl"
              >
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6 border-4 border-background shadow-xl overflow-hidden relative">
                  {f.avatar ? (
                    <img src={f.avatar} alt={f.name} className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" />
                  ) : (
                    <span className="text-2xl font-black text-primary uppercase">{f.initials}</span>
                  )}
                </div>
                <h4 className="font-bold text-foreground text-lg mb-2 tracking-tight">{f.name}</h4>
                <div className="inline-flex items-center justify-center mb-5">
                  <span className="px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/20">
                    {f.designation} 
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed italic mb-6">"{f.subjects}"</p>
                <div className="mt-auto h-1 w-12 bg-primary/30 rounded-full mx-auto" />
              </motion.div>
            ))}
          </div>

          <div className="mt-20 text-center">
            <Link
              href="/branches/cse"
              className="inline-flex items-center gap-3 px-10 py-5 rounded-3xl bg-foreground text-background font-black text-sm uppercase tracking-widest hover:bg-primary hover:text-primary-foreground transition-all duration-300 shadow-2xl"
            >
              Meet Entire Faculty <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>


      {/* ─── NOTICE BOARD ──────────────────────────────────────── */}
      <section className="py-20 bg-background relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-primary/5 blur-[120px] rounded-full -z-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20">
            <div className="max-w-2xl">
              <SectionLabel>Live Updates</SectionLabel>
              <h2 className="text-3xl font-bold text-foreground tracking-tighter">Academic Notice Board</h2>
              <p className="text-lg text-muted-foreground mt-4">Stay informed with the latest official announcements, exam schedules, and campus events.</p>
            </div>
            <div className="flex items-center gap-4 bg-muted/30 px-6 py-3 rounded-2xl border border-border backdrop-blur-sm">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
                <Bell size={20} className="text-primary" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block leading-none mb-1">Status</span>
                <span className="text-sm font-bold text-foreground">AIMS Real-time Sync Active</span>
              </div>
            </div>
          </div>

          <div className="grid gap-6">
            {uiNotices.map((notice, i) => (
              <motion.div
                key={notice.id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="group relative p-6 rounded-[2.5rem] border border-border bg-card hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 flex flex-col md:flex-row gap-8 items-start md:items-center overflow-hidden"
              >
                <div className="flex-shrink-0">
                  <div className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center border ${notice.urgent
                      ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20"
                      : "bg-muted/50 text-muted-foreground border-border"
                    }`}>
                    <Clock size={24} className="mb-1" />
                    <span className="text-[8px] font-black uppercase tracking-tighter">Latest</span>
                  </div>
                </div>

                <div className="flex-1 space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className={`text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest border transition-colors ${notice.urgent
                        ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                        : "bg-primary/5 text-primary border-primary/20"
                      }`}>
                      {notice.tag}
                    </span>
                    <span className="text-xs font-bold text-muted-foreground flex items-center gap-2">
                      <Shield size={12} /> {notice.date}
                    </span>
                  </div>
                  <h4 className="text-2xl font-black text-foreground group-hover:text-primary transition-colors tracking-tight">{notice.title}</h4>
                  <p className="text-muted-foreground leading-relaxed max-w-4xl">{notice.desc}</p>
                  {notice.file_url && (
                    <a href={notice.file_url} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-xs font-bold text-primary hover:underline mt-1">
                      <FileText size={13}/> View Attached Document
                    </a>
                  )}
                </div>

                <div className="md:border-l border-border md:pl-8 flex-shrink-0 self-stretch flex items-center">
                  <div className="w-12 h-12 rounded-full border border-border flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all duration-300">
                    <ChevronRight size={24} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ───────────────────────────────────────────────── */}
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative rounded-[4rem] overflow-hidden bg-foreground p-10 md:p-16 text-center"
          >
            {/* Background decorative elements */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/20 to-transparent pointer-events-none" />
            <div className="absolute -bottom-48 -right-48 w-96 h-96 bg-primary/30 rounded-full blur-[100px] pointer-events-none" />

            <div className="relative z-10 max-w-3xl mx-auto">
              <span className="inline-block px-6 py-2 rounded-full bg-white/10 text-white/80 text-[10px] font-black uppercase tracking-[0.4em] border border-white/5 mb-8">
                Portal Access
              </span>
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-8 tracking-tighter leading-none">
                Experience <span className="text-primary italic">AIMS</span> Today.
              </h2>
              <p className="text-xl text-white/60 mb-12 leading-relaxed">
                Unlock a centralized ecosystem where academic performance,
                infrastructure, and innovation converge. Join 350+ students
                and faculty already using IT Block's advanced platform.
              </p>
              <div className="flex flex-wrap gap-6 justify-center">
                <Link
                  href="/login"
                  className="px-10 py-5 rounded-[2rem] bg-primary text-primary-foreground font-black text-sm uppercase tracking-widest shadow-[0_20px_40px_rgba(20,184,166,0.4)] hover:-translate-y-1 transition-all"
                >
                  Launch Dashboard
                </Link>
                <Link
                  href="/signup"
                  className="px-10 py-5 rounded-[2rem] border border-white/20 text-white font-black text-sm uppercase tracking-widest hover:bg-white/5 transition-all"
                >
                  Create Identity
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── MEET THE TEAM ─────────────────────────────────────── */}
      <section className="py-16 relative bg-muted/20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16">
            <SectionLabel>The Architects</SectionLabel>
            <h2 className="text-4xl font-bold text-foreground tracking-tighter mb-6">Minds Behind AIMS</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto italic font-medium">
              "Building the future of academic infrastructure, one line of code at a time."
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
            {teamMembers.map((member, i) => {
              const isLeader = member.data.role.toLowerCase().includes("leader");
              const roles = member.data.role.split(",").filter((r) => !r.toLowerCase().includes("leader"));
              const colors = getMemberColors(member.data.role);

              return (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                >
                  {member.data.github ? (
                    <a href={member.data.github} target="_blank" rel="noopener noreferrer" className="block group h-full">
                      <TeamMemberCard member={member} isLeader={isLeader} roles={roles} colors={colors} />
                    </a>
                  ) : (
                    <div className="h-full group">
                      <TeamMemberCard member={member} isLeader={isLeader} roles={roles} colors={colors} />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── FOOTER ────────────────────────────────────────────── */}
      <footer className="pt-32 pb-12 bg-background border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-20">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                  <BookOpen size={20} className="text-primary-foreground" />
                </div>
                <span className="text-xl font-bold tracking-tighter text-foreground">AIMS <span className="text-primary italic">X</span> IT BLOCK</span>
              </div>
              <p className="text-muted-foreground leading-relaxed max-w-sm">
                A high-performance Academic Management System designed for
                UMID Government ITI Polytechnic Kashipur, empowering
                students and faculty with modern tools.
              </p>
            </div>
            <div>
              <h5 className="font-bold text-xs uppercase tracking-[0.2em] text-foreground mb-6">Resources</h5>
              <ul className="space-y-4">
                <li><Link href="/branches/cse" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">CSE Department</Link></li>
                <li><Link href="/branches/it" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">IT Department</Link></li>
                <li><Link href="/branches/elex" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">ElEX Department</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold text-xs uppercase tracking-[0.2em] text-foreground mb-6">Connect</h5>
              <ul className="space-y-4">
                <li><a href="#" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Contact Admin: ompandey2341@gmail.com</a></li>
                <li><a href="#" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Submit Bug Reports: supabasetup@gmail.com</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-12 border-t border-border flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">© 2026 AIMS PORTAL · UGIP KASHIPUR</p>
            <div className="flex items-center gap-6">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground">System Online · Stable</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Chatbot Widget */}
      <ChatbotWidget />
    </div>
  );
}

// ── Shared Helper Component ────────────────────────────────────

function TeamMemberCard({ member, isLeader, roles, colors }: any) {
  return (
    <div className={`relative rounded-[3rem] overflow-hidden transition-all duration-700 h-full flex flex-col border-2 ${colors.border} ${colors.hoverBorder} bg-card shadow-xl group-hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.2)] group-hover:-translate-y-4`}>
      <div className={`absolute top-0 left-0 w-full h-2 ${colors.accentBg} shadow-[0_0_20px_${colors.accentBg}] z-20`} />

      {isLeader && (
        <div className={`absolute top-6 right-6 w-12 h-12 rounded-2xl ${colors.accentBg} flex items-center justify-center shadow-xl z-20 transform rotate-12 transition-transform duration-500 group-hover:rotate-0`}>
          <Crown size={22} className={colors.accentText} />
        </div>
      )}

      <div className="p-8 pb-10 flex flex-col items-center flex-1">
        <div className="relative mb-8">
          <div className={`absolute inset-0 rounded-full bg-gradient-to-tr ${colors.gradient} blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 scale-150`} />
          <div className={`relative w-36 h-36 rounded-full border-4 ${colors.border} group-hover:border-white overflow-hidden transition-all duration-500 group-hover:scale-105 shadow-2xl bg-muted`}>
            <img src={`/assets/team/${member.data.image}`} alt={member.data.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
          </div>
        </div>

        <h4 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors text-center">{member.data.name}</h4>

        {isLeader && (
          <span className={`px-4 py-1 rounded-full ${colors.accentBg} ${colors.accentText} text-[10px] font-bold uppercase tracking-[0.2em] mb-6 shadow-lg shadow-black/10`}>
            Team Lead
          </span>
        )}

        <div className="flex flex-wrap justify-center gap-2 mt-auto">
          {roles.map((role: string) => {
            const key = role.trim().toLowerCase().replace(/[-\s]/g, "");
            const RoleIcon = roleIconMap[key] || Award;
            return (
              <div key={role} className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-muted/50 text-muted-foreground text-[10px] font-bold uppercase tracking-tighter border border-transparent group-hover:border-primary/20 group-hover:bg-primary/5 group-hover:text-primary transition-all">
                <RoleIcon size={12} />
                {role.trim()}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
