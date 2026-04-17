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
      "From operating systems to full-stack development — building engineers who can design, build, and ship real software.",
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
      "Networking, security, and application development — IT graduates are ready for the practical demands of the modern industry.",
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
      "Hands-on with embedded systems, signal processing, and circuit design — the hardware layer that powers the modern world.",
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
    <div className="flex items-center gap-3 mb-4">
      <span className="w-1.5 h-1.5 rounded-full bg-primary block flex-shrink-0" />
      <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary/80">
        {children}
      </span>
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
      <section className="py-24 relative overflow-hidden relative z-10 aims-grid-bg">
        {/* Background Video */}
        <video
          className="absolute inset-0 w-full h-full object-cover z-0"
          src={bgVideoUrl}
          autoPlay
          loop
          muted
          playsInline
        />

        {/* 3D Depth Overlays */}
        <div className="absolute inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-[1px] z-[1]" />
        <div className="absolute bottom-0 w-full h-24 bg-gradient-to-t from-background via-background/20 to-transparent z-[2]" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 pt-36">
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="max-w-4xl p-8 md:p-12 rounded-[2.5rem] bg-black/30 backdrop-blur-xl border border-white/10 shadow-2xl relative overflow-hidden group"
          >
            {/* Inner glow effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none" />

            <motion.div variants={fadeUp} custom={0} className="mb-8">
              <span className="inline-flex items-center gap-2.5 border border-white/10 bg-white/5 backdrop-blur-md px-4 py-2 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-[10px] font-medium tracking-[0.3em] text-white/70 uppercase">
                  IT Block &nbsp;·&nbsp; UGIP Kashipur &nbsp;·&nbsp; Est. 2005
                </span>
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              custom={1}
              className="text-6xl sm:text-7xl lg:text-8xl font-serif font-bold leading-[1.05] tracking-tight mb-8"
            >
              <span className="text-white drop-shadow-[0_4px_20px_rgba(0,0,0,0.9)]">IT Block:</span>
              <br />
              <span className="text-primary drop-shadow-[0_4px_20px_rgba(0,0,0,0.9)]">UGIP Kashipur</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              custom={2}
              className="text-base sm:text-lg leading-relaxed max-w-xl mb-12 text-white/70 font-normal"
            >
              A centralized system for managing academic schedules, resources,
              and infrastructure across the CSE, IT, and Electronics departments.
            </motion.p>

            <motion.div
              variants={fadeUp}
              custom={3}
              className="flex flex-wrap gap-3"
            >
              {dashboardHref ? (
                <>
                  <Link
                    href={dashboardHref}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-[14px] aims-btn-primary font-semibold text-sm transition-all duration-200"
                  >
                    Go to Dashboard <ArrowRight size={15} />
                  </Link>
                  <div className="inline-flex items-center gap-3 px-4 py-3 rounded-xl border border-white/10 bg-white/5 backdrop-blur text-white/80 font-medium text-sm">
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
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-[14px] aims-btn-primary font-semibold text-sm transition-all duration-200"
                  >
                    Access Dashboard <ArrowRight size={15} />
                  </Link>
                  <Link
                    href="/signup"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/10 bg-white/5 backdrop-blur text-white/70 font-medium text-sm hover:bg-white/10 hover:text-white transition-all duration-200"
                  >
                    Create Account <ChevronRight size={15} />
                  </Link>
                </>
              )}
            </motion.div>

            {/* Stats row */}
            <motion.div
              variants={fadeUp}
              custom={4}
              className="mt-16 flex flex-wrap items-center gap-0 border-t border-white/10 pt-8"
            >
              {[
                { value: "350+", label: "Students" },
                { value: "9", label: "Faculty" },
                { value: "6", label: "Labs" },
                { value: "3", label: "Branches" },
              ].map((stat, i) => (
                <div key={stat.label} className="flex items-center">
                  <div className="px-6 py-4 flex flex-col">
                    <span className="text-2xl font-bold text-white tracking-tight">{stat.value}</span>
                    <span className="text-[10px] font-medium text-white/40 uppercase tracking-widest mt-0.5">{stat.label}</span>
                  </div>
                  {i < 3 && <div className="w-px h-8 bg-white/10" />}
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-[9px] tracking-[0.3em] text-white/30 uppercase">Scroll</span>
          <div className="w-px h-6 rounded-full bg-gradient-to-b from-white/20 to-transparent" />
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
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-6 leading-tight">
                The IT & Engineering Block
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6 text-lg">
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
                    className="flex items-center gap-4 py-4 px-2 border-b border-border/40 last:border-0"
                  >
                    <div className="w-10 h-10 rounded-xl aims-glass-card flex items-center justify-center">
                      <Icon size={18} className="text-foreground" />
                    </div>
                    <span className="text-base font-medium text-foreground">{label}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              viewport={{ once: true }}
              className="relative"
            >
              <motion.div 
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="aspect-video lg:aspect-[4/5] rounded-[2.5rem] bg-white dark:bg-zinc-950 border border-border overflow-hidden relative group p-2 shadow-2xl"
              >
                <div className="absolute inset-2 rounded-[2rem] overflow-hidden">
                  <img src="/assets/college/it_block.jpeg" alt="IT Block" className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2000ms] ease-out group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-tr from-black/60 to-transparent mix-blend-overlay" />
                  <div className="absolute inset-x-0 bottom-0 p-8 pt-24 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-3 rounded-[14px] aims-glass-card bg-white/10 flex items-center justify-center">
                        <Building2 size={24} className="text-white drop-shadow-sm" />
                      </div>
                      <p className="text-2xl font-serif font-bold text-white tracking-tight">Academic IT Block</p>
                    </div>
                    <p className="text-sm text-white/70 font-medium ml-1">Equipped for excellence since 2005</p>
                  </div>
                </div>
              </motion.div>
              {/* Decorative side element */}
              <div className="absolute -bottom-6 -right-6 w-32 h-32 rounded-[2rem] aims-glass-card bg-card/60 flex flex-col items-center justify-center z-20">
                <Award size={28} className="text-foreground mb-2" />
                <span className="text-xs font-bold text-foreground focus-visible uppercase tracking-widest">Est. 2005</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      <div className="h-24 bg-gradient-to-b from-muted/30 to-muted/20" />

      {/* ─── BRANCHES ──────────────────────────────────────────── */}
      <section className="py-20 bg-muted/20 relative border-t border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <SectionLabel>Our Specializations</SectionLabel>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground tracking-tight">Engineering Departments</h2>
            <p className="text-muted-foreground mt-4 text-lg max-w-lg mx-auto">Three focused programs, one integrated block.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {branches.map((branch, i) => (
              <motion.div
                key={branch.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
              >
                <Link href={branch.href} className="block group h-full">
                  <div className="relative p-8 h-full flex flex-col aims-glass-card hover:aims-glass-card-hover overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 -mr-20 -mt-20" />

                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${branch.color} flex items-center justify-center mb-7 shadow-sm group-hover:scale-105 transition-all duration-300`}>
                      <branch.icon size={22} className="text-primary" />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`w-2 h-2 rounded-full ${branch.accent}`} />
                        <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">{branch.short}</span>
                      </div>
                      <h3 className="text-2xl font-serif font-bold text-foreground mb-4 group-hover:text-primary transition-colors leading-snug">{branch.name}</h3>
                      <p className="text-base text-muted-foreground leading-relaxed mb-8">{branch.description}</p>
                    </div>

                    <div className="mt-auto pt-6 border-t border-border/50 flex items-center justify-between">
                      <div className="flex items-center gap-5">
                        <div>
                          <span className="text-foreground block text-base font-bold tracking-tight">{branch.students}</span>
                          <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Students</span>
                        </div>
                        <div className="w-px h-6 bg-border" />
                        <div>
                          <span className="text-foreground block text-base font-bold tracking-tight">{branch.faculty}</span>
                          <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Faculty</span>
                        </div>
                      </div>
                      <div className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all duration-300">
                        <ArrowRight size={16} />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      {/* ─── SUCCESS STORIES ───────────────────────────────────── */}
      <section className="py-20 bg-slate-950/5 relative overflow-hidden border-t border-border/50">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-14">
            <span className="w-1.5 h-1.5 rounded-full bg-primary block flex-shrink-0" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary/80">Center of Excellence</span>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative order-2 lg:order-1"
            >
              <div className="aspect-[16/10] rounded-[2.5rem] overflow-hidden bg-card border border-primary/20 shadow-xl relative group">
                <img src="/assets/college/hackathon_winner.jpeg" alt="Hackathon Winners" className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-widest mb-4 shadow-sm">
                    <Crown size={12} /> 1st Position
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">State Level Hackathon Champions</h3>
                  <p className="text-sm text-white/70 font-medium">CSE Department · Rajat Jayanti Samaroh</p>
                </div>
              </div>
              {/* Floating Badge */}
              <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-slate-900 border-4 border-background flex flex-col items-center justify-center shadow-2xl z-20">
                <span className="text-xl font-bold text-white">#1</span>
                <span className="text-[9px] font-semibold text-white/50 uppercase tracking-widest">Rank</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="order-1 lg:order-2"
            >
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-6 leading-tight">
                Nurturing the <br />
                <span className="text-primary italic">Champions of Tomorrow</span>
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-10">
                Our students do more than learn; they compete and win. 
                From college and district-level events to state-level hackathons, the IT Block 
                provides the mentorship and technical resources needed to excel anywhere.
              </p>
              
              <div className="h-px w-full bg-border/60 mb-8" />
              
              <div className="space-y-4">
                {[
                  { title: "Technical Excellence", desc: "Mastering complex algorithms and real-world system design." },
                  { title: "Collaborative Innovation", desc: "Working in agile teams to solve critical infrastructure problems." }
                ].map((item) => (
                  <div key={item.title} className="flex gap-4 p-4 rounded-2xl border border-transparent hover:border-border/50 hover:bg-card/50 transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Zap size={18} className="text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground text-sm">{item.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── PREMIUM FACILITIES ────────────────────────────────── */}
      <section className="py-24 bg-background relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
            <div className="max-w-2xl">
              <SectionLabel>Premium Facilities</SectionLabel>
              <h2 className="text-4xl lg:text-5xl font-serif font-bold text-foreground tracking-tight mb-4">
                World-class Infrastructure <br />for Modern Learning.
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                From high-speed connectivity to digitally enabled libraries, we provide the environment 
                you need to excel in your technical journey.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {facilities.map((f, i) => (
              <motion.div
                key={f.label}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="group relative p-8 rounded-[2.5rem] bg-white dark:bg-zinc-950 border border-border/80 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary group-hover:scale-110 transition-all duration-500">
                  <f.icon size={28} className="text-primary group-hover:text-white transition-colors" />
                </div>
                <h4 className="text-xl font-bold text-foreground mb-2 tracking-tight group-hover:text-primary transition-colors">{f.label}</h4>
                <p className="text-xs font-bold text-primary/60 uppercase tracking-widest">{f.count}</p>
                
                {/* Decorative depth element */}
                <div className="absolute inset-0 rounded-[2.5rem] border-2 border-primary/0 group-hover:border-primary/10 transition-all duration-500 pointer-events-none" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── LABS ─────────────────────────────────────────────── */}
      <section className="py-20 bg-muted/20 border-t border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-16 lg:gap-24 items-center">
            <div className="lg:col-span-4">
              <SectionLabel>Labs & Workspaces</SectionLabel>
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-6 tracking-tight leading-snug">
                Specialized <br /><span className="text-primary">Engineering Centers</span>
              </h2>
              <p className="text-base text-muted-foreground leading-relaxed mb-10">
                From high-compute servers for data modeling to hands-on hardware prototyping kits, 
                our labs give you exactly what you need to take concepts into production.
              </p>
              <div className="flex flex-col gap-4 pl-1">
                {[
                  "Workstation-Grade Desktop Environments",
                  "Dedicated 100 Mbps Connectivity",
                  "Fully Integrated Open-Source Toolchains",
                  "Rapid Prototyping Hardware"
                ].map(t => (
                  <div key={t} className="flex items-center gap-3">
                    <span className="w-[3px] h-[3px] rounded-full bg-primary overflow-visible ring-4 ring-primary/20" />
                    <span className="text-xs font-semibold text-foreground/80 tracking-wide">{t}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-8 grid sm:grid-cols-2 gap-5">
              {labs.map((lab, i) => (
                <motion.div
                  key={lab.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  viewport={{ once: true }}
                  className="group p-7 aims-glass-card hover:aims-glass-card-hover relative overflow-hidden flex flex-col"
                >
                  {/* Left availability stripe */}
                  <div className={`absolute top-0 bottom-0 left-0 w-1 ${lab.available ? 'bg-emerald-500/80' : 'bg-slate-500/50'}`} />

                  <div className="flex items-start justify-between mb-6">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-all duration-300">
                      <FlaskConical size={20} className="text-primary" />
                    </div>
                    <span
                      className={`text-[9px] font-semibold uppercase tracking-[0.2em] px-3 py-1 rounded-full border ${
                        lab.available
                          ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                          : "bg-slate-500/10 text-slate-500 border-slate-500/20"
                      }`}
                    >
                      {lab.available ? "Ready" : "In Use"}
                    </span>
                  </div>

                  <h4 className="font-bold text-foreground text-lg mb-2 tracking-tight group-hover:text-primary transition-colors">{lab.name}</h4>
                  
                  {/* Format equipment visually cleanly */}
                  <p className="text-xs text-muted-foreground leading-relaxed mb-8 flex-1">
                    {lab.equipment.split(',').join(' • ')}
                  </p>

                  <div className="mt-auto pt-5 border-t border-border/40 flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Building2 size={13} className="text-primary/60" />
                      {lab.wing}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users size={13} className="text-primary/60" />
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
      <section className="py-20 relative bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <SectionLabel>Mentorship</SectionLabel>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground tracking-tight">Academic Leadership</h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {facultyPreview.map((f, i) => (
              <motion.div
                key={f.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-8 rounded-[2rem] aims-glass-card hover:aims-glass-card-hover text-center flex flex-col group"
              >
                <div className="w-24 h-24 rounded-full aims-glass-card flex items-center justify-center mx-auto mb-6 p-1 relative group-hover:scale-[1.03] transition-transform shadow-lg">
                  {f.avatar ? (
                    <div className="w-full h-full rounded-full overflow-hidden">
                      <img src={f.avatar} alt={f.name} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <span className="text-xl font-bold text-primary uppercase">{f.initials}</span>
                  )}
                </div>
                <h4 className="font-semibold text-foreground text-lg mb-1 tracking-tight">{f.name}</h4>
                <div className="mb-4">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    {f.designation} 
                  </span>
                </div>
                <p className="text-sm text-foreground/70 leading-relaxed mb-6 group-hover:text-primary/90 transition-colors line-clamp-2">
                  {f.subjects}
                </p>
                <div className="mt-auto h-0.5 w-8 bg-border group-hover:bg-primary/50 transition-colors rounded-full mx-auto" />
              </motion.div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <Link
              href="/branches/cse"
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary uppercase tracking-[0.2em] border-b border-primary/30 pb-1 hover:border-primary transition-all"
            >
              Meet the Entire Faculty <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>


      {/* ─── NOTICE BOARD ──────────────────────────────────────── */}
      <section className="py-20 bg-muted/30 relative overflow-hidden border-t border-border/50">
        <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-primary/5 blur-[100px] rounded-full -z-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
            <div className="max-w-2xl">
              <SectionLabel>Infrastructure</SectionLabel>
              <h2 className="text-4xl lg:text-5xl font-serif font-bold text-foreground tracking-tight mb-4">
                Experience the AIMS platform.
              </h2>
              <p className="text-lg text-foreground/70 dark:text-muted-foreground leading-relaxed">
                Stay informed with the latest official announcements, exam schedules, and campus events.
              </p>
            </div>
            <div className="flex items-center gap-3 bg-background px-5 py-2.5 rounded-xl border border-border/50 shadow-sm">
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
              <span className="text-xs font-semibold text-foreground">Live Feed Active</span>
            </div>
          </div>

          <div className="grid gap-4">
            {uiNotices.map((notice, i) => (
              <motion.div
                key={notice.id}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="group relative p-6 md:p-8 aims-glass-card hover:aims-glass-card-hover flex flex-col md:flex-row gap-6 items-start md:items-center"
              >
                <div className="flex-shrink-0">
                  <div className="px-4 py-3 rounded-xl bg-muted border border-border/50 flex flex-col items-center justify-center min-w-[80px]">
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase">{notice.date.split(' ')[1]}</span>
                    <span className="text-xl font-bold text-foreground">{notice.date.split(' ')[0]}</span>
                  </div>
                </div>

                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-3 mb-1">
                    <span className={`text-[9px] font-bold px-3 py-1 rounded-md uppercase tracking-widest ${notice.urgent
                        ? "bg-amber-500/10 text-amber-600"
                        : "bg-primary/10 text-primary"
                      }`}>
                      {notice.tag}
                    </span>
                    {notice.urgent && <span className="text-[10px] font-bold text-red-500 flex items-center gap-1 uppercase tracking-wider"><Bell size={10}/> Urgent</span>}
                  </div>
                  <h4 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">{notice.title}</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 max-w-4xl">{notice.desc}</p>
                </div>

                {notice.file_url && (
                  <div className="md:pl-6 flex-shrink-0 self-stretch flex items-center">
                    <a href={notice.file_url} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/5 text-primary text-xs font-semibold hover:bg-primary hover:text-primary-foreground transition-colors group-hover:bg-primary/10 border border-primary/10 hover:border-primary/30">
                      <FileText size={14} /> Document
                    </a>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ───────────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative rounded-[2.5rem] overflow-hidden aims-glass-card dark bg-black/80 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] p-12 md:p-20 text-center"
          >
            {/* Background decorative elements */}
            <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/5 pointer-events-none" />
            <div className="absolute -bottom-48 left-1/2 -translate-x-1/2 w-[600px] h-96 bg-primary/20 rounded-full blur-[100px] pointer-events-none" />

            <div className="relative z-10 max-w-3xl mx-auto">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white mb-6 tracking-tight leading-tight">
                Experience the AIMS Platform
              </h2>
              <p className="text-lg text-slate-400 mb-10 leading-relaxed max-w-2xl mx-auto font-medium">
                A unified digital space designed exclusively for the students and faculty 
                of the IT Block, UGIP Kashipur.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link
                  href="/login"
                  className="px-8 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm shadow-lg shadow-primary/20 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/30 transition-all"
                >
                  Access Portal
                </Link>
                <Link
                  href="/signup"
                  className="px-8 py-3.5 rounded-xl aims-glass-card border border-white/20 bg-white/10 text-white font-semibold text-sm hover:bg-white/20 transition-all shadow-lg"
                >
                  Create Account
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── MEET THE TEAM ─────────────────────────────────────── */}
      <section className="py-16 relative bg-muted/20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-20">
            <SectionLabel>The Architects</SectionLabel>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground tracking-tighter mb-6">Minds Behind AIMS</h2>
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
      <footer className="pt-24 pb-8 bg-slate-950 border-t border-slate-900 text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div className="md:col-span-2 text-slate-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                  <BookOpen size={16} className="text-primary" />
                </div>
                <span className="text-lg font-bold tracking-tight text-white">AIMS Portal</span>
              </div>
              <p className="text-sm leading-relaxed max-w-xs text-slate-400 font-medium">
                Academic Operations & Management System for UMID Government ITI Polytechnic Kashipur.
              </p>
            </div>
            <div>
              <h5 className="font-semibold text-xs text-white mb-5 uppercase tracking-widest">Resources</h5>
              <ul className="space-y-3">
                <li><Link href="/branches/cse" className="text-sm hover:text-primary transition-colors">CSE Department</Link></li>
                <li><Link href="/branches/it" className="text-sm hover:text-primary transition-colors">IT Department</Link></li>
                <li><Link href="/branches/elex" className="text-sm hover:text-primary transition-colors">Electronics Department</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold text-xs text-white mb-5 uppercase tracking-widest">Support</h5>
              <ul className="space-y-3">
                <li><a href="mailto:ompandey2341@gmail.com" className="text-sm hover:text-primary transition-colors flex items-center gap-2"><ArrowRight size={12}/> Contact Administrator</a></li>
                <li><a href="mailto:supabasetup@gmail.com" className="text-sm hover:text-primary transition-colors flex items-center gap-2"><ArrowRight size={12}/> Report Technical Issue</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-900/50 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs font-semibold uppercase tracking-widest">© {new Date().getFullYear()} AIMS Portal · UGIP Kashipur</p>
            <div className="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              <span className="text-[10px] font-semibold text-slate-300 uppercase tracking-widest">All Systems Operational</span>
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
    <div className={`relative rounded-[2.5rem] overflow-hidden aims-glass-card hover:aims-glass-card-hover h-full flex flex-col group`}>
      <div className={`absolute top-0 left-0 w-full h-2 ${colors.accentBg} shadow-[0_0_20px_${colors.accentBg}] z-20`} />

      {isLeader && (
        <div className={`absolute top-6 left-6 w-12 h-12 rounded-2xl ${colors.accentBg} flex items-center justify-center shadow-xl z-20 transform rotate-12 transition-transform duration-500 group-hover:rotate-0`}>
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
