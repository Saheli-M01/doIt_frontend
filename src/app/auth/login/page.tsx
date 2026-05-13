"use client";

import { SignIn } from "@clerk/nextjs";
import { ThemedLogo } from "@/app/components/ThemedLogo";
import { ThemeToggle } from "@/app/components/ThemeToggle";
import { useTheme } from "@/app/context/ThemeContext";
import Link from "next/link";

export default function LoginPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div
      className="flex flex-col min-h-screen text-foreground"
      style={{
        background: isDark
          ? "radial-gradient(ellipse at 60% 0%, rgba(90,159,237,0.12) 0%, transparent 60%), #0a0a0a"
          : "radial-gradient(ellipse at 60% 0%, rgba(74,144,226,0.08) 0%, transparent 60%), #f4f6f9",
      }}
    >
      {/* Nav */}
      <header className="w-full border-b border-border bg-background/60 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/"><ThemedLogo /></Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-10">
        <SignIn
          routing="hash"
          fallbackRedirectUrl="/dashboard"
          appearance={{
            variables: isDark
              ? {
                  colorBackground: "#1e1e22",
                  colorInputBackground: "#28282e",
                  colorText: "#f0f0f0",
                  colorTextSecondary: "#9a9aaa",
                  colorTextOnPrimaryBackground: "#ffffff",
                  colorInputText: "#f0f0f0",
                  colorPrimary: "#4a90e2",
                  colorDanger: "#e74c3c",
                  colorNeutral: "#f0f0f0",
                  borderRadius: "12px",
                  fontFamily: "inherit",
                  fontSize: "14px",
                }
              : {
                  colorBackground: "#ffffff",
                  colorInputBackground: "#f8f9fa",
                  colorText: "#0b0b0f",
                  colorTextSecondary: "#6c757d",
                  colorTextOnPrimaryBackground: "#ffffff",
                  colorInputText: "#0b0b0f",
                  colorPrimary: "#4a90e2",
                  colorDanger: "#dc3545",
                  colorNeutral: "#0b0b0f",
                  borderRadius: "12px",
                  fontFamily: "inherit",
                  fontSize: "14px",
                },
            elements: {
              rootBox: "w-full max-w-sm mx-auto",
              card: isDark
                ? "!overflow-visible shadow-2xl border border-white/10"
                : "!overflow-visible shadow-xl border border-zinc-200",
              formButtonPrimary:
                "bg-gradient-to-r from-[#005087] to-[#4a90e2] hover:opacity-90 transition-opacity font-semibold",
              footer: "hidden",
              otpCodeFieldInput: isDark
                ? "!bg-[#28282e] !text-white !border-white/20 text-xl font-bold"
                : "!bg-white !text-zinc-900 !border-zinc-200 text-xl font-bold",
              formFieldLabel: isDark ? "!text-zinc-200" : "!text-zinc-700",
              headerTitle: isDark ? "!text-white" : "!text-zinc-900",
              headerSubtitle: isDark ? "!text-zinc-400" : "!text-zinc-500",
              socialButtonsBlockButtonText: isDark ? "!text-white" : "!text-zinc-900",
              formFieldInput: isDark
                ? "!bg-[#28282e] !text-white !border-white/10 placeholder:!text-zinc-500"
                : "!bg-white !text-zinc-900 !border-zinc-200",
              formFieldInputShowPasswordButton: isDark
                ? "!text-zinc-400 hover:!text-white"
                : "!text-zinc-500 hover:!text-zinc-900",
              identityPreviewText: isDark ? "!text-white" : "!text-zinc-900",
              identityPreviewEditButton: isDark ? "!text-zinc-400" : "!text-zinc-600",
              dividerText: isDark ? "!text-zinc-500" : "!text-zinc-400",
              socialButtonsBlockButton: isDark
                ? "!border-white/10 !bg-[#232329] hover:!bg-[#2a2a31] !text-white"
                : "!border-zinc-200 !bg-white hover:!bg-zinc-50 !text-zinc-900",
              socialButtonsBlockButtonArrow: isDark ? "!text-zinc-400" : "!text-zinc-500",
             
            },
          }}
        />
      </main>
    </div>
  );
}