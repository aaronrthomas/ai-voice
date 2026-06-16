"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Loader2, User, Mail, ArrowRight, ShieldOff } from "lucide-react";
import { getDoc, doc, addDoc, collection, serverTimestamp, increment, updateDoc } from "firebase/firestore";
import { signInAnonymously } from "firebase/auth";
import { db, auth } from "@/lib/firebase";
import toast from "react-hot-toast";
import type { InterviewTemplate } from "@/types";
import VoiceAgent from "@/components/interview/VoiceAgent";

type Stage = "landing" | "starting" | "interview";

export default function ApplyPage({
  params,
}: {
  params: Promise<{ templateId: string }>;
}) {
  const { templateId } = use(params);
  const router = useRouter();

  const [template, setTemplate] = useState<InterviewTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [stage, setStage] = useState<Stage>("landing");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Interview state (set after starting)
  const [interviewId, setInterviewId] = useState("");
  const [sessionId, setSessionId] = useState("");

  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        const snap = await getDoc(doc(db, "interviewTemplates", templateId));
        if (!snap.exists()) {
          toast.error("Interview not found.");
          setLoading(false);
          return;
        }
        const data = { id: snap.id, ...snap.data() } as InterviewTemplate;
        if (data.status === "inactive") {
          setTemplate(null);
        } else {
          setTemplate(data);
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load interview.");
      } finally {
        setLoading(false);
      }
    };
    fetchTemplate();
  }, [templateId]);

  const startInterview = async () => {
    if (!name.trim()) { toast.error("Please enter your name"); return; }
    if (!template) return;
    setSubmitting(true);
    setStage("starting");
    try {
      // Sign in anonymously so Firebase auth works
      const { user } = await signInAnonymously(auth);

      // Create a Firestore interview doc from the template
      const interviewRef = await addDoc(collection(db, "interviews"), {
        userId: user.uid,
        templateId,
        role: template.role,
        level: template.level,
        techStack: template.techStack,
        questionCount: template.questions.length,
        questions: template.questions,
        status: "pending",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Create session with applicant identity
      const sessionRef = await addDoc(collection(db, "sessions"), {
        interviewId: interviewRef.id,
        userId: user.uid,
        templateId,
        applicantName: name.trim(),
        applicantEmail: email.trim() || null,
        transcript: [],
        durationSeconds: 0,
        status: "pending",
        feedbackStatus: "pending",
        startedAt: new Date().toISOString(),
      });

      // Increment applicant count on the template
      await updateDoc(doc(db, "interviewTemplates", templateId), {
        applicantCount: increment(1),
      });

      setInterviewId(interviewRef.id);
      setSessionId(sessionRef.id);
      setStage("interview");
    } catch (err) {
      console.error(err);
      toast.error("Failed to start interview. Please try again.");
      setStage("landing");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <Loader2 size={40} className="animate-spin text-brand-400" />
      </div>
    );
  }

  if (!template) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
        <div className="glass-card p-12 text-center max-w-sm">
          <ShieldOff size={40} className="text-[var(--text-muted)] mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Interview Unavailable</h2>
          <p className="text-[var(--text-muted)] text-sm">
            This interview link is no longer active. Please contact the organiser.
          </p>
        </div>
      </div>
    );
  }

  // Interview stage — reuse VoiceAgent
  if (stage === "interview" && interviewId && sessionId) {
    return (
      <div className="min-h-screen gradient-bg">
        <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
          <div className="container-page h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-brand flex items-center justify-center">
                <Mic size={16} className="text-white" />
              </div>
              <div>
                <span className="font-semibold text-sm text-gradient">{template.role}</span>
                <span className="text-xs text-[var(--text-muted)] ml-2 capitalize">{template.level}</span>
              </div>
            </div>
            <span className="text-xs text-[var(--text-muted)]">Interview · {name}</span>
          </div>
        </nav>
        <div className="pt-24 pb-8 container-page h-screen flex flex-col">
          <VoiceAgent
            interviewId={interviewId}
            sessionId={sessionId}
            interview={{
              id: interviewId,
              userId: "",
              role: template.role,
              level: template.level,
              techStack: template.techStack,
              questionCount: template.questions.length,
              questions: template.questions,
              status: "pending",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }}
          />
        </div>
      </div>
    );
  }

  // Landing stage
  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-brand-900/20 rounded-full blur-3xl pointer-events-none" />

      <AnimatePresence mode="wait">
        {stage === "starting" ? (
          <motion.div
            key="starting"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-12 text-center max-w-sm"
          >
            <div className="relative w-16 h-16 mx-auto mb-6">
              <div className="w-16 h-16 rounded-full bg-brand-600/20 flex items-center justify-center">
                <Mic size={28} className="text-brand-300" />
              </div>
              <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-brand-500 animate-spin" />
            </div>
            <h3 className="text-lg font-bold mb-2">Setting up your interview...</h3>
            <p className="text-sm text-[var(--text-muted)]">This only takes a moment.</p>
          </motion.div>
        ) : (
          <motion.div
            key="landing"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md"
          >
            {/* Logo */}
            <div className="flex items-center gap-2 justify-center mb-8">
              <div className="w-9 h-9 rounded-xl bg-gradient-brand flex items-center justify-center shadow-glow">
                <Mic size={18} className="text-white" />
              </div>
              <span className="text-xl font-bold text-gradient">VoicePrep AI</span>
            </div>

            <div className="glass-card p-8">
              {/* Interview info */}
              <div className="mb-6 pb-6 border-b border-[var(--border-subtle)]">
                <div className="flex items-center gap-2 mb-3">
                  <span className="badge badge-brand text-xs capitalize">{template.level}</span>
                  {template.techStack.slice(0, 3).map((t) => (
                    <span key={t} className="badge text-xs text-[var(--text-muted)] border border-[var(--border-default)]">
                      {t}
                    </span>
                  ))}
                </div>
                <h1 className="text-2xl font-bold mb-1">{template.role}</h1>
                <p className="text-sm text-[var(--text-secondary)]">
                  {template.description || `AI-powered voice interview · ${template.questions.length} questions`}
                </p>
              </div>

              {/* What to expect */}
              <div className="mb-6 space-y-2">
                {[
                  `${template.questions.length} questions covering ${template.role} skills`,
                  "Spoken interview — answer naturally out loud",
                  "AI analyses your responses and generates feedback",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                    <span className="text-brand-400 mt-0.5">→</span>
                    {item}
                  </div>
                ))}
              </div>

              {/* Identity form */}
              <div className="space-y-3 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-[var(--text-secondary)]">
                    Your Name <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && startInterview()}
                      placeholder="Your full name"
                      className="input-field pl-10"
                      autoFocus
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-[var(--text-secondary)]">
                    Email <span className="text-xs text-[var(--text-muted)]">(optional)</span>
                  </label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && startInterview()}
                      placeholder="you@example.com"
                      className="input-field pl-10"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={startInterview}
                disabled={submitting || !name.trim()}
                className="btn-primary w-full py-3 text-base disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Start Interview
                <ArrowRight size={18} />
              </button>

              <p className="text-center text-xs text-[var(--text-muted)] mt-4">
                No account needed · Your session is private
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
