"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { 
  LucideIcon, 
  ChevronRight, 
  BookOpen, 
  Users, 
  FlaskConical, 
  Award, 
  ArrowLeft, 
  Play, 
  Crown, 
  FileText, 
  GraduationCap, 
  Clock 
} from "lucide-react";
import { Navbar } from "@/components/navbar";
import { ChatbotWidget } from "@/components/chatbot-widget";

// ── Types ──────────────────────────────────────────────────────────────

interface HOD {
  name: string;
  designation: string;
  bio: string;
  initials: string;
  photoPath?: string;
  cabin: string;
  officeHours: string;
}

interface FacultyMember {
  name: string;
  designation: string;
  subjects: string[];
  experience: string;
  initials: string;
  photoPath: string;
  videoFile?: string;
}

interface Lab {
  name: string;
  capacity: number;
  description: string;
  available: boolean;
}

interface Achievement {
  title: string;
  description?: string;
  image?: string;
  featured?: boolean;
}

interface BranchPageProps {
  id: string;
  name: string;
  fullName: string;
  tagline: string;
  icon: LucideIcon;
  color: string;
  primaryColor: string;
  about: string;
  highlights: { label: string; value: string }[];
  programs: string[];
  hod: HOD;
  faculty: FacultyMember[];
  labs: Lab[];
  achievements: (string | Achievement)[];
  heroBg?: string;
  syllabusLinks?: { semester: string; url: string }[];
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
      <div className="h-0.5 w-8 aims-accent-bar rounded-full" />
      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
        {children}
      </span>
      <div className="h-0.5 w-8 aims-accent-bar rounded-full" />
    </div>
  );
}

// ── Main Template ──────────────────────────────────────────────────────

export function BranchPageTemplate({
  id,
  name,
  fullName,
  tagline,
  icon: Icon,
  about,
  highlights,
  programs,
  hod,
  faculty,
  labs,
  achievements,
  heroBg = "/assets/college/it_block.jpeg",
  syllabusLinks,
}: BranchPageProps) {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative min-h-[75vh] flex flex-col justify-center pt-24 pb-16 overflow-hidden aims-grid-bg">
        {/* Background Base */}
        <div className="absolute inset-0 bg-background z-0" />
        {/* Full Visibility Image */}
        <img src={heroBg} alt={`${name} Block`} className="absolute inset-0 w-full h-full object-cover object-[center_30%] z-[1]" />
        
        {/* Simple Gradient Overlay to ensure text visibility */}
        <div className="absolute inset-0 bg-black/40 z-[2]" />

        {/* Gradient & grid overlays to maintain theme integration */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-transparent to-accent/20 z-[3]" />
        <div className="absolute -top-20 -right-20 w-[400px] h-[400px] rounded-full bg-primary/20 blur-3xl z-[3]" />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors mb-8"
          >
            <ArrowLeft size={14} />
            Back to Home
          </Link>

          <div className="flex flex-col lg:flex-row gap-10 items-start">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55 }}
              className="flex-1"
            >
              <div className="p-8 rounded-[2rem] bg-black/30 backdrop-blur-md border border-white/10 shadow-2xl inline-block max-w-[90%]">
                <div className="inline-flex items-center gap-2 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                    <Icon size={20} className="text-white" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-[0.18em] text-white/90">{name}</span>
                </div>

                <h1 className="text-4xl font-black text-white mb-4 leading-tight">{fullName}</h1>
                <p className="text-xl text-white/80 font-bold mb-6 italic leading-relaxed">{tagline}</p>
                <p className="text-base text-white/70 leading-relaxed font-medium">{about}</p>
              </div>

              <div className="flex flex-wrap gap-3 mt-8">
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium text-sm shadow-md hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5 transition-all"
                >
                  Join Department
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border text-foreground font-medium text-sm hover:border-primary/40 transition-all"
                >
                  Access Resources <ChevronRight size={14} />
                </Link>
              </div>
            </motion.div>

            {/* Highlights */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.55, delay: 0.1 }}
              className="grid grid-cols-2 gap-3 min-w-[280px]"
            >
              {highlights.map(({ label, value }) => (
                <div key={label} className="p-4 rounded-2xl border border-border bg-card text-center">
                  <p className="text-2xl font-bold text-primary">{value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* HOD Section */}
      <section className="py-16 bg-gradient-to-r from-primary/5 to-accent/10 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 mb-10">
            <div className="h-0.5 w-6 aims-accent-bar rounded-full" />
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Department Head</span>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row gap-10 items-center bg-card/40 backdrop-blur-sm p-10 rounded-[3rem] border border-border"
          >
            {/* HOD Photo */}
            <div className="flex-shrink-0">
              <div className="w-48 h-48 rounded-[2.5rem] border-4 border-background shadow-2xl relative overflow-hidden bg-primary/15 flex items-center justify-center">
                {hod.photoPath ? (
                  <img src={hod.photoPath} alt={hod.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl font-bold text-primary">{hod.initials}</span>
                )}
                <div className="absolute bottom-4 right-4 w-10 h-10 rounded-2xl bg-primary flex items-center justify-center shadow-lg z-10">
                  <Crown size={20} className="text-primary-foreground" />
                </div>
              </div>
            </div>

            {/* HOD Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
                <h2 className="text-2xl font-bold text-foreground">{hod.name}</h2>
                <span className="px-4 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest border border-primary/20">Head of Department</span>
              </div>
              <p className="text-primary font-semibold text-base mb-6">{hod.designation}</p>
              <p className="text-muted-foreground leading-relaxed text-base max-w-3xl mb-8 italic">"{hod.bio}"</p>
              <div className="flex flex-wrap justify-center md:justify-start gap-8 text-sm">
                <div className="flex flex-col items-center md:items-start">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Administrative Cabin</span>
                  <span className="text-foreground font-semibold">{hod.cabin}</span>
                </div>
                <div className="flex flex-col items-center md:items-start">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Consultation Hours</span>
                  <span className="text-foreground font-semibold">{hod.officeHours}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Programs */}
      <section className="py-16 bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
            <BookOpen size={20} className="text-primary" /> Curricula & Programs
          </h2>
          <div className="flex flex-wrap gap-4">
            {programs.map((p: string) => (
              <div
                key={p}
                className="px-6 py-3 rounded-2xl border border-border bg-card text-sm font-semibold text-foreground hover:border-primary/40 hover:bg-primary/5 transition-all shadow-sm"
              >
                {p}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Syllabus */}
      {syllabusLinks && syllabusLinks.length > 0 && (
        <section className="py-16 bg-muted/10 border-y border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-foreground mb-8 flex items-center gap-3">
              <FileText size={24} className="text-primary" /> Academic Resources
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
              {syllabusLinks.map((s: { semester: string; url: string }, i: number) => (
                <Link
                  key={i}
                  href={s.url}
                  className="flex flex-col items-center justify-center p-6 rounded-[2rem] border border-border bg-card hover:border-primary/40 hover:bg-primary/5 hover:shadow-xl hover:shadow-primary/5 transition-all group"
                  target="_blank"
                >
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-primary/20 transition-all">
                    <FileText size={24} className="text-primary" />
                  </div>
                  <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{s.semester}</span>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-2 opacity-60">Syllabus PDF</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Faculty */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <SectionLabel>Mentorship</SectionLabel>
            <h2 className="text-3xl font-bold text-foreground tracking-tight">Academic Faculty</h2>
            <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">Expert educators dedicated to shaping the next generation of engineering professionals.</p>
          </div>

          <div className="space-y-12">
            {faculty.map((f: FacultyMember, i: number) => (
              <motion.div
                key={f.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="group relative bg-card border border-border rounded-[3rem] overflow-hidden hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500"
              >
                <div className="grid md:grid-cols-2 lg:grid-cols-5 items-stretch min-h-[320px]">
                  {/* Info Column */}
                  <div className="lg:col-span-2 p-10 flex flex-col justify-center border-b md:border-b-0 md:border-r border-border">
                    <div className="flex items-center gap-6 mb-8">
                      <div className="w-24 h-24 rounded-[2rem] border-2 border-primary/20 overflow-hidden bg-primary/10 flex-shrink-0 shadow-lg">
                        {f.photoPath ? (
                          <img src={f.photoPath} alt={f.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-2xl font-bold text-primary">{f.initials}</span>
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">{f.name}</h4>
                        <p className="text-primary font-semibold text-sm mt-1">{f.designation}</p>
                        <p className="text-xs text-muted-foreground mt-2 font-medium flex items-center gap-1.5">
                           <Clock size={12} className="text-primary" /> {f.experience} Experience
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-2">
                        {f.subjects.map((s: string) => (
                          <span
                            key={s}
                            className="px-3 py-1.5 rounded-xl bg-muted text-[10px] font-bold text-muted-foreground uppercase tracking-widest border border-transparent group-hover:border-primary/20 group-hover:bg-primary/5 group-hover:text-primary transition-all"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Video Column */}
                  <div className="lg:col-span-3 bg-muted/30 relative flex items-center justify-center p-8">
                    <div className="w-full h-full rounded-[2rem] overflow-hidden border border-border bg-black shadow-inner relative group/video">
                      {f.videoFile ? (
                        <video 
                          src={f.videoFile} 
                          controls 
                          className="w-full h-full"
                          poster={f.photoPath}
                        />
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
                          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover/video:scale-110 transition-transform">
                            <Play size={32} className="text-primary/40" />
                          </div>
                          <p className="text-sm font-bold text-foreground/40 uppercase tracking-[0.2em]">Intro Video Coming Soon</p>
                          <p className="text-[10px] text-muted-foreground/30 mt-2 max-w-[200px] font-medium leading-relaxed">
                             Our faculty profiles are currently being updated with professional intro videos.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Labs */}
      <section className="py-16 bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-foreground mb-10 flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
               <FlaskConical size={20} className="text-primary" />
             </div>
             Infrastructural Labs
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {labs.map((lab: Lab, i: number) => (
              <motion.div
                key={lab.name}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                viewport={{ once: true }}
                className="p-8 rounded-[2.5rem] border border-border bg-card hover:border-primary/40 hover:shadow-xl transition-all flex flex-col md:flex-row items-center gap-8"
              >
                <div className="w-20 h-20 rounded-[1.5rem] bg-background border-2 border-primary/10 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <FlaskConical size={32} className="text-primary" />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
                    <h4 className="font-bold text-foreground text-xl tracking-tight">{lab.name}</h4>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full shadow-sm border ${lab.available
                          ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                          : "bg-red-500/10 text-red-500 border-red-500/20"
                        }`}
                    >
                      {lab.available ? "Optimized & Ready" : "Maintenace/In Use"}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">{lab.description}</p>
                  <div className="flex items-center justify-center md:justify-start gap-4">
                     <span className="px-3 py-1 rounded-lg bg-muted text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{lab.capacity} Full Workstations</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Achievements */}
      <section className="py-16 bg-muted/10 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 mb-12">
            <div className="h-0.5 w-6 aims-accent-bar rounded-full" />
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Hall of Fame</span>
          </div>

          <div className="grid lg:grid-cols-12 gap-16">
            <div className="lg:col-span-8 space-y-10">
              <h2 className="text-3xl font-bold text-foreground flex items-center gap-3 tracking-tight">
                <Award size={32} className="text-primary" /> Milestone Achievements
              </h2>

              {/* Featured Achievements */}
              <div className="space-y-8">
                {achievements.filter((a): a is Achievement => typeof a === 'object' && !!a.featured).map((a: Achievement, i: number) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.98 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    viewport={{ once: true }}
                    className="group relative rounded-[3rem] overflow-hidden border border-primary/20 bg-card shadow-2xl"
                  >
                    <div className="grid md:grid-cols-2 gap-0">
                      {a.image && (
                        <div className="h-72 md:h-auto relative overflow-hidden">
                          <img
                            src={a.image}
                            alt={a.title}
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-r from-card via-transparent to-transparent md:bg-gradient-to-l" />
                        </div>
                      )}
                      <div className="p-10 flex flex-col justify-center">
                        <div className="inline-flex items-center gap-1.5 mb-6 py-1.5 px-4 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-[0.2em] border border-primary/20">
                          <Crown size={14} /> Premier Citation
                        </div>
                        <h3 className="text-2xl font-bold text-foreground mb-4 leading-snug group-hover:text-primary transition-colors">
                          {a.title}
                        </h3>
                        <p className="text-muted-foreground leading-relaxed italic">
                          "{a.description}"
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* List Achievements */}
              <div className="grid sm:grid-cols-2 gap-6">
                {achievements.filter((a) => typeof a === 'string' || (typeof a === 'object' && !a.featured)).map((a: string | Achievement, i: number) => (
                  <div
                    key={i}
                    className="flex items-start gap-4 p-6 rounded-[2rem] border border-border bg-card hover:border-primary/40 hover:bg-primary/5 transition-all group shadow-sm"
                  >
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0 group-hover:scale-125 transition-transform" />
                    <p className="text-sm font-semibold text-muted-foreground group-hover:text-foreground transition-colors leading-relaxed">
                      {typeof a === 'string' ? a : a.title}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Side Card / Call to action */}
            <div className="lg:col-span-4 self-start">
              <div className="p-10 rounded-[3rem] border border-border bg-gradient-to-br from-primary/10 via-background to-accent/10 shadow-2xl sticky top-24">
                <div className="w-16 h-16 rounded-[1.5rem] bg-primary flex items-center justify-center mb-8 shadow-xl shadow-primary/20">
                  <GraduationCap size={32} className="text-primary-foreground" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4 tracking-tight">Catalyzing Your Tech Journey</h3>
                <p className="text-base text-muted-foreground mb-10 leading-relaxed font-medium">
                  Enroll in the {name} department to gain access to world-class laboratories, 
                  bespoke research opportunities, and a network of industry-leading mentors.
                </p>
                <Link
                  href="/signup"
                  className="w-full inline-flex items-center justify-center gap-3 px-8 py-5 rounded-2xl bg-primary text-primary-foreground font-bold text-sm shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/35 hover:-translate-y-1 transition-all uppercase tracking-widest"
                >
                  Accelerate Career <ChevronRight size={18} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
             <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
               <BookOpen size={16} className="text-primary" />
             </div>
             <span className="font-bold text-foreground tracking-tighter uppercase text-sm">{fullName} — AIMS PORTAL</span>
          </div>
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">
            © 2026 UGIP KASHIPUR · <Link href="/" className="text-primary hover:underline">Back to Main Hub</Link>
          </p>
        </div>
      </footer>

      <ChatbotWidget />
    </div>
  );
}
