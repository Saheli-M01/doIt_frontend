import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background:       "var(--color-background)",
        surface:          "var(--color-surface)",
        muted:            "var(--color-muted)",
        foreground:       "var(--color-foreground)",
        "foreground-muted": "var(--color-foreground-muted)",
        primary:          "var(--color-primary)",
        "primary-light":  "var(--color-primary-light)",
        "primary-dark":   "var(--color-primary-dark)",
        secondary:        "var(--color-secondary)",
        accent:           "var(--color-accent)",
        border:           "var(--color-border)",
        error:            "var(--color-error)",
        success:          "var(--color-success)",
        warning:          "var(--color-warning)",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "Arial", "Helvetica", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
