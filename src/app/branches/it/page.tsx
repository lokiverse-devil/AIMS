"use client";

import { Cpu } from "lucide-react";
import { BranchPageTemplate } from "@/components/branch-page-template";

const itData = {
  id: "it",
  name: "IT",
  fullName: "Information Technology",
  tagline:
    "Connecting people, data, and systems through intelligent technology solutions.",
  icon: Cpu,
  color: "from-slate-500/20 to-teal-500/10",
  primaryColor: "slate",
  about:
    "The Department of Information Technology at AIMS bridges the gap between theoretical knowledge and real-world application. Specializing in networking, cybersecurity, enterprise systems, and cloud computing, our graduates are highly sought after by leading IT companies globally.",

  highlights: [
    { label: "Students Enrolled", value: "122" },
    { label: "Faculty Members", value: "3" },
    { label: "Labs", value: "3" },
    { label: "Years of Excellence", value: "18+" },
  ],
  heroBg: "/assets/college/it.jpg",

  programs: ["Diploma in IT"],

  syllabusLinks: [
    { semester: "Semester 1", url: "https://www.irdtuttarakhand.org.in/ubter/Course.aspx?code=05" },
    { semester: "Semester 2", url: "https://www.irdtuttarakhand.org.in/ubter/Course.aspx?code=05" },
    { semester: "Semester 3", url: "https://irdtuttarakhand.org.in/Upload/IT%20(Information%20Technology)%20%20-III%20Sem%20New%20Syllabus.pdf" },
    { semester: "Semester 4", url: "https://irdtuttarakhand.org.in/Upload/Information%20Technology%20(12)-IV%20SEM.pdf" },
    { semester: "Semester 5", url: "https://irdtuttarakhand.org.in/Upload/Information%20Technology%20-V%20Sem%20New%20Syllabus.pdf" },
    { semester: "Semester 6", url: "https://irdtuttarakhand.org.in/Upload/Information%20Technology%20VI%20Sem-%20New%20Syllabus.pdf" }
  ],

  hod: {
    name: "Jagdish Chandra Pandey",
    designation: "Head of Department — IT",
    bio:
      "Jagdish Chandra Pandey holds an M.Tech in Information Technology and brings 16+ years of teaching and research experience. He specializes in Programming In C, Concepts of .NET Technology, Android Application Development, Java Programming. Under his leadership, the IT department has achieved 100% placement for 5 consecutive years and established industry partnerships with Zenthium, VVDN, Anand Mahle.",
    initials: "JP",
    photoPath: "/assets/faculty/pandey.jpg",
    cabin: "Right-hand side from the entrance, Ground Floor, Academic IT Block",
    officeHours: "Mon–Sat, 10:00 AM – 5:00 PM",
  },

  faculty: [
     {
      name: "Jagdish Chandra Pandey",
    designation: "Head of Department — IT",
      subjects: ["Programming In C", "Concepts of .NET Technology", "Android Application Development", "Java Programming"],
      experience: "15 years",
      initials: "JP",
      photoPath: "/assets/faculty/pandey.jpg",
      // TODO: Replace with Supabase Storage URL
      videoFile: "https://rvamuonqnsbnqdgpskir.supabase.co/storage/v1/object/public/faculty-videos/jp_intro.mp4"
    },
    {
      name: "Neha Bora",
      designation: "Lecturer",
      subjects: [
        "Data Communication",
        "Digital Technology",
        "Internet and Web Technology",
        "Computer Hardware and Systems",
        "Employability Skills",
      ],
      experience: "18 years",
      initials: "NB",
      photoPath: "/assets/faculty/bora.jpg",
    },
    {
      name: "Ashok Kumar",
      designation: "Lecturer",
      subjects: [
        "Internet Of Things",
        "Operating Systems",
        "Computer System And Organization",
        "Data Mining and Warehouse",
      ],
      experience: "4 years",
      initials: "AK",
      photoPath: "/assets/faculty/ashok.jpg",
      videoFile: "https://rvamuonqnsbnqdgpskir.supabase.co/storage/v1/object/public/faculty-videos/ashok_intro.mp4"
    },
  ],

  labs: [
    {
      name: "IT LAB",
      capacity: 23,
      description:
        "Intel i5 workstations, Visual Studio, IntelliJ IDEA, Turbo C",
      available: true,
    },
    {
      name: "IOT LAB",
      capacity: 20,
      description: "IoT Kits, Raspberry Pi, ESP boards, 3D Printer, Mechanical Arm",
      available: false,
    },
  ],

  achievements: [
    { title: "100% placement over the past few years", featured: false }
  ],
};

export default function ITPage() {
  return <BranchPageTemplate {...itData} />;
}