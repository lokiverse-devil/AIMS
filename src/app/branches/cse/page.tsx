"use client";

import { Monitor } from "lucide-react";
import { BranchPageTemplate } from "@/components/branch-page-template";

const cseData = {
  id: "cse",
  name: "CSE",
  fullName: "Computer Science Engineering",
  tagline: "Architecting the digital future through algorithms, AI, and innovation.",
  icon: Monitor,
  color: "from-teal-500/20 to-emerald-500/10",
  primaryColor: "teal",
  about:
    "The Department of Computer Science Engineering at AIMS is dedicated to nurturing future-ready engineers through a rigorous curriculum blending theoretical foundations with hands-on project experience. With cutting-edge labs and experienced faculty, CSE students excel in software engineering, artificial intelligence, data science, and systems programming.",
  highlights: [
    { label: "Students Enrolled", value: "150" },
    { label: "Faculty Members", value: "3" },
    { label: "Labs", value: "2" },
    { label: "Years of Excellence", value: "20+" },
  ],
  programs: [
    "Diploma In Computer Science and Engineering"
  ],
  hod: {
    name: "Manmohan",
    designation: "Lecturer & Head of Department — CSE",
    bio: "Manmohan is the lecturer and the HOD incharge of our department. He specializes in Internet Of Things, Operating Systems, Computer System And Organization, Data Mining and Warehouse. Under his leadership, the CSE department has achieved 100% placement for 5 consecutive years and established industry partnerships with Zenthium, VVDN, Anand Mahle.",
    initials: "MV",
    // TODO: Replace with /assets/faculty/sharma.jpg
    photoPath: "/assets/faculty/mannu.jpg",
    cabin: "Left-hand side from the entrance, second room, Ground Floor, Academic IT Block",
    officeHours: "Mon–Fri, 10:00 AM – 5:00 PM",
  },
  faculty: [
    {
      name: "Manmohan",
      designation: "Lecturer & HOD",
      subjects: ["Internet Of Things", "Operating Systems", "Computer System And Organization", "Data Mining and Warehouse"],
      experience: "15 years",
      initials: "MV",
      photoPath: "/assets/faculty/mannu.jpg",
      // TODO: Replace with Supabase Storage URL
      // videoUrl: "https://PROJECT.supabase.co/storage/v1/object/public/faculty-videos/sharma_intro.mp4"
    },
    {
      name: "Neeraj Arya",
      designation: "Lecturer",
      subjects: ["Computer Fundamentals", "Data Structures and Algorithms", "Relational Database Management System"],
      experience: "12 years",
      initials: "NA",
      photoPath: "/assets/faculty/arya.jpg",
    },
    {
      name: "Virendra Dharamasaktu",
      designation: "Lecturer",
      subjects: ["Computer Network Security", "Computer Hardware Sytems", "Employbility Skills", "Multimedia System"],
      experience: "17 years",
      initials: "VD",
      photoPath: "/assets/faculty/viren.jpg",
    },
  ],
  labs: [
    { name: "CSE LAB", capacity:23, description: "Intel i5 workstations, Visual Studio, IntelliJ IDEA, Turbo C", available: true },
    { name: "IOT LAB", capacity: 20, description: "Iot Kit, Rapberry, Esp's, 3d Printer, Mechanical Arm", available: false },
  ],
  achievements: [
    "100% placement record for past consecutive years",
  ],
};

export default function CSEPage() {
  return <BranchPageTemplate {...cseData} />;
}
