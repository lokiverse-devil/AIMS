"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
} from "lucide-react";
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
    name: "MANMOHAN",
    dept: "CSE",
    subjects: "Internet Of Things, Operating Systems, Computer System And Organization, Data Mining and Warehouse",
    avatar: "/assets/faculty/mannu.jpg",
    initials: "MV",
  },
  {
    name: "JAGDISH CHANDRA PANDEY",
    dept: "IT",
    subjects: "Database Systems, Cloud Computing",
    avatar: "/assets/faculty/pandey.jpg",
    initials: "JP",
  },
  {
    name: "MANOJ RIKHARI",
    dept: "ELEX",
    subjects: "VLSI Design, Embedded Systems",
    avatar: "/assets/faculty/pandey .jpg",
    initials: "MR",
  },
];

const notices = [
  {
    id: 1,
    tag: "Exam",
    title: "Mid-Semester Examinations – April 2026",
    desc: "Mid-sem exams for all branches scheduled from April 14–22, 2026. Timetable published on portal.",
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

// ── Types ──────────────────────────────────────────────────────

interface TeamMember {
  name: string;
  role: string;
  image: string;
}

// ── Page ───────────────────────────────────────────────────────

export default function HomePage() {
  const [teamMembers, setTeamMembers] = useState<
    { id: string; data: TeamMember }[]
  >([]);

  useEffect(() => {
    fetch("/assets/team/detailes.json")
      .then((res) => res.json())
      .then((data: Record<string, TeamMember>) => {
        setTeamMembers(
          Object.entries(data).map(([id, member]) => ({ id, data: member }))
        );
      })
      .catch(() => {});
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
          src="/assets/college/it_block.mp4"
          autoPlay
          loop
          muted
          playsInline
        />

        {/* Translucent dark overlay over video */}
        <div className="absolute inset-0 bg-black/55 z-[1]" />

        {/* Gradient & grid overlays */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/15 z-[2]" />
        <div className="absolute inset-0 aims-hero-overlay z-[3]" />

        {/* Decorative circles */}
        <div className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl z-[2]" />
        <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full bg-accent/15 blur-3xl z-[2]" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 pt-48">
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="max-w-4xl"
          >
            <motion.div variants={fadeUp} custom={0}>
              <SectionLabel>IT BLOCK X AIMS</SectionLabel>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              custom={1}
              className="text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground leading-[1.08] tracking-tight mb-6"
            >
              Welcome to{" "}
              <span className="relative inline-block">
                <span className="text-primary">IT BLOCK: GP KASHIPUR</span>
                <span className="absolute -bottom-1 left-0 right-0 h-0.5 aims-accent-bar rounded-full" />
              </span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              custom={2}
              className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-2xl mb-10"
            >
              A part of government polytechnic kashipur with collboration of aims a centralized platform for managing academic block infrastructure,
              faculty information, student services, labs, resources, scheduling,
              and visitor assistance — all in one elegant system.
            </motion.p>

            <motion.div
              variants={fadeUp}
              custom={3}
              className="flex flex-wrap gap-4"
            >
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
            </motion.div>

            {/* Stats row */}
            <motion.div
              variants={fadeUp}
              custom={4}
              className="mt-16 flex flex-wrap gap-8"
            >
              {[
                { value: "350", label: "Students Enrolled" },
                { value: "9", label: "Faculty Members" },
                { value: "6", label: "Labs & Facilities" },
                { value: "3", label: "Engineering Branches" },
              ].map((stat) => (
                <div key={stat.label} className="flex flex-col">
                  <span className="text-3xl font-bold text-primary">{stat.value}</span>
                  <span className="text-sm text-muted-foreground">{stat.label}</span>
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
      <section className="py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <SectionLabel>Academic Block</SectionLabel>
              <h2 className="text-4xl font-bold text-foreground mb-4">
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
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-muted border border-border shadow-2xl relative group">
                
                <img src="/assets/college/it_block.jpeg" alt="IT Block" className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
               
               <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="flex items-center gap-2 mb-1">
                    <Building2 size={16} className="text-white/80" />
                    <p className="text-sm text-white/90 font-medium">IT Block</p>
                  </div>
                  <p className="text-xs text-white/70">Academic Campus</p>
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 w-32 h-32 rounded-2xl bg-primary/10 border border-primary/20 flex flex-col items-center justify-center shadow-lg backdrop-blur-md">
                <span className="text-2xl font-bold text-primary">Est.</span>
                <span className="text-xl font-bold text-foreground">2005</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── BRANCHES ──────────────────────────────────────────── */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <SectionLabel>Departments</SectionLabel>
            <h2 className="text-4xl font-bold text-foreground">Engineering Branches</h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
              Three specialized departments offering comprehensive diploma engineering programs.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {branches.map((branch, i) => (
              <motion.div
                key={branch.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
              >
                <Link href={branch.href}>
                  <div className="group relative p-6 rounded-2xl border border-border bg-card hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 h-full flex flex-col">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${branch.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <branch.icon size={22} className="text-primary" />
                    </div>
                    <div className="inline-flex items-center gap-1.5 mb-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${branch.accent}`} />
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{branch.short}</span>
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-2">{branch.name}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed flex-1">{branch.description}</p>
                    <div className="mt-4 pt-4 border-t border-border flex justify-between text-sm">
                      <span className="text-muted-foreground">{branch.students} students</span>
                      <span className="text-muted-foreground">{branch.faculty} faculty</span>
                    </div>
                    <div className="mt-3 flex items-center gap-1 text-primary text-sm font-medium group-hover:gap-2 transition-all">
                      Explore Department <ChevronRight size={14} />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FACILITIES ────────────────────────────────────────── */}
      <section className="py-24 bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <SectionLabel>Infrastructure</SectionLabel>
            <h2 className="text-4xl font-bold text-foreground">Campus Facilities</h2>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {facilities.map((f, i) => (
              <motion.div
                key={f.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                viewport={{ once: true }}
                className="flex flex-col items-center text-center p-5 rounded-2xl border border-border bg-card hover:border-primary/30 hover:bg-accent/20 transition-all duration-200 group"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                  <f.icon size={22} className="text-primary" />
                </div>
                <p className="text-sm font-bold text-foreground">{f.count}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{f.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

     {/* ─── LABS OVERVIEW ─────────────────────────────────────── */}
<section className="py-24">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4"
    >
      <div>
        <SectionLabel>Labs & Workspaces</SectionLabel>
        <h2 className="text-4xl font-bold text-foreground">Lab Overview</h2>
        <p className="text-muted-foreground mt-2">
          Lab preview at a glance.
        </p>
      </div>

      <Link
        href="/login"
        className="inline-flex items-center gap-2 text-sm text-primary font-medium hover:gap-3 transition-all"
      >
        Connect with IT Block <ArrowRight size={14} />
      </Link>
    </motion.div>

          <div className="grid md:grid-cols-2 gap-5">
            {labs.map((lab, i) => (
              <motion.div
                key={lab.name}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                viewport={{ once: true }}
                className="p-5 rounded-2xl border border-border bg-card flex items-center gap-4 hover:border-primary/30 transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <FlaskConical size={20} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-semibold text-foreground text-sm">{lab.name}</h4>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${lab.available
                        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                        : "bg-red-500/15 text-red-500"
                        }`}
                    >
                      {lab.available ? "Available" : "Occupied"}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{lab.equipment}</p>
                  <div className="flex gap-3 mt-1.5 text-xs text-muted-foreground">
                    <span>{lab.wing}</span>
                    <span>·</span>
                    <span>{lab.capacity} seats</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FACULTY PREVIEW ───────────────────────────────────── */}
      <section className="py-24 bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4"
          >
            <div>
              <SectionLabel>Our Educators</SectionLabel>
              <h2 className="text-4xl font-bold text-foreground">Faculty Preview</h2>
            </div>
            <Link
              href="/branches/cse"
              className="inline-flex items-center gap-2 text-sm text-primary font-medium hover:gap-3 transition-all"
            >
              View all faculty <ArrowRight size={14} />
            </Link>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {facultyPreview.map((f, i) => (
              <motion.div
                key={f.name}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.09 }}
                viewport={{ once: true }}
                className="p-5 rounded-2xl border border-border bg-card hover:border-primary/30 hover:shadow-lg hover:shadow-primary/8 transition-all duration-300 text-center"
              >
                <div className="w-16 h-16 rounded-full bg-primary/15 flex items-center justify-center mx-auto mb-3 border-2 border-primary/20 overflow-hidden relative">
                  {f.avatar ? (
                    <img src={f.avatar} alt={f.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-lg font-bold text-primary">{f.initials}</span>
                  )}
                </div>
                <h4 className="font-semibold text-foreground text-sm">{f.name}</h4>
                <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-semibold">
                  {f.dept}
                </span>
                <p className="text-xs text-muted-foreground mt-2">{f.subjects}</p>
                {/* TODO: Faculty intro video: Replace with Supabase Storage URL */}
                {/* Video: https://PROJECT.supabase.co/storage/v1/object/public/faculty-videos/{name}_intro.mp4 */}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── NOTICE BOARD ──────────────────────────────────────── */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4"
          >
            <div>
              <SectionLabel>Announcements</SectionLabel>
              <h2 className="text-4xl font-bold text-foreground">Notice Board</h2>
            </div>
            <div className="flex items-center gap-2">
              <Bell size={16} className="text-primary" />
              <span className="text-sm text-muted-foreground">Latest announcements</span>
            </div>
          </motion.div>

          <div className="space-y-4">
            {notices.map((notice, i) => (
              <motion.div
                key={notice.id}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07 }}
                viewport={{ once: true }}
                className="p-5 rounded-2xl border border-border bg-card hover:border-primary/30 transition-all flex gap-4 items-start"
              >
                <div className="flex-shrink-0 pt-0.5">
                  <div
                    className={`w-1.5 h-full min-h-[40px] rounded-full ${notice.urgent ? "bg-primary" : "bg-muted-foreground/30"
                      }`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary uppercase tracking-wider">
                      {notice.tag}
                    </span>
                    {notice.urgent && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400">
                        Important
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground ml-auto">{notice.date}</span>
                  </div>
                  <h4 className="font-semibold text-foreground text-sm">{notice.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{notice.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ───────────────────────────────────────────────── */}
      <section className="py-24 bg-primary/5 border-t border-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <SectionLabel>Get Started</SectionLabel>
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Ready to access AIMS?
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Students and faculty can log in to access personalized dashboards,
              timetables, resources, and more.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/35 hover:-translate-y-0.5 transition-all duration-200"
              >
                Login to Portal <ArrowRight size={16} />
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl border border-border bg-card text-foreground font-semibold hover:border-primary/40 transition-all duration-200"
              >
                Create Account <ChevronRight size={16} />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── MEET THE TEAM ─────────────────────────────────────── */}
      <section className="py-24 bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <SectionLabel>Behind AIMS</SectionLabel>
            <h2 className="text-4xl font-bold text-foreground">
              Meet the Team
            </h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
              The talented individuals who designed, built, and maintain this
              platform.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
            {teamMembers.map((member, i) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.09, duration: 0.5 }}
                viewport={{ once: true }}
                className="group relative p-6 rounded-2xl border border-border bg-card hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 text-center flex flex-col items-center"
              >
                {/* Subtle gradient glow behind card on hover */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                {/* Avatar */}
                <div className="relative w-20 h-20 rounded-full border-2 border-primary/20 overflow-hidden mb-4 group-hover:border-primary/50 transition-colors duration-300">
                  <img
                    src={`/assets/team/${member.data.image}`}
                    alt={member.data.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  {/* Ring glow on hover */}
                  <div className="absolute inset-0 rounded-full ring-2 ring-primary/0 group-hover:ring-primary/30 transition-all duration-300" />
                </div>

                {/* Name */}
                <h4 className="relative font-semibold text-foreground text-sm mb-2">
                  {member.data.name}
                </h4>

                {/* Role badges */}
                <div className="relative flex flex-wrap justify-center gap-1.5">
                  {member.data.role.split(",").map((role) => (
                    <span
                      key={role}
                      className="inline-block px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-semibold capitalize"
                    >
                      {role.trim().replace(/-/g, " ")}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FOOTER ────────────────────────────────────────────── */}
      <footer className="border-t border-border bg-card/50 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
              <BookOpen size={12} className="text-primary-foreground" />
            </div>
            <span className="text-sm font-semibold text-foreground">AIMS</span>
            <span className="text-sm text-muted-foreground">— Academic Infrastructure Management System</span>
          </div>
          <p className="text-xs text-muted-foreground">© 2026 AIMS. All rights reserved.</p>
        </div>
      </footer>

      {/* Chatbot Widget */}
      <ChatbotWidget />
    </div>
  );
}
