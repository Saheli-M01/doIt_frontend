import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";

export function Hero() {
  return (
    <div className="relative mt-12 lg:mt-16 max-w-2xl w-full text-center flex flex-col items-center px-6">
      {/* pill badge */}
      <div className="inline-flex items-center gap-1.5 mb-4 sm:mb-6 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 tracking-wide uppercase max-w-full">
        <Sparkles className="w-3 h-3 shrink-0" />
        <span className="truncate">Task management, simplified</span>
      </div>

      <h1 className="text-4xl sm:text-5xl lg:text-[4.5rem] font-bold tracking-tight mb-4 sm:mb-5 leading-[1.1] sm:leading-[1.08] w-full">
        Do more.
        <br />
        <span className="text-primary">Stress less.</span>
      </h1>

      <p className="text-sm sm:text-base lg:text-lg text-foreground-muted mb-8 sm:mb-10 leading-relaxed max-w-lg w-full">
        GetDoIt keeps your tasks, projects, and ideas in one clean space —
        with an AI assistant that actually helps you get things done.
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full">
        <Link
          href="/auth/signup"
          className="group inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 rounded-full bg-primary text-white font-semibold text-sm w-full sm:w-auto hover:bg-primary-dark transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
        >
          Get started for free
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
        <Link
          href="/auth/login"
          className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 rounded-full border border-border bg-surface text-foreground font-semibold text-sm w-full sm:w-auto hover:bg-muted transition-all duration-200 hover:-translate-y-0.5"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}
