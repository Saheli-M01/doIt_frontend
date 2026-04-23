"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { X, Plus, Pencil, CalendarDays, Flag, ChevronDown, ChevronRight, LayoutList, Calendar } from "lucide-react";
import TaskEditor from "../../components/TaskEditor";

type Task = {
  id: number;
  title: string;
  completed: boolean;
  date: string;
  priority: "low" | "medium" | "high";
};

type TaskNavPage = {
  id: string;
  name: string;
};

type ViewMode = "all" | "day" | "week" | "month";

const TASK_NAV_PAGES_KEY = "task-nav-pages";

// ── Grouping helpers ──────────────────────────────────────────────────────────

function getWeekRange(dateStr: string): { start: Date; end: Date } {
  const d = new Date(dateStr);
  const day = d.getDay(); // 0 = Sun
  const start = new Date(d);
  start.setDate(d.getDate() - day);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return { start, end };
}

function formatDate(d: Date) {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function getGroupKey(task: Task, view: ViewMode): string {
  if (view === "day") return task.date; // "2026-04-24"
  if (view === "week") {
    const { start, end } = getWeekRange(task.date);
    return `${formatDate(start)} – ${formatDate(end)}`;
  }
  if (view === "month") {
    const d = new Date(task.date);
    return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  }
  return "all";
}

function groupTasks(tasks: Task[], view: ViewMode): { key: string; tasks: Task[] }[] {
  if (view === "all") return [{ key: "all", tasks }];

  const map = new Map<string, Task[]>();
  for (const task of tasks) {
    const key = getGroupKey(task, view);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(task);
  }

  // Sort groups chronologically
  return Array.from(map.entries())
    .sort(([a], [b]) => {
      // For day view keys are ISO dates — sort directly
      if (view === "day") return a < b ? -1 : 1;
      // For week/month, sort by the first task's date in each group
      const firstA = map.get(a)![0].date;
      const firstB = map.get(b)![0].date;
      return firstA < firstB ? -1 : 1;
    })
    .map(([key, tasks]) => ({ key, tasks }));
}

// ── Task card (shared between views) ─────────────────────────────────────────

function TaskCard({
  task,
  editingId,
  editText,
  editDate,
  editPriority,
  onToggle,
  onDelete,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onOpenDetails,
  setEditText,
  setEditDate,
  setEditPriority,
}: {
  task: Task;
  editingId: number | null;
  editText: string;
  editDate: string;
  editPriority: Task["priority"];
  onToggle: (t: Task) => void;
  onDelete: (id: number) => void;
  onStartEdit: (t: Task) => void;
  onSaveEdit: (t: Task) => void;
  onCancelEdit: () => void;
  onOpenDetails: (id: number) => void;
  setEditText: (v: string) => void;
  setEditDate: (v: string) => void;
  setEditPriority: (v: Task["priority"]) => void;
}) {
  return (
    <div className="bg-surface border border-border p-4 rounded-lg shadow-sm flex items-center justify-between">
      <div className="flex items-center gap-3 flex-1">
        <input type="checkbox" checked={task.completed} onChange={() => onToggle(task)} />
        <div className="flex-1">
          {editingId === task.id ? (
            <div className="space-y-2">
              <input
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                autoFocus
                placeholder="Task name"
                className="border border-border bg-background text-foreground p-1 rounded w-full"
              />
              <div className="flex gap-2 flex-wrap">
                <input
                  type="date"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className="border border-border bg-background text-foreground p-1 rounded"
                />
                <select
                  value={editPriority}
                  onChange={(e) => setEditPriority(e.target.value as Task["priority"])}
                  className="border border-border bg-background text-foreground p-1 rounded"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
                <button
                  onClick={() => onSaveEdit(task)}
                  className="px-2 py-1 rounded bg-primary text-white hover:bg-primary-dark transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={onCancelEdit}
                  className="px-2 py-1 rounded border border-border text-foreground hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className={`font-medium ${task.completed ? "line-through text-foreground-muted" : "text-foreground"}`}>
              {task.title}
            </p>
          )}
          <div className="mt-2 flex items-center gap-3 text-xs text-foreground-muted flex-wrap">
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-muted text-foreground">
              <Flag size={14} /> {task.priority}
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-muted text-foreground">
              <CalendarDays size={14} /> {task.date}
            </span>
            <button
              onClick={() => onStartEdit(task)}
              className="inline-flex items-center gap-1 text-primary hover:text-primary-light transition-colors"
            >
              <Pencil size={14} /> Edit
            </button>
            <button
              onClick={() => onOpenDetails(task.id)}
              className="text-primary hover:text-primary-light transition-colors"
            >
              Add Details
            </button>
          </div>
        </div>
      </div>
      <button
        onClick={() => onDelete(task.id)}
        className="text-red-500 p-2 rounded-full transition-all duration-200 hover:bg-red-500 hover:text-white hover:scale-110"
      >
        <X size={18} />
      </button>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function TasksPage() {
  const params = useParams<{ taskPageId?: string }>();
  const taskPageId = params?.taskPageId;

  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editPriority, setEditPriority] = useState<Task["priority"]>("medium");
  const [priority, setPriority] = useState("medium");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [dateSort, setDateSort] = useState("desc");
  const [isRenamingPage, setIsRenamingPage] = useState(false);
  const [pageTitleInput, setPageTitleInput] = useState("");
  const [openDetailsTaskId, setOpenDetailsTaskId] = useState<number | null>(null);
  const [detailsDraft, setDetailsDraft] = useState("<p>Add details...</p>");
  const [detailsById, setDetailsById] = useState<Record<number, string>>({});
  const [currentPage, setCurrentPage] = useState<TaskNavPage | null>(null);

  // View mode: all | day | week | month
  const [viewMode, setViewMode] = useState<ViewMode>("all");
  // Which group cards are expanded (in grouped views)
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  // Load data when page changes
  useEffect(() => {
    if (!taskPageId) {
      setTasks([]); setDetailsById({}); setCurrentPage(null);
      return;
    }
    const load = () => {
      try {
        const s = localStorage.getItem(`task-items-${taskPageId}`);
        setTasks(s ? (JSON.parse(s) as Task[]) : []);
      } catch { setTasks([]); }
      try {
        const s = localStorage.getItem(`task-details-${taskPageId}`);
        setDetailsById(s ? (JSON.parse(s) as Record<number, string>) : {});
      } catch { setDetailsById({}); }
      try {
        const s = localStorage.getItem(TASK_NAV_PAGES_KEY);
        const pages = s ? (JSON.parse(s) as TaskNavPage[]) : [];
        setCurrentPage(pages.find((p) => p.id === taskPageId) ?? null);
      } catch { setCurrentPage(null); }
    };
    load();
    window.addEventListener("task-pages-updated", load);
    return () => window.removeEventListener("task-pages-updated", load);
  }, [taskPageId]);

  // Reset expanded groups when view mode changes
  useEffect(() => { setExpandedGroups(new Set()); }, [viewMode]);

  const filteredTasks = useMemo(() =>
    tasks
      .filter((t) => t.title.toLowerCase().includes(search.toLowerCase()))
      .filter((t) => priorityFilter === "all" ? true : t.priority === priorityFilter)
      .sort((a, b) => {
        if (dateSort === "none") return 0;
        const tA = new Date(a.date).getTime();
        const tB = new Date(b.date).getTime();
        return dateSort === "asc" ? tA - tB : tB - tA;
      }),
    [tasks, search, priorityFilter, dateSort]
  );

  const groups = useMemo(() => groupTasks(filteredTasks, viewMode), [filteredTasks, viewMode]);

  const persistTasks = (next: Task[]) => {
    setTasks(next);
    if (taskPageId) localStorage.setItem(`task-items-${taskPageId}`, JSON.stringify(next));
  };

  const addTask = () => {
    if (!taskPageId || !title || !date) return;
    persistTasks([{ id: Date.now(), title: title.trim(), completed: false, date, priority: priority as Task["priority"] }, ...tasks]);
    setTitle(""); setDate("");
  };

  const updateTask = (task: Task) => {
    persistTasks(tasks.map((t) => (t.id === task.id ? task : t)));
  };

  const startEditing = (task: Task) => {
    setEditingId(task.id); setEditText(task.title);
    setEditDate(task.date); setEditPriority(task.priority);
  };

  const saveEditedTask = (task: Task) => {
    if (!editText.trim() || !editDate) return;
    updateTask({ ...task, title: editText.trim(), date: editDate, priority: editPriority });
    setEditingId(null);
  };

  const toggleTask = (task: Task) => updateTask({ ...task, completed: !task.completed });

  const deleteTask = (id: number) => {
    persistTasks(tasks.filter((t) => t.id !== id));
    const next = { ...detailsById };
    delete next[id];
    setDetailsById(next);
    if (taskPageId) localStorage.setItem(`task-details-${taskPageId}`, JSON.stringify(next));
  };

  const openDetailsSlider = (taskId: number) => {
    setOpenDetailsTaskId(taskId);
    setDetailsDraft(detailsById[taskId] ?? "<p>Add details...</p>");
  };

  const saveDetails = () => {
    if (openDetailsTaskId === null || !taskPageId) return;
    const updated = { ...detailsById, [openDetailsTaskId]: detailsDraft };
    setDetailsById(updated);
    localStorage.setItem(`task-details-${taskPageId}`, JSON.stringify(updated));
    setOpenDetailsTaskId(null);
  };

  const savePageTitle = () => {
    if (!taskPageId) return;
    const next = pageTitleInput.trim();
    if (!next) return;
    try {
      const s = localStorage.getItem(TASK_NAV_PAGES_KEY);
      const pages = s ? (JSON.parse(s) as TaskNavPage[]) : [];
      localStorage.setItem(TASK_NAV_PAGES_KEY, JSON.stringify(pages.map((p) => p.id === taskPageId ? { ...p, name: next } : p)));
      window.dispatchEvent(new Event("task-pages-updated"));
      setIsRenamingPage(false);
    } catch { setIsRenamingPage(false); }
  };

  const toggleGroup = (key: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const detailsTask = tasks.find((t) => t.id === openDetailsTaskId);

  const taskCardProps = {
    editingId, editText, editDate, editPriority,
    onToggle: toggleTask, onDelete: deleteTask,
    onStartEdit: startEditing, onSaveEdit: saveEditedTask,
    onCancelEdit: () => setEditingId(null),
    onOpenDetails: openDetailsSlider,
    setEditText, setEditDate, setEditPriority,
  };

  if (!taskPageId) {
    return (
      <div className="min-h-[50vh] rounded-xl border border-border bg-surface p-8 flex items-center justify-center">
        <p className="text-foreground-muted text-lg">
          Use the plus icon beside Tasks to create and open a new page.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Page title / rename */}
      <div className="mb-6 flex items-center gap-3 flex-wrap">
        {isRenamingPage ? (
          <>
            <input
              value={pageTitleInput}
              onChange={(e) => setPageTitleInput(e.target.value)}
              className="border border-border bg-surface text-foreground p-2 rounded"
              placeholder="Page title"
              autoFocus
            />
            <button onClick={savePageTitle} className="px-3 py-2 rounded bg-primary text-white hover:bg-primary-dark transition-colors">Save Title</button>
            <button onClick={() => setIsRenamingPage(false)} className="px-3 py-2 rounded border border-border text-foreground hover:bg-muted transition-colors">Cancel</button>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-bold">{currentPage?.name ?? "Task Page"}</h1>
            <button
              onClick={() => { setPageTitleInput(currentPage?.name ?? ""); setIsRenamingPage(true); }}
              className="inline-flex items-center gap-1 text-primary hover:text-primary-light transition-colors"
            >
              <Pencil size={16} /> Rename Page
            </button>
          </>
        )}
      </div>

      {/* Add Task */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter task..."
          className="border border-border bg-surface text-foreground p-2 rounded focus:outline-none focus:ring-2 focus:ring-primary" />
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
          className="border border-border bg-surface text-foreground p-2 rounded focus:outline-none focus:ring-2 focus:ring-primary" />
        <select value={priority} onChange={(e) => setPriority(e.target.value)}
          className="border border-border bg-surface text-foreground p-2 rounded">
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <button onClick={addTask} className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded flex items-center gap-2 transition-colors">
          <Plus size={20} /> Add
        </button>
      </div>

      {/* Filters + View toggle row */}
      <div className="mb-4 flex gap-3 flex-wrap items-center justify-between">
        <div className="flex gap-3 flex-wrap">
          <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}
            className="border border-border bg-surface text-foreground p-2 rounded">
            <option value="all">All priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <select value={dateSort} onChange={(e) => setDateSort(e.target.value)}
            className="border border-border bg-surface text-foreground p-2 rounded">
            <option value="desc">Date: newest first</option>
            <option value="asc">Date: oldest first</option>
            <option value="none">No sort</option>
          </select>
        </div>

        {/* View mode pills */}
        <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
          {(["all", "day", "week", "month"] as ViewMode[]).map((v) => (
            <button
              key={v}
              onClick={() => setViewMode(v)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors capitalize flex items-center gap-1.5 ${
                viewMode === v
                  ? "bg-primary text-white shadow-sm"
                  : "text-foreground-muted hover:text-foreground hover:bg-surface"
              }`}
            >
              {v === "all" ? <LayoutList size={14} /> : <Calendar size={14} />}
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search tasks..."
        className="border border-border bg-surface text-foreground p-2 rounded w-full mb-4" />

      {/* ── All view: flat list ── */}
      {viewMode === "all" && (
        <div className="space-y-3">
          {filteredTasks.length === 0 && (
            <p className="text-foreground-muted text-center py-8">No tasks found</p>
          )}
          {filteredTasks.map((task) => (
            <TaskCard key={task.id} task={task} {...taskCardProps} />
          ))}
        </div>
      )}

      {/* ── Grouped views: day / week / month ── */}
      {viewMode !== "all" && (
        <div className="space-y-3">
          {groups.length === 0 && (
            <p className="text-foreground-muted text-center py-8">No tasks found</p>
          )}
          {groups.map(({ key, tasks: groupTasks }) => {
            const isOpen = expandedGroups.has(key);
            const done = groupTasks.filter((t) => t.completed).length;
            return (
              <div key={key} className="rounded-xl border border-border overflow-hidden">
                {/* Group header card — click to expand */}
                <button
                  onClick={() => toggleGroup(key)}
                  className="w-full flex items-center justify-between px-5 py-4 bg-surface hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {isOpen ? <ChevronDown size={18} className="text-primary" /> : <ChevronRight size={18} className="text-foreground-muted" />}
                    <span className="font-semibold text-foreground">{key}</span>
                    <span className="text-xs text-foreground-muted bg-muted px-2 py-0.5 rounded-full">
                      {groupTasks.length} task{groupTasks.length !== 1 ? "s" : ""}
                    </span>
                    {done > 0 && (
                      <span className="text-xs text-success bg-success/10 px-2 py-0.5 rounded-full">
                        {done} done
                      </span>
                    )}
                  </div>
                  {/* Mini priority breakdown */}
                  <div className="flex items-center gap-2 text-xs text-foreground-muted">
                    {(["high", "medium", "low"] as Task["priority"][]).map((p) => {
                      const count = groupTasks.filter((t) => t.priority === p).length;
                      if (!count) return null;
                      const color = p === "high" ? "text-error" : p === "medium" ? "text-warning" : "text-success";
                      return (
                        <span key={p} className={`${color} font-medium`}>
                          {count} {p}
                        </span>
                      );
                    })}
                  </div>
                </button>

                {/* Expanded task list */}
                {isOpen && (
                  <div className="border-t border-border bg-background p-3 space-y-2">
                    {groupTasks.map((task) => (
                      <TaskCard key={task.id} task={task} {...taskCardProps} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Details slider */}
      <div className={`fixed inset-0 z-40 transition-opacity duration-300 ${openDetailsTaskId !== null ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
        <button type="button" aria-label="Close details panel" onClick={() => setOpenDetailsTaskId(null)} className="absolute inset-0 bg-black/30" />
        <aside className={`absolute right-0 top-0 h-full w-full max-w-xl bg-surface text-foreground border-l border-border shadow-2xl p-5 transition-transform duration-300 ${openDetailsTaskId !== null ? "translate-x-0" : "translate-x-full"}`}>
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold">Task Details</h2>
              {detailsTask && <p className="text-sm text-foreground-muted mt-1">{detailsTask.title}</p>}
            </div>
            <button type="button" onClick={() => setOpenDetailsTaskId(null)}
              className="text-red-500 p-2 rounded-full transition-all duration-200 hover:bg-red-500 hover:text-white hover:scale-110" aria-label="Close">
              <X size={18} />
            </button>
          </div>
          <TaskEditor value={detailsDraft} onChange={setDetailsDraft} />
          <div className="mt-4 flex justify-end">
            <button type="button" onClick={saveDetails} className="px-4 py-2 rounded bg-primary text-white hover:bg-primary-dark transition-colors">
              Save Details
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
