"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  Dumbbell,
  Clock,
  Star,
} from "lucide-react";
import type { Feedback } from "@/types";

interface ScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
}

function ScoreRing({ score, size = 120, strokeWidth = 10, color = "hsl(248 75% 55%)" }: ScoreRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedScore(score), 300);
    return () => clearTimeout(timer);
  }, [score]);

  const offset = circumference - (animatedScore / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id="score-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(248 75% 55%)" />
            <stop offset="100%" stopColor="hsl(280 65% 60%)" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(228 16% 14%)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={score >= 80 ? "hsl(158 64% 52%)" : score >= 60 ? color : "hsl(43 96% 56%)"}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="text-3xl font-bold leading-none"
        >
          {animatedScore}
        </motion.span>
        <span className="text-xs text-[var(--text-muted)]">/ 100</span>
      </div>
    </div>
  );
}

function MiniScore({ label, score }: { label: string; score: number }) {
  const [animated, setAnimated] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setAnimated(score), 400);
    return () => clearTimeout(t);
  }, [score]);

  const color =
    score >= 80
      ? "bg-accent-green"
      : score >= 60
      ? "bg-brand-500"
      : "bg-amber-500";

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-[var(--text-secondary)] w-28 flex-shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-surface-3 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${color} transition-all duration-1000 ease-out`}
          style={{ width: `${animated}%` }}
        />
      </div>
      <span className="text-sm font-semibold w-8 text-right">{score}</span>
    </div>
  );
}

interface QuestionCardProps {
  qf: Feedback["questionFeedback"][0];
  index: number;
}

function QuestionCard({ qf, index }: QuestionCardProps) {
  const [expanded, setExpanded] = useState(false);

  const scoreColor =
    qf.score >= 8
      ? "text-accent-green"
      : qf.score >= 6
      ? "text-brand-300"
      : "text-amber-400";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="glass-card p-5"
    >
      <button
        className="w-full text-left"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-brand-400">Q{index + 1}</span>
              <span className="text-xs text-[var(--text-muted)]">{qf.questionText.substring(0, 60)}...</span>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <span className={`text-xl font-bold ${scoreColor}`}>{qf.score}<span className="text-xs text-[var(--text-muted)]">/10</span></span>
            {expanded ? <ChevronUp size={16} className="text-[var(--text-muted)]" /> : <ChevronDown size={16} className="text-[var(--text-muted)]" />}
          </div>
        </div>
      </button>

      {expanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mt-4 space-y-4"
        >
          <div className="p-3 bg-surface-2 rounded-xl">
            <p className="text-sm font-medium mb-1">Full Question</p>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{qf.questionText}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-accent-green/5 border border-accent-green/15 rounded-xl">
              <p className="text-xs font-medium text-accent-green mb-2 flex items-center gap-1">
                <CheckCircle2 size={12} /> Strengths
              </p>
              <ul className="space-y-1">
                {qf.strengths.map((s, i) => (
                  <li key={i} className="text-xs text-[var(--text-secondary)]">• {s}</li>
                ))}
              </ul>
            </div>
            <div className="p-3 bg-amber-500/5 border border-amber-500/15 rounded-xl">
              <p className="text-xs font-medium text-amber-400 mb-2 flex items-center gap-1">
                <XCircle size={12} /> Improve
              </p>
              <ul className="space-y-1">
                {qf.weaknesses.map((w, i) => (
                  <li key={i} className="text-xs text-[var(--text-secondary)]">• {w}</li>
                ))}
              </ul>
            </div>
          </div>

          {qf.idealAnswer && (
            <div className="p-3 bg-brand-600/10 border border-brand-500/15 rounded-xl">
              <p className="text-xs font-medium text-brand-300 mb-1.5">Ideal Answer Outline</p>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{qf.idealAnswer}</p>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}

interface FeedbackReportProps {
  feedback: Feedback;
}

export default function FeedbackReport({ feedback }: FeedbackReportProps) {
  const scoreGrade =
    feedback.overallScore >= 90
      ? { label: "Exceptional", color: "text-accent-green", icon: "🏆" }
      : feedback.overallScore >= 80
      ? { label: "Strong", color: "text-accent-green", icon: "⭐" }
      : feedback.overallScore >= 70
      ? { label: "Good", color: "text-brand-300", icon: "👍" }
      : feedback.overallScore >= 60
      ? { label: "Developing", color: "text-amber-400", icon: "📈" }
      : { label: "Needs Work", color: "text-red-400", icon: "🔧" };

  return (
    <div className="space-y-6">
      {/* Hero score */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card p-8"
      >
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="flex flex-col items-center">
            <ScoreRing score={feedback.overallScore} size={140} strokeWidth={12} />
            <p className={`mt-3 text-lg font-bold ${scoreGrade.color}`}>
              {scoreGrade.icon} {scoreGrade.label}
            </p>
          </div>

          <div className="flex-1 space-y-4 w-full">
            <p className="text-[var(--text-secondary)] leading-relaxed text-sm">
              {feedback.summary}
            </p>
            <div className="space-y-3">
              <MiniScore label="Communication" score={feedback.communicationScore} />
              <MiniScore label="Technical" score={feedback.technicalScore} />
              <MiniScore label="Confidence" score={feedback.confidenceScore} />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Strengths & Weaknesses */}
      <div className="grid md:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6"
        >
          <h3 className="font-bold mb-4 flex items-center gap-2 text-accent-green">
            <TrendingUp size={18} />
            Top Strengths
          </h3>
          <ul className="space-y-3">
            {feedback.topStrengths.map((s, i) => (
              <li key={i} className="flex items-start gap-2">
                <Star size={14} className="text-accent-green flex-shrink-0 mt-0.5" />
                <span className="text-sm text-[var(--text-secondary)]">{s}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6"
        >
          <h3 className="font-bold mb-4 flex items-center gap-2 text-amber-400">
            <TrendingDown size={18} />
            Areas to Improve
          </h3>
          <ul className="space-y-3">
            {feedback.topWeaknesses.map((w, i) => (
              <li key={i} className="flex items-start gap-2">
                <Minus size={14} className="text-amber-400 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-[var(--text-secondary)]">{w}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>

      {/* Per-question feedback */}
      {feedback.questionFeedback?.length > 0 && (
        <div>
          <h3 className="font-bold text-lg mb-4">Question-by-Question Breakdown</h3>
          <div className="space-y-3">
            {feedback.questionFeedback.map((qf, i) => (
              <QuestionCard key={qf.questionId} qf={qf} index={i} />
            ))}
          </div>
        </div>
      )}

      {/* Practice exercises */}
      {feedback.practiceExercises?.length > 0 && (
        <div>
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Dumbbell size={20} className="text-brand-300" />
            Suggested Practice Exercises
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {feedback.practiceExercises.map((ex, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i }}
                className="glass-card p-5"
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <h4 className="font-semibold text-sm">{ex.title}</h4>
                  <span
                    className={`badge text-[10px] flex-shrink-0 ${
                      ex.difficulty === "hard"
                        ? "badge-red"
                        : ex.difficulty === "medium"
                        ? "badge-amber"
                        : "badge-green"
                    }`}
                  >
                    {ex.difficulty}
                  </span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-3">
                  {ex.description}
                </p>
                <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                  <Clock size={11} />
                  ~{ex.estimatedMinutes} min
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
