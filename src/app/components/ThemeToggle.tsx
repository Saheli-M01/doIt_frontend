"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/app/context/ThemeContext";

export function ThemeToggle() {
  const { theme, toggleTheme, mounted } = useTheme();

  // Render a neutral placeholder until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <div
        className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-700"
        aria-hidden="true"
      />
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="cursor-pointer w-9 h-9 rounded-full flex items-center justify-center
                 bg-blue-100 dark:bg-amber-200/20
                 hover:bg-blue-200 dark:hover:bg-amber-200/40
                 transition-colors duration-200
                 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    >
      {theme === "dark" ? (
        <Sun className="w-4 h-4 text-amber-500" aria-hidden="true" />
      ) : (
        <Moon className="w-4 h-4 text-blue-600" aria-hidden="true" />
      )}
    </button>
  );
}
