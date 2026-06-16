"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Mic,
  ArrowLeft,
  Loader2,
  Plus,
  RefreshCw,
} from "lucide-react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import FeedbackReport from "@/components/feedback/FeedbackReport";
import type { Session, Feedback } from "@/types";
import toast from "react-hot-toast";

interface FeedbackPageProps {
  params: Promise<{ id: string }>;
}

export default function FeedbackPage({ params }: FeedbackPageProps) {
  const { id: sessionId } = use(params);
  const [session, setSession] = useState<Session | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [role, setRole] = useState<string>("Interview");

  useEffect(() => {
    if (!sessionId) return;

    const fetchData = async () => {
      try {
        const sessionSnap = await getDoc(doc(db, "sessions", sessionId));
        if (!sessionSnap.exists()) {
          setLoading(false);
          return;
        }

        const sessionData = sessionSnap.data() as Session;
        setSession({ ...sessionData, id: sessionSnap.id });

        // Get interview role
        try {
          const interviewSnap = await getDoc(doc(db, "interviews", sessionData.interviewId));
          if (interviewSnap.exists()) {
            setRole(interviewSnap.data().role);
          }
        } catch {}

        // Get feedback
        if (sessionData.feedbackId) {
          const fbSnap = await getDoc(doc(db, "feedback", sessionData.feedbackId));
          if (fbSnap.exists()) {
            setFeedback({ ...fbSnap.data() as Feedback, id: fbSnap.id });
          }
        } else if (sessionData.status === "completed" && sessionData.feedbackStatus !== "ready") {
          // Auto-generate feedback
          await generateFeedback(sessionData);
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load feedback.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [sessionId]);

  const generateFeedback = async (sessionData: Session) => {
    setGenerating(true);
    try {
      // Get interview questions
      const interviewSnap = await getDoc(doc(db, "interviews", sessionData.interviewId));
      if (!interviewSnap.exists()) return;

      const interview = interviewSnap.data();
      const res = await fetch("/api/generate-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript: sessionData.transcript || [],
          questions: interview.questions || [],
          role: interview.role,
          level: interview.level,
        }),
      });

      const data = await res.json();
      if (data.feedback) {
        const { addDoc, collection, updateDoc } = await import("firebase/firestore");
        const fbRef = await addDoc(collection(db, "feedback"), {
          ...data.feedback,
          sessionId,
          interviewId: sessionData.interviewId,
          userId: sessionData.userId,
          createdAt: new Date().toISOString(),
        });

        await updateDoc(doc(db, "sessions", sessionId), {
          feedbackStatus: "ready",
          feedbackId: fbRef.id,
        });

        const fbSnap = await getDoc(fbRef);
        if (fbSnap.exists()) {
          setFeedback({ ...fbSnap.data() as Feedback, id: fbRef.id });
        }
        toast.success("Feedback generated!");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate feedback.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-screen gradient-bg">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
        <div className="container-page h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold">
            <div className="w-8 h-8 rounded-lg bg-gradient-brand flex items-center justify-center">
              <Mic size={16} className="text-white" />
            </div>
            <span className="text-gradient">VoicePrep AI</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="btn-ghost text-sm">
              <ArrowLeft size={14} />
              Dashboard
            </Link>
            <Link href="/create" className="btn-primary py-2 px-4 text-sm">
              <Plus size={14} />
              New Interview
            </Link>
          </div>
        </div>
      </nav>

      <div className="pt-24 pb-16 container-page max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-1">
            Interview <span className="text-gradient">Feedback</span>
          </h1>
          <p className="text-[var(--text-secondary)]">{role}</p>
        </motion.div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 size={40} className="animate-spin text-brand-400" />
            <p className="text-[var(--text-muted)]">Loading your feedback...</p>
          </div>
        ) : generating ? (
          <div className="glass-card p-12 text-center">
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="w-20 h-20 rounded-full bg-brand-600/20 flex items-center justify-center">
                <Loader2 size={32} className="text-brand-300 animate-spin" />
              </div>
            </div>
            <h3 className="text-xl font-bold mb-2">Analyzing your interview...</h3>
            <p className="text-[var(--text-muted)]">
              AI is reviewing your responses and generating personalized feedback.
              This takes about 10–20 seconds.
            </p>
          </div>
        ) : !session ? (
          <div className="glass-card p-8 text-center">
            <p className="text-[var(--text-muted)] mb-4">Session not found.</p>
            <Link href="/dashboard" className="btn-primary">Back to Dashboard</Link>
          </div>
        ) : !feedback ? (
          <div className="glass-card p-8 text-center">
            <p className="text-[var(--text-secondary)] mb-6">
              {session.status === "completed"
                ? "Feedback is being generated..."
                : "This interview hasn't been completed yet."}
            </p>
            {session.status === "completed" && (
              <button
                onClick={() => generateFeedback(session)}
                className="btn-primary"
              >
                <RefreshCw size={16} />
                Generate Feedback
              </button>
            )}
            {session.status !== "completed" && (
              <Link href={`/interview/${session.interviewId}?session=${sessionId}`} className="btn-primary">
                <Mic size={16} />
                Complete Interview
              </Link>
            )}
          </div>
        ) : (
          <FeedbackReport feedback={feedback} />
        )}
      </div>
    </div>
  );
}
