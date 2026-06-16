"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Mic,
  Plus,
  Clock,
  Calendar,
  BarChart3,
  MessageSquare,
  ChevronRight,
  Loader2,
  LogOut,
  Trophy,
  Flame,
} from "lucide-react";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/components/auth/AuthProvider";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import type { Session } from "@/types";

interface SessionWithMeta extends Session {
  role?: string;
  level?: string;
}

const LEVEL_COLORS: Record<string, string> = {
  junior: "badge-green",
  mid: "badge-brand",
  senior: "badge-amber",
  staff: "badge-red",
};

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

function formatDuration(secs: number) {
  if (secs < 60) return `${secs}s`;
  return `${Math.floor(secs / 60)}m ${secs % 60}s`;
}

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [sessions, setSessions] = useState<SessionWithMeta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchSessions = async () => {
      try {
        const q = query(
          collection(db, "sessions"),
          where("userId", "==", user.uid),
          orderBy("startedAt", "desc")
        );
        const snap = await getDocs(q);
        const data: SessionWithMeta[] = [];

        for (const docSnap of snap.docs) {
          const s = docSnap.data();
          // Fetch interview data for role/level
          let role: string | undefined;
          let level: string | undefined;
          try {
            const { getDoc, doc } = await import("firebase/firestore");
            const iSnap = await getDoc(doc(db, "interviews", s.interviewId));
            if (iSnap.exists()) {
              role = iSnap.data().role;
              level = iSnap.data().level;
            }
          } catch {}

          data.push({
            id: docSnap.id,
            interviewId: s.interviewId,
            userId: s.userId,
            transcript: s.transcript || [],
            durationSeconds: s.durationSeconds || 0,
            status: s.status,
            feedbackStatus: s.feedbackStatus,
            feedbackId: s.feedbackId,
            startedAt: s.startedAt,
            endedAt: s.endedAt,
            role,
            level,
          });
        }

        setSessions(data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load sessions.");
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [user]);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const completedSessions = sessions.filter((s) => s.status === "completed");
  const totalMinutes = Math.floor(
    sessions.reduce((acc, s) => acc + (s.durationSeconds || 0), 0) / 60
  );
  const streak = Math.min(completedSessions.length, 7); // Simplified streak

  return (
    <div className="min-h-screen gradient-bg">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
        <div className="container-page h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <div className="w-8 h-8 rounded-lg bg-gradient-brand flex items-center justify-center">
              <Mic size={16} className="text-white" />
            </div>
            <span className="text-gradient">VoicePrep AI</span>
          </Link>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-sm text-[var(--text-muted)]">
              <div className="w-7 h-7 rounded-full bg-brand-600/30 flex items-center justify-center text-xs font-bold text-brand-300">
                {user?.displayName?.[0] || user?.email?.[0] || "G"}
              </div>
              {user?.displayName || user?.email || "Guest"}
              {user?.isAnonymous && (
                <span className="badge badge-amber text-[10px]">Guest</span>
              )}
            </div>
            <Link href="/create" className="btn-primary py-2 px-4 text-sm">
              <Plus size={16} />
              New Interview
            </Link>
            <button onClick={handleLogout} className="btn-ghost text-sm">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </nav>

      <div className="pt-24 pb-16 container-page">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-1">
            {user?.isAnonymous
              ? "Guest Dashboard"
              : `Welcome back${user?.displayName ? `, ${user.displayName.split(" ")[0]}` : ""}!`}
          </h1>
          <p className="text-[var(--text-secondary)]">
            {completedSessions.length > 0
              ? `You've completed ${completedSessions.length} interview${completedSessions.length !== 1 ? "s" : ""}. Keep it up!`
              : "Start your first interview to track your progress."}
          </p>
          {user?.isAnonymous && (
            <div className="mt-3 flex items-center gap-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
              <span className="text-amber-400 text-sm">
                💡 You&apos;re using a guest account. 
                <Link href="/register" className="underline ml-1 hover:text-amber-300">
                  Create a free account
                </Link>{" "}
                to save your progress permanently.
              </span>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: MessageSquare, label: "Total Interviews", value: sessions.length, color: "brand" },
            { icon: Trophy, label: "Completed", value: completedSessions.length, color: "green" },
            { icon: Clock, label: "Time Practiced", value: `${totalMinutes}m`, color: "amber" },
            { icon: Flame, label: "Day Streak", value: streak, color: "red" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-5"
            >
              <div
                className={`w-10 h-10 rounded-xl mb-3 flex items-center justify-center ${
                  stat.color === "brand"
                    ? "bg-brand-600/20"
                    : stat.color === "green"
                    ? "bg-accent-green/20"
                    : stat.color === "amber"
                    ? "bg-amber-500/20"
                    : "bg-red-500/20"
                }`}
              >
                <stat.icon
                  size={20}
                  className={
                    stat.color === "brand"
                      ? "text-brand-300"
                      : stat.color === "green"
                      ? "text-accent-green"
                      : stat.color === "amber"
                      ? "text-amber-400"
                      : "text-red-400"
                  }
                />
              </div>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-xs text-[var(--text-muted)] mt-0.5">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Sessions */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold">Interview History</h2>
          <Link href="/create" className="btn-ghost text-sm">
            <Plus size={14} />
            New
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-brand-400" />
          </div>
        ) : sessions.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-12 text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-brand-600/20 flex items-center justify-center mx-auto mb-4">
              <Mic size={28} className="text-brand-300" />
            </div>
            <h3 className="text-xl font-bold mb-2">No interviews yet</h3>
            <p className="text-[var(--text-secondary)] mb-6">
              Start your first AI mock interview to begin tracking your progress.
            </p>
            <Link href="/create" className="btn-primary">
              <Plus size={18} />
              Create First Interview
            </Link>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {sessions.map((session, i) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="glass-card p-5 flex flex-col gap-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm truncate">
                      {session.role || "Interview"}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      {session.level && (
                        <span className={`badge ${LEVEL_COLORS[session.level] || "badge-brand"} text-[10px]`}>
                          {session.level}
                        </span>
                      )}
                      <span
                        className={`badge text-[10px] ${
                          session.status === "completed"
                            ? "badge-green"
                            : session.status === "in_progress"
                            ? "badge-amber"
                            : "text-[var(--text-muted)] border border-[var(--border-default)]"
                        }`}
                      >
                        {session.status.replace("_", " ")}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-[var(--text-muted)]">
                  <span className="flex items-center gap-1">
                    <Calendar size={12} />
                    {formatDate(session.startedAt)}
                  </span>
                  {session.durationSeconds > 0 && (
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {formatDuration(session.durationSeconds)}
                    </span>
                  )}
                  {session.transcript?.length > 0 && (
                    <span className="flex items-center gap-1">
                      <MessageSquare size={12} />
                      {session.transcript.length} msgs
                    </span>
                  )}
                </div>

                <div className="flex gap-2 mt-auto">
                  {session.feedbackStatus === "ready" && session.feedbackId ? (
                    <Link
                      href={`/feedback/${session.id}`}
                      className="btn-primary flex-1 py-2 text-sm justify-center"
                    >
                      <BarChart3 size={14} />
                      View Feedback
                    </Link>
                  ) : session.status === "completed" ? (
                    <Link
                      href={`/feedback/${session.id}`}
                      className="btn-secondary flex-1 py-2 text-sm justify-center"
                    >
                      <BarChart3 size={14} />
                      {session.feedbackStatus === "generating" ? "Generating..." : "View Report"}
                    </Link>
                  ) : session.status === "pending" || session.status === "in_progress" ? (
                    <Link
                      href={`/interview/${session.interviewId}?session=${session.id}`}
                      className="btn-primary flex-1 py-2 text-sm justify-center"
                    >
                      <Mic size={14} />
                      {session.status === "in_progress" ? "Resume" : "Start"}
                    </Link>
                  ) : null}
                  <button className="btn-ghost px-3 py-2">
                    <ChevronRight size={14} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
