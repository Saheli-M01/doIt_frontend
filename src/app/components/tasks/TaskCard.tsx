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
  Check
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

const PRIORITY_BORDER = {
  low: "border-green-500/30",
  medium: "border-yellow-500/30",
  high: "border-red-500/30",
};

const PRIORITY_CHIP_COLORS = {
  low: { text: "text-green-500", bg: "bg-green-500/10", border: "border-green-500/30" },
  medium: { text: "text-yellow-500", bg: "bg-yellow-500/10", border: "border-yellow-500/30" },
  high: { text: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/30" },
};
export type TaskCardProps = {
  task: Task;
  editingId: number | null;
  editText: string;
  editDate: string;
  editPriority: Task["priority"];
  isSelected?: boolean;
  details?: string;
  deletingIds?: Set<number>;
  togglingIds?: Set<number>;
  savingEditId?: number | null;
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
};
export function TaskCard({
  task,
  editingId,
  editText,
  editDate,
  editPriority,
  isSelected,
  details,
  deletingIds,
  togglingIds,
  savingEditId,
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
}: TaskCardProps) {
  const pc = PRIORITY_CONFIG[task.priority];
  const chip = PRIORITY_CHIP_COLORS[task.priority];
  const border = PRIORITY_BORDER[task.priority];
  const isEditing = editingId === task.id;
  const isDeleting = deletingIds?.has(task.id);
  const isToggling = togglingIds?.has(task.id);
  const isSavingEdit = savingEditId === task.id;
  const hasDetails = details && details.trim() !== "" && details !== "<p>Add details...</p>" && details !== "<p></p>";

  return (
    <div
      className={`
        flex gap-3 px-3 py-2.5 rounded-xl border-2 transition-all 
        ${isSelected ? "border-primary bg-primary/10" : border + " bg-surface"}
        ${task.completed && !isEditing ? "opacity-60" : ""}
      `}
    >
      {/* Select */}
      {onSelect && (
        <button
          onClick={onSelect}
          className={`
            w-4 h-4 mt-1 rounded flex items-center justify-center border-2 transition
            ${isSelected
              ? "bg-primary border-primary text-white"
              : "border-border"
            }
          `}
        >
          {isSelected && <span className="text-[10px]"><Check size={12} /></span>}
        </button>
      )}

      {/* Toggle */}
      <button
        onClick={() => onToggle(task)}
        disabled={isToggling}
        className="mt-1 text-muted-foreground hover:text-green-500 transition disabled:opacity-50"
      >
        {isToggling ? (
          <span className="w-5 h-5 border-2 border-green-500/30 border-t-green-500 rounded-full animate-spin block" />
        ) : task.completed ? (
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

              <Button onClick={() => onSaveEdit(task)} disabled={isSavingEdit}>
                {isSavingEdit ? (
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Save size={14} />
                )}
                {isSavingEdit ? "Saving…" : "Save"}
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
              <span className={`flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-full border ${chip.bg} ${chip.text} ${chip.border}`}>
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
                className={`flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-full border transition-colors ${hasDetails
                    ? "text-green-500 bg-green-500/10 border-green-500/30"
                    : "text-primary-light bg-primary-light/10 border-primary-light/30"
                  }`}
              >
                {hasDetails ? <Check size={11} /> : <Plus size={11} />} Details
              </button>
            </div>
          </>
        )}
      </div>

      {/* Delete */}
      <button
        onClick={() => onDelete(task.id)}
        disabled={isDeleting}
        className="w-6 h-6 flex items-center justify-center rounded-full border border-red-300 text-red-500 hover:bg-red-500 hover:text-white transition disabled:opacity-40"
      >
        {isDeleting ? (
          <span className="w-3 h-3 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
        ) : (
          <X size={16} />
        )}
      </button>
    </div>
  );
}
