"use client";

import { ChevronDown, ChevronRight } from "lucide-react";
import { PRIORITY_CONFIG, type Task } from "./types";
import { TaskCard, type TaskCardProps } from "./TaskCard";

interface GroupCardProps {
  groupKey: string;
  tasks: Task[];
  isOpen: boolean;
  onToggle: () => void;
  selectedTasks: number[];
  taskCardProps: Omit<TaskCardProps, "task" | "isSelected" | "onSelect">;
  onSelectTask: (id: number) => void;
}

export function GroupCard({
  groupKey,
  tasks,
  isOpen,
  onToggle,
  selectedTasks,
  taskCardProps,
  onSelectTask,
}: GroupCardProps) {
  const done = tasks.filter((t) => t.completed).length;
  const progress =
    tasks.length > 0 ? Math.round((done / tasks.length) * 100) : 0;

  return (
    <div
      style={{
        borderRadius: 14,
        border: "1.5px solid var(--color-border)",
        overflow: "hidden",
        background: "var(--color-surface)",
      }}
    >
      {/* Header */}
      <button
        onClick={onToggle}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 18px",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span
            style={{
              color: isOpen
                ? "var(--color-primary)"
                : "var(--color-foreground-muted)",
              transition: "color 0.2s",
            }}
          >
            {isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          </span>
          <span
            style={{
              fontWeight: 700,
              fontSize: 15,
              color: "var(--color-foreground)",
            }}
          >
            {groupKey}
          </span>
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              background: "var(--color-muted)",
              color: "var(--color-foreground-muted)",
              padding: "2px 10px",
              borderRadius: 20,
              border: "1px solid var(--color-border)",
            }}
          >
            {tasks.length} task{tasks.length !== 1 ? "s" : ""}
          </span>
          {done > 0 && (
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                background:
                  "color-mix(in srgb, var(--color-success) 12%, transparent)",
                color: "var(--color-success)",
                padding: "2px 10px",
                borderRadius: 20,
              }}
            >
              {done} done
            </span>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Priority counts */}
          {(["high", "medium", "low"] as Task["priority"][]).map((p) => {
            const count = tasks.filter((t) => t.priority === p).length;
            if (!count) return null;
            return (
              <span
                key={p}
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: PRIORITY_CONFIG[p].color,
                }}
              >
                {count} {p}
              </span>
            );
          })}
          {/* Progress bar */}
          <div
            style={{
              width: 60,
              height: 5,
              background: "var(--color-muted)",
              borderRadius: 3,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${progress}%`,
                background:
                  "linear-gradient(90deg, var(--color-primary), var(--color-success))",
                borderRadius: 3,
                transition: "width 0.3s ease",
              }}
            />
          </div>
          <span
            style={{
              fontSize: 11,
              color: "var(--color-foreground-muted)",
              minWidth: 28,
            }}
          >
            {progress}%
          </span>
        </div>
      </button>

      {/* Expanded task list */}
      {isOpen && (
        <div
          style={{
            borderTop: "1px solid var(--color-border)",
            padding: 12,
            display: "flex",
            flexDirection: "column",
            gap: 8,
            background: "var(--color-background)",
          }}
        >
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              {...taskCardProps}
              isSelected={selectedTasks.includes(task.id)}
              onSelect={() => onSelectTask(task.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
