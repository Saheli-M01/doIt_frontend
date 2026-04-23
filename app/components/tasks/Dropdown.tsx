"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Check } from "lucide-react";

export interface DropdownOption {
  value: string;
  label: string;
  /** optional dot color for priority options */
  color?: string;
}

interface DropdownProps {
  value: string;
  options: DropdownOption[];
  onChange: (value: string) => void;
  style?: React.CSSProperties;
  placeholder?: string;
}

export function Dropdown({ value, options, onChange, style, placeholder }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative", ...style }}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "9px 12px",
          background: "var(--color-surface)",
          border: `1.5px solid ${open ? "var(--color-primary)" : "var(--color-border)"}`,
          borderRadius: 10,
          color: "var(--color-foreground)",
          fontSize: 13,
          fontWeight: 500,
          cursor: "pointer",
          whiteSpace: "nowrap",
          transition: "border-color 0.18s",
          width: "100%",
          justifyContent: "space-between",
          minWidth: 120,
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: 7 }}>
          {selected?.color && (
            <span style={{
              width: 8, height: 8, borderRadius: "50%",
              background: selected.color, flexShrink: 0,
            }} />
          )}
          {selected?.label ?? placeholder ?? "Select…"}
        </span>
        <ChevronDown
          size={14}
          style={{
            color: "var(--color-foreground-muted)",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.18s",
            flexShrink: 0,
          }}
        />
      </button>

      {/* Menu */}
      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            zIndex: 200,
            background: "var(--color-surface)",
            border: "1.5px solid var(--color-border)",
            borderRadius: 12,
            boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
            minWidth: "100%",
            overflow: "hidden",
            animation: "dropdownIn 0.14s ease",
          }}
        >
          {options.map((opt) => {
            const isActive = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => { onChange(opt.value); setOpen(false); }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 10,
                  width: "100%",
                  padding: "9px 14px",
                  background: isActive
                    ? "color-mix(in srgb, var(--color-primary) 10%, transparent)"
                    : "transparent",
                  border: "none",
                  color: isActive ? "var(--color-primary)" : "var(--color-foreground)",
                  fontSize: 13,
                  fontWeight: isActive ? 600 : 400,
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "background 0.12s",
                }}
                onMouseEnter={(e) => {
                  if (!isActive)
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "var(--color-muted)";
                }}
                onMouseLeave={(e) => {
                  if (!isActive)
                    (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {opt.color && (
                    <span style={{
                      width: 8, height: 8, borderRadius: "50%",
                      background: opt.color, flexShrink: 0,
                    }} />
                  )}
                  {opt.label}
                </span>
                {isActive && <Check size={13} style={{ color: "var(--color-primary)", flexShrink: 0 }} />}
              </button>
            );
          })}
        </div>
      )}

      <style>{`
        @keyframes dropdownIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
