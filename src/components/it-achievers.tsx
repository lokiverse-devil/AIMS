"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  TrendingUp,
  Award,
  Crown,
  Briefcase
} from "lucide-react";

const achieverCompanies = [
  {
    companyName: "Himalayan Technosoft",
    address: "Sainik Colony, Neejhra, Kashipur, Uttarakhand",
    contact: {
      phone: "+91 8859647163",
      email: "himalayantechnosoft@gmail.com",
      website: "http://www.himalayantechnosoft.com"
    },
    turnover: "₹ 4,95,000 /-",
    relatedField: "Software Development (Web & Mobile Apps, Custom Solutions, Cloud) & Digital Marketing (SEO, SMM, PPC, Content, Graphic Design)",
    about: "Himalayan Technosoft is a rapidly growing IT and Digital Marketing company established in 2025 to transform businesses with innovative technology and smart marketing strategies. Headquartered in Uttarakhand, India, the company's vision is to blend modern digital solutions with professionalism delivering exceptional results across industries. Our mission is to empower startups, enterprises and organizations to embrace digital transformation seamlessly. We specialize in robust software solutions and strategic campaigns that help businesses build strong online presence, optimize processes and achieve measurable growth.",
    members: [
      { name: "Bharat Singh Rawat", role: "Founder", initials: "BS", image: null },
      { name: "Pawan Kumar", role: "Co-Founder and Software Strategist", initials: "PK", image: null },
      { name: "Manisha", role: "Managing Director", initials: "M", image: null }
    ]
  },
  {
    companyName: "Celestials",
    address: "Address 1: Pistsovaya Street, 15, entrance 1, (Moscow) 127220\nAddress 2: DLF Prime Tower, Okhla Phase 1, South Delhi (India)",
    contact: {
      phone: "+7(992) 777-20-23 / +91(724) 819-77-17",
      email: "mail@deepakpokhriyal.com",
      website: "http://www.deepakpokhriyal.com"
    },
    turnover: "₹ 12,00,000 /-",
    relatedField: "Software Development and Digital Marketing Services (SEO, SMM, PPC, Content, Graphic Design)",
    about: "Founded with two years of intensive research, Celestial is a premier software solutions provider now operating from strategic hubs in South Delhi and Moscow. Our vision is to pioneer the next generation of intelligent software. We move beyond conventional solutions to develop advanced, AI-integrated systems and cognitive platforms that empower businesses to operate with foresight, efficiency, and automation. We specialize in engineering bespoke, future-ready software that transforms complex challenges into seamless digital experiences, setting new benchmarks for innovation and performance in the industry.",
    members: [
      { name: "Deepak Pokhriyal", role: "Founder, CEO", initials: "DP", image: null },
      { name: "Shivanshi Mishra", role: "Co-Founder and Software Strategist", initials: "SM", image: null }
    ]
  }
];

export function ITAchievers() {
  return (
    <div className="space-y-16 mt-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h3 className="text-3xl font-serif font-bold text-foreground flex items-center gap-3">
            <Award size={28} className="text-primary" />
            Our IT Alumini's Achivements
          </h3>
          <p className="text-muted-foreground mt-2 font-medium">
            Celebrating the entrepreneurial spirit and industry success of our Information Technology alumni.
          </p>
        </div>
      </div>

      <div className="space-y-16">
        {achieverCompanies.map((company, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="rounded-[2.5rem] aims-glass-card shadow-lg border border-border/50 overflow-hidden relative"
          >
            {/* Background gradient element */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

            <div className="grid lg:grid-cols-12 gap-0">
              {/* Company Details */}
              <div className="lg:col-span-7 p-8 md:p-12 relative z-10">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest mb-6">
                  <Building2 size={14} /> Entrepreneurial Venture
                </div>
                
                <h4 className="text-4xl font-serif font-bold text-foreground mb-6">
                  {company.companyName}
                </h4>
                
                <p className="text-muted-foreground leading-relaxed italic mb-8 border-l-2 border-primary/30 pl-4">
                  "{company.about}"
                </p>

                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <div>
                    <div className="flex items-center gap-2 text-sm font-semibold text-foreground mb-2">
                      <Briefcase size={16} className="text-primary" /> Specialization
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{company.relatedField}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-sm font-semibold text-foreground mb-2">
                      <TrendingUp size={16} className="text-primary" /> Estimated Turnover
                    </div>
                    <p className="text-lg font-bold text-emerald-500">{company.turnover}</p>
                  </div>
                </div>

                <div className="bg-muted/30 p-5 rounded-2xl space-y-3 border border-border/50">
                  <div className="flex items-start gap-3">
                    <MapPin size={16} className="text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground whitespace-pre-line">{company.address}</span>
                  </div>
                  <div className="flex flex-wrap gap-4 pt-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone size={14} className="text-primary" /> {company.contact.phone}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail size={14} className="text-primary" /> {company.contact.email}
                    </div>
                    {company.contact.website && (
                      <a href={company.contact.website} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline">
                        <Globe size={14} /> Website
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Members */}
              <div className="lg:col-span-5 bg-muted/10 p-8 md:p-12 border-t lg:border-t-0 lg:border-l border-border/50 flex flex-col justify-center">
                <h5 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-8 flex items-center gap-2">
                  <Crown size={16} className="text-primary" /> Key Members
                </h5>
                
                <div className="space-y-6">
                  {company.members.map((member, idx) => (
                    <div key={idx} className="flex items-center gap-5 group">
                      <div className="w-16 h-16 rounded-2xl aims-glass-card shadow-sm flex items-center justify-center overflow-hidden flex-shrink-0 border border-primary/20 group-hover:border-primary/50 transition-colors">
                        {member.image ? (
                          <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xl font-bold text-primary">{member.initials}</span>
                        )}
                      </div>
                      <div>
                        <h6 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                          {member.name}
                        </h6>
                        <p className="text-sm font-medium text-muted-foreground mt-1">
                          {member.role}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
