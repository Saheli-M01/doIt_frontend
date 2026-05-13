"use client";

import { RefreshCw, Trash2 } from "lucide-react";
import { Button } from "./ui";

interface BulkBarProps {
  count: number;
  onRepeat: (days: number) => void;
  onDelete: () => void;
}

export function BulkBar({ count, onRepeat, onDelete }: BulkBarProps) {
  if (count === 0) return null;

  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      background: "color-mix(in srgb, var(--color-primary) 8%, var(--color-surface))",
      border: "1.5px solid color-mix(in srgb, var(--color-primary) 25%, transparent)",
      borderRadius: 12, padding: "10px 16px", marginBottom: 12,
      flexWrap: "wrap", gap: 10,
    }}>
      <span style={{ fontSize: 13, fontWeight: 600, color: "var(--color-primary)" }}>
        {count} task{count !== 1 ? "s" : ""} selected
      </span>
      <div style={{ display: "flex", gap: 8 }}>
        <Button variant="ghost" onClick={() => onRepeat(7)} style={{ fontSize: 12 }}>
          <RefreshCw size={13} /> Repeat 7 days
        </Button>
        <Button variant="danger" onClick={onDelete} style={{ fontSize: 12 }}>
          <Trash2 size={13} /> Delete selected
        </Button>
      </div>
    </div>
  );
}
