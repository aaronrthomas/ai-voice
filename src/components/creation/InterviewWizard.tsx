"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  ChevronLeft,
  Briefcase,
  BarChart2,
  Code2,
  Hash,
  CheckCircle2,
  Loader2,
  Sparkles,
  X,
  Pencil,
  Trash2,
  Plus,
  Check,
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import toast from "react-hot-toast";
import type { InterviewLevel, Question } from "@/types";

const LEVELS: { value: InterviewLevel; label: string; desc: string }[] = [
  { value: "junior", label: "Junior", desc: "0–2 years · Fundamentals focus" },
  { value: "mid", label: "Mid-Level", desc: "2–5 years · Applied skills" },
  { value: "senior", label: "Senior", desc: "5–8 years · Architecture & leadership" },
  { value: "staff", label: "Staff+", desc: "8+ years · Strategy & org impact" },
];

const TECH_OPTIONS = [
  "React", "Next.js", "TypeScript", "JavaScript", "Node.js", "Python",
  "Go", "Rust", "Java", "C++", "GraphQL", "REST API", "PostgreSQL",
  "MongoDB", "Redis", "Docker", "Kubernetes", "AWS", "GCP", "Azure",
  "System Design", "Algorithms", "Data Structures", "Machine Learning",
  "DevOps", "CI/CD", "Microservices", "React Native", "Flutter",
];

const COUNT_OPTIONS = [5, 8, 10, 12, 15];

const STEP_LABELS = ["Role", "Level", "Tech Stack", "Questions", "Review"];

interface WizardState {
  role: string;
  level: InterviewLevel;
  techStack: string[];
  count: number;
}

export default function InterviewWizard() {
  const { user } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [state, setState] = useState<WizardState>({
    role: "",
    level: "mid",
    techStack: [],
    count: 10,
  });
  const [customTech, setCustomTech] = useState("");
  const [generating, setGenerating] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [saving, setSaving] = useState(false);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editingText, setEditingText] = useState("");
  const [newQuestion, setNewQuestion] = useState("");
  const [showAddQuestion, setShowAddQuestion] = useState(false);

  const toggleTech = (tech: string) => {
    setState((prev) => ({
      ...prev,
      techStack: prev.techStack.includes(tech)
        ? prev.techStack.filter((t) => t !== tech)
        : [...prev.techStack, tech],
    }));
  };

  const addCustomTech = () => {
    const t = customTech.trim();
    if (t && !state.techStack.includes(t)) {
      setState((prev) => ({ ...prev, techStack: [...prev.techStack, t] }));
      setCustomTech("");
    }
  };

  const generateQuestions = async () => {
    setGenerating(true);
    setStep(4);
    try {
      const res = await fetch("/api/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: state.role,
          level: state.level,
          techStack: state.techStack,
          count: state.count,
        }),
      });
      const data = await res.json();
      setQuestions(data.questions || []);
    } catch {
      toast.error("Failed to generate questions. Using defaults.");
    } finally {
      setGenerating(false);
    }
  };

  const startEdit = (idx: number) => {
    setEditingIdx(idx);
    setEditingText(questions[idx].text);
  };

  const saveEdit = () => {
    if (editingIdx === null) return;
    const trimmed = editingText.trim();
    if (!trimmed) return;
    setQuestions((prev) =>
      prev.map((q, i) => (i === editingIdx ? { ...q, text: trimmed } : q))
    );
    setEditingIdx(null);
    setEditingText("");
  };

  const deleteQuestion = (idx: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== idx));
    if (editingIdx === idx) setEditingIdx(null);
  };

  const addCustomQuestion = () => {
    const trimmed = newQuestion.trim();
    if (!trimmed) return;
    const newQ: Question = {
      id: `custom-${Date.now()}`,
      text: trimmed,
      category: "Custom",
      difficulty: "medium",
    };
    setQuestions((prev) => [...prev, newQ]);
    setNewQuestion("");
    setShowAddQuestion(false);
  };

  const startInterview = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const interviewRef = await addDoc(collection(db, "interviews"), {
        userId: user.uid,
        role: state.role,
        level: state.level,
        techStack: state.techStack,
        questionCount: state.count,
        questions,
        status: "pending",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      const sessionRef = await addDoc(collection(db, "sessions"), {
        interviewId: interviewRef.id,
        userId: user.uid,
        transcript: [],
        durationSeconds: 0,
        status: "pending",
        feedbackStatus: "pending",
        startedAt: new Date().toISOString(),
      });

      toast.success("Interview ready! Starting now...");
      router.push(`/interview/${interviewRef.id}?session=${sessionRef.id}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to create interview. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const canNext = () => {
    if (step === 0) return state.role.trim().length >= 3;
    if (step === 1) return !!state.level;
    if (step === 2) return true;
    if (step === 3) return state.count >= 1;
    return false;
  };

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 40 : -40,
      opacity: 0,
    }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({
      x: dir < 0 ? 40 : -40,
      opacity: 0,
    }),
  };
  const [direction, setDirection] = useState(1);

  const goNext = () => {
    if (!canNext()) return;
    setDirection(1);
    if (step === 3) {
      generateQuestions();
    } else {
      setStep((s) => s + 1);
    }
  };

  const goBack = () => {
    setDirection(-1);
    setStep((s) => Math.max(0, s - 1));
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-10">
        {STEP_LABELS.map((label, i) => (
          <div key={label} className="flex items-center gap-2 flex-1">
            <div className="flex flex-col items-center gap-1 flex-shrink-0">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                  i < step
                    ? "bg-accent-green text-black"
                    : i === step
                    ? "bg-brand-600 text-white shadow-glow-sm"
                    : "bg-surface-3 text-[var(--text-muted)]"
                }`}
              >
                {i < step ? <CheckCircle2 size={16} /> : i + 1}
              </div>
              <span
                className={`text-[10px] font-medium hidden sm:block transition-colors ${
                  i === step ? "text-[var(--text-primary)]" : "text-[var(--text-muted)]"
                }`}
              >
                {label}
              </span>
            </div>
            {i < STEP_LABELS.length - 1 && (
              <div
                className={`flex-1 h-px transition-all duration-500 mb-4 ${
                  i < step ? "bg-accent-green/50" : "bg-[var(--border-default)]"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <AnimatePresence custom={direction} mode="wait">
        <motion.div
          key={step}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.25, ease: "easeInOut" }}
        >
          {/* Step 0: Role */}
          {step === 0 && (
            <div className="glass-card p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-brand-600/20 flex items-center justify-center">
                  <Briefcase size={20} className="text-brand-300" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">What role are you interviewing for?</h2>
                  <p className="text-sm text-[var(--text-muted)]">Be specific for better questions</p>
                </div>
              </div>
              <input
                type="text"
                id="wizard-role-input"
                value={state.role}
                onChange={(e) => setState((p) => ({ ...p, role: e.target.value }))}
                onKeyDown={(e) => e.key === "Enter" && goNext()}
                placeholder="e.g. Senior Frontend Engineer, ML Engineer, Product Manager..."
                className="input-field text-lg py-4"
                autoFocus
              />
              <div className="flex flex-wrap gap-2 mt-4">
                {["Frontend Engineer", "Backend Engineer", "Full Stack Developer", "ML Engineer", "DevOps Engineer", "Product Manager"].map(
                  (r) => (
                    <button
                      key={r}
                      onClick={() => setState((p) => ({ ...p, role: r }))}
                      className={`badge transition-all cursor-pointer ${
                        state.role === r ? "badge-brand" : "text-[var(--text-muted)] border border-[var(--border-default)] hover:border-[var(--border-strong)]"
                      }`}
                    >
                      {r}
                    </button>
                  )
                )}
              </div>
            </div>
          )}

          {/* Step 1: Level */}
          {step === 1 && (
            <div className="glass-card p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-brand-600/20 flex items-center justify-center">
                  <BarChart2 size={20} className="text-brand-300" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">What&apos;s your experience level?</h2>
                  <p className="text-sm text-[var(--text-muted)]">This calibrates question difficulty</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {LEVELS.map((lvl) => (
                  <button
                    key={lvl.value}
                    id={`level-${lvl.value}`}
                    onClick={() => setState((p) => ({ ...p, level: lvl.value }))}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      state.level === lvl.value
                        ? "bg-brand-600/20 border-brand-500/50 shadow-glow-sm"
                        : "bg-surface-2 border-[var(--border-default)] hover:border-[var(--border-strong)]"
                    }`}
                  >
                    <div className="font-semibold mb-1">{lvl.label}</div>
                    <div className="text-xs text-[var(--text-muted)]">{lvl.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Tech Stack */}
          {step === 2 && (
            <div className="glass-card p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-brand-600/20 flex items-center justify-center">
                  <Code2 size={20} className="text-brand-300" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Tech stack & topics</h2>
                  <p className="text-sm text-[var(--text-muted)]">
                    Select any that are relevant · or skip for general interview
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-5">
                {TECH_OPTIONS.map((tech) => (
                  <button
                    key={tech}
                    onClick={() => toggleTech(tech)}
                    className={`badge transition-all cursor-pointer ${
                      state.techStack.includes(tech)
                        ? "badge-brand"
                        : "text-[var(--text-muted)] border border-[var(--border-default)] hover:border-[var(--border-strong)]"
                    }`}
                  >
                    {tech}
                  </button>
                ))}
              </div>

              {state.techStack.length > 0 && (
                <div className="mb-4 p-3 bg-surface-2 rounded-xl">
                  <p className="text-xs text-[var(--text-muted)] mb-2">Selected ({state.techStack.length}):</p>
                  <div className="flex flex-wrap gap-1.5">
                    {state.techStack.map((t) => (
                      <span key={t} className="badge badge-brand text-xs flex items-center gap-1">
                        {t}
                        <button onClick={() => toggleTech(t)}>
                          <X size={10} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <input
                  type="text"
                  value={customTech}
                  onChange={(e) => setCustomTech(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addCustomTech()}
                  placeholder="Add custom technology..."
                  className="input-field text-sm"
                />
                <button onClick={addCustomTech} className="btn-secondary px-4 py-2 text-sm flex-shrink-0">
                  Add
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Count */}
          {step === 3 && (
            <div className="glass-card p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-brand-600/20 flex items-center justify-center">
                  <Hash size={20} className="text-brand-300" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">How many questions?</h2>
                  <p className="text-sm text-[var(--text-muted)]">
                    Each question takes ~2–3 minutes on average
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-5 gap-3 mb-6">
                {COUNT_OPTIONS.map((n) => (
                  <button
                    key={n}
                    id={`count-${n}`}
                    onClick={() => setState((p) => ({ ...p, count: n }))}
                    className={`py-4 rounded-xl border font-bold text-lg transition-all ${
                      state.count === n
                        ? "bg-brand-600/20 border-brand-500/50 text-brand-200 shadow-glow-sm"
                        : "bg-surface-2 border-[var(--border-default)] hover:border-[var(--border-strong)]"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-3 p-4 bg-surface-2 rounded-xl">
                <Sparkles size={16} className="text-accent-amber flex-shrink-0" />
                <p className="text-sm text-[var(--text-muted)]">
                  Estimated interview duration:{" "}
                  <span className="text-[var(--text-primary)] font-medium">
                    {state.count * 2}–{state.count * 3} minutes
                  </span>
                </p>
              </div>
            </div>
          )}

          {/* Step 4: Review / Loading */}
          {step === 4 && (
            <div className="glass-card p-8">
              {generating ? (
                <div className="text-center py-12">
                  <div className="relative w-20 h-20 mx-auto mb-6">
                    <div className="w-20 h-20 rounded-full bg-brand-600/20 flex items-center justify-center">
                      <Sparkles size={32} className="text-brand-300 animate-pulse-slow" />
                    </div>
                    <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-brand-500 animate-spin" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Crafting your interview...</h3>
                  <p className="text-[var(--text-muted)]">
                    AI is generating {state.count} tailored questions for a {state.level} {state.role}
                  </p>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-accent-green/20 flex items-center justify-center">
                      <CheckCircle2 size={20} className="text-accent-green" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">Interview ready!</h2>
                      <p className="text-sm text-[var(--text-muted)]">Review your {questions.length} questions below</p>
                    </div>
                  </div>

                  <div className="mb-6 grid grid-cols-3 gap-3 text-center">
                    <div className="p-3 bg-surface-2 rounded-xl">
                      <div className="font-semibold text-sm truncate">{state.role}</div>
                      <div className="text-xs text-[var(--text-muted)]">Role</div>
                    </div>
                    <div className="p-3 bg-surface-2 rounded-xl">
                      <div className="font-semibold text-sm capitalize">{state.level}</div>
                      <div className="text-xs text-[var(--text-muted)]">Level</div>
                    </div>
                    <div className="p-3 bg-surface-2 rounded-xl">
                      <div className="font-semibold text-sm">{questions.length} Q&apos;s</div>
                      <div className="text-xs text-[var(--text-muted)]">Questions</div>
                    </div>
                  </div>

                  <div className="space-y-3 max-h-72 overflow-y-auto pr-1 mb-4">
                    {questions.map((q, i) => (
                      <div key={q.id} className="group flex gap-3 p-3 bg-surface-2 rounded-xl border border-transparent hover:border-[var(--border-subtle)] transition-all">
                        <span className="text-xs font-bold text-brand-400 w-6 flex-shrink-0 pt-0.5">
                          {i + 1}.
                        </span>
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
                                className="input-field text-sm resize-none min-h-[60px]"
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
                            <>
                              <p className="text-sm leading-relaxed">{q.text}</p>
                              <div className="flex items-center gap-2 mt-1.5">
                                <span className="text-[10px] text-[var(--text-muted)]">{q.category}</span>
                                <span
                                  className={`badge text-[10px] px-1.5 py-0.5 ${
                                    q.difficulty === "hard"
                                      ? "badge-red"
                                      : q.difficulty === "medium"
                                      ? "badge-amber"
                                      : "badge-green"
                                  }`}
                                >
                                  {q.difficulty}
                                </span>
                              </div>
                            </>
                          )}
                        </div>
                        {editingIdx !== i && (
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                            <button
                              onClick={() => startEdit(i)}
                              className="w-7 h-7 rounded-lg bg-surface-3 flex items-center justify-center text-[var(--text-muted)] hover:text-brand-300 transition-colors"
                              title="Edit question"
                            >
                              <Pencil size={12} />
                            </button>
                            <button
                              onClick={() => deleteQuestion(i)}
                              className="w-7 h-7 rounded-lg bg-surface-3 flex items-center justify-center text-[var(--text-muted)] hover:text-red-400 transition-colors"
                              title="Delete question"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Add custom question */}
                  {showAddQuestion ? (
                    <div className="mb-4 p-3 bg-surface-2 rounded-xl border border-brand-500/30">
                      <textarea
                        autoFocus
                        value={newQuestion}
                        onChange={(e) => setNewQuestion(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); addCustomQuestion(); }
                          if (e.key === "Escape") { setShowAddQuestion(false); setNewQuestion(""); }
                        }}
                        placeholder="Type your custom question... (Enter to save, Esc to cancel)"
                        className="input-field text-sm resize-none w-full mb-2"
                        rows={2}
                      />
                      <div className="flex gap-2">
                        <button onClick={addCustomQuestion} disabled={!newQuestion.trim()} className="btn-primary py-1.5 px-3 text-xs gap-1 disabled:opacity-40">
                          <Check size={12} /> Add Question
                        </button>
                        <button onClick={() => { setShowAddQuestion(false); setNewQuestion(""); }} className="btn-ghost py-1.5 px-3 text-xs">
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowAddQuestion(true)}
                      className="btn-ghost w-full mb-4 text-sm border border-dashed border-[var(--border-default)] hover:border-brand-500/50 hover:text-brand-300"
                    >
                      <Plus size={14} />
                      Add your own question
                    </button>
                  )}

                  <button
                    id="start-interview-btn"
                    onClick={startInterview}
                    disabled={saving || questions.length === 0}
                    className="btn-primary w-full py-4 text-base"
                  >
                    {saving ? (
                      <span className="flex items-center gap-2">
                        <Loader2 size={18} className="animate-spin" />
                        Starting...
                      </span>
                    ) : (
                      <>
                        Start Live Interview
                        <ChevronRight size={18} />
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      {step < 4 && (
        <div className="flex justify-between mt-6">
          <button
            onClick={goBack}
            disabled={step === 0}
            className="btn-ghost disabled:opacity-30"
          >
            <ChevronLeft size={18} />
            Back
          </button>
          <button
            id="wizard-next-btn"
            onClick={goNext}
            disabled={!canNext()}
            className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
          >
            {step === 3 ? (
              <>
                <Sparkles size={16} />
                Generate Questions
              </>
            ) : (
              <>
                Next
                <ChevronRight size={18} />
              </>
            )}
          </button>
        </div>
      )}

      {step === 4 && !generating && (
        <button
          onClick={() => { setStep(3); setQuestions([]); }}
          className="btn-ghost w-full mt-4"
        >
          <ChevronLeft size={16} />
          Regenerate questions
        </button>
      )}
    </div>
  );
}
