"use client";

import {
  CalendarDays,
  CheckCircle2,
  Circle,
  Flag,
  Pencil,
  Plus,
  Save,
  X,
} from "lucide-react";

import { PRIORITY_CONFIG, type Task } from "./types";
import { formatDisplayDate } from "./grouping";
import { Button, Input } from "./ui";
import { DatePicker } from "./DatePicker";
import { Dropdown, type DropdownOption } from "./Dropdown";

const PRIORITY_OPTIONS: DropdownOption[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

const PRIORITY_STYLES = {
  low: "border-l-[4px] border-l-green-500",
  medium: "border-l-[4px] border-l-yellow-500",
  high: "border-l-[4px] border-l-red-500",
};

export function TaskCard({
  task,
  editingId,
  editText,
  editDate,
  editPriority,
  isSelected,
  onToggle,
  onDelete,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onOpenDetails,
  onSelect,
  setEditText,
  setEditDate,
  setEditPriority,
}: {
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
}) {
  const pc = PRIORITY_CONFIG[task.priority];
  const isEditing = editingId === task.id;

  return (
    <div
      className={`
        flex gap-3 p-4 rounded-xl border transition-all
        ${PRIORITY_STYLES[task.priority]}
        ${isSelected ? "border-primary bg-primary/10" : "border-border bg-surface"}
        ${task.completed ? "opacity-60" : ""}
      `}
    >
      {/* Select */}
      {onSelect && (
        <button
          onClick={onSelect}
          className={`
            w-4 h-4 mt-1 rounded flex items-center justify-center border-2 transition
            ${
              isSelected
                ? "bg-primary border-primary text-white"
                : "border-border"
            }
          `}
        >
          {isSelected && <span className="text-[10px]">✓</span>}
        </button>
      )}

      {/* Toggle */}
      <button
        onClick={() => onToggle(task)}
        className="mt-1 text-muted-foreground hover:text-green-500 transition"
      >
        {task.completed ? (
          <CheckCircle2 size={20} className="text-green-500" />
        ) : (
          <Circle size={20} />
        )}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <div className="flex flex-col gap-2">
            <Input
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              autoFocus
              placeholder="Task name"
            />

            <div className="flex flex-wrap gap-2">
              <DatePicker
                value={editDate}
                onChange={setEditDate}
                placeholder="dd-mm-yyyy"
              />

              <Dropdown
                value={editPriority}
                options={PRIORITY_OPTIONS}
                onChange={(v) => setEditPriority(v as Task["priority"])}
              />

              <Button onClick={() => onSaveEdit(task)}>
                <Save size={14} /> Save
              </Button>

              <Button variant="ghost" onClick={onCancelEdit}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <>
            <p
              className={`
                font-semibold text-sm mb-2 break-words
                ${task.completed ? "line-through text-muted-foreground" : ""}
              `}
            >
              {task.title}
            </p>

            <div className="flex flex-wrap items-center gap-2">
              {/* Priority */}
              <span className="flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-full border bg-muted text-foreground">
                <Flag size={11} /> {pc?.label}
              </span>

              {/* Date */}
              <span className="flex items-center gap-1 text-[11px] px-2 py-1 rounded-full border bg-muted text-muted-foreground">
                <CalendarDays size={11} />
                {formatDisplayDate(task.date)}
              </span>

              {/* Edit */}
              <button
                onClick={() => onStartEdit(task)}
                className="flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-full border text-primary bg-primary/10 border-primary/30"
              >
                <Pencil size={11} /> Edit
              </button>

              {/* Details */}
              <button
                onClick={() => onOpenDetails(task.id)}
                className="flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-full border text-primary-light bg-primary-light/10 border-primary-light/30"
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
        className="p-1.5 rounded-md border border-red-300 text-red-500 hover:bg-red-500 hover:text-white transition"
      >
        <X size={16} />
      </button>
    </div>
  );
}
