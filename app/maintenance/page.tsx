"use client";

import { Hammer } from "lucide-react";
import { ThemedLogo } from "@/app/components/ThemedLogo";

export default function MaintenancePage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground items-center justify-center p-6 text-center">
      <div className="mb-8">
        <ThemedLogo />
      </div>

      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
        <Hammer className="w-8 h-8 text-primary" />
      </div>

      <h1 className="text-3xl font-bold tracking-tight mb-3">We'll be right back</h1>

      <p className="max-w-md text-foreground-muted mb-8 text-sm sm:text-base leading-relaxed">
        GetDoIt is currently undergoing maintenance to improve your experience.
        We expect to be back online shortly. Thank you for your patience!
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2.5 rounded-lg bg-primary hover:bg-primary-dark text-white font-semibold text-sm transition-colors duration-200"
        >
          Check again
        </button>
      </div>

      <div className="mt-16 text-xs text-foreground-muted/60">
        &copy; {new Date().getFullYear()} DoIt. All rights reserved.
      </div>
    </div>
  );
}
