"use client";

import React from "react";

// ── Themed Select ─────────────────────────────────────────────────────────────

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  children: React.ReactNode;
}

export function Select({ children, className = "", style, ...props }: SelectProps) {
  return (
    <select
      {...props}
      className={className}
      style={{
        background: "var(--color-surface)",
        border: "1.5px solid var(--color-border)",
        color: "var(--color-foreground)",
        padding: "9px 32px 9px 12px",
        borderRadius: 10,
        fontSize: 13,
        fontWeight: 500,
        outline: "none",
        cursor: "pointer",
        appearance: "none",
        WebkitAppearance: "none",
        // Chevron icon tinted to match foreground-muted
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236c757d' stroke-width='2.5'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 10px center",
        transition: "border-color 0.2s, background 0.2s",
        ...style,
      }}
    >
      {children}
    </select>
  );
}

// ── Themed Text Input ─────────────────────────────────────────────────────────

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export function Input({ style, ...props }: InputProps) {
  return (
    <input
      {...props}
      style={{
        background: "var(--color-surface)",
        border: "1.5px solid var(--color-border)",
        color: "var(--color-foreground)",
        padding: "9px 12px",
        borderRadius: 10,
        fontSize: 14,
        outline: "none",
        transition: "border-color 0.2s",
        ...style,
      }}
    />
  );
}

// ── Primary Button ────────────────────────────────────────────────────────────

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "danger";
  children: React.ReactNode;
}

export function Button({
  variant = "primary",
  children,
  style,
  disabled,
  ...props
}: ButtonProps) {
  const base: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "9px 18px",
    borderRadius: 10,
    fontSize: 13,
    fontWeight: 600,
    cursor: disabled ? "not-allowed" : "pointer",
    border: "none",
    transition: "all 0.2s ease",
    opacity: disabled ? 0.45 : 1,
  };

  const variants: Record<string, React.CSSProperties> = {
    primary: {
      background: "var(--color-primary)",
      color: "#fff",
      boxShadow: "0 2px 12px color-mix(in srgb, var(--color-primary) 35%, transparent)",
    },
    ghost: {
      background: "var(--color-muted)",
      color: "var(--color-foreground)",
      border: "1.5px solid var(--color-border)",
    },
    danger: {
      background: "color-mix(in srgb, var(--color-error) 12%, transparent)",
      color: "var(--color-error)",
      border: "1.5px solid color-mix(in srgb, var(--color-error) 30%, transparent)",
    },
  };

  return (
    <button disabled={disabled} style={{ ...base, ...variants[variant], ...style }} {...props}>
      {children}
    </button>
  );
}

// ── Card wrapper ──────────────────────────────────────────────────────────────

export function Card({
  children,
  style,
  className,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}) {
  return (
    <div
      className={className}
      style={{
        background: "var(--color-surface)",
        border: "1.5px solid var(--color-border)",
        borderRadius: 14,
        padding: "18px 20px",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
