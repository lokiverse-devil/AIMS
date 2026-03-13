"use client";

import { Cpu } from "lucide-react";
import { BranchPageTemplate } from "@/components/branch-page-template";

const itData = {
  id: "it",
  name: "IT",
  fullName: "Information Technology",
  tagline: "Connecting people, data, and systems through intelligent technology solutions.",
  icon: Cpu,
  color: "from-slate-500/20 to-teal-500/10",
  primaryColor: "slate",
  about:
    "The Department of Information Technology at AIMS bridges the gap between theoretical knowledge and real-world application. Specializing in networking, cybersecurity, enterprise systems, and cloud computing, our graduates are highly sought after by leading IT companies globally.",
  highlights: [
    { label: "Students Enrolled", value: "150" },
    { label: "Faculty Members", value: "3" },
    { label: "Labs", value: "3" },
    { label: "Years of Excellence", value: "18+" },
  ],
  programs: [
    
    "Diploma in IT",
    
  ],
  hod: {
    name: "Jagdish Chandra Pandey",
    designation: "Professor & Head of Department — IT",
    bio: "Jagdish Chandra Pandey holds an M.Tech in Information Technology and brings 16+ years of teaching and research experience. He specializes in Database Systems, Cloud Computing, and Distributed Systems. Under her guidance, .",
    initials: "SR",
    // TODO: Replace with /assets/faculty/rao.jpg
    photoPath: "/assets/faculty/rao.jpg",
    cabin: "Right-hand side from the entrance, Ground Floor, Academic IT Block",
    officeHours: "Mon–Sat, 10:00 AM – 5:00 PM",
  },
  faculty: [
    {
      name: "Neha Bora",
      designation: "Lecturer",
      subjects: ["Inernet and web technology", "Compuet hardware and systems", "Eplybility Skills"],
      experience: "16 years",
      initials: "NB",
      photoPath: "/assets/faculty/rao.jpg",
      // TODO: Replace with Supabase Storage URL
      // videoUrl: "https://PROJECT.supabase.co/storage/v1/object/public/faculty-videos/rao_intro.mp4"
    },
    {
      name: "Ashok Kumar",
      designation: "Lecturer",
      subject:["Internet Of Things", "Operating Systems", "Computer System And Organization", "Data Mining and Warehouse"],
      experience: "13 years",
      initials: "AK",
      photoPath: "/assets/faculty/tiwari.jpg",
    },
    {
      name: "Prof. Neha Gupta",
      designation: "Assistant Professor",
      subjects: ["Computer Networks", "Cisco CCNA", "Routing & Switching"],
      experience: "8 years",
      initials: "NG",
      photoPath: "/assets/faculty/gupta.jpg",
    },
  ],
  labs: [
    { name: "IT LAB", capacity:23, description: "Intel i5 workstations, Visual Studio, IntelliJ IDEA, Turbo C", available: true },
    { name: "IOT LAB", capacity: 20, description: "Iot Kit, Rapberry, Esp's, 3d Printer, Mechanical Arm", available: false },
  ],
  achievements: [
    "100% placement over the past few years",,
  ],
};

export default function ITPage() {
  return <BranchPageTemplate {...itData} />;
}
