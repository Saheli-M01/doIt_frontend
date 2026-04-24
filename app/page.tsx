"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/app/context/UserContext";
import { useTheme } from "@/app/context/ThemeContext";
import { ThemedLogo } from "@/app/components/ThemedLogo";
import { ThemeToggle } from "@/app/components/ThemeToggle";
import Link from "next/link";
import { CheckCircle2, Zap, LayoutDashboard } from "lucide-react";

const features = [
  {
    Icon: CheckCircle2,
    title: "Stay organised",
    desc: "Group tasks by project, priority, or date — your way.",
  },
  {
    Icon: Zap,
    title: "AI-powered",
    desc: "Let the assistant plan your day and generate task lists instantly.",
  },
  {
    Icon: LayoutDashboard,
    title: "Clear overview",
    desc: "A dashboard that shows what matters, nothing more.",
  },
];

export default function Home() {
  const { user, isLoading } = useUser();
  const { mounted } = useTheme();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.push("/dashboard");
    }
  }, [user, isLoading, router]);

  // Wait for both user check and theme mount before rendering
  if (isLoading || !mounted || user) return null;

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* ── Nav ── */}
      <header className="w-full border-b border-border">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <ThemedLogo />
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/auth/login"
              className="px-4 py-2 rounded-full bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors duration-200"
            >
              Sign in
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <main className="flex-1 mt-2 flex flex-col items-center justify-center px-6 text-center">
        <div className="max-w-2xl">
          <span className="inline-block mb-4 px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20 tracking-wide uppercase">
            Task management, simplified
          </span>

          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight mb-5 leading-tight">
            Do more.
            <br />
            <span className="text-primary">Stress less.</span>
          </h1>

          <p className="text-lg text-foreground-muted mb-10 leading-relaxed">
            DoIt keeps your tasks, projects, and ideas in one clean space —
            with an AI assistant that actually helps.
          </p>

          <Link
            href="/auth/login"
            className="inline-block px-8 py-3 rounded-xl bg-primary text-white font-semibold text-base hover:bg-primary-dark transition-colors duration-200 shadow-md hover:shadow-lg"
          >
            Get started free
          </Link>
        </div>

        {/* ── Feature cards ── */}
        <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl w-full">
          {features.map(({ Icon, title, desc }) => (
            <div
              key={title}
              className="flex flex-col gap-2 p-5 rounded-xl border border-border bg-surface text-left hover:border-primary/40 transition-colors duration-200"
            >
              <Icon className="w-5 h-5 text-primary" />
              <p className="font-semibold text-sm">{title}</p>
              <p className="text-xs text-foreground-muted leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-border mt-3">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between text-xs text-foreground-muted">
          <span>© {new Date().getFullYear()} DoIt. All rights reserved.</span>
          <span>Built for focus.</span>
        </div>
      </footer>
    </div>
  );
}
