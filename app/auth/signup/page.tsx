"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/app/context/UserContext";
import { ThemedLogo } from "@/app/components/ThemedLogo";
import { ThemeToggle } from "@/app/components/ThemeToggle";
import Link from "next/link";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

function getFirebaseErrorMessage(code: string): string {
  switch (code) {
    case "auth/email-already-in-use":
      return "An account with this email already exists.";
    case "auth/invalid-email":
      return "Invalid email address.";
    case "auth/weak-password":
      return "Password must be at least 6 characters.";
    case "auth/popup-closed-by-user":
      return "Google sign-in was cancelled.";
    default:
      return "Something went wrong. Please try again.";
  }
}

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const { user, setUser, isLoading } = useUser();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });

  useEffect(() => {
    if (!isLoading && user) router.push("/dashboard");
  }, [user, isLoading, router]);

  const saveAndRedirect = (firebaseUser: { uid: string; displayName: string | null; email: string | null }) => {
    const userData = {
      id: firebaseUser.uid,
      name: firebaseUser.displayName ?? firebaseUser.email ?? "User",
      email: firebaseUser.email ?? "",
    };
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const handleSignup = async () => {
    setError("");
    if (!form.name || !form.email || !form.password || !form.confirm) {
      setError("Please fill in all fields.");
      return;
    }
    if (form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const res = await createUserWithEmailAndPassword(auth, form.email, form.password);

      // Set display name
      await updateProfile(res.user, { displayName: form.name });

      // Register user with backend
      const baseUrl = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");
      await fetch(`${baseUrl}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          firebaseUid: res.user.uid,
        }),
      });

      // Send verification email
      await sendEmailVerification(res.user);

      // Sign out — user must verify email before logging in
      await auth.signOut();

      setEmailSent(true);
    } catch (err: any) {
      setError(getFirebaseErrorMessage(err?.code ?? ""));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setError("");
    setGoogleLoading(true);
    try {
      const res = await signInWithPopup(auth, googleProvider);
      const user = res.user;

      // Register/sync user with backend
      const baseUrl = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");
      await fetch(`${baseUrl}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: user.displayName,
          email: user.email,
          password: "google-login",
          firebaseUid: user.uid,
        }),
      });

      saveAndRedirect(user);
    } catch (err: any) {
      setError(getFirebaseErrorMessage(err?.code ?? ""));
    } finally {
      setGoogleLoading(false);
    }
  };

  if (isLoading || user) return null;

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="w-full border-b border-border">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/"><ThemedLogo /></Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-sm">

          {/* ── Email sent state ── */}
          {emailSent ? (
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-success/15 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-xl font-bold mb-2">Verify your email</h1>
              <p className="text-sm text-foreground-muted mb-6">
                We sent a verification link to{" "}
                <span className="text-foreground font-medium">{form.email}</span>.
                Click the link in the email, then sign in.
              </p>
              <Link
                href="/auth/login"
                className="inline-block px-5 py-2.5 rounded-lg bg-primary hover:bg-primary-dark
                           text-white text-sm font-semibold transition-colors duration-200"
              >
                Go to Sign in
              </Link>
            </div>
          ) : (
            /* ── Form state ── */
            <>
              <div className="mb-8 text-center">
                <h1 className="text-2xl font-bold tracking-tight mb-1">Create an account</h1>
                <p className="text-sm text-foreground-muted">Start managing your tasks with DoIt</p>
              </div>

              <div className="space-y-3">
                {/* Google */}
                <button
                  onClick={handleGoogleSignup}
                  disabled={googleLoading}
                  className="w-full flex items-center justify-center gap-2.5 py-2.5 rounded-lg
                             border border-border bg-surface hover:bg-muted text-foreground
                             text-sm font-medium transition-colors duration-200
                             disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <GoogleIcon />
                  {googleLoading ? "Signing in…" : "Continue with Google"}
                </button>

                {/* Divider */}
                <div className="flex items-center gap-3 py-1">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-xs text-foreground-muted">or</span>
                  <div className="flex-1 h-px bg-border" />
                </div>

                {/* Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium" htmlFor="name">Full name</label>
                  <input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg border border-border bg-surface
                               text-foreground placeholder:text-foreground-muted text-sm
                               focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
                               transition-colors duration-150"
                  />
                </div>

                {/* Email */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium" htmlFor="email">Email</label>
                  <input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg border border-border bg-surface
                               text-foreground placeholder:text-foreground-muted text-sm
                               focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
                               transition-colors duration-150"
                  />
                </div>

                {/* Password */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium" htmlFor="password">Password</label>
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

                {/* Confirm */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium" htmlFor="confirm">Confirm password</label>
                  <input
                    id="confirm"
                    type="password"
                    placeholder="••••••••"
                    value={form.confirm}
                    onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                    onKeyDown={(e) => e.key === "Enter" && handleSignup()}
                    className="w-full px-3 py-2.5 rounded-lg border border-border bg-surface
                               text-foreground placeholder:text-foreground-muted text-sm
                               focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
                               transition-colors duration-150"
                  />
                </div>

                {/* Error */}
                {error && (
                  <p className="text-sm text-error bg-error/10 border border-error/20 rounded-lg px-3 py-2">
                    {error}
                  </p>
                )}

                {/* Submit */}
                <button
                  onClick={handleSignup}
                  disabled={loading}
                  className="w-full py-2.5 rounded-lg bg-primary hover:bg-primary-dark text-white
                             font-semibold text-sm transition-colors duration-200
                             disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Creating account…" : "Create account"}
                </button>

                <p className="text-center text-sm text-foreground-muted pt-1">
                  Already have an account?{" "}
                  <Link href="/auth/login" className="text-primary hover:text-primary-dark font-medium transition-colors">
                    Sign in
                  </Link>
                </p>
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
