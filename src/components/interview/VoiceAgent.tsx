"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic,
  MicOff,
  PhoneOff,
  ChevronRight,
  AlertCircle,
  Wifi,
} from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, updateDoc, serverTimestamp, getDoc } from "firebase/firestore";
import { useAuth } from "@/components/auth/AuthProvider";
import AudioVisualizer from "./AudioVisualizer";
import TranscriptPanel from "./TranscriptPanel";
import toast from "react-hot-toast";
import type { Interview, TranscriptMessage } from "@/types";

interface VoiceAgentProps {
  interviewId: string;
  sessionId: string;
  interview: Interview;
}

type CallStatus = "idle" | "connecting" | "active" | "muted" | "ending" | "ended";

export default function VoiceAgent({ interviewId, sessionId, interview }: VoiceAgentProps) {
  const { user } = useAuth();
  const router = useRouter();

  const [status, setStatus] = useState<CallStatus>("idle");
  const [transcript, setTranscript] = useState<TranscriptMessage[]>([]);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [vapiError, setVapiError] = useState<string | null>(null);
  const [vapiCallId, setVapiCallId] = useState<string | null>(null);

  const vapiRef = useRef<import("@vapi-ai/web").default | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const partialRef = useRef<{ [key: string]: string }>({});
  const msgCounterRef = useRef(0);

  const nextMsgId = () => `msg-${++msgCounterRef.current}`;

  // Format elapsed time
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // Start the timer
  const startTimer = useCallback(() => {
    timerRef.current = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Initialize Vapi and start call
  const startCall = useCallback(async () => {
    if (!process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY) {
      toast.error("Vapi API key not configured. Add NEXT_PUBLIC_VAPI_PUBLIC_KEY to .env.local");
      return;
    }

    setStatus("connecting");
    setVapiError(null);

    try {
      const { default: Vapi } = await import("@vapi-ai/web");
      const vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY!);
      vapiRef.current = vapi;

      // Build system prompt with interview context
      const questionsContext = interview.questions
        .map((q, i) => `${i + 1}. ${q.text}`)
        .join("\n");

      const systemPrompt = `You are an expert technical interviewer conducting a ${interview.level}-level interview for a ${interview.role} position.

Your interview has ${interview.questions.length} questions to cover:
${questionsContext}

Guidelines:
- Start with a brief, warm welcome and ask the first question
- Ask one question at a time, in order
- Use natural back-channeling ("I see", "That's interesting", "Good point")
- After each answer, provide a brief acknowledgment before moving to the next question
- Keep responses conversational and natural
- If an answer is incomplete, ask a relevant follow-up
- After the last question, thank the candidate and end the interview professionally
- Be encouraging but professional throughout`;

      // Event handlers
      vapi.on("call-start", () => {
        setStatus("active");
        startTimer();
        setVapiCallId(vapi as unknown as string); // Will be set by call-started event
        
        // Update session status in Firestore
        updateDoc(doc(db, "sessions", sessionId), {
          status: "in_progress",
          startedAt: new Date().toISOString(),
        }).catch(console.error);
      });

      vapi.on("call-end", () => {
        setStatus("ended");
        stopTimer();
        saveTranscriptAndRedirect();
      });

      vapi.on("speech-start", () => {
        setIsAISpeaking(true);
        setIsUserSpeaking(false);
      });

      vapi.on("speech-end", () => {
        setIsAISpeaking(false);
      });

      vapi.on("message", (message: import("@/types").VapiMessage) => {
        if (message.type === "transcript") {
          const isUser = message.role === "user";
          const isFinal = message.transcriptType === "final";
          const text = message.transcript || "";

          if (!text) return;

          if (isUser) {
            setIsUserSpeaking(!isFinal);
          }

          const speakerKey = message.role || "unknown";

          if (!isFinal) {
            // Update partial transcript in place
            partialRef.current[speakerKey] = text;
            setTranscript((prev) => {
              const last = prev[prev.length - 1];
              if (last && !last.isFinal && last.speaker === (isUser ? "user" : "ai")) {
                return [
                  ...prev.slice(0, -1),
                  { ...last, text },
                ];
              }
              return [
                ...prev,
                {
                  id: nextMsgId(),
                  speaker: isUser ? "user" : "ai",
                  text,
                  timestamp: elapsedSeconds * 1000,
                  isFinal: false,
                },
              ];
            });
          } else {
            // Finalize the message
            setTranscript((prev) => {
              const last = prev[prev.length - 1];
              if (last && !last.isFinal && last.speaker === (isUser ? "user" : "ai")) {
                return [
                  ...prev.slice(0, -1),
                  { ...last, text, isFinal: true },
                ];
              }
              return [
                ...prev,
                {
                  id: nextMsgId(),
                  speaker: isUser ? "user" : "ai",
                  text,
                  timestamp: elapsedSeconds * 1000,
                  isFinal: true,
                },
              ];
            });

            // Try to detect which question we're on
            const qIndex = interview.questions.findIndex((q) =>
              text.includes(q.text.substring(0, 30))
            );
            if (qIndex >= 0) {
              setCurrentQuestion(qIndex);
            }
          }
        }
      });

      vapi.on("error", (error: Error) => {
        console.error("Vapi error:", error);
        setVapiError(error.message || "A connection error occurred");
        setStatus("idle");
        stopTimer();
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await vapi.start({
        model: {
          provider: "openai",
          model: "gpt-4o-mini",
          messages: [{ role: "system", content: systemPrompt }],
        },
        voice: {
          provider: "11labs",
          voiceId: "paula",
        },
        transcriber: {
          provider: "deepgram",
          model: "nova-2",
          language: "en",
        },
        backchannelingEnabled: true,
        backgroundDenoisingEnabled: true,
        name: "VoicePrep AI Interviewer",
      } as any);
    } catch (err) {
      console.error("Failed to start Vapi call:", err);
      const msg = err instanceof Error ? err.message : "Failed to start interview";
      setVapiError(msg);
      setStatus("idle");
      toast.error(msg);
    }
  }, [interview, sessionId, startTimer, stopTimer, elapsedSeconds]);

  const toggleMute = useCallback(() => {
    if (!vapiRef.current) return;
    const isMuted = status === "muted";
    vapiRef.current.setMuted(!isMuted);
    setStatus(isMuted ? "active" : "muted");
    toast(isMuted ? "Microphone unmuted" : "Microphone muted", { icon: isMuted ? "🎤" : "🔇" });
  }, [status]);

  const endCall = useCallback(() => {
    if (!vapiRef.current) return;
    setStatus("ending");
    vapiRef.current.stop();
  }, []);

  const saveTranscriptAndRedirect = useCallback(async () => {
    if (!user || !sessionId) return;
    
    try {
      const finalTranscript = transcript.filter((m) => m.isFinal);
      
      await updateDoc(doc(db, "sessions", sessionId), {
        transcript: finalTranscript,
        durationSeconds: elapsedSeconds,
        status: "completed",
        feedbackStatus: "pending",
        endedAt: new Date().toISOString(),
        updatedAt: serverTimestamp(),
      });


      toast.success("Interview complete! Generating feedback...");

      // Await feedback generation before redirecting so it's ready when the page loads
      if (finalTranscript.length > 0) {
        try {
          const res = await fetch("/api/generate-feedback", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              transcript: finalTranscript,
              questions: interview.questions,
              role: interview.role,
              level: interview.level,
            }),
          });
          const data = await res.json();
          if (data.feedback) {
            const { addDoc, collection } = await import("firebase/firestore");
            const fbRef = await addDoc(collection(db, "feedback"), {
              ...data.feedback,
              sessionId,
              interviewId,
              userId: user.uid,
              createdAt: serverTimestamp(),
            });
            await updateDoc(doc(db, "sessions", sessionId), {
              feedbackStatus: "ready",
              feedbackId: fbRef.id,
            });
          }
        } catch (fbErr) {
          console.error("Feedback generation error:", fbErr);
          // Still redirect — feedback page has a manual regenerate button
        }
      }

      router.push(`/feedback/${sessionId}`);
    } catch (err) {
      console.error("Save error:", err);
      router.push("/dashboard");
    }
  }, [user, sessionId, transcript, elapsedSeconds, interview, interviewId, router]);

  useEffect(() => {
    return () => {
      stopTimer();
      if (vapiRef.current) {
        vapiRef.current.stop();
      }
    };
  }, [stopTimer]);

  const speakerMode =
    isAISpeaking ? "ai" : isUserSpeaking ? "user" : "idle";

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Top status bar */}
      <div className="glass-card p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`w-3 h-3 rounded-full ${
              status === "active" || status === "muted"
                ? "bg-red-500 animate-pulse"
                : status === "connecting"
                ? "bg-amber-500 animate-pulse"
                : status === "ended" || status === "ending"
                ? "bg-surface-4"
                : "bg-surface-4"
            }`}
          />
          <span className="text-sm font-medium">
            {status === "idle" && "Ready to start"}
            {status === "connecting" && "Connecting..."}
            {status === "active" && "Interview in progress"}
            {status === "muted" && "You are muted"}
            {status === "ending" && "Ending interview..."}
            {status === "ended" && "Interview complete"}
          </span>
          {(status === "active" || status === "muted") && (
            <span className="text-xs text-[var(--text-muted)] font-mono">
              {formatTime(elapsedSeconds)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[var(--text-muted)]">
            Q {Math.min(currentQuestion + 1, interview.questions.length)} / {interview.questions.length}
          </span>
          <div className="flex gap-1">
            {interview.questions.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i < currentQuestion
                    ? "bg-accent-green w-4"
                    : i === currentQuestion
                    ? "bg-brand-400 w-4"
                    : "bg-surface-4 w-1.5"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Main area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1">
        {/* Left: Visualizer + Controls */}
        <div className="glass-card p-6 flex flex-col items-center justify-between gap-6">
          {/* AI Avatar */}
          <div className="flex flex-col items-center gap-4 flex-1 justify-center">
            <motion.div
              animate={
                isAISpeaking
                  ? { scale: [1, 1.05, 1], transition: { repeat: Infinity, duration: 1.5 } }
                  : {}
              }
              className="relative"
            >
              <div
                className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl transition-all ${
                  isAISpeaking
                    ? "bg-brand-600/30 border-2 border-brand-400 shadow-glow"
                    : "bg-surface-2 border-2 border-[var(--border-default)]"
                }`}
              >
                🤖
              </div>
              {isAISpeaking && (
                <div className="absolute inset-0 rounded-full bg-brand-500/20 animate-ping" />
              )}
            </motion.div>

            <div className="text-center">
              <p className="font-semibold text-sm">AI Interviewer</p>
              <p className="text-xs text-[var(--text-muted)]">
                {interview.role} · {interview.level}
              </p>
            </div>

            {/* Waveform */}
            <AudioVisualizer
              isActive={status === "active" || status === "muted"}
              speaker={speakerMode}
              barCount={36}
            />
          </div>

          {/* Current question preview */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="w-full p-4 bg-surface-2 rounded-xl border border-[var(--border-subtle)]"
            >
              <p className="text-xs text-brand-400 font-medium mb-1">
                Current Question {currentQuestion + 1}
              </p>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed line-clamp-3">
                {interview.questions[currentQuestion]?.text}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Controls */}
          <div className="flex items-center gap-4">
            {status === "idle" && (
              <button
                id="start-call-btn"
                onClick={startCall}
                className="btn-primary px-8 py-3 text-base"
              >
                <Mic size={18} />
                Start Interview
              </button>
            )}

            {(status === "active" || status === "muted") && (
              <>
                <button
                  id="mute-btn"
                  onClick={toggleMute}
                  className={`w-12 h-12 rounded-full border flex items-center justify-center transition-all ${
                    status === "muted"
                      ? "bg-red-500/20 border-red-500/50 text-red-400"
                      : "bg-surface-2 border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-surface-3"
                  }`}
                >
                  {status === "muted" ? <MicOff size={18} /> : <Mic size={18} />}
                </button>

                <button
                  id="end-call-btn"
                  onClick={endCall}
                  className="btn-danger px-6 py-2.5"
                >
                  <PhoneOff size={16} />
                  End Interview
                </button>
              </>
            )}

            {status === "connecting" && (
              <div className="flex items-center gap-2 text-[var(--text-muted)]">
                <Wifi size={16} className="animate-pulse" />
                <span className="text-sm">Connecting to AI...</span>
              </div>
            )}

            {status === "ending" && (
              <div className="flex items-center gap-2 text-[var(--text-muted)]">
                <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                <span className="text-sm">Saving session...</span>
              </div>
            )}

            {status === "ended" && (
              <button
                onClick={() => router.push(`/feedback/${sessionId}`)}
                className="btn-primary px-6 py-2.5"
              >
                View Feedback
                <ChevronRight size={16} />
              </button>
            )}
          </div>

          {/* Error display */}
          {vapiError && (
            <div className="w-full p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-2">
              <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-red-300">Connection Error</p>
                <p className="text-xs text-red-400/80 mt-0.5">{vapiError}</p>
                {!process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY && (
                  <p className="text-xs text-red-400/60 mt-1">
                    Add NEXT_PUBLIC_VAPI_PUBLIC_KEY to .env.local to enable voice interviews.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right: Transcript */}
        <div className="glass-card overflow-hidden flex flex-col" style={{ minHeight: "400px" }}>
          <TranscriptPanel
            messages={transcript}
            isAISpeaking={isAISpeaking}
            isUserSpeaking={isUserSpeaking}
          />
        </div>
      </div>
    </div>
  );
}
