"use client";

import { CalendarDays, CheckCircle2, Circle, Flag, Pencil, Plus, Save, X } from "lucide-react";
import { PRIORITY_CONFIG, type Task } from "./types";
import { formatDisplayDate } from "./grouping";
import { Button, Input } from "./ui";
import { DatePicker } from "./DatePicker";
import { Dropdown, type DropdownOption } from "./Dropdown";

const PRIORITY_OPTIONS: DropdownOption[] = [
  { value: "low", label: "Low", color: "var(--color-success)" },
  { value: "medium", label: "Medium", color: "var(--color-warning)" },
  { value: "high", label: "High", color: "var(--color-error)" },
];

export interface TaskCardProps {
  task: Task;
  editingId: number | null;
  editText: string;
  editDate: string;
  editPriority: Task["priority"];
  isSelected?: boolean;
  onToggle: (t: Task) => void;
  onDelete: (id: number) => void;
  onStartEdit: (t: Task) => void;
  onSaveEdit: (t: Task) => void;
  onCancelEdit: () => void;
  onOpenDetails: (id: number) => void;
  onSelect?: () => void;
  setEditText: (v: string) => void;
  setEditDate: (v: string) => void;
  setEditPriority: (v: Task["priority"]) => void;
}

export function TaskCard({
  task, editingId, editText, editDate, editPriority,
  isSelected, onToggle, onDelete, onStartEdit, onSaveEdit,
  onCancelEdit, onOpenDetails, onSelect,
  setEditText, setEditDate, setEditPriority,
}: TaskCardProps) {
  const pc = PRIORITY_CONFIG[task.priority];
  const isEditing = editingId === task.id;

  return (
    <div
      style={{
        background: isSelected
          ? "color-mix(in srgb, var(--color-primary) 8%, var(--color-surface))"
          : "var(--color-surface)",
        border: isSelected
          ? "1.5px solid color-mix(in srgb, var(--color-primary) 50%, transparent)"
          : "1.5px solid var(--color-border)",
        borderLeft: `4px solid ${pc.color}`,
        borderRadius: 12,
        padding: "14px 16px",
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        transition: "all 0.2s ease",
        opacity: task.completed ? 0.65 : 1,
      }}
    >
      {/* Selection box */}
      {onSelect && (
        <button
          onClick={onSelect}
          aria-label={isSelected ? "Deselect task" : "Select task"}
          style={{
            width: 18, height: 18, borderRadius: 5, flexShrink: 0, marginTop: 3,
            border: isSelected
              ? "2px solid var(--color-primary)"
              : "2px solid var(--color-border)",
            background: isSelected ? "var(--color-primary)" : "transparent",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", transition: "all 0.15s ease",
          }}
        >
          {isSelected && <span style={{ color: "#fff", fontSize: 10, lineHeight: 1 }}>✓</span>}
        </button>
      )}

      {/* Completion toggle */}
      <button
        onClick={() => onToggle(task)}
        aria-label={task.completed ? "Mark incomplete" : "Mark complete"}
        style={{
          flexShrink: 0, marginTop: 2, background: "none", border: "none",
          cursor: "pointer",
          color: task.completed ? "var(--color-success)" : "var(--color-foreground-muted)",
          transition: "color 0.2s ease",
        }}
      >
        {task.completed ? <CheckCircle2 size={20} /> : <Circle size={20} />}
      </button>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {isEditing ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <Input
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              autoFocus
              placeholder="Task name"
              style={{ width: "100%" }}
            />
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <DatePicker
                value={editDate}
                onChange={setEditDate}
                placeholder="dd-mm-yyyy"
              />
              <Dropdown
                value={editPriority}
                options={PRIORITY_OPTIONS}
                onChange={(next) => setEditPriority(next as Task["priority"])}
                style={{ minWidth: 132 }}
              />
              <Button onClick={() => onSaveEdit(task)}>
                <Save size={13} /> Save
              </Button>
              <Button variant="ghost" onClick={onCancelEdit}>Cancel</Button>
            </div>
          </div>
        ) : (
          <>
            <p style={{
              fontWeight: 600, fontSize: 15, marginBottom: 8, wordBreak: "break-word",
              color: task.completed ? "var(--color-foreground-muted)" : "var(--color-foreground)",
              textDecoration: task.completed ? "line-through" : "none",
            }}>
              {task.title}
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              {/* Priority badge */}
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 600,
                background: pc.bg, color: pc.color, padding: "3px 10px", borderRadius: 20,
                border: `1px solid color-mix(in srgb, ${pc.color} 30%, transparent)`,
              }}>
                <Flag size={11} /> {pc.label}
              </span>
              {/* Date badge */}
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11,
                background: "var(--color-muted)", color: "var(--color-foreground-muted)",
                padding: "3px 10px", borderRadius: 20,
                border: "1px solid var(--color-border)",
              }}>
                <CalendarDays size={11} /> {formatDisplayDate(task.date)}
              </span>
              {/* Edit */}
              <button
                onClick={() => onStartEdit(task)}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 600,
                  color: "var(--color-primary)",
                  background: "color-mix(in srgb, var(--color-primary) 10%, transparent)",
                  border: "1px solid color-mix(in srgb, var(--color-primary) 25%, transparent)",
                  padding: "3px 10px", borderRadius: 20, cursor: "pointer",
                }}
              >
                <Pencil size={11} /> Edit
              </button>
              {/* Details */}
              <button
                onClick={() => onOpenDetails(task.id)}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 600,
                  color: "var(--color-primary-light)",
                  background: "color-mix(in srgb, var(--color-primary-light) 10%, transparent)",
                  border: "1px solid color-mix(in srgb, var(--color-primary-light) 25%, transparent)",
                  padding: "3px 10px", borderRadius: 20, cursor: "pointer",
                }}
              >
                <Plus size={11} /> Details
              </button>
            </div>
          </>
        )}
      </div>

      {/* Delete */}
      <button
        onClick={() => onDelete(task.id)}
        aria-label="Delete task"
        style={{
          flexShrink: 0,
          background: "color-mix(in srgb, var(--color-error) 8%, transparent)",
          border: "1px solid color-mix(in srgb, var(--color-error) 20%, transparent)",
          color: "var(--color-error)",
          borderRadius: 8, padding: 6, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all 0.2s ease",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = "var(--color-error)";
          (e.currentTarget as HTMLButtonElement).style.color = "#fff";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background =
            "color-mix(in srgb, var(--color-error) 8%, transparent)";
          (e.currentTarget as HTMLButtonElement).style.color = "var(--color-error)";
        }}
      >
        <X size={16} />
      </button>
    </div>
  );
}
