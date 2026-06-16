"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Mic,
  Zap,
  BarChart3,
  FileText,
  ChevronRight,
  Star,
  Shield,
  Clock,
  Users,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const FEATURES = [
  {
    icon: Mic,
    title: "Real-Time Voice AI",
    description:
      "Speak naturally with an AI interviewer that responds in real time with back-channeling and low latency. Just like a real interview.",
    color: "brand",
  },
  {
    icon: Sparkles,
    title: "Tailored Question Sets",
    description:
      "Generate custom interviews for any role, level, and tech stack using AI. 5 to 15 questions, perfectly calibrated.",
    color: "purple",
  },
  {
    icon: BarChart3,
    title: "Instant Feedback",
    description:
      "Get scored on technical accuracy, communication, and confidence. See your strengths and exactly what to improve.",
    color: "green",
  },
  {
    icon: FileText,
    title: "Full Transcripts",
    description:
      "Every interview is saved with a complete transcript you can review any time. Track your growth over time.",
    color: "amber",
  },
];

const STATS = [
  { value: "10K+", label: "Interviews Conducted" },
  { value: "94%", label: "Satisfaction Rate" },
  { value: "<200ms", label: "AI Response Latency" },
  { value: "50+", label: "Job Roles Supported" },
];

const TESTIMONIALS = [
  {
    quote: "VoicePrep AI helped me land a senior SWE role at a FAANG company. The feedback was incredibly actionable.",
    name: "Priya S.",
    role: "Senior Software Engineer",
    rating: 5,
  },
  {
    quote: "The real-time voice experience is shockingly realistic. I felt like I was in an actual Google interview.",
    name: "Marcus T.",
    role: "Full Stack Developer",
    rating: 5,
  },
  {
    quote: "I failed 3 interviews before VoicePrep. After 2 weeks of practice here, I got an offer from my dream company.",
    name: "Ayesha K.",
    role: "Frontend Engineer",
    rating: 5,
  },
];

const ROLES = [
  "Frontend Engineer", "Backend Engineer", "Full Stack Developer",
  "ML Engineer", "Data Scientist", "DevOps Engineer",
  "Product Manager", "System Design", "iOS Developer", "Android Developer",
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function LandingPage() {
  const { user, signInAsGuest } = useAuth();
  const router = useRouter();

  const handleGuestStart = async () => {
    try {
      await signInAsGuest();
      router.push("/create");
    } catch {
      toast.error("Failed to start guest session. Please try again.");
    }
  };

  const ctaHref = user ? "/create" : undefined;

  return (
    <div className="min-h-screen gradient-bg overflow-hidden">
      {/* ── Navigation ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
        <div className="container-page h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <div className="w-8 h-8 rounded-lg bg-gradient-brand flex items-center justify-center">
              <Mic size={16} className="text-white" />
            </div>
            <span className="text-gradient">VoicePrep AI</span>
          </Link>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Link href="/dashboard" className="btn-ghost">
                  Dashboard
                </Link>
                <Link href="/create" className="btn-primary py-2 px-4 text-sm">
                  New Interview
                </Link>
              </>
            ) : (
              <>
                <Link href="/login" className="btn-ghost">
                  Sign In
                </Link>
                <Link href="/register" className="btn-primary py-2 px-4 text-sm">
                  Get Started Free
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="pt-32 pb-20 container-page text-center relative">
        {/* Background orbs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-brand-900/20 rounded-full blur-3xl pointer-events-none" />

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative z-10"
        >
          <motion.div variants={itemVariants} className="mb-6">
            <span className="badge badge-brand text-sm px-4 py-2">
              <Zap size={14} />
              Powered by Vapi AI + Google Gemini
            </span>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-5xl md:text-7xl font-bold leading-tight mb-6"
          >
            Ace Every Interview
            <br />
            <span className="text-gradient">With AI Practice</span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Have real conversations with an AI interviewer. Get instant
            transcripts, personalized feedback, and a roadmap to your next
            offer — all in minutes.
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            {user ? (
              <Link href="/create" className="btn-primary text-lg px-8 py-4">
                Start New Interview
                <ArrowRight size={20} />
              </Link>
            ) : (
              <>
                <Link href="/register" className="btn-primary text-lg px-8 py-4">
                  Start Free — No Credit Card
                  <ArrowRight size={20} />
                </Link>
                <button
                  onClick={handleGuestStart}
                  className="btn-secondary text-base px-6 py-4"
                >
                  Try as Guest
                </button>
              </>
            )}
          </motion.div>

          <motion.p
            variants={itemVariants}
            className="mt-4 text-sm text-[var(--text-muted)]"
          >
            No setup required · First interview in under 2 minutes
          </motion.p>
        </motion.div>

        {/* ── Mock UI Preview ── */}
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.7, ease: "easeOut" }}
          className="mt-16 relative max-w-4xl mx-auto"
        >
          <div className="glass-card p-6 text-left">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/70" />
                <div className="w-3 h-3 rounded-full bg-amber-500/70" />
                <div className="w-3 h-3 rounded-full bg-green-500/70" />
              </div>
              <span className="text-xs text-[var(--text-muted)]">Live Interview — Senior React Engineer</span>
              <div className="ml-auto flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-xs text-red-400">LIVE</span>
              </div>
            </div>

            {/* Audio visualizer preview */}
            <div className="flex items-center justify-center gap-1 my-6 h-16">
              {Array.from({ length: 32 }).map((_, i) => (
                <div
                  key={i}
                  className="audio-bar active animate-wave-1"
                  style={{
                    height: `${Math.random() * 40 + 10}px`,
                    animationDelay: `${i * 0.04}s`,
                    animationDuration: `${0.8 + Math.random() * 0.6}s`,
                  }}
                />
              ))}
            </div>

            {/* Transcript preview */}
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-brand-600/30 border border-brand-500/30 flex items-center justify-center flex-shrink-0">
                  <Mic size={12} className="text-brand-300" />
                </div>
                <div className="glass rounded-lg rounded-tl-none p-3 flex-1">
                  <p className="text-sm text-[var(--text-secondary)]">
                    <span className="text-brand-300 font-medium">AI Interviewer: </span>
                    Can you explain the difference between useCallback and useMemo in React, and when you'd choose one over the other?
                  </p>
                </div>
              </div>
              <div className="flex gap-3 justify-end">
                <div className="glass rounded-lg rounded-tr-none p-3 max-w-[80%]">
                  <p className="text-sm text-[var(--text-secondary)]">
                    <span className="text-accent-green font-medium">You: </span>
                    Both are memoization hooks, but they serve different purposes. useCallback memoizes a function reference...
                  </p>
                </div>
                <div className="w-8 h-8 rounded-full bg-accent-green/20 border border-accent-green/30 flex items-center justify-center flex-shrink-0">
                  <Users size={12} className="text-accent-green" />
                </div>
              </div>
            </div>
          </div>

          {/* Glow under card */}
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-3/4 h-16 bg-brand-600/20 blur-2xl rounded-full" />
        </motion.div>
      </section>

      {/* ── Stats ── */}
      <section className="py-16 border-y border-white/5">
        <div className="container-page grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <div className="text-3xl md:text-4xl font-bold text-gradient mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-[var(--text-muted)]">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-24 container-page">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold mb-4"
          >
            Everything you need to
            <span className="text-gradient"> get hired</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-[var(--text-secondary)] max-w-xl mx-auto"
          >
            A complete end-to-end interview preparation platform built for
            modern engineers.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {FEATURES.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-8"
            >
              <div className="w-12 h-12 rounded-xl bg-brand-600/20 border border-brand-500/20 flex items-center justify-center mb-5">
                <feature.icon size={22} className="text-brand-300" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Roles Marquee ── */}
      <section className="py-12 overflow-hidden border-y border-white/5">
        <div className="flex gap-4 animate-marquee whitespace-nowrap">
          {[...ROLES, ...ROLES].map((role, i) => (
            <span
              key={i}
              className="badge badge-brand text-sm px-5 py-2 flex-shrink-0"
            >
              {role}
            </span>
          ))}
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-24 container-page">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">
            Loved by <span className="text-gradient">engineers</span>
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-7"
            >
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} size={16} className="fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-[var(--text-secondary)] leading-relaxed mb-6">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div>
                <div className="font-semibold text-sm">{t.name}</div>
                <div className="text-xs text-[var(--text-muted)]">{t.role}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24">
        <div className="container-page">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card p-12 text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-radial from-brand-900/30 to-transparent pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Shield size={20} className="text-accent-green" />
                <span className="text-sm text-accent-green font-medium">
                  Free to start · No credit card required
                </span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Ready to <span className="text-gradient">nail your next interview?</span>
              </h2>
              <p className="text-lg text-[var(--text-secondary)] mb-8 max-w-xl mx-auto">
                Join thousands of engineers who practice smarter with VoicePrep AI.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {user ? (
                  <Link href="/create" className="btn-primary text-lg px-8 py-4">
                    Start Interview Now
                    <ChevronRight size={20} />
                  </Link>
                ) : (
                  <>
                    <Link href="/register" className="btn-primary text-lg px-8 py-4">
                      Create Free Account
                      <ChevronRight size={20} />
                    </Link>
                    <button
                      onClick={handleGuestStart}
                      className="btn-secondary text-base px-6 py-4"
                    >
                      <Clock size={18} />
                      Try without signing up
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/5 py-10">
        <div className="container-page flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-bold">
            <div className="w-6 h-6 rounded-md bg-gradient-brand flex items-center justify-center">
              <Mic size={12} className="text-white" />
            </div>
            <span className="text-gradient">VoicePrep AI</span>
          </div>
          <p className="text-sm text-[var(--text-muted)]">
            © 2026 VoicePrep AI · Built with Vapi & Gemini
          </p>
          <div className="flex gap-4 text-sm">
            <Link href="/login" className="text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors">
              Sign In
            </Link>
            <Link href="/register" className="text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors">
              Register
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
