"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { ThemedLogo } from "@/app/components/ThemedLogo";
import { ThemeToggle } from "@/app/components/ThemeToggle";
import Link from "next/link";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"verifying" | "ready" | "success" | "error">("verifying");
  const [errorMsg, setErrorMsg] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ password: "", confirm: "" });
  const oobCode = searchParams.get("oobCode") ?? "";

  // Verify the reset code first
  useEffect(() => {
    if (!oobCode) {
      setErrorMsg("Invalid or missing reset link.");
      setStatus("error");
      return;
    }

    verifyPasswordResetCode(auth, oobCode)
      .then((email) => {
        setEmail(email);
        setStatus("ready");
      })
      .catch((err) => {
        switch (err?.code) {
          case "auth/expired-action-code":
            setErrorMsg("This reset link has expired. Please request a new one.");
            break;
          case "auth/invalid-action-code":
            setErrorMsg("This link is invalid or has already been used.");
            break;
          default:
            setErrorMsg("Could not verify the reset link. Please try again.");
        }
        setStatus("error");
      });
  }, [oobCode]);

  const handleReset = async () => {
    if (!form.password || !form.confirm) return;
    if (form.password !== form.confirm) {
      setErrorMsg("Passwords do not match.");
      return;
    }
    if (form.password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }

    setErrorMsg("");
    setLoading(true);
    try {
      await confirmPasswordReset(auth, oobCode, form.password);
      setStatus("success");
    } catch (err: any) {
      switch (err?.code) {
        case "auth/expired-action-code":
          setErrorMsg("This reset link has expired. Please request a new one.");
          break;
        case "auth/weak-password":
          setErrorMsg("Password must be at least 6 characters.");
          break;
        default:
          setErrorMsg("Failed to reset password. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="w-full border-b border-border">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/"><ThemedLogo /></Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-sm">

          {/* Verifying code */}
          {status === "verifying" && (
            <div className="text-center">
              <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto mb-4" />
              <h1 className="text-xl font-bold mb-2">Checking reset link…</h1>
              <p className="text-sm text-foreground-muted">Please wait a moment.</p>
            </div>
          )}

          {/* Ready to reset */}
          {status === "ready" && (
            <>
              <div className="mb-8">
                <h1 className="text-2xl font-bold tracking-tight mb-1">Reset password</h1>
                <p className="text-sm text-foreground-muted">
                  Setting a new password for{" "}
                  <span className="text-foreground font-medium">{email}</span>
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium" htmlFor="password">New password</label>
                  <input
                    id="password"
                    type="password"
                    placeholder="Min. 6 characters"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg border border-border bg-surface
                               text-foreground placeholder:text-foreground-muted text-sm
                               focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
                               transition-colors duration-150"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium" htmlFor="confirm">Confirm password</label>
                  <input
                    id="confirm"
                    type="password"
                    placeholder="••••••••"
                    value={form.confirm}
                    onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                    onKeyDown={(e) => e.key === "Enter" && handleReset()}
                    className="w-full px-3 py-2.5 rounded-lg border border-border bg-surface
                               text-foreground placeholder:text-foreground-muted text-sm
                               focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
                               transition-colors duration-150"
                  />
                </div>

                {errorMsg && (
                  <p className="text-sm text-error bg-error/10 border border-error/20 rounded-lg px-3 py-2">
                    {errorMsg}
                  </p>
                )}

                <button
                  onClick={handleReset}
                  disabled={loading}
                  className="w-full py-2.5 rounded-lg bg-primary hover:bg-primary-dark text-white
                             font-semibold text-sm transition-colors duration-200
                             disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Resetting…" : "Reset password"}
                </button>
              </div>
            </>
          )}

          {/* Success */}
          {status === "success" && (
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-success/15 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-6 h-6 text-success" />
              </div>
              <h1 className="text-xl font-bold mb-2">Password reset!</h1>
              <p className="text-sm text-foreground-muted mb-6">
                Your password has been updated. You can now sign in with your new password.
              </p>
              <Link
                href="/auth/login"
                className="inline-block px-6 py-2.5 rounded-lg bg-primary hover:bg-primary-dark
                           text-white text-sm font-semibold transition-colors duration-200"
              >
                Sign in
              </Link>
            </div>
          )}

          {/* Error */}
          {status === "error" && (
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-error/15 flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-6 h-6 text-error" />
              </div>
              <h1 className="text-xl font-bold mb-2">Link invalid</h1>
              <p className="text-sm text-foreground-muted mb-6">{errorMsg}</p>
              <Link
                href="/auth/forgot-password"
                className="inline-block px-6 py-2.5 rounded-lg bg-primary hover:bg-primary-dark
                           text-white text-sm font-semibold transition-colors duration-200"
              >
                Request new link
              </Link>
            </div>
          )}

        </div>
      </main>

      <footer className="border-t border-border">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-center text-xs text-foreground-muted">
          © {new Date().getFullYear()} DoIt. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
