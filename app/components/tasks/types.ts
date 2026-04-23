export type Task = {
  id: number;
  title: string;
  completed: boolean;
  date: string;
  priority: "low" | "medium" | "high";
};

export type TaskNavPage = {
  id: string;
  name: string;
};

export type ViewMode = "all" | "day" | "week" | "month";

export const PRIORITY_CONFIG: Record<
  Task["priority"],
  { label: string; color: string; bg: string }
> = {
  high:   { label: "High",   color: "var(--color-error)",   bg: "color-mix(in srgb, var(--color-error) 12%, transparent)" },
  medium: { label: "Medium", color: "var(--color-warning)", bg: "color-mix(in srgb, var(--color-warning) 12%, transparent)" },
  low:    { label: "Low",    color: "var(--color-success)", bg: "color-mix(in srgb, var(--color-success) 12%, transparent)" },
};

export const TASK_NAV_PAGES_KEY = "task-nav-pages";
