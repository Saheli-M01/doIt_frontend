"use client";

import { SignIn } from "@clerk/nextjs";
import { ThemedLogo } from "@/app/components/ThemedLogo";
import { ThemeToggle } from "@/app/components/ThemeToggle";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="w-full border-b border-border">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/">
            <ThemedLogo />
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-10">
        <SignIn
          routing="hash"
          fallbackRedirectUrl="/dashboard"
          appearance={{
            elements: {
              rootBox: "w-full max-w-sm",
              card: "bg-surface border border-border shadow-none rounded-xl p-6",
              headerTitle: "text-foreground text-2xl font-bold",
              headerSubtitle: "text-foreground-muted text-sm",
              socialButtonsBlockButton:
                "border border-border bg-surface hover:bg-muted text-foreground text-sm font-medium rounded-lg",
              formFieldLabel: "text-foreground text-sm font-medium",
              formFieldInput:
                "bg-surface border border-border text-foreground placeholder:text-foreground-muted rounded-lg text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary",
              formButtonPrimary:
                "bg-primary hover:bg-primary-dark text-white font-semibold text-sm rounded-lg",
              footerActionLink: "text-primary hover:text-primary-dark font-medium",
              // Hide the "Don't have an account? Sign up" footer
              footer: "hidden",
              identityPreviewText: "text-foreground",
              identityPreviewEditButton: "text-primary",
              dividerLine: "bg-border",
              dividerText: "text-foreground-muted text-xs",
            },
          }}
        />
      </main>

      <footer className="border-t border-border">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-center text-xs text-foreground-muted">
          © {new Date().getFullYear()} DoIt. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
