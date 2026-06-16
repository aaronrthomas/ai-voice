"use client";

import { Suspense, use, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mic, ArrowLeft, Loader2 } from "lucide-react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/components/auth/AuthProvider";
import VoiceAgent from "@/components/interview/VoiceAgent";
import type { Interview } from "@/types";

interface InterviewPageProps {
  params: Promise<{ id: string }>;
}

// Inner component using useSearchParams — must be inside Suspense
function InterviewContent({ interviewId }: { interviewId: string }) {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session") || "";
  const { user } = useAuth();

  const [interview, setInterview] = useState<Interview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!interviewId) return;

    const fetchInterview = async () => {
      try {
        const snap = await getDoc(doc(db, "interviews", interviewId));
        if (!snap.exists()) {
          setError("Interview not found.");
          return;
        }
        const data = snap.data();
        setInterview({
          id: snap.id,
          userId: data.userId,
          role: data.role,
          level: data.level,
          techStack: data.techStack || [],
          questionCount: data.questionCount,
          questions: data.questions || [],
          status: data.status,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        });
      } catch (err) {
        console.error(err);
        setError("Failed to load interview. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchInterview();
  }, [interviewId]);

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={40} className="animate-spin text-brand-400 mx-auto mb-4" />
          <p className="text-[var(--text-muted)]">Loading your interview...</p>
        </div>
      </div>
    );
  }

  if (error || !interview) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center glass-card p-8 max-w-md">
          <p className="text-red-400 mb-4">{error || "Interview not found."}</p>
          <Link href="/dashboard" className="btn-primary">Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
        <div className="container-page h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-brand flex items-center justify-center">
              <Mic size={16} className="text-white" />
            </div>
            <div>
              <span className="font-semibold text-sm text-gradient">{interview.role}</span>
              <span className="text-xs text-[var(--text-muted)] ml-2 capitalize">
                {interview.level}
              </span>
            </div>
          </div>
          <Link href="/dashboard" className="btn-ghost text-sm">
            <ArrowLeft size={14} />
            Exit
          </Link>
        </div>
      </nav>

      <div className="pt-24 pb-8 container-page h-screen flex flex-col">
        <VoiceAgent
          interviewId={interviewId}
          sessionId={sessionId}
          interview={interview}
        />
      </div>
    </div>
  );
}

export default function InterviewPage({ params }: InterviewPageProps) {
  const { id: interviewId } = use(params);

  return (
    <Suspense fallback={
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <Loader2 size={40} className="animate-spin text-brand-400" />
      </div>
    }>
      <InterviewContent interviewId={interviewId} />
    </Suspense>
  );
}
