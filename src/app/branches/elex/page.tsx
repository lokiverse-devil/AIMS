"use client";

import { Zap } from "lucide-react";
import { BranchPageTemplate } from "@/components/branch-page-template";

const elexData = {
  id: "elex",
  name: "ELEX",
  fullName: "Electronics Engineering",
  tagline: "Powering innovation through circuits, signals, and smart embedded intelligence.",
  icon: Zap,
  color: "from-emerald-500/20 to-cyan-500/10",
  primaryColor: "emerald",
  about:
    "The Department of Electronics Engineering at AIMS offers a comprehensive curriculum covering VLSI design, embedded systems, signal processing, communication systems, and IoT. Our state-of-the-art labs and industry partnerships ensure students are equipped for the rapidly evolving electronics industry.",
  highlights: [
    { label: "Students Enrolled", value: "122" },
    { label: "Faculty Members", value: "3" },
    { label: "Labs", value: "2" },
    { label: "Years of Excellence", value: "15+" },
  ],
  heroBg: "/assets/college/elex.jpg",
  programs: [
    "Diploma in Electronics"
  ],
  syllabusLinks: [
    { semester: "Semester 1", url: "https://www.irdtuttarakhand.org.in/ubter/Course.aspx?code=05" },
    { semester: "Semester 2", url: "https://www.irdtuttarakhand.org.in/ubter/Course.aspx?code=05" },
    { semester: "Semester 3", url: "https://irdtuttarakhand.org.in/Upload/Electronics%20Engineering%20%20-III%20Sem%20New%20Syllabus.pdf" },
    { semester: "Semester 4", url: "https://irdtuttarakhand.org.in/Upload/Electrical%20Engineering%20(08)-%20IV%20SEM.pdf" },
    { semester: "Semester 5", url: "https://irdtuttarakhand.org.in/Upload/Electronics%20Engineering%20-V%20Sem%20New%20Syllabus.pdf" },
    { semester: "Semester 6", url: "https://irdtuttarakhand.org.in/Upload/Electronics%20Engineering%20VI%20Sem-%20New%20Syllabus.pdf" }
  ],
  hod: {
    name: "Manoj Rikhari",
    designation: "Lecturer & Head of Department — ELEX",
    bio: "Manoj Rikhari 15 years of teaching and research experience. He is a pioneer in elecronics enineering.Under his leadership, the ELEX department has achieved 100% placement for 5 consecutive years and established industry partnerships with Zenthium, Anand Mahle, Minda. ",
    initials: "MR",
    // TODO: Replace with /assets/faculty/patel.jpg
    photoPath: "/assets/faculty/manoj.jpg",
    cabin: "From the entrance, take the left staircase and reach in front of the cabin, 1st Floor, Academic IT Block.",
    officeHours: "Mon-Sat, 9:00 AM - 4:00 PM",
  },
  faculty: [
     {
      name: "Manoj Rikhari",
      designation: "Lecturer & Head of Department — ELEX",
      subjects: [" Mobile Communication", "PLC", "NFTL"],
      experience: "15 years",
      initials: "MR",
      photoPath: "/assets/faculty/manoj.jpg",
      // TODO: Replace with Supabase Storage URL
      // videoUrl: "https://PROJECT.supabase.co/storage/v1/object/public/faculty-videos/sharma_intro.mp4"
    },
    {
      name: "Pankaj Kumar",
      designation: "Lecturer",
      subjects: ["Microprocessor and App", "Microcontroller and embedded systems", "Electronic Circuits"],
      experience: "10 years",
      initials: "PK",
      photoPath: "/assets/faculty/kumar.JPG",
      videoFile: "https://rvamuonqnsbnqdgpskir.supabase.co/storage/v1/object/public/faculty-videos/pankaj_intro.mp4"
    },
    {
      name: "Rashid",
      designation: "Lecturer",
      subjects: ["Optical Fibre Communication", "Electronic Measurement", "Signal Sensing"],
      experience: "10 years",
      initials: "R",
      photoPath: "/assets/faculty/rashid.jpg",
      // TODO: Replace with Supabase Storage URL
      videoFile: "https://rvamuonqnsbnqdgpskir.supabase.co/storage/v1/object/public/faculty-videos/rashid_intro.mp4"
    },
  ],
  labs: [
    { name: "Electronics Lab", capacity: 25, description: "Oscilloscopes, function generators, multimeters, component kits", available: true },

   
    { name: "Drone Lab", capacity: 20, description: "Spectrum analyzers, RF transceivers, signal modules,8086 Microprocessor", available: true },
  ],
  achievements: [
    { title: "100% placement record for the past few years", featured: false }
  ],
};

export default function ELEXPage() {
  return <BranchPageTemplate {...elexData} />;
}
