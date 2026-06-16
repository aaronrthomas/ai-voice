"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { TranscriptMessage } from "@/types";

interface TranscriptPanelProps {
  messages: TranscriptMessage[];
  isAISpeaking: boolean;
  isUserSpeaking: boolean;
}

export default function TranscriptPanel({
  messages,
  isAISpeaking,
  isUserSpeaking,
}: TranscriptPanelProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-subtle)]">
        <h3 className="text-sm font-semibold text-[var(--text-secondary)]">Live Transcript</h3>
        <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
          {isAISpeaking && (
            <span className="flex items-center gap-1.5 text-brand-300">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
              AI Speaking
            </span>
          )}
          {isUserSpeaking && (
            <span className="flex items-center gap-1.5 text-accent-green">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse" />
              You
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-12 text-[var(--text-muted)]">
            <p className="text-sm">Your conversation will appear here in real time.</p>
          </div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${msg.speaker === "user" ? "flex-row-reverse" : "flex-row"}`}
            >
              {/* Avatar */}
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                  msg.speaker === "ai"
                    ? "bg-brand-600/30 border border-brand-500/30 text-brand-300"
                    : "bg-accent-green/20 border border-accent-green/30 text-accent-green"
                }`}
              >
                {msg.speaker === "ai" ? "AI" : "ME"}
              </div>

              {/* Bubble */}
              <div
                className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  msg.speaker === "ai"
                    ? "bg-surface-2 border border-[var(--border-subtle)] rounded-tl-none text-[var(--text-secondary)]"
                    : "bg-brand-600/20 border border-brand-500/20 rounded-tr-none text-brand-100"
                } ${!msg.isFinal ? "opacity-70 italic" : ""}`}
              >
                {msg.text}
                {!msg.isFinal && (
                  <span className="ml-1 inline-flex gap-0.5">
                    <span className="w-1 h-1 rounded-full bg-current animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1 h-1 rounded-full bg-current animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1 h-1 rounded-full bg-current animate-bounce" style={{ animationDelay: "300ms" }} />
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        <div ref={bottomRef} />
      </div>
    </div>
  );
}
