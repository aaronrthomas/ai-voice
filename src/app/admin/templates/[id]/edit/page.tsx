"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Mic, ArrowLeft, Plus, Trash2, Pencil, Check,
  Sparkles, Loader2, Shield, GripVertical, Save,
} from "lucide-react";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/components/auth/AuthProvider";
import toast from "react-hot-toast";
import type { InterviewLevel, Question, InterviewTemplate } from "@/types";

const LEVELS: { value: InterviewLevel; label: string }[] = [
  { value: "junior", label: "Junior" },
  { value: "mid", label: "Mid-Level" },
  { value: "senior", label: "Senior" },
  { value: "staff", label: "Staff+" },
];

export default function EditTemplatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: templateId } = use(params);
  const { user, isAdmin } = useAuth();
  const router = useRouter();

  // Loading state
  const [fetching, setFetching] = useState(true);

  // Form state
  const [title, setTitle] = useState("");
  const [role, setRole] = useState("");
  const [level, setLevel] = useState<InterviewLevel>("mid");
  const [description, setDescription] = useState("");
  const [techStack, setTechStack] = useState<string[]>([]);
  const [customTech, setCustomTech] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [newQ, setNewQ] = useState("");
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editingText, setEditingText] = useState("");
  const [aiGenerating, setAiGenerating] = useState(false);
  const [saving, setSaving] = useState(false);

  // Pre-fill from Firestore
  useEffect(() => {
    const fetch = async () => {
      try {
        const snap = await getDoc(doc(db, "interviewTemplates", templateId));
        if (!snap.exists()) { toast.error("Template not found"); router.push("/admin"); return; }
        const t = snap.data() as InterviewTemplate;
        setTitle(t.title || "");
        setRole(t.role || "");
        setLevel(t.level || "mid");
        setDescription(t.description || "");
        setTechStack(t.techStack || []);
        setQuestions(t.questions || []);
      } catch {
        toast.error("Failed to load template");
      } finally {
        setFetching(false);
      }
    };
    fetch();
  }, [templateId, router]);

  const addTech = () => {
    const t = customTech.trim();
    if (t && !techStack.includes(t)) { setTechStack((p) => [...p, t]); setCustomTech(""); }
  };

  const addQuestion = () => {
    const text = newQ.trim();
    if (!text) return;
    setQuestions((p) => [...p, { id: `q-${Date.now()}`, text, category: "Custom", difficulty: "medium" }]);
    setNewQ("");
  };

  const saveEdit = () => {
    if (editingIdx === null || !editingText.trim()) return;
    setQuestions((p) => p.map((q, i) => (i === editingIdx ? { ...q, text: editingText.trim() } : q)));
    setEditingIdx(null);
  };

  const deleteQuestion = (idx: number) => {
    setQuestions((p) => p.filter((_, i) => i !== idx));
    if (editingIdx === idx) setEditingIdx(null);
  };

  const generateWithAI = async () => {
    if (!role) { toast.error("Enter a role first"); return; }
    setAiGenerating(true);
    try {
      const res = await fetch("/api/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, level, techStack, count: 8 }),
      });
      const data = await res.json();
      if (data.questions?.length) {
        setQuestions((p) => [
          ...p,
          ...data.questions.map((q: Question) => ({ ...q, id: `ai-${Date.now()}-${Math.random()}` })),
        ]);
        toast.success(`Added ${data.questions.length} AI-generated questions`);
      }
    } catch { toast.error("AI generation failed"); }
    finally { setAiGenerating(false); }
  };

  const save = async () => {
    if (!user || !isAdmin) return;
    if (!title.trim()) { toast.error("Title is required"); return; }
    if (!role.trim()) { toast.error("Role is required"); return; }
    if (questions.length === 0) { toast.error("Add at least one question"); return; }

    setSaving(true);
    try {
      await updateDoc(doc(db, "interviewTemplates", templateId), {
        title: title.trim(),
        role: role.trim(),
        level,
        techStack,
        description: description.trim(),
        questions,
        updatedAt: serverTimestamp(),
      });
      toast.success("Template updated!");
      router.push(`/admin/templates/${templateId}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <p className="text-[var(--text-muted)]">Access denied.</p>
      </div>
    );
  }

  if (fetching) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <Loader2 size={36} className="animate-spin text-brand-400" />
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
            <Link href={`/admin/templates/${templateId}`} className="btn-ghost text-sm">
              <ArrowLeft size={14} />
              Back
            </Link>
          </div>
        </div>
      </nav>

      <div className="pt-24 pb-16 container-page max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold mb-1">
            Edit <span className="text-gradient">Template</span>
          </h1>
          <p className="text-[var(--text-secondary)] mb-8">
            Changes will apply to all future applicants using this link
          </p>

          <div className="space-y-6">
            {/* Basic Info */}
            <div className="glass-card p-6 space-y-4">
              <h2 className="font-semibold text-sm text-[var(--text-muted)] uppercase tracking-wider">
                Template Info
              </h2>
              <div>
                <label className="block text-sm font-medium mb-1.5 text-[var(--text-secondary)]">
                  Template Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Senior Frontend Engineer — Round 1"
                  className="input-field"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-[var(--text-secondary)]">
                    Role <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g. Frontend Engineer"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-[var(--text-secondary)]">
                    Level
                  </label>
                  <div className="flex gap-2">
                    {LEVELS.map((l) => (
                      <button
                        key={l.value}
                        onClick={() => setLevel(l.value)}
                        className={`flex-1 py-2 rounded-lg border text-xs font-medium transition-all ${
                          level === l.value
                            ? "bg-brand-600/20 border-brand-500/50 text-brand-200"
                            : "bg-surface-2 border-[var(--border-default)] text-[var(--text-muted)]"
                        }`}
                      >
                        {l.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5 text-[var(--text-secondary)]">
                  Description for Applicants
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Briefly describe this interview stage to your applicants..."
                  className="input-field resize-none"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5 text-[var(--text-secondary)]">
                  Tech Stack / Topics
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={customTech}
                    onChange={(e) => setCustomTech(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addTech()}
                    placeholder="e.g. React, Node.js..."
                    className="input-field text-sm"
                  />
                  <button onClick={addTech} className="btn-secondary px-4 text-sm flex-shrink-0">Add</button>
                </div>
                {techStack.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {techStack.map((t) => (
                      <span key={t} className="badge badge-brand text-xs flex items-center gap-1">
                        {t}
                        <button onClick={() => setTechStack((p) => p.filter((x) => x !== t))}>×</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Questions */}
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-sm text-[var(--text-muted)] uppercase tracking-wider">
                  Questions ({questions.length})
                </h2>
                <button
                  onClick={generateWithAI}
                  disabled={aiGenerating}
                  className="btn-ghost text-sm text-brand-300 hover:text-brand-200"
                >
                  {aiGenerating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                  AI Assist
                </button>
              </div>

              {questions.length > 0 && (
                <div className="space-y-2 mb-4">
                  {questions.map((q, i) => (
                    <div
                      key={q.id}
                      className="group flex gap-3 p-3 bg-surface-2 rounded-xl border border-transparent hover:border-[var(--border-subtle)] transition-all"
                    >
                      <GripVertical size={14} className="text-[var(--text-muted)] flex-shrink-0 mt-1 cursor-grab" />
                      <span className="text-xs font-bold text-brand-400 w-5 flex-shrink-0 pt-0.5">{i + 1}.</span>
                      <div className="flex-1 min-w-0">
                        {editingIdx === i ? (
                          <div className="flex flex-col gap-2">
                            <textarea
                              autoFocus
                              value={editingText}
                              onChange={(e) => setEditingText(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); saveEdit(); }
                                if (e.key === "Escape") setEditingIdx(null);
                              }}
                              className="input-field text-sm resize-none"
                              rows={2}
                            />
                            <div className="flex gap-2">
                              <button onClick={saveEdit} className="btn-primary py-1 px-3 text-xs gap-1">
                                <Check size={12} /> Save
                              </button>
                              <button onClick={() => setEditingIdx(null)} className="btn-ghost py-1 px-3 text-xs">
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm leading-relaxed">{q.text}</p>
                        )}
                      </div>
                      {editingIdx !== i && (
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                          <button
                            onClick={() => { setEditingIdx(i); setEditingText(q.text); }}
                            className="w-7 h-7 rounded-lg bg-surface-3 flex items-center justify-center text-[var(--text-muted)] hover:text-brand-300 transition-colors"
                          >
                            <Pencil size={12} />
                          </button>
                          <button
                            onClick={() => deleteQuestion(i)}
                            className="w-7 h-7 rounded-lg bg-surface-3 flex items-center justify-center text-[var(--text-muted)] hover:text-red-400 transition-colors"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <textarea
                  value={newQ}
                  onChange={(e) => setNewQ(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); addQuestion(); } }}
                  placeholder="Type a question and press Enter..."
                  className="input-field text-sm resize-none flex-1"
                  rows={2}
                />
                <button
                  onClick={addQuestion}
                  disabled={!newQ.trim()}
                  className="btn-primary px-4 flex-shrink-0 self-stretch disabled:opacity-40"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Save */}
            <button
              onClick={save}
              disabled={saving || !title || !role || questions.length === 0}
              className="btn-primary w-full py-4 text-base disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {saving ? (
                <span className="flex items-center gap-2">
                  <Loader2 size={18} className="animate-spin" />
                  Saving...
                </span>
              ) : (
                <>
                  <Save size={18} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
