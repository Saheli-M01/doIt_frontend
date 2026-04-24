"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  Clock3,
  ListTodo,
  Target,
} from "lucide-react";
import { useUser } from "@/app/context/UserContext";
import type { Task, TaskNavPage } from "@/app/components/tasks/types";

const TASK_NAV_PAGES_KEY = "task-nav-pages";

type DashboardTask = Task & {
  pageId: string;
  pageName: string;
};

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function readTaskPages(): TaskNavPage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(TASK_NAV_PAGES_KEY);
    return raw ? (JSON.parse(raw) as TaskNavPage[]) : [];
  } catch {
    return [];
  }
}

function readTasksByPage(pageId: string): Task[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(`task-items-${pageId}`);
    return raw ? (JSON.parse(raw) as Task[]) : [];
  } catch {
    return [];
  }
}

export default function DashboardPage() {
  const { user } = useUser();
  const today = startOfToday();

  const allTasks = useMemo<DashboardTask[]>(() => {
    const pages = readTaskPages();
    return pages.flatMap((page) =>
      readTasksByPage(page.id).map((task) => ({
        ...task,
        pageId: page.id,
        pageName: page.name,
      })),
    );
  }, []);

  const sortedByDate = useMemo(
    () =>
      [...allTasks].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      ),
    [allTasks],
  );

  const total = allTasks.length;
  const completed = allTasks.filter((task) => task.completed).length;
  const completionRate = total ? Math.round((completed / total) * 100) : 0;
  const highPriorityOpen = allTasks.filter(
    (task) => task.priority === "high" && !task.completed,
  ).length;
  const dueToday = allTasks.filter(
    (task) =>
      !task.completed && new Date(task.date).getTime() === today.getTime(),
  );
  const overdue = allTasks.filter(
    (task) =>
      !task.completed && new Date(task.date).getTime() < today.getTime(),
  );
  const upcoming = sortedByDate.filter(
    (task) =>
      !task.completed && new Date(task.date).getTime() > today.getTime(),
  );
  const recentDone = sortedByDate
    .filter((task) => task.completed)
    .slice(-5)
    .reverse();

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <header
        className="rounded-2xl border p-6"
        style={{
          background:
            "linear-gradient(135deg, color-mix(in srgb, var(--color-primary) 14%, var(--color-surface)), var(--color-surface))",
          borderColor: "var(--color-border)",
        }}
      >
        <p
          className="text-sm"
          style={{ color: "var(--color-foreground-muted)" }}
        >
          Dashboard Overview
        </p>
        <h1
          className="mt-2 text-3xl font-black tracking-tight"
          style={{ color: "var(--color-foreground)" }}
        >
          Welcome, {user?.name || "User"}
        </h1>
        <p
          className="mt-2 text-sm"
          style={{ color: "var(--color-foreground-muted)" }}
        >
          {user?.email || "No email available"}
        </p>
      </header>

      <section className="grid gap-4 grid-cols-2 md:grid-cols-4">
        {[
          {
            icon: <ListTodo size={16} />,
            label: "Total Tasks",
            value: total,
            color: "var(--color-primary)",
          },
          {
            icon: <CheckCircle2 size={16} />,
            label: "Completed",
            value: completed,
            color: "var(--color-success)",
          },
          {
            icon: <AlertTriangle size={16} />,
            label: "High Priority Open",
            value: highPriorityOpen,
            color: "var(--color-error)",
          },
          {
            icon: <Target size={16} />,
            label: "Completion Rate",
            value: `${completionRate}%`,
            color: "var(--color-warning)",
          },
        ].map((card) => (
          <article
            key={card.label}
            className="rounded-xl border p-4"
            style={{
              background: "var(--color-surface)",
              borderColor: "var(--color-border)",
            }}
          >
            <div className="flex items-center justify-between">
              <p
                className="text-xs font-semibold uppercase tracking-wide"
                style={{ color: "var(--color-foreground-muted)" }}
              >
                {card.label}
              </p>
              <span
                className="inline-flex items-center justify-center h-8 w-8 rounded-lg"
                style={{
                  color: card.color,
                  background: `color-mix(in srgb, ${card.color} 15%, transparent)`,
                }}
              >
                {card.icon}
              </span>
            </div>
            <p
              className="mt-3 text-3xl font-extrabold"
              style={{ color: "var(--color-foreground)" }}
            >
              {card.value}
            </p>
          </article>
        ))}
      </section>

      <section
        className="rounded-xl border p-4"
        style={{
          background: "var(--color-surface)",
          borderColor: "var(--color-border)",
        }}
      >
        <div className="flex items-center justify-between">
          <p
            className="font-semibold"
            style={{ color: "var(--color-foreground)" }}
          >
            Progress
          </p>
          <span
            className="text-sm"
            style={{ color: "var(--color-foreground-muted)" }}
          >
            {completed} / {total}
          </span>
        </div>
        <div
          className="mt-3 h-3 w-full rounded-full"
          style={{ background: "var(--color-muted)" }}
          aria-label="completion progress"
        >
          <div
            className="h-3 rounded-full"
            style={{
              width: `${completionRate}%`,
              background:
                "linear-gradient(90deg, var(--color-primary), var(--color-success))",
            }}
          />
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <article
          className="rounded-xl border p-4"
          style={{
            background: "var(--color-surface)",
            borderColor: "var(--color-border)",
          }}
        >
          <h2
            className="font-semibold flex items-center gap-2"
            style={{ color: "var(--color-foreground)" }}
          >
            <CalendarDays size={16} /> Due Today
          </h2>
          <ul className="mt-3 space-y-2">
            {dueToday.length === 0 && (
              <li
                className="text-sm"
                style={{ color: "var(--color-foreground-muted)" }}
              >
                No tasks due today.
              </li>
            )}
            {dueToday.slice(0, 5).map((task) => (
              <li
                key={task.id}
                className="rounded-lg border p-2"
                style={{ borderColor: "var(--color-border)" }}
              >
                <p
                  className="text-sm font-medium"
                  style={{ color: "var(--color-foreground)" }}
                >
                  {task.title}
                </p>
                <Link
                  href={`/tasks/${task.pageId}`}
                  className="text-xs font-medium"
                  style={{ color: "var(--color-primary)" }}
                >
                  {task.pageName}
                </Link>
              </li>
            ))}
          </ul>
        </article>

        <article
          className="rounded-xl border p-4"
          style={{
            background: "var(--color-surface)",
            borderColor: "var(--color-border)",
          }}
        >
          <h2
            className="font-semibold flex items-center gap-2"
            style={{ color: "var(--color-foreground)" }}
          >
            <Clock3 size={16} /> Overdue
          </h2>
          <ul className="mt-3 space-y-2">
            {overdue.length === 0 && (
              <li
                className="text-sm"
                style={{ color: "var(--color-foreground-muted)" }}
              >
                No overdue tasks.
              </li>
            )}
            {overdue.slice(0, 5).map((task) => (
              <li
                key={task.id}
                className="rounded-lg border p-2"
                style={{
                  borderColor:
                    "color-mix(in srgb, var(--color-error) 25%, var(--color-border))",
                  background:
                    "color-mix(in srgb, var(--color-error) 7%, transparent)",
                }}
              >
                <p
                  className="text-sm font-medium"
                  style={{ color: "var(--color-foreground)" }}
                >
                  {task.title}
                </p>
                <p
                  className="text-xs"
                  style={{ color: "var(--color-foreground-muted)" }}
                >
                  Due {formatDate(task.date)}
                </p>
              </li>
            ))}
          </ul>
        </article>

        <article
          className="rounded-xl border p-4"
          style={{
            background: "var(--color-surface)",
            borderColor: "var(--color-border)",
          }}
        >
          <h2
            className="font-semibold flex items-center gap-2"
            style={{ color: "var(--color-foreground)" }}
          >
            <CheckCircle2 size={16} /> Recently Completed
          </h2>
          <ul className="mt-3 space-y-2">
            {recentDone.length === 0 && (
              <li
                className="text-sm"
                style={{ color: "var(--color-foreground-muted)" }}
              >
                No completed tasks yet.
              </li>
            )}
            {recentDone.map((task) => (
              <li
                key={task.id}
                className="rounded-lg border p-2"
                style={{ borderColor: "var(--color-border)" }}
              >
                <p
                  className="text-sm font-medium"
                  style={{ color: "var(--color-foreground)" }}
                >
                  {task.title}
                </p>
                <p
                  className="text-xs"
                  style={{ color: "var(--color-foreground-muted)" }}
                >
                  {task.pageName}
                </p>
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section
        className="rounded-xl border p-4"
        style={{
          background: "var(--color-surface)",
          borderColor: "var(--color-border)",
        }}
      >
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h2
            className="font-semibold"
            style={{ color: "var(--color-foreground)" }}
          >
            Upcoming Tasks
          </h2>
          <Link
            href="/tasks"
            className="text-sm font-semibold"
            style={{ color: "var(--color-primary)" }}
          >
            Open Task Pages
          </Link>
        </div>

        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ color: "var(--color-foreground-muted)" }}>
                <th className="text-left font-semibold py-2">Task</th>
                <th className="text-left font-semibold py-2">Date</th>
                <th className="text-left font-semibold py-2">Priority</th>
                <th className="text-left font-semibold py-2">Page</th>
              </tr>
            </thead>
            <tbody>
              {upcoming.length === 0 && (
                <tr>
                  <td
                    className="py-3"
                    colSpan={4}
                    style={{ color: "var(--color-foreground-muted)" }}
                  >
                    No upcoming tasks.
                  </td>
                </tr>
              )}
              {upcoming.slice(0, 8).map((task) => (
                <tr
                  key={task.id}
                  className="border-t"
                  style={{ borderColor: "var(--color-border)" }}
                >
                  <td
                    className="py-2"
                    style={{ color: "var(--color-foreground)" }}
                  >
                    {task.title}
                  </td>
                  <td
                    className="py-2 text-sm md:text-md"
                    style={{ color: "var(--color-foreground-muted)" }}
                  >
                    {formatDate(task.date)}
                  </td>
                  <td className="py-2">
                    <span
                      className="inline-flex rounded-full px-2 py-1 text-xs md:text-md font-semibold capitalize"
                      style={{
                        color:
                          task.priority === "high"
                            ? "var(--color-error)"
                            : task.priority === "medium"
                              ? "var(--color-warning)"
                              : "var(--color-success)",
                        background:
                          task.priority === "high"
                            ? "color-mix(in srgb, var(--color-error) 12%, transparent)"
                            : task.priority === "medium"
                              ? "color-mix(in srgb, var(--color-warning) 12%, transparent)"
                              : "color-mix(in srgb, var(--color-success) 12%, transparent)",
                      }}
                    >
                      {task.priority}
                    </span>
                  </td>
                  <td className="py-2">
                    <Link
                      href={`/tasks/${task.pageId}`}
                      className="font-medium text-sm md:text-md"
                      style={{ color: "var(--color-primary)" }}
                    >
                      {task.pageName}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
