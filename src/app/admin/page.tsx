"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Mic,
  Plus,
  Users,
  ClipboardList,
  ToggleLeft,
  ToggleRight,
  Loader2,
  Shield,
  Copy,
  Check,
  ExternalLink,
  Pencil,
} from "lucide-react";
import { collection, query, where, getDocs, doc, updateDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/components/auth/AuthProvider";
import toast from "react-hot-toast";
import type { InterviewTemplate } from "@/types";

export default function AdminDashboard() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const [templates, setTemplates] = useState<InterviewTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [granting, setGranting] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.replace("/login"); return; }
    if (!isAdmin) { setLoading(false); return; } // show setup screen, stop spinner

    const fetchTemplates = async () => {
      try {
        const q = query(
          collection(db, "interviewTemplates"),
          where("adminId", "==", user.uid)
        );
        const snap = await getDocs(q);
        const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() } as InterviewTemplate));
        // Sort client-side to avoid requiring a composite Firestore index
        docs.sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1));
        setTemplates(docs);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load templates.");
      } finally {
        setLoading(false);
      }
    };
    fetchTemplates();
  }, [authLoading, user, isAdmin, router]);

  const toggleStatus = async (template: InterviewTemplate) => {
    const newStatus = template.status === "active" ? "inactive" : "active";
    try {
      await updateDoc(doc(db, "interviewTemplates", template.id), { status: newStatus });
      setTemplates((prev) =>
        prev.map((t) => (t.id === template.id ? { ...t, status: newStatus } : t))
      );
      toast.success(`Template ${newStatus === "active" ? "activated" : "deactivated"}`);
    } catch {
      toast.error("Failed to update template.");
    }
  };

  const copyLink = (templateId: string) => {
    const url = `${window.location.origin}/apply/${templateId}`;
    navigator.clipboard.writeText(url);
    setCopiedId(templateId);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success("Link copied!");
  };

  const grantAdminAccess = async () => {
    if (!user) return;
    setGranting(true);
    try {
      await setDoc(doc(db, "admins", user.uid), {
        uid: user.uid,
        email: user.email,
        grantedAt: serverTimestamp(),
      });
      toast.success("Admin access granted! Reloading...");
      setTimeout(() => window.location.reload(), 1000);
    } catch (err) {
      console.error(err);
      toast.error("Failed to grant admin access.");
      setGranting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <Loader2 size={40} className="animate-spin text-brand-400" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
        <div className="glass-card p-10 max-w-md w-full text-center">
          <div className="w-14 h-14 rounded-2xl bg-brand-600/20 flex items-center justify-center mx-auto mb-5">
            <Shield size={28} className="text-brand-300" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Admin Setup</h2>
          <p className="text-[var(--text-secondary)] text-sm mb-6">
            Click below to grant your account admin access. This only needs to be done once.
          </p>

          {user?.email && (
            <div className="mb-6 p-3 bg-surface-2 rounded-xl border border-[var(--border-subtle)] text-left">
              <p className="text-xs text-[var(--text-muted)] mb-1">Granting admin to:</p>
              <code className="text-brand-200 font-mono text-sm">{user.email}</code>
            </div>
          )}

          <button
            onClick={grantAdminAccess}
            disabled={granting}
            className="btn-primary w-full py-3 text-base disabled:opacity-50"
          >
            {granting ? (
              <span className="flex items-center gap-2 justify-center">
                <Loader2 size={16} className="animate-spin" />
                Granting access...
              </span>
            ) : (
              <span className="flex items-center gap-2 justify-center">
                <Shield size={16} />
                Grant Admin Access
              </span>
            )}
          </button>

          <p className="text-xs text-[var(--text-muted)] mt-4">
            This writes your user ID to Firestore. Only do this on your own account.
          </p>
        </div>
      </div>
    );
  }

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
            <Link href="/dashboard" className="btn-ghost text-sm">
              My Dashboard
            </Link>
          </div>
        </div>
      </nav>

      <div className="pt-24 pb-16 container-page max-w-5xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold mb-1">
              Admin <span className="text-gradient">Panel</span>
            </h1>
            <p className="text-[var(--text-secondary)]">
              Create interview templates and share links with applicants
            </p>
          </div>
          <Link href="/admin/templates/new" className="btn-primary">
            <Plus size={16} />
            New Template
          </Link>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
          {[
            { label: "Templates", value: templates.length, icon: ClipboardList },
            {
              label: "Active",
              value: templates.filter((t) => t.status === "active").length,
              icon: ToggleRight,
            },
            {
              label: "Total Applicants",
              value: templates.reduce((s, t) => s + (t.applicantCount || 0), 0),
              icon: Users,
            },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="glass-card p-5">
              <Icon size={18} className="text-brand-400 mb-2" />
              <div className="text-2xl font-bold">{value}</div>
              <div className="text-xs text-[var(--text-muted)]">{label}</div>
            </div>
          ))}
        </div>

        {/* Templates list */}
        {templates.length === 0 ? (
          <div className="glass-card p-16 text-center">
            <ClipboardList size={40} className="text-[var(--text-muted)] mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No templates yet</h3>
            <p className="text-[var(--text-muted)] mb-6 text-sm">
              Create your first interview template to start sending links to applicants.
            </p>
            <Link href="/admin/templates/new" className="btn-primary">
              <Plus size={16} />
              Create Template
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {templates.map((t, i) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card p-5 flex flex-col sm:flex-row sm:items-center gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold truncate">{t.title}</h3>
                    <span
                      className={`badge text-[10px] px-2 py-0.5 flex-shrink-0 ${
                        t.status === "active" ? "badge-green" : "text-[var(--text-muted)] border border-[var(--border-default)]"
                      }`}
                    >
                      {t.status}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--text-muted)] mb-2">
                    {t.role} · {t.level} · {t.questions.length} questions
                  </p>
                  <div className="flex items-center gap-4 text-xs text-[var(--text-muted)]">
                    <span className="flex items-center gap-1">
                      <Users size={11} />
                      {t.applicantCount || 0} applicants
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* Toggle active */}
                  <button
                    onClick={() => toggleStatus(t)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                      t.status === "active"
                        ? "bg-accent-green/10 border-accent-green/30 text-accent-green"
                        : "bg-surface-3 border-[var(--border-default)] text-[var(--text-muted)]"
                    }`}
                    title={t.status === "active" ? "Deactivate" : "Activate"}
                  >
                    {t.status === "active" ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                    {t.status === "active" ? "Active" : "Inactive"}
                  </button>

                  {/* Edit */}
                  <Link
                    href={`/admin/templates/${t.id}/edit`}
                    className="w-8 h-8 rounded-lg bg-surface-3 border border-[var(--border-default)] flex items-center justify-center text-[var(--text-muted)] hover:text-brand-300 transition-colors"
                    title="Edit template"
                  >
                    <Pencil size={14} />
                  </Link>

                  {/* Copy link */}
                  <button
                    onClick={() => copyLink(t.id)}
                    className="w-8 h-8 rounded-lg bg-surface-3 border border-[var(--border-default)] flex items-center justify-center text-[var(--text-muted)] hover:text-brand-300 transition-colors"
                    title="Copy applicant link"
                  >
                    {copiedId === t.id ? <Check size={14} className="text-accent-green" /> : <Copy size={14} />}
                  </button>

                  {/* View results */}
                  <Link
                    href={`/admin/templates/${t.id}`}
                    className="w-8 h-8 rounded-lg bg-surface-3 border border-[var(--border-default)] flex items-center justify-center text-[var(--text-muted)] hover:text-brand-300 transition-colors"
                    title="View applicant results"
                  >
                    <ExternalLink size={14} />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
