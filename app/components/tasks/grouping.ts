import type { Task, ViewMode } from "./types";

function formatDate(d: Date) {
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDisplayDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getWeekRange(dateStr: string): { start: Date; end: Date } {
  const d = new Date(dateStr);
  const start = new Date(d);
  start.setDate(d.getDate() - d.getDay());
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return { start, end };
}

function getGroupKey(task: Task, view: ViewMode): string {
  if (view === "day") return task.date;
  if (view === "week") {
    const { start, end } = getWeekRange(task.date);
    return `${formatDate(start)} – ${formatDate(end)}`;
  }
  if (view === "month") {
    return new Date(task.date).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  }
  return "all";
}

export function groupTasks(
  tasks: Task[],
  view: ViewMode
): { key: string; tasks: Task[] }[] {
  if (view === "all") return [{ key: "all", tasks }];

  const map = new Map<string, Task[]>();
  for (const task of tasks) {
    const key = getGroupKey(task, view);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(task);
  }

  return Array.from(map.entries())
    .sort(([, aList], [, bList]) => {
      const firstA = aList[0].date;
      const firstB = bList[0].date;
      return firstA < firstB ? -1 : 1;
    })
    .map(([key, tasks]) => ({ key, tasks }));
}
