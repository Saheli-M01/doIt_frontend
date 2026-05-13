"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useParams } from "next/navigation";
import {
  AlertCircle,
  CheckCheck,
  CheckCircle2,
  Clock,
  LayoutList,
  Pencil,
  Plus,
  Save,
  Search,
  Filter,
  CalendarDays,
  Calendar,
  ArrowUpDown,
  Eye,
  Info 
} from "lucide-react";

import { TaskCard } from "@/app/components/tasks/TaskCard";
import { GroupCard } from "@/app/components/tasks/GroupCard";
import { DetailsSlider } from "@/app/components/tasks/DetailsSlider";
import { ViewToggle } from "@/app/components/tasks/ViewToggle";
import { BulkBar } from "@/app/components/tasks/BulkBar";
import { Button, Card, Input } from "@/app/components/tasks/ui";
import { DatePicker } from "@/app/components/tasks/DatePicker";
import { Dropdown, type DropdownOption } from "@/app/components/tasks/Dropdown";
import { Skeleton } from "@/components/ui/skeleton";
import { groupTasks } from "@/app/components/tasks/grouping";
import { DeleteConfirmDialog } from "@/app/components/DeleteConfirmDialog";
import { useUser } from "@/app/context/UserContext";
import { useAuth } from "@clerk/nextjs";
import { resolveBackendUserId } from "@/lib/backendUser";
import { authFetch } from "@/lib/authFetch";
import {
  taskNavPagesKey,
  type Task,
  type TaskNavPage,
  type ViewMode,
} from "@/app/components/tasks/types";

// Helper function to get today's date in local timezone (YYYY-MM-DD)
function getTodayLocal(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

const PRIORITY_OPTIONS: DropdownOption[] = [
  { value: "low", label: "Low", color: "var(--color-success)" },
  { value: "medium", label: "Medium", color: "var(--color-warning)" },
  { value: "high", label: "High", color: "var(--color-error)" },
];

const PRIORITY_FILTER_OPTIONS: DropdownOption[] = [
  { value: "all", label: "All priorities", icon: <Info  size={14} /> },
  { value: "high", label: "High", color: "var(--color-error)" },
  { value: "medium", label: "Medium", color: "var(--color-warning)" },
  { value: "low", label: "Low", color: "var(--color-success)" },
];

const DATE_SORT_OPTIONS: DropdownOption[] = [
  { value: "desc", label: "Newest first", icon: <Calendar size={14} /> },
  { value: "asc", label: "Oldest first", icon: <Calendar size={14} /> },
  { value: "none", label: "No sort", icon: <Calendar size={14} /> },
];

const VIEW_OPTIONS: DropdownOption[] = [
  { value: "all", label: "All", icon: <LayoutList size={14} /> },
  { value: "today", label: "Today", icon: <Clock size={14} /> },
  { value: "day", label: "Day", icon: <Calendar size={14} /> },
  { value: "week", label: "Week", icon: <Calendar size={14} /> },
  { value: "month", label: "Month", icon: <Calendar size={14} /> },
];

export default function TasksPage() {
  const params = useParams<{ taskPageId?: string }>();
  const { user } = useUser();
  const { getToken } = useAuth();
  const taskPageId = params?.taskPageId;

  // ── State ──────────────────────────────────────────────────────────────────
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentPage, setCurrentPage] = useState<TaskNavPage | null>(null);
  const [detailsById, setDetailsById] = useState<Record<number, string>>({});

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [priority, setPriority] = useState<Task["priority"] | "">("");

  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [dateSort, setDateSort] = useState("desc");
  const [viewMode, setViewMode] = useState<ViewMode>("all");
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [selectedTasks, setSelectedTasks] = useState<number[]>([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [mobileViewFilter, setMobileViewFilter] = useState<"all" | "today" | ViewMode>("all");

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editPriority, setEditPriority] = useState<Task["priority"]>("medium");

  const [isRenamingPage, setIsRenamingPage] = useState(false);
  const [pageTitleInput, setPageTitleInput] = useState("");

  const [openDetailsTaskId, setOpenDetailsTaskId] = useState<number | null>(
    null,
  );
  const [detailsDraft, setDetailsDraft] = useState("<p>Add details...</p>");
  const [backendUserId, setBackendUserId] = useState<number | null>(null);

  // ── Loading / mutation guards ──────────────────────────────────────────────
  const [isLoading, setIsLoading] = useState(true); // true by default — avoids flash of empty
  const [isAdding, setIsAdding] = useState(false);
  const [deletingIds, setDeletingIds] = useState<Set<number>>(new Set());
  const [togglingIds, setTogglingIds] = useState<Set<number>>(new Set());
  const [savingEditId, setSavingEditId] = useState<number | null>(null);
  const addLockRef = useRef(false); // prevents double-submit
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    taskId: number | null;
    taskTitle: string;
  }>({ open: false, taskId: null, taskTitle: "" });
  const [bulkDeleteDialog, setBulkDeleteDialog] = useState(false);

  const baseUrl = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");

  useEffect(() => {
    if (!user) return;
    const resolve = async () => {
      try {
        const resolvedId = await resolveBackendUserId(user);
        setBackendUserId(resolvedId);
      } catch {
        setBackendUserId(null);
      }
    };
    void resolve();
  }, [user]);

  // ── Load data ──────────────────────────────────────────────────────────────
  useEffect(() => {
    // backendUserId not yet resolved — stay in loading state, don't show empty
    if (!taskPageId || !user?.id || !/^\d+$/.test(taskPageId)) {
      setTasks([]);
      setDetailsById({});
      setCurrentPage(null);
      setIsLoading(false);
      return;
    }
    if (!backendUserId) {
      // still resolving — keep skeleton showing
      setIsLoading(true);
      return;
    }
    setIsLoading(true);
    const load = async () => {
      setIsLoading(true);
      try {
        const res = await authFetch(getToken, `${baseUrl}/api/tasks/${backendUserId}`);
        if (!res.ok) throw new Error("Failed to load tasks");
        const allTasks = await res.json();
        const pageTasks = (allTasks ?? [])
          .filter((t: any) => String(t?.taskPage?.id ?? "") === taskPageId)
          .map((t: any) => ({
            id: t.id,
            title: t.title,
            completed: t.completed,
            date: t.date,
            priority: t.priority,
          })) as Task[];
        setTasks(pageTasks);
        const pageDetails: Record<number, string> = {};
        (allTasks ?? []).forEach((t: any) => {
          if (String(t?.taskPage?.id ?? "") === taskPageId && t.id) {
            pageDetails[t.id] = t.details ?? "<p>Add details...</p>";
          }
        });
        setDetailsById(pageDetails);
      } catch {
        setTasks([]);
        setDetailsById({});
      }
      try {
        const pagesRes = await authFetch(getToken,
          `${baseUrl}/api/task-pages/${backendUserId}`,
        );
        if (!pagesRes.ok) throw new Error("Failed to load task pages");
        const pages = await pagesRes.json();
        const matched = (pages ?? []).find(
          (p: { id: number; name: string }) => String(p.id) === taskPageId,
        );
        setCurrentPage(
          matched ? { id: String(matched.id), name: matched.name } : null,
        );
      } catch {
        setCurrentPage(null);
      } finally {
        setIsLoading(false);
      }
    };
    void load();
    window.addEventListener("task-pages-updated", load);
    return () => window.removeEventListener("task-pages-updated", load);
  }, [taskPageId, user?.id, backendUserId, baseUrl]);

  useEffect(() => {
    setExpandedGroups(new Set());
  }, [viewMode]);

  // ── Derived ────────────────────────────────────────────────────────────────
  const filteredTasks = useMemo(
    () =>
      tasks
        .filter((t) => t.title.toLowerCase().includes(search.toLowerCase()))
        .filter(
          (t) => priorityFilter === "all" || t.priority === priorityFilter,
        )
        .filter((t) => {
          // Desktop: use showTodayOnly state
          // Mobile: check if mobileViewFilter is "today"
          const isTodayFilter = typeof window !== 'undefined' && window.innerWidth < 768 
            ? mobileViewFilter === "today"
            : (mobileViewFilter === "today" || false);
          
          if (!isTodayFilter) return true;
          const today = getTodayLocal();
          return t.date === today;
        })
        .sort((a, b) => {
          if (dateSort === "none") return 0;
          if (dateSort === "asc") return a.date.localeCompare(b.date);
          return b.date.localeCompare(a.date);
        }),
    [tasks, search, priorityFilter, dateSort, mobileViewFilter],
  );

  const groups = useMemo(
    () => {
      // For mobile, if view filter is "all" or "today", use "all" view mode
      // Otherwise use the selected view mode (day/week/month)
      const effectiveViewMode = typeof window !== 'undefined' && window.innerWidth < 768
        ? (mobileViewFilter === "all" || mobileViewFilter === "today" ? "all" : mobileViewFilter as ViewMode)
        : viewMode;
      
      return groupTasks(filteredTasks, effectiveViewMode);
    },
    [filteredTasks, viewMode, mobileViewFilter],
  );

  const stats = useMemo(
    () => ({
      total: tasks.length,
      done: tasks.filter((t) => t.completed).length,
      urgent: tasks.filter((t) => t.priority === "high" && !t.completed).length,
    }),
    [tasks],
  );

  // ── Mutations ──────────────────────────────────────────────────────────────
  const persistTasks = (next: Task[]) => {
    setTasks(next);
  };

  const addTask = async () => {
    if (
      !taskPageId ||
      !title.trim() ||
      !backendUserId ||
      !/^\d+$/.test(taskPageId)
    )
      return;
    if (addLockRef.current || isAdding) return; // prevent double submit
    addLockRef.current = true;
    setIsAdding(true);
    const today = getTodayLocal();
    const taskDate = date && date.trim() ? date.trim() : today;
    try {
      const res = await authFetch(getToken, `${baseUrl}/api/tasks/${backendUserId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          completed: false,
          date: taskDate,
          priority: priority || "medium",
          details: "",
          taskPageId: Number(taskPageId),
        }),
      });
      if (!res.ok) return;
      const created = await res.json();
      persistTasks([
        {
          id: created.id,
          title: created.title,
          completed: created.completed,
          date: created.date,
          priority: created.priority,
        },
        ...tasks,
      ]);
      setTitle("");
      setDate("");
      setPriority("");
    } finally {
      setIsAdding(false);
      addLockRef.current = false;
    }
  };

  const updateTask = async (task: Task) => {
    if (!taskPageId || !/^\d+$/.test(taskPageId)) return;
    const res = await authFetch(getToken, `${baseUrl}/api/tasks/${task.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...task,
        details: detailsById[task.id] ?? "",
        taskPage: { id: Number(taskPageId) },
      }),
    });
    if (!res.ok) return;
    persistTasks(tasks.map((t) => (t.id === task.id ? task : t)));
  };

  const startEditing = (task: Task) => {
    setEditingId(task.id);
    setEditText(task.title);
    setEditDate(task.date);
    setEditPriority(task.priority);
  };

  const saveEditedTask = async (task: Task) => {
    if (!editText.trim() || savingEditId === task.id) return;
    setSavingEditId(task.id);
    const today = getTodayLocal();
    const taskDate = editDate || today;
    try {
      await updateTask({
        ...task,
        title: editText.trim(),
        date: taskDate,
        priority: editPriority,
      });
      setEditingId(null);
    } finally {
      setSavingEditId(null);
    }
  };

  const toggleTask = async (task: Task) => {
    if (togglingIds.has(task.id)) return;
    setTogglingIds((prev) => new Set(prev).add(task.id));
    try {
      await updateTask({ ...task, completed: !task.completed });
    } finally {
      setTogglingIds((prev) => {
        const s = new Set(prev);
        s.delete(task.id);
        return s;
      });
    }
  };

  const deleteTask = async (id: number) => {
    if (deletingIds.has(id)) return;
    
    const task = tasks.find((t) => t.id === id);
    setDeleteDialog({
      open: true,
      taskId: id,
      taskTitle: task?.title || "this task",
    });
  };

  const confirmDeleteTask = async () => {
    const id = deleteDialog.taskId;
    if (!id) return;
    
    setDeletingIds((prev) => new Set(prev).add(id));
    try {
      const res = await authFetch(getToken, `${baseUrl}/api/tasks/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        console.error("Failed to delete task");
        return;
      }
      persistTasks(tasks.filter((t) => t.id !== id));
      const next = { ...detailsById };
      delete next[id];
      setDetailsById(next);
    } catch (error) {
      console.error("Error deleting task:", error);
    } finally {
      setDeletingIds((prev) => {
        const s = new Set(prev);
        s.delete(id);
        return s;
      });
      setDeleteDialog({ open: false, taskId: null, taskTitle: "" });
    }
  };

  const openDetailsSlider = (taskId: number) => {
    setOpenDetailsTaskId(taskId);
    setDetailsDraft(detailsById[taskId] ?? "<p>Add details...</p>");
  };

  const saveDetails = async () => {
    if (openDetailsTaskId === null || !taskPageId || !user?.id) return;
    const updated = { ...detailsById, [openDetailsTaskId]: detailsDraft };
    const baseTask = tasks.find((t) => t.id === openDetailsTaskId);
    if (baseTask) {
      await authFetch(getToken, `${baseUrl}/api/tasks/${openDetailsTaskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...baseTask,
          details: detailsDraft,
          taskPage: { id: Number(taskPageId) },
        }),
      });
    }
    setDetailsById(updated);
    setOpenDetailsTaskId(null);
  };

  const savePageTitle = async () => {
    if (!taskPageId || !user?.id) return;
    const next = pageTitleInput.trim();
    if (!next) return;
    try {
      const baseUrl = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(
        /\/$/,
        "",
      );
      if (/^\d+$/.test(taskPageId)) {
        const updateRes = await authFetch(getToken,
          `${baseUrl}/api/task-pages/${taskPageId}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: next }),
          },
        );
        if (!updateRes.ok) {
          const details = await updateRes.text();
          throw new Error(
            `Failed to rename task page (${updateRes.status}): ${details}`,
          );
        }
      }

      const s = localStorage.getItem(taskNavPagesKey(user.id));
      const pages = s ? (JSON.parse(s) as TaskNavPage[]) : [];
      localStorage.setItem(
        taskNavPagesKey(user.id),
        JSON.stringify(
          pages.map((p) => (p.id === taskPageId ? { ...p, name: next } : p)),
        ),
      );
      setCurrentPage((prev) =>
        prev && prev.id === taskPageId ? { ...prev, name: next } : prev,
      );
      window.dispatchEvent(new Event("task-pages-updated"));
      setIsRenamingPage(false);
    } catch {
      setIsRenamingPage(false);
    }
  };

  const repeatTasks = async (days: number) => {
    if (!taskPageId || !backendUserId || !/^\d+$/.test(taskPageId)) return;
    const newTasks: Task[] = [];

    for (const id of selectedTasks) {
      const orig = tasks.find((t) => t.id === id);
      if (!orig) continue;

      for (let i = 1; i <= days; i++) {
        const newDate = new Date(new Date(orig.date).getTime() + i * 86400000)
          .toISOString()
          .split("T")[0];

        try {
          const res = await authFetch(getToken, `${baseUrl}/api/tasks/${backendUserId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: orig.title,
              completed: false,
              date: newDate,
              priority: orig.priority,
              details: detailsById[orig.id] ?? "",
              taskPageId: Number(taskPageId),
            }),
          });

          if (res.ok) {
            const created = await res.json();
            newTasks.push({
              id: created.id,
              title: created.title,
              completed: created.completed,
              date: created.date,
              priority: created.priority,
            });
          }
        } catch (error) {
          console.error("Error creating repeated task:", error);
        }
      }
    }

    persistTasks([...newTasks, ...tasks]);
    setSelectedTasks([]);
  };

  const toggleGroup = (key: string) =>
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });

  const toggleSelectTask = (id: number) =>
    setSelectedTasks((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  // ── Shared props for TaskCard ──────────────────────────────────────────────
  const taskCardProps = {
    editingId,
    editText,
    editDate,
    editPriority,
    onToggle: toggleTask,
    onDelete: deleteTask,
    onStartEdit: startEditing,
    onSaveEdit: saveEditedTask,
    onCancelEdit: () => setEditingId(null),
    onOpenDetails: openDetailsSlider,
    setEditText,
    setEditDate,
    setEditPriority,
    deletingIds,
    togglingIds,
    savingEditId,
  };

  // ── Empty state ────────────────────────────────────────────────────────────
  if (!taskPageId) {
    return (
      <>
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 bg-surface border-2 border-dashed border-border rounded-2xl p-12">
          <div className="w-16 h-16 rounded-[18px] flex items-center justify-center bg-primary/12 border border-primary/30">
            <LayoutList size={28} className="text-primary" />
          </div>
          <p className="text-foreground-muted text-base text-center max-w-xs">
            Use the <strong className="text-foreground">+</strong> icon beside
            Tasks to create and open a new page.
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="max-w-[1060px] mx-auto pb-20 px-3 md:px-4">
        {/* ── Page Header ── */}
        <div className="mb-4 md:mb-6">
          {isLoading ? (
            <div className="flex flex-col gap-3">
              <Skeleton className="h-9 w-52 rounded-lg" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            </div>
          ) : (
            <>
              {isRenamingPage ? (
                <div className="flex items-center gap-2.5 flex-wrap mb-3">
                  <Input
                    value={pageTitleInput}
                    onChange={(e) => setPageTitleInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && savePageTitle()}
                    placeholder="Page title"
                    autoFocus
                    style={{ fontSize: 22, fontWeight: 800, minWidth: 220 }}
                  />
                  <Button onClick={savePageTitle}>
                    <Save size={14} /> Save
                  </Button>
                  <Button variant="ghost" onClick={() => setIsRenamingPage(false)}>
                    Cancel
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2 md:gap-3 mb-3">
                  <h1 className="text-[clamp(20px,5vw,26px)] font-black tracking-tight text-foreground m-0">
                    {currentPage?.name ?? "Task Page"}
                  </h1>
                  <button
                    onClick={() => {
                      setPageTitleInput(currentPage?.name ?? "");
                      setIsRenamingPage(true);
                    }}
                    className="inline-flex items-center gap-1 md:gap-1.5 text-[10px] md:text-xs font-semibold text-primary bg-primary/10 border border-primary/25 px-2 md:px-3 py-1 md:py-1.5 rounded-lg hover:bg-primary/20 transition-colors"
                  >
                    <Pencil size={10} className="md:w-3 md:h-3" /> 
                    <span className="hidden sm:inline">Rename</span>
                  </button>
                </div>
              )}
              
              {/* Stat pills - always visible */}
              <div className="flex gap-1.5 md:gap-2 flex-wrap">
                {[
                  {
                    icon: <LayoutList size={12} />,
                    label: `${stats.total} tasks`,
                    cls: "text-primary bg-primary/10 border-primary/25",
                  },
                  {
                    icon: <CheckCircle2 size={12} />,
                    label: `${stats.done} done`,
                    cls: "text-green-500 bg-green-500/10 border-green-500/25",
                  },
                  {
                    icon: <AlertCircle size={12} />,
                    label: `${stats.urgent} urgent`,
                    cls: "text-red-500 bg-red-500/10 border-red-500/25",
                  },
                ].map(({ icon, label, cls }) => (
                  <span
                    key={label}
                    className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border ${cls}`}
                  >
                    {icon} {label}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
        {/* ── Add Task ── */}
        <Card style={{ marginBottom: 16 }} data-tour="new-task-card">
          <div className="flex gap-2.5 flex-wrap items-center">
            <p className="text-[11px] font-bold uppercase tracking-widest text-foreground-muted whitespace-nowrap hidden md:block">
              New Task
            </p>
            <Input
              data-tour="new-task-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTask()}
              placeholder="What needs to be done?"
              className="flex-1 min-w-[200px]"
            />
            {/* Desktop: Full controls */}
            <div className="hidden md:flex gap-2.5 items-center">
              <DatePicker
                value={date}
                onChange={setDate}
                placeholder="Due date"
              />
              <Dropdown
                value={priority}
                options={PRIORITY_OPTIONS}
                onChange={(next) => setPriority(next as Task["priority"])}
                placeholder="Priority"
                style={{ minWidth: 138 }}
              />
              <Button
                data-tour="add-task-button"
                onClick={addTask}
                disabled={!title.trim() || isAdding}
              >
                {isAdding ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Plus size={17} />
                )}
                {isAdding ? "Adding…" : "Add Task"}
              </Button>
            </div>
            {/* Mobile: Compact controls */}
            <div className="flex md:hidden gap-2 items-center w-full md:w-auto">
              <button
                type="button"
                onClick={() => setDate(date ? "" : getTodayLocal())}
                className={`p-2 rounded-lg border transition-colors ${
                  date ? "bg-primary/10 border-primary text-primary" : "bg-surface border-border text-foreground-muted"
                }`}
                title="Due date"
              >
                <CalendarDays size={18} />
              </button>
              <Dropdown
                value={priority}
                options={PRIORITY_OPTIONS}
                onChange={(next) => setPriority(next as Task["priority"])}
                placeholder="Priority"
                style={{ flex: 1, minWidth: 100 }}
              />
              <button
                onClick={addTask}
                disabled={!title.trim() || isAdding}
                className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center disabled:opacity-45 disabled:cursor-not-allowed shadow-lg"
                title="Add task"
              >
                {isAdding ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Plus size={20} />
                )}
              </button>
            </div>
          </div>
        </Card>

        {/* ── Controls ── */}
        <div className="flex flex-col gap-2.5 mb-3.5">
          {/* Mobile: Compact controls */}
          <div className="flex md:hidden gap-2 items-center">
            {/* Filter Button */}
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className={`p-2 rounded-lg border transition-colors ${
                showMobileFilters ? "bg-primary/10 border-primary text-primary" : "bg-surface border-border text-foreground"
              }`}
              title="Filters"
            >
              <Filter size={18} />
            </button>
            
            {/* Select All */}
            <Button
              variant="ghost"
              onClick={() =>
                selectedTasks.length === filteredTasks.length
                  ? setSelectedTasks([])
                  : setSelectedTasks(filteredTasks.map((t) => t.id))
              }
              style={{ fontSize: 12, padding: "8px 12px", flexShrink: 0 }}
              title="Select all"
            >
              <CheckCheck size={16} />
            </Button>
            
            {/* Search */}
            <div className="relative flex-1">
              <Search
                size={14}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-foreground-muted pointer-events-none"
              />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                style={{
                  width: "100%",
                  paddingLeft: 34,
                  boxSizing: "border-box",
                }}
              />
            </div>
          </div>
          
          {/* Mobile: Filter Panel */}
          {showMobileFilters && (
            <div className="md:hidden bg-surface border border-border rounded-xl p-3 space-y-3">
              <div>
                <label className="text-xs font-semibold text-foreground-muted uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <ArrowUpDown size={12} />
                  Sort By
                </label>
                <div className="flex gap-2">
                  {DATE_SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setDateSort(opt.value)}
                      className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1.5 ${
                        dateSort === opt.value
                          ? "bg-primary text-white"
                          : "bg-muted text-foreground hover:bg-border"
                      }`}
                    >
                      <Calendar size={13} />
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="text-xs font-semibold text-foreground-muted uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <AlertCircle size={12} />
                  Priority
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {PRIORITY_FILTER_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setPriorityFilter(opt.value)}
                      className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1.5 ${
                        priorityFilter === opt.value
                          ? "bg-primary text-white"
                          : "bg-muted text-foreground hover:bg-border"
                      }`}
                    >
                      {opt.color ? (
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ background: opt.color }}
                        />
                      ) : (
                        <LayoutList size={13} />
                      )}
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground-muted uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Eye size={12} />
                  View
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {VIEW_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setMobileViewFilter(opt.value as any);
                        // Update viewMode for day/week/month
                        if (opt.value !== "all" && opt.value !== "today") {
                          setViewMode(opt.value as ViewMode);
                        } else {
                          setViewMode("all");
                        }
                      }}
                      className={`px-2 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1 ${
                        mobileViewFilter === opt.value
                          ? "bg-primary text-white"
                          : "bg-muted text-foreground hover:bg-border"
                      }`}
                    >
                      {opt.value === "all" ? (
                        <LayoutList size={13} />
                      ) : opt.value === "today" ? (
                        <Clock size={13} />
                      ) : (
                        <Calendar size={13} />
                      )}
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Desktop: All in one row */}
          <div className="hidden md:flex gap-2.5 items-center w-full">
            <div className="relative flex-1 min-w-36">
              <Search
                size={14}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-foreground-muted pointer-events-none"
              />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search tasks..."
                style={{
                  width: "100%",
                  paddingLeft: 34,
                  boxSizing: "border-box",
                }}
              />
            </div>
            <Dropdown
              value={priorityFilter}
              options={PRIORITY_FILTER_OPTIONS}
              onChange={setPriorityFilter}
              style={{ minWidth: 160 }}
            />
            <Dropdown
              value={dateSort}
              options={DATE_SORT_OPTIONS}
              onChange={setDateSort}
              style={{ minWidth: 152 }}
            />
            <Dropdown
              value={mobileViewFilter}
              options={VIEW_OPTIONS}
              onChange={(v) => {
                setMobileViewFilter(v as any);
                if (v !== "all" && v !== "today") {
                  setViewMode(v as ViewMode);
                } else {
                  setViewMode("all");
                }
              }}
              style={{ minWidth: 100 }}
            />
            <Button
              variant="ghost"
              onClick={() =>
                selectedTasks.length === filteredTasks.length
                  ? setSelectedTasks([])
                  : setSelectedTasks(filteredTasks.map((t) => t.id))
              }
              style={{ fontSize: 12, whiteSpace: "nowrap", flexShrink: 0 }}
            >
              <CheckCheck size={14} />
              {filteredTasks.length > 0 &&
              selectedTasks.length === filteredTasks.length
                ? "Deselect All"
                : "Select All"}
            </Button>
          </div>
        </div>

        {/* ── Bulk actions ── */}
        <BulkBar
          count={selectedTasks.length}
          onRepeat={repeatTasks}
          onDelete={() => setBulkDeleteDialog(true)}
        />

        {/* ── All view ── */}
        {(viewMode === "all" || (typeof window !== 'undefined' && window.innerWidth < 768 && (mobileViewFilter === "all" || mobileViewFilter === "today"))) && (
          <div className="flex flex-col gap-2.5">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="flex gap-3 px-3 py-2.5 rounded-xl border border-border bg-surface"
                >
                  <Skeleton className="w-4 h-4 mt-1 rounded shrink-0" />
                  <Skeleton className="w-5 h-5 mt-1 rounded-full shrink-0" />
                  <div className="flex-1 flex flex-col gap-2">
                    <Skeleton className="h-4 w-3/4 rounded" />
                    <div className="flex gap-2">
                      <Skeleton className="h-5 w-14 rounded-full" />
                      <Skeleton className="h-5 w-20 rounded-full" />
                      <Skeleton className="h-5 w-10 rounded-full" />
                    </div>
                  </div>
                </div>
              ))
            ) : filteredTasks.length === 0 ? (
              <div className="text-center py-14 text-foreground-muted text-[15px]">
                <Clock size={32} className="mx-auto mb-3 opacity-40" />
                No tasks found
              </div>
            ) : (
              filteredTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  {...taskCardProps}
                  details={detailsById[task.id]}
                  isSelected={selectedTasks.includes(task.id)}
                  onSelect={() => toggleSelectTask(task.id)}
                />
              ))
            )}
          </div>
        )}

        {/* ── Grouped views ── */}
        {viewMode !== "all" && !(typeof window !== 'undefined' && window.innerWidth < 768 && (mobileViewFilter === "all" || mobileViewFilter === "today")) && (
          <div className="flex flex-col gap-2.5">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-border bg-surface overflow-hidden"
                >
                  <div className="flex items-center justify-between px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-4 h-4 rounded" />
                      <Skeleton className="h-4 w-24 rounded" />
                      <Skeleton className="h-5 w-14 rounded-full" />
                    </div>
                    <Skeleton className="h-3 w-16 rounded" />
                  </div>
                </div>
              ))
            ) : groups.length === 0 ? (
              <div className="text-center py-14 text-foreground-muted text-[15px]">
                <Clock size={32} className="mx-auto mb-3 opacity-40" />
                No tasks found
              </div>
            ) : (
              groups.map(({ key, tasks: groupedTasks }) => (
                <GroupCard
                  key={key}
                  groupKey={key}
                  tasks={groupedTasks}
                  isOpen={expandedGroups.has(key)}
                  onToggle={() => toggleGroup(key)}
                  selectedTasks={selectedTasks}
                  taskCardProps={taskCardProps}
                  onSelectTask={toggleSelectTask}
                  detailsById={detailsById}
                />
              ))
            )}
          </div>
        )}

        {/* ── Details Slider ── */}
        <DetailsSlider
          task={tasks.find((t) => t.id === openDetailsTaskId)}
          draft={detailsDraft}
          isOpen={openDetailsTaskId !== null}
          onClose={() => setOpenDetailsTaskId(null)}
          onDraftChange={setDetailsDraft}
          onSave={saveDetails}
        />

        {/* Delete Confirmation Dialogs */}
        <DeleteConfirmDialog
          open={deleteDialog.open}
          onOpenChange={(open) =>
            setDeleteDialog({ open, taskId: null, taskTitle: "" })
          }
          onConfirm={confirmDeleteTask}
          title="Delete Task"
          description={`Are you sure you want to delete "${deleteDialog.taskTitle}"? This action cannot be undone.`}
          isDeleting={deleteDialog.taskId ? deletingIds.has(deleteDialog.taskId) : false}
        />

        <DeleteConfirmDialog
          open={bulkDeleteDialog}
          onOpenChange={setBulkDeleteDialog}
          onConfirm={async () => {
            try {
              await Promise.all(
                selectedTasks.map((id) =>
                  authFetch(getToken, `${baseUrl}/api/tasks/${id}`, { method: "DELETE" }),
                ),
              );
              persistTasks(tasks.filter((t) => !selectedTasks.includes(t.id)));
              setSelectedTasks([]);
            } catch (error) {
              console.error("Error deleting tasks:", error);
            }
          }}
          title="Delete Multiple Tasks"
          description={`Are you sure you want to delete ${selectedTasks.length} task${selectedTasks.length !== 1 ? 's' : ''}? All selected tasks will be permanently deleted. This action cannot be undone.`}
          confirmText={`Delete ${selectedTasks.length} Task${selectedTasks.length !== 1 ? 's' : ''}`}
        />
      </div>
    </>
  );
}
