"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Mic, Mail, Lock, Eye, EyeOff, Chrome, User, ArrowLeft } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const { signUp, signInWithGoogle, signInAsGuest } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handle = async (fn: () => Promise<void>, setL: (v: boolean) => void) => {
    setL(true);
    try {
      await fn();
      toast.success("Account created! Let&apos;s practice.");
      router.push("/create");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      toast.error(
        msg.includes("email-already-in-use")
          ? "That email is already registered. Try signing in."
          : msg.includes("weak-password")
          ? "Password must be at least 6 characters."
          : "Registration failed. Please try again."
      );
    } finally {
      setL(false);
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    handle(() => signUp(name, email, password), setLoading);
  };

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-brand-900/20 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative"
      >
        <Link href="/" className="flex items-center gap-2 justify-center mb-8 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-brand flex items-center justify-center group-hover:shadow-glow transition-shadow">
            <Mic size={18} className="text-white" />
          </div>
          <span className="text-xl font-bold text-gradient">VoicePrep AI</span>
        </Link>

        <div className="glass-card p-8">
          <h1 className="text-2xl font-bold mb-1">Create your account</h1>
          <p className="text-[var(--text-secondary)] text-sm mb-7">
            Free forever · No credit card required
          </p>

          <button
            onClick={() => handle(signInWithGoogle, setGoogleLoading)}
            disabled={googleLoading}
            className="btn-secondary w-full mb-4"
            id="google-register-btn"
          >
            <Chrome size={18} />
            {googleLoading ? "Connecting..." : "Continue with Google"}
          </button>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-[var(--border-default)]" />
            <span className="text-xs text-[var(--text-muted)]">or</span>
            <div className="flex-1 h-px bg-[var(--border-default)]" />
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5 text-[var(--text-secondary)]">
                Full Name
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  type="text"
                  id="register-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Smith"
                  required
                  className="input-field pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5 text-[var(--text-secondary)]">
                Email
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  type="email"
                  id="register-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="input-field pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5 text-[var(--text-secondary)]">
                Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  type={showPw ? "text" : "password"}
                  id="register-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  required
                  minLength={6}
                  className="input-field pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              id="register-submit-btn"
              className="btn-primary w-full py-3"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <p className="text-xs text-[var(--text-muted)] text-center mt-4">
            By signing up you agree to our Terms of Service.
          </p>
        </div>

        <p className="text-center text-sm text-[var(--text-muted)] mt-5">
          Already have an account?{" "}
          <Link href="/login" className="text-brand-300 hover:text-brand-200 font-medium transition-colors">
            Sign in
          </Link>
        </p>

        <Link href="/" className="flex items-center gap-1.5 justify-center mt-4 text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors">
          <ArrowLeft size={12} />
          Back to home
        </Link>
      </motion.div>
    </div>
  );
}
