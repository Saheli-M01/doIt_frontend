"use client";

import { useState } from "react";
import { ThemedLogo } from "@/app/components/ThemedLogo";
import { ThemeToggle } from "@/app/components/ThemeToggle";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    setError("");
    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setSent(true);
    } catch (err: any) {
      switch (err?.code) {
        case "auth/user-not-found":
          // Don't reveal if email exists — just show success
          setSent(true);
          break;
        case "auth/invalid-email":
          setError("Invalid email address.");
          break;
        default:
          setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="w-full border-b border-border">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/"><ThemedLogo /></Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-sm">
          {sent ? (
            /* ── Success state ── */
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-success/15 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-xl font-bold mb-2">Check your inbox</h1>
              <p className="text-sm text-foreground-muted mb-6">
                If an account exists for{" "}
                <span className="text-foreground font-medium">{email}</span>,
                a reset link has been sent. Check your spam folder too.
              </p>
              <Link
                href="/auth/login"
                className="text-sm text-primary hover:text-primary-dark font-medium transition-colors"
              >
                Back to sign in
              </Link>
            </div>
          ) : (
            /* ── Form state ── */
            <>
              <div className="mb-8">
                <Link
                  href="/auth/login"
                  className="inline-flex items-center gap-1.5 text-sm text-foreground-muted hover:text-foreground transition-colors mb-6"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to sign in
                </Link>
                <h1 className="text-2xl font-bold tracking-tight mb-1">Forgot password?</h1>
                <p className="text-sm text-foreground-muted">
                  Enter your email and we&apos;ll send you a reset link.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium" htmlFor="email">Email</label>
                  <input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                    className="w-full px-3 py-2.5 rounded-lg border border-border bg-surface
                               text-foreground placeholder:text-foreground-muted text-sm
                               focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
                               transition-colors duration-150"
                  />
                </div>

                {error && (
                  <p className="text-sm text-error bg-error/10 border border-error/20 rounded-lg px-3 py-2">
                    {error}
                  </p>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full py-2.5 rounded-lg bg-primary hover:bg-primary-dark text-white
                             font-semibold text-sm transition-colors duration-200
                             disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Sending…" : "Send reset link"}
                </button>
              </div>
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-center text-xs text-foreground-muted">
          © {new Date().getFullYear()} DoIt. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
