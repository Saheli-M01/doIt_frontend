"use client";

import { Save, X } from "lucide-react";
import TaskEditor from "../TaskEditor";
import type { Task } from "./types";
import { Button } from "./ui";

interface DetailsSliderProps {
  task: Task | undefined;
  draft: string;
  isOpen: boolean;
  onClose: () => void;
  onDraftChange: (v: string) => void;
  onSave: () => void;
}

export function DetailsSlider({
  task, draft, isOpen, onClose, onDraftChange, onSave,
}: DetailsSliderProps) {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 40,
      pointerEvents: isOpen ? "auto" : "none",
      opacity: isOpen ? 1 : 0,
      transition: "opacity 0.3s ease",
    }}>
      {/* Backdrop */}
      <button
        aria-label="Close details panel"
        onClick={onClose}
        style={{
          position: "absolute", inset: 0,
          background: "rgba(0,0,0,0.4)",
          border: "none", cursor: "pointer",
          backdropFilter: "blur(3px)",
        }}
      />

      {/* Panel */}
      <aside style={{
        position: "absolute", right: 0, top: 0,
        height: "100%", width: "100%", maxWidth: 480,
        background: "var(--color-surface)",
        borderLeft: "1.5px solid var(--color-border)",
        boxShadow: "-16px 0 48px rgba(0,0,0,0.25)",
        padding: 28,
        transition: "transform 0.3s cubic-bezier(0.4,0,0.2,1)",
        transform: isOpen ? "translateX(0)" : "translateX(100%)",
        display: "flex", flexDirection: "column", gap: 20,
        overflowY: "auto",
      }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <div style={{
                width: 3, height: 20,
                background: "linear-gradient(180deg, var(--color-primary), var(--color-primary-light))",
                borderRadius: 2,
              }} />
              <h2 style={{
                fontSize: 18, fontWeight: 800,
                color: "var(--color-foreground)", margin: 0,
              }}>
                Task Details
              </h2>
            </div>
            {task && (
              <p style={{
                fontSize: 13, color: "var(--color-foreground-muted)",
                margin: 0, maxWidth: 340,
              }}>
                {task.title}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              background: "color-mix(in srgb, var(--color-error) 10%, transparent)",
              border: "1px solid color-mix(in srgb, var(--color-error) 25%, transparent)",
              color: "var(--color-error)",
              borderRadius: 8, padding: 8, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "var(--color-error)";
              (e.currentTarget as HTMLButtonElement).style.color = "#fff";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "color-mix(in srgb, var(--color-error) 10%, transparent)";
              (e.currentTarget as HTMLButtonElement).style.color = "var(--color-error)";
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Editor */}
        <div style={{ flex: 1 }}>
          <TaskEditor value={draft} onChange={onDraftChange} />
        </div>

        {/* Save */}
        <Button onClick={onSave} style={{ justifyContent: "center", padding: "12px 24px", fontSize: 15 }}>
          <Save size={16} /> Save Details
        </Button>
      </aside>
    </div>
  );
}
