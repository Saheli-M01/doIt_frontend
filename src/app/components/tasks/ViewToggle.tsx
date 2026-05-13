"use client";

import { Calendar, LayoutList } from "lucide-react";
import type { ViewMode } from "./types";

interface ViewToggleProps {
  value: ViewMode;
  onChange: (v: ViewMode) => void;
}

const VIEWS: ViewMode[] = ["all", "day", "week", "month"];

export function ViewToggle({ value, onChange }: ViewToggleProps) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 3,
      background: "var(--color-muted)",
      borderRadius: 10, padding: 4,
      border: "1.5px solid var(--color-border)",
    }}>
      {VIEWS.map((v) => {
        const active = value === v;
        return (
          <button
            key={v}
            onClick={() => onChange(v)}
            style={{
              padding: "6px 13px", borderRadius: 7,
              fontSize: 12, fontWeight: 600,
              border: "none", cursor: "pointer",
              transition: "all 0.18s ease",
              background: active ? "var(--color-primary)" : "transparent",
              color: active ? "#fff" : "var(--color-foreground-muted)",
              boxShadow: active
                ? "0 2px 10px color-mix(in srgb, var(--color-primary) 30%, transparent)"
                : "none",
              textTransform: "capitalize",
              display: "flex", alignItems: "center", gap: 5,
            }}
          >
            {v === "all" ? <LayoutList size={13} /> : <Calendar size={13} />}
            {v}
          </button>
        );
      })}
    </div>
  );
}
