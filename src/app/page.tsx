"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Mic, BarChart3, FileText, Star, Clock, ArrowUpRight } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const FEATURES = [
  {
    icon: Mic,
    title: "Voice-first interviews",
    description: "Talk to an AI that responds in real time. No typing, no scripts — just a conversation.",
  },
  {
    icon: BarChart3,
    title: "Scored feedback",
    description: "See how you did on technical depth, communication, and confidence. Not just a number — actual notes.",
  },
  {
    icon: FileText,
    title: "Full transcripts",
    description: "Every word is saved. Read back your answers, spot the hesitations, improve over time.",
  },
  {
    icon: Clock,
    title: "Under 2 minutes to start",
    description: "Pick a role, choose a level, start talking. No scheduling, no account required to try.",
  },
];

const TESTIMONIALS = [
  {
    quote: "The feedback was way more specific than anything I'd gotten from human interviewers. Helped me fix exactly what was costing me offers.",
    name: "Priya S.",
    role: "Senior SWE — FAANG",
  },
  {
    quote: "I'd been failing phone screens for two months. Two weeks here and I had an offer. The real-time format forces you to think on your feet.",
    name: "Ayesha K.",
    role: "Frontend Engineer",
  },
  {
    quote: "Weirdly realistic. I got nervous the same way I do in real interviews, which made the practice actually meaningful.",
    name: "Marcus T.",
    role: "Full Stack Developer",
  },
];

const ROLES = [
  "Frontend", "Backend", "Full Stack", "ML Engineer",
  "Data Scientist", "DevOps", "Product Manager", "iOS", "Android", "System Design",
];

export default function LandingPage() {
  const { user, signInAsGuest } = useAuth();
  const router = useRouter();

  const handleGuestStart = async () => {
    try {
      await signInAsGuest();
      router.push("/create");
    } catch {
      toast.error("Failed to start. Please try again.");
    }
  };

  return (
    <div className="min-h-screen" style={{ background: "#0e0e0e" }}>

      {/* ── Nav ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[#1e1e1e]" style={{ background: "rgba(14,14,14,0.92)", backdropFilter: "blur(12px)" }}>
        <div className="container-page h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ background: "hsl(38,92%,50%)" }}>
              <Mic size={14} className="text-[#0e0e0e]" />
            </div>
            <span className="font-semibold text-[15px] tracking-tight" style={{ color: "#f2f0ed" }}>VoicePrep</span>
          </Link>

          <div className="flex items-center gap-2">
            {user ? (
              <>
                <Link href="/dashboard" className="btn-ghost text-sm">Dashboard</Link>
                <Link href="/create" className="btn-primary text-sm py-1.5 px-4">New interview</Link>
              </>
            ) : (
              <>
                <Link href="/login" className="btn-ghost text-sm">Sign in</Link>
                <Link href="/register" className="btn-primary text-sm py-1.5 px-4">Get started</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="pt-36 pb-24 container-page">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="max-w-3xl"
        >
          {/* Label */}
          <div className="flex items-center gap-2 mb-8">
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "hsl(38,92%,55%)" }}>
              AI Interview Practice
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold leading-[1.08] tracking-tight mb-6" style={{ color: "#f2f0ed", letterSpacing: "-0.03em" }}>
            Practice interviews<br />
            that feel <span style={{ color: "hsl(38,92%,55%)" }}>real.</span>
          </h1>

          <p className="text-lg leading-relaxed mb-10 max-w-xl" style={{ color: "#a09d99" }}>
            Talk to an AI interviewer, get scored feedback, and read your full transcript.
            Works for any role — from junior to staff.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            {user ? (
              <Link href="/create" className="btn-primary text-[15px] py-2.5 px-6 gap-2">
                Start interview <ArrowUpRight size={16} />
              </Link>
            ) : (
              <>
                <Link href="/register" className="btn-primary text-[15px] py-2.5 px-6 gap-2">
                  Try free <ArrowUpRight size={16} />
                </Link>
                <button onClick={handleGuestStart} className="btn-secondary text-[14px] py-2.5 px-5">
                  Try without an account
                </button>
              </>
            )}
          </div>

          <p className="text-sm mt-5" style={{ color: "#636059" }}>
            No credit card · Ready in under 2 minutes
          </p>
        </motion.div>
      </section>

      {/* ── Stats row ── */}
      <section className="border-y py-12" style={{ borderColor: "#1e1e1e" }}>
        <div className="container-page">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "10K+", label: "interviews completed" },
              { value: "94%", label: "satisfaction rate" },
              { value: "<200ms", label: "AI response time" },
              { value: "50+", label: "roles supported" },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <div className="text-3xl font-bold tracking-tight mb-1" style={{ color: "#f2f0ed", letterSpacing: "-0.03em" }}>
                  {s.value}
                </div>
                <div className="text-sm" style={{ color: "#636059" }}>{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-28 container-page">
        <div className="mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4" style={{ color: "#f2f0ed", letterSpacing: "-0.03em" }}>
            What you get
          </h2>
          <p className="text-base" style={{ color: "#a09d99", maxWidth: "28rem" }}>
            Everything built around one goal: you walking out of your next interview with an offer.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="p-7 rounded-xl border"
              style={{ background: "#141414", borderColor: "#242424" }}
            >
              <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-5"
                style={{ background: "hsl(38,92%,50%,0.1)", border: "1px solid hsl(38,92%,50%,0.2)" }}>
                <f.icon size={17} style={{ color: "hsl(38,96%,65%)" }} />
              </div>
              <h3 className="font-semibold text-[15px] mb-2" style={{ color: "#f2f0ed" }}>{f.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: "#a09d99" }}>{f.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Roles marquee ── */}
      <section className="border-y py-8 overflow-hidden" style={{ borderColor: "#1e1e1e" }}>
        <div className="flex gap-3 animate-marquee whitespace-nowrap">
          {[...ROLES, ...ROLES].map((role, i) => (
            <span
              key={i}
              className="flex-shrink-0 text-xs font-semibold uppercase tracking-widest px-4 py-1.5 rounded-sm"
              style={{ color: "#636059", border: "1px solid #242424", background: "#141414" }}
            >
              {role}
            </span>
          ))}
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-28 container-page">
        <h2 className="text-3xl font-bold tracking-tight mb-14" style={{ color: "#f2f0ed", letterSpacing: "-0.03em" }}>
          From people who got hired
        </h2>

        <div className="grid md:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-6 rounded-xl border flex flex-col"
              style={{ background: "#141414", borderColor: "#242424" }}
            >
              <div className="flex gap-0.5 mb-5">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star key={j} size={13} className="fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-sm leading-relaxed flex-1 mb-6" style={{ color: "#a09d99" }}>
                &ldquo;{t.quote}&rdquo;
              </p>
              <div>
                <div className="text-sm font-semibold" style={{ color: "#f2f0ed" }}>{t.name}</div>
                <div className="text-xs mt-0.5" style={{ color: "#636059" }}>{t.role}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24">
        <div className="container-page">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border p-14 text-center"
            style={{ background: "#141414", borderColor: "#242424" }}
          >
            <h2 className="text-4xl font-bold tracking-tight mb-4" style={{ color: "#f2f0ed", letterSpacing: "-0.03em" }}>
              Start practicing today
            </h2>
            <p className="mb-8 text-base" style={{ color: "#a09d99", maxWidth: "26rem", margin: "0 auto 2rem" }}>
              Free, no setup required. Your first interview takes about 10 minutes.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              {user ? (
                <Link href="/create" className="btn-primary text-[15px] py-2.5 px-8">
                  Start an interview
                </Link>
              ) : (
                <>
                  <Link href="/register" className="btn-primary text-[15px] py-2.5 px-8">
                    Create free account
                  </Link>
                  <button onClick={handleGuestStart} className="btn-secondary text-[14px] py-2.5 px-6">
                    Try without signing up
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t py-10" style={{ borderColor: "#1e1e1e" }}>
        <div className="container-page flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded flex items-center justify-center" style={{ background: "hsl(38,92%,50%)" }}>
              <Mic size={11} className="text-[#0e0e0e]" />
            </div>
            <span className="font-semibold text-sm tracking-tight" style={{ color: "#f2f0ed" }}>VoicePrep</span>
          </div>
          <p className="text-sm" style={{ color: "#636059" }}>© 2026 VoicePrep · Powered by Vapi & Gemini</p>
          <div className="flex gap-5 text-sm" style={{ color: "#636059" }}>
            <Link href="/login" className="hover:text-[#a09d99] transition-colors">Sign in</Link>
            <Link href="/register" className="hover:text-[#a09d99] transition-colors">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
