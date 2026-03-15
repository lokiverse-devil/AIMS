"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import { LucideIcon, ChevronRight, BookOpen, Users, FlaskConical, Award, ArrowLeft, Play, X, Crown } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { ChatbotWidget } from "@/components/chatbot-widget";

// ── Types ──────────────────────────────────────────────────────────────

interface HOD {
  name: string;
  designation: string;
  bio: string;
  initials: string;
  // TODO: Replace with /assets/faculty/{filename}.jpg
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
  // TODO: Replace with /assets/faculty/{filename}.jpg
  photoPath: string;
  // TODO: Replace with Supabase Storage URL for intro video
  // videoUrl — future: https://PROJECT.supabase.co/storage/v1/object/public/faculty-videos/{name}_intro.mp4
  videoFile?: string;
}

interface Lab {
  name: string;
  capacity: number;
  description: string;
  available: boolean;
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
  achievements: string[];
}

// ── Faculty Video Modal ────────────────────────────────────────────────

function FacultyVideoModal({ faculty, onClose }: { faculty: FacultyMember; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        transition={{ duration: 0.22 }}
        className="bg-card border border-border rounded-2xl overflow-hidden shadow-2xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal header */}
        <div className="bg-primary px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-primary-foreground/20 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-primary-foreground">{faculty.initials}</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-primary-foreground">{faculty.name}</p>
              <p className="text-[10px] text-primary-foreground/70">{faculty.designation}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-primary-foreground/20 flex items-center justify-center hover:bg-primary-foreground/30 transition-colors"
          >
            <X size={14} className="text-primary-foreground" />
          </button>
        </div>

        {/* Video area */}
        <div className="p-5">
          <div className="w-full aspect-video bg-muted/50 rounded-xl flex items-center justify-center border border-border overflow-hidden">
            {/* TODO: Replace with Supabase Storage URL */}
            {/* <video
              src={`https://PROJECT.supabase.co/storage/v1/object/public/faculty-videos/${faculty.videoFile}`}
              controls
              className="w-full h-full rounded-xl"
            /> */}
            <div className="text-center px-4">
              <div className="w-16 h-16 rounded-full bg-primary/15 flex items-center justify-center mx-auto mb-3">
                <Play size={28} className="text-primary ml-1" />
              </div>
              <p className="text-sm font-semibold text-foreground">{faculty.name} — Intro</p>
              <p className="text-xs text-muted-foreground mt-1">
                {faculty.videoFile ? `Video: ${faculty.videoFile}` : "No video assigned yet"}
              </p>
              <p className="text-[10px] text-muted-foreground/60 mt-2">
                {/* TODO: https://PROJECT.supabase.co/storage/v1/object/public/faculty-videos/{name}_intro.mp4 */}
                Will load from Supabase faculty-videos bucket
              </p>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            {faculty.subjects.map((s) => (
              <span key={s} className="inline-block mr-1.5 mb-1 px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-xs font-medium">
                {s}
              </span>
            ))}
            <p className="text-xs text-muted-foreground pt-1">{faculty.experience}</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
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
}: BranchPageProps) {
  const [videoModalFaculty, setVideoModalFaculty] = useState<FacultyMember | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden aims-grid-bg">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-background to-accent/15" />
        <div className="absolute -top-20 -right-20 w-[400px] h-[400px] rounded-full bg-primary/5 blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
              <div className="inline-flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
                  <Icon size={20} className="text-primary" />
                </div>
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">{name}</span>
              </div>

              <h1 className="text-5xl font-bold text-foreground mb-3">{fullName}</h1>
              <p className="text-xl text-muted-foreground mb-6">{tagline}</p>
              <p className="text-base text-muted-foreground leading-relaxed max-w-2xl">{about}</p>

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
          <div className="flex items-center gap-2 mb-6">
            <div className="h-0.5 w-6 aims-accent-bar rounded-full" />
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Department Head</span>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row gap-6 items-start"
          >
            {/* HOD Photo */}
            <div className="flex-shrink-0">
              <div className="w-24 h-24 rounded-2xl border-2 border-primary/20 relative overflow-hidden bg-primary/15 flex items-center justify-center">
                {hod.photoPath ? (
                  <img src={hod.photoPath} alt={hod.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl font-bold text-primary">{hod.initials}</span>
                )}
                <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-primary flex items-center justify-center shadow-md z-10" title="Head of Department">
                  <Crown size={14} className="text-primary-foreground" />
                </div>
              </div>
            </div>

            {/* HOD Info */}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h2 className="text-2xl font-bold text-foreground">{hod.name}</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-primary/15 text-primary text-xs font-semibold">HOD</span>
              </div>
              <p className="text-primary font-medium text-sm mb-3">{hod.designation}</p>
              <p className="text-muted-foreground leading-relaxed text-sm max-w-2xl mb-4">{hod.bio}</p>
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span>Cabin: <span className="text-foreground font-medium">{hod.cabin}</span></span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span>Office Hours: <span className="text-foreground font-medium">{hod.officeHours}</span></span>
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
            <BookOpen size={20} className="text-primary" /> Programs Offered
          </h2>
          <div className="flex flex-wrap gap-3">
            {programs.map((p) => (
              <div
                key={p}
                className="px-4 py-2 rounded-xl border border-border bg-card text-sm font-medium text-foreground hover:border-primary/40 transition-colors"
              >
                {p}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Faculty */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="h-0.5 w-6 aims-accent-bar rounded-full" />
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Faculty</span>
              </div>
              <h2 className="text-3xl font-bold text-foreground flex items-center gap-2">
                <Users size={22} className="text-primary" /> Department Faculty
              </h2>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {faculty.map((f, i) => (
              <motion.div
                key={f.name}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                viewport={{ once: true }}
                className="p-5 rounded-2xl border border-border bg-card hover:border-primary/30 hover:shadow-lg hover:shadow-primary/8 transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl border border-primary/20 relative overflow-hidden bg-primary/15 flex items-center justify-center flex-shrink-0">
                    {f.photoPath ? (
                      <img src={f.photoPath} alt={f.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-lg font-bold text-primary">{f.initials}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-foreground">{f.name}</h4>
                    <p className="text-xs text-primary font-medium mt-0.5">{f.designation}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{f.experience}</p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {f.subjects.map((s) => (
                    <span
                      key={s}
                      className="px-2 py-0.5 rounded-lg bg-muted text-xs text-muted-foreground"
                    >
                      {s}
                    </span>
                  ))}
                </div>
                {/* Faculty Intro Video */}
                <button
                  onClick={() => setVideoModalFaculty(f)}
                  className="mt-3 w-full flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-primary hover:bg-primary/5 py-2 rounded-lg border border-border transition-all"
                >
                  <Play size={12} /> View Intro Video
                  {/* TODO: https://PROJECT.supabase.co/storage/v1/object/public/faculty-videos/{name}_intro.mp4 */}
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Labs */}
      <section className="py-16 bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
            <FlaskConical size={20} className="text-primary" /> Department Labs
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {labs.map((lab, i) => (
              <motion.div
                key={lab.name}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                viewport={{ once: true }}
                className="p-4 rounded-2xl border border-border bg-card flex items-center gap-4"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <FlaskConical size={18} className="text-primary" />
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
                  <p className="text-xs text-muted-foreground mt-0.5">{lab.description}</p>
                  <p className="text-xs text-muted-foreground">{lab.capacity} seats</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Achievements */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
            <Award size={20} className="text-primary" /> Achievements & Accreditations
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {achievements.map((a, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-4 rounded-xl border border-border bg-card"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                <p className="text-sm text-muted-foreground leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-sm text-muted-foreground">
            {fullName} — AIMS Academic Portal · <Link href="/" className="text-primary hover:underline">Back to Home</Link>
          </p>
        </div>
      </footer>

      <ChatbotWidget />

      {/* Faculty Video Modal */}
      <AnimatePresence>
        {videoModalFaculty && (
          <FacultyVideoModal
            faculty={videoModalFaculty}
            onClose={() => setVideoModalFaculty(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
