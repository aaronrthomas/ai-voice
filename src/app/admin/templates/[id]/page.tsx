"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Mic,
  ArrowLeft,
  Users,
  Copy,
  Check,
  Loader2,
  Shield,
  ExternalLink,
  Clock,
  Star,
} from "lucide-react";
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/components/auth/AuthProvider";
import toast from "react-hot-toast";
import type { InterviewTemplate, Session, Feedback } from "@/types";

interface ApplicantRow {
  session: Session;
  feedback: Feedback | null;
}

export default function TemplateResultsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: templateId } = use(params);
  const { user, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();

  const [template, setTemplate] = useState<InterviewTemplate | null>(null);
  const [applicants, setApplicants] = useState<ApplicantRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) router.replace("/dashboard");
  }, [user, isAdmin, authLoading, router]);

  useEffect(() => {
    if (!user || !isAdmin) return;
    const fetchData = async () => {
      try {
        // Load template
        const tSnap = await getDoc(doc(db, "interviewTemplates", templateId));
        if (!tSnap.exists()) { toast.error("Template not found"); return; }
        setTemplate({ id: tSnap.id, ...tSnap.data() } as InterviewTemplate);

        // Load sessions for this template
        const sQuery = query(
          collection(db, "sessions"),
          where("templateId", "==", templateId)
        );
        const sSnap = await getDocs(sQuery);
        const rows: ApplicantRow[] = await Promise.all(
          sSnap.docs.map(async (d) => {
            const session = { id: d.id, ...d.data() } as Session;
            let feedback: Feedback | null = null;
            if (session.feedbackId) {
              const fbSnap = await getDoc(doc(db, "feedback", session.feedbackId));
              if (fbSnap.exists()) feedback = { id: fbSnap.id, ...fbSnap.data() } as Feedback;
            }
            return { session, feedback };
          })
        );
        // Sort newest first client-side to avoid composite index requirement
        rows.sort((a, b) => (b.session.startedAt > a.session.startedAt ? 1 : -1));
        setApplicants(rows);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user, isAdmin, templateId]);

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/apply/${templateId}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Link copied!");
  };

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s}s`;
  };

  const scoreColor = (score: number) =>
    score >= 75 ? "text-accent-green" : score >= 50 ? "text-accent-amber" : "text-red-400";

  if (authLoading || loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <Loader2 size={40} className="animate-spin text-brand-400" />
      </div>
    );
  }

  if (!isAdmin || !template) return null;

  const applyUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/apply/${templateId}`;

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
            <span className="flex items-center gap-1.5 text-xs text-brand-300 bg-brand-600/20 px-3 py-1.5 rounded-full border border-brand-500/30">
              <Shield size={12} />
              Admin
            </span>
            <Link href="/admin" className="btn-ghost text-sm">
              <ArrowLeft size={14} />
              All Templates
            </Link>
          </div>
        </div>
      </nav>

      <div className="pt-24 pb-16 container-page max-w-5xl">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold mb-1">{template.title}</h1>
              <p className="text-[var(--text-secondary)] text-sm">
                {template.role} · {template.level} · {template.questions.length} questions
              </p>
            </div>

            {/* Shareable link box */}
            <div className="glass-card p-4 min-w-0 sm:max-w-sm">
              <p className="text-xs text-[var(--text-muted)] mb-2">Applicant link</p>
              <div className="flex items-center gap-2">
                <code className="text-xs text-brand-300 truncate flex-1 bg-surface-2 px-2 py-1.5 rounded-lg">
                  {applyUrl}
                </code>
                <button
                  onClick={copyLink}
                  className="w-8 h-8 rounded-lg bg-brand-600/20 border border-brand-500/30 flex items-center justify-center text-brand-300 hover:bg-brand-600/30 transition-colors flex-shrink-0"
                >
                  {copied ? <Check size={14} className="text-accent-green" /> : <Copy size={14} />}
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Applicants", value: applicants.length, icon: Users },
            {
              label: "Completed",
              value: applicants.filter((a) => a.session.status === "completed").length,
              icon: Check,
            },
            {
              label: "Avg Score",
              value: applicants.filter((a) => a.feedback).length
                ? Math.round(
                    applicants.reduce((s, a) => s + (a.feedback?.overallScore || 0), 0) /
                      applicants.filter((a) => a.feedback).length
                  ) + "%"
                : "—",
              icon: Star,
            },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="glass-card p-5">
              <Icon size={18} className="text-brand-400 mb-2" />
              <div className="text-2xl font-bold">{value}</div>
              <div className="text-xs text-[var(--text-muted)]">{label}</div>
            </div>
          ))}
        </div>

        {/* Applicants table */}
        {applicants.length === 0 ? (
          <div className="glass-card p-16 text-center">
            <Users size={40} className="text-[var(--text-muted)] mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No applicants yet</h3>
            <p className="text-[var(--text-muted)] text-sm mb-6">
              Share the link above with candidates to start collecting responses.
            </p>
            <button onClick={copyLink} className="btn-primary">
              <Copy size={16} />
              Copy Applicant Link
            </button>
          </div>
        ) : (
          <div className="glass-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border-subtle)]">
                  {["Applicant", "Status", "Score", "Duration", "Date", ""].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {applicants.map(({ session, feedback }, i) => (
                  <motion.tr
                    key={session.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    className="border-b border-[var(--border-subtle)] last:border-0 hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium">{session.applicantName || "Anonymous"}</div>
                      {session.applicantEmail && (
                        <div className="text-xs text-[var(--text-muted)]">{session.applicantEmail}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`badge text-[10px] px-2 py-0.5 ${
                          session.status === "completed"
                            ? "badge-green"
                            : session.status === "in_progress"
                            ? "badge-amber"
                            : "text-[var(--text-muted)] border border-[var(--border-default)]"
                        }`}
                      >
                        {session.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {feedback ? (
                        <span className={`font-bold ${scoreColor(feedback.overallScore)}`}>
                          {feedback.overallScore}%
                        </span>
                      ) : (
                        <span className="text-[var(--text-muted)]">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1 text-[var(--text-muted)]">
                        <Clock size={12} />
                        {session.durationSeconds > 0 ? formatDuration(session.durationSeconds) : "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[var(--text-muted)]">
                      {new Date(session.startedAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      {session.feedbackId && (
                        <Link
                          href={`/feedback/${session.id}`}
                          className="flex items-center gap-1 text-brand-300 hover:text-brand-200 text-xs transition-colors"
                        >
                          Report <ExternalLink size={11} />
                        </Link>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
