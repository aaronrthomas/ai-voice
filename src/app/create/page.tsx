import type { Metadata } from "next";
import Link from "next/link";
import { Mic, ArrowLeft } from "lucide-react";
import InterviewWizard from "@/components/creation/InterviewWizard";

export const metadata: Metadata = {
  title: "Create Interview",
};

export default function CreatePage() {
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
          <Link href="/dashboard" className="btn-ghost text-sm">
            <ArrowLeft size={16} />
            Dashboard
          </Link>
        </div>
      </nav>

      <div className="pt-28 pb-16 container-page">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-3">
            Create Your <span className="text-gradient">Interview</span>
          </h1>
          <p className="text-[var(--text-secondary)] max-w-lg mx-auto">
            Answer a few quick questions and we&apos;ll generate a tailored interview
            just for you — ready to go in under 60 seconds.
          </p>
        </div>

        <InterviewWizard />
      </div>
    </div>
  );
}
