"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CalendarDays, CheckCircle2, Clock3, ListTodo, Target } from "lucide-react";
import { useUser } from "@/app/context/UserContext";
import { useAuth } from "@clerk/nextjs";
import type { Task } from "@/app/components/tasks/types";
import { resolveBackendUserId } from "@/lib/backendUser";
import { authFetch } from "@/lib/authFetch";
import { Skeleton } from "@/components/ui/skeleton";

type DashboardTask = Task & { pageId: string; pageName: string };

function ymd(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function parseYMD(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function formatDate(value: string): string {
  return parseYMD(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// ── Heatmap ────────────────────────────────────────────────────────────────
const WEEKS = 53;
const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function buildGrid(tasks: DashboardTask[]) {
  // count completed tasks per date
  const counts: Record<string, number> = {};
  for (const t of tasks) {
    if (!t.completed) continue;
    counts[t.date] = (counts[t.date] ?? 0) + 1;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // today is always the LAST cell — walk back WEEKS*7-1 days for the first cell
  const totalCells = WEEKS * 7;
  const start = new Date(today);
  start.setDate(today.getDate() - (totalCells - 1));

  const cells: { date: Date; count: number; isFuture: boolean }[] = [];
  for (let i = 0; i < totalCells; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    cells.push({ date: d, count: counts[ymd(d)] ?? 0, isFuture: d > today });
  }

  // reshape into weeks of 7
  const weeks = Array.from({ length: WEEKS }, (_, w) => cells.slice(w * 7, w * 7 + 7));

  // month label: first week where month changes
  const monthLabels: { weekIdx: number; label: string }[] = [];
  let lastMonth = -1;
  weeks.forEach((week, wi) => {
    const m = week[0].date.getMonth();
    if (m !== lastMonth) { monthLabels.push({ weekIdx: wi, label: MONTH_NAMES[m] }); lastMonth = m; }
  });

  const max = Math.max(1, ...Object.values(counts));
  return { weeks, monthLabels, max };
}

function cellColor(count: number, max: number, isFuture: boolean): string {
  if (isFuture || count === 0) return "bg-muted";
  const ratio = count / max;
  if (ratio <= 0.25) return "bg-green-900/60";
  if (ratio <= 0.5)  return "bg-green-700/70";
  if (ratio <= 0.75) return "bg-green-500/80";
  return "bg-green-400";
}

function calcStreak(tasks: DashboardTask[]): number {
  const completedDates = new Set(tasks.filter(t => t.completed).map(t => t.date));
  const today = new Date(); today.setHours(0, 0, 0, 0);
  let streak = 0;
  for (let i = 0; ; i++) {
    const d = new Date(today); d.setDate(today.getDate() - i);
    if (completedDates.has(ymd(d))) streak++;
    else break;
  }
  return streak;
}

function Heatmap({ tasks, isLoading }: { tasks: DashboardTask[]; isLoading: boolean }) {
  const { weeks, monthLabels, max } = useMemo(() => buildGrid(tasks), [tasks]);
  const streak = useMemo(() => calcStreak(tasks), [tasks]);
  const totalCompleted = tasks.filter(t => t.completed).length;

  return (
    <section className="rounded-xl border border-border bg-surface p-4">
      <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
        <h2 className="font-semibold flex items-center gap-2 text-foreground">
          <CheckCircle2 size={16} className="text-green-500" />
          Task Activity
        </h2>
        {!isLoading && (
          <div className="flex items-center gap-3">
            <span className="text-xs text-foreground-muted">
              <span className="font-semibold text-foreground">{totalCompleted}</span> completed
            </span>
            {streak > 0 && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-yellow-500/15 text-yellow-500">
                🔥 {streak}d streak
              </span>
            )}
          </div>
        )}
      </div>

      {isLoading ? (
        <Skeleton className="h-24 w-full rounded-lg" />
      ) : (
        <div className="overflow-x-auto">
          <div className="inline-flex gap-0">
            {/* Day labels */}
            <div className="flex flex-col gap-[3px] mr-1.5 pt-[18px]">
              {["Mon","Tue","Wed","Thu","Fri","Sat", "Sun"].map((d, i) => (
                <div key={d} className="text-[9px] text-foreground-muted leading-[12px] h-[12px] select-none" style={{ opacity: i % 2 === 0 ? 0 : 1 }}>{d}</div>
              ))}
            </div>

            {/* Grid */}
            <div className="flex flex-col gap-0">
              {/* Month labels */}
              <div className="relative h-[18px]">
                {monthLabels.map(({ weekIdx, label }) => (
                  <span key={`${weekIdx}-${label}`} className="absolute text-[10px] text-foreground-muted select-none" style={{ left: weekIdx * 15 }}>{label}</span>
                ))}
              </div>
              {/* Cells */}
              <div className="flex gap-[3px]">
                {weeks.map((week, wi) => (
                  <div key={wi} className="flex flex-col gap-[3px]">
                    {week.map((cell, di) => (
                      <div
                        key={di}
                        title={cell.isFuture ? "" : `${cell.date.toDateString()}: ${cell.count} task${cell.count !== 1 ? "s" : ""} completed`}
                        className={`w-[12px] h-[12px] rounded-[2px] transition-opacity ${cellColor(cell.count, max, cell.isFuture)} ${cell.isFuture ? "opacity-20" : "opacity-100"}`}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-1.5 mt-2">
            <span className="text-[10px] text-foreground-muted">Less</span>
            {["bg-muted","bg-green-900/60","bg-green-700/70","bg-green-500/80","bg-green-400"].map((c, i) => (
              <div key={i} className={`w-[12px] h-[12px] rounded-[2px] ${c}`} />
            ))}
            <span className="text-[10px] text-foreground-muted">More</span>
          </div>
        </div>
      )}
    </section>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [allTasks, setAllTasks] = useState<DashboardTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const today = useMemo(() => { const d = new Date(); d.setHours(0,0,0,0); return d; }, []);

  useEffect(() => {
    if (!user) { setAllTasks([]); setIsLoading(false); return; }
    const load = async () => {
      try {
        const backendUserId = await resolveBackendUserId(user);
        const baseUrl = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");
        const [tasksRes, pagesRes] = await Promise.all([
          authFetch(getToken, `${baseUrl}/api/tasks/${backendUserId}`),
          authFetch(getToken, `${baseUrl}/api/task-pages/${backendUserId}`),
        ]);
        if (!tasksRes.ok || !pagesRes.ok) { setAllTasks([]); return; }
        const tasksJson = await tasksRes.json();
        const pagesJson = await pagesRes.json();
        const pageNameById = new Map<string, string>(
          (pagesJson ?? []).map((p: { id: number; name: string }) => [String(p.id), p.name]),
        );
        setAllTasks((tasksJson ?? []).map((t: { id: number; title: string; completed: boolean; date: string; priority: "low"|"medium"|"high"; taskPage?: { id?: number } }) => {
          const pageId = String(t.taskPage?.id ?? "");
          return { id: t.id, title: t.title, completed: t.completed, date: t.date, priority: t.priority, pageId, pageName: pageNameById.get(pageId) ?? "Task Page" } satisfies DashboardTask;
        }));
      } catch { setAllTasks([]); }
      finally { setIsLoading(false); }
    };
    void load();
  }, [user]);

  const sortedByDate = useMemo(() => [...allTasks].sort((a, b) => a.date.localeCompare(b.date)), [allTasks]);
  const total = allTasks.length;
  const completed = allTasks.filter(t => t.completed).length;
  const completionRate = total ? Math.round((completed / total) * 100) : 0;
  const highPriorityOpen = allTasks.filter(t => t.priority === "high" && !t.completed).length;

  const dueToday = allTasks.filter(t => !t.completed && parseYMD(t.date).getTime() === today.getTime());
  const overdue  = allTasks.filter(t => !t.completed && parseYMD(t.date).getTime() < today.getTime());
  const upcoming = sortedByDate.filter(t => !t.completed && parseYMD(t.date).getTime() > today.getTime());
  const recentDone = sortedByDate.filter(t => t.completed).reverse();

  const statCards = [
    { icon: <ListTodo size={16} />,    label: "Total Tasks",        value: total,            color: "text-primary",  bg: "bg-primary/15"  },
    { icon: <CheckCircle2 size={16} />,label: "Completed",          value: completed,        color: "text-green-500",bg: "bg-green-500/15"},
    { icon: <AlertTriangle size={16} />,label:"High Priority Open", value: highPriorityOpen, color: "text-red-500",  bg: "bg-red-500/15"  },
    { icon: <Target size={16} />,      label: "Completion Rate",    value: `${completionRate}%`, color: "text-yellow-500", bg: "bg-yellow-500/15" },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-4 pb-8">

      {/* Header + stats in one row */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-5">
        {/* Welcome card */}
        <header className="md:col-span-1 rounded-2xl border border-border px-4 py-3 flex flex-col justify-center bg-gradient-to-br from-primary/10 to-surface">
      
          <h1 className="text-lg font-black tracking-tight text-foreground leading-tight">
            Welcome, {(user?.name || "User").split(" ")[0]}!
          </h1>
          <p className="mt-0.5 text-[11px] text-foreground-muted truncate">{user?.email || ""}</p>
        </header>

        {/* 4 stat cards */}
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-border bg-surface p-4">
                <div className="flex items-center justify-between mb-3"><Skeleton className="h-3 w-24" /><Skeleton className="h-8 w-8 rounded-lg" /></div>
                <Skeleton className="h-8 w-16" />
              </div>
            ))
          : statCards.map(card => (
              <article key={card.label} className="rounded-xl border border-border bg-surface px-4 py-1">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-foreground-muted">{card.label}</p>
                  <span className={`inline-flex items-center justify-center h-7 w-7 rounded-lg ${card.color} ${card.bg}`}>{card.icon}</span>
                </div>
                <p className="mt-2 text-2xl font-extrabold text-foreground">{card.value}</p>
              </article>
            ))
        }
      </div>

      

      {/* Heatmap */}
      <Heatmap tasks={allTasks} isLoading={isLoading} />

      {/* 4 panels */}
      <section className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
        {([
          { title: "Due Today",          icon: <CalendarDays size={16} />, items: dueToday,   empty: "No tasks due today.",    isOverdue: false },
          { title: "Overdue",            icon: <Clock3 size={16} />,       items: overdue,    empty: "No overdue tasks.",      isOverdue: true  },
          { title: "Recently Completed", icon: <CheckCircle2 size={16} />, items: recentDone, empty: "No completed tasks yet.", isOverdue: false },
           { title: "Upcoming", icon: <ListTodo size={16} />, items: upcoming.slice(0, 6), empty: "No upcoming tasks.", isOverdue: false },
        ] as const).map(({ title, icon, items, empty, isOverdue }, idx) => (
          <article key={title} className="rounded-xl border border-border bg-surface p-4">
            <h2 className="font-semibold flex items-center gap-2 text-foreground">{icon} {title}</h2>
            <ul className="mt-3 space-y-2 overflow-y-auto max-h-80 scrollbar-thin">
              {isLoading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <li key={i} className="rounded-lg border border-border p-2 space-y-1.5">
                      <Skeleton className="h-3.5 w-3/4" /><Skeleton className="h-3 w-1/3" />
                    </li>
                  ))
                : items.length === 0
                  ? <li className="text-sm text-foreground-muted">{empty}</li>
                  : items.map(task => (
                      <li key={task.id} className={`rounded-lg border p-2 ${isOverdue ? "border-red-500/25 bg-red-500/7" : "border-border"}`}>
                        <p className="text-sm font-medium text-foreground">{task.title}</p>
                        {idx === 1
                          ? <p className="text-xs text-foreground-muted">Due {formatDate(task.date)}</p>
                          : idx === 2
                            ? <p className="text-xs text-foreground-muted">{task.pageName}</p>
                            : <Link href={`/tasks/${task.pageId}`} className="text-xs font-medium text-primary">{task.pageName}</Link>
                        }
                      </li>
                    ))
              }
            </ul>
          </article>
        ))}
      </section>

      {/* Upcoming table */}
    
    </div>
  );
}
