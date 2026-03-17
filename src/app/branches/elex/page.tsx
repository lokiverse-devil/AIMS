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
  hod: {
    name: "Manoj Rikhari",
    designation: "Lecturer & Head of Department — ELEX",
    bio: "Manoj Rikhari 15 years of teaching and research experience. He is a pioneer in elecronics enineering. ",
    initials: "MP",
    // TODO: Replace with /assets/faculty/patel.jpg
    photoPath: "/assets/faculty/patel.jpg",
    cabin: "From the entrance, take the left staircase and reach in front of the cabin, 1st Floor, Academic IT Block.",
    officeHours: "Mon-Sat, 9:00 AM - 4:00 PM",
  },
  faculty: [
     {
      name: "Manoj Rikhari",
      designation: "Lecturer & Head of Department — ELEX",
      subjects: ["Internet Of Things", "Operating Systems", "Computer System And Organization", "Data Mining and Warehouse"],
      experience: "15 years",
      initials: "MR",
      photoPath: "/assets/faculty/rikhari.jpg",
      // TODO: Replace with Supabase Storage URL
      // videoUrl: "https://PROJECT.supabase.co/storage/v1/object/public/faculty-videos/sharma_intro.mp4"
    },
    {
      name: "Rashid",
      designation: "Lecturer",
      subjects: ["VLSI Design", "Embedded Systems", "Microcontrollers"],
      experience: "15 years",
      initials: "R",
      photoPath: "/assets/faculty/rashid.jpg",
      // TODO: Replace with Supabase Storage URL
      // videoUrl: "https://PROJECT.supabase.co/storage/v1/object/public/faculty-videos/patel_intro.mp4"
    },
    {
      name: "Pankaj Kumar",
      designation: "Lecturer",
      subjects: ["Digital Signal Processing", "MATLAB", "DSP Algorithms"],
      experience: "14 years",
      initials: "PK",
      photoPath: "/assets/faculty/kumar.jpg",
    },
  ],
  labs: [
    { name: "Electronics Lab", capacity: 25, description: "Oscilloscopes, function generators, multimeters, component kits", available: true },

   
    { name: "Drone Lab", capacity: 20, description: "Spectrum analyzers, RF transceivers, signal modules", available: true },
  ],
  achievements: [
    "100% placement record for the past few years"
  ],
};

export default function ELEXPage() {
  return <BranchPageTemplate {...elexData} />;
}
