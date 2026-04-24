"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { applyActionCode } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { ThemedLogo } from "@/app/components/ThemedLogo";
import { ThemeToggle } from "@/app/components/ThemeToggle";
import Link from "next/link";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const oobCode = searchParams.get("oobCode");

    if (!oobCode) {
      setErrorMsg("Invalid or missing verification link.");
      setStatus("error");
      return;
    }

    applyActionCode(auth, oobCode)
      .then(() => setStatus("success"))
      .catch((err) => {
        switch (err?.code) {
          case "auth/expired-action-code":
            setErrorMsg("This verification link has expired. Please sign up again.");
            break;
          case "auth/invalid-action-code":
            setErrorMsg("This link is invalid or has already been used.");
            break;
          default:
            setErrorMsg("Verification failed. Please try again.");
        }
        setStatus("error");
      });
  }, [searchParams]);

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="w-full border-b border-border">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/"><ThemedLogo /></Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-sm text-center">

          {status === "loading" && (
            <>
              <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto mb-4" />
              <h1 className="text-xl font-bold mb-2">Verifying your email…</h1>
              <p className="text-sm text-foreground-muted">Please wait a moment.</p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="w-12 h-12 rounded-full bg-success/15 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-6 h-6 text-success" />
              </div>
              <h1 className="text-xl font-bold mb-2">Email verified!</h1>
              <p className="text-sm text-foreground-muted mb-6">
                Your email has been verified. You can now sign in.
              </p>
              <Link
                href="/auth/login"
                className="inline-block px-6 py-2.5 rounded-lg bg-primary hover:bg-primary-dark
                           text-white text-sm font-semibold transition-colors duration-200"
              >
                Sign in
              </Link>
            </>
          )}

          {status === "error" && (
            <>
              <div className="w-12 h-12 rounded-full bg-error/15 flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-6 h-6 text-error" />
              </div>
              <h1 className="text-xl font-bold mb-2">Verification failed</h1>
              <p className="text-sm text-foreground-muted mb-6">{errorMsg}</p>
              <Link
                href="/auth/signup"
                className="inline-block px-6 py-2.5 rounded-lg bg-primary hover:bg-primary-dark
                           text-white text-sm font-semibold transition-colors duration-200"
              >
                Back to Sign up
              </Link>
            </>
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
